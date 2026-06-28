"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckStatus } from "@prisma/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface CheckSlot {
  status: CheckStatus;
  checkedAt: Date;
  latency: number | null;
}

interface Props {
  checks: CheckSlot[];
  slots?: number;
}

const statusColor: Record<CheckStatus | "EMPTY", string> = {
  UP: "bg-emerald-500",
  DEGRADED: "bg-amber-400",
  DOWN: "bg-red-500",
  EMPTY: "bg-slate-200",
};

export function UptimeBar({ checks, slots = 48 }: Props) {
  const filled = checks.slice(0, slots).reverse();
  const empties = Math.max(0, slots - filled.length);

  return (
    <div className="flex items-center gap-px">
      {Array.from({ length: empties }).map((_, i) => (
        <div
          key={`e-${i}`}
          className={`h-6 flex-1 rounded-sm ${statusColor.EMPTY}`}
        />
      ))}
      {filled.map((c, i) => (
        <Tooltip key={i}>
          <TooltipTrigger
            className={`h-6 flex-1 rounded-sm cursor-default transition-opacity hover:opacity-75 ${statusColor[c.status]}`}
          />
          <TooltipContent side="top" className="text-xs">
            <p className="font-medium capitalize">
              {c.status === "UP"
                ? "Operativo"
                : c.status === "DEGRADED"
                  ? "Degradado"
                  : "Caído"}
            </p>
            <p className="text-muted-foreground">
              {format(new Date(c.checkedAt), "d MMM, HH:mm", { locale: es })}
            </p>
            {c.latency !== null && <p>{c.latency} ms</p>}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
