"use server";
import { room } from "@/app/constants";
import { revalidatePath } from "next/cache";

import { liveblocks } from "@/app/liveblocks/liveblocks";

export async function setName(name: string) {
  if (!name) {
    throw new Error("Name is required");
  }
  await liveblocks.mutateStorage(room, async ({ root }) => {
    root.set("name", name);
  });
  revalidatePath("/admin");
}

export async function removeParticipant(id: string) {
  await liveblocks.mutateStorage(room, async ({ root }) => {
    const participants = root.get("participants");
    const index = participants.findIndex((p) => p === id);
    participants.delete(index);
    console.log(`Removed participant ${id}`);
  });
  revalidatePath("/admin");
}

export async function addParticipant(data: FormData) {
  const username = data.get("username") as string;
  if (!username) {
    throw new Error("Username is required");
  }
  await liveblocks.mutateStorage(room, async ({ root }) => {
    const participants = root.get("participants");

    if (participants.findIndex((p) => p === username) !== -1) {
      throw new Error("Username already exists");
    }
    participants.push(username);
    console.log(`Added participant ${username}`);
  });
  revalidatePath("/admin");
}
