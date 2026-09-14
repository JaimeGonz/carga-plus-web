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
