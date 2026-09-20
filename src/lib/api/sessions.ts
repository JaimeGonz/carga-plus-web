import {
  CreateSetInput,
  SessionDetail,
  WorkoutSession,
  WorkoutSet,
} from "@/lib/types/sessions";
import { PreviousSetValues } from "../types/sessions";

export async function startSession(routineId: number): Promise<WorkoutSession> {
  const res = await fetch("/api/workout-sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ routineId }),
  });

  if (!res.ok) throw new Error("Error al iniciar la sesión");

  return res.json();
}

export async function fetchSessionDetail(id: string): Promise<SessionDetail> {
  const res = await fetch(`/api/workout-sessions/${id}`);
  if (!res.ok) throw new Error("Error al cargar la sesión");
  return res.json();
}

export async function fetchPreviousValues(
  exerciseId: number,
): Promise<PreviousSetValues[]> {
  const res = await fetch(
    `/api/workout-sessions/sets/previous?exerciseId=${exerciseId}`,
  );
  if (!res.ok) throw new Error("Error al cargar valores anteriores");
  return res.json();
}

export async function createSet(
  sessionId: number,
  input: CreateSetInput,
): Promise<WorkoutSet> {
  const res = await fetch(`/api/workout-sessions/${sessionId}/sets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) throw new Error("Error al registrar el set");
  return res.json();
}

export async function updateSet(
  sessionId: number,
  setId: number,
  data: { weight?: number | null; reps?: number; isCompleted?: boolean },
): Promise<WorkoutSet> {
  const res = await fetch(`/api/workout-sessions/${sessionId}/sets/${setId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Error al confirmar el set");
  return res.json();
}
