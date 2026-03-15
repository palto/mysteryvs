import { getUsername } from "@/app/login/getUsername";

import { liveblocks } from "@/app/liveblocks/liveblocks";

const CURSOR_COLORS = [
  "#F97316", // orange
  "#3B82F6", // blue
  "#10B981", // green
  "#8B5CF6", // purple
  "#EF4444", // red
  "#F59E0B", // amber
  "#06B6D4", // cyan
  "#EC4899", // pink
];

function userColor(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}

export async function POST() {
  const username = (await getUsername()) ?? "anonymous";

  const session = liveblocks.prepareSession(username, {
    userInfo: {
      name: username,
      color: userColor(username),
    },
  });

  session.allow(`hevilan:*`, session.FULL_ACCESS);

  const { status, body } = await session.authorize();
  return new Response(body, { status });
}
