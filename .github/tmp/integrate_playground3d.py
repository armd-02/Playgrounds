from pathlib import Path
import hashlib
import json
import re
import struct
import urllib.parse


def read_text(path):
    return Path(path).read_bytes().decode("utf-8")


def write_text(path, text):
    Path(path).write_bytes(text.encode("utf-8"))


# manifest.json: load the 3D helper with the existing local libraries.
p = "manifest.json"
s = read_text(p)
nl = "\r\n" if "\r\n" in s else "\n"
if "./lib/playground3d.js" not in s:
    needle = '                "./lib/poilib.js",'
    assert needle in s, "manifest insertion point not found"
    s = s.replace(needle, needle + nl + '                "./lib/playground3d.js",', 1)
    write_text(p, s)

# cmapmaker.js: construct, initialize and synchronize the 3D overlay.
p = "cmapmaker.js"
s = read_text(p)
nl = "\r\n" if "\r\n" in s else "\n"
if "const playground3d = new Playground3D();" not in s:
    needle = "const poiCont = new PoiCont();" + nl
    assert needle in s, "playground3d global insertion point not found"
    s = s.replace(needle, needle + "const playground3d = new Playground3D();" + nl, 1)
if "playground3d.init(mapLibre.map" not in s:
    needle = '                    console.log("initialize: gSheet, static, MapLibre OK.");' + nl
    assert needle in s, "playground3d init insertion point not found"
    addition = (
        "                    playground3d.init(mapLibre.map, Conf.playground3d || {})" + nl
        + '                        .catch((e) => console.warn("Playground3D: init failed", e));' + nl
    )
    s = s.replace(needle, needle + addition, 1)
if "playground3d.sync()" not in s:
    pat = re.compile(r"([ \t]*this\.viewPoi\(targets\)[^\r\n]*)(\r?\n)")
    m = pat.search(s)
    assert m, "playground3d sync insertion point not found"
    indent = re.match(r"[ \t]*", m.group(1)).group(0)
    insert_at = m.end()
    s = s[:insert_at] + indent + "playground3d.sync()" + m.group(2) + s[insert_at:]
write_text(p, s)

# User config: switch and zoom threshold.
p = "data/config-user.jsonc"
s = read_text(p)
nl = "\r\n" if "\r\n" in s else "\n"
if '"playground3d"' not in s:
    needle = '    "poiView": {'
    assert needle in s, "playground3d config insertion point not found"
    block = (
        '    "playground3d": {' + nl
        + '        "use": true, // 対応する playground=* を3Dモデルで表示' + nl
        + '        "minZoom": 17 // 3D遊具の表示開始ズーム' + nl
        + '    },' + nl
    )
    s = s.replace(needle, block + needle, 1)
    write_text(p, s)

# License UI: surface all third-party model credits required by CC-BY.
p = "data/glot-custom.jsonc"
s = read_text(p)
nl = "\r\n" if "\r\n" in s else "\n"
ja = (
    "このサイトで使われているデータは、OpenStreetMapとプロジェクトのデータを組み合わせています。"
    '<br><br>3D遊具モデル: '
    '<a href="https://opengameart.org/content/playground" target="_blank" rel="noopener">Playground by leonkin (CC0)</a> / '
    '<a href="https://poly.pizza/m/0-7U_RTHzKT" target="_blank" rel="noopener">Jungle gym by Poly by Google [CC-BY] via Poly Pizza</a> / '
    '<a href="https://poly.pizza/m/ee0cso-KZnC" target="_blank" rel="noopener">Play Structure by Emmett “TawpShelf” Baber [CC-BY] via Poly Pizza</a> / '
    '<a href="https://poly.pizza/m/07KqBahqHXK" target="_blank" rel="noopener">Sandbox by sirkitree [CC-BY] via Poly Pizza</a>'
)
en = (
    "The data used by this site combines OpenStreetMap data with project data."
    '<br><br>3D playground models: '
    '<a href="https://opengameart.org/content/playground" target="_blank" rel="noopener">Playground by leonkin (CC0)</a> / '
    '<a href="https://poly.pizza/m/0-7U_RTHzKT" target="_blank" rel="noopener">Jungle gym by Poly by Google [CC-BY] via Poly Pizza</a> / '
    '<a href="https://poly.pizza/m/ee0cso-KZnC" target="_blank" rel="noopener">Play Structure by Emmett “TawpShelf” Baber [CC-BY] via Poly Pizza</a> / '
    '<a href="https://poly.pizza/m/07KqBahqHXK" target="_blank" rel="noopener">Sandbox by sirkitree [CC-BY] via Poly Pizza</a>'
)
replacement = (
    '    "licence_message": {' + nl
    + '        "ja": ' + json.dumps(ja, ensure_ascii=False) + "," + nl
    + '        "en": ' + json.dumps(en, ensure_ascii=False) + nl
    + '    },'
)
pat = re.compile(r'    "licence_message": \{.*?\r?\n    \},', re.S)
assert pat.search(s), "licence_message block not found"
s = pat.sub(lambda _: replacement, s, count=1)
write_text(p, s)

