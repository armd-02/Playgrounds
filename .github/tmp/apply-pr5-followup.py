from pathlib import Path
import json

# Resize the Japanese vending-machine textures for web-map use.
from PIL import Image

for p in Path('assets/models/poi/vending-machine/textures').glob('*.png'):
    with Image.open(p) as im:
        old = im.size
        im.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
        im.save(p, optimize=True)
        print(f'{p}: {old} -> {im.size}, {p.stat().st_size} bytes')

# ---- lib/playground3d.js ----
p = Path('lib/playground3d.js')
s = p.read_text(encoding='utf-8')

old = 'url: "./assets/models/poi/vending-machine/vending-machine.glb"'
new = 'url: "./assets/models/poi/vending-machine/scene.gltf"'
assert old in s
s = s.replace(old, new, 1)

old = '''            structure: {\n                url: "./assets/models/playground/poly-pizza/composite-play-structure/composite-play-structure.glb",\n                size: 8.0\n            },'''
new = '''            structure: {\n                url: "./assets/models/playground/poly-pizza/composite-play-structure/composite-play-structure.glb",\n                size: 8.0\n            },\n            seesaw: {\n                url: "./assets/models/playground/poly-pizza/seesaw/seesaw.glb",\n                size: 4.0\n            },'''
assert old in s
s = s.replace(old, new, 1)

old = '''            structure: "structure",\n            horizontal_bar: "horizontal_bar",\n            springy: "springy"'''
new = '''            structure: "structure",\n            seesaw: "seesaw",\n            basketswing: "basket_swing",\n            basket_swing: "basket_swing",\n            horizontal_bar: "horizontal_bar",\n            springy: "springy"'''
assert old in s
s = s.replace(old, new, 1)

old = '''    #createProceduralTemplates() {\n        this.templates.set("horizontal_bar", this.#makeHorizontalBar());\n        this.templates.set("springy", this.#makeSpringy());\n    }'''
new = '''    #createProceduralTemplates() {\n        this.templates.set("horizontal_bar", this.#makeHorizontalBar());\n        this.templates.set("springy", this.#makeSpringy());\n        this.templates.set("basket_swing", this.#makeBasketSwing());\n    }'''
assert old in s
s = s.replace(old, new, 1)

marker = '    #ensureLayer() {'
assert marker in s
method = r'''    #makeBasketSwing() {
        const T = this.THREE;
        const group = new T.Group();
        const metal = new T.MeshStandardMaterial({
            color: 0x5f6b73,
            roughness: 0.6,
            metalness: 0.4
        });
        const rope = new T.MeshStandardMaterial({
            color: 0x30343a,
            roughness: 0.9
        });
        const seat = new T.MeshStandardMaterial({
            color: 0x2f5f72,
            roughness: 0.8
        });

        const beamBetween = (a, b, radius, material, segments = 8) => {
            const start = new T.Vector3(...a);
            const end = new T.Vector3(...b);
            const delta = end.clone().sub(start);
            const mesh = new T.Mesh(
                new T.CylinderGeometry(radius, radius, delta.length(), segments),
                material
            );
            mesh.position.copy(start).add(end).multiplyScalar(0.5);
            mesh.quaternion.setFromUnitVectors(
                new T.Vector3(0, 1, 0),
                delta.clone().normalize()
            );
            group.add(mesh);
            return mesh;
        };

        // Generic A-frame nest swing. This intentionally avoids reproducing
        // a particular manufacturer's product.
        [-1.65, 1.65].forEach(x => {
            beamBetween([x, 0, -0.85], [x, 2.35, 0], 0.065, metal);
            beamBetween([x, 0, 0.85], [x, 2.35, 0], 0.065, metal);
        });
        beamBetween([-1.75, 2.35, 0], [1.75, 2.35, 0], 0.075, metal);

        const ring = new T.Mesh(
            new T.TorusGeometry(0.62, 0.055, 6, 20),
            seat
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.82;
        group.add(ring);

        // A few crossed cords read as the basket/nest web at map scale.
        for (let i = 0; i < 8; i += 1) {
            const a = i * Math.PI / 8;
            beamBetween(
                [Math.cos(a) * 0.56, 0.82, Math.sin(a) * 0.56],
                [-Math.cos(a) * 0.56, 0.82, -Math.sin(a) * 0.56],
                0.012,
                rope,
                5
            );
        }

        [
            [-0.52, 2.30, 0, -0.48, 0.90, -0.34],
            [-0.52, 2.30, 0, -0.48, 0.90, 0.34],
            [0.52, 2.30, 0, 0.48, 0.90, -0.34],
            [0.52, 2.30, 0, 0.48, 0.90, 0.34]
        ].forEach(v => beamBetween(v.slice(0, 3), v.slice(3, 6), 0.018, rope, 6));

        group.scale.setScalar(this.visualScale);
        group.userData.modelKey = "basket_swing";
        return group;
    }

'''
s = s.replace(marker, method + marker, 1)
p.write_text(s, encoding='utf-8')

