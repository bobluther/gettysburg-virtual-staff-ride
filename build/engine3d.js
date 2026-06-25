/* =====================================================================
   GETTYSBURG 3D TERRAIN VIEW  (three.js r128)
   Real elevation (USGS/Terrarium DEM) draped with the contour map,
   georeferenced so units/iconic spots sit on the true ground.
===================================================================== */
(function(){
if(typeof THREE==="undefined"){console.warn("three.js not loaded; 3D disabled");return;}
const D={active:false,inited:false,exag:1.4,vantage:{on:false,yaw:0,pitch:-0.06,lon:0,lat:0}};
window.GB3D=D;

function b64ToInt16(b64){const bin=atob(b64),len=bin.length,u=new Uint8Array(len);
  for(let i=0;i<len;i++)u[i]=bin.charCodeAt(i);return new Int16Array(u.buffer);}

let HEIGHTS,DEMW,DEMH,demBB,texBB,midLon,midLat,mPerLon,mPerLat,planeW,planeH;
function setupGeo(){
  const d=GB.dem; HEIGHTS=b64ToInt16(d.b64); DEMW=d.w; DEMH=d.h; demBB=d.bbox; texBB=GB.geo.tex;
  midLon=(texBB.W+texBB.E)/2; midLat=(texBB.S+texBB.N)/2;
  mPerLon=111320*Math.cos(midLat*Math.PI/180); mPerLat=111320;
  planeW=(texBB.E-texBB.W)*mPerLon; planeH=(texBB.N-texBB.S)*mPerLat;
}
const clamp=(v,a,b)=>v<a?a:(v>b?b:v);
function sampleH(lon,lat){
  let u=(lon-demBB.W)/(demBB.E-demBB.W), v=(lat-demBB.S)/(demBB.N-demBB.S);
  u=clamp(u,0,1); v=clamp(v,0,1);
  const gx=Math.min(DEMW-1,Math.round(u*(DEMW-1))), gy=Math.min(DEMH-1,Math.round((1-v)*(DEMH-1)));
  return HEIGHTS[gy*DEMW+gx];
}
function old2ll(x,y){const g=GB.geo.old2ll;return [g.a*x+g.b*y+g.c, g.d*x+g.e*y+g.f];}
function world(lon,lat){return {x:(lon-midLon)*mPerLon, z:-(lat-midLat)*mPerLat};}
function worldH(lon,lat){return sampleH(lon,lat)*D.exag;}

let renderer,scene,camera,canvas,markers,terrainMesh,minElev=0;
let cam={r:0,theta:Math.PI,phi:0.92,tx:0,ty:0,tz:0}; // spherical around target

function buildTerrain(){
  const segX=176,segZ=300;
  const geo=new THREE.PlaneGeometry(planeW,planeH,segX,segZ);
  const pos=geo.attributes.position;
  for(let i=0;i<pos.count;i++){
    const px=pos.getX(i),py=pos.getY(i);
    const lon=midLon+px/mPerLon, lat=midLat+py/mPerLat;
    pos.setZ(i, sampleH(lon,lat)*D.exag);
  }
  geo.rotateX(-Math.PI/2); geo.computeVertexNormals();
  // contour texture drape
  const tex=new THREE.Texture(); const im=new Image();
  im.onload=()=>{tex.image=im;tex.needsUpdate=true;};
  im.src=(window.GBASSETS&&GBASSETS.field_base)||"";
  tex.wrapS=tex.wrapT=THREE.ClampToEdgeWrapping; tex.anisotropy=4;
  // tint the washed-out white contour map to an earthier tone so relief shading + units read against it
  const mat=new THREE.MeshStandardMaterial({map:tex,color:0x9d8f6d,roughness:0.98,metalness:0.0});
  terrainMesh=new THREE.Mesh(geo,mat); scene.add(terrainMesh);
  // base skirt for depth
  minElev=GB.dem.min*D.exag;
  addTrees();
}
function _prand(i){const x=Math.sin(i*12.9898)*43758.5453;return x-Math.floor(x);}
function addTrees(){
  if(!(window.GBASSETS&&GBASSETS.woods))return;
  const im=new Image();
  im.onload=()=>{
    const iw=im.naturalWidth,ih=im.naturalHeight;
    const cv=document.createElement("canvas");cv.width=iw;cv.height=ih;const cx=cv.getContext("2d");
    cx.drawImage(im,0,0);let data;try{data=cx.getImageData(0,0,iw,ih).data;}catch(e){return;}
    const cone=new THREE.ConeGeometry(1,1,6);
    const mat=new THREE.MeshStandardMaterial({color:0x35522b,roughness:1,metalness:0,flatShading:true});
    const GX=104,GY=Math.round(GX*planeH/planeW),max=GX*GY;
    const inst=new THREE.InstancedMesh(cone,mat,max);
    const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),pos=new THREE.Vector3();
    let n=0;
    for(let gy=0;gy<GY;gy++)for(let gx=0;gx<GX;gx++){
      const u=(gx+0.5)/GX,v=(gy+0.5)/GY;
      const ju=u+(_prand(gx*7+gy*101)-0.5)/GX, jv=v+(_prand(gx*53+gy*13)-0.5)/GY;
      const ix=Math.min(iw-1,Math.max(0,Math.floor(ju*iw))), iy=Math.min(ih-1,Math.max(0,Math.floor((1-jv)*ih)));
      if(data[(iy*iw+ix)*4+3]<40)continue;
      if(_prand(gx*31+gy*17)>0.60)continue; // thin the canopy (sparser → reads as woods, not a spike field)
      const lon=texBB.W+ju*(texBB.E-texBB.W), lat=texBB.S+jv*(texBB.N-texBB.S);
      const w=world(lon,lat), h=worldH(lon,lat);
      const th=26+_prand(gx+gy*3)*24, r=10+_prand(gx*3+gy)*7; // low, slender — ground cover not towers
      pos.set(w.x,h+th*0.5,w.z);sc.set(r,th,r);m4.compose(pos,q,sc);
      inst.setMatrixAt(n++,m4); if(n>=max)break;
    }
    inst.count=n;inst.instanceMatrix.needsUpdate=true;inst.castShadow=false;scene.add(inst);D.trees=inst;
  };
  im.src=GBASSETS.woods;
}

function makeSprite(text,bg,fg,wMeters){
  const pad=10,fs=42,cv=document.createElement("canvas"),ctx=cv.getContext("2d");
  ctx.font="700 "+fs+"px -apple-system,Arial";
  const tw=ctx.measureText(text).width;
  cv.width=tw+pad*2+8; cv.height=fs+pad*2;
  const c=cv.getContext("2d");
  c.font="700 "+fs+"px -apple-system,Arial";
  c.fillStyle=bg; roundRect(c,2,2,cv.width-4,cv.height-4,12); c.fill();
  c.lineWidth=3; c.strokeStyle="rgba(0,0,0,.55)"; roundRect(c,2,2,cv.width-4,cv.height-4,12); c.stroke();
  c.fillStyle=fg; c.textBaseline="middle"; c.fillText(text,pad+4,cv.height/2+2);
  const tx=new THREE.CanvasTexture(cv); tx.anisotropy=4;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,depthTest:true,depthWrite:false}));
  const scale=wMeters||320; sp.scale.set(scale, scale*cv.height/cv.width, 1);
  return sp;
}
function roundRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}

