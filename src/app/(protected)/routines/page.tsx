"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { fetchRoutines } from "@/lib/api/routines";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function RoutinesPage() {
  const {
    data: routines,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["routines"],
    queryFn: fetchRoutines,
  });

  if (isLoading) return <p className="p-6">Cargando rutinas...</p>;
  if (error) {
    return <p className="p-6 text-destructive">Error al cargar rutinas.</p>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="font-heading text-3xl">RUTINAS</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {routines?.map((routine) => (
          <Link key={routine.id} href={`/routines/${routine.id}`}>
            <Card
              key={routine.id}
              className="p-4 flex items-center justify-between hover:bg-accent transition-colors"
            >
              <div>
                <p className="font-semibold">{routine.name}</p>
                {routine.description && (
                  <p className="text-sm text-muted-foreground">
                    {routine.description}
                  </p>
                )}
              </div>
              {routine.type && <Badge variant="outline">{routine.type}</Badge>}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
