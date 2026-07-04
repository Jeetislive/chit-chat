# Chat App

A full-stack real-time chat application with messaging, typing indicators, read receipts, push notifications, and online presence tracking.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Real-time**: Socket.io-client
- **Push**: Web Push API + Service Workers
- **State**: Context API (Auth, Socket, Theme)

### Backend
- **Runtime**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Auth**: JWT (JSON Web Tokens), bcrypt.js
- **Real-time**: Socket.io
- **Push**: web-push (VAPID keys)
- **Logging**: Pino (structured JSON)
- **Validation**: Custom validators + middleware

## ✨ Features

- **User authentication** — signup, login, JWT-based sessions
- **Real-time messaging** — instant delivery via Socket.io
- **Typing indicators** — see when someone is typing
- **Read receipts** — sent → delivered → read status
- **Online presence** — green dot when user is connected
- **Push notifications** — browser-native via Web Push API
- **Message replies** — reply to a specific message
- **Message deletion** — delete your own messages
- **Conversation list** — sorted by last message with unread counts
- **User search** — filter conversations by name/username
- **Pagination** — infinite scroll for message history
- **Profile management** — view & update your profile
- **Dark/light theme** — toggleable UI theme
- **Input validation** — server-side request validation
- **Structured error handling** — custom error classes with consistent JSON responses

## 📁 Project Structure

```
├── server/                 # Backend (Express + Socket.io)
│   ├── controllers/        # Route handlers
│   ├── services/           # Business logic layer
│   ├── model/              # Mongoose schemas (User, Message, Conversation)
│   ├── routes/             # Express route definitions
│   ├── middleware/         # Auth, validation, error handling
│   ├── socket/             # Socket.io connection + event handlers
│   ├── validators/         # Request schema validators
│   ├── errors/             # Custom error classes
│   ├── config/             # Logger config
│   ├── db/                 # MongoDB connection
│   └── utils/              # Token generation, etc.
│
└── frontend/               # Frontend (Next.js)
    ├── src/
    │   ├── app/            # Pages (chat, login, signup)
    │   ├── components/     # UI components (sidebar, chat, shared)
    │   ├── context/        # Auth, Socket, Theme providers
    │   ├── hooks/          # useMessages, useConversations, useTyping, etc.
    │   ├── lib/            # API client, push notification utilities
    │   └── types/          # TypeScript type definitions
    ├── public/
    │   └── sw.js           # Service worker for push notifications
    └── next.config.mjs
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally or a remote URI

### Backend Setup

```bash
cd server
cp .env.example .env    # configure your environment variables
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