// A vertical "tile": the actual NATO-style counter (blue/red, branch glyph) + name label, as a standing billboard.
function unitTile(u){
  const W=130,H=150,S=2,cv=document.createElement("canvas");cv.width=W*S;cv.height=H*S;
  const c=cv.getContext("2d");c.scale(S,S);
  const union=u.side==="union";
  const fill=union?"#21466b":"#7a241c",border=union?"#9fc1e8":"#e6a59c",glyph=union?"#dbe8f7":"#f5d3cd";
  const cw=118,ch=78,cx=(W-cw)/2,cy=4;
  c.fillStyle="rgba(0,0,0,.35)";roundRect(c,cx+3,cy+4,cw,ch,9);c.fill();          // drop shadow
  c.fillStyle=fill;roundRect(c,cx,cy,cw,ch,9);c.fill();
  c.lineWidth=3.5;c.strokeStyle=border;roundRect(c,cx,cy,cw,ch,9);c.stroke();
  c.strokeStyle=glyph;c.lineWidth=6;c.lineCap="round";c.fillStyle=glyph;
  const gx=cx+12,gy=cy+12,gw=cw-24,gh=ch-24;
  if(u.ech==="cav"){c.beginPath();c.moveTo(gx,gy+gh);c.lineTo(gx+gw,gy);c.stroke();}
  else if(u.ech==="arty"){c.beginPath();c.arc(cx+cw/2,cy+ch/2,10,0,7);c.fill();}
  else{c.beginPath();c.moveTo(gx,gy);c.lineTo(gx+gw,gy+gh);c.moveTo(gx+gw,gy);c.lineTo(gx,gy+gh);c.stroke();}
  // echelon ticks
  c.fillStyle=border;c.font="700 13px -apple-system,Arial";c.textAlign="center";c.fillText(ECH[u.ech]||"",cx+cw/2,cy-1+0);
  // name plate
  c.fillStyle="rgba(13,17,23,.92)";roundRect(c,3,cy+ch+5,W-6,32,7);c.fill();
  c.lineWidth=1;c.strokeStyle=border;roundRect(c,3,cy+ch+5,W-6,32,7);c.stroke();
  c.fillStyle="#fff";c.font="700 20px -apple-system,Arial";c.textBaseline="middle";
  c.fillText(u.name, W/2, cy+ch+5+17, W-12);
  const tx=new THREE.CanvasTexture(cv);tx.anisotropy=4;return {tex:tx,aspect:W/H};
}

