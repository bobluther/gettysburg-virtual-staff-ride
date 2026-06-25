/* Generate a printable Facilitator Guide from the embedded content data. */
const fs=require("fs"),path=require("path");
const ROOT=path.dirname(__dirname);
const window={}; // shim
eval(fs.readFileSync(path.join(ROOT,"build","content.js"),"utf8"));
const GB=window.GB;
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

let body="";
GB.modules.forEach(m=>{
  const steps=GB.steps.filter(s=>s.m===m.id);
  body+=`<section class="mod"><h2>${esc(m.label)} <span class="dt">${esc(m.sub)}</span></h2>`;
  body+=`<p class="theme"><b>Theme:</b> ${esc(m.theme)}</p>`;
  body+=`<div class="obj"><b>Learning objectives</b><ul>${m.objectives.map(o=>`<li>${esc(o)}</li>`).join("")}</ul></div>`;
  body+=`<p class="stand"><b>Staff-ride linkage:</b> ${esc(m.stand)}</p>`;
  steps.forEach(s=>{
    if(s.decision){const d=s.decision;
      body+=`<div class="dp"><h3>⚔ Decision Point — ${esc(d.title)} <span class="who">(${esc(d.commander)}, ${d.side==="union"?"Union":d.side==="conf"?"Confederate":"either side"})</span></h3>`;
      body+=`<p class="sit">${esc(d.situation)}</p>`;
      body+=`<ul class="opts">${d.options.map(o=>`<li><b>${esc(o.ol)}</b> — ${esc(o.out)}</li>`).join("")}</ul>`;
      body+=`<p class="hist"><b>What happened:</b> ${esc(d.history)}</p>`;
      body+=`<p class="teach"><b>Teaching point:</b> ${esc(d.teach)}</p></div>`;
    }
    if(s.pause){const p=s.pause;
      body+=`<div class="pz"><h3>⏸ Discussion — ${esc(p.title)}</h3>`;
      if(p.before)body+=`<p class="lbl">Before the action:</p><ol>${p.before.map(q=>`<li>${esc(q)}</li>`).join("")}</ol>`;
      if(p.after)body+=`<p class="lbl">After the action:</p><ol>${p.after.map(q=>`<li>${esc(q)}</li>`).join("")}</ol>`;
      body+=`</div>`;
    }
  });
  body+=`</section>`;
});

const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Gettysburg Staff Ride — Facilitator Guide</title>
<style>
@page{margin:0.7in}
body{font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;max-width:7.2in;margin:0 auto;line-height:1.42;font-size:11pt}
h1{font-size:20pt;margin:0 0 2px;border-bottom:2px solid #7a1f1f;padding-bottom:6px}
.sub{color:#555;font-size:10pt;margin:0 0 16px;letter-spacing:.5px}
h2{font-size:14pt;color:#7a1f1f;margin:22px 0 4px;border-bottom:1px solid #ccc;padding-bottom:3px}
h2 .dt{font-size:10pt;color:#888;font-weight:normal}
h3{font-size:11.5pt;margin:12px 0 4px}
.who{font-weight:normal;color:#666;font-size:10pt}
.theme{margin:4px 0}
.obj,.stand{font-size:10.5pt}
.stand{background:#f3efe6;border-left:3px solid #7a6a3a;padding:5px 9px}
.dp{border:1px solid #d8d2c4;border-left:4px solid #b8860b;border-radius:5px;padding:8px 12px;margin:10px 0;background:#fbfaf6;break-inside:avoid}
.pz{border:1px solid #cdd8cd;border-left:4px solid #4a7a4a;border-radius:5px;padding:8px 12px;margin:10px 0;background:#f6faf6;break-inside:avoid}
.sit{font-style:italic;color:#333}
.opts li{margin:3px 0}
.hist{margin:6px 0 2px}.teach{margin:2px 0;color:#1a3a5a}
.lbl{font-weight:bold;margin:6px 0 2px;color:#4a7a4a}
ol,ul{margin:4px 0 4px 18px;padding:0}
ol li{margin:4px 0}
.foot{margin-top:24px;border-top:1px solid #ccc;padding-top:8px;font-size:9pt;color:#777}
section{break-inside:auto}
</style></head><body>
<h1>Battle of Gettysburg — Faculty Facilitator Guide</h1>
<p class="sub">Gettysburg Staff Ride · Decision Points, Discussion Questions &amp; Teaching Notes · Companion to the Staff Ride Simulator</p>
${body}
<p class="foot">Companion to the Gettysburg Staff Ride Simulator (single-file interactive). Historical interpretation synthesizes the standard accounts (OR; Coddington; Sears; Trudeau; NPS). Imagery in the simulator is public domain (Library of Congress / Wikimedia). Prepared for staff-ride preparation.</p>
</body></html>`;

const out=path.join(ROOT,"Gettysburg-Facilitator-Guide.html");
fs.writeFileSync(out,html);
console.log("Wrote",out,(fs.statSync(out).size/1024).toFixed(0)+"KB");
console.log("Modules:",GB.modules.length,"| Decisions:",GB.steps.filter(s=>s.decision).length,"| Discussion cards:",GB.steps.filter(s=>s.pause).length);
