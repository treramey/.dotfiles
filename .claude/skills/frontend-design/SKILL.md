---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces. Use when building web components, pages, or applications with React-based frameworks. Includes Tailwind CSS v4, shadcn/ui components, Motion animations.
---

# Frontend Design

Create distinctive, production-grade interfaces avoiding generic "AI slop" aesthetics.

## When to Use

- Building UI with React frameworks (Next.js, Vite, Remix)
- Creating visually distinctive, memorable interfaces
- Implementing accessible components with shadcn/ui
- Styling with Tailwind CSS v4
- Adding animations and micro-interactions

## Design Thinking

Before coding, commit to BOLD aesthetic direction:

- **Purpose**: What problem? Who uses it?
- **Tone**: Pick extreme - brutally minimal, maximalist, retro-futuristic, organic, luxury, playful, editorial, brutalist
- **Differentiation**: What makes this UNFORGETTABLE?

## Anti-Patterns (NEVER)

- Overused fonts: Inter, Roboto, Arial, system fonts, Space Grotesk
- Cliched colors: purple gradients on white
- Predictable layouts and component patterns
- Generic AI-generated aesthetics

## Best Practices

1. **Accessibility First**: Radix primitives, focus states, semantic HTML
2. **Mobile-First**: Start mobile, layer responsive variants
3. **Design Tokens**: Use `@theme` for spacing, colors, typography
4. **Dark Mode**: Apply dark variants to all themed elements
5. **Performance**: Automatic CSS purging, avoid dynamic class names

## Core Stack

**Tailwind v4.1**: CSS-first config via `@theme`. Single `@import "tailwindcss"`. OKLCH colors.

**shadcn/ui v3.6**: Copy-paste Radix components. Visual styles: Vega/Nova/Maia/Lyra/Mira.

**Motion**: `import { motion, AnimatePresence } from 'motion/react'`. Use `tailwindcss-animate` for shadcn states.

## Typography

```css
@theme {
  --font-display: "Playfair Display", serif;
  --font-body: "Source Sans 3", sans-serif;
}
```

## Color (OKLCH)

```css
@theme {
  --color-primary-500: oklch(0.55 0.22 264);
  --color-accent: oklch(0.75 0.18 45);
}
```

## Motion

```tsx
import { motion, AnimatePresence } from 'motion/react';

<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} />
```
