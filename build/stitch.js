const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const ROOT = path.dirname(__dirname);
const cols=[4675,4676,4677], rows=[6212,6213,6214,6215,6216,6217,6218];
const TILE=256, FULLW=cols.length*TILE, FULLH=rows.length*TILE;
const GW=192, GH=448; // downsampled height grid (aspect-preserved)
// DEM geographic bbox (web-mercator tile edges)
const z=14,n=2**z;
const tl=x=>x/n*360-180, ta=y=>Math.atan(Math.sinh(Math.PI*(1-2*y/n)))*180/Math.PI;
const demW=tl(cols[0]), demE=tl(cols[cols.length-1]+1), demN=ta(rows[0]), demS=ta(rows[rows.length-1]+1);

// least-squares affine (px[x,y] -> out[ox,oy]); returns {a,b,c,d,e,f}
function affine(src,dst){
  let Sxx=0,Sxy=0,Sx=0,Syy=0,Sy=0,N=src.length,bX=[0,0,0],bY=[0,0,0];
  src.forEach((p,i)=>{const[x,y]=p,[ox,oy]=dst[i];
    Sxx+=x*x;Sxy+=x*y;Sx+=x;Syy+=y*y;Sy+=y;
    bX[0]+=x*ox;bX[1]+=y*ox;bX[2]+=ox;bY[0]+=x*oy;bY[1]+=y*oy;bY[2]+=oy;});
  const M=[[Sxx,Sxy,Sx],[Sxy,Syy,Sy],[Sx,Sy,N]];
  const soln=v=>{const A=M.map((r,i)=>r.concat(v[i]));
    for(let c=0;c<3;c++){let p=c;for(let r=c+1;r<3;r++)if(Math.abs(A[r][c])>Math.abs(A[p][c]))p=r;[A[c],A[p]]=[A[p],A[c]];const pv=A[c][c];for(let r=0;r<3;r++){if(r===c)continue;const f=A[r][c]/pv;for(let k=c;k<4;k++)A[r][k]-=f*A[c][k];}}
    return [A[0][3]/A[0][0],A[1][3]/A[1][1],A[2][3]/A[2][2]];};
  const X=soln(bX),Y=soln(bY);return {a:X[0],b:X[1],c:X[2],d:Y[0],e:Y[1],f:Y[2]};}
const ap=(A,x,y)=>[A.a*x+A.b*y+A.c, A.d*x+A.e*y+A.f];
function invert(A){const det=A.a*A.e-A.b*A.d;return {a:A.e/det,b:-A.b/det,c:(A.b*A.f-A.e*A.c)/det,d:-A.d/det,e:A.a/det,f:(A.d*A.c-A.a*A.f)/det};}

// landmark old-coords -> lon,lat
const LM_old=[[505,328],[522,374],[576,408],[514,600],[524,662],[392,460],[330,300],[423,520],[446,250]];
const LM_ll =[[-77.2311,39.8309],[-77.2300,39.8221],[-77.2206,39.8156],[-77.2369,39.7919],[-77.2383,39.7875],[-77.2456,39.8160],[-77.2520,39.8369],[-77.2497,39.7969],[-77.2389,39.8417]];
const old2ll = affine(LM_old, LM_ll); // old -> [lon,lat]
// fieldAnchors old -> base px
const FA_old=[[505,328],[522,374],[576,408],[500,460],[514,600],[524,662],[392,460],[330,300],[423,520],[446,250]];
const FA_px =[[895,600],[875,985],[1015,1010],[770,1600],[612,2175],[588,2330],[470,1300],[430,360],[525,1775],[760,150]];
const old2px = affine(FA_old, FA_px);
const px2old = invert(old2px);
// contour image footprint (px corners -> old -> lonlat) -> bbox
const BW=1500,BH=2500, corners=[[0,0],[BW,0],[0,BH],[BW,BH]];
let lons=[],lats=[];
corners.forEach(([px,py])=>{const o=ap(px2old,px,py);const ll=ap(old2ll,o[0],o[1]);lons.push(ll[0]);lats.push(ll[1]);});
const texW=Math.min(...lons),texE=Math.max(...lons),texS=Math.min(...lats),texN=Math.max(...lats);

(async()=>{
  const b=await chromium.launch();const page=await b.newPage();
  await page.setViewportSize({width:FULLW,height:FULLH});
  // build an HTML that draws all tiles into a canvas and returns terrarium-decoded downsampled grid
  const tileData={};
  cols.forEach((X,ci)=>rows.forEach((Y,ri)=>{
    const p=path.join(ROOT,'dem-src',`t_14_${X}_${Y}.png`);
    tileData[`${ci}_${ri}`]='data:image/png;base64,'+fs.readFileSync(p).toString('base64');
  }));
  const grid=await page.evaluate(async ({tiles,cols,rows,TILE,FULLW,FULLH,GW,GH})=>{
    const cv=document.createElement('canvas');cv.width=FULLW;cv.height=FULLH;const cx=cv.getContext('2d');
    await Promise.all(Object.entries(tiles).map(([k,src])=>new Promise(res=>{
      const im=new Image();im.onload=()=>{const[ci,ri]=k.split('_').map(Number);cx.drawImage(im,ci*TILE,ri*TILE);res();};im.src=src;})));
    const img=cx.getImageData(0,0,FULLW,FULLH).data;
    const out=new Int16Array(GW*GH);
    for(let gy=0;gy<GH;gy++)for(let gx=0;gx<GW;gx++){
      const sx=Math.floor(gx/GW*FULLW), sy=Math.floor(gy/GH*FULLH), idx=(sy*FULLW+sx)*4;
      const h=(img[idx]*256+img[idx+1]+img[idx+2]/256)-32768;
      out[gy*GW+gx]=Math.round(h);
    }
    return Array.from(out);
  }, {tiles:tileData,cols,rows,TILE,FULLW,FULLH,GW,GH});
  await b.close();
  const i16=Int16Array.from(grid);
  let mn=1e9,mx=-1e9;grid.forEach(v=>{if(v<mn)mn=v;if(v>mx)mx=v;});
  const b64=Buffer.from(i16.buffer).toString('base64');
  const out=`/* generated DEM + georef */\nGB.dem=${JSON.stringify({w:GW,h:GH,min:mn,max:mx,bbox:{W:demW,E:demE,S:demS,N:demN},b64})};\n`+
    `GB.geo=${JSON.stringify({old2ll,tex:{W:texW,E:texE,S:texS,N:texN}})};\n`;
  fs.writeFileSync(path.join(ROOT,'build','geodem.js'),out);
  console.log(`DEM grid ${GW}x${GH}  elev ${mn}..${mx} m  b64 ${(b64.length/1024).toFixed(0)}KB`);
  console.log(`DEM bbox W${demW.toFixed(4)} E${demE.toFixed(4)} S${demS.toFixed(4)} N${demN.toFixed(4)}`);
  console.log(`tex bbox W${texW.toFixed(4)} E${texE.toFixed(4)} S${texS.toFixed(4)} N${texN.toFixed(4)}`);
})();
