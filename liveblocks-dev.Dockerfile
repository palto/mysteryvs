# The published ghcr.io/liveblocks/cli image is stuck on liveblocks@1.0.11, which
# predates mutateStorage() support in the dev server (added in 1.4.0). This builds
# a Linux image (avoiding the Windows-only path bug in the CLI, see
# scripts/validate-liveblocks-devserver-bug.mjs) with an up-to-date CLI version instead.
FROM oven/bun:1
WORKDIR /app
RUN bun add liveblocks@1.6.2
ENV LIVEBLOCKS_DEVSERVER_HOST=0.0.0.0
ENV LIVEBLOCKS_DEVSERVER_PORT=1153
EXPOSE 1153
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD bun -e "fetch('http://localhost:1153').then(()=>process.exit(0)).catch(()=>process.exit(1))"
ENTRYPOINT ["bun", "run", "node_modules/liveblocks/dist/index.js"]
CMD ["dev"]
