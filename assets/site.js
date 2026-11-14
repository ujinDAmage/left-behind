"use strict";

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const storageKey = "left-behind-visited";
const assetBase = new URL(".", document.currentScript.src);

const themeButton = document.querySelector("[data-theme-switch]");
if (themeButton) {
  const themes = ["light", "moon", "mars"];
  const labels = ["Light", "Dark Moon", "Red Mars"];
  let theme = 0;
  try { theme = Math.max(0, themes.indexOf(localStorage.getItem("left-behind-theme"))); } catch {}
  function applyTheme() {
    document.documentElement.dataset.theme = themes[theme];
    themeButton.title = labels[theme] + " theme. Click to change.";
    themeButton.setAttribute("aria-label", labels[theme] + " theme. Switch to " + labels[(theme + 1) % themes.length]);
  }
  applyTheme();
  themeButton.addEventListener("click", () => {
    theme = (theme + 1) % themes.length;
    applyTheme();
    try { localStorage.setItem("left-behind-theme", themes[theme]); } catch {}
  });
}

function visitedStories() {
  try {
    const visited = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return Array.isArray(visited) ? visited : [];
  } catch {
    return [];
  }
}

function markStory(id) {
  const visited = visitedStories();
  if (!visited.includes(id)) {
    try {
      localStorage.setItem(storageKey, JSON.stringify([...visited, id]));
    } catch {
      // The exhibits still work when browser storage is disabled.
    }
  }
}

for (const figure of document.querySelectorAll("[data-photo]")) {
  const photo = window.EXHIBIT_PHOTOS?.[figure.dataset.photo];
  if (!photo?.file && !photo?.url) continue;
  figure.classList.add("archive-figure");
  const img = figure.querySelector("img");
  const caption = figure.querySelector("figcaption");
  img.addEventListener("load", () => {
    img.hidden = false;
    figure.querySelector(".image-placeholder").hidden = true;
    caption.hidden = !photo.credit;
  });
  img.alt = photo.alt || img.alt;
  const credit = document.createElement(photo.source ? "a" : "span");
  credit.textContent = photo.credit || "";
  if (photo.source) credit.href = photo.source;
  caption.replaceChildren(credit);
  img.loading = "eager";
  img.src = photo.file ? new URL("photos/" + encodeURIComponent(photo.file), assetBase) : photo.url;
}

const filters = [...document.querySelectorAll("[data-filter]")];
for (const filter of filters) {
  filter.addEventListener("click", () => {
    for (const option of filters) option.setAttribute("aria-pressed", String(option === filter));
    for (const group of document.querySelectorAll("[data-world-group]")) {
      group.hidden = filter.dataset.filter !== "all" && filter.dataset.filter !== group.dataset.worldGroup;
    }
  });
}

for (const reader of document.querySelectorAll("[data-reader]")) {
  const scenes = [...reader.querySelectorAll(".scene")];
  const choices = [...reader.querySelectorAll("[data-scene-index]")];
  const prev = reader.querySelector("[data-prev]");
  const next = reader.querySelector("[data-next]");
  const counter = reader.querySelector("[data-counter]");
  let position = 0;
  const read = new Set([0]);

  function show(index, animate = true) {
    if (index < 0 || index >= scenes.length) return;
    position = index;
    read.add(index);
    if (read.size === scenes.length) markStory(reader.dataset.story);
    scenes.forEach((scene, i) => { scene.hidden = i !== index; });
    for (const choice of choices) {
      choice.setAttribute("aria-pressed", String(Number(choice.dataset.sceneIndex) === index));
    }
    if (prev) prev.disabled = index === 0;
    if (next) next.disabled = index === scenes.length - 1;
    if (counter) counter.textContent = "Page " + (index + 1) + " of " + scenes.length;
    if (animate && !reducedMotion.matches && scenes[index].animate) {
      const frames = [{ transform: "rotateY(-25deg)", opacity: .35 }, { transform: "rotateY(0)", opacity: 1 }];
      scenes[index].animate(frames, { duration: 340, easing: "ease-out" });
    }
  }

  prev?.addEventListener("click", () => show(position - 1));
  next?.addEventListener("click", () => show(position + 1));
  for (const choice of choices) choice.addEventListener("click", () => show(Number(choice.dataset.sceneIndex)));
  show(0, false);
}

