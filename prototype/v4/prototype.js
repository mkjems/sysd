// Prototype controls: adjust the root inputs live, show the grid,
// and print the computed value of tokens into [data-readout] elements.

const root = document.documentElement;
const STORAGE_KEY = "sysd-prototype-v4";

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
  for (const tone of toneNames) {
    const value = getComputedStyle(root).getPropertyValue(`--sysd-tone-${tone}`).trim();
    const output = document.getElementById(`out-tone-${tone}`);
    if (output) output.value = value;
    for (const el of document.querySelectorAll(`[data-tone="${tone}"]`)) el.textContent = value;
  }
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

// The tones, where the page has controls for them
const toneNames = ["graphite", "night", "forest", "umber", "deep"];
for (const tone of toneNames) {
  const input = document.getElementById(`in-tone-${tone}`);
  if (input) inputs[`tone-${tone}`] = input;
}

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
for (const tone of toneNames) apply[`tone-${tone}`] = (v) => root.style.setProperty(`--sysd-tone-${tone}`, v);

// ------------------------------------------------------------ oklch input
// Colours are chosen in OKLCH: three sliders for lightness, chroma and hue.
// The value is an oklch() string, so it goes straight into a token.

const pixel = document.createElement("canvas").getContext("2d", { willReadFrequently: true });

// Any CSS colour as [L, C, H]. oklch() is read as written; anything else is
// painted into one pixel and converted from sRGB.
function toOklch(color) {
  const match = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+|none)/.exec(color.trim());
  if (match) {
    const l = parseFloat(match[1]) / (match[2] ? 100 : 1);
    return [l, parseFloat(match[3]), match[4] === "none" ? 0 : parseFloat(match[4])];
  }
  pixel.clearRect(0, 0, 1, 1);
  pixel.fillStyle = color;
  pixel.fillRect(0, 0, 1, 1);
  const [r, g, b] = [...pixel.getImageData(0, 0, 1, 1).data].slice(0, 3).map((n) => {
    const c = n / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const H = (Math.atan2(B, A) * 180) / Math.PI;
  return [L, Math.hypot(A, B), (H + 360) % 360];
}

class OklchInput extends HTMLElement {
  static channels = [
    { key: "l", name: "Lightness", short: "L", max: 1, step: 0.005, digits: 3 },
    { key: "c", name: "Chroma", short: "C", max: 0.25, step: 0.001, digits: 3 },
    { key: "h", name: "Hue", short: "H", max: 360, step: 1, digits: 0 },
  ];

  connectedCallback() {
    if (this.ranges) return;
    const label = this.getAttribute("label") ?? "Colour";
    this.swatch = document.createElement("span");
    this.swatch.className = "oklch-input__swatch";
    this.append(this.swatch);
    this.ranges = {};
    for (const channel of OklchInput.channels) {
      const row = document.createElement("label");
      row.className = "oklch-input__row";
      const range = Object.assign(document.createElement("input"), { type: "range", min: 0, max: channel.max, step: channel.step });
      range.setAttribute("aria-label", `${label} ${channel.name.toLowerCase()}`);
      row.append(Object.assign(document.createElement("span"), { textContent: channel.short, title: channel.name }), range);
      this.append(row);
      this.ranges[channel.key] = range;
    }
    this.addEventListener("input", () => this.paint());
  }

  get value() {
    if (!this.ranges) return "";
    const [l, c, h] = OklchInput.channels.map((ch) => Number(this.ranges[ch.key].value).toFixed(ch.digits));
    return `oklch(${Number(l)} ${Number(c)} ${h})`;
  }

  set value(color) {
    this.connectedCallback();
    const lch = toOklch(color);
    OklchInput.channels.forEach((ch, i) => (this.ranges[ch.key].value = lch[i]));
    this.paint();
  }

  set disabled(off) {
    for (const range of Object.values(this.ranges ?? {})) range.disabled = off;
  }

  paint() {
    this.swatch.style.background = this.value;
  }
}

customElements.define("oklch-input", OklchInput);

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
  inputs.paperLight.value = getComputedStyle(root).getPropertyValue("--sysd-paper-light");
  inputs.paperDark.value = getComputedStyle(root).getPropertyValue("--sysd-paper-dark");
  for (const tone of toneNames) {
    const input = inputs[`tone-${tone}`];
    if (input) input.value = getComputedStyle(root).getPropertyValue(`--sysd-tone-${tone}`);
  }
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
  for (const [el, s] of original) applySection(el, s);
  saved = {};
  save();
  syncInputsFromCss();
  syncSectionControls();
  updateReadouts();
});

// --------------------------------------------------------------- sections
// Palette and paper per section, for the section in view. Each section
// remembers how the page set it, so it can be reset.

