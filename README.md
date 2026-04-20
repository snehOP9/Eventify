# Eventify - Premium Online Event Registration Platform

Eventify is a full-stack event registration platform with a luxury, futuristic frontend and Spring Boot backend.

Live deployment: https://eventify-live-snehop9.vercel.app/

## Stack

- Frontend: React + Vite + Axios + Framer Motion
- Backend: Spring Boot 3 + Java 21 + JPA + Validation
- Database-ready: PostgreSQL configuration included

## Folder Structure

- frontend: premium responsive UI, pages, reusable components, API client
- backend: layered architecture (controller/service/repository/dto/entity)

## Frontend Features

- Landing page with immersive hero and animated visual blocks
- Events listing with search and filters
- Event details with ticket blocks, timeline, FAQ, and speaker area
- Multi-step registration flow with animated progress
- User dashboard and organizer dashboard views
- Dark/light mode, glassmorphism cards, glow buttons, transitions

## Backend Features

- User auth APIs (signup/login)
- Event CRUD APIs
- Registration create/read/cancel APIs
- Dashboard summary API
- Validation, exception handling, CORS config

## Run Frontend

1. `cd frontend`
2. `npm install`
3. `npm run dev`

Default URL: http://localhost:5173

## Run Backend

1. Create PostgreSQL DB: `event_platform`
2. `cd backend`
3. Copy env template and fill values:
	- `copy .env.example .env` (Windows)
	- Set OAuth credentials, SMTP, and Razorpay test keys as needed
4. `mvn spring-boot:run`

Default URL: http://localhost:8080

## OAuth, SMTP, and Razorpay Setup

Backend reads these from environment variables (see `backend/.env.example`):

- Google OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- GitHub OAuth: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- Frontend callback: `APP_OAUTH2_REDIRECT_URI`
- Backend OAuth callback registered in Google/GitHub Console: `http://localhost:8080/login/oauth2/code/google` and `http://localhost:8080/login/oauth2/code/github`
- Mail provider toggle: `APP_MAIL_ENABLED`, `APP_MAIL_PROVIDER` (`smtp` or `resend`), `APP_MAIL_FROM`
- SMTP mailer (when `APP_MAIL_PROVIDER=smtp`): `SPRING_MAIL_HOST`, `SPRING_MAIL_PORT`, `SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD`
- Resend HTTP mail API (when `APP_MAIL_PROVIDER=resend`): `APP_MAIL_RESEND_API_KEY`, optional `APP_MAIL_RESEND_ENDPOINT`
- Razorpay test keys: `APP_RAZORPAY_KEY_ID`, `APP_RAZORPAY_KEY_SECRET`

The backend still accepts the older `/api/login/oauth2/code/*` callback paths for compatibility, but the default local configuration now uses the standard Spring Security callback path without `/api`.

If mail is disabled (`APP_MAIL_ENABLED=false`), OTP and registration emails are logged to console for local development.

For Railway-style hosted deployments where SMTP ports may be blocked, prefer `APP_MAIL_PROVIDER=resend` so emails are sent over HTTPS.

## API Base URL

Frontend expects: `http://localhost:8080/api`

You can override with:

- `frontend/.env` with `VITE_API_BASE_URL=http://localhost:8080/api`

## Key API Endpoints

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/events`
- `GET /api/events/{id}`
- `POST /api/events`
- `PUT /api/events/{id}`
- `DELETE /api/events/{id}`
- `POST /api/registrations`
- `GET /api/registrations/user/{userId}`
- `DELETE /api/registrations/{registrationId}`
- `GET /api/dashboard/summary`

## Notes

- Frontend includes mock fallback for events if backend is unavailable.
- Backend security is open by default for development speed.
- Production hardening (JWT auth, role guards, payment provider) can be added next.
