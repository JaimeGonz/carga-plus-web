"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchRoutineDetail } from "@/lib/api/routines";
import { fetchExercises } from "@/lib/api/exercises";
import { formatDayOfWeek } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startSession } from "@/lib/api/sessions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

export default function RoutineDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const {
    mutate: handleStart,
    isPending,
    error: startError,
  } = useMutation({
    mutationFn: () => startSession(Number(params.id)),
    onSuccess: (session) => {
      toast.success("Sesión iniciada");
      router.push(`/sessions/${session.id}`);
    },
  });

  const {
    data: routine,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["routine", params.id],
    queryFn: () => fetchRoutineDetail(params.id),
  });

  const { data: exercises } = useQuery({
    queryKey: ["exercises"],
    queryFn: fetchExercises,
    staleTime: 1000 * 60 * 30, // 30 min — el catálogo cambia poco
  });

  const exerciseName = (id: number) =>
    exercises?.find((e) => e.id === id)?.name ?? `Ejercicio #${id}`;

  if (isLoading)
    return (
      <p className="p-6 text-sm text-muted-foreground">Cargando rutina...</p>
    );
  if (error)
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error al cargar la rutina</AlertTitle>
        <AlertDescription>Intenta recargar la página.</AlertDescription>
      </Alert>
    );
  if (!routine) return null;

  const totalSets = routine.routineExercises.reduce(
    (sum, re) => sum + re.sets,
    0,
  );

  return (
    <div className="p-6 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <Link
          href="/routines"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Rutinas
        </Link>

        <h1 className="font-heading text-4xl tracking-wide">{routine.name}</h1>

        <Button
          onClick={() => handleStart()}
          disabled={isPending}
          className="w-full cursor-pointer"
          size="lg"
        >
          {isPending ? "Iniciando..." : "Comenzar rutina"}
        </Button>
        {startError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No se pudo iniciar la sesión</AlertTitle>
            <AlertDescription>Intenta de nuevo.</AlertDescription>
          </Alert>
        )}

        {routine.routineExercises
          .sort((a, b) => a.order - b.order)
          .map((re) => (
            <Card key={re.id} className="overflow-hidden py-0 gap-0">
              <div className="p-4 pb-3">
                <p className="font-semibold text-base">
                  {exerciseName(re.exerciseId)}
                </p>
                {re.notes && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {re.notes}
                  </p>
                )}
              </div>
              <table className="w-full text-base">
                <thead>
                  <tr className="text-xs text-muted-foreground border-t border-border">
                    <th className="text-left font-normal py-2.5 px-4 w-16 text-xs">
                      SERIE
                    </th>
                    <th className="text-left font-normal py-2 px-4">
                      RANGO DE REPS
                    </th>
                    {re.rir !== null && (
                      <th className="text-left font-normal py-2 px-4 w-20">
                        RIR
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: re.sets }, (_, i) => i + 1).map(
                    (setNumber) => (
                      <tr
                        key={setNumber}
                        className={
                          setNumber % 2 === 0 ? "bg-muted dark:bg-muted/40" : ""
                        }
                      >
                        <td className="py-3 px-4 font-heading text-xl text-primary">
                          {setNumber}
                        </td>
                        <td className="py-3 px-4 text-base">
                          {re.repsMin}-{re.repsMax}
                        </td>
                        {re.rir !== null && (
                          <td className="py-3 px-4 text-muted-foreground">
                            {re.rir}
                          </td>
                        )}
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </Card>
          ))}
      </div>

      <div className="space-y-4">
        <Card className="p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Resumen
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="font-heading text-2xl text-primary">
                {routine.routineExercises.length}
              </p>
              <p className="text-xs text-muted-foreground">Ejercicios</p>
            </div>
            <div>
              <p className="font-heading text-2xl text-primary">{totalSets}</p>
              <p className="text-xs text-muted-foreground">Series totales</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
            {formatDayOfWeek(routine.dayOfWeek)}
          </p>
        </Card>
      </div>
    </div>
  );
}
