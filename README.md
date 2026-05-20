# DriveFleet Server

DriveFleet Server is the Express and MongoDB backend for the DriveFleet car rental platform. It handles authentication, car listings, bookings, and session management for the client app.

## Features

- Email/password authentication
- Google sign-in support
- JWT-based session cookies and refresh tokens
- CRUD operations for cars
- Owner-only updates and deletions
- Booking creation and booking history per user
- CORS and security middleware
- Vercel-friendly deployment setup

## Main API Areas

- `/api/auth` - register, login, logout, refresh, me, Google OAuth
- `/api/cars` - browse, create, update, delete, and fetch owned cars
- `/api/bookings` - create bookings and fetch a user’s bookings

## Setup

1. Install dependencies:

```bash
npm install
```

2. Add environment variables in `.env`.

3. Run the server:

```bash
npm run dev
```

## Scripts

- `npm run dev` - Start the server with nodemon
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run format` - Format the codebase with Prettier
