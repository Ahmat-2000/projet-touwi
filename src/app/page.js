"use client"
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  router.push("/import");
  
  return (
    <div>
    </div>
  );
}