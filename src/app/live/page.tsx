"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type ScanStatus = "queued" | "running" | "completed" | "cancelled" | "failed";

type ModuleStatus = "queued" | "running" | "completed" | "cancelled" | "failed";

type LogItem = {
  time: string;
  icon: string;
  text: string;
  active?: boolean;
  success?: boolean;
  warning?: boolean;
};

type FindingItem = {
  title: string;
  desc: string;
  level: string;
  tone: "red" | "orange" | "yellow";
  icon: string;
  solution: string;
};

type ModuleProgressItem = {
  title: string;
  icon: string;
  status: ModuleStatus;
  active?: boolean;
};

type NormalizedScan = {
  id: string;
  url: string;
  status: ScanStatus;
  progress: number;
  logs: LogItem[];
  findings: FindingItem[];
  modules: ModuleProgressItem[];
  startedAtMs: number | null;
  totalTests: number;
  completedTests: number;
  scopeText: string;
  devicesText: string;
  moduleSummary: string;
};

type ScanApiPayload = {
  scan?: Record<string, unknown>;
  data?: Record<string, unknown>;
} & Record<string, unknown>;

const sidebarItems = [
  { label: "Genel Bakış", href: "/dashboard", icon: "grid" },
  { label: "Yeni Tarama", href: "/scanner", icon: "scan" },
  { label: "Canlı İzleme", href: "/live", icon: "live", active: true },
  { label: "Analiz Geçmişi", href: "/history", icon: "history" },
  { label: "Raporlar", href: "/report", icon: "chart" },
  { label: "Takım", href: "/settings", icon: "team" },
  { label: "Ayarlar", href: "/settings", icon: "settings" },
];

const defaultModuleTitles = [
  "Performans",
  "Responsive QA",
  "SEO",
  "Erişilebilirlik",
  "Interaction QA",
  "Security Basics",
  "Görsel QA",
  "Form Kontrolleri",
];

function getInitialScanUrl() {
  if (typeof window === "undefined") return "https://orneksite.com";

  return (
    new URLSearchParams(window.location.search).get("url") ??
    "https://orneksite.com"
  );
}

function getInitialScanId() {
  if (typeof window === "undefined") return "";

  const params = new URLSearchParams(window.location.search);

  const queryScanId =
    params.get("scanId") ??
    params.get("jobId") ??
    params.get("id");

  if (queryScanId) return queryScanId;

  return window.localStorage.getItem("precheck:lastScanId") ?? "";
}

