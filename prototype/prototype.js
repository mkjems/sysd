// Prototype controls: adjust the root inputs live, show each section's
// grid, and print the computed value of tokens into [data-readout] elements.

const root = document.documentElement;
const STORAGE_KEY = "sysd-prototype-0.2";

// Measure any length token in px by applying it to a hidden probe.
// The probe lives in a zero-size clipped box so it never widens the page.
const probeBox = document.createElement("div");
probeBox.style.cssText = "position:fixed;inset:0 auto auto 0;inline-size:0;block-size:0;overflow:hidden;visibility:hidden";
const probe = document.createElement("div");
probe.style.cssText = "block-size:0";
probeBox.append(probe);
document.body.append(probeBox);

function px(expression) {
  probe.style.inlineSize = expression;
  return probe.getBoundingClientRect().width;
}

function format(value, digits = 1) {
  return String(Math.round(value * 10 ** digits) / 10 ** digits);
}

// ---------------------------------------------------------------- inputs

// Pages without the Adjust panel (the article) still get saved settings and the grid toggle.
const hasPanel = Boolean(document.getElementById("controls"));

const inputs = {
  size: document.getElementById("in-size"),
  reading: document.getElementById("in-reading"),
  leading: document.getElementById("in-leading"),
  ratio: document.getElementById("in-ratio"),
  sans: document.getElementById("in-sans"),
  serif: document.getElementById("in-serif"),
  hue: document.getElementById("in-hue"),
  radius: document.getElementById("in-radius"),
  theme: document.getElementById("in-theme"),
};

const outputs = {
  size: document.getElementById("out-size"),
  reading: document.getElementById("out-reading"),
  leading: document.getElementById("out-leading"),
  hue: document.getElementById("out-hue"),
  radius: document.getElementById("out-radius"),
};

// How each input writes itself onto the root.
const apply = {
  size: (v) => root.style.setProperty("--sysd-size", `${v / 16}rem`),
  reading: (v) => root.style.setProperty("--sysd-reading-size", `${v / 16}rem`),
  leading: (v) => root.style.setProperty("--sysd-leading", v),
  ratio: (v) => root.style.setProperty("--sysd-ratio-max", v),
  sans: (v) => root.style.setProperty("--sysd-font-sans", `"${v}", ui-sans-serif, system-ui, sans-serif`),
  serif: (v) => root.style.setProperty("--sysd-font-serif", `"${v}", ui-serif, Georgia, serif`),
  hue: (v) => root.style.setProperty("--sysd-accent-hue", v),
  radius: (v) => root.style.setProperty("--sysd-radius", `${v}px`),
  theme: (v) => (v ? (root.dataset.theme = v) : delete root.dataset.theme),
};

function cssValue(name) {
  return getComputedStyle(root).getPropertyValue(name).trim();
}

function firstFamily(name) {
  return cssValue(name).split(",")[0].replace(/["']/g, "").trim();
}

// Set the controls to whatever the stylesheet currently resolves to.
function syncInputsFromCss() {
  if (!hasPanel) return;
  inputs.size.value = px("var(--sysd-size)");
  inputs.reading.value = px("var(--sysd-reading-size)");
  inputs.leading.value = parseFloat(cssValue("--sysd-leading"));
  inputs.ratio.value = String(parseFloat(cssValue("--sysd-ratio-max")));
  inputs.sans.value = firstFamily("--sysd-font-sans");
  inputs.serif.value = firstFamily("--sysd-font-serif");
  inputs.hue.value = parseFloat(cssValue("--sysd-accent-hue"));
  inputs.radius.value = parseFloat(cssValue("--sysd-radius"));
  inputs.theme.value = root.dataset.theme ?? "";
}

function updateReadouts() {
  for (const el of document.querySelectorAll("[data-readout]")) {
    el.textContent = format(px(`var(--sysd-${el.dataset.readout})`)) + "px";
  }
  if (hasPanel) {
    outputs.size.value = format(px("var(--sysd-size)")) + "px";
    outputs.reading.value = format(px("var(--sysd-reading-size)")) + "px";
    outputs.leading.value = inputs.leading.value;
    outputs.hue.value = inputs.hue.value + "°";
    outputs.radius.value = inputs.radius.value + "px";
  }
  const fonts = document.querySelector("[data-fonts]");
  if (fonts) {
    fonts.innerHTML = `Sans — ${firstFamily("--sysd-font-sans")}<br>Serif — ${firstFamily("--sysd-font-serif")}<br>Mono — ${firstFamily("--sysd-font-mono")}`;
  }
  drawGuides();
}

let saved = {};

function load() {
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
  } catch {
    saved = {};
  }
  for (const [key, value] of Object.entries(saved)) apply[key]?.(value);
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // Storage unavailable — settings just won't persist.
  }
}

for (const [key, input] of Object.entries(inputs)) {
  if (!input) continue;
  input.addEventListener("input", () => {
    apply[key](input.value);
    saved[key] = input.value;
    save();
    updateReadouts();
  });
}

document.getElementById("reset")?.addEventListener("click", () => {
  root.removeAttribute("style");
  delete root.dataset.theme;
  saved = {};
  save();
  syncInputsFromCss();
  updateReadouts();
});

// ------------------------------------------------------------- grid guides

// Each .sysd-grid gets its own guides, one numbered band per column track.
function drawGuides() {
  if (!root.hasAttribute("data-grid")) return;
  for (const grid of document.querySelectorAll(".sysd-grid")) {
    let guides = grid.querySelector(":scope > .sysd-guides");
    if (!guides) {
      guides = document.createElement("div");
      guides.className = "sysd-guides";
      guides.setAttribute("aria-hidden", "true");
      grid.prepend(guides);
    }
    const tracks = getComputedStyle(grid).gridTemplateColumns.split(" ").length;
    if (guides.childElementCount !== tracks) {
      guides.replaceChildren(
        ...Array.from({ length: tracks }, (_, i) => {
          const band = document.createElement("span");
          band.textContent = i + 1;
          return band;
        }),
      );
    }
  }
}

function setGrid(on) {
  root.toggleAttribute("data-grid", on);
  for (const button of document.querySelectorAll("[data-grid-toggle]")) {
    button.setAttribute("aria-pressed", String(on));
  }
  drawGuides();
}

for (const button of document.querySelectorAll("[data-grid-toggle]")) {
  button.addEventListener("click", () => setGrid(!root.hasAttribute("data-grid")));
}

document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() !== "g" || event.metaKey || event.ctrlKey || event.altKey) return;
  if (event.target.closest("input, select, textarea, [contenteditable]")) return;
  setGrid(!root.hasAttribute("data-grid"));
});

// ------------------------------------------------------------------- start

load();
syncInputsFromCss();
updateReadouts();
addEventListener("resize", drawGuides);
document.fonts?.ready.then(updateReadouts);
