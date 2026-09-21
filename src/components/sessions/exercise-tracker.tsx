"use-client";

import { createSet, updateSet } from "@/lib/api/sessions";
import { PreviousSetValues, WorkoutSet } from "@/lib/types/sessions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle, Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DraftRow {
  weight: string;
  reps: string;
  rir: string;
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

  const [drafts, setDrafts] = useState<Record<number, Partial<DraftRow>>>({});
  const [pulseRowIndex, setPulseRowIndex] = useState<number | null>(null);

  function getFieldValue(rowIndex: number, field: keyof DraftRow): string {
    const edited = drafts[rowIndex]?.[field];
    if (edited !== undefined) return edited; // el usuario ya escribió algo aquí

    const prev = previousValues.find((p) => p.order === rowIndex + 1);
    if (field === "weight") return prev?.weight?.toString() ?? "";
    if (field === "reps") return prev?.reps?.toString() ?? "";
    return prev?.rir?.toString() ?? "";
  }

  const [pendingRows, setPendingRows] = useState<Set<number>>(new Set());

  const { mutate: toggleSet, error: confirmError } = useMutation({
    mutationFn: async ({
      rowIndex,
      existingSetId,
    }: {
      rowIndex: number;
      existingSetId?: number;
    }) => {
      setPendingRows((prev) => new Set(prev).add(rowIndex));

      const weightValue = getFieldValue(rowIndex, "weight");
      const repsValue = getFieldValue(rowIndex, "reps");
      const rirValue = getFieldValue(rowIndex, "rir");

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
                rir: current.rir?.toString() ?? "",
              },
            }));
          }
          return updateSet(sessionId, existingSetId, { isCompleted: false });
        }

        // Volver a marcar: manda lo que esté en el draft AHORA (puede haber cambiado)
        return updateSet(sessionId, existingSetId, {
          weight: weightValue ? Number(weightValue) : null,
          reps: Number(repsValue),
          rir: rirValue ? Number(rirValue) : null,
          isCompleted: true,
        });
      }

      const created = await createSet(sessionId, {
        exerciseId,
        weight: weightValue ? Number(weightValue) : null,
        reps: Number(repsValue),
        rir: rirValue ? Number(rirValue) : null,
      });

      return updateSet(sessionId, created.id, { isCompleted: true });
    },
    onSuccess: (result, variables) => {
      if (result.isCompleted) {
        setPulseRowIndex(variables.rowIndex);
      }
    },
    onSettled: (_data, _error, variables) => {
      setPendingRows((prev) => {
        const next = new Set(prev);
        next.delete(variables.rowIndex);
        return next;
      });
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
            <th className="text-left font-normal py-2 px-3 w-20">RIR</th>
            <th className="text-center font-normal py-2 px-3 w-14">✓</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: totalRows }, (_, i) => i).map((i) => {
            const existing = existingSets.find((s) => s.order === i + 1);
            const prev = previousValues[i];
            const isConfirmed = Boolean(existing?.isCompleted);
            return (
              <tr
                key={i}
                onAnimationEnd={() => {
                  if (pulseRowIndex === i) setPulseRowIndex(null);
                }}
                className={`${
                  isConfirmed
                    ? "bg-primary/10"
                    : i % 2 === 1
                      ? "bg-muted dark:bg-muted/40"
                      : ""
                } ${pulseRowIndex === i ? "animate-row-pulse" : ""}`}
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
                      existing?.isCompleted
                        ? (existing.weight ?? "")
                        : getFieldValue(i, "weight")
                    }
                    disabled={isConfirmed}
                    onChange={(e) => updateDraft(i, "weight", e.target.value)}
                    className="h-9"
                    min={0}
                  />
                </td>
                <td className="py-2 px-3">
                  <Input
                    type="number"
                    value={
                      existing?.isCompleted
                        ? (existing.reps ?? "")
                        : getFieldValue(i, "reps")
                    }
                    disabled={isConfirmed}
                    onChange={(e) => updateDraft(i, "reps", e.target.value)}
                    className="h-9"
                    min={0}
                  />
                </td>
                <td className="py-2 px-3">
                  <Input
                    type="number"
                    value={
                      existing?.isCompleted
                        ? (existing.rir ?? "")
                        : getFieldValue(i, "rir")
                    }
                    disabled={isConfirmed}
                    onChange={(e) => updateDraft(i, "rir", e.target.value)}
                    className="h-9"
                    min={0}
                  />
                </td>
                <td className="py-2 px-3 text-center">
                  <button
                    onClick={() =>
                      toggleSet({ rowIndex: i, existingSetId: existing?.id })
                    }
                    disabled={pendingRows.has(i)}
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
        <Alert variant="destructive" className="mx-4 mb-3 w-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No se pudo guardar la serie</AlertTitle>
          <AlertDescription>Intenta de nuevo.</AlertDescription>
        </Alert>
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
