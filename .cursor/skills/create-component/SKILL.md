---
name: create-component
description: Generates new React components following Turnify portal patterns and conventions. Use when creating React components, modals, forms, dashboard widgets, or returns components.
---

# Create Component Skill

Generates new React components following Turnify portal patterns and conventions.

## Description

This skill creates new React components with proper TypeScript types, consistent styling, and follows the established patterns in the Turnify B2B Return Portal. It generates both the component file and optional test file.

## Use Cases

- "Create a new React component"
- "Generate a returns component"
- "Create a modal component"
- "Generate a dashboard widget"
- "Create a form component"

## Requirements

- Node.js installed
- Project uses TypeScript
- Components directory: `src/components/`

## Script

Ref: scripts/create_component.ts

## Parameters

- `--name <ComponentName>` - Component name (required, PascalCase)
- `--type <type>` - Component type: page | modal | widget | form (default: page)
- `--with-tests` - Generate test file
- `--functional` - Use functional component (default)
- `--class` - Use class component

## Output

Creates:
- `src/components/ComponentName.tsx` - Component file
- `src/components/ComponentName.test.tsx` - Test file (if --with-tests)

## Examples

```bash
# Create a simple page component
npx ts-node scripts/create_component.ts --name ReturnHistory

# Create a modal component
npx ts-node scripts/create_component.ts --name ApprovalModal --type modal

# Create a widget with tests
npx ts-node scripts/create_component.ts --name StatsWidget --type widget --with-tests

# Create a form component
npx ts-node scripts/create_component.ts --name CreateReturnForm --type form
```

## Component Types

- **page**: Full-page component with header/footer
- **modal**: Modal dialog component
- **widget**: Dashboard widget/card component
- **form**: Form component with validation

## Features

- TypeScript by default
- Props interface auto-generated
- Tailwind CSS classes included
- Lucide icons import
- Follows existing patterns
- Type-safe
