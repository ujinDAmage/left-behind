"use strict";

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const storageKey = "left-behind-visited";
const assetBase = new URL(".", document.currentScript.src);

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
  if (!photo?.file) continue;
  const img = figure.querySelector("img");
  const caption = figure.querySelector("figcaption");
  img.addEventListener("load", () => {
    img.hidden = false;
    figure.querySelector(".image-placeholder").hidden = true;
    caption.hidden = !photo.credit;
  });
  img.alt = photo.alt || img.alt;
  caption.textContent = photo.credit || "";
  img.loading = "eager";
  img.src = new URL("photos/" + encodeURIComponent(photo.file), assetBase);
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
  const slider = reader.querySelector("#trail-position");
  const trail = reader.querySelector(".trail");
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
    if (counter) counter.textContent = (index + 1) + " / " + scenes.length;
    if (slider) {
      slider.value = String(index);
      slider.setAttribute("aria-valuetext", scenes[index].querySelector("h3").textContent);
      trail.style.setProperty("--step", index);
      trail.style.setProperty("--lift", index === 1 ? 1 : 0);
    }
    if (animate && !reducedMotion.matches && scenes[index].animate) {
      const frames = reader.classList.contains("flip")
        ? [{ transform: "rotateY(-32deg)", opacity: .35 }, { transform: "rotateY(0)", opacity: 1 }]
        : [{ opacity: .35, transform: "translateY(5px)" }, { opacity: 1, transform: "translateY(0)" }];
      scenes[index].animate(frames, { duration: 340, easing: "ease-out" });
    }
  }

  prev?.addEventListener("click", () => show(position - 1));
  next?.addEventListener("click", () => show(position + 1));
  slider?.addEventListener("input", () => show(Number(slider.value)));
  for (const choice of choices) choice.addEventListener("click", () => show(Number(choice.dataset.sceneIndex)));
  show(0, false);
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
    archive: { paper: "#efe5d0", ink: "#2f2830", panel: "#d8cab6", line: "#604a42", filter: "sepia(12%)" }
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

  function draw() {
    const theme = frames[frame.value];
    const record = window.EXHIBITS[exhibit.value];
    ctx.fillStyle = theme.paper;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = theme.ink;
    ctx.font = "bold 32px monospace";
    ctx.fillText("LEFT BEHIND", 33, 46);
    ctx.font = "15px monospace";
    ctx.fillText("SARAWAK / " + record.world.toUpperCase() + " EXHIBITION", 34, 73, 412);
    for (let i = 0; i < 4; i++) {
      const y = 92 + i * 218;
      ctx.fillStyle = theme.panel;
      ctx.fillRect(34, y, 412, 204);
      if (photos[i]) {
        cover(photos[i], 34, y, 412, 204, theme.filter);
      } else {
        ctx.strokeStyle = theme.line;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(240, y + 99, 79, 25, -.45, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(240, y + 99, 42, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = theme.ink;
        ctx.font = "14px monospace";
        ctx.fillText("FRAME 0" + (i + 1), 47, y + 187);
      }
    }
    ctx.fillStyle = theme.ink;
    ctx.font = "bold 22px monospace";
    ctx.fillText(record.name.toUpperCase(), 34, 1000, 412);
    ctx.font = "16px monospace";
    ctx.fillText(name.value.trim() || "EXHIBITION PHOTO STRIP", 34, 1026, 412);
    ctx.font = "15px sans-serif";
    let line = "";
    let y = 1054;
    for (const word of record.fact.split(" ")) {
      const next = line ? line + " " + word : word;
      if (ctx.measureText(next).width > 410) {
        ctx.fillText(line, 34, y);
        line = word;
        y += 19;
      } else {
        line = next;
      }
    }
    if (line) ctx.fillText(line, 34, y);
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
