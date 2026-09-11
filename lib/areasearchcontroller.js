"use strict";

// Optional search/report UI for records created by AreaFeatureLinker.
class AreaSearchController {
    constructor(linker) {
        this.linker = linker;
        this.activeCriteria = null;
        this.activeAreaIds = new Set();
        this.initialized = false;
        this.apiRecords = [];
        this.searchRevision = 0;
        this.previewRevision = 0;
        this.apiState = "";
    }

    get settings() { return Conf?.areaSearch ?? {}; }
    get labels() { return this.settings.labels ?? {}; }
    get attributeLabels() { return this.settings.attributeLabels ?? {}; }
    get presetDefinitions() { return this.settings.presets ?? {}; }

    usesSearchApi() {
        return Conf.google?.authMode === "basic"
            && mapLibre.getZoom(false) < this.getAreaZoom();
    }

    get listRecords() {
        return this.activeCriteria && this.usesSearchApi() ? this.apiRecords : this.visibleRecords();
    }

    async fetchSearch(criteria, signal, countOnly = false) {
        const source = new URL(Conf.google.AppScript, location.href);
        const url = new URL(this.settings.apiUrl || "activity-search.php", source);
        url.search = "";
        url.searchParams.set("app", source.searchParams.get("app") || "playgrounds");
        const parameters = {
            score_min: criteria.scoreMin ?? 0,
            attributes: (criteria.attributes ?? []).join(","),
            match_mode: criteria.matchMode ?? "and",
            recent_only: Number(Boolean(criteria.recentOnly)),
            photo_only: Number(Boolean(criteria.photoOnly)),
            detail_only: Number(Boolean(criteria.detailOnly)),
            research_mode: criteria.researchMode ?? "",
            per_page: countOnly ? 1 : 500
        };
        Object.entries(parameters).forEach(([key, value]) => url.searchParams.set(key, value));
        const items = [];
        let total = 0;
        for (let page = 1; ; page++) {
            url.searchParams.set("page", page);
            const response = await fetch(url.href, { headers: { Accept: "application/json" }, signal });
            if (!response.ok) throw new Error(`Activity search: HTTP ${response.status}`);
            const data = await response.json();
            if (data.status !== "ok" || !Array.isArray(data.items)
                || !Number.isInteger(data.pagination?.total_pages)
                || !Number.isInteger(data.pagination?.total)) throw new Error("Invalid activity search response");
            items.push(...data.items);
            total = data.pagination.total;
            if (countOnly || page >= data.pagination.total_pages) break;
        }
        return { items, total };
    }

    apiRecord(item) {
        const osm = poiCont.get_osmid(item.osmid);
        const activity = poiCont.get_actid(item.latest_activity_id);
        return {
            areaId: item.osmid,
            name: (osm && poiCont.getOSMname(osm.geojson?.properties ?? {}, glot.lang))
                || activity?.title || item.osmid,
            feature: osm?.geojson, lng: osm?.lnglat?.[0], lat: osm?.lnglat?.[1],
            linkedFeatures: [], activities: activity ? [activity] : [],
            score: item.score, attributes: item.attributes ?? [], confirmed: item.confirmed,
            hasPhoto: item.has_photo, hasDetail: item.has_detail, memo: item.memo,
            activityId: item.latest_activity_id, isRecent: item.is_recent,
            informationCount: item.information_count
        };
    }

    async syncSearch() {
        const revision = ++this.searchRevision;
        this.searchAbort?.abort();
        if (!this.activeCriteria || !this.usesSearchApi()) {
            this.apiState = "";
            this.apiRecords = [];
            this.rebuildRecords();
            return;
        }
        const controller = this.searchAbort = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        this.apiRecords = [];
        this.activeAreaIds.clear();
        this.apiState = "loading";
        this.renderSummary();
        try {
            const result = await this.fetchSearch(this.activeCriteria, controller.signal);
            if (revision !== this.searchRevision || !this.usesSearchApi()) return;
            this.apiRecords = result.items.map(item => this.apiRecord(item));
            this.activeAreaIds = new Set(this.apiRecords.map(record => record.areaId));
            this.apiState = "ready";
        } catch (error) {
            if (revision !== this.searchRevision) return;
            this.apiState = "error";
            console.warn("Activity search failed", error);
        } finally {
            clearTimeout(timeout);
        }
    }

    label(path, fallback = "") {
        const value = String(path ?? "").split(".").reduce((current, key) => current?.[key], this.labels);
        return value == null ? fallback : String(value);
    }

