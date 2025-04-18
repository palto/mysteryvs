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
 - Node.js v22
 - Liveblocks API secret. Set it in `.env` using variable `LIVEBLOCKS_SECRET`

### Start dev server

```
npm i
npm run dev
```

The app should now run at http://localhost:3000

## Deployment

The app is deployed using Vercel. The deployment is triggered automatically when changes are pushed to the main branch.

# TODO

This is a list of features that are planned for the future.

- [x] Manage / Admin players
- [ ] User should know who they are
- [ ] Round states: Starting, In progress, Finished
- [ ] Live cursors
- [ ] DNF should show for player that did not finish