const sectionControls = document.getElementById("section-controls");
const sections = [...document.querySelectorAll("main > section.section[id]")];
const TONES = toneNames;
const original = new Map();

for (const el of sections) {
  const tone = TONES.find((t) => el.classList.contains(`sysd-negative--${t}`));
  original.set(el, {
    scheme: el.classList.contains("sysd-negative") ? "dark" : "light",
    paper: tone ?? "page",
  });
}

function applySection(el, s) {
  el.classList.remove("sysd-negative", "sysd-bleed-paper", "section-paper", "sysd-rule", ...TONES.map((t) => `sysd-negative--${t}`));
  el.style.removeProperty("--sysd-paper");
  el.style.removeProperty("--sysd-paper-dark");
  if (s.scheme === "dark") {
    el.classList.add("sysd-negative", "sysd-bleed-paper");
    if (TONES.includes(s.paper)) el.classList.add(`sysd-negative--${s.paper}`);
    if (s.paper === "custom") el.style.setProperty("--sysd-paper-dark", s.color);
  } else if (s.paper === "custom") {
    el.classList.add("section-paper");
    el.style.setProperty("--sysd-paper", s.color);
  } else {
    el.classList.add("sysd-rule");
  }
}

// The paper a section resolves to, in OKLCH
function paperOf(el) {
  const probe = document.createElement("div");
  probe.style.cssText = "display:none;background:var(--sysd-paper)";
  el.append(probe);
  const color = getComputedStyle(probe).backgroundColor;
  probe.remove();
  const [l, c, h] = toOklch(color);
  return `oklch(${Number(l.toFixed(3))} ${Number(c.toFixed(3))} ${Math.round(h)})`;
}

let current = sections[0] ?? null;

function currentState() {
  return saved.sections?.[current.id] ?? original.get(current);
}

function syncSectionControls() {
  if (!current) return;
  const cover = current.classList.contains("sysd-cover");
  const s = currentState();
  document.getElementById("in-section").value = current.id;
  for (const control of sectionControls.querySelectorAll("select:not(#in-section), input, button")) control.disabled = cover;
  if (cover) return;
  const scheme = document.getElementById("in-section-scheme");
  const paper = document.getElementById("in-section-paper");
  const colour = document.getElementById("in-section-colour");
  scheme.value = s.scheme;
  paper.value = s.paper;
  for (const option of paper.querySelectorAll("[data-dark]")) option.disabled = s.scheme === "light";
  colour.value = s.paper === "custom" ? s.color : paperOf(current);
  document.getElementById("out-section-colour").value = colour.value;
}

function setSection(change) {
  const s = { ...currentState(), ...change };
  if (s.scheme === "light" && TONES.includes(s.paper)) s.paper = "page";
  if (s.paper === "custom" && !s.color) s.color = paperOf(current);
  applySection(current, s);
  saved.sections = { ...saved.sections, [current.id]: s };
  save();
  syncSectionControls();
}

// The section in view is the one under a line a third of the way down the window
function findCurrent() {
  const y = innerHeight / 3;
  const atEnd = scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
  const next = atEnd ? sections.at(-1) : sections.find((el) => {
    const r = el.getBoundingClientRect();
    return r.top <= y && r.bottom > y;
  });
  if (next && next !== current) {
    current = next;
    syncSectionControls();
  }
}

if (sectionControls) {
  const picker = document.getElementById("in-section");
  for (const el of sections) {
    const num = el.querySelector(".section__num")?.textContent ?? "";
    const title = el.querySelector("h2")?.textContent ?? el.id;
    picker.add(new Option(`${num} ${title}`, el.id));
  }
  picker.addEventListener("input", () => {
    current = document.getElementById(picker.value);
    syncSectionControls();
  });
  document.getElementById("in-section-scheme").addEventListener("input", (e) => setSection({ scheme: e.target.value }));
  document.getElementById("in-section-paper").addEventListener("input", (e) => setSection({ paper: e.target.value }));
  document.getElementById("in-section-colour").addEventListener("input", (e) => setSection({ paper: "custom", color: e.currentTarget.value }));
  document.getElementById("section-reset").addEventListener("click", () => {
    applySection(current, original.get(current));
    delete saved.sections?.[current.id];
    save();
    syncSectionControls();
  });
  let ticking = false;
  addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { findCurrent(); ticking = false; });
  }, { passive: true });
}

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
for (const [id, s] of Object.entries(saved.sections ?? {})) {
  const el = document.getElementById(id);
  if (original.has(el)) applySection(el, s);
}
if (sectionControls) { findCurrent(); syncSectionControls(); }
syncInputsFromCss();
updateReadouts();
addEventListener("resize", updateReadouts);
document.fonts?.ready.then(updateReadouts);
