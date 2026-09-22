"use client";

import { createSet, updateSet } from "@/lib/api/sessions";
import { PreviousSetValues, WorkoutSet } from "@/lib/types/sessions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { AlertCircle, Check, Plus, X } from "lucide-react";
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

  function isFieldEdited(rowIndex: number, field: keyof DraftRow): boolean {
    return drafts[rowIndex]?.[field] !== undefined;
  }

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
    <div className="border-b border-border pb-4">
      <p className="font-heading text-lg tracking-wider mb-2">{exerciseName}</p>
      <table className="w-full text-base table-fixed">
        <thead>
          <tr className="text-xs text-muted-foreground">
            <th className="text-center font-normal py-2 px-1 w-10">#</th>
            <th className="text-left font-normal py-2 px-1">ANTERIOR</th>
            <th className="text-center font-normal py-2 px-1 w-16">KG</th>
            <th className="text-center font-normal py-2 px-1 w-14">REPS</th>
            <th className="text-center font-normal py-2 px-1 w-14">RIR</th>
            <th className="text-center font-normal py-2 px-1 w-12">✓</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: totalRows }, (_, i) => i).map((i) => {
            const existing = existingSets.find((s) => s.order === i + 1);
            const prev = previousValues.find((p) => p.order === i + 1);
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
                <td className="py-2 px-1 text-center font-heading text-lg text-primary">
                  {i + 1}
                </td>
                <td className="py-2 px-1 text-xs text-muted-foreground truncate">
                  {prev ? `${prev.weight ?? "-"}kg x ${prev.reps}` : "—"}
                </td>
                {/* KG */}
                <td className="py-2.5 px-1">
                  {existing?.isCompleted ? (
                    <p className="text-center font-medium">
                      {existing.weight ?? "-"}
                    </p>
                  ) : (
                    <Input
                      type="number"
                      value={getFieldValue(i, "weight")}
                      onChange={(e) => updateDraft(i, "weight", e.target.value)}
                      className={`h-9 text-center px-1 ${!isFieldEdited(i, "weight") ? "text-muted-foreground" : ""}`}
                      min={0}
                    />
                  )}
                </td>

                {/* REPS */}
                <td className="py-2.5 px-1">
                  {existing?.isCompleted ? (
                    <p className="text-center font-medium">
                      {existing.reps ?? "-"}
                    </p>
                  ) : (
                    <Input
                      type="number"
                      value={getFieldValue(i, "reps")}
                      onChange={(e) => updateDraft(i, "reps", e.target.value)}
                      className={`h-9 text-center px-1 ${!isFieldEdited(i, "reps") ? "text-muted-foreground" : ""}`}
                      min={0}
                    />
                  )}
                </td>

                {/* RIR */}
                <td className="py-2.5 px-1">
                  {existing?.isCompleted ? (
                    <p className="text-center font-medium">
                      {existing.rir ?? "-"}
                    </p>
                  ) : (
                    <Input
                      type="number"
                      value={getFieldValue(i, "rir")}
                      onChange={(e) => updateDraft(i, "rir", e.target.value)}
                      className={`h-9 text-center px-1 ${
                        !isFieldEdited(i, "rir") ? "text-muted-foreground" : ""
                      }`}
                      min={0}
                      max={5} // valores mayores no aportan info útil de esfuerzo real, ya son series lejos del fallo
                    />
                  )}
                </td>
                <td className="py-2.5 px-1 text-center">
                  <button
                    onClick={() =>
                      toggleSet({ rowIndex: i, existingSetId: existing?.id })
                    }
                    disabled={pendingRows.has(i)}
                    className={`h-10 w-10 rounded-md inline-flex items-center justify-center transition-colors duration-200 ${
                      isConfirmed
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-muted-foreground bg-transparent"
                    }`}
                  >
                    <Check className="h-5 w-5" />
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

      {extraRows > 0 && (
        <button
          onClick={() => setExtraRows((n) => n - 1)}
          className="w-full py-2 flex items-center justify-center gap-1.5 text-xs text-destructive/70 hover:text-destructive transition-colors duration-200 cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
          Deshacer última serie agregada
        </button>
      )}

      <button
        onClick={() => setExtraRows((n) => n + 1)}
        className="w-full py-2 mt-3 flex items-center justify-center gap-2 rounded-lg bg-muted hover:bg-muted/70 text-sm font-medium transition-colors duration-200 cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        Agregar Serie
      </button>
    </div>
  );
}
