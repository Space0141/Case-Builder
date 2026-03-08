# Case Builder

Case Builder is a full-stack law-enforcement style Records Management System (RMS) for detailed investigation reporting.

## Tech Stack
- Frontend: React, TailwindCSS, React Router, Tiptap
- Backend: Node.js, Express, Passport (Discord OAuth2)
- Database: MongoDB
- Storage: Local uploads folder (`backend/uploads`)
- Export: PDF, DOCX, optional Google Docs API

## Repository Structure
```text
/frontend
/backend
/database
/docs
/.github/workflows
```

## Quick Start
1. Copy env templates:
   - `cp .env.example .env`
   - `cp backend/.env.example backend/.env`
   - `cp frontend/.env.example frontend/.env`
2. Install dependencies:
   - `npm install`
3. Configure backend env (`backend/.env`):
   - `MONGODB_URI`
   - `MONGODB_DB_NAME`
   - Discord OAuth values
4. Seed sample data (optional):
   - `node database/seed.mongodb.js`
5. Start backend:
   - `npm run dev:backend`
6. Start frontend:
   - `npm run dev:frontend`

## Discord OAuth Setup
1. Create app in [Discord Developer Portal](https://discord.com/developers/applications).
2. Add OAuth2 redirect URI: `http://localhost:4000/api/auth/discord/callback`.
3. Set env values:
   - `DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`
   - `DISCORD_CALLBACK_URL`

## Google Docs Export (Optional)
Disabled by default. Enable only if needed:
- `ENABLE_GOOGLE_EXPORT=true`
- `VITE_ENABLE_GOOGLE_EXPORT=true`
- configure Google OAuth env values

## API Overview
See [docs/api-routes.md](/docs/api-routes.md).

## Deployment
See [docs/deployment.md](/docs/deployment.md).
