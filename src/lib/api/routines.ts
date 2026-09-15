import { Routine, RoutineDetail } from "@/lib/types/routines";

export async function fetchRoutines(): Promise<Routine[]> {
  const res = await fetch("/api/routines");

  if (!res.ok) {
    throw new Error("Error al cargar rutinas");
  }

  return res.json();
}

export async function fetchRoutineDetail(id: string): Promise<RoutineDetail> {
  const res = await fetch(`/api/routines/${id}`);

  if (!res.ok) {
    throw new Error("Error al cargar el detalle de la rutina");
  }

  return res.json();
}
