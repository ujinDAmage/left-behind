"use strict";

// Palette and motion are keyed to the exhibit. The same artwork also stamps its souvenir.
const cartoons = {
  "apollo-11":["#253469","#ffd46b","lander","landing","Eagle at Tranquility Base"],
  "apollo-14":["#6352a9","#ffd275","golf","swing","A golf shot at Fra Mauro"],
  "apollo-15":["#173c67","#63e8ed","mirror","laser","A light echo from Hadley Rille"],
  "apollo-16":["#554478","#ffb9a7","photo","portrait","A family photo from Earth"],
  "apollo-17":["#334785","#ffa862","buggy","drive","A drive through Taurus–Littrow"],
  "surveyor-3":["#294e55","#bdf089","survey","bounce","Surveyor's bouncing touchdown"],
  sojourner:["#8f344c","#fbd366","micro","ramp","Sojourner leaves Pathfinder"],
  "viking-1":["#753b50","#ffae74","viking","scan","Viking sends its first image"],
  spirit:["#963f50","#a6ebcb","rover","dig","Spirit's wheel uncovers bright soil"],
  opportunity:["#672641","#f7a66f","rover","storm","Opportunity in the dust storm"],
  insight:["#714365","#f9a4c0","seismic","quake","InSight listens to Mars"],
  phoenix:["#526493","#b9edf9","seismic","ice","Phoenix uncovers ice"],
  ingenuity:["#a24455","#ffdf7e","heli","fly","Ingenuity takes flight"],
  "pioneer-10":["#432c63","#ffc370","dish","flyby","Pioneer 10 flies past Jupiter"],
  dawn:["#243c6c","#9ff5d8","probe","orbit","Dawn travels from Vesta to Ceres"],
  "near-shoemaker":["#534266","#fbbb90","probe","asteroid","NEAR Shoemaker descends to Eros"],
  kepler:["#293367","#f5af88","scope","transit","Kepler sees a planet cross a star"]
};

