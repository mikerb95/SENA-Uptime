import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { StatusDot } from "./StatusDot";
import { UptimeBar } from "./UptimeBar";
import { CheckStatus } from "@prisma/client";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface CheckSlot {
  status: CheckStatus;
  checkedAt: Date;
  latency: number | null;
}

interface Props {
  id: string;
  name: string;
  url: string;
  description?: string | null;
  currentStatus: CheckStatus | null;
  lastLatency: number | null;
  recentChecks: CheckSlot[];
  uptimePct?: number | null;
}

export function MonitorCard({
  id,
  name,
  url,
  description,
  currentStatus,
  lastLatency,
  recentChecks,
  uptimePct,
}: Props) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <StatusDot status={currentStatus} />
            <Link
              href={`/services/${id}`}
              className="font-semibold text-sm truncate hover:underline"
            >
              {name}
            </Link>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground shrink-0"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <StatusBadge status={currentStatus} />
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        <UptimeBar checks={recentChecks} slots={48} />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Últimas 48 verificaciones</span>
          <div className="flex gap-3">
            {lastLatency !== null && <span>{lastLatency} ms</span>}
            {uptimePct !== null && uptimePct !== undefined && (
              <span className="font-medium text-foreground">
                {uptimePct}% uptime
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
