# Contributing to Sync-Chat

Thanks for your interest in contributing to Sync-Chat.

Sync-Chat is a full-stack, real-time chat application with direct messaging, group chat, role-based group management, unread tracking, presence, and browser push notifications.

## 1. Project Overview

This repository is split into two apps:

- `backend/` (Node.js + Express + Socket.IO + MongoDB + Redis)
- `frontend/` (React + Vite + React Query + Socket.IO client + Tailwind CSS)

Current implemented feature scope includes:

- Cookie-based JWT authentication (`signup`, `login`, `logout`, `refresh-token`, `me`, `change-password`)
- Direct conversations and group conversations
- Group roles (`owner`, `admin`, `member`) with role-based actions
- Real-time events for new/update/delete message, typing, and online users
- Message edit and delete windows (time-bound)
- Conversation/message pagination
- Unread summary and per-conversation unread counts
- Browser push notifications with device subscription management

Backend architecture follows:

`Route -> Controller -> Service -> Repository -> Model`

## 2. Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- Redis (required for presence + Socket.IO Redis adapter)

### Clone and install

```bash
git clone https://github.com/Rudrasharma214/realtime-chat-app.git
cd realtime-chat-app

cd backend
npm install

cd ../frontend
npm install
```

### Environment setup

Create `backend/.env`:

```env
NODE_ENV=development
PORT=3000

MONGO_URI=mongodb://localhost:27017/sync-chat

JWT_SECRET=your_jwt_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=
REDIS_DB=0
REDIS_TLS=false

VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:no-reply@sync-chat.local
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
VITE_VAPID_PUBLIC_KEY=
```

### Run locally

In one terminal:

```bash
cd backend
npm run dev
```

In another terminal:

```bash
cd frontend
npm run dev
```

### Helpful scripts

Frontend:

- `npm run lint`
- `npm run format`
- `npm run build`

Backend:

- `npm run dev`
- `npm start`

## 3. Contribution Workflow

1. Fork this repository.
2. Create a feature/fix branch from `main`:

   ```bash
   git checkout -b feature/short-description
   ```

3. Make focused changes (one concern per PR).
4. Run checks before pushing:

   ```bash
   cd frontend && npm run lint
   cd frontend && npm run format:check
   ```

5. Use clear commit messages:

   - `feat(chat): add unread badge animation`
   - `fix(socket): prevent duplicate join on reconnect`
   - `docs(contributing): improve setup troubleshooting`

6. Push your branch and open a Pull Request.
7. In the PR description, include:

   - What changed
   - Why it changed
   - How it was tested
   - Screenshots/GIFs for UI changes

## 4. Coding Guidelines

Keep contributions consistent with the current codebase:

### General

- Prefer small, readable modules.
- Keep API response shape consistent: `success`, `message`, `data`, `status`.
- Avoid unrelated refactors in the same PR.

### Backend

- Preserve the `Route -> Controller -> Service -> Repository -> Model` flow.
- Put business logic in `services/`, not controllers.
- Reuse shared response helpers and status constants.
- Validate input early (required fields, ObjectId checks, types).
- For real-time changes, ensure socket event names and payload shapes stay consistent.

### Frontend

- Keep components feature-focused (`components/chat`, `components/group`, `components/settings`).
- Use React Query hooks for server-state flows.
- Keep socket listeners cleaned up in `useEffect` returns.
- Reuse existing service wrappers in `src/services/` instead of raw fetch calls.

### Formatting and linting

- Follow frontend ESLint and Prettier config.
- Run lint/format checks before submitting.

## 5. Missing Features (Contribution Opportunities)

These are high-impact areas that are still incomplete or not production-hardened.

### Core Features

- File/image upload pipeline for chat messages (storage + API + UI).
- User profile management (profile photo upload/edit, richer profile fields).
- Password reset flow (forgot password + reset token path).
- Email verification flow after signup.
- Better search: conversation/message search beyond current basic filtering.

### Advanced Features

- Message reactions and pinned messages.
- Voice/video calling (UI currently has placeholders).
- Message forwarding and rich attachment previews.
- Group invite links and member self-leave flow.
- Better read-receipt UX (status is tracked, UI can be expanded).

### Performance Improvements

- Add more targeted DB indexes for high-traffic query paths.
- Improve pagination strategy for very large histories.
- Reduce duplicate real-time fetch/update work in busy conversations.
- Add backend caching for expensive repeated queries.
- Add observability/metrics for socket throughput and message latency.

### Security Improvements

- Add robust request validation/sanitization on all write endpoints.
- Add API rate limiting (auth, message send, search, group operations).
- Add security headers (Helmet) and tighten CORS/cookie hardening for production.
- Add CSRF protection strategy for cookie-authenticated flows.
- Add audit logging for sensitive actions (auth events, role changes, deletes).

### Known Limitations / Cleanup Tasks

- Duplicate message repository files (`message.repository.js` and `message.repositories.js`) should be consolidated.
- Message deletion state uses two similar flags (`deletedForEveryone`, `isDeletedForEveryone`) and can be normalized.
- `backend/src/config/sendEmail.js` is scaffolded/commented and not active.
- No automated test suite is currently present.

## 6. Bug Reporting Guidelines

Please open a GitHub issue with:

- Clear title
- Environment details (OS, browser, Node version)
- Steps to reproduce
- Expected behavior
- Actual behavior
- Logs/screenshots if available

Bug report template:

```md
## Summary

## Steps to Reproduce
1.
2.
3.

## Expected Result

## Actual Result

## Environment
- OS:
- Browser:
- Node:
```

## 7. Feature Request Guidelines

When requesting a feature, include:

- Problem statement (what user pain exists now)
- Proposed solution
- Scope (backend, frontend, socket, data model)
- Acceptance criteria
- Optional UI/API examples

Feature requests that map to the missing-feature roadmap above are most likely to be accepted quickly.

## Final Notes

- Keep PRs beginner-friendly: readable code, clear naming, and concise descriptions.
- If you plan a large change, open an issue first to discuss direction and avoid rework.
- Contributions that improve reliability, security, and maintainability are especially valuable.
