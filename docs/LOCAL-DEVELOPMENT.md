# Local Development

Eventify has separate frontend and backend applications.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite development server normally runs on `http://localhost:5173`.

## Backend

Create the PostgreSQL database used by the application, configure the values from `backend/.env.example`, then run:

```bash
cd backend
mvn spring-boot:run
```

The backend normally runs on `http://localhost:8080`.

## Connecting the applications

The frontend API base URL should point to:

```text
http://localhost:8080/api
```

Override it with `VITE_API_BASE_URL` when needed.

## Before opening a PR

- Verify the frontend starts successfully.
- Verify the backend starts successfully.
- Test the affected user flow.
- Do not commit `.env` files or credentials.