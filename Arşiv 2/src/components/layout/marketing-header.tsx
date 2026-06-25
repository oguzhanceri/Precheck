import Link from "next/link";
import { marketingNav } from "@/lib/constants";
import { ButtonLink } from "@/components/ui/button";

export function MarketingHeader() {
  return (
    <header className="fixed left-0 top-0 z-50 w-full px-4 py-4 sm:px-6">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between rounded-full border border-white/10 bg-slate-950/70 px-4 shadow-[0_20px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:px-6">
        <Link href="/" className="flex items-center gap-3 text-white">
          <span className="flex size-10 items-center justify-center rounded-full bg-cyan-300 text-sm font-black text-slate-950">
            P
          </span>
          <span className="text-sm font-semibold tracking-[-0.02em]">Precheck AI</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {marketingNav.map((item) => (
            <Link
              href={item.href}
              key={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ButtonLink href="/auth" variant="ghost" className="hidden sm:inline-flex">
            Giriş
          </ButtonLink>
          <ButtonLink href="/scanner" className="h-10 px-4">
            Yeni Tarama
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
