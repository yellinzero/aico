# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in the `apps/web/` directory.

## About @the-aico/web

**@the-aico/web** is the official website for aico (the-aico.com), a documentation site for browsing and installing AI employees. The site provides documentation, employee listings, and skill references.

---

## General Practices

- Use TypeScript strict mode; avoid `any` type.
- Follow Next.js App Router conventions for pages and layouts.
- Use `cn()` utility from `lib/utils.ts` for conditional class names.
- All user-facing text should use `next-intl` for internationalization.

## Tech Stack

| Category      | Technology   | Version |
| ------------- | ------------ | ------- |
| Framework     | Next.js      | 15      |
| UI Library    | React        | 19      |
| Styling       | Tailwind CSS | 4       |
| i18n          | next-intl    | 4.7+    |
| Content       | MDX          | -       |
| UI Primitives | Radix UI     | -       |
| Command Menu  | cmdk         | 1.0     |
| Theme         | next-themes  | -       |
| URL State     | nuqs         | 2.0     |

## Project Structure

```
apps/web/
├── app/                     # Next.js App Router
│   ├── [locale]/           # Internationalized routes
│   │   ├── page.tsx        # Home page
│   │   ├── docs/           # Documentation pages
│   │   ├── employees/      # Employee listing & detail
│   │   └── skills/         # Skills listing & detail
│   ├── layout.tsx          # Root layout
│   ├── sitemap.ts          # Sitemap generation
│   └── robots.ts           # Robots.txt
├── components/
│   ├── ui/                 # Base UI components
│   ├── layout/             # Layout components (header, footer)
│   ├── docs/               # Documentation components
│   ├── employees/          # Employee-related components
│   └── skills/             # Skills-related components
├── content/docs/           # MDX documentation files
├── i18n/                   # Internationalization config
├── lib/                    # Utility functions
├── messages/               # Translation files (en.json, zh.json)
├── public/                 # Static assets
└── middleware.ts           # Locale middleware
```

## Common Commands

```bash
# Development
pnpm --filter=@the-aico/web dev     # Start dev server (port 3000)
pnpm --filter=@the-aico/web build   # Build for production
pnpm --filter=@the-aico/web start   # Start production server
pnpm --filter=@the-aico/web lint    # Run linter
```

## Adding New Pages

### Standard Page Structure

```tsx
// app/[locale]/example/page.tsx
import { getTranslations } from 'next-intl/server';

interface PageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: PageProps) {
  const t = await getTranslations({
    locale: params.locale,
    namespace: 'Example',
  });
  return { title: t('title') };
}

export default async function ExamplePage({ params }: PageProps) {
  const t = await getTranslations({
    locale: params.locale,
    namespace: 'Example',
  });
  return <div>{t('content')}</div>;
}
```

### Adding Translations

1. Add keys to `messages/en.json`:

```json
{
  "Example": {
    "title": "Example Page",
    "content": "Page content here"
  }
}
```

2. Add corresponding keys to `messages/zh.json`:

```json
{
  "Example": {
    "title": "示例页面",
    "content": "页面内容"
  }
}
```

## Adding New Components

### Component Structure

```tsx
// components/example/example-component.tsx
import { cn } from '@/lib/utils';

interface ExampleComponentProps {
  className?: string;
  children: React.ReactNode;
}

export function ExampleComponent({
  className,
  children,
}: ExampleComponentProps) {
  return <div className={cn('base-classes', className)}>{children}</div>;
}
```

### UI Component Conventions

- Base UI components go in `components/ui/`
- Follow shadcn/ui + Tailwind patterns
- Export components as named exports
- Support `className` prop for customization

## Internationalization (i18n)

### Supported Locales

| Locale | Language          |
| ------ | ----------------- |
| `en`   | English (default) |
| `zh`   | Chinese           |

### Using Translations

**In Server Components:**

```tsx
import { getTranslations } from 'next-intl/server';

export default async function Page({ params }: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: params.locale,
    namespace: 'Namespace',
  });
  return <p>{t('key')}</p>;
}
```

**In Client Components:**

```tsx
'use client';
import { useTranslations } from 'next-intl';

export function Component() {
  const t = useTranslations('Namespace');
  return <p>{t('key')}</p>;
}
```

## Documentation (MDX)

### Adding New Documentation

1. Create MDX file in `content/docs/`:

```mdx
---
title: 'Page Title'
description: 'Page description'
---

# Heading

Content here...
```

2. The file path determines the URL route.

### MDX Features

- Syntax highlighting via `shiki` + `rehype-pretty-code`
- Auto-generated heading links via `rehype-slug` + `rehype-autolink-headings`
- Support for custom components

## Registry Integration

### Fetching Employee/Skill Data

```tsx
import { getEmployees, getSkills } from '@/lib/registry';

// In a server component
const employees = await getEmployees();
const skills = await getSkills();
```

Registry JSON files are located at `../../registry/`.

## File Naming Conventions

| Type       | Convention                   | Example                       |
| ---------- | ---------------------------- | ----------------------------- |
| Components | kebab-case                   | `employee-card.tsx`           |
| Pages      | `page.tsx` in route folder   | `app/[locale]/docs/page.tsx`  |
| Layouts    | `layout.tsx` in route folder | `app/[locale]/layout.tsx`     |
| Utilities  | kebab-case                   | `lib/utils.ts`                |
| Types      | PascalCase for interfaces    | `interface EmployeeCardProps` |

## Common Pitfalls

1. **Missing translations**: Always add keys to both `en.json` and `zh.json`.
2. **Wrong import path**: Use `@/` alias for imports from project root.
3. **Client/Server mismatch**: Use `useTranslations` in client components, `getTranslations` in server components.
4. **Missing metadata**: Always include `generateMetadata` for SEO.
5. **Hardcoded strings**: All user-facing text should use i18n.

## Related Documentation

- Root project: See `../../CLAUDE.md`
- Registry data: See `../../registry/`
- Employee definitions: See `../../employees/`

---

_This documentation should be updated when adding new features or patterns to the website._
