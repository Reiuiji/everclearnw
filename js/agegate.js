/*
 * Everclear Northwest — age gate
 * Vanilla JS, no dependencies. Blocks the page behind a 21+ overlay until
 * the visitor confirms their age, remembered via localStorage.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "ecnw-age-ok";
  var STORAGE_VALUE = "yes";
  var LOCK_CLASS = "ecnw-lock";
  var LEAVE_URL = "https://everfreenw.com";

  function hasConfirmedAge() {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === STORAGE_VALUE;
    } catch (err) {
      // localStorage unavailable (private mode, disabled storage, etc.) —
      // fail open to showing the gate rather than throwing.
      return false;
    }
  }

  function rememberAge() {
    try {
      window.localStorage.setItem(STORAGE_KEY, STORAGE_VALUE);
    } catch (err) {
      // Ignore — worst case the gate reappears next visit.
    }
  }

  function lockScroll() {
    document.documentElement.classList.add(LOCK_CLASS);
    document.body.classList.add(LOCK_CLASS);
  }

  function unlockScroll() {
    document.documentElement.classList.remove(LOCK_CLASS);
    document.body.classList.remove(LOCK_CLASS);
  }

  function buildAgeGate() {
    var overlay = document.createElement("div");
    overlay.className = "age-gate";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "ecnw-age-gate-title");

    var panel = document.createElement("div");
    panel.className = "age-gate-panel";

    var icon = document.createElement("div");
    icon.className = "age-gate-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "🛑"; // 🛑

    var heading = document.createElement("h2");
    heading.id = "ecnw-age-gate-title";
    heading.textContent = "🛑 WHOA THERE, HOLD YOUR HORSES";

    var body = document.createElement("p");
    body.textContent =
      "Everclear Northwest is a 21+ room party. You must be of legal " +
      "drinking age (21+ in the US) to trot past this point.";

    var actions = document.createElement("div");
    actions.className = "age-gate-actions";

    var enterBtn = document.createElement("button");
    enterBtn.type = "button";
    enterBtn.className = "btn btn-primary";
    enterBtn.textContent = "I'm 21 or older — let me in 🍹";
    enterBtn.addEventListener("click", function () {
      rememberAge();
      removeAgeGate(overlay);
      document.dispatchEvent(new CustomEvent("ecnw:age-verified"));
    });

    var leaveBtn = document.createElement("button");
    leaveBtn.type = "button";
    leaveBtn.className = "btn btn-ghost";
    leaveBtn.textContent =
      "I'm a foal — take me somewhere wholesome 🦄";
    leaveBtn.addEventListener("click", function () {
      window.location.href = LEAVE_URL;
    });

    actions.appendChild(enterBtn);
    actions.appendChild(leaveBtn);

    var fineprint = document.createElement("div");
    fineprint.className = "age-gate-fineprint";
    var fineprintText = document.createElement("p");
    fineprintText.textContent =
      "Everclear Northwest is an unofficial 21+ parody event, not " +
      "affiliated with or endorsed by Everfree Northwest. Please drink " +
      "responsibly.";
    fineprint.appendChild(fineprintText);

    panel.appendChild(icon);
    panel.appendChild(heading);
    panel.appendChild(body);
    panel.appendChild(actions);
    panel.appendChild(fineprint);
    overlay.appendChild(panel);

    return { overlay: overlay, focusTarget: enterBtn };
  }

  function removeAgeGate(overlay) {
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
    unlockScroll();
  }

  function showAgeGate() {
    var built = buildAgeGate();
    document.body.appendChild(built.overlay);
    lockScroll();
    // Send focus into the dialog for keyboard users.
    built.focusTarget.focus();
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!hasConfirmedAge()) {
      showAgeGate();
    }
  });
})();
