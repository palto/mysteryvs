import { getUsername } from "@/app/login/getUsername";
import { getUserId } from "@/app/userId";

import { liveblocks } from "@/app/liveblocks/liveblocks";

export async function POST() {
  // getUserId() is unset only if the proxy hasn't run yet; fall back to a
  // fresh id rather than denying access.
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
