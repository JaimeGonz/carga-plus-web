"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
      <span className="font-heading text-xl">CARGA+</span>
      <Button variant="outline" onClick={handleLogout}>
        Cerrar sesión
      </Button>
    </nav>
  );
}
