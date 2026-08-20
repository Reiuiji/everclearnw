/* =========================================================================
   Everclear Northwest — Pony Party Bingo
   5x5 card, seeded per-device via localStorage, tap to mark, checks for
   bingo lines and fires the shared confetti hook on a new line.
   ========================================================================= */

(function () {
  'use strict';

  var SEED_KEY = 'ecnw-bingo-seed';
  var MARKS_KEY = 'ecnw-bingo-marks';
  var FREE_INDEX = 12; // center of a 5x5 grid
  var GRID_SIZE = 25;
  var MIN_FONT_PX = 7;
  var MAX_FONT_PX = 22;

  var PHRASE_POOL = [
    'Somepony sings the show theme from memory',
    'A toast is proposed to friendship',
    "Somepony explains their OC for 10+ minutes",
    'The punch bowl gets refilled',
    'Voluntary Hydration Station visit',
    "Somepony says 'everypony' unironically",
    'Cosplayer refuses to break character',
    'Two ponies argue about best princess',
    "Somepony's phone is at 1%",
    'Group photo takes 5+ attempts',
    'The Designated Sylveon vetoes a plan',
    'Somepony quotes the Royal Decree',
    "A snack is declared 'the best thing ever'",
    'Karaoke high note attempted (and missed)',
    'Somepony finds the hidden QR code',
    'A pun is groaned at, loudly',
    "Somepony asks 'wait, which one is Twilight again?'",
    'A wig gets adjusted mid-conversation',
    "Someone brings up the show's lore, unprompted",
    "A drink name gets mispronounced",
    'Somepony trades a pin for a story',
    'A slow clap breaks out',
    'Someone does the Ponyville wave',
    'A costume malfunction is fixed with safety pins',
    'Somepony live-narrates their own entrance',
    'A friendship bracelet changes hooves',
    "Someone starts a chant that doesn't catch on",
    'A selfie stick makes an appearance',
    "Somepony insists they're 'totally fine'",
    'A dance-off breaks out, unprompted',
    'Someone loudly debates tail-braiding technique',
    "A theory about the show's finale resurfaces",
    "Somepony's cutie mark piece falls off",
    'A round of applause for the bartender',
    'Someone asks for the WiFi password',
    'A glow stick gets passed around',
    'Somepony recreates a meme pose for a photo',
    'A stranger is welcomed like an old friend',
    'Someone starts humming the theme song, unconsciously',
    'A very serious debate about pancakes vs. waffles',
    "Somepony compliments a stranger's hooves (shoes)",
    'A party favor gets immediately lost',
    'Someone breaks into applause for no reason',
    'A group singalong starts without warning',
    'Somepony asks who is DJing tonight',
    'A fursuiter high-fives every single pony in the room',
    "Somepony declares 'Sylveon is best pony' (technically wrong, spiritually correct)",
    'A tail gets sat on (the owner forgives)',
    'Fursuit head comes off, reveals immaculate hair somehow',
    'A pony and a Pokémon trade lore for 10+ minutes',
    "Someone's fursona and ponysona are revealed to be the same guy",
    'Ribbon-count of a passing Sylveon cosplayer gets audited',
    'Paws are declared unfit for beer pong (ruling stands)',
    'Someone reports a bug on the website'
  ];

  var board = document.getElementById('bingo-board');
  if (!board) return;

  var newCardBtn = document.getElementById('bingo-new-card');
  var banner = document.getElementById('bingo-banner');

  var prefersReducedMotion = false;
  try {
    prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {
    prefersReducedMotion = false;
  }

  // -----------------------------------------------------------------------
  // Tiny storage wrapper — private/incognito mode can throw on localStorage
  // access, so every call is guarded and falls back to an in-memory object.
  // -----------------------------------------------------------------------
  var memoryStore = {};
  var storage = {
    get: function (key) {
      try {
        var v = window.localStorage.getItem(key);
        return v === null ? undefined : v;
      } catch (e) {
        return memoryStore[key];
      }
    },
    set: function (key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch (e) {
        memoryStore[key] = value;
      }
    }
  };

  // -----------------------------------------------------------------------
  // Seeded PRNG (mulberry32) so "New Card" gives a fresh shuffle, while the
  // same seed always reproduces the same card for a returning device.
  // -----------------------------------------------------------------------
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(arr, rand) {
    var out = arr.slice();
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }

  function makeSeed() {
    return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
  }

  function getSeed() {
    var stored = storage.get(SEED_KEY);
    var seed = stored !== undefined ? parseInt(stored, 10) : NaN;
    if (isNaN(seed)) {
      seed = makeSeed();
      storage.set(SEED_KEY, String(seed));
    }
    return seed;
  }

  // -----------------------------------------------------------------------
  // Card / marks state
  // -----------------------------------------------------------------------
  var currentSeed = getSeed();
  var squares = buildCard(currentSeed);
  var marks = loadMarks();

  var LINES = buildLines();
  var completedLines = computeCompletedLines(marks);

  function buildCard(seed) {
    var rand = mulberry32(seed);
    var drawn = shuffle(PHRASE_POOL, rand).slice(0, GRID_SIZE - 1);
    var cells = [];
    var drawIndex = 0;
    for (var i = 0; i < GRID_SIZE; i++) {
      if (i === FREE_INDEX) {
        cells.push('You Showed Up 🎉');
      } else {
        cells.push(drawn[drawIndex++]);
      }
    }
    return cells;
  }

  function defaultMarks() {
    var m = new Array(GRID_SIZE).fill(false);
    m[FREE_INDEX] = true;
    return m;
  }

  function loadMarks() {
    var stored = storage.get(MARKS_KEY);
    if (!stored) return defaultMarks();
    try {
      var parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length === GRID_SIZE) {
        parsed[FREE_INDEX] = true;
        return parsed.map(function (v) { return !!v; });
      }
    } catch (e) {
      /* fall through to default */
    }
    return defaultMarks();
  }

  function saveMarks() {
    storage.set(MARKS_KEY, JSON.stringify(marks));
  }

  function buildLines() {
    var lines = [];
    for (var r = 0; r < 5; r++) {
      var row = [];
      for (var c = 0; c < 5; c++) row.push(r * 5 + c);
      lines.push(row);
    }
    for (var c2 = 0; c2 < 5; c2++) {
      var col = [];
      for (var r2 = 0; r2 < 5; r2++) col.push(r2 * 5 + c2);
      lines.push(col);
    }
    var diag1 = [0, 6, 12, 18, 24];
    var diag2 = [4, 8, 12, 16, 20];
    lines.push(diag1);
    lines.push(diag2);
    return lines;
  }

  function computeCompletedLines(markState) {
    var completed = new Set();
    LINES.forEach(function (line, idx) {
      var full = line.every(function (i) { return markState[i]; });
      if (full) completed.add(idx);
    });
    return completed;
  }

  // -----------------------------------------------------------------------
  // Rendering
  // -----------------------------------------------------------------------
  var cellButtons = [];

  function render() {
    board.innerHTML = '';
    cellButtons = [];
    squares.forEach(function (text, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'bingo-cell';
      btn.setAttribute('aria-pressed', marks[i] ? 'true' : 'false');
      btn.dataset.index = String(i);

      var span = document.createElement('span');
      span.className = 'bingo-cell-text';
      span.textContent = text;
      btn.appendChild(span);

      if (i === FREE_INDEX) {
        btn.classList.add('is-free');
        btn.disabled = true;
      } else {
        btn.addEventListener('click', onCellClick);
      }

      if (marks[i]) {
        btn.classList.add('is-marked');
      }

      board.appendChild(btn);
      cellButtons.push(btn);
    });

    fitAllCells();
  }

  // -----------------------------------------------------------------------
  // Per-cell font autoscaling — binary search for the largest font size (px)
  // that keeps a cell's phrase inside its square without overflowing, since
  // the CSS clamp() is only a pre-JS fallback.
  // -----------------------------------------------------------------------
  function fitCellText(btn) {
    if (!btn || btn.clientWidth === 0) return;
    var span = btn.querySelector('.bingo-cell-text');
    if (!span) return;

    var style = window.getComputedStyle(btn);
    var padX = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
    var padY = (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0);
    var availWidth = btn.clientWidth - padX;
    var availHeight = btn.clientHeight - padY;

    function fits(size) {
      btn.style.fontSize = size + 'px';
      return span.scrollWidth <= availWidth && span.scrollHeight <= availHeight;
    }

    var lo = MIN_FONT_PX;
    var hi = MAX_FONT_PX;
    var best = MIN_FONT_PX;

    if (fits(hi)) {
      btn.style.fontSize = hi + 'px';
      return;
    }

    fits(lo);

    for (var i = 0; i < 12 && (hi - lo) > 0.5; i++) {
      var mid = (lo + hi) / 2;
      if (fits(mid)) {
        best = mid;
        lo = mid;
      } else {
        hi = mid;
      }
    }

    btn.style.fontSize = Math.floor(best) + 'px';
  }

  function fitAllCells() {
    if (board.clientWidth === 0) return;
    cellButtons.forEach(function (btn) {
      fitCellText(btn);
    });
  }

  var resizeFitTimer = null;
  window.addEventListener('resize', function () {
    window.clearTimeout(resizeFitTimer);
    resizeFitTimer = window.setTimeout(fitAllCells, 150);
  });

  try {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(fitAllCells);
    }
  } catch (e) {
    /* older browsers without document.fonts — CSS clamp() fallback stands */
  }

  function onCellClick(e) {
    var btn = e.currentTarget;
    var i = parseInt(btn.dataset.index, 10);
    marks[i] = !marks[i];
    btn.setAttribute('aria-pressed', marks[i] ? 'true' : 'false');
    btn.classList.toggle('is-marked', marks[i]);

    if (marks[i] && !prefersReducedMotion) {
      btn.classList.remove('is-pop');
      // Force reflow so the animation can restart on rapid re-taps.
      void btn.offsetWidth;
      btn.classList.add('is-pop');
      btn.addEventListener('animationend', function handler() {
        btn.classList.remove('is-pop');
        btn.removeEventListener('animationend', handler);
      });
    }

    saveMarks();
    checkForBingo();
  }

  function checkForBingo() {
    var nowCompleted = computeCompletedLines(marks);
    var newLines = [];
    nowCompleted.forEach(function (idx) {
      if (!completedLines.has(idx)) newLines.push(idx);
    });
    completedLines = nowCompleted;

    if (newLines.length > 0) {
      celebrateBingo();
    }
  }

  function celebrateBingo() {
    if (banner) {
      banner.classList.remove('is-visible');
      // Force reflow so retriggered bingos restart the animation/timer.
      void banner.offsetWidth;
      banner.classList.add('is-visible');
      window.clearTimeout(celebrateBingo._t);
      celebrateBingo._t = window.setTimeout(function () {
        banner.classList.remove('is-visible');
      }, 3200);
    }
    if (window.ecnwParty && typeof window.ecnwParty.confetti === 'function') {
      window.ecnwParty.confetti();
    }
  }

  function newCard() {
    currentSeed = makeSeed();
    storage.set(SEED_KEY, String(currentSeed));
    squares = buildCard(currentSeed);
    marks = defaultMarks();
    saveMarks();
    completedLines = computeCompletedLines(marks);
    if (banner) banner.classList.remove('is-visible');
    render();
  }

  if (newCardBtn) {
    newCardBtn.addEventListener('click', newCard);
  }

  render();
})();
