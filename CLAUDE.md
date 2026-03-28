# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a real-time multiplayer web application for managing mystery game tournaments. Participants compete to solve mysteries, with live timing and leaderboard tracking synchronized across all connected clients.

## Development Commands

### Setup

```bash
npm i
```

### Development

```bash
npm run dev          # Start Next.js development server with Turbopack
```

### Build & Deploy

```bash
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run ESLint
npm run verify       # Run all validations (type-check + lint + format check)
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

- `LIVEBLOCKS_SECRET`: Required for real-time collaboration. Get from [liveblocks.io/dashboard](https://liveblocks.io/dashboard).
- `DATABASE_URL`: Required for database persistence. Neon Postgres connection string. Get from [console.neon.tech](https://console.neon.tech).

The application validates both variables at build time in `next.config.ts` and will exit if either is missing.

## Architecture

### Real-time State Management with Liveblocks

The application uses Liveblocks for real-time collaboration. All shared state is stored in Liveblocks Storage and synchronized across clients:

**Storage Schema** (defined in `liveblocks.config.ts`):

- `name`: Tournament name (string)
- `participants`: List of participant usernames (LiveList<string>)
- `startTime`: Round start timestamp (number | null)
- `completedTime`: Round end timestamp (number | null)
- `participantTimes`: Map of participant completion times (LiveMap<string, number>)
- `host`: Current round host username (string | null)

**Key Concepts**:

- The `Room` component (`app/Room.tsx`) wraps the application and provides Liveblocks context
- All state mutations must use `useMutation` from `@liveblocks/react/suspense`
- State reads use `useStorage` with custom hooks defined in `app/mysteryhooks.ts`
- Authentication endpoint: `app/api/liveblocks-auth/route.ts` - uses username from cookies
- Room ID is hardcoded in `app/constants.ts` (currently `"hevilan:pti-2025-syksy"`)

### Authentication & Session Management

- Cookie-based authentication storing username
- `getUsername()` helper (`app/login/getUsername.ts`) retrieves username from cookies
- Users must log in at `/login` before accessing main app
- No password authentication - users simply select/enter their name
- Main page redirects to `/login` if no username cookie exists

### App Structure

```
app/
├── page.tsx                    # Main entry (requires auth, wraps in Room)
├── MysteryRoundPage.tsx        # Main tournament interface (client component)
├── login/                      # Authentication flow
│   ├── page.tsx               # Login page server component
│   ├── LoginClientPage.tsx    # Login UI (client component)
│   ├── getUsername.ts         # Cookie helper
│   ├── getParticipants.ts     # Fetch participants from Liveblocks
│   └── actions.ts             # Login/logout server actions
├── admin/                      # Admin interface
│   ├── page.tsx               # Admin page server component
│   ├── AdminPage.tsx          # Admin UI (client component)
│   └── actions.ts             # Participant management actions
├── api/
│   └── liveblocks-auth/       # Liveblocks authentication endpoint
├── Participants.tsx            # Participant list with timing
├── ParticipantNameButton.tsx   # Host selection button
├── ParticipantActionButton.tsx # Mark participant as finished
├── Room.tsx                    # Liveblocks provider wrapper
├── mysteryhooks.ts            # Custom Liveblocks storage hooks
├── constants.ts               # Room ID constant
└── WakeLock.tsx               # Prevent screen sleep during rounds

components/ui/                  # Shadcn/ui components
├── timer.tsx                  # Round timer with start/stop/reset
├── table.tsx                  # Table component for participants
└── ...                        # Other UI primitives
```

### Round Flow

1. **Pre-round**: Participants select a host by clicking on their name
2. **Starting**: Host clicks "AIKA ALKAA NYT!" to start the timer
3. **In Progress**:
   - Timer counts up from 0 to 20 minutes
   - Participants click their own name when they finish
   - Their completion time is recorded in `participantTimes`
   - Participants who don't finish show as "DNF"
4. **Completion**: Anyone can click "AIKA PÄÄTTYI!" to end the round
5. **Reset**: Click "Aloita uusi kierros!" to clear times and host

### Important Implementation Details

- Round length is hardcoded to 20 minutes (1200000ms) in `components/ui/timer.tsx`
- The host is filtered out of the participants list during rounds
- Times are stored as Unix timestamps (milliseconds since epoch)
- Timer updates every 10ms for smooth display
- All state changes are atomic through Liveblocks mutations
- Admin page at `/admin` allows adding/removing participants

### Tech Stack

- **Next.js 15** with App Router (React 19)
- **TypeScript** with strict mode enabled
- **Liveblocks** for real-time state synchronization
- **TailwindCSS** for styling with Shadcn/ui components
- **React Hook Form** + **Zod** for form validation
- **date-fns** for time formatting
- **usehooks-ts** for common React hooks (useInterval, etc.)

### Path Aliases

- `@/*` maps to repository root (configured in `tsconfig.json`)
- Example: `@/app/mysteryhooks` refers to `app/mysteryhooks.ts`

### Deployment

- Deployed to Vercel at https://mysteeri.hevirinki.fi/
- Auto-deploys on push to main branch
- Requires `LIVEBLOCKS_SECRET` environment variable in Vercel settings
