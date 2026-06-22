import { getUsername } from "@/app/login/getUsername";
import { getUserId } from "@/app/userId";

import { liveblocks } from "@/app/liveblocks/liveblocks";

export async function POST() {
  // Identify the Liveblocks user by the stable, server-issued `sub` rather than
  // the freely-chosen username: before login every visitor would otherwise
  // share the single identity "anonymous". The proxy issues `sub` on every page
  // load, so it's practically always present; fall back to a fresh id so a
  // visitor without one still gets a distinct (if ephemeral) identity.
  const userId = (await getUserId()) ?? crypto.randomUUID();
  const username = (await getUsername()) ?? "anonymous";

  const session = liveblocks.prepareSession(userId, {
    userInfo: {
      name: username,
    },
  });

  session.allow(`hevilan:*`, session.FULL_ACCESS);

  const { status, body } = await session.authorize();
  return new Response(body, { status });
}