function missionArt(canvas,id,time) {
  const c=canvas.getContext("2d");
  const [sky,accent,model,action]=cartoons[id];
  const captionTime=Math.min(2,Math.floor(time/4));
  const p=(time-captionTime*4)/4;
  const smooth=p*p*(3-2*p);
  const wave=Math.sin(time*3);
  const space=["flyby","orbit","asteroid","transit"].includes(action);
  const mars=["ramp","scan","dig","storm","quake","ice","fly"].includes(action);
  const x0=450,y0=306;
  function pill(x,y,w,h,r,color,outline) {
    c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=color;c.fill();
    if(outline){c.strokeStyle=outline;c.lineWidth=3;c.stroke();}
  }
  function oval(x,y,a,b,color) {
    c.beginPath();c.ellipse(x,y,a,b,0,0,Math.PI*2);c.fillStyle=color;c.fill();
  }
  function line(points,color,width=3) {
    c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.lineCap="round";c.lineJoin="round";c.stroke();
  }
  function gradient(x,y,r,a,b) {
    const g=c.createRadialGradient(x-r*.28,y-r*.32,4,x,y,r);
    g.addColorStop(0,a);g.addColorStop(1,b);return g;
  }
  function tyre(x,y,r) {
    oval(x,y,r,r,"#18223d");oval(x,y,r*.69,r*.69,"#434b69");
    c.save(); c.translate(x,y);c.rotate(time*5);
    for(let i=0;i<5;i++){c.rotate(Math.PI*2/5);line([[0,0],[r*.88,0]],"#8d94a7",3);}
    oval(0,0,r*.22,r*.22,accent);c.restore();
  }
  function panel(x,y,w,h) {
    pill(x,y,w,h,7,"#5367b4","#202647");
    for(let j=1;j<5;j++)line([[x+j*w/5,y+3],[x+j*w/5,y+h-3]],"#839cde",1.5);
    line([[x+2,y+h/2],[x+w-2,y+h/2]],"#839cde",1.5);
  }
  const horizon = c.createLinearGradient(0,0,0,470);
  horizon.addColorStop(0,"#10142f");horizon.addColorStop(1,sky);
  c.fillStyle=horizon;c.fillRect(0,0,900,480);
  for(let i=0;i<70;i++){
    const x=(i*149.31)%900,y=(i*81.7)%330;
    c.globalAlpha=.42+.35*Math.sin(i+time*1.5)**2;oval(x,y,i%9?1.2:2.5,i%9?1.2:2.5,"#fff3cf");
  }
  c.globalAlpha=1;
  const planetX=action==="orbit"?660-smooth*110:720,planetY=126;
  const radius=action==="flyby"?165:action==="transit"?105:108;
  oval(planetX,planetY,radius,radius,gradient(planetX,planetY,radius,accent,sky));
  c.save();c.beginPath();c.arc(planetX,planetY,radius,0,Math.PI*2);c.clip();
  if(action==="flyby"){
    for(let i=0;i<8;i++)oval(planetX,planetY-125+i*37,180,13,i%2?"#c97552":"#ffce96");
    oval(planetX+36,planetY+45,46,19,"#a44748");
  }else if(action==="transit"){
    oval(planetX-110+smooth*220,planetY+11,14,14,"#212b58");
  }else {
    for(let i=0;i<7;i++)oval(planetX-87+i*31,planetY-53+(i*63)%116,8+i%3*9,4+i%3*6,"#4f456e55");
  }
  c.restore();
  if(!space){
    for(let i=0;i<3;i++){
      c.fillStyle=(mars?["#78445b","#a8595c","#cd795f"]:["#464d7a","#5b658c","#8d88a9"])[i];
      c.beginPath();c.moveTo(0,480);c.lineTo(0,286+i*35);
      for(let j=0;j<=10;j++)c.lineTo(j*90,293+i*35+Math.sin(j*1.8+i)*25+Math.cos(time*.55+j)*5);
      c.lineTo(900,480);c.closePath();c.fill();
    }
    for(let i=0;i<19;i++)oval(i*48+16,371+(i*23)%105,9+i%4*4,3+i%3, i%2?"#252b5244":"#f7b48b66");
  }
  let x=x0,y=y0,tilt=0;
  switch(action){
    case "landing": y=captionTime===0?y0-180*(1-smooth):y0; break;
    case "bounce": y=y0-Math.abs(Math.sin(p*Math.PI*3))*(1-p)*145; tilt=wave*.10*(1-p);break;
    case "drive": x=215+(captionTime===0?130*smooth:captionTime===1?130+260*smooth:390);y=y0+(captionTime===2?0:wave*9);tilt=wave*.06;break;
    case "ramp": x=280+smooth*290;y=y0-65*(1-smooth);tilt=.25*(1-p);break;
    case "dig": x=385+smooth*95;y=y0+wave*4;tilt=wave*.07;break;
    case "storm": x=430-smooth*80;tilt=wave*.06;break;
    case "fly": x=260+(captionTime===0?0:captionTime===1?smooth*370:370);y=y0-(captionTime===0?smooth:captionTime===1?1:1-smooth)*145;tilt=wave*.10;break;
    case "flyby": x=90+smooth*420;y=318-smooth*117;tilt=-.28;break;
    case "orbit": x=365+Math.cos(time*1.45)*150;y=265+Math.sin(time*1.45)*87;tilt=wave*.17;break;
    case "asteroid": x=400+smooth*100;y=160+smooth*112;tilt=-.2+smooth*.2;break;
    case "transit": x=340;y=250+wave*9;tilt=-.34;break;
  }
  if(!space)oval(x,372,75,12,"#23254460");
  if(action==="laser"){
    const beam=captionTime===2?1-smooth:smooth;
    line([[120,190],[395,295]],"#6eeed83a",3);
    line([[120,190],[120+275*beam,190+105*beam]],accent,5);
    oval(120+275*beam,190+105*beam,9,9,"#f2fff9");
  }
  if(action==="quake"||action==="ice"){
    for(let i=0;i<3;i++){
      c.globalAlpha=.6*(1-((p+i/3)%1));c.strokeStyle=accent;c.lineWidth=3;
      c.beginPath();c.ellipse(550,378,16+((p+i/3)%1)*155,7+((p+i/3)%1)*35,0,0,Math.PI*2);c.stroke();
    }c.globalAlpha=1;
  }
  c.save();c.translate(x,y);c.rotate(tilt);
  const shell=gradient(0,5,91,"#fff1bf",accent);
  if(["buggy","micro","rover"].includes(model)){
    line([[-75,41],[0,15],[76,43]],"#25294b",9);pill(-83,-18,166,55,15,shell,"#272b46");
    if(model==="buggy") {pill(-51,-41,40,27,7,"#4c537b");pill(12,-40,29,24,7,"#4c537b");}
    else panel(-84,-31,165,34);
    if(model!=="micro") {line([[36,-26],[36,-83]],"#d4dbde",8);pill(10,-96,57,24,8,"#f6e8ca","#273152");oval(52,-84,8,8,"#252f55");}
    [-65,0,65].forEach(i=>tyre(i,42,20));
  } else if(model==="heli") {
    line([[-59,53],[-21,15],[22,15],[58,53]],"#ffebaf",5);
    pill(-30,-21,60,51,11,shell,"#26264b");oval(0,4,10,9,"#2e3b69");
    line([[0,-18],[0,-75]],"#efc9a3",6);
    c.save();c.translate(0,-61);c.scale(1,.19);c.rotate(time*12);
    pill(-91,-6,182,12,5,"#99efed");pill(-6,-76,12,152,5,"#e6acdb");c.restore();
    panel(-36,-83,72,15);
  } else if(["lander","survey","viking","seismic"].includes(model)) {
    line([[-80,48],[-45,-10],[44,-10],[81,48]],"#ffda91",7);
    oval(-80,48,18,5,"#343b60");oval(81,48,18,5,"#343b60");
    pill(-51,-15,103,50,11,shell,"#2b304f");
    c.save();if(action==="landing"&&captionTime>=1)c.translate(0,-smooth*185);
    pill(-35,-59,70,51,11,shell,"#2b304f");pill(-21,-49,42,23,6,"#2f4772");
    line([[9,-60],[9,-88],[26,-95]],"#f6deac",4);c.restore();
    if(model==="seismic"){panel(-119,-4,67,21);panel(52,-4,67,21);}
    if(model==="survey"||model==="viking"){oval(24,-68,36,13,"#eccab1");oval(24,-70,26,8,"#6875a5");}
  }else if(model==="golf"){
    pill(-54,-45,62,79,23,"#f2e8d3","#343661");oval(-24,-65,36,34,"#ebddcf");
    oval(-18,-66,28,22,"#47548c");oval(-26,-74,10,5,"#c2dcff");
    c.save();c.translate(-4,-21);c.rotate(-.8+Math.sin(p*Math.PI)*1.9);
    line([[0,0],[66,42],[96,65]],"#e6c390",7);pill(89,63,31,10,5,accent);c.restore();
  }else if(model==="mirror"){
    pill(-74,-43,148,79,10,"#5266a2","#d8e7e8");
    for(let i=0;i<5;i++)for(let j=0;j<3;j++)oval(-55+i*27,-25+j*22,8,8,(i+j+Math.floor(time*5))%4===0?"#effffd":accent);
  }else if(model==="photo"){
    c.rotate(-.17+wave*.11);pill(-81,-78,162,137,8,"#fff3d0","#3c446e");
    pill(-69,-66,138,100,4,"#e8a290");
    for(let i=0;i<4;i++){oval(-47+i*30,-14+(i%2)*8,11,14,"#fff0cf");pill(-57+i*30,-2+(i%2)*8,20,27,5,["#6d74ad","#6b9b99","#bd6f89","#d09961"][i]);}
  }else{
    if(model==="probe"||model==="scope"){panel(-137,-18,85,44);panel(52,-18,85,44);}
    pill(-52,-45,104,84,15,shell,"#2b304f");
    if(model==="scope"){oval(-38,-2,27,41,"#8e89a4");oval(-44,-2,18,31,"#222b54");}
    else {oval(0,-52,47,20,"#f7e6c5");oval(0,-55,36,13,"#8185a3");line([[0,-56],[0,-84]],accent,6);}
    oval(32,17,7,7,"#f9efff");
  }
  c.restore();
  if(action==="swing"){
    const flight=captionTime===0?0:captionTime===1?smooth:1;
    oval(490+flight*300,368-Math.sin(Math.PI*flight)*136,7,7,"#fff5e1");
    if(captionTime===2)oval(762,371,7,7,"#ffbb84");
  }
  if(action==="portrait"&&captionTime===2){
    pill(590,302,76,50,11,"#3d3561","#ffe1c8");
    oval(628,327,18,18,"#91dcd7");
    if(p<.2){c.fillStyle="#fff7d855";c.fillRect(0,0,900,480);}
  }
  if(action==="drive"&&captionTime===2){
    pill(230,141-smooth*112,41,32,8,"#e7bf83","#33294e");
    oval(250,177-smooth*112,12,7,"#ffd279");
  }
  if(action==="ramp")line([[110,308],[229,308],[363,374]],"#f0ab7e",9);
  if(action==="scan"&&captionTime>0){
    for(let i=0;i<5;i++){c.globalAlpha=.15+p*.5;line([[537,238+i*17],[548+smooth*138,238+i*17]],accent,3);}c.globalAlpha=1;
  }
  if(action==="dig"||action==="ice")for(let i=0;i<6;i++)oval(547+i*10,372-i%2*6,5+p*5,3,accent);
  if(action==="storm"||action==="landing"||action==="ramp"){
    for(let i=0;i<23;i++){c.globalAlpha=(action==="storm"?[.10,.46,.40][captionTime]:.18)*p;oval((i*99+time*70)%900,248+(i*31)%177,15+i%5*7,4+i%3,"#ffd6a1");}c.globalAlpha=1;
  }
}
window.CartoonExhibits = cartoons;
for(const clip of document.querySelectorAll("[data-cartoon]")){
  const id=clip.dataset.cartoon;
  const canvas=clip.querySelector("canvas");
  const entries=[...clip.querySelectorAll("[data-chapter]")];
  const status=clip.querySelector(".film-caption");
  const play=clip.querySelector("[data-play-film]");
  const replay=clip.querySelector("[data-replay-film]");
  const scrub=clip.querySelector("[data-film-time]");
  const isPreview=clip.hasAttribute("data-preview");
  let time=0,last=0,request=0,playing=false,shown=-1;
  function paint(){
    missionArt(canvas,id,time);
    if(isPreview)return;
    scrub.value=time;
    const part=Math.min(2,Math.floor(time/4));
    if(part!==shown){
      shown=part;
      entries.forEach((b,i)=>b.setAttribute("aria-pressed",String(i===part)));
      status.textContent=entries[part].dataset.caption;
    }
  }
  function pause(){
    playing=false;cancelAnimationFrame(request);play.textContent="Play animation";play.setAttribute("aria-pressed","false");
  }
  function tick(now){
    time=Math.min(12,time+(now-last)/1000);
    last=now;paint();
    if(time===12){pause();clip.dispatchEvent(new Event("mission-complete",{bubbles:true}));}
    if(playing)request=requestAnimationFrame(tick);
  }
  function start(){
    if(time>=12)time=0;
    playing=true;last=performance.now();
    play.textContent="Pause animation";play.setAttribute("aria-pressed","true");
    request=requestAnimationFrame(tick);
  }
  paint();
  if(isPreview){
    function loop(now){
      time = (now / 1000) % 12;
      paint();
      request=requestAnimationFrame(loop);
    }
    function preview(){ if(!matchMedia("(prefers-reduced-motion: reduce)").matches && !request)request=requestAnimationFrame(loop); }
    function still(){ cancelAnimationFrame(request);request=0;time=0;paint(); }
    clip.addEventListener("pointerenter",preview);
    clip.addEventListener("pointerleave",still);
    clip.addEventListener("focus",preview);
    clip.addEventListener("blur",still);
    window.addEventListener("pagehide",still);
    continue;
  }
  play.onclick=()=>playing?pause():start();
  replay.onclick=()=>{pause();time=0;paint();start();};
  scrub.oninput=()=>{time=Number(scrub.value);paint();};
  entries.forEach((b,i)=>b.onclick=()=>{time=i*4;paint();});
  window.addEventListener("pagehide",pause);
}
