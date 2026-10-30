# sysd

This project is about creating a design system that I can use in my other projects whenever I need a consistent
and professional tone that is my own.

The first goal is to have something I can use on the web.

I also want to do this because I feel that this is increasingly the direction the industry is moving in.
More and more companies want their own design system, to have consistency across multiple platforms.
And with the help of AI this is now possible, when before it was simply too much work.

It also connects to my bigger ambition of building an online design system generator/builder/tool where designers can create a design system through a web interface.
sysd is built so that it could become the first system made with that tool: every decision flows from a small set of inputs, and a generator is in essence an interface for those inputs.

**Scope:** the generator is out of scope until sysd 1.0 is finished. Build sysd as my own, specific system first. Making it generic comes after. Don't add configurability for its own sake.

So let's build this the way you would build it for a client.

It's called "sysd".

## Design brief

### Keywords and character

Elegant, precise, cool, calm, poetic, typographic design excellence,
typographic hierarchy, simplicity, columns of small text, modern-school Bauhaus, grid layouts, free-flowing columns.
Modern design mannerisms, light greys contrasted with bold splashes of colour, love of type, boring but not boring, playful
but academic, craftsmanship, Swiss design, Josef Müller-Brockmann.

### Principles

1. **Rules first, then break them on purpose.** The strict grid is the default. Breaking it — overprinted forms, full-bleed images, covers — is a deliberate, named move with its own documented component, never an accident or a one-off override.
2. **Few inputs, everything derived.** Body size, leading, scale ratio, accent hue, the two papers, radius and typefaces are chosen by hand. Everything else (the line, spacing, the type scale, columns, surfaces) is calculated from them.
3. **Everything is measured in lines and columns.** Space is a multiple of the line (body size × leading). Widths are whole numbers of columns. Images take a whole number of columns and are cropped to their frame.
4. **White space is a material.** Empty columns and generous space between sections are part of the composition, not leftovers.
5. **Native first.** Use the platform's own elements (`<dialog>`, `popover`, `<details>`, `<select>`, form controls) and style them. Write JavaScript only for behaviour the platform doesn't have.
6. **Flat.** Colour, type and space do the work. No decorative shadows, gradients or rounded-card aesthetics. Shadows only where something truly floats above the page (popovers, dialogs).

### Should work on

- Touch screens, and keyboard, mouse or trackpad. Be accessible (see Accessibility).
- Small and large screens. Every layout collapses to a single readable column on a phone.
- Across all web frontend frameworks (plain HTML, React, Vue, Svelte, Astro and others) without framework-specific wrappers.
- On the same page as another design system, or as a second, differently configured sysd (see Coexistence).

It should have themes: at least a light and a dark mode. Both are first-class, and either can be chosen by the reader or follow the operating system.

### Where it will be used

The first places are:
- my own personal homepage
- a personal blog, or
- a collection of article pages.

The idea is to make it easy to create beautiful article pages, while still having a playful approach that allows creativity.
I'm a graphic designer. I like flat-coloured, limited-palette, well-composed, simple designs. Deliberate white space. I like all the great modern graphic designers. The most important colours are light and dark. Did I say white space?

### Technology

- Pure CSS with custom properties, organised in cascade layers nested under one `sysd` layer (`sysd.reset, sysd.tokens, sysd.base, sysd.layout, sysd.components`). Global, prefixed class names (`sysd-…`) — not bundler-scoped CSS Modules — because that is what works in every framework and in plain HTML.
- So much has happened in the CSS space lately. I want to use the modern CSS way of doing things: subgrid, `light-dark()`, `color-mix()` and OKLCH, `pow()` / `round()`, `:has()`, container queries, popover, customisable select.
- Web components and native web development where behaviour is needed. No more tech silos. Web components use the light DOM, so the global layers and tokens style them like any other element.
- Zero runtime dependencies. Development tooling is kept to a short list of tools that each justify their place (see How it is maintained). No 50 MB `node_modules`.

### Coexistence

It is a requirement that sysd can share a page with other design systems, and with other configurations of itself, without either breaking the other. Use cases:

- **Migration:** a project uses its old CSS framework and sysd at the same time while it moves over.
- **Embedding:** a third-party widget, or a section in another brand, lives inside a sysd page, or sysd lives inside someone else's page.
- **Several sysd configurations:** a section with its own accent, papers or body size, or the generator showing two systems side by side.

How sysd achieves this:

