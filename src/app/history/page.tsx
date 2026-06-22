import Link from "next/link";
import type { ReactNode } from "react";

const sidebarItems = [
  { label: "Genel Bakış", href: "/dashboard", icon: "grid" },
  { label: "Yeni Tarama", href: "/scanner", icon: "search" },
  { label: "Canlı İzleme", href: "/live", icon: "live" },
  { label: "Analiz Geçmişi", href: "/history", icon: "history", active: true },
  { label: "Raporlar", href: "/report", icon: "file" },
  { label: "Takım", href: "/settings", icon: "team" },
  { label: "Ayarlar", href: "/settings", icon: "settings" },
];

const statCards = [
  {
    title: "Toplam Tarama",
    value: "128",
    desc: "↗ Son 30 günde 42 yeni tarama",
    icon: "chart",
    tone: "blue",
  },
  {
    title: "Tamamlanan",
    value: "104",
    desc: "Başarı oranı %81",
    icon: "check",
    tone: "green",
  },
  {
    title: "Uyarılı",
    value: "19",
    desc: "İnceleme önerilir",
    icon: "warning",
    tone: "orange",
  },
  {
    title: "Başarısız",
    value: "5",
    desc: "Tekrar denenebilir",
    icon: "alert",
    tone: "red",
  },
];

const rows = [
  {
    site: "orneksite.com",
    url: "https://orneksite.com",
    date: "10 Haz 2025",
    time: "14:32",
    score: "92",
    status: "Tamamlandı",
    critical: "2",
    type: "success",
    icon: "globe",
  },
  {
    site: "shop.acmedijital.com",
    url: "https://shop.acmedijital.com",
    date: "10 Haz 2025",
    time: "11:18",
    score: "88",
    status: "Uyarı",
    critical: "5",
    type: "warning",
    icon: "cart",
    selected: true,
  },
  {
    site: "blog.acmedijital.com",
    url: "https://blog.acmedijital.com",
    date: "9 Haz 2025",
    time: "16:45",
    score: "95",
    status: "Tamamlandı",
    critical: "0",
    type: "success",
    icon: "article",
  },
  {
    site: "landing.yeniurun.com",
    url: "https://landing.yeniurun.com",
    date: "9 Haz 2025",
    time: "09:02",
    score: "-",
    status: "İnceleniyor",
    critical: "-",
    type: "info",
    icon: "window",
  },
  {
    site: "kurumsal-demo.com",
    url: "https://kurumsal-demo.com",
    date: "8 Haz 2025",
    time: "18:10",
    score: "-",
    status: "Başarısız",
    critical: "-",
    type: "failed",
    icon: "image",
  },
];

const problems = [
  {
    title: "Yavaş TTFB (İlk Bayt Süresi)",
    desc: "24 sitede tespit edildi",
    icon: "speed",
    tone: "red",
  },
  {
    title: "Eksik Güvenlik Başlıkları",
    desc: "18 sitede tespit edildi",
    icon: "shield",
    tone: "orange",
  },
  {
    title: "Optimize Edilmemiş Görseller",
    desc: "15 sitede tespit edildi",
    icon: "image",
    tone: "yellow",
  },
];