export default function LivePage() {
  const router = useRouter();
  const logListRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef(false);
  const redirectStartedRef = useRef(false);
  const redirectTimerRef = useRef<number | null>(null);

  const [scanUrl, setScanUrl] = useState(getInitialScanUrl);
  const [scanId] = useState(getInitialScanId);
  const [progress, setProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startedAtMs, setStartedAtMs] = useState<number | null>(null);
  const [scanStatus, setScanStatus] = useState<ScanStatus>("queued");
  const [autoScroll, setAutoScroll] = useState(true);
  const [logs, setLogs] = useState<LogItem[]>([
    {
      time: getCurrentTime(),
      icon: "refresh",
      text: "Canlı tarama verisi bekleniyor.",
      active: true,
    },
  ]);
  const [findings, setFindings] = useState<FindingItem[]>([]);
  const [moduleRows, setModuleRows] = useState<ModuleProgressItem[]>(
    buildModuleRows({
      apiModules: [],
      selectedModules: defaultModuleTitles,
      progress: 0,
      status: "queued",
    }),
  );
  const [totalTests, setTotalTests] = useState(262);
  const [completedTests, setCompletedTests] = useState(0);
  const [scopeText, setScopeText] = useState("Standart Tarama");
  const [devicesText, setDevicesText] = useState("Seçilen ekran boyutları");
  const [moduleSummary, setModuleSummary] = useState("Performans, SEO, QA");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLocalCancelled, setIsLocalCancelled] = useState(false);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<FindingItem | null>(
    null,
  );

  const siteHost = useMemo(() => {
    try {
      return new URL(scanUrl).hostname.replace(/^www\./, "");
    } catch {
      return "orneksite.com";
    }
  }, [scanUrl]);

  const completedModuleCount = moduleRows.filter(
    (item) => item.status === "completed",
  ).length;

  const remainingModules =
    scanStatus === "completed"
      ? 0
      : scanStatus === "cancelled" || scanStatus === "failed"
        ? Math.max(0, moduleRows.length - completedModuleCount)
        : Math.max(0, moduleRows.length - completedModuleCount);

  const remainingTime = getRemainingTimeText({
    status: scanStatus,
    progress,
    elapsedSeconds,
  });

  const statusText =
    scanStatus === "completed"
      ? "RAPOR HAZIR"
      : scanStatus === "cancelled"
        ? "TARAMA İPTAL EDİLDİ"
        : scanStatus === "failed"
          ? "TARAMA HATASI"
          : scanStatus === "queued"
            ? "SIRADA BEKLİYOR"
            : "CANLI ANALİZ";

  const statusColor =
    scanStatus === "completed"
      ? "text-[#25d18c]"
      : scanStatus === "cancelled" || scanStatus === "failed"
        ? "text-[#ff666d]"
        : scanStatus === "queued"
          ? "text-[#f0a020]"
          : "text-[#25d18c]";

  useEffect(() => {
    if (!scanId) {
      setIsInitialLoading(false);
      setScanStatus("failed");
      setApiError(
        "Canlı izleme başlatılamadı. URL içinde geçerli bir scanId bulunamadı.",
      );
      setLogs([
        {
          time: getCurrentTime(),
          icon: "alert",
          text: "scanId bulunamadı. Yeni bir tarama başlatın.",
          warning: true,
          active: true,
        },
      ]);
      return;
    }

    if (isLocalCancelled) return;

    let isMounted = true;
    let intervalId: number | null = null;

    const fetchScan = async () => {
      if (isFetchingRef.current || redirectStartedRef.current) return;

      isFetchingRef.current = true;

      try {
        const response = await fetch(`/api/scans/${encodeURIComponent(scanId)}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Bu scanId için tarama kaydı bulunamadı.");
          }

          throw new Error("Tarama durumu alınırken bir hata oluştu.");
        }

        const payload = (await response.json()) as ScanApiPayload;
        const normalizedScan = normalizeScanPayload(payload, scanId);

        if (!isMounted) return;

        setApiError(null);
        setScanUrl(normalizedScan.url);
        setProgress(normalizedScan.progress);
        setScanStatus(normalizedScan.status);
        setLogs(normalizedScan.logs);
        setFindings(normalizedScan.findings);
        setModuleRows(normalizedScan.modules);
        setTotalTests(normalizedScan.totalTests);
        setCompletedTests(normalizedScan.completedTests);
        setScopeText(normalizedScan.scopeText);
        setDevicesText(normalizedScan.devicesText);
        setModuleSummary(normalizedScan.moduleSummary);

        setStartedAtMs((current) => {
          return normalizedScan.startedAtMs ?? current ?? Date.now();
        });

        setIsInitialLoading(false);

        const isCompleted =
          normalizedScan.status === "completed" ||
          normalizedScan.progress >= 100;

        if (isCompleted && !redirectStartedRef.current) {
          redirectStartedRef.current = true;

          if (intervalId) {
            window.clearInterval(intervalId);
          }

          redirectTimerRef.current = window.setTimeout(() => {
            router.replace(
              `/report?scanId=${encodeURIComponent(normalizedScan.id)}`,
            );
          }, 700);
        }
      } catch (error) {
        if (!isMounted) return;

        const message =
          error instanceof Error
            ? error.message
            : "Tarama durumu alınırken bilinmeyen bir hata oluştu.";

        setApiError(message);
        setIsInitialLoading(false);

        setLogs((currentLogs) => [
          {
            time: getCurrentTime(),
            icon: "alert",
            text: message,
            warning: true,
            active: true,
          },
          ...currentLogs.map((log) => ({ ...log, active: false })),
        ]);
      } finally {
        isFetchingRef.current = false;
      }
    };

    void fetchScan();

    intervalId = window.setInterval(() => {
      void fetchScan();
    }, 1500);

    return () => {
      isMounted = false;

      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [scanId, router, isLocalCancelled]);

  useEffect(() => {
    if (!startedAtMs) return;

    const updateElapsedTime = () => {
      setElapsedSeconds(
        Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000)),
      );
    };

    updateElapsedTime();

    if (
      scanStatus === "completed" ||
      scanStatus === "cancelled" ||
      scanStatus === "failed"
    ) {
      return;
    }

    const intervalId = window.setInterval(updateElapsedTime, 1000);

    return () => window.clearInterval(intervalId);
  }, [startedAtMs, scanStatus]);

  useEffect(() => {
    if (!autoScroll) return;

    logListRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [logs, autoScroll]);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        window.clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const handleCancelScan = () => {
    setIsLocalCancelled(true);
    setScanStatus("cancelled");
    setIsCancelOpen(false);
    setLogs((currentLogs) => [
      {
        time: getCurrentTime(),
        icon: "alert",
        text: "Tarama kullanıcı tarafından iptal edildi.",
        warning: true,
        active: true,
      },
      ...currentLogs.map((log) => ({ ...log, active: false })),
    ]);
  };

  const handleRunInBackground = () => {
    router.push("/dashboard");
  };

  const handleGoReport = () => {
    router.push(`/report?scanId=${encodeURIComponent(scanId)}`);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#070b15] text-[#e7e9f4]">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-size-[32px_32px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_35%_0%,rgba(64,102,255,0.13),transparent_34%),linear-gradient(180deg,rgba(8,13,24,0.1),#070b15_85%)]" />

      <div className="relative z-10 flex min-h-screen">
        <Sidebar />

        <section className="min-w-0 flex-1 pb-18.5">
          <Topbar />

          <div className="mx-auto grid max-w-[1600px] gap-6 px-6 py-9 xl:grid-cols-[1fr_290px]">
            <div className="min-w-0">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <h1 className="text-[28px] font-extrabold tracking-[-0.04em] text-[#e9ecf6]">
                    Canlı İzleme
                  </h1>
                  <p className="mt-2 text-[15px] font-medium text-[#b5bdcc]">
                    Taramanın ilerleyişini gerçek zamanlı olarak takip edin.
                  </p>
                </div>

                <div className="hidden items-center gap-3 lg:flex">
                  {scanStatus === "completed" && (
                    <button
                      type="button"
                      onClick={handleGoReport}
                      className="h-10 rounded-md bg-[#2f6df6] px-5 text-[13px] font-extrabold text-white transition hover:bg-[#3b7aff]"
                    >
                      Raporu Görüntüle
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsDetailsOpen(true)}
                    className="h-10 items-center gap-2 rounded-md border border-white/12 bg-[#111827]/70 px-5 text-[13px] font-bold text-[#c4cad8] transition hover:border-white/25 hover:bg-white/6 lg:inline-flex"
                  >
                    <Icon name="eye" className="size-4" />
                    Tarama Ayrıntılarını Görüntüle
                  </button>
                </div>
              </div>

              {apiError && (
                <div className="mt-6 rounded-xl border border-[#7c3539] bg-[#2a1418]/80 p-4 text-[14px] font-bold leading-6 text-[#ff9a9f]">
                  {apiError}
                </div>
              )}

              <section className="mt-7 overflow-hidden rounded-xl border border-white/9 bg-[#0d1423]/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <div className="grid lg:grid-cols-[300px_1fr]">
                  <div className="border-b border-white/8 p-9 lg:border-b-0 lg:border-r">
                    <div className="flex items-center gap-4">
                      <Icon name="globe" className="size-6 text-[#c7d2ff]" />
                      <div>
                        <h2 className="text-[23px] font-extrabold tracking-[-0.04em]">
                          {siteHost}
                        </h2>
                        <p className="mt-1 break-all text-[14px] font-bold text-[#aebcff]">
                          {scanUrl}
                        </p>
                      </div>
                    </div>

                    <div className="mt-11 flex justify-center">
                      <div
                        className="relative grid size-47.5 place-items-center rounded-full"
                        style={{
                          background: `conic-gradient(#2f6df6 0 ${progress}%, #202a3c ${progress}% 100%)`,
                        }}
                      >
                        <div className="grid size-35 place-items-center rounded-full bg-[#0d1423]">
                          <span className="text-[42px] font-extrabold tracking-[-0.06em]">
                            {isInitialLoading ? "..." : `${progress}%`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`mt-9 flex items-center justify-center gap-2 text-[14px] font-extrabold ${statusColor}`}
                    >
                      <span
                        className={`size-2 rounded-full ${
                          scanStatus === "cancelled" || scanStatus === "failed"
                            ? "bg-[#ff666d]"
                            : scanStatus === "queued"
                              ? "bg-[#f0a020]"
                              : "bg-[#25d18c]"
                        }`}
                      />
                      {statusText}
                    </div>

                    <div className="mt-9 border-t border-white/6 pt-7">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <MetaItem
                          title="Başlangıç"
                          value={startedAtMs ? formatClock(startedAtMs) : "--:--"}
                        />
                        <MetaItem
                          title="Geçen Süre"
                          value={formatElapsed(elapsedSeconds)}
                        />
                        <MetaItem
                          title="Tarama ID"
                          value={scanId ? scanId.slice(0, 7) + "..." : "-"}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex h-14.5 items-center justify-between border-b border-white/8 bg-white/[0.035] px-6">
                      <h3 className="flex items-center gap-2 text-[15px] font-extrabold text-[#cdd3df]">
                        <Icon
                          name="terminal"
                          className="size-4 text-[#aebcff]"
                        />
                        Canlı İşlem Günlüğü
                      </h3>

                      <div className="flex items-center gap-3">
                        <span
                          className={`size-2 rounded-full ${
                            autoScroll ? "bg-[#25d18c]" : "bg-[#777f90]"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setAutoScroll((current) => !current)}
                          className="rounded-md border border-white/8 bg-[#111827] px-2 py-1 text-[11px] font-bold text-[#9aa4b7] transition hover:border-white/20 hover:text-white"
                        >
                          Oto-kaydır: {autoScroll ? "Açık" : "Kapalı"}
                        </button>
                      </div>
                    </div>

                    <div
                      ref={logListRef}
                      className="max-h-107.5 space-y-3 overflow-y-auto p-7"
                    >
                      {logs.map((log, index) => (
                        <div
                          key={`${log.time}-${log.text}-${index}`}
                          className={`grid grid-cols-[86px_28px_1fr] rounded-lg px-3 py-3 ${
                            log.active
                              ? "border border-[#4d5f92] bg-[#25304a]/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                              : ""
                          }`}
                        >
                          <span className="pt-0.5 font-mono text-[13px] font-bold text-[#737d91]">
                            {log.time}
                          </span>
                          <Icon
                            name={log.icon}
                            className={`size-4 ${
                              log.success
                                ? "text-[#25d18c]"
                                : log.warning
                                  ? "text-[#f0a020]"
                                  : "text-[#aebcff]"
                            }`}
                          />
                          <p className="font-mono text-[13px] font-bold leading-5 text-[#b9c0d0]">
                            {log.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <section className="rounded-xl border border-white/9 bg-[#0d1423]/88 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <div className="flex items-center justify-between border-b border-white/8 pb-5">
                    <h2 className="text-[17px] font-extrabold">
                      Anlık Bulgular
                    </h2>
                    <span className="rounded-full bg-white/16 px-3 py-1 text-[11px] font-bold text-[#aeb6c7]">
                      {findings.length} Bulgu
                    </span>
                  </div>

                  <div className="mt-5 space-y-4">
                    {findings.length > 0 ? (
                      findings.slice(0, 5).map((item) => (
                        <FindingCard
                          key={`${item.title}-${item.desc}`}
                          {...item}
                          onClick={() => setSelectedFinding(item)}
                        />
                      ))
                    ) : (
                      <EmptyState
                        icon="info"
                        title="Henüz bulgu yok"
                        desc="Tarama ilerledikçe tespit edilen sorunlar burada görünecek."
                      />
                    )}
                  </div>
                </section>

                <section className="rounded-xl border border-white/9 bg-[#0d1423]/88 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <div className="flex items-center justify-between border-b border-white/8 pb-5">
                    <h2 className="text-[17px] font-extrabold">
                      Tamamlanan Modüller
                    </h2>
                    <span className="rounded-full bg-white/16 px-3 py-1 text-[11px] font-bold text-[#aeb6c7]">
                      {completedModuleCount}/{moduleRows.length}
                    </span>
                  </div>

                  <div className="mt-5 space-y-4">
                    {moduleRows.filter((item) => item.status === "completed")
                      .length > 0 ? (
                      moduleRows
                        .filter((item) => item.status === "completed")
                        .map((item) => (
                          <button
                            key={item.title}
                            type="button"
                            onClick={() => setIsDetailsOpen(true)}
                            className="flex min-h-17.5 w-full items-center justify-between gap-4 rounded-lg border border-white/6 bg-[#111827]/75 px-5 text-left transition hover:border-white/15 hover:bg-white/6"
                          >
                            <div className="flex items-center gap-4">
                              <Icon
                                name={item.icon}
                                className="size-5 text-[#aeb6c8]"
                              />
                              <p className="max-w-42.5 text-[15px] font-extrabold leading-5 text-[#cfd5e2]">
                                {item.title}
                              </p>
                            </div>
                            <span className="rounded-md border border-[#14624d] bg-[#0d372e] px-3 py-1 text-[11px] font-extrabold text-[#22d296]">
                              ✓ Tamamlandı
                            </span>
                          </button>
                        ))
                    ) : (
                      <EmptyState
                        icon="hourglass"
                        title="Modül tamamlanmadı"
                        desc="İlk modül tamamlandığında burada listelenecek."
                      />
                    )}
                  </div>
                </section>
              </div>

              <section className="mt-6 rounded-xl border border-white/9 bg-[#0d1423]/88 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <h2 className="text-[16px] font-extrabold">
                  Devam Eden & Bekleyen Modüller
                </h2>
                <div className="mt-5 border-t border-white/8 pt-5">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {moduleRows
                      .filter((item) => item.status !== "completed")
                      .map((item) => {
                        const isCompleted = scanStatus === "completed";
                        const isCancelled = scanStatus === "cancelled";
                        const isFailed = scanStatus === "failed";
                        const isActive =
                          item.status === "running" &&
                          !isCompleted &&
                          !isCancelled &&
                          !isFailed;

                        return (
                          <div
                            key={item.title}
                            className={`flex min-h-24 flex-col justify-center rounded-lg border px-5 text-center ${
                              isActive
                                ? "border-[#6678b7] bg-white/6"
                                : "border-white/6 bg-[#080d18]/65 opacity-65"
                            }`}
                          >
                            <div className="mx-auto mb-3">
                              {isActive ? (
                                <span className="block size-2 rounded-full bg-[#b8c7ff]" />
                              ) : (
                                <Icon
                                  name={
                                    isCompleted
                                      ? "check"
                                      : isFailed
                                        ? "alert"
                                        : "hourglass"
                                  }
                                  className="size-5 text-[#9aa4b8]"
                                />
                              )}
                            </div>
                            <p className="text-[14px] font-extrabold leading-4 text-[#d3d8e6]">
                              {item.title}
                            </p>
                            <p className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#8f9bba]">
                              {getModuleStatusLabel(item.status, scanStatus)}
                            </p>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </section>
            </div>

            <RightPanel
              completedTests={completedTests}
              totalTests={totalTests}
              progress={progress}
              remainingModules={remainingModules}
              remainingTime={remainingTime}
              scanStatus={scanStatus}
            />
          </div>

          <BottomBar
            scanId={scanId || "-"}
            scanStatus={scanStatus}
            onBackground={handleRunInBackground}
            onCancel={() => setIsCancelOpen(true)}
            onReport={handleGoReport}
          />
        </section>
      </div>

      {isDetailsOpen && (
        <DetailsModal
          scanUrl={scanUrl}
          siteHost={siteHost}
          scanId={scanId || "-"}
          progress={progress}
          scanStatus={scanStatus}
          completedTests={completedTests}
          totalTests={totalTests}
          scopeText={scopeText}
          devicesText={devicesText}
          moduleSummary={moduleSummary}
          onClose={() => setIsDetailsOpen(false)}
        />
      )}

      {isCancelOpen && (
        <CancelModal
          onClose={() => setIsCancelOpen(false)}
          onConfirm={handleCancelScan}
        />
      )}

      {selectedFinding && (
        <FindingModal
          item={selectedFinding}
          onClose={() => setSelectedFinding(null)}
        />
      )}
    </main>
  );
}

function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-white/8 bg-[#0c111d]/90 lg:flex lg:flex-col">
      <div className="flex h-17.5 items-center gap-3 border-b border-white/[0.07] px-5">
        <div className="grid size-9 place-items-center rounded-lg bg-[#2f6df6] text-white">
          <Icon name="brand" className="size-5" />
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

      <nav className="flex-1 px-4 py-8">
        <div className="space-y-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex h-11 items-center gap-4 rounded-md px-4 text-[14px] font-bold transition ${
                item.active
                  ? "bg-[#4a566e] text-white"
                  : "text-[#a5adbe] hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              <Icon name={item.icon} className="size-4" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="border-t border-white/11 px-4 py-5">
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
            <Link href="/pricing" className="text-[#b8c5ff]">
              Paketleri İncele
            </Link>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <Link
            href="/settings"
            className="flex h-9 w-full items-center gap-4 rounded-md px-4 text-[14px] font-bold text-[#a5adbe]"
          >
            <Icon name="help" className="size-4" />
            Destek
          </Link>
          <Link
            href="/"
            className="flex h-9 w-full items-center gap-4 rounded-md px-4 text-[14px] font-bold text-[#a5adbe]"
          >
            <Icon name="logout" className="size-4" />
            Çıkış Yap
          </Link>
        </div>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="flex h-17.5 items-center justify-between border-b border-white/8 bg-[#080d18]/75 px-6 backdrop-blur-xl">
      <nav className="hidden items-center gap-7 lg:flex">
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
            className={`text-[13px] font-bold ${
              item === "Canlı İzleme" ? "text-white" : "text-[#969faf]"
            }`}
          >
            {item}
          </Link>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-4">
        <div className="hidden items-center border-r border-white/9 pr-4 text-right md:flex">
          <div>
            <p className="text-[13px] font-bold text-[#d8dce8]">Acme Dijital</p>
            <p className="text-[12px] font-medium text-[#858fa4]">
              Pro Workspace
            </p>
          </div>
        </div>

        <Icon name="bell" className="size-5 text-[#aab2c4]" />
        <Icon name="settings" className="size-5 text-[#aab2c4]" />

        <div className="hidden items-center gap-3 border-l border-white/9 pl-4 md:flex">
          <div>
            <p className="text-right text-[13px] font-bold text-[#d8dce8]">
              A. Selin
            </p>
            <p className="text-right text-[12px] font-medium text-[#858fa4]">
              Admin
            </p>
          </div>
          <div className="grid size-9 place-items-center rounded-full bg-[#2f6df6] text-[12px] font-bold text-white">
            AS
          </div>
        </div>
      </div>
    </header>
  );
}

function RightPanel({
  completedTests,
  totalTests,
  progress,
  remainingModules,
  remainingTime,
  scanStatus,
}: {
  completedTests: number;
  totalTests: number;
  progress: number;
  remainingModules: number;
  remainingTime: string;
  scanStatus: ScanStatus;
}) {
  return (
    <aside className="space-y-5">
      <InfoCard title="Tarama Durumu" icon="chart">
        <div className="mt-6 rounded-lg border border-white/6 bg-[#080d18]/65 p-5">
          <div className="flex items-center justify-between text-[14px] font-bold">
            <span className="text-[#a8b1c2]">Tamamlanan Testler</span>
            <span className="text-[#e1e6f2]">
              {completedTests}/{totalTests}
            </span>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/12">
            <div
              className="h-full rounded-full bg-[#aebcff]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <StatusLine
          icon="module"
          title="Kalan Modüller"
          value={String(remainingModules)}
        />
        <StatusLine
          icon="timer"
          title="Tahmini Kalan Süre"
          value={remainingTime}
        />
        <StatusLine
          icon="network"
          title="Aktif Düğüm"
          value={
            scanStatus === "cancelled" || scanStatus === "failed" ? "-" : "Node-07"
          }
        />
        <StatusLine
          icon="queue"
          title="Kuyruktaki Sıra"
          value={scanStatus === "completed" ? "0/5" : "2/5"}
        />
      </InfoCard>
    </aside>
  );
}

function InfoCard({
  title,
  children,
  icon,
}: {
  title: string;
  children: ReactNode;
  icon: string;
}) {
  return (
    <div className="rounded-xl border border-white/9 bg-[#0d1423]/88 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <h3 className="flex items-center gap-2 text-[16px] font-extrabold text-[#d9deeb]">
        <Icon name={icon} className="size-4 text-[#aebcff]" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function StatusLine({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string;
}) {
  return (
    <div className="mt-4 flex min-h-17.5 items-center justify-between gap-4 rounded-lg border border-white/6 bg-[#080d18]/65 px-5">
      <div className="flex items-center gap-4">
        <span className="grid size-8 place-items-center rounded-md bg-white/6">
          <Icon name={icon} className="size-4 text-[#aeb6c8]" />
        </span>
        <p className="text-[14px] font-extrabold text-[#c9cfdd]">{title}</p>
      </div>
      <p className="text-[15px] font-extrabold text-[#e2e7f3]">{value}</p>
    </div>
  );
}

function FindingCard({
  title,
  desc,
  level,
  tone,
  icon,
  onClick,
}: FindingItem & { onClick: () => void }) {
  const toneClasses: Record<FindingItem["tone"], string> = {
    red: "border-[#783438] bg-[#32171d] text-[#ff777d]",
    orange: "border-[#6d5623] bg-[#302919] text-[#f5a623]",
    yellow: "border-[#716322] bg-[#302d16] text-[#f0cf35]",
  };

  const iconClasses: Record<FindingItem["tone"], string> = {
    red: "text-[#ff616a]",
    orange: "text-[#f0a020]",
    yellow: "text-[#f0cf35]",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full gap-4 rounded-lg border border-white/4 bg-[#111827]/75 p-4 text-left transition hover:border-white/15 hover:bg-white/6"
    >
      <Icon name={icon} className={`mt-1 size-5 ${iconClasses[tone]}`} />
      <div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-md border px-2 py-1 text-[10px] font-extrabold ${toneClasses[tone]}`}
          >
            {level}
          </span>
          <h3 className="text-[15px] font-extrabold text-[#d7dce8]">{title}</h3>
        </div>
        <p className="mt-3 text-[12px] font-medium leading-5 text-[#9da7b9]">
          {desc}
        </p>
      </div>
    </button>
  );
}

function EmptyState({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-lg border border-white/6 bg-[#080d18]/65 p-5">
      <div className="flex items-start gap-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-white/6">
          <Icon name={icon} className="size-4 text-[#aebcff]" />
        </span>
        <div>
          <p className="text-[14px] font-extrabold text-[#d7dce8]">{title}</p>
          <p className="mt-2 text-[12px] font-medium leading-5 text-[#9da7b9]">
            {desc}
          </p>
        </div>
      </div>
    </div>
  );
}

function MetaItem({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#7b8496]">
        {title}
      </p>
      <p className="mt-2 text-[14px] font-extrabold text-[#d7dce9]">{value}</p>
    </div>
  );
}

function BottomBar({
  scanId,
  scanStatus,
  onBackground,
  onCancel,
  onReport,
}: {
  scanId: string;
  scanStatus: ScanStatus;
  onBackground: () => void;
  onCancel: () => void;
  onReport: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/8 bg-[#191d27]/95 backdrop-blur-xl lg:left-60">
      <div className="flex h-16 items-center justify-between gap-5 px-6">
        <div className="flex min-w-0 items-center gap-8 text-[12px] font-bold text-[#a6afc1]">
          <span className="truncate">⚙ {scanId}</span>
          <span className="hidden md:inline">
            TİP: <b className="text-[#dce2ef]">Standart</b>
          </span>
          <span className="hidden md:inline">
            KULLANICI: <b className="text-[#dce2ef]">A. Selim</b>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {scanStatus === "completed" ? (
            <button
              type="button"
              onClick={onReport}
              className="h-10 rounded-md bg-[#2f6df6] px-5 text-[13px] font-extrabold text-white transition hover:bg-[#3b7aff]"
            >
              Raporu Görüntüle
            </button>
          ) : scanStatus === "cancelled" || scanStatus === "failed" ? (
            <Link
              href="/scanner"
              className="h-10 rounded-md bg-[#2f6df6] px-5 py-2.5 text-[13px] font-extrabold text-white transition hover:bg-[#3b7aff]"
            >
              Yeni Tarama Başlat
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={onBackground}
                className="hidden h-10 items-center gap-2 rounded-md border border-white/[0.14] px-5 text-[13px] font-extrabold text-[#d8deeb] transition hover:border-white/25 hover:bg-white/6 md:inline-flex"
              >
                <Icon name="window" className="size-4" />
                Arka Planda Çalıştır
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="h-10 rounded-md border border-[#7c3539] bg-[#2a1418] px-5 text-[13px] font-extrabold text-[#ff666d] transition hover:bg-[#381a1f]"
              >
                ⊗ Taramayı İptal Et
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailsModal({
  scanUrl,
  siteHost,
  scanId,
  progress,
  scanStatus,
  completedTests,
  totalTests,
  scopeText,
  devicesText,
  moduleSummary,
  onClose,
}: {
  scanUrl: string;
  siteHost: string;
  scanId: string;
  progress: number;
  scanStatus: ScanStatus;
  completedTests: number;
  totalTests: number;
  scopeText: string;
  devicesText: string;
  moduleSummary: string;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/60 px-5 backdrop-blur-sm"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-155 cursor-default rounded-2xl border border-white/10 bg-[#0d1423] p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-5 border-b border-white/8 pb-5">
          <div>
            <h2 className="text-[22px] font-extrabold">Tarama Ayrıntıları</h2>
            <p className="mt-1 text-[13px] font-medium text-[#9fa8bb]">
              {siteHost}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[24px] text-[#9aa4b8] transition hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <DetailItem label="Tarama ID" value={scanId} />
          <DetailItem label="Durum" value={getScanStatusLabel(scanStatus)} />
          <DetailItem label="URL" value={scanUrl} />
          <DetailItem label="İlerleme" value={`${progress}%`} />
          <DetailItem
            label="Tamamlanan Test"
            value={`${completedTests}/${totalTests}`}
          />
          <DetailItem label="Kapsam" value={scopeText} />
          <DetailItem label="Cihazlar" value={devicesText} />
          <DetailItem label="Modüller" value={moduleSummary} />
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
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

function CancelModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/60 px-5 backdrop-blur-sm"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-115 cursor-default rounded-2xl border border-white/10 bg-[#0d1423] p-6 shadow-2xl"
      >
        <h2 className="text-[22px] font-extrabold">
          Taramayı iptal edelim mi?
        </h2>

        <p className="mt-3 text-[14px] font-medium leading-6 text-[#aab3c5]">
          Bu işlem canlı izleme ekranındaki polling sürecini durdurur. İptal
          endpointi eklenmediği için veritabanındaki kayıt otomatik silinmez.
        </p>

        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-md border border-white/12 px-5 text-[13px] font-extrabold text-[#d8deeb] transition hover:bg-white/6"
          >
            Vazgeç
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="h-10 rounded-md border border-[#7c3539] bg-[#2a1418] px-5 text-[13px] font-extrabold text-[#ff666d] transition hover:bg-[#381a1f]"
          >
            Taramayı İptal Et
          </button>
        </div>
      </div>
    </div>
  );
}

function FindingModal({
  item,
  onClose,
}: {
  item: FindingItem;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/60 px-5 backdrop-blur-sm"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-140 cursor-default rounded-2xl border border-white/10 bg-[#0d1423] p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-5 border-b border-white/8 pb-5">
          <div>
            <p className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#aebcff]">
              Bulgu Detayı
            </p>
            <h2 className="mt-2 text-[22px] font-extrabold">{item.title}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[24px] text-[#9aa4b8] transition hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-white/8 bg-[#080d18]/70 p-4">
            <p className="text-[13px] font-bold text-[#aab3c5]">Açıklama</p>
            <p className="mt-2 text-[14px] font-medium leading-6 text-[#dce2ef]">
              {item.desc}
            </p>
          </div>

          <div className="rounded-lg border border-white/8 bg-[#080d18]/70 p-4">
            <p className="text-[13px] font-bold text-[#aab3c5]">
              Çözüm Önerisi
            </p>
            <p className="mt-2 text-[14px] font-medium leading-6 text-[#dce2ef]">
              {item.solution}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function normalizeScanPayload(
  payload: ScanApiPayload,
  fallbackScanId: string,
): NormalizedScan {
  const scan = getScanRecord(payload);

  const id = getString(scan.id) ?? getString(scan.scanId) ?? fallbackScanId;

  const url =
    getString(scan.url) ??
    getString(scan.targetUrl) ??
    getString(scan.scanUrl) ??
    getString(scan.websiteUrl) ??
    "https://orneksite.com";

  const status = normalizeScanStatus(getString(scan.status));
  const progress = clampNumber(
    getNumber(scan.progress) ??
      getNumber(scan.percentage) ??
      (status === "completed" ? 100 : 0),
    0,
    100,
  );

  const logs = normalizeLogs(
    readArray(scan.logs) ??
      readArray(scan.events) ??
      readArray(scan.timeline) ??
      [],
    status,
  );

  const findings = normalizeFindings(
    readArray(scan.findings) ??
      readArray(scan.issues) ??
      readArray(scan.problems) ??
      [],
  );

  const apiModules =
    readArray(scan.modules) ??
    readArray(scan.moduleProgress) ??
    readArray(scan.checks) ??
    [];

  const selectedModules =
    readArray(scan.selectedModules) ??
    readArray(scan.analysisModules) ??
    readArray(scan.enabledModules) ??
    [];

  const modules = buildModuleRows({
    apiModules,
    selectedModules,
    progress,
    status,
  });

  const totalTests =
    getNumber(scan.totalTests) ?? getNumber(scan.testsTotal) ?? 262;

  const completedTests =
    getNumber(scan.completedTests) ??
    getNumber(scan.testsCompleted) ??
    Math.round((progress / 100) * totalTests);

  const startedAtMs =
    getDateMs(scan.startedAt) ??
    getDateMs(scan.createdAt) ??
    getDateMs(scan.created_at) ??
    null;

  return {
    id,
    url,
    status,
    progress,
    logs,
    findings,
    modules,
    startedAtMs,
    totalTests,
    completedTests: clampNumber(completedTests, 0, totalTests),
    scopeText: buildScopeText(scan),
    devicesText: buildDevicesText(scan),
    moduleSummary: buildModuleSummary(modules),
  };
}

function getScanRecord(payload: ScanApiPayload): Record<string, unknown> {
  if (payload.scan && typeof payload.scan === "object") return payload.scan;
  if (payload.data && typeof payload.data === "object") return payload.data;

  return payload;
}

function normalizeLogs(rawLogs: unknown[], status: ScanStatus): LogItem[] {
  if (!rawLogs.length) {
    return [
      {
        time: getCurrentTime(),
        icon:
          status === "completed"
            ? "chart"
            : status === "failed"
              ? "alert"
              : "refresh",
        text:
          status === "completed"
            ? "Tarama tamamlandı. Rapor sayfasına yönlendiriliyor."
            : status === "failed"
              ? "Tarama sırasında hata oluştu."
              : "Tarama çalışıyor. Canlı loglar bekleniyor.",
        active: true,
        success: status === "completed",
        warning: status === "failed",
      },
    ];
  }

  const normalized = rawLogs.map((item, index) => {
    if (typeof item === "string") {
      return {
        time: getCurrentTime(),
        icon: "refresh",
        text: item,
        active: index === rawLogs.length - 1,
      };
    }

    const record = toRecord(item);

    const level =
      getString(record.level) ??
      getString(record.status) ??
      getString(record.type) ??
      "";

    const text =
      getString(record.text) ??
      getString(record.message) ??
      getString(record.title) ??
      "Tarama adımı işlendi.";

    const time =
      getTimeText(record.time) ??
      getTimeText(record.createdAt) ??
      getTimeText(record.timestamp) ??
      getCurrentTime();

    const success =
      getBoolean(record.success) ??
      ["success", "completed", "done", "ok"].includes(level.toLowerCase());

    const warning =
      getBoolean(record.warning) ??
      ["warning", "warn", "failed", "error"].includes(level.toLowerCase());

    return {
      time,
      icon: getString(record.icon) ?? getLogIcon(level, text),
      text,
      active: index === rawLogs.length - 1,
      success,
      warning,
    };
  });

  return normalized.reverse().map((log, index) => ({
    ...log,
    active: index === 0,
  }));
}

function normalizeFindings(rawFindings: unknown[]): FindingItem[] {
  return rawFindings.map((item) => {
    if (typeof item === "string") {
      return {
        title: item,
        desc: "Tarama sırasında tespit edilen bulgu.",
        level: "Bilgi",
        tone: "yellow",
        icon: "info",
        solution: "Detaylı rapor ekranında ilgili bulgunun çözüm adımlarını inceleyin.",
      };
    }

    const record = toRecord(item);

    const severity =
      getString(record.severity) ??
      getString(record.level) ??
      getString(record.priority) ??
      "info";

    const tone = getFindingTone(severity);

    return {
      title:
        getString(record.title) ??
        getString(record.name) ??
        getString(record.rule) ??
        "Tespit Edilen Bulgu",
      desc:
        getString(record.desc) ??
        getString(record.description) ??
        getString(record.message) ??
        "Tarama sırasında iyileştirme gerektiren bir alan tespit edildi.",
      level: getFindingLevel(severity),
      tone,
      icon: tone === "red" ? "alert" : tone === "orange" ? "warning" : "info",
      solution:
        getString(record.solution) ??
        getString(record.recommendation) ??
        getString(record.fix) ??
        "Bu bulguyu rapor ekranında detaylı inceleyip önerilen aksiyonları uygulayın.",
    };
  });
}

function buildModuleRows({
  apiModules,
  selectedModules,
  progress,
  status,
}: {
  apiModules: unknown[];
  selectedModules: unknown[];
  progress: number;
  status: ScanStatus;
}): ModuleProgressItem[] {
  const hasStructuredModules = apiModules.length > 0;

  const baseModules = hasStructuredModules
    ? apiModules
    : selectedModules.length > 0
      ? selectedModules
      : defaultModuleTitles;

  const total = Math.max(1, baseModules.length);
  const completedCount =
    status === "completed" ? total : Math.floor((progress / 100) * total);

  return baseModules.map((item, index) => {
    if (typeof item === "string") {
      const title = normalizeModuleTitle(item);
      const calculatedStatus = getCalculatedModuleStatus({
        index,
        completedCount,
        globalStatus: status,
      });

      return {
        title,
        icon: getModuleIcon(title),
        status: calculatedStatus,
        active: calculatedStatus === "running",
      };
    }

    const record = toRecord(item);
    const rawTitle =
      getString(record.title) ??
      getString(record.name) ??
      getString(record.label) ??
      getString(record.key) ??
      `Modül ${index + 1}`;

    const title = normalizeModuleTitle(rawTitle);
    const moduleStatus =
      normalizeModuleStatus(getString(record.status)) ??
      getCalculatedModuleStatus({
        index,
        completedCount,
        globalStatus: status,
      });

    return {
      title,
      icon: getString(record.icon) ?? getModuleIcon(title),
      status: moduleStatus,
      active: moduleStatus === "running",
    };
  });
}

function getCalculatedModuleStatus({
  index,
  completedCount,
  globalStatus,
}: {
  index: number;
  completedCount: number;
  globalStatus: ScanStatus;
}): ModuleStatus {
  if (globalStatus === "completed") return "completed";
  if (globalStatus === "failed") return index < completedCount ? "completed" : "failed";
  if (globalStatus === "cancelled") {
    return index < completedCount ? "completed" : "cancelled";
  }

  if (index < completedCount) return "completed";
  if (index === completedCount) return "running";

  return "queued";
}

function buildScopeText(scan: Record<string, unknown>) {
  const scopeType =
    getString(scan.scopeType) ??
    getString(scan.scope) ??
    getString(scan.pageScope) ??
    "Standart";

  const crawlDepth =
    getString(scan.crawlDepth) ??
    getString(scan.depth) ??
    getString(scan.crawl_depth);

  if (!crawlDepth) return scopeType;

  return `${scopeType} / Derinlik: ${crawlDepth}`;
}

function buildDevicesText(scan: Record<string, unknown>) {
  const viewports =
    readArray(scan.viewports) ??
    readArray(scan.screenSizes) ??
    readArray(scan.devices) ??
    [];

  if (!viewports.length) return "Seçilen ekran boyutları";

  return viewports
    .map((item) => {
      if (typeof item === "string") return item;

      const record = toRecord(item);

      return (
        getString(record.label) ??
        getString(record.name) ??
        getString(record.value) ??
        ""
      );
    })
    .filter(Boolean)
    .join(", ");
}

function buildModuleSummary(modules: ModuleProgressItem[]) {
  if (!modules.length) return "Modül bilgisi yok";

  const firstModules = modules.slice(0, 4).map((item) => item.title).join(", ");

  return modules.length > 4
    ? `${firstModules} +${modules.length - 4} modül`
    : firstModules;
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

function normalizeModuleStatus(value?: string | null): ModuleStatus | null {
  if (!value) return null;

  const status = value.toLowerCase();

  if (status === "queued" || status === "pending" || status === "waiting") {
    return "queued";
  }

  if (status === "running" || status === "active" || status === "processing") {
    return "running";
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

  return null;
}

function normalizeModuleTitle(value: string) {
  const key = value.toLowerCase();

  if (key === "performance" || key.includes("performans")) return "Performans";
  if (key === "responsive" || key.includes("responsive")) return "Responsive QA";
  if (key === "seo" || key.includes("seo")) return "SEO";
  if (
    key === "accessibility" ||
    key.includes("erişilebilirlik") ||
    key.includes("wcag")
  ) {
    return "Erişilebilirlik";
  }
  if (key === "interaction" || key.includes("interaction")) {
    return "Interaction QA";
  }
  if (key === "security" || key.includes("security") || key.includes("güvenlik")) {
    return "Security Basics";
  }
  if (key === "visual" || key.includes("görsel") || key.includes("visual")) {
    return "Görsel QA";
  }
  if (key === "forms" || key.includes("form")) return "Form Kontrolleri";

  return value;
}

function getModuleIcon(title: string) {
  const key = title.toLowerCase();

  if (key.includes("performans")) return "speed";
  if (key.includes("responsive")) return "window";
  if (key.includes("seo")) return "html";
  if (key.includes("erişilebilirlik")) return "eye";
  if (key.includes("interaction")) return "scan";
  if (key.includes("security") || key.includes("güvenlik")) return "lock";
  if (key.includes("görsel")) return "chart";
  if (key.includes("form")) return "code";

  return "module";
}

function getModuleStatusLabel(
  moduleStatus: ModuleStatus,
  globalStatus: ScanStatus,
) {
  if (moduleStatus === "completed") return "TAMAMLANDI";
  if (moduleStatus === "running") return "İŞLENİYOR...";
  if (moduleStatus === "failed") return "HATA";
  if (moduleStatus === "cancelled") return "DURDURULDU";

  if (globalStatus === "completed") return "TAMAMLANDI";
  if (globalStatus === "failed") return "HATA";
  if (globalStatus === "cancelled") return "DURDURULDU";

  return "SIRADA";
}

function getScanStatusLabel(status: ScanStatus) {
  if (status === "completed") return "Tamamlandı";
  if (status === "cancelled") return "İptal Edildi";
  if (status === "failed") return "Hata";
  if (status === "queued") return "Sırada";

  return "Devam Ediyor";
}

function getRemainingTimeText({
  status,
  progress,
  elapsedSeconds,
}: {
  status: ScanStatus;
  progress: number;
  elapsedSeconds: number;
}) {
  if (status === "completed") return "00:00 dk";
  if (status === "cancelled") return "Durduruldu";
  if (status === "failed") return "Hata";
  if (progress <= 3 || elapsedSeconds <= 0) return "Hesaplanıyor";

  const remainingSeconds = Math.max(
    0,
    Math.round((elapsedSeconds / progress) * (100 - progress)),
  );

  return `${formatElapsed(remainingSeconds)} dk`;
}

function getFindingTone(severity: string): FindingItem["tone"] {
  const level = severity.toLowerCase();

  if (
    level.includes("critical") ||
    level.includes("high") ||
    level.includes("kritik") ||
    level.includes("yüksek")
  ) {
    return "red";
  }

  if (
    level.includes("medium") ||
    level.includes("warning") ||
    level.includes("orta") ||
    level.includes("uyarı")
  ) {
    return "orange";
  }

  return "yellow";
}

function getFindingLevel(severity: string) {
  const level = severity.toLowerCase();

  if (level.includes("critical") || level.includes("kritik")) return "Kritik";
  if (level.includes("high") || level.includes("yüksek")) return "Yüksek";
  if (level.includes("medium") || level.includes("orta")) return "Orta";
  if (level.includes("low") || level.includes("düşük")) return "Düşük";

  return "Bilgi";
}

function getLogIcon(level: string, text: string) {
  const value = `${level} ${text}`.toLowerCase();

  if (value.includes("error") || value.includes("hata")) return "alert";
  if (value.includes("warning") || value.includes("uyarı")) return "warning";
  if (value.includes("performance") || value.includes("lcp")) return "speed";
  if (value.includes("seo") || value.includes("meta")) return "html";
  if (value.includes("server") || value.includes("dns")) return "server";
  if (value.includes("completed") || value.includes("tamamlandı")) return "check";

  return "refresh";
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
  if (value && typeof value === "object") return value as Record<string, unknown>;

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

function getBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;

  return null;
}

function getDateMs(value: unknown): number | null {
  if (typeof value !== "string" && typeof value !== "number") return null;

  const date = new Date(value);
  const time = date.getTime();

  return Number.isFinite(time) ? time : null;
}

function getTimeText(value: unknown): string | null {
  if (typeof value === "string" && /^\d{2}:\d{2}:\d{2}$/.test(value)) {
    return value;
  }

  const time = getDateMs(value);

  return time ? formatClock(time) : null;
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function getCurrentTime() {
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());
}

function formatClock(value: number) {
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

function formatElapsed(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function Icon({ name, className = "" }: { name: string; className?: string }) {
  const paths: Record<string, ReactNode> = {
    brand: (
      <path d="M12 3 5 6v6c0 4.5 2.9 7.7 7 9 4.1-1.3 7-4.5 7-9V6l-7-3ZM9 10l3 3 4-5" />
    ),
    grid: <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />,
    scan: (
      <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M8 12h8M12 8v8" />
    ),
    live: (
      <path d="M4 12a8 8 0 0 1 4-6.9M20 12a8 8 0 0 0-4-6.9M8 12a4 4 0 0 1 2-3.5M16 12a4 4 0 0 0-2-3.5M12 13h.01" />
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
    eye: (
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    ),
    globe: (
      <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
    ),
    terminal: <path d="M4 5h16v14H4zM8 9l3 3-3 3M13 15h3" />,
    refresh: (
      <path d="M4 12a8 8 0 0 1 13.6-5.6L20 9M20 4v5h-5M20 12a8 8 0 0 1-13.6 5.6L4 15M4 20v-5h5" />
    ),
    speed: <path d="M4 14a8 8 0 1 1 16 0M12 14l4-4M9 18h6" />,
    html: <path d="M4 7h16M6 7l1 12h10l1-12M9 11l2 2-2 2M15 11l-2 2 2 2" />,
    server: <path d="M5 4h14v6H5zM5 14h14v6H5zM8 7h.01M8 17h.01" />,
    alert: <path d="M12 4 21 20H3L12 4ZM12 9v5M12 17h.01" />,
    warning: <path d="M12 4 21 20H3L12 4ZM12 9v5M12 17h.01" />,
    info: (
      <path d="M12 16v-4M12 8h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />
    ),
    lock: <path d="M7 10V7a5 5 0 0 1 10 0v3M6 10h12v11H6z" />,
    code: <path d="m8 9-4 3 4 3M16 9l4 3-4 3" />,
    hourglass: (
      <path d="M6 3h12M6 21h12M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9" />
    ),
    module: <path d="M12 3 4 7l8 4 8-4-8-4ZM4 12l8 4 8-4M4 17l8 4 8-4" />,
    timer: <path d="M12 8v5l3 2M9 2h6M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />,
    network: (
      <path d="M12 3v6M12 15v6M5 12h6M13 12h6M7 7l3 3M17 7l-3 3M7 17l3-3M17 17l-3-3" />
    ),
    queue: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
    window: <path d="M4 5h16v14H4zM4 9h16M8 13h4M8 16h8" />,
    check: <path d="m5 12 4 4L19 6" />,
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