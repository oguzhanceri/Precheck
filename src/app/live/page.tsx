"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type ScanStatus = "running" | "completed" | "cancelled";

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

const sidebarItems = [
  { label: "Genel Bakış", href: "/dashboard", icon: "grid" },
  { label: "Yeni Tarama", href: "/scanner", icon: "scan" },
  { label: "Canlı İzleme", href: "/live", icon: "live", active: true },
  { label: "Analiz Geçmişi", href: "/history", icon: "history" },
  { label: "Raporlar", href: "/report", icon: "chart" },
  { label: "Takım", href: "/settings", icon: "team" },
  { label: "Ayarlar", href: "/settings", icon: "settings" },
];

const initialLogs: LogItem[] = [
  {
    time: "10:44:12",
    icon: "refresh",
    text: "DOM yapısı taranıyor, derinlik seviyesi: 3",
    active: true,
  },
  {
    time: "10:44:05",
    icon: "refresh",
    text: "JavaScript payload analizi yürütülüyor... [Modül 4/12]",
  },
  {
    time: "10:43:10",
    icon: "speed",
    text: "Performans testi: LCP ölçümü tamamlandı (1.2s - İyi).",
    success: true,
  },
  {
    time: "10:42:35",
    icon: "html",
    text: "Meta tag analizi: 3 uyarı bulundu (Missing canonical).",
    warning: true,
  },
  {
    time: "10:42:21",
    icon: "server",
    text: "DNS çözümlemesi tamamlandı. (104.21.43.12)",
  },
];

const runtimeLogs = [
  "Görsel optimizasyon kontrolü başlatıldı.",
  "Responsive breakpoint testi yürütülüyor. [Desktop]",
  "Erişilebilirlik etiketleri kontrol ediliyor.",
  "Form validasyon kuralları simüle ediliyor.",
  "SEO derin analizi tamamlandı. 2 uyarı bulundu.",
  "Mobil uyumluluk testi tamamlandı.",
  "Rapor çıktısı hazırlanıyor.",
];

const findings: FindingItem[] = [
  {
    title: "Kritik JS Kütüphanesi Açığı",
    desc: "Eski sürüm jQuery tespit edildi (v1.12.4).",
    level: "Yüksek",
    tone: "red",
    icon: "alert",
    solution:
      "jQuery sürümünü güncelleyin veya bağımlılığı kaldırın. Eski sürüm kütüphaneler XSS ve güvenlik riskleri oluşturabilir.",
  },
  {
    title: "Eksik HSTS Başlığı",
    desc: "Strict-Transport-Security başlığı sunucu yanıtında bulunamadı.",
    level: "Orta",
    tone: "orange",
    icon: "warning",
    solution:
      "Sunucu yanıtına Strict-Transport-Security header ekleyin. Bu, tarayıcının bağlantıyı HTTPS üzerinden zorlamasını sağlar.",
  },
  {
    title: "Gereksiz Büyük İmaj",
    desc: "hero-bg.jpg (2.4MB) optimize edilmemiş.",
    level: "Düşük",
    tone: "yellow",
    icon: "info",
    solution:
      "Görseli WebP/AVIF formatına çevirin, doğru width/height değerleri verin ve kritik olmayan görsellerde lazy loading kullanın.",
  },
];

const completedModules = [
  { title: "Altyapı & DNS Analizi", icon: "server" },
  { title: "SSL/TLS Sertifika Kontrolü", icon: "lock" },
  { title: "Statik Kod Analizi (HTML)", icon: "code" },
  { title: "Temel Performans Metrikleri", icon: "speed" },
];

const waitingModules = [
  { title: "Dinamik Güvenlik Taraması", status: "İŞLENİYOR...", active: true },
  {
    title: "Erişilebilirlik (WCAG) Kontrolü",
    status: "İŞLENİYOR...",
    active: true,
  },
  { title: "SEO Derin Analizi", status: "SIRADA" },
  { title: "Mobil Uyumluluk Testi", status: "SIRADA" },
];