# Fix picking: generic THREE.Camera is not accepted by Raycaster.setFromCamera.
p = "lib/playground3d.js"
s = read_text(p)
nl = "\r\n" if "\r\n" in s else "\n"
old = """    #pick(point) {
        if (!this.ready || !this.camera || !this.modelGroup || this.modelGroup.children.length === 0) {
            return null;
        }
        const canvas = this.map.getCanvas();
        const mouse = new this.THREE.Vector2(
            (point.x / canvas.clientWidth) * 2 - 1,
            -(point.y / canvas.clientHeight) * 2 + 1
        );
        this.raycaster.setFromCamera(mouse, this.camera);
        const hits = this.raycaster.intersectObjects(this.modelGroup.children, true);
        return hits.length > 0 ? hits[0].object : null;
    }
""".replace("\n", nl)
new = """    #pick(point) {
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
""".replace("\n", nl)
if "setFromCamera(mouse, this.camera)" in s:
    assert old in s, "Playground3D pick block not found"
    s = s.replace(old, new, 1)
    write_text(p, s)

readme_lines = [
    "# Playground 3D models",
    "",
    "These low-poly models are used as 3D symbols for OpenStreetMap `playground=*` features.",
    "The model is a semantic symbol; it does not claim to reproduce the exact real-world equipment unless the OSM data provides that detail.",
    "",
    "| OSM tag | Model | License / attribution |",
    "| --- | --- | --- |",
    "| `playground=slide` | `leonkin-playground/GLTF/slide.glb` | Playground by leonkin — CC0 |",
    "| `playground=swing` | `leonkin-playground/GLTF/swing.glb` | Playground by leonkin — CC0 |",
    "| `playground=sandpit` | `poly-pizza/sandpit/sandpit.glb` | Sandbox by sirkitree [CC-BY] via Poly Pizza |",
    "| `playground=climbingframe` | `poly-pizza/jungle-gym/jungle-gym.glb` | Jungle gym by Poly by Google [CC-BY] via Poly Pizza |",
    "| `playground=structure` | `poly-pizza/composite-play-structure/composite-play-structure.glb` | Play Structure by Emmett “TawpShelf” Baber [CC-BY] via Poly Pizza |",
    "",
    "## Sources",
    "",
    "- Slide / swing: https://opengameart.org/content/playground",
    "- Sandpit: https://poly.pizza/m/07KqBahqHXK",
    "- Jungle gym: https://poly.pizza/m/0-7U_RTHzKT",
    "- Composite play structure: https://poly.pizza/m/ee0cso-KZnC",
    "",
    "For per-model details, see each `SOURCE.md` file.",
]
write_text("assets/models/playground/README.md", "\n".join(readme_lines) + "\n")

# Validate GLB headers and external asset references.
glbs = [
    Path("assets/models/playground/leonkin-playground/GLTF/slide.glb"),
    Path("assets/models/playground/leonkin-playground/GLTF/swing.glb"),
    Path("assets/models/playground/poly-pizza/sandpit/sandpit.glb"),
    Path("assets/models/playground/poly-pizza/jungle-gym/jungle-gym.glb"),
    Path("assets/models/playground/poly-pizza/composite-play-structure/composite-play-structure.glb"),
]


def inspect_glb(path):
    data = path.read_bytes()
    assert len(data) >= 20, f"{path}: too short"
    magic, version, total = struct.unpack_from("<4sII", data, 0)
    assert magic == b"glTF", f"{path}: bad magic"
    assert version == 2, f"{path}: unsupported version {version}"
    assert total == len(data), f"{path}: header length {total} != {len(data)}"
    chunk_len, chunk_type = struct.unpack_from("<II", data, 12)
    assert chunk_type == 0x4E4F534A, f"{path}: first chunk is not JSON"
    obj = json.loads(data[20 : 20 + chunk_len].decode("utf-8").rstrip(" \t\r\n\x00"))
    uris = []
    for section in ("buffers", "images"):
        for item in obj.get(section, []):
            uri = item.get("uri")
            if uri and not uri.startswith(("data:", "http://", "https://")):
                uris.append(urllib.parse.unquote(uri))
    for uri in uris:
        target = path.parent / uri
        if target.exists():
            continue
        pngs = list(path.parent.glob("*.png"))
        if len(pngs) == 1:
            pngs[0].rename(target)
        else:
            raise AssertionError(f"{path}: missing external asset {uri}")
    print(f"{path}: {len(data)} bytes, external={uris}")


for path in glbs:
    assert path.exists(), f"missing model: {path}"
    inspect_glb(path)

sandpit = Path("assets/models/playground/poly-pizza/sandpit/sandpit.glb").read_bytes()
assert len(sandpit) == 28304
assert hashlib.sha256(sandpit).hexdigest() == "9d67bfcb7680e439ad344707a4f9ae10b419a50cdca7115774017d5e3e70e375"
