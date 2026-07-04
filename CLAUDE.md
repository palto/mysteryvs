# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a real-time multiplayer web application for managing mystery game tournaments. Participants compete to solve mysteries, with live timing/scoring and leaderboard tracking synchronized across all connected clients. Rounds can be **time-based** (fastest finish wins) or **score-based** (points entered per participant). The app also ships an in-app AI assistant that can manage the tournament through an MCP server.

## Development Commands

### Setup

```bash
npm i
```

### Development

```bash
npm run dev          # Start Next.js development server
```

Room initialization (create the room if it doesn't exist, seed its storage only when empty) lives in `app/liveblocks/initRoom.ts` and runs automatically on every server startup via `instrumentation.ts` (`register()`), so `npm run dev` / `npm start` provision the room on their own — it never overwrites an already-seeded room, so it's safe against production.

### Build & Deploy

```bash
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # tsc --noEmit
npm run format:check # Prettier check
npm run verify       # Run all validations (type-check + lint + format check)
```

### Environment Variables

- `LIVEBLOCKS_SECRET`: Required for real-time collaboration. Set in `.env` file.
- `SESSION_SECRET`: Required. Secret (>=32 chars) used to sign session cookies. Generate with `openssl rand -base64 32`.
- `COMPOSIO_API_KEY`: Required for the AI assistant (used by `app/api/assistant/route.ts` to connect external Composio tools).
- `NEXT_PUBLIC_LIVEBLOCKS_ROOM`: Optional. Overrides the room id (defaults to `hevilan:pti-2025-syksy`). Must keep the `hevilan:` prefix so the auth grant in `app/api/liveblocks-auth/route.ts` matches. Set a personal room (e.g. `hevilan:dev-<name>`) to avoid polluting the shared production room — the room is provisioned automatically the next time you start the server.
- `NEXT_PUBLIC_LIVEBLOCKS_BASE_URL`: Optional. Points the Liveblocks client (`app/Room.tsx`) and node SDK (`app/liveblocks/liveblocks.ts`) — including the automatic room provisioning in `app/liveblocks/initRoom.ts` — at a [local Liveblocks dev server](https://liveblocks.io/docs/tools/dev-server) (`npx liveblocks dev`, defaults to `http://localhost:1153`) instead of Liveblocks cloud. Leave unset for cloud. See README for the full local setup.
- The application validates environment variables at build time in `next.config.ts` and will exit if missing.

## Architecture

### Real-time State Management with Liveblocks

The application uses Liveblocks for real-time collaboration. All shared state is stored in Liveblocks Storage and synchronized across clients.

**Storage Schema** (defined in `liveblocks.config.ts`):

- `name`: Tournament name (string)
- `description`: Tournament description, Markdown (string)
- `participants`: List of participant usernames (`LiveList<string>`)
- `startTime`: Round start timestamp (number | null)
- `completedTime`: Round end timestamp (number | null)
- `participantTimes`: Map of participant completion times (`LiveMap<string, number>`)
- `participantScores`: Map of participant scores for score-based rounds (`LiveMap<string, number>`)
- `host`: Current round host username (string | null)
- `roundLength`: Round length in ms (number | null; defaults to `20 * 60 * 1000`)
- `roundType`: `"time" | "score"` (string | null)
- `roundInstructions`: Per-round instructions, Markdown (string | null)
- `hostRounds`: Map of host → preconfigured `HostRound` (`LiveMap<string, HostRound>`). A `HostRound` bundles `roundType`, `roundInstructions`, `roundLength`, plus recorded results.

There is also a `UserMeta` shape: `id` is the stable, server-issued per-user id (the session `sub`), and `info.name` is the freely-chosen display username.

**Key Concepts**:

- The `Room` component (`app/Room.tsx`) wraps the application and provides Liveblocks context
- All state mutations must use `useMutation` from `@liveblocks/react/suspense`
- State reads use `useStorage` via custom hooks in `app/mysteryhooks.ts` (e.g. `useStartTime`, `useIsRunning`, `useRoundType`, `useRoundLength`, `useHostRound`, `useCurrentRoundPoints`)
- Points/leaderboard math lives in `app/mysteryhooks.ts` (`calculateRoundPoints`, `useCurrentRoundPoints`)
- Authentication endpoint: `app/api/liveblocks-auth/route.ts` — authenticates with the stable user id (`sub`) and exposes the display name via `UserMeta.info.name`
- The room id is defined in `liveblocks.config.ts` as `room` (currently `"hevilan:pti-2025-syksy"`) and re-exported from `app/constants.ts`

### Authentication & Session Management

- Cookie-based authentication storing a **signed, versioned JWT** session cookie (`session`).
- Token logic lives in `app/login/session.ts` (uses `jose`, HS256, signed with `SESSION_SECRET`, 1-year expiry). The payload carries a stable `sub` (server-issued user id) and an optional `username` (display name), plus a `ver` claim (`SESSION_VERSION`). Bumping `SESSION_VERSION` invalidates older tokens so they get reissued. The payload is base64url-readable but tamper-proof — an altered, expired, or outdated token is rejected.
- Helpers in `app/login/`: `getSession()` returns the decoded session, `getUsername()` returns the display name, and `app/userId.ts` `getUserId()` returns the stable `sub`.
- Users must log in at `/login` before accessing the main app.
- No password authentication — users select an existing name or add a new one.
- Main page redirects to `/login` if no valid session cookie exists.

### App Structure

```
app/
├── page.tsx                    # Main entry (requires auth, wraps in Room)
├── MysteryRoundPage.tsx        # Main tournament interface (client component)
├── SetupWizard.tsx             # Pre-round setup: host/round-type/length/instructions (BlockNote)
├── RoundInfoCard.tsx           # Round summary card shown during an active round
├── Participants.tsx            # Participant list with timing/scoring
├── TopNav.tsx / AvatarMenu.tsx # Top navigation and user menu
├── AssistantFAB.tsx            # Floating button that opens the AI assistant
├── AssistantChat.tsx           # AI assistant chat UI (persisted in sessionStorage)
├── Room.tsx                    # Liveblocks provider wrapper
├── WakeLock.tsx                # Prevent screen sleep during rounds
├── mysteryhooks.ts             # Custom Liveblocks storage hooks + points math
├── constants.ts                # Re-exports the room id
├── userId.ts                   # getUserId() (stable session sub)
├── liveblocks/liveblocks.ts    # Liveblocks node client
├── login/                      # Authentication flow
│   ├── page.tsx                # Login page server component
│   ├── LoginClientPage.tsx     # Login UI (client component)
│   ├── ParticipantLoginButton.tsx
│   ├── NewPlayerDrawer.tsx     # Add-a-new-player UI
│   ├── getSession.ts / getUsername.ts / getParticipants.ts
│   ├── session.ts              # Signed JWT session token logic
│   └── actions.ts              # Login/logout server actions
├── admin/                      # Admin interface
│   ├── page.tsx                # Admin page server component
│   ├── AdminPage.tsx           # Admin UI (client component)
│   ├── TournamentNameEditor.tsx / TournamentDescriptionEditor.tsx / RoundLengthEditor.tsx
│   └── actions.ts              # Participant/tournament management actions
├── api/
│   ├── liveblocks-auth/        # Liveblocks authentication endpoint
│   ├── assistant/              # AI assistant route (Vercel AI SDK + Composio + MCP)
│   └── mcp/                    # MCP server endpoint
├── mcp/page.tsx                # MCP documentation page
└── ...

components/
├── ui/                         # Shadcn/ui components (timer, table, dialog, drawer, ...)
└── ai-elements/                # Chat UI primitives for the AI assistant
```

### Round Flow

1. **Pre-round (SetupWizard)**: Select a host, choose the round type (time or score), set round length / instructions. Hosts can have a preconfigured `HostRound`.
2. **Starting**: Start the round to set `startTime` and begin the timer.
3. **In Progress**:
   - **Time rounds**: Timer counts up to `roundLength`. Participants are marked finished (recorded in `participantTimes`); unfinished participants show as "DNF". Tap a participant card to toggle finished/in-progress.
   - **Score rounds**: Scores are entered per participant into `participantScores`.
4. **Completion**: End the round (sets `completedTime`). Scores can still be adjusted afterward.
5. **Reset / next round**: Start a new round, which clears the host and per-round results.

### Important Implementation Details

- Round length is configurable (`roundLength` in storage; default `20 * 60 * 1000` ms) and editable from the admin page — it is **not** hardcoded in the timer.
- The host is filtered out of the participants list during rounds.
- Times are stored as Unix timestamps (milliseconds since epoch).
- Per-round points are derived via `calculateRoundPoints` / `useCurrentRoundPoints` in `app/mysteryhooks.ts`.
- All state changes are atomic through Liveblocks mutations.
- Admin page at `/admin` manages participants (incl. drag-to-reorder via dnd-kit) and tournament settings.

### AI Assistant

- UI: `app/AssistantFAB.tsx` + `app/AssistantChat.tsx` (built on `components/ai-elements/`). Chat history is persisted in `sessionStorage` with a clear button.
- Backend: `app/api/assistant/route.ts` uses the Vercel AI SDK (`ai` — `ToolLoopAgent` / `createAgentUIStreamResponse`), connects to the app's own MCP server (`/api/mcp`) over HTTP, and to external tools via Composio (`@composio/core` + `@composio/vercel`). Composio connections are scoped per user.

### MCP Server

- Endpoint: `app/api/mcp/route.ts`
- Documentation page: `app/mcp/page.tsx`
- Current tools: `list_participants`, `add_participant`, `remove_participant`, `reorder_participants`, `get_tournament_state`, `get_results`, `set_tournament_name`, `set_tournament_description`, `set_round_length`.
- **When adding, removing, or changing MCP tools, always update `app/mcp/page.tsx`** (the `TOOLS` array and `EXAMPLE_PROMPTS`) to keep the docs in sync.

### Tech Stack

- **Next.js 16** with App Router (React 19)
- **TypeScript** with strict mode enabled
- **Liveblocks** for real-time state synchronization (incl. `@liveblocks/react-blocknote` + **BlockNote** for rich-text setup instructions)
- **Vercel AI SDK** (`ai`, `@ai-sdk/react`, `@ai-sdk/mcp`) + **Composio** for the AI assistant
- **@modelcontextprotocol/sdk** for the MCP server
- **TailwindCSS** with Shadcn/ui (Radix) components
- **React Hook Form** + **Zod** for form validation
- **dnd-kit** for drag-and-drop reordering
- **date-fns** for time formatting; **usehooks-ts** for common hooks
- **jose** for session JWTs; **react-markdown** / **remark-gfm** / **streamdown** for Markdown rendering

### Path Aliases

- `@/*` maps to repository root (configured in `tsconfig.json`)
- Example: `@/app/mysteryhooks` refers to `app/mysteryhooks.ts`

### Pull Requests

First consider whether the PR has visible changes to the user or is purely technical (maintenance, refactoring, dependency updates, etc.).

- **User-facing PRs**: Title and description should lead with what the user sees or experiences differently. Keep technical details brief at the end. E.g. "Show round info card on the active round page" not "Extract RoundInfoCard component for reuse".
- **Technical PRs**: It is fine to use a technical title and description that focuses on the implementation change.

### Deployment

- Deployed to Vercel at https://mysteeri.hevirinki.fi/
- Auto-deploys on push to main branch
- Requires `LIVEBLOCKS_SECRET`, `SESSION_SECRET`, and `COMPOSIO_API_KEY` environment variables in Vercel settings
- Every push (including branches) also gets a Vercel preview deployment, which is a good way to verify a change actually works before/instead of relying solely on local `npm run dev`

### Verifying Changes Against a Preview Deployment

Preview deployments are gated by Vercel's deployment protection (SSO), so plain `curl`/`fetch` gets redirected to `vercel.com/sso-api`. Bypass it with the `VERCEL_AUTOMATION_BYPASS_SECRET` env var:

```bash
# Set a bypass cookie, then reuse it for subsequent requests
curl -c cookies.txt -H "x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET" \
     -H "x-vercel-set-bypass-cookie: true" "<preview-url>/"
curl -b cookies.txt "<preview-url>/some/path"
```

The bypass cookie (`_vercel_jwt`) is valid for 7 days once set, so it doesn't need to be resent on every request in the same cookie jar. This only bypasses Vercel's deployment protection — the app's own `/login` session is separate and still applies.

Preview deployment URLs for a branch/PR can be found via the Vercel MCP tools (`list_deployments` for the `mysteryvs` project) or the deployment's GitHub check/comment.
