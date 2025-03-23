"use client";
import { useLocalStorage } from "usehooks-ts";
import { contextType, store } from "@/app/mysterystore";
import { useEffect } from "react";
import { Timer } from "@/components/ui/timer";
import { Participants } from "@/components/ui/participants";
import Image from "next/image";
import { useOthers } from "@liveblocks/react/suspense";

export function MysteryRoundPage() {
  const [, setPersistedState] = useLocalStorage<contextType | undefined>(
    "snapshot",
    undefined,
    {
      initializeWithValue: false,
    },
  );

  // Persist store with every update
  useEffect(() => {
    const subscription = store.subscribe((snapshot) => {
      setPersistedState(snapshot.context);
    });
    return subscription.unsubscribe;
  }, [setPersistedState]);

  const others = useOthers();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1>Mysteeripeli!</h1>

        <h2>Ajastin!</h2>
        <Timer></Timer>

        <h2>Pelaajia!</h2>
        <div>{others.length} pelaajaa linjoilla!</div>

        <h2>Osallistujat</h2>
        <Participants />
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
