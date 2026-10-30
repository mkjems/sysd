# sysd

A personal design system for the web, built on the grid principles of Josef Müller-Brockmann and written in modern, framework-free CSS.

- Everything is measured in lines and columns, and derived from a handful of inputs: body size, leading, scale ratio, accent hue, the two papers, radius and the typeface.
- Change an input and the whole system moves together.
- Its first home is a personal homepage and blog.

The full brief, principles and build specification are in [AGENTS.md](AGENTS.md).

## Status

sysd is in the **prototype** stage. The direction is settled and shown in `prototype/v3`. The next step is to turn that prototype into the package structure described below. See "Status and next steps" in [AGENTS.md](AGENTS.md).

## Viewing the prototypes

There is no build step. Open the HTML files directly in a browser:

| Page | What it shows |
|---|---|
| [prototype/v3/index.html](prototype/v3/index.html) | **Current reference.** Foundations: grid, type, space, colour, components, overprinted forms |
| [prototype/v3/patterns.html](prototype/v3/patterns.html) | **Current reference.** Thirteen common section layouts, with images and dark tones |
| [prototype/v1-strict/index.html](prototype/v1-strict/index.html) | The first strict Müller-Brockmann version |
| [prototype/v2/index.html](prototype/v2/index.html) | v1 with overprinted forms and the entrance-motion experiment |
| [prototype/index.html](prototype/index.html), [prototype/article.html](prototype/article.html) | The softer, editorial direction (v0.2), kept for comparison |

On every page:
- Press **G** to show the grid as a wireframe.
- Use **Adjust** to change the inputs live. You can also choose light and dark paper colours.

## Folder structure

### Today

```
sysd/
├── AGENTS.md          The brief and build spec — read this first (humans and AI agents)
├── CLAUDE.md          Points AI agents to AGENTS.md
├── README.md          This file
├── outputs/           Early direction sketches, as standalone HTML pages and screenshots
└── prototype/         Explorations — a sketchbook, not the package
    ├── index.html       v0.2, editorial direction: foundations
    ├── article.html     v0.2: long-form article layout
    ├── sysd.css         v0.2: the system
    ├── prototype.css    v0.2: styles for the demo page itself
    ├── prototype.js     v0.2: Adjust panel and grid overlay
    ├── v1-strict/       The strict version
    ├── v2/              Strict + overprint + motion (sysd-motion.js)
    └── v3/              Current reference
        ├── index.html     Foundations
        ├── patterns.html  Section layouts
        ├── sysd.css       The system: tokens, base, layout, components
        ├── prototype.css  Styles for the demo pages only
        ├── prototype.js   Adjust panel, grid overlay
        └── img/           Sample photographs (Unsplash, via Lorem Picsum)
```

In each prototype, `sysd.css` is the design system. `prototype.css` and `prototype.js` exist only to present it.

Each version is a complete, self-contained copy. Earlier versions are kept as they were, not edited.

### Planned

The structure the prototype will grow into (specified in [AGENTS.md](AGENTS.md)):

```
sysd/
├── tokens/            Source of truth: design tokens in the W3C DTCG format
│   ├── primitive.tokens.json   Inputs and the scales calculated from them
│   └── semantic.tokens.json    Roles: paper, ink, accent, gutter, margin…
├── manifests/         One JSON file per component: attributes, allowed values,
│                      children, accessibility rules (+ component.schema.json)
├── src/
│   ├── css/           reset, base, layout, and elements/ for the CSS-only elements
│   ├── components/    Interactive components, one folder each (Lit source, styles, tests)
│   └── controllers/   Shared Lit controllers, including the one that drives Zag
├── scripts/           Build tokens, placement CSS and docs; check HTML
├── demo/              Pages built only with sysd: foundations, components,
│                      patterns, article, home, coexistence
├── docs/              Documentation site, generated from the manifests
│   └── decisions/     Short records of design decisions and why they were made
├── dist/              Built output — never edited by hand
│   ├── sysd.css           Tokens, base and every CSS-only element
│   ├── sysd-scoped.css    The same, scoped to <sysd-scope>
│   ├── sysd.js            Registers every interactive component
│   ├── components/        One ES module per interactive component
│   ├── sysd-dev.js        Dev-mode accessibility and usage audit
│   ├── custom-elements.json, html-custom-data.json, tokens.json
│   └── sysd.md            Compact guide for AI authors
└── prototype/         Kept as the sketchbook
```

