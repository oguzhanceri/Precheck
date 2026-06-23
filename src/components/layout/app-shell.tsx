import type { ReactNode } from "react";
import Link from "next/link";
import { appNav } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";

export function AppShell({
  children,
  activePath,
  title,
  eyebrow,
}: {
  children: ReactNode;
  activePath: string;
  title: string;
  eyebrow?: string;
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_32rem),linear-gradient(135deg,#040816,#07111f_48%,#050914)] text-white">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-[300px_1fr]">
        <aside className="border-b border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl lg:border-b-0 lg:border-r lg:p-6">
          <Link href="/" className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.06] p-4">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-cyan-300 text-sm font-black text-slate-950">
              P
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-[-0.02em]">Precheck AI</span>
              <span className="text-xs text-white/50">Delivery OS</span>
            </span>
          </Link>

          <nav className="mt-6 grid gap-2">
            {appNav.map((item) => {
              const active = item.href === activePath;

              return (
                <Link
                  href={item.href}
                  key={item.href}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm font-medium text-white/60 transition hover:bg-white/10 hover:text-white",
                    active && "  text-slate-950 shadow-[0_18px_60px_rgba(255,255,255,0.14)] hover:text-slate-950",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-[1.75rem] border border-cyan-300/20 bg-cyan-300/10 p-5">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-cyan-100/70">Sistem</p>
            <p className="mt-3 text-2xl font-semibold tracking-[-0.05em]">Online</p>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Tarama modülleri hazır. SEO, responsive, performans ve UI kontrolleri aktif.
            </p>
          </div>
        </aside>

        <section className="p-4 sm:p-6 lg:p-8">
          <header className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-100/60">
                {eyebrow ?? "Kontrol Merkezi"}
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] sm:text-4xl">{title}</h1>
            </div>
            <ButtonLink href="/scanner" className="w-full sm:w-auto bg-slate-950!">
              Yeni Tarama Başlat
            </ButtonLink>
          </header>

          {children}
        </section>
      </div>
    </main>
  );
}
