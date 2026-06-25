import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-[52px] w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-cyan-300/60 focus:bg-slate-950/80",
        className,
      )}
      {...props}
    />
  );
}
