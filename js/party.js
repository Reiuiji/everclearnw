/*
 * Everclear Northwest — party engine
 * Vanilla JS, no dependencies. Pure progressive enhancement: every feature
 * is wrapped so a failure in one can never break the page or another
 * feature. Safe to include on every page.
 */
(function () {
  "use strict";

  var root = document.documentElement;

  function prefersReducedMotion() {
    try {
      return (
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    } catch (err) {
      return false;
    }
  }

  function cssVar(name, fallback) {
    try {
      var value = getComputedStyle(root).getPropertyValue(name);
      return value && value.trim() ? value.trim() : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function safe(fn, label) {
    try {
      fn();
    } catch (err) {
      if (window.console && console.warn) {
        console.warn("[ecnwParty] " + label + " failed:", err);
      }
    }
  }

  // ---------------------------------------------------------------------
  // Pastel theme engine
  // ---------------------------------------------------------------------

  var THEME_STORAGE_KEY = "ecnw-theme";
  var PASTEL_CLASS = "ecnw-pastel";

  function getStoredTheme() {
    try {
      return window.localStorage.getItem(THEME_STORAGE_KEY);
    } catch (err) {
      return null;
    }
  }

  function storeTheme(name) {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, name);
    } catch (err) {
      // Ignore — worst case the choice doesn't persist to the next page.
    }
  }

  function currentTheme() {
    return root.classList.contains(PASTEL_CLASS) ? "pastel" : "night";
  }

  function applyThemeClass(name) {
    if (name === "pastel") {
      root.classList.add(PASTEL_CLASS);
    } else {
      root.classList.remove(PASTEL_CLASS);
    }
  }

  function themeToggleLabel(name) {
    return name === "pastel"
      ? "🌙 Back to Night Mode" // 🌙
      : "🌸 Switch to Pastel Mode"; // 🌸
  }

  function updateThemeToggleButtons() {
    var buttons = document.querySelectorAll("[data-ecnw-theme-toggle]");
    var label = themeToggleLabel(currentTheme());
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].textContent = label;
    }
  }

  function setTheme(name) {
    var normalized = name === "pastel" ? "pastel" : "night";
    applyThemeClass(normalized);
    storeTheme(normalized);
    safe(updateThemeToggleButtons, "theme toggle label update");
  }

  function initThemeFromStorage() {
    var stored = getStoredTheme();
    applyThemeClass(stored === "pastel" ? "pastel" : "night");
  }

  function initThemeToggleButtons() {
    var buttons = document.querySelectorAll("[data-ecnw-theme-toggle]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function () {
        setTheme(currentTheme() === "pastel" ? "night" : "pastel");
      });
    }
    updateThemeToggleButtons();
  }

  // Applied as early as possible (module load, ahead of DOMContentLoaded)
  // so the stored theme sticks with minimal flash across page navigations.
  safe(initThemeFromStorage, "theme init from storage");

  // ---------------------------------------------------------------------
  // Confetti
  // ---------------------------------------------------------------------

  var CONFETTI_COLORS = [
    cssVar("--ecnw-green", "#39ff8f"),
    cssVar("--ecnw-pink", "#ff4fd8"),
    cssVar("--ecnw-cream", "#fbf3e7"),
    "#ffffff",
    "#ffd76a", // gold
  ];

  function reducedMotionBurst() {
    var overlay = document.createElement("div");
    overlay.className = "ecnw-confetti-reduced";
    overlay.setAttribute("aria-hidden", "true");
    overlay.textContent = "✨🎉✨"; // ✨🎉✨
    document.body.appendChild(overlay);
    window.setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 900);
  }

  function confetti(opts) {
    opts = opts || {};

    if (prefersReducedMotion()) {
      safe(reducedMotionBurst, "confetti (reduced motion)");
      return;
    }

    var count = opts.count || 100;
    var originX =
      typeof opts.x === "number" ? opts.x : window.innerWidth / 2;
    var originY = typeof opts.y === "number" ? opts.y : window.innerHeight * 0.15;

    var canvas = document.createElement("canvas");
    canvas.className = "ecnw-confetti-canvas";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    var ctx = canvas.getContext("2d");
    if (!ctx) {
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      return;
    }

    var particles = [];
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 2 + Math.random() * 6;
      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed * 0.6 + (Math.random() - 0.5) * 4,
        vy: Math.sin(angle) * speed - Math.random() * 4,
        size: 5 + Math.random() * 6,
        color:
          CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        drift: (Math.random() - 0.5) * 0.6,
        opacity: 1,
        life: 0,
        maxLife: 90 + Math.random() * 60,
      });
    }

    var gravity = 0.18;
    var startedAt = null;
    var maxDurationMs = 4500;

    function frame(timestamp) {
      if (startedAt === null) startedAt = timestamp;
      var elapsed = timestamp - startedAt;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      var alive = false;
      for (var j = 0; j < particles.length; j++) {
        var p = particles[j];
        p.life++;
        if (p.life > p.maxLife || elapsed > maxDurationMs) {
          p.opacity = Math.max(0, p.opacity - 0.08);
          if (p.opacity <= 0) continue;
        }
        alive = true;

        p.vy += gravity;
        p.x += p.vx + p.drift;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        if (p.y > canvas.height + 30) continue;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }

      if (alive && elapsed < maxDurationMs + 1500) {
        window.requestAnimationFrame(frame);
      } else if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }

    window.requestAnimationFrame(frame);

    window.addEventListener(
      "resize",
      function onResize() {
        if (!canvas.parentNode) {
          window.removeEventListener("resize", onResize);
          return;
        }
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      },
      { passive: true }
    );
  }

  // ---------------------------------------------------------------------
  // Age-gate celebration
  // ---------------------------------------------------------------------

  function initAgeGateCelebration() {
    document.addEventListener("ecnw:age-verified", function () {
      confetti({ y: window.innerHeight * 0.25 });
    });
  }

  // ---------------------------------------------------------------------
  // Pony rain (logo easter egg + Konami code)
  // ---------------------------------------------------------------------

  var PONY_EMOJI = [
    "🦄",
    "🌈",
    "🍹",
    "💜",
    "⭐",
    "🦊",
    "🐺",
    "🐾",
    "🎀",
    "💖",
  ]; // 🦄🌈🍹💜⭐🦊🐺🐾🎀💖
  var ponyRainActive = false;

  function ponyRainReduced() {
    reducedMotionBurst();
  }

  function ponyRain() {
    if (prefersReducedMotion()) {
      safe(ponyRainReduced, "pony rain (reduced motion)");
      return;
    }
    if (ponyRainActive) return;
    ponyRainActive = true;

    var layer = document.createElement("div");
    layer.className = "ecnw-pony-rain";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);

    var spawnDurationMs = 4000;
    var startedAt = Date.now();
    var intervalId = window.setInterval(function () {
      if (Date.now() - startedAt > spawnDurationMs) {
        window.clearInterval(intervalId);
        return;
      }
      spawnPonyDrop(layer);
    }, 120);

    window.setTimeout(function () {
      window.clearInterval(intervalId);
      window.setTimeout(function () {
        if (layer.parentNode) layer.parentNode.removeChild(layer);
        ponyRainActive = false;
      }, 2200);
    }, spawnDurationMs);
  }

  function spawnPonyDrop(layer) {
    var drop = document.createElement("span");
    drop.className = "ecnw-pony-drop";
    drop.textContent =
      PONY_EMOJI[Math.floor(Math.random() * PONY_EMOJI.length)];
    drop.style.left = Math.random() * 100 + "vw";
    drop.style.animationDuration = 2.2 + Math.random() * 1.6 + "s";
    drop.style.fontSize = 1.2 + Math.random() * 1.4 + "rem";
    drop.addEventListener("animationend", function () {
      if (drop.parentNode) drop.parentNode.removeChild(drop);
    });
    layer.appendChild(drop);
  }

  var LOGO_TAP_WINDOW_MS = 3000;
  var LOGO_TAP_THRESHOLD = 5;

  function initLogoEasterEgg() {
    var logo = document.querySelector(".logo");
    if (!logo) return;

    var tapTimes = [];
    logo.addEventListener("click", function (event) {
      var now = Date.now();
      tapTimes = tapTimes.filter(function (t) {
        return now - t < LOGO_TAP_WINDOW_MS;
      });
      tapTimes.push(now);

      if (tapTimes.length >= LOGO_TAP_THRESHOLD) {
        tapTimes = [];
        event.preventDefault();
        ponyRain();
      }
    });
  }

  var KONAMI_SEQUENCE = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "KeyB",
    "KeyA",
  ];

  function initKonamiCode() {
    var buffer = [];
    document.addEventListener("keydown", function (event) {
      var code = event.code || event.key;
      buffer.push(code);
      if (buffer.length > KONAMI_SEQUENCE.length) {
        buffer = buffer.slice(buffer.length - KONAMI_SEQUENCE.length);
      }
      if (buffer.length === KONAMI_SEQUENCE.length) {
        var matches = true;
        for (var i = 0; i < KONAMI_SEQUENCE.length; i++) {
          if (buffer[i] !== KONAMI_SEQUENCE[i]) {
            matches = false;
            break;
          }
        }
        if (matches) {
          buffer = [];
          ponyRain();
        }
      }
    });
  }

  // ---------------------------------------------------------------------
  // Tap sparkle
  // ---------------------------------------------------------------------

  var SPARKLE_MIN_INTERVAL_MS = 160; // ~6/sec max

  function initTapSparkle() {
    if (prefersReducedMotion()) return;

    var lastSpawn = 0;
    var eventName = window.PointerEvent ? "pointerdown" : "click";

    document.addEventListener(
      eventName,
      function (event) {
        var now = Date.now();
        if (now - lastSpawn < SPARKLE_MIN_INTERVAL_MS) return;
        lastSpawn = now;
        spawnSparkle(event.clientX, event.clientY);
      },
      { passive: true }
    );
  }

  function spawnSparkle(x, y) {
    if (typeof x !== "number" || typeof y !== "number") return;
    var sparkle = document.createElement("span");
    sparkle.className = "ecnw-tap-sparkle";
    sparkle.textContent = "✨"; // ✨
    sparkle.style.left = x + "px";
    sparkle.style.top = y + "px";
    sparkle.setAttribute("aria-hidden", "true");
    document.body.appendChild(sparkle);
    sparkle.addEventListener("animationend", function () {
      if (sparkle.parentNode) sparkle.parentNode.removeChild(sparkle);
    });
    // Fallback cleanup in case animationend never fires.
    window.setTimeout(function () {
      if (sparkle.parentNode) sparkle.parentNode.removeChild(sparkle);
    }, 1200);
  }

  // ---------------------------------------------------------------------
  // Footer vibe line
  // ---------------------------------------------------------------------

  var VIBE_LINES = [
    "Tonight's forecast: 100% chance of sparkles.",
    "Friendship level: critical (the good kind).",
    "This site is best viewed while hydrated.",
    "Somewhere, a pony is doing karaoke about it.",
    "Glitter is a permanent life choice at this point.",
    "Warning: contains excessive whinnying.",
    "Hydrate responsibly, sparkle irresponsibly.",
    "This party has main character energy.",
    "Certified 100% unicorn-approved chaos.",
    "May contain traces of rainbow.",
    "Ask us about our friendship bracelets.",
    "The floor is lava. The lava is also glitter.",
    "Ponies, furries, and one very smug Sylveon welcome.",
    "Tail-friendly seating available.",
    "Fursuiters hydrate too — water bowls provided.",
    "Sylveon says: emotions are just vibes with ribbons.",
  ];

  function initFooterVibeLine() {
    var container = document.querySelector(".site-footer .container");
    if (!container) return;
    var line = document.createElement("p");
    line.className = "vibe-line";
    line.textContent =
      VIBE_LINES[Math.floor(Math.random() * VIBE_LINES.length)];
    container.appendChild(line);
  }

  // ---------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------

  window.ecnwParty = window.ecnwParty || {};
  window.ecnwParty.confetti = confetti;
  window.ecnwParty.ponyRain = ponyRain;
  window.ecnwParty.setTheme = setTheme;

  onReady(function () {
    safe(initThemeToggleButtons, "theme toggle buttons init");
    safe(initAgeGateCelebration, "age-gate celebration init");
    safe(initLogoEasterEgg, "logo easter egg init");
    safe(initKonamiCode, "konami code init");
    safe(initTapSparkle, "tap sparkle init");
    safe(initFooterVibeLine, "footer vibe line init");
  });
})();
