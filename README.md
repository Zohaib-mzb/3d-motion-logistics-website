# Velcotiy Techniques Inc website

React, TypeScript, and Vite marketing site for Velcotiy Techniques Inc. The public routes are `/`, `/services`, `/fleet`, `/coverage`, `/about`, `/carriers`, `/drivers`, `/careers`, `/contact`, and `/quote`. Unknown routes render a 404 page.

## Run and verify

```bash
npm install
npm run dev
npm run build
npm run lint
npx tsc --noEmit --skipLibCheck false
npm run preview
```

Deploy `dist/` to a static host configured to serve `index.html` for client-side routes. The canonical origin is `https://velcotiytechniques.ca`; update `src/config/siteConfig.ts` only if the production domain changes. `public/robots.txt`, `public/sitemap.xml`, and `public/llms.txt` use the same origin.

## Where to edit

| Content | File |
| --- | --- |
| Business contact details and external profiles | `src/config/siteConfig.ts` |
| Homepage sections and copy | `src/sections/home/HomeSections.tsx` |
| Other page copy | `src/pages/ContentPages.tsx` |
| Services and fleet data | `src/data/services.ts`, `src/data/fleet.ts` |
| Coverage markets | `src/data/coverage.ts` |
| Approved media paths | `src/config/media.ts` |
| Page metadata and structured data | `src/components/common/SEO.tsx` |
| Responsive styling | `src/styles/` |

Contact, quote, and driver forms validate in the browser and open an email draft addressed to `info@velcotiytechniques.ca`. The visitor reviews and sends the draft in their email app. The site does not store or submit form data to a backend.

## Launch checks

- The city list in `src/data/coverage.ts` is **illustrative and unverified**. Public copy asks visitors to confirm service availability. Verify each market before presenting it as active coverage.
- Images in `public/media/` are generated concept visuals, including branded vehicle images. They are not documentary photographs of Velcotiy staff, facilities, or operating fleet. Replace them with approved original or licensed photography if the site should depict real operations.
- The static host must provide route fallback and appropriate cache headers for Vite's hashed build assets. No service worker is used.
- Contact details, Indeed, LinkedIn, GitHub attribution, and the canonical domain are set in `src/config/siteConfig.ts`.
