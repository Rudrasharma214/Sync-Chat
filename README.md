# Sync-Chat

Sync-Chat is a full-stack, real-time messaging application with direct chat, group chat, role-based group management, browser push notifications, and live presence powered by Socket.IO + Redis.

## Main Features

- Authentication with secure cookie-based JWT sessions (signup, login, logout, refresh token, get current user).
- Direct conversations (create or fetch one-to-one chat).
- Group conversations with member roles (`owner`, `admin`, `member`).
- Real-time messaging with Socket.IO (new messages, updates, deletes, typing events).
- Message lifecycle controls:
	- Send text messages and replies.
	- Edit messages (within a 2-hour update window).
	- Delete for me / delete for everyone (within a 24-hour window).
- Conversation and message pagination support.
- Unread message tracking and unread summary endpoint.
- Presence tracking (online/offline users) across multiple tabs/devices.
- Browser push notifications with per-user preference/subscription management.
- Frontend protected routes and auth-aware navigation.

## Architecture Pattern

This project follows a layered modular monolith architecture.

### Backend Pattern

Request flow:

`Route -> Controller -> Service -> Repository -> Model`

- `routes/`: HTTP endpoint definitions per domain.
- `controllers/`: request/response handling and input extraction.
- `services/`: business rules and orchestration.
- `repositories/`: database access abstraction over Mongoose.
- `models/`: schema definitions.
- `middleware/`: auth guard and centralized error handling.
- `config/`: environment loading, CORS, DB, logger, push, socket config.
- `redis/`: Redis connection used by presence and Socket.IO adapter.

### Frontend Pattern

The frontend uses React with a domain-oriented structure:

- `routes/`: route protection and page routing.
- `pages/`: top-level views (`Welcome`, `ChatDashboard`, `Groups`, `Settings`, auth pages).
- `components/`: reusable UI grouped by feature (`chat`, `group`, `settings`).
- `context/`: global app state for authentication and theme.
- `hooks/`: React Query read/write hooks and socket integration.
- `services/`: API client, domain API wrappers, browser push, socket service.

### Real-Time Design

- Socket authentication uses JWT from cookie or socket auth token.
- Each user joins a user-specific room and authorized conversation rooms.
- Events include: `newMessage`, `messageUpdated`, `messageDeleted`, `typing`, `onlineUsers`.
- Redis adapter enables horizontal scaling and shared room event propagation.

### Auth Design

- Access and refresh tokens are issued on login.
- Tokens are stored in `httpOnly` cookies.
- Protected endpoints use auth middleware to verify token and attach `req.user`.
- Frontend attempts token refresh on `401` and retries where applicable.


## Project Structure

```text
Sync-Chat/
	backend/
		src/
			app.mjs
			server.mjs
			config/
			controllers/
			middleware/
			models/
			redis/
			repositories/
			routes/
			services/
			utils/
	frontend/
		src/
			components/
			context/
			hooks/
			pages/
			routes/
			services/
			utils/
```

## Tech Stack

### Frontend

- React
- React Router
- React Query
- Tailwind CSS (via Vite plugin)
- Socket.IO Client
- Axios

### Backend

- Node.js
- Express
- Socket.IO
- Mongoose
- Redis + `@socket.io/redis-adapter`
- Argon2
- JSON Web Token
- Winston
- Web Push

## API Domains

- `/api/auth`
- `/api/conversations`
- `/api/messages`
- `/api/groups`
- `/api/notifications`

## Environment Variables

Create a `.env` file in `backend/`:

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

Create a `.env` file in `frontend/`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

## Getting Started

### 1. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Start backend

```bash
cd backend
npm run dev
```

### 3. Start frontend

```bash
cd frontend
npm run dev
```

## Available Scripts

### Backend

- `npm run dev` - start backend with nodemon
- `npm start` - start backend in production mode

### Frontend

- `npm run dev` - start Vite dev server
- `npm run build` - create production build
- `npm run preview` - preview production build locally
- `npm run lint` - run ESLint
- `npm run format` - run Prettier write
- `npm run format:check` - run Prettier check

## Current Version Scope (V1)

V1 focuses on stable real-time messaging foundations:

- secure auth and session flow
- direct and group messaging
- message edit/delete lifecycle
- unread tracking and notification plumbing
- scalable socket presence with Redis adapter
