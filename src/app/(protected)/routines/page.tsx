"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { fetchRoutines } from "@/lib/api/routines";
import { formatDayOfWeek } from "@/lib/format";
import { AlertCircle, ChevronRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function RoutinesPage() {
  const {
    data: routines,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["routines"],
    queryFn: fetchRoutines,
  });

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-4xl tracking-wide">RUTINAS</h1>
        <p className="text-sm text-muted-foreground">
          Tus días de entrenamiento
        </p>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Cargando rutinas...</p>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error al cargar rutinas</AlertTitle>
          <AlertDescription>Intenta recargar la página.</AlertDescription>
        </Alert>
      )}
      {routines?.length === 0 && (
        <p className="text-sm text-muted-foreground">Aún no tienes rutinas.</p>
      )}

      <div className="space-y-2 flex flex-col gap-0.5">
        {routines?.map((routine) => (
          <Link key={routine.id} href={`/routines/${routine.id}`}>
            <div className="rounded-lg border border-border bg-card p-4 flex items-center justify-between hover:border-primary transition-colors duration-200 cursor-pointer">
              <div>
                <p className="font-semibold">{routine.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDayOfWeek(routine.dayOfWeek)}
                  {routine.type && ` · ${routine.type}`}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
