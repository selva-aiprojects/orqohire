# UI/UX Pro Max Skill & Design Intelligence (OrqoHire)

Based on [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), this skill defines our core design reasoning engine, visual hierarchy rules, and strict pre-delivery quality checks for OrqoHire.

---

## 1. Design System Rules (Soft UI Evolution & Premium Clean SaaS)

### Color Palette & Tokens
- **Primary / Brand**: Vibrant Coral (`#FF5A36`) with subtle gradient transitions (`#E04825`).
- **Core Surfaces**: Clean Slate & Deep Obsidian (`#0F172A`, `#1E293B`) for accents and sidebars. Warm crisp background (`#F8FAFC`).
- **Contrast & Accessibility**: Maintain WCAG AA compliance (4.5:1 minimum text contrast). Avoid harsh pure black (`#000000`) on bright white.

### Typography Hierarchy
- **Primary UI Font**: Plus Jakarta Sans / DM Sans (`--font-sans`).
- **Headings & Data Metrics**: Space Grotesk (`--font-heading`) for bold, structured technical tracking.
- **Code & Identifiers**: JetBrains Mono (`--font-mono`).

---

## 2. Component & Interactive Principles

### Hover States & Micro-Animations
- **Smooth Transitions**: All interactive elements (buttons, cards, rows, badges) must transition smoothly (150ms - 300ms duration).
- **Hover Elevation**: Cards and interactive panels elevate with subtle drop shadows (`shadow-cardHover`) and slight vertical lift (`-translate-y-0.5` or `-translate-y-1`).
- **Focus Rings**: Accessible and visually distinct focus rings (`focus:ring-4 focus:ring-coral/10`) on inputs and buttons.

### Glassmorphic & Depth Layering
- Use intentional depth layering: Ambient background glow, soft blur backdrops (`backdrop-blur-md bg-white/80 border border-white/20`), and subtle borders. Avoid flat, lifelss containers.

---

## 3. Pre-Delivery Quality Checklist (UI/UX Pro Max)

Every page and UI refactoring must strictly satisfy the following criteria:
- [ ] **No Emojis as UI Icons**: Always use professional vector SVG icons (e.g., `lucide-react`).
- [ ] **Interactive Cursors**: Explicit `cursor-pointer` on all clickable buttons, cards, tabs, and links.
- [ ] **Smooth Transitions**: Hover states must animate smoothly without harsh visual jumps.
- [ ] **Clean Layout & Spacing**: Generous padding (`p-6` or `p-8`), rounded card boundaries (`rounded-card`), and consistent grid gaps (`gap-4`, `gap-6`).
- [ ] **Responsive & Adaptive Layout**: Grid layouts must degrade gracefully across mobile (`grid-cols-1`), tablet (`md:grid-cols-2`), and desktop (`lg:grid-cols-4`).
- [ ] **Data State Polish**: Tables and lists must display clear empty states, loading shimmer skeletons (`animate-shimmer`), and status badges with rounded pill formatting (`rounded-pill`).

---

## 4. Anti-Patterns to Avoid
- ❌ **Inline Styles**: Do not use ad-hoc `style={{ ... }}` for layout or theming. Rely on design system tokens and Tailwind classes.
- ❌ **Harsh Animations**: Avoid jittery or abrupt CSS changes.
- ❌ **Generic Colors & Borders**: Avoid plain primary blue or harsh red boxes. Use harmonious soft backgrounds (`#EEF2FF`, `#ECFDF5`, `#FFFBEB`) with soft border tints.
