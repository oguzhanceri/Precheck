import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-white text-slate-950 shadow-[0_20px_60px_rgba(255,255,255,0.18)] hover:bg-cyan-100",
  secondary:
    "border border-white/10 bg-white/10 text-white hover:border-white/25 hover:bg-white/10",
  ghost: "text-white/70 hover:bg-white/10 hover:text-white",
};

const baseClass =
  "inline-flex h-12 items-center justify-center rounded-full px-5 text-sm font-semibold tracking-[-0.02em] transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300";

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
}) {
  return (
    <button className={cn(baseClass, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  className,
  variant = "primary",
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  href: string;
  variant?: Variant;
}) {
  return (
    <Link href={href} className={cn(baseClass, variants[variant], className)} {...props}>
      {children}
    </Link>
  );
}
