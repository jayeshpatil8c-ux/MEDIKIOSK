# MediKiosk two-device demo

MediKiosk runs the existing React/Vite kiosk and Node server together. The server is the source of truth: patient data is persisted server-side and dashboard clients receive Server-Sent Events (SSE), then refetch the latest state from the API.

## Local start

```bash
npm install
cp .env.example .env
npm run dev
```

`npm run dev` starts the Node server on port `3000` and mounts the Vite middleware in development. For a production build:

```bash
npm run build
npm start
```

## Persistence

The development repository stores JSON on the server at `data/medikiosk.json` by default. Set `MEDIKIOSK_DATA_FILE` to an absolute or deployment-specific persistent path. The file is ignored by Git. `DATABASE_URL` is reserved for a future hosted adapter; no database credentials are placed in the browser.

## Two-device demonstration

1. Start the server on a machine reachable by both devices, using `npm run dev`.
2. On the patient device open `http://SERVER_IP:3000/kiosk`.
3. On the doctor device open `http://SERVER_IP:3000/doctor`.
4. Allow microphone access on the kiosk if voice mode is used. Touch and keyboard entry remain available.
5. Complete consent and identity. The kiosk creates the patient on the server immediately, so the doctor queue shows the new case while registration is in progress.
6. Continue answering questions. Confirmed intake updates are persisted through `/api/patients/:id/intake`; the doctor client receives an SSE event at `/api/realtime` and refreshes automatically without a manual reload.
7. Complete review to move the patient into the existing doctor workflow and queue.

Both devices must be on the same network and the server firewall must allow port `3000`. For a deployed demo, expose the Node server over HTTPS and set `FRONTEND_URL` to the deployed origin.

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
curl -X POST http://localhost:3000/api/demo/reset
```

Reset requires confirmation in the UI. It reseeds the server repository and broadcasts a queue update to connected dashboards.

## Roles and connection status

- `/kiosk`: patient registration entry point
- `/doctor`: doctor station entry point
- `/admin`: existing administration view

Every client shows `LIVE CONNECTED`, `RECONNECTING...`, or `OFFLINE`. On reconnect, the client refetches patients, queue, appointments, audit, notifications, and analytics from the server.

## Safety and privacy

The real-time layer only transports persisted application records between authorized app clients; it does not use localStorage for patient synchronization. Safety messages remain non-diagnostic and require clinician review. The existing AI, document, triage, Ayurveda, Homeopathy, audit, and analytics workflows remain available.
