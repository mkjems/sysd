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
5. **One vocabulary for authors.** Everything an author uses is a `<sysd-…>` element with attributes. Running text is the only exception: inside `<sysd-prose>` it stays plain HTML (`<p>`, `<h2>`, `<ul>`, `<a>`), so Markdown and content management systems work as they are.
6. **Native inside.** Components wrap the platform's own elements (`<button>`, `<input>`, `<dialog>`, `<details>`, `<img>`, headings) instead of re-creating them. The browser's keyboard support, focus handling, form behaviour and screen-reader semantics are kept, not imitated.
7. **Accessible by construction.** The component does the accessibility work, not the author. Labels, descriptions, error announcements, focus management and contrast are built in. Where the author must supply something (alt text, a label for an icon button), the component requires it and warns when it is missing.
8. **Content never waits for JavaScript.** Layout and content components are CSS only. Text, images and the grid render without a script. Only interactive components need JavaScript.
9. **Flat.** Colour, type and space do the work. No decorative shadows, gradients or rounded-card aesthetics. Shadows only where something truly floats above the page (popovers, dialogs).

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

**The author's vocabulary: custom elements.**

Every component is a `<sysd-…>` element configured with attributes, for example:

```html
<sysd-section tone="night">
  <sysd-grid>
    <sysd-media span="4 md:8 lg:6" ratio="wide"><img src="…" alt="…"></sysd-media>
    <sysd-button variant="accent">Subscribe</sysd-button>
  </sysd-grid>
</sysd-section>
```

There are two kinds of component, invisible to the author:

1. **CSS-only elements, for layout and content.** `<sysd-grid>`, `<sysd-section>`, `<sysd-media>`, `<sysd-card>`, `<sysd-prose>` and the like have no JavaScript at all.
   - A custom element doesn't need to be defined in JavaScript to exist: the stylesheet styles the tag and its attributes directly, as in `sysd-section[tone="night"]`.
   - They use the light DOM, so subgrid and the page grid keep working through them.
   - They are semantically neutral, like a `<div>`. Where meaning matters, the native element goes inside them: `<sysd-media><img alt="…"></sysd-media>`, `<sysd-text step="6"><h2>…</h2></sysd-text>`.
