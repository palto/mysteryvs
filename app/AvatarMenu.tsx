"use client";
import { useEffect, useRef, useState } from "react";
import { logout } from "@/app/login/actions";
import { useRouter } from "next/navigation";

export function AvatarMenu({ username }: { username: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = username
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-muted text-sm font-semibold select-none hover:opacity-80"
        aria-label="User menu"
      >
        {initials}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-md border border-border bg-background shadow-md z-50">
          <div className="px-3 py-2 text-sm text-muted-foreground border-b border-border truncate">
            {username}
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
          >
            Vaihda pelaajaa!
          </button>
        </div>
      )}
    </div>
  );
}
