# Deployment Guide

## Frontend (GitHub Pages)
1. In GitHub repository settings, enable Pages from GitHub Actions.
2. Set `VITE_API_BASE_URL` to your deployed backend URL plus `/api`.
3. Push to `main` to trigger build/test/deploy.

## Backend Hosting
Deploy backend separately (Render, Railway, Fly.io, VPS, etc.).
Required env vars:
- `MONGODB_URI`
- `MONGODB_DB_NAME`
- `SESSION_SECRET`
- `FRONTEND_URL`
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_CALLBACK_URL`
- `ENABLE_GOOGLE_EXPORT`

Optional (if Google export enabled):
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`

## Database
Seed sample Mongo data:
- `node database/seed.mongodb.js`
