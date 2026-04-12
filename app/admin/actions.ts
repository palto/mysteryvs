"use server";
import { room } from "@/app/constants";
import { revalidatePath } from "next/cache";

import { liveblocks } from "@/app/liveblocks/liveblocks";

export async function setDescription(data: FormData) {
  const description = data.get("description") as string;
  await liveblocks.mutateStorage(room, async ({ root }) => {
    root.set("description", description ?? "");
  });
  revalidatePath("/admin");
}

export async function setName(data: FormData) {
  const name = data.get("name") as string;
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
    root.get("hostRounds").delete(id);
    console.log(`Removed participant ${id}`);
  });
  revalidatePath("/admin");
}

export async function reorderParticipants(newOrder: string[]) {
  await liveblocks.mutateStorage(room, async ({ root }) => {
    const participants = root.get("participants");
    while (participants.length > 0) participants.delete(0);
    for (const name of newOrder) participants.push(name);
  });
  revalidatePath("/admin");
}

export async function setRoundLength(data: FormData) {
  const minutes = Number(data.get("roundLength"));
  if (!Number.isFinite(minutes) || minutes <= 0) {
    throw new Error("Invalid round length");
  }
  await liveblocks.mutateStorage(room, async ({ root }) => {
    root.set("roundLength", Math.round(minutes * 60 * 1000));
  });
  revalidatePath("/admin");
}

export async function addParticipant(data: FormData) {
  const username = (data.get("username") as string)?.trim();
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
  revalidatePath("/login");
}
