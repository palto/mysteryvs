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
    <div>
      Valitse pelaajasi!
      {participants.map((participant) => (
        <div key={participant}>
          <ParticipantLoginButton username={participant} />
        </div>
      ))}
    </div>
  );
}