for (const block of document.querySelectorAll("[data-stage-block]")) {
  const stage = block.querySelector("[data-craft]");
  const buttons = [...block.querySelectorAll("[data-stage-action]")];
  const feedback = block.querySelector(".stage-feedback");
  const angleControl = block.querySelector("[data-stage-angle]");
  let replay;
  function pose(angle, step) {
    const progress = step / 2;
    stage.style.setProperty("--progress", progress);
    stage.style.setProperty("--turn", -angle + "deg");
    stage.style.setProperty("--hop", step === 1 ? .85 : 0);
    stage.style.setProperty("--frame", step);
    stage.dataset.step = String(step);
  }
  for (const button of buttons) {
    button.addEventListener("click", () => {
      const step = Number(button.dataset.stageAction);
      const angle = step * 90;
      if (angleControl) angleControl.value = angle;
      pose(angle, step);
      stage.classList.add("is-open");
      stage.classList.remove("is-playing");
      cancelAnimationFrame(replay);
      replay = requestAnimationFrame(() => { replay = requestAnimationFrame(() => stage.classList.add("is-playing")); });
      for (const choice of buttons) choice.setAttribute("aria-pressed", String(choice === button));
      feedback.textContent = button.dataset.description;
    });
  }
  angleControl?.addEventListener("input", () => {
    const angle = Number(angleControl.value);
    pose(angle, Math.min(2, Math.round(angle / 90) % 4));
    for (const choice of buttons) choice.setAttribute("aria-pressed", "false");
    feedback.textContent = "Carousel angle: " + angle + "°.";
  });
}

for (const lab of document.querySelectorAll("[data-laser]")) {
  const slider = lab.querySelector("#distance");
  const value = lab.querySelector("#distance-value");
  const prediction = lab.querySelector("#prediction");
  const fire = lab.querySelector("#fire");
  const reset = lab.querySelector("#reset-laser");
  const result = lab.querySelector("#laser-result");
  const history = lab.querySelector("#laser-history");
  const pulse = lab.querySelector("#pulse");
  const readings = [];
  let animation;
  let run = 0;
  const km = n => n.toLocaleString("en-US") + " km";

  function renderHistory() {
    history.replaceChildren();
    if (!readings.length) return;
    const heading = document.createElement("strong");
    heading.textContent = "Recent readings";
    const list = document.createElement("ol");
    list.className = "laser-log";
    for (const reading of readings) {
      const row = document.createElement("li");
      row.textContent = reading;
      list.append(row);
    }
    history.append(heading, list);
  }

  slider.addEventListener("input", () => { value.value = km(Number(slider.value)); });
  fire.addEventListener("click", async () => {
    if (!prediction.reportValidity()) return;
    const current = ++run;
    const distance = Number(slider.value);
    const seconds = 2 * distance / 299792.458;
    const guess = prediction.value === "" ? null : Number(prediction.value);
    slider.disabled = fire.disabled = prediction.disabled = true;
    result.textContent = "Pulse sent…";
    if (!reducedMotion.matches && pulse.animate) {
      animation = pulse.animate([{ left: "0%" }, { left: "100%" }, { left: "0%" }], { duration: seconds * 1000 });
      await animation.finished.catch(() => {});
    }
    if (current !== run) return;
    const reading = km(distance) + " · " + seconds.toFixed(3) + " s";
    result.textContent = "Echo received in " + seconds.toFixed(3) + " seconds." +
      (guess === null ? "" : " Your prediction was off by " + Math.abs(seconds - guess).toFixed(3) + " seconds.");
    readings.unshift(reading);
    readings.splice(3);
    renderHistory();
    slider.disabled = fire.disabled = prediction.disabled = false;
  });
  reset.addEventListener("click", () => {
    run++;
    animation?.cancel();
    slider.disabled = fire.disabled = prediction.disabled = false;
    slider.value = "384400";
    value.value = km(384400);
    prediction.value = "";
    readings.length = 0;
    renderHistory();
    result.textContent = "Ready to transmit.";
  });
}

const launch = document.getElementById("separate");
if (launch) {
  const diagram = document.querySelector(".separation");
  const status = document.getElementById("separation-result");
  launch.addEventListener("click", () => {
    diagram.classList.add("launched");
    launch.disabled = true;
    status.textContent = "The cabin lifted off. The descent engine and landing legs stayed on the Moon.";
  });
  document.getElementById("rejoin").addEventListener("click", () => {
    diagram.classList.remove("launched");
    launch.disabled = false;
    status.textContent = "Both stages are on the surface.";
  });
}

