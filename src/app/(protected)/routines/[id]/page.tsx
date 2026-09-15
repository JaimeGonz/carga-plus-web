"use client";

import { Card } from "@/components/ui/card";
import { fetchRoutineDetail } from "@/lib/api/routines";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export default function RoutineDetailPage() {
  const params = useParams<{ id: string }>();

  const {
    data: routine,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["routine", params.id],
    queryFn: () => fetchRoutineDetail(params.id),
  });

  if (isLoading) return <p className="p-6">Cargando rutina...</p>;
  if (error)
    return <p className="p-6 text-destructive">Error al cargar la rutina.</p>;
  if (!routine) return null;

  return (
    <div className="p-6 space-y-4">
      <h1 className="font-heading text-3xl">{routine.name}</h1>

      <div className="space-y-3">
        {routine.routineExercises
          .sort((a, b) => a.order - b.order)
          .map((re) => (
            <Card key={re.id} className="p-4">
              <p className="font-semibold">Ejercicio #{re.exerciseId}</p>
              <p className="text-sm text-muted-foreground">
                {re.sets} sets × {re.repsMin}-{re.repsMax} reps
                {re.rir !== null && ` · RIR ${re.rir}`}
              </p>
              {re.notes && (
                <p className="text-sm text-muted-foreground mt-1">{re.notes}</p>
              )}
            </Card>
          ))}
      </div>
    </div>
  );
}
