# ClimateSure — Frontend (Angular)

The web app for **ClimateSure / CityShield**, a parametric insurance platform. Customers buy weather cover. When a measured value (rainfall, river level, temperature, wind, humidity, soil moisture) crosses their policy's threshold, a claim opens automatically. Once a claims officer approves it, the payout is paid automatically.

The backend (Spring Boot microservices behind an API gateway) lives in the **ParametricInsurance** repository.

## Documentation

| Document | What it contains |
|---|---|
| `ParametricInsurance/docs/FEATURES.md` | Every feature, frontend and backend, explained simply with an example |
| `docs/CityShield_Project_Documentation.docx` | Architecture, end-to-end journeys, formulas, demo script, reviewer Q&A |

## Tech stack

- Angular 21 (standalone components, lazy-loaded routes, signals, new control flow)
- NgRx Store + Effects for state
- Tailwind CSS 4 for styling
- Leaflet for the zone map
- Vitest for unit tests

## Run it

```bash
npm install
npm start            # http://localhost:4200
```

The app calls the API gateway at `http://localhost:8080` (see `src/environments/`). Start the backend first: Eureka, then the services, then the gateway.

```bash
npm run build                      # production build into dist/
npx ng test --watch=false          # run all unit tests once
```

## Who uses it

| Role | Main screens |
|---|---|
| Visitor | Landing page, product catalogue, product details, register, login |
| Customer | Dashboard, quotes, buy a policy (or a custom policy), my policies (renew, auto-renew, certificate PDF), payments & payouts (checkout, receipts), claims (manual claim with evidence files), notifications, zone map, activity |
| Underwriter | Dashboard, pending applications, approve / reject, review history |
| Claims officer | Dashboard, claims queue, start review / approve / reject, review history |
| Admin | Products, product thresholds, trigger simulator, trigger events, zones (weather alert, exposure cap), zone exposure, perils, pricing rules, policies, claims, payments (refunds), payouts (automatic, history), users (active / inactive / suspended), notifications, audit log |

Everyone who is logged in can open the **Measurement details & thresholds** panel from the gauge icon in the header. Admins can **Update value** there.

## Folder structure

```
src/app/
├── app.routes.ts        all routes (lazy-loaded, guarded, each with a page title)
├── app.config.ts        router, HTTP interceptors, NgRx store/effects, en-IN locale
├── core/                api endpoints, guards, interceptors, JWT and token services, page-title strategy
├── features/
│   ├── components/      one folder per screen (customer-*, underwriter-*, claims-officer-*, admin-*)
│   ├── dtos/            TypeScript types matching the backend
│   ├── services/        HTTP services
│   ├── state/           NgRx actions / reducers / effects / selectors per feature
│   └── utils/           plain-English trigger sentences, file helpers
├── layouts/             public, auth and app layouts, header
└── shared/              status badge, stat card, dialogs, toasts, zone map, measurement panel, illustration …
```

## Good to know

- **Login:** tokens are stored in local storage, sent by the auth interceptor, and refreshed silently when they expire. Suspended or inactive accounts are refused at login and signed out.
- **Live updates:** notifications arrive over Server-Sent Events and show in the header bell.
- **Confirmations:** all confirmations use in-app dialogs (`DialogService`), not browser pop-ups.
- **Formatting:** money and dates use the Indian format (`en-IN`), e.g. ₹1,50,000.
- **Test mode checkout:** use card `4242 4242 4242 4242`. `4000 0000 0000 0002` simulates a decline. No real money moves.