    format(template, values = {}) {
        return Object.entries(values).reduce(
            (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
            String(template ?? "")
        );
    }

    init() {
        if (this.initialized) return;
        this.initialized = true;
        if (this.settings.use === false) return;
        const panel = document.getElementById("areaFeaturePanel");
        if (panel) this.modal = bootstrap.Modal.getOrCreateInstance(panel);
        document.getElementById("areaFeatureForm")?.addEventListener("input", () => this.updatePreviewCount());
        document.getElementById("areaFeatureForm")?.addEventListener("change", () => this.updatePreviewCount());
        this.renderAttributeOptions();
    }

    renderAttributeOptions() {
        const area = document.getElementById("areaFeatureAttributes");
        if (!area || area.childElementCount > 0) return;
        Object.entries(this.attributeLabels).forEach(([value, label]) => {
            const item = document.createElement("label");
            item.className = "area-feature-check";
            const input = document.createElement("input");
            input.type = "checkbox";
            input.name = "attributes";
            input.value = value;
            item.append(input, document.createTextNode(label));
            area.appendChild(item);
        });
    }

    rebuildRecords() {
        const records = this.linker.rebuildIndex();
        if (this.activeCriteria && !this.usesSearchApi()) {
            this.activeAreaIds = new Set(this.matchingRecords(this.activeCriteria).map(record => record.areaId));
        }
        return records;
    }

    visibleRecords() {
        let bounds;
        try { bounds = mapLibre.get_LL(); } catch (_) { bounds = null; }
        return bounds
            ? this.linker.records.filter(record => geoCont.checkFeatureInner(record.feature, [record.lng, record.lat], bounds))
            : this.linker.records;
    }

    matches(record, criteria) {
        if (criteria.researchMode) {
            if (criteria.researchMode === "missing") return !record.hasDetail;
            if (criteria.researchMode === "stale") return record.hasDetail && !record.isRecent;
            if (criteria.researchMode === "photo") return !record.hasPhoto;
            if (criteria.researchMode === "sparse") {
                return record.informationCount < Number(this.settings.sparseInformationCount ?? 2);
            }
        }
        if (record.score < (criteria.scoreMin ?? 0)) return false;
        if (criteria.recentOnly && !record.isRecent) return false;
        if (criteria.photoOnly && !record.hasPhoto) return false;
        if (criteria.detailOnly && !record.hasDetail) return false;
        const selected = criteria.attributes ?? [];
        if (selected.length) {
            const count = selected.filter(attribute => record.attributes.includes(attribute)).length;
            if (criteria.matchMode === "or" ? count === 0 : count !== selected.length) return false;
        }
        return true;
    }

    matchingRecords(criteria) {
        return this.visibleRecords().filter(record => this.matches(record, criteria));
    }

    readForm() {
        const form = document.getElementById("areaFeatureForm");
        if (!form) return { scoreMin: 0, attributes: [], matchMode: "and" };
        const data = new FormData(form);
        return {
            scoreMin: Number(data.get("scoreMin") ?? 0),
            attributes: data.getAll("attributes"),
            matchMode: String(data.get("matchMode") ?? "and"),
            recentOnly: data.has("recentOnly"),
            photoOnly: data.has("photoOnly"),
            detailOnly: data.has("detailOnly")
        };
    }

    async updatePreviewCount() {
        const revision = ++this.previewRevision;
        clearTimeout(this.previewTimer);
        this.previewAbort?.abort();
        const node = document.getElementById("areaFeaturePreviewCount");
        if (this.usesSearchApi()) {
            if (node) node.textContent = this.label("api.loading", "検索中…");
            this.previewTimer = setTimeout(async () => {
                const controller = this.previewAbort = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 30000);
                try {
                    const result = await this.fetchSearch(this.readForm(), controller.signal, true);
                    if (revision === this.previewRevision && this.usesSearchApi() && node) {
                        node.textContent = this.format(this.label("count", "{count}"), { count: result.total });
                    }
                } catch (_) {
                    if (revision === this.previewRevision && node) node.textContent = this.label("api.error", "検索に失敗しました。もう一度お試しください。");
                } finally { clearTimeout(timeout); }
            }, 250);
            return;
        }
        this.rebuildRecords();
        const count = this.matchingRecords(this.readForm()).length;
        if (node) node.textContent = this.format(this.label("count", "{count}"), { count });
    }

