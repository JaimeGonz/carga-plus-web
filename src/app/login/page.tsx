"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiErrorResponse, LoginCredentials } from "@/lib/types/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const credentials: LoginCredentials = { email, password };

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application-json" },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      const data: ApiErrorResponse = await res.json();
      setError(data.message ?? "Error al iniciar sesión");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        {error && <p className="text-destructive text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground rounded py-2"
        >
          Iniciar sesión
        </button>
      </form>
    </main>
  );
}
