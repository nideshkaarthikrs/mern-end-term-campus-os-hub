# COSH — Campus Open-Source Hub

COSH helps students find open-source projects in their campus community, claim issues that match their skills, and build a record of completed contributions.

## Problem and users

Students often do not know which campus projects need help or which issues fit their experience. Maintainers need a place to publish work and track who is contributing. COSH brings those workflows together in one application.

- **Students** discover projects and issues, claim work, and view their completed contributions.
- **Maintainers** publish projects and issues, see claimants, and confirm completed work.

## Main workflows

1. A maintainer creates a project and publishes issues with a difficulty and required skills.
2. A student searches and filters projects or issues, then claims an open issue.
3. The maintainer reviews the work and marks the claimed issue as completed.
4. The student sees the verified issue in their contribution history and profile counts.

Students can withdraw their own claims. Maintainers can edit or delete unclaimed issues and manage their own projects. Completed contributions are confirmed manually by maintainers; COSH does not connect to GitHub activity.

## Features

- Registration, login, logout, and student or maintainer roles
- Editable profiles with skills and contribution history
- Project and issue management with ownership checks
- Issue claiming, withdrawal, and maintainer completion
- Keyword search and filters for technology, skill, difficulty, and status
- Loading, empty, success, and error states

## Tech stack and architecture

The frontend uses React, Vite, JavaScript, and Tailwind CSS. The API uses Node.js and Express. MongoDB stores users, projects, and issues through Mongoose.

```text
React frontend → Express API → MongoDB
```

The frontend calls `/api` in production. Vercel forwards those requests to the Render API. Authentication uses an HTTP-only cookie, and the API checks the current account role and resource ownership before protected actions.

## Run locally

Use Node.js 22.12 or newer and a MongoDB connection string.

1. In `server`, run `npm ci`.
2. Copy `server/.env.example` to `server/.env`. Set `MONGO_URI` and `JWT_SECRET`. Keep this file out of Git.
3. Run `npm run dev` from `server`. The API starts on port 5005 by default.
4. In another terminal, run `npm ci` and then `npm run dev` from `client`.
5. Open `http://localhost:5173`.

### Environment variables

| Variable | Used by | Purpose |
| --- | --- | --- |
| `MONGO_URI` | Server | MongoDB connection string; required |
| `JWT_SECRET` | Server | Secret for signing login tokens; required |
| `PORT` | Server | API port; defaults to 5005 locally |
| `NODE_ENV` | Server | Set to `production` when deployed |
| `CLIENT_URL` | Server | Allowed browser origin when calling Render directly; optional with the Vercel proxy |
| `VITE_API_URL` | Client | Optional API URL override for local or custom setups |
| `API_ORIGIN` | Vercel | HTTPS origin of the Render API for the production proxy |

## Checks

- `cd server && npm test` runs the backend tests.
- `cd client && npm run build` checks the production frontend build.
- `cd client && npm run lint` checks the frontend source.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the MongoDB Atlas, Render, and Vercel setup. Add the public application URL here after deployment.
