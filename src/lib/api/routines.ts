import { Routine } from "@/lib/types/routines";

export async function fetchRoutines(): Promise<Routine[]> {
  const res = await fetch("/api/routines");

  if (!res.ok) {
    throw new Error("Error al cargar rutinas");
  }

  return res.json();
}
