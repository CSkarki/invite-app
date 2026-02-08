---
name: ui-ux
description: Guides UI and UX decisions for interfaces and components. Use when designing UI, building components, reviewing interfaces, improving accessibility, or when the user asks about design, layout, or user experience.
---

# UI/UX Skill

Apply these principles when designing or implementing user interfaces.

## Core Principles

1. **Accessibility**
   - Semantic HTML; use landmarks (header, main, nav, footer).
   - Sufficient color contrast (WCAG AA minimum).
   - Focus states visible; keyboard navigable.
   - Labels for form inputs; `aria-*` when semantics aren’t enough.

2. **Consistency**
   - Reuse existing components and patterns.
   - Same actions use same controls and placement.
   - Align spacing, typography, and colors with the design system or globals.

3. **Feedback**
   - Loading and disabled states for async actions.
   - Clear success/error messages; inline validation where helpful.
   - Destructive actions use confirmation when appropriate.

4. **Hierarchy**
   - Clear heading levels; one `h1` per view.
   - Visual hierarchy via size, weight, and spacing.
   - Group related content; use whitespace to separate sections.

5. **Responsive**
   - Mobile-first or fluid layouts; avoid hard-coded widths where possible.
   - Touch targets at least 44×44px on touch devices.
   - Test at small and large viewports.

## Quick Checklist

When building or reviewing UI:

- [ ] Keyboard navigable; focus order makes sense
- [ ] Form fields have visible labels
- [ ] Errors and loading states are handled
- [ ] Layout works at 320px and up
- [ ] No reliance on color alone for meaning
- [ ] Interactive elements have clear hover/focus states

## Output Style

- Prefer concrete suggestions (e.g. “Add `aria-label` to this button”) over vague advice.
- When proposing changes, reference the principle (e.g. “Accessibility: …”).
- If the project has design tokens or a component library, align recommendations with them.
