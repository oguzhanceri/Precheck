"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";

type RowType = "success" | "warning" | "info" | "failed";

type HistoryRow = {
  id: string;
  site: string;
  url: string;
  date: string;
  time: string;
  score: string;
  status: string;
  critical: string;
  type: RowType;
  icon: string;
};

type StatCardItem = {
  title: string;
  value: string;
  desc: string;
  icon: string;
  tone: "blue" | "green" | "orange" | "red";
};

type ProblemItem = {
  title: string;
  desc: string;
  icon: string;
  tone: "red" | "orange" | "yellow";
  solution: string;
};

type StatusFilter = "all" | RowType;
type ScoreFilter = "all" | "high" | "medium" | "low" | "empty";

const sidebarItems = [
  { label: "Genel Bakış", href: "/dashboard", icon: "grid" },
  { label: "Yeni Tarama", href: "/scanner", icon: "search" },
  { label: "Canlı İzleme", href: "/live", icon: "live" },
  { label: "Analiz Geçmişi", href: "/history", icon: "history", active: true },
  { label: "Raporlar", href: "/report", icon: "file" },
  { label: "Takım", href: "/settings", icon: "team" },
  { label: "Ayarlar", href: "/settings", icon: "settings" },
];

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Tarama", href: "/scanner" },
  { label: "Canlı İzleme", href: "/live" },
  { label: "Raporlar", href: "/report", active: true },
  { label: "Fiyatlandırma", href: "/pricing" },
];

