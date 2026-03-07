import Link from "next/link";
import { Settings } from "lucide-react";
import { getUsername } from "@/app/login/getUsername";
import { AvatarMenu } from "@/app/AvatarMenu";

export async function TopNav() {
  const username = await getUsername();

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b border-border bg-background">
      <span className="font-semibold text-lg">PTI Mysteeri 2025</span>
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
