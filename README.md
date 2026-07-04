# Mystery VS tournament app

This is a web application for managing mystery game tournaments.

The production runs at https://mysteeri.hevirinki.fi/

## Technologies

- Next.js - A React framework for building server-rendered applications.
- Vercel - A cloud platform for hosting the application
- TypeScript - A superset of JavaScript that adds static types.
- LiveBlocks - A real-time collaboration platform.

## Development

### Prerequisites

- Node.js v24
- Liveblocks API secret. Set it in `.env` using variable `LIVEBLOCKS_SECRET`
  (optional — if unset, defaults to `sk_localdev` for use with the [local dev
  server](#running-liveblocks-locally); a real secret is required for
  Liveblocks cloud)
- Composio (for the AI assistant's Google Sheets integration). Set in `.env`:
  - `COMPOSIO_API_KEY` — your Composio project API key

All of the above must also be set in the Vercel project settings for deployment.

Instead of setting these manually, you can pull the Development environment variables
configured in Vercel straight into `.env.local`:

```
npx vercel link   # one-time, links this checkout to the Vercel project
npm run env:pull
```

### Start dev server

```
npm i
npm run dev
```

The app should now run at http://localhost:3000

### Running Liveblocks locally

Instead of using the hosted Liveblocks cloud, you can run
[Liveblocks' local dev server](https://liveblocks.io/docs/tools/dev-server) so
you don't need a real Liveblocks account and don't touch the shared production
room. It requires [Bun](https://bun.sh/) (`npm install -g bun`).

In one terminal:

```
npx liveblocks dev
```

This starts a server at `http://localhost:1153` and persists room data to a
local `.liveblocks/` directory.

**On Windows, run `docker compose up` instead** (config in
`docker-compose.yml`, persists data in a named Docker volume). Native Windows
hits a bug in the CLI (as of `liveblocks@1.6.2`) where a path-traversal
safety check hardcodes a forward slash while `path.resolve` returns
backslash-separated paths on Windows, so the check always fails — every room
lookup throws `Error: Invalid internal ID`, regardless of room id or data
state. Docker Compose sidesteps this since it runs Linux internally.

In `.env.local`, set:

```
NEXT_PUBLIC_LIVEBLOCKS_BASE_URL=http://localhost:1153
```

(`LIVEBLOCKS_SECRET` defaults to `sk_localdev` automatically when unset, so
you don't need to set it yourself.)

Then run `npm run dev` as usual in a second terminal — the room is created and
seeded automatically on startup (see `app/liveblocks/initRoom.ts`), no manual
seed step needed. Note the local dev server doesn't support Comments,
Notifications, or AI Copilots, but this app doesn't use any of those.

## Deployment

The app is deployed using Vercel. The deployment is triggered automatically when changes are pushed to the main branch.

# TODO

This is a list of features that are planned for the future.

- [x] Sync state between clients
- [x] Manage / Admin players
- [x] User should know who they are
- [x] Round states: Starting, In progress, Finished
- [x] DNF should show for player that did not finish
- [x] Round should have host
- [ ] Live cursors
