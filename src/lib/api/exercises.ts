import { Exercise } from "../types/exercises";

export async function fetchExercises(): Promise<Exercise[]> {
  const res = await fetch("/api/exercises");
  if (!res.ok) {
    throw new Error("Error al cargar ejercicios.");
  }
  return res.json();
}
