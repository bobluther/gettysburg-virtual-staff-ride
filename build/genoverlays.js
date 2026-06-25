/* Generate two map overlays aligned to field_base (1500x2500):
   - hillshade.png : shaded relief from the DEM (grayscale, for multiply blend)
   - woods.png     : 1863 woodland mask color-keyed from the Cope survey (green RGBA)
*/
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const ROOT = path.dirname(__dirname);

// --- georef: control points (same as GB.geoctrl) -> fit lon/lat -> px, invert ---
const CTRL=[[-77.2311,39.8309,895,600],[-77.2300,39.8221,875,985],[-77.2206,39.8156,1015,1010],
 [-77.2369,39.7919,612,2175],[-77.2383,39.7875,588,2330],[-77.2456,39.8160,470,1300],
 [-77.2520,39.8369,430,360],[-77.2497,39.7969,525,1775],[-77.2389,39.8417,760,150]];
function solve3(M,v){const A=M.map((r,i)=>r.concat(v[i]));
 for(let c=0;c<3;c++){let p=c;for(let r=c+1;r<3;r++)if(Math.abs(A[r][c])>Math.abs(A[p][c]))p=r;[A[c],A[p]]=[A[p],A[c]];const pv=A[c][c]||1e-9;
   for(let r=0;r<3;r++){if(r===c)continue;const f=A[r][c]/pv;for(let k=c;k<4;k++)A[r][k]-=f*A[c][k];}}
 return [A[0][3]/A[0][0],A[1][3]/A[1][1],A[2][3]/A[2][2]];}
let Sxx=0,Sxy=0,Sx=0,Syy=0,Sy=0,n=CTRL.length,bX=[0,0,0],bY=[0,0,0];
CTRL.forEach(c=>{const x=c[0],y=c[1],ox=c[2],oy=c[3];Sxx+=x*x;Sxy+=x*y;Sx+=x;Syy+=y*y;Sy+=y;
 bX[0]+=x*ox;bX[1]+=y*ox;bX[2]+=ox;bY[0]+=x*oy;bY[1]+=y*oy;bY[2]+=oy;});
const M=[[Sxx,Sxy,Sx],[Sxy,Syy,Sy],[Sx,Sy,n]];const AX=solve3(M,bX),AY=solve3(M,bY);
// px -> lon/lat (invert the 2x2 [AX[0] AX[1]; AY[0] AY[1]])
const a=AX[0],b=AX[1],c0=AX[2],d=AY[0],e=AY[1],f=AY[2];const det=a*e-b*d;
function px2ll(x,y){const X=x-c0,Y=y-f;return [(e*X-b*Y)/det,(a*Y-d*X)/det];}

// --- DEM from geodem.js ---
const GB={};(function(){const src=fs.readFileSync(path.join(ROOT,"build","geodem.js"),"utf8");eval(src);})();
const dem=GB.dem, DW=dem.w, DH=dem.h, bb=dem.bbox;
const HEIGHTS=(function(b64){const bin=Buffer.from(b64,"base64");return new Int16Array(bin.buffer,bin.byteOffset,bin.length/2);})(dem.b64);
function sampleH(lon,lat){let u=(lon-bb.W)/(bb.E-bb.W),v=(lat-bb.S)/(bb.N-bb.S);
 u=u<0?0:u>1?1:u;v=v<0?0:v>1?1:v;const gx=Math.min(DW-1,Math.round(u*(DW-1))),gy=Math.min(DH-1,Math.round((1-v)*(DH-1)));return HEIGHTS[gy*DW+gx];}

const OW=900,OH=1500;           // overlay resolution (stretched to 1500x2500)
const SX=1500/OW, SY=2500/OH;
const EXAG=3.8, AZ=315*Math.PI/180, ALT=38*Math.PI/180, ZEN=Math.PI/2-ALT;

