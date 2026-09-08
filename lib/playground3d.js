"use strict";

// Three.js overlay for selected OSM playground and park-facility features.
// The layer is intentionally independent from Navara so the existing MapLibre app
// can experiment with 3D playground equipment and park facilities while Navara is still in beta.
class Playground3D {
    constructor() {
        this.map = null;
        this.THREE = null;
        this.GLTFLoader = null;
        this.loader = null;
        this.scene = null;
        this.modelGroup = null;
        this.camera = null;
        this.renderer = null;
        this.raycaster = null;
        this.sceneOrigin = null;
        this.templates = new Map();
        this.ready = false;
        this.loading = null;
        this.layerId = "playground-equipment-3d";
        this.minZoom = 17;
        this.pendingSync = false;
        this.enabled = true;
        this.cursorOwned = false;

        this.modelDefs = {
            slide: {
                url: "./assets/models/playground/leonkin-playground/GLTF/slide.glb",
                size: 4.0
            },
            swing: {
                url: "./assets/models/playground/leonkin-playground/GLTF/swing.glb",
                size: 4.0
            },
            sandpit: {
                url: "./assets/models/playground/poly-pizza/sandpit/sandpit.glb",
                size: 3.0
            },
            climbingframe: {
                url: "./assets/models/playground/poly-pizza/jungle-gym/jungle-gym.glb",
                size: 5.0
            },
            structure: {
                url: "./assets/models/playground/poly-pizza/composite-play-structure/composite-play-structure.glb",
                size: 8.0
            },
            bench: {
                url: "./assets/models/poi/bench/bench.glb",
                size: 2.0
            },
            drinking_water: {
                url: "./assets/models/poi/drinking-water/scene.gltf",
                size: 1.2
            },
            vending_machine: {
                url: "./assets/models/poi/vending-machine/vending-machine.glb",
                size: 1.9
            }
        };

        this.modelAliases = {
            slide: "slide",
            swing: "swing",
            sandpit: "sandpit",
            sandbox: "sandpit",
            climbingframe: "climbingframe",
            climbing_frame: "climbingframe",
            jungle_gym: "climbingframe",
            structure: "structure"
        };
    }

