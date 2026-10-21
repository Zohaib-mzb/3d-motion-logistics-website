# 3D Motion Logistics Website — React, TypeScript, Vite & GSAP

A premium **motion-driven logistics website** built for **Velcotiy Techniques Inc**, a Canadian final-mile delivery company. The project combines **React 19, TypeScript, Vite, GSAP, React Router, responsive media, technical SEO, AEO, GEO, structured data, and Hostinger deployment**.

**Live website:** https://velcotiytechniques.ca

![Velcotiy Techniques Inc — motion logistics website preview](public/brand/velcotiy-og.png)

---

## Overview

This client project was designed and engineered as a modern, high-performance logistics website for a final-mile delivery business.

The website focuses on:

- premium motion and cinematic storytelling
- warehouse-to-doorstep delivery positioning
- responsive mobile-first UX
- service and fleet discovery
- business lead generation
- driver recruitment
- SEO, answer-engine optimization, and AI-readable site structure
- direct-link routing on Hostinger
- production-focused frontend performance

The project uses a lightweight frontend with a small PHP endpoint for driver application email. Contact and quote requests use email drafts.

---

## Core Features

- Motion-led homepage with warehouse-to-doorstep storytelling
- React 19 + TypeScript + Vite architecture
- GSAP-powered scrolling, reveals, transitions, and motion effects
- Responsive design for desktop, tablet, and mobile
- Final-mile delivery service pages
- Same-day delivery positioning
- Warehouse-to-doorstep delivery workflows
- Delivery operations management content
- Dedicated fleet and EV delivery sections
- Responsive fleet image presentation
- Canadian delivery coverage visualization
- Business / warehouse solutions page
- Driver application form with validation
- Direct driver application email through a PHP endpoint
- Multi-step quote request form
- Contact form with email-draft workflow
- Careers page
- Mobile menu with scroll locking and scroll-position restoration
- React Router clean URLs
- Hostinger SPA fallback via `.htaccess`
- Custom 404 page
- SEO metadata and canonical URLs
- Open Graph + social sharing metadata
- JSON-LD structured data
- XML sitemap
- `robots.txt`
- `llms.txt`
- Performance-focused route and asset prefetching

---

## Tech Stack

| Category | Technology |
|---|---|
| Frontend | React 19 |
| Language | TypeScript |
| Build Tool | Vite 7 |
| Routing | React Router |
| Motion | GSAP |
| Forms | React Hook Form |
| Validation | Zod |
| Icons | Lucide React |
| Hosting | Hostinger |
| SEO | Metadata, canonical URLs, JSON-LD, sitemap, robots.txt, llms.txt |

---

## Public Routes

```text
/
/services
/fleet
/coverage
/about
/carriers
/drivers
/careers
/contact
/quote
```

Unknown application routes render the project's custom React 404 page.

---

## Motion & Visual Experience

The site was built around a premium visual narrative rather than a generic static corporate template.

Motion patterns include:

- cinematic hero movement
- scroll-triggered reveals
- warehouse-to-city storytelling
- route and operational visualization
- fleet transitions
- staged section entrances
- reduced-motion support
- responsive behavior across smaller devices

The original design direction explored 3D-style interaction, but the production implementation prioritizes **smooth motion, visual depth, responsive media, and performance** instead of unnecessary heavy WebGL rendering.

---

## Logistics & Final-Mile Delivery UX

The website communicates services including:

- Final-Mile Delivery
- Same-Day Delivery
- Warehouse-to-Doorstep Delivery
- Distribution
- Delivery Operations Management
- Driver Management
- Driver Recruitment & Onboarding Support
- Dedicated Delivery Operations
- Dedicated Fleet
- EV Delivery

The customer journey is presented around:

**Warehouse pickup → parcel handoff → driver dispatch → city route → doorstep delivery**

---

## Driver Application Flow

The driver form collects:

- full name
- email
- phone
- age
- city
- province
- legal authorization to work in Canada
- valid driver's licence status
- vehicle type
- vehicle name
- weekly availability
- delivery experience
- emergency contact
- additional notes

