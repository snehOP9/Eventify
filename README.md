# Eventify - Premium Online Event Registration Platform

Eventify is a full-stack event registration platform with a luxury, futuristic frontend and Spring Boot backend.

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
2. Update credentials in `backend/src/main/resources/application.yml` if needed
3. `cd backend`
4. `mvn spring-boot:run`

Default URL: http://localhost:8080

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
