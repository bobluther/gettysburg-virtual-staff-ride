/* =====================================================================
   GETTYSBURG STAFF RIDE SIMULATOR — ENGINE
===================================================================== */
const SVGNS="http://www.w3.org/2000/svg";
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
function el(tag,attrs={},html){const e=document.createElement(tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(html!=null)e.innerHTML=html;return e;}
function S(tag,attrs={}){const e=document.createElementNS(SVGNS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);return e;}
function clear(n){while(n.firstChild)n.removeChild(n.firstChild);}
function poly(pts){return pts.map(p=>p.join(",")).join(" ");}
function toast(msg){let t=document.querySelector(".toast");if(t)t.remove();t=el("div",{class:"toast"});t.textContent=msg;document.body.appendChild(t);setTimeout(()=>{t&&t.remove();},2800);}

/* ---- Affine fit: schematic coords -> base-map pixel coords ---- */
function solve3(M,v){ // Gaussian elimination 3x3
  const A=M.map((r,i)=>r.concat(v[i]));
  for(let c=0;c<3;c++){let p=c;for(let r=c+1;r<3;r++)if(Math.abs(A[r][c])>Math.abs(A[p][c]))p=r;
    [A[c],A[p]]=[A[p],A[c]];const pv=A[c][c]||1e-9;
    for(let r=0;r<3;r++){if(r===c)continue;const f=A[r][c]/pv;for(let k=c;k<4;k++)A[r][k]-=f*A[c][k];}}
  return [A[0][3]/A[0][0],A[1][3]/A[1][1],A[2][3]/A[2][2]];
}
let AFF=null,AFFscale=1;
function fitAffine(){
  const an=GB.fieldAnchors;let Sxx=0,Sxy=0,Sx=0,Syy=0,Sy=0,n=an.length;
  let bxX=0,byX=0,bcX=0,bxY=0,byY=0,bcY=0;
  an.forEach(a=>{const[ox,oy]=a.o,[nx,ny]=a.n;
    Sxx+=ox*ox;Sxy+=ox*oy;Sx+=ox;Syy+=oy*oy;Sy+=oy;
    bxX+=ox*nx;byX+=oy*nx;bcX+=nx;bxY+=ox*ny;byY+=oy*ny;bcY+=ny;});
  const M=[[Sxx,Sxy,Sx],[Sxy,Syy,Sy],[Sx,Sy,n]];
  const X=solve3(M,[bxX,byX,bcX]),Y=solve3(M,[bxY,byY,bcY]);
  AFF={a:X[0],b:X[1],c:X[2],d:Y[0],e:Y[1],f:Y[2]};
  AFFscale=Math.sqrt(Math.abs(AFF.a*AFF.e-AFF.b*AFF.d))||1;
}
function T(x,y){if(!AFF)fitAffine();return [AFF.a*x+AFF.b*y+AFF.c, AFF.d*x+AFF.e*y+AFF.f];}
function clampN(v,lo,hi){return v<lo?lo:(v>hi?hi:v);}
function TC(x,y){const p=T(x,y),W=GB.fieldBase.w,H=GB.fieldBase.h;return [clampN(p[0],12,W-12),clampN(p[1],12,H-12)];}
/* Auto-frame the SVG viewBox to the current step's action (field maps only) */
function frameField(s){
  const W=GB.fieldBase.w,H=GB.fieldBase.h,pts=[];
  (s.units||[]).forEach(u=>pts.push(TC(u.x,u.y)));
  (s.arrows||[]).forEach(a=>{pts.push(TC(a.from[0],a.from[1]));pts.push(TC(a.to[0],a.to[1]));});
  (s.hotspots||[]).forEach(k=>{const h=GB.hotspotPos[k];if(h)pts.push(TC(h.x,h.y));});
  if(!pts.length){svg.setAttribute("viewBox",`0 0 ${W} ${H}`);return;}
  let xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
  let minx=Math.min.apply(0,xs),maxx=Math.max.apply(0,xs),miny=Math.min.apply(0,ys),maxy=Math.max.apply(0,ys);
  const bw=maxx-minx,bh=maxy-miny,padx=bw*0.38+150,pady=bh*0.38+150;
  minx=Math.max(0,minx-padx);miny=Math.max(0,miny-pady);maxx=Math.min(W,maxx+padx);maxy=Math.min(H,maxy+pady);
  if(window.__mobile){ const fh=maxy-miny; maxy=Math.min(H, maxy + fh*0.30); } // leave room at the bottom for the caption band
  svg.setAttribute("viewBox",`${minx} ${miny} ${maxx-minx} ${maxy-miny}`);
}

/* Image with silhouette fallback */
const SILHOUETTE="data:image/svg+xml;base64,"+btoa(
 `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='200' height='200' fill='#1a212c'/><circle cx='100' cy='78' r='34' fill='#3a4654'/><path d='M40 180 q60-70 120 0' fill='#3a4654'/><text x='100' y='195' font-size='11' fill='#7a8494' text-anchor='middle' font-family='sans-serif'>no period image</text></svg>`);
function img(key){return (window.GBASSETS&&GBASSETS[key])?GBASSETS[key]:SILHOUETTE;}
function hasImg(key){return !!(window.GBASSETS&&GBASSETS[key]);}

/* ---------------- State ---------------- */
const state={mode:"command",side:"union",i:0,playing:false,timer:null,
  layers:new Set(["relief","units","labels","photos","oplines"]),
  decided:{}, tab:"brief", view:1, panX:0, panY:0};

const STEPS=GB.steps, MODS=GB.modules;
const modIndex=Object.fromEntries(MODS.map((m,i)=>[m.id,i]));
function modFirstStep(id){return STEPS.findIndex(s=>s.m===id);}
function curStep(){return STEPS[state.i];}
function curMod(){return MODS[modIndex[curStep().m]];}

/* ---------------- LAYER config ---------------- */
const LAYERS=[
 {id:"relief",label:"Relief (hill-shading)",sw:"#9a9a9a"},
 {id:"flora",label:"Woods / Line-of-Sight",sw:"#2f5a2f"},
 {id:"keyterrain",label:"Key Terrain (KOCOA)",sw:"#c9a14a"},
 {id:"oplines",label:"Operational Graphics (Lines & Avenues)",sw:"#1f4e79"},
 {id:"hexgrid",label:"Hex Grid (~300 m · movement)",sw:"#e7d9ad"},
 {id:"units",label:"Units & Movement",sw:"#2f6fb0"},
 {id:"labels",label:"Map Labels",sw:"#d8cfae"},
 {id:"photos",label:"Photo Markers",sw:"#c9a14a"},
 {id:"monuments",label:"Monuments",sw:"#b8bcc4"},
];

/* =====================================================================
   MAP RENDERING
===================================================================== */
const svg=$("#mapSvg");
let G={}; // layer groups

function rebuildMapSkeleton(kind){
  clear(svg); G={};
  svg.setAttribute("viewBox", kind==="field" ? `0 0 ${GB.fieldBase.w} ${GB.fieldBase.h}` : "0 0 1000 800");
  const root=S("g",{id:"vp"}); svg.appendChild(root); G.root=root;
  ["base","hsover","floraover","relief","woods","water","roads","town","koca","hexgrid","iconic","oplines","labels","arrows","units","hotspots","stands"]
    .forEach(n=>{const g=S("g",{class:"layer-"+n});root.appendChild(g);G[n]=g;});
  if(kind==="field") drawFieldBase(); else drawCampaign();
  applyView();
}

function drawFieldBase(){
  fitAffine();
  const B=GB.fieldBase;
  const im=S("image",{x:0,y:0,width:B.w,height:B.h,preserveAspectRatio:"none"});
  im.setAttributeNS("http://www.w3.org/1999/xlink","href",img(B.key));
  im.setAttribute("href",img(B.key));
  G.base.appendChild(im);
  G.base.appendChild(S("rect",{x:0,y:0,width:B.w,height:B.h,fill:"none",stroke:"#000","stroke-width":2,opacity:.25}));
  // shaded-relief overlay (multiply blend makes elevation read in 2D)
  if(hasImg("hillshade")){const hs=S("image",{x:0,y:0,width:B.w,height:B.h,preserveAspectRatio:"none",opacity:0.62});
    hs.setAttribute("href",img("hillshade"));hs.style.mixBlendMode="multiply";G.hsover.appendChild(hs);}
  // 1863 woodland / line-of-sight overlay
  if(hasImg("woods")){const fl=S("image",{x:0,y:0,width:B.w,height:B.h,preserveAspectRatio:"none",opacity:0.62});
    fl.setAttribute("href",img("woods"));G.floraover.appendChild(fl);}
  // KOCOA key-terrain highlights (schematic hill centers transformed onto map)
  const keyNames={"Cemetery Hill":1,"Culp's Hill":1,"Little Round Top":1,"Big Round Top":1};
  GB.terrain.hills.forEach(h=>{ if(!keyNames[h.name])return;
    const p=T(h.x,h.y), r=Math.max(26,h.r*AFFscale*1.15);
    G.koca.appendChild(S("ellipse",{cx:p[0],cy:p[1],rx:r,ry:r*0.82,fill:"#c9a14a",opacity:0.16,
      stroke:"#e7b955","stroke-width":2,"stroke-dasharray":"6 4"}));
    const t=S("text",{x:p[0],y:p[1]-r-5,"text-anchor":"middle",fill:"#ffd874","font-size":14,
      "font-weight":"700","letter-spacing":"1px","paint-order":"stroke",stroke:"#000","stroke-width":3.4});
    t.textContent="◆ "+h.name.toUpperCase();G.koca.appendChild(t);
  });
  // permanent town label only; per-phase iconic spots carry their own labels
  const showL={"GETTYSBURG":1};
  GB.terrain.labels.forEach(l=>{ if(!showL[l.t])return;
    const p=T(l.x,l.y);
    const t=S("text",{x:p[0],y:p[1],"text-anchor":"middle","font-family":"var(--serif)",
      "font-size":l.big?18:13,"font-weight":"700","letter-spacing":l.big?"2px":"0.5px",
      fill:"#0e2240","paint-order":"stroke",stroke:"#f7f1df","stroke-width":l.big?4:3.4});
    t.textContent=l.t;G.labels.appendChild(t);
  });
  drawOpLines();
  drawHexGrid();
}

/* =====================================================================
   OPERATIONAL GRAPHICS — the fishhook line, the Confederate line, and
   the per-day avenues of approach (large main-attack arrows). Drawn ONCE
   into G.oplines (static, persists behind the animated per-beat arrows).
   All control points are in schematic space → pushed through TC().
===================================================================== */
// Catmull-Rom → cubic Bézier: smooth open curve through pts (pixel space)
function smoothPath(pts){
  if(pts.length<2)return "";
  if(pts.length===2)return `M${pts[0][0]},${pts[0][1]} L${pts[1][0]},${pts[1][1]}`;
  let d=`M${pts[0][0]},${pts[0][1]}`;
  for(let i=0;i<pts.length-1;i++){
    const p0=pts[i-1]||pts[i], p1=pts[i], p2=pts[i+1], p3=pts[i+2]||p2;
    const c1x=p1[0]+(p2[0]-p0[0])/6, c1y=p1[1]+(p2[1]-p0[1])/6;
    const c2x=p2[0]-(p3[0]-p1[0])/6, c2y=p2[1]-(p3[1]-p1[1])/6;
    d+=` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}
// A heavy battle-line with a parchment casing under it so it reads on the relief base.
function opLine(schemPts,color,op){
  const px=schemPts.map(p=>TC(p[0],p[1])), d=smoothPath(px);
  const g=S("g",{});
  g.appendChild(S("path",{d,fill:"none",stroke:"#f7f1df","stroke-width":24,opacity:.6,"stroke-linecap":"round","stroke-linejoin":"round"}));
  g.appendChild(S("path",{d,fill:"none",stroke:color,"stroke-width":15,opacity:op==null?1:op,"stroke-linecap":"round","stroke-linejoin":"round"}));
  return g;
}
// Large hollow "main attack" axis arrow (distinct from the thin animated makeArrow).
function makeAxisArrow(side,fromS,toS,lbl){
  axisDefs();
  const col=side==="union"?"#1f4e79":"#8c2b27";
  const mk=side==="union"?"url(#axU)":"url(#axC)";
  const [x1,y1]=TC(fromS[0],fromS[1]),[x2,y2]=TC(toS[0],toS[1]);
  const mx=(x1+x2)/2+(y2-y1)*0.14, my=(y1+y2)/2-(x2-x1)*0.14;
  const g=S("g",{});
  g.appendChild(S("path",{d:`M${x1},${y1} Q${mx},${my} ${x2},${y2}`,fill:"none",
    stroke:"#f7f1df","stroke-width":36,opacity:.5,"stroke-linecap":"round"})); // casing for contrast on the relief base
  g.appendChild(S("path",{d:`M${x1},${y1} Q${mx},${my} ${x2},${y2}`,fill:"none",
    stroke:col,"stroke-width":27,opacity:.94,"stroke-linecap":"round","marker-end":mk}));
  if(lbl){const t=S("text",{x:mx,y:my-14,"text-anchor":"middle",fill:col,"font-size":22,"font-weight":"800","letter-spacing":"1px"});
    t.setAttribute("paint-order","stroke");t.setAttribute("stroke","#f7f1df");t.setAttribute("stroke-width","4");
    t.textContent=lbl;g.appendChild(t);}
  return g;
}
let _axisDefsDone=false;
function axisDefs(){ if(_axisDefsDone)return; _axisDefsDone=true;
  let defs=svg.querySelector("defs#axisdefs"); if(!defs){defs=S("defs",{id:"axisdefs"});svg.appendChild(defs);}
  [["axU","#1f4e79"],["axC","#8c2b27"]].forEach(([id,c])=>{
    const m=S("marker",{id,markerWidth:9,markerHeight:9,refX:5,refY:4.5,orient:"auto",markerUnits:"strokeWidth"});
    m.appendChild(S("path",{d:"M0,0 L9,4.5 L0,9 L2.6,4.5 Z",fill:c}));
    defs.appendChild(m);});
}
// The avenues, each tied to the STAND(S) where its action occurs (space-separated).
// Gating is by stand, not by day, so no future arrows clutter the present moment.
const OP_AVENUES=[
  {stands:"mcpherson",        side:"conf",from:[276,330],to:[330,300],lbl:"HETH"},
  {stands:"oakhill",          side:"conf",from:[446,250],to:[472,332],lbl:"RODES"},
  {stands:"barlow",           side:"conf",from:[612,232],to:[528,366],lbl:"EARLY"},
  {stands:"devilsden lrt",    side:"conf",from:[436,612],to:[512,598],lbl:"HOOD"},
  {stands:"peachorchard wheatfield",side:"conf",from:[388,558],to:[452,552],lbl:"McLAWS"},
  {stands:"plumrun cemetery", side:"conf",from:[396,470],to:[498,470],lbl:"ANDERSON"},
  {stands:"angle pamemorial", side:"conf",from:[398,472],to:[498,470],lbl:"PICKETT"},
  {stands:"angle",            side:"conf",from:[404,432],to:[500,466],lbl:"PETTIGREW"},
  {stands:"culps",            side:"conf",from:[622,420],to:[582,408],lbl:"JOHNSON"},
];
const UNION_FISHHOOK=[[600,452],[576,408],[522,374],[520,392],[508,448],[500,470],[500,506],[506,566],[514,600],[524,662]];
const CONF_LINE=[[446,250],[430,300],[404,330],[398,410],[396,470],[392,490],[388,560],[436,610]];
// LIMIT OF ADVANCE (LOA) — the forward-most ground each assault reached before it was stopped. A doctrinal
// control measure (amber, dashed) that frames the counters and shows the culmination point in space.
const OP_LOA=[
  {stands:"angle pamemorial", pts:[[486,448],[494,464],[500,481]],                 lbl:"HIGH-WATER MARK"},
  {stands:"lrt devilsden",    pts:[[488,606],[514,599],[542,591],[568,587]],       lbl:"LITTLE ROUND TOP — HELD"},
  {stands:"peachorchard",     pts:[[410,506],[428,522],[440,544]],                 lbl:"PEACH ORCHARD SALIENT"},
  {stands:"wheatfield",       pts:[[436,536],[458,548],[474,562]],                 lbl:"WHEATFIELD"},
  {stands:"barlow",           pts:[[514,294],[530,312],[544,332]],                 lbl:"BARLOW'S KNOLL"},
  {stands:"cemhill",          pts:[[486,352],[506,366],[522,384]],                 lbl:"DAY 1 — CONFEDERATE LIMIT"},
];
function makeLOA(pts,lbl){
  const px=pts.map(p=>TC(p[0],p[1])), d=smoothPath(px);
  const g=S("g",{});
  g.appendChild(S("path",{d,fill:"none",stroke:"#1a120a","stroke-width":12,opacity:.5,"stroke-linecap":"round"}));     // dark casing for contrast
  g.appendChild(S("path",{d,fill:"none",stroke:"#f0c54e","stroke-width":6,"stroke-dasharray":"1.5 8","stroke-linecap":"round"})); // amber dotted LOA control measure
  const mid=px[Math.floor(px.length/2)];
  const t=S("text",{x:mid[0]+9,y:mid[1]-11,"text-anchor":"start",fill:"#f3cf6e","font-size":16,"font-weight":"800","letter-spacing":".4px"});
  t.setAttribute("paint-order","stroke");t.setAttribute("stroke","#1a120a");t.setAttribute("stroke-width","4.5");
  t.textContent="LOA · "+lbl; g.appendChild(t);
  return g;
}
function drawOpLines(){
  if(!G.oplines)return; clear(G.oplines); _axisDefsDone=false;
  // static lines (the held positions — always visible when the layer is on)
  const uf=opLine(UNION_FISHHOOK,"#1f4e79",1); uf.setAttribute("data-op","static"); G.oplines.appendChild(uf);
  const cf=opLine(CONF_LINE,"#8c2b27",.92); cf.setAttribute("data-op","static"); G.oplines.appendChild(cf);
  // avenues (stand-gated)
  OP_AVENUES.forEach(a=>{const g=makeAxisArrow(a.side,a.from,a.to,a.lbl); g.setAttribute("data-stand",a.stands); g.setAttribute("data-op","avenue"); G.oplines.appendChild(g);});
  // limits of advance (stand-gated) — the culmination ground
  OP_LOA.forEach(a=>{const g=makeLOA(a.pts,a.lbl); g.setAttribute("data-stand",a.stands); g.setAttribute("data-op","loa"); G.oplines.appendChild(g);});
  setOpLineFocus(curStandId, curStandId?"focus":"overall");
}
// 'focus'   (zoomed into a stand)  → ONLY this stand's avenue, bright. The present action only.
// 'wide'    (establishing shot)    → this stand's avenue bright + already-seen ones faint; no future.
// 'overall' (whole battlefield)    → ALL primary avenues, faint — the complete scheme.
// The Day-1 meeting engagement west of town happened BEFORE the fishhook / Seminary Ridge lines
// formed, so the held-position lines are anachronistic there. Show them from the rally onward (and at overall).
const PRELINE_STANDS={mcpherson:1,oakhill:1,barlow:1};
function setOpLineFocus(standId,mode){
  if(!G.oplines)return;
  const showStatic=(mode==='overall')||!PRELINE_STANDS[standId];
  G.oplines.querySelectorAll('[data-op="static"]').forEach(g=>{ g.style.display=showStatic?"":"none"; });
  G.oplines.querySelectorAll('[data-op="avenue"]').forEach(g=>{
    if(mode==='overall'){ g.style.display=""; g.style.opacity=".85"; return; }
    if(mode!=='wide'){ g.style.display="none"; return; } // focus → the live movement carries it; no big static arrow parked on the stand
    const sts=(g.getAttribute("data-stand")||"").split(" ");
    const isCur = standId && sts.indexOf(standId)>=0;
    const isPast = !isCur && state.visited && sts.some(s=>state.visited.has(s));
    if(isCur){ g.style.display=""; g.style.opacity="1"; }
    else if(isPast){ g.style.display=""; g.style.opacity=".26"; }
    else { g.style.display="none"; }
  });
  // limit-of-advance lines: shown AT the stand (a static reference of how far the assault got)
  G.oplines.querySelectorAll('[data-op="loa"]').forEach(g=>{
    const sts=(g.getAttribute("data-stand")||"").split(" "), isCur=standId && sts.indexOf(standId)>=0;
    if(mode==='overall'){ g.style.display=""; g.style.opacity=".6"; }
    else if(isCur){ g.style.display=""; g.style.opacity="1"; }
    else if(mode==='wide' && state.visited && sts.some(s=>state.visited.has(s))){ g.style.display=""; g.style.opacity=".3"; }
    else { g.style.display="none"; }
  });
}

// =====================================================================
//  HEX GRID — ~300 m flat-top hexes on axial (q,r) coords. The discrete
//  substrate: one unit per hex (no stacking by construction), hex-to-hex
//  movement, and the basis for the later war game. Phase 1 = the grid.
// =====================================================================
// Hexes are built in the rendered PIXEL space (the map's own coordinates) with a y-stretch (yk) that compensates
// for the map's non-uniform x/y scale, so each hex covers roughly equal GROUND (~300 m) and renders as a clean hex.
const HEX={ R:46, yk:1.0, ox:96, oy:236, qMin:-3, qMax:18, rMin:-14, rMax:32 }; // R sized so a unit counter (~68px) nests inside with margin → counters never overlap between adjacent hexes
function hexCenter(q,r){ return [ HEX.ox + 1.5*HEX.R*q, HEX.oy + Math.sqrt(3)*HEX.R*HEX.yk*(r + q/2) ]; } // axial → pixel
function hexRound(qf,rf){ let x=qf, z=rf, y=-x-z, rx=Math.round(x), ry=Math.round(y), rz=Math.round(z);
  const dx=Math.abs(rx-x), dy=Math.abs(ry-y), dz=Math.abs(rz-z);
  if(dx>dy&&dx>dz) rx=-ry-rz; else if(dy>dz) ry=-rx-rz; else rz=-rx-ry; return [rx,rz]; }
function pixelToHex(px,py){ const q=(px-HEX.ox)/(1.5*HEX.R), r=(py-HEX.oy)/(Math.sqrt(3)*HEX.R*HEX.yk)-q/2; return hexRound(q,r); }
function schematicToHex(x,y){ const p=TC(x,y); return pixelToHex(p[0],p[1]); }   // unit (schematic) → hex
function hexCenterPx(q,r){ return hexCenter(q,r); }                              // already pixel
function hexPolyPx(q,r){ const c=hexCenter(q,r), pts=[];
  for(let i=0;i<6;i++){ const a=Math.PI/3*i; pts.push([c[0]+HEX.R*Math.cos(a), c[1]+HEX.R*HEX.yk*Math.sin(a)]); } return pts; }
function eachHex(fn){ for(let q=HEX.qMin;q<=HEX.qMax;q++)for(let r=HEX.rMin;r<=HEX.rMax;r++){
  const c=hexCenter(q,r); if(c[0]<40||c[0]>1180||c[1]<200||c[1]>2470)continue; fn(q,r,c); } } // clip to the battlefield
function drawHexGrid(){
  if(!G.hexgrid)return; clear(G.hexgrid);
  eachHex((q,r)=>{ const pts=hexPolyPx(q,r), d=pts.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+","+p[1].toFixed(1)).join(" ")+"Z";
    G.hexgrid.appendChild(S("path",{d,fill:"none",stroke:"#0d1117","stroke-width":5,opacity:.42}));   // dark casing for contrast
    G.hexgrid.appendChild(S("path",{d,fill:"none",stroke:"#ffe7a0","stroke-width":2.4,opacity:.6})); });
}
window.HEX=HEX; window.schematicToHex=schematicToHex; window.hexCenter=hexCenter; window.hexCenterPx=hexCenterPx;

// --- Hex occupancy: snap every counter onto a UNIQUE hex (one per hex) → no overlap, no unit shoved into the
//     enemy by a declutter heuristic; each unit sits on the hex its position falls in, or the nearest free one. ---
const HEXDIRS=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];
function hexRing(c,radius){ const out=[]; let q=c[0]+HEXDIRS[4][0]*radius, r=c[1]+HEXDIRS[4][1]*radius;
  for(let i=0;i<6;i++)for(let j=0;j<radius;j++){ out.push([q,r]); q+=HEXDIRS[i][0]; r+=HEXDIRS[i][1]; } return out; }
function nearestFreeHex(h,occ){ if(!occ.has(h[0]+","+h[1]))return h;
  for(let rad=1;rad<10;rad++){ for(const c of hexRing(h,rad)) if(!occ.has(c[0]+","+c[1]))return c; } return h; }
function hexDist(a,b){ return (Math.abs(a[0]-b[0])+Math.abs(a[0]+a[1]-b[0]-b[1])+Math.abs(a[1]-b[1]))/2; }
function hexNeighbors(h){ return HEXDIRS.map(d=>[h[0]+d[0],h[1]+d[1]]); }
// Greedy best-first path start→goal over the hex grid, routing AROUND blocked (occupied) hexes — so a maneuvering
// counter never slides through a hex another unit holds (kills the "Gamble over Archer" path-crossing for good).
function hexPath(start,goal,blocked){ const key=h=>h[0]+","+h[1];
  if(key(start)===key(goal))return [start];
  let frontier=[start]; const came={}; came[key(start)]=null; const seen=new Set([key(start)]); let found=false;
  for(let it=0; it<1500 && frontier.length; it++){ frontier.sort((a,b)=>hexDist(a,goal)-hexDist(b,goal)); const cur=frontier.shift();
    if(key(cur)===key(goal)){found=true;break;}
    for(const nb of hexNeighbors(cur)){ const k=key(nb); if(seen.has(k))continue; if(blocked.has(k)&&k!==key(goal))continue; seen.add(k); came[k]=cur; frontier.push(nb); } }
  if(!found)return [start,goal];
  const path=[]; let c=goal; while(c){ path.unshift(c); c=came[key(c)]; } return path; }
function snapAllToHexes(){
  if(!G.units)return;
  const named=[...G.units.querySelectorAll(".unit")].filter(g=>g.style.display!=="none");
  const toks=G.arrows?[...G.arrows.querySelectorAll(".unit")].filter(g=>g.style.display!=="none"):[];
  // claim hexes in order of how STILL a counter is: stationary defenders take their hex first; movers/tokens take the nearest free one
  const all=named.concat(toks).map(g=>{ const p=curXY(g), ox=+g.getAttribute("data-ox"), oy=+g.getAttribute("data-oy"), isTok=!g.getAttribute("data-name");
    return {g,p,sc:+(g.getAttribute("data-sc")||2), disp:isTok?9e9:(isNaN(ox)?0:Math.hypot(p[0]-ox,p[1]-oy))}; });
  all.sort((a,b)=>a.disp-b.disp);
  const occ=new Set();
  all.forEach(o=>{ const fh=nearestFreeHex(pixelToHex(o.p[0],o.p[1]),occ); occ.add(fh[0]+","+fh[1]);
    const c=hexCenterPx(fh[0],fh[1]); setUnitPos(o.g,Math.round(c[0]),Math.round(c[1]),o.sc); });
}
// During a glide, keep the MOVING counter clear of any other counter it passes (the path routes around held hexes;
// this handles the brief geometric close-pass between adjacent hexes so counters never visibly overlap in motion).
function clearMover(mover){ if(!mover)return; const p=curXY(mover), sc=+(mover.getAttribute("data-sc")||2); let dx=0,dy=0; const minD=64;
  const others=[...G.units.querySelectorAll(".unit")]; if(G.arrows)others.push(...G.arrows.querySelectorAll(".unit"));
  others.forEach(g=>{ if(g===mover||g.style.display==="none")return; const q=curXY(g), ex=p[0]-q[0], ey=p[1]-q[1], d=Math.hypot(ex,ey)||1;
    if(d<minD){ const k=(minD-d); dx+=ex/d*k; dy+=ey/d*k; } });
  if(dx||dy)setUnitPos(mover,Math.round(p[0]+dx),Math.round(p[1]+dy),sc);
}

function drawField(){
  const T=GB.terrain;
  // elevation relief: ridges as soft strokes, hills as radial gradients
  const defs=S("defs");svg.appendChild(defs);
  const grad=S("radialGradient",{id:"hillg"});
  grad.appendChild(S("stop",{offset:"0%","stop-color":"#5b6431"}));
  grad.appendChild(S("stop",{offset:"100%","stop-color":"#2c3420","stop-opacity":"0"}));
  defs.appendChild(grad);
  // backdrop
  G.relief.appendChild(S("rect",{x:0,y:0,width:1000,height:800,fill:"#11160f"}));
  T.ridges.forEach(r=>{
    const c=["#3a431f","#48531f","#5a6620"][Math.min(r.elev,2)];
    G.relief.appendChild(S("polyline",{points:poly(r.pts),fill:"none",stroke:c,
      "stroke-width":r.w,"stroke-linecap":"round","stroke-linejoin":"round",opacity:.55}));
    G.relief.appendChild(S("polyline",{points:poly(r.pts),fill:"none",stroke:"#727b3a",
      "stroke-width":2,"stroke-linecap":"round","stroke-dasharray":"1 7",opacity:.7}));
  });
  T.hills.forEach(h=>{
    G.relief.appendChild(S("circle",{cx:h.x,cy:h.y,r:h.r+10,fill:"url(#hillg)"}));
    G.relief.appendChild(S("circle",{cx:h.x,cy:h.y,r:h.r,fill:"none",
      stroke:"#7c863f",opacity:.6,"stroke-width":1.4,"stroke-dasharray":"2 4"}));
    if(h.wooded){}
  });
  // woods
  T.woods.forEach(w=>{
    G.woods.appendChild(S("polygon",{points:poly(w.pts),fill:"#22331b",
      stroke:"#33491f","stroke-width":1,opacity:.85}));
  });
  // water
  T.water.forEach(w=>{
    G.water.appendChild(S("polyline",{points:poly(w.pts),fill:"none",stroke:"#3f6f86",
      "stroke-width":3.2,"stroke-linecap":"round",opacity:.9}));
  });
  // town
  G.town.appendChild(S("polygon",{points:poly(T.town.pts),fill:"#403a32",
    stroke:"#5e564a","stroke-width":1.4}));
  for(let gx=0;gx<5;gx++){const x=474+gx*16;
    G.town.appendChild(S("line",{x1:x,y1:302,x2:x,y2:358,stroke:"#5e564a",opacity:.5,"stroke-width":.7}));}
  // roads
  T.roads.forEach(r=>{
    G.roads.appendChild(S("polyline",{points:poly(r.pts),fill:"none",stroke:"#6f6044",
      "stroke-width":3,"stroke-linecap":"round",opacity:.95}));
    G.roads.appendChild(S("polyline",{points:poly(r.pts),fill:"none",stroke:"#9c8a63",
      "stroke-width":1,"stroke-dasharray":"6 6",opacity:.8}));
    const mid=r.pts[Math.floor(r.pts.length/2)];
    const lab=S("text",{x:mid[0],y:mid[1]-4,class:"road-label","text-anchor":"middle"});
    lab.textContent=r.lbl;G.roads.appendChild(lab);
  });
  // KOCOA key terrain markers
  T.keyTerrain.forEach(k=>{
    const g=S("g",{});
    g.appendChild(S("rect",{x:k.x-30,y:k.y-h0,width:60,height:13,rx:3,fill:"#15110a",
      stroke:"#c9a14a","stroke-width":.8,opacity:.92,transform:`translate(0,${-k.r0||-40})`}));
    G.koca.appendChild(g);
  });
  // simpler KOCOA tags
  clear(G.koca);
  T.keyTerrain.forEach(k=>{
    const tg=S("text",{x:k.x,y:k.y-30,"text-anchor":"middle",fill:"#e7b955",
      "font-size":8.5,"font-weight":"700","letter-spacing":"1px"});
    tg.textContent="◆ KEY TERRAIN";
    tg.setAttribute("paint-order","stroke");tg.setAttribute("stroke","#000a");tg.setAttribute("stroke-width","2.4");
    G.koca.appendChild(tg);
  });
  // labels
  T.labels.forEach(l=>{
    const t=S("text",{x:l.x,y:l.y,"text-anchor":"middle",
      class:"map-feature-label"+(l.sm?" sm":"")+(l.water?"":"")});
    if(l.water)t.setAttribute("fill","#8fc6dc");
    if(l.big){t.setAttribute("font-size","15");t.setAttribute("letter-spacing","2px");}
    t.textContent=l.t;t.dataset.water=l.water?1:0;
    G.labels.appendChild(t);
  });
}
const h0=40;

function drawCampaign(){
  const C=GB.campaign,bb=C.bbox;
  const midlat=(bb.S+bb.N)/2, kx=Math.cos(midlat*Math.PI/180);
  const lonSpan=(bb.E-bb.W)*kx, latSpan=(bb.N-bb.S);
  const M=58, AW=1000-2*M, AH=800-2*M, sc=Math.min(AW/lonSpan,AH/latSpan);
  const ox=(1000-lonSpan*sc)/2, oy=(800-latSpan*sc)/2;
  const P=(lon,lat)=>[ox+(lon-bb.W)*kx*sc, oy+(bb.N-lat)*sc];
  C._proj=P;
  const defs=S("defs");svg.appendChild(defs);
  const grd=S("radialGradient",{id:"parch",cx:"45%",cy:"38%",r:"85%"});
  grd.appendChild(S("stop",{offset:"0%","stop-color":"#efe5cb"}));
  grd.appendChild(S("stop",{offset:"72%","stop-color":"#e3d3ad"}));
  grd.appendChild(S("stop",{offset:"100%","stop-color":"#cdb98c"}));
  defs.appendChild(grd);
  G.relief.appendChild(S("rect",{x:0,y:0,width:1000,height:800,fill:"url(#parch)"}));
  G.relief.appendChild(S("rect",{x:7,y:7,width:986,height:786,rx:5,fill:"none",stroke:"#9c8559","stroke-width":2}));
  // PA tint above the Mason–Dixon line
  const md=P(bb.W,39.72), md2=P(bb.E,39.72);
  G.relief.appendChild(S("rect",{x:0,y:0,width:1000,height:Math.max(0,md[1]),fill:"#9fb07a",opacity:.15}));
  // Blue Ridge / South Mountain
  const rp=C.ridge.pts.map(p=>P(p[0],p[1]));
  G.relief.appendChild(S("polyline",{points:poly(rp),fill:"none",stroke:"#9aa06a","stroke-width":15,"stroke-linecap":"round",opacity:.55}));
  G.relief.appendChild(S("polyline",{points:poly(rp),fill:"none",stroke:"#727a45","stroke-width":2,"stroke-dasharray":"2 6","stroke-linecap":"round",opacity:.8}));
  const rl=S("text",{x:rp[2][0]-8,y:rp[2][1],fill:"#5f6a3a","font-size":11,"font-style":"italic","transform":`rotate(60 ${rp[2][0]-8} ${rp[2][1]})`});
  rl.textContent="Blue Ridge / South Mtn.";G.relief.appendChild(rl);
  // Mason–Dixon line
  G.relief.appendChild(S("line",{x1:md[0],y1:md[1],x2:md2[0],y2:md2[1],stroke:"#7a1f1f","stroke-width":1.1,"stroke-dasharray":"7 5",opacity:.55}));
  const ml=S("text",{x:md[0]+10,y:md[1]-5,fill:"#7a1f1f","font-size":10,"font-style":"italic"});ml.textContent="Mason–Dixon Line  ·  Pa. / Md.";G.relief.appendChild(ml);
  const ttl=S("text",{x:22,y:36,"font-family":"var(--serif)","font-size":15,"font-weight":"700",fill:"#7a1f1f","letter-spacing":"1px"});
  ttl.textContent="THE GETTYSBURG CAMPAIGN · JUNE 1863";G.relief.appendChild(ttl);
  // rivers
  C.rivers.forEach(r=>{const pts=r.pts.map(p=>P(p[0],p[1]));
    G.water.appendChild(S("polyline",{points:poly(pts),fill:"none",stroke:"#6f97ae","stroke-width":3.4,"stroke-linecap":"round","stroke-linejoin":"round",opacity:.85}));
    const m=pts[Math.floor(pts.length/2)];
    const t=S("text",{x:m[0]+5,y:m[1]-5,fill:"#3f6f86","font-size":10,"font-style":"italic","paint-order":"stroke",stroke:"#efe5cb","stroke-width":2});
    t.textContent=r.name;G.water.appendChild(t);});
  // cities (true lat/lon)
  C.cities.forEach(p=>{const xy=P(p.lon,p.lat),g=S("g",{});
    if(p.fight){g.appendChild(S("path",{d:starPath(xy[0],xy[1],p.big?9:7,p.big?4.2:3.3,5),fill:"#c41e2a",stroke:"#4a0d10","stroke-width":1}));}
    else if(p.cap){g.appendChild(S("rect",{x:xy[0]-4.5,y:xy[1]-4.5,width:9,height:9,fill:"#362c1c",stroke:"#0c0a06","stroke-width":.9}));}
    else{g.appendChild(S("circle",{cx:xy[0],cy:xy[1],r:3.4,fill:"#362c1c"}));}
    const t=S("text",{x:xy[0]+9,y:xy[1]+4,"text-anchor":"start","font-family":"var(--serif)","font-weight":p.big?"700":"600","font-size":p.big?15:11.5,fill:p.big?"#7a1f1f":"#2a2114","paint-order":"stroke",stroke:"#efe5cb","stroke-width":2.6,"letter-spacing":p.big?"0.5px":"0"});
    t.textContent=p.t;g.appendChild(t);
    G.town.appendChild(g);});
}
function starPath(cx,cy,R,r,n){let d="";for(let i=0;i<n*2;i++){const ang=Math.PI/n*i-Math.PI/2;const rad=i%2?r:R;d+=(i?"L":"M")+(cx+rad*Math.cos(ang)).toFixed(1)+","+(cy+rad*Math.sin(ang)).toFixed(1);}return d+"Z";}

/* ---------- Unit symbols (hybrid APP-6D) ---------- */
const ECH={army:"XXXX",corps:"XXX",div:"XX",bde:"X",reg:"III",cav:"XX",arty:"XX"};
function unitColors(side){return side==="union"?{fill:"#21466b",stroke:"#5b9bd6",ink:"#dcebfb"}:{fill:"#6e2620",stroke:"#d97a72",ink:"#f6ddd6"};}
function unitDefs(){ if(svg.querySelector("#unitdefs"))return;
  const defs=S("defs",{id:"unitdefs"});
  const f=S("filter",{id:"unit3d",x:"-40%",y:"-40%",width:"180%",height:"190%"});
  f.appendChild(S("feDropShadow",{dx:"0.6",dy:"2.6",stdDeviation:"1.7","flood-color":"#000","flood-opacity":".6"}));
  defs.appendChild(f);
  [["ugradU","#356aa0","#15314c"],["ugradC","#974236","#4e1610"]].forEach(([id,a,b])=>{
    const g=S("linearGradient",{id,x1:"0",y1:"0",x2:"0",y2:"1"});
    g.appendChild(S("stop",{offset:"0%","stop-color":a})); g.appendChild(S("stop",{offset:"100%","stop-color":b}));
    defs.appendChild(g);});
  svg.appendChild(defs);
}
function makeUnit(u,scale){
  scale=scale||1; unitDefs();
  const c=unitColors(u.side),g=S("g",{class:"unit","transform":`translate(${u.x},${u.y}) scale(${scale})`});
  g.setAttribute("data-name",u.name||""); g.setAttribute("data-ox",u.x); g.setAttribute("data-oy",u.y); g.setAttribute("data-sc",scale); g.setAttribute("data-side",u.side==="union"?"union":"conf"); // normalize ("confederate"→"conf")
  const W=34,H=23, grad=u.side==="union"?"url(#ugradU)":"url(#ugradC)", face=u.side==="union"?"#0c2138":"#3a130e"; // ~13% larger for phone legibility
  // raised counter: subtle depth (drop-shadowed side face + a thin bevel) — flattened so the branch glyph stays crisp
  const ext=S("rect",{x:-W/2,y:-H/2+2.5,width:W,height:H,rx:2.6,fill:face}); ext.setAttribute("filter","url(#unit3d)"); g.appendChild(ext);
  const body=S("rect",{x:-W/2,y:-H/2,width:W,height:H,rx:2.5,fill:grad,stroke:c.stroke,"stroke-width":1.4}); g.appendChild(body);
  g.appendChild(S("rect",{x:-W/2+1.6,y:-H/2+1.2,width:W-3.2,height:2.2,rx:1.1,fill:"#ffffff",opacity:".12"})); // thin top bevel
  // branch glyph — the loudest thing on the counter (bright, bold)
  const gl=u.side==="union"?"#dbe8f7":"#f5d3cd";
  if(u.ech==="cav"){
    g.appendChild(S("line",{x1:-W/2+2,y1:H/2-2,x2:W/2-2,y2:-H/2+2,stroke:gl,"stroke-width":2.2,"stroke-linecap":"round"}));
  }else if(u.ech==="arty"){
    g.appendChild(S("circle",{cx:0,cy:0,r:3.9,fill:gl}));
  }else{ // infantry X
    g.appendChild(S("line",{x1:-W/2+2,y1:-H/2+2,x2:W/2-2,y2:H/2-2,stroke:gl,"stroke-width":2,"stroke-linecap":"round"}));
    g.appendChild(S("line",{x1:-W/2+2,y1:H/2-2,x2:W/2-2,y2:-H/2+2,stroke:gl,"stroke-width":2,"stroke-linecap":"round"}));
  }
  // echelon mark
  const em=S("text",{x:0,y:-H/2-3,"text-anchor":"middle",fill:c.ink,"font-size":8,"font-weight":"700","letter-spacing":"1px"});
  em.textContent=ECH[u.ech]||"";g.appendChild(em);
  // label: primary name only (the sub-detail / strength now lives in the tap card — declutters the map).
  // Suppressible via u.noLabel (dense artillery, moving tokens) and via the Map Labels layer toggle.
  if(!u.noLabel){
    const n1=S("text",{x:0,y:H/2+11,"text-anchor":"middle",class:"unit-label"});
    n1.textContent=u.name;g.appendChild(n1);
  }
  // tappable: a generous transparent hit area + click → "what it's doing" card
  const hit=S("rect",{x:-W/2-9,y:-H/2-16,width:W+18,height:H+34,fill:"transparent"});g.insertBefore(hit,g.firstChild);
  g.style.cursor="pointer";
  g.addEventListener("click",e=>{e.stopPropagation();openUnitCard(u,g);});
  return g;
}
/* ---- "What is this formation doing?" card ---- */
const ECHWORD={army:"Army",corps:"Corps",div:"Division",bde:"Brigade",reg:"Regiment",cav:"Cavalry",arty:"Artillery"};
function unitDoing(u){ if(u.do)return u.do;
  const s=curStep(),ew=(ECHWORD[u.ech]||"force").toLowerCase(),side=u.side==="union"?"Union":"Confederate";
  return `${side} ${ew} engaged here — ${s.title}, ${s.time}.`; }
function personKeyFor(u){const hay=((u.name||"")+" "+(u.sub||"")).toLowerCase();
  return Object.keys(GB.people).find(k=>{const ln=GB.people[k].name.split(" ").pop().toLowerCase();return ln.length>3&&hay.indexOf(ln)>=0;})||null;}
function selectUnit(g){
  $$(".layer-units .unit",svg).forEach(n=>n.style.opacity=(n===g?"1":"0.35"));
  $$(".layer-units .uring",svg).forEach(n=>n.remove());
  if(g){const ring=S("circle",{class:"uring",cx:0,cy:0,r:25,fill:"none",stroke:"#e7b955","stroke-width":2.5,"stroke-dasharray":"5 3"});g.appendChild(ring);}
}
function closeUnitCard(){const c=$("#unitCard");if(c)c.classList.add("hidden");
  $$(".layer-units .unit",svg).forEach(n=>n.style.opacity="1");
  $$(".layer-units .uring",svg).forEach(n=>n.remove());}
window.closeUnitCard=closeUnitCard;
/* ---- Narration-synced highlight: glow the formation(s) the current caption is discussing ---- */
function clearHighlights(){ if(!G.units)return; G.units.querySelectorAll(".unit-hl").forEach(e=>e.remove()); G.arrows&&G.arrows.querySelectorAll(".unit-hl").forEach(e=>e.remove()); }
function highlightUnit(g){ if(!g||g.querySelector(".unit-hl"))return;
  const ring=S("circle",{class:"unit-hl",cx:0,cy:0,r:19,fill:"none",stroke:"#ffd874","stroke-width":2.6,opacity:".95"});
  ring.appendChild(S("animate",{attributeName:"r",values:"17;27;17",dur:"1.5s",repeatCount:"indefinite"}));
  ring.appendChild(S("animate",{attributeName:"opacity",values:".95;.3;.95",dur:"1.5s",repeatCount:"indefinite"}));
  g.insertBefore(ring,g.firstChild); }
function highlightForText(text){ clearHighlights(); if(!G.units||!text)return; const lt=text.toLowerCase();
  G.units.querySelectorAll(".unit").forEach(g=>{ const nm=(g.getAttribute("data-name")||"").toLowerCase();
    if(nm&&nm.length>2&&new RegExp("\\b"+nm.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).test(lt)) highlightUnit(g); }); }
// the standard arms & basic load by branch (CMH primer: small arms / artillery)
function armsLoad(u){
  if(u.ech==="cav") return "Breech-loading carbines · ~40 rounds/man";
  if(u.ech==="arty") return "Field battery · ~200 rounds per gun (limber + caisson)";
  return "Rifled muskets · ~60 rounds/man basic load";
}
function openUnitCard(u,g){
  // Tapping a force PAUSES the action so you can study it (strength, commander, arms, history).
  _auto=false; clearTimeout(_beatTimer); clearTimeout(_moveHold); cancelAnimationFrame(_beatRAF); cancelAnimationFrame(_vbRAF); if(typeof setPlayBtn==="function")setPlayBtn();
  selectUnit(g);
  const card=$("#unitCard");if(!card)return;
  const side=u.side==="union"?"Union":"Confederate",col=u.side==="union"?"var(--union)":"var(--conf)";
  const who=personKeyFor(u);
  const usd=u.side==="union"?"union":"conf"; // normalize side for lookup
  let info=window.GB&&GB.unitInfo&&(GB.unitInfo[usd+"|"+u.name]||GB.unitInfo[u.name]);
  if(!info&&window.GB&&GB.unitInfo){ const ln=(u.name||"").toLowerCase(); // forgiving match (e.g. "Ewell's II Corps" → "II Corps"; "Bigelow's 9th Mass Btry —" → "Bigelow")
    const k=Object.keys(GB.unitInfo).find(kk=>{ const p=kk.split("|"); if(p.length>1&&p[0]!==usd)return false; const nm=p[p.length-1].toLowerCase();
      return nm.length>3 && (ln.indexOf(nm)>=0 || nm.indexOf(ln.split(/[ '’(—\/]/)[0])===0); });
    if(k)info=GB.unitInfo[k]; }
  // battle-state override for THIS stand (commander succession, strength as the fight bleeds it down)
  const st=(window.GB&&GB.unitState&&curStandId)?GB.unitState[curStandId+"|"+u.name]:null;
  const strength=(st&&st.strength)||(info&&info.strength);
  const commander=st&&st.commander, note=st&&st.note;
  // lead with a fast-scan stat strip; full detail below
  const cmdr=commander||u.sub||"";
  const strip=`<div class="uc-strip">
      <span class="uc-chip force" style="border-color:${col}">${side}</span>
      <span class="uc-chip">${ECHWORD[u.ech]||"Force"}</span>
      ${strength?`<span class="uc-chip">${strength}</span>`:""}
      ${cmdr?`<span class="uc-chip">${cmdr}</span>`:""}
    </div>`;
  const infoHtml=`<div class="uc-info">
      ${(info&&info.origin)?`<div><span class="uc-l">Made up of</span> ${info.origin}</div>`:""}
      <div><span class="uc-l">Arms &amp; load</span> ${(info&&info.arms)||armsLoad(u)}</div>
      ${note?`<div><span class="uc-l">At this point</span> ${note}</div>`:""}
      ${(info&&info.history)?`<div><span class="uc-l">Engagements</span> ${info.history}</div>`:""}
    </div>`;
  card.innerHTML=`<button class="uc-x" onclick="closeUnitCard()">✕</button>
    <div class="uc-h"><span class="uc-dot" style="background:${col}"></span><b>${u.name}</b></div>
    ${strip}
    <div class="uc-do">${unitDoing(u)}</div>
    ${infoHtml}
    <div class="uc-row">${who?`<button class="uc-b" onclick="closeUnitCard();openPerson('${who}')">Who →</button>`:""}<button class="uc-b" onclick="expandSheet('full')">Full picture →</button></div>`;
  card.classList.remove("hidden");
  // anchor above the unit
  const m=svg.getScreenCTM();if(!m)return;const pt=svg.createSVGPoint();pt.x=u.x;pt.y=u.y;const sp=pt.matrixTransform(m);
  const r=$("#stage").getBoundingClientRect();const cw=Math.min(280,r.width-16);
  card.style.left=Math.max(8,Math.min(r.width-cw-8,sp.x-r.left-cw/2))+"px";
  card.style.top=Math.max(8,sp.y-r.top-card.offsetHeight-14)+"px";
}
function arrowDefs(){
  let defs=svg.querySelector("defs#adefs");if(defs)return;
  defs=S("defs",{id:"adefs"});
  [["arrU","#23588f"],["arrC","#962f24"]].forEach(([id,col])=>{
    const m=S("marker",{id,markerWidth:8,markerHeight:8,refX:6,refY:3,orient:"auto",markerUnits:"strokeWidth"});
    m.appendChild(S("path",{d:"M0,0 L6,3 L0,6 Z",fill:col}));defs.appendChild(m);
  });
  svg.appendChild(defs);
}
function makeArrow(a){
  arrowDefs();
  // arrow colors keyed to the unit-icon families, but darker/saturated so the lines read clearly
  const col=a.side==="union"?"#23588f":(a.side==="confcav"?"#c2802f":"#962f24");
  const mk=a.side==="union"?"url(#arrU)":"url(#arrC)";
  const [x1,y1]=a.from,[x2,y2]=a.to;
  const mx=(x1+x2)/2+(y2-y1)*0.12, my=(y1+y2)/2-(x2-x1)*0.12;
  const g=S("g",{}), dd=`M${x1},${y1} Q${mx},${my} ${x2},${y2}`;
  g.appendChild(S("path",{d:dd,fill:"none",stroke:"#f7f1df","stroke-width":10,opacity:.6,"stroke-linecap":"round"})); // light halo so the darker arrow pops on the terrain
  g.appendChild(S("path",{d:dd,fill:"none",stroke:col,"stroke-width":6,"marker-end":mk,opacity:.97,"stroke-linecap":"round","stroke-dasharray":a.dashed?"9 6":""}));
  if(a.lbl){const t=S("text",{x:mx,y:my-4,"text-anchor":"middle",fill:col,"font-size":9.5,"font-style":"italic"});
    t.setAttribute("paint-order","stroke");t.setAttribute("stroke","#000a");t.setAttribute("stroke-width","2.4");
    t.textContent=a.lbl;g.appendChild(t);}
  return g;
}

/* Per-phase iconic-spot highlights (orient the student to the decisive ground) */
function renderIconic(modId){
  if(!G.iconic)return; clear(G.iconic);
  const names=(GB.phaseIcons&&GB.phaseIcons[modId])||[];
  names.forEach(nm=>{const c=GB.iconSpots[nm];if(!c)return;const p=TC(c[0],c[1]);
    const g=S("g",{});
    g.appendChild(S("circle",{cx:p[0],cy:p[1],r:16,fill:"none",stroke:"#e7b955","stroke-width":2.5,class:"ipulse"}));
    g.appendChild(S("circle",{cx:p[0],cy:p[1],r:5,fill:"#e7b955",stroke:"#5a3d0a","stroke-width":1.2}));
    const t=S("text",{x:p[0],y:p[1]-22,"text-anchor":"middle","font-family":"var(--serif)",
      "font-size":14,"font-weight":"700",fill:"#7a1f1f","paint-order":"stroke",stroke:"#f7f1df","stroke-width":3.6});
    t.textContent=nm;g.appendChild(t);
    G.iconic.appendChild(g);
  });
}

/* ---------- Render dynamic layers for a step ---------- */
function battleDetailFor(s){ return (window.GB&&GB.battleDetail&&GB.battleDetail[s.title])||null; }
function renderBattleDetail(s){
  const bd=battleDetailFor(s); if(!bd)return;
  (bd.arrows||[]).forEach(a=>{const a2=Object.assign({},a,{from:TC(a.from[0],a.from[1]),to:TC(a.to[0],a.to[1])});
    const el=makeArrow(a2); el.style.opacity="0.42"; G.arrows.appendChild(el);});
  (bd.artillery||[]).forEach(u=>{const p=TC(u.x,u.y);G.units.appendChild(makeUnit({side:u.side,ech:"arty",name:u.name,sub:"",x:p[0],y:p[1],noLabel:true},1.6));});
  (bd.keyterrain||[]).forEach(k=>{const p=TC(k.x,k.y);const g=S("g",{class:"kt-lbl",transform:`translate(${p[0]},${p[1]})`});
    const t=S("text",{x:0,y:0,"text-anchor":"middle",class:"kt-text"});t.textContent="⬙ "+k.name;g.appendChild(t);G.labels.appendChild(g);});
}
function renderStepMap(){
  const s=curStep();
  const kind=s.map==="campaign"?"campaign":"field";
  if(svg.dataset.kind!==kind){rebuildMapSkeleton(kind);svg.dataset.kind=kind;}
  clear(G.units);clear(G.arrows);clear(G.hotspots);
  if(kind==="field"){
    (s.units||[]).forEach(u=>{const p=TC(u.x,u.y);G.units.appendChild(makeUnit(Object.assign({},u,{x:p[0],y:p[1]}),2.0));});
    (s.arrows||[]).forEach(a=>{const a2=Object.assign({},a,{from:TC(a.from[0],a.from[1]),to:TC(a.to[0],a.to[1])});G.arrows.appendChild(makeArrow(a2));});
    renderBattleDetail(s);
    (s.hotspots||[]).forEach(k=>G.hotspots.appendChild(makeHotspot(k)));
    renderIconic(s.m);
    (s.emphasis||[]).forEach(e=>G.iconic.appendChild(makeEmphasis(e))); // e.g. "Reynolds fell here" — after renderIconic so it isn't cleared
    if(typeof renderStandMarkers==="function")renderStandMarkers();
    if(typeof renderMonuments==="function")renderMonuments();
    frameField(s);
  }else{
    const P=GB.campaign._proj||((lo,la)=>[lo,la]);
    const show=new Set(s.campaignShow||[]);
    (GB.campaign.routes||[]).forEach(r=>{
      if(show.size&&!show.has(r.who))return;
      const pts=r.pts.map(p=>P(p[0],p[1]));
      const col=r.side==="union"?"#3f6fa6":(r.side==="confcav"?"#c98a3a":"#a8352c");
      G.arrows.appendChild(S("polyline",{points:poly(pts),fill:"none",stroke:col,
        "stroke-width":3.6,opacity:.95,"stroke-dasharray":r.dashed?"9 6":"","stroke-linejoin":"round","stroke-linecap":"round"}));
      G.arrows.appendChild(makeArrow({side:r.side,from:pts[pts.length-2],to:pts[pts.length-1],lbl:r.lbl,dashed:r.dashed}));
    });
  }
  applyLayers();
  if(typeof setOpLineFocus==="function" && svg.dataset.kind==="field") setOpLineFocus(curStandId,curStandId?"focus":"overall");
  // 3D sync: enable only on battlefield steps; refresh markers if active
  const t3=$("#toggle3d");
  if(t3){const isField=curStep().map==="field";t3.disabled=false;t3.style.opacity=isField?1:.5;
    if(!isField&&window.GB3D&&GB3D.active)GB3D.toggle(false);}
  if(window.GB3D&&GB3D.active&&GB3D.update)GB3D.update();
  const showStand=!!state._stand && curStep().map==="field";
  ["mVantage","mAr"].forEach(id=>{const e=$("#"+id);if(e)e.classList.toggle("hidden",!showStand);});
}
function makeHotspot(key){
  const hs=GB.hotspotPos[key];if(!hs)return S("g");
  const field=svg.dataset.kind==="field";
  const p=field?T(hs.x,hs.y):[hs.x,hs.y], s=field?1.7:1;
  const g=S("g",{class:"hotspot",transform:`translate(${p[0]},${p[1]}) scale(${s})`});g.dataset.key=key;
  g.appendChild(S("circle",{cx:0,cy:0,r:10}));
  g.appendChild(S("rect",{x:-5,y:-3,width:10,height:7,rx:1.4,class:"cam"}));
  g.appendChild(S("circle",{cx:0,cy:0.5,r:2,fill:"#15110a"}));
  g.addEventListener("click",e=>{e.stopPropagation();openPhoto(key);});
  return g;
}
/* hotspot map positions (field coords) */
GB.hotspotPos={
  harvest_of_death:{x:332,y:386},dead_first_day:{x:360,y:330},field_reynolds_fell:{x:316,y:352},
  rebel_sharpshooter:{x:486,y:612},little_round_top:{x:514,y:584},
  cemetery_gatehouse:{x:522,y:392},town_view:{x:506,y:300},
  high_water_mark:{x:498,y:470},copse:{x:500,y:476},
};

/* ---------- Layer visibility ---------- */
function applyLayers(){
  const L=state.layers, field=svg.dataset.kind==="field";
  if(!G.base)return;
  if(field){
    G.base.style.display="";
    [G.relief,G.woods,G.water,G.roads,G.town].forEach(g=>g.style.display="none");
    G.hsover.style.display=L.has("relief")?"":"none";
    G.floraover.style.display=L.has("flora")?"":"none";
    G.koca.style.display=L.has("keyterrain")?"":"none";
    if(G.oplines)G.oplines.style.display=L.has("oplines")?"":"none";
    if(G.hexgrid)G.hexgrid.style.display=L.has("hexgrid")?"":"none";
    G.iconic.style.display="";
    G.labels.style.display=L.has("labels")?"":"none";
  }else{
    G.base.style.display="none";G.koca.style.display="none";G.iconic.style.display="none";
    if(G.oplines)G.oplines.style.display="none";
    if(G.hexgrid)G.hexgrid.style.display="none";
    G.hsover.style.display="none";G.floraover.style.display="none";
    [G.relief,G.water,G.town].forEach(g=>g.style.display="");
    [G.woods,G.roads].forEach(g=>g.style.display="none");
    G.labels.style.display="";
  }
  G.units.style.display=L.has("units")?"":"none";
  G.arrows.style.display=L.has("units")?"":"none";
  // unit name labels follow the Map Labels toggle (lets you clear on-map text clutter)
  if(G.units){const ul=L.has("labels")?"":"none";G.units.querySelectorAll(".unit-label").forEach(t=>t.style.display=ul);}
  G.hotspots.style.display=L.has("photos")?"":"none";
  if(G.monuments)G.monuments.style.display=(field&&L.has("monuments"))?"":"none";
}
/* ---------- Map-side layers panel (Maps/onX style: a layers button -> compact toggle list) ---------- */
function renderLayersPanel(){
  const el=$("#layersPanel"); if(!el)return;
  el.innerHTML=`<div class="lp-h">▤ Layers — show / hide</div>`+LAYERS.map(L=>
    `<label><input type="checkbox" data-id="${L.id}" ${state.layers.has(L.id)?"checked":""}><span class="lp-sw" style="background:${L.sw}"></span>${L.label}</label>`).join("");
  el.querySelectorAll("input").forEach(inp=>inp.onchange=e=>{const id=e.target.dataset.id;e.target.checked?state.layers.add(id):state.layers.delete(id);applyLayers();renderRail&&renderRail();});
}
function toggleLayersPanel(force){ const el=$("#layersPanel"),btn=$("#layersBtn"); if(!el)return;
  const show=force!=null?force:el.classList.contains("hidden");
  if(show){toggleLegendPanel(false);renderLayersPanel();el.classList.remove("hidden");btn&&btn.classList.add("on");}
  else{el.classList.add("hidden");btn&&btn.classList.remove("on");} }
window.toggleLayersPanel=toggleLayersPanel;
/* ---------- Map legend / key (a drawer, opens opposite the layers panel) ---------- */
function renderLegendPanel(){
  const el=$("#legendPanel"); if(!el)return;
  const ctr=(fill,stroke,glyph)=>`<svg width="26" height="17" viewBox="0 0 26 17"><rect x="1.5" y="1.5" width="23" height="14" rx="2.5" fill="${fill}" stroke="${stroke}" stroke-width="1.3"/>${glyph}</svg>`;
  const X=`<line x1="3" y1="3" x2="23" y2="14" stroke="#fff" stroke-opacity=".85" stroke-width="1.2"/><line x1="23" y1="3" x2="3" y2="14" stroke="#fff" stroke-opacity=".85" stroke-width="1.2"/>`;
  const CAV=`<line x1="3" y1="14" x2="23" y2="3" stroke="#fff" stroke-opacity=".85" stroke-width="1.3"/>`;
  const ART=`<circle cx="13" cy="8.5" r="2.4" fill="#fff" fill-opacity=".9"/>`;
  const arrow=(col,dash)=>`<svg width="30" height="14" viewBox="0 0 30 14"><line x1="2" y1="7" x2="21" y2="7" stroke="${col}" stroke-width="3" ${dash?'stroke-dasharray="4 3"':''}/><path d="M20 2 L29 7 L20 12 Z" fill="${col}"/></svg>`;
  const pin=(fill,stroke,txt,tcol)=>`<svg width="26" height="20" viewBox="0 0 26 20"><circle cx="13" cy="10" r="8.5" fill="${fill}" stroke="${stroke}" stroke-width="2"/><text x="13" y="13.5" text-anchor="middle" font-size="9.5" font-weight="800" fill="${tcol}">${txt}</text></svg>`;
  const dot=(fill,stroke)=>`<svg width="26" height="16" viewBox="0 0 26 16"><circle cx="13" cy="8" r="5.5" fill="${fill}" stroke="${stroke||'#fff'}" stroke-width="1.6"/></svg>`;
  const row=(sw,label)=>`<div class="lg-row"><span class="lg-sw">${sw}</span><span>${label}</span></div>`, head=t=>`<div class="lg-h">${t}</div>`;
  el.innerHTML =
    `<div class="lg-title">🔑 Map key — what the symbols mean</div>`+
    head("Forces")+ row(ctr("#21466b","#9fc1e8",X),"Union")+ row(ctr("#962f24","#e6a59c",X),"Confederate")+
    head("Branch (glyph on counter)")+ row(ctr("#3a4658","#aab4c4",X),"Infantry")+ row(ctr("#3a4658","#aab4c4",CAV),"Cavalry")+ row(ctr("#3a4658","#aab4c4",ART),"Artillery")+
    head("Movement")+ row(arrow("#23588f"),"Union advance")+ row(arrow("#962f24"),"Confederate advance")+ row(arrow("#c2802f"),"Confederate cavalry")+ row(arrow("#9aa0a6",true),"Withdrawal / retrograde")+
    head("Stands &amp; markers")+ row(pin("#15110a","#e7b955","1","#e7b955"),"Tour stand — tap to open")+ row(pin("#c0463c","#e7b955","●","#fff"),"Current stand")+ row(pin("#16291d","#6bb37e","✓","#9fe0b3"),"Visited stand")+
      row(dot("#c9a14a","#fff"),"Photo marker")+ row(dot("#b8bcc4","#fff"),"Monument")+
      row(`<svg width="26" height="14" viewBox="0 0 26 14"><rect x="6" y="2.5" width="14" height="9" fill="none" stroke="#c9a14a" stroke-width="2"/></svg>`,"Key terrain (KOCOA)")+
      row(`<svg width="30" height="12" viewBox="0 0 30 12"><line x1="2" y1="6" x2="28" y2="6" stroke="#1f4e79" stroke-width="3"/></svg>`,"Operational graphics — lines &amp; avenues")+
      row(dot("#2f8fe0","#fff"),"Your GPS location")+
    head("Outcomes")+
      row(`<svg width="26" height="16" viewBox="0 0 26 16"><line x1="6" y1="3" x2="20" y2="13" stroke="#ef5350" stroke-width="2.4"/><line x1="20" y1="3" x2="6" y2="13" stroke="#ef5350" stroke-width="2.4"/></svg>`,"Destroyed / overrun")+
      row(`<span class="lg-tag" style="background:#3a2c0c;color:#e7b955">⚑ captured</span>`,"Captured")+
      row(`<span class="lg-tag" style="background:#3a1410;color:#e6a59c">broken</span>`,"Broken / routed");
}
function toggleLegendPanel(force){ const el=$("#legendPanel"),btn=$("#legendBtn"); if(!el)return;
  const show=force!=null?force:el.classList.contains("hidden");
  if(show){ toggleLayersPanel(false); renderLegendPanel(); el.classList.remove("hidden"); btn&&btn.classList.add("on"); }
  else{ el.classList.add("hidden"); btn&&btn.classList.remove("on"); } }
window.toggleLegendPanel=toggleLegendPanel;
/* ---------- Monuments layer ---------- */
function renderMonuments(){
  if(!(window.GB&&GB.monuments&&GB.monuments.length))return;
  if(!G.monuments){ G.monuments=S("g",{class:"layer-monuments"}); G.root.appendChild(G.monuments); }
  clear(G.monuments);
  GB.monuments.forEach(m=>{ const p=ll2px(m.lon,m.lat); if(!p)return;
    const g=S("g",{transform:`translate(${p[0]},${p[1]})`,class:"mon"}); g.style.cursor="pointer";
    g.appendChild(S("circle",{r:8,fill:"#dfe3ea",stroke:"#4a4030","stroke-width":1.5,opacity:.92}));
    g.appendChild(S("path",{d:"M0,-5 L1.3,-1.5 L5,-1.5 L2,1 L3,5 L0,2.6 L-3,5 L-2,1 L-5,-1.5 L-1.3,-1.5 Z",fill:"#7a6320",transform:"scale(.8)"}));
    g.appendChild(S("rect",{x:-12,y:-12,width:24,height:24,fill:"transparent"}));
    g.addEventListener("click",e=>{e.stopPropagation();openMonument(m);});
    G.monuments.appendChild(g); });
}
function openMonument(m){
  const card=$("#unitCard"); if(!card)return; selectUnit(null);
  card.innerHTML=`<button class="uc-x" onclick="closeUnitCard()">✕</button>
    <div class="uc-h"><span class="uc-dot" style="background:#cfd3da"></span><b>${m.name}</b></div>
    <div class="uc-sub">Monument${m.unit?" · "+m.unit:""}${m.side?" · "+(m.side==="union"?"Union":"Confederate"):""}</div>
    ${m.desc?`<div class="uc-do">${m.desc}</div>`:""}
    <div class="uc-info">
      ${m.donor?`<div><span class="uc-l">Donated by</span> ${m.donor}</div>`:""}
      ${m.dedicated?`<div><span class="uc-l">Dedicated</span> ${m.dedicated}</div>`:""}
      ${m.sculptor?`<div><span class="uc-l">Sculptor</span> ${m.sculptor}</div>`:""}
      ${m.location?`<div><span class="uc-l">Location</span> ${m.location}</div>`:""}
    </div>`;
  card.classList.remove("hidden");
  const r=$("#stage").getBoundingClientRect(); const m2=svg.getScreenCTM(); const pt=svg.createSVGPoint();
  const px=ll2px(m.lon,m.lat); pt.x=px[0];pt.y=px[1]; const sp=pt.matrixTransform(m2); const cw=Math.min(280,r.width-16);
  card.style.left=Math.max(8,Math.min(r.width-cw-8,sp.x-r.left-cw/2))+"px";
  card.style.top=Math.max(8,sp.y-r.top-card.offsetHeight-14)+"px";
}
window.openMonument=openMonument;
/* ---------- Stand pin → choose what to open (walk / briefing / personalities / lesson) ---------- */
function openStandMenu(s){
  const card=$("#unitCard"); if(!card||!s)return; if(typeof selectUnit==="function")selectUnit(null);
  card.innerHTML=`<button class="uc-x" onclick="closeUnitCard()">✕</button>
    <div class="uc-h"><span class="uc-dot" style="background:var(--gold)"></span><b>${s.name}</b></div>
    <div class="uc-sub">${s.day||""}</div>
    <div class="sm-row">
      <button class="sm-b prime" onclick="closeUnitCard();selectStand('${s.id}')">▶ Walk the action</button>
      <button class="sm-b" onclick="openStandContent('${s.id}','brief')">📋 Briefing</button>
      <button class="sm-b" onclick="openStandContent('${s.id}','people')">👤 Personalities</button>
      <button class="sm-b" onclick="openStandContent('${s.id}','learn')">🎓 Lesson</button>
    </div>`;
  card.classList.remove("hidden");
  const r=$("#stage").getBoundingClientRect(),m=svg.getScreenCTM(),pt=svg.createSVGPoint(),px=ll2px(s.lon,s.lat);
  pt.x=px[0];pt.y=px[1];const sp=pt.matrixTransform(m),cw=Math.min(280,r.width-16);
  card.style.left=Math.max(8,Math.min(r.width-cw-8,sp.x-r.left-cw/2))+"px";
  card.style.top=Math.max(8,sp.y-r.top-card.offsetHeight-14)+"px";
}
function openStandContent(id,tab){
  if(window.closeUnitCard)closeUnitCard();
  selectStand(id); _auto=false; if(typeof setPlayBtn==="function")setPlayBtn();
  state.tab=tab; $$(".brief-tabs button").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
  if(typeof renderPanel==="function")renderPanel();
  setSheet("full");
}
window.openStandMenu=openStandMenu; window.openStandContent=openStandContent;

/* ---------- Pan / Zoom ---------- */
function applyView(){G.root&&G.root.setAttribute("transform",`translate(${state.panX},${state.panY}) scale(${state.view})`);}
$("#zoomIn").onclick=()=>{state.view=Math.min(3,state.view*1.25);applyView();};
$("#zoomOut").onclick=()=>{state.view=Math.max(.7,state.view/1.25);applyView();};
{const zr=$("#zoomReset");if(zr)zr.onclick=()=>{state.view=1;state.panX=0;state.panY=0;
  if(svg.dataset.kind==="field")frameField(curStep());else svg.setAttribute("viewBox","0 0 1000 800");applyView();};}
(function dragPan(){let down=false,drag=false,sx,sy,px,py,pid;const TH=6; // tap vs. drag threshold (px)
  // NOTE: do NOT capture the pointer on touchdown — that swallows taps on units. Capture only once a real drag begins.
  svg.addEventListener("pointerdown",e=>{down=true;drag=false;sx=e.clientX;sy=e.clientY;px=state.panX;py=state.panY;pid=e.pointerId;});
  svg.addEventListener("pointermove",e=>{if(!down)return;
    if(!drag){ if(Math.abs(e.clientX-sx)+Math.abs(e.clientY-sy)<TH)return; drag=true; try{svg.setPointerCapture(pid);}catch(_){} }
    const r=svg.getBoundingClientRect();const sc=(svg.viewBox.baseVal.width||1000)/r.width;
    state.panX=px+(e.clientX-sx)*sc;state.panY=py+(e.clientY-sy)*sc;applyView();});
  const end=()=>{down=false;drag=false;};
  svg.addEventListener("pointerup",end); svg.addEventListener("pointercancel",end);
  svg.addEventListener("wheel",e=>{e.preventDefault();const f=e.deltaY<0?1.12:1/1.12;state.view=Math.max(.7,Math.min(3,state.view*f));applyView();},{passive:false});
})();

/* =====================================================================
   RIGHT PANEL
===================================================================== */
function sideDot(side){return `<span class="side-dot" style="background:${side==="union"?"var(--union)":"var(--conf)"}"></span>`;}
function renderBrief(){
  const s=curStep(),m=curMod(),b=$("#briefBody");
  const stand=(state.tour&&state._stand)?state._stand:null;
  let h="";
  if(stand){
    h+=`<div class="eyebrow">${state.tour.icon} ${state.tour.name}</div>`;
    h+=`<h2>${stand.name}</h2><div class="datetag">${stand.day}</div>`;
    if(stand.photo)h+=`<img class="brief-photo" src="${img(stand.photo)}" onclick="openPhoto('${stand.photo}')" alt="${stand.name}">`;
    h+=`<p>${stand.what}</p>`;
    h+=`<div style="font-size:12px;color:var(--ink-dim);margin:-4px 0 10px">Battle context · ${m.label}</div>`;
  }else{
    h+=`<div class="eyebrow">${m.label} · ${m.sub}</div>`;
    h+=`<h2>${s.title}</h2><div class="datetag">${s.time}</div>`;
  }
  // ---- ACTION ROW (visible at the half detent — map stays primary) ----
  if(s.decision){
    const d=s.decision, mine=state.mode==="command"&&(d.side===state.side||d.side==="both");
    h+=`<button class="opt" style="border-color:var(--gold)" onclick="openDecision('${d.id}')">
      <span class="ol" style="color:var(--gold)">⚔ Decision — ${d.commander}</span>
      <span class="od">${mine?"You hold this command. Make the call.":"The commander's dilemma & what he chose."}</span></button>`;
  }
  if(s.pause){
    h+=`<button class="opt" onclick="openPause()"><span class="ol" style="color:#e7b955">⏸ Discussion questions</span>
      <span class="od">${s.pause.sub||"Pause for seminar discussion."}</span></button>`;
  }
  if(stand){
    const vg=GB.guide.vignettes[stand.id], ps=GB.guide.photoSpots.find(x=>x.stand===stand.id), vids=standVideos(stand.id);
    h+=`<div class="guide-row">`;
    h+=`<button class="gbtn" style="border-color:var(--gold);color:var(--gold)" onclick="arStand('${stand.id}')">📸 AR camera</button>`;
    h+=`<button class="gbtn" onclick="window.open(directionsUrl(${stand.lat},${stand.lon}),'_blank')">🧭 Directions</button>`;
    if(vg)h+=`<button class="gbtn" onclick="openVignette('${stand.id}')">📖 Deep read</button>`;
    if(ps)h+=`<button class="gbtn" onclick="openPhotoTip('${stand.id}')">📷 Photo tip</button>`;
    if(vids.length)h+=`<button class="gbtn" onclick="openStandVideos('${stand.id}')">🎬 Watch</button>`;
    h+=`</div>`;
    if(state.tour){const ni=state.standIdx+1;if(ni<state.tour.stops.length){const ns=standById(state.tour.stops[ni]);
      const dd=haversine(stand.lat,stand.lon,ns.lat,ns.lon),walk=Math.max(1,Math.round(dd/80));
      h+=`<button class="opt" style="border-color:var(--good)" onclick="window.open(directionsUrl(${ns.lat},${ns.lon}),'_blank')">
        <span class="ol" style="color:#86c79a">➡ Next stop: ${ns.name}</span><span class="od">~${walk} min walk · ${fmtDist(dd)} · tap for Maps directions</span></button>`;}}
  }
  // ---- FULL NARRATIVE (deeper — reached by expanding the sheet) ----
  h+=`<div class="rh" style="margin-top:16px">The action here</div>`;
  h+=`<p>${s.text}</p>`;
  if(stand)h+=`<div style="font-size:12px;color:var(--ink-dim);margin:-4px 0 10px">Battle context · ${m.label} · ${s.time}</div>`;
  const src=stand&&GB.standSources&&GB.standSources[stand.id];
  if(src&&src.length){h+=`<div class="rh" style="margin-top:14px">📜 Primary sources · staff-ride readings</div>`+
    `<div style="font-size:12.5px;color:var(--ink-dim);line-height:1.5">`+src.map(r=>`<div style="margin:5px 0"><b style="color:var(--ink)">${r.who}</b> — ${r.work}</div>`).join("")+`</div>`;}
  if(s.hotspots&&s.hotspots.length){
    h+=`<div style="margin-top:6px">`+s.hotspots.map(k=>`<span class="tag" style="cursor:pointer;color:var(--gold)" onclick="openPhoto('${k}')">📷 ${GB.people[k]?GB.people[k].name:photoTitle(k)}</span>`).join("")+`</div>`;
  }
  h+=`<div style="margin-top:10px;font-size:11px;color:var(--ink-dim)">💡 Tap any unit on the map to see what that formation is doing.</div>`;
  b.innerHTML=h;
}
function photoTitle(k){const r=(GB._imgmeta||{})[k];return r?r.title.split("—")[0].split("(")[0].trim():k;}
function renderPeople(){
  const m=curMod(),b=$("#briefBody");
  let h=`<div class="eyebrow">Dramatis Personae</div><h2 style="font-size:18px">Key Personalities</h2>
    <p style="font-size:12.5px;color:var(--ink-dim)">Commanders shaping this phase. Click for the decisions that defined their role.</p>`;
  (m.people||[]).forEach(k=>{const p=GB.people[k];if(!p)return;
    h+=`<div class="person" onclick="openPerson('${k}')">
      <img class="pf" src="${img(k)}" alt="${p.name}">
      <div><div class="pn">${sideDot(p.side)}${p.name}</div><div class="pr">${p.role}</div></div></div>`;});
  h+=`<div class="rail-h" style="margin-left:0">All Commanders</div>`;
  Object.keys(GB.people).forEach(k=>{const p=GB.people[k];
    h+=`<div class="person" onclick="openPerson('${k}')"><img class="pf" src="${img(k)}"><div><div class="pn">${sideDot(p.side)}${p.name}</div><div class="pr">${p.role}</div></div></div>`;});
  b.innerHTML=h;
}
function renderLearning(){
  const m=curMod(),b=$("#briefBody");
  let h=`<div class="eyebrow">Learning Focus</div><h2 style="font-size:19px">${m.label}</h2>`;
  h+=`<div class="card theme"><h4>Operational / Strategic Theme</h4><p style="margin:0">${m.theme}</p></div>`;
  h+=`<div class="card obj"><h4>Learning Objectives</h4><ul>${m.objectives.map(o=>`<li>${o}</li>`).join("")}</ul></div>`;
  (m.quotes||[]).forEach(q=>h+=`<div class="quote">"${q.t}"<cite>— ${q.who}</cite></div>`);
  h+=`<div class="stand"><b>▶ Staff Ride Linkage.</b> ${m.stand}</div>`;
  h+=`<div class="card"><h4>Decision Points in this phase</h4><ul>`+
    STEPS.filter(s=>s.m===m.id&&s.decision).map(s=>`<li><a style="color:var(--gold);cursor:pointer" onclick="openDecision('${s.decision.id}')">${s.decision.title}</a> — <span style="color:var(--ink-dim)">${s.decision.commander}</span></li>`).join("")+`</ul></div>`;
  b.innerHTML=h;
}
function renderPanel(){state.tab==="brief"?renderBrief():state.tab==="people"?renderPeople():renderLearning();}
$$(".brief-tabs button").forEach(btn=>btn.onclick=()=>{
  state.tab=btn.dataset.tab;$$(".brief-tabs button").forEach(b=>b.classList.toggle("active",b===btn));renderPanel();});

/* =====================================================================
   LEFT RAIL + TIMELINE
===================================================================== */
function renderRail(){
  const pl=$("#phaseList");pl.innerHTML="";
  MODS.forEach((m,mi)=>{
    const active=m.id===curStep().m, done=modIndex[curStep().m]>mi;
    const d=el("div",{class:"phase-item"+(active?" active":"")+(done?" done":"")});
    d.innerHTML=`<div class="dot"></div><div><div class="pl-t">${m.label}</div><div class="pl-d">${m.sub}</div></div>`;
    d.onclick=()=>{state.tour=null;goTo(modFirstStep(m.id));if(window.toggleDrawer)toggleDrawer(false);};pl.appendChild(d);
  });
  const ll=$("#layerList"); if(ll){ ll.innerHTML=""; // map layers live on the map controls now; rail list is optional
    LAYERS.forEach(L=>{
      const row=el("label",{class:"layer-toggle"});
      row.innerHTML=`<input type="checkbox" ${state.layers.has(L.id)?"checked":""}>
        <span class="sw" style="background:${L.sw}"></span><span>${L.label}</span>`;
      row.querySelector("input").onchange=e=>{e.target.checked?state.layers.add(L.id):state.layers.delete(L.id);applyLayers();};
      ll.appendChild(row);
    }); }
}
function renderTimeline(){
  const track=$("#track");$$(".tl-node",track).forEach(n=>n.remove());
  const nodes=MODS.map(m=>modFirstStep(m.id));
  const curMi=modIndex[curStep().m];
  nodes.forEach((si,mi)=>{
    const pct=nodes.length>1?mi/(nodes.length-1)*100:0;
    const n=el("div",{class:"tl-node"+(mi===curMi?" active":"")+(mi<curMi?" done":"")});
    n.style.left=`calc(${pct}% )`;
    n.innerHTML=`<div class="nd"></div><div class="lb">${MODS[mi].label.split("—")[0].trim()}</div>`;
    n.onclick=()=>goTo(si);track.appendChild(n);
  });
  const p=state.i/(STEPS.length-1)*100;$("#trackfill").style.width=p+"%";
  $("#clock").textContent=curStep().time;
  if(!state.tour)$("#phaseBanner").innerHTML=`<b>${curMod().label}</b> &nbsp;·&nbsp; ${curStep().time}`;
  $("#prevBtn").disabled=!state.tour&&state.i===0;
  $("#nextBtn").disabled=!state.tour&&state.i===STEPS.length-1;
  const st=$("#sheetTitle");if(st)st.textContent=(state.tour&&state._stand)?state._stand.name:curStep().title;
}

/* =====================================================================
   NAVIGATION
===================================================================== */
function goTo(i,auto){
  if(window.stopMove)stopMove();
  if(window.clearBeats)clearBeats();
  if(window.closeUnitCard)closeUnitCard();
  i=Math.max(0,Math.min(STEPS.length-1,i));state.i=i;
  renderStepMap();renderRail();renderTimeline();renderPanel();
  // The decision-walk's choice beat is the single decision model now — nothing auto-pops here.
  // Decisions & discussion stay opt-in (the ⚔ Decision / ⏸ Discussion buttons in the briefing panel).
}
function next(){if(state.i<STEPS.length-1)goTo(state.i+1,true);else pausePlay();}
function prev(){goTo(state.i-1);}
$("#nextBtn").onclick=()=>state.tour?tourNext():next();
$("#prevBtn").onclick=()=>state.tour?tourPrev():prev();
document.addEventListener("keydown",e=>{
  if($("#overlays").children.length)return;
  if(e.key==="ArrowRight")state.tour?tourNext():next();
  if(e.key==="ArrowLeft")state.tour?tourPrev():prev();
});

/* ---------- Sim autoplay ---------- */
function playLoop(){state.timer=setTimeout(()=>{if(!state.playing)return;
  const s=curStep();
  if(s.pause||s.decision){return;} // wait for user
  next();if(state.playing)playLoop();},8000);}
function startPlay(){state.playing=true;$("#playBtn").innerHTML="⏸ Pause";
  const s=curStep();if(s.pause){openPause();return;}if(s.decision){openDecision(s.decision.id,true);return;}playLoop();}
function pausePlay(){state.playing=false;clearTimeout(state.timer);$("#playBtn").innerHTML="▶ Play";}
$("#playBtn").onclick=()=>state.playing?pausePlay():startPlay();

/* =====================================================================
   OVERLAYS
===================================================================== */
function mount(node){const o=$("#overlays");o.appendChild(node);
  node.addEventListener("click",e=>{if(e.target===node)unmount(node);});}
function unmount(node){node.remove();}
function overlay(cls){const o=el("div",{class:"overlay "+(cls||"")});return o;}

function openPhoto(key){
  const meta=(GB._imgmeta||{})[key]||{title:key,license:""};
  const o=overlay();
  o.innerHTML=`<div class="modal modal-pic"><div class="mhead"><h3>${meta.title}</h3>
    <button class="mclose">✕</button></div><div class="mbody">
    <img class="full" src="${img(key)}" alt="${meta.title}">
    ${hasImg(key)?"":'<div class="cap">No verified period photograph of this exact site is in the public domain; this marker locates the ground for your map study.</div>'}
    <div class="cap">${meta.caption||meta.title}</div><div class="lic">${meta.license||""}</div></div></div>`;
  o.querySelector(".mclose").onclick=()=>unmount(o);mount(o);
}
function openPerson(key){
  const p=GB.people[key];if(!p)return;const o=overlay();
  o.innerHTML=`<div class="modal"><div class="mhead"><h3>${sideDot(p.side)}${p.name}</h3><button class="mclose">✕</button></div>
   <div class="mbody"><div style="display:flex;gap:14px"><img src="${img(key)}" style="width:130px;height:160px;object-fit:cover;border-radius:9px;border:1px solid var(--line);flex:none">
   <div><div class="tag">${p.side==="union"?"Union":"Confederate"}</div><div style="font-size:12.5px;color:var(--ink-dim);margin-bottom:8px">${p.role}</div>
   <p style="margin:0">${p.bio}</p></div></div>
   <div class="lic" style="margin-top:10px">${((GB._imgmeta||{})[key]||{}).license||""}</div></div></div>`;
  o.querySelector(".mclose").onclick=()=>unmount(o);mount(o);
}
function openDecision(id,revealOnly){
  const s=STEPS.find(x=>x.decision&&x.decision.id===id);if(!s)return;const d=s.decision;
  const mine=state.mode==="command"&&(d.side===state.side||d.side==="both")&&!revealOnly;
  const o=overlay();
  const head=`<div class="modal decision"><div class="mhead"><h3>⚔ ${d.title}</h3><button class="mclose">✕</button></div>
    <div class="dwho">${sideDot(d.side==="both"?state.side:d.side)} ${d.commander} · ${d.side==="union"?"Union":d.side==="conf"?"Confederate":"Either side"}</div>
    <div class="mbody"><p>${d.situation}</p><div id="dzone"></div></div></div>`;
  o.innerHTML=head;o.querySelector(".mclose").onclick=()=>unmount(o);mount(o);
  const zone=o.querySelector("#dzone");
  function showReveal(chosenIdx){
    let h="";
    if(chosenIdx!=null){const opt=d.options[chosenIdx];
      const diverged=!/historical/i.test(opt.ol);
      h+=`<div class="verdict ${diverged?"diverge":"hist"}"><b>Your order:</b> ${opt.ol}<br><span style="color:var(--ink-dim)">${opt.out}</span></div>`;}
    h+=`<div class="rh">What actually happened</div><div class="teach" style="background:#1c2620;border-color:#2f4636;border-left-color:#5b9d6b">${d.history}</div>`;
    h+=`<div class="rh">Teaching point</div><div class="teach">${d.teach}</div>`;
    if(s.pause){const qs=(s.pause.before||[]).concat(s.pause.after||[]).slice(0,3);
      if(qs.length)h+=`<div class="rh">Reflect &amp; discuss</div><ol class="qlist" style="margin-top:4px">${qs.map(q=>`<li>${q}</li>`).join("")}</ol>`;}
    h+=`<div style="margin-top:14px;display:flex;gap:8px"><button class="tl-btn primary" id="contBtn">Continue ▶</button>
      <button class="tl-btn" id="closeBtn">Close</button></div>`;
    zone.innerHTML=h;
    zone.querySelector("#contBtn").onclick=()=>{unmount(o);if(state.i<STEPS.length-1)next();if(state.mode==="sim"&&state.playing)playLoop();};
    zone.querySelector("#closeBtn").onclick=()=>{unmount(o);if(state.mode==="sim"&&state.playing)playLoop();};
  }
  if(mine){
    state.decided[d.id]=true;
    zone.innerHTML=`<div class="rh">Your decision</div>`+d.options.map((opt,idx)=>
      `<button class="opt" data-i="${idx}"><span class="ol">${opt.ol}</span><span class="od">${opt.od}</span></button>`).join("");
    zone.querySelectorAll(".opt").forEach(btn=>btn.onclick=()=>{
      zone.querySelectorAll(".opt").forEach(b=>b.style.opacity=.45);
      btn.style.opacity=1;btn.style.borderColor="var(--gold)";showReveal(+btn.dataset.i);});
  }else{
    // reveal/observe mode: list options as context then reveal
    let h=`<div class="rh">The options before ${d.commander.split(" ").pop()}</div>`+
      d.options.map(opt=>`<div class="opt" style="cursor:default"><span class="ol">${opt.ol}</span><span class="od">${opt.od}</span></div>`).join("");
    zone.innerHTML=h;showReveal(null);
  }
}
function openPause(){
  const s=curStep();if(!s.pause)return;const pz=s.pause;const o=overlay("pause");
  let q="";
  if(pz.before){q+=`<div class="pause-sub">Discuss before the action</div><ol class="qlist">${pz.before.map(x=>`<li>${x}</li>`).join("")}</ol>`;}
  if(pz.after){q+=`<div class="pause-sub">Discuss after the action</div><ol class="qlist">${pz.after.map(x=>`<li>${x}</li>`).join("")}</ol>`;}
  o.innerHTML=`<div class="modal"><div class="mhead"><h3>⏸ ${pz.title}</h3><button class="mclose">✕</button></div>
    <div class="mbody"><div class="tag">Facilitator / Seminar</div>${q}
    <div style="margin-top:14px;display:flex;gap:8px"><button class="tl-btn primary" id="contBtn">Resume ▶</button>
    <button class="tl-btn" id="closeBtn">Close</button></div></div></div>`;
  o.querySelector(".mclose").onclick=()=>unmount(o);
  o.querySelector("#contBtn").onclick=()=>{unmount(o);if(state.i<STEPS.length-1)next();if(state.mode==="sim"&&state.playing)playLoop();};
  o.querySelector("#closeBtn").onclick=()=>{unmount(o);if(state.mode==="sim"&&state.playing)playLoop();};
  mount(o);
}

/* ---------- Mode / side ---------- */
$$("#modeSeg button").forEach(b=>b.onclick=()=>{
  state.mode=b.dataset.mode;$$("#modeSeg button").forEach(x=>x.classList.toggle("active",x===b));
  const sim=state.mode==="sim";
  $("#playBtn").classList.toggle("hidden",!sim);
  $("#sidePick").style.opacity=sim?.4:1;$("#sidePick").style.pointerEvents=sim?"none":"auto";
  pausePlay();renderPanel();
});
$$("#sidePick .side-btn").forEach(b=>b.onclick=()=>{
  state.side=b.dataset.side;$$("#sidePick .side-btn").forEach(x=>x.classList.toggle("active",x===b));
  renderPanel();
});

/* ---------- Save for offline (single-file app → cache it so it runs with no signal) ---------- */
function saveOffline(){
  const lbl=$("#offlineLbl");
  if(!("caches" in window)){ toast("Offline saving needs the https link — open it once online first"); return; }
  if(lbl)lbl.textContent="Saving…";
  caches.open("gburg-app-v4")
    .then(c=>c.addAll(["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png"]).catch(()=>{}))
    .then(()=>{ if(lbl)lbl.textContent="✓ Saved for offline"; toast("✓ Saved — open it from your home screen even with no signal"); })
    .catch(()=>{ if(lbl)lbl.textContent="Save for offline use"; toast("Couldn't cache — check your connection and try once more"); });
}
window.saveOffline=saveOffline;
/* ---------- In-app YouTube player (lazy iframe — nothing external loads until tapped) ---------- */
function playVideo(id,title){
  if(window.toggleDrawer)toggleDrawer(false);
  const o=overlay(); o.id="vidmodal";
  o.innerHTML=`<div class="modal vid-modal">
    <div class="mhead"><h3>${title||"Video"}</h3><button class="mclose" aria-label="Close">✕</button></div>
    <div class="vid-wrap"><iframe src="https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1&rel=0" title="${title||""}" frameborder="0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>
    <div class="vid-foot">Needs an internet connection · <a href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener">Open in YouTube ↗</a></div></div>`;
  o.querySelector(".mclose").onclick=()=>unmount(o);
  o.addEventListener("click",e=>{ if(e.target===o)unmount(o); });
  mount(o);
}
window.playVideo=playVideo;
/* ---------- Welcome / Help ---------- */
function welcome(){
  {const wb=$("#walkBar");if(wb)wb.classList.add("hidden");}
  if(typeof hideCompass==="function")hideCompass();
  const o=overlay();o.id="welcome";
  const tours=GB.tours.map(t=>{ const ns=(t.stops||[]).length, nd=(t.stops||[]).filter(id=>DECISION_STAND[id]).length, hr=Math.max(1,Math.round(ns*9/60));
     return `<button class="tour-card" data-t="${t.id}">
     <div class="ic">${t.icon}</div><div><h3>${t.name}</h3><p>${t.desc}</p>${ns?`<div class="tour-meta">${ns} stops · ~${hr} hr${nd?` · ${nd} decisions`:""}</div>`:""}</div></button>`; }).join("");
  let resumeHtml="";try{const r=JSON.parse(localStorage.getItem('gb_tour')||'null');
    if(r&&r.tour){const t=GB.tours.find(x=>x.id===r.tour);if(t)resumeHtml=`<button class="btn-go" id="resumeBtn" style="margin:2px 0 12px">▶ Resume ${t.icon} ${t.name} — stop ${(r.idx||0)+1}/${t.stops.length}</button>`;}}catch(e){}
  o.innerHTML=`<div class="modal"><div class="mhead"><h3>Gettysburg Staff Ride Companion</h3></div>
   <div class="mbody"><div class="tag">Gettysburg Staff Ride · Choose a Tour</div>
   <p style="margin-bottom:10px;color:var(--ink-dim);font-size:13px">Choose a route. The battle plays through at each stop — turn on <b>GPS</b> on the ground to be guided stop to stop.</p>
   ${resumeHtml}
   <div class="tour-pick">${tours}</div>
   <button class="tour-card free" data-t=""><div class="ic">🧭</div><div><h3>Free Explore</h3><p>No set route — tap any numbered stand on the map, or walk the campaign and three days yourself.</p></div></button>
   <div class="wfoot" style="margin:8px 0 0">🎓 Prepare with Dr. Doug Douds' lectures — in the <b>☰ menu</b>.</div>
   <button class="btn-go" id="offlineBtn" style="margin-top:10px;background:#1d2733;color:var(--ink);border:1px solid var(--line)">⬇ <span id="offlineLbl">Save for offline use</span></button>
   <div class="wfoot">Imagery: public domain (LOC / Wikimedia). Coordinates are approximate — follow NPS signage and your guide on the ground.</div>
   </div></div>`;
  o.querySelectorAll(".tour-card").forEach(c=>c.onclick=()=>{
    const id=c.dataset.t;unmount(o);
    if(id)startTour(id); else {state.tour=null;goTo(0);}
  });
  const ob=o.querySelector("#offlineBtn");if(ob)ob.onclick=e=>{e.stopPropagation();saveOffline();};
  const rb=o.querySelector("#resumeBtn");if(rb)rb.onclick=()=>{try{const r=JSON.parse(localStorage.getItem('gb_tour'));const t=GB.tours.find(x=>x.id===r.tour);
    unmount(o);state.tour=t;state.standIdx=Math.min(r.idx||0,t.stops.length-1);renderTourBar();activateStand(t.stops[state.standIdx]);}catch(e){unmount(o);}};
  mount(o);
}
$("#helpBtn").onclick=()=>{
  const o=overlay();
  o.innerHTML=`<div class="modal"><div class="mhead"><h3>Settings &amp; Help</h3><button class="mclose">✕</button></div>
   <div class="mbody">
   <div class="card obj"><h4>Getting started</h4><p style="margin:0">Pick a <b>Tour</b> (top bar) — each is an ordered route of stops. Open a stop by tapping its numbered <b>pin</b> on the map, by <b>GPS</b> on the field, or with <b>◀ ▶</b>. Each stop's briefing (the bottom sheet — drag or tap to expand) has the events, decision, discussion, photo, and the <b>action buttons</b> below.</p></div>

   <div class="card"><h4>👁 View from here &amp; 📸 AR camera</h4><p style="margin:0 0 6px"><b>View from here</b> drops a 3D camera at the stop, facing the action — drag (or <b>📱 Look around</b>) to turn. <b>AR camera</b> shows your live camera with the units floating over the real ground at their true bearing and distance.</p>
     <p style="margin:0">Tune AR icons with <b>A− / A+</b>; the offsets you set are remembered.</p></div>

   <div class="card theme"><h4>Compass &amp; horizon (AR aiming)</h4><p style="margin:0 0 6px">If the units don't line up with the real field:</p>
     <ol style="margin:0;padding-left:18px;font-size:13px">
       <li>Wave the phone in a slow <b>figure-8</b> a few times (this calibrates the phone's compass).</li>
       <li>Tap <b>🧭</b> → aim the center <b>＋</b> at a landmark you can identify → <b>tap that landmark</b> in the list to lock the compass.</li>
       <li>Fine-tune left/right with <b>Compass ◀ ▶</b>, and raise/lower the markers to the skyline with <b>Horizon ▲ ▼</b>.</li>
     </ol></div>

   <div class="card"><h4>Camera not showing?</h4><p style="margin:0">AR needs the <b>online link</b> (https) — a downloaded file can't use the camera. Allow <b>Camera</b> and <b>Motion &amp; Orientation</b> when asked. If it's blank: iPhone → Settings → the browser/app → enable Camera &amp; Motion, then reload. On Android, tap the address-bar lock → Permissions → allow Camera.</p></div>

   <div class="card"><h4>Location / GPS not working?</h4><p style="margin:0">Tap <b>◎ GPS</b> and <b>Allow</b> location (choose <b>Precise</b>). GPS needs an open view of the sky and the online link. If denied: Settings → Location → enable for the browser/app. GPS works offline once the app is installed — no signal needed.</p></div>

   <div class="card"><h4>Map layers (left / drawer)</h4><p style="margin:0"><b>Relief</b> shades the elevation; <b>Woods / Line-of-Sight</b> highlights the 1863 woodland (decisive for visibility); <b>Key Terrain (KOCOA)</b> marks the ground that mattered; <b>📷</b> markers open period photos.</p></div>

   <div class="card theme"><h4>Symbology (hybrid APP-6D)</h4>
     <p style="margin:0"><b style="color:#5b9bd6">blue = Union</b>, <b style="color:#d97a72">red = Confederate</b>. Echelon: <b>XXXX</b> army · <b>XXX</b> corps · <b>XX</b> division · <b>X</b> brigade · <b>III</b> regiment. Glyph: ✕ infantry · ╱ cavalry · ● artillery.</p></div>

   <div class="card" style="border-left:3px solid var(--conf)"><h4>Reset</h4>
     <button class="btn-go" style="margin:0" onclick="arResetCal()">Reset AR compass / horizon / size</button></div>

   <p class="lic">Educational tool for staff-ride preparation. <b>Source of record:</b> the U.S. Army War College staff-ride guide — Luvaas, J. &amp; Nelson, H. (eds.), <i>The U.S. Army War College Guide to the Battle of Gettysburg</i> (Univ. Press of Kansas) — for the stop structure and teaching sequence; primary-source readings are drawn from the public-domain <i>Official Records</i>, <i>Battles and Leaders</i>, and participant accounts. Public-domain imagery (Library of Congress, The Met, Wikimedia). Battlefield base: U.S. War Dept. contour survey (LOC g3822g.cw0351500). Coordinates and unit placements are approximate — follow NPS signage and your guide on the ground.</p>
   </div></div>`;
  o.querySelector(".mclose").onclick=()=>unmount(o);mount(o);
};

/* =====================================================================
   STANDS · TOURS · GPS  (field companion layer)
===================================================================== */
let LLA;(function(){let Sxx=0,Sxy=0,Sx=0,Syy=0,Sy=0,n=GB.geoctrl.length,bX=[0,0,0],bY=[0,0,0];
  GB.geoctrl.forEach(c=>{const x=c.ll[0],y=c.ll[1],ox=c.px[0],oy=c.px[1];
    Sxx+=x*x;Sxy+=x*y;Sx+=x;Syy+=y*y;Sy+=y;bX[0]+=x*ox;bX[1]+=y*ox;bX[2]+=ox;bY[0]+=x*oy;bY[1]+=y*oy;bY[2]+=oy;});
  const M=[[Sxx,Sxy,Sx],[Sxy,Syy,Sy],[Sx,Sy,n]];LLA={X:solve3(M,bX),Y:solve3(M,bY)};})();
function ll2px(lon,lat){return [LLA.X[0]*lon+LLA.X[1]*lat+LLA.X[2], LLA.Y[0]*lon+LLA.Y[1]*lat+LLA.Y[2]];}
const PXM=(()=>{const a=ll2px(-77.235,39.81),b=ll2px(-77.235,39.811);return Math.hypot(b[0]-a[0],b[1]-a[1])/111.32;})();
function haversine(la1,lo1,la2,lo2){const R=6371000,t=Math.PI/180,dLa=(la2-la1)*t,dLo=(lo2-lo1)*t;
  const x=Math.sin(dLa/2)**2+Math.cos(la1*t)*Math.cos(la2*t)*Math.sin(dLo/2)**2;return 2*R*Math.asin(Math.sqrt(x));}
function bearing(la1,lo1,la2,lo2){const t=Math.PI/180,y=Math.sin((lo2-lo1)*t)*Math.cos(la2*t),
  x=Math.cos(la1*t)*Math.sin(la2*t)-Math.sin(la1*t)*Math.cos(la2*t)*Math.cos((lo2-lo1)*t);return (Math.atan2(y,x)*180/Math.PI+360)%360;}
function compass(b){return ["N","NE","E","SE","S","SW","W","NW"][Math.round(b/45)%8];}
function fmtDist(m){return m<950?Math.round(m/5)*5+" m":(m/1609.34).toFixed(1)+" mi";}
let _ac=null;
function beep(){try{_ac=_ac||new (window.AudioContext||window.webkitAudioContext)();const o=_ac.createOscillator(),g=_ac.createGain();
  o.connect(g);g.connect(_ac.destination);o.type="sine";o.frequency.setValueAtTime(784,_ac.currentTime);o.frequency.setValueAtTime(1047,_ac.currentTime+0.12);
  g.gain.setValueAtTime(0.0001,_ac.currentTime);g.gain.exponentialRampToValueAtTime(0.16,_ac.currentTime+0.02);g.gain.exponentialRampToValueAtTime(0.0001,_ac.currentTime+0.5);
  o.start();o.stop(_ac.currentTime+0.52);}catch(e){}}
function standById(id){return GB.stands.find(s=>s.id===id);}
function standStepIndex(s){const i=STEPS.findIndex(x=>x.title.includes(s.step)&&x.map==="field");return i<0?STEPS.findIndex(x=>x.map==="field"):i;}

// Per-stand facing bearing (deg) — the direction to look to see that stop's action
const STANDLOOK={mcpherson:270,oakhill:190,barlow:30,cemhill:315,culps:70,virginia:80,peachorchard:250,wheatfield:240,devilsden:40,lrt:250,pamemorial:270,angle:265,cemetery:330,warfield:75,plumrun:250};
function vantageStand(id){const s=standById(id);if(!s)return;
  if(window.GB3D&&GB3D.viewFromHere){GB3D.viewFromHere(s.lon,s.lat,STANDLOOK[id]||0);if(window.__mobile)expandSheet(false);}
  else toast("3D terrain view not available on this device");}
window.vantageStand=vantageStand;

let curStandId=null, lastPos=null, watchId=null;
function activateStand(id){
  const s=standById(id);if(!s)return;curStandId=id;
  (state.visited||(state.visited=new Set())).add(id);
  if(state.tour){try{localStorage.setItem('gb_tour',JSON.stringify({tour:state.tour.id,idx:state.standIdx}));}catch(e){}}
  const fromVB=(svg.dataset.kind==="field")?curVB():null; // where the camera sits before we rebuild
  state._stand=s; goTo(standStepIndex(s));
  renderStandMarkers();
  if(window.__mobile){setSheet("peek"); const wb=$("#walkBar");if(wb)wb.classList.remove("hidden");} // map-primary: slim walk nav; ⓘ opens briefing
  showCompass(STANDLOOK[id]); // north reference + which way to look from this stand
  // Historian's wide shot: pull back to the whole field (you see the fishhook and every stop),
  // then zoom into this stand — so each action is understood relative to the rest of the battle.
  flyToStand(s,fromVB,()=>startBeats(true));
}
/* ---- Cinematic field camera (animate the SVG viewBox) ---- */
let _vbRAF=null;
function curVB(){const v=svg.viewBox.baseVal;return [v.x,v.y,v.width,v.height];}
function setVB(a){svg.setAttribute("viewBox",`${a[0]} ${a[1]} ${a[2]} ${a[3]}`);}
const EASE_OUT=t=>1-Math.pow(1-t,3);                         // decelerate (settle into the wide)
const EASE_INOUT=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;     // confident dolly in/out
function tweenVB(to,dur,cb,ease){cancelAnimationFrame(_vbRAF);const from=curVB(),t0=performance.now(),ez=ease||EASE_INOUT;
  (function fr(now){const t=Math.min(1,(now-t0)/dur),e=ez(t);
    setVB([0,1,2,3].map(i=>from[i]+(to[i]-from[i])*e));
    if(t<1)_vbRAF=requestAnimationFrame(fr);else if(cb)cb();})(t0);}
// Frame on the ACTION: the bounding box of this stand's units/arrows (in the SAME schematic space they're
// drawn in — NOT the stand's lat/lon, which can disagree with the stylized map), zoomed tight, with the
// content held in the TOP ~70% so the bottom caption band has clear space.
function standVB(s){
  const st=$("#stage"), ar=(st.clientHeight||700)/(st.clientWidth||390);
  const W=GB.fieldBase.w, H=GB.fieldBase.h, step=curStep(), pts=[];
  // Frame on the STAND'S FORMATIONS and where they go — NOT distant approach origins or spread reserve-arty lines.
  (step.units||[]).forEach(u=>pts.push(TC(u.x,u.y)));
  (step.arrows||[]).forEach(a=>pts.push(TC(a.to[0],a.to[1])));
  if(!pts.length){ const p=ll2px(s.lon,s.lat); pts.push(p); }
  let xs=pts.map(p=>p[0]), ys=pts.map(p=>p[1]);
  let minx=Math.min.apply(0,xs),maxx=Math.max.apply(0,xs),miny=Math.min.apply(0,ys),maxy=Math.max.apply(0,ys);
  let bw=maxx-minx, bh=maxy-miny;
  minx-=bw*0.16+70; maxx+=bw*0.16+70; miny-=bh*0.14+60; maxy+=bh*0.14+60; // tight padding → zoomed in on the action
  let cw=maxx-minx, ch=maxy-miny;
  // viewBox aspect must equal the screen; keep the action inside the TOP 70% (reserve bottom 30% for the caption)
  let w=Math.max(cw, ch/(0.70*ar)); w=Math.max(380,Math.min(W,w));
  let h=w*ar;
  let x=Math.max(0,Math.min(W-w, minx-(w-cw)/2));
  // keep the ACTION in the top — allow the frame to extend past the map edge (dark below, under the caption) for edge stands
  let y=Math.max(-(h*0.30), miny - h*0.05);
  return [x,y,w,h];
}
// pulsing ring on the destination pin during the establishing wide-shot
function pulseDest(s,on){
  if(!G.stands)return; const old=G.stands.querySelector("#destPulse"); if(old)old.remove();
  if(!on)return; const p=ll2px(s.lon,s.lat);
  const g=S("g",{id:"destPulse"}); g.style.pointerEvents="none";
  const c=S("circle",{cx:p[0],cy:p[1],r:18,fill:"none",stroke:"#e7b955","stroke-width":3});
  c.appendChild(S("animate",{attributeName:"r",values:"18;46;18",dur:"1.5s",repeatCount:"indefinite"}));
  c.appendChild(S("animate",{attributeName:"opacity",values:"0.95;0;0.95",dur:"1.5s",repeatCount:"indefinite"}));
  g.appendChild(c); G.stands.appendChild(g);
}
function flyToStand(s,fromVB,cb){
  if(svg.dataset.kind!=="field"){if(cb)cb();return;}
  const full=[0,0,GB.fieldBase.w,GB.fieldBase.h], target=standVB(s), cap=$("#moveCaption");
  const day=(curStep&&curStep().m)||"";
  const orient=()=>{if(cap){cap.innerHTML=`<span class="cap-gold">▸ ${state.tour?("Stop "+(state.standIdx+1)+" · "):""}${s.name}</span>`;cap.classList.remove("hidden");}};
  const wide=()=>{ if(typeof setOpLineFocus==="function")setOpLineFocus(s.id,"wide"); pulseDest(s,true); };   // this action + what's already happened; destination pulsing
  const arrive=()=>{ pulseDest(s,false); if(typeof setOpLineFocus==="function")setOpLineFocus(s.id,"focus"); if(cb)cb(); };
  const pushIn=(dur)=>{ if(typeof setOpLineFocus==="function")setOpLineFocus(s.id,"focus"); tweenVB(target,dur,arrive,EASE_INOUT); }; // hide big avenues before zooming in
  if(fromVB){ // stand → stand: pull back, HOLD on the whole field, then push in
    setVB(fromVB); orient();
    tweenVB(full,1100,()=>{ wide(); setTimeout(()=>pushIn(1300),1600); }, EASE_OUT);
  } else { // first stop / cold open: the slowest — let the whole battlefield register first
    setVB(full); orient(); wide(); setTimeout(()=>pushIn(1400),900);
  }
}
function centerField(px,py){
  if(svg.dataset.kind!=="field")return;
  const st=$("#stage"),ar=(st.clientHeight||600)/(st.clientWidth||400);
  const w=Math.min(GB.fieldBase.w,760),h=Math.min(GB.fieldBase.h,w*ar);
  let x=Math.max(0,Math.min(GB.fieldBase.w-w,px-w/2)),y=Math.max(0,Math.min(GB.fieldBase.h-h,py-h/2));
  svg.setAttribute("viewBox",`${x} ${y} ${w} ${h}`);
}
function renderStandMarkers(){
  if(!G.stands)return;clear(G.stands);
  if(svg.dataset.kind!=="field")return;
  GB.stands.forEach((s,i)=>{const p=ll2px(s.lon,s.lat),cur=s.id===curStandId,vis=state.visited&&state.visited.has(s.id);
    const g=S("g",{class:"stand-pin"});g.style.cursor="pointer";
    g.appendChild(S("circle",{cx:p[0],cy:p[1],r:cur?18:15,fill:cur?"#c0463c":(vis?"#16291d":"#15110a"),stroke:cur?"#e7b955":(vis?"#6bb37e":"#e7b955"),"stroke-width":cur?3:2.4}));
    const t=S("text",{x:p[0],y:p[1]+5,"text-anchor":"middle","font-size":15,"font-weight":"800",fill:cur?"#fff":(vis?"#9fe0b3":"#e7b955")});t.textContent=(vis&&!cur)?"✓":i+1;g.appendChild(t);
    g.addEventListener("click",e=>{e.stopPropagation();openStandMenu(s);});
    g.addEventListener("mouseenter",()=>showTip(p,s,i));g.addEventListener("mouseleave",hideTip);
    G.stands.appendChild(g);});
  if(lastPos){const up=ll2px(lastPos.lo,lastPos.la);
    G.stands.appendChild(S("circle",{cx:up[0],cy:up[1],r:Math.max(10,(lastPos.ac||25)*PXM),fill:"#2f8fe01f",stroke:"#2f8fe066","stroke-width":1}));
    G.stands.appendChild(S("circle",{cx:up[0],cy:up[1],r:11,fill:"#2f8fe0",stroke:"#fff","stroke-width":3}));}
}
function selectStand(id){ // from map: set tour index if in a tour, then activate
  if(state.tour){const k=state.tour.stops.indexOf(id);if(k>=0)state.standIdx=k;}
  activateStand(id);renderTourBar();
}
function showTip(p,s,i){const m=svg.getScreenCTM();if(!m)return;const pt=svg.createSVGPoint();pt.x=p[0];pt.y=p[1];const sp=pt.matrixTransform(m);
  const tip=$("#mapTip");tip.innerHTML=`<b>${i+1}. ${s.name}</b><br><span style="color:var(--ink-dim)">${s.day}</span>`;
  const r=$("#stage").getBoundingClientRect();tip.style.left=(sp.x-r.left)+"px";tip.style.top=(sp.y-r.top-14)+"px";tip.classList.remove("hidden");}
function hideTip(){const t=$("#mapTip");if(t)t.classList.add("hidden");}

/* ---- Tours ---- */
function startTour(id){const t=GB.tours.find(x=>x.id===id);
  $("#overlays").innerHTML="";
  if(!t){state.tour=null;renderTourBar();return;}
  state.tour=t;state.standIdx=0;renderTourBar();
  // Open on a paused, whole-field overview showing ALL the major movements, then walk into stop 1.
  showOpeningOverview(()=>activateStand(t.stops[0]));
}
// Higher-level (corps) dispositions for the whole-field overview — the big picture, not the per-stand detail.
const OVERVIEW_UNITS=[
  {name:"I Corps",  side:"union",ech:"corps",x:512,y:366}, {name:"XI Corps", side:"union",ech:"corps",x:542,y:350},
  {name:"XII Corps",side:"union",ech:"corps",x:586,y:404}, {name:"II Corps", side:"union",ech:"corps",x:502,y:452},
  {name:"III Corps",side:"union",ech:"corps",x:470,y:508}, {name:"V Corps",  side:"union",ech:"corps",x:522,y:588},
  {name:"II Corps", side:"conf", ech:"corps",x:556,y:330}, {name:"III Corps",side:"conf", ech:"corps",x:392,y:436},
  {name:"I Corps",  side:"conf", ech:"corps",x:420,y:566},
];
function renderOverviewUnits(){
  if(!G.units)return; clear(G.units);
  OVERVIEW_UNITS.forEach(u=>{const p=TC(u.x,u.y);G.units.appendChild(makeUnit(Object.assign({},u,{x:p[0],y:p[1]}),2.4));});
  applyLayers();
}
// The establishing overview: the simplified whole field with every primary avenue + the lines, paused.
function showOpeningOverview(onBegin){
  if(svg.dataset.kind!=="field"){ rebuildMapSkeleton("field"); svg.dataset.kind="field"; }
  clearBeats();
  const wb=$("#walkBar"); if(wb)wb.classList.add("hidden");
  if(window.__mobile)setSheet("peek");
  state.layers.add("oplines"); applyLayers();
  cancelAnimationFrame(_vbRAF); setVB([0,0,GB.fieldBase.w,GB.fieldBase.h]);
  setOpLineFocus(null,"overall"); // the complete scheme — all avenues + both lines
  renderOverviewUnits(); // higher-level corps dispositions (the big picture)
  showCompass(null); // north reference (no single look direction at the whole-field view)
  if(typeof renderStandMarkers==="function")renderStandMarkers(); // numbered stops for orientation
  const pb=$("#phaseBanner"); if(pb)pb.innerHTML=`<b>${t_name()}</b><span class="pb-sub"> · the major movements · 1–3 July 1863</span>`;
  const cap=$("#moveCaption"); if(cap){ cap.innerHTML=`<span class="cap-gold">The whole field — every major movement of the three days. Study the scheme, then begin the walk.</span>`; cap.classList.remove("hidden"); cap.style.opacity=""; }
  // a real bottom ribbon (not a floating button) — fills the bar slot, no overlap, no gap
  let bar=$("#overviewBar"); if(!bar){ bar=el("div",{id:"overviewBar"}); bar.innerHTML=`<button id="beginBtn">▶ Begin the walk</button>`; $("#stage").appendChild(bar); }
  bar.classList.remove("hidden");
  $("#beginBtn").onclick=()=>{ bar.classList.add("hidden"); if(cap)cap.classList.add("hidden"); onBegin(); };
}
function t_name(){ return (state.tour&&state.tour.name)||"Gettysburg"; }

/* ---- Orientation compass: north reference + a gold "look toward the action" arrow.
   Map stays north-up; tapping the compass enables the live device heading so on the ground
   you turn the phone until the gold arrow points up to face the action. ---- */
let _cmpLook=null, _cmpHeading=0, _cmpLive=false, _cmpOrient=null;
function renderCompass(){
  const rose=$("#cmpRose"), look=$("#cmpLook"), hint=$("#cmpHint");
  if(rose) rose.setAttribute("transform",`rotate(${-_cmpHeading} 50 50)`);
  if(look){ if(_cmpLook==null) look.style.display="none"; else { look.style.display=""; look.setAttribute("transform",`rotate(${_cmpLook-_cmpHeading} 50 50)`); } }
  if(hint) hint.textContent=_cmpLive?"turn until ▲ is up":(_cmpLook!=null?"look "+compass(_cmpLook):"");
}
function showCompass(lookBearing){ const c=$("#compass"); if(!c)return; c.classList.remove("hidden"); _cmpLook=(lookBearing==null?null:lookBearing); renderCompass(); }
function hideCompass(){ const c=$("#compass"); if(c)c.classList.add("hidden"); }
function enableLiveCompass(){
  if(_cmpLive){ if(_cmpOrient){window.removeEventListener("deviceorientation",_cmpOrient,true);window.removeEventListener("deviceorientationabsolute",_cmpOrient,true);} _cmpOrient=null; _cmpLive=false; _cmpHeading=0; renderCompass(); toast("Compass: north-up"); return; }
  _cmpOrient=(e)=>{ let h=(e.webkitCompassHeading!=null)?e.webkitCompassHeading:(e.alpha!=null?360-e.alpha:null); if(h!=null){ _cmpHeading=h; if(!_cmpLive){_cmpLive=true;} renderCompass(); } };
  const add=()=>{ window.addEventListener("deviceorientationabsolute",_cmpOrient,true); window.addEventListener("deviceorientation",_cmpOrient,true); _cmpLive=true; renderCompass(); toast("Live compass on — turn until the gold arrow points up"); };
  if(typeof DeviceOrientationEvent!=="undefined"&&typeof DeviceOrientationEvent.requestPermission==="function"){
    DeviceOrientationEvent.requestPermission().then(s=>{ if(s==="granted")add(); else toast("Enable Motion & Orientation for the live compass"); }).catch(()=>{});
  } else if(typeof DeviceOrientationEvent!=="undefined"){ add(); } else toast("Compass not available on this device");
}
window.enableLiveCompass=enableLiveCompass;
function tourNext(){if(!state.tour)return next();
  if(state.standIdx>=state.tour.stops.length-1){ showTourComplete(); return; }
  const cur=standById(state.tour.stops[state.standIdx]), nxt=standById(state.tour.stops[state.standIdx+1]);
  showInterlude(cur,nxt);}
function advanceTour(){ if(!state.tour||state.standIdx>=state.tour.stops.length-1)return;
  state.standIdx++; activateStand(state.tour.stops[state.standIdx]); renderTourBar(); }
// Interlude between stands — orient the user to the next stop and hand off to their maps app for the leg.
function showInterlude(cur,nxt){
  const o=overlay(); o.id="interlude"; const i=state.standIdx+2, n=state.tour.stops.length;
  let dir="On to the next stand.", walk=false;
  if(cur&&nxt&&cur.lat&&nxt.lat){ const m=haversine(cur.lat,cur.lon,nxt.lat,nxt.lon), b=bearing(cur.lat,cur.lon,nxt.lat,nxt.lon), mi=m/1609.34;
    walk=m<560; const dist=mi<0.12?(Math.round(m/10)*10)+" m":mi.toFixed(1)+" mi";
    dir=`<b>${dist}</b> to the <b>${compass(b)}</b> — ${walk?"a short walk":"a short drive"}.`; }
  const g=nxt?`https://www.google.com/maps/dir/?api=1&destination=${nxt.lat},${nxt.lon}&travelmode=${walk?"walking":"driving"}`:"";
  o.innerHTML=`<div class="modal interlude">
    <div class="il-eye">Next stop · ${i} of ${n}</div>
    <h3>${nxt?nxt.name:""}</h3>
    <div class="il-sub">${(nxt&&nxt.day)||""}</div>
    <div class="il-dir">${dir}</div>
    ${g?`<a class="il-maps" href="${g}" target="_blank" rel="noopener">🧭 Directions to this stand</a>`:""}
    <button class="btn-go il-go">Continue ›</button>
    <button class="il-stay">✕ Stay on this stand</button></div>`;
  o.querySelector(".il-go").onclick=()=>{ unmount(o); advanceTour(); };
  o.querySelector(".il-stay").onclick=()=>unmount(o);
  mount(o);
}
window.advanceTour=advanceTour;
function tourPrev(){if(!state.tour)return prev();
  if(state.standIdx>0){state.standIdx--;activateStand(state.tour.stops[state.standIdx]);}renderTourBar();}
function renderTourBar(){
  const pb=$("#phaseBanner");if(!pb)return;
  const s=(state._stand)||(state.tour?standById(state.tour.stops[state.standIdx]):null);
  if(state.tour&&s){const i=state.standIdx+1,n=state.tour.stops.length,dec=!!DECISION_STAND[s.id];
    pb.innerHTML=`<b>${dec?"⚔":"👁"} ${i}/${n} · ${s.name}</b><span class="pb-sub"> · ${s.day||""} · ${dec?"Your call":"Overlook"}</span>`;}
  else if(state.tour){pb.innerHTML=`<b>${state.tour.icon} ${state.tour.name}</b>`;}
  pb.classList.remove("pb-in"); void pb.offsetWidth; pb.classList.add("pb-in"); // re-trigger the fade as the location transitions stand→stand
}
window.startTour=startTour;window.selectStand=selectStand;

/* ---- GPS ---- */
function setGps(cls,txt){const c=$("#gpsBtn");if(!c)return;c.classList.toggle("on",cls==="on");c.title=txt||"GPS";
  const b=$("#gpsBar");if(b)b.classList.toggle("hidden",cls==="off");}
function toggleGps(){
  if(watchId!=null){navigator.geolocation.clearWatch(watchId);watchId=null;lastPos=null;renderStandMarkers();setGps("off");$("#gpsBar").classList.add("hidden");return;}
  if(!("geolocation" in navigator)){toast("Geolocation not supported on this device");return;}
  if(!window.isSecureContext){toast("GPS needs the online (https) version — open the shared link");return;}
  setGps("","Locating…");$("#gpsBar").classList.remove("hidden");$("#gpsBar").textContent="Locating…";
  navigator.geolocation.getCurrentPosition(onPos,gpsErr,{enableHighAccuracy:true,timeout:20000});
  watchId=navigator.geolocation.watchPosition(onPos,gpsErr,{enableHighAccuracy:true,maximumAge:3000,timeout:25000});
}
function gpsErr(e){setGps("err");$("#gpsBar").textContent=e.code===1?"Location permission denied":"GPS unavailable";}
function onPos(pos){const{latitude:la,longitude:lo,accuracy:ac}=pos.coords;lastPos={la,lo,ac};
  setGps("on","GPS ±"+Math.round(ac)+"m");renderStandMarkers();
  let best=null,bd=1e12;GB.stands.forEach(s=>{const d=haversine(la,lo,s.lat,s.lon);if(d<bd){bd=d;best=s;}});
  // next tour stop guidance
  let nextTxt="";
  if(state.tour){const ns=standById(state.tour.stops[Math.min(state.standIdx,state.tour.stops.length-1)]);
    if(ns){const d=haversine(la,lo,ns.lat,ns.lon),br=bearing(la,lo,ns.lat,ns.lon);
      nextTxt=` · Stop ${state.standIdx+1}: ${ns.name} ${fmtDist(d)} ${compass(br)}↗`;}}
  $("#gpsBar").innerHTML=`<b style="color:${best&&bd<=best.r?'#86c79a':'#e7b955'}">${best?(bd<=best.r?'At '+best.name:'Nearest: '+best.name+' '+fmtDist(bd)+' — tap to open'):'—'}</b>${nextTxt}`;
  $("#gpsBar").style.cursor=best?"pointer":"";$("#gpsBar").onclick=best?(()=>selectStand(best.id)):null;
  if(best&&bd<=best.r&&curStandId!==best.id){if(navigator.vibrate)navigator.vibrate([40,60,40]);beep();
    toast("📍 You've reached "+best.name+" — tap to open",()=>selectStand(best.id));}
}
window.fcSim=(la,lo,ac=14)=>onPos({coords:{latitude:la,longitude:lo,accuracy:ac}});

/* ---- mobile drawer / sheet ---- */
// Mobile: Briefing/Personalities/Lesson is a centered pop-up over the map (X to close).
// Desktop: #brief is the always-present right column, so open/close is a no-op there.
function setSheet(s){const b=$("#brief");if(!b)return;
  const open=(s==="full"||s==="half"||s===true);
  if(window.__mobile){
    b.classList.toggle("open",open);
    const sc=$("#scrim");if(sc)sc.classList.toggle("show",open);
  }
  b.style.height="";
}
function sheetState(){const b=$("#brief");return b&&b.classList.contains("open")?"full":"peek";}
function expandSheet(mode){ if(mode===false)setSheet("peek"); else setSheet("full"); }
function closeBrief(){ setSheet("peek"); } window.closeBrief=closeBrief;
function toggleDrawer(on){const r=$("#rail"),sc=$("#scrim");const open=on==null?!r.classList.contains("open"):on;
  r.classList.toggle("open",open);sc.classList.toggle("show",open);}
window.expandSheet=expandSheet;window.toggleDrawer=toggleDrawer;
window.__mobile=window.matchMedia("(max-width:860px)").matches;
window.addEventListener("resize",()=>{window.__mobile=window.matchMedia("(max-width:860px)").matches;});
(function wireMobile(){
  const gb=$("#gpsBtn");if(gb)gb.onclick=toggleGps;
  const mb=$("#menuBtn");if(mb)mb.onclick=()=>toggleDrawer();
  const sc=$("#scrim");if(sc)sc.onclick=()=>{toggleDrawer(false);if(window.__mobile)setSheet("peek");};
  const bx=$("#briefClose");if(bx)bx.onclick=e=>{e.stopPropagation();setSheet("peek");};
  const sbk=$("#stepBack");if(sbk)sbk.onclick=e=>{e.stopPropagation();prevBeat();};
  const snx=$("#stepNext");if(snx)snx.onclick=e=>{e.stopPropagation();nextBeat();};
  const sin=$("#stepInfo");if(sin)sin.onclick=e=>{e.stopPropagation();if(curStandId)openStandContent(curStandId,"brief");};
  const tb=$("#toursBtn");if(tb)tb.onclick=()=>{toggleDrawer(false);welcome();};
  const pb=$("#planBtn");if(pb)pb.onclick=()=>openPlanner();
  const rt=$("#railTours");if(rt)rt.onclick=()=>{toggleDrawer(false);welcome();};
  const rp=$("#railPlan");if(rp)rp.onclick=()=>{toggleDrawer(false);openPlanner();};
  const rg=$("#railGps");if(rg)rg.onclick=()=>{toggleDrawer(false);toggleGps();};
  const xv=$("#exitVantageBtn");if(xv)xv.onclick=()=>{window.GB3D&&GB3D.exitVantage&&GB3D.exitVantage();};
  const ob=$("#orientBtn");if(ob)ob.onclick=()=>{window.GB3D&&GB3D.toggleOrient&&GB3D.toggleOrient();};
  const ax=$("#arExit");if(ax)ax.onclick=()=>stopAR();
  const acb=$("#arCalBtn");if(acb)acb.onclick=()=>arCalOpen();
  const asd=$("#arSizeDown");if(asd)asd.onclick=()=>arSize(-0.18);
  const asu=$("#arSizeUp");if(asu)asu.onclick=()=>arSize(0.18);
  const anl=$("#arNudgeL");if(anl)anl.onclick=()=>arNudge(-1);
  const anr=$("#arNudgeR");if(anr)anr.onclick=()=>arNudge(1);
  const acd=$("#arCalDone2");if(acd)acd.onclick=()=>arCalDone();
  const ahu=$("#arHorUp");if(ahu)ahu.onclick=()=>arHorizon(-1.5);
  const ahd=$("#arHorDn");if(ahd)ahd.onclick=()=>arHorizon(1.5);
  const fb=$("#focusBtn");if(fb)fb.onclick=()=>{$("#app").classList.toggle("mapfocus");fb.classList.toggle("on");
    setTimeout(()=>{if(svg.dataset.kind==="field")frameField(curStep());},80);};
  const pm=$("#playMoveBtn");if(pm)pm.onclick=()=>togglePlay();
  const lb=$("#layersBtn");if(lb)lb.onclick=e=>{e.stopPropagation();toggleLayersPanel();};
  const lgb=$("#legendBtn");if(lgb)lgb.onclick=e=>{e.stopPropagation();toggleLegendPanel();};
  const cc=$("#compass");if(cc)cc.onclick=e=>{e.stopPropagation();enableLiveCompass();};
  if(svg)svg.addEventListener("click",()=>{ if(typeof closeUnitCard==="function")closeUnitCard(); if(typeof toggleLayersPanel==="function")toggleLayersPanel(false); });
  const mv2=$("#mVantage");if(mv2)mv2.onclick=()=>{if(curStandId)vantageStand(curStandId);};
  const mar2=$("#mAr");if(mar2)mar2.onclick=()=>{if(curStandId)arStand(curStandId);};
})();

/* =====================================================================
   TRIP PLANNER — overviews, weather+prepare, visit, photos, videos,
   directions, vignettes
===================================================================== */
function directionsUrl(lat,lon,mode){return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=${mode||"driving"}`;}
function standVideos(id){const t=GB.guide.topicByStand[id];return GB.guide.videos.filter(v=>v.topic===t);}
function openVignette(id){const v=GB.guide.vignettes[id];if(!v)return;const o=overlay();
  o.innerHTML=`<div class="modal"><div class="mhead"><h3>📖 ${v.title}</h3><button class="mclose">✕</button></div>
   <div class="mbody"><p style="font-size:14.5px;line-height:1.62">${v.text}</p></div></div>`;
  o.querySelector(".mclose").onclick=()=>unmount(o);mount(o);}
function openPhotoTip(id){const p=GB.guide.photoSpots.find(x=>x.stand===id);if(!p)return;const o=overlay();
  o.innerHTML=`<div class="modal"><div class="mhead"><h3>📷 ${p.name}</h3><button class="mclose">✕</button></div>
   <div class="mbody"><div class="tag">${p.type} · best light: ${p.light}</div><p>${p.what}</p>
   <div class="block" style="border-left:3px solid var(--gold)"><b style="color:var(--gold)">Tip.</b> ${p.tip}</div></div></div>`;
  o.querySelector(".mclose").onclick=()=>unmount(o);mount(o);}
function openStandVideos(id){const vids=standVideos(id);const o=overlay();
  o.innerHTML=`<div class="modal"><div class="mhead"><h3>🎬 Watch — this stop</h3><button class="mclose">✕</button></div>
   <div class="mbody">${vids.map(vidRow).join("")||"<p>No clip mapped to this stop — see the Videos tab in Plan.</p>"}</div></div>`;
  o.querySelector(".mclose").onclick=()=>unmount(o);mount(o);}
function vidRow(v){return `<a class="vid-row" href="${v.url}" target="_blank" rel="noopener">
  <div class="vt">▶ ${v.title}</div><div class="vm">${v.src} · ${v.len}</div></a>`;}
window.openVignette=openVignette;window.openPhotoTip=openPhotoTip;window.openStandVideos=openStandVideos;window.directionsUrl=directionsUrl;

function showTourOverview(tourId,onStart){
  const t=GB.tours.find(x=>x.id===tourId), ov=GB.guide.tourOverviews[tourId];
  const o=overlay();
  o.innerHTML=`<div class="modal"><div class="mhead"><h3>${t.icon} ${t.name}</h3><button class="mclose">✕</button></div>
   <div class="mbody"><div class="tag">Read before you go · ${t.stops.length} stops</div>
   ${ov&&ov.img?`<img class="brief-photo" src="${img(ov.img)}">`:""}
   <p>${ov?ov.text:t.desc}</p>
   <div style="font-size:12.5px;color:var(--ink-dim)">Stops: ${t.stops.map(id=>standById(id).name).join(" → ")}</div>
   <button class="btn-go" id="startTourBtn">Start the tour ▶</button></div></div>`;
  o.querySelector(".mclose").onclick=()=>unmount(o);
  o.querySelector("#startTourBtn").onclick=()=>{unmount(o);onStart();};
  mount(o);
}

/* ---- Planner overlay ---- */
let _weather=null;
function openPlanner(section){section=section||"weather";
  const o=overlay();o.id="planner";
  const tabs=[["overview","Tour"],["weather","Weather"],["visit","Visit"],["photos","Photo Ops"],["videos","Videos"]];
  o.innerHTML=`<div class="modal" style="max-width:600px"><div class="mhead"><h3>Trip Planner</h3><button class="mclose">✕</button></div>
   <div class="plan-tabs">${tabs.map(t=>`<button data-s="${t[0]}">${t[1]}</button>`).join("")}</div>
   <div class="mbody" id="planBody"></div></div>`;
  o.querySelector(".mclose").onclick=()=>unmount(o);
  o.querySelectorAll(".plan-tabs button").forEach(b=>b.onclick=()=>{section=b.dataset.s;sel();renderPlan(section);});
  function sel(){o.querySelectorAll(".plan-tabs button").forEach(b=>b.classList.toggle("active",b.dataset.s===section));}
  mount(o);sel();renderPlan(section);
}
window.openPlanner=openPlanner;
function renderPlan(s){const b=$("#planBody");if(!b)return;
  if(s==="overview"){const t=state.tour, ov=t?GB.guide.tourOverviews[t.id]:null;
    b.innerHTML=t?`<div class="eyebrow">${t.icon} ${t.name}</div>${ov&&ov.img?`<img class="brief-photo" src="${img(ov.img)}">`:""}<p>${ov?ov.text:t.desc}</p>
      <div class="block"><b>Route</b><div style="font-size:13px;color:var(--ink-dim);margin-top:5px">${t.stops.map((id,i)=>`${i+1}. ${standById(id).name}`).join("<br>")}</div></div>`
      :`<p>Pick a tour first (top bar → Tours) to see its read-before-you-go overview and route. Or explore freely.</p><button class="btn-go" onclick="document.querySelector('#planner .mclose').click();welcome()">Choose a tour</button>`;}
  else if(s==="weather")renderWeather(b);
  else if(s==="visit"){const v=GB.guide.visitor,g=GB.guide;
    b.innerHTML=`<div class="eyebrow">Park Visitor Center</div><h2 style="font-size:19px;margin:2px 0 4px">${v.name}</h2>
     <div class="block"><div>${v.address}</div>
      <div style="margin-top:6px">${v.phones.map(p=>`<div><b>${p[0]}:</b> <a href="tel:${p[1].replace(/[^0-9]/g,'')}">${p[1]}</a></div>`).join("")}</div>
      <div style="margin-top:6px"><a href="${v.web}" target="_blank">Foundation site</a> · <a href="${v.nps}" target="_blank">NPS</a> · <a href="${directionsUrl(v.lat,v.lon)}" target="_blank">🧭 Directions</a></div>
      <div style="margin-top:6px;font-size:12.5px;color:var(--ink-dim)">${v.hours}<br>${v.hoursNote}</div></div>
     <div class="sec-h2">Food</div>
     <div class="block"><b>${g.foodOnSite.name}</b> — ${g.foodOnSite.type}. <span style="color:var(--ink-dim)">${g.foodOnSite.note}</span></div>
     ${g.foodNearby.map(f=>`<div class="block" style="padding:9px 12px"><b>${f.name}</b> <span style="color:var(--ink-dim);font-size:12px">· ${f.cuisine} · ${f.vibe}</span><div style="font-size:12.5px;color:var(--ink-dim);margin-top:3px">${f.loc} — ${f.why}</div></div>`).join("")}
     <div class="sec-h2">Shops</div>
     ${g.giftShops.map(sh=>`<div class="block" style="padding:9px 12px"><b>${sh.name}</b><div style="font-size:12.5px;color:var(--ink-dim);margin-top:3px">${sh.what} <i>(${sh.loc})</i></div></div>`).join("")}
     <div class="sec-h2">Planning tips</div><ul style="padding-left:18px;font-size:13px">${g.tips.map(t=>`<li style="margin:6px 0">${t}</li>`).join("")}</ul>`;}
  else if(s==="photos"){b.innerHTML=`<div class="eyebrow">Best Photo Opportunities</div>
     ${GB.guide.photoSpots.map(p=>`<div class="block"><b>${p.name}</b> <span class="tag" style="margin-left:4px">${p.type}</span> <span style="font-size:11.5px;color:var(--gold)">${p.light}</span>
       <div style="font-size:13px;margin-top:5px">${p.what}</div><div style="font-size:12.5px;color:var(--ink-dim);margin-top:4px"><b>Tip:</b> ${p.tip}</div>
       <button class="gbtn" style="margin-top:7px" onclick="window.open('${directionsUrl(standById(p.stand)?standById(p.stand).lat:39.81,standById(p.stand)?standById(p.stand).lon:-77.23)}','_blank')">🧭 Go</button></div>`).join("")}`;}
  else if(s==="videos"){b.innerHTML=`<div class="eyebrow">Watch — curated, non-YouTube</div>
     <p style="font-size:12.5px;color:var(--ink-dim)">American Battlefield Trust · NPS · C-SPAN · Internet Archive. Opens in your browser (needs a connection).</p>
     ${GB.guide.videos.map(vidRow).join("")}`;}
}
function renderWeather(b){
  b.innerHTML=`<div class="eyebrow">Weather & Prepare · Gettysburg</div><div id="wxNow" style="margin:6px 0">Loading forecast…</div><div id="wxPrep"></div>`;
  const url="https://api.open-meteo.com/v1/forecast?latitude=39.811&longitude=-77.226&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,relative_humidity_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America%2FNew_York&forecast_days=3";
  const renderPrep=(w)=>{
    let extra=[];const d=w&&w.daily, pp=d?d.precipitation_probability_max[0]:null, uv=d?d.uv_index_max[0]:null,
      tmax=d?d.temperature_2m_max[0]:null, tmin=d?d.temperature_2m_min[0]:null;
    if(pp!=null){ if(pp>=50)extra.push({h:"☔ Rain likely ("+pp+"%)",t:"Bring a packable rain shell or compact umbrella — the field is open with little shelter. Waterproof your footwear."});
      else if(pp>=25)extra.push({h:"🌦 Showers possible ("+pp+"%)",t:"Toss a packable umbrella or light rain layer in the bag just in case."});
      else extra.push({h:"🌤 Low rain chance ("+pp+"%)",t:"Umbrella probably not needed — but the field is shadeless, so prioritize sun protection."});}
    if(uv!=null&&uv>=6)extra.push({h:"😎 High UV (index "+Math.round(uv)+")",t:"Strong sun on open ground — hat, sunglasses, SPF 30+, reapply midday."});
    if(tmax!=null&&tmax>=85)extra.push({h:"🥵 Hot (high ~"+Math.round(tmax)+"°F)",t:"Extra water, start early, take shade breaks at the wood lines. Light, breathable clothing."});
    if(tmin!=null&&tmin<=45)extra.push({h:"🧥 Cool start (low ~"+Math.round(tmin)+"°F)",t:"Layer up for the morning on the windy ridgelines; you can shed layers as it warms."});
    const all=extra.concat(GB.guide.packBase);
    $("#wxPrep").innerHTML=`<div class="sec-h2">What to wear & bring${w?" (for the forecast)":""}</div>`+
      all.map(p=>`<div class="block" style="padding:10px 12px"><b>${p.h}</b><div style="font-size:13px;color:var(--ink-dim);margin-top:3px">${p.t}</div></div>`).join("");
  };
  if(_weather){fillNow(_weather);renderPrep(_weather);return;}
  try{const c=JSON.parse(localStorage.getItem('gb_wx')||'null');if(c&&Date.now()-c.t<3*3600*1000){_weather=c.w;fillNow(c.w);renderPrep(c.w);}}catch(e){}
  fetch(url).then(r=>r.json()).then(w=>{_weather=w;try{localStorage.setItem('gb_wx',JSON.stringify({t:Date.now(),w}));}catch(e){}fillNow(w);renderPrep(w);})
    .catch(()=>{if(!_weather){$("#wxNow").innerHTML='<span style="color:var(--ink-dim)">Forecast unavailable offline — connect to load live weather. Packing guidance below still applies.</span>';renderPrep(null);}});
  function fillNow(w){const c=w.current,d=w.daily;
    $("#wxNow").innerHTML=`<div class="wx-now"><div class="wx-t">${Math.round(c.temperature_2m)}°F</div>
      <div class="wx-d"><div>${wxText(c.weather_code)} · feels ${Math.round(c.apparent_temperature)}°</div>
      <div style="color:var(--ink-dim);font-size:12px">Humidity ${c.relative_humidity_2m}% · Wind ${Math.round(c.wind_speed_10m)} mph</div></div></div>
      <div class="wx-days">${d.time.map((t,i)=>`<div class="wx-day"><div>${i===0?"Today":new Date(t+"T12:00").toLocaleDateString(undefined,{weekday:"short"})}</div>
        <div style="font-size:18px">${wxIcon(d.weather_code[i])}</div><div><b>${Math.round(d.temperature_2m_max[i])}</b>/${Math.round(d.temperature_2m_min[i])}°</div>
        <div style="font-size:11px;color:var(--union)">${d.precipitation_probability_max[i]}%☔</div></div>`).join("")}</div>`;}
}
function wxText(c){const m={0:"Clear",1:"Mainly clear",2:"Partly cloudy",3:"Overcast",45:"Fog",48:"Fog",51:"Light drizzle",53:"Drizzle",55:"Drizzle",61:"Light rain",63:"Rain",65:"Heavy rain",71:"Light snow",73:"Snow",75:"Heavy snow",80:"Rain showers",81:"Showers",82:"Heavy showers",95:"Thunderstorm",96:"Thunderstorm",99:"Thunderstorm"};return m[c]||"—";}
function wxIcon(c){if(c===0||c===1)return"☀️";if(c===2)return"⛅";if(c===3)return"☁️";if(c>=45&&c<=48)return"🌫️";if(c>=51&&c<=65)return"🌧️";if(c>=71&&c<=77)return"❄️";if(c>=80&&c<=82)return"🌦️";if(c>=95)return"⛈️";return"🌡️";}

/* =====================================================================
   CAMERA AR — overlay the units/events on the real landscape, georeferenced
===================================================================== */
function old2ll(x,y){const g=GB.geo.old2ll;return [g.a*x+g.b*y+g.c, g.d*x+g.e*y+g.f];}
let _DEM=null;
function demElev(lon,lat){ if(!GB.dem)return 150; if(!_DEM){const bin=atob(GB.dem.b64),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);_DEM=new Int16Array(u.buffer);}
  const d=GB.dem,bb=d.bbox;let u=(lon-bb.W)/(bb.E-bb.W),v=(lat-bb.S)/(bb.N-bb.S);u=u<0?0:u>1?1:u;v=v<0?0:v>1?1:v;
  const gx=Math.min(d.w-1,Math.round(u*(d.w-1))),gy=Math.min(d.h-1,Math.round((1-v)*(d.h-1)));return _DEM[gy*d.w+gx];}
function angDiff(a,b){return ((a-b+540)%360)-180;}
const AR={on:false,stream:null,heading:0,pitch:0,pitchS:null,markers:[],viewer:null,raf:0,orient:null,
  iconScale:parseFloat(localStorage.getItem('gb_arsize'))||1.25,
  headingOffset:parseFloat(localStorage.getItem('gb_arcal'))||0,
  pitchOffset:parseFloat(localStorage.getItem('gb_arpitch'))||0};
function arHorizon(d){AR.pitchOffset=(AR.pitchOffset||0)+d;try{localStorage.setItem('gb_arpitch',AR.pitchOffset);}catch(e){}}
window.arHorizon=arHorizon;
function arResetCal(){AR.headingOffset=0;AR.pitchOffset=0;AR.iconScale=1.25;
  ['gb_arcal','gb_arpitch','gb_arsize'].forEach(k=>{try{localStorage.removeItem(k);}catch(e){}});
  toast("AR calibration reset");}
window.arResetCal=arResetCal;
function arSize(delta){AR.iconScale=Math.max(0.6,Math.min(2.4,(AR.iconScale||1.25)+delta));
  try{localStorage.setItem('gb_arsize',AR.iconScale);}catch(e){}}
window.arSize=arSize;
function arNudge(d){AR.headingOffset=(((AR.headingOffset||0)+d+540)%360)-180;try{localStorage.setItem('gb_arcal',AR.headingOffset);}catch(e){}}
window.arNudge=arNudge;
function arCalOpen(){const bar=$("#arCal");if(!bar)return;
  // nearest stands to the viewer become aiming references
  const v=AR.viewer;const list=GB.stands.map(s=>({s,d:haversine(v.lat,v.lon,s.lat,s.lon)})).sort((a,b)=>a.d-b.d).slice(0,5);
  $("#arCalList").innerHTML=list.map(o=>`<button class="arcal-ref" onclick="arCalSet('${o.s.id}')">${o.s.name} <span style="color:var(--ink-dim)">${compass(bearing(v.lat,v.lon,o.s.lat,o.s.lon))} · ${fmtDist(o.d)}</span></button>`).join("");
  bar.classList.remove("hidden");$("#arCross").classList.remove("hidden");}
function arCalSet(id){const s=standById(id);if(!s)return;const v=AR.viewer;
  const tb=bearing(v.lat,v.lon,s.lat,s.lon);AR.headingOffset=((tb-AR.heading+540)%360)-180;
  try{localStorage.setItem('gb_arcal',AR.headingOffset);}catch(e){}
  toast("Calibrated — "+s.name+" is now aligned");}
function arCalDone(){$("#arCal").classList.add("hidden");$("#arCross").classList.add("hidden");}
window.arCalOpen=arCalOpen;window.arCalSet=arCalSet;window.arCalDone=arCalDone;

function arMarkers(stand){
  const s=STEPS[standStepIndex(stand)], out=[];
  (s.units||[]).forEach(u=>{const ll=old2ll(u.x,u.y);out.push({label:(ECH[u.ech]?ECH[u.ech]+" ":"")+u.name,side:u.side,lat:ll[1],lon:ll[0],kind:"unit"});});
  const ic=(GB.phaseIcons&&GB.phaseIcons[s.m])||[];
  ic.forEach(nm=>{const c=GB.iconSpots[nm];if(c){const ll=old2ll(c[0],c[1]);out.push({label:nm,side:"icon",lat:ll[1],lon:ll[0],kind:"icon"});}});
  GB.stands.forEach(st=>{if(st.id!==stand.id)out.push({label:st.name,side:"stand",lat:st.lat,lon:st.lon,kind:"stand"});});
  out.forEach(m=>{m.elev=demElev(m.lon,m.lat);});
  return out;
}
function startAR(stand){
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){toast("Camera not available on this device");return;}
  if(!window.isSecureContext){toast("Camera AR needs the online (https) app — open the shared link");return;}
  AR.viewer={lat:(lastPos?lastPos.la:stand.lat),lon:(lastPos?lastPos.lo:stand.lon)};AR.viewer.elev=demElev(AR.viewer.lon,AR.viewer.lat);
  AR.markers=arMarkers(stand);
  navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false})
    .then(stream=>{AR.stream=stream;const v=$("#arVideo");v.srcObject=stream;v.play();
      $("#arLayer").classList.remove("hidden");AR.on=true;buildARDom();startAROrient();arLoop();
      $("#arWho").textContent=stand.name;})
    .catch(()=>toast("Camera permission denied"));
}
function stopAR(){AR.on=false;cancelAnimationFrame(AR.raf);
  if(AR.stream){AR.stream.getTracks().forEach(t=>t.stop());AR.stream=null;}
  if(AR.orient){window.removeEventListener("deviceorientation",AR.orient,true);window.removeEventListener("deviceorientationabsolute",AR.orient,true);AR.orient=null;}
  $("#arLayer").classList.add("hidden");const v=$("#arVideo");if(v)v.srcObject=null;}
window.startAR=startAR;window.stopAR=stopAR;
function startAROrient(){
  AR.orient=(e)=>{let h=(e.webkitCompassHeading!=null)?e.webkitCompassHeading:(e.alpha!=null?(e.absolute?360-e.alpha:360-e.alpha):null);
    if(h!=null)AR.heading=h; if(e.beta!=null)AR.pitch=e.beta-90;};
  const add=()=>{window.addEventListener("deviceorientationabsolute",AR.orient,true);window.addEventListener("deviceorientation",AR.orient,true);};
  if(typeof DeviceOrientationEvent!=="undefined"&&typeof DeviceOrientationEvent.requestPermission==="function"){
    DeviceOrientationEvent.requestPermission().then(s=>{if(s==="granted")add();else toast("Enable Motion & Orientation for AR aiming");}).catch(()=>{});
  } else add();
}
function buildARDom(){const ov=$("#arOverlay");ov.innerHTML="";
  AR.markers.forEach((m,i)=>{const el2=document.createElement("div");el2.className="ar-mk ar-"+m.kind+(m.side&&m.side!==m.kind?" ar-"+m.side:"");
    el2.innerHTML=`<div class="ar-ic">${m.kind==="unit"?"▰":(m.kind==="icon"?"◆":"📍")}</div><div class="ar-lb">${m.label}</div>`;
    el2.style.display="none";ov.appendChild(el2);m._el=el2;});
}
function arLoop(){ if(!AR.on)return; AR.raf=requestAnimationFrame(arLoop);
  const W=window.innerWidth,H=window.innerHeight,hFov=64,vFov=hFov*H/W;
  const vlat=AR.viewer.lat,vlon=AR.viewer.lon,velev=AR.viewer.elev+1.7;
  const heff=AR.heading+(AR.headingOffset||0);
  AR.pitchS=(AR.pitchS==null)?AR.pitch:(AR.pitchS*0.82+AR.pitch*0.18); // smooth tilt → steadier horizon
  const pEff=AR.pitchS+(AR.pitchOffset||0);
  AR.markers.forEach(m=>{
    const d=haversine(vlat,vlon,m.lat,m.lon), br=bearing(vlat,vlon,m.lat,m.lon);
    const dx=angDiff(br,heff);
    if(Math.abs(dx)>hFov*0.62){m._el.style.display="none";return;}
    // horizon lock: place the ground point on the real skyline using terrain elevation
    const dz=(m.elev+ (m.kind==="unit"?2:0))-velev, elevAng=Math.atan2(dz,Math.max(20,d))*180/Math.PI;
    const x=W*(0.5+dx/hFov), y=H*(0.5-((elevAng-pEff)/vFov)) ;
    const sc=Math.max(0.62,Math.min(AR.iconScale||1.25, (AR.iconScale||1.25)*Math.sqrt(480/Math.max(120,d))));
    m._el.style.display="";m._el.style.left=x+"px";m._el.style.top=y+"px";m._el.style.transform=`translate(-50%,-50%) scale(${sc})`;
    m._el.style.opacity=d>1600?0.5:1; m._el.querySelector(".ar-lb").textContent=m.label+" · "+fmtDist(d);
  });
}
function arStand(id){const s=standById(id);if(s)startAR(s);}
window.arStand=arStand;

/* =====================================================================
   PLAY THE MOVE — animate units along the movement arrows + caption
===================================================================== */
let _moveRAF=0, _movePlaying=false, _moveTok=null;
function playMove(){
  const s=curStep();
  if(s.map!=="field"||!s.arrows||!s.arrows.length){toast("No movement to animate at this stop");return;}
  if(_movePlaying){stopMove();return;}
  _movePlaying=true;$("#playMoveBtn")&&$("#playMoveBtn").classList.add("on");
  const cap=$("#moveCaption");
  const arrows=s.arrows.map(a=>({from:TC(a.from[0],a.from[1]),to:TC(a.to[0],a.to[1]),lbl:a.lbl||"",narr:a.narr,side:a.side}));
  if(_moveTok){_moveTok.remove();_moveTok=null;}
  const tok=S("g",{});tok.style.pointerEvents="none";G.arrows.appendChild(tok);_moveTok=tok;
  let idx=0;
  function playArrow(){
    if(!_movePlaying)return;
    if(idx>=arrows.length){endMove();return;}
    const a=arrows[idx];
    if(cap){cap.textContent=a.narr||a.lbl||s.title;cap.classList.remove("hidden");}
    // each move spawns its own symbol and LEAVES it in place — the scene plays out and stays
    const uside=a.side==="union"?"union":"conf";
    const nm=(a.lbl||"").split("→")[0].split("(")[0].trim()||"Move";
    const mu=makeUnit({side:uside,ech:"bde",name:nm,sub:"",x:a.from[0],y:a.from[1]},1.5);tok.appendChild(mu);
    const t0=performance.now(),dur=2300;
    (function frame(now){ if(!_movePlaying)return;
      const t=Math.min(1,(now-t0)/dur),e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
      const x=a.from[0]+(a.to[0]-a.from[0])*e,y=a.from[1]+(a.to[1]-a.from[1])*e;
      mu.setAttribute("transform",`translate(${x},${y}) scale(1.5)`);
      if(t<1)_moveRAF=requestAnimationFrame(frame); else { idx++; setTimeout(playArrow,420); }
    })(t0);
  }
  function endMove(){ if(cap){cap.textContent="Scene complete — tap ▶ to replay";setTimeout(()=>{if(!_movePlaying)cap.classList.add("hidden");},2600);} _movePlaying=false;$("#playMoveBtn")&&$("#playMoveBtn").classList.remove("on"); }
  window._endMove=endMove;
  playArrow();
}
function stopMove(){_movePlaying=false;cancelAnimationFrame(_moveRAF);
  if(_moveTok){_moveTok.remove();_moveTok=null;}
  const cap=$("#moveCaption");if(cap)cap.classList.add("hidden");$("#playMoveBtn")&&$("#playMoveBtn").classList.remove("on");}
window.playMove=playMove;

/* ===== DECISION-WALK: step the stand one beat at a time (the command decision + the moves) ===== */
const DECISION_STAND={mcpherson:'buford',cemhill:'ewell',pamemorial:'meade',peachorchard:'sickles',virginia:'lee'};
let _beatTok=[], _beatRAF=0, _auto=false, _beatTimer=0, _moveHold=0;
function setPlayBtn(){ const b=$("#playMoveBtn"); if(b){ b.textContent=_auto?"❚❚":"▶"; b.title=_auto?"Pause":"Play the action"; b.classList.toggle("on",_auto);} }
function maybeAutoAdvance(){ // called when a move beat finishes animating
  if(!_auto)return;
  const beats=state._beats||[], next=beats[state.beat+1];
  if(next && (next.type==='move'||next.type==='cap')){ clearTimeout(_beatTimer); _beatTimer=setTimeout(()=>{ if(_auto)nextBeat(); }, next.type==='move'?450:1100); }
  else { _auto=false; setPlayBtn(); updateStepBar(); } // reached the end of the stand — stop
}
function togglePlay(){
  const beats=state._beats||[];
  if(_auto){ _auto=false; clearTimeout(_beatTimer); cancelAnimationFrame(_beatRAF); setPlayBtn(); return; }
  _auto=true; setPlayBtn();
  if(state.beat>=beats.length-1){ startBeats(true); }           // at the end → replay the stand
  else { const cur=beats[state.beat]; if(!cur||cur.type==='move'||state.beat<0) nextBeat(); }
}
window.togglePlay=togglePlay;
function closeChoice(){ const el=$("#choiceBar"); if(el)el.classList.add("hidden"); }
function showChoice(key){
  const d=window.GB&&GB.decisionsCMH&&GB.decisionsCMH[key], el=$("#choiceBar"); if(!d||!el)return;
  el.innerHTML=`<div class="cb-q">⚔ Your call — ${d.commander.split(" ").pop()}${d.time?" · "+d.time:""}</div>`+
    d.options.map((o,i)=>`<button class="cb-opt" data-i="${i}">${o.label}</button>`).join("");
  el.classList.remove("hidden");
  el.querySelectorAll(".cb-opt").forEach(btn=>btn.onclick=()=>pickChoice(key,+btn.dataset.i));
}
function pickChoice(key,pick){
  const d=window.GB&&GB.decisionsCMH&&GB.decisionsCMH[key]; closeChoice(); if(!d)return;
  state._pick=pick;
  const o=d.options[pick]||{}, cap=$("#moveCaption");
  // Decision-forcing case: DON'T grade the pick here. Show only the in-the-moment consequence + what the
  // commander actually did; the sound/risky/wrong assessment is withheld for the debrief, so the dilemma stays live.
  const hi=d.options[d.historicalIdx]||{}, matched=(pick===d.historicalIdx);
  const hist=matched?" <i style='opacity:.8'>— the call the commander made; weigh it in the debrief.</i>":` <i style='opacity:.8'>— the commander chose otherwise (${hi.label||""}).</i>`;
  const txt=`<span class="cap-gold">Your call →</span> ${o.result||""}${hist}`;
  if(cap){ cap.innerHTML=txt; cap.classList.remove("hidden"); cap.style.opacity=""; }
  // You answered — read the consequence, then the battle AUTO-PLAYS (what happened → the movement → the debrief).
  _auto=true; setPlayBtn();
  const words=(o.result||"").split(/\s+/).filter(Boolean).length;
  const dwell=Math.min(4600,Math.max(2600,800+words*300)); // read the consequence, then the battle plays
  clearTimeout(_beatTimer); _beatTimer=setTimeout(()=>{ if(_auto)nextBeat(); },dwell);
}
window.pickChoice=pickChoice; window.closeChoice=closeChoice;
function curArrows(){ const s=curStep(); if(s.map!=="field")return []; const base=(s.arrows||[]); const bd=battleDetailFor(s); return (bd&&bd.arrows)?base.concat(bd.arrows):base; }
function contextText(){ const s=state._stand; return (s&&s.what)||(curStep()&&curStep().text)||""; }
// Split a long caption into ≤~24-word chunks on sentence boundaries (never mid-sentence),
// so one idea shows at a time and the reader isn't speed-read off the screen.
function splitCap(text,maxWords){ maxWords=maxWords||24;
  var Z=String.fromCharCode(1); // placeholder so abbreviation periods (a.m., Gen., Btry.) aren't read as sentence ends
  var t=(text||"").replace(/\b[ap]\.m\./gi,function(m){return m.split(".").join(Z);})
    .replace(/\b(Gen|Maj|Brig|Lt|Col|Capt|Sgt|Mr|Mrs|Dr|St|Mt|No|vs|Bn|Btry)\./g,function(m){return m.slice(0,-1)+Z;});
  var sents=t.match(/[^.!?]+[.!?]*\s*/g)||[t]; var out=[], cur="";
  sents.forEach(function(se){ se=se.split(Z).join(".").trim(); if(!se)return;
    var cw=cur?cur.split(/\s+/).length:0, sw=se.split(/\s+/).length;
    if(cur && cw+sw>maxWords){ out.push(cur); cur=se; } else { cur=cur?cur+" "+se:se; } });
  if(cur)out.push(cur); return out.length?out:[text||""];
}
function buildBeats(){
  // The MAP drives understanding. Scene, verdict and lesson are narration captions over the visible
  // battlefield. Lesson-FORWARD order: open with a one-line "watch for" lens, play the scene & decision,
  // show what happened, then close on the full lesson (the lens and the lesson bookend the stand).
  const beats=[], s=state._stand, dk=s&&DECISION_STAND[s.id];
  const d = dk && window.GB && GB.decisionsCMH && GB.decisionsCMH[dk];
  const pushCap=(text,opts)=>{ if(!text)return; splitCap(text).forEach(t=>beats.push(Object.assign({type:'cap',text:t},opts||{}))); };
  if(d){
    const sc=d.scene||{};
    const frame=d.frame||d.watchFor;                   // 1 — strategic FRAME up front (theme + question, no spoiler)
    if(frame) beats.push({type:'cap',text:frame,gold:true,lens:true,phase:'frame'});
    pushCap(sc.see,{phase:'scene'});                   // 2 — what the commander could see
    pushCap(sc.know,{phase:'scene'});                  // 3 — what he knew
    if(sc.hidden) pushCap('What you don’t know — '+sc.hidden,{phase:'scene'});// 4 — the fog (renamed for clarity)
    beats.push({type:'choice',key:dk,phase:'choice'}); // 5 — your call (map stays visible)
    curArrows().forEach((a,i)=>beats.push({type:'move',i,phase:'battle'})); // 6 — answer, then the BATTLE PLAYS
    pushCap(d.whatHappened,{phase:'after'});            // 7 — then what actually happened
    pushCap(d.debrief||d.lesson,{gold:true,phase:'lesson'}); // 8 — USAWC-level debrief
    const disc=d.discuss||(d.question?[d.question]:[]); // 9 — discussion question(s) to drive reflection
    (Array.isArray(disc)?disc:[disc]).forEach(q=>{ if(q)beats.push({type:'cap',text:q,discuss:true,phase:'discuss'}); });
  } else { // overlook stand: a big-idea frame up front + a one-line takeaway lesson, bracketing the scene
    if(s&&s.bigIdea) beats.push({type:'cap',text:s.bigIdea,gold:true,lens:true,phase:'frame'});
    pushCap(contextText(),{phase:'scene'});
    curArrows().forEach((a,i)=>beats.push({type:'move',i,phase:'battle'}));
    if(s&&s.takeaway) beats.push({type:'cap',text:s.takeaway,gold:true,phase:'lesson'});
  }
  return beats;
}
// ---- Unit FATE: a formation can be captured / destroyed / broken, not just moved ----
function clearFate(g){ if(!g)return; g.style.opacity=""; g.querySelectorAll(".unit-fate").forEach(e=>e.remove()); }
function applyFate(g,fate){ if(!g||!fate)return; clearFate(g);
  const k=(""+fate).toLowerCase();
  const m=S("g",{class:"unit-fate"});
  if(/destroy|wreck|annihil|shatter|overrun/.test(k)){ g.style.opacity=".42";
    m.appendChild(S("line",{x1:-15,y1:-11,x2:15,y2:11,stroke:"#ef5350","stroke-width":2.6,"stroke-linecap":"round"}));
    m.appendChild(S("line",{x1:-15,y1:11,x2:15,y2:-11,stroke:"#ef5350","stroke-width":2.6,"stroke-linecap":"round"}));
  } else { g.style.opacity=(/captur|surrender/.test(k))?".5":".58";
    const lab=/captur|surrender/.test(k)?"⚑ captured":(/rout/.test(k)?"routed":"broken");
    const t=S("text",{x:0,y:-15,"text-anchor":"middle","font-size":7.5,"font-weight":"800",fill:/captur/.test(k)?"#e7b955":"#e6a59c"});
    t.setAttribute("paint-order","stroke");t.setAttribute("stroke","#000");t.setAttribute("stroke-width","2.4"); t.textContent=lab; m.appendChild(t); }
  g.appendChild(m);
}
// reset every on-map unit to its placed position + clear any fate (so cumulative state is correct on step back)
function resetUnits(){ if(!G.units)return; G.units.querySelectorAll(".unit").forEach(g=>{
  const ox=g.getAttribute("data-ox"),oy=g.getAttribute("data-oy"),sc=g.getAttribute("data-sc")||1;
  if(ox!=null) g.setAttribute("transform",`translate(${ox},${oy}) scale(${sc})`); g.style.display=""; clearFate(g); }); }
function unitMoveName(a){ return (a.lbl||"").split("→")[0].split("(")[0].split("—")[0].split("/")[0].trim(); }
function findUnitByName(nm){ if(!G.units||!nm)return null; const ln=nm.toLowerCase();
  const all=[...G.units.querySelectorAll(".unit")];
  return all.find(g=>(g.getAttribute("data-name")||"").toLowerCase()===ln)
      || all.find(g=>{const n=(g.getAttribute("data-name")||"").toLowerCase(); return n&&(ln.startsWith(n)||n.startsWith(ln));}) || null; }
function curXY(g){ const t=(g.getAttribute("transform")||"").match(/translate\(([-\d.]+)[ ,]+([-\d.]+)\)/); return t?[+t[1],+t[2]]:[0,0]; }
function setUnitPos(g,x,y,sc){ g.setAttribute("transform",`translate(${x},${y}) scale(${sc})`); }
// Emphasis marker (a fallen commander / point of note) — pulsing gold ring + cross + label.
function makeEmphasis(e){ const p=TC(e.x,e.y), g=S("g",{class:"emph"}); g.style.pointerEvents="none";
  const ring=S("circle",{cx:p[0],cy:p[1],r:13,fill:"none",stroke:"#e7b955","stroke-width":2.8});
  ring.appendChild(S("animate",{attributeName:"r",values:"12;22;12",dur:"1.9s",repeatCount:"indefinite"}));
  ring.appendChild(S("animate",{attributeName:"opacity",values:"1;.15;1",dur:"1.9s",repeatCount:"indefinite"}));
  g.appendChild(ring);
  g.appendChild(S("circle",{cx:p[0],cy:p[1],r:8,fill:"#7a1f1f",stroke:"#f7f1df","stroke-width":1.8}));
  g.appendChild(S("line",{x1:p[0]-4,y1:p[1]-4,x2:p[0]+4,y2:p[1]+4,stroke:"#fff","stroke-width":2.2}));
  g.appendChild(S("line",{x1:p[0]-4,y1:p[1]+4,x2:p[0]+4,y2:p[1]-4,stroke:"#fff","stroke-width":2.2}));
  const t=S("text",{x:p[0],y:p[1]-24,"text-anchor":"middle","font-size":12.5,"font-weight":"800",fill:"#f1cf6c","paint-order":"stroke",stroke:"#000","stroke-width":3.4});
  t.textContent=e.label; g.appendChild(t); return g;
}
// Keep OPPOSING (adversarial) counters from stacking — nudge them apart so contact is legible.
// Declutter EVERY symbol on the map — placed units AND moving tokens (which live in a different layer) AND
// artillery markers — so no counter is ever hidden behind another. Friend or foe: contact must read as a CLUSTER.
// Spring-relax a set of symbols apart (each ≥ one counter-width). Returns the info array with resolved .p.
// `fixed` symbols never move (others yield around them); otherwise the one further from its origin yields more.
function relaxSymbols(list){
  const info=list.map(g=>{ const p=curXY(g), ox=+g.getAttribute("data-ox"), oy=+g.getAttribute("data-oy");
    return {g,fixed:!!g._declFixed,sc:+(g.getAttribute("data-sc")||2),p,ox:isNaN(ox)?p[0]:ox,oy:isNaN(oy)?p[1]:oy}; });
  for(let pass=0;pass<60;pass++){ let moved=false;
    for(let i=0;i<info.length;i++)for(let j=i+1;j<info.length;j++){ const A=info[i],B=info[j]; if(A.fixed&&B.fixed)continue;
      let dx=B.p[0]-A.p[0],dy=B.p[1]-A.p[1],d=Math.hypot(dx,dy); const minD=17*(A.sc+B.sc)+3; // sum of half-widths → a smaller token needs less room
      if(d<minD){ if(d<0.5){const a=i*2.39996;dx=Math.cos(a);dy=Math.sin(a);d=1;} const need=minD-d,ux=dx/d,uy=dy/d;
        const da=Math.hypot(A.p[0]-A.ox,A.p[1]-A.oy)+4, db=Math.hypot(B.p[0]-B.ox,B.p[1]-B.oy)+4, tot=da+db;
        let wa=da/tot, wb=db/tot; if(A.fixed){wa=0;wb=1;} else if(B.fixed){wa=1;wb=0;}
        A.p=[A.p[0]-ux*need*wa,A.p[1]-uy*need*wa]; B.p=[B.p[0]+ux*need*wb,B.p[1]+uy*need*wb]; moved=true; } }
    if(!moved)break; }
  return info;
}
// Once per stand: play every move to the final (most-crowded) layout, declutter it, and store each named unit's
// fixed offset from its raw target. Applying that SAME offset at every beat means a unit only ever travels along
// its own arrow — it never bounces as neighbours come and go (the cross-beat jitter is gone), yet the end stays clean.
function computeDeclutterOffsets(){
  state._declOff=new Map(); if(!G.units)return;
  const arrows=curArrows(); resetUnits(); const temps=[];
  arrows.forEach(a=>{ const g=findUnitByName(unitMoveName(a)); const to=TC(a.to[0],a.to[1]);
    if(g){ setUnitPos(g,to[0],to[1],+(g.getAttribute("data-sc")||2)); }
    else if(G.arrows){ // phantom token at its destination so the named formations leave room for it
      const t=makeUnit({side:a.side==="union"?"union":"conf",ech:"bde",name:"",sub:"",x:to[0],y:to[1],noLabel:true},1.55);
      const w=S("g",{}); w.appendChild(t); G.arrows.appendChild(w); temps.push(w); }
  });
  const named=[...G.units.querySelectorAll(".unit")], tokens=temps.map(w=>w.firstChild);
  const raw=new Map(); named.forEach(g=>raw.set(g,curXY(g)));
  named.concat(tokens).forEach(g=>g._declFixed=false);
  relaxSymbols(named.concat(tokens)).forEach(o=>{ const nm=o.g.getAttribute("data-name"); if(nm){ const r=raw.get(o.g); state._declOff.set(nm,[o.p[0]-r[0],o.p[1]-r[1]]); } });
  temps.forEach(w=>w.remove()); resetUnits();
}
function ensureOffsets(){ if(state._declStand!==curStandId){ computeDeclutterOffsets(); state._declStand=curStandId; } }
function offsetFor(name){ const o=state._declOff&&state._declOff.get(name); return o?o:[0,0]; }
// Shift each STATIONARY named unit by its fixed offset (movers already carry it via their animated target).
function applyStaticOffsets(movedNames){ if(!G.units)return;
  G.units.querySelectorAll(".unit").forEach(g=>{ const nm=g.getAttribute("data-name"); if(!nm||(movedNames&&movedNames.has(nm)))return;
    const off=offsetFor(nm); if(off[0]||off[1]){ const p=curXY(g); setUnitPos(g,Math.round(p[0]+off[0]),Math.round(p[1]+off[1]),+(g.getAttribute("data-sc")||2)); } });
}
// Anonymous attack tokens live in a separate layer — push them clear of the named counters. Tokens yield almost
// entirely; named counters give only a hair (≤~10% of an overlap) so a token wedged in a tight cluster still has
// somewhere to go, without the named formation visibly shifting. Named-vs-named spacing is left to the fixed offsets.
// Per-beat de-stack of EVERY symbol (named units + tokens). Each yields in proportion to how far it has moved
// from its origin: a stationary defender holds, an advancing unit (or a token) slides aside — so contact never
// stacks at ANY beat, while units that aren't moving don't jitter.
function declutterAll(){ if(!G.units)return;
  const mv=state._movedNames||null;
  const named=[...G.units.querySelectorAll(".unit")].filter(g=>g.style.display!=="none");
  const toks=G.arrows?[...G.arrows.querySelectorAll(".unit")].filter(g=>g.style.display!=="none"):[];
  // tok = faceless attack token; moved = a named unit that advances via an arrow this stand (vs a stationary defender)
  const info=named.map(g=>{const nm=g.getAttribute("data-name");return {g,p:curXY(g),sc:+(g.getAttribute("data-sc")||2),tok:false,moved:!!(mv&&mv.has(nm))};})
    .concat(toks.map(g=>({g,p:curXY(g),sc:+(g.getAttribute("data-sc")||2),tok:true,moved:true})));
  for(let pass=0;pass<44;pass++){ let moved=false;
    for(let i=0;i<info.length;i++)for(let j=i+1;j<info.length;j++){ const A=info[i],B=info[j];
      let dx=B.p[0]-A.p[0],dy=B.p[1]-A.p[1],d=Math.hypot(dx,dy); const minD=17*(A.sc+B.sc)+3;
      if(d>=minD)continue;
      // who yields: a token yields to a named unit; a moving unit yields to a stationary defender; else split.
      let wa=0.5,wb=0.5;
      if(A.tok!==B.tok){ wa=A.tok?1:0; wb=B.tok?1:0; }
      else if(A.moved!==B.moved){ wa=A.moved?1:0; wb=B.moved?1:0; }
      if(d<0.5){const an=i*2.39996;dx=Math.cos(an);dy=Math.sin(an);d=1;}
      const need=minD-d,ux=dx/d,uy=dy/d;
      A.p=[A.p[0]-ux*need*wa,A.p[1]-uy*need*wa]; B.p=[B.p[0]+ux*need*wb,B.p[1]+uy*need*wb]; moved=true; }
    if(!moved)break; }
  info.forEach(o=>setUnitPos(o.g,Math.round(o.p[0]),Math.round(o.p[1]),o.sc));
}
// During a move's animation: push the travelling counter off anything it would slide OVER, so it veers around
// other units instead of passing through them (the endpoints are already clean; this fixes the path between).
function nudgeMover(g){ if(!g||!G.units)return;
  let p=curXY(g); const sc=+(g.getAttribute("data-sc")||2);
  const others=[...G.units.querySelectorAll(".unit")].concat(G.arrows?[...G.arrows.querySelectorAll(".unit")]:[])
    .filter(o=>o!==g&&o.style.display!=="none").map(o=>({p:curXY(o),sc:+(o.getAttribute("data-sc")||2)}));
  for(let pass=0;pass<6;pass++){ let moved=false;
    for(const o of others){ let dx=p[0]-o.p[0],dy=p[1]-o.p[1],d=Math.hypot(dx,dy); const minD=17*(sc+o.sc)+3;
      if(d<minD){ if(d<0.5){dx=1;dy=0;d=1;} const push=minD-d; p=[p[0]+dx/d*push,p[1]+dy/d*push]; moved=true; } }
    if(!moved)break; }
  setUnitPos(g,Math.round(p[0]),Math.round(p[1]),sc);
}
function animateMove(i,instant){
  clearTimeout(_moveHold);
  const arrows=curArrows(); if(i<0||i>=arrows.length)return;
  const a=arrows[i]; let to=TC(a.to[0],a.to[1]);
  const cap=$("#moveCaption"); if(cap){cap.textContent=a.narr||a.lbl||curStep().title; cap.classList.remove("hidden"); cap.style.opacity="";}
  // Prefer moving the ACTUAL on-map unit (it persists at its new spot — no ghost, no vanishing).
  const unitG=findUnitByName(unitMoveName(a)), sc=unitG?(unitG.getAttribute("data-sc")||2):1.55;
  // (units snap to their hex on arrival — animate to the raw arrow destination)
  let mover=unitG, from;
  if(unitG){ from=curXY(unitG); }
  else { // fallback: a transient token for movements that aren't one of the placed units
    const uside=a.side==="union"?"union":"conf";
    const tok=S("g",{}); tok.style.pointerEvents="none"; G.arrows.appendChild(tok); _beatTok.push(tok);
    mover=makeUnit({side:uside,ech:"bde",name:"",sub:"",x:TC(a.from[0],a.from[1])[0],y:TC(a.from[0],a.from[1])[1],noLabel:true},1.55); tok.appendChild(mover);
    from=TC(a.from[0],a.from[1]);
  }
  const setT=(x,y)=>mover.setAttribute("transform",`translate(${x},${y}) scale(${sc})`);
  if(unitG)clearFate(unitG);
  if(instant){ setT(to[0],to[1]); if(unitG&&a.fate)applyFate(unitG,a.fate); return; }
  state._activeMover = unitG?unitG.getAttribute("data-name"):null; // this is the unit arriving this beat — it yields in the declutter; everyone else holds
  clearHighlights(); highlightUnit(mover); // the moving formation is the key point right now
  // Decouple reading from motion: hold the caption on a STILL map, let the reader read, THEN the unit moves.
  const words=(a.narr||a.lbl||'').split(/\s+/).filter(Boolean).length;
  const readHold=_auto?Math.min(800,Math.max(280,words*90)):100;
  const runMove=()=>{ cancelAnimationFrame(_beatRAF);
    // hex-to-hex: route a PATH from the unit's current hex to its destination hex that goes AROUND every hex held by
    // another counter, then glide through the path's centers. No straight-line slide over an enemy; lands on the grid.
    const startP=curXY(mover), startHex=pixelToHex(startP[0],startP[1]), occ=new Set();
    G.units.querySelectorAll(".unit").forEach(g=>{ if(g!==mover){const p=curXY(g);occ.add(pixelToHex(p[0],p[1]).join(","));} });
    if(G.arrows)G.arrows.querySelectorAll(".unit").forEach(g=>{ if(g!==mover){const p=curXY(g);occ.add(pixelToHex(p[0],p[1]).join(","));} });
    const destHex=nearestFreeHex(pixelToHex(to[0],to[1]),occ);
    const hp=hexPath(startHex,destHex,occ), pts=hp.map(h=>hexCenterPx(h[0],h[1]));
    if(pts.length<2)pts.unshift(startP);
    const t0=performance.now(),dur=1400,segs=pts.length-1;
    (function frame(now){ const t=Math.min(1,(now-t0)/dur),e=EASE_INOUT(t), at=e*segs, i=Math.min(segs-1,Math.floor(at)), f=at-i;
      const p0=pts[i],p1=pts[i+1]; setT(p0[0]+(p1[0]-p0[0])*f, p0[1]+(p1[1]-p0[1])*f);
      clearMover(mover); // keep clearance from any counter passed mid-glide
      if(t<1)_beatRAF=requestAnimationFrame(frame); else { if(unitG&&a.fate)applyFate(unitG,a.fate); snapAllToHexes(); maybeAutoAdvance(); }
    })(t0);
  };
  _moveHold=setTimeout(runMove,readHold);
}
function capDwell(bt){ // reading-pace-grounded dwell (~130 wpm reading while watching the map)
  const words=(bt.text||'').split(/\s+/).filter(Boolean).length;
  const per=bt.lens?300:(bt.gold||bt.discuss?520:460); // lens = quick organizer; lesson/discuss linger; prose = comfortable
  return Math.min(9000,Math.max(2600,900+words*per));
}
function showUpTo(target){ // rebuild the scene through beat `target` (earlier instant, last animated)
  cancelAnimationFrame(_beatRAF); clearTimeout(_moveHold); _beatTok.forEach(t=>t&&t.remove()); _beatTok=[]; closeDecisionCard(); closeChoice();
  ensureOffsets(); // fixed declutter offsets for this stand (computed once)
  resetUnits(); clearHighlights(); // units start placed; the moves below carry the ones that move (they persist at their new spots)
  const beats=state._beats||[], cap=$("#moveCaption"), movedNames=new Set();
  state._activeMover=null; // set by the beat's animated move; declutter only lets that unit + tokens yield
  if(cap)cap.style.opacity="";
  if(target<0){ if(cap)cap.classList.add("hidden"); return; }
  for(let k=0;k<=target;k++){ const bt=beats[k]; if(!bt)continue;
    if(bt.type==='move'){ const a2=curArrows()[bt.i]||{}, mg=findUnitByName(unitMoveName(a2)); // only a real advance counts as "moved" (an in-place capture/fate marker stays a stationary defender)
      if(mg && a2.from && a2.to && Math.hypot(a2.to[0]-a2.from[0],a2.to[1]-a2.from[1])>15) movedNames.add(mg.getAttribute("data-name")); animateMove(bt.i, k<target); } // cumulative: earlier moves snap to their end, current animates
    else if(bt.type==='cap' && k===target){ if(cap){cap.innerHTML=bt.discuss?`<span class="cap-discuss">❖ Discuss · ${bt.text}</span>`:(bt.gold?`<span class="cap-gold">${bt.text}</span>`:bt.text); cap.classList.remove("hidden");} highlightForText(bt.text);
      if(_auto){ if(target<beats.length-1){ clearTimeout(_beatTimer); _beatTimer=setTimeout(()=>{ if(_auto)nextBeat(); },capDwell(bt)); } else { _auto=false; setPlayBtn(); updateStepBar(); } } }
    else if(bt.type==='choice' && k===target){ if(cap)cap.classList.add("hidden"); showChoice(bt.key); }  // pauses for your call — map stays visible
  }
  state._movedNames=movedNames; snapAllToHexes(); // one counter per hex — discrete positions replace the declutter heuristics
}
function clearBeats(){ cancelAnimationFrame(_beatRAF); clearTimeout(_beatTimer); clearTimeout(_moveHold); _auto=false; _beatTok.forEach(t=>t&&t.remove()); _beatTok=[]; const cap=$("#moveCaption"); if(cap){cap.classList.add("hidden");cap.style.opacity="";} closeDecisionCard(); closeChoice(); setPlayBtn(); }
function startBeats(autoplay){ clearBeats(); state._beats=buildBeats(); state.beat=-1; _auto=!!autoplay; updateStepBar(); setPlayBtn();
  // map frames first, then the narration begins over it (nothing blocks the battlefield)
  if(autoplay&&state._beats.length){ _beatTimer=setTimeout(()=>{ if(state.beat===-1)nextBeat(); },650); } }
function nextBeat(){
  clearTimeout(_beatTimer);
  const beats=state._beats||[];
  if(state.beat < beats.length-1){ state.beat++; showUpTo(state.beat); updateStepBar(); }
  else if(state.tour && state.standIdx < state.tour.stops.length-1){ _auto=false; setPlayBtn(); tourNext(); }
  else if(state.tour){ _auto=false; setPlayBtn(); showTourComplete(); } // last beat of last stand → explicit end
}
function showTourComplete(){ const o=overlay();o.id="tourdone";
  o.innerHTML=`<div class="modal"><div class="mhead"><h3>✓ End of tour — ${t_name()}</h3><button class="mclose">✕</button></div>
   <div class="mbody"><p style="margin:0 0 12px">You've walked all ${state.tour.stops.length} stands of <b>${t_name()}</b>. The battlefield is the impetus — the lessons travel with you.</p>
   <button class="btn-go" id="tcReplay">↻ Replay this tour</button>
   <button class="tour-card free" data-t="" style="margin-top:8px"><div class="ic">🧭</div><div><h3>Choose another tour</h3><p>Pick a different route or free-explore the field.</p></div></button></div></div>`;
  o.querySelector(".mclose").onclick=()=>unmount(o);
  o.querySelector("#tcReplay").onclick=()=>{unmount(o);state.standIdx=0;activateStand(state.tour.stops[0]);};
  o.querySelector(".tour-card").onclick=()=>{unmount(o);welcome();};
  mount(o);
}
function prevBeat(){
  _auto=false; clearTimeout(_beatTimer); setPlayBtn();
  const beats=state._beats||[];
  if(state.beat >= 0){ state.beat--; showUpTo(state.beat); updateStepBar(); }
  else if(state.tour && state.standIdx>0){ tourPrev(); }
}
const PHASE_LABEL={frame:"Frame",scene:"The ground",choice:"Your call",battle:"The action",after:"What happened",lesson:"Lesson",discuss:"Discuss",step:"Step"};
function updateStepBar(){
  const beats=state._beats||[], n=beats.length, b=(state.beat==null?-1:state.beat);
  const dots=$("#stepDots");
  if(dots){
    // group consecutive beats of the same phase into ONE dot (fewer, meaningful steps)
    const groups=[]; beats.forEach((bt,i)=>{ const p=bt.phase||"step";
      if(!groups.length||groups[groups.length-1].p!==p) groups.push({p,start:i,end:i}); else groups[groups.length-1].end=i; });
    let h=""; groups.forEach(g=>{ const active=b>=g.start&&b<=g.end, done=b>g.end;
      h+=`<i class="${done?'sd done':(active?'sd on':'sd')}" data-b="${g.start}" title="${PHASE_LABEL[g.p]||'Step'}"></i>`; });
    dots.innerHTML=h; dots.querySelectorAll(".sd").forEach(d=>d.onclick=e=>{e.stopPropagation();goToBeat(+d.getAttribute("data-b"));});
  }
  // name the current phase right above the dots — consistent status, not bare dots
  const sp=$("#stepPhase"), cp=(beats[b]||{}).phase; if(sp)sp.textContent=cp?(PHASE_LABEL[cp]||""):"";
  const nb=$("#stepNext"); if(nb){ const last=(n===0)||(b>=n-1), lbl=nb.querySelector(".lbl"); // green "Next stand" ONLY at the true end of the stand
    if(lbl)lbl.textContent=last?"Next stand":"Next"; nb.classList.toggle("ready",last); nb.classList.toggle("go",last); }
}
function goToBeat(i){ const beats=state._beats||[]; if(i<0||i>=beats.length)return; // tap a dot to skip to that step
  _auto=false; clearTimeout(_beatTimer); clearTimeout(_moveHold); if(typeof setPlayBtn==="function")setPlayBtn();
  state.beat=i; showUpTo(i); updateStepBar(); }
window.goToBeat=goToBeat;
/* "Your Call" decision card */
function showSceneCard(key){
  const d=window.GB&&GB.decisionsCMH&&GB.decisionsCMH[key], el=$("#decisionCard"); if(!d||!d.scene||!el)return;
  const sc=d.scene;
  el.innerHTML=`<button class="dc-x" onclick="closeDecisionCard()">✕</button>
    <div class="dc-eyebrow">SET THE SCENE · ${d.side==="union"?"Union":"Confederate"}</div>
    <div class="dc-cmd">${sc.title||d.commander}</div>
    <div class="dc-line"><span class="dc-h">What you can see</span>${sc.see||""}</div>
    <div class="dc-line"><span class="dc-h">What you know</span>${sc.know||""}</div>
    ${sc.hidden?`<div class="dc-line"><span class="dc-h gold">Out of sight</span>${sc.hidden}</div>`:""}
    <button class="dc-continue" onclick="nextBeat()">Your decision ›</button>`;
  el.classList.remove("hidden"); el.scrollTop=0;
}
function showDecisionCard(key){
  const d=window.GB&&GB.decisionsCMH&&GB.decisionsCMH[key], el=$("#decisionCard"); if(!d||!el)return;
  el.innerHTML=`<button class="dc-x" onclick="closeDecisionCard()">✕</button>
    <div class="dc-eyebrow">⚔ YOUR CALL · ${d.side==="union"?"Union":"Confederate"}</div>
    <div class="dc-cmd">${d.commander}${d.time?" · "+d.time:""}</div>
    <div class="dc-sit">${d.situation}</div>
    <div class="dc-q">What do you do?</div>
    <div class="dc-opts">${d.options.map((o,i)=>`<button class="dc-opt" data-i="${i}">${o.label}</button>`).join("")}</div>`;
  el.classList.remove("hidden"); el.scrollTop=0;
  el.querySelectorAll(".dc-opt").forEach(btn=>btn.onclick=()=>revealDecision(key,+btn.dataset.i));
}
function revealDecision(key,pick){
  const d=GB.decisionsCMH[key], el=$("#decisionCard"); if(!d||!el)return;
  const o=d.options[pick]||{}, last=d.commander.split(" ").pop();
  const V={sound:["✓","Sound call","#6bb37e"],risky:["○","Defensible — but risky","#e2b14e"],wrong:["✗","Costly mistake","#d98a82"]};
  const v=V[o.verdict]||V.risky, matched=(pick===d.historicalIdx);
  el.innerHTML=`<button class="dc-x" onclick="closeDecisionCard()">✕</button>
    <div class="dc-verdict" style="color:${v[2]}">${v[0]} ${v[1]}</div>
    ${o.result?`<div class="dc-yourcall">${o.result}</div>`:""}
    <div class="dc-line"><span class="dc-h">${matched?"This is what "+last+" did":last+" chose otherwise"}</span>${d.whatHappened||""}</div>
    <div class="dc-line"><span class="dc-h gold">The lesson</span>${d.lesson||""}</div>
    ${d.question?`<div class="dc-line"><span class="dc-h">Discuss</span>${d.question}</div>`:""}
    <button class="dc-continue" onclick="nextBeat()">Continue the walk ›</button>`;
  el.scrollTop=0;
}
function closeDecisionCard(){ const el=$("#decisionCard"); if(el)el.classList.add("hidden"); }
window.nextBeat=nextBeat; window.prevBeat=prevBeat; window.startBeats=startBeats; window.clearBeats=clearBeats; window.closeDecisionCard=closeDecisionCard;

/* Opening "set the battle" splash: the whole field with key terrain labeled */
function battlefieldOverview(){
  svg.dataset.kind=""; rebuildMapSkeleton("field"); svg.dataset.kind="field";
  clear(G.units);clear(G.arrows);clear(G.hotspots);clear(G.iconic);
  ["Oak Hill","McPherson Ridge","Seminary Ridge","Cemetery Hill","Culp's Hill","Cemetery Ridge","Peach Orchard","The Wheatfield","Devil's Den","Little Round Top","Big Round Top"]
   .forEach(nm=>{const c=GB.iconSpots[nm];if(!c)return;const p=TC(c[0],c[1]);
     const g=S("g",{});
     g.appendChild(S("circle",{cx:p[0],cy:p[1],r:16,fill:"none",stroke:"#e7b955","stroke-width":2.5,class:"ipulse"}));
     g.appendChild(S("circle",{cx:p[0],cy:p[1],r:5,fill:"#e7b955",stroke:"#5a3d0a","stroke-width":1.2}));
     const t=S("text",{x:p[0],y:p[1]-22,"text-anchor":"middle","font-family":"var(--serif)","font-size":16,"font-weight":"700",fill:"#7a1f1f","paint-order":"stroke",stroke:"#f7f1df","stroke-width":3.8});
     t.textContent=nm;g.appendChild(t);G.iconic.appendChild(g);});
  svg.setAttribute("viewBox",`0 0 ${GB.fieldBase.w} ${GB.fieldBase.h}`);
  applyLayers();
  if(typeof setOpLineFocus==="function")setOpLineFocus(null,"overall"); // whole-field view: show the complete primary scheme
  const t3=$("#toggle3d");if(t3){t3.disabled=true;t3.style.opacity=.4;}
  $("#phaseBanner").innerHTML="<b>The Field at Gettysburg</b> &nbsp;·&nbsp; the ground the armies fought over";
  $("#clock").textContent="1–3 July 1863";
  $("#briefBody").innerHTML='<div class="eyebrow">Gettysburg Staff Ride</div><h2>The Field at Gettysburg</h2>'+
    '<p>This is the ground the armies fought over &mdash; the famous &ldquo;fishhook.&rdquo; Oak Hill and the western ridges where Day&nbsp;1 opened; the high ground of <b>Cemetery Hill</b> and <b>Culp&rsquo;s Hill</b>; the long shank of <b>Cemetery Ridge</b> running south to <b>Little</b> and <b>Big Round Top</b>; with the <b>Peach Orchard</b>, <b>Wheatfield</b>, and <b>Devil&rsquo;s Den</b> contested between the lines.</p>'+
    '<p style="color:var(--ink-dim)">Pick a tour to begin with Lee&rsquo;s march north, then walk the three days — the battle plays through on its own at each stand, with the captions narrating. On any battlefield day, use the <b>3D</b> button to study the terrain in relief.</p>';
}

/* ---------- Boot ---------- */
GB._imgmeta=window.__IMGMETA||{};
renderRail();battlefieldOverview();welcome();