const quakePlay = document.getElementById("play-quake");
if (quakePlay) {
  const quakeStop = document.getElementById("stop-quake");
  const trace = document.querySelector(".quake-trace");
  const status = document.getElementById("quake-result");
  const duration = 3.1;
  let sound, timer, context, sequence = 0;
  function finish(text) {
    clearTimeout(timer);
    if (sound) {
      try { sound.stop(); } catch {}
      sound.disconnect();
      sound = null;
    }
    trace.classList.remove("is-playing");
    quakePlay.disabled = false;
    quakeStop.disabled = true;
    status.textContent = text;
  }
  quakeStop.addEventListener("click", () => { sequence++; finish("Playback stopped."); });
  quakePlay.addEventListener("click", async () => {
    const id = ++sequence;
    quakePlay.disabled = true;
    quakeStop.disabled = false;
    let audible = false;
    try {
      context ||= new AudioContext();
      await context.resume();
      if (id !== sequence) return;
      const buffer = context.createBuffer(1, Math.ceil(duration * context.sampleRate), context.sampleRate);
      const samples = buffer.getChannelData(0);
      for (let i = 0; i < samples.length; i++) {
        const t = i / context.sampleRate;
        const event = Math.max(0, t - 1.18);
        const swell = (1 - Math.exp(-event * 11)) * Math.exp(-event * 2.2);
        samples[i] = (Math.sin(t * 260) + .43 * Math.sin(t * 520)) * swell * .18 + (Math.random() - .5) * .013;
      }
      sound = context.createBufferSource();
      sound.buffer = buffer;
      sound.connect(context.destination);
      sound.start();
      audible = true;
    } catch {
      // The visual trace remains available when audio playback is blocked.
    }
    if (id !== sequence) return;
    trace.classList.add("is-playing");
    status.textContent = audible ? "Playing a simulated marsquake. Listen for the stronger shaking." : "Showing the trace. Audio is unavailable.";
    timer = setTimeout(() => finish("The strongest shaking arrives after the quiet baseline."), duration * 1000);
  });
  window.addEventListener("pagehide", () => { sequence++; finish(""); });
}