export default function HistoryPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#070b15] text-[#e7e9f4]">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_38%_0%,rgba(80,96,130,0.22),transparent_34%),linear-gradient(180deg,rgba(8,13,24,0.12),#070b15_86%)]" />

      <div className="relative z-10 flex min-h-screen">
        <Sidebar />

        <section className="min-w-0 flex-1">
          <Topbar />

          <div className="mx-auto grid w-full max-w-[1600px] gap-6 px-6 py-8 xl:grid-cols-[1fr_300px]">
            <div className="min-w-0">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h1 className="text-[30px] font-extrabold tracking-[-0.05em] text-[#e9ecf6]">
                    Analiz Geçmişi
                  </h1>
                  <p className="mt-3 text-[15px] font-medium text-[#c3cad8]">
                    Geçmiş taramalarınızı inceleyin, filtreleyin ve raporlarınıza hızlıca erişin.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button className="inline-flex h-10 items-center gap-2 rounded-md border border-white/[0.13] bg-[#080d18]/80 px-5 text-[14px] font-extrabold text-[#d7dcea]">
                    <Icon name="download" className="size-4" />
                    CSV Dışa Aktar
                  </button>
                  <Link
                    href="/scanner"
                    className="inline-flex h-10 items-center gap-2 rounded-md bg-[#2f6df6] px-6 text-[14px] font-extrabold text-white shadow-[0_14px_34px_rgba(47,109,246,0.3)]"
                  >
                    <span className="text-xl leading-none">+</span>
                    Yeni Analiz Başlat
                  </Link>
                </div>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card) => (
                  <StatCard key={card.title} {...card} />
                ))}
              </div>

              <section className="mt-8 rounded-xl border border-white/[0.09] bg-[#0d1423]/88 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <div className="flex h-11 items-center gap-3 rounded-lg border border-white/[0.1] bg-[#080d18] px-4">
                  <Icon name="search" className="size-5 text-[#8792a8]" />
                  <input
                    placeholder="Site, URL veya rapor adı ara..."
                    className="h-full min-w-0 flex-1 bg-transparent text-[15px] font-medium text-white outline-none placeholder:text-[#626c80]"
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <FilterButton>Tüm Durumlar</FilterButton>
                  <FilterButton>Tüm Skorlar</FilterButton>
                  <FilterButton>
                    Son 30 Gün <Icon name="calendar" className="size-4" />
                  </FilterButton>
                  <FilterButton>
                    <Icon name="filter" className="size-4" /> Daha Fazla
                  </FilterButton>
                </div>
              </section>

              <nav className="mt-8 flex flex-wrap gap-8 border-b border-white/[0.08] text-[14px] font-bold text-[#aeb6c8]">
                {[
                  ["Tümü", "128", true],
                  ["Tamamlandı", "104"],
                  ["Uyarı", "19"],
                  ["İnceleniyor", "3"],
                  ["Başarısız", "2"],
                ].map(([label, count, active]) => (
                  <button
                    key={String(label)}
                    className={`relative flex items-center gap-2 pb-4 ${
                      active ? "text-[#dfe6ff]" : "text-[#aab2c4]"
                    }`}
                  >
                    {label}
                    <span className="rounded-md bg-white/[0.12] px-2 py-0.5 text-[12px] text-[#b9c4dd]">
                      {count}
                    </span>
                    {active && <span className="absolute bottom-0 left-0 h-px w-full bg-[#b8c7ff]" />}
                  </button>
                ))}
              </nav>

              <section className="mt-5 overflow-hidden rounded-xl border border-white/[0.09] bg-[#0d1423]/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse">
                    <thead>
                      <tr className="text-left text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#9aa3b5]">
                        <th className="px-5 py-5">Site</th>
                        <th className="px-5 py-5">Tarih</th>
                        <th className="px-5 py-5">Skor</th>
                        <th className="px-5 py-5">Durum</th>
                        <th className="px-5 py-5">Kritik</th>
                        <th className="px-5 py-5 text-right">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr
                          key={row.site}
                          className={`border-t border-white/[0.055] ${
                            row.selected ? "bg-white/[0.055]" : ""
                          }`}
                        >
                          <td className="px-5 py-5">
                            <div className="flex items-center gap-4">
                              <span
                                className={`grid size-9 place-items-center rounded-md ${
                                  row.type === "failed"
                                    ? "border border-[#7c3539] bg-[#2a1418] text-[#ff666d]"
                                    : "bg-[#1b2536] text-[#b8c7ff]"
                                }`}
                              >
                                <Icon name={row.icon} className="size-5" />
                              </span>
                              <div>
                                <p className="text-[14px] font-extrabold text-[#dce2ef]">{row.site}</p>
                                <p className="mt-1 text-[12px] font-medium text-[#9aa4b7]">{row.url}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-5 text-[14px] font-bold text-[#b8c0d0]">
                            {row.date}
                            <br />
                            <span className="text-[12px] text-[#9aa4b7]">{row.time}</span>
                          </td>
                          <td className="px-5 py-5">
                            <ScoreBadge score={row.score} type={row.type} />
                          </td>
                          <td className="px-5 py-5">
                            <StatusBadge type={row.type} label={row.status} />
                          </td>
                          <td
                            className={`px-5 py-5 text-[14px] font-extrabold ${
                              row.critical === "5" ? "text-[#f5a623]" : "text-[#d6dbe7]"
                            }`}
                          >
                            {row.critical}
                          </td>
                          <td className="px-5 py-5">
                            <div className="flex items-center justify-end gap-4 text-[#aeb6c8]">
                              <Icon name="eye" className="size-4" />
                              <Icon name="refresh" className="size-4" />
                              <Icon name="trash" className="size-4" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-4 border-t border-white/[0.06] px-5 py-4 md:flex-row md:items-center md:justify-between">
                  <p className="text-[13px] font-bold text-[#aeb6c8]">
                    1-10 / 128 tarama gösteriliyor
                  </p>

                  <div className="flex items-center gap-2">
                    {["‹", "1", "2", "3", "...", "13", "›"].map((item) => (
                      <button
                        key={item}
                        className={`grid size-9 place-items-center rounded-md border text-[13px] font-extrabold ${
                          item === "1"
                            ? "border-[#2f6df6] bg-[#2f6df6] text-white"
                            : "border-white/[0.08] bg-[#080d18] text-[#9da7ba]"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            <RightPanel />
          </div>
        </section>
      </div>
    </main>
  );
}

function Sidebar() {
  return (
    <aside className="hidden w-[264px] shrink-0 border-r border-white/[0.08] bg-[#0c111d]/92 lg:flex lg:flex-col">
      <div className="flex h-[66px] items-center gap-3 border-b border-white/[0.07] px-9">
        <div className="grid size-9 place-items-center rounded-lg bg-[#2f6df6] text-[17px] font-extrabold text-white">
          P
        </div>
        <div>
          <p className="text-[21px] font-extrabold tracking-[-0.05em] text-[#c6d1ff]">Precheck AI</p>
          <p className="mt-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#cbd2df]">
            Enterprise Analytics
          </p>
        </div>
      </div>

      <nav className="flex-1 px-5 py-8">
        <div className="space-y-3">
          {sidebarItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex h-12 items-center gap-4 rounded-md px-4 text-[16px] font-bold transition ${
                item.active
                  ? "border-r border-[#b8c7ff] bg-white/[0.08] text-[#c9d6ff]"
                  : "text-[#d1d6e2] hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <Icon name={item.icon} className="size-5" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="border-t border-white/[0.08] px-5 py-5">
        <button className="h-11 w-full rounded-md bg-[#2f6df6] text-[14px] font-extrabold text-white shadow-[0_12px_28px_rgba(47,109,246,0.25)]">
          Yükselt
        </button>

        <button className="mt-5 flex h-9 w-full items-center gap-4 rounded-md px-4 text-[16px] font-medium text-[#d1d6e2]">
          <Icon name="help" className="size-5" />
          Destek
        </button>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="flex h-[66px] items-center justify-between border-b border-white/[0.08] bg-[#080d18]/75 px-6 backdrop-blur-xl">
      <nav className="hidden items-center gap-8 lg:flex">
        {[
          ["Dashboard", "/dashboard"],
          ["Tarama", "/scanner"],
          ["Canlı İzleme", "/live"],
          ["Raporlar", "/report"],
          ["Fiyatlandırma", "/pricing"],
        ].map(([item, href]) => (
          <Link
            key={item}
            href={href}
            className={`relative text-[14px] font-bold ${
              item === "Raporlar" ? "text-[#c8d4ff]" : "text-[#c6ccd9]"
            }`}
          >
            {item}
            {item === "Raporlar" && (
              <span className="absolute -bottom-[23px] left-0 h-px w-full bg-[#b8c7ff]" />
            )}
          </Link>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-5">
        <div className="hidden h-10 w-[260px] items-center gap-3 rounded-md border border-white/[0.1] bg-[#080d18] px-3 xl:flex">
          <Icon name="search" className="size-5 text-[#9aa4b7]" />
          <span className="flex-1 text-[14px] font-medium text-[#6f788b]">Hızlı ara...</span>
          <span className="rounded bg-white/[0.12] px-1.5 py-0.5 text-[11px] font-extrabold text-[#b0b8c9]">⌘</span>
          <span className="rounded bg-white/[0.12] px-1.5 py-0.5 text-[11px] font-extrabold text-[#b0b8c9]">K</span>
        </div>

        <span className="h-7 w-px bg-white/[0.08]" />
        <Icon name="bell" className="size-5 text-[#aeb6c8]" />
        <Icon name="settings" className="size-5 text-[#aeb6c8]" />
        <Icon name="layers" className="size-5 text-[#aeb6c8]" />

        <div className="grid size-9 place-items-center overflow-hidden rounded-full border border-[#2f6df6] bg-[#153060]">
          <span className="text-[13px] font-extrabold text-white">A</span>
        </div>
      </div>
    </header>
  );
}

function StatCard({
  title,
  value,
  desc,
  icon,
  tone,
}: {
  title: string;
  value: string;
  desc: string;
  icon: string;
  tone: string;
}) {
  const toneMap: Record<string, string> = {
    blue: "text-[#b8c7ff]",
    green: "text-[#25d18c]",
    orange: "text-[#f5a623]",
    red: "text-[#ff666d]",
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/[0.09] bg-[#0d1423]/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="flex items-start justify-between">
        <span className="grid size-10 place-items-center rounded-lg border border-white/[0.08] bg-[#080d18]">
          <Icon name={icon} className={`size-5 ${toneMap[tone]}`} />
        </span>
        {tone !== "blue" && <span className={`size-2 rounded-full ${tone === "green" ? "bg-[#25d18c]" : tone === "orange" ? "bg-[#f5a623]" : "bg-[#ff515f]"}`} />}
      </div>

      <p className="mt-5 text-[15px] font-bold text-[#b7bfce]">{title}</p>
      <p className="mt-2 text-[34px] font-extrabold tracking-[-0.05em]">{value}</p>
      <p className={`mt-2 text-[12px] font-extrabold ${toneMap[tone]}`}>{desc}</p>
    </div>
  );
}

function FilterButton({ children }: { children: ReactNode }) {
  return (
    <button className="inline-flex h-10 items-center gap-2 rounded-md border border-white/[0.1] bg-[#080d18] px-4 text-[14px] font-extrabold text-[#c1c8d7]">
      {children}
      <span className="text-[#8c96a8]">⌄</span>
    </button>
  );
}

function ScoreBadge({ score, type }: { score: string; type: string }) {
  if (score === "-") {
    return (
      <span className="grid size-9 place-items-center rounded-full bg-[#1b2536] text-[14px] font-extrabold text-[#8f99ad]">
        -
      </span>
    );
  }

  const className =
    type === "warning"
      ? "border-[#6d501d] bg-[#332613] text-[#f2a71e]"
      : "border-[#14624d] bg-[#0d372e] text-[#22d296]";

  return (
    <span className={`grid size-9 place-items-center rounded-full border text-[13px] font-extrabold ${className}`}>
      {score}
    </span>
  );
}

function StatusBadge({ type, label }: { type: string; label: string }) {
  const className =
    type === "warning"
      ? "border-[#6d501d] bg-[#332613] text-[#f2a71e]"
      : type === "info"
        ? "border-[#3f4c70] bg-[#242b3f] text-[#b8c7ff]"
        : type === "failed"
          ? "border-[#7c3539] bg-[#2a1418] text-[#ff666d]"
          : "border-[#14624d] bg-[#0d372e] text-[#22d296]";

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[12px] font-extrabold ${className}`}>
      {type === "failed" ? "×" : "●"} {label}
    </span>
  );
}

function RightPanel() {
  return (
    <aside className="space-y-6">
      <section className="rounded-xl border border-white/[0.09] bg-[#0d1423]/88 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <h2 className="text-[22px] font-extrabold tracking-[-0.04em]">Bu Ayın Özeti</h2>

        <div className="mt-6 space-y-5">
          <SummaryLine icon="chart" label="Yapılan Tarama" value="42" />
          <SummaryLine icon="sigma" label="Ortalama Skor" value="89.4" green />
          <SummaryLine icon="timer" label="Ort. Tarama Süresi" value="1m 45s" />
        </div>

        <div className="mt-7 border-t border-white/[0.08] pt-5">
          <div className="h-1.5 overflow-hidden rounded-full bg-[linear-gradient(90deg,#25d18c_0_74%,#f5a623_74%_92%,#ff515f_92%_100%)]" />
          <div className="mt-3 flex items-center justify-between text-[11px] font-extrabold text-[#9ba5b8]">
            <span>Kota Kullanımı: %42</span>
            <span>58 tarama kaldı</span>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-white/[0.09] bg-[#0d1423]/88 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <h2 className="text-[22px] font-extrabold tracking-[-0.04em]">En Çok Tekrarlanan Sorunlar</h2>

        <div className="mt-6 space-y-5">
          {problems.map((problem) => (
            <div key={problem.title} className="flex gap-4">
              <span
                className={`grid size-6 shrink-0 place-items-center rounded-md ${
                  problem.tone === "red"
                    ? "bg-[#32171d] text-[#ff666d]"
                    : problem.tone === "orange"
                      ? "bg-[#302919] text-[#f5a623]"
                      : "bg-[#2f2b17] text-[#f0cf35]"
                }`}
              >
                <Icon name={problem.icon} className="size-4" />
              </span>
              <div>
                <p className="text-[14px] font-extrabold leading-5 text-[#dce2ef]">{problem.title}</p>
                <p className="mt-1 text-[12px] font-bold text-[#a3adbf]">{problem.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/report"
          className="mt-7 flex h-10 items-center justify-center text-[14px] font-extrabold text-[#b8c7ff]"
        >
          Tüm Sorunları Gör
        </Link>
      </section>
    </aside>
  );
}

function SummaryLine({
  icon,
  label,
  value,
  green,
}: {
  icon: string;
  label: string;
  value: string;
  green?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-[15px] font-extrabold">
      <span className="inline-flex items-center gap-3 text-[#b9c1d0]">
        <Icon name={icon} className="size-4 text-[#aeb6c8]" />
        {label}
      </span>
      <span className={green ? "text-[#25d18c]" : "text-[#dce2ef]"}>{value}</span>
    </div>
  );
}

function Icon({ name, className = "" }: { name: string; className?: string }) {
  const paths: Record<string, ReactNode> = {
    grid: <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />,
    search: <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4" />,
    live: <path d="M4 12a8 8 0 0 1 4-6.9M20 12a8 8 0 0 0-4-6.9M8 12a4 4 0 0 1 2-3.5M16 12a4 4 0 0 0-2-3.5M12 13h.01" />,
    history: <path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.6M4 4v4.6h4.6M12 8v5l3 2" />,
    file: <path d="M6 3h9l4 4v14H6V3ZM14 3v5h5M9 13h6M9 17h6" />,
    team: <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 20a5 5 0 0 1 10 0M11 20a5 5 0 0 1 10 0" />,
    settings: <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM4 12h2M18 12h2M12 4v2M12 18v2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4" />,
    help: <path d="M12 18h.01M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-.9.8-1.7 1.4-1.7 3.2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />,
    bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />,
    layers: <path d="m12 3 9 5-9 5-9-5 9-5ZM3 13l9 5 9-5" />,
    download: <path d="M12 3v12M8 11l4 4 4-4M5 20h14" />,
    chart: <path d="M5 19V9M12 19V5M19 19v-7" />,
    check: <path d="M20 6 9 17l-5-5" />,
    warning: <path d="M12 4 21 20H3L12 4ZM12 9v5M12 17h.01" />,
    alert: <path d="M12 8v5M12 17h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />,
    calendar: <path d="M7 3v4M17 3v4M4 8h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" />,
    filter: <path d="M4 6h16M7 12h10M10 18h4" />,
    globe: <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />,
    cart: <path d="M4 5h2l2 11h9l2-7H7M9 21h.01M17 21h.01" />,
    article: <path d="M6 4h12v16H6zM9 8h6M9 12h6M9 16h4" />,
    window: <path d="M4 5h16v14H4zM4 9h16M8 13h4M8 16h8" />,
    image: <path d="M4 5h16v14H4zM8 13l2-2 3 3 2-2 3 4M8 9h.01" />,
    eye: <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />,
    refresh: <path d="M4 12a8 8 0 0 1 13.6-5.6L20 9M20 4v5h-5M20 12a8 8 0 0 1-13.6 5.6L4 15M4 20v-5h5" />,
    trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3" />,
    sigma: <path d="M18 4H7l6 8-6 8h11" />,
    timer: <path d="M12 8v5l3 2M9 2h6M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />,
    speed: <path d="M4 14a8 8 0 1 1 16 0M12 14l4-4M9 18h6" />,
    shield: <path d="M12 3 5 6v6c0 4.5 2.9 7.7 7 9 4.1-1.3 7-4.5 7-9V6l-7-3Z" />,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] ?? paths.grid}
    </svg>
  );
}