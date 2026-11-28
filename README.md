# Hop

Every way across Lagos, ranked for the hour you leave. Hop compares BRT, trains, danfo, keke, ride-hailing and self-drive rental, and rents cars with or without a driver when that wins.

- Landing page: `/`
- Demo app: `/app` (Plan, Live map, Rent, Trips, Account)

## Run it

```bash
npm install
npm run dev      # http://localhost:5173, with the API served locally
npm run build
npm run lint
```

## How it’s built

- **Frontend:** React 19, Vite, Tailwind v4, framer-motion, MapLibre with Hop’s own map style (OpenFreeMap tiles).
- **API:** Web-standard handlers in `api/`, deployed as Vercel Functions. In development, a Vite plugin serves the same handlers.
- **Logic and demo data:** in `server/` (planner, traffic model, network, fleet). Shared types are in `shared/`.
- **Road shapes:** `server/data/roads.ts` is generated once from OSRM (© OpenStreetMap contributors) by `node scripts/fetch-roads.ts`.

## Docs

- [Product, workflows and roadmap](docs/ROADMAP.md)
- [Design audit and redesign notes](docs/design-audit/DESIGN_REPORT.md)

Traffic in the demo is simulated, and fares are estimates. Car photos are credited on each car’s page.