    init(map, options = {}) {
        if (!map) return Promise.resolve(false);
        if (this.loading) return this.loading;

        this.enabled = options.use !== false;
        this.minZoom = Number.isFinite(Number(options.minZoom)) ? Number(options.minZoom) : this.minZoom;
        if (!this.enabled) return Promise.resolve(false);

        this.map = map;
        this.loading = this.#loadThree()
            .then(() => Promise.all(
                Object.entries(this.modelDefs).map(([key, def]) => this.#loadTemplate(key, def))
            ))
            .then(() => {
                this.ready = true;
                this.#ensureLayer();
                this.map.on("style.load", () => {
                    this.#ensureLayer();
                    this.pendingSync = true;
                    setTimeout(() => this.sync(), 0);
                });
                this.map.on("click", e => this.#onClick(e));
                this.map.on("mousemove", e => this.#onMouseMove(e));
                if (this.pendingSync) this.sync();
                return true;
            })
            .catch(err => {
                console.warn("Playground3D: initialization failed", err);
                return false;
            });

        return this.loading;
    }

    async #loadThree() {
        const [threeModule, loaderModule] = await Promise.all([
            import("https://esm.sh/three@0.169.0"),
            import("https://esm.sh/three@0.169.0/examples/jsm/loaders/GLTFLoader.js")
        ]);
        this.THREE = threeModule;
        this.GLTFLoader = loaderModule.GLTFLoader;
        this.loader = new this.GLTFLoader();
        this.raycaster = new this.THREE.Raycaster();
    }

    async #loadTemplate(key, def) {
        try {
            const gltf = await this.loader.loadAsync(def.url);
            const root = gltf.scene;
            root.updateMatrixWorld(true);

            const box = new this.THREE.Box3().setFromObject(root);
            const size = new this.THREE.Vector3();
            box.getSize(size);
            const longest = Math.max(size.x, size.y, size.z) || 1;
            const scale = def.size / longest;

            const wrapper = new this.THREE.Group();
            root.scale.setScalar(scale);
            root.position.y = -box.min.y * scale;
            wrapper.add(root);
            wrapper.userData.modelKey = key;
            this.templates.set(key, wrapper);
        } catch (err) {
            console.warn(`Playground3D: failed to load ${key}`, err);
        }
    }

    #ensureLayer() {
        if (!this.ready || !this.map || this.map.getLayer(this.layerId)) return;

        const self = this;
        const customLayer = {
            id: this.layerId,
            type: "custom",
            renderingMode: "3d",
            onAdd(map, gl) {
                self.camera = new self.THREE.Camera();
                self.scene = new self.THREE.Scene();

                // Match the coordinate convention from the MapLibre Three.js terrain example:
                // x=east, y=up, z=north.
                self.scene.rotateX(Math.PI / 2);
                self.scene.scale.multiply(new self.THREE.Vector3(1, 1, -1));

                const ambient = new self.THREE.AmbientLight(0xffffff, 1.5);
                self.scene.add(ambient);

                const sun = new self.THREE.DirectionalLight(0xffffff, 2.0);
                sun.position.set(50, 80, -30).normalize();
                self.scene.add(sun);

                self.modelGroup = new self.THREE.Group();
                self.scene.add(self.modelGroup);

                self.renderer = new self.THREE.WebGLRenderer({
                    canvas: map.getCanvas(),
                    context: gl,
                    antialias: true
                });
                self.renderer.autoClear = false;
                self.pendingSync = true;
                setTimeout(() => self.sync(), 0);
            },
            render(gl, args) {
                if (!self.scene || !self.sceneOrigin) return;

                const originElevation = self.#terrainElevation(self.sceneOrigin);
                const originMercator = maplibregl.MercatorCoordinate.fromLngLat(
                    self.sceneOrigin,
                    originElevation
                );
                const projection = new self.THREE.Matrix4().fromArray(
                    args.defaultProjectionData.mainMatrix
                );
                const localToMercator = new self.THREE.Matrix4()
                    .makeTranslation(originMercator.x, originMercator.y, originMercator.z)
                    .scale(new self.THREE.Vector3(
                        originMercator.meterInMercatorCoordinateUnits(),
                        -originMercator.meterInMercatorCoordinateUnits(),
                        originMercator.meterInMercatorCoordinateUnits()
                    ));

                self.camera.projectionMatrix.copy(projection.multiply(localToMercator));
                self.camera.projectionMatrixInverse.copy(self.camera.projectionMatrix).invert();
                self.renderer.resetState();
                self.renderer.render(self.scene, self.camera);
            }
        };

        try {
            this.map.addLayer(customLayer);
        } catch (err) {
            console.warn("Playground3D: custom layer could not be added", err);
        }
    }

    sync() {
        if (!this.enabled) return;
        if (!this.ready || !this.map || !this.modelGroup) {
            this.pendingSync = true;
            return;
        }
        this.pendingSync = false;

        this.modelGroup.clear();
        if (this.map.getZoom() < this.minZoom) {
            this.map.triggerRepaint();
            return;
        }

        this.sceneOrigin = this.map.getCenter();
        const originMercator = maplibregl.MercatorCoordinate.fromLngLat(this.sceneOrigin);
        const originElevation = this.#terrainElevation(this.sceneOrigin);
        const bounds = this.map.getBounds();
        const pois = poiCont.getPois("-", false);

        pois.geojson.forEach((feature, idx) => {
            const lnglat = pois.lnglat[idx];
            if (!Array.isArray(lnglat) || lnglat.length < 2) return;
            if (!bounds.contains(lnglat)) return;

            const tags = this.#tags(feature);
            const modelKey = this.#modelKey(tags);
            const template = this.templates.get(modelKey);
            if (!template) return;

            const mercator = maplibregl.MercatorCoordinate.fromLngLat(lnglat);
            const delta = this.#mercatorDeltaMeters(originMercator, mercator);
            const elevation = this.#terrainElevation(lnglat) - originElevation;
            const object = template.clone(true);
            object.position.set(delta.east, elevation, delta.north);

            const direction = Number.parseFloat(tags.direction);
            if (Number.isFinite(direction)) {
                object.rotation.y = this.THREE.MathUtils.degToRad(direction);
            }

            const osmId = tags.id ?? feature.id;
            object.userData.osmId = osmId;
            object.userData.modelKey = modelKey;
            object.traverse(child => {
                child.userData.osmId = osmId;
                child.userData.modelKey = modelKey;
            });
            this.modelGroup.add(object);
        });

        this.map.triggerRepaint();
    }

