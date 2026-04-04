import Link from "next/link";
import { Settings } from "lucide-react";
import { getUsername } from "@/app/login/getUsername";
import { AvatarMenu } from "@/app/AvatarMenu";
import { liveblocks } from "@/app/liveblocks/liveblocks";
import { room } from "@/app/constants";

export async function TopNav() {
  const username = await getUsername();
  const storage = await liveblocks.getStorageDocument(room, "json");
  const title = storage.name;

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b border-border bg-background">
      <Link
        href="/"
        className="font-semibold text-lg hover:text-muted-foreground"
      >
        {title ?? "Mystery Versus"}
      </Link>
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="text-muted-foreground hover:text-foreground"
          aria-label="Admin"
        >
          <Settings size={20} />
        </Link>
        {username && <AvatarMenu username={username} />}
      </div>
    </nav>
  );
}
