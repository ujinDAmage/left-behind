(() => {
  const quake = document.getElementById("quake-video");
  const play = document.getElementById("play-quake");
  const stop = document.getElementById("stop-quake");
  const quakeStatus = document.getElementById("quake-result");
  let playbackRequest = 0;

  function stopQuake(message = "") {
    playbackRequest++;
    quake.pause();
    if (quake.readyState) quake.currentTime = 0;
    play.disabled = false;
    stop.disabled = true;
    quakeStatus.textContent = message;
  }

  play.addEventListener("click", async () => {
    const request = ++playbackRequest;
    play.disabled = true;
    stop.disabled = false;
    quakeStatus.textContent = "Loading NASA’s recording…";
    try {
      await quake.play();
      if (request === playbackRequest) quakeStatus.textContent = "Playing the recorded marsquake.";
    } catch {
      if (request === playbackRequest) stopQuake("Playback is unavailable here. Open the original recording below.");
    }
  });
  quake.addEventListener("ended", () => stopQuake("Recording finished."));
  stop.addEventListener("click", () => stopQuake("Playback stopped."));
  quake.closest(".work-card").addEventListener("activity-hidden", () => stopQuake());
  window.addEventListener("pagehide", () => stopQuake());

  const dust = document.getElementById("viking-dust");
  const dustContext = dust.getContext("2d");
  const reveal = document.getElementById("viking-reveal");
  const scratchStatus = document.getElementById("viking-result");
  let pointer, lastPoint;

  function resetDust() {
    pointer = undefined;
    dust.hidden = false;
    reveal.disabled = false;
    const gradient = dustContext.createLinearGradient(0, 0, 800, 440);
    gradient.addColorStop(0, "#fc9660");
    gradient.addColorStop(.5, "#ba4539");
    gradient.addColorStop(1, "#6b263d");
    dustContext.fillStyle = gradient;
    dustContext.fillRect(0, 0, 800, 440);
    for (let i = 0; i < 2400; i++) {
      dustContext.fillStyle = i % 3 ? "#ffbc7850" : "#4a20385c";
      dustContext.fillRect(i * 173.31 % 800, i * 83.79 % 440, i % 4 + 1, i % 3 + 1);
    }
    dustContext.textAlign = "center";
    dustContext.font = "bold 42px system-ui";
    dustContext.fillStyle = "#fff2ce";
    dustContext.fillText("SCRATCH HERE", 400, 229);
  }

  function scratch(event) {
    const rect = dust.getBoundingClientRect();
    const point = [(event.clientX - rect.left) * 800 / rect.width, (event.clientY - rect.top) * 440 / rect.height];
    dustContext.save();
    dustContext.globalCompositeOperation = "destination-out";
    dustContext.lineWidth = 82;
    dustContext.lineCap = "round";
    dustContext.beginPath();
    dustContext.moveTo(...(lastPoint || [point[0] - 1, point[1]]));
    dustContext.lineTo(...point);
    dustContext.stroke();
    dustContext.restore();
    lastPoint = point;
  }

  dust.addEventListener("pointerdown", event => {
    if (pointer !== undefined || event.button !== 0) return;
    pointer = event.pointerId;
    lastPoint = undefined;
    dust.setPointerCapture(pointer);
    scratch(event);
  });
  dust.addEventListener("pointermove", event => {
    if (event.pointerId === pointer) scratch(event);
  });
  dust.addEventListener("lostpointercapture", event => {
    if (event.pointerId === pointer) pointer = undefined;
  });
  reveal.addEventListener("click", () => {
    pointer = undefined;
    dust.hidden = true;
    reveal.disabled = true;
    scratchStatus.textContent = "Viking 1’s photograph is uncovered.";
  });
  document.getElementById("viking-reset").addEventListener("click", () => {
    resetDust();
    scratchStatus.textContent = "Dust restored.";
  });
  resetDust();

  const golf = document.getElementById("golf-angle");
  const golfValue = document.getElementById("golf-angle-value");
  const golfResult = document.getElementById("golf-result");
  const scene = document.getElementById("golf-scene").getContext("2d");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let frame;

  function drawGolf(flight = 0, swing = 0) {
    const angle = Number(golf.value) * Math.PI / 180;
    const speed = 8;
    const gravity = 1.62;
    const duration = 2 * speed * Math.sin(angle) / gravity;
    const range = speed * Math.cos(angle) * duration;
    const teeX = 273, teeY = 295, scale = 13;
    function position(progress) {
      const seconds = duration * progress;
      return [
        teeX + speed * Math.cos(angle) * seconds * scale,
        teeY - (speed * Math.sin(angle) * seconds - gravity * seconds ** 2 / 2) * scale
      ];
    }
    function ellipse(x, y, rx, ry, color) {
      scene.beginPath();
      scene.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      scene.fillStyle = color;
      scene.fill();
    }
    function stroke(points, color, width) {
      scene.beginPath();
      scene.moveTo(...points[0]);
      for (const point of points.slice(1)) scene.lineTo(...point);
      scene.strokeStyle = color;
      scene.lineWidth = width;
      scene.lineCap = scene.lineJoin = "round";
      scene.stroke();
    }

    const sky = scene.createLinearGradient(0, 0, 0, 320);
    sky.addColorStop(0, "#211c57");
    sky.addColorStop(1, "#a163b6");
    scene.fillStyle = sky;
    scene.fillRect(0, 0, 900, 360);
    for (let i = 0; i < 44; i++) ellipse(i * 47.19 % 900, i * 37.61 % 230, i % 5 ? 1.3 : 2.5, i % 5 ? 1.3 : 2.5, "#fff1cb");
    ellipse(754, 93, 55, 55, "#6ad2d9");
    ellipse(770, 81, 30, 13, "#9ce4c7");
    ellipse(743, 114, 20, 12, "#b9ebd7");
    ellipse(520, 350, 605, 122, "#514388");
    ellipse(330, 368, 680, 100, "#ab83bd");
    ellipse(195, 309, 87, 12, "#69538f");
    ellipse(642, 325, 74, 9, "#8c68a8");
    ellipse(755, 309, 25, 6, "#574375");
    stroke([[754, 309], [754, 252], [792, 263], [754, 273]], "#ffb267", 5);

    const path = Array.from({length: 29}, (_, i) => position(i / 28));
    scene.setLineDash([4, 12]);
    stroke(path, "#ffe495", 4);
    scene.setLineDash([]);

    stroke([[151, 241], [134, 289], [113, 293]], "#6a77b0", 23);
    stroke([[167, 241], [185, 285], [207, 291]], "#f4eeff", 23);
    stroke([[133, 188], [124, 228]], "#bf79c6", 28);
    ellipse(155, 215, 34, 43, "#8c99c9");
    ellipse(163, 211, 32, 42, "#f8f2ff");
    ellipse(161, 150, 36, 36, "#9ca8d7");
    ellipse(166, 145, 33, 33, "#fff3fb");
    ellipse(175, 147, 24, 20, "#252752");
    ellipse(181, 140, 12, 5, "#71e4e7");
    ellipse(171, 210, 10, 8, "#f18a85");

    const clubAngle = .92 - angle + swing;
    const hand = [174 + 44 * Math.cos(clubAngle), 208 + 44 * Math.sin(clubAngle)];
    const clubHead = [hand[0] + 68 * Math.cos(clubAngle + .55), hand[1] + 68 * Math.sin(clubAngle + .55)];
    stroke([[169, 199], [(169 + hand[0]) / 2, hand[1] + 10], hand], "#f6ecfa", 14);
    stroke([hand, clubHead], "#ffcf85", 6);
    stroke([clubHead, [clubHead[0] + 9, clubHead[1] - 5]], "#63e4e9", 9);
    ellipse(...hand, 8, 8, "#d9d2fa");
    ellipse(...position(flight), 8, 8, "#fff9e6");
    return range;
  }

  golf.addEventListener("input", () => {
    cancelAnimationFrame(frame);
    golfValue.value = golf.value + "°";
    golfResult.textContent = "";
    drawGolf();
  });
  document.getElementById("golf-hit").addEventListener("click", () => {
    cancelAnimationFrame(frame);
    const start = performance.now();
    golfResult.textContent = "Swinging…";
    function playSwing(now) {
      const time = reducedMotion.matches ? 1 : Math.min(1, (now - start) / 1650);
      const swing = time < .23 ? Math.sin(time / .23 * Math.PI) * -1.35 : Math.sin((time - .23) / .77 * Math.PI) * .65;
      const range = drawGolf(Math.max(0, (time - .23) / .77), swing);
      if (time < 1) frame = requestAnimationFrame(playSwing);
      else golfResult.textContent = "Simulated range: " + range.toFixed(1) + " m.";
    }
    frame = requestAnimationFrame(playSwing);
  });
  drawGolf();
})();
