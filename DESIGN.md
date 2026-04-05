```markdown
# Design System Document: The High-End Editorial Framework

## 1. Overview & Creative North Star
**Creative North Star: The Silent Curator**

This design system is not a mere utility; it is a digital sanctuary. It rejects the frantic, high-contrast energy of standard SaaS interfaces in favor of a "Quiet Archivist" aesthetic—a sophisticated, submerged environment that prioritizes deep focus and scholarly elegance. 

We break the "template" look by treating the screen like a boutique editorial layout rather than a software grid. By utilizing intentional asymmetry, oversized serif typography, and a "Tonal Layering" approach to depth, we create an experience that feels curated, permanent, and premium. The goal is to make the user feel as though they are navigating a private, well-lit library at midnight.

---

## 2. Colors & Surface Philosophy
The color palette is rooted in a near-black charcoal with a "living" forest undertone (`#0b0f0e`). This provides more soul than a neutral grey and less fatigue than pure black.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined through background color shifts. 
- To separate a sidebar from a main feed, use `surface-container-low` against the `surface` background. 
- To highlight a specific section, use a subtle shift to `surface-container-high`.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of heavy, dark cardstock.
- **Layer 0 (Base):** `surface` or `surface-dim` (`#0b0f0e`).
- **Layer 1 (Main Content Area):** `surface-container-low`.
- **Layer 2 (Interactive Cards/Modals):** `surface-container`.
- **Layer 3 (Floating Elements):** `surface-container-high`.

### The "Glass & Gradient" Rule
To avoid a flat "flat-design" feel, utilize semi-transparent surface colors with `backdrop-blur` (12px–20px) for floating navigation or overlays. For primary CTAs or high-impact hero sections, use subtle linear gradients transitioning from `primary` (`#b9cbc0`) to `primary-container` (`#46564e`). This adds a "lithographic" quality to the interface.

---

## 3. Typography
The typography is the voice of the system: authoritative yet rhythmic.

- **The Serif (Newsreader):** Used for all `display`, `headline`, `title`, and `body` scales. It provides the "Archivist" soul. Newsreader's optical sizing makes long-form reading feel like a physical book.
- **The Sans-Serif (Manrope):** Reserved strictly for `label` scales. Its geometric clarity provides a modern, functional counterpoint to the romanticism of the serif.

**Editorial Hierarchy:**
- **Display-LG (3.5rem):** Should be used with generous letter-spacing (-0.02em) and significant leading to anchor the page.
- **Body-LG (1rem):** Optimized for long-form reading. Use a line height of 1.6 to ensure the deep background doesn't "swallow" the text.

---

## 4. Elevation & Depth
In this system, depth is "carved" rather than "projected."

- **The Layering Principle:** Stacking is our primary tool. A `surface-container-lowest` card placed on a `surface-container-low` section creates a natural "recessed" look without a single shadow.
- **Ambient Shadows:** When an element must float (e.g., a dropdown), shadows must be extra-diffused. 
    - **Color:** Use a tinted shadow (e.g., `#000000` at 30% opacity with a slight green tint).
    - **Blur:** Minimum 24px blur with 0px spread.
- **The "Ghost Border" Fallback:** If a border is required for accessibility, it must be the `outline-variant` token (`#414a47`) at 15% opacity. Never use 100% opaque borders.
- **Glassmorphism:** Navigation bars should use the `surface` color at 70% opacity with a high-density blur. This allows the subtle forest undertones of the content below to bleed through, maintaining a sense of place.

---

## 5. Components

### Buttons
- **Primary:** Background: `primary` (`#b9cbc0`), Text: `on-primary` (`#34443c`). Shape: `md` (0.375rem).
- **Secondary:** Background: `secondary-container`, Text: `on-secondary-container`. 
- **Tertiary:** No background. Text: `primary`. Hover state uses a 5% `primary` tint overlay.

### Input Fields
- **Styling:** Forgo the four-sided box. Use a `surface-container-highest` background with a `sm` (0.125rem) corner radius.
- **Indicator:** Instead of a thick border on focus, use a 2px bottom-accent in `primary`.

### Cards & Lists
- **The "No-Divider" Rule:** Forbid the use of horizontal rules (`<hr>`). 
- **Separation:** Use vertical white space (32px or 48px) or a subtle background shift to `surface-container-low`.
- **Lists:** Use `Newsreader Title-MD` for list headers to maintain the editorial feel.

### Tooltips & Overlays
- **Styling:** Use `inverse-surface` with `inverse-on-surface` text. The high contrast ensures these small functional elements are not lost in the "Quiet" atmosphere.

---

## 6. Do's and Don'ts

### Do:
- **Embrace Asymmetry:** Align text to the left but allow large imagery or pull-quotes to break the grid and bleed into the margins.
- **Prioritize Negative Space:** In this system, "empty" space is a luxury. Treat it as a deliberate design element.
- **Use Tonal Precision:** Ensure that `on-surface-variant` is used for secondary text to maintain a soft, legible hierarchy that doesn't compete with primary headers.

### Don't:
- **Don't use pure white:** The contrast against the `#0b0f0e` background will cause eye strain. Always use `on-surface` (`#dee7e4`).
- **Don't use standard shadows:** Avoid the "dirty" look of default grey shadows. If it's not tinted with the background green, it doesn't belong.
- **Don't use vibrant greens:** If a green feels "neon," it’s wrong. The palette must remain desaturated, leaning toward sage, mint, and charcoal.
- **Don't use dividers:** If you find yourself reaching for a divider line, increase the padding by 16px instead.