After validation, the website posts the application to `/api/driver-application.php`. The endpoint validates it and sends it to `info@velcotiytechniques.ca` through the Brevo transactional email HTTPS API. The site shows success only after Brevo returns HTTP 201 with a message ID.

No driver application data is intentionally stored by this website.

---

## Contact & Quote Workflows

The website uses lightweight client-side workflows:

### Contact form

The visitor completes the form and the site opens a pre-filled email draft for review and sending.

### Quote form

The visitor completes a multi-step quote request, reviews the entered information, and opens an email draft containing the structured request.

This avoids unnecessary backend infrastructure for simple business inquiries.

---

## SEO, AEO & GEO

The project includes a production-focused search and answer-engine foundation.

Implemented features include:

- unique page titles
- unique meta descriptions
- canonical URLs
- Open Graph metadata
- Twitter / X card metadata
- Organization schema
- WebSite schema
- Service schema
- BreadcrumbList schema
- XML sitemap
- `robots.txt`
- `llms.txt`
- crawlable internal links
- semantic headings
- descriptive image alt text
- service-specific landing content
- location-aware delivery copy
- structured business information

### Search concepts covered

The site naturally targets topics such as:

- final-mile delivery
- last-mile delivery
- same-day delivery
- warehouse-to-doorstep delivery
- Canadian logistics
- logistics company website
- delivery operations management
- dedicated fleet
- EV delivery
- warehouse delivery
- business delivery solutions
- driver management
- logistics web design
- logistics website development

---

## Performance Engineering

The site was optimized to retain a premium visual experience without unnecessary rendering cost.

Performance decisions include:

- responsive images
- lightweight SVG coverage visualization
- reduced use of expensive 3D/WebGL
- route and asset prefetching
- critical image preloading
- lazy loading for non-critical media
- Vite production bundling
- reduced-motion support
- removal of missing/unused media references
- lightweight frontend with a small PHP mail endpoint

---

## Hostinger SPA Routing

The project uses React Router with clean URLs.

For static Hostinger / Apache hosting, the repository contains:

```text
public/.htaccess
```

Vite copies this file into:

```text
dist/.htaccess
```

The rule preserves real files and directories, then internally serves `index.html` for React routes.

This allows direct links such as:

```text
https://velcotiytechniques.ca/drivers
https://velcotiytechniques.ca/careers
https://velcotiytechniques.ca/services
```

to work when:

- opened directly
- refreshed
- shared
- accessed from search engines

---

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Run production checks:

```bash
npm run build
npm run lint
npx tsc --noEmit --skipLibCheck false
npm run preview
```

---

## Production Deployment

Build the application:

```bash
npm run build
```

Deploy the **contents of `dist/`** to the Hostinger site root.

Make sure the hidden file below is included:

```text
.htaccess
```

After deployment, verify:

```text
/
/services
/fleet
/coverage
/drivers
/careers
/contact
/quote
/robots.txt
/sitemap.xml
/llms.txt
```

Direct route refreshes should load the React application rather than a Hostinger 404 page.

---

## Project Structure

```text
src/
├── components/
│   ├── common/
│   ├── forms/
│   └── layout/
├── config/
├── data/
├── lib/
├── pages/
├── sections/
└── styles/

public/
├── brand/
├── media/
├── .htaccess
├── robots.txt
├── sitemap.xml
└── llms.txt
```

---

## Main Editing Locations

| Content | File |
|---|---|
| Business configuration | `src/config/siteConfig.ts` |
| Homepage sections | `src/sections/home/HomeSections.tsx` |
| Internal pages | `src/pages/ContentPages.tsx` |
| Services | `src/data/services.ts` |
| Fleet | `src/data/fleet.ts` |
| Coverage | `src/data/coverage.ts` |
| Forms | `src/components/forms/InquiryForm.tsx` |
| Submission helpers | `src/lib/submissions.ts` |
| SEO & structured data | `src/components/common/SEO.tsx` |
| Responsive styles | `src/styles/` |

---

## Security & Privacy

This repository contains public-facing frontend code for a client business website.

