# MediKiosk two-device demo

MediKiosk runs the existing React/Vite kiosk and Node server together. The server is the source of truth: patient data is persisted server-side and dashboard clients receive Server-Sent Events (SSE), then refetch the latest state from the API.

## Local start

```bash
npm install
cp .env.example .env
npm run dev
```

`npm run dev` starts the Node server on `PORT` or `8080` and mounts the Vite middleware in development. For a production build:

```bash
npm run build
npm start
```

## Persistence

The database adapter uses SQLite for local development when `DATABASE_URL` is empty. It creates `data/medikiosk.sqlite`, which is ignored by Git. Production deployments must set `DATABASE_URL` to a persistent PostgreSQL-compatible database; no JSON file is used as the production source of truth.

The schema includes `patients`, `patient_cases`, `case_answers`, `queue`, `safety_flags`, `documents`, `doctor_notes`, and `audit_events`. Database initialization and schema creation happen before the server accepts requests. Every case is represented by a patient/case ID, status, and created/updated timestamps.

## Two-device demonstration

1. Start the server on a machine reachable by both devices, using `npm run dev`.
2. On the patient device open `http://SERVER_IP:8080/kiosk`.
3. On the doctor device open `http://SERVER_IP:8080/doctor`.
4. Allow microphone access on the kiosk if voice mode is used. Touch and keyboard entry remain available.
5. Complete consent and identity. The kiosk creates the patient on the server immediately, so the doctor queue shows the new case while registration is in progress.
6. Continue answering questions. Confirmed intake updates are persisted through `/api/patients/:id/intake`; the doctor client receives an SSE event at `/api/realtime` and refreshes automatically without a manual reload.
7. Complete review to move the patient into the existing doctor workflow and queue.

Both devices must be on the same network and the server firewall must allow port `8080`. For Cloud Run, set `DATABASE_URL`, deploy the built Node server, and use the Cloud Run HTTPS URL on both devices. Set `FRONTEND_URL` to the exact frontend origin when the frontend and API are hosted on different origins.

## Main API and realtime routes

- `POST /api/patients` creates the initial patient record.
- `PATCH /api/patients/:id/demographics` saves identity changes.
- `POST /api/patients/:id/intake` saves structured answers and safety data.
- `GET /api/patients` returns the live queue source.
- `GET /api/cases` and `GET /api/cases/:id` provide case-oriented aliases.
- `POST /api/cases/:id/answers` incrementally merges answers.
- `PATCH /api/cases/:id/status` changes the persistent case status.
- `GET /api/realtime` provides typed SSE events such as `patient.created`, `case.updated`, `case.status.changed`, and `safety_flag.created`.
- `GET /api/health` reports server time, persistence path, and connected SSE clients.

## Reset demo data

Use the existing Admin/Demo reset action, or run:

```bash
curl -X POST http://localhost:8080/api/demo/reset
```

Reset requires confirmation in the UI. It reseeds the server repository and broadcasts a queue update to connected dashboards.

## Roles and connection status

- `/kiosk`: patient registration entry point
- `/doctor`: doctor station entry point
- `/admin`: existing administration view

Every client shows `LIVE CONNECTED`, `RECONNECTING...`, or `OFFLINE`. On reconnect, the client refetches patients, queue, appointments, audit, notifications, and analytics from the server.

## Cloud Run deployment

Build with `npm run build`, then run `npm start`. Cloud Run supplies `PORT`; the server binds to `0.0.0.0` and falls back to `8080` locally. Configure these server-side environment variables:

- `DATABASE_URL`: required production PostgreSQL connection string.
- `DATABASE_SSL`: keep `true` for managed PostgreSQL unless the private connection explicitly does not require TLS.
- `FRONTEND_URL`: exact allowed browser origin, or leave empty when frontend and API share the same origin.
- `PORT`: supplied by Cloud Run; local fallback is `8080`.
- `GEMINI_API_KEY`: optional server-side AI key; never expose it as a frontend variable.

SSE is served from the same Cloud Run origin at `/api/realtime`, so deployed doctor dashboards reconnect and resynchronize from PostgreSQL after network interruptions or backend restarts.

## Safety and privacy

The real-time layer only transports persisted application records between authorized app clients; it does not use localStorage for patient synchronization. Safety messages remain non-diagnostic and require clinician review. The existing AI, document, triage, Ayurveda, Homeopathy, audit, and analytics workflows remain available.
