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

const chapterSeconds = 6;
const chapterShots = {
  "apollo-11": ["landing", "ascent", "overhead"],
  "apollo-14": ["club", "swing", "golf-rest"],
  "apollo-15": ["unpack", "prism", "echo"],
  "apollo-16": ["portrait", "place-photo", "archive"],
  "apollo-17": ["drive", "park", "film"],
  "surveyor-3": ["bounce", "scoop", "visitor"],
  sojourner: ["ramp", "sample", "relay"],
  "viking-1": ["touchdown", "scan", "fade-radio"],
  spirit: ["traverse", "dig", "stuck"],
  opportunity: ["crater", "ridge", "storm"],
  insight: ["deploy", "quake", "dust"],
  phoenix: ["parachute", "ice", "winter"],
  ingenuity: ["carry", "hover", "fly"],
  "pioneer-10": ["belt", "flyby", "escape"],
  dawn: ["thrust", "orbit", "silent"],
  "near-shoemaker": ["depart", "circle", "asteroid"],
  kepler: ["aim", "transit", "discover"]
};

function missionArt(canvas,id,time,chapter=0) {
  const c=canvas.getContext("2d");
  const [sky,accent,model,setting]=cartoons[id];
  const action=chapterShots[id][chapter];
  const p=Math.min(1,time/chapterSeconds);
  const smooth=p*p*(3-2*p);
  const wave=Math.sin(time*3);
  const space=["flyby","orbit","asteroid","transit"].includes(setting)||action==="overhead";
  const mars=["ramp","scan","dig","storm","quake","ice","fly"].includes(setting);
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
  horizon.addColorStop(0,"#130e39");horizon.addColorStop(.66,sky);horizon.addColorStop(1,accent);
  c.fillStyle=horizon;c.fillRect(0,0,900,480);
  const glow = c.createRadialGradient(720,136,2,720,136,310);
  glow.addColorStop(0,accent+"70");glow.addColorStop(.5,accent+"18");glow.addColorStop(1,accent+"00");
  c.fillStyle=glow;c.fillRect(0,0,900,480);
  for(let i=0;i<70;i++){
    const x=(i*149.31)%900,y=(i*81.7)%330;
    c.globalAlpha=.42+.4*Math.sin(i+time*1.5)**2;
    if(i%11===0){
      line([[x-4,y],[x+4,y],[x,y],[x,y-4],[x,y+4]],i%2?accent:"#ffeed2",1.4);
    } else oval(x,y,i%9?1.2:2.5,i%9?1.2:2.5,"#fff3cf");
  }
  c.globalAlpha=1;
  const planetX=action==="orbit"?660-smooth*110:action==="overhead"?448:720,planetY=action==="overhead"?235:126;
  const radius=action==="flyby"?176:action==="transit"?105:action==="overhead"?185:108;
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
      c.fillStyle=(mars?["#753456","#b04e58","#e2835e"]:["#444080","#6263a3","#9a8ac4"])[i];
      c.beginPath();c.moveTo(0,480);c.lineTo(0,286+i*35);
      for(let j=0;j<=10;j++)c.lineTo(j*90,293+i*35+Math.sin(j*1.8+i)*25+Math.cos(time*.55+j)*5);
      c.lineTo(900,480);c.closePath();c.fill();
    }
    for(let i=0;i<19;i++)oval(i*48+16,371+(i*23)%105,9+i%4*4,3+i%3, i%2?"#252b5244":"#f7b48b66");
  }
  let x=x0,y=y0,tilt=0;
  switch(action){
    case "landing": case "touchdown": case "parachute": y=y0-190*(1-smooth); break;
    case "overhead": x=452;y=248;tilt=.2;break;
    case "club": x=460-35*smooth;y=283;tilt=-.15;break;
    case "golf-rest": x=190;y=310;break;
    case "unpack": y=y0-36*smooth;tilt=.28*(1-smooth);break;
    case "prism": x=530;y=245;break;
    case "place-photo": y=220+smooth*118;tilt=-smooth*.2;break;
    case "archive": x=385;y=254;tilt=.15*smooth;break;
    case "park": x=295+smooth*240;y=y0+wave*8*(1-smooth);break;
    case "film": x=590;y=y0;break;
    case "traverse": case "ridge": x=190+smooth*490;y=y0+wave*11;tilt=wave*.08;break;
    case "sample": x=345+smooth*115;y=y0;break;
    case "stuck": x=500+wave*9*(1-p);y=y0+p*34;tilt=.3*smooth;break;
    case "crater": x=245+smooth*200;y=y0+Math.sin(Math.PI*p)*32;break;
    case "hover": x=420+wave*12*smooth;y=y0-smooth*128;break;
    case "carry": x=180+smooth*490;y=y0-12;break;
    case "depart": case "thrust": x=165+smooth*425;y=315-smooth*125;tilt=-.3;break;
    case "belt": x=85+smooth*640;y=230+wave*34;tilt=wave*.2;break;
    case "escape": x=460+smooth*370;y=242-smooth*176;tilt=-.4;break;
    case "silent": x=465+Math.cos(p*4)*132;y=255+Math.sin(p*4)*85;break;
    case "circle": x=535+Math.cos(p*6.28)*187;y=237+Math.sin(p*6.28)*96;break;
    case "aim": x=275+smooth*90;y=280-smooth*30;tilt=-smooth*.45;break;
    case "bounce": y=y0-Math.abs(Math.sin(p*Math.PI*3))*(1-p)*145; tilt=wave*.10*(1-p);break;
    case "drive": x=210+smooth*480;y=y0+wave*9;tilt=wave*.06;break;
    case "ramp": x=280+smooth*290;y=y0-65*(1-smooth);tilt=.25*(1-p);break;
    case "dig": x=385+smooth*95;y=y0+wave*4;tilt=wave*.07;break;
    case "storm": x=430-smooth*80;tilt=wave*.06;break;
    case "fly": x=205+smooth*500;y=y0-150*Math.sin(Math.PI*p);tilt=wave*.10;break;
    case "flyby": x=90+smooth*420;y=318-smooth*117;tilt=-.28;break;
    case "orbit": x=365+Math.cos(time*1.45)*150;y=265+Math.sin(time*1.45)*87;tilt=wave*.17;break;
    case "asteroid": x=400+smooth*100;y=160+smooth*112;tilt=-.2+smooth*.2;break;
    case "transit": x=340;y=250+wave*9;tilt=-.34;break;
  }
  if(!space)oval(x,372,75,12,"#23254460");
  if(action==="echo"){
    const beam=1-Math.abs(1-p*2);
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
    c.save();if(action==="ascent")c.translate(0,-smooth*260);
    pill(-35,-59,70,51,11,shell,"#2b304f");pill(-21,-49,42,23,6,"#2f4772");
    line([[9,-60],[9,-88],[26,-95]],"#f6deac",4);c.restore();
    if(model==="seismic"){panel(-119,-4,67,21);panel(52,-4,67,21);}
    if(model==="survey"||model==="viking"){oval(24,-68,36,13,"#eccab1");oval(24,-70,26,8,"#6875a5");}
  }else if(model==="golf"){
    pill(-54,-45,62,79,23,"#f2e8d3","#343661");oval(-24,-65,36,34,"#ebddcf");
    oval(-18,-66,28,22,"#47548c");oval(-26,-74,10,5,"#c2dcff");
    c.save();c.translate(-4,-21);c.rotate(-.8+(action==="swing"?Math.sin(p*Math.PI)*2.35:smooth*.55));
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
    const flight=smooth;
    oval(490+flight*300,368-Math.sin(Math.PI*flight)*136,7,7,"#fff5e1");

  }
  if(action==="archive"){
    pill(590,302,76,50,11,"#3d3561","#ffe1c8");
    oval(628,327,18,18,"#91dcd7");
    if(p<.2){c.fillStyle="#fff7d855";c.fillRect(0,0,900,480);}
  }
  if(action==="film"){
    pill(230,141-smooth*112,41,32,8,"#e7bf83","#33294e");
    oval(250,177-smooth*112,12,7,"#ffd279");
  }
  if(action==="ramp")line([[110,308],[229,308],[363,374]],"#f0ab7e",9);
  if(action==="scan"){
    for(let i=0;i<5;i++){c.globalAlpha=.15+p*.5;line([[537,238+i*17],[548+smooth*138,238+i*17]],accent,3);}c.globalAlpha=1;
  }
  if(action==="dig"||action==="ice")for(let i=0;i<6;i++)oval(547+i*10,372-i%2*6,5+p*5,3,accent);
  if(action==="storm"||action==="landing"||action==="ramp"){
    for(let i=0;i<23;i++){c.globalAlpha=(action==="storm"?.55:.18)*p;oval((i*99+time*70)%900,248+(i*31)%177,15+i%5*7,4+i%3,"#ffd6a1");}c.globalAlpha=1;
  }
  switch(action){
    case "ascent":
      if(p<.91){
        const y=268-smooth*260;
        oval(x0,y+15,14,19+wave*6,"#ff975a");oval(x0,y+10,8,12,"#ffefad");
        for(let i=0;i<7;i++)oval(x0-28+i*9+wave*8,y+26+i%3*7,3,4,"#ffd48088");
      }
      break;
    case "overhead":
      line([[x+36,y+20],[x+97,y+63]],"#1b234c",12);
      line([[x-98,151],[x-98,329],[x+98,329],[x+98,151],[x-98,151]],accent,3);
      line([[x-98,151+smooth*178],[x+98,151+smooth*178]],"#d9ffec80",3);
      break;
    case "golf-rest":
      for(const px of [533,654]){
        oval(px,373,45,17,"#5b577a");oval(px,365,11,11,px===533?"#fff3dc":accent);
        c.strokeStyle="#fff1af88";c.lineWidth=3;c.beginPath();c.arc(px,365,22+smooth*30,0,Math.PI*2);c.stroke();
      }
      break;
    case "prism":
      for(let i=0;i<3;i++){
        const edges=[[258,180+i*45],[456,206+i*20],[552,242+i*7],[456,275+i*13],[258,290+i*37]];
        c.globalAlpha=.22+(Math.sin(time*4-i)+1)*.32;
        line(edges,[accent,"#fbc07d","#dabeff"][i],4);
      }
      c.globalAlpha=1;
      break;
    case "scoop": case "sample": case "dig": case "ice": case "deploy": {
      const reach=Math.sin(p*Math.PI*.92);
      const px=x+67+reach*102;
      line([[x+36,y+12],[x+73,y-22],[px,y+29+reach*41]],accent,6);
      pill(px-11,y+24+reach*41,23,16,5,"#eed6ad","#3f395d");
      if(reach>.45)for(let i=0;i<6;i++)oval(px-30+i*12,387-Math.sin(time*3+i)*9,4+i%3,3,accent);
      break;
    }
    case "visitor": {
      const px=113+smooth*220;
      oval(px,312,25,26,"#fff0d1");oval(px+5,312,18,13,"#5b7bac");
      pill(px-25,338,49,48,12,"#f0d4b3","#323557");
      line([[px-14,376],[px-22+wave*13,422],[px-10,422]],"#f5dfbf",12);
      line([[px+13,376],[px+23-wave*13,420],[px+31,420]],"#ecd5b8",12);
      break;
    }
    case "fade-radio": case "relay": case "silent": case "escape": {
      const alpha=action==="relay"?.85:(1-p);
      for(let i=0;i<4;i++){
        c.globalAlpha=alpha*(.9-i*.18);
        c.strokeStyle=accent;c.lineWidth=3;
        c.beginPath();
        const radius=18+i*23+(p*11);
        c.arc(x+26,y-72,radius,Math.PI*1.1,Math.PI*1.9);
        c.stroke();
      }
      c.globalAlpha=1;
      if(action==="relay")oval(x+130+110*smooth,y-111-smooth*50,8,8,"#b8fff4");
      break;
    }
    case "winter": case "dust": case "storm":
      for(let i=0;i<58;i++){
        c.globalAlpha=(.10+.42*p)*(i%3===0?1:.6);
        const px=(i*83+time*(action==="winter"?17:85))%900;
        const py=(i*127+time*(action==="winter"?27:11))%480;
        oval(px,py,2+i%4,action==="winter"?2+i%3:2,action==="winter"?"#fbf3ff":"#ffe3bb");
      }
      c.globalAlpha=1;
      break;
    case "stuck":
      for(let i=0;i<8;i++)oval(x-115+28*i,383+i%2*11,26,8,"#93545d9c");
      break;
    case "parachute":
      if(p<.84){
        c.globalAlpha=Math.min(1,(.84-p)*9);
        oval(x,y-114,66,24,"#ffa593");oval(x-20,y-119,29,14,"#fff4da");
        line([[x-56,y-106],[x,y-55],[x+55,y-106]],"#ffebce",2);c.globalAlpha=1;
      }
      break;
    case "belt":
      for(let i=0;i<12;i++){
        const px=(i*143-time*(26+i*6)+1800)%930,py=34+(i*137)%400;
        oval(px,py,12+i%4*8,7+i%4*4,i%2?"#a57aa4":"#bc8e78");
      }
      break;
    case "thrust": case "depart":
      line([[x-125,y+31],[x-260-30*wave,y+75]],accent,6);
      line([[x-132,y+36],[x-205,y+56]],"#f7f4ff",3);
      break;
    case "transit": {
      const trace=Array.from({length:55},(_,i)=>[575+i*4.2,388+Math.exp(-((i-26)**2)/105)*28]);
      line(trace,accent,3);
      const dot=trace[Math.floor(p*54)];
      oval(dot[0],dot[1],6,6,"#fff9e0");
      break;
    }
    case "discover":
      for(let i=0;i<9;i++){
        const px=530+(i*73)%321,py=134+(i*101)%210;
        if(p>i/12){oval(px,py,7+i%3*4,7+i%3*4,i%2?accent:"#8accee");}
      }
      break;
    case "carry":
      pill(x-88,y+23,176,31,7,"#c28d74","#492e59");
      tyre(x-65,y+57,14);tyre(x+65,y+57,14);
      break;
  }

}
window.CartoonExhibits = cartoons;
for (const clip of document.querySelectorAll("[data-cartoon]")) {
  const id = clip.dataset.cartoon;
  const canvas = clip.querySelector("canvas");
  if (clip.hasAttribute("data-preview")) {
    let frame = 0, started = 0;
    const still = () => { cancelAnimationFrame(frame); frame = 0; missionArt(canvas,id,1.6); };
    function preview(now) {
      missionArt(canvas,id,(now-started)/1000%chapterSeconds);
      frame=requestAnimationFrame(preview);
    }
    function animatePreview() {
      if (frame || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      started=performance.now();
      frame=requestAnimationFrame(preview);
    }
    still();
    clip.addEventListener("pointerenter",animatePreview);
    clip.addEventListener("pointerleave",still);
    clip.addEventListener("focus",animatePreview);
    clip.addEventListener("blur",still);
    window.addEventListener("pagehide",still);
    continue;
  }

  const entries = [...clip.querySelectorAll("[data-chapter]")];
  const caption = clip.querySelector(".film-caption");
  const play = clip.querySelector("[data-play-film]");
  const replay = clip.querySelector("[data-replay-film]");
  const previous = clip.querySelector("[data-prev-film]");
  const next = clip.querySelector("[data-next-film]");
  const scrub = clip.querySelector("[data-film-time]");
  const clock = clip.querySelector(".film-clock");
  const watched = new Set();
  let chapter = 0, time = 0, last = 0, frame = 0, playing = false;
  let seeked = false;

  function paint() {
    missionArt(canvas,id,time,chapter);
    scrub.value=time;
    clock.textContent="0:0"+Math.floor(time)+" / 0:06";
  }
  function state(active) {
    playing=active;
    const label=active?"Pause animation":"Play animation";
    play.textContent=active?"❚❚":"▶";
    play.title=label;
    play.setAttribute("aria-label",label);
    play.setAttribute("aria-pressed",String(active));
  }
  function pause() {
    cancelAnimationFrame(frame);
    state(false);
  }
  function tick(now) {
    time=Math.min(chapterSeconds,time+(now-last)/1000);
    last=now;
    paint();
    if (time===chapterSeconds) {
      pause();
      if (!seeked) watched.add(chapter);
      if (watched.size===entries.length) clip.dispatchEvent(new Event("mission-complete",{bubbles:true}));
      return;
    }
    frame=requestAnimationFrame(tick);
  }
  function start() {
    if (time===chapterSeconds) {time=0;seeked=false;}
    last=performance.now();
    state(true);
    frame=requestAnimationFrame(tick);
  }
  function select(index, autoplay) {
    pause();
    chapter=index;
    time=0;
    seeked=false;
    entries.forEach((button,i)=>button.setAttribute("aria-pressed",String(i===index)));
    caption.textContent=entries[index].dataset.caption;
    previous.disabled=index===0;
    next.disabled=index===entries.length-1;
    paint();
    if (autoplay) start();
  }
  play.onclick=()=>playing?pause():start();
  replay.onclick=()=>select(chapter,true);
  previous.onclick=()=>select(chapter-1,true);
  next.onclick=()=>select(chapter+1,true);
  scrub.oninput=()=>{time=Number(scrub.value);seeked=time>0;paint();};
  entries.forEach((button,i)=>button.onclick=()=>select(i,true));
  window.addEventListener("pagehide",pause);
  select(0,false);
}
