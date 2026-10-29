# Nota Mundial

**Overall GPA Calculator for Students**

Calculate weighted grades, organize courses and assessments, and plan your academic
week in one place. Nota Mundial combines country-specific grading scales with a
calendar, a schedule and a course calculator, with no account required.

[Open the app](https://nota-mundial.vercel.app) ·
[Cloudflare deployment](https://nota-mundial.mateoriosdev.workers.dev/en) ·
[Report an issue](https://github.com/MateoRiosdev/nota-mundial/issues)

## Features

- **Country-based calculator:** search 249 countries and territories, filter by
  continent, and view the selected country's name and grading scale above the selector.
- **Weighted averages:** calculate results from assessment grades and percentages.
  A final course grade requires weights totaling 100%; missing grades remain
  distinct from zero and partial results are labeled as accumulated points.
- **Academic workspace:** create separate pages for semesters or projects, with
  courses, custom colors, grading ranges, assignments and exams.
- **Calendar and schedule:** view assessments across days and weeks, choose a
  Monday or Sunday week start, and jump from an assessment to its grade calculator.
  Dates are optional: the calculator works without them.
- **Calendar exports:** download individual or filtered assessments as `.ics`
  files, or open a prefilled Google Calendar event to review and save.
- **Browser storage:** manually save your work or enable autosave. No account is
  required to use the calculator or planner.
- **Multilingual interface:** nine locales for the country calculator and
  navigation, with Spanish and English for the academic workspace.
- **Responsive design:** mobile and desktop layouts, light and dark themes,
  keyboard controls and custom dialogs.
- **Search metadata:** localized titles, canonical URLs, language alternates,
  sitemap, robots.txt and WebApplication structured data.

## Grading scales and country selection

Examples of the numeric scales configured in the application:

| Country | Configured scale |
| --- | --- |
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

These ranges represent configured numeric scales, not a certification of equivalence
between institutions. Grading rules and passing thresholds can differ by institution
and educational level. Countries without a configured scale display a generic
percentage scale marked with `*`. See [the grading systems](lib/gradingSystems.ts)
for the complete configuration.

The country catalog is bundled with `flag-icons`; it does not depend on a live
REST Countries request. Country names use `Intl.DisplayNames`.

The entry URL `/` uses country headers supplied by Vercel or Cloudflare to choose
a supported language. Explicit locale URLs such as `/es` keep that language.
Saved manual country and language choices take precedence over automatic detection.
Without country headers, the app defaults to English and leaves the country
unselected. A local development server cannot infer the visitor's country on its own.

Selecting a country supplies the grading range for **new** courses. Existing
courses keep their ranges. New courses start with two ungraded assessments,
weighted at 50% each.

## Scholarships and career resources

**Explore your future** is a collapsed, searchable directory of official scholarship,
study and employment portals. It follows the selected country, includes local
resources for Peru, Spain, Colombia, Mexico and Chile, and offers international
resources for other countries. Filter by study or employment and open the official
source to check requirements, deadlines and availability.

This directory needs no API key and makes no news-provider requests. Visitors do
not consume an API quota. Portal availability remains the responsibility of each
institution; directory entries do not imply a currently open call or vacancy.
The NewsData.io integration has been removed.

## Languages

English · Spanish · Portuguese · French · German · Italian · Japanese · Korean ·
Simplified Chinese.

The academic workspace has Spanish and English copy. Other locale routes use
English for that workspace while keeping their localized country calculator and
navigation. Translations and locale configuration live in [messages](messages)
and [i18n](i18n).

## Data and saving

**Planner autosave is off by default.** Use **Save** or explicitly enable autosave.
Planner data is stored in the current browser under `nota-mundial:planner:v1`;
quick-calculator results use a separate storage key.

Data does not sync across devices, browsers, profiles or deployment domains.
Clearing browser storage removes saved data. The planner shows unsaved changes,
storage failures and conflicting edits in another tab; conflicts pause autosave.

Google Calendar integration opens a prefilled event for the user to confirm. It
requires no application API key and does not synchronize subsequent changes.
Date inputs use the device's timezone; calendar exports preserve event instants
using UTC.

## Technology

| Technology | Role |
| --- | --- |
| Next.js 16 / App Router | Application framework, pages and API routes |
| React 18 | Interactive interface |
| TypeScript and JavaScript | Application logic and tests |
| Tailwind CSS / CSS | Styling, themes and responsive layouts |
| next-intl | Localized routes and translations |
| Framer Motion | Interface animations |
| flag-icons | Flags and bundled country catalog |
| lucide-react | Interface icons |
| Playwright / Chromium | Browser regression tests |
| Node.js test runner | Logic and data validation tests |

GitHub calculates the repository's language percentages automatically. View the
current breakdown in the repository's **Languages** panel:
[TypeScript](https://github.com/MateoRiosdev/nota-mundial/search?l=typescript) ·
[JavaScript](https://github.com/MateoRiosdev/nota-mundial/search?l=javascript) ·
[CSS](https://github.com/MateoRiosdev/nota-mundial/search?l=css).

## Development

Requires Node.js **20.9 or later**. The cloud environment was validated with
Node.js 24.19.0 and npm 11.9.0.

```bash
git clone https://github.com/MateoRiosdev/nota-mundial.git
cd nota-mundial
npm ci
npm run dev
```

Open `http://localhost:3000`. Production build and startup:

```bash
npm run build
npm start
```

The default canonical origin is `https://nota-mundial.vercel.app`. For a custom
production domain, set `NEXT_PUBLIC_SITE_URL` to its HTTPS origin **before building**.
Do not use a temporary preview URL as the canonical site.

## Validation

```bash
npm test
npm run build
```

Browser tests require an active development server and Chromium:

```bash
# Terminal 1
npm run dev -- --hostname 127.0.0.1 --port 3000

# Terminal 2
npx playwright install chromium
npm run test:browser

# Alternative: reuse Chromium in the managed cloud environment
CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:browser
```

The suites cover country selection, grade calculations, planner storage, dates,
calendar exports, controls, keyboard behavior, mobile layout and themes.
`PLANNER_TEST_URL` overrides the test server origin; `PLANNER_ARTIFACTS` sets the
screenshot directory.

`npm run lint` still invokes `next lint`, which Next.js 16 no longer provides.
Use the test and build commands above for the supported validation workflow.

## Project structure

```text
nota-mundial/
├── app/
│   ├── [locale]/          # Localized page and layout
│   ├── api/               # Server endpoints
│   ├── globals.css        # Shared styles
│   ├── robots.ts          # Generated robots.txt
│   └── sitemap.ts         # Generated sitemap
├── components/
│   └── planner/           # Calendar, courses, forms and controls
├── i18n/                  # Locale routing and message loading
├── lib/                   # Grading, country, calendar and storage logic
├── messages/              # Interface translations
├── public/                # Logo, favicon and static assets
└── tests/
    └── browser/           # Playwright regression suites
```

## Repository topics

Suggested GitHub topics (20):

```text
gpa-calculator grade-calculator weighted-average academic-planner student-planner
education edtech students study-tools grade-tracker
nextjs react typescript javascript tailwindcss
next-intl internationalization localstorage responsive-design dark-mode
```

## Author

[Mateo Rios](https://github.com/MateoRiosdev) ·
[LinkedIn](https://www.linkedin.com/in/mateojuliogomerorios/)