    setForm(criteria) {
        const form = document.getElementById("areaFeatureForm");
        if (!form) return;
        form.reset();
        form.elements.scoreMin.value = String(criteria.scoreMin ?? 0);
        form.elements.matchMode.value = criteria.matchMode ?? "and";
        [...form.querySelectorAll('[name="attributes"]')].forEach(input => {
            input.checked = (criteria.attributes ?? []).includes(input.value);
        });
        form.elements.recentOnly.checked = Boolean(criteria.recentOnly);
        form.elements.photoOnly.checked = Boolean(criteria.photoOnly);
        form.elements.detailOnly.checked = Boolean(criteria.detailOnly);
        this.updatePreviewCount();
    }

    presetCriteria(name) {
        const definition = this.presetDefinitions[name] ?? {};
        const { label: _label, ...criteria } = definition;
        return { scoreMin: 0, attributes: [], matchMode: "and", ...criteria };
    }

    applyPreset(name) {
        const criteria = this.presetCriteria(name);
        criteria.preset = name;
        this.setForm(criteria);
        this.apply(criteria);
    }

    applyFromForm() { this.apply(this.readForm()); }
    applyResearch(mode) { this.apply({ researchMode: mode, scoreMin: 0, attributes: [], matchMode: "and" }); }
    applyRating(scoreMin) {
        const minimum = Number(scoreMin) || 0;
        if (minimum <= 0) {
            this.clear();
            this.close();
            cMapMaker.changeMode("list");
            return;
        }
        this.apply({ scoreMin: minimum, attributes: [], matchMode: "and", ratingQuick: true });
    }

    async apply(criteria) {
        this.rebuildRecords();
        this.activeCriteria = { ...criteria };
        this.activeAreaIds = new Set();
        this.updateRatingActionLabel(criteria.scoreMin);
        listTable.setViewBinding("areaSearch");
        listTable.setAreaFilter(true);
        const pending = this.syncSearch();
        const revision = this.searchRevision;
        this.refreshVisibleResults();
        this.close();
        cMapMaker.changeMode("list");
        await pending;
        if (revision !== this.searchRevision) return;
        this.refreshVisibleResults();
        this.renderSummary();
    }

    reapplyCurrentView() {
        if (this.activeCriteria) this.apply(this.activeCriteria);
    }

    clear() {
        ++this.searchRevision;
        this.searchAbort?.abort();
        this.apiRecords = [];
        this.apiState = "";
        this.activeCriteria = null;
        this.activeAreaIds.clear();
        this.updateRatingActionLabel(0);
        listTable.setAreaFilter(false);
        listTable.setViewBinding("default");
        this.refreshVisibleResults();
        const summary = document.getElementById("areaFeatureSummary");
        if (summary) summary.hidden = true;
        this.updateListTitle();
    }

    refreshVisibleResults() {
        listTable.makeList();
        listTable.filterByPoiStatus(cMapMaker.visitedFilterStatus, cMapMaker.favoriteFilter);
        cMapMaker.makeImages(Conf.thumbnail.use);
        cMapMaker.viewPoi(listTable.getSelCategory());
    }

    shouldIncludeListRow(rowId) {
        if (!this.activeCriteria) return true;
        const activity = poiCont.get_actid(rowId);
        const sourceId = String(activity?.osmid ?? rowId);
        if (this.usesSearchApi()) return this.activeAreaIds.has(sourceId);
        const areaId = this.linker.resolveAreaId(sourceId);
        if (!this.activeAreaIds.has(areaId)) return false;
        return sourceId === areaId || !this.linker.isAreaId(areaId);
    }

    decorateListItem(item, rowId) {
        if (this.activeCriteria && this.usesSearchApi()) {
            const record = this.apiRecords.find(record => record.areaId === rowId);
            if (record) {
                const facts = document.createElement("div");
                facts.textContent = [record.score ? `★${record.score}` : "",
                    ...record.attributes.map(code => this.attributeLabels[code] ?? code)].filter(Boolean).join("・");
                item.appendChild(facts);
            }
        }
        if (!this.activeCriteria?.researchMode) return;
        const activity = poiCont.get_actid(rowId);
        const record = this.usesSearchApi()
            ? this.apiRecords.find(record => record.areaId === rowId)
            : this.linker.getAreaRecord(activity?.osmid ?? rowId);
        if (!record) return;
        const status = !record.hasDetail ? "missing" : (!record.isRecent ? "stale" : "recent");
        item.dataset.areaStatus = status;
        const badge = document.createElement("span");
        badge.className = `area-status-badge area-status-${status}`;
        badge.textContent = this.label(`status.${status}`, status);
        item.prepend(badge);
    }

