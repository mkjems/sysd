// Prototype controls: adjust the root inputs live, show the grid,
// and print the computed value of tokens into [data-readout] elements.

const root = document.documentElement;
const STORAGE_KEY = "sysd-prototype-v3";

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

function readToken(name) {
  if (name === "columns") return getComputedStyle(root).getPropertyValue("--sysd-columns").trim();
  if (name === "ratio") return format(px("calc(var(--sysd-ratio) * 1000px)") / 1000, 3);
  return format(px(`var(--sysd-${name})`)) + "px";
}

function updateReadouts() {
  for (const el of document.querySelectorAll("[data-readout]")) {
    el.textContent = readToken(el.dataset.readout);
  }
  outputs.size.value = format(px("var(--sysd-size)")) + "px";
  outputs.leading.value = inputs.leading.value;
  outputs.hue.value = inputs.hue.value + "°";
  outputs.radius.value = inputs.radius.value + "px";
  outputs.paperLight.value = inputs.paperLight.value;
  outputs.paperDark.value = inputs.paperDark.value;
}

// ---------------------------------------------------------------- inputs

const inputs = {
  size: document.getElementById("in-size"),
  leading: document.getElementById("in-leading"),
  ratio: document.getElementById("in-ratio"),
  font: document.getElementById("in-font"),
  hue: document.getElementById("in-hue"),
  radius: document.getElementById("in-radius"),
  theme: document.getElementById("in-theme"),
  paperLight: document.getElementById("in-paper-light"),
  paperDark: document.getElementById("in-paper-dark"),
};

const outputs = {
  size: document.getElementById("out-size"),
  leading: document.getElementById("out-leading"),
  hue: document.getElementById("out-hue"),
  radius: document.getElementById("out-radius"),
  paperLight: document.getElementById("out-paper-light"),
  paperDark: document.getElementById("out-paper-dark"),
};

// How each input writes itself onto the root.
const apply = {
  size: (v) => root.style.setProperty("--sysd-size", `${v / 16}rem`),
  leading: (v) => root.style.setProperty("--sysd-leading", v),
  ratio: (v) => root.style.setProperty("--sysd-ratio-max", v),
  font: (v) => root.style.setProperty("--sysd-font", `"${v}", ui-sans-serif, system-ui, sans-serif`),
  hue: (v) => root.style.setProperty("--sysd-accent-hue", v),
  radius: (v) => root.style.setProperty("--sysd-radius", `${v}px`),
  theme: (v) => (v ? (root.dataset.theme = v) : delete root.dataset.theme),
  paperLight: (v) => root.style.setProperty("--sysd-paper-light", v),
  paperDark: (v) => root.style.setProperty("--sysd-paper-dark", v),
};

// A colour input only takes #rrggbb, and the papers are written in OKLCH:
// paint the colour into one pixel and read it back.
const pixel = document.createElement("canvas").getContext("2d", { willReadFrequently: true });

function toHex(color) {
  pixel.clearRect(0, 0, 1, 1);
  pixel.fillStyle = color;
  pixel.fillRect(0, 0, 1, 1);
  const [r, g, b] = pixel.getImageData(0, 0, 1, 1).data;
  return "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("");
}

function cssNumber(name) {
  return parseFloat(getComputedStyle(root).getPropertyValue(name));
}

// Set the controls to whatever the stylesheet currently resolves to.
function syncInputsFromCss() {
  inputs.size.value = px("var(--sysd-size)");
  inputs.leading.value = cssNumber("--sysd-leading");
  inputs.ratio.value = String(cssNumber("--sysd-ratio-max"));
  inputs.hue.value = cssNumber("--sysd-accent-hue");
  inputs.radius.value = cssNumber("--sysd-radius");
  const font = getComputedStyle(root).getPropertyValue("--sysd-font").split(",")[0].replace(/["']/g, "").trim();
  inputs.font.value = font;
  inputs.theme.value = root.dataset.theme ?? "";
  inputs.paperLight.value = toHex(getComputedStyle(root).getPropertyValue("--sysd-paper-light").trim());
  inputs.paperDark.value = toHex(getComputedStyle(root).getPropertyValue("--sysd-paper-dark").trim());
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
  input.addEventListener("input", () => {
    apply[key](input.value);
    saved[key] = input.value;
    save();
    updateReadouts();
  });
}

document.getElementById("reset").addEventListener("click", () => {
  root.removeAttribute("style");
  delete root.dataset.theme;
  saved = {};
  save();
  syncInputsFromCss();
  updateReadouts();
});

// ------------------------------------------------------------- grid toggle

function setGrid(on) {
  root.toggleAttribute("data-grid", on);
  for (const button of document.querySelectorAll("[data-grid-toggle]")) {
    button.setAttribute("aria-pressed", String(on));
  }
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
addEventListener("resize", updateReadouts);
document.fonts?.ready.then(updateReadouts);
