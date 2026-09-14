"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

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
      <div className="flex gap-2">
        <ThemeToggle />
        <Button variant="outline" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </div>
    </nav>
  );
}
