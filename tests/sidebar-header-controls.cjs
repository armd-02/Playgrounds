const assert = require("assert");
const fs = require("fs");

const html = fs.readFileSync("index.html", "utf8");
const winlib = fs.readFileSync("lib/winlib.js", "utf8");
const css = fs.readFileSync("system.css", "utf8");
const listHeader = html.match(/<h2[^>]+id="listHeader"[\s\S]*?<\/h2>/)?.[0] ?? "";

assert.ok(listHeader, "listHeader must exist");
assert.match(listHeader, /id="sidebarMinimize"/);
assert.match(listHeader, /id="sidebarChange"/);
assert.doesNotMatch(listHeader, /data-bs-toggle="collapse"/);
assert.doesNotMatch(html, /id="sidebarClose"/);
assert.match(html, /id="detailHeaderClose"/);
assert.match(winlib, /mode === "change" && this\.sidebarSize == 1 \? 2/);
assert.match(winlib, /mode === "mini" \? 1/);
assert.match(winlib, /case 1: btmWidth = 48/);
assert.match(winlib, /btmPane\.classList\.remove\("sidebar-minimized"\)/);
assert.match(css, /#bottom-pane\.sidebar-minimized\s*\{[\s\S]*?width:\s*48px\s*!important/);
assert.match(css, /#bottom-pane\.sidebar-minimized #sidebarMinimize\s*\{[\s\S]*?display:\s*none\s*!important/);
assert.doesNotMatch(winlib, /mapid\.animate\(/);
assert.match(winlib, /mapid\.style\.width = `\$\{maxWidth\}px`;[\s\S]*?mapLibre\.stop\(false\)/);
assert.match(winlib, /mapid\.style\.height = `\$\{maxHeight\}px`;[\s\S]*?mapLibre\.stop\(false\)/);

console.log("PASS: list header has minimize/maximize controls and detail retains close");
