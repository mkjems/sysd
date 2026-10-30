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
├── manifests/         One JSON file per component: classes, modifiers, allowed
│                      values, accessibility rules (+ component.schema.json)
├── src/
│   ├── css/           reset, base, layout and one file per component
│   └── components/    The few web components (light DOM, ES modules)
├── scripts/           Zero-dependency Node scripts: build tokens, build docs, check HTML
├── demo/              Pages built only with sysd: foundations, components,
│                      patterns, article, home
├── docs/              Documentation site, generated from the manifests
│   └── decisions/     Short records of design decisions and why they were made
├── dist/              Built output — never edited by hand
│   ├── sysd.css         Everything in one file
│   ├── css/             One file per layer
│   ├── components/      Web components
│   ├── tokens.json      Resolved token values
│   ├── custom-elements.json
│   └── sysd.md          Compact guide for AI authors
└── prototype/         Kept as the sketchbook
```

## Using sysd (once built)

```html
<link rel="stylesheet" href="dist/sysd.css">
```

sysd uses global `sysd-` classes in cascade layers. It works in plain HTML and in any framework. To override it, put your own CSS in a later layer.

## Licence

To be decided. The sample photographs in `prototype/v3/img/` are from [Unsplash](https://unsplash.com/license), served via [Lorem Picsum](https://picsum.photos).
