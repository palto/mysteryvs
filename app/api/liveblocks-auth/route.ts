import { getUsername } from "@/app/login/getUsername";
import { getUserId } from "@/app/userId";

import { liveblocks } from "@/app/liveblocks/liveblocks";

export async function POST() {
  const userId = await getUserId();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  const username = (await getUsername()) ?? "anonymous";

  const session = liveblocks.prepareSession(userId, {
    userInfo: {
      name: username,
    },
  });

  // The app only uses Storage/Presence/Yjs, all covered by "room:write".
  // The explicit scope (instead of session.FULL_ACCESS, i.e. "*:write") also
  // works with the local Liveblocks dev server, which doesn't accept the
  // wildcard scope.
  session.allow(`hevilan:*`, ["room:write"]);

  const { status, body } = await session.authorize();
  return new Response(body, { status });
}
