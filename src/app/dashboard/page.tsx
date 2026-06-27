"use client";

import { createReportHref, createScannerHref } from "@/lib/routes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";

type RowType = "success" | "warning" | "info" | "failed";

type StatItem = {
  title: string;
  value: string;
  change: string;
  icon: string;
  tone: "green" | "orange" | "red" | "blue";
  desc: string;
};

type AlertItem = {
  title: string;
  time: string;
  color: string;
  desc: string;
  level: string;
  scanId?: string;
};

type AnalysisRow = {
  id: string;
  site: string;
  url: string;
  date: string;
  score: string;
  status: string;
  critical: string;
  type: RowType;
  createdAtMs: number;
};

type ApiFinding = {
  id: string;
  title: string;
  description?: string | null;
  desc?: string | null;
  level?: string | null;
  severity?: string | null;
  category?: string | null;
  tone?: string | null;
  createdAt?: string | null;
};

type ApiScanItem = {
  id: string;
  url: string;
  site?: string | null;
  status: string;
  progress?: number | null;

  overallScore?: number | null;
  performanceScore?: number | null;
  seoScore?: number | null;
  accessibilityScore?: number | null;
  uxScore?: number | null;
  securityScore?: number | null;

  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;

  findings?: ApiFinding[];
  vitals?: unknown[];
  pages?: unknown[];
};

type ApiScansResponse = {
  scans?: ApiScanItem[];
  message?: string;
};

const sidebarItems = [
  { label: "Genel Bakış", href: "/dashboard", icon: "grid", active: true },
  { label: "Yeni Tarama", href: "/scanner", icon: "scan" },
  { label: "Analiz Geçmişi", href: "/history", icon: "history" },
  { label: "Raporlar", href: "/history", icon: "chart" },
  { label: "Takım", href: "/settings", icon: "team" },
  { label: "Ayarlar", href: "/settings", icon: "settings" },
];

const navItems = [
  { label: "Dashboard", href: "/dashboard", active: true },
  { label: "Tarama", href: "/scanner" },
  { label: "Canlı İzleme", href: "/scanner" },
  { label: "Raporlar", href: "/history" },
  { label: "Fiyatlandırma", href: "/pricing" },
];

const dateRanges = [
  "Son 7 Gün",
  "Son 30 Gün",
  "Son 90 Gün",
  "Tüm Zamanlar",
];

const chartViews = ["Günlük", "Haftalık", "Aylık"];

const fallbackBars = [
  32, 49, 65, 58, 43, 76, 70, 38, 100, 84, 55, 82, 66, 49, 77, 96, 61, 33, 84,
  71, 49, 60, 67, 52, 64,
];

const fallbackAlerts: AlertItem[] = [
  {
    title: "Henüz kritik uyarı yok",
    time: "Şimdi",
    color: "bg-[#4084ff]",
    level: "Bilgi",
    desc: "Yeni analizler tamamlandığında bulgular burada listelenecek.",
  },
];

