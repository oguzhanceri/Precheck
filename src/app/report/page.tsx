"use client";

import { createReportHref, createScannerHref } from "@/lib/routes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

type ScoreCardItem = {
  title: string;
  value: string;
  icon: string;
  active: boolean;
  desc: string;
};

type ModuleKey =
  | "performance"
  | "seo"
  | "accessibility"
  | "ux"
  | "security"
  | "responsive"
  | "interaction"
  | "visual"
  | "forms";

type FindingTone = "red" | "orange";

type Finding = {
  title: string;
  desc: string;
  level: string;
  icon: string;
  tone: FindingTone;
  solution: string;
  causes?: string[];
  evidence?: string[];
  affectedViewports?: string[];
  affectedPages?: string[];
  affectedCount?: number;
};

type Suggestion = {
  title: string;
  desc: string;
  impact: string;
  actions: string[];
};

type Vital = {
  metric: string;
  value: string;
  status: string;
  avg: string;
  trend: string;
  tone: "green" | "orange";
  width: string;
};

type PageRow = {
  path: string;
  score: string;
  critical: string;
  warning: string;
  check: string;
};

type ActiveTab = "summary" | "findings" | "suggestions" | "vitals" | "pages";

type ScanStatus = "queued" | "running" | "completed" | "cancelled" | "failed";

type ScanReportPayload = {
  scan?: Record<string, unknown>;
  data?: Record<string, unknown>;
} & Record<string, unknown>;

type ReportScanData = {
  id: string;
  url: string;
  dateText: string;
  status: ScanStatus;
  scopeText: string;
  durationText: string;
  engineText: string;
  overallScore: number;
  scoreCards: ScoreCardItem[];
  findings: Finding[];
  suggestions: Suggestion[];
  vitals: Vital[];
  pages: PageRow[];
  activeModules: ModuleKey[];
  showVitals: boolean;
};

type ScanInfoRow = [string, string];

const sidebarItems = [
  { label: "Genel Bakış", href: "/dashboard", icon: "grid" },
  { label: "Yeni Tarama", href: "/scanner", icon: "search" },
  { label: "Canlı İzleme", href: "/scanner", icon: "live" },
  { label: "Analiz Geçmişi", href: "/history", icon: "history" },
  { label: "Raporlar", href: "/history", icon: "file", active: true },
  { label: "Takım", href: "/settings", icon: "team" },
  { label: "Ayarlar", href: "/settings", icon: "settings" },
];

const topbarItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Tarama", href: "/scanner" },
  { label: "Canlı İzleme", href: "/scanner" },
  { label: "Raporlar", href: "/history", active: true },
  { label: "Fiyatlandırma", href: "/pricing" },
];

const tabs: { label: string; value: ActiveTab }[] = [
  { label: "Özet", value: "summary" },
  { label: "Bulgular", value: "findings" },
  { label: "Öneriler", value: "suggestions" },
  { label: "Core Web Vitals", value: "vitals" },
  { label: "Sayfa Detayları", value: "pages" },
];

const scoreCardTemplates: Omit<ScoreCardItem, "value" | "active">[] = [
  {
    title: "Performance",
    icon: "speed",
    desc: "LCP, CLS, FCP, yükleme süresi ve render-blocking kaynakların genel değerlendirmesi.",
  },
  {
    title: "SEO",
    icon: "search",
    desc: "Meta tag, başlık hiyerarşisi, canonical, sitemap ve yapısal veri kontrolleri.",
  },
  {
    title: "Erişilebilirlik",
    icon: "accessibility",
    desc: "WCAG uyumluluğu, aria-label, kontrast, klavye erişimi ve form label kontrolleri.",
  },
  {
    title: "UX",
    icon: "flow",
    desc: "Mobil taşmalar, tıklama alanları, form akışı ve kullanıcı etkileşim kontrolü.",
  },
  {
    title: "Güvenlik",
    icon: "shield",
    desc: "SSL, güvenlik headerları, mixed content ve eski JS kütüphanesi kontrolleri.",
  },
];