const golf = document.getElementById("golf-angle");
if (golf) {
  golf.addEventListener("input", () => { document.getElementById("golf-angle-value").value = golf.value + "°"; });
  document.getElementById("golf-hit").addEventListener("click", () => {
    const angle = Number(golf.value) * Math.PI / 180;
    const distance = (8 ** 2) * Math.sin(2 * angle) / 1.62;
    const ball = document.querySelector(".golf-track i");
    ball.getAnimations?.().forEach(animation => animation.cancel());
    const finish = 5 + distance / 40 * 84;
    if (!reducedMotion.matches && ball.animate) {
      ball.animate([{left:"5%",bottom:"6px"},{left:(5 + finish) / 2 + "%",bottom:(17 + Math.sin(angle) * 60) + "px"},{left:finish + "%",bottom:"6px"}],{duration:700,fill:"forwards"});
    } else {
      ball.style.left = finish + "%";
    }
    document.getElementById("golf-result").textContent = "Simulated range: " + distance.toFixed(1) + " m. Try a different angle.";
  });
}
const scan = document.getElementById("viking-scan");
if (scan) {
  let strips = 0;
  function renderScan() {
    document.querySelector(".scan-image").style.setProperty("--unseen", (6 - strips) / 6 * 100 + "%");
    document.getElementById("viking-result").textContent = strips + " of 6 strips";
    scan.disabled = strips === 6;
  }
  scan.addEventListener("click", () => { strips++; renderScan(); });
  document.getElementById("viking-reset").addEventListener("click", () => { strips = 0; renderScan(); });
}
const booth = document.querySelector("[data-booth]");
if (booth) {
  const get = id => document.getElementById(id);
  const canvas = get("strip");
  const ctx = canvas.getContext("2d");
  const exhibit = get("booth-exhibit");
  const frame = get("booth-frame");
  const name = get("booth-name");
  const upload = get("photo-upload");
  const video = get("booth-camera");
  const start = get("start-camera");
  const capture = get("capture-photo");
  const stop = get("stop-camera");
  const status = get("booth-status");
  const certificate = get("download-certificate");
  const photos = [];
  let stream;
  let photoRevision = 0;
  const frames = {
    lunar: { paper: "#14151b", ink: "#f5f2e7", panel: "#242733", line: "#aeb2c7", filter: "grayscale(100%) contrast(115%)" },
    mars: { paper: "#6d2f22", ink: "#fff0db", panel: "#8a4635", line: "#ffd2a9", filter: "sepia(24%) saturate(115%)" },
    archive: { paper: "#efe5d0", ink: "#2f2830", panel: "#d8cab6", line: "#604a42", filter: "sepia(12%)" },
    midnight: { paper:"#25204b", ink:"#f3d9ff", panel:"#40376a", line:"#cbb8fb", filter:"saturate(105%)" },
    sunrise: { paper:"#e59363", ink:"#342015", panel:"#c67551", line:"#42271e", filter:"sepia(18%) saturate(120%)" },
    silver: { paper:"#dce1e5", ink:"#252a32", panel:"#bdc6cd", line:"#5d6570", filter:"grayscale(100%)" }
  };
  const requested = new URLSearchParams(location.search).get("exhibit");
  if (Object.hasOwn(window.EXHIBITS, requested)) {
    exhibit.value = requested;
    if (window.EXHIBITS[requested].world === "Mars") frame.value = "mars";
  }

  function cover(image, x, y, width, height, filter) {
    const scale = Math.max(width / image.width, height / image.height);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();
    ctx.filter = filter;
    ctx.drawImage(image, x + (width - image.width * scale) / 2, y + (height - image.height * scale) / 2,
      image.width * scale, image.height * scale);
    ctx.restore();
  }

  const layouts = {
    strip: {width:480,height:1120,columns:1,cell:204},
    square: {width:900,height:900,columns:2,cell:320},
    story: {width:720,height:1280,columns:2,cell:482}
  };
  const addOns = ["booth-size","booth-border","booth-date","booth-fact","booth-caption"];
  function draw() {
    const theme = frames[frame.value];
    const record = window.EXHIBITS[exhibit.value];
    const layout = layouts[get("booth-size").value];
    const {width,height,columns,cell} = layout;
    canvas.width = width;
    canvas.height = height;
    const padding = 34;
    const gap = 14;
    const frameWidth = (width - padding * 2 - (columns - 1) * gap) / columns;
    ctx.fillStyle = theme.paper;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = theme.ink;
    ctx.font = "bold 32px monospace";
    ctx.fillText("LEFT BEHIND", padding, 46);
    ctx.font = "15px monospace";
    ctx.fillText("SARAWAK / " + record.world.toUpperCase() + " EXHIBITION", padding, 73, width - padding * 2);
    const border = get("booth-border").value;
    if (border !== "plain") {
      ctx.fillStyle = theme.line;
      ctx.font = "17px sans-serif";
      for (let y = 110; y < height - 24; y += 38) {
        for (const x of [11,width - 22]) {
          if (border === "film") ctx.fillRect(x,y,10,16);
          else ctx.fillText("✦",x,y);
        }
      }
    }
    for (let i = 0; i < 4; i++) {
      const x = padding + i % columns * (frameWidth + gap);
      const y = 92 + Math.floor(i / columns) * (cell + gap);
      ctx.fillStyle = theme.panel;
      ctx.fillRect(x, y, frameWidth, cell);
      if (photos[i]) {
        cover(photos[i], x, y, frameWidth, cell, theme.filter);
      } else {
        const cx = x + frameWidth / 2, cy = y + cell / 2;
        ctx.strokeStyle = theme.line;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 68, 23, -.45, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, 37, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = theme.ink;
        ctx.font = "14px monospace";
        ctx.fillText("FRAME 0" + (i + 1), x + 13, y + cell - 16);
      }
    }
    const footer = 92 + (4 / columns) * (cell + gap) + 28;
    const lineWidth = width - padding * 2;
    ctx.fillStyle = theme.ink;
    ctx.font = "bold 22px monospace";
    ctx.fillText(record.name.toUpperCase(), padding, footer, lineWidth);
    ctx.font = "16px monospace";
    const date = get("booth-date").checked ? new Intl.DateTimeFormat("en-GB",{dateStyle:"medium"}).format(new Date()) : "";
    const caption = get("booth-caption").value.trim();
    ctx.fillText([name.value.trim(), caption, date].filter(Boolean).join(" · ") || "EXHIBITION PHOTO STRIP", padding, footer + 24, lineWidth);
    if (!get("booth-fact").checked) return;
    ctx.font = "15px sans-serif";
    let line = "";
    let y = footer + 48;
    for (const word of record.fact.split(" ")) {
      const next = line ? line + " " + word : word;
      if (ctx.measureText(next).width > lineWidth) {
        ctx.fillText(line, padding, y);
        line = word;
        y += 18;
      } else {
        line = next;
      }
    }
    if (line) ctx.fillText(line, padding, y);
  }

  function updateStatus(message) {
    status.textContent = message;
    capture.disabled = photos.length >= 4;
    certificate.disabled = visitedStories().length === 0;
    certificate.title = certificate.disabled ? "Finish any exhibit to unlock your certificate" : "";
    draw();
  }

  function loadPhoto(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image could not be read")); };
      img.src = url;
    });
  }

  upload.addEventListener("change", async () => {
    const revision = photoRevision;
    const files = [...upload.files].slice(0, Math.max(0, 4 - photos.length));
    upload.value = "";
    if (!files.length) return updateStatus("All four frames are full. Clear photos to start again.");
    const results = await Promise.allSettled(files.map(loadPhoto));
    if (revision !== photoRevision) return;
    const added = results.filter(item => item.status === "fulfilled").map(item => item.value);
    photos.push(...added.slice(0, 4 - photos.length));
    updateStatus(photos.length + " of 4 photos added." +
      (results.some(item => item.status === "rejected") ? " Some files couldn’t be read. Try JPG or PNG." : ""));
  });

  function stopCamera() {
    stream?.getTracks().forEach(track => track.stop());
    stream = undefined;
    video.srcObject = null;
    video.hidden = capture.hidden = stop.hidden = true;
    start.hidden = false;
  }

  start.addEventListener("click", async () => {
    if (photos.length >= 4) return updateStatus("All four frames are full. Clear photos to start again.");
    if (!navigator.mediaDevices?.getUserMedia) return updateStatus("Camera unavailable here. Upload photos instead.");
    start.disabled = true;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      video.srcObject = stream;
      video.hidden = capture.hidden = stop.hidden = false;
      start.hidden = true;
      updateStatus("Camera open. Tap Take photo for each frame.");
    } catch {
      stopCamera();
      updateStatus("Camera access unavailable. You can upload photos instead.");
    } finally {
      start.disabled = false;
    }
  });

  capture.addEventListener("click", () => {
    if (!video.videoWidth || photos.length >= 4) return;
    const photo = document.createElement("canvas");
    photo.width = video.videoWidth;
    photo.height = video.videoHeight;
    photo.getContext("2d").drawImage(video, 0, 0);
    photos.push(photo);
    if (photos.length === 4) stopCamera();
    updateStatus(photos.length + " of 4 photos added.");
  });

  stop.addEventListener("click", () => {
    stopCamera();
    updateStatus("Camera closed. " + photos.length + " of 4 photos added.");
  });
  window.addEventListener("pagehide", stopCamera);

  function download(image, filename) {
    image.toBlob(blob => {
      if (!blob) return updateStatus("The download couldn’t be made. Try again.");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  }

  exhibit.addEventListener("change", draw);
  frame.addEventListener("change", draw);
  name.addEventListener("input", draw);
  for (const option of addOns) get(option).addEventListener("input", draw);
  get("clear-photos").addEventListener("click", () => {
    photoRevision++;
    photos.length = 0;
    updateStatus("Photos cleared.");
  });
  get("download-strip").addEventListener("click", () => download(canvas, "left-behind-photo-strip.png"));
  certificate.addEventListener("click", () => {
    const visited = visitedStories();
    if (!visited.length) return;
    const cert = document.createElement("canvas");
    cert.width = 1200;
    cert.height = 800;
    const c = cert.getContext("2d");
    c.fillStyle = "#f8f1df";
    c.fillRect(0, 0, 1200, 800);
    c.strokeStyle = "#a04629";
    c.lineWidth = 5;
    c.strokeRect(35, 35, 1130, 730);
    c.textAlign = "center";
    c.fillStyle = "#9b422a";
    c.font = "bold 29px monospace";
    c.fillText("LEFT BEHIND / SARAWAK SPACE CHALLENGE", 600, 146);
    c.fillStyle = "#191a22";
    c.font = "bold 74px Georgia";
    c.fillText("Space Curator", 600, 282, 1030);
    c.font = "34px sans-serif";
    c.fillText(name.value.trim() || "Exhibition visitor", 600, 382, 950);
    c.font = "23px sans-serif";
    c.fillText("Completed an exhibit in the Left Behind space exhibition.", 600, 474);
    const completedId = visited.includes(exhibit.value) ? exhibit.value : visited.at(-1);
    c.fillText(window.EXHIBITS[completedId]?.name || "Mission record", 600, 518, 950);
    c.font = "20px monospace";
    c.fillText(new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(new Date()), 600, 650);
    download(cert, "left-behind-curator-certificate.png");
  });
  const prompt = "Add up to four photos. Your photos stay on this device.";
  updateStatus(prompt + (visitedStories().length ? "" : " Finish any exhibit to unlock the certificate."));
}