1. **Namespaced names.**
   - Every class is `sysd-…`, every custom property is `--sysd-…`, every web component is `<sysd-…>`, and every data attribute is `data-sysd-…`.
   - Component-internal properties are `--_…`, and are only ever set on the component's own elements.
   - Nothing unprefixed is ever defined.
2. **One layer for all of sysd.** All sysd CSS sits in a single layer, `sysd`, with its sub-layers inside it (`@layer sysd.reset, sysd.tokens, sysd.base, sysd.layout, sysd.components`). The page can then put the whole of sysd before or after another system in one statement, for example `@layer other, sysd;`. sysd never declares an unnamed or top-level layer of its own, so it can't merge with another system's `base` or `components`.
3. **Element styles are scoped.** The reset and base styles are the only parts of sysd that style elements (`body`, headings, links, form controls) rather than classes. They come in two forms:
   - `dist/sysd.css` applies them to the whole document, for pages that are sysd only.
   - `dist/sysd-scoped.css` applies them only inside `.sysd` with `@scope (.sysd) to (.sysd-exclude)`. sysd styles nothing outside a `.sysd` container, and nothing inside a `.sysd-exclude` hole, where another system or a widget can live.

   Component classes work the same in both forms.

   `@scope` reached all major browsers only recently (Firefox last, in late 2025), so it is below the "widely available" floor. Until it reaches the floor, the scoped build also carries a fallback for browsers without `@scope`. The fallback uses descendant selectors under `:where(.sysd)`, which add no specificity. In those browsers the element styles still stay inside `.sysd`, but a `.sysd-exclude` hole is not guaranteed.
4. **Any element can be a new root.**
   - The derived tokens (the line, spacing, type scale, colour roles) are declared on `:root, .sysd-scope`, not on `:root` alone.
   - Setting an input on a `.sysd-scope` element gives that subtree its own fully recalculated system: change `--sysd-accent-hue`, `--sysd-size` or `--sysd-paper-light` there and everything inside follows.
   - Theme and `color-scheme` can also be set per scope (`data-sysd-theme`), not only on `<html>`.
5. **No global side effects.** sysd doesn't set styles on `html`/`:root` beyond tokens and `color-scheme` in the document-wide form. It doesn't use `!important` except in the reduced-motion safeguard, and it doesn't use `*` selectors outside the reset.
6. **Strong isolation when needed.** For a fully foreign context (a preview of another system, an untrusted embed), sysd can be loaded inside a shadow root (`adoptedStyleSheets`) or an iframe. It is the one case where shadow DOM is the right tool.

A coexistence demo (`demo/coexistence.html`) proves all of this:
- a page with sysd and a second, unrelated stylesheet with clashing element styles and layer names;
- a `.sysd-exclude` hole;
- two `.sysd-scope` sections with different inputs, side by side.

The visual regression tests include it.

### Browser support

