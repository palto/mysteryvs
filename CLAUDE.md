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

- `LIVEBLOCKS_SECRET`: Required for real-time collaboration. Set in `.env` file.
- `SESSION_SECRET`: Required. Secret (>=32 chars) used to sign session cookies. Generate with `openssl rand -base64 32`.
- The application validates environment variables at build time in `next.config.ts` and will exit if missing.

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

- Cookie-based authentication storing a **signed JWT** session cookie (`session`)
- Token logic lives in `app/login/session.ts` (uses `jose`, HS256, signed with `SESSION_SECRET`, 30-day expiry). The payload is base64-readable but tamper-proof — an altered or expired token is rejected.
- `getUsername()` helper (`app/login/getUsername.ts`) reads and verifies the session cookie, returning the username
- Users must log in at `/login` before accessing main app
- No password authentication - users simply select/enter their name
- Main page redirects to `/login` if no valid session cookie exists

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

### MCP Server

- Endpoint: `app/api/mcp/route.ts`
- Documentation page: `app/mcp/page.tsx`
- **When adding, removing, or changing MCP tools, always update `app/mcp/page.tsx`** (the `TOOLS` array and `EXAMPLE_PROMPTS`) to keep the docs in sync.

### Pull Requests

First consider whether the PR has visible changes to the user or is purely technical (maintenance, refactoring, dependency updates, etc.).

- **User-facing PRs**: Title and description should lead with what the user sees or experiences differently. Keep technical details brief at the end. E.g. "Show round info card on the active round page" not "Extract RoundInfoCard component for reuse".
- **Technical PRs**: It is fine to use a technical title and description that focuses on the implementation change.

### Deployment

- Deployed to Vercel at https://mysteeri.hevirinki.fi/
- Auto-deploys on push to main branch
- Requires `LIVEBLOCKS_SECRET` environment variable in Vercel settings
