# Chat App

A full-stack real-time chat application with end-to-end encryption, typing indicators, read receipts, online presence tracking, and password recovery.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4 (glassmorphism UI)
- **Real-time**: Socket.io-client
- **Encryption**: TweetNaCl (curve25519-xsalsa20-poly1305)
- **Push**: Web Push API + Service Workers
- **State**: Context API (Auth, Socket, Theme)

### Backend
- **Runtime**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Auth**: JWT access + refresh tokens, bcrypt.js
- **Real-time**: Socket.io
- **Email**: Nodemailer (password reset, welcome emails)
- **Logging**: Pino (structured JSON)
- **Security**: express-rate-limit, input sanitization, custom validators

## ✨ Features

- **Authentication** — signup, login, JWT access/refresh token rotation, auto-renew on 401
- **Real-time messaging** — instant delivery via Socket.io with sent/delivered/read status
- **End-to-end encryption** — NaCl box key exchange, messages encrypted before leaving the client
- **Typing indicators** — real-time visibility when someone is typing
- **Read receipts** — sender sees status change on message read
- **Online presence** — green dot indicator synced via socket connection map
- **Push notifications** — browser-native via Web Push API (service worker)
- **Message replies** — reply to a specific message with quoted preview
- **Message deletion** — soft delete synced across all clients in real-time
- **Conversation list** — sorted by last message with unread count badges
- **User search** — filter conversations by name or username
- **Message history pagination** — infinite scroll with 50-message pages
- **Password recovery** — forgot password flow with 6-digit code, 10-minute expiry, email delivery
- **Profile management** — view & update profile, upload profile picture
- **Dark/light theme** — toggleable with persistent preference
- **Input validation** — server-side schema validation on all endpoints
- **Rate limiting** — auth endpoints protected against brute-force
- **XSS protection** — HTML tag stripping middleware on all input
- **Structured error handling** — custom error classes with consistent JSON responses

## 📁 Project Structure

```
├── server/                          # Backend
│   ├── controllers/                 # Route handlers (auth, message, conversation, user)
│   ├── services/                    # Business logic layer
│   ├── model/                       # Mongoose schemas (User, Message, Conversation)
│   ├── routes/                      # Express route definitions
│   ├── middleware/                   # Auth, validation, rate limiting, error handling, sanitization
│   ├── socket/                      # Socket.io connection + event handlers
│   ├── validators/                  # Request schema validators
│   ├── errors/                      # Custom error classes (AppError, NotFound, Unauthorized, Validation)
│   ├── config/                      # Logger config
│   ├── db/                          # MongoDB connection
│   └── utils/                       # Token generation, async handler wrapper
│
└── frontend/                        # Frontend (Next.js)
    ├── public/
    │   └── sw.js                    # Service worker for push notifications
    ├── src/
    │   ├── app/                     # Pages (chat, login, signup, forgot-password, reset-password)
    │   ├── components/              # UI components organized by domain
    │   │   ├── auth/                # ProtectedRoute, GuestOnlyRoute
    │   │   ├── chat/                # ChatArea, MessageList, MessageInput, StatusIcon, EmojiPicker
    │   │   ├── sidebar/             # Sidebar with conversation list
    │   │   └── shared/              # Avatar, Skeleton, ProfileModal, ConfirmDialog, ErrorBoundary
    │   ├── context/                 # Auth, Socket, Theme providers
    │   ├── hooks/                   # useMessages, useConversations, useTyping, useOnlineStatus
    │   ├── lib/                     # API client, crypto utilities, push notification helpers
    │   └── types/                   # TypeScript type definitions
    └── next.config.mjs
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally or a remote URI

### Backend Setup

```bash
cd server
cp .env.example .env
# Configure DB_URI, JWT secrets, email credentials, VAPID keys
npm install
npm start               # starts on port 9000
```

### Frontend Setup

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev             # starts on port 3000
```

## 🌐 Deployment

- **Frontend** — deploy to Vercel (or any static host with HTTPS)
- **Backend** — deploy to Railway, Render, Fly.io, or a VPS (requires persistent process for Socket.io)
- **Pre-deploy**: Lock CORS origin to your domain, add Message/Conversation indexes, apply `generalLimiter` globally, set strong JWT secrets via environment variables

## 🔐 Environment Variables

### Backend (`server/.env`)
| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 9000) |
| `DB_URI` | MongoDB connection string |
| `DB_NAME` | Database name |
| `JWT_SECRET` | Access token signing secret |
| `JWT_REFRESH_SECRET` | Refresh token signing secret |
| `VAPID_PUBLIC_KEY` | Web Push public key |
| `VAPID_PRIVATE_KEY` | Web Push private key |
| `EMAIL_USER` | Gmail address for sending emails |
| `EMAIL_PASS` | Gmail app password |

### Frontend (`frontend/.env.local`)
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_SOCKET_URL` | WebSocket server URL |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Web Push public key (browser) |
