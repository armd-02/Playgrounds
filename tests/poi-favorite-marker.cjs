const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const zoomSteps = vm.runInNewContext('('
    + fs.readFileSync('data/config-user.jsonc', 'utf8') + ')').icon.zoomSteps;

const colors = Object.fromEntries(['attention', 'green', 'middle', 'normal', 'visited']
    .map(type => [type, { fill: '#ffffff', stroke: '#888888' }]));
colors.favorite = { badgeColor: '#d14970' };
colors.hover = { enabled: false };
const sources = new Map();
const layers = new Map();
const map = {
    getSource: id => sources.get(id),
    addSource: (id, options) => sources.set(id, {
        data: options.data, setData(data) { this.data = data; }
    }),
    getLayer: id => layers.get(id),
    addLayer: layer => layers.set(layer.id, layer),
    on() {}
};
const poi = { geojson: {
    id: 'node/1', type: 'Feature', geometry: { type: 'Point', coordinates: [135, 34] },
    properties: { tags: { id: 'node/1', name: 'Test' } }
}, targets: ['park'], lnglat: [135, 34] };
let favorite = false;
let hasModel = false;
const context = vm.createContext({
    console, structuredClone,
    Conf: {
        activity: { targetName: 'activity' }, activities: {},
        indoor: { use: false }, map: { openNow: false }, etc: { reverseIcon: false },
        osm: { park: { expression: { poiView: true } } },
        poiView: { editZoom: {} },
        icon: { markerColors: colors, zoomSteps,
        shadow: 1, attention: 1, green: 1, middle: 1, normal: 1, visited: 1,
        textViewZoom: 14, textSize: 12, textFont: ['Noto Sans'] }
    },
    PoiStatusIndex: { VISITED: 0, FAVORITE: 1, MEMO: 2 },
    poiStatusCont: { getValueByOSMID: () => [false, favorite, ''] },
    mapLibre: { map, getZoom: () => 18, get_LL: () => ({}) },
    geoCont: { checkInner: () => true },
    cMapMaker: { isPoiVisibleInLevelMode: () => true, getPoiZoom: () => 12 },
    feature3d: { sync() {}, hasModel: () => hasModel, placeBelowMarkerLayers() {} },
    glot: { lang: 'ja' }
});
vm.runInContext(fs.readFileSync('lib/poilib.js', 'utf8') + '\nthis.PoiCont = PoiCont;', context);
const controller = new context.PoiCont();
controller.getTargets = () => ['park'];
controller.get_osmid = () => poi;
controller.getActlistByOsmid = () => [];
controller.getOSMname = () => 'Test';
context.poiCont = controller;
controller.setPoi([['node/1']], false);
assert.equal(sources.has('marker-favorite'), false);
assert.equal(layers.has('marker-favorite'), false);
favorite = true;
controller.setPoi([['node/1']], false);
assert.equal(sources.get('marker-favorite').data.features.length, 1);
assert.equal(sources.get('marker-favorite').data.features[0].id, 'node/1');
assert.equal(layers.get('marker-bg-normal').paint['circle-color'], '#ffffff');
assert.equal(layers.get('marker-favorite').layout['text-field'], '♥');
assert.equal(layers.get('marker-favorite').paint['text-color'], '#d14970');
favorite = false;
controller.setPoi([['node/1']], false);
assert.equal(sources.get('marker-favorite').data.features.length, 0);
assert.equal([...layers.keys()].filter(id => id.startsWith('marker-favorite')).length, 1);
hasModel = true;
favorite = true;
controller.setPoi([['node/1']], false);
assert.equal(sources.get('marker-normal').data.features.length, 0, '3D objects still replace the ordinary marker');
assert.equal(sources.get('marker-favorite').data.features.length, 1, '3D objects retain their favorite badge');
assert.equal(sources.get('marker-favorite').data.features[0].id, 'node/1');
favorite = false;
controller.setPoi([['node/1']], false);
assert.equal(sources.get('marker-favorite').data.features.length, 0, 'unchecking a 3D favorite clears its badge');
hasModel = false;
favorite = true;
controller.setPoi([['node/1']], false);
assert.equal(sources.get('marker-normal').data.features.length, 1, 'icon fallback is restored');
assert.equal(sources.get('marker-favorite').data.features.length, 1, 'fallback does not duplicate the badge');
function sizeAt(expression, zoom) {
    assert.equal(expression[0], 'step');
    let value = expression[2];
    for (let i = 3; i < expression.length && zoom >= expression[i]; i += 2) value = expression[i + 1];
    return value;
}
for (const [name, expression] of [
    ['foreground', layers.get('marker-fg-normal').layout['icon-size']],
    ['background', layers.get('marker-bg-normal').paint['circle-radius']],
    ['shadow', layers.get('marker-shadow').layout['icon-size']]
]) {
    let previous = sizeAt(expression, 20);
    for (let zoom = 19.75; zoom >= 0; zoom -= 0.25) {
        const size = sizeAt(expression, zoom);
        assert(size > 0 && size <= previous, `${name} must not grow on zoom-out at zoom ${zoom}`);
        previous = size;
    }
    assert(sizeAt(expression, 11.99) < sizeAt(expression, 12), `${name} shrinks below zoom 12`);
    assert(sizeAt(expression, 7) < sizeAt(expression, 10), `${name} continues shrinking at low zoom`);
}
console.log('PASS: favorite badges on icons and 3D objects, uncheck, and model fallback');
console.log('PASS: foreground, background and shadow never grow on zoom-out, including below zoom 12');
