const DAY_LABELS: Record<number, string> = {
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
  7: "Domingo",
};

export function formatDayOfWeek(day: number | null): string {
  if (day === null) return "Sin día asignado";
  return DAY_LABELS[day] ?? "Día inválido";
}