2. **Interactive components, built with [Lit](https://lit.dev).** `<sysd-button>`, `<sysd-input>`, `<sysd-select>`, `<sysd-dialog>`, `<sysd-tabs>`, `<sysd-menu>` and the like.
   - They render a real native element inside: a `<button>`, an `<input>`, a `<dialog>`.
   - Form controls are form-associated custom elements (`ElementInternals`), so they take part in a normal `<form>`: value, validation, reset, disabled.
   - They use shadow DOM for their internals. The tokens reach inside because custom properties inherit through shadow boundaries.
   - If a behaviour library or assistive technology turns out to break across a shadow boundary, that component uses light DOM instead. This is decided per component, and recorded as a decision.
   - For pages that must work without JavaScript, interactive components can be server-rendered with Lit SSR (declarative shadow DOM).

**Placement attributes.** Grid placement is set with attributes that hold one value per breakpoint: `span="4 md:8 lg:6"`, `start="lg:4"`, `rows="3 lg:7"`. The CSS for every allowed value (1–12) is generated, matched with `[span~="lg:6"]`-style selectors. Placement attributes are allowed on every sysd element. To place a native element on the grid, wrap it in `<sysd-block>`.

**CSS.** Modern CSS with custom properties, organised in cascade layers nested under one `sysd` layer (`sysd.reset, sysd.tokens, sysd.base, sysd.layout, sysd.components`). So much has happened in the CSS space lately, and I want to use the modern way of doing things: subgrid, `light-dark()`, `color-mix()` and OKLCH, `pow()` / `round()`, `:has()`, `@scope`, container queries, popover, the customisable select.

**Behaviour for complex components comes from a headless library.** [Zag.js](https://zagjs.com) supplies the state machines, keyboard handling and ARIA for the hard ones: select, menu, combobox, tooltip, tabs, toast, date picker. Zag is framework-independent. sysd connects it to Lit through one shared reactive controller. See Dependencies.

No more tech silos: the elements work in plain HTML and in every framework (React 19 and later, Vue, Svelte, Astro and others) without wrappers.

### Dependencies

The platform comes first. Native `<dialog>`, `popover`, `<details name>`, form controls and `command`/`commandfor` buttons need no library.

**Runtime dependencies**, the complete list:

| Dependency | What for | Loaded by |
|---|---|---|
| Lit | every interactive component | interactive components only |
| Zag.js machines | behaviour of complex components | one machine per component, only by that component |
| Floating UI | positioning popups next to their trigger (used through Zag) | components that position popups |

Rules:

1. **A library supplies behaviour, never appearance or API.** Authors only ever see sysd elements and their attributes. Zag sits behind each component's own API, one file per component, so it can be replaced component by component without any author's markup changing.
2. **A page that uses only CSS-only elements loads no JavaScript at all.**
3. **Every new runtime dependency needs a decision record** (`docs/decisions/`) covering:
   - why the platform and the existing dependencies aren't enough;
   - its maintenance health;
   - its licence;
   - its size;
   - whether it works in shadow DOM.
4. **Prove the stack early.** The first Zag-based component is tested with real screen readers (VoiceOver on macOS and iOS, NVDA on Windows), across the shadow boundary, before the others are built.
5. **Pin the versions.** Every upgrade runs the full accessibility and visual test suite.

**Development tools**, each justifying its place:
- the Lit and Custom Elements Manifest analyser;
- a bundler for `dist/` (esbuild);
- Stylelint;
- Playwright with axe.

No 50 MB `node_modules` for consumers: they get finished files.

### Coexistence

It is a requirement that sysd can share a page with other design systems, and with other configurations of itself, without either breaking the other. Use cases:

- **Migration:** a project uses its old CSS framework and sysd at the same time while it moves over.
- **Embedding:** a third-party widget, or a section in another brand, lives inside a sysd page, or sysd lives inside someone else's page.
- **Several sysd configurations:** a section with its own accent, papers or body size, or the generator showing two systems side by side.

How sysd achieves this:

1. **Namespaced names.**
   - Every element is `<sysd-…>`, every custom property is `--sysd-…`, every class (where one is needed) is `sysd-…`, and every event is `sysd-…`.
   - Component-internal properties are `--_…`, and are only ever set on the component's own elements.
   - Nothing unprefixed is ever defined.
2. **One layer for all of sysd.** All sysd CSS sits in a single layer, `sysd`, with its sub-layers inside it (`@layer sysd.reset, sysd.tokens, sysd.base, sysd.layout, sysd.components`). The page can then put the whole of sysd before or after another system in one statement, for example `@layer other, sysd;`. sysd never declares an unnamed or top-level layer of its own, so it can't merge with another system's `base` or `components`.
3. **Element styles are scoped.** The reset and base styles (for `body`, headings, links and plain HTML in prose) are the only parts of sysd that style native elements directly. They come in two forms:
   - `dist/sysd.css` applies them to the whole document, for pages that are sysd only.
   - `dist/sysd-scoped.css` applies them only inside `<sysd-scope>`, with `@scope (sysd-scope) to (sysd-exclude)`. sysd styles nothing outside a `<sysd-scope>`, and nothing inside a `<sysd-exclude>` hole, where another system or a widget can live.

   sysd elements work the same in both forms.

   `@scope` reached all major browsers only recently (Firefox last, in late 2025), so it is below the "widely available" floor. Until it reaches the floor, the scoped build also carries a fallback for browsers without `@scope`. The fallback uses descendant selectors under `:where(sysd-scope)`, which add no specificity. In those browsers the element styles still stay inside `<sysd-scope>`, but a `<sysd-exclude>` hole is not guaranteed.
4. **Any `<sysd-scope>` is a new root.**
   - The derived tokens (the line, spacing, type scale, colour roles) are declared on `:root, sysd-scope`, not on `:root` alone.
   - Setting an input on a `<sysd-scope>` gives that subtree its own fully recalculated system: `<sysd-scope style="--sysd-accent-hue: 250">`. Everything inside follows.
   - Theme and `color-scheme` can also be set per scope (`<sysd-scope theme="dark">`), not only on `<html>`.
   - Interactive components inherit the tokens of the scope they sit in, through their shadow roots.
5. **No global side effects.** sysd doesn't set styles on `html`/`:root` beyond tokens and `color-scheme` in the document-wide form. It doesn't use `!important` except in the reduced-motion safeguard, and it doesn't use `*` selectors outside the reset.
6. **Strong isolation when needed.** Interactive components already keep their internals in shadow DOM, so another system's element styles can't reach them. For a fully foreign context (a preview of another system, an untrusted embed), a whole sysd page can be loaded inside a shadow root (`adoptedStyleSheets`) or an iframe.
7. **One registration per element name.** Components register themselves only if the name is still free (`customElements.get()` first), so loading a component twice is harmless. Two different versions of sysd on one page are not supported until scoped custom element registries are available in all browsers. Until then, a page uses one version of sysd's interactive components.

A coexistence demo (`demo/coexistence.html`) proves all of this:
- a page with sysd and a second, unrelated stylesheet with clashing element styles and layer names;
- a `<sysd-exclude>` hole;
- two `<sysd-scope>` sections with different inputs, side by side.

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

**What the components do for the author:**

- **Form controls** (`<sysd-input>`, `<sysd-select>`, `<sysd-checkbox>` and the others) take `label`, `hint`, `error` and `required` as attributes. They connect them correctly (labelling, descriptions, the invalid state, the required marker) and announce errors to screen readers. A form control without a label is reported as an error.
- **Icon-only buttons** require a `label`.
- **Images** inside `<sysd-media>` must have `alt`, or `alt=""` for a decorative image. A missing `alt` is reported.
- **Dialogs, menus, tabs, tooltips and selects** handle focus trapping and focus return, Escape, arrow keys, typing ahead, and the expanded and selected states.
- **Contrast:** a `tone` always brings its matching ink, so text on a negative section is always readable. The accent's lightness is fixed per theme, so changing its hue can't break contrast.
- **`<sysd-page>`** provides the skip link, and checks that the page has a `<main>` and one `<h1>`.
- **Motion and focus:** reduced motion and visible focus are handled by the components, not left to each page.
- **A dev-mode audit, `sysd-dev.js`,** is loaded only while building a page. It warns in the console about:
  - missing labels and alt text;
  - skipped heading levels;
  - unknown sysd elements and attributes;
  - attribute values outside their allowed range;
  - elements placed in parents they don't belong in.

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
3. **Component.** A knob for one component, only where it is needed (`--span`, `--start`, `--ratio`, `--rows`, `--top`, `--cover-lines`), documented in that component's manifest. Authors normally set these through the component's attributes (`span="lg:6"`, `ratio="wide"`). Setting the custom property directly in a `style` attribute is the documented escape hatch, for values the attributes don't offer.

**Rule:** components use semantic tokens. The measurement scales (the line, the space steps, the type steps) may also be used directly, because in sysd they *are* the measurement system. Colour primitives are never used by components directly: they always go through a semantic role, so themes and tones keep working.

**Derived tokens stay live.** sysd derives values in the browser (`calc()`, `pow()`, `round()`, `color-mix()`, `light-dark()`), so that changing an input changes the whole system. Each derived token therefore holds:

- its resolved default value in `$value`, for tools that need a plain value;
- its CSS formula in `$extensions["dev.sysd"].css`, which the build writes into the CSS.

**Naming:** `--sysd-{role}-{variant}`, for example `--sysd-space-2`, `--sysd-fs-3`, `--sysd-accent`. Private, component-internal properties start with `--_`.

**Outputs:**

| File | Contents |
|---|---|
| `dist/tokens.css` | the custom properties, in `@layer sysd.tokens` |
| `dist/tokens.json` | resolved values for the default inputs, for other tools and platforms |

**Tooling:** a small zero-dependency Node script (`scripts/build-tokens.js`). Style Dictionary is the fallback if the needs grow beyond that, for example to export native platform formats.

## Reusable, composable components

Each component ships with:
- its CSS (and, for interactive components, its Lit source);
- a manifest;
- documentation;
- a demo in every state and in both themes.

**CSS-only** components have no JavaScript. **Lit** components are interactive, and **Lit + Zag** components get their behaviour from a Zag machine.

### Layout (CSS-only)

- `<sysd-page>`: the page grid (4 / 8 / 12 columns), margins and maximum width. It also provides the skip link (this one part uses a small script, and is optional).
- `<sysd-section>`: a section of the page.
  - `layout="aside"`: a narrow aside column and a wide main column.
  - `rule`: a strong rule across the top.
  - `tone="graphite | night | forest | umber | deep"`: a negative section.
  - `bleed`: the background runs to the viewport edges.
- `<sysd-aside>`, `<sysd-main>`: the two columns of an aside layout.
- `<sysd-grid>`: a subgrid that passes the columns down. Its children take `span`, `start` and `rows`.
- `<sysd-cols>`: equal columns, `cols="2 md:4 lg:3"`.
- `<sysd-fields>`: modular fields, the columns cut into rows of lines (`field="3"`).
- `<sysd-block>`: places native content on the grid.
- `<sysd-flow>`: vertical rhythm between children (`space="1"`).
- `<sysd-text-columns>`: running text in multiple columns.
- `<sysd-bleed>`: content out to both viewport edges.
- `<sysd-cover>`: an image as the section background, with `<sysd-panel>` for a block of paper on top.
- `<sysd-scope>`, `<sysd-exclude>`: see Coexistence.

### Typography (CSS-only)

- `<sysd-text step="-1…7" variant="label | lead | muted">`: sets the size and style of the native element inside it.
- `<sysd-prose>`: article bodies in plain HTML: headings, paragraphs, lists, links, blockquote and citation, inline code, `hr`, tables, figures.
- `<sysd-code>`: a code block wrapping `<pre><code>`, with optional line numbers. No syntax highlighter is required.
- `<sysd-table>`: wraps a native `<table>`, with numeric columns, a caption, and scrolling on narrow screens.
- `<sysd-note>`: a margin note beside a paragraph.
- Footnotes.
- `<sysd-dropcap>`.

### Content (CSS-only)

- `<sysd-media>`: wraps `<img>` or `<video>`.
  - `ratio="square | portrait | landscape | wide | panorama"`;
  - `fill`: take the height of the grid area instead of a ratio;
  - `treatment="mono | duotone"`;
  - `focus="50% 30%"`: the focal point the crop keeps.
- `<sysd-figure>`: media and a `<figcaption>`, with `caption="below | aside"`.
- `<sysd-card>`.
- `<sysd-entries>` and `<sysd-entry>`: a journal index, with an optional thumbnail.
- `<sysd-quote>`: a quote or testimonial, wrapping `<blockquote>`, with an optional portrait.
- `<sysd-stat>`: a key number with its label.
- `<sysd-tag>`.
- `<sysd-byline>`: author, date and reading time.
- `<sysd-pager>`: previous / next article.
- `<sysd-overprint>` and `<sysd-shape shape="circle | square | triangle | bar" ink="accent | yellow | blue | ink">`.
- `<sysd-footer>`.
- `<sysd-breadcrumbs>`: wraps `<nav><ol>`.

### Interactive (Lit)

- `<sysd-button variant="default | accent | outline | quiet" size="compact">`. It renders an `<a>` when given `href`.
- `<sysd-icon-button label="…">`.
- `<sysd-input>`: text, email, search, number, URL, password; with `label`, `hint`, `error` and `required`.
- `<sysd-textarea>`: grows with its content.
- `<sysd-checkbox>`, `<sysd-radio-group>` with `<sysd-radio>`, `<sysd-switch>`.
- `<sysd-fieldset>`.
- `<sysd-form-errors>`: a summary of the errors in a form, linked to the fields.
- `<sysd-dialog>`: wraps native `<dialog>`.
- `<sysd-disclosure>` and `<sysd-accordion>`: wrap native `<details>`.
- `<sysd-popover>`: wraps native `popover`.
- `<sysd-nav>`: the site navigation; collapses on small screens.
- `<sysd-theme-switch>`: light / dark / system, remembered per reader.
- `<sysd-toc>`: a table of contents built from the article's headings, marking the section being read.

### Interactive (Lit + Zag)

- `<sysd-select>`.
- `<sysd-menu>`.
- `<sysd-tabs>`.
- `<sysd-tooltip>`.

### After 1.0 (Lit + Zag)

- `<sysd-combobox>`.
- `<sysd-date-picker>`.
- `<sysd-toast>`.

### Not planned

Data grid, carousel, rich-text editor, charts.

## Demo pages that show the system in use

Demo pages live in `demo/` and are built only with sysd elements, their attributes, and plain HTML inside `<sysd-prose>`. If a demo needs its own CSS, that is a sign a component is missing, and the component gets made.

- `demo/foundations.html`: the grid, type, space, colour and treatments, with an Adjust panel for the inputs.
- `demo/components.html`: every component in every state (default, hover, focus, active, disabled, error), with and without JavaScript.
- `demo/patterns.html`: the common section layouts.
- `demo/article.html`: a real long-form article that uses every prose element.
- `demo/home.html`: a personal homepage built from the patterns.

Every demo is checked at 390, 820 and 1440 px wide, in light and dark, with the keyboard only, and with the grid overlay (**G**) on. Demos double as the visual regression tests (see How it is maintained).

`prototype/` holds explorations (v1-strict, v2, v3 and others). It is a sketchbook, not part of the package. Ideas graduate from it into `src/`.

## Machine-readable rules

**Component manifests:** one JSON file per component in `manifests/`, validated against `manifests/component.schema.json`. These files are the source. For Lit components, the parts that can be read from the code (properties, events, slots) are taken from it by the Custom Elements Manifest analyser and checked against the manifest. Each manifest lists:

- name, kind (`css-only`, `lit`, `lit+zag`), status (`draft`, `stable`, `deprecated`) and a one-line purpose;
- attributes, with types and allowed values (for example `span`: 1–12 per breakpoint; `ratio`: one of the five proportions; `tone`: one of the five tones);
- events, slots and CSS parts (interactive components);
- required and allowed children, and allowed parents;
- accessibility requirements (for example "needs `label`", "the image inside needs `alt`");
- keyboard behaviour;
- a minimal markup example;
- when to use it and when not to.

**Generated from the manifests:**

- `dist/custom-elements.json`: a [Custom Elements Manifest](https://custom-elements-manifest.open-wc.org/) for every sysd element, CSS-only ones included. Editors, frameworks and documentation tools understand it.
- `dist/html-custom-data.json`: autocomplete and hover documentation for sysd elements and attributes in VS Code and other editors.
- `dist/sysd.md`: a compact, complete guide to the vocabulary for AI authors, given to an agent as context before it builds a page.
- TypeScript declarations for the interactive components.

**Checks**, which make "constrained enough that it can verify when they do" real:

- **HTML:** `scripts/check-html.js` reads the manifests and reports:
  - unknown sysd elements and attributes;
  - values outside their allowed range;
  - missing labels and alt text;
  - elements placed in parents they don't belong in.

  The same rules run in the browser in `sysd-dev.js`.
- **CSS:** a Stylelint config (`stylelint.config.js`) for consuming projects. It allows only sysd tokens for colour, space, font size and radius, and only the `sysd` layer and its sub-layers.

The checks verify the vocabulary, not the taste. Whether a composition is good remains a human judgement, which the documentation's dos and don'ts support.

## Human-readable documentation

A documentation site in `docs/`, built with sysd itself and generated from the manifests, so the documentation can't drift from the code. Per component:

- what it is for, when to use it and when not to;
- anatomy: the parts, their slots and CSS parts;
- live examples with copyable markup;
- attributes and their allowed values;
- events (interactive components);
- states;
- keyboard and screen reader behaviour;
- browser notes and fallbacks;
- dos and don'ts, shown as rendered examples.

The site also contains:
- **foundations pages:** the line, the grid, type, colour, space, images;
- **principles:** the ones above, illustrated;
- **getting started:** how to add sysd to a plain HTML page and to a framework project;
- **decisions:** short decision records in `docs/decisions/NNN-title.md`, saying what was decided, why, and what was rejected. Examples: "no baseline grid", "CSS-only elements for layout, Lit for interaction", "Zag for complex behaviour", "dark is never black";
- **changelog.**

## Distribution

| File | Contents |
|---|---|
| `dist/sysd.css` | tokens, base and every CSS-only element, styling the whole document. Use it with a single `<link>`. |
| `dist/sysd-scoped.css` | the same, with element styles scoped to `<sysd-scope>`, for pages shared with other systems |
| `dist/components/*.js` | interactive components as ES modules, one file per component, sharing a single bundled copy of Lit. Usable straight from a CDN, with no build step. |
| `dist/sysd.js` | loads and registers every interactive component, for pages that want them all |
| `dist/sysd-dev.js` | the dev-mode audit |
| `dist/custom-elements.json`, `dist/html-custom-data.json`, `dist/sysd.md`, `dist/tokens.json` | the machine-readable outputs |

The npm package also ships the unbundled ES modules, with Lit and Zag as normal dependencies, for projects that use a bundler. It is published under a name still to be decided, and is therefore also available from a CDN such as jsDelivr.

Consumers override sysd by putting their own CSS in a later layer than `sysd`, never by fighting specificity. Interactive components can also be styled from outside through their CSS parts (`::part()`) and tokens.

## How it is maintained

- **One source of truth.** The tokens JSON and the component manifests. The CSS token file, `tokens.json`, `custom-elements.json`, the AI guide and the documentation are generated from them or checked against them.
- **Semantic versioning.**
  - Patch: fixes.
  - Minor: new components, tokens or variants.
  - Major: renamed or removed elements, attributes or tokens, or changed defaults.
  - Every release has a changelog entry.
- **Deprecation before removal.** A deprecated element, attribute or token keeps working for at least one minor version. The HTML checker and `sysd-dev.js` warn about it and name the replacement.
- **Automated checks on every change** (GitHub Actions):
  - Stylelint;
  - manifest validation against the schema, and against the Lit source;
  - unit tests of the interactive components in real browsers (keyboard, focus, form behaviour);
  - the HTML checker on all demos;
  - an accessibility scan (axe) of all demos in both themes;
  - visual regression screenshots of the demos at 390 / 820 / 1440 px, in light and dark (Playwright).
- **Few inputs, derived values and cascade layers.** These keep the system small enough for one person to maintain: most changes are a change to an input or a formula, not to many hand-set values.
- **The repository layout:**

```
tokens/          primitive.tokens.json, semantic.tokens.json   (source)
manifests/       one JSON per component + component.schema.json (source)
src/css/         reset, base, layout; elements/*.css for the CSS-only elements
src/components/  interactive components: one folder each (Lit source, styles, tests)
src/controllers/ shared Lit controllers, including the Zag controller
scripts/         build-tokens, build-placement (the span/start/rows CSS), build-docs, check-html
demo/            demo pages
docs/            documentation site, decisions/
dist/            built output (generated, not edited by hand)
prototype/       explorations, not part of the package
```

## Status and next steps

- `prototype/v3` (`index.html` for the foundations, `patterns.html` for the section layouts) is the visual reference: the strict Müller-Brockmann direction the system is built on.
  - It is written with classes, not elements; the move to elements happens as part of the build-out.
  - `v1-strict` and `v2` are kept for reference. v2 holds the motion experiment.
- Motion and animation are deferred until the static system is done.
- Next, in this order:
  1. the token files and `build-tokens`;
  2. `src/css` split into layers, all nested under `sysd`, with the scoped build;
  3. the CSS-only elements, ported from v3, and the generated placement CSS;
  4. a spike to prove the stack: Lit, a Zag machine and shadow DOM in one component (`<sysd-tabs>` or `<sysd-select>`), tested with VoiceOver and NVDA;
  5. the remaining interactive components;
  6. the manifests and their schema, `check-html` and `sysd-dev.js`;
  7. the demo pages, rebuilt on `dist/`, including the coexistence demo;
  8. the docs.
