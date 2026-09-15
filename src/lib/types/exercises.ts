export interface Exercise {
  id: number;
  name: string;
  muscleGroup: string;
  isCustom: boolean;
  equipment: string | null;
  description: string | null;
  userId: number | null;
  createdAt: string;
}
