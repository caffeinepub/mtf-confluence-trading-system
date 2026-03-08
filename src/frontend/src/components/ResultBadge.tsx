import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ResultBadgeProps {
  result: string;
  className?: string;
}

export function ResultBadge({ result, className }: ResultBadgeProps) {
  const config = {
    Win: {
      cls: "bg-win-subtle text-win border-win/30 font-semibold",
    },
    Loss: {
      cls: "bg-loss-subtle text-loss border-loss/30 font-semibold",
    },
    Pending: {
      cls: "bg-pending-subtle text-pending border-pending/30 font-semibold",
    },
  };

  const cfg = config[result as keyof typeof config] ?? {
    cls: "bg-muted text-muted-foreground",
  };

  return (
    <Badge variant="outline" className={cn(cfg.cls, className)}>
      {result}
    </Badge>
  );
}
