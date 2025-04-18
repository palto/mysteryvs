import Form from "next/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login } from "@/app/login/actions";
import { Label } from "@/components/ui/label";
import { getUsername } from "@/app/login/getUsername";

export default async function Login() {
  const username = await getUsername();

  return (
    <div>
      <Form action={login} className="space-y-8">
        <Label htmlFor="username">Syötä nimimerkkisi tähän</Label>
        <Input
          defaultValue={username}
          placeholder="Nimimerkki"
          name={"username"}
        />
        <Button>Tallenna</Button>
      </Form>
    </div>
  );
}
