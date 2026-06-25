import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { StatusTone } from "@/types";

const toneClasses: Record<StatusTone, string> = {
  success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  warning: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  danger: "border-rose-400/30 bg-rose-400/10 text-rose-200",
  neutral: "border-white/10 bg-white/10 text-white/70",
  info: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-[-0.01em]",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
