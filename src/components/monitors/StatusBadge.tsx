import { Badge } from "@/components/ui/badge";
import { CheckStatus } from "@prisma/client";

interface Props {
  status: CheckStatus | null;
}

const config: Record<
  CheckStatus | "UNKNOWN",
  { label: string; className: string }
> = {
  UP: {
    label: "Operativo",
    className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/20",
  },
  DEGRADED: {
    label: "Degradado",
    className: "bg-amber-500/15 text-amber-700 border-amber-500/30 hover:bg-amber-500/20",
  },
  DOWN: {
    label: "Caído",
    className: "bg-red-500/15 text-red-700 border-red-500/30 hover:bg-red-500/20",
  },
  UNKNOWN: {
    label: "Sin datos",
    className: "bg-slate-500/15 text-slate-600 border-slate-500/30 hover:bg-slate-500/20",
  },
};

export function StatusBadge({ status }: Props) {
  const key = status ?? "UNKNOWN";
  const { label, className } = config[key];
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}
