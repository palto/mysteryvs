"use client";
import { loginParticipant } from "@/app/login/actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function ParticipantLoginButton({ username }: { username: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const initials = username
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function handleClick() {
    startTransition(async () => {
      await loginParticipant(username);
      router.push("/");
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
    >
      <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-muted text-lg font-bold select-none">
        {isPending ? (
          <svg
            className="animate-spin w-5 h-5 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        ) : (
          initials
        )}
      </div>
      <span className="text-sm font-medium text-center leading-tight">
        {username}
      </span>
    </button>
  );
}
