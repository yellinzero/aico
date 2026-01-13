# Design System

> Project: aico
> Created: 2026-01-11
> Last Updated: 2026-01-11

## Color System

OKLCH color space theme system based on shadcn/ui.

### CSS Variables (Light Mode)

```css
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}
```

### CSS Variables (Dark Mode)

```css
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.269 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.371 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.439 0 0);
}
```

### Color Convention

Using `background` and `foreground` convention:

- `background` for component background color
- `foreground` for text color
- When variable is used for background, omit `background` suffix

```tsx
// Example usage
<div className="bg-primary text-primary-foreground">Hello</div>
<div className="bg-muted text-muted-foreground">Muted text</div>
```

## Typography

### Font Family

```css
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'Fira Code', monospace;
```

### Font Size Scale

| Token | Size     | Pixels |
| ----- | -------- | ------ |
| xs    | 0.75rem  | 12px   |
| sm    | 0.875rem | 14px   |
| base  | 1rem     | 16px   |
| lg    | 1.125rem | 18px   |
| xl    | 1.25rem  | 20px   |
| 2xl   | 1.5rem   | 24px   |
| 3xl   | 1.875rem | 30px   |
| 4xl   | 2.25rem  | 36px   |

### Font Weight

| Token    | Weight |
| -------- | ------ |
| normal   | 400    |
| medium   | 500    |
| semibold | 600    |
| bold     | 700    |

### Line Height

| Token   | Value |
| ------- | ----- |
| tight   | 1.25  |
| normal  | 1.5   |
| relaxed | 1.75  |

## Spacing

### Scale

| Token | Size    | Pixels |
| ----- | ------- | ------ |
| 0     | 0       | 0      |
| 1     | 0.25rem | 4px    |
| 2     | 0.5rem  | 8px    |
| 3     | 0.75rem | 12px   |
| 4     | 1rem    | 16px   |
| 5     | 1.25rem | 20px   |
| 6     | 1.5rem  | 24px   |
| 8     | 2rem    | 32px   |
| 10    | 2.5rem  | 40px   |
| 12    | 3rem    | 48px   |
| 16    | 4rem    | 64px   |

### Border Radius

| Token | Size     | Pixels |
| ----- | -------- | ------ |
| none  | 0        | 0      |
| sm    | 0.125rem | 2px    |
| md    | 0.375rem | 6px    |
| lg    | 0.5rem   | 8px    |
| xl    | 0.75rem  | 12px   |
| 2xl   | 1rem     | 16px   |
| full  | 9999px   | -      |

Default radius: `--radius: 0.625rem` (10px)

## Effects

### Shadow

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

### Transition

```css
--transition-fast: 150ms ease-out;
--transition-normal: 200ms ease-out;
--transition-slow: 300ms ease-out;
```

## Breakpoints

| Token | Width  |
| ----- | ------ |
| sm    | 640px  |
| md    | 768px  |
| lg    | 1024px |
| xl    | 1280px |
| 2xl   | 1536px |

## Component Tokens

### Button

| Property      | Value |
| ------------- | ----- |
| height-sm     | 32px  |
| height-md     | 40px  |
| height-lg     | 48px  |
| padding-x     | 16px  |
| border-radius | md    |

### Input

| Property      | Value           |
| ------------- | --------------- |
| height        | 40px            |
| padding-x     | 12px            |
| border-radius | md              |
| border-color  | var(--border)   |
| focus-ring    | 2px var(--ring) |

### Card

| Property      | Value       |
| ------------- | ----------- |
| padding       | 24px        |
| border-radius | lg          |
| background    | var(--card) |
| shadow        | sm          |

## Usage with Tailwind CSS

```tsx
// Using CSS variables
<div className="bg-background text-foreground" />
<div className="bg-primary text-primary-foreground" />
<div className="bg-muted text-muted-foreground" />
<div className="bg-accent text-accent-foreground" />
<div className="bg-destructive text-destructive-foreground" />

// Border and input
<div className="border-border" />
<input className="border-input focus:ring-ring" />

// Card and popover
<div className="bg-card text-card-foreground" />
<div className="bg-popover text-popover-foreground" />
```
