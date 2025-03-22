import { auth } from "@/utils";
import { Button, Input } from "@heroui/react";

export default async function Home() {
  const data:any=await auth()
      console.log(data)
  return (
    <div>
      <Button color="primary"   type="submit">
        Submit
      </Button>
      <Input label="Email"  type="email" color="success" />
    </div>
  );
}
