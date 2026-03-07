import Link from "next/link";
import { Button } from "@/components/ui/button";

export function TopNav() {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b border-border bg-background">
      <span className="font-semibold text-lg">PTI Mysteeri 2025</span>
      <Button variant="ghost" asChild>
        <Link href="/admin">Admin</Link>
      </Button>
    </nav>
  );
}
