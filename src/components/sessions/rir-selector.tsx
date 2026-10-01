"use client";

import { useState } from "react";
import { ResponsiveSelector } from "@/components/ui/responsive-selector";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal } from "lucide-react";

const RIR_DESCRIPTIONS: Record<number, { label: string; detail: string }> = {
  0: {
    label: "Fallo muscular",
    detail: "No podrías hacer ninguna repetición más",
  },
  1: {
    label: "Casi al fallo",
    detail: "Probablemente 1 repetición más en el tanque",
  },
  2: { label: "Esfuerzo muy duro", detail: "Podrías hacer 2 repeticiones más" },
  3: { label: "Esfuerzo duro", detail: "Buen margen, 3 repeticiones más" },
  4: { label: "Esfuerzo moderado", detail: "4 repeticiones más disponibles" },
  5: { label: "Esfuerzo ligero", detail: "Típico de calentamiento" },
};

export function RirSelector({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const displayValue = value ?? 2;
  const info = RIR_DESCRIPTIONS[displayValue];

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen && value === null) {
      onChange(2);
    }
  }

  return (
    <ResponsiveSelector
      open={open}
      onOpenChange={handleOpenChange}
      title="Registrar RIR de la serie"
      trigger={
        <button className="h-9 w-full rounded-md border border-input bg-background hover:bg-muted transition-colors duration-200 flex items-center justify-center gap-1 text-sm font-medium">
          <span
            className={
              value !== null ? "text-primary" : "text-muted-foreground"
            }
          >
            {value ?? "RIR"}
          </span>
          <SlidersHorizontal className="h-3 w-3 text-muted-foreground" />
        </button>
      }
    >
      <div className="space-y-4 px-2 py-2">
        <div className="text-center">
          <p className="font-heading text-6xl text-primary">{displayValue}</p>
          <p className="font-medium mt-1">{info.label}</p>
          <p className="text-sm text-muted-foreground">{info.detail}</p>
        </div>

        <Slider
          min={0}
          max={5}
          step={1}
          value={[displayValue]}
          onValueChange={([v]) => onChange(v)}
        />

        <div className="flex justify-between text-xs text-muted-foreground px-1">
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <span key={n}>{n}</span>
          ))}
        </div>
      </div>
    </ResponsiveSelector>
  );
}
