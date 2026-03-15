import { getUsername } from "@/app/login/getUsername";

import { liveblocks } from "@/app/liveblocks/liveblocks";

export async function POST() {
  const username = (await getUsername()) ?? "anonymous";

  const session = liveblocks.prepareSession(username, {
    userInfo: {
      name: username,
    },
  });

  session.allow(`hevilan:*`, session.FULL_ACCESS);

  const { status, body } = await session.authorize();
  return new Response(body, { status });
}
