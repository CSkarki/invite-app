---
name: design
description: Guides visual and product design decisions including design systems, typography, color, and layout. Use when defining or applying design tokens, building design systems, or when the user asks about visual design, styling, or design consistency.
---

# Design Skill

Apply when defining or implementing visual design and design systems.

## Design Systems

- Use tokens for color, typography, spacing, and radius; avoid magic numbers in components.
- Document token names and usage; keep a single source of truth (e.g. CSS variables, theme file).
- Components consume tokens, not raw values.

## Typography

- Clear type scale (e.g. 12–14–16–18–24–32); limit number of sizes.
- Line height 1.2–1.5 for body; tighter for headings.
- Font weights for hierarchy (e.g. regular, medium, semibold); avoid too many weights.

## Color

- Semantic names (e.g. text-primary, bg-surface, border-default) over raw hex in UI.
- Light/dark variants if the product supports themes.
- Use palette for accents; keep contrast and accessibility in mind.

## Layout & Spacing

- Consistent spacing scale (e.g. 4, 8, 12, 16, 24, 32, 48).
- Align to grid where it helps; use flex/grid for composition.
- Consistent max-widths and gutters for content areas.

## Checklist

- [ ] New styles use design tokens, not one-off values
- [ ] Type scale and spacing scale are consistent
- [ ] Color usage is semantic and accessible
- [ ] Layout follows existing patterns in the project
