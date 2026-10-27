const fs=require('node:fs');const cp=require('node:child_process');const path=require('node:path');
for(const f of ['dist/app.js','dist/engine.js','dist/v2/app.js','dist/v2/engine.js'])cp.execFileSync(process.execPath,['--check',f]);
for(const base of ['dist','dist/v2']){const html=fs.readFileSync(path.join(base,'index.html'),'utf8');for(const m of html.matchAll(/(?:src|href)="([^"#?]+)(?:\?[^\"]*)?"/g)){if(!m[1].includes('://')&&!fs.existsSync(path.resolve(base,m[1])))throw Error('Missing static asset '+m[1])}}
console.log('Static production check passed: syntax and local assets. No build step or backend required.');
