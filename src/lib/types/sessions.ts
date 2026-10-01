export type SetType = "NORMAL" | "WARMUP" | "DROPSET" | "FAILURE";

export interface WorkoutSession {
  id: number;
  userId: number;
  routineId: number | null;
  startTime: string;
  entTime: string | null;
  isCompleted: boolean;
  notes: string | null;
  createdAt: string;
}

export interface WorkoutSet {
  id: number;
  sessionId: number;
  exerciseId: number;
  order: number;
  weight: number | null;
  reps: number;
  rir: number | null;
  setType: SetType;
  isCompleted: boolean;
  notes: string | null;
}

export interface SessionDetail extends WorkoutSession {
  workoutSets: WorkoutSet[];
}

export interface CreateSetInput {
  exerciseId: number;
  weight: number | null;
  reps: number;
  rir: number | null;
  setType: SetType;
}

export interface PreviousSetValues {
  order: number;
  weight: number | null;
  reps: number;
  rir: number | null;
  setType: SetType;
}

export const SET_TYPE_INFO: Record<
  SetType,
  { label: string; shortLabel: string; color: string }
> = {
  WARMUP: {
    label: "Serie de Calentamiento",
    shortLabel: "W",
    color: "text-amber-500",
  },
  NORMAL: { label: "Serie Normal", shortLabel: "", color: "text-foreground" },
  DROPSET: { label: "Serie Drop", shortLabel: "D", color: "text-blue-500" },
  FAILURE: {
    label: "Serie al Fallo",
    shortLabel: "F",
    color: "text-destructive",
  },
};