# ---- model source documentation ----
Path('assets/models/poi/vending-machine/SOURCE.md').write_text('''# JPN vending machine by adenotoxin\n\n- Canonical source: https://sketchfab.com/3d-models/jpn-vending-machine-e9a1050ada83417592fc3233cb6a4c0a\n- Author: adenotoxin\n- License: Creative Commons Attribution 4.0 International (CC BY 4.0)\n- Included format: glTF 2.0 (`scene.gltf` + `scene.bin` + textures)\n- Retrieval mirror used for this import: https://github.com/Makar210807/horror_game\n- Required attribution: `JPN vending machine by adenotoxin [CC BY 4.0] via Sketchfab`\n\nThe model represents a common Japanese beverage vending-machine design and is used as a generic 3D symbol for OpenStreetMap `amenity=vending_machine` features. The two source textures are resized to a maximum of 1024px for web-map performance; geometry is unchanged.\n''', encoding='utf-8')

Path('assets/models/playground/poly-pizza/seesaw/SOURCE.md').write_text('''# Seesaw by Poly by Google\n\n- Canonical source: https://poly.pizza/m/fBaX63DY389\n- Author: Poly by Google\n- License: Creative Commons Attribution 3.0 (CC BY 3.0)\n- Included format: GLB\n- Included file: `seesaw.glb`\n- Retrieval mirror used for this import: https://github.com/zhangyingwei/puppy-garden-3d\n- Source model: 760 triangles according to the retrieval mirror manifest\n- Required attribution: `Seesaw by Poly by Google [CC-BY 3.0] via Poly Pizza`\n\nThe model is used as a generic 3D symbol for OpenStreetMap `playground=seesaw` features.\n''', encoding='utf-8')

# ---- README tables ----
p = Path('assets/models/poi/README.md')
r = p.read_text(encoding='utf-8')
old = '| `amenity=vending_machine` | `vending-machine/vending-machine.glb` | Vending Machine by Kenney — CC0 |'
new = '| `amenity=vending_machine` | `vending-machine/scene.gltf` | JPN vending machine by adenotoxin — CC BY 4.0 |'
assert old in r
p.write_text(r.replace(old, new, 1), encoding='utf-8')

p = Path('assets/models/playground/README.md')
r = p.read_text(encoding='utf-8')
needle = '| `playground=structure` | `poly-pizza/composite-play-structure/composite-play-structure.glb` | Play Structure by Emmett “TawpShelf” Baber [CC-BY] via Poly Pizza |'
assert needle in r
r = r.replace(
    needle,
    needle + '\n| `playground=seesaw` | `poly-pizza/seesaw/seesaw.glb` | Seesaw by Poly by Google [CC-BY 3.0] via Poly Pizza |\n| `playground=basketswing` | Procedural Three.js geometry | Generated by Playgrounds source — MIT |',
    1
)
r = r.replace(
    '`horizontal_bar` and `springy` are intentionally generic map symbols generated in code rather than replicas of a particular product. `springy` does not assume an animal/theme unless that information is separately available in OSM.',
    '`horizontal_bar`, `springy`, and `basketswing` are intentionally generic map symbols generated in code rather than replicas of a particular product. `springy` does not assume an animal/theme unless that information is separately available in OSM.'
)
r = r.replace(
    '- Swing: https://poly.pizza/m/e-IJdcqZH4p',
    '- Swing: https://poly.pizza/m/e-IJdcqZH4p\n- Seesaw: https://poly.pizza/m/fBaX63DY389',
    1
)
p.write_text(r, encoding='utf-8')

# ---- site licence display ----
p = Path('data/glot-custom.jsonc')
g = p.read_text(encoding='utf-8')
old = '<a href=\\"https://kenney.nl/assets/mini-arcade\\" target=\\"_blank\\" rel=\\"noopener\\">Vending Machine by Kenney (CC0)</a>'
new = '<a href=\\"https://sketchfab.com/3d-models/jpn-vending-machine-e9a1050ada83417592fc3233cb6a4c0a\\" target=\\"_blank\\" rel=\\"noopener\\">JPN vending machine by adenotoxin [CC BY 4.0] via Sketchfab</a>'
assert g.count(old) == 2
g = g.replace(old, new)

swing_credit = '<a href=\\"https://poly.pizza/m/e-IJdcqZH4p\\" target=\\"_blank\\" rel=\\"noopener\\">Swing set by Poly by Google [CC-BY 3.0] via Poly Pizza</a>'
seesaw_credit = '<a href=\\"https://poly.pizza/m/fBaX63DY389\\" target=\\"_blank\\" rel=\\"noopener\\">Seesaw by Poly by Google [CC-BY 3.0] via Poly Pizza</a>'
assert g.count(swing_credit) == 2
g = g.replace(swing_credit, swing_credit + ' / ' + seesaw_credit)
p.write_text(g, encoding='utf-8')

# ---- basic asset validation ----
vm = Path('assets/models/poi/vending-machine/scene.gltf')
obj = json.loads(vm.read_text(encoding='utf-8'))
text = vm.read_text(encoding='utf-8')
assert obj.get('asset', {}).get('version') == '2.0'
assert 'adenotoxin' in text and 'CC-BY-4.0' in text
assert Path('assets/models/poi/vending-machine/scene.bin').stat().st_size == 1675928
for image in obj.get('images', []):
    assert Path('assets/models/poi/vending-machine', image['uri']).is_file()

tris = 0
for mesh in obj.get('meshes', []):
    for prim in mesh.get('primitives', []):
        if prim.get('mode', 4) == 4 and 'indices' in prim:
            tris += obj['accessors'][prim['indices']]['count'] // 3
print('JPN vending machine indexed triangles:', tris)

assert Path('assets/models/playground/poly-pizza/seesaw/seesaw.glb').stat().st_size == 115308
print('PR #5 follow-up integration complete')
