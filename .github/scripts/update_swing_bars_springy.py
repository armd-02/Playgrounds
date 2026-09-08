from pathlib import Path

js_path = Path("lib/playground3d.js")
s = js_path.read_text(encoding="utf-8")

old = 'url: "./assets/models/playground/leonkin-playground/GLTF/swing.glb"'
new = 'url: "./assets/models/playground/poly-pizza/swing-set/swing.glb"'
assert old in s, "old swing model URL not found"
s = s.replace(old, new, 1)

old = '''            structure: "structure"\n        };'''
new = '''            structure: "structure",\n            horizontal_bar: "horizontal_bar",\n            springy: "springy"\n        };'''
assert old in s, "modelAliases insertion point not found"
s = s.replace(old, new, 1)

old = '''            .then(() => {\n                this.ready = true;'''
new = '''            .then(() => {\n                this.#createProceduralTemplates();\n                this.ready = true;'''
assert old in s, "init insertion point not found"
s = s.replace(old, new, 1)

marker = "    #ensureLayer() {"
assert marker in s, "method insertion point not found"
methods = '''    #createProceduralTemplates() {
        this.templates.set("horizontal_bar", this.#makeHorizontalBar());
        this.templates.set("springy", this.#makeSpringy());
    }

    #makeHorizontalBar() {
        const T = this.THREE;
        const group = new T.Group();
        const metal = new T.MeshStandardMaterial({
            color: 0x66757f,
            roughness: 0.65,
            metalness: 0.35
        });
        const postGeometry = new T.CylinderGeometry(0.06, 0.06, 1.9, 8);
        const barGeometry = new T.CylinderGeometry(0.045, 0.045, 1.4, 8);
        barGeometry.rotateZ(Math.PI / 2);

        [-2.1, -0.7, 0.7, 2.1].forEach(x => {
            const post = new T.Mesh(postGeometry, metal);
            post.position.set(x, 0.95, 0);
            group.add(post);
        });

        [
            { x: -1.4, y: 1.25 },
            { x: 0.0, y: 1.50 },
            { x: 1.4, y: 1.75 }
        ].forEach(spec => {
            const bar = new T.Mesh(barGeometry, metal);
            bar.position.set(spec.x, spec.y, 0);
            group.add(bar);
        });

        group.scale.setScalar(this.visualScale);
        group.userData.modelKey = "horizontal_bar";
        return group;
    }

    #makeSpringy() {
        const T = this.THREE;
        const group = new T.Group();
        const metal = new T.MeshStandardMaterial({
            color: 0x59636b,
            roughness: 0.6,
            metalness: 0.4
        });
        const bodyMaterial = new T.MeshStandardMaterial({
            color: 0xe79a3b,
            roughness: 0.75
        });

        const base = new T.Mesh(new T.CylinderGeometry(0.28, 0.32, 0.12, 10), metal);
        base.position.y = 0.06;
        group.add(base);

        const points = [];
        const turns = 4;
        const segments = 40;
        for (let i = 0; i <= segments; i += 1) {
            const f = i / segments;
            const a = f * Math.PI * 2 * turns;
            points.push(new T.Vector3(
                Math.cos(a) * 0.17,
                0.16 + f * 0.58,
                Math.sin(a) * 0.17
            ));
        }
        const springCurve = new T.CatmullRomCurve3(points);
        const spring = new T.Mesh(
            new T.TubeGeometry(springCurve, 48, 0.045, 6, false),
            metal
        );
        group.add(spring);

        const support = new T.Mesh(new T.CylinderGeometry(0.08, 0.08, 0.24, 8), metal);
        support.position.y = 0.84;
        group.add(support);

        const body = new T.Mesh(new T.BoxGeometry(1.05, 0.28, 0.38), bodyMaterial);
        body.position.y = 1.03;
        group.add(body);

        const seat = new T.Mesh(new T.BoxGeometry(0.62, 0.10, 0.46), bodyMaterial);
        seat.position.set(-0.12, 1.21, 0);
        group.add(seat);

        const handleGeometry = new T.CylinderGeometry(0.035, 0.035, 0.72, 8);
        handleGeometry.rotateX(Math.PI / 2);
        const handle = new T.Mesh(handleGeometry, metal);
        handle.position.set(0.34, 1.30, 0);
        group.add(handle);

        const footGeometry = new T.CylinderGeometry(0.03, 0.03, 0.62, 8);
        footGeometry.rotateX(Math.PI / 2);
        const foot = new T.Mesh(footGeometry, metal);
        foot.position.set(-0.24, 0.94, 0);
        group.add(foot);

        group.scale.setScalar(this.visualScale);
        group.userData.modelKey = "springy";
        return group;
    }

'''
s = s.replace(marker, methods + marker, 1)
js_path.write_text(s, encoding="utf-8")

source_dir = Path("assets/models/playground/poly-pizza/swing-set")
source_dir.mkdir(parents=True, exist_ok=True)
(source_dir / "SOURCE.md").write_text(
    """# Swing set by Poly by Google

- Canonical source: https://poly.pizza/m/e-IJdcqZH4p
- Author: Poly by Google
- License: Creative Commons Attribution 3.0 (CC BY 3.0)
- Included format: GLB
- Included file: `swing.glb`
- Retrieval mirror used for this import: https://github.com/zhangyingwei/puppy-garden-3d
- Required attribution: `Swing set by Poly by Google [CC-BY 3.0] via Poly Pizza`

The model is used as a generic 3D symbol for OpenStreetMap `playground=swing` features.
""",
    encoding="utf-8",
)

readme_path = Path("assets/models/playground/README.md")
r = readme_path.read_text(encoding="utf-8")
old = "| `playground=swing` | `leonkin-playground/GLTF/swing.glb` | Playground by leonkin — CC0 |"
new = "| `playground=swing` | `poly-pizza/swing-set/swing.glb` | Swing set by Poly by Google [CC-BY 3.0] via Poly Pizza |"
assert old in r, "old swing README row not found"
r = r.replace(old, new, 1)
needle = "| `playground=structure` | `poly-pizza/composite-play-structure/composite-play-structure.glb` | Play Structure by Emmett “TawpShelf” Baber [CC-BY] via Poly Pizza |"
assert needle in r, "playground structure README row not found"
r = r.replace(
    needle,
    needle
    + "\n| `playground=horizontal_bar` | Procedural Three.js geometry | Generated by Playgrounds source — MIT |"
    + "\n| `playground=springy` | Procedural Three.js geometry | Generated by Playgrounds source — MIT |",
    1,
)
r = r.replace(
    "- Slide / swing: https://opengameart.org/content/playground",
    "- Slide: https://opengameart.org/content/playground\n- Swing: https://poly.pizza/m/e-IJdcqZH4p",
    1,
)
readme_path.write_text(r, encoding="utf-8")

glot_path = Path("data/glot-custom.jsonc")
g = glot_path.read_text(encoding="utf-8")
needle = "Playground by leonkin (CC0)</a>"
addition = (
    "Playground by leonkin (CC0)</a> / "
    "<a href=\\\"https://poly.pizza/m/e-IJdcqZH4p\\\" target=\\\"_blank\\\" rel=\\\"noopener\\\">"
    "Swing set by Poly by Google [CC-BY 3.0] via Poly Pizza</a>"
)
assert g.count(needle) == 2, f"expected 2 leonkin credits, found {g.count(needle)}"
g = g.replace(needle, addition)
glot_path.write_text(g, encoding="utf-8")
