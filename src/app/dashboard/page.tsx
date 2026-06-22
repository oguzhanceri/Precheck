import Link from "next/link";
import type { ReactNode } from "react";
const sidebarItems = [
  { label: "Genel Bakış", icon: "grid", active: true },
  { label: "Yeni Tarama", icon: "scan" },
  { label: "Analiz Geçmişi", icon: "history" },
  { label: "Raporlar", icon: "chart" },
  { label: "Takım", icon: "team" },
  { label: "Ayarlar", icon: "settings" },
];

const stats = [
  {
    title: "Toplam Analiz",
    value: "128",
    change: "%18,6",
    icon: "chart",
    tone: "green",
  },
  {
    title: "Ortalama Skor",
    value: "92",
    change: "4",
    icon: "speed",
    tone: "green",
  },
  {
    title: "Kritik Hata",
    value: "12",
    change: "%25,0",
    icon: "warning",
    tone: "green",
  },
  {
    title: "Başarılı Yayın",
    value: "36",
    change: "%12,5",
    icon: "check",
    tone: "green",
  },
];

const health = [
  { label: "Performance", value: 95, color: "bg-[#21c995]" },
  { label: "SEO", value: 88, color: "bg-[#4084ff]" },
  { label: "Erişilebilirlik", value: 90, color: "bg-[#f7a928]" },
  { label: "UX", value: 93, color: "bg-[#8a5cff]" },
  { label: "Güvenlik", value: 91, color: "bg-[#ff515f]" },
];

const alerts = [
  {
    title: "Yüksek LCP değeri tespit edildi",
    time: "5 dk önce",
    color: "bg-[#f49b8f]",
  },
  {
    title: "Eksik meta description",
    time: "28 dk önce",
    color: "bg-[#f0a020]",
  },
  {
    title: "Kırık bağlantı bulundu (7)",
    time: "1 saat önce",
    color: "bg-[#f0cf35]",
  },
  {
    title: "Güvenlik başlıkları eksik",
    time: "2 saat önce",
    color: "bg-[#4084ff]",
  },
];

const rows = [
  {
    site: "orneksite.com",
    url: "https://orneksite.com",
    date: "10 Haz 2025 14:32",
    score: "92",
    status: "Tamamlandı",
    critical: "2",
    type: "success",
  },
  {
    site: "shop.acmedijital.com",
    url: "https://shop.acmedijital.com",
    date: "10 Haz 2025 11:18",
    score: "88",
    status: "Uyarı",
    critical: "5",
    type: "warning",
  },
  {
    site: "blog.acmedijital.com",
    url: "https://blog.acmedijital.com",
    date: "9 Haz 2025 16:45",
    score: "95",
    status: "Tamamlandı",
    critical: "0",
    type: "success",
  },
  {
    site: "landing.yeniurun.com",
    url: "https://landing.yeniurun.com",
    date: "9 Haz 2025 09:02",
    score: "78",
    status: "İnceleniyor",
    critical: "7",
    type: "info",
  },
];

