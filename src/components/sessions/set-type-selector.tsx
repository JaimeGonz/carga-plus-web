"use client";

import { SET_TYPE_INFO, SetType } from "@/lib/types/sessions";
import { useState } from "react";
import { ResponsiveSelector } from "@/components/ui/responsive-selector";
import { Trash2 } from "lucide-react";

export function SetTypeSelector({
  currentOrder,
  currentType,
  onSelect,
  onDelete,
}: {
  currentOrder: number;
  currentType: SetType;
  onSelect: (type: SetType) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const info = SET_TYPE_INFO[currentType];

  return (
    <ResponsiveSelector
      open={open}
      onOpenChange={setOpen}
      title="Seleccionar tipo de serie"
      trigger={
        <button className={`font-heading text-lg ${info.color}`}>
          {info.shortLabel || currentOrder}
        </button>
      }
    >
      <div className="space-y-1">
        {(Object.keys(SET_TYPE_INFO) as SetType[]).map((type) => (
          <button
            key={type}
            onClick={() => {
              onSelect(type);
              setOpen(false);
            }}
            className="w-full flex items-center gap-3 py-3 px-3 rounded-md hover:bg-muted transition-colors duration-200 text-left"
          >
            <span
              className={`font-heading text-lg w-6 ${SET_TYPE_INFO[type].color}`}
            >
              {SET_TYPE_INFO[type].shortLabel || "1"}
            </span>
            <span>{SET_TYPE_INFO[type].label}</span>
          </button>
        ))}

        <div className="border-t border-border my-1" />

        <button
          onClick={() => {
            onDelete();
            setOpen(false);
          }}
          className="w-full flex items-center gap-3 py-3 px-2 rounded-md hover:bg-destructive/10 transition-colors duration-200 text-left text-destructive"
        >
          <Trash2 className="h-5 w-5" />
          <span>Eliminar serie</span>
        </button>
      </div>
    </ResponsiveSelector>
  );
}