function stem(x,h0,h1,z,col){
  const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x,h0,z),new THREE.Vector3(x,h1,z)]);
  return new THREE.Line(g,new THREE.LineBasicMaterial({color:col}));
}

const UNI={fill:"#21466b",ink:"#dcebfb"},CON={fill:"#6e2620",ink:"#f6ddd6"};
function update(){
  if(!D.inited||!markers)return;
  while(markers.children.length)markers.remove(markers.children[0]);
  const s=STEPS[state.i]; if(!s||s.map!=="field")return;
  // units → STATIC counter tiles at their stand positions (terrain-analysis view; no maneuver to QA)
  (s.units||[]).forEach(u=>{
    const ll=old2ll(u.x,u.y), w=world(ll[0],ll[1]), h=worldH(ll[0],ll[1]);
    const t=unitTile(u), tileH=148, tileW=tileH*t.aspect;
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t.tex,depthTest:true,depthWrite:false,transparent:true}));
    sp.scale.set(tileW,tileH,1); sp.center.set(0.5,0);
    sp.position.set(w.x, h+12, w.z); markers.add(sp);
  });
  // iconic
  const ic=(GB.phaseIcons&&GB.phaseIcons[s.m])||[];
  ic.forEach(nm=>{const c=GB.iconSpots[nm];if(!c)return;
    const ll=old2ll(c[0],c[1]),w=world(ll[0],ll[1]),h=worldH(ll[0],ll[1]);
    const pillarH=140;
    const cyl=new THREE.Mesh(new THREE.CylinderGeometry(10,10,pillarH,12),
      new THREE.MeshBasicMaterial({color:0xe7b955,transparent:true,opacity:0.5}));
    cyl.position.set(w.x,h+pillarH/2,w.z); markers.add(cyl);
    const sp=makeSprite("◆ "+nm, "#3a2a08", "#ffd874", 200);
    sp.position.set(w.x,h+pillarH+40,w.z); markers.add(sp);
  });
  // photo hotspots
  (s.hotspots||[]).forEach(k=>{const hp=GB.hotspotPos[k];if(!hp)return;
    const ll=old2ll(hp.x,hp.y),w=world(ll[0],ll[1]),h=worldH(ll[0],ll[1]);
    const sp=makeSprite("📷", "#15110a", "#c9a14a", 240); sp.userData.photo=k;
    sp.position.set(w.x,h+220,w.z); markers.add(sp);
  });
}

