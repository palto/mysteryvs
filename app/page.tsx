"use client";
import dynamic from "next/dynamic";

const MysteryRoundPage = dynamic(
  () => import("./MysteryRoundPage").then((mod) => mod.MysteryRoundPage),
  {
    ssr: false,
  },
);

export default function Home() {
  return <MysteryRoundPage />;
}