(async()=>{
  // ---- hillshade ----
  const hs=Buffer.alloc(OW*OH*4);
  const dM=28; // sample offset in meters
  for(let py=0;py<OH;py++)for(let px=0;px<OW;px++){
    const ll=px2ll(px*SX,py*SY),lon=ll[0],lat=ll[1];
    const mLon=111320*Math.cos(lat*Math.PI/180), dLon=dM/mLon, dLat=dM/111320;
    const hE=sampleH(lon+dLon,lat),hW=sampleH(lon-dLon,lat),hN=sampleH(lon,lat+dLat),hS=sampleH(lon,lat-dLat);
    const dzdx=(hE-hW)/(2*dM)*EXAG, dzdy=(hN-hS)/(2*dM)*EXAG;
    const slope=Math.atan(Math.sqrt(dzdx*dzdx+dzdy*dzdy));
    const aspect=Math.atan2(dzdy,-dzdx);
    let v=Math.cos(ZEN)*Math.cos(slope)+Math.sin(ZEN)*Math.sin(slope)*Math.cos(AZ-aspect);
    v=Math.max(0,Math.min(1,v));
    v=Math.max(0,Math.min(1,(v-0.5)*1.75+0.5)); // stretch contrast around mid-grey
    const g=Math.round(12+v*238);
    const i=(py*OW+px)*4;hs[i]=hs[i+1]=hs[i+2]=g;hs[i+3]=255;
  }
  await writePNG(hs,OW,OH,path.join(ROOT,"assets-src","hillshade.png"));
  console.log("hillshade.png written");

  // ---- woods mask from field_base.jpg ----
  const b=await chromium.launch();const page=await b.newPage();
  const jpg="data:image/jpeg;base64,"+fs.readFileSync(path.join(ROOT,"assets-src","field_base.jpg")).toString("base64");
  const data=await page.evaluate(async ({jpg,OW,OH})=>{
    const im=new Image();await new Promise(r=>{im.onload=r;im.src=jpg;});
    const cv=document.createElement("canvas");cv.width=OW;cv.height=OH;const cx=cv.getContext("2d");
    cx.drawImage(im,0,0,OW,OH);const d=cx.getImageData(0,0,OW,OH).data;
    const out=new Uint8ClampedArray(OW*OH*4);
    for(let i=0;i<OW*OH;i++){const r=d[i*4],g=d[i*4+1],bl=d[i*4+2];
      // Cope woodland = olive/khaki-green fill: blue notably lower than green; not bright cream, not dark ink
      const wood = bl < g*0.74 && (g-bl)>22 && g>82 && g<208 && r>68 && r<212;
      const j=i*4;
      if(wood){out[j]=42;out[j+1]=96;out[j+2]=46;out[j+3]=125;} else {out[j+3]=0;}
    }
    return Array.from(out);
  },{jpg,OW,OH});
  await b.close();
  await writePNG(Buffer.from(data),OW,OH,path.join(ROOT,"assets-src","woods.png"));
  console.log("woods.png written");
})();

// minimal PNG encoder via pngjs-free: use zlib + manual chunks
function writePNG(rgba,w,h,file){return new Promise((res,rej)=>{
  const zlib=require("zlib");
  const stride=w*4;const raw=Buffer.alloc((stride+1)*h);
  for(let y=0;y<h;y++){raw[y*(stride+1)]=0;rgba.copy?rgba.copy(raw,y*(stride+1)+1,y*stride,y*stride+stride):Buffer.from(rgba).copy(raw,y*(stride+1)+1,y*stride,y*stride+stride);}
  zlib.deflate(raw,(err,comp)=>{if(err)return rej(err);
    const chunks=[];const sig=Buffer.from([137,80,78,71,13,10,26,10]);chunks.push(sig);
    const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(w,0);ihdr.writeUInt32BE(h,4);ihdr[8]=8;ihdr[9]=6;ihdr[10]=0;ihdr[11]=0;ihdr[12]=0;
    chunks.push(chunk("IHDR",ihdr));chunks.push(chunk("IDAT",comp));chunks.push(chunk("IEND",Buffer.alloc(0)));
    fs.writeFileSync(file,Buffer.concat(chunks));res();});
});}
function chunk(type,data){const t=Buffer.from(type,"ascii");const len=Buffer.alloc(4);len.writeUInt32BE(data.length,0);
  const crc=Buffer.alloc(4);crc.writeUInt32BE(crc32(Buffer.concat([t,data]))>>>0,0);return Buffer.concat([len,t,data,crc]);}
let CRC=[];for(let n0=0;n0<256;n0++){let c=n0;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;CRC[n0]=c>>>0;}
function crc32(buf){let c=0xffffffff;for(let i=0;i<buf.length;i++)c=CRC[(c^buf[i])&0xff]^(c>>>8);return (c^0xffffffff)>>>0;}
