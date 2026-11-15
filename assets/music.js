(() => {
  const toggle = document.querySelector("[data-music-toggle]");
  if (!toggle) return;

  const music = new Audio(new URL("audio/space-atmosphere.mp3", document.currentScript.src));
  music.loop = true;
  music.preload = "none";
  music.volume = .28;

  const quake = document.getElementById("quake-video");
  const preferenceKey = "left-behind-background-music";
  let enabled = false;
  let request = 0;

  try {
    enabled = localStorage.getItem(preferenceKey) === "on";
  } catch {
    // Music can still be controlled when browser storage is unavailable.
  }

  function showState() {
    toggle.setAttribute("aria-pressed", String(enabled));
    toggle.textContent = !enabled ? "Music off" : quake && !quake.paused ? "Music paused" : "Music on";
  }

  async function syncMusic() {
    const currentRequest = ++request;
    showState();
    if (!enabled || (quake && !quake.paused)) {
      music.pause();
      return;
    }

    try {
      await music.play();
    } catch {
      if (currentRequest !== request) return;
      // A browser may require a fresh click before it allows audio on this page.
      enabled = false;
      showState();
    }
  }

  toggle.addEventListener("click", () => {
    enabled = !enabled;
    try {
      localStorage.setItem(preferenceKey, enabled ? "on" : "off");
    } catch {
      // The current page still responds to the toggle.
    }
    syncMusic();
  });

  quake?.addEventListener("play", syncMusic);
  quake?.addEventListener("pause", syncMusic);
  window.addEventListener("pagehide", () => {
    request++;
    music.pause();
  });
  window.addEventListener("pageshow", event => {
    if (event.persisted) syncMusic();
  });

  toggle.disabled = false;
  syncMusic();
})();
