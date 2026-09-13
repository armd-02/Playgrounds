const assert = require("assert");
const fs = require("fs");

const html = fs.readFileSync("baselist.html", "utf8");
const css = fs.readFileSync("user.css", "utf8");
const actionContainer = html.match(/<div id="listActionButtons"[^>]*>/)?.[0] ?? "";
const searchContainer = html.match(/<!-- 検索 -->\s*<div[^>]*>/)?.[0] ?? "";

assert.match(searchContainer, /\bcol-6\b/);
assert.match(searchContainer, /\bcol-sm-7\b/);
assert.match(actionContainer, /\bcol-2\b/);
assert.match(actionContainer, /\bcol-sm-1\b/);
assert.match(css, /@media \(max-width: 575\.98px\)[\s\S]*?\.list-actions \.btn\s*\{[^}]*min-width:\s*44px;/);

console.log("PASS: mobile list action column and button have usable width");
