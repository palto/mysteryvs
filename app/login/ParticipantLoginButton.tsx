"use client";
import { Button } from "@/components/ui/button";
import { loginParticipant } from "@/app/login/actions";

export function ParticipantLoginButton({ username }: { username: string }) {
  return <Button onClick={() => loginParticipant(username)}>{username}</Button>;
}
