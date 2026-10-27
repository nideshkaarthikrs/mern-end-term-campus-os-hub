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
- Gemini-powered issue recommendations based on a student's skills, learning goal, and recent contributions
- Loading, empty, success, and error states

## Tech stack and architecture

The frontend uses React, Vite, JavaScript, and Tailwind CSS. The API uses Node.js and Express. MongoDB stores users, projects, and issues through Mongoose.

```text
React frontend → Express API → MongoDB
```

The frontend calls `/api` in production. Vercel forwards those requests to the Render API. Authentication uses an HTTP-only cookie, and the API checks the current account role and resource ownership before protected actions.

For recommendations, the API ranks up to 100 recent open issues and sends the best 15 candidates to Gemini. It validates the returned issue IDs, removes duplicate or unavailable suggestions, and checks that the issues are still open. The model never claims an issue or changes contribution records.

Students can use **Find issues for me** on the issue discovery page. Gemini receives their skills, optional learning goal, up to five recent contribution summaries, and candidate issue details. Account names, email addresses, passwords, and login tokens are excluded. If Gemini is unavailable, unconfigured, or over quota, the page clearly labels the results as skill-based suggestions.

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
| `GEMINI_API_KEY` | Server | Optional Google AI Studio key for AI recommendations; keep it on the server |
| `GEMINI_MODEL` | Server | Gemini model; defaults to `gemini-3.5-flash-lite` |

The recommendation endpoint allows three new Gemini requests per student per minute. Identical requests are cached for five minutes; provider failures are cached for 30 seconds. These limits and caches are held in server memory and reset when the server restarts. The existing application and skill-based recommendations work without a Gemini key. Google applies its own [free-tier quotas and data-use terms](https://ai.google.dev/gemini-api/docs/pricing).

## Checks

- `cd server && npm test` runs the backend tests.
- `cd client && npm run build` checks the production frontend build.
- `cd client && npm run lint` checks the frontend source.

## Deployment

Live application: [campus-os-hub.vercel.app](https://campus-os-hub.vercel.app/)

Backend health: [cosh-api.onrender.com/api/health](https://cosh-api.onrender.com/api/health)

## Demo video

[Watch the COSH demo](https://drive.google.com/file/d/1-gwSDKgwz-lLkeqjG1WGOJtKNaYzoPJv/view?usp=drive_link)
