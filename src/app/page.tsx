import { auth } from "@/utils";
import { MapBox } from "./screens";
import { Button, Input } from "@heroui/react";

export default async function Home() {
  const data:any=await auth()
  return (
    <div>
      <MapBox role={data.user.role }/></div>
  );
}
