/* =========================================================
   3D spinning Moon and Mars for the home page (uses three.js)
   - Drag a planet to spin it. It also turns slowly by itself.
   - Each pin sits on the real landing coordinates and moves with the globe.
   - If three.js cannot load, the flat planets stay as they were.
   ========================================================= */
(function () {
  "use strict";
  if (!window.THREE) return;

  // Landing coordinates (latitude, longitude). North and East are positive.
  var COORDS = {
    "apollo-11": [0.67, 23.47], "apollo-14": [-3.65, -17.47], "apollo-15": [26.13, 3.63],
    "apollo-16": [-8.97, 15.50], "apollo-17": [20.19, 30.77], "surveyor-3": [-3.02, -23.42],
    "sojourner": [19.13, -33.22], "viking-1": [22.27, -47.95], "spirit": [-14.6, 175.5],
    "opportunity": [-2.2, -5.5], "insight": [4.5, 135.62], "phoenix": [68.22, -125.7],
    "ingenuity": [18.4, 77.5]
  };

  // Draws a paper-style planet surface onto a canvas (no internet images needed)
  function makeTexture(kind) {
    var c = document.createElement("canvas"); c.width = 1024; c.height = 512;
    var g = c.getContext("2d"), seed = kind === "moon" ? 11 : 97;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    if (kind === "moon") {
      g.fillStyle = "#a9a8b0"; g.fillRect(0, 0, 1024, 512);
      for (var i = 0; i < 14; i++) blob(rnd() * 1024, 120 + rnd() * 280, 40 + rnd() * 110, "rgba(66,66,82,.7)");
    } else {
      var lg = g.createLinearGradient(0, 0, 0, 512);
      lg.addColorStop(0, "#b4583c"); lg.addColorStop(.5, "#d07e55"); lg.addColorStop(1, "#a94f36");
      g.fillStyle = lg; g.fillRect(0, 0, 1024, 512);
      for (var j = 0; j < 18; j++) blob(rnd() * 1024, 150 + rnd() * 230, 40 + rnd() * 120, "rgba(84,34,30,.55)");
      g.strokeStyle = "rgba(80,30,24,.55)"; g.lineWidth = 6; g.beginPath(); g.moveTo(330, 265); g.bezierCurveTo(380, 275, 430, 270, 480, 285); g.stroke();
      cap(0, 40); cap(512, 472);
    }
    for (var k = 0; k < 9000; k++) { g.fillStyle = rnd() < .5 ? "rgba(0,0,0,.06)" : "rgba(255,255,255,.05)"; g.fillRect(rnd() * 1024, rnd() * 512, 2, 2); }
    var n = kind === "moon" ? 260 : 120;
    for (var m = 0; m < n; m++) {
      var x = rnd() * 1024, y = 20 + rnd() * 472, r = Math.pow(rnd(), 3) * 22 + 1.5;
      g.fillStyle = "rgba(0,0,0,.2)"; g.beginPath(); g.arc(x, y, r, 0, 6.28); g.fill();
      g.strokeStyle = "rgba(255,255,255,.18)"; g.lineWidth = Math.max(1, r / 5); g.beginPath(); g.arc(x - r * .15, y - r * .15, r, 3.4, 5.9); g.stroke();
    }
    function blob(x, y, r, col) { var gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 6.28); g.fill(); }
    function cap(y0, y1) { var pg = g.createLinearGradient(0, y0, 0, y1); pg.addColorStop(0, "#f6eee8"); pg.addColorStop(1, "rgba(246,238,232,0)"); g.fillStyle = pg; g.fillRect(0, Math.min(y0, y1), 1024, 40); }
    var t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
  }

  function latLon(lat, lon) {
    var phi = (90 - lat) * Math.PI / 180, th = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(-Math.sin(phi) * Math.cos(th), Math.cos(phi), Math.sin(phi) * Math.sin(th));
  }

  function buildGlobe(world) {
    var kind = world.classList.contains("mars") ? "mars" : "moon";
    var disc = world.querySelector(".map-disc");
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { return; }
    world.classList.add("has-globe");
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    var canvas = renderer.domElement; canvas.className = "globe-canvas";
    disc.appendChild(canvas);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(30, 1, .1, 100); camera.position.z = 3.9;
    scene.add(new THREE.AmbientLight(0xffffff, .42));
    var sun = new THREE.DirectionalLight(0xfff3e0, 1.1); sun.position.set(-3, 1.8, 3); scene.add(sun);
    var tex = makeTexture(kind);
    var planet = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 96),
      new THREE.MeshStandardMaterial({ map: tex, bumpMap: tex, bumpScale: .025, roughness: 1, metalness: 0 }));
    scene.add(planet);

    // Connect each HTML pin to a point on the globe
    var pins = [].slice.call(world.querySelectorAll(".map-pin")).map(function (a) {
      var id = (a.getAttribute("href") || "").split("/").pop().replace(".html", "");
      var c = COORDS[id];
      return c ? { el: a, local: latLon(c[0], c[1]) } : null;
    }).filter(Boolean);

    // start facing the side where most landing sites are
    var start = kind === "moon" ? latLon(8, 8) : latLon(18, -25);
    var sy = -Math.atan2(start.x, start.z), sx = .25;
    var rot = { x: sx, y: sy }, target = { x: sx, y: sy }, auto = true, hover = false, timer, size = 0;
    // pause the slow spin while the mouse is over the planet, so pins are easy to click
    world.addEventListener("pointerenter", function () { hover = true; });
    world.addEventListener("pointerleave", function () { hover = false; });
    world.addEventListener("focusin", function () { hover = true; });
    world.addEventListener("focusout", function () { hover = false; });
    function resize() {
      size = disc.clientWidth;
      renderer.setSize(size, size, false); camera.aspect = 1; camera.updateProjectionMatrix();
    }
    resize(); window.addEventListener("resize", resize);

    // Drag to spin
    var down = null;
    canvas.addEventListener("pointerdown", function (e) { down = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); auto = false; clearTimeout(timer); world.classList.add("dragging"); });
    canvas.addEventListener("pointermove", function (e) {
      if (!down) return;
      target.y += (e.clientX - down.x) * .009;
      target.x = Math.max(-1.2, Math.min(1.2, target.x + (e.clientY - down.y) * .009));
      down = { x: e.clientX, y: e.clientY };
    });
    function release() { down = null; world.classList.remove("dragging"); timer = setTimeout(function () { auto = true; }, 4000); }
    canvas.addEventListener("pointerup", release); canvas.addEventListener("pointercancel", release);

    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var v = new THREE.Vector3();
    (function loop() {
      requestAnimationFrame(loop);
      if (auto && !hover && !reduced) target.y += .0022;
      rot.x += (target.x - rot.x) * .08; rot.y += (target.y - rot.y) * .08;
      if (Math.abs(target.x - rot.x) < 1e-4) rot.x = target.x;
      if (Math.abs(target.y - rot.y) < 1e-4) rot.y = target.y;
      planet.rotation.set(rot.x, rot.y, 0);
      planet.updateMatrixWorld();
      renderer.render(scene, camera);
      // place pins: project each landing point to the screen
      var dr = disc.getBoundingClientRect(), wr = world.getBoundingClientRect();
      pins.forEach(function (p) {
        v.copy(p.local).applyMatrix4(planet.matrixWorld);
        var front = v.z > .12;
        var s = v.clone().multiplyScalar(1.01).project(camera);
        var x = dr.left - wr.left + (s.x + 1) / 2 * dr.width, y = dr.top - wr.top + (1 - s.y) / 2 * dr.height;
        var lx = Math.round(x * 2) / 2 + "px", ly = Math.round(y * 2) / 2 + "px";
        if (p.el.style.left !== lx) p.el.style.left = lx;
        if (p.el.style.top !== ly) p.el.style.top = ly;
        p.el.style.opacity = front ? Math.min(1, (v.z - .12) * 4) : 0;
        p.el.style.zIndex = Math.round(v.z * 100) + 10;
        p.el.style.pointerEvents = front ? "auto" : "none";
        p.el.tabIndex = front ? 0 : -1;
      });
    })();
  }

  [].forEach.call(document.querySelectorAll(".map-world.moon, .map-world.mars"), buildGlobe);
})();
