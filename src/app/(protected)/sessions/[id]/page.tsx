"use client";

import { ExerciseTracker } from "@/components/sessions/exercise-tracker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { fetchExercises } from "@/lib/api/exercises";
import { fetchRoutineDetail } from "@/lib/api/routines";
import {
  fetchPreviousValues,
  fetchSessionDetail,
  finishSession,
} from "@/lib/api/sessions";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SessionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const {
    data: session,
    isLoading,
    error: sessionError,
  } = useQuery({
    queryKey: ["session", params.id],
    queryFn: () => fetchSessionDetail(params.id),
  });

  const { data: routine, error: routineError } = useQuery({
    queryKey: ["routine", session?.routineId],
    queryFn: () => fetchRoutineDetail(String(session?.routineId)),
    enabled: !!session?.routineId,
  });

  const { data: exercises } = useQuery({
    queryKey: ["exercises"],
    queryFn: fetchExercises,
    staleTime: 1000 * 60 * 30,
  });

  const previousQueries = useQueries({
    queries: (routine?.routineExercises ?? []).map((re) => ({
      queryKey: ["previous-values", re.exerciseId],
      queryFn: () => fetchPreviousValues(re.exerciseId),
      enabled: !!routine,
    })),
  });

  const {
    mutate: handleFinish,
    isPending: isFinishing,
    error: finishError,
  } = useMutation({
    mutationFn: () => finishSession(session!.id),
    onSuccess: () => {
      toast.success("Entrenamiento finalizado");
      router.push("/routines");
    },
  });

  const exerciseName = (id: number) =>
    exercises?.find((e) => e.id === id)?.name ?? `Ejercicio #${id}`;

  if (isLoading)
    return (
      <p className="p-6 text-sm text-muted-foreground">Cargando sesión...</p>
    );
  if (sessionError)
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error al cargar la sesión</AlertTitle>
        <AlertDescription>Intenta recargar la página.</AlertDescription>
      </Alert>
    );
  if (routineError)
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error al cargar la rutina</AlertTitle>
        <AlertDescription>Intenta recargar la página.</AlertDescription>
      </Alert>
    );

  if (!session) return null;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-4xl tracking-wide">ENTRENO</h1>
        <Button
          onClick={() => handleFinish()}
          disabled={isFinishing}
          variant="outline"
        >
          {isFinishing ? "Finalizando..." : "Terminar"}
        </Button>

        {finishError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No se pudo finalizar la sesión</AlertTitle>
            <AlertDescription>Intenta de nuevo.</AlertDescription>
          </Alert>
        )}
      </div>
      {routine?.routineExercises
        .sort((a, b) => a.order - b.order)
        .map((re, index) => (
          <ExerciseTracker
            key={re.id}
            sessionId={session.id}
            exerciseId={re.exerciseId}
            exerciseName={exerciseName(re.exerciseId)}
            targetSets={re.sets}
            existingSets={session.workoutSets.filter(
              (s) => s.exerciseId === re.exerciseId,
            )}
            previousValues={previousQueries[index]?.data ?? []}
          />
        ))}
    </div>
  );
}
