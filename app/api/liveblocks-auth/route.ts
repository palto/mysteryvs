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

  session.allow(`hevilan:*`, session.FULL_ACCESS);

  const { status, body } = await session.authorize();
  return new Response(body, { status });
}
