import { CheckStatus } from "@prisma/client";

interface Props {
  status: CheckStatus | null;
  size?: "sm" | "md";
}

const colors: Record<CheckStatus | "UNKNOWN", string> = {
  UP: "bg-emerald-500",
  DEGRADED: "bg-amber-500",
  DOWN: "bg-red-500",
  UNKNOWN: "bg-slate-400",
};

const pulse: Record<CheckStatus | "UNKNOWN", string> = {
  UP: "bg-emerald-500",
  DEGRADED: "bg-amber-500",
  DOWN: "bg-red-500",
  UNKNOWN: "",
};

export function StatusDot({ status, size = "md" }: Props) {
  const key = status ?? "UNKNOWN";
  const dim = size === "sm" ? "h-2 w-2" : "h-3 w-3";

  return (
    <span className="relative flex items-center justify-center">
      {key !== "UNKNOWN" && (
        <span
          className={`absolute inline-flex ${dim} animate-ping rounded-full opacity-50 ${pulse[key]}`}
        />
      )}
      <span className={`relative inline-flex rounded-full ${dim} ${colors[key]}`} />
    </span>
  );
}