function applyCam(){
  if(D.vantage.on){
    const w=world(D.vantage.lon,D.vantage.lat), eye=worldH(D.vantage.lon,D.vantage.lat)+140;
    camera.position.set(w.x,eye,w.z);
    const y=D.vantage.yaw,pt=D.vantage.pitch,L=2000;
    camera.lookAt(w.x+Math.sin(y)*Math.cos(pt)*L, eye+Math.sin(pt)*L, w.z-Math.cos(y)*Math.cos(pt)*L);
    return;
  }
  const t=new THREE.Vector3(cam.tx,cam.ty,cam.tz);
  camera.position.set(
    t.x+cam.r*Math.sin(cam.phi)*Math.sin(cam.theta),
    t.y+cam.r*Math.cos(cam.phi),
    t.z+cam.r*Math.sin(cam.phi)*Math.cos(cam.theta));
  camera.lookAt(t);
}
function resize(){
  if(!renderer)return;const st=$("#stage"),w=st.clientWidth,h=st.clientHeight;
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
}

function init(){
  canvas=$("#canvas3d");
  setupGeo();
  renderer=new THREE.WebGLRenderer({canvas,antialias:true});
  renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
  scene=new THREE.Scene(); scene.background=new THREE.Color(0x0d1117);
  scene.fog=new THREE.Fog(0x0d1117, planeH*1.1, planeH*3.2);
  camera=new THREE.PerspectiveCamera(45,1,2,planeH*6);
  const amb=new THREE.AmbientLight(0xffffff,0.5); scene.add(amb);
  const sun=new THREE.DirectionalLight(0xfff1d8,1.15); sun.position.set(-0.9,0.7,0.45); scene.add(sun); // eased so the map isn't blown out; lower angle = stronger relief shadows
  const sky=new THREE.HemisphereLight(0xbfd4ff,0x3a3024,0.26); scene.add(sky);
  buildTerrain();
  markers=new THREE.Group(); scene.add(markers);
  // frame camera on terrain — low oblique angle so relief reads
  cam.ty=(GB.dem.min+(GB.dem.max-GB.dem.min)*0.3)*D.exag; cam.r=planeH*0.62; cam.theta=Math.PI; cam.phi=1.34; // closer + low grazing angle so gentle relief reads at true scale
  applyCam(); resize();
  bindControls();
  D.inited=true;
}

