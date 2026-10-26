# Deploy COSH

The frontend runs on Vercel, the API runs on Render, and MongoDB Atlas stores the data. Browser requests to `/api` pass through the Vercel domain to Render, so login cookies stay on the same site.

## 1. MongoDB Atlas

Create an Atlas database and a database user with access to that database. Copy the application connection string and include the database name. Keep the URI out of Git.

After creating the Render service, find its outbound IP ranges under **Connect → Outbound**. Add those ranges to the Atlas project's IP access list. Use the service's ranges rather than opening the database to every IP. See [Render outbound IPs](https://render.com/docs/outbound-ip-addresses) and [Atlas IP access lists](https://www.mongodb.com/docs/atlas/security/ip-access-list/).

## 2. Render API

Create a [Render Blueprint](https://render.com/docs/infrastructure-as-code) from this repository's `render.yaml`. Enter the Atlas connection string for `MONGO_URI` when prompted. Render generates `JWT_SECRET` and sets `NODE_ENV=production`.

The first deploy may fail before its outbound IP ranges are on the Atlas access list. Add those ranges and redeploy. Wait for the service to become healthy at `https://<render-service-url>/api/health`. A `503` response means the API cannot currently reach MongoDB; check the connection string and Atlas IP access list. Keep the Render service URL for the next step.

## 3. Vercel frontend

Import the same GitHub repository into Vercel. Set the [project root directory](https://vercel.com/docs/monorepos) to `client` and use the Vite defaults (`npm run build`, output directory `dist`). Add the environment variable `API_ORIGIN` with the Render service's HTTPS origin, for example `https://cosh-api.onrender.com`. Do not include `/api` or a trailing path. Leave `VITE_API_URL` unset so the frontend requests its own `/api` path.

The `client/vercel.js` configuration uses [Vercel rewrites](https://vercel.com/docs/routing/rewrites) to forward `/api/*` to Render and send React page routes to `index.html`. Once deployment finishes, check `https://<vercel-site>/api/health`, open `/login`, and test registration, project creation, issue claiming, and completion with the appropriate accounts.

## Configuration notes

- Set `CLIENT_URL` on Render only if browsers will call the Render API directly. Use the exact frontend origin without a trailing slash. The Vercel proxy does not need this setting.
- Keep `MONGO_URI` and `JWT_SECRET` in Render's environment settings. Never copy them into Vercel's frontend variables or Git.
- Local development still uses `http://localhost:5005/api`. `VITE_API_URL` can override the client API URL when needed.
- The free Render web service [spins down after inactivity](https://render.com/docs/free), so its first request may take longer.
