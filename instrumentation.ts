export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { seedLocalLiveblocksRoomIfNeeded } =
    await import("@/app/liveblocks/seedLocalRoom");
  await seedLocalLiveblocksRoomIfNeeded();
}
