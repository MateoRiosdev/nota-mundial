# Nota Mundial ("Calculadora de Notas a nivel Global")

**Global Grade** is a modern GPA and grade conversion calculator designed for students worldwide. It allows users to calculate weighted averages and convert grades between the official grading systems of more than **60 countries**, including Peru, Spain, Colombia, Chile, Argentina, Mexico, and many others.

Built with **Next.js 16**, it offers multilingual support, responsive design, country-specific grading scales, and a clean user experience optimized for both desktop and mobile devices.

🌐 **Live Demo:** https://nota-mundial.vercel.app

☁️ **Cloudflare:** https://nota-mundial.mateoriosdev.workers.dev/en

---

## Features

- 🌍 Supports **60+ official national grading systems**
- 🔄 Convert grades between different country scales
- 📊 Calculate weighted grade averages
- 🔎 Searchable country selector
- 🌎 Filter countries by continent
- 📄 Pagination for large country lists
- 🚩 Real SVG country flags using **flag-icons**
- 💾 Save grades locally with Local Storage
- 🗑️ Edit and delete saved grades
- 🌙 Dark and Light themes
- 📱 Fully responsive interface
- 🌐 Internationalization with **9 languages**
- ⚡ Fast, server-rendered application built with Next.js App Router
- 🔍 SEO optimized with localized metadata, sitemap, robots.txt, and hreflang support

---

## Supported Grading Systems

| Country | Scale |
|----------|-------|
| Peru | 0–20 |
| Spain | 0–10 |
| Colombia | 0–5 |
| Chile | 1.0–7.0 |
| Argentina | 0–10 |
| Mexico | 0–100 |
| Venezuela | 0–20 |
| Ecuador | 0–10 |
| France | 0–20 |
| Germany | 1–6 |
| Italy | 1–10 |
| Japan | 0–100 |
| ...and 50+ more | Official national scales |

---

## Supported Languages

- English
- Spanish
- Portuguese
- French
- German
- Italian
- Japanese
- Korean
- Chinese (Simplified)

---

## Technology Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16 | React Framework (App Router) |
| React | User Interface |
| TypeScript | Type Safety |
| Tailwind CSS | Styling |
| next-intl | Internationalization |
| Framer Motion | UI Animations |
| flag-icons | SVG Country Flags |
| lucide-react | Icons |
| REST Countries API | Country Information (with fallback support) |

---

## Project Structure

```text
global-grade/
├── app/
│   ├── api/
│   │   └── countries/
│   │       └── route.ts
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── globals.css
│
├── components/
│   ├── AnimatedModal.tsx
│   ├── CountrySelector.tsx
│   ├── FlagIcon.tsx
│   ├── GradeCalculator.tsx
│   ├── LanguageSelector.tsx
│   ├── SavedGradesPanel.tsx
│   └── Skeleton.tsx
│
├── i18n/
│   ├── request.ts
│   └── routing.ts
│
├── lib/
│   ├── gradingSystems.ts
│   └── useSavedGrades.ts
│
├── messages/
│   ├── de.json
│   ├── en.json
│   ├── es.json
│   ├── fr.json
│   ├── it.json
│   ├── ja.json
│   ├── ko.json
│   ├── pt.json
│   └── zh.json
│
└── public/
    ├── favicon.svg
    ├── robots.txt
    └── sitemap.xml
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/global-grade.git
```

Navigate to the project directory:

```bash
cd global-grade
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open your browser at:

```
http://localhost:3000
```

---

## Build for Production

```bash
npm run build
npm start
```

---

## SEO

Global Grade includes built-in SEO features:

- Localized metadata
- hreflang tags
- robots.txt
- sitemap.xml
- Locale-aware routing
- Server-side rendering with Next.js

---

## Internationalization

The application is powered by **next-intl** and currently supports nine languages:

- 🇺🇸 English
- 🇪🇸 Spanish
- 🇵🇹 Portuguese
- 🇫🇷 French
- 🇩🇪 German
- 🇮🇹 Italian
- 🇯🇵 Japanese
- 🇰🇷 Korean
- 🇨🇳 Chinese

Adding a new language only requires creating a new translation file inside the `messages` directory.

---

## Grade Persistence

Grades are stored locally using the browser's Local Storage.

Users can:

- Save multiple grade calculations
- Reload previous grades
- Delete saved entries
- Continue using the application without creating an account

No personal data is sent to any external server.

---

## License

This project is released under the **MIT License**.

Feel free to fork, modify, and contribute.

---

## Author

Developed with ❤️ using **Next.js** and **TypeScript**.
