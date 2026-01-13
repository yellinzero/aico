# Frontend Constraints

> Project: aico
> Created: 2026-01-11
> Last Updated: 2026-01-11

## Tech Stack

### Framework

- **Framework**: Next.js 16.0.10 (App Router)
- **Language**: TypeScript 5.x (strict mode)
- **React**: React 19.2.3
- **Build Tool**: Turbopack (experimental)
- **Package Manager**: pnpm 9.0.6

### Styling

- **CSS Framework**: Tailwind CSS 4.1.11
- **PostCSS**: @tailwindcss/postcss
- **Color Space**: OKLCH
- **Component Library**: shadcn/ui (Radix UI)
- **Icons**: Lucide React
- **Variants**: class-variance-authority (CVA)

### State Management

- **Local State**: React useState/useReducer
- **Server State**: TanStack Query (React Query)
- **Global State**: Zustand (if needed)

### Forms & Validation

- **Form Library**: React Hook Form 7.62.0 / TanStack React Form 1.20.0
- **Validation**: Zod 3.25.76
- **Table**: TanStack React Table 8.9.1

### Testing

- **Unit Testing**: Vitest + React Testing Library
- **E2E Testing**: Playwright
- **Coverage Target**: 80%

### Code Quality

- **Linting**: ESLint 9.x (flat config)
- **Formatting**: Prettier 3.4.2
- **Import Sorting**: eslint-plugin-import
- **Tailwind Sorting**: prettier-plugin-tailwindcss

## Directory Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── (routes)/        # Route groups
│   ├── api/             # API routes
│   └── layout.tsx       # Root layout
├── components/          # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   └── [Feature]/       # Feature-specific components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
│   └── utils.ts         # cn() helper and utilities
├── registry/            # Component registry (if applicable)
├── services/            # API services
├── stores/              # State stores (Zustand)
├── types/               # TypeScript types
├── styles/              # Global styles
│   └── globals.css      # CSS variables and base styles
└── content/             # MDX content (if applicable)
```

## Naming Conventions

### Files

- Components: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useAuth.ts`)
- Utils: `camelCase.ts` (e.g., `formatDate.ts`)
- Types: `camelCase.ts` (e.g., `user.ts`)
- Tests: `[name].test.tsx` (e.g., `UserProfile.test.tsx`)

### Components

- Component names: PascalCase
- Props interface: `[ComponentName]Props`
- Event handlers: `handle[Event]` (e.g., `handleClick`)
- Boolean props: `is/has/should` prefix (e.g., `isLoading`)

### CSS Classes

- Use Tailwind utility classes
- Custom classes: kebab-case
- Component variants: use `cva` (class-variance-authority)

## Code Patterns

### Component Structure

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline';
}

export function Component({
  className,
  variant = 'default',
  ...props
}: ComponentProps) {
  return (
    <div
      className={cn(
        'base-classes',
        variant === 'outline' && 'outline-classes',
        className
      )}
      {...props}
    />
  );
}
```

### Custom Hooks

```tsx
export function useCustomHook() {
  const [data, setData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  // Effects and callbacks

  return { data, isLoading, error };
}
```

### API Calls with TanStack Query

```tsx
import { useQuery, useMutation } from '@tanstack/react-query';

// Query
const { data, isLoading, error } = useQuery({
  queryKey: ['resource', id],
  queryFn: () => fetchResource(id),
});

// Mutation
const mutation = useMutation({
  mutationFn: updateResource,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['resource'] });
  },
});
```

### Form with React Hook Form + Zod

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    // Handle submit
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>{/* Form fields */}</form>
  );
}
```

## Component Guidelines

### Accessibility

- All interactive elements must be keyboard accessible
- Use semantic HTML elements
- Include ARIA labels where needed
- Ensure color contrast meets WCAG AA
- Use Radix UI primitives for complex interactions

### Performance

- Use `React.memo` for expensive components
- Use `useMemo` and `useCallback` appropriately
- Lazy load routes and heavy components
- Optimize images with `next/image`
- Use React Server Components where possible

### Error Handling

- Always handle loading, error, and empty states
- Use Error Boundaries for component errors
- Show user-friendly error messages
- Use Sonner for toast notifications

## shadcn/ui Configuration

### components.json

```json
{
  "style": "new-york",
  "rsc": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

### Adding Components

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add form
```

## Testing Requirements

### Unit Tests

- Test component rendering
- Test user interactions
- Test edge cases (loading, error, empty)
- Mock external dependencies

### E2E Tests

- Test critical user flows
- Test form submissions
- Test navigation

## Git Conventions

### Commit Messages

```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Scope: component name or feature area
```

### Branch Naming

```
feature/[feature-name]
fix/[bug-description]
refactor/[area]
```

## Dependencies

### Approved Packages

- `date-fns` for date manipulation
- `zod` for validation
- `react-hook-form` for forms
- `@tanstack/react-query` for server state
- `@tanstack/react-table` for tables
- `recharts` for charts
- `embla-carousel-react` for carousels
- `@dnd-kit/core` for drag and drop

### Avoid

- moment.js (use date-fns instead)
- jQuery (use React patterns)
- CSS-in-JS runtime libraries (use Tailwind)
- Legacy class components (use functional components)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Requires CSS custom properties support
- Requires OKLCH color space support
- No IE 11 support

## Development Commands

```bash
# Development
pnpm dev              # Start dev server (Turbopack)
pnpm build            # Production build
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm typecheck        # Run TypeScript check
pnpm format:write     # Format with Prettier

# Testing
pnpm test             # Run unit tests
pnpm test:e2e         # Run E2E tests

# Components
pnpm registry:build   # Build component registry
```
