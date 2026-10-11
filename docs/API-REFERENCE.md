# API Reference

The frontend communicates with the Spring Boot backend under the `/api` prefix.

## Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | Create an account |
| POST | `/api/auth/login` | Authenticate a user |

## Events

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/events` | List events |
| GET | `/api/events/{id}` | Get an event |
| POST | `/api/events` | Create an event |
| PUT | `/api/events/{id}` | Update an event |
| DELETE | `/api/events/{id}` | Delete an event |

## Registrations

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/registrations` | Create a registration |
| GET | `/api/registrations/user/{userId}` | List a user's registrations |
| DELETE | `/api/registrations/{registrationId}` | Cancel a registration |

## Dashboard

`GET /api/dashboard/summary` returns the dashboard summary used by the application.

When adding an endpoint, update this document and keep request validation and error responses consistent with the existing API.