    criteriaLabels(criteria = this.activeCriteria) {
        if (!criteria) return [];
        if (criteria.researchMode) {
            return [
                this.label("criteria.researchMode"),
                this.label(`research.${criteria.researchMode}`, criteria.researchMode)
            ].filter(Boolean);
        }
        const labels = [];
        if (criteria.preset) labels.push(String(this.presetDefinitions[criteria.preset]?.label ?? criteria.preset));
        if (criteria.scoreMin) {
            labels.push(this.format(this.label("criteria.scoreMinimum", "{score}"), { score: criteria.scoreMin }));
        }
        criteria.attributes?.forEach(attribute => labels.push(this.attributeLabels[attribute] ?? attribute));
        if (criteria.attributes?.length > 1) {
            labels.push(this.label(criteria.matchMode === "or" ? "criteria.matchAny" : "criteria.matchAll"));
        }
        if (criteria.recentOnly) labels.push(this.label("criteria.recent"));
        if (criteria.photoOnly) labels.push(this.label("criteria.photo"));
        if (criteria.detailOnly) labels.push(this.label("criteria.detail"));
        const visibleLabels = labels.filter(Boolean);
        return visibleLabels.length ? visibleLabels : [this.label("criteria.allAreas")];
    }

    renderSummary() {
        const summary = document.getElementById("areaFeatureSummary");
        if (this.activeCriteria?.ratingQuick) {
            if (summary) summary.hidden = true;
            this.updateListTitle();
            return;
        }
        const chips = document.getElementById("areaFeatureChips");
        if (!summary || !chips || !this.activeCriteria) return;
        chips.replaceChildren();
        this.criteriaLabels().forEach(label => {
            const chip = document.createElement("span");
            chip.className = "area-feature-chip";
            chip.textContent = label;
            chips.appendChild(chip);
        });
        if (this.usesSearchApi()) {
            const notice = document.createElement("span");
            notice.textContent = this.label(`api.${this.apiState}`, this.apiState === "error"
                ? "検索に失敗しました。もう一度お試しください。"
                : this.apiState === "loading" ? "検索中…" : "登録情報のある対象を全地域から検索しています");
            chips.appendChild(notice);
        }
        const count = document.getElementById("areaFeatureResultCount");
        if (count) count.textContent = this.format(this.label("count", "{count}"), { count: this.activeAreaIds.size });
        summary.hidden = false;
        this.updateListTitle();
    }

    updateListTitle() {
        const title = document.getElementById("listTitle");
        if (!title) return;
        if (this.activeCriteria?.researchMode) {
            title.textContent = this.label(
                `listTitles.${this.activeCriteria.researchMode}`,
                this.label("listTitles.research")
            );
        } else if (this.activeCriteria) {
            title.textContent = this.label("listTitles.search");
        } else {
            title.textContent = glot.get("listTitle");
        }
    }

    getAreaZoom(fallback = 0) {
        const zooms = this.linker.configuredTargets("areaTargets")
            .map(target => Number(cMapMaker.getPoiZoom?.(target) ?? Conf?.poiView?.poiZoom?.[target]))
            .filter(Number.isFinite);
        return zooms.length ? Math.min(...zooms) : fallback;
    }

    open(mode = "search") {
        if (this.settings.use === false) return;
        this.rebuildRecords();
        const panel = document.getElementById("areaFeaturePanel");
        const search = document.getElementById("areaFeatureSearchContent");
        const report = document.getElementById("areaFeatureReportContent");
        const research = document.getElementById("areaFeatureResearchContent");
        const rating = document.getElementById("areaFeatureRatingContent");
        if (!panel || !search || !report || !research || (mode === "rating" && !rating)) return;
        search.hidden = mode !== "search";
        report.hidden = mode !== "report";
        research.hidden = mode !== "research";
        if (rating) rating.hidden = mode !== "rating";
        const heading = document.getElementById("areaFeatureHeading");
        const description = document.getElementById("areaFeatureDescription");
        if (heading) heading.textContent = this.label(`heading.${mode}`, this.label("heading.search"));
        if (description) description.textContent = this.usesSearchApi() && mode !== "report"
            ? this.label("api.ready", "登録情報のある対象を全地域から検索しています")
            : this.label(`description.${mode}`, this.label("description.search"));
        const zoomNotice = document.getElementById("areaFeatureZoomNotice");
        if (zoomNotice) zoomNotice.hidden = this.usesSearchApi() || this.linker.records.length > 0 || mapLibre.getZoom(false) >= this.getAreaZoom();
        if (mode === "report") this.renderReport();
        this.modal = bootstrap.Modal.getOrCreateInstance(panel);
        this.modal.show();
        if (mode === "search") this.updatePreviewCount();
    }