export default function DashboardPage() {
  const router = useRouter();

  const [scans, setScans] = useState<ApiScanItem[]>([]);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  const [selectedDateRange, setSelectedDateRange] = useState(dateRanges[1]);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [selectedChartView, setSelectedChartView] = useState(chartViews[0]);
  const [isChartViewOpen, setIsChartViewOpen] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [selectedStat, setSelectedStat] = useState<StatItem | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [selectedRow, setSelectedRow] = useState<AnalysisRow | null>(null);
  const [openRowMenu, setOpenRowMenu] = useState<string | null>(null);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboard = async () => {
      setIsDashboardLoading(true);
      setDashboardError("");

      try {
        const response = await fetch("/api/scans", {
          cache: "no-store",
        });

        const data = (await response.json()) as ApiScansResponse;

        if (!response.ok) {
          throw new Error(data.message ?? "Dashboard verisi alınamadı.");
        }

        if (!isMounted) return;

        setScans(data.scans ?? []);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Dashboard verisi alınırken bilinmeyen bir hata oluştu.";

        if (!isMounted) return;

        setDashboardError(message);
        setScans([]);
      } finally {
        if (isMounted) {
          setIsDashboardLoading(false);
        }
      }
    };

    void fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const rows = useMemo(() => {
    return normalizeDashboardRows(scans)
      .filter((row) => matchDateFilter(row.createdAtMs, selectedDateRange))
      .slice(0, 5);
  }, [scans, selectedDateRange]);

  const allRows = useMemo(() => {
    return normalizeDashboardRows(scans).filter((row) =>
      matchDateFilter(row.createdAtMs, selectedDateRange),
    );
  }, [scans, selectedDateRange]);

  const stats = useMemo<StatItem[]>(() => {
    const total = allRows.length;
    const scoredRows = allRows.filter((row) => row.score !== "-");
    const averageScore = scoredRows.length
      ? Math.round(
          scoredRows.reduce((totalScore, row) => totalScore + Number(row.score), 0) /
            scoredRows.length,
        )
      : 0;

    const criticalCount = allRows.reduce((totalCritical, row) => {
      const value = Number(row.critical);
      return totalCritical + (Number.isFinite(value) ? value : 0);
    }, 0);

    const successful = allRows.filter((row) => row.type === "success").length;

    return [
      {
        title: "Toplam Analiz",
        value: String(total),
        change: total > 0 ? "Canlı" : "0",
        icon: "chart",
        tone: "blue",
        desc: "Seçili tarih aralığında veritabanından çekilen toplam analiz sayısı.",
      },
      {
        title: "Ortalama Skor",
        value: averageScore ? String(averageScore) : "-",
        change: averageScore >= 90 ? "İyi" : averageScore >= 80 ? "Orta" : "Dikkat",
        icon: "speed",
        tone: averageScore >= 90 ? "green" : averageScore >= 80 ? "orange" : "red",
        desc: "Tamamlanan analizlerin genel skor ortalaması.",
      },
      {
        title: "Kritik Hata",
        value: String(criticalCount),
        change: criticalCount > 0 ? "İncele" : "Temiz",
        icon: "warning",
        tone: criticalCount > 0 ? "orange" : "green",
        desc: "Seçili tarih aralığında tespit edilen kritik bulgu sayısı.",
      },
      {
        title: "Başarılı Yayın",
        value: String(successful),
        change: total ? `%${Math.round((successful / total) * 100)}` : "0",
        icon: "check",
        tone: "green",
        desc: "Kritik bulgu olmadan tamamlanan analiz sayısı.",
      },
    ];
  }, [allRows]);

  const health = useMemo(() => {
    return buildHealthItems(scans, selectedDateRange);
  }, [scans, selectedDateRange]);

  const averageHealthScore = useMemo(() => {
    const values = health.map((item) => item.value).filter((value) => value > 0);

    if (!values.length) return 0;

    return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
  }, [health]);

  const alerts = useMemo(() => {
    const generatedAlerts = buildAlertsFromScans(scans, selectedDateRange);

    return generatedAlerts.length ? generatedAlerts : fallbackAlerts;
  }, [scans, selectedDateRange]);

  const chartBars = useMemo(() => {
    const filteredRows = normalizeDashboardRows(scans)
      .filter((row) => matchDateFilter(row.createdAtMs, selectedDateRange))
      .slice(0, 25)
      .reverse();

    if (!filteredRows.length) return fallbackBars;

    return filteredRows.map((row) => {
      const score = Number(row.score);
      return Number.isFinite(score) ? clampNumber(score, 18, 100) : 35;
    });
  }, [scans, selectedDateRange]);

  const latestRow = rows[0];

  const handleCsvExport = () => {
    const headers = ["ID", "Site", "URL", "Tarih", "Skor", "Durum", "Kritik"];
    const csvRows = allRows.map((row) => [
      row.id,
      row.site,
      row.url,
      row.date,
      row.score,
      row.status,
      row.critical,
    ]);

    const csvContent = [headers, ...csvRows]
      .map((line) => line.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "precheck-dashboard-analizleri.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const openReport = (row?: AnalysisRow) => {
    const targetRow = row ?? latestRow;

    if (!targetRow) {
      router.push("/history");
      return;
    }

    router.push(createReportHref(targetRow.id));
  };

  const startNewScan = (url?: string) => {
    if (url) {
      router.push(createScannerHref(url));
      return;
    }

    router.push("/scanner");
  };

  const openExternalSite = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#070b15] text-[#e7e9f4]">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-size-[32px_32px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_40%_0%,rgba(66,104,255,0.13),transparent_35%),linear-gradient(180deg,rgba(10,15,28,0.1),#070b15_80%)]" />

      <div className="relative z-10 flex min-h-screen">
        <Sidebar
          onSupport={() => setIsSupportOpen(true)}
          onLogout={() => setIsLogoutOpen(true)}
        />

        <section className="min-w-0 flex-1">
          <Topbar
            isWorkspaceOpen={isWorkspaceOpen}
            onWorkspaceToggle={() => setIsWorkspaceOpen((current) => !current)}
            onWorkspaceClose={() => setIsWorkspaceOpen(false)}
            onNotifications={() => setSelectedAlert(alerts[0])}
            onSettings={() => router.push("/settings")}
          />

          <div className="grid gap-6 px-6 py-7 xl:grid-cols-[1fr_300px]">
            <div className="min-w-0">
              <div className="flex flex-col gap-4 md:items-start md:justify-between 2xl:flex-row">
                <div>
                  <h1 className="text-[28px] font-extrabold tracking-[-0.04em]">
                    Genel Bakış
                  </h1>
                  <p className="mt-2 text-[14px] font-medium text-[#b4bbc9]">
                    Sitelerinizin yayın öncesi kalite durumunu gerçek analiz
                    verileriyle takip edin.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDateOpen((current) => !current)}
                      className="inline-flex h-8 cursor-pointer items-center gap-3 rounded-md border border-white/12 bg-[#111827]/70 px-3 text-[11px] font-bold text-[#b9c1d1] transition hover:border-white/25 hover:bg-white/6"
                    >
                      <Icon name="calendar" className="size-4" />
                      {selectedDateRange}
                      <span>⌄</span>
                    </button>

                    {isDateOpen && (
                      <Dropdown className="right-0 top-10 w-60">
                        {dateRanges.map((range) => (
                          <button
                            key={range}
                            type="button"
                            onClick={() => {
                              setSelectedDateRange(range);
                              setIsDateOpen(false);
                            }}
                            className={`flex h-9 w-full cursor-pointer items-center rounded-md px-3 text-left text-[12px] font-bold transition hover:bg-white/[0.07] ${
                              selectedDateRange === range
                                ? "text-[#b9c7ff]"
                                : "text-[#b8c0d0]"
                            }`}
                          >
                            {range}
                          </button>
                        ))}
                      </Dropdown>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => startNewScan()}
                    className="inline-flex h-8 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#b9c7ff] px-5 text-[13px] font-extrabold text-[#070b15] transition hover:bg-[#c6d1ff]"
                  >
                    <span className="text-lg leading-none">+</span>
                    Yeni Tarama
                  </button>
                </div>
              </div>

              {(isDashboardLoading || dashboardError) && (
                <div
                  className={`mt-6 rounded-xl border p-4 text-[13px] font-bold leading-6 ${
                    dashboardError
                      ? "border-[#7c3539] bg-[#2a1418]/80 text-[#ff9a9f]"
                      : "border-white/10 bg-[#080d18]/70 text-[#aebcff]"
                  }`}
                >
                  {dashboardError || "Dashboard verileri yükleniyor..."}
                </div>
              )}

              <div className="mt-8 grid grid-cols-4 gap-5 max-2xl:grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1">
                {stats.map((stat) => (
                  <StatCard
                    key={stat.title}
                    {...stat}
                    onClick={() => setSelectedStat(stat)}
                  />
                ))}
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.88fr]">
                <section className="rounded-xl border border-white/9 bg-[#0d1423]/88 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[17px] font-extrabold tracking-[-0.02em]">
                      Analiz Performansı
                    </h2>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setIsChartViewOpen((current) => !current)
                        }
                        className="inline-flex h-8 cursor-pointer items-center gap-3 rounded-md border border-white/8 bg-white/6 px-4 text-[12px] font-bold text-[#aeb6c8] transition hover:border-white/20 hover:bg-white/9"
                      >
                        {selectedChartView} <span>⌄</span>
                      </button>

                      {isChartViewOpen && (
                        <Dropdown className="right-0 top-10 w-32.5">
                          {chartViews.map((view) => (
                            <button
                              key={view}
                              type="button"
                              onClick={() => {
                                setSelectedChartView(view);
                                setIsChartViewOpen(false);
                              }}
                              className={`flex h-9 w-full cursor-pointer items-center rounded-md px-3 text-left text-[12px] font-bold transition hover:bg-white/[0.07] ${
                                selectedChartView === view
                                  ? "text-[#b9c7ff]"
                                  : "text-[#b8c0d0]"
                              }`}
                            >
                              {view}
                            </button>
                          ))}
                        </Dropdown>
                      )}
                    </div>
                  </div>

                  <ChartArea bars={chartBars} averageScore={averageHealthScore} />

                  <div className="flex items-center justify-center gap-9 border-t border-white/5 pt-5 text-[12px] font-bold text-[#a5adbd]">
                    <span className="inline-flex items-center gap-2">
                      <span className="size-3 rounded-sm bg-[#667085]" />
                      Analiz Skoru
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-0.5 w-4 rounded-full bg-[#9aabe8]" />
                      Ortalama Eğilim
                    </span>
                  </div>
                </section>

                <section className="rounded-xl border border-white/9 bg-[#0d1423]/88 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <h2 className="text-[17px] font-extrabold tracking-[-0.02em]">
                    Sağlık Dağılımı
                  </h2>

                  <div className="mt-9 flex justify-center">
                    <div className="relative grid size-47.5 place-items-center rounded-full bg-[conic-gradient(#21c995_0_30%,#4084ff_30%_56%,#f7a928_56%_75%,#8a5cff_75%_88%,#ff515f_88%_100%)]">
                      <div className="grid size-29 place-items-center rounded-full bg-[#0d1423]">
                        <div className="text-center">
                          <p className="text-[34px] font-extrabold tracking-tighter">
                            {averageHealthScore || "-"}
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
                      <button
                        key={item.label}
                        type="button"
                        onClick={() =>
                          setSelectedStat({
                            title: item.label,
                            value: item.value ? String(item.value) : "-",
                            change: "Canlı",
                            icon: "chart",
                            tone: item.value >= 90 ? "green" : item.value >= 80 ? "orange" : "red",
                            desc: `${item.label} kategorisinin gerçek analiz verilerinden hesaplanan ortalama skoru.`,
                          })
                        }
                        className="flex w-full cursor-pointer items-center justify-between rounded-md text-[13px] font-bold transition hover:bg-white/4"
                      >
                        <span className="inline-flex items-center gap-3 text-[#9ea7b8]">
                          <span className={`size-2 rounded-full ${item.color}`} />
                          {item.label}
                        </span>
                        <span className="text-[#cdd3df]">
                          {item.value || "-"}
                        </span>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => openReport()}
                    className="mt-7 inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/[0.07] bg-[#0b111e] text-[13px] font-extrabold text-[#c7cfe0] transition hover:border-white/20 hover:bg-white/6"
                  >
                    Son Raporu İncele <span>→</span>
                  </button>
                </section>
              </div>

              <section className="mt-6 overflow-hidden rounded-xl border border-white/9 bg-[#0d1423]/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
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
                          key={row.id}
                          className="border-t border-white/4.5 transition hover:bg-white/2.5"
                        >
                          <td className="px-6 py-5">
                            <button
                              type="button"
                              onClick={() => setSelectedRow(row)}
                              className="cursor-pointer text-left"
                            >
                              <p className="text-[13px] font-extrabold text-[#d4d9e6]">
                                {row.site}
                              </p>
                              <p className="mt-1 text-[12px] font-medium text-[#8b94a6]">
                                {row.url}
                              </p>
                            </button>
                          </td>
                          <td className="px-6 py-5 text-[13px] font-bold text-[#9da6b8]">
                            {row.date}
                          </td>
                          <td className="px-6 py-5">
                            <ScoreBadge row={row} />
                          </td>
                          <td className="px-6 py-5">
                            <StatusBadge row={row} />
                          </td>
                          <td
                            className={`px-6 py-5 text-[13px] font-extrabold ${
                              Number(row.critical) >= 1
                                ? "text-[#f59d23]"
                                : "text-[#cbd2df]"
                            }`}
                          >
                            {row.critical}
                          </td>
                          <td className="relative px-6 py-5">
                            <div className="flex items-center justify-end gap-4 text-[#aab2c4]">
                              <button
                                type="button"
                                onClick={() => openReport(row)}
                                className="cursor-pointer transition hover:text-white"
                                aria-label={`${row.site} raporunu aç`}
                              >
                                <Icon name="chart" className="size-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => openExternalSite(row.url)}
                                className="cursor-pointer transition hover:text-white"
                                aria-label={`${row.site} sitesini yeni sekmede aç`}
                              >
                                <Icon name="external" className="size-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setOpenRowMenu((current) =>
                                    current === row.id ? null : row.id,
                                  )
                                }
                                className="cursor-pointer text-lg leading-none transition hover:text-white"
                                aria-label={`${row.site} işlem menüsünü aç`}
                              >
                                ⋮
                              </button>
                            </div>

                            {openRowMenu === row.id && (
                              <Dropdown className="right-5 top-12 w-42.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedRow(row);
                                    setOpenRowMenu(null);
                                  }}
                                  className="flex h-9 w-full cursor-pointer items-center rounded-md px-3 text-[12px] font-bold text-[#b8c0d0] transition hover:bg-white/[0.07]"
                                >
                                  Detayları Gör
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    openReport(row);
                                    setOpenRowMenu(null);
                                  }}
                                  className="flex h-9 w-full cursor-pointer items-center rounded-md px-3 text-[12px] font-bold text-[#b8c0d0] transition hover:bg-white/[0.07]"
                                >
                                  Raporu Aç
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    startNewScan(row.url);
                                    setOpenRowMenu(null);
                                  }}
                                  className="flex h-9 w-full cursor-pointer items-center rounded-md px-3 text-[12px] font-bold text-[#b8c0d0] transition hover:bg-white/[0.07]"
                                >
                                  Tekrar Tara
                                </button>
                              </Dropdown>
                            )}
                          </td>
                        </tr>
                      ))}

                      {!rows.length && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-10 text-center text-[13px] font-bold text-[#8b94a6]"
                          >
                            {isDashboardLoading
                              ? "Analizler yükleniyor..."
                              : "Bu tarih aralığında analiz bulunamadı."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/history")}
                  className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 border-t border-white/4.5 text-[13px] font-extrabold text-[#aebcff] transition hover:bg-white/4"
                >
                  Tüm analiz geçmişini görüntüle <span>→</span>
                </button>
              </section>
            </div>

            <aside className="space-y-6">
              <section className="rounded-xl border border-white/9 bg-[#0d1423]/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <h2 className="text-[17px] font-extrabold tracking-[-0.02em]">
                  Hızlı İşlemler
                </h2>

                <div className="mt-4 space-y-3">
                  <button
                    type="button"
                    onClick={() => startNewScan()}
                    className="flex h-10 w-full cursor-pointer items-center justify-center gap-3 rounded-md bg-[#b9c7ff] text-[13px] font-extrabold text-[#070b15] transition hover:bg-[#c6d1ff]"
                  >
                    <Icon name="play" className="size-4" />
                    Yeni Analiz Başlat
                  </button>

                  <button
                    type="button"
                    onClick={() => openReport()}
                    className="flex h-10 w-full cursor-pointer items-center justify-center gap-3 rounded-md bg-white/17 text-[13px] font-extrabold text-[#d7dcea] transition hover:bg-white/22"
                  >
                    <Icon name="file" className="size-4" />
                    Son Raporu Aç
                  </button>

                  <button
                    type="button"
                    onClick={handleCsvExport}
                    className="flex h-10 w-full cursor-pointer items-center justify-center gap-3 rounded-md bg-white/17 text-[13px] font-extrabold text-[#d7dcea] transition hover:bg-white/22"
                  >
                    <Icon name="download" className="size-4" />
                    CSV Dışa Aktar
                  </button>
                </div>
              </section>

              <section className="overflow-hidden rounded-xl border border-white/9 bg-[#0d1423]/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <div className="flex items-center justify-between border-b border-white/5 px-5 py-5">
                  <h2 className="text-[17px] font-extrabold tracking-[-0.02em]">
                    Son Uyarılar
                  </h2>
                  <span className="rounded-md border border-[#684248] bg-[#392027] px-2 py-1 text-[10px] font-extrabold text-[#ff9a9f]">
                    {alerts.length} KAYIT
                  </span>
                </div>

                <div className="space-y-5 px-5 py-5">
                  {alerts.slice(0, 4).map((alert, index) => (
                    <button
                      key={`${alert.title}-${index}`}
                      type="button"
                      onClick={() => setSelectedAlert(alert)}
                      className="flex w-full cursor-pointer gap-3 rounded-md text-left transition hover:bg-white/4"
                    >
                      <span
                        className={`mt-1.5 size-2 shrink-0 rounded-full ${alert.color}`}
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
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/history")}
                  className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 border-t border-white/5 text-[13px] font-extrabold text-[#aebcff] transition hover:bg-white/4"
                >
                  Tüm uyarıları görüntüle <span>→</span>
                </button>
              </section>
            </aside>
          </div>
        </section>
      </div>

      {!!alerts.length && alerts[0].level !== "Bilgi" && (
        <button
          type="button"
          onClick={() => setSelectedAlert(alerts[0])}
          className="fixed bottom-4 left-4 z-30 flex h-10 cursor-pointer items-center gap-3 rounded-full border border-[#ff6b72] bg-[#d83a42] px-4 text-[13px] font-extrabold text-white shadow-xl transition hover:bg-[#e34a52]"
        >
          <span className="grid size-6 place-items-center rounded-full bg-white/20">
            N
          </span>
          {alerts.length} Issue
          <span className="text-lg leading-none">×</span>
        </button>
      )}

      {selectedStat && (
        <Modal onClose={() => setSelectedStat(null)} maxWidth="max-w-[520px]">
          <ModalHeader title={selectedStat.title} onClose={() => setSelectedStat(null)} />
          <div className="mt-6 rounded-xl border border-white/8 bg-[#080d18]/70 p-5">
            <p className="text-[42px] font-extrabold tracking-tighter">
              {selectedStat.value}
            </p>
            <p className="mt-3 text-[14px] font-medium leading-6 text-[#aab3c5]">
              {selectedStat.desc}
            </p>
            <p
              className={`mt-4 inline-flex rounded-md border px-3 py-1 text-[12px] font-extrabold ${
                selectedStat.tone === "red"
                  ? "border-[#7c3539] bg-[#2a1418] text-[#ff666d]"
                  : selectedStat.tone === "orange"
                    ? "border-[#6d501d] bg-[#332613] text-[#f2a71e]"
                    : "border-[#145d49] bg-[#0c332a] text-[#22d296]"
              }`}
            >
              {selectedStat.change}
            </p>
          </div>
        </Modal>
      )}

      {selectedAlert && (
        <Modal onClose={() => setSelectedAlert(null)} maxWidth="max-w-[560px]">
          <ModalHeader title="Uyarı Detayı" onClose={() => setSelectedAlert(null)} />
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-white/8 bg-[#080d18]/70 p-5">
              <p className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#aebcff]">
                {selectedAlert.level} Öncelik
              </p>
              <h3 className="mt-2 text-[20px] font-extrabold">
                {selectedAlert.title}
              </h3>
              <p className="mt-3 text-[14px] font-medium leading-6 text-[#aab3c5]">
                {selectedAlert.desc}
              </p>
              <p className="mt-4 flex items-center gap-2 text-[12px] font-bold text-[#7f899d]">
                <Icon name="clock" className="size-4" />
                {selectedAlert.time}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (selectedAlert.scanId) {
                  router.push(createReportHref(selectedAlert.scanId));
                  return;
                }

                openReport();
              }}
              className="h-10 w-full cursor-pointer rounded-md bg-[#b9c7ff] text-[13px] font-extrabold text-[#070b15] transition hover:bg-[#c6d1ff]"
            >
              İlgili Raporu Aç
            </button>
          </div>
        </Modal>
      )}

      {selectedRow && (
        <Modal onClose={() => setSelectedRow(null)} maxWidth="max-w-[620px]">
          <ModalHeader title="Analiz Detayı" onClose={() => setSelectedRow(null)} />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <DetailBox label="Tarama ID" value={selectedRow.id} />
            <DetailBox label="Site" value={selectedRow.site} />
            <DetailBox label="URL" value={selectedRow.url} />
            <DetailBox label="Tarih" value={selectedRow.date} />
            <DetailBox label="Skor" value={selectedRow.score} />
            <DetailBox label="Durum" value={selectedRow.status} />
            <DetailBox label="Kritik Bulgu" value={selectedRow.critical} />
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => startNewScan(selectedRow.url)}
              className="h-10 cursor-pointer rounded-md border border-white/12 px-5 text-[13px] font-extrabold text-[#d8deeb] transition hover:bg-white/6"
            >
              Tekrar Tara
            </button>
            <button
              type="button"
              onClick={() => openReport(selectedRow)}
              className="h-10 cursor-pointer rounded-md bg-[#b9c7ff] px-5 text-[13px] font-extrabold text-[#070b15] transition hover:bg-[#c6d1ff]"
            >
              Raporu Aç
            </button>
          </div>
        </Modal>
      )}

      {isSupportOpen && (
        <Modal onClose={() => setIsSupportOpen(false)} maxWidth="max-w-[480px]">
          <ModalHeader title="Destek" onClose={() => setIsSupportOpen(false)} />
          <p className="mt-5 text-[14px] font-medium leading-6 text-[#aab3c5]">
            Analiz geçmişi veya rapor erişimiyle ilgili destek almak için ayarlar
            sayfasına gidebilirsin.
          </p>
          <button
            type="button"
            onClick={() => router.push("/settings")}
            className="mt-6 h-10 w-full cursor-pointer rounded-md bg-[#b9c7ff] text-[13px] font-extrabold text-[#070b15] transition hover:bg-[#c6d1ff]"
          >
            Ayarlara Git
          </button>
        </Modal>
      )}

      {isLogoutOpen && (
        <Modal onClose={() => setIsLogoutOpen(false)} maxWidth="max-w-[460px]">
          <ModalHeader title="Çıkış yapılsın mı?" onClose={() => setIsLogoutOpen(false)} />
          <p className="mt-5 text-[14px] font-medium leading-6 text-[#aab3c5]">
            Oturum kapatma işlemi frontend prototipte ana sayfaya yönlendirme
            olarak çalışır.
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsLogoutOpen(false)}
              className="h-10 cursor-pointer rounded-md border border-white/12 px-5 text-[13px] font-extrabold text-[#d8deeb] transition hover:bg-white/6"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="h-10 cursor-pointer rounded-md border border-[#7c3539] bg-[#2a1418] px-5 text-[13px] font-extrabold text-[#ff666d] transition hover:bg-[#381a1f]"
            >
              Çıkış Yap
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}

function Sidebar({
  onSupport,
  onLogout,
}: {
  onSupport: () => void;
  onLogout: () => void;
}) {
  return (
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
              href={item.href}
              className={`flex h-10 cursor-pointer items-center gap-4 rounded-md px-4 text-[14px] font-bold transition ${
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
          <div className="mt-3 flex items-center justify-between gap-3 text-[11px] font-bold text-[#858fa4]">
            <span>Yenileme: 10 Haz 2025</span>
            <Link href="/pricing" className="cursor-pointer text-[#b8c5ff]">
              Paketleri İncele
            </Link>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <button
            type="button"
            onClick={onSupport}
            className="flex h-9 w-full cursor-pointer items-center gap-4 rounded-md px-4 text-[14px] font-bold text-[#a5adbe] transition hover:bg-white/[0.07] hover:text-white"
          >
            <Icon name="help" className="size-4" />
            Destek
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="flex h-9 w-full cursor-pointer items-center gap-4 rounded-md px-4 text-[14px] font-bold text-[#a5adbe] transition hover:bg-white/[0.07] hover:text-white"
          >
            <Icon name="logout" className="size-4" />
            Çıkış Yap
          </button>
        </div>
      </div>
    </aside>
  );
}

function Topbar({
  isWorkspaceOpen,
  onWorkspaceToggle,
  onWorkspaceClose,
  onNotifications,
  onSettings,
}: {
  isWorkspaceOpen: boolean;
  onWorkspaceToggle: () => void;
  onWorkspaceClose: () => void;
  onNotifications: () => void;
  onSettings: () => void;
}) {
  return (
    <header className="flex h-16.5 items-center justify-between border-b border-white/8 bg-[#080d18]/75 px-6 backdrop-blur-xl">
      <nav className="hidden items-center gap-8 lg:flex">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`relative cursor-pointer text-[14px] font-bold ${
              item.active ? "text-[#b9c7ff]" : "text-[#969faf]"
            }`}
          >
            {item.label}
            {item.active && (
              <span className="absolute -bottom-5.5 left-0 h-px w-full bg-[#b9c7ff]" />
            )}
          </Link>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-5">
        <button
          type="button"
          onClick={onNotifications}
          className="cursor-pointer text-[#aab2c4] transition hover:text-white"
          aria-label="Bildirimleri aç"
        >
          <Icon name="bell" className="size-5" />
        </button>

        <button
          type="button"
          onClick={onSettings}
          className="cursor-pointer text-[#aab2c4] transition hover:text-white"
          aria-label="Ayarları aç"
        >
          <Icon name="settings" className="size-5" />
        </button>

        <div className="relative hidden items-center gap-3 border-l border-white/9 pl-5 md:flex">
          <button
            type="button"
            onClick={onWorkspaceToggle}
            className="flex cursor-pointer items-center gap-3 text-right"
          >
            <div>
              <p className="text-[13px] font-bold text-[#d8dce8]">
                Acme Dijital
              </p>
              <p className="text-[12px] font-medium text-[#858fa4]">
                Pro Workspace
              </p>
            </div>
            <span className="text-[#8b94a7]">⌄</span>
          </button>

          {isWorkspaceOpen && (
            <Dropdown className="right-0 top-12 w-47.5">
              <button
                type="button"
                onClick={onWorkspaceClose}
                className="flex h-9 w-full cursor-pointer items-center rounded-md px-3 text-left text-[12px] font-bold text-[#b9c7ff] transition hover:bg-white/[0.07]"
              >
                Acme Dijital
              </button>
              <button
                type="button"
                onClick={onWorkspaceClose}
                className="flex h-9 w-full cursor-pointer items-center rounded-md px-3 text-left text-[12px] font-bold text-[#b8c0d0] transition hover:bg-white/[0.07]"
              >
                Yeni Workspace
              </button>
              <Link
                href="/settings"
                className="flex h-9 cursor-pointer items-center rounded-md px-3 text-left text-[12px] font-bold text-[#b8c0d0] transition hover:bg-white/[0.07]"
              >
                Workspace Ayarları
              </Link>
            </Dropdown>
          )}
        </div>

        <div className="hidden items-center gap-3 border-l border-white/9 pl-5 md:flex">
          <div className="grid size-9 place-items-center rounded-full bg-[#293145] text-[12px] font-bold text-[#c6cee0]">
            AS
          </div>
          <div>
            <p className="text-[13px] font-bold text-[#d8dce8]">A. Selin</p>
            <p className="text-[12px] font-medium text-[#858fa4]">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function ChartArea({
  bars,
  averageScore,
}: {
  bars: number[];
  averageScore: number;
}) {
  return (
    <div className="relative mt-6 h-82.5 overflow-hidden rounded-lg px-1 pb-6 pt-5">
      <div className="absolute left-0 top-2 rounded-sm bg-white/[0.14] px-2 py-1 text-[10px] font-extrabold text-[#b8c1d4]">
        CANLI <span className="ml-3 text-[#dce3f4]">Ort. Skor: {averageScore || "-"}</span>
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
            style={{ height: `${clampNumber(bar, 8, 100)}%` }}
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
        <span>Eski</span>
        <span>Son Analizler</span>
        <span>Yeni</span>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  icon,
  desc,
  tone,
  onClick,
}: StatItem & { onClick: () => void }) {
  const toneClass =
    tone === "red"
      ? "border-[#7c3539] bg-[#2a1418] text-[#ff666d]"
      : tone === "orange"
        ? "border-[#6d501d] bg-[#332613] text-[#f2a71e]"
        : tone === "blue"
          ? "border-[#2c4b8a] bg-[#12213d] text-[#9db8ff]"
          : "border-[#145d49] bg-[#0c332a] text-[#22d296]";

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative cursor-pointer overflow-hidden rounded-xl border border-white/9 bg-[#0d1423]/88 p-5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/5.5"
    >
      <div className="flex items-start justify-between">
        <p className="text-[14px] font-bold text-[#aeb6c7]">{title}</p>
        <Icon name={icon} className="size-4 text-[#95a6e8]" />
      </div>

      <p className="mt-4 text-[30px] font-extrabold tracking-tighter text-[#e7eaf4] max-lg:text-[22px] max-xl:text-[26px]">
        {value}
      </p>

      <div className="mt-4 flex items-center gap-3 text-[11px] font-bold text-[#8993a7]">
        <span className={`rounded-md border px-2 py-1 ${toneClass}`}>
          {change}
        </span>
        <span>gerçek veri</span>
      </div>

      <p className="sr-only">{desc}</p>
    </button>
  );
}

function ScoreBadge({ row }: { row: AnalysisRow }) {
  return (
    <span
      className={`rounded-md border px-2 py-1 text-[12px] font-extrabold ${
        row.type === "warning"
          ? "border-[#6d501d] bg-[#332613] text-[#f2a71e]"
          : row.type === "info"
            ? "border-[#1f4d88] bg-[#132949] text-[#4992ff]"
            : row.type === "failed"
              ? "border-[#7c3539] bg-[#2a1418] text-[#ff666d]"
              : "border-[#14624d] bg-[#0d372e] text-[#22d296]"
      }`}
    >
      {row.score}
    </span>
  );
}

function StatusBadge({ row }: { row: AnalysisRow }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-md border px-3 py-1 text-[12px] font-extrabold ${
        row.type === "warning"
          ? "border-[#6d501d] bg-[#332613] text-[#f2a71e]"
          : row.type === "info"
            ? "border-[#1f4d88] bg-[#132949] text-[#4992ff]"
            : row.type === "failed"
              ? "border-[#7c3539] bg-[#2a1418] text-[#ff666d]"
              : "border-[#14624d] bg-[#0d372e] text-[#22d296]"
      }`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {row.status}
    </span>
  );
}

function Dropdown({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`absolute z-40 rounded-lg border border-white/9 bg-[#0d1423] p-2 shadow-2xl ${className}`}
    >
      {children}
    </div>
  );
}

function Modal({
  children,
  onClose,
  maxWidth = "max-w-[560px]",
}: {
  children: ReactNode;
  onClose: () => void;
  maxWidth?: string;
}) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/60 px-5 backdrop-blur-sm"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className={`w-full ${maxWidth} cursor-default rounded-2xl border border-white/10 bg-[#0d1423] p-6 shadow-2xl`}
      >
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-white/8 pb-5">
      <h2 className="text-[22px] font-extrabold">{title}</h2>
      <button
        type="button"
        onClick={onClose}
        className="cursor-pointer text-[24px] text-[#9aa4b8] transition hover:text-white"
      >
        ×
      </button>
    </div>
  );
}

function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/8 bg-[#080d18]/70 p-4">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#7f899d]">
        {label}
      </p>
      <p className="mt-2 wrap-break-word text-[14px] font-bold text-[#dce2ef]">
        {value}
      </p>
    </div>
  );
}

function normalizeDashboardRows(scans: ApiScanItem[]): AnalysisRow[] {
  return scans.map((scan) => {
    const createdAt = new Date(scan.createdAt);
    const createdAtMs = Number.isFinite(createdAt.getTime())
      ? createdAt.getTime()
      : Date.now();

    const type = getRowType(scan);
    const score =
      typeof scan.overallScore === "number" ? String(scan.overallScore) : "-";

    const criticalCount =
      scan.findings?.filter((finding) => isCriticalFinding(finding)).length ?? 0;

    return {
      id: scan.id,
      site: scan.site ?? getSiteNameFromUrl(scan.url),
      url: scan.url,
      date: `${formatDate(new Date(createdAtMs))} ${formatTime(new Date(createdAtMs))}`,
      score,
      status: getStatusLabel(scan.status, type),
      critical:
        scan.status === "completed" || scan.status === "running"
          ? String(criticalCount)
          : "-",
      type,
      createdAtMs,
    };
  });
}

function getRowType(scan: ApiScanItem): RowType {
  const status = scan.status.toLowerCase();

  if (status === "failed" || status === "error") return "failed";
  if (status === "running" || status === "queued" || status === "pending") {
    return "info";
  }

  const hasCritical = scan.findings?.some((finding) => isCriticalFinding(finding)) ?? false;

  if (hasCritical) return "warning";

  return "success";
}

function getStatusLabel(status: string, type: RowType) {
  const normalized = status.toLowerCase();

  if (normalized === "completed" && type === "warning") return "Uyarı";
  if (normalized === "completed") return "Tamamlandı";
  if (normalized === "running") return "İnceleniyor";
  if (normalized === "queued" || normalized === "pending") return "Sırada";
  if (normalized === "failed" || normalized === "error") return "Başarısız";
  if (normalized === "cancelled" || normalized === "canceled") return "İptal";

  return "İnceleniyor";
}

function isCriticalFinding(finding: ApiFinding) {
  const value = `${finding.level ?? ""} ${finding.severity ?? ""} ${
    finding.tone ?? ""
  }`.toLowerCase();

  return (
    value.includes("kritik") ||
    value.includes("critical") ||
    value.includes("red")
  );
}

function buildHealthItems(scans: ApiScanItem[], dateRange: string) {
  const filteredScans = scans.filter((scan) => {
    const createdAt = new Date(scan.createdAt).getTime();
    return Number.isFinite(createdAt) && matchDateFilter(createdAt, dateRange);
  });

  return [
    {
      label: "Performance",
      value: averageScore(filteredScans, "performanceScore"),
      color: "bg-[#21c995]",
    },
    {
      label: "SEO",
      value: averageScore(filteredScans, "seoScore"),
      color: "bg-[#4084ff]",
    },
    {
      label: "Erişilebilirlik",
      value: averageScore(filteredScans, "accessibilityScore"),
      color: "bg-[#f7a928]",
    },
    {
      label: "UX",
      value: averageScore(filteredScans, "uxScore"),
      color: "bg-[#8a5cff]",
    },
    {
      label: "Güvenlik",
      value: averageScore(filteredScans, "securityScore"),
      color: "bg-[#ff515f]",
    },
  ];
}

function averageScore(
  scans: ApiScanItem[],
  key:
    | "performanceScore"
    | "seoScore"
    | "accessibilityScore"
    | "uxScore"
    | "securityScore",
) {
  const values = scans
    .map((scan) => scan[key])
    .filter((value): value is number => typeof value === "number");

  if (!values.length) return 0;

  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

function buildAlertsFromScans(scans: ApiScanItem[], dateRange: string): AlertItem[] {
  return scans
    .filter((scan) => {
      const createdAt = new Date(scan.createdAt).getTime();
      return Number.isFinite(createdAt) && matchDateFilter(createdAt, dateRange);
    })
    .flatMap((scan) => {
      const scanCreatedAt = new Date(scan.createdAt).getTime();

      return (scan.findings ?? []).map((finding) => {
        const isCritical = isCriticalFinding(finding);
        const isHigh =
          isCritical ||
          `${finding.level ?? ""} ${finding.severity ?? ""}`
            .toLowerCase()
            .includes("yüksek");

        return {
          title: finding.title,
          time: getRelativeTime(
            finding.createdAt
              ? new Date(finding.createdAt).getTime()
              : scanCreatedAt,
          ),
          color: isCritical
            ? "bg-[#f49b8f]"
            : isHigh
              ? "bg-[#f0a020]"
              : "bg-[#4084ff]",
          level: isCritical ? "Kritik" : isHigh ? "Yüksek" : "Orta",
          desc:
            finding.description ??
            finding.desc ??
            "Bu bulgu ilgili analiz raporunda detaylı olarak incelenebilir.",
          scanId: scan.id,
        };
      });
    })
    .slice(0, 8);
}

function getSiteNameFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function matchDateFilter(createdAtMs: number, filter: string) {
  if (filter === "Tüm Zamanlar") return true;

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  if (filter === "Son 7 Gün") return now - createdAtMs <= 7 * day;
  if (filter === "Son 30 Gün") return now - createdAtMs <= 30 * day;
  if (filter === "Son 90 Gün") return now - createdAtMs <= 90 * day;

  return true;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getRelativeTime(dateMs: number) {
  if (!Number.isFinite(dateMs)) return "Şimdi";

  const diff = Date.now() - dateMs;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "Az önce";
  if (diff < hour) return `${Math.round(diff / minute)} dk önce`;
  if (diff < day) return `${Math.round(diff / hour)} saat önce`;

  return `${Math.round(diff / day)} gün önce`;
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function Icon({ name, className = "" }: { name: string; className?: string }) {
  const paths: Record<string, ReactNode> = {
    grid: <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />,
    scan: <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M8 12h8M12 8v8" />,
    history: <path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.6M4 4v4.6h4.6M12 8v5l3 2" />,
    chart: <path d="M5 19V9M12 19V5M19 19v-7" />,
    team: <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 20a5 5 0 0 1 10 0M11 20a5 5 0 0 1 10 0" />,
    settings: <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM4 12h2M18 12h2M12 4v2M12 18v2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4" />,
    help: <path d="M12 18h.01M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-.9.8-1.7 1.4-1.7 3.2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />,
    logout: <path d="M10 17l5-5-5-5M15 12H3M21 4v16" />,
    bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />,
    calendar: <path d="M7 3v4M17 3v4M4 8h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" />,
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