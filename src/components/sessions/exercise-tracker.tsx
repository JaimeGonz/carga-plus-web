"use-client";

import { createSet, updateSet } from "@/lib/api/sessions";
import { PreviousSetValues, WorkoutSet } from "@/lib/types/sessions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";

interface DraftRow {
  weight: string;
  reps: string;
}

export function ExerciseTracker({
  sessionId,
  exerciseId,
  exerciseName,
  targetSets,
  existingSets,
  previousValues,
}: {
  sessionId: number;
  exerciseId: number;
  exerciseName: string;
  targetSets: number;
  existingSets: WorkoutSet[];
  previousValues: PreviousSetValues[];
}) {
  const queryClient = useQueryClient();
  const [extraRows, setExtraRows] = useState(0);
  const totalRows = Math.max(targetSets, existingSets.length) + extraRows;

  const [drafts, setDrafts] = useState<Record<number, DraftRow>>(() => {
    const initial: Record<number, DraftRow> = {};

    for (let i = 0; i < targetSets; i++) {
      const prev = previousValues[i];
      initial[i] = {
        weight: prev?.weight?.toString() ?? "",
        reps: prev?.reps?.toString() ?? "",
      };
    }

    return initial;
  });

  const {
    mutate: toggleSet,
    isPending,
    error: confirmError,
  } = useMutation({
    mutationFn: async ({
      rowIndex,
      existingSetId,
    }: {
      rowIndex: number;
      existingSetId?: number;
    }) => {
      if (existingSetId) {
        const current = existingSets.find((s) => s.id === existingSetId);
        const newCompletedState = !current?.isCompleted;

        if (!newCompletedState) {
          // Desmarcar: solo cambia el estado, sincroniza el draft con lo que ya había
          if (current) {
            setDrafts((d) => ({
              ...d,
              [rowIndex]: {
                weight: current.weight?.toString() ?? "",
                reps: current.reps?.toString() ?? "",
              },
            }));
          }
          return updateSet(sessionId, existingSetId, { isCompleted: false });
        }

        // Volver a marcar: manda lo que esté en el draft AHORA (puede haber cambiado)
        const draft = drafts[rowIndex] ?? { weight: "", reps: "" };
        return updateSet(sessionId, existingSetId, {
          weight: draft.weight ? Number(draft.weight) : null,
          reps: Number(draft.reps),
          isCompleted: true,
        });
      }

      const draft = drafts[rowIndex] ?? { weight: "", reps: "" };
      const created = await createSet(sessionId, {
        exerciseId,
        weight: draft.weight ? Number(draft.weight) : null,
        reps: Number(draft.reps),
        rir: null,
      });

      return updateSet(sessionId, created.id, { isCompleted: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["session", String(sessionId)],
      });
    },
  });

  function updateDraft(rowIndex: number, field: keyof DraftRow, value: string) {
    setDrafts((d) => ({
      ...d,
      [rowIndex]: { ...d[rowIndex], [field]: value },
    }));
  }

  return (
    <Card className="overflow-hidden py-0 gap-0">
      <div className="p-4 pb-3">
        <p className="font-heading text-lg tracking-wide">{exerciseName}</p>
      </div>
      <table className="w-full text-base">
        <thead>
          <tr className="text-xs text-muted-foreground border-t border-border">
            <th className="text-left font-normal py-2 px-3 w-14">SERIE</th>
            <th className="text-left font-normal py-2 px-3">ANTERIOR</th>
            <th className="text-left font-normal py-2 px-3 w-24">KG</th>
            <th className="text-left font-normal py-2 px-3 w-20">REPS</th>
            <th className="text-center font-normal py-2 px-3 w-14">✓</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: totalRows }, (_, i) => i).map((i) => {
            const existing = existingSets[i];
            const prev = previousValues[i];
            const isConfirmed = Boolean(existing?.isCompleted);

            return (
              <tr
                key={i}
                className={i % 2 === 1 ? "bg-muted dark:bg-muted/40" : ""}
              >
                <td className="py-2.5 px-3 font-heading text-lg text-primary">
                  {i + 1}
                </td>
                <td className="py-2.5 px-3 text-xs text-muted-foreground">
                  {prev ? `${prev.weight ?? "-"}kg x ${prev.reps}` : "—"}
                </td>
                <td className="py-2 px-3">
                  <Input
                    type="number"
                    value={
                      isConfirmed
                        ? (existing.weight ?? "")
                        : (drafts[i]?.weight ?? "")
                    }
                    disabled={isConfirmed}
                    onChange={(e) => updateDraft(i, "weight", e.target.value)}
                    className="h-9"
                  />
                </td>
                <td className="py-2 px-3">
                  <Input
                    type="number"
                    value={
                      isConfirmed
                        ? (existing.reps ?? "")
                        : (drafts[i]?.reps ?? "")
                    }
                    disabled={isConfirmed}
                    onChange={(e) => updateDraft(i, "reps", e.target.value)}
                    className="h-9"
                  />
                </td>
                <td className="py-2 px-3 text-center">
                  <button
                    onClick={() =>
                      toggleSet({ rowIndex: i, existingSetId: existing?.id })
                    }
                    disabled={isPending}
                    className={`h-8 w-8 rounded-md inline-flex items-center justify-center transition-colors duration-200 ${
                      isConfirmed
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {confirmError && (
        <p className="px-4 pb-3 text-xs text-destructive">
          No se pudo guardar el set. Intente de nuevo.
        </p>
      )}
      <button
        onClick={() => setExtraRows((n) => n + 1)}
        className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 border-t border-border cursor-pointer"
      >
        + Agregar Serie
      </button>
    </Card>
  );
}