    updateRatingActionLabel(scoreMin) {
        const minimum = Number(scoreMin) || 0;
        const select = document.getElementById("listRatingFilter");
        if (select) select.value = String(minimum);
        const label = minimum > 0
            ? this.format(this.label("rating.minimum", "{score}"), { score: minimum })
            : this.label("rating.default");
        const title = minimum > 0
            ? this.format(this.label("rating.activeTitle", "{label}"), { label })
            : label;
        window.listActions?.setLabel(this.settings.ratingActionId ?? "area-rating", label, title);
    }

    close() {
        const panel = document.getElementById("areaFeaturePanel");
        if (!panel) return;
        this.modal = bootstrap.Modal.getOrCreateInstance(panel);
        this.modal.hide();
    }

    zoomForSearch() {
        const areaZoom = this.getAreaZoom(13);
        this.close();
        mapLibre.setZoom(areaZoom);
        setTimeout(() => cMapMaker.updateView().then(() => this.open("search")), 900);
    }

    renderReport() {
        const records = this.visibleRecords();
        const attributeCounts = {};
        const scores = [0, 0, 0, 0, 0, 0];
        records.forEach(record => {
            const scoreBucket = Math.max(0, Math.min(5, Math.round(record.score)));
            scores[scoreBucket]++;
            record.attributes.forEach(attribute => {
                attributeCounts[attribute] = (attributeCounts[attribute] ?? 0) + 1;
            });
        });
        const metrics = [
            [this.label("report.area"), records.length],
            [this.label("report.detail"), records.filter(record => record.hasDetail).length],
            [this.label("report.recent"), records.filter(record => record.isRecent).length],
            [this.label("report.photo"), records.filter(record => record.hasPhoto).length]
        ];
        const metricArea = document.getElementById("areaFeatureReportMetrics");
        if (metricArea) {
            metricArea.replaceChildren(...metrics.map(([label, value]) => {
                const card = document.createElement("div");
                card.className = "area-report-metric";
                const strong = document.createElement("strong");
                strong.textContent = String(value);
                card.append(strong, document.createTextNode(label));
                return card;
            }));
        }
        const count = value => this.format(this.label("count", "{count}"), { count: value });
        const scoreArea = document.getElementById("areaFeatureReportScores");
        if (scoreArea) {
            scoreArea.innerHTML = [5, 4, 3, 2, 1, 0].map(score => {
                const label = score
                    ? this.format(this.label("report.score", "{score}"), { score })
                    : this.label("report.unrated");
                return `<li><span>${basic.htmlspecialchars(label)}</span><strong>${basic.htmlspecialchars(count(scores[score]))}</strong></li>`;
            }).join("");
        }
        const attributeArea = document.getElementById("areaFeatureReportAttributes");
        if (attributeArea) {
            attributeArea.innerHTML = Object.entries(this.attributeLabels).map(([key, label]) =>
                `<li><span>${basic.htmlspecialchars(label)}</span><strong>${basic.htmlspecialchars(count(attributeCounts[key] ?? 0))}</strong></li>`
            ).join("");
        }
    }

    matchReasonHtml(osmid) {
        if (!this.activeCriteria) return "";
        const record = this.usesSearchApi()
            ? this.apiRecords.find(record => record.areaId === osmid)
            : this.linker.getAreaRecord(osmid);
        if (!record || !this.activeAreaIds.has(record.areaId)) return "";
        const labels = this.criteriaLabels().map(label => basic.htmlspecialchars(label));
        const facts = [];
        if (record.score) facts.push(this.format(this.label("facts.score", "{score}"), { score: record.score }));
        record.attributes.forEach(attribute => facts.push(this.attributeLabels[attribute] ?? attribute));
        if (record.isRecent) facts.push(this.label("facts.recent"));
        if (record.hasPhoto) facts.push(this.label("facts.photo"));
        const title = basic.htmlspecialchars(this.label("matchReason.title"));
        const registered = basic.htmlspecialchars(this.label("matchReason.registered"));
        const empty = basic.htmlspecialchars(this.label("matchReason.empty"));
        const factHtml = facts.length
            ? `<p class="mb-0"><strong>${registered}</strong> ${facts.map(value => basic.htmlspecialchars(value)).join("・")}</p>`
            : `<p class="mb-0">${empty}</p>`;
        return `<section class="area-match-reason"><h3>${title}</h3><p>${labels.join("・")}</p>${factHtml}</section>`;
    }
}