const initialRows: HistoryRow[] = [
  {
    id: "scan-001",
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
    id: "scan-002",
    site: "shop.acmedijital.com",
    url: "https://shop.acmedijital.com",
    date: "10 Haz 2025",
    time: "11:18",
    score: "88",
    status: "Uyarı",
    critical: "5",
    type: "warning",
    icon: "cart",
  },
  {
    id: "scan-003",
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
    id: "scan-004",
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
    id: "scan-005",
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

const problems: ProblemItem[] = [
  {
    title: "Yavaş TTFB (İlk Bayt Süresi)",
    desc: "24 sitede tespit edildi",
    icon: "speed",
    tone: "red",
    solution:
      "Sunucu yanıt süresini düşürmek için cache katmanı, CDN ve backend sorgu optimizasyonu uygulanmalı.",
  },
  {
    title: "Eksik Güvenlik Başlıkları",
    desc: "18 sitede tespit edildi",
    icon: "shield",
    tone: "orange",
    solution:
      "HSTS, CSP, X-Frame-Options ve X-Content-Type-Options headerları sunucu tarafında eklenmeli.",
  },
  {
    title: "Optimize Edilmemiş Görseller",
    desc: "15 sitede tespit edildi",
    icon: "image",
    tone: "yellow",
    solution:
      "Büyük görseller WebP/AVIF formatına çevrilmeli, width/height değerleri eklenmeli ve lazy loading kullanılmalı.",
  },
];

const dateFilters = ["Son 7 Gün", "Son 30 Gün", "Son 90 Gün", "Tüm Zamanlar"];

const scoreFilters: { label: string; value: ScoreFilter }[] = [
  { label: "Tüm Skorlar", value: "all" },
  { label: "90 ve Üzeri", value: "high" },
  { label: "80 - 89", value: "medium" },
  { label: "80 Altı", value: "low" },
  { label: "Skorsuz", value: "empty" },
];

const statusFilters: { label: string; value: StatusFilter }[] = [
  { label: "Tüm Durumlar", value: "all" },
  { label: "Tamamlandı", value: "success" },
  { label: "Uyarı", value: "warning" },
  { label: "İnceleniyor", value: "info" },
  { label: "Başarısız", value: "failed" },
];

const itemsPerPage = 5;

export default function HistoryPage() {
  const router = useRouter();

  const [rows, setRows] = useState<HistoryRow[]>(initialRows);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all");
  const [dateFilter, setDateFilter] = useState("Son 30 Gün");
  const [criticalOnly, setCriticalOnly] = useState(false);

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isScoreOpen, setIsScoreOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStat, setSelectedStat] = useState<StatCardItem | null>(null);
  const [selectedRow, setSelectedRow] = useState<HistoryRow | null>(null);
  const [deleteRow, setDeleteRow] = useState<HistoryRow | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<ProblemItem | null>(null);
  const [openRowMenu, setOpenRowMenu] = useState<string | null>(null);
  const [supportOpen, setSupportOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [toast, setToast] = useState("");

  const counts = useMemo(() => {
    return {
      all: rows.length,
      success: rows.filter((row) => row.type === "success").length,
      warning: rows.filter((row) => row.type === "warning").length,
      info: rows.filter((row) => row.type === "info").length,
      failed: rows.filter((row) => row.type === "failed").length,
    };
  }, [rows]);

  const statCards: StatCardItem[] = useMemo(() => {
    const completed = counts.success;
    const warning = counts.warning;
    const failed = counts.failed;
    const total = counts.all;
    const successRate = total ? Math.round((completed / total) * 100) : 0;

    return [
      {
        title: "Toplam Tarama",
        value: String(total),
        desc: "↗ Son 30 günde yeni taramalar",
        icon: "chart",
        tone: "blue",
      },
      {
        title: "Tamamlanan",
        value: String(completed),
        desc: `Başarı oranı %${successRate}`,
        icon: "check",
        tone: "green",
      },
      {
        title: "Uyarılı",
        value: String(warning),
        desc: "İnceleme önerilir",
        icon: "warning",
        tone: "orange",
      },
      {
        title: "Başarısız",
        value: String(failed),
        desc: "Tekrar denenebilir",
        icon: "alert",
        tone: "red",
      },
    ];
  }, [counts]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesSearch =
        !normalizedSearch ||
        row.site.toLowerCase().includes(normalizedSearch) ||
        row.url.toLowerCase().includes(normalizedSearch) ||
        row.id.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" || row.type === statusFilter;

      const numericScore = Number(row.score);

      const matchesScore =
        scoreFilter === "all" ||
        (scoreFilter === "high" && row.score !== "-" && numericScore >= 90) ||
        (scoreFilter === "medium" && row.score !== "-" && numericScore >= 80 && numericScore < 90) ||
        (scoreFilter === "low" && row.score !== "-" && numericScore < 80) ||
        (scoreFilter === "empty" && row.score === "-");

      const criticalNumber = Number(row.critical);
      const matchesCritical = !criticalOnly || criticalNumber > 0;

      return matchesSearch && matchesStatus && matchesScore && matchesCritical;
    });
  }, [rows, searchTerm, statusFilter, scoreFilter, criticalOnly]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  const currentSafePage = Math.min(currentPage, totalPages);
  const startIndex = (currentSafePage - 1) * itemsPerPage;
  const paginatedRows = filteredRows.slice(startIndex, startIndex + itemsPerPage);

  const selectedStatusLabel =
    statusFilters.find((item) => item.value === statusFilter)?.label ?? "Tüm Durumlar";

  const selectedScoreLabel =
    scoreFilters.find((item) => item.value === scoreFilter)?.label ?? "Tüm Skorlar";

  const resetPage = () => {
    setCurrentPage(1);
  };

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2500);
  };

  const handleCsvExport = () => {
    const headers = ["ID", "Site", "URL", "Tarih", "Saat", "Skor", "Durum", "Kritik"];
    const csvRows = filteredRows.map((row) => [
      row.id,
      row.site,
      row.url,
      row.date,
      row.time,
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
    link.download = "precheck-analiz-gecmisi.csv";
    link.click();

    URL.revokeObjectURL(url);
    showToast("CSV dosyası indirildi.");
  };

  const openReport = (row: HistoryRow) => {
    router.push(`/report?url=${encodeURIComponent(row.url)}&jobId=${row.id}`);
  };

  const repeatScan = (row: HistoryRow) => {
    router.push(`/scanner?url=${encodeURIComponent(row.url)}`);
  };

  const deleteSelectedRow = () => {
    if (!deleteRow) return;

    setRows((current) => current.filter((row) => row.id !== deleteRow.id));
    setDeleteRow(null);
    setOpenRowMenu(null);
    showToast("Tarama geçmişten silindi.");
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#070b15] text-[#e7e9f4]">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_38%_0%,rgba(80,96,130,0.22),transparent_34%),linear-gradient(180deg,rgba(8,13,24,0.12),#070b15_86%)]" />

      <div className="relative z-10 flex min-h-screen">
        <Sidebar
          onSupport={() => setSupportOpen(true)}
          onUpgrade={() => setUpgradeOpen(true)}
        />

        <section className="min-w-0 flex-1">
          <Topbar
            searchTerm={searchTerm}
            onSearchChange={(value) => {
              setSearchTerm(value);
              resetPage();
            }}
            isWorkspaceOpen={isWorkspaceOpen}
            onWorkspaceToggle={() => setIsWorkspaceOpen((current) => !current)}
            onWorkspaceClose={() => setIsWorkspaceOpen(false)}
            onSettings={() => router.push("/settings")}
          />

          <div className="mx-auto grid w-full max-w-[1600px] gap-6 px-4 py-6 sm:px-6 lg:py-8 xl:grid-cols-[1fr_300px]">
            <div className="min-w-0">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h1 className="text-[30px] font-extrabold tracking-[-0.05em] text-[#e9ecf6]">
                    Analiz Geçmişi
                  </h1>
                  <p className="mt-3 max-w-[720px] text-[15px] font-medium leading-6 text-[#c3cad8]">
                    Geçmiş taramalarınızı inceleyin, filtreleyin ve raporlarınıza hızlıca erişin.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleCsvExport}
                    className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-white/[0.13] bg-[#080d18]/80 px-5 text-[14px] font-extrabold text-[#d7dcea] transition hover:border-white/25 hover:bg-white/[0.06]"
                  >
                    <Icon name="download" className="size-4" />
                    CSV Dışa Aktar
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/scanner")}
                    className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md bg-[#2f6df6] px-6 text-[14px] font-extrabold text-white shadow-[0_14px_34px_rgba(47,109,246,0.3)] transition hover:bg-[#3b7aff]"
                  >
                    <span className="text-xl leading-none">+</span>
                    Yeni Analiz Başlat
                  </button>
                </div>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card) => (
                  <StatCard
                    key={card.title}
                    {...card}
                    onClick={() => setSelectedStat(card)}
                  />
                ))}
              </div>

              <section className="mt-8 rounded-xl border border-white/[0.09] bg-[#0d1423]/88 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <div className="flex h-11 items-center gap-3 rounded-lg border border-white/[0.1] bg-[#080d18] px-4">
                  <Icon name="search" className="size-5 text-[#8792a8]" />
                  <input
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value);
                      resetPage();
                    }}
                    placeholder="Site, URL veya rapor adı ara..."
                    className="h-full min-w-0 flex-1 cursor-text bg-transparent text-[15px] font-medium text-white outline-none placeholder:text-[#626c80]"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm("");
                        resetPage();
                      }}
                      className="cursor-pointer text-[20px] text-[#8f99ad] transition hover:text-white"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <div className="relative">
                    <FilterButton onClick={() => setIsStatusOpen((current) => !current)}>
                      {selectedStatusLabel}
                    </FilterButton>

                    {isStatusOpen && (
                      <Dropdown className="left-0 top-12 w-[180px]">
                        {statusFilters.map((item) => (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => {
                              setStatusFilter(item.value);
                              setIsStatusOpen(false);
                              resetPage();
                            }}
                            className={`flex h-9 w-full cursor-pointer items-center rounded-md px-3 text-left text-[12px] font-bold transition hover:bg-white/[0.07] ${
                              statusFilter === item.value
                                ? "text-[#b8c7ff]"
                                : "text-[#c1c8d7]"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </Dropdown>
                    )}
                  </div>

                  <div className="relative">
                    <FilterButton onClick={() => setIsScoreOpen((current) => !current)}>
                      {selectedScoreLabel}
                    </FilterButton>

                    {isScoreOpen && (
                      <Dropdown className="left-0 top-12 w-[170px]">
                        {scoreFilters.map((item) => (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => {
                              setScoreFilter(item.value);
                              setIsScoreOpen(false);
                              resetPage();
                            }}
                            className={`flex h-9 w-full cursor-pointer items-center rounded-md px-3 text-left text-[12px] font-bold transition hover:bg-white/[0.07] ${
                              scoreFilter === item.value
                                ? "text-[#b8c7ff]"
                                : "text-[#c1c8d7]"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </Dropdown>
                    )}
                  </div>

                  <div className="relative">
                    <FilterButton onClick={() => setIsDateOpen((current) => !current)}>
                      {dateFilter} <Icon name="calendar" className="size-4" />
                    </FilterButton>

                    {isDateOpen && (
                      <Dropdown className="left-0 top-12 w-[170px]">
                        {dateFilters.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              setDateFilter(item);
                              setIsDateOpen(false);
                              resetPage();
                            }}
                            className={`flex h-9 w-full cursor-pointer items-center rounded-md px-3 text-left text-[12px] font-bold transition hover:bg-white/[0.07] ${
                              dateFilter === item
                                ? "text-[#b8c7ff]"
                                : "text-[#c1c8d7]"
                            }`}
                          >
                            {item}
                          </button>
                        ))}
                      </Dropdown>
                    )}
                  </div>

                  <FilterButton onClick={() => setIsMoreOpen(true)}>
                    <Icon name="filter" className="size-4" /> Daha Fazla
                  </FilterButton>
                </div>
              </section>

              <nav className="mt-8 flex flex-wrap gap-8 border-b border-white/[0.08] text-[14px] font-bold text-[#aeb6c8]">
                {[
                  ["Tümü", counts.all, "all"],
                  ["Tamamlandı", counts.success, "success"],
                  ["Uyarı", counts.warning, "warning"],
                  ["İnceleniyor", counts.info, "info"],
                  ["Başarısız", counts.failed, "failed"],
                ].map(([label, count, value]) => {
                  const isActive = statusFilter === value;

                  return (
                    <button
                      key={String(value)}
                      type="button"
                      onClick={() => {
                        setStatusFilter(value as StatusFilter);
                        resetPage();
                      }}
                      className={`relative flex cursor-pointer items-center gap-2 pb-4 transition hover:text-white ${
                        isActive ? "text-[#dfe6ff]" : "text-[#aab2c4]"
                      }`}
                    >
                      {label}
                      <span className="rounded-md bg-white/[0.12] px-2 py-0.5 text-[12px] text-[#b9c4dd]">
                        {count}
                      </span>
                      {isActive && (
                        <span className="absolute bottom-0 left-0 h-px w-full bg-[#b8c7ff]" />
                      )}
                    </button>
                  );
                })}
              </nav>

              <section className="mt-5 overflow-hidden rounded-xl border border-white/[0.09] bg-[#0d1423]/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[840px] border-collapse">
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
                      {paginatedRows.map((row) => (
                        <tr
                          key={row.id}
                          className="border-t border-white/[0.055] transition hover:bg-white/[0.045]"
                        >
                          <td className="px-5 py-5">
                            <button
                              type="button"
                              onClick={() => setSelectedRow(row)}
                              className="flex cursor-pointer items-center gap-4 text-left"
                            >
                              <span
                                className={`grid size-9 shrink-0 place-items-center rounded-md ${
                                  row.type === "failed"
                                    ? "border border-[#7c3539] bg-[#2a1418] text-[#ff666d]"
                                    : "bg-[#1b2536] text-[#b8c7ff]"
                                }`}
                              >
                                <Icon name={row.icon} className="size-5" />
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-[14px] font-extrabold text-[#dce2ef]">
                                  {row.site}
                                </p>
                                <p className="mt-1 truncate text-[12px] font-medium text-[#9aa4b7]">
                                  {row.url}
                                </p>
                              </div>
                            </button>
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
                              Number(row.critical) >= 5
                                ? "text-[#f5a623]"
                                : "text-[#d6dbe7]"
                            }`}
                          >
                            {row.critical}
                          </td>
                          <td className="relative px-5 py-5">
                            <div className="flex items-center justify-end gap-4 text-[#aeb6c8]">
                              <button
                                type="button"
                                onClick={() => openReport(row)}
                                className="cursor-pointer transition hover:text-white"
                                aria-label={`${row.site} raporunu aç`}
                              >
                                <Icon name="eye" className="size-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => repeatScan(row)}
                                className="cursor-pointer transition hover:text-white"
                                aria-label={`${row.site} tekrar analiz et`}
                              >
                                <Icon name="refresh" className="size-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeleteRow(row)}
                                className="cursor-pointer transition hover:text-[#ff666d]"
                                aria-label={`${row.site} kaydını sil`}
                              >
                                <Icon name="trash" className="size-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setOpenRowMenu((current) =>
                                    current === row.id ? null : row.id,
                                  )
                                }
                                className="cursor-pointer text-xl leading-none transition hover:text-white"
                              >
                                ⋮
                              </button>
                            </div>

                            {openRowMenu === row.id && (
                              <Dropdown className="right-5 top-12 w-[170px]">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedRow(row);
                                    setOpenRowMenu(null);
                                  }}
                                  className="flex h-9 w-full cursor-pointer items-center rounded-md px-3 text-left text-[12px] font-bold text-[#c1c8d7] transition hover:bg-white/[0.07]"
                                >
                                  Detayları Gör
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    openReport(row);
                                    setOpenRowMenu(null);
                                  }}
                                  className="flex h-9 w-full cursor-pointer items-center rounded-md px-3 text-left text-[12px] font-bold text-[#c1c8d7] transition hover:bg-white/[0.07]"
                                >
                                  Raporu Aç
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    repeatScan(row);
                                    setOpenRowMenu(null);
                                  }}
                                  className="flex h-9 w-full cursor-pointer items-center rounded-md px-3 text-left text-[12px] font-bold text-[#c1c8d7] transition hover:bg-white/[0.07]"
                                >
                                  Tekrar Tara
                                </button>
                              </Dropdown>
                            )}
                          </td>
                        </tr>
                      ))}

                      {!paginatedRows.length && (
                        <tr>
                          <td colSpan={6} className="px-5 py-10 text-center text-[14px] font-bold text-[#9aa4b7]">
                            Bu filtrelere uygun analiz bulunamadı.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-4 border-t border-white/[0.06] px-5 py-4 md:flex-row md:items-center md:justify-between">
                  <p className="text-[13px] font-bold text-[#aeb6c8]">
                    {filteredRows.length
                      ? `${startIndex + 1}-${Math.min(startIndex + itemsPerPage, filteredRows.length)} / ${filteredRows.length} tarama gösteriliyor`
                      : "0 tarama gösteriliyor"}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((current) => Math.max(1, current - 1))}
                      disabled={currentSafePage === 1}
                      className="grid size-9 cursor-pointer place-items-center rounded-md border border-white/[0.08] bg-[#080d18] text-[13px] font-extrabold text-[#9da7ba] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ‹
                    </button>

                    {Array.from({ length: totalPages }).map((_, index) => {
                      const page = index + 1;

                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`grid size-9 cursor-pointer place-items-center rounded-md border text-[13px] font-extrabold transition ${
                            currentSafePage === page
                              ? "border-[#2f6df6] bg-[#2f6df6] text-white"
                              : "border-white/[0.08] bg-[#080d18] text-[#9da7ba] hover:bg-white/[0.06]"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => setCurrentPage((current) => Math.min(totalPages, current + 1))}
                      disabled={currentSafePage === totalPages}
                      className="grid size-9 cursor-pointer place-items-center rounded-md border border-white/[0.08] bg-[#080d18] text-[13px] font-extrabold text-[#9da7ba] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ›
                    </button>
                  </div>
                </div>
              </section>
            </div>

            <RightPanel
              rows={rows}
              onProblemSelect={setSelectedProblem}
              onAllProblems={() => router.push("/report")}
            />
          </div>
        </section>
      </div>

      {isMoreOpen && (
        <Modal onClose={() => setIsMoreOpen(false)} maxWidth="max-w-[460px]">
          <ModalHeader title="Gelişmiş Filtreler" onClose={() => setIsMoreOpen(false)} />

          <div className="mt-6 space-y-4">
            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-white/[0.08] bg-[#080d18]/70 p-4">
              <span>
                <span className="block text-[14px] font-extrabold text-[#dce2ef]">
                  Sadece kritik bulgusu olanlar
                </span>
                <span className="mt-1 block text-[12px] font-medium text-[#8f99ad]">
                  Kritik değeri 0’dan büyük olan analizleri gösterir.
                </span>
              </span>
              <input
                type="checkbox"
                checked={criticalOnly}
                onChange={(event) => {
                  setCriticalOnly(event.target.checked);
                  resetPage();
                }}
                className="size-5 cursor-pointer"
              />
            </label>

            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setScoreFilter("all");
                setDateFilter("Son 30 Gün");
                setCriticalOnly(false);
                setIsMoreOpen(false);
                resetPage();
              }}
              className="h-10 w-full cursor-pointer rounded-md border border-white/[0.12] text-[13px] font-extrabold text-[#d8deeb] transition hover:bg-white/[0.06]"
            >
              Filtreleri Temizle
            </button>
          </div>
        </Modal>
      )}

      {selectedStat && (
        <Modal onClose={() => setSelectedStat(null)} maxWidth="max-w-[500px]">
          <ModalHeader title={selectedStat.title} onClose={() => setSelectedStat(null)} />
          <div className="mt-6 rounded-xl border border-white/[0.08] bg-[#080d18]/70 p-5">
            <p className="text-[42px] font-extrabold tracking-tighter">
              {selectedStat.value}
            </p>
            <p className="mt-3 text-[14px] font-medium leading-6 text-[#aab3c5]">
              {selectedStat.desc}
            </p>
          </div>
        </Modal>
      )}

      {selectedRow && (
        <Modal onClose={() => setSelectedRow(null)} maxWidth="max-w-[620px]">
          <ModalHeader title="Tarama Detayı" onClose={() => setSelectedRow(null)} />

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <DetailBox label="Tarama ID" value={selectedRow.id} />
            <DetailBox label="Site" value={selectedRow.site} />
            <DetailBox label="URL" value={selectedRow.url} />
            <DetailBox label="Tarih" value={`${selectedRow.date} ${selectedRow.time}`} />
            <DetailBox label="Skor" value={selectedRow.score} />
            <DetailBox label="Durum" value={selectedRow.status} />
            <DetailBox label="Kritik Bulgu" value={selectedRow.critical} />
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => repeatScan(selectedRow)}
              className="h-10 cursor-pointer rounded-md border border-white/[0.12] px-5 text-[13px] font-extrabold text-[#d8deeb] transition hover:bg-white/[0.06]"
            >
              Tekrar Tara
            </button>
            <button
              type="button"
              onClick={() => openReport(selectedRow)}
              className="h-10 cursor-pointer rounded-md bg-[#2f6df6] px-5 text-[13px] font-extrabold text-white transition hover:bg-[#3b7aff]"
            >
              Raporu Aç
            </button>
          </div>
        </Modal>
      )}

      {deleteRow && (
        <Modal onClose={() => setDeleteRow(null)} maxWidth="max-w-[460px]">
          <ModalHeader title="Tarama silinsin mi?" onClose={() => setDeleteRow(null)} />
          <p className="mt-5 text-[14px] font-medium leading-6 text-[#aab3c5]">
            <b className="text-white">{deleteRow.site}</b> analiz kaydı geçmişten kaldırılacak.
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeleteRow(null)}
              className="h-10 cursor-pointer rounded-md border border-white/[0.12] px-5 text-[13px] font-extrabold text-[#d8deeb] transition hover:bg-white/[0.06]"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={deleteSelectedRow}
              className="h-10 cursor-pointer rounded-md border border-[#7c3539] bg-[#2a1418] px-5 text-[13px] font-extrabold text-[#ff666d] transition hover:bg-[#381a1f]"
            >
              Sil
            </button>
          </div>
        </Modal>
      )}

      {selectedProblem && (
        <Modal onClose={() => setSelectedProblem(null)} maxWidth="max-w-[520px]">
          <ModalHeader title={selectedProblem.title} onClose={() => setSelectedProblem(null)} />
          <div className="mt-6 rounded-xl border border-white/[0.08] bg-[#080d18]/70 p-5">
            <p className="text-[13px] font-bold text-[#aab3c5]">{selectedProblem.desc}</p>
            <p className="mt-4 text-[14px] font-medium leading-6 text-[#dce2ef]">
              {selectedProblem.solution}
            </p>
          </div>
        </Modal>
      )}

      {supportOpen && (
        <Modal onClose={() => setSupportOpen(false)} maxWidth="max-w-[460px]">
          <ModalHeader title="Destek" onClose={() => setSupportOpen(false)} />
          <p className="mt-5 text-[14px] font-medium leading-6 text-[#aab3c5]">
            Analiz geçmişi veya rapor erişimiyle ilgili destek almak için ayarlar sayfasına gidebilirsin.
          </p>
          <button
            type="button"
            onClick={() => router.push("/settings")}
            className="mt-6 h-10 w-full cursor-pointer rounded-md bg-[#2f6df6] text-[13px] font-extrabold text-white transition hover:bg-[#3b7aff]"
          >
            Ayarlara Git
          </button>
        </Modal>
      )}

      {upgradeOpen && (
        <Modal onClose={() => setUpgradeOpen(false)} maxWidth="max-w-[460px]">
          <ModalHeader title="Paketi Yükselt" onClose={() => setUpgradeOpen(false)} />
          <p className="mt-5 text-[14px] font-medium leading-6 text-[#aab3c5]">
            Daha fazla tarama kredisi ve geçmiş rapor saklama kapasitesi için paketinizi yükseltebilirsiniz.
          </p>
          <button
            type="button"
            onClick={() => router.push("/pricing")}
            className="mt-6 h-10 w-full cursor-pointer rounded-md bg-[#2f6df6] text-[13px] font-extrabold text-white transition hover:bg-[#3b7aff]"
          >
            Fiyatlandırmaya Git
          </button>
        </Modal>
      )}

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg border border-white/[0.1] bg-[#0d1423] px-4 py-3 text-[13px] font-bold text-[#dce2ef] shadow-2xl">
          {toast}
        </div>
      )}
    </main>
  );
}

