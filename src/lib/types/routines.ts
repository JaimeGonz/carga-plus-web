export type DayType =
  | "PUSH"
  | "PULL"
  | "LEGS"
  | "UPPER"
  | "LOWER"
  | "FULL_BODY"
  | "SPECILIZATION"
  | "OTHER";

export interface Routine {
  id: number;
  name: string;
  description: string | null;
  type: DayType | null;
  dayOfWeek: number | null;
  userId: number;
  createdAt: string;
  programId: string;
}

export interface RoutineExercise {
  id: number;
  routineId: number;
  exerciseId: number;
  sets: number;
  repsMin: number;
  repsMax: number;
  order: number;
  notes: string | null;
  rir: number | null;
  restSeconds: number | null;
}

export interface RoutineDetail extends Routine {
  routineExercises: RoutineExercise[];
}
