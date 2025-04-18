import { getUsername } from "@/app/login/getUsername";

import { liveblocks } from "@/app/liveblocks/liveblocks";

export async function POST() {
  const username = (await getUsername()) ?? "anonymous";

  // Start an auth session inside your endpoint
  const session = liveblocks.prepareSession(username);

  // Use a naming pattern to allow access to rooms with wildcards
  // Giving the user read access on their org, and write access on their group
  session.allow(`hevilan:*`, session.FULL_ACCESS);

  // Authorize the user and return the result
  const { status, body } = await session.authorize();
  return new Response(body, { status });
}