function bindControls(){
  let drag=false,pan=false,lx,ly;
  canvas.addEventListener("pointerdown",e=>{drag=true;pan=e.shiftKey||e.button===2;lx=e.clientX;ly=e.clientY;canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener("pointermove",e=>{if(!drag)return;const dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;
    if(D.vantage.on){D.vantage.yaw+=dx*0.005;D.vantage.pitch=clamp(D.vantage.pitch-dy*0.005,-0.55,0.55);applyCam();updateHud();return;}
    if(pan){const k=cam.r*0.0011;const cs=Math.cos(cam.theta),sn=Math.sin(cam.theta);
      cam.tx-=(dx*cs)*k; cam.tz+=(dx*sn)*k; cam.tx-=(dy*sn)*k*0.6; cam.tz-=(dy*cs)*k*0.6;}
    else{cam.theta-=dx*0.005; cam.phi=clamp(cam.phi-dy*0.005,0.18,1.45);}
    applyCam();});
  canvas.addEventListener("pointerup",()=>{drag=false;});
  canvas.addEventListener("contextmenu",e=>e.preventDefault());
  canvas.addEventListener("wheel",e=>{e.preventDefault();cam.r=clamp(cam.r*(e.deltaY<0?0.9:1.111),planeH*0.12,planeH*3);applyCam();},{passive:false});
  // click photo sprites
  const ray=new THREE.Raycaster();
  canvas.addEventListener("click",e=>{
    const r=canvas.getBoundingClientRect();
    const m=new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1, -((e.clientY-r.top)/r.height)*2+1);
    ray.setFromCamera(m,camera);
    const hit=ray.intersectObjects(markers.children.filter(o=>o.userData&&o.userData.photo),true);
    if(hit.length&&typeof openPhoto==="function")openPhoto(hit[0].object.userData.photo);
  });
}

let raf,_lastI=-2;
function animate(){ if(!D.active)return; raf=requestAnimationFrame(animate);
  if(state.i!==_lastI){ _lastI=state.i; update(); }   // stand changed → rebuild static tiles
  renderer.render(scene,camera);
}

D.toggle=function(on){
  const want = on==null ? !D.active : on;
  const s=STEPS[state.i];
  if(want && (!s||s.map!=="field")){toast("3D terrain is available on the battlefield (Day 1–3)");return;}
  D.active=want;
  $("#canvas3d").classList.toggle("hidden",!D.active);
  $("#toggle3d").classList.toggle("on",D.active);
  $("#toggle3d").textContent=D.active?"2D":"3D";
  if(D.active){ if(!D.inited)init(); resize(); update(); animate();
    const st=state._stand; if(st&&st.id&&typeof vantageStand==="function")vantageStand(st.id); } // open from the stand, looking over the battle
  else { cancelAnimationFrame(raf); D.exitVantage&&D.exitVantage(); }
};
function bear2compass(b){return ["N","NE","E","SE","S","SW","W","NW"][Math.round((((b%360)+360)%360)/45)%8];}
function updateHud(){const el=document.getElementById("vantageDir");if(!el)return;
  const deg=Math.round((D.vantage.yaw*180/Math.PI%360+360)%360);el.textContent="Facing "+bear2compass(deg)+" · "+deg+"°";}
D.viewFromHere=function(lon,lat,bearing){
  if(!D.active)D.toggle(true);
  if(!D.inited)return;
  D.vantage.on=true;D.vantage.lon=lon;D.vantage.lat=lat;
  D.vantage.yaw=(bearing||0)*Math.PI/180;D.vantage.pitch=-0.05;
  camera.fov=72;camera.updateProjectionMatrix();
  const hud=document.getElementById("vantageHud");if(hud)hud.classList.remove("hidden");
  updateHud();applyCam();update();
};
D.exitVantage=function(){if(!D.vantage)return;D.vantage.on=false;disableOrient();
  const hud=document.getElementById("vantageHud");if(hud)hud.classList.add("hidden");
  if(camera){camera.fov=45;camera.updateProjectionMatrix();}applyCam&&applyCam();};
let orientHandler=null;
D.toggleOrient=function(){
  if(orientHandler){disableOrient();return;}
  const enable=()=>{const ob=document.getElementById("orientBtn");if(ob)ob.textContent="📱 Stop look-around";
    orientHandler=(e)=>{if(!D.vantage.on)return;
      let heading=(e.webkitCompassHeading!=null)?e.webkitCompassHeading:(e.alpha!=null?360-e.alpha:null);
      if(heading!=null)D.vantage.yaw=heading*Math.PI/180;
      if(e.beta!=null)D.vantage.pitch=clamp((e.beta-90)*Math.PI/180*0.7,-0.5,0.45);
      applyCam();updateHud();};
    window.addEventListener("deviceorientation",orientHandler,true);};
  try{
    if(typeof DeviceOrientationEvent!=="undefined"&&typeof DeviceOrientationEvent.requestPermission==="function"){
      DeviceOrientationEvent.requestPermission().then(s=>{s==="granted"?enable():toast("Motion access denied — drag to look around");}).catch(()=>toast("Motion unavailable — drag to look around"));
    } else if(typeof DeviceOrientationEvent!=="undefined"){enable();}
    else toast("No orientation sensor — drag to look around");
  }catch(e){toast("Drag to look around");}
};
function disableOrient(){if(orientHandler){window.removeEventListener("deviceorientation",orientHandler,true);orientHandler=null;}
  const ob=document.getElementById("orientBtn");if(ob)ob.textContent="📱 Look around";}
window.addEventListener("resize",()=>{if(D.active)resize();});

// bind the toggle button (engine.js globals are available by load order)
const btn=document.getElementById("toggle3d");
if(btn)btn.onclick=()=>D.toggle();
})();