export default function ReportPage() {
  const router = useRouter();

  const [scanId, setScanId] = useState<string | null>(null);
  const [isClientReady, setIsClientReady] = useState(false);

  const [reportUrl, setReportUrl] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [reportStatus, setReportStatus] = useState<ScanStatus>("queued");
  const [reportScope, setReportScope] = useState("");
  const [reportDuration, setReportDuration] = useState("");
  const [reportEngine, setReportEngine] = useState("");

  const [overallScore, setOverallScore] = useState(0);

  const [dynamicScoreCards, setDynamicScoreCards] = useState<
    ScoreCardItem[] | null
  >(null);
  const [dynamicFindings, setDynamicFindings] = useState<Finding[] | null>(
    null,
  );
  const [dynamicSuggestions, setDynamicSuggestions] = useState<
    Suggestion[] | null
  >(null);
  const [dynamicVitals, setDynamicVitals] = useState<Vital[] | null>(null);
  const [dynamicPages, setDynamicPages] = useState<PageRow[] | null>(null);

  const [isReportLoading, setIsReportLoading] = useState(true);
  const [reportError, setReportError] = useState("");

  const [activeTab, setActiveTab] = useState<ActiveTab>("summary");
  const [selectedScore, setSelectedScore] = useState<ScoreCardItem | null>(
    null,
  );
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<Suggestion | null>(null);
  const [selectedPage, setSelectedPage] = useState<PageRow | null>(null);
  const [shareLink, setShareLink] = useState("");
  const [note, setNote] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [toast, setToast] = useState("");
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  const canRenderReportContent =
    isClientReady &&
    Boolean(scanId) &&
    !isReportLoading &&
    !reportError &&
    dynamicScoreCards !== null &&
    dynamicFindings !== null &&
    dynamicSuggestions !== null &&
    dynamicVitals !== null &&
    dynamicPages !== null;

  const displayScoreCards = canRenderReportContent
    ? (dynamicScoreCards ?? [])
    : [];

  const displayFindings = canRenderReportContent ? (dynamicFindings ?? []) : [];

  const displaySuggestions = canRenderReportContent
    ? (dynamicSuggestions ?? [])
    : [];

  const displayVitals = canRenderReportContent ? (dynamicVitals ?? []) : [];

  const displayPages = canRenderReportContent ? (dynamicPages ?? []) : [];

  const shouldShowVitals = canRenderReportContent && displayVitals.length > 0;

  const visibleTabs = canRenderReportContent
    ? tabs.filter((tab) => {
        if (tab.value === "vitals") return shouldShowVitals;

        return true;
      })
    : [];

  const scanInfoRows: ScanInfoRow[] = canRenderReportContent
    ? [
        ["Toplam Sayfa", String(displayPages.length)],
        ["Süre", reportDuration],
        ["Motor", reportEngine],
        ["Kapsam", reportScope],
      ]
    : [];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const currentScanId = params.get("scanId");

    setScanId(currentScanId);
    setIsClientReady(true);
  }, []);

  useEffect(() => {
    if (!isClientReady) return;

    if (!scanId) {
      setReportError(
        "Rapor ID bulunamadı. Lütfen History sayfasından bir rapor seçin.",
      );
      setIsReportLoading(false);
      return;
    }

    let isMounted = true;

    const fetchReport = async () => {
      setIsReportLoading(true);
      setReportError("");

      setDynamicScoreCards(null);
      setDynamicFindings(null);
      setDynamicSuggestions(null);
      setDynamicVitals(null);
      setDynamicPages(null);

      try {
        const response = await fetch(
          `/api/scans/${encodeURIComponent(scanId)}`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Bu scanId için rapor kaydı bulunamadı.");
          }

          throw new Error("Rapor verisi alınırken bir hata oluştu.");
        }

        const payload = (await response.json()) as ScanReportPayload;
        const normalizedReport = normalizeReportPayload(payload, scanId);

        if (!isMounted) return;

        setReportUrl(normalizedReport.url);
        setReportDate(normalizedReport.dateText);
        setReportStatus(normalizedReport.status);
        setReportScope(normalizedReport.scopeText);
        setReportDuration(normalizedReport.durationText);
        setReportEngine(normalizedReport.engineText);
        setOverallScore(normalizedReport.overallScore);
        setDynamicScoreCards(normalizedReport.scoreCards);
        setDynamicFindings(normalizedReport.findings);
        setDynamicSuggestions(normalizedReport.suggestions);
        setDynamicVitals(normalizedReport.vitals);
        setDynamicPages(normalizedReport.pages);

        if (!normalizedReport.showVitals) {
          setActiveTab((currentTab) =>
            currentTab === "vitals" ? "summary" : currentTab,
          );
        }
      } catch (error) {
        if (!isMounted) return;

        const message =
          error instanceof Error
            ? error.message
            : "Rapor verisi alınırken bilinmeyen bir hata oluştu.";

        setReportError(message);
      } finally {
        if (isMounted) {
          setIsReportLoading(false);
        }
      }
    };

    void fetchReport();

    return () => {
      isMounted = false;
    };
  }, [isClientReady, scanId]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2500);
  };

  const handlePdfDownload = () => {
    showToast("PDF çıktısı için yazdırma ekranı açılıyor.");
    window.print();
  };

  const handleCsvExport = () => {
    if (!canRenderReportContent) {
      showToast("Rapor verisi henüz hazır değil.");
      return;
    }

    const rows = [
      ["Tip", "Başlık", "Açıklama", "Seviye"],
      ...displayFindings.map((item) => [
        "Bulgu",
        item.title,
        item.desc,
        item.level,
      ]),
      ...displayVitals.map((item) => [
        "Core Web Vital",
        item.metric,
        item.value,
        item.status,
      ]),
      ...displayPages.map((item) => [
        "Sayfa",
        item.path,
        `Skor: ${item.score}`,
        item.critical,
      ]),
    ];

    const csvContent = rows
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "precheck-detayli-rapor.csv";
    link.click();

    URL.revokeObjectURL(url);
    showToast("CSV dosyası indirildi.");
  };

  const handleShareLink = async () => {
    if (!scanId) {
      showToast("Paylaşılabilir rapor ID bulunamadı.");
      return;
    }

    const link = `${window.location.origin}${createReportHref(scanId)}`;

    setShareLink(link);

    try {
      await navigator.clipboard.writeText(link);
      showToast("Paylaşılabilir link kopyalandı.");
    } catch {
      showToast("Link oluşturuldu.");
    }
  };

  const handleSaveNote = () => {
    setSavedNote(note);
    showToast("Rapor notu kaydedildi.");
  };

  const handleReAnalyze = () => {
    if (!reportUrl) {
      router.push("/scanner");
      return;
    }

    router.push(createScannerHref(reportUrl));
  };

  const handleArchive = () => {
    setArchiveOpen(false);
    showToast("Rapor arşivlendi.");
    router.push("/history");
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#070b15] text-[#e7e9f4]">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-size-[32px_32px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_36%_0%,rgba(64,102,255,0.13),transparent_34%),linear-gradient(180deg,rgba(8,13,24,0.1),#070b15_86%)]" />

      <div className="relative z-10 flex min-h-screen">
        <Sidebar
          onSupport={() => setSupportOpen(true)}
          onUpgrade={() => setUpgradeOpen(true)}
        />

        <section className="min-w-0 flex-1">
          <Topbar
            workspaceOpen={workspaceOpen}
            onWorkspaceToggle={() => setWorkspaceOpen((current) => !current)}
            onWorkspaceClose={() => setWorkspaceOpen(false)}
            onSettings={() => router.push("/settings")}
          />

          <div className="mx-auto grid max-w-[1600px] gap-6 px-4 py-6 sm:px-6 lg:py-8 xl:grid-cols-[1fr_260px]">
            <div className="min-w-0">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <h1 className="text-[34px] font-extrabold leading-none tracking-[-0.07em] text-[#e8ebf5] sm:text-[42px] lg:text-[46px]">
                    Detaylı Rapor
                  </h1>

                  <button
                    type="button"
                    disabled={!reportUrl}
                    onClick={() => {
                      if (!reportUrl) return;

                      window.open(reportUrl, "_blank", "noopener,noreferrer");
                    }}
                    className="mt-4 flex max-w-full cursor-pointer items-center gap-2 text-left text-[14px] font-medium text-[#d7dce8] transition hover:text-white disabled:cursor-default disabled:text-[#737b8f] sm:text-[16px]"
                  >
                    <span className="truncate">
                      {reportUrl || "Rapor verisi yükleniyor..."}
                    </span>
                    {reportUrl && (
                      <Icon
                        name="external"
                        className="size-4 shrink-0 text-[#aebcff]"
                      />
                    )}
                  </button>

                  <div className="mt-5 flex flex-wrap items-center gap-3 text-[13px] font-bold text-[#c0c7d7]">
                    <span className="inline-flex items-center gap-2">
                      <Icon name="calendar" className="size-4 text-[#b6c3ff]" />
                      {reportDate || "Hazırlanıyor"}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className={`size-2 rounded-full ${
                          reportStatus === "completed"
                            ? "bg-[#25d18c]"
                            : reportStatus === "failed" ||
                                reportStatus === "cancelled"
                              ? "bg-[#ff777d]"
                              : "bg-[#f5a623]"
                        }`}
                      />
                      {getScanStatusLabel(reportStatus)}
                    </span>

                    <span className="rounded-md bg-white/12 px-3 py-1 text-[12px] text-[#c8cfdd]">
                      {reportScope || "Tarama yükleniyor"}
                    </span>

                    {scanId && (
                      <span className="rounded-md bg-white/8 px-3 py-1 text-[12px] text-[#9fa8bb]">
                        ID: {scanId.slice(0, 8)}...
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handlePdfDownload}
                    disabled={!canRenderReportContent}
                    className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-white/13 bg-[#080d18]/80 px-4 text-[13px] font-bold text-[#d7dcea] transition hover:border-white/25 hover:bg-white/6 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Icon name="download" className="size-4" />
                    PDF İndir
                  </button>

                  <button
                    type="button"
                    onClick={handleCsvExport}
                    disabled={!canRenderReportContent}
                    className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-white/13 bg-[#080d18]/80 px-4 text-[13px] font-bold text-[#d7dcea] transition hover:border-white/25 hover:bg-white/6 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Icon name="download" className="size-4" />
                    CSV Dışa Aktar
                  </button>

                  <button
                    type="button"
                    onClick={handleReAnalyze}
                    disabled={!reportUrl && !canRenderReportContent}
                    className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-[#2f6df6] px-4 text-[13px] font-extrabold text-white shadow-[0_12px_30px_rgba(47,109,246,0.25)] transition hover:bg-[#3b7aff] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Icon name="refresh" className="size-4" />
                    Tekrar Analiz Et
                  </button>
                </div>
              </div>

              {!canRenderReportContent && (
                <div
                  className={`mt-6 rounded-xl border p-4 text-[13px] font-bold leading-6 ${
                    reportError
                      ? "border-[#713c3f] bg-[#211318]/80 text-[#ff9a9f]"
                      : "border-white/10 bg-[#080d18]/70 text-[#aebcff]"
                  }`}
                >
                  {reportError || "Rapor verisi yükleniyor..."}
                </div>
              )}

              {canRenderReportContent && (
                <>
                  <section className="mt-8 grid gap-4 lg:grid-cols-[132px_1fr]">
                    <OverallScoreCard score={overallScore} />

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {displayScoreCards.map((card) => (
                        <ScoreCard
                          key={card.title}
                          {...card}
                          onClick={() => setSelectedScore(card)}
                        />
                      ))}
                    </div>
                  </section>

                  <nav className="mt-7 flex gap-6 overflow-x-auto border-b border-white/8 text-[14px] font-bold text-[#b2bacb]">
                    {visibleTabs.map((tab) => (
                      <button
                        key={tab.value}
                        type="button"
                        onClick={() => setActiveTab(tab.value)}
                        className={`relative shrink-0 cursor-pointer pb-3 transition hover:text-white ${
                          activeTab === tab.value
                            ? "text-[#e4e9f7]"
                            : "text-[#a5adbe]"
                        }`}
                      >
                        {tab.label}
                        {activeTab === tab.value && (
                          <span className="absolute bottom-0 left-0 h-px w-full bg-[#b8c7ff]" />
                        )}
                      </button>
                    ))}
                  </nav>

                  {(activeTab === "summary" ||
                    activeTab === "findings" ||
                    activeTab === "suggestions") && (
                    <div
                      className={`mt-6 grid gap-4 ${
                        activeTab === "summary"
                          ? "lg:grid-cols-2"
                          : "grid-cols-1"
                      }`}
                    >
                      {(activeTab === "summary" ||
                        activeTab === "findings") && (
                        <FindingsSection
                          items={displayFindings}
                          onSelect={setSelectedFinding}
                        />
                      )}

                      {(activeTab === "summary" ||
                        activeTab === "suggestions") && (
                        <SuggestionsSection
                          items={displaySuggestions}
                          onSelect={setSelectedSuggestion}
                        />
                      )}
                    </div>
                  )}

                  {shouldShowVitals &&
                    (activeTab === "summary" || activeTab === "vitals") && (
                      <VitalsSection items={displayVitals} />
                    )}

                  {(activeTab === "summary" || activeTab === "pages") && (
                    <PagesSection
                      items={displayPages}
                      onSelect={setSelectedPage}
                    />
                  )}
                </>
              )}
            </div>

            {canRenderReportContent && (
              <RightPanel
                note={note}
                savedNote={savedNote}
                shareLink={shareLink}
                scanInfoRows={scanInfoRows}
                onNoteChange={setNote}
                onSaveNote={handleSaveNote}
                onShare={handleShareLink}
                onDownload={handleCsvExport}
                onRefresh={handleReAnalyze}
                onArchive={() => setArchiveOpen(true)}
              />
            )}
          </div>
        </section>
      </div>

      {selectedScore && (
        <Modal onClose={() => setSelectedScore(null)} maxWidth="max-w-[520px]">
          <ModalHeader
            title={selectedScore.title}
            onClose={() => setSelectedScore(null)}
          />
          <div className="mt-6 rounded-xl border border-white/8 bg-[#080d18]/70 p-5">
            <p className="text-[42px] font-extrabold tracking-tighter">
              {selectedScore.value}
            </p>
            <p className="mt-3 text-[14px] font-medium leading-6 text-[#aab3c5]">
              {selectedScore.desc}
            </p>
          </div>
        </Modal>
      )}

      {selectedFinding && (
        <Modal
          onClose={() => setSelectedFinding(null)}
          maxWidth="max-w-[560px]"
        >
          <ModalHeader
            title="Bulgu Detayı"
            onClose={() => setSelectedFinding(null)}
          />

          <div className="mt-6 space-y-4">
            <InfoBox
              label={selectedFinding.level}
              title={selectedFinding.title}
              text={selectedFinding.desc}
            />

            <InfoBox
              label="Çözüm Önerisi"
              title="Nasıl düzeltilir?"
              text={selectedFinding.solution}
            />

            {selectedFinding.causes?.length ? (
              <div className="rounded-xl border border-white/8 bg-[#080d18]/70 p-5">
                <p className="text-[12px] font-extrabold tracking-[0.08em] text-[#aebcff] uppercase">
                  Muhtemel Nedenler
                </p>

                <ul className="mt-4 space-y-2 text-[13px] font-medium leading-5 text-[#d2d8e6]">
                  {selectedFinding.causes.map((cause) => (
                    <li key={cause}>• {cause}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {selectedFinding.evidence?.length ? (
              <div className="rounded-xl border border-white/8 bg-[#080d18]/70 p-5">
                <p className="text-[12px] font-extrabold tracking-[0.08em] text-[#aebcff] uppercase">
                  Kanıtlar
                </p>

                <ul className="mt-4 space-y-2 text-[13px] font-medium leading-5 text-[#d2d8e6]">
                  {selectedFinding.evidence.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {selectedFinding.affectedViewports?.length ? (
              <div className="rounded-xl border border-white/8 bg-[#080d18]/70 p-5">
                <p className="text-[12px] font-extrabold tracking-[0.08em] text-[#aebcff] uppercase">
                  Etkilenen Viewportlar
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedFinding.affectedViewports.map((viewport) => (
                    <span
                      key={viewport}
                      className="rounded-full border border-white/8 bg-white/5 px-3 py-2 text-[12px] font-bold text-[#dce2ef]"
                    >
                      {viewport}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {selectedFinding.affectedPages?.length ? (
              <div className="rounded-xl border border-white/8 bg-[#080d18]/70 p-5">
                <p className="text-[12px] font-extrabold tracking-[0.08em] text-[#aebcff] uppercase">
                  Etkilenen Sayfalar
                </p>

                <div className="mt-4 space-y-2">
                  {selectedFinding.affectedPages.map((page) => (
                    <div
                      key={page}
                      className="rounded-lg border border-white/8 bg-white/5 px-3 py-2 text-[13px] font-bold text-[#dce2ef]"
                    >
                      {page}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </Modal>
      )}

      {selectedSuggestion && (
        <Modal
          onClose={() => setSelectedSuggestion(null)}
          maxWidth="max-w-[560px]"
        >
          <ModalHeader
            title="Çözüm Önerisi"
            onClose={() => setSelectedSuggestion(null)}
          />
          <div className="mt-6 rounded-xl border border-white/8 bg-[#080d18]/70 p-5">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-[20px] font-extrabold">
                {selectedSuggestion.title}
              </h3>
              <span className="rounded-md border border-[#6d5623] bg-[#302919] px-3 py-1 text-[11px] font-extrabold text-[#f5a623]">
                Etki: {selectedSuggestion.impact}
              </span>
            </div>
            <p className="mt-4 text-[14px] font-medium leading-6 text-[#aab3c5]">
              {selectedSuggestion.desc}
            </p>
            <ul className="mt-5 space-y-2 text-[13px] font-medium text-[#d2d8e6]">
              {selectedSuggestion.actions.map((action) => (
                <li key={action}>• {action}</li>
              ))}
            </ul>
          </div>
        </Modal>
      )}

      {selectedPage && (
        <Modal onClose={() => setSelectedPage(null)} maxWidth="max-w-[560px]">
          <ModalHeader
            title="Sayfa Detayı"
            onClose={() => setSelectedPage(null)}
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <DetailBox label="Sayfa Yolu" value={selectedPage.path} />
            <DetailBox label="Skor" value={selectedPage.score} />
            <DetailBox label="Kritik" value={selectedPage.critical} />
            <DetailBox label="Uyarı" value={selectedPage.warning} />
            <DetailBox label="Son Kontrol" value={selectedPage.check} />
            <DetailBox
              label="Tam URL"
              value={`${reportUrl}${selectedPage.path}`}
            />
          </div>
        </Modal>
      )}

      {archiveOpen && (
        <Modal onClose={() => setArchiveOpen(false)} maxWidth="max-w-[460px]">
          <ModalHeader
            title="Rapor arşivlensin mi?"
            onClose={() => setArchiveOpen(false)}
          />
          <p className="mt-5 text-[14px] font-medium leading-6 text-[#aab3c5]">
            Bu rapor aktif raporlar listesinden kaldırılır ve analiz geçmişinde
            arşivlenmiş olarak görünür.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setArchiveOpen(false)}
              className="h-10 cursor-pointer rounded-md border border-white/12 px-5 text-[13px] font-extrabold text-[#d8deeb] transition hover:bg-white/6"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={handleArchive}
              className="h-10 cursor-pointer rounded-md border border-[#713c3f] bg-[#211318] px-5 text-[13px] font-extrabold text-[#ff9a9f] transition hover:bg-[#32171d]"
            >
              Arşivle
            </button>
          </div>
        </Modal>
      )}

      {supportOpen && (
        <Modal onClose={() => setSupportOpen(false)} maxWidth="max-w-[460px]">
          <ModalHeader title="Destek" onClose={() => setSupportOpen(false)} />
          <p className="mt-5 text-[14px] font-medium leading-6 text-[#aab3c5]">
            Destek talebi için ayarlar sayfasındaki takım ve destek alanını
            kullanabilirsin.
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
          <ModalHeader
            title="Paketi Yükselt"
            onClose={() => setUpgradeOpen(false)}
          />
          <p className="mt-5 text-[14px] font-medium leading-6 text-[#aab3c5]">
            Daha fazla tarama kredisi, ekip üyeleri ve gelişmiş raporlama için
            fiyatlandırma sayfasına gidebilirsin.
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
        <div className="fixed right-5 bottom-5 z-50 rounded-lg border border-white/10 bg-[#0d1423] px-4 py-3 text-[13px] font-bold text-[#dce2ef] shadow-2xl">
          {toast}
        </div>
      )}
    </main>
  );
}

function OverallScoreCard({ score }: { score: number }) {
  return (
    <div className="rounded-xl border border-white/9 bg-[#0d1423]/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div
        className="mx-auto grid size-26 place-items-center rounded-full"
        style={{
          background: `conic-gradient(#21c995 0 ${score}%, #202a3c ${score}% 100%)`,
        }}
      >
        <div className="grid size-20 place-items-center rounded-full bg-[#0d1423]">
          <span className="text-[31px] font-extrabold tracking-tighter">
            {score}
          </span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <span className="rounded-md border border-[#14624d] bg-[#0d372e] px-3 py-1 text-[11px] font-extrabold text-[#22d296]">
          {getOverallScoreLabel(score)}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-center text-[11px] font-bold text-[#aeb6c8]">
        <span className="text-[#25d18c]">↗</span>
        <span>
          canlı
          <br />
          rapor skoru
        </span>
      </div>
    </div>
  );
}

function ScoreCard({
  title,
  value,
  icon,
  active,
  onClick,
}: ScoreCardItem & { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-white/9 bg-[#0d1423]/88 p-4 text-left transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/5.5"
    >
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[13px] font-extrabold text-[#b7bfce]">
          <Icon name={icon} className="size-4 text-[#aebcff]" />
          {title}
        </h3>
        {active && <span className="size-2 rounded-full bg-[#25d18c]" />}
      </div>

      <div className="mt-8 flex items-end justify-between">
        <span className="text-[25px] font-extrabold tracking-[-0.04em]">
          {value}
        </span>
        <span className="h-8 w-14 bg-[linear-gradient(180deg,rgba(37,209,140,0.04),rgba(37,209,140,0.23))]">
          <span className="mt-7 block h-0.5 w-full bg-[#25d18c]" />
        </span>
      </div>
    </button>
  );
}

function FindingsSection({
  items,
  onSelect,
}: {
  items: Finding[];
  onSelect: (item: Finding) => void;
}) {
  return (
    <section className="rounded-xl border border-white/9 bg-[#0d1423]/88 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[22px] font-extrabold tracking-[-0.04em]">
          Kritik Bulgular
        </h2>
        <span className="shrink-0 rounded-md border border-[#783438] bg-[#32171d] px-2 py-1 text-[11px] font-extrabold text-[#ff777d]">
          {items.length} Önemli Bulgu
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {items.length ? (
          items.map((item) => (
            <FindingItem
              key={`${item.title}-${item.desc}`}
              {...item}
              onClick={() => onSelect(item)}
            />
          ))
        ) : (
          <EmptyState text="Seçili modüller için bulgu bulunamadı." />
        )}
      </div>
    </section>
  );
}

function FindingItem({
  title,
  desc,
  level,
  icon,
  tone,
  affectedCount,
  onClick,
}: Finding & { onClick: () => void }) {
  const toneClass =
    tone === "red"
      ? "border-[#783438] bg-[#32171d] text-[#ff777d]"
      : "border-[#6d5623] bg-[#302919] text-[#f5a623]";

  return (
    <button
      type="button"
      onClick={onClick}
      className="grid w-full cursor-pointer grid-cols-[24px_minmax(0,1fr)_auto_14px] items-start gap-3 rounded-lg p-2 text-left transition hover:bg-white/4"
    >
      <Icon
        name={icon}
        className={`size-5 ${
          tone === "red" ? "text-[#ff9a9f]" : "text-[#f5a623]"
        }`}
      />
      <div className="min-w-0">
        <h3 className="truncate text-[14px] font-extrabold leading-5 text-[#dbe1ee]">
          {title}
        </h3>
        <p className="mt-1 truncate text-[11px] font-bold text-[#9ba5b8]">
          {desc}
        </p>
        {affectedCount ? (
          <p className="mt-1 text-[11px] font-extrabold text-[#aebcff]">
            {affectedCount} sayfada tespit edildi
          </p>
        ) : null}
      </div>
      <span
        className={`rounded px-2 py-1 text-[10px] font-extrabold ${toneClass}`}
      >
        {level}
      </span>
      <span className="text-[#aeb6c8]">›</span>
    </button>
  );
}

function SuggestionsSection({
  items,
  onSelect,
}: {
  items: Suggestion[];
  onSelect: (item: Suggestion) => void;
}) {
  return (
    <section className="rounded-xl border border-white/9 bg-[#0d1423]/88 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <h2 className="flex items-center gap-2 text-[22px] font-extrabold tracking-[-0.04em]">
        ✨ Akıllı Çözüm Önerileri
      </h2>

      <div className="mt-5 space-y-4">
        {items.length ? (
          items.map((item) => (
            <SuggestionCard
              key={`${item.title}-${item.desc}`}
              {...item}
              onClick={() => onSelect(item)}
            />
          ))
        ) : (
          <EmptyState text="Bu rapor için çözüm önerisi bulunamadı." />
        )}
      </div>
    </section>
  );
}

function SuggestionCard({
  title,
  desc,
  actions,
  impact,
  onClick,
}: Suggestion & { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full cursor-pointer rounded-lg border border-white/6 bg-white/6 p-4 text-left transition hover:border-white/15 hover:bg-white/8.5"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-[15px] font-extrabold leading-5 text-[#f1f4fb]">
          {title}
        </h3>
        <span className="shrink-0 text-right text-[11px] font-extrabold text-[#f59d23]">
          ⚡ Etki:
          <br />
          {impact}
        </span>
      </div>

      <p className="mt-2 text-[12px] font-medium leading-5 text-[#c1c8d8]">
        {desc}
      </p>

      <ul className="mt-3 space-y-1 text-[11px] font-medium leading-4 text-[#d2d8e6]">
        {actions.map((action) => (
          <li key={action}>• {action}</li>
        ))}
      </ul>
    </button>
  );
}

function VitalsSection({ items }: { items: Vital[] }) {
  return (
    <section className="mt-6 rounded-xl border border-white/9 bg-[#0d1423]/88 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <h2 className="text-[22px] font-extrabold tracking-[-0.04em]">
        Core Web Vitals
      </h2>

      <div className="mt-4 overflow-x-auto border-t border-white/8 pt-4">
        <table className="w-full min-w-170 border-collapse">
          <thead>
            <tr className="text-left text-[13px] font-extrabold text-[#9fa8bb]">
              <th className="py-3 pr-4">Metrik</th>
              <th className="py-3 pr-4">Bu Site</th>
              <th className="py-3 pr-4">Durum</th>
              <th className="py-3 pr-4">Endüstri Ort.</th>
              <th className="py-3 pr-4">Trend</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.metric} className="border-t border-white/5">
                <td className="max-w-55 py-3 pr-4 text-[13px] font-extrabold leading-5 text-[#cfd5e2]">
                  {item.metric}
                </td>
                <td
                  className={`py-3 pr-4 text-[13px] font-extrabold ${
                    item.tone === "orange" ? "text-[#f49b3a]" : "text-[#dce2ef]"
                  }`}
                >
                  {item.value}
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-20 overflow-hidden rounded-full bg-white/12">
                      <span
                        className={`block h-full rounded-full ${
                          item.tone === "orange"
                            ? "bg-[#f49b3a]"
                            : "bg-[#25d18c]"
                        }`}
                        style={{ width: item.width }}
                      />
                    </span>
                    <span
                      className={`text-[12px] font-bold ${
                        item.tone === "orange"
                          ? "text-[#f49b3a]"
                          : "text-[#25d18c]"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-[13px] font-bold text-[#aeb6c8]">
                  {item.avg}
                </td>
                <td
                  className={`py-3 pr-4 text-[13px] font-extrabold ${
                    item.tone === "orange" ? "text-[#ff8f67]" : "text-[#25d18c]"
                  }`}
                >
                  {item.trend}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PagesSection({
  items,
  onSelect,
}: {
  items: PageRow[];
  onSelect: (item: PageRow) => void;
}) {
  return (
    <section className="mt-6 overflow-hidden rounded-xl border border-white/9 bg-[#0d1423]/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="px-4 py-4">
        <h2 className="text-[22px] font-extrabold tracking-[-0.04em]">
          En Çok Etkilenen Sayfalar
        </h2>
      </div>

      <div className="overflow-x-auto">
        {items.length ? (
          <table className="w-full min-w-180 border-collapse">
            <thead>
              <tr className="border-y border-white/8 text-left text-[13px] font-extrabold text-[#9fa8bb]">
                <th className="px-4 py-3">Sayfa Yolu</th>
                <th className="px-4 py-3">Skor</th>
                <th className="px-4 py-3">Kritik</th>
                <th className="px-4 py-3">Uyarı</th>
                <th className="px-4 py-3">Son Kontrol</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {items.map((page) => (
                <tr
                  key={page.path}
                  className="border-b border-white/5.5 transition hover:bg-white/3"
                >
                  <td className="px-4 py-4 text-[13px] font-extrabold text-[#d9dfec]">
                    {page.path}
                  </td>
                  <td
                    className={`px-4 py-4 text-[13px] font-extrabold ${
                      Number(page.score) < 80
                        ? "text-[#f59d23]"
                        : "text-[#25d18c]"
                    }`}
                  >
                    {page.score}
                  </td>
                  <td className="px-4 py-4">
                    {page.critical === "—" ? (
                      <span className="text-[#9aa4b7]">—</span>
                    ) : (
                      <span className="rounded bg-[#32171d] px-2 py-1 text-[10px] font-extrabold text-[#ff777d]">
                        {page.critical}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {page.warning === "—" ? (
                      <span className="text-[#9aa4b7]">—</span>
                    ) : (
                      <span className="rounded bg-[#302919] px-2 py-1 text-[10px] font-extrabold text-[#f5a623]">
                        {page.warning}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-[13px] font-bold text-[#aeb6c8]">
                    {page.check}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => onSelect(page)}
                      className="ml-auto cursor-pointer text-[#aeb6c8] transition hover:text-white"
                      aria-label={`${page.path} detayını görüntüle`}
                    >
                      <Icon name="eye" className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="border-t border-white/8 p-4">
            <EmptyState text="Seçili sayfa kapsamı için sayfa sonucu bulunamadı." />
          </div>
        )}
      </div>
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-white/8 bg-[#080d18]/70 p-4 text-[13px] font-bold text-[#8f9aaf]">
      {text}
    </div>
  );
}

function RightPanel({
  note,
  savedNote,
  shareLink,
  scanInfoRows,
  onNoteChange,
  onSaveNote,
  onShare,
  onDownload,
  onRefresh,
  onArchive,
}: {
  note: string;
  savedNote: string;
  shareLink: string;
  scanInfoRows: ScanInfoRow[];
  onNoteChange: (value: string) => void;
  onSaveNote: () => void;
  onShare: () => void;
  onDownload: () => void;
  onRefresh: () => void;
  onArchive: () => void;
}) {
  return (
    <aside className="space-y-5 xl:sticky xl:top-20 xl:self-start">
      <section className="rounded-xl border border-white/9 bg-[#0d1423]/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <h2 className="text-[20px] font-extrabold tracking-[-0.04em]">
          Tarama Bilgileri
        </h2>
        <div className="mt-4 border-t border-white/8 pt-5">
          {scanInfoRows.map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-5 py-3 text-[14px] font-bold"
            >
              <span className="text-[#a5adbe]">{label}</span>
              <span className="text-right text-[#dbe1ee]">{value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-white/9 bg-[#0d1423]/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <h2 className="text-[20px] font-extrabold tracking-[-0.04em]">
          Rapor İşlemleri
        </h2>
        <div className="mt-4 border-t border-white/8 pt-5">
          <button
            type="button"
            onClick={onShare}
            className="flex min-h-16 w-full cursor-pointer items-center justify-center gap-3 rounded-lg bg-[#2f6df6] px-4 text-center text-[14px] font-extrabold text-white shadow-[0_12px_32px_rgba(47,109,246,0.25)] transition hover:bg-[#3b7aff]"
          >
            <Icon name="link" className="size-5" />
            <span>
              Paylaşılabilir Link
              <br />
              Oluştur
            </span>
          </button>

          {shareLink && (
            <p className="mt-3 break-all rounded-lg border border-white/8 bg-[#080d18]/70 p-3 text-[11px] font-bold text-[#9fa8bb]">
              {shareLink}
            </p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onDownload}
              className="h-9 cursor-pointer rounded-md border border-white/9 bg-[#080d18] text-[12px] font-extrabold text-[#c4cbda] transition hover:border-white/20 hover:bg-white/6"
            >
              ↓ İndir
            </button>
            <button
              type="button"
              onClick={onRefresh}
              className="h-9 cursor-pointer rounded-md border border-white/9 bg-[#080d18] text-[12px] font-extrabold text-[#c4cbda] transition hover:border-white/20 hover:bg-white/6"
            >
              ↻ Yenile
            </button>
          </div>

          <button
            type="button"
            onClick={onArchive}
            className="mt-2 h-9 w-full cursor-pointer rounded-md border border-[#713c3f] bg-[#211318] text-[12px] font-extrabold text-[#ff9a9f] transition hover:bg-[#32171d]"
          >
            ▣ Arşivle
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-white/9 bg-[#0d1423]/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <h2 className="text-[20px] font-extrabold tracking-[-0.04em]">
          Notlar
        </h2>
        <textarea
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder="Bu rapora özel not ekleyin..."
          className="mt-4 h-32 w-full resize-none rounded-lg border border-white/8 bg-[#080d18] p-4 text-[13px] font-medium text-white outline-none placeholder:text-[#697386] focus:border-[#8ea1e8]"
        />
        <button
          type="button"
          onClick={onSaveNote}
          className="mt-4 h-10 w-full cursor-pointer rounded-md bg-[#2f6df6] text-[14px] font-extrabold text-white transition hover:bg-[#3b7aff]"
        >
          Kaydet
        </button>

        {savedNote && (
          <p className="mt-3 rounded-lg border border-white/8 bg-[#080d18]/70 p-3 text-[12px] font-medium leading-5 text-[#aab3c5]">
            Kaydedilen not: {savedNote}
          </p>
        )}
      </section>
    </aside>
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
    <aside className="hidden w-52 shrink-0 border-r border-white/8 bg-[#0c111d]/92 lg:flex lg:flex-col">
      <div className="flex h-14.5 items-center gap-3 border-b border-white/[0.07] px-5">
        <div className="grid size-7 place-items-center rounded-md text-[#aebcff]">
          <Icon name="brand" className="size-6" />
        </div>
        <div>
          <p className="text-[16px] font-extrabold tracking-[-0.03em] text-[#aebcff]">
            Precheck AI
          </p>
          <p className="text-[11px] font-medium text-[#9ca4b6]">
            Enterprise Analytics
          </p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-7">
        <div className="space-y-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex h-9 cursor-pointer items-center gap-3 rounded-md px-3 text-[13px] font-bold transition ${
                item.active
                  ? "border border-[#8ea1e8] bg-white/8 text-[#dbe4ff]"
                  : "text-[#c2c8d6] hover:bg-white/6 hover:text-white"
              }`}
            >
              <Icon name={item.icon} className="size-4" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="px-4 py-5">
        <button
          type="button"
          onClick={onSupport}
          className="flex h-9 w-full cursor-pointer items-center gap-3 rounded-md px-3 text-[13px] font-bold text-[#c2c8d6] transition hover:bg-white/6 hover:text-white"
        >
          <Icon name="help" className="size-4" />
          Destek
        </button>
        <button
          type="button"
          onClick={onUpgrade}
          className="mt-3 h-8 w-full cursor-pointer rounded-md bg-[#2f6df6] text-[12px] font-extrabold text-white transition hover:bg-[#3b7aff]"
        >
          Yükselt
        </button>
      </div>
    </aside>
  );
}

function Topbar({
  workspaceOpen,
  onWorkspaceToggle,
  onWorkspaceClose,
  onSettings,
}: {
  workspaceOpen: boolean;
  onWorkspaceToggle: () => void;
  onWorkspaceClose: () => void;
  onSettings: () => void;
}) {
  return (
    <header className="flex h-14.5 items-center justify-between border-b border-white/8 bg-[#080d18]/75 px-5 backdrop-blur-xl">
      <nav className="hidden items-center gap-7 lg:flex">
        {topbarItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`cursor-pointer text-[12px] font-bold transition hover:text-white ${
              item.active ? "text-white" : "text-[#969faf]"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-4">
        <button
          type="button"
          className="cursor-pointer text-[#aab2c4] transition hover:text-white"
        >
          <Icon name="bell" className="size-5" />
        </button>

        <button
          type="button"
          onClick={onSettings}
          className="cursor-pointer text-[#aab2c4] transition hover:text-white"
        >
          <Icon name="settings" className="size-5" />
        </button>

        <div className="relative hidden md:block">
          <button
            type="button"
            onClick={onWorkspaceToggle}
            className="flex cursor-pointer items-center gap-2 rounded-md border border-white/8 bg-white/4 px-3 py-1.5 transition hover:bg-white/[0.07]"
          >
            <span className="grid size-5 place-items-center rounded bg-[#273047] text-[10px] font-extrabold text-[#c9d2e6]">
              AD
            </span>
            <div className="text-left">
              <p className="text-[11px] font-extrabold text-[#d8dce8]">
                Acme Dijital
              </p>
              <p className="text-[10px] font-medium text-[#858fa4]">
                Pro Workspace
              </p>
            </div>
            <span className="text-[#8b94a7]">⌄</span>
          </button>

          {workspaceOpen && (
            <div className="absolute top-12 right-0 z-40 w-47.5 rounded-lg border border-white/9 bg-[#0d1423] p-2 shadow-2xl">
              {["Acme Dijital", "Yeni Workspace", "Workspace Ayarları"].map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={onWorkspaceClose}
                    className="flex h-9 w-full cursor-pointer items-center rounded-md px-3 text-left text-[12px] font-bold text-[#b8c0d0] transition hover:bg-white/[0.07] hover:text-white"
                  >
                    {item}
                  </button>
                ),
              )}
            </div>
          )}
        </div>

        <div className="hidden items-center gap-3 border-l border-white/9 pl-4 md:flex">
          <div>
            <p className="text-right text-[12px] font-bold text-[#d8dce8]">
              A. Selim
            </p>
            <p className="text-right text-[10px] font-medium text-[#858fa4]">
              Admin
            </p>
          </div>
          <div className="grid size-7 place-items-center rounded-full bg-[#333a4a] text-[11px] font-bold text-[#cfd6e6]">
            AS
          </div>
        </div>
      </div>
    </header>
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
      className="fixed inset-0 z-50 flex cursor-pointer items-start justify-center overflow-y-auto bg-black/60 px-5 backdrop-blur-sm"
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

function ModalHeader({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
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

function InfoBox({
  label,
  title,
  text,
}: {
  label: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-[#080d18]/70 p-5">
      <p className="text-[12px] font-extrabold tracking-[0.08em] text-[#aebcff] uppercase">
        {label}
      </p>
      <h3 className="mt-2 text-[18px] font-extrabold">{title}</h3>
      <p className="mt-3 text-[14px] font-medium leading-6 text-[#aab3c5]">
        {text}
      </p>
    </div>
  );
}

function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/8 bg-[#080d18]/70 p-4">
      <p className="text-[11px] font-extrabold tracking-[0.08em] text-[#7f899d] uppercase">
        {label}
      </p>
      <p className="mt-2 wrap-break-word text-[14px] font-bold text-[#dce2ef]">
        {value}
      </p>
    </div>
  );
}

function normalizeReportPayload(
  payload: ScanReportPayload,
  fallbackScanId: string,
): ReportScanData {
  const scan = getScanRecord(payload);

  const id = getString(scan.id) ?? getString(scan.scanId) ?? fallbackScanId;

  const url =
    getString(scan.url) ??
    getString(scan.targetUrl) ??
    getString(scan.scanUrl) ??
    "";

  const activeModules = getActiveModules(scan);
  const showVitals = shouldShowVitalsForModules(activeModules);

  const status = normalizeScanStatus(getString(scan.status));
  const scores = buildScoreCards(scan, activeModules);

  const scoreNumbers = scores
    .map((item) => Number(item.value))
    .filter((value) => Number.isFinite(value));

  const overallScore =
    getNumber(scan.overallScore) ??
    getNumber(scan.score) ??
    getNumber(scan.healthScore) ??
    (scoreNumbers.length
      ? Math.round(
          scoreNumbers.reduce((total, value) => total + value, 0) /
            scoreNumbers.length,
        )
      : 0);

  const startedAtMs =
    getDateMs(scan.startedAt) ??
    getDateMs(scan.createdAt) ??
    getDateMs(scan.created_at);

  const completedAtMs =
    getDateMs(scan.completedAt) ??
    getDateMs(scan.updatedAt) ??
    getDateMs(scan.updated_at);

  const normalizedFindings = normalizeFindings(
    readArray(scan.findings) ??
      readArray(scan.issues) ??
      readArray(scan.problems) ??
      [],
  );

  const normalizedVitals = showVitals
    ? normalizeVitals(
        readArray(scan.vitals) ??
          readArray(scan.coreWebVitals) ??
          readArray(scan.webVitals) ??
          [],
      )
    : [];

  const normalizedPages = normalizePages(
    readArray(scan.pages) ??
      readArray(scan.pageResults) ??
      readArray(scan.scannedPages) ??
      [],
    completedAtMs ?? startedAtMs,
  );

  const normalizedSuggestions = normalizeSuggestions(
    readArray(scan.suggestions) ?? readArray(scan.recommendations) ?? [],
  );

  return {
    id,
    url,
    dateText: formatReportDate(completedAtMs ?? startedAtMs ?? Date.now()),
    status,
    scopeText: buildScopeText(scan),
    durationText: buildDurationText(scan, startedAtMs, completedAtMs),
    engineText: getString(scan.engine) ?? "Precheck Crawler v2",
    overallScore: clampNumber(overallScore, 0, 100),
    scoreCards: scores,
    findings: normalizedFindings,
    suggestions: normalizedSuggestions,
    vitals: normalizedVitals,
    pages: normalizedPages,
    activeModules,
    showVitals,
  };
}

function getScanRecord(payload: ScanReportPayload): Record<string, unknown> {
  if (payload.scan && typeof payload.scan === "object") return payload.scan;
  if (payload.data && typeof payload.data === "object") return payload.data;

  return payload;
}

function buildScoreCards(
  scan: Record<string, unknown>,
  activeModules: ModuleKey[],
): ScoreCardItem[] {
  const rawScores = toRecord(scan.scores);

  const scoreMap = {
    performance:
      getNumber(rawScores.performance) ??
      getNumber(rawScores.performans) ??
      getNumber(scan.performanceScore),
    seo: getNumber(rawScores.seo) ?? getNumber(scan.seoScore),
    accessibility:
      getNumber(rawScores.accessibility) ??
      getNumber(rawScores["erişilebilirlik"]) ??
      getNumber(scan.accessibilityScore),
    ux:
      getNumber(rawScores.ux) ??
      getNumber(rawScores.responsive) ??
      getNumber(scan.uxScore),
    security:
      getNumber(rawScores.security) ??
      getNumber(rawScores["güvenlik"]) ??
      getNumber(scan.securityScore),
  };

  const createValue = (value: number | null) => {
    if (value === null) return "—";

    return String(clampNumber(value, 0, 100));
  };

  const allCards: ScoreCardItem[] = [
    {
      ...scoreCardTemplates[0],
      value: createValue(scoreMap.performance),
      active: Boolean(
        scoreMap.performance !== null && scoreMap.performance >= 90,
      ),
    },
    {
      ...scoreCardTemplates[1],
      value: createValue(scoreMap.seo),
      active: Boolean(scoreMap.seo !== null && scoreMap.seo >= 90),
    },
    {
      ...scoreCardTemplates[2],
      value: createValue(scoreMap.accessibility),
      active: Boolean(
        scoreMap.accessibility !== null && scoreMap.accessibility >= 90,
      ),
    },
    {
      ...scoreCardTemplates[3],
      value: createValue(scoreMap.ux),
      active: Boolean(scoreMap.ux !== null && scoreMap.ux >= 90),
    },
    {
      ...scoreCardTemplates[4],
      value: createValue(scoreMap.security),
      active: Boolean(scoreMap.security !== null && scoreMap.security >= 90),
    },
  ];

  if (!activeModules.length) return allCards;

  return allCards.filter((card) => {
    const key = getScoreCardModuleKey(card.title);

    if (key === "performance") return activeModules.includes("performance");
    if (key === "seo") return activeModules.includes("seo");
    if (key === "accessibility") return activeModules.includes("accessibility");
    if (key === "security") return activeModules.includes("security");

    if (key === "ux") {
      return (
        activeModules.includes("ux") ||
        activeModules.includes("responsive") ||
        activeModules.includes("interaction") ||
        activeModules.includes("visual") ||
        activeModules.includes("forms")
      );
    }

    return false;
  });
}
function normalizeFindings(rawFindings: unknown[]): Finding[] {
  return rawFindings.map((item) => {
    if (typeof item === "string") {
      return {
        title: item,
        desc: "Tarama sırasında tespit edildi.",
        level: "ORTA",
        icon: "warning",
        tone: "orange",
        solution:
          "Bu bulguyu ilgili sayfa veya modül üzerinde inceleyip önerilen düzeltmeyi uygulayın.",
        causes: [],
        evidence: [],
        affectedViewports: [],
        affectedPages: [],
        affectedCount: 0,
      };
    }

    const record = toRecord(item);
    const severity =
      getString(record.severity) ??
      getString(record.level) ??
      getString(record.priority) ??
      "medium";

    const tone = getFindingTone(severity);
    const affectedPages = parseAffectedPages(record.affectedPages);

    return {
      title:
        getString(record.title) ??
        getString(record.name) ??
        getString(record.rule) ??
        "Tespit edilen bulgu",
      desc:
        getString(record.desc) ??
        getString(record.description) ??
        getString(record.message) ??
        "Tarama sırasında iyileştirme gerektiren bir alan tespit edildi.",
      level: getFindingLevel(severity),
      icon: getString(record.icon) ?? (tone === "red" ? "warning" : "timer"),
      tone,
      solution:
        getString(record.solution) ??
        getString(record.recommendation) ??
        getString(record.fix) ??
        "Bu bulguya bağlı dosya, sayfa veya komponenti kontrol ederek rapordaki önerileri uygulayın.",
      causes: parseStringArrayValue(record.causes),
      evidence: parseStringArrayValue(record.evidence),
      affectedViewports: parseStringArrayValue(record.affectedViewports),
      affectedPages,
      affectedCount: getNumber(record.affectedCount) ?? affectedPages.length,
    };
  });
}

function normalizeSuggestions(rawSuggestions: unknown[]): Suggestion[] {
  return rawSuggestions.map((item) => {
    if (typeof item === "string") {
      return {
        title: item,
        desc: "Tarama sonucuna göre önerilen iyileştirme.",
        impact: "Orta",
        actions: [
          "İlgili modülü kontrol edin.",
          "Değişiklik sonrası tekrar analiz çalıştırın.",
        ],
      };
    }

    const record = toRecord(item);
    const rawActions = readArray(record.actions);

    return {
      title:
        getString(record.title) ?? getString(record.name) ?? "Çözüm önerisi",
      desc:
        getString(record.desc) ??
        getString(record.description) ??
        getString(record.message) ??
        "Tarama sonucuna göre önerilen iyileştirme.",
      impact: getString(record.impact) ?? getString(record.priority) ?? "Orta",
      actions: rawActions?.map((action) => String(action)) ?? [
        "İlgili alanı kontrol edin.",
        "Düzeltmeden sonra yeniden analiz edin.",
      ],
    };
  });
}

function normalizeVitals(rawVitals: unknown[]): Vital[] {
  return rawVitals.map((item) => {
    if (typeof item === "string") {
      return {
        metric: item,
        value: "-",
        status: "Bilgi yok",
        avg: "-",
        trend: "→ Sabit",
        tone: "orange",
        width: "50%",
      };
    }

    const record = toRecord(item);

    const status =
      getString(record.status) ?? getString(record.rating) ?? "İyileştirilmeli";

    const rawTone = getString(record.tone)?.toLowerCase();

    const tone: Vital["tone"] =
      rawTone === "green" || rawTone === "orange"
        ? rawTone
        : isGoodStatus(status)
          ? "green"
          : "orange";

    return {
      metric:
        getString(record.metric) ??
        getString(record.name) ??
        getString(record.title) ??
        "Core Web Vital",
      value:
        getString(record.value) ??
        getString(record.ours) ??
        getString(record.current) ??
        "-",
      status,
      avg:
        getString(record.avg) ??
        getString(record.average) ??
        getString(record.industryAverage) ??
        "-",
      trend:
        getString(record.trend) ?? (tone === "green" ? "↘ İyi" : "↗ Dikkat"),
      tone,
      width:
        getString(record.width) ??
        `${clampNumber(
          getNumber(record.score) ?? (tone === "green" ? 82 : 58),
          0,
          100,
        )}%`,
    };
  });
}

function normalizePages(
  rawPages: unknown[],
  fallbackDateMs?: number | null,
): PageRow[] {
  return rawPages.map((item, index) => {
    if (typeof item === "string") {
      return {
        path: item,
        score: "85",
        critical: "—",
        warning: "1 Uyarı",
        check: formatReportDate(fallbackDateMs ?? Date.now()),
      };
    }

    const record = toRecord(item);
    const criticalCount =
      getNumber(record.critical) ??
      getNumber(record.criticalCount) ??
      getNumber(record.criticalIssues) ??
      0;

    const warningCount =
      getNumber(record.warning) ??
      getNumber(record.warningCount) ??
      getNumber(record.warnings) ??
      0;

    return {
      path:
        getString(record.path) ??
        getString(record.url) ??
        getString(record.page) ??
        `/sayfa-${index + 1}`,
      score: String(
        clampNumber(
          getNumber(record.score) ?? getNumber(record.healthScore) ?? 85,
          0,
          100,
        ),
      ),
      critical: criticalCount > 0 ? `${criticalCount} Kritik` : "—",
      warning: warningCount > 0 ? `${warningCount} Uyarı` : "—",
      check:
        getString(record.check) ??
        getString(record.checkedAt) ??
        getString(record.lastChecked) ??
        formatReportDate(fallbackDateMs ?? Date.now()),
    };
  });
}

function buildScopeText(scan: Record<string, unknown>) {
  const scopeType =
    getString(scan.scopeType) ??
    getString(scan.scope) ??
    getString(scan.pageScope) ??
    "Standart Tarama";

  const crawlDepth =
    getString(scan.crawlDepth) ??
    getString(scan.depth) ??
    getString(scan.crawl_depth);

  if (!crawlDepth) return scopeType;

  return `${scopeType} / ${crawlDepth}`;
}

function buildDurationText(
  scan: Record<string, unknown>,
  startedAtMs?: number | null,
  completedAtMs?: number | null,
) {
  const duration =
    getString(scan.duration) ??
    getString(scan.durationText) ??
    getString(scan.elapsed);

  if (duration) return duration;

  if (startedAtMs && completedAtMs && completedAtMs > startedAtMs) {
    return formatElapsed(Math.floor((completedAtMs - startedAtMs) / 1000));
  }

  return "Hesaplanıyor";
}

function normalizeScanStatus(value?: string | null): ScanStatus {
  const status = value?.toLowerCase();

  if (status === "queued" || status === "pending" || status === "waiting") {
    return "queued";
  }

  if (status === "completed" || status === "done" || status === "success") {
    return "completed";
  }

  if (status === "cancelled" || status === "canceled") {
    return "cancelled";
  }

  if (status === "failed" || status === "error") {
    return "failed";
  }

  return "running";
}

function getScanStatusLabel(status: ScanStatus) {
  if (status === "completed") return "Tamamlandı";
  if (status === "cancelled") return "İptal Edildi";
  if (status === "failed") return "Hata";
  if (status === "queued") return "Sırada";

  return "Devam Ediyor";
}

function getOverallScoreLabel(score: number) {
  if (score >= 90) return "HARİKA";
  if (score >= 75) return "İYİ";
  if (score >= 55) return "GELİŞTİRİLMELİ";

  return "KRİTİK";
}

function getActiveModules(scan: Record<string, unknown>): ModuleKey[] {
  const rawModules =
    readArray(scan.selectedModules) ??
    readArray(scan.enabledModules) ??
    readArray(scan.modules) ??
    [];

  const modules = rawModules
    .map((item) => {
      if (typeof item === "string") return normalizeModuleKey(item);

      const record = toRecord(item);

      if (record.enabled === false) return null;

      return normalizeModuleKey(
        getString(record.id) ??
          getString(record.value) ??
          getString(record.key) ??
          getString(record.label) ??
          getString(record.title) ??
          getString(record.name) ??
          "",
      );
    })
    .filter((item): item is ModuleKey => Boolean(item));

  return Array.from(new Set(modules));
}

function normalizeModuleKey(value: string): ModuleKey | null {
  const normalized = normalizeText(value);

  if (
    normalized.includes("performance") ||
    normalized.includes("performans") ||
    normalized.includes("speed") ||
    normalized.includes("core web") ||
    normalized.includes("vitals")
  ) {
    return "performance";
  }

  if (
    normalized.includes("seo") ||
    normalized.includes("meta") ||
    normalized.includes("search")
  ) {
    return "seo";
  }

  if (
    normalized.includes("accessibility") ||
    normalized.includes("erisilebilirlik") ||
    normalized.includes("a11y")
  ) {
    return "accessibility";
  }

  if (normalized.includes("security") || normalized.includes("guvenlik")) {
    return "security";
  }

  if (
    normalized.includes("responsive") ||
    normalized.includes("mobil") ||
    normalized.includes("mobile") ||
    normalized.includes("breakpoint")
  ) {
    return "responsive";
  }

  if (
    normalized.includes("interaction") ||
    normalized.includes("etkilesim") ||
    normalized.includes("click") ||
    normalized.includes("hover")
  ) {
    return "interaction";
  }

  if (
    normalized.includes("visual") ||
    normalized.includes("gorsel") ||
    normalized.includes("image")
  ) {
    return "visual";
  }

  if (
    normalized.includes("form") ||
    normalized.includes("input") ||
    normalized.includes("validation")
  ) {
    return "forms";
  }

  if (
    normalized.includes("ux") ||
    normalized.includes("ui") ||
    normalized.includes("user experience") ||
    normalized.includes("kullanici")
  ) {
    return "ux";
  }

  return null;
}

function shouldShowVitalsForModules(activeModules: ModuleKey[]) {
  return activeModules.length === 0 || activeModules.includes("performance");
}

function getScoreCardModuleKey(title: string) {
  const normalized = normalizeText(title);

  if (normalized.includes("performance")) return "performance";
  if (normalized.includes("seo")) return "seo";
  if (normalized.includes("erisilebilirlik")) return "accessibility";
  if (normalized.includes("guvenlik")) return "security";
  if (normalized.includes("ux")) return "ux";

  return "unknown";
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replaceAll("ı", "i")
    .replaceAll("İ", "i")
    .replaceAll("i̇", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .trim();
}

function getFindingTone(severity: string): FindingTone {
  const level = severity.toLowerCase();

  if (
    level.includes("critical") ||
    level.includes("high") ||
    level.includes("kritik") ||
    level.includes("yüksek") ||
    level.includes("yuksek")
  ) {
    return "red";
  }

  return "orange";
}

function getFindingLevel(severity: string) {
  const level = severity.toLowerCase();

  if (level.includes("critical") || level.includes("kritik")) return "KRİTİK";
  if (
    level.includes("high") ||
    level.includes("yüksek") ||
    level.includes("yuksek")
  ) {
    return "YÜKSEK";
  }
  if (level.includes("medium") || level.includes("orta")) return "ORTA";
  if (
    level.includes("low") ||
    level.includes("düşük") ||
    level.includes("dusuk")
  ) {
    return "DÜŞÜK";
  }

  return "ORTA";
}

function isGoodStatus(status: string) {
  const value = status
    .toLowerCase()
    .replaceAll("ı", "i")
    .replaceAll("İ", "i")
    .replaceAll("i̇", "i")
    .trim();

  return (
    value === "iyi" ||
    value === "good" ||
    value === "passed" ||
    value === "başarılı" ||
    value === "basarili"
  );
}

function readArray(value: unknown): unknown[] | null {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  return null;
}

function toRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object") {
    return value as Record<string, unknown>;
  }

  return {};
}

function getString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function getNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getDateMs(value: unknown): number | null {
  if (typeof value !== "string" && typeof value !== "number") return null;

  const date = new Date(value);
  const time = date.getTime();

  return Number.isFinite(time) ? time : null;
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function formatReportDate(value: number) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatElapsed(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}`;
}

function Icon({ name, className = "" }: { name: string; className?: string }) {
  const paths: Record<string, ReactNode> = {
    brand: <path d="M4 16 9 9l4 4 7-9M4 20h16" />,
    grid: <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />,
    search: <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4" />,
    live: (
      <path d="M4 12a8 8 0 0 1 4-6.9M20 12a8 8 0 0 0-4-6.9M8 12a4 4 0 0 1 2-3.5M16 12a4 4 0 0 0-2-3.5M12 13h.01" />
    ),
    history: <path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.6M4 4v4.6h4.6M12 8v5l3 2" />,
    file: <path d="M6 3h9l4 4v14H6V3ZM14 3v5h5M9 13h6M9 17h6" />,
    team: (
      <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 20a5 5 0 0 1 10 0M11 20a5 5 0 0 1 10 0" />
    ),
    settings: (
      <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM4 12h2M18 12h2M12 4v2M12 18v2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4" />
    ),
    help: (
      <path d="M12 18h.01M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-.9.8-1.7 1.4-1.7 3.2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />
    ),
    bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />,
    download: <path d="M12 3v12M8 11l4 4 4-4M5 20h14" />,
    refresh: (
      <path d="M4 12a8 8 0 0 1 13.6-5.6L20 9M20 4v5h-5M20 12a8 8 0 0 1-13.6 5.6L4 15M4 20v-5h5" />
    ),
    calendar: (
      <path d="M7 3v4M17 3v4M4 8h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" />
    ),
    external: <path d="M14 4h6v6M20 4l-9 9M20 14v6H4V4h6" />,
    speed: <path d="M4 14a8 8 0 1 1 16 0M12 14l4-4M9 18h6" />,
    accessibility: (
      <path d="M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM4 8h16M12 8v13M8 21l4-8 4 8" />
    ),
    flow: (
      <path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01M7 7h10M7 7v10M17 7v10M7 17h10" />
    ),
    shield: (
      <path d="M12 3 5 6v6c0 4.5 2.9 7.7 7 9 4.1-1.3 7-4.5 7-9V6l-7-3Z" />
    ),
    warning: <path d="M12 4 21 20H3L12 4ZM12 9v5M12 17h.01" />,
    mobile: <path d="M9 2h6v20H9zM12 18h.01" />,
    timer: <path d="M12 8v5l3 2M9 2h6M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />,
    code: <path d="m8 9-4 3 4 3M16 9l4 3-4 3" />,
    image: <path d="M4 5h16v14H4zM8 13l2-2 3 3 2-2 3 4M8 9h.01" />,
    eye: (
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    ),
    link: (
      <path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1" />
    ),
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

function parseAffectedPages(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }

  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((item) => String(item));
  } catch {
    return [];
  }
}

function parseStringArrayValue(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }

  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((item) => String(item));
  } catch {
    return [];
  }
}