- A Brevo API key is required server-side for driver application email and must never be exposed in frontend code.
- No backend database is used for public forms.
- Local environment files are ignored by Git.
- `node_modules/`, `dist/`, logs, and OS metadata are excluded from Git.
- Public business contact information may exist in frontend source because it is intentionally displayed on the public website.
- Contact and quote form data is not stored by the application.
- Driver application data is processed by the PHP endpoint and sent by email; this website does not intentionally persist it.
- Secrets, passwords, access tokens, private keys, and credentials should never be committed to this repository.

---

## Quality Checks

The project is maintained with:

```bash
npm run build
npm run lint
npx tsc --noEmit --skipLibCheck false
```

The website is also manually tested for:

- desktop responsiveness
- mobile responsiveness
- direct route loading
- navigation
- forms
- driver application submission and failure state
- quote flow
- SPA routing
- 404 handling
- SEO files
- media loading

---

## GitHub Search Keywords

React logistics website · GSAP website · motion website · animated website · 3D motion website · final-mile delivery website · last-mile delivery website · React TypeScript website · Vite client project · logistics web design · Canadian logistics website · responsive business website · SEO optimized React website · AEO website · GEO website · Hostinger React deployment · React Router SPA · modern logistics website · delivery company website · frontend portfolio project

---

## Repository Topics

Recommended GitHub topics for this project:

```text
react
typescript
vite
gsap
react-router
motion-design
animated-website
3d-website
logistics
logistics-website
final-mile-delivery
last-mile-delivery
responsive-web-design
frontend
web-development
seo
aeo
geo
hostinger
client-project
business-website
```

---

## Client Project

This project was developed for **Velcotiy Techniques Inc** as a production business website and frontend portfolio project.

**Website:** https://velcotiytechniques.ca

---

## License / Usage

This repository is publicly viewable for portfolio and engineering-reference purposes.

The Velcotiy Techniques Inc brand, logo, generated visuals, business content, and proprietary assets are not automatically licensed for reuse.

---

## Driver application email on Hostinger

The driver form posts JSON to `/api/driver-application.php` on the same origin. The PHP endpoint validates the application and sends it to `https://api.brevo.com/v3/smtp/email` over HTTPS using PHP cURL. It shows success only when Brevo returns HTTP 201 with a nonempty `messageId`. That confirms provider acceptance, not inbox placement. The frontend does not receive the API key or send applicant data to analytics or URLs; the website does not store applications. Brevo necessarily processes the application for delivery.

Deploy the **contents** of `dist/`, including `api/driver-application.php` and `.htaccess`, to a PHP 7.4+ enabled Hostinger `public_html` with the PHP cURL extension enabled. The existing SPA fallback continues to serve `/drivers`, while the physical PHP file handles the API request. Contact and Quote still open email drafts; general WhatsApp links are unchanged.

The endpoint reads `BREVO_API_KEY` from the server environment first. If it is absent, it reads a private PHP config file. By default, this is `../private/mail-config.php` relative to PHP's `DOCUMENT_ROOT`: for `/home/USERNAME/domains/velcotiytechniques.ca/public_html`, create `/home/USERNAME/domains/velcotiytechniques.ca/private/mail-config.php`. Copy the structure in `server/mail-config.example.php` into that private file and enter the real key **only on Hostinger**. If the file is elsewhere outside `public_html`, set server-side `MAIL_CONFIG_PATH` to its absolute path. Paths inside the public web root are rejected. The example file is not deployed by Vite. Never put the real key in Git, `public_html`, or a `VITE_*` variable.

In Brevo, verify `info@velcotiytechniques.ca` as a sender and authenticate `velcotiytechniques.ca` as a sending domain. If Brevo asks for DNS records, copy the exact records it supplies into the domain's authoritative DNS settings (Hostinger DNS if Hostinger hosts DNS); do not invent record values. Then create a transactional API key. A test GET of `/api/driver-application.php` should return HTTP 405 and `invalid_request`; this checks the route, **not** email delivery. Submit one clearly marked test application at `/drivers`, inspect the response in Network tools, and confirm receipt in the mailbox or spam folder. The test suite can be run with `php server/tests/driver-mail.php`; it uses a mocked provider and sends no email.
