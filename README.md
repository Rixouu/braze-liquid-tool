# 💧 Braze Liquid Tool

**Braze Liquid Tool** is a **Progressive Web App (PWA)** and web app for marketers and developers to author and test [Liquid](https://shopify.github.io/liquid/) templates the way you use them in **Braze**: browse sample templates, edit with Liquid-aware highlighting, inject sample JSON, and preview rendered output in real time. Over **HTTPS**, you can **install** it (Chromium: use the bottom install bar or the browser’s install menu; **iOS Safari**: Share → **Add to Home Screen**) for a standalone window, faster return visits, and **offline** use of precached static assets via the service worker.

The product direction, UX, and implementation are led by [Jonathan Rycx](https://github.com/Rixouu).

[![React 18](https://img.shields.io/badge/React-18.3-blue)](https://react.dev/)
[![Vite 6](https://img.shields.io/badge/Vite-6.4-yellow)](https://vitejs.dev/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.6-3178c6)](https://www.typescriptlang.org/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-4.2-38bdf8)](https://tailwindcss.com/)
[![React Router 6](https://img.shields.io/badge/React_Router-6-ef4444)](https://reactrouter.com/)
[![LiquidJS](https://img.shields.io/badge/LiquidJS-10-0ea5e9)](https://liquidjs.com/)

## ✨ Key Features

### 📚 Templates & editing
- **Template library**: categorized Braze-oriented samples you can load into the editor.
- **Liquid-aware highlighting**: custom highlighter keeps tags, filters, and variables readable while you edit.
- **Search**: find templates quickly from the sidebar.

### 👁️ Preview & data
- **Live preview**: LiquidJS renders the template against your current editor content.
- **Sample data editor**: edit JSON used as context for preview (dates, nested objects, edge cases).
- **Luxon**: realistic date handling in samples and UI where dates appear.

### 🎨 UX & docs
- **PWA install prompt**: bottom banner when the browser fires `beforeinstallprompt`, plus an **iOS** hint (Share → Add to Home Screen) after a short delay; dismiss is remembered in `localStorage`.
- **Dark mode**: `next-themes` plus Tailwind’s class-based `dark:` variant (`.dark` on the root), tuned for long sessions.
- **Documentation**: per-template notes plus a general Liquid / Braze-oriented guide in dialogs.
- **Copy & reset**: one-click copy of output or body; reset restores the loaded template baseline.
- **Responsive layout**: usable on desktop and smaller viewports.

## 🛠 Tech stack

### Frontend
- **React 18** + **React DOM** (`createRoot`, `StrictMode`)
- **Vite 6** for dev server and production builds
- **TypeScript 5**
- **Tailwind CSS 4** (**`@tailwindcss/vite`**) + **tailwindcss-animate**
- **React Router 6** for in-app routing
- **PWA**: `vite-plugin-pwa` (install prompt, precache, auto-update service worker)

### UI & motion
- **Radix UI** primitives (dialog, popover, select, tabs, tooltip, scroll area, …)
- **shadcn/ui–style** components under `src/components/ui` (class-variance-authority, `tailwind-merge`)
- **lucide-react** icons
- **Framer Motion** for transitions where used
- **Material UI (MUI) 6** + **Emotion** for select complex surfaces

### Templating & utilities
- **LiquidJS** for parsing and rendering Liquid
- **Luxon** for date/time
- **react-window** for efficient long lists

## 🚀 Quick start

### Prerequisites
- **Node.js 18+** (aligns with Vite 6 engines; **20+** recommended)
- **npm**

### Installation

```bash
npm install
npm run dev
```

Default dev URL: **http://localhost:5173**

There is **no** required `.env` for local development; the app runs entirely in the browser with bundled templates and client-side Liquid rendering.

## 📁 Project structure

```txt
braze-liquid-tool/
├── src/
│   ├── components/       # App chrome, editors, dialogs, ThemeToggle, …
│   ├── components/ui/    # Reusable UI primitives (shadcn-style)
│   ├── templates/        # Liquid template sources + metadata
│   ├── lib/              # Shared helpers
│   ├── types/            # TypeScript types
│   ├── assets/           # Static assets used by the UI
│   ├── App.tsx
│   └── main.tsx
├── public/
├── index.html
├── vite.config.js        # React + @tailwindcss/vite
├── tailwind.config.js    # Theme extensions (loaded via @config in src/index.css)
├── components.json       # shadcn/ui generator config
└── eslint.config.js
```

## 🔧 Available scripts

### Development

```bash
npm run dev              # Vite dev server
```

### Build / preview

```bash
npm run build            # Production bundle → dist/
npm run preview          # Local preview of the production build
```

### Code quality

```bash
npm run lint             # ESLint across the repo
```

## 🚀 Deployment

```bash
npm run build
```

Upload the **`dist/`** output to any static host (S3 + CloudFront, Netlify, **Vercel**, etc.). This repo includes a `.vercel` directory if you deploy with the Vercel CLI or Git integration—set the build command to `npm run build` and publish `dist` as the static output directory in your host’s settings.

### Progressive Web App (PWA)

This app is built and shipped as a **PWA** first: production builds register a **service worker** (via [`vite-plugin-pwa`](https://vite-plugin-pwa.netlify.app/)) with **`registerType: 'autoUpdate'`**, precache rules for JS/CSS/HTML/fonts/icons/splashes, and a **Web App Manifest** (`name`, `short_name`, maskable icons, theme colors). The UI includes an **install banner** (similar in spirit to the [Split the G](https://github.com/Rixouu/split-the-g) PWA) so eligible browsers can install in one tap.

**PNG icons** (`manifest-icon-*.png`) and **Apple splash screens** live under `public/pwa/` and are linked from `index.html` for iOS standalone launch. Deploy behind **HTTPS**, then use **Install** / **Add to Home Screen**; new deployments pick up updates when the new service worker activates.

Regenerate splash + maskable icons (e.g. after changing the mark or canvas color):

```bash
npm run generate:pwa-assets
```

Then ensure `index.html` and `vite.config.js` still reference `/pwa/...` paths (the CLI prints tags with a duplicated path if `-a` is wrong—this repo uses `/pwa/...` only).

## 🤝 Contributing

Contributions are welcome. Please open a PR with a short description of the change and any screenshots for UI tweaks.

1. Run **`npm run lint`** before submitting.
2. Keep Liquid samples and preview behavior backward compatible unless the PR calls out an intentional breaking change.

## 📄 License

Intended to be **MIT**-licensed (as in prior project docs). Add a root **`LICENSE`** file to publish the full legal text; until then, confirm terms with the maintainer if you need a formal grant.

## 👥 Team

- **Jonathan** — Product & engineering — [Rixouu](https://github.com/Rixouu) · [LinkedIn](https://www.linkedin.com/in/jonathanrycx/)

## 🙏 Acknowledgments

- [Braze](https://www.braze.com/) for the CRM context that inspired the tool
- [LiquidJS](https://github.com/harttle/liquidjs) for a solid Liquid implementation in the browser
- [Vite](https://vitejs.dev/) and the React team for the developer experience
- [shadcn/ui](https://ui.shadcn.com/) and [Radix UI](https://www.radix-ui.com/) for accessible primitives
- [Luxon](https://moment.github.io/luxon/) for date and time utilities
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling (v4 + Vite plugin)

---

**Built for clearer Braze Liquid and faster message iteration.**
