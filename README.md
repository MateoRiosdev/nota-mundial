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

## Automatic country and language

The entry URL `/` selects a language using the visitor IP country supplied by
Vercel (`x-vercel-ip-country`) or Cloudflare (`cf-ipcountry`). Spanish-speaking
Latin America uses Spanish; Brazil, Portugal, Cape Verde and other Portuguese-speaking
countries use Portuguese. Countries without a mapped supported language use English.
Without geolocation, English is used and the country remains unselected.
Explicit locale URLs such as `/es` keep that language. A manual language choice
is saved in `USER_LOCALE`; a manual country choice is saved locally in the browser.
These choices take precedence over subsequent automatic detection.
The hosting proxy must supply trustworthy country headers; a local machine cannot
infer a visitor's country from the server's own IP.

The selector uses the bundled ISO catalog from `flag-icons` (249 countries and
territories) and `Intl.DisplayNames` for all nine languages. It does not require
REST Countries availability. Configured numeric grading scales represent common
scales and can differ between institutions or educational levels. Countries without
a configured scale explicitly show a generic percentage scale, marked with `*`.

Run regression tests from the repository directory:

```bash
node --test tests/location-and-countries.test.cjs
npm run build
```

## Academic workspace

The home page now includes **Calendar**, **Schedule**, and **Grade Calculator**
views. Create pages for separate semesters or projects, then add your own courses,
colors, grading ranges, assignments and exams. Assessments share their dates,
completion state, percentage and grade across all three views. Selecting **Grade**
in the schedule opens and focuses that assessment in its course calculator.

- Dates are optional. The calendar displays continuous assessment ranges across
  days and weeks, supports Monday/Sunday starts and adapts to mobile screens.
- Percentages must total 100% for a final grade. Missing grades are distinct from
  zero; partial calculations are explicitly labeled as accumulated points.
- **Autosave is off by default.** Enable it or use **Save**. Data is stored only in
  the current browser, using `nota-mundial:planner:v1`. It does not sync across
  devices, domains or browser profiles. Clearing browser data removes it. Existing
  quick-calculator saved grades use their original, separate storage key.
- Unsaved edits trigger an exit warning. Storage failures and edits in another tab
  are shown explicitly; conflicting tabs pause autosave.
- Google Calendar opens a prefilled event for the student to confirm. It requires
  no application API key or OAuth integration and does not synchronize later edits.
  Individual or filtered assessments can also be downloaded as `.ics` files.
- Date inputs use the device's local timezone. Google Calendar and ICS exports use
  UTC to preserve the actual event times, including daylight-saving offsets.
- The country calculator appears first, above the course summary, under **Quick calculator by country**. Its selected country supplies the grading range for new courses. New courses start with two ungraded assessments weighted at 50% each. Changing country does not alter existing courses.
  The new workspace has complete Spanish and English copy; other locale routes
  currently use English for this workspace while retaining their localized country
  calculator and navigation.

### Search engine metadata

`app/sitemap.ts` generates the root URL and all nine locale URLs with language
alternates. `app/robots.ts`, canonical links, Open Graph, Twitter and WebApplication
structured data share `lib/site.ts`. The default canonical origin is
`https://nota-mundial.vercel.app`. To use a custom production domain, set
`NEXT_PUBLIC_SITE_URL` to its HTTPS origin **before building**. Do not use a preview
URL as the canonical site. Metadata supports discovery but does not guarantee
indexing or a particular ranking.

### Validation

```bash
npm test
npm run build
```

`npm test` runs the original country/location regressions and the planner's grade,
storage-validation, calendar-range and ICS/Google Calendar tests.

Browser regression tests require an active development server and Chromium:

```bash
# Terminal 1
npm run dev -- --hostname 127.0.0.1 --port 3000

# Terminal 2: install Playwright's browser once, or use a system Chromium below.
npx playwright install chromium
npm run test:browser

# In the managed cloud environment, reuse its installed Chromium:
CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:browser
```

The browser suite uses an isolated browser context and verifies opt-in storage,
manual save and autosave, reloads, separate pages, course colors, date edits,
weighted calculations, exports, mobile layout, dark mode and storage errors.
The controls suite also verifies country defaults, custom page/week selectors, the
color picker, date/time picker, keyboard behavior and custom deletion dialogs.
`PLANNER_TEST_URL` overrides the local server origin. `PLANNER_ARTIFACTS` sets the
screenshot directory (defaults to the OS temporary directory).

Known existing tooling limitation: `npm run lint` uses `next lint`, which is no
longer available in Next.js 16. The test and build commands above are the supported
validation paths for this change.

## Explore your future: scholarships, careers and news

The collapsed **Explore your future** section follows the calculator's country
selection (visitor-country header or saved manual choice). It includes searchable
official scholarship and employment directories, with local resources for Peru,
Spain, Colombia, Mexico and Chile, plus international resources. These are links
to official portals, not a list of currently open or guaranteed opportunities.
No grade eligibility, award amounts or deadlines are inferred. Spanish and English
copy is provided; other locales use English, as the planner does.

The **News** view requests `/api/news?country=PE` only when opened. To activate
live articles, obtain a NewsData.io API key and configure `NEWSDATA_API_KEY` in
the server environment (Vercel environment settings or an ignored `.env.local`
for development). Restart/redeploy after setting it. Never prefix this credential
with `NEXT_PUBLIC_`, commit it, or paste it in chat. An optional configuration
example is in `.env.example`. Allow server-side HTTPS to `newsdata.io` where
outbound networking is restricted. Cloud development credentials do not configure
your production deployment automatically.

The adapter uses `https://newsdata.io/api/1/latest` with `country` and education,
scholarship and employment search terms (`q`), rather than assuming an education
category exists. Provider country coverage, free-plan quotas, access and delays
may change; verify the current plan in your NewsData.io dashboard. Article dates
and sources are supplied by the provider, and articles link to the original
publisher. Missing keys, provider errors, unsupported countries and exhausted
quotas show an unavailable state; an empty successful response shows no results.
The official directory remains usable independently of the API.

Requests are coalesced and cached for one hour per country **per server instance**;
failures have a five-minute cooldown. This is not a global quota guarantee across
serverless instances or deployments. For larger traffic, use a shared cache and
provider-side quota limits. The key and upstream error details are never included
in API responses. News is not fetched during builds.

Validation includes six service tests (normalization, safe links, missing keys,
caching, quota errors, recovery and directories) in `npm test`, plus the opportunities
browser suite in `npm run test:browser`. Browser provider responses are simulated
for reproducibility; they verify loading, empty, unavailable and populated views,
country changes, filters and mobile layout. Live NewsData.io access still requires
a configured key and an end-to-end check against that account.