function getInitialScanUrl() {
  if (typeof window === "undefined") return "https://orneksite.com";

  return new URLSearchParams(window.location.search).get("url") ?? "https://orneksite.com";
}

function getInitialScanId() {
  if (typeof window === "undefined") return "scan_20250511_104218";

  return new URLSearchParams(window.location.search).get("jobId") ?? "scan_20250511_104218";
}

export default function LivePage() {
  const router = useRouter();
  const logListRef = useRef<HTMLDivElement | null>(null);

  const [scanUrl] = useState(getInitialScanUrl);
  const [scanId] = useState(getInitialScanId);
  const [progress, setProgress] = useState(71);
  const [elapsedSeconds, setElapsedSeconds] = useState(133);
  const [scanStatus, setScanStatus] = useState<ScanStatus>("running");
  const [autoScroll, setAutoScroll] = useState(true);
  const [logs, setLogs] = useState<LogItem[]>(initialLogs);
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

  const completedTests = Math.min(262, Math.round((progress / 100) * 262));
  const remainingModules =
    scanStatus === "completed"
      ? 0
      : Math.max(0, 12 - Math.round((progress / 100) * 12));
  const remainingTime =
    scanStatus === "completed"
      ? "00:00 dk"
      : scanStatus === "cancelled"
        ? "Durduruldu"
        : "02:47 dk";

  const statusText =
    scanStatus === "completed"
      ? "RAPOR HAZIR"
      : scanStatus === "cancelled"
        ? "TARAMA İPTAL EDİLDİ"
        : "CANLI ANALİZ";

  const statusColor =
    scanStatus === "completed"
      ? "text-[#25d18c]"
      : scanStatus === "cancelled"
        ? "text-[#ff666d]"
        : "text-[#25d18c]";

  useEffect(() => {
    if (scanStatus !== "running") return;

    const interval = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);

      setProgress((current) => {
        if (current >= 100) return 100;

        const next = Math.min(100, current + 1);
        const logIndex = Math.floor((next - 75) / 5);
        const nextLogText = runtimeLogs[logIndex];

        if (next > 72 && next % 5 === 0 && nextLogText) {
          setLogs((currentLogs) => [
            {
              time: getCurrentTime(),
              icon: next > 94 ? "chart" : "refresh",
              text: nextLogText,
              active: true,
              success: next > 90,
              warning: next === 85,
            },
            ...currentLogs.map((log) => ({ ...log, active: false })),
          ]);
        }

        if (next >= 100) {
          setScanStatus("completed");
          setLogs((currentLogs) => [
            {
              time: getCurrentTime(),
              icon: "chart",
              text: "Tarama tamamlandı. Detaylı rapor hazırlandı.",
              success: true,
              active: true,
            },
            ...currentLogs.map((log) => ({ ...log, active: false })),
          ]);
        }

        return next;
      });
    }, 1200);

    return () => window.clearInterval(interval);
  }, [scanStatus]);

  useEffect(() => {
    if (!autoScroll) return;

    logListRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [logs, autoScroll]);

  const handleCancelScan = () => {
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
    router.push(
      `/report?url=${encodeURIComponent(scanUrl)}&jobId=${encodeURIComponent(scanId)}`,
    );
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#070b15] text-[#e7e9f4]">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_35%_0%,rgba(64,102,255,0.13),transparent_34%),linear-gradient(180deg,rgba(8,13,24,0.1),#070b15_85%)]" />

      <div className="relative z-10 flex min-h-screen">
        <Sidebar />

        <section className="min-w-0 flex-1 pb-[74px]">
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
                    className="h-10 items-center gap-2 rounded-md border border-white/[0.12] bg-[#111827]/70 px-5 text-[13px] font-bold text-[#c4cad8] transition hover:border-white/25 hover:bg-white/[0.06] lg:inline-flex"
                  >
                    <Icon name="eye" className="size-4" />
                    Tarama Ayrıntılarını Görüntüle
                  </button>
                </div>
              </div>

              <section className="mt-7 overflow-hidden rounded-xl border border-white/[0.09] bg-[#0d1423]/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <div className="grid lg:grid-cols-[300px_1fr]">
                  <div className="border-b border-white/[0.08] p-9 lg:border-b-0 lg:border-r">
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
                        className="relative grid size-[190px] place-items-center rounded-full"
                        style={{
                          background: `conic-gradient(#2f6df6 0 ${progress}%, #202a3c ${progress}% 100%)`,
                        }}
                      >
                        <div className="grid size-[140px] place-items-center rounded-full bg-[#0d1423]">
                          <span className="text-[42px] font-extrabold tracking-[-0.06em]">
                            {progress}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`mt-9 flex items-center justify-center gap-2 text-[14px] font-extrabold ${statusColor}`}
                    >
                      <span
                        className={`size-2 rounded-full ${
                          scanStatus === "cancelled"
                            ? "bg-[#ff666d]"
                            : "bg-[#25d18c]"
                        }`}
                      />
                      {statusText}
                    </div>

                    <div className="mt-9 border-t border-white/[0.06] pt-7">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <MetaItem title="Başlangıç" value="10:42:18" />
                        <MetaItem
                          title="Geçen Süre"
                          value={formatElapsed(elapsedSeconds)}
                        />
                        <MetaItem
                          title="Tarama ID"
                          value={scanId.slice(0, 7) + "..."}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex h-[58px] items-center justify-between border-b border-white/[0.08] bg-white/[0.035] px-6">
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
                          className="rounded-md border border-white/[0.08] bg-[#111827] px-2 py-1 text-[11px] font-bold text-[#9aa4b7] transition hover:border-white/20 hover:text-white"
                        >
                          Oto-kaydır: {autoScroll ? "Açık" : "Kapalı"}
                        </button>
                      </div>
                    </div>

                    <div
                      ref={logListRef}
                      className="max-h-[430px] space-y-3 overflow-y-auto p-7"
                    >
                      {logs.map((log) => (
                        <div
                          key={`${log.time}-${log.text}`}
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
                <section className="rounded-xl border border-white/[0.09] bg-[#0d1423]/88 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
                    <h2 className="text-[17px] font-extrabold">
                      Anlık Bulgular
                    </h2>
                    <span className="rounded-full bg-white/[0.16] px-3 py-1 text-[11px] font-bold text-[#aeb6c7]">
                      12 Bulgu
                    </span>
                  </div>

                  <div className="mt-5 space-y-4">
                    {findings.map((item) => (
                      <FindingCard
                        key={item.title}
                        {...item}
                        onClick={() => setSelectedFinding(item)}
                      />
                    ))}
                  </div>
                </section>

                <section className="rounded-xl border border-white/[0.09] bg-[#0d1423]/88 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
                    <h2 className="text-[17px] font-extrabold">
                      Tamamlanan Modüller
                    </h2>
                    <span className="rounded-full bg-white/[0.16] px-3 py-1 text-[11px] font-bold text-[#aeb6c7]">
                      {scanStatus === "completed" ? "12/12" : "4/12"}
                    </span>
                  </div>

                  <div className="mt-5 space-y-4">
                    {completedModules.map((item) => (
                      <button
                        key={item.title}
                        type="button"
                        onClick={() => setIsDetailsOpen(true)}
                        className="flex min-h-[70px] w-full items-center justify-between gap-4 rounded-lg border border-white/[0.06] bg-[#111827]/75 px-5 text-left transition hover:border-white/15 hover:bg-white/[0.06]"
                      >
                        <div className="flex items-center gap-4">
                          <Icon
                            name={item.icon}
                            className="size-5 text-[#aeb6c8]"
                          />
                          <p className="max-w-[170px] text-[15px] font-extrabold leading-5 text-[#cfd5e2]">
                            {item.title}
                          </p>
                        </div>
                        <span className="rounded-md border border-[#14624d] bg-[#0d372e] px-3 py-1 text-[11px] font-extrabold text-[#22d296]">
                          ✓ Tamamlandı
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              <section className="mt-6 rounded-xl border border-white/[0.09] bg-[#0d1423]/88 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <h2 className="text-[16px] font-extrabold">
                  Devam Eden & Bekleyen Modüller
                </h2>
                <div className="mt-5 border-t border-white/[0.08] pt-5">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {waitingModules.map((item) => {
                      const isCompleted = scanStatus === "completed";
                      const isCancelled = scanStatus === "cancelled";

                      return (
                        <div
                          key={item.title}
                          className={`flex min-h-[96px] flex-col justify-center rounded-lg border px-5 text-center ${
                            item.active && !isCompleted && !isCancelled
                              ? "border-[#6678b7] bg-white/[0.06]"
                              : "border-white/[0.06] bg-[#080d18]/65 opacity-65"
                          }`}
                        >
                          <div className="mx-auto mb-3">
                            {item.active && !isCompleted && !isCancelled ? (
                              <span className="block size-2 rounded-full bg-[#b8c7ff]" />
                            ) : (
                              <Icon
                                name={isCompleted ? "check" : "hourglass"}
                                className="size-5 text-[#9aa4b8]"
                              />
                            )}
                          </div>
                          <p className="text-[14px] font-extrabold leading-4 text-[#d3d8e6]">
                            {item.title}
                          </p>
                          <p className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#8f9bba]">
                            {isCompleted
                              ? "TAMAMLANDI"
                              : isCancelled
                                ? "DURDURULDU"
                                : item.status}
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
              progress={progress}
              remainingModules={remainingModules}
              remainingTime={remainingTime}
              scanStatus={scanStatus}
            />
          </div>

          <BottomBar
            scanId={scanId}
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
          scanId={scanId}
          progress={progress}
          scanStatus={scanStatus}
          completedTests={completedTests}
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
    <aside className="hidden w-[240px] shrink-0 border-r border-white/[0.08] bg-[#0c111d]/90 lg:flex lg:flex-col">
      <div className="flex h-[70px] items-center gap-3 border-b border-white/[0.07] px-5">
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

      <div className="border-t border-white/[0.11] px-4 py-5">
        <div className="rounded-lg border border-white/[0.09] bg-[#111827]/80 p-4">
          <div className="flex items-center justify-between text-[12px] font-bold text-[#c6ccda]">
            <span>Tarama kredisi</span>
            <span className="text-[#9ea7ba]">2.450 / 5.000</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
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
    <header className="flex h-[70px] items-center justify-between border-b border-white/[0.08] bg-[#080d18]/75 px-6 backdrop-blur-xl">
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
        <div className="hidden items-center border-r border-white/[0.09] pr-4 text-right md:flex">
          <div>
            <p className="text-[13px] font-bold text-[#d8dce8]">Acme Dijital</p>
            <p className="text-[12px] font-medium text-[#858fa4]">
              Pro Workspace
            </p>
          </div>
        </div>

        <Icon name="bell" className="size-5 text-[#aab2c4]" />
        <Icon name="settings" className="size-5 text-[#aab2c4]" />

        <div className="hidden items-center gap-3 border-l border-white/[0.09] pl-4 md:flex">
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
  progress,
  remainingModules,
  remainingTime,
  scanStatus,
}: {
  completedTests: number;
  progress: number;
  remainingModules: number;
  remainingTime: string;
  scanStatus: ScanStatus;
}) {
  return (
    <aside className="space-y-5">
      <InfoCard title="Tarama Durumu" icon="chart">
        <div className="mt-6 rounded-lg border border-white/[0.06] bg-[#080d18]/65 p-5">
          <div className="flex items-center justify-between text-[14px] font-bold">
            <span className="text-[#a8b1c2]">Tamamlanan Testler</span>
            <span className="text-[#e1e6f2]">{completedTests}/262</span>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.12]">
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
          value={scanStatus === "cancelled" ? "-" : "Node-07"}
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
    <div className="rounded-xl border border-white/[0.09] bg-[#0d1423]/88 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
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
    <div className="mt-4 flex min-h-[70px] items-center justify-between gap-4 rounded-lg border border-white/[0.06] bg-[#080d18]/65 px-5">
      <div className="flex items-center gap-4">
        <span className="grid size-8 place-items-center rounded-md bg-white/[0.06]">
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
      className="flex w-full gap-4 rounded-lg border border-white/[0.04] bg-[#111827]/75 p-4 text-left transition hover:border-white/15 hover:bg-white/[0.06]"
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
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/[0.08] bg-[#191d27]/95 backdrop-blur-xl lg:left-[240px]">
      <div className="flex h-[64px] items-center justify-between gap-5 px-6">
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
          ) : scanStatus === "cancelled" ? (
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
                className="hidden h-10 items-center gap-2 rounded-md border border-white/[0.14] px-5 text-[13px] font-extrabold text-[#d8deeb] transition hover:border-white/25 hover:bg-white/[0.06] md:inline-flex"
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
  onClose,
}: {
  scanUrl: string;
  siteHost: string;
  scanId: string;
  progress: number;
  scanStatus: ScanStatus;
  completedTests: number;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/60 px-5 backdrop-blur-sm"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-[620px] cursor-default rounded-2xl border border-white/[0.1] bg-[#0d1423] p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-5 border-b border-white/[0.08] pb-5">
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
          <DetailItem
            label="Durum"
            value={
              scanStatus === "completed"
                ? "Tamamlandı"
                : scanStatus === "cancelled"
                  ? "İptal Edildi"
                  : "Devam Ediyor"
            }
          />
          <DetailItem label="URL" value={scanUrl} />
          <DetailItem label="İlerleme" value={`${progress}%`} />
          <DetailItem label="Tamamlanan Test" value={`${completedTests}/262`} />
          <DetailItem label="Kapsam" value="Tüm Site / Orta Crawl" />
          <DetailItem label="Cihazlar" value="Masaüstü, Tablet, Mobil" />
          <DetailItem label="Modüller" value="Performans, SEO, Güvenlik, QA" />
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
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
        className="w-full max-w-[460px] cursor-default rounded-2xl border border-white/[0.1] bg-[#0d1423] p-6 shadow-2xl"
      >
        <h2 className="text-[22px] font-extrabold">
          Taramayı iptal edelim mi?
        </h2>

        <p className="mt-3 text-[14px] font-medium leading-6 text-[#aab3c5]">
          Bu işlem devam eden analiz sürecini durdurur. Mevcut ilerleme
          kaydedilmiş gibi gösterilir ama yeni rapor oluşturulmaz.
        </p>

        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-md border border-white/[0.12] px-5 text-[13px] font-extrabold text-[#d8deeb] transition hover:bg-white/[0.06]"
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
        className="w-full max-w-[560px] cursor-default rounded-2xl border border-white/[0.1] bg-[#0d1423] p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-5 border-b border-white/[0.08] pb-5">
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
          <div className="rounded-lg border border-white/[0.08] bg-[#080d18]/70 p-4">
            <p className="text-[13px] font-bold text-[#aab3c5]">Açıklama</p>
            <p className="mt-2 text-[14px] font-medium leading-6 text-[#dce2ef]">
              {item.desc}
            </p>
          </div>

          <div className="rounded-lg border border-white/[0.08] bg-[#080d18]/70 p-4">
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

function getCurrentTime() {
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());
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
