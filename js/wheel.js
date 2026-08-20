/*
 * Everclear Northwest — Wheel of Friendship
 * Vanilla JS, no dependencies. Renders a 16-segment SVG spin wheel and
 * animates it to a weighted-random result. Water is 4/16 (25%) on purpose —
 * it's the running gag AND the safety feature.
 */
(function () {
  "use strict";

  // ---- Segment data -------------------------------------------------
  // 10 cocktails + 1 mocktail + 1 snack + 4 water = 16 equal-weight slots.
  // Deliberately excluded: the boozy "Sylveon Special" (½ oz Everclear +
  // ½ oz absinthe) from the drink menu. A double-strength pour must never
  // be a wheel-decided outcome — the wheel's strongest suggestions stay
  // the regular ½ oz cocktails, full stop.
  var SEGMENTS = [
    {
      label: "Pinkie Punch",
      short: "Pinkie 🎉",
      type: "cocktail",
      pun: "The Wheel throws itself a party just picking this one."
    },
    {
      label: "Rarity Spritz",
      short: "Rarity ✨",
      type: "cocktail",
      pun: "Fabulous, darling. The Wheel has exquisite taste."
    },
    {
      label: "Snack Break 🥨",
      short: "Snacks 🥨",
      type: "snack",
      pun: "The Wheel decrees: go eat something. Ponies, furries, and fairy-types alike run better on snacks."
    },
    {
      label: "WATER 💧",
      short: "💧",
      type: "water",
      pun: "Hydration: canonically effective on ponies, furries, and fairy-types alike."
    },
    {
      label: "Sonic Rainboom",
      short: "Sonic 💨",
      type: "cocktail",
      pun: "Mach 1 achieved. Please sip at subsonic speed."
    },
    {
      label: "WATER 💧",
      short: "💧",
      type: "water",
      pun: "Plot twist: water. The Wheel is playing the long game."
    },
    {
      label: "Fluttershy's Quiet Sipper",
      short: "Fluttershy 🌸",
      type: "cocktail",
      pun: "So gentle the Wheel almost didn't want to interrupt your evening."
    },
    {
      label: "Sweet Kiss 💋 (zero-proof)",
      short: "Sweet Kiss 💋",
      type: "mocktail",
      pun: "Zero proof, maximum affection ribbons. The Wheel salutes the Designated Sylveon."
    },
    {
      label: "Twilight Sparkler",
      short: "Twilight ✨",
      type: "cocktail",
      pun: "The Wheel senses a great disturbance: someone's about to reorganize a bookshelf."
    },
    {
      label: "WATER 💧",
      short: "💧",
      type: "water",
      pun: "H2-Whoa. The Wheel wants you at full gallop all night, so drink up."
    },
    {
      label: "Derpy's Muffin Mule",
      short: "Derpy 🧁",
      type: "cocktail",
      pun: "Delivered fresh, minor spillage guaranteed, all of it forgiven."
    },
    {
      label: "Celestia's Sun Tea",
      short: "Celestia ☀️",
      type: "cocktail",
      pun: "The Wheel has ruled. This one reigns for the next thousand minutes, at least."
    },
    {
      label: "WATER 💧",
      short: "💧",
      type: "water",
      pun: "The Wheel loves you enough to make you drink water. That's friendship."
    },
    {
      label: "Rainbow Crash",
      short: "Rainbow 🌈",
      type: "cocktail",
      pun: "The Wheel's flagship pick. Handle with the respect of a ¾ oz pour."
    },
    {
      label: "Apple Jack & Ginger",
      short: "Applejack 🍏",
      type: "cocktail",
      pun: "Honest, hardworking, and sneaks up on you exactly like she warned — ponies and furries report the identical experience."
    },
    {
      label: "Luna's Moonlit Lemonade",
      short: "Luna 🌙",
      type: "cocktail",
      pun: "The night shift has been chosen. Dim the lights, if you dare."
    }
  ];

  var SEGMENT_ANGLE = 360 / SEGMENTS.length;

  // ---- SVG wheel construction ----------------------------------------
  var SVG_NS = "http://www.w3.org/2000/svg";
  var SIZE = 400;
  var CENTER = SIZE / 2;
  var RADIUS = SIZE / 2 - 6;

  function polarToCartesian(cx, cy, r, angleDeg) {
    var angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad)
    };
  }

  function describeSlice(cx, cy, r, startAngle, endAngle) {
    var start = polarToCartesian(cx, cy, r, startAngle);
    var end = polarToCartesian(cx, cy, r, endAngle);
    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", cx, cy,
      "L", start.x, start.y,
      "A", r, r, 0, largeArcFlag, 1, end.x, end.y,
      "Z"
    ].join(" ");
  }

  function buildWheelSvg() {
    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + SIZE + " " + SIZE);
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", "wheel-svg");

    SEGMENTS.forEach(function (segment, i) {
      var startAngle = i * SEGMENT_ANGLE;
      var endAngle = startAngle + SEGMENT_ANGLE;
      var midAngle = startAngle + SEGMENT_ANGLE / 2;

      var path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("d", describeSlice(CENTER, CENTER, RADIUS, startAngle, endAngle));

      var fill, textFill;
      if (segment.type === "water") {
        fill = "var(--ecnw-green)";
        textFill = "var(--ecnw-bg)";
      } else if (segment.type === "mocktail") {
        fill = "var(--ecnw-pink)";
        textFill = "var(--ecnw-bg)";
      } else {
        fill = i % 2 === 0 ? "var(--ecnw-bg-raised)" : "var(--ecnw-bg-alt)";
        textFill = i % 2 === 0 ? "var(--ecnw-pink)" : "var(--ecnw-green)";
      }
      path.setAttribute("fill", fill);
      path.setAttribute("stroke", "var(--ecnw-border)");
      path.setAttribute("stroke-width", "1.5");
      svg.appendChild(path);

      var labelPos = polarToCartesian(CENTER, CENTER, RADIUS * 0.62, midAngle);
      var text = document.createElementNS(SVG_NS, "text");
      text.setAttribute("x", labelPos.x);
      text.setAttribute("y", labelPos.y);
      text.setAttribute(
        "transform",
        "rotate(" + (midAngle - 90) + " " + labelPos.x + " " + labelPos.y + ")"
      );
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "middle");
      text.setAttribute("fill", textFill);
      text.setAttribute("class", "wheel-label");
      text.textContent = segment.short;
      svg.appendChild(text);
    });

    // Hub
    var hub = document.createElementNS(SVG_NS, "circle");
    hub.setAttribute("cx", CENTER);
    hub.setAttribute("cy", CENTER);
    hub.setAttribute("r", 28);
    hub.setAttribute("fill", "var(--ecnw-bg)");
    hub.setAttribute("stroke", "var(--ecnw-pink)");
    hub.setAttribute("stroke-width", "3");
    svg.appendChild(hub);

    var hubText = document.createElementNS(SVG_NS, "text");
    hubText.setAttribute("x", CENTER);
    hubText.setAttribute("y", CENTER);
    hubText.setAttribute("text-anchor", "middle");
    hubText.setAttribute("dominant-baseline", "middle");
    hubText.setAttribute("class", "wheel-hub-icon");
    hubText.textContent = "🍹";
    svg.appendChild(hubText);

    return svg;
  }

  function weightedRandomIndex() {
    // All 16 slots are equal weight (1/16 each) — water simply occupies
    // 4 of the 16 slots, which is what makes it a 25% outcome.
    return Math.floor(Math.random() * SEGMENTS.length);
  }

  function prefersReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  document.addEventListener("DOMContentLoaded", function () {
    var mount = document.getElementById("wheelMount");
    var wheelBtn = document.getElementById("wheelBtn");
    var spinBtn = document.getElementById("spinBtn");
    var resultCard = document.getElementById("resultCard");
    var resultTitle = document.getElementById("resultTitle");
    var resultPun = document.getElementById("resultPun");
    var resultLink = document.getElementById("resultLink");

    if (!mount || !wheelBtn || !spinBtn || !resultCard) {
      return;
    }

    var svg = buildWheelSvg();
    mount.appendChild(svg);

    var currentRotation = 0;
    var spinning = false;

    function setSpinningState(isSpinning) {
      spinning = isSpinning;
      wheelBtn.disabled = isSpinning;
      spinBtn.disabled = isSpinning;
      wheelBtn.setAttribute("aria-busy", isSpinning ? "true" : "false");
    }

    function showResult(segment) {
      resultTitle.textContent = segment.label;
      resultPun.textContent = segment.pun;

      if (segment.type === "cocktail") {
        resultLink.hidden = false;
        resultLink.href = "drinks.html";
      } else {
        resultLink.hidden = true;
      }

      resultCard.classList.remove("is-visible");
      resultCard.hidden = false;
      // Force reflow so the fade-in transition restarts on repeat spins.
      void resultCard.offsetWidth;
      resultCard.classList.add("is-visible");

      if (segment.type === "water" || segment.type === "mocktail") {
        if (window.ecnwParty && typeof window.ecnwParty.confetti === "function") {
          window.ecnwParty.confetti();
        }
      }
    }

    function spin() {
      if (spinning) {
        return;
      }

      var index = weightedRandomIndex();
      var segment = SEGMENTS[index];
      var targetCenter = index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
      var maxJitter = SEGMENT_ANGLE / 2 - 3;
      var jitter = (Math.random() * 2 - 1) * maxJitter;

      if (prefersReducedMotion()) {
        // Skip the spin animation entirely; snap the wheel to the result
        // and reveal it with a fade instead of a rotation.
        var currentMod = ((currentRotation % 360) + 360) % 360;
        var delta = (360 - (((targetCenter + jitter) % 360) + currentMod)) % 360;
        currentRotation += delta;
        svg.style.transition = "none";
        svg.style.transform = "rotate(" + currentRotation + "deg)";
        showResult(segment);
        return;
      }

      setSpinningState(true);
      resultCard.classList.remove("is-visible");
      resultCard.hidden = true;

      var currentMod = ((currentRotation % 360) + 360) % 360;
      var delta = (360 - (((targetCenter + jitter) % 360) + currentMod)) % 360;
      var extraSpins = 360 * (5 + Math.floor(Math.random() * 2)); // 5-6 full spins
      currentRotation += extraSpins + delta;

      svg.style.transition = "transform 4s cubic-bezier(0.12, 0.72, 0.14, 1)";
      svg.style.transform = "rotate(" + currentRotation + "deg)";

      var settled = false;
      function onSpinEnd(evt) {
        if (evt && evt.target !== svg) {
          return;
        }
        if (settled) {
          return;
        }
        settled = true;
        svg.removeEventListener("transitionend", onSpinEnd);
        setSpinningState(false);
        showResult(segment);
      }

      svg.addEventListener("transitionend", onSpinEnd);
      // Fallback in case transitionend doesn't fire (e.g. tab backgrounded).
      window.setTimeout(onSpinEnd, 4300);
    }

    wheelBtn.addEventListener("click", spin);
    spinBtn.addEventListener("click", spin);
  });
})();