function Sidebar({
  onSupport,
  onUpgrade,
}: {
  onSupport: () => void;
  onUpgrade: () => void;
}) {
  return (
    <aside className="hidden w-[264px] shrink-0 border-r border-white/[0.08] bg-[#0c111d]/92 lg:flex lg:flex-col">
      <div className="flex h-[66px] items-center gap-3 border-b border-white/[0.07] px-9">
        <div className="grid size-9 place-items-center rounded-lg bg-[#2f6df6] text-[17px] font-extrabold text-white">
          P
        </div>
        <div>
          <p className="text-[21px] font-extrabold tracking-[-0.05em] text-[#c6d1ff]">
            Precheck AI
          </p>
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
              className={`flex h-12 cursor-pointer items-center gap-4 rounded-md px-4 text-[16px] font-bold transition ${
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
        <button
          type="button"
          onClick={onUpgrade}
          className="h-11 w-full cursor-pointer rounded-md bg-[#2f6df6] text-[14px] font-extrabold text-white shadow-[0_12px_28px_rgba(47,109,246,0.25)] transition hover:bg-[#3b7aff]"
        >
          Yükselt
        </button>

        <button
          type="button"
          onClick={onSupport}
          className="mt-5 flex h-9 w-full cursor-pointer items-center gap-4 rounded-md px-4 text-[16px] font-medium text-[#d1d6e2] transition hover:bg-white/[0.06] hover:text-white"
        >
          <Icon name="help" className="size-5" />
          Destek
        </button>
      </div>
    </aside>
  );
}

function Topbar({
  searchTerm,
  onSearchChange,
  isWorkspaceOpen,
  onWorkspaceToggle,
  onWorkspaceClose,
  onSettings,
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isWorkspaceOpen: boolean;
  onWorkspaceToggle: () => void;
  onWorkspaceClose: () => void;
  onSettings: () => void;
}) {
  return (
    <header className="flex h-[66px] items-center justify-between border-b border-white/[0.08] bg-[#080d18]/75 px-6 backdrop-blur-xl">
      <nav className="hidden items-center gap-8 lg:flex">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`relative cursor-pointer text-[14px] font-bold transition hover:text-white ${
              item.active ? "text-[#c8d4ff]" : "text-[#c6ccd9]"
            }`}
          >
            {item.label}
            {item.active && (
              <span className="absolute -bottom-[23px] left-0 h-px w-full bg-[#b8c7ff]" />
            )}
          </Link>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-5">
        <div className="hidden h-10 w-[260px] items-center gap-3 rounded-md border border-white/[0.1] bg-[#080d18] px-3 xl:flex">
          <Icon name="search" className="size-5 text-[#9aa4b7]" />
          <input
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Hızlı ara..."
            className="h-full min-w-0 flex-1 cursor-text bg-transparent text-[14px] font-medium text-white outline-none placeholder:text-[#6f788b]"
          />
          <span className="rounded bg-white/[0.12] px-1.5 py-0.5 text-[11px] font-extrabold text-[#b0b8c9]">
            ⌘
          </span>
          <span className="rounded bg-white/[0.12] px-1.5 py-0.5 text-[11px] font-extrabold text-[#b0b8c9]">
            K
          </span>
        </div>

        <span className="h-7 w-px bg-white/[0.08]" />

        <button type="button" className="cursor-pointer text-[#aeb6c8] transition hover:text-white">
          <Icon name="bell" className="size-5" />
        </button>

        <button
          type="button"
          onClick={onSettings}
          className="cursor-pointer text-[#aeb6c8] transition hover:text-white"
        >
          <Icon name="settings" className="size-5" />
        </button>

        <button type="button" className="cursor-pointer text-[#aeb6c8] transition hover:text-white">
          <Icon name="layers" className="size-5" />
        </button>

        <div className="relative hidden md:block">
          <button
            type="button"
            onClick={onWorkspaceToggle}
            className="grid size-9 cursor-pointer place-items-center overflow-hidden rounded-full border border-[#2f6df6] bg-[#153060] transition hover:scale-105"
          >
            <span className="text-[13px] font-extrabold text-white">A</span>
          </button>

          {isWorkspaceOpen && (
            <Dropdown className="right-0 top-12 w-[190px]">
              {["Acme Dijital", "Yeni Workspace", "Workspace Ayarları"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={onWorkspaceClose}
                  className="flex h-9 w-full cursor-pointer items-center rounded-md px-3 text-left text-[12px] font-bold text-[#c1c8d7] transition hover:bg-white/[0.07]"
                >
                  {item}
                </button>
              ))}
            </Dropdown>
          )}
        </div>
      </div>
    </header>
  );
}

function RightPanel({
  rows,
  onProblemSelect,
  onAllProblems,
}: {
  rows: HistoryRow[];
  onProblemSelect: (problem: ProblemItem) => void;
  onAllProblems: () => void;
}) {
  const completedRows = rows.filter((row) => row.type === "success");
  const scoredRows = rows.filter((row) => row.score !== "-");
  const averageScore = scoredRows.length
    ? Math.round(
        scoredRows.reduce((total, row) => total + Number(row.score), 0) / scoredRows.length,
      )
    : 0;

  return (
    <aside className="space-y-6 xl:sticky xl:top-20 xl:self-start">
      <section className="rounded-xl border border-white/[0.09] bg-[#0d1423]/88 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <h2 className="text-[22px] font-extrabold tracking-[-0.04em]">Bu Ayın Özeti</h2>

        <div className="mt-6 space-y-5">
          <SummaryLine icon="chart" label="Yapılan Tarama" value={String(rows.length)} />
          <SummaryLine icon="sigma" label="Ortalama Skor" value={String(averageScore)} green />
          <SummaryLine icon="timer" label="Ort. Tarama Süresi" value="1m 45s" />
        </div>

        <div className="mt-7 border-t border-white/[0.08] pt-5">
          <div className="h-1.5 overflow-hidden rounded-full bg-[linear-gradient(90deg,#25d18c_0_74%,#f5a623_74%_92%,#ff515f_92%_100%)]" />
          <div className="mt-3 flex items-center justify-between text-[11px] font-extrabold text-[#9ba5b8]">
            <span>Kota Kullanımı: %42</span>
            <span>{58 - completedRows.length} tarama kaldı</span>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-white/[0.09] bg-[#0d1423]/88 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <h2 className="text-[22px] font-extrabold tracking-[-0.04em]">En Çok Tekrarlanan Sorunlar</h2>

        <div className="mt-6 space-y-5">
          {problems.map((problem) => (
            <button
              key={problem.title}
              type="button"
              onClick={() => onProblemSelect(problem)}
              className="flex w-full cursor-pointer gap-4 rounded-lg text-left transition hover:bg-white/[0.04]"
            >
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
                <p className="text-[14px] font-extrabold leading-5 text-[#dce2ef]">
                  {problem.title}
                </p>
                <p className="mt-1 text-[12px] font-bold text-[#a3adbf]">
                  {problem.desc}
                </p>
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onAllProblems}
          className="mt-7 flex h-10 w-full cursor-pointer items-center justify-center text-[14px] font-extrabold text-[#b8c7ff] transition hover:text-white"
        >
          Tüm Sorunları Gör
        </button>
      </section>
    </aside>
  );
}

function StatCard({
  title,
  value,
  desc,
  icon,
  tone,
  onClick,
}: StatCardItem & { onClick: () => void }) {
  const toneMap: Record<StatCardItem["tone"], string> = {
    blue: "text-[#b8c7ff]",
    green: "text-[#25d18c]",
    orange: "text-[#f5a623]",
    red: "text-[#ff666d]",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative cursor-pointer overflow-hidden rounded-xl border border-white/[0.09] bg-[#0d1423]/88 p-5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.055]"
    >
      <div className="flex items-start justify-between">
        <span className="grid size-10 place-items-center rounded-lg border border-white/[0.08] bg-[#080d18]">
          <Icon name={icon} className={`size-5 ${toneMap[tone]}`} />
        </span>
        {tone !== "blue" && (
          <span
            className={`size-2 rounded-full ${
              tone === "green"
                ? "bg-[#25d18c]"
                : tone === "orange"
                  ? "bg-[#f5a623]"
                  : "bg-[#ff515f]"
            }`}
          />
        )}
      </div>

      <p className="mt-5 text-[15px] font-bold text-[#b7bfce]">{title}</p>
      <p className="mt-2 text-[34px] font-extrabold tracking-[-0.05em]">{value}</p>
      <p className={`mt-2 text-[12px] font-extrabold ${toneMap[tone]}`}>{desc}</p>
    </button>
  );
}

function FilterButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-white/[0.1] bg-[#080d18] px-4 text-[14px] font-extrabold text-[#c1c8d7] transition hover:border-white/20 hover:bg-white/[0.06]"
    >
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
    <span
      className={`grid size-9 place-items-center rounded-full border text-[13px] font-extrabold ${className}`}
    >
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
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[12px] font-extrabold ${className}`}
    >
      {type === "failed" ? "×" : "●"} {label}
    </span>
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

function Dropdown({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`absolute z-40 rounded-lg border border-white/[0.09] bg-[#0d1423] p-2 shadow-2xl ${className}`}
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
        className={`w-full ${maxWidth} cursor-default rounded-2xl border border-white/[0.1] bg-[#0d1423] p-6 shadow-2xl`}
      >
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-white/[0.08] pb-5">
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
    <div className="rounded-lg border border-white/[0.08] bg-[#080d18]/70 p-4">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#7f899d]">
        {label}
      </p>
      <p className="mt-2 break-words text-[14px] font-bold text-[#dce2ef]">
        {value}
      </p>
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