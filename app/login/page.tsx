import { getUsername } from "@/app/login/getUsername";
import { getParticipants } from "@/app/login/getParticipants";
import { ParticipantLoginButton } from "@/app/login/ParticipantLoginButton";
import { redirect } from "next/navigation";

export default async function Login() {
  const username = await getUsername();
  if (username) {
    return redirect("/");
  }

  const participants = await getParticipants();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Valitse pelaajasi!</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {participants.toSorted().map((participant) => (
          <div key={participant}>
            <ParticipantLoginButton username={participant} />
          </div>
        ))}
      </div>
    </div>
  );
}
