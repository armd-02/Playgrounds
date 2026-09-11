const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("user.css", "utf8");
assert.match(html, /id="areaFeaturePanel" class="modal area-feature-panel"/);
assert.doesNotMatch(html, /id="areaFeaturePanel" class="[^"]*\bfade\b/);
assert.match(html, /class="modal-dialog modal-dialog-scrollable area-feature-dialog"/);
assert.match(html, /class="modal-content area-feature-sheet"/);
assert.match(html, /data-bs-dismiss="modal"/);
assert.match(css, /\.area-feature-panel\s*\{[^}]*overflow-y:\s*hidden\s*!important/s);
assert.match(css, /body\.modal-open #btmHeader\s*\{[^}]*scrollbar-color:\s*transparent transparent/s);

const source = fs.readFileSync("lib/areasearchcontroller.js", "utf8");
let showCount = 0;
let hideCount = 0;
const modal = {
    show: () => { showCount += 1; },
    hide: () => { hideCount += 1; }
};
const elements = new Map();
const element = () => ({ hidden: false, textContent: "" });
["areaFeaturePanel", "areaFeatureSearchContent", "areaFeatureReportContent",
    "areaFeatureResearchContent", "areaFeatureRatingContent", "areaFeatureHeading",
    "areaFeatureDescription", "areaFeatureZoomNotice"].forEach(id => elements.set(id, element()));

const context = {
    console,
    Conf: { areaSearch: { use: true, labels: {} }, google: {} },
    document: { getElementById: id => elements.get(id) ?? null },
    bootstrap: { Modal: { getOrCreateInstance: () => modal } },
    mapLibre: { getZoom: () => 15 },
    cMapMaker: { getPoiZoom: () => 13 }
};
context.globalThis = context;
vm.createContext(context);
vm.runInContext(`${source}\nglobalThis.TestAreaSearchController = AreaSearchController;`, context);

const controller = new context.TestAreaSearchController({
    records: [],
    rebuildIndex: () => [],
    configuredTargets: () => []
});
controller.updatePreviewCount = () => {};
controller.open("search");
controller.close();

assert.strictEqual(showCount, 1);
assert.strictEqual(hideCount, 1);
console.log("PASS: area search uses Bootstrap modal markup and show/hide API");