    #modelKey(tags) {
        const playground = this.modelAliases[String(tags.playground || "").toLowerCase()];
        if (playground) return playground;

        const amenity = String(tags.amenity || "").toLowerCase();
        if (amenity === "bench" || amenity === "drinking_water" || amenity === "vending_machine") {
            return amenity;
        }
        return null;
    }

    #tags(feature) {
        const props = feature?.properties ?? {};
        return (props.tags && typeof props.tags === "object") ? props.tags : props;
    }

    #terrainElevation(lnglat) {
        if (!this.map || typeof this.map.queryTerrainElevation !== "function") return 0;
        return this.map.queryTerrainElevation(lnglat) || 0;
    }

    #mercatorDeltaMeters(from, to) {
        const mercatorPerMeter = from.meterInMercatorCoordinateUnits();
        return {
            east: (to.x - from.x) / mercatorPerMeter,
            north: (from.y - to.y) / mercatorPerMeter
        };
    }

    #pick(point) {
        if (!this.ready || !this.camera || !this.modelGroup || this.modelGroup.children.length === 0) {
            return null;
        }
        const canvas = this.map.getCanvas();
        const ndcX = (point.x / canvas.clientWidth) * 2 - 1;
        const ndcY = -(point.y / canvas.clientHeight) * 2 + 1;
        const inv = this.camera.projectionMatrixInverse;
        const near = new this.THREE.Vector3(ndcX, ndcY, -1).applyMatrix4(inv);
        const far = new this.THREE.Vector3(ndcX, ndcY, 1).applyMatrix4(inv);
        const direction = far.clone().sub(near).normalize();
        this.raycaster.set(near, direction);
        const hits = this.raycaster.intersectObjects(this.modelGroup.children, true);
        return hits.length > 0 ? hits[0].object : null;
    }

    #findOsmId(object) {
        let current = object;
        while (current) {
            if (current.userData?.osmId) return current.userData.osmId;
            current = current.parent;
        }
        return null;
    }

    #onClick(e) {
        if (this.map.getZoom() < this.minZoom) return;
        const hit = this.#pick(e.point);
        const osmId = this.#findOsmId(hit);
        if (!osmId) return;

        const poi = poiCont.get_osmid(osmId);
        cMapMaker.viewDetail(osmId)
            .then(() => {
                if (!poi) return;
                geoCont.flashPolygon(poi.geojson);
                geoCont.writePoiCircle(poi.geojson);
            })
            .catch(err => console.warn("Playground3D: detail view failed", err));
    }

    #onMouseMove(e) {
        if (this.map.getZoom() < this.minZoom) {
            if (this.cursorOwned) this.map.getCanvas().style.cursor = "";
            this.cursorOwned = false;
            return;
        }
        const hit = this.#pick(e.point);
        if (hit) {
            this.map.getCanvas().style.cursor = "pointer";
            this.cursorOwned = true;
        } else if (this.cursorOwned) {
            this.map.getCanvas().style.cursor = "";
            this.cursorOwned = false;
        }
    }
}
