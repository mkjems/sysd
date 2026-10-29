// Prototype controls: adjust the root inputs live, show the grid,
// and print the computed value of tokens into [data-readout] elements.

const root = document.documentElement;
const STORAGE_KEY = "sysd-prototype";

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
  drawBaselines();
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
};

const outputs = {
  size: document.getElementById("out-size"),
  leading: document.getElementById("out-leading"),
  hue: document.getElementById("out-hue"),
  radius: document.getElementById("out-radius"),
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
};

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

const baselines = document.createElement("div");
baselines.className = "baseline-overlay";
baselines.setAttribute("aria-hidden", "true");
document.body.append(baselines);

// Where the body text baseline sits inside a line, measured from the real font.
function measureBaseline() {
  const line = document.createElement("div");
  line.style.cssText = "position:absolute;visibility:hidden;line-height:var(--sysd-u)";
  line.innerHTML = 'x<span style="display:inline-block;block-size:0;vertical-align:baseline"></span>';
  document.querySelector("main").append(line);
  const baseline = line.lastChild.getBoundingClientRect().top - line.getBoundingClientRect().top;
  line.remove();
  return baseline;
}

function drawBaselines() {
  if (!root.hasAttribute("data-grid")) return;
  const u = px("var(--sysd-u)");
  const end = document.querySelector(".site-footer").getBoundingClientRect().bottom + scrollY;
  const count = Math.floor(end / u);
  if (baselines.childElementCount !== count) {
    baselines.replaceChildren(...Array.from({ length: count }, () => document.createElement("i")));
  }
  baselines.style.setProperty("--baseline", `${measureBaseline()}px`);
}

function setGrid(on) {
  root.toggleAttribute("data-grid", on);
  drawBaselines();
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
