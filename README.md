# Billion Second Birthday

Find out exactly when you turn **1,000,000,000 seconds old**.

Enter your birth date, optional time, and timezone — and the calculator tells you your billionth second birthday to the second, accounting for leap years and leap seconds.

## Features

- Live age-in-seconds counter (updates every 50ms)
- Accurate leap second calculation (all 27 UTC leap seconds since 1972)
- Arbitrary IANA timezone support
- Add to Google Calendar or download a `.ics` file (for future billionth seconds)
- Share via Web Share API or clipboard fallback
- Localized for 19 languages with RTL support (Arabic)
- Accessible (WCAG-compliant, ARIA, keyboard navigation)
- Mobile-friendly dark UI

## Tech Stack

- [Svelte 5](https://svelte.dev) + TypeScript
- [Vite](https://vitejs.dev)
- [Tailwind CSS v4](https://tailwindcss.com)

## Development

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
pnpm preview
```
