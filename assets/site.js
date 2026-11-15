"use strict";

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const storageKey = "left-behind-visited";
const assetBase = new URL(".", document.currentScript.src);

document.addEventListener("mission-complete", event => markStory(event.target.dataset.cartoon));

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
  if (photo.source) {
    credit.href = photo.source;
    if (new URL(credit.href).origin !== location.origin) {
      credit.target = "_blank";
      credit.rel = "noopener noreferrer";
    }
  }
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

const labPicker = document.getElementById("lab-activity");
if (labPicker) {
  const labCards = [...document.querySelectorAll(".single-activity > .work-card")];
  function selectActivity() {
    const match = labCards.find(card => "#" + card.id === location.hash);
    const active = match?.id || labCards[0].id;
    for (const card of labCards) {
      const visible = card.id === active;
      if (!visible && !card.hidden) card.dispatchEvent(new Event("activity-hidden"));
      card.hidden = !visible;
    }
    labPicker.value = active;
  }
  labPicker.addEventListener("change", () => {
    history.replaceState(null, "", "#" + labPicker.value);
    selectActivity();
  });
  window.addEventListener("hashchange", selectActivity);
  selectActivity();
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

const booth = document.querySelector("[data-booth]");
if (booth) {
  const get = id => document.getElementById(id);
  const canvas = get("strip");
  const ctx = canvas.getContext("2d");
  const exhibit = get("booth-exhibit");
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
  const requested = new URLSearchParams(location.search).get("exhibit");
  if (Object.hasOwn(window.EXHIBITS, requested)) {
    exhibit.value = requested;

  }

  function cover(image, x, y, width, height) {
    const scale = Math.max(width / image.width, height / image.height);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();
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
  const souvenirArt = document.createElement("canvas");
  souvenirArt.width = 900;
  souvenirArt.height = 480;
  function draw() {
    const mission = window.CartoonExhibits?.[exhibit.value];
    const theme = mission
      ? {paper:mission[0],ink:"#fff8eb",panel:"#100d2d",line:mission[1]}
      : {paper:"#25204b",ink:"#f3d9ff",panel:"#40376a",line:"#cbb8fb"};
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
    if (mission) {
      missionArt(souvenirArt, exhibit.value, 1.2);
      ctx.save();
      ctx.globalAlpha = .43;
      const margin = 6;
      ctx.strokeStyle = mission[1];
      ctx.lineWidth = 3;
      ctx.strokeRect(margin, margin, width - 2 * margin, height - 2 * margin);
      ctx.globalAlpha = 1;
      const motif = Object.keys(window.CartoonExhibits).indexOf(exhibit.value);
      for (let i = 0; i < 12; i++) {
        const y = 102 + i * (height - 155) / 11;
        for (const x of [18,width - 18]) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate((motif * 19 + i * 27) * Math.PI / 180);
          ctx.beginPath();
          const sides = 3 + motif % 6;
          for (let j = 0; j < sides; j++) {
            const angle = j * Math.PI * 2 / sides;
            const radius = 4 + (j + motif) % 3;
            if (j === 0) ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
            else ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
          }
          ctx.closePath(); ctx.stroke(); ctx.restore();
        }
      }
      ctx.save();
      ctx.beginPath(); ctx.roundRect(width - 134, 10, 120, 64, 12); ctx.clip();
      ctx.drawImage(souvenirArt,width - 134,10,120,64);
      ctx.restore();
      ctx.restore();
    }
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
      if (mission) {
        ctx.strokeStyle = mission[1];
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 2, y - 2, frameWidth + 4, cell + 4);
      }
      if (photos[i]) {
        cover(photos[i], x, y, frameWidth, cell);
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
    certificate.title = certificate.disabled ? "Watch a mission animation to the end to unlock your certificate" : "";
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