const assert = require("assert");
const fs = require("fs");

const source = fs.readFileSync("lib/listtable.js", "utf8");
const config = fs.readFileSync("data/listtable.jsonc", "utf8");

assert.match(source, /value !== "" \|\| col\.preserveSpace === true/);
assert.match(config, /"id": "features"[\s\S]*?"preserveSpace": true/);
assert.match(config, /"id": "distance"[\s\S]*?"className": "col-3 text-end list-area-distance"/);

console.log("PASS: empty feature column preserves space before right-aligned distance");