## Using sysd (once built)

Everything in sysd is an element: `<sysd-section>`, `<sysd-grid>`, `<sysd-media>`, `<sysd-button>`, `<sysd-input>`… You configure it with attributes. There is one vocabulary to learn.

```html
<!-- Required: tokens, the grid, and every layout and content element -->
<link rel="stylesheet" href="dist/sysd.css">

<!-- Interactive components: all of them, or only the ones a page uses -->
<script type="module" src="dist/sysd.js"></script>
<!-- or -->
<script type="module" src="dist/components/sysd-button.js"></script>
<script type="module" src="dist/components/sysd-input.js"></script>
```

```html
<sysd-page>
  <main>
    <sysd-section layout="aside" rule>
      <sysd-aside><sysd-text step="2"><h2>Journal</h2></sysd-text></sysd-aside>

      <sysd-main>
        <sysd-figure caption="aside">
          <sysd-media ratio="wide">
            <img src="lake.jpg" alt="A dark lake between steep green hills">
          </sysd-media>
          <figcaption>Nine columns, 16 : 9.</figcaption>
        </sysd-figure>

        <sysd-prose>
          <p>Running text is plain HTML: paragraphs, headings, lists and links.</p>
        </sysd-prose>
      </sysd-main>
    </sysd-section>

    <sysd-section tone="night" bleed>
      <form>
        <sysd-input type="email" name="email" label="Email" hint="The newsletter, four times a year" required></sysd-input>
        <sysd-button variant="accent" type="submit">Subscribe</sysd-button>
      </form>
    </sysd-section>
  </main>
</sysd-page>
```

**Two kinds of element, one way of using them.**

- **Layout and content elements** (`<sysd-section>`, `<sysd-grid>`, `<sysd-media>`, `<sysd-card>`, `<sysd-prose>` and others) are CSS only. They need no JavaScript, so articles and images always render, even before any script has loaded.
- **Interactive components** (`<sysd-button>`, `<sysd-input>`, `<sysd-select>`, `<sysd-dialog>`, `<sysd-tabs>` and others) are built with [Lit](https://lit.dev). They wrap real native elements, so the browser's keyboard, focus, form and screen-reader behaviour is kept. The hard ones (select, menu, tabs, tooltip) get their behaviour from [Zag.js](https://zagjs.com), a well-tested headless library.

**Accessibility is built in.**
- Form controls connect their label, hint and error themselves.
- Dialogs, menus and tabs handle focus and the keyboard.
- Tones always come with readable ink.
- Load `dist/sysd-dev.js` while building a page, and it warns about missing labels, missing alt text and misused elements.

**Grid placement** uses one attribute per property, with a value per screen size: `span="4 md:8 lg:6"` means 4 columns on a phone, 8 on a tablet, 6 on a desktop.

**Overriding.** sysd lives in a single `sysd` cascade layer, so it works in plain HTML and in any framework. To override it, put your own CSS in a later layer, or style a component's parts with `::part()`.

**On a page shared with another design system**, use the scoped build. sysd then styles only what is inside a `<sysd-scope>`:

```html
<link rel="stylesheet" href="other-system.css">
<link rel="stylesheet" href="dist/sysd-scoped.css">

<sysd-scope>
  …sysd here…
  <sysd-exclude>…another system or a widget here…</sysd-exclude>
</sysd-scope>
```

A `<sysd-scope>` can also carry its own inputs, for example `<sysd-scope style="--sysd-accent-hue: 250">`, and everything inside it is recalculated from them. See "Coexistence" in [AGENTS.md](AGENTS.md).

## Licence

To be decided. The sample photographs in `prototype/v3/img/` are from [Unsplash](https://unsplash.com/license), served via [Lorem Picsum](https://picsum.photos).
