export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { initRoom } = await import("@/app/liveblocks/initRoom");
  await initRoom();
}
