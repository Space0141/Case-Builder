# API Routes

## Auth
- `GET /api/auth/discord`
- `GET /api/auth/discord/callback`
- `GET /api/auth/me`
- `POST /api/auth/logout`

## Dashboard
- `GET /api/dashboard/summary`

## Cases
- `GET /api/cases`
- `POST /api/cases`
- `GET /api/cases/:id`
- `PUT /api/cases/:id`
- `POST /api/cases/:id/suspects`
- `POST /api/cases/:id/charges`
- `GET /api/cases/:id/timeline`

## Reports
- `GET /api/reports/:caseId`
- `PUT /api/reports/:caseId`
- `POST /api/reports/:caseId/comments`
- `GET /api/reports/:caseId/comments`

## Evidence
- `GET /api/evidence/:caseId`
- `POST /api/evidence/:caseId/upload`

## Exports
- `GET /api/exports/:caseId/pdf`
- `GET /api/exports/:caseId/docx`
- `POST /api/exports/:caseId/google-doc`
- `GET /api/exports/:caseId/court-packet`

## Admin
- `GET /api/admin/users`
- `PUT /api/admin/users/:id/role`
- `GET /api/admin/settings`
- `PUT /api/admin/settings`

## Google
- `GET /api/google/connect`
- `GET /api/google/callback`