const bars = [
  32, 49, 65, 58, 43, 76, 70, 38, 100, 84, 55, 82, 66, 49, 77, 96, 61, 33, 84,
  71, 49, 60, 67, 52, 64,
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#070b15] text-[#e7e9f4]">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-size-[32px_32px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_40%_0%,rgba(66,104,255,0.13),transparent_35%),linear-gradient(180deg,rgba(10,15,28,0.1),#070b15_80%)]" />

      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden w-67 shrink-0 border-r border-white/8 bg-[#0c111d]/90 lg:flex lg:flex-col">
          <div className="flex h-19 items-center gap-3 border-b border-white/[0.07] px-8">
            <div className="grid size-9 place-items-center rounded-lg bg-[#a9baff] text-[#08101f]">
              <Icon name="settings" className="size-5" />
            </div>
            <div>
              <p className="text-[17px] font-extrabold tracking-[-0.03em]">
                Precheck AI
              </p>
              <p className="text-[12px] font-medium text-[#8f98aa]">
                Enterprise Tier
              </p>
            </div>
          </div>

          <nav className="flex-1 px-5 py-8">
            <div className="space-y-2">
              {sidebarItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.label === "Yeni Tarama" ? "/scanner" : "#"}
                  className={`flex h-10 items-center gap-4 rounded-md px-4 text-[14px] font-bold transition ${
                    item.active
                      ? "bg-white/17 text-white"
                      : "text-[#a5adbe] hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  <Icon name={item.icon} className="size-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="border-t border-white/11 px-5 py-5">
            <div className="rounded-lg border border-white/9 bg-[#111827]/80 p-4">
              <div className="flex items-center justify-between text-[12px] font-bold text-[#c6ccda]">
                <span>Tarama kredisi</span>
                <span className="text-[#9ea7ba]">2.450 / 5.000</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
                <div className="h-full w-[49%] rounded-full bg-[#a9baff]" />
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-[#858fa4]">
                <span>Yenileme: 10 Haz 2025</span>
                <span className="text-[#b8c5ff]">Paketleri İncele</span>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <button className="flex h-9 w-full items-center gap-4 rounded-md px-4 text-[14px] font-bold text-[#a5adbe]">
                <Icon name="help" className="size-4" />
                Destek
              </button>
              <button className="flex h-9 w-full items-center gap-4 rounded-md px-4 text-[14px] font-bold text-[#a5adbe]">
                <Icon name="logout" className="size-4" />
                Çıkış Yap
              </button>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex h-16.5 items-center justify-between border-b border-white/8 bg-[#080d18]/75 px-6 backdrop-blur-xl lg:px-6">
            <nav className="hidden items-center gap-8 lg:flex">
              {[
                "Dashboard",
                "Tarama",
                "Canlı İzleme",
                "Raporlar",
                "Fiyatlandırma",
              ].map((item) => (
                <Link
                  key={item}
                  href="#"
                  className={`relative text-[14px] font-bold ${
                    item === "Dashboard" ? "text-[#b9c7ff]" : "text-[#969faf]"
                  }`}
                >
                  {item}
                  {item === "Dashboard" && (
                    <span className="absolute -bottom-5.5 left-0 h-px w-full bg-[#b9c7ff]" />
                  )}
                </Link>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-5">
              <Icon name="bell" className="size-5 text-[#aab2c4]" />
              <Icon name="settings" className="size-5 text-[#aab2c4]" />

              <div className="hidden items-center gap-3 border-l border-white/9 pl-5 md:flex">
                <div>
                  <p className="text-right text-[13px] font-bold text-[#d8dce8]">
                    Acme Dijital
                  </p>
                  <p className="text-right text-[12px] font-medium text-[#858fa4]">
                    Pro Workspace
                  </p>
                </div>
                <span className="text-[#8b94a7]">⌄</span>
              </div>

              <div className="hidden items-center gap-3 border-l border-white/9 pl-5 md:flex">
                <div className="grid size-9 place-items-center rounded-full bg-[#293145] text-[12px] font-bold text-[#c6cee0]">
                  AS
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#d8dce8]">
                    A. Selin
                  </p>
                  <p className="text-[12px] font-medium text-[#858fa4]">
                    Admin
                  </p>
                </div>
              </div>
            </div>
          </header>

          <div className="grid gap-6 px-6 py-7 xl:grid-cols-[1fr_300px]">
            <div className="min-w-0">
              <div className="flex flex-col gap-4 md:items-start md:justify-between max-2xl:flex-col 2xl:flex-row">
                <div>
                  <h1 className="text-[28px] font-extrabold tracking-[-0.04em]">
                    Genel Bakış
                  </h1>
                  <p className="mt-2 text-[14px] font-medium text-[#b4bbc9]">
                    Sitelerinizin yayın öncesi kalite durumunu tek ekranda takip
                    edin.
                  </p>
                </div>

                <div className="flex flex-col gap-3 max-2xl:flex-col">
                  <button className="inline-flex h-8 items-center gap-3 rounded-md border border-white/12 bg-[#111827]/70 px-2 text-[11px] font-bold text-[#b9c1d1]">
                    <Icon name="calendar" className="size-4" />
                    11 May 2025 - 10 Haz 2025
                    <span className="flex items-center justify-center">⌄</span>
                  </button>
                  <Link
                    href="/scanner"
                    className="inline-flex h-8 items-center justify-center gap-2 rounded-md bg-[#b9c7ff] px-5 text-[13px] font-extrabold text-black!"
                  >
                    <span className="text-lg leading-none">+</span>
                    Yeni Tarama
                  </Link>
                </div>
              </div>

              <div className="mt-8 grid gap-5 grid-cols-4 max-2xl:grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1">
                {stats.map((stat) => (
                  <StatCard key={stat.title} {...stat} />
                ))}
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.88fr]">
                <div className="rounded-xl border border-white/9 bg-[#0d1423]/88 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[17px] font-extrabold tracking-[-0.02em]">
                      Son 30 Gün Analiz Performansı
                    </h2>
                    <button className="inline-flex h-8 items-center gap-3 rounded-md border border-white/8 bg-white/6 px-4 text-[12px] font-bold text-[#aeb6c8]">
                      Günlük <span>⌄</span>
                    </button>
                  </div>

                  <div className="relative mt-6 h-82.5 overflow-hidden rounded-lg px-1 pb-6 pt-5">
                    <div className="absolute left-0 top-2 rounded-sm bg-white/[0.14] px-2 py-1 text-[10px] font-extrabold text-[#b8c1d4]">
                      22 MAY{" "}
                      <span className="ml-3 text-[#dce3f4]">Skor: 92</span>
                    </div>

                    <div className="absolute inset-x-0 bottom-16.5 top-7 flex flex-col justify-between text-[10px] font-medium text-[#505a70]">
                      {[100, 75, 50, 25, 0].map((item) => (
                        <div key={item} className="flex items-center gap-3">
                          <span className="w-8 text-right">{item}</span>
                          <span className="h-px flex-1 bg-white/[0.035]" />
                        </div>
                      ))}
                    </div>

                    <div className="absolute bottom-16.5 left-12 right-0 flex h-61.25 items-end gap-2.25">
                      {bars.map((bar, index) => (
                        <span
                          key={index}
                          className="w-full rounded-t-sm bg-[#1d273d]"
                          style={{ height: `${bar}%` }}
                        />
                      ))}
                    </div>

                    <svg
                      className="absolute bottom-35.5 left-12 right-0 h-30 w-[calc(100%-48px)] overflow-visible"
                      viewBox="0 0 620 120"
                      fill="none"
                    >
                      <path
                        d="M0 92 C70 78 105 68 150 55 C210 36 245 32 292 37 C342 43 372 28 420 32 C480 36 520 40 620 12"
                        stroke="#9aabe8"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>

                    <div className="absolute bottom-6 left-12 right-0 flex justify-between text-[11px] font-bold text-[#48536a]">
                      <span>1 MAY</span>
                      <span>8 MAY</span>
                      <span>15 MAY</span>
                      <span>22 MAY</span>
                      <span>29 MAY</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-9 border-t border-white/5 pt-5 text-[12px] font-bold text-[#a5adbd]">
                    <span className="inline-flex items-center gap-2">
                      <span className="size-3 rounded-sm bg-[#667085]" />
                      Analiz Sayısı
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-0.5 w-4 rounded-full bg-[#9aabe8]" />
                      Ort. Skor
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/9 bg-[#0d1423]/88 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <h2 className="text-[17px] font-extrabold tracking-[-0.02em]">
                    Sağlık Dağılımı
                  </h2>

                  <div className="mt-9 flex justify-center">
                    <div className="relative grid size-47.5 place-items-center rounded-full bg-[conic-gradient(#21c995_0_30%,#4084ff_30%_56%,#f7a928_56%_75%,#8a5cff_75%_88%,#ff515f_88%_100%)]">
                      <div className="grid size-29 place-items-center rounded-full bg-[#0d1423]">
                        <div className="text-center">
                          <p className="text-[34px] font-extrabold tracking-tighter">
                            92
                          </p>
                          <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#7d8799]">
                            Ortalama
                            <br />
                            Skor
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 space-y-4 px-3">
                    {health.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between text-[13px] font-bold"
                      >
                        <span className="inline-flex items-center gap-3 text-[#9ea7b8]">
                          <span
                            className={`size-2 rounded-full ${item.color}`}
                          />
                          {item.label}
                        </span>
                        <span className="text-[#cdd3df]">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/report"
                    className="mt-7 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-white/[0.07] bg-[#0b111e] text-[13px] font-extrabold text-[#c7cfe0]"
                  >
                    Detaylı Raporu İncele <span>→</span>
                  </Link>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-xl border border-white/9 bg-[#0d1423]/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <div className="px-6 py-6">
                  <h2 className="text-[17px] font-extrabold tracking-[-0.02em]">
                    Son Analizler
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-205 border-collapse">
                    <thead>
                      <tr className="bg-white/5.5 text-left text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8f98aa]">
                        <th className="px-6 py-4">Site</th>
                        <th className="px-6 py-4">Tarih</th>
                        <th className="px-6 py-4">Skor</th>
                        <th className="px-6 py-4">Durum</th>
                        <th className="px-6 py-4">Kritik</th>
                        <th className="px-6 py-4 text-right">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr
                          key={row.site}
                          className="border-t border-white/4.5"
                        >
                          <td className="px-6 py-5">
                            <p className="text-[13px] font-extrabold text-[#d4d9e6]">
                              {row.site}
                            </p>
                            <p className="mt-1 text-[12px] font-medium text-[#8b94a6]">
                              {row.url}
                            </p>
                          </td>
                          <td className="px-6 py-5 text-[13px] font-bold text-[#9da6b8]">
                            {row.date}
                          </td>
                          <td className="px-6 py-5">
                            <span
                              className={`rounded-md border px-2 py-1 text-[12px] font-extrabold ${
                                row.type === "warning"
                                  ? "border-[#6d501d] bg-[#332613] text-[#f2a71e]"
                                  : row.type === "info"
                                    ? "border-[#1f4d88] bg-[#132949] text-[#4992ff]"
                                    : "border-[#14624d] bg-[#0d372e] text-[#22d296]"
                              }`}
                            >
                              {row.score}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-2 rounded-md border px-3 py-1 text-[12px] font-extrabold ${
                                row.type === "warning"
                                  ? "border-[#6d501d] bg-[#332613] text-[#f2a71e]"
                                  : row.type === "info"
                                    ? "border-[#1f4d88] bg-[#132949] text-[#4992ff]"
                                    : "border-[#14624d] bg-[#0d372e] text-[#22d296]"
                              }`}
                            >
                              <span className="size-1.5 rounded-full bg-current" />
                              {row.status}
                            </span>
                          </td>
                          <td
                            className={`px-6 py-5 text-[13px] font-extrabold ${
                              Number(row.critical) >= 5
                                ? "text-[#f59d23]"
                                : "text-[#cbd2df]"
                            }`}
                          >
                            {row.critical}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-end gap-4 text-[#aab2c4]">
                              <Icon name="chart" className="size-4" />
                              <Icon name="external" className="size-4" />
                              <span className="text-lg leading-none">⋮</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Link
                  href="/history"
                  className="flex h-12 items-center justify-center gap-2 border-t border-white/4.5 text-[13px] font-extrabold text-[#aebcff]"
                >
                  Tüm analiz geçmişini görüntüle <span>→</span>
                </Link>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-xl border border-white/9 bg-[#0d1423]/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <h2 className="text-[17px] font-extrabold tracking-[-0.02em]">
                  Hızlı İşlemler
                </h2>

                <div className="mt-4 space-y-3">
                  <Link
                    href="/scanner"
                    className="flex h-10 items-center justify-center gap-3 rounded-md bg-[#b9c7ff] text-[13px] font-extrabold text-black!"
                  >
                    <Icon name="play" className="size-4" />
                    Yeni Analiz Başlat
                  </Link>
                  <Link
                    href="/report"
                    className="flex h-10 items-center justify-center gap-3 rounded-md bg-white/17 text-[13px] font-extrabold text-[#d7dcea]"
                  >
                    <Icon name="file" className="size-4" />
                    Demo Raporu Aç
                  </Link>
                  <button className="flex h-10 w-full items-center justify-center gap-3 rounded-md bg-white/17 text-[13px] font-extrabold text-[#d7dcea]">
                    <Icon name="download" className="size-4" />
                    CSV Dışa Aktar
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-white/9 bg-[#0d1423]/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <div className="flex items-center justify-between border-b border-white/5 px-5 py-5">
                  <h2 className="text-[17px] font-extrabold tracking-[-0.02em]">
                    Son Uyarılar
                  </h2>
                  <span className="rounded-md border border-[#684248] bg-[#392027] px-2 py-1 text-[10px] font-extrabold text-[#ff9a9f]">
                    YENİ
                  </span>
                </div>

                <div className="space-y-5 px-5 py-5">
                  {alerts.map((alert) => (
                    <div key={alert.title} className="flex gap-3">
                      <span
                        className={`mt-1.5 size-2 rounded-full ${alert.color}`}
                      />
                      <div>
                        <p className="text-[13px] font-bold leading-5 text-[#c5cad7]">
                          {alert.title}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-[#737d91]">
                          <Icon name="clock" className="size-3" />
                          {alert.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/history"
                  className="flex h-12 items-center justify-center gap-2 border-t border-white/5 text-[13px] font-extrabold text-[#aebcff]"
                >
                  Tüm uyarıları görüntüle <span>→</span>
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  change,
  icon,
}: {
  title: string;
  value: string;
  change: string;
  icon: string;
  tone: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/9 bg-[#0d1423]/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="flex items-start justify-between">
        <p className="text-[14px] font-bold text-[#aeb6c7]">{title}</p>
        <Icon name={icon} className="size-4 text-[#95a6e8]" />
      </div>

      <p className="mt-4 text-[30px] max-xl:text-[26px] max-lg:text-[22px] font-extrabold tracking-tighter text-[#e7eaf4]">
        {value}
      </p>

      <div className="mt-4 flex items-center gap-3 text-[11px] font-bold text-[#8993a7]">
        <span className="rounded-md border border-[#145d49] bg-[#0c332a] px-2 py-1 text-[#22d296]">
          ↗ {change}
        </span>
        <span>önce 30 güne göre</span>
      </div>

     
    </div>
  );
}

function Icon({ name, className = "" }: { name: string; className?: string }) {
  const paths: Record<string, ReactNode> = {
    grid: (
      <>
        <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
      </>
    ),
    scan: (
      <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M8 12h8M12 8v8" />
    ),
    history: <path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.6M4 4v4.6h4.6M12 8v5l3 2" />,
    chart: <path d="M5 19V9M12 19V5M19 19v-7" />,
    team: (
      <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 20a5 5 0 0 1 10 0M11 20a5 5 0 0 1 10 0" />
    ),
    settings: (
      <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM4 12h2M18 12h2M12 4v2M12 18v2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4" />
    ),
    help: (
      <path d="M12 18h.01M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-.9.8-1.7 1.4-1.7 3.2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />
    ),
    logout: <path d="M10 17l5-5-5-5M15 12H3M21 4v16" />,
    bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />,
    calendar: (
      <path d="M7 3v4M17 3v4M4 8h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" />
    ),
    speed: <path d="M4 14a8 8 0 1 1 16 0M12 14l4-4M9 18h6" />,
    warning: <path d="M12 4 21 20H3L12 4ZM12 9v5M12 17h.01" />,
    check: <path d="M20 6 9 17l-5-5" />,
    play: <path d="m8 5 11 7-11 7V5Z" />,
    file: <path d="M6 3h9l4 4v14H6V3ZM14 3v5h5M9 13h6M9 17h6" />,
    download: <path d="M12 3v12M8 11l4 4 4-4M5 20h14" />,
    external: <path d="M14 4h6v6M20 4l-9 9M20 14v6H4V4h6" />,
    clock: <path d="M12 6v6l4 2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />,
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