- The floor is [Baseline](https://web.dev/baseline) "widely available": everything must work and read well there.
- "Newly available" features are used as progressive enhancement, behind `@supports` or with a fallback that still looks deliberate. Example: the customisable `<select>` falls back to the native one.
- Tested in the latest two versions of Chrome, Edge, Firefox and Safari, including Safari on iOS.

### Accessibility

- Target: WCAG 2.2 level AA.
- Contrast is at least 4.5 : 1 for body text and 3 : 1 for large text and interface parts, in both themes and in every negative tone. Overprinted forms and duotone images must not lower text below this; where they would, the text moves or the treatment changes.
- Every interactive element has a visible focus state and works with the keyboard alone.
- Touch targets are at least 44 × 44 px on touch screens, and at least 24 × 24 px everywhere.
- Layouts reflow without horizontal scrolling at 320 CSS px and at 200 % zoom.
- `prefers-reduced-motion`, `prefers-color-scheme` and `forced-colors` are respected.
- Images have meaningful `alt` text, or `alt=""` when they are decorative.

### Typography

- **Inter** is the typeface, for everything: text, headings, labels and interface. Use its variable weight and optical size axes, and its OpenType features where they help (tabular figures for numbers, `ss`/`cv` alternates only by deliberate choice).
- A monospace for code and data: IBM Plex Mono for now.
- A serif is allowed only as an optional second voice (quotes, italics in headings), never as a body face.
- Fonts are self-hosted as variable WOFF2 files with `font-display: swap`. No runtime calls to font services. (Inter and IBM Plex Mono are both licensed under the SIL Open Font License.)

### Colour

- Two papers (light and dark) and one ink for each, one accent, and fixed process inks (yellow, blue) for overprinted forms. That is the whole palette.
- Dark is never black. Negative sections use dark tones (graphite, night, forest, umber, deep accent).
- All colours are defined in OKLCH, so changing the accent's hue keeps its lightness and contrast.

### Images

- Full-colour photography is the default. Black-and-white and duotone are deliberate treatments, used for a reason (a set of portraits, a section background).
- Every image takes a whole number of columns and a fixed proportion (1 : 1, 4 : 5, 3 : 2, 16 : 9, 21 : 9). The image is cropped to the frame, not the frame to the image.
- Images are served with `width`, `height`, `srcset` and `sizes`, and lazy-loaded below the fold.

### What is a design system

A design system is a maintained set of reusable decisions (design tokens, components and patterns) together with explicit, machine-readable rules for applying them. It gives authors, human or AI, a shared vocabulary for building interfaces that are consistent in appearance and behaviour, while staying expressive enough that they rarely need to step outside it, and constrained enough that it can verify when they do.

### What is a well-crafted design system

- **Foundations (visual DNA):** the core design tokens and styles: colour, typography scale, the line and spacing, the grid. (sysd is flat, so it has no elevation scale.)
- **Component library:** reusable, modular UI building blocks (such as buttons, form inputs, cards and navigation) with defined states, attributes and matching code snippets.
- **Pattern library:** layout groupings and common flows. For sysd these are mainly section layouts (heroes, media and text, galleries, lists, footers) and article structures, plus the few flows a personal site needs (subscribe, contact).
- **Comprehensive documentation:** clear guidelines explaining when and how to use components, including dos and don'ts, naming conventions and live code examples.

### What this project intends to output

- Design tokens
- Reusable, composable components
- Demo pages that show the system in use
- Machine-readable rules
- Human-readable documentation about component attributes and intended use
- A versioned package that other projects can use

## Design tokens

**Source of truth:** JSON files in the [W3C Design Tokens Community Group (DTCG) format](https://www.designtokens.org/) in `tokens/`:

- `primitive.tokens.json`
- `semantic.tokens.json`
- component tokens, declared in each component's manifest (see Machine-readable rules).

**Three tiers: primitive → semantic → component.**

1. **Primitive.** Raw values with no meaning attached. They come in two kinds:
   - **Inputs**, chosen by hand: body size, leading, scale ratio, accent hue, light paper, dark paper, radius, font families.
   - **Scales** calculated from the inputs: the line (size × leading), spacing steps, type steps and their leading, column counts, strokes, the colour primitives (the accent at its lightness steps, the process inks yellow and blue, the dark tones graphite, night, forest, umber, deep).
2. **Semantic.** A purpose in the name, pointing at primitives:
   - **Colour roles:** paper, surface, field, ink, ink-muted, hairline, hairline-strong, accent, on-accent, focus, danger.
   - **Layout roles:** gutter, margin, max width, measure, control height, touch target.

   Themes and negative sections work at this tier: they change which primitive a role points to, not the roles themselves. Names describe purpose (`--sysd-ink-muted`, not `--sysd-grey-500`).
3. **Component.** A knob for one component, only where it is needed (`--span`, `--start`, `--ratio`, `--rows`, `--top`, `--cover-lines`), documented in that component's manifest.

**Rule:** components use semantic tokens. The measurement scales (the line, the space steps, the type steps) may also be used directly, because in sysd they *are* the measurement system. Colour primitives are never used by components directly: they always go through a semantic role, so themes and tones keep working.

**Derived tokens stay live.** sysd derives values in the browser (`calc()`, `pow()`, `round()`, `color-mix()`, `light-dark()`), so that changing an input changes the whole system. Each derived token therefore holds:

- its resolved default value in `$value`, for tools that need a plain value;
- its CSS formula in `$extensions["dev.sysd"].css`, which the build writes into the CSS.

**Naming:** `--sysd-{role}-{variant}`, for example `--sysd-space-2`, `--sysd-fs-3`, `--sysd-accent`. Private, component-internal properties start with `--_`.

**Outputs:**

| File | Contents |
|---|---|
| `dist/tokens.css` | the custom properties, in `@layer tokens` |
| `dist/tokens.json` | resolved values for the default inputs, for other tools and platforms |

**Tooling:** a small zero-dependency Node script (`scripts/build-tokens.js`). Style Dictionary is the fallback if the needs grow beyond that, for example to export native platform formats.

## Reusable, composable components

Components are CSS classes on native elements unless marked **(web component)**. Each one ships with its CSS, a manifest, documentation and a demo, in every state, in both themes.

**Layout**
- Page grid (`sysd-page`): 4 / 8 / 12 columns, the margins and the maximum width.
- Region (`sysd-region`): a subgrid that passes the page's columns down.
- Placement (`sysd-span`): `--start` and `--span`, each with `-md` and `-lg` variants.
- Aside and main (`sysd-asym`, `sysd-aside`, `sysd-main`).
- Equal columns (`sysd-cols`).
- Modular fields (`sysd-fields`).
- Text columns (`sysd-text-columns`).
- Flow (`sysd-flow`): vertical rhythm between siblings.
- Section and rule (`sysd-rule`).
- Full bleed (`sysd-bleed`).
- Negative section and tones (`sysd-negative`, `--graphite`, `--night`, `--forest`, `--umber`, `--deep`).
- Cover: an image as the section background (`sysd-cover`, `sysd-panel`).

**Typography**
- Type steps (`sysd-step-n`), label, lead and muted text, measure.
- Prose (`sysd-prose`) for article bodies: headings, paragraphs, lists, links, blockquote and citation, inline code, `hr`.
- Code block, with optional line numbers and no highlighter required.
- Table: numeric columns, captions, scrolling on narrow screens.
- Footnotes and margin notes.
- Drop cap.

**Content**
- Figure and media: ratios, fill, mono and duotone, captions in the text column or in the aside.
- Card.
- Entry list (journal index, with an optional thumbnail).
- Quote / testimonial.
- Figures (key numbers).
- Tags.
- Byline and article meta (author, date, reading time).
- Table of contents.
- Previous / next article.
- Overprinted forms (`sysd-overprint`, `sysd-shape`).

**Navigation**
- Site header and nav: collapses into a disclosure on small screens, using `popover`.
- Skip link.
- Breadcrumbs.
- Footer.

**Forms**
- Button: default, accent, outline, quiet; compact; disabled.
- Input, textarea (grows with its content), select (native, and customisable where supported).
- Checkbox, radio, switch.
- Fieldset and field: label, hint, error.
- Subscribe form.

**Overlays and disclosure**
- Dialog (native `<dialog>`).
- Popover / menu (native `popover`).
- Disclosure and accordion (native `<details>`).

**Web components**, only where behaviour is needed:
- `<sysd-theme-switch>`: light / dark / system, remembered per reader.
- `<sysd-tabs>`: tabs with full keyboard support.

**Not in version 1:** date picker, combobox / autocomplete, data grid, carousel, toast notifications, rich-text editor, charts. Native inputs are used instead (`<input type="date">`, `<datalist>`) until a real need appears.

## Demo pages that show the system in use

Demo pages live in `demo/` and are built only with sysd: sysd classes, plus the documented custom properties (`--span`, `--ratio` and so on) in `style` attributes. If a demo needs its own CSS, that is a sign a component is missing, and the component gets made.

- `demo/foundations.html`: the grid, type, space, colour and treatments, with an Adjust panel for the inputs.
- `demo/components.html`: every component in every state (default, hover, focus, active, disabled, error).
- `demo/patterns.html`: the common section layouts.
- `demo/article.html`: a real long-form article that uses every prose element.
- `demo/home.html`: a personal homepage built from the patterns.

Every demo is checked at 390, 820 and 1440 px wide, in light and dark, with the keyboard only, and with the grid overlay (**G**) on. Demos double as the visual regression tests (see How it is maintained).

`prototype/` holds explorations (v1-strict, v2, v3 and others). It is a sketchbook, not part of the package. Ideas graduate from it into `src/`.

## Machine-readable rules

**Component manifests:** one JSON file per component in `manifests/`, validated against `manifests/component.schema.json`. Each manifest lists:

- name, status (`draft`, `stable`, `deprecated`) and a one-line purpose;
- the element(s) it applies to;
- its classes and modifiers, and which modifiers can be combined;
- the custom properties it accepts, with types and allowed values (for example `--span`: integer 1–12; `--ratio`: one of the five proportions);
- required and allowed children;
- accessibility requirements (for example "an image needs `alt`", "an icon-only button needs `aria-label`");
- a minimal markup example;
- when to use it and when not to.

**Web components** are additionally described in a [Custom Elements Manifest](https://custom-elements-manifest.open-wc.org/) (`dist/custom-elements.json`), which editors and frameworks already understand.

**Checks**, which make "constrained enough that it can verify when they do" real:

- **CSS:** a Stylelint config (`stylelint.config.js`) that allows only sysd tokens for colour, space, font size and radius in consuming projects, and only the `sysd` layer and its sub-layers.
- **HTML:** `scripts/check-html.js` reads the manifests and reports:
  - unknown `sysd-` classes;
  - invalid modifier combinations;
  - custom property values outside their range;
  - missing `alt` text and labels;
  - components placed in parents they don't belong in.

**A guide for AI authors:** `dist/sysd.md` is generated from the manifests and the principles. It is a compact, complete description of the vocabulary that an AI agent can be given as context before building a page.

The checks verify the vocabulary, not the taste. Whether a composition is good remains a human judgement, which the documentation's dos and don'ts support.

## Human-readable documentation

A documentation site in `docs/`, built with sysd itself and generated from the manifests, so the documentation can't drift from the code. Per component:

- what it is for, when to use it and when not to;
- anatomy: the parts and their class names;
- live examples with copyable markup;
- variants and modifiers;
- custom properties and their allowed values;
- states;
- keyboard and screen reader behaviour;
- browser notes and fallbacks;
- dos and don'ts, shown as rendered examples.

The site also contains:
- **foundations pages:** the line, the grid, type, colour, space, images;
- **principles:** the ones above, illustrated;
- **getting started:** how to add sysd to a plain HTML page and to a framework project;
- **decisions:** short decision records in `docs/decisions/NNN-title.md`, saying what was decided, why, and what was rejected. Examples: "no baseline grid", "light DOM web components", "dark is never black";
- **changelog.**

## Distribution

- `dist/sysd.css`: one file containing all layers, styling the whole document. Use it with a single `<link>`.
- `dist/sysd-scoped.css`: the same, with element styles scoped to `.sysd` containers, for pages shared with other systems.
- `dist/css/*.css`: one file per layer, for projects that want only parts.
- `dist/components/*.js`: web components as ES modules, usable without a build step.
- Published as an npm package (the name is to be decided) and therefore also available from a CDN such as jsDelivr.
- Consumers override sysd by putting their own CSS in a later layer than `sysd`, never by fighting specificity.

## How it is maintained

- **One source of truth.** The tokens JSON and the component manifests. The CSS token file, `tokens.json`, `custom-elements.json`, the AI guide and the documentation are generated from them or checked against them.
- **Semantic versioning.**
  - Patch: fixes.
  - Minor: new components, tokens or variants.
  - Major: renamed or removed classes and tokens, or changed defaults.
  - Every release has a changelog entry.
- **Deprecation before removal.** A deprecated class or token keeps working for at least one minor version. The HTML checker warns about it and names the replacement.
- **Automated checks on every change** (GitHub Actions):
  - Stylelint;
  - manifest validation against the schema;
  - the HTML checker on all demos;
  - an accessibility scan (axe) of all demos in both themes;
  - visual regression screenshots of the demos at 390 / 820 / 1440 px, in light and dark (Playwright).
- **Few inputs, derived values and cascade layers.** These keep the system small enough for one person to maintain: most changes are a change to an input or a formula, not to many hand-set values.
- **The repository layout:**

```
tokens/       primitive.tokens.json, semantic.tokens.json   (source)
manifests/    one JSON per component + component.schema.json
src/css/      reset.css, base.css, layout.css, components/*.css
src/components/  web components (light DOM, ES modules)
scripts/      build-tokens.js, build-docs.js, check-html.js (zero-dependency Node)
demo/         demo pages
docs/         documentation site, decisions/
dist/         built output (generated, not edited by hand)
prototype/    explorations, not part of the package
```

## Status and next steps

- `prototype/v3` (`index.html` for the foundations, `patterns.html` for the section layouts) is the reference: the strict Müller-Brockmann direction the system is built on. `v1-strict` and `v2` are kept for reference. v2 holds the motion experiment.
- Motion and animation are deferred until the static system is done.
- Next: turn v3 into the structure above, in this order:
  1. the token files and `build-tokens.js`;
  2. `src/css` split into layers, all nested under `sysd`, with the scoped build;
  3. the component manifests and their schema;
  4. `check-html.js`;
  5. the demo pages, rebuilt on `dist/sysd.css`, including the coexistence demo;
  6. the docs.
