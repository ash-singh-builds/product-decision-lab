const fs = require("node:fs"),
  cp = require("node:child_process"),
  path = require("node:path");
for (const f of fs.readdirSync("dist").filter((f) => f.endsWith(".js")))
  cp.execFileSync(process.execPath, ["--check", path.join("dist", f)]);
for (const file of ["index.html", "dist/index.html"]) {
  const base = path.dirname(file),
    html = fs.readFileSync(file, "utf8");
  for (const m of html.matchAll(/(?:src|href)="([^"#?]+)(?:\?[^\"]*)?"/g))
    if (!/^\w+:/.test(m[1]) && !fs.existsSync(path.resolve(base, m[1])))
      throw Error("Missing asset " + m[1]);
}
console.log("Static checks passed: JavaScript syntax and local asset paths.");
