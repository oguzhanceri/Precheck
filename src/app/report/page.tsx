"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

type ScoreCardItem = {
  title: string;
  value: string;
  icon: string;
  active: boolean;
  desc: string;
};

type FindingTone = "red" | "orange";

type Finding = {
  title: string;
  desc: string;
  level: string;
  icon: string;
  tone: FindingTone;
  solution: string;
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

const sidebarItems = [
  { label: "Genel Bakış", href: "/dashboard", icon: "grid" },
  { label: "Yeni Tarama", href: "/scanner", icon: "search" },
  { label: "Canlı İzleme", href: "/live", icon: "live" },
  { label: "Analiz Geçmişi", href: "/history", icon: "history" },
  { label: "Raporlar", href: "/report", icon: "file", active: true },
  { label: "Takım", href: "/settings", icon: "team" },
  { label: "Ayarlar", href: "/settings", icon: "settings" },
];

const topbarItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Tarama", href: "/scanner" },
  { label: "Canlı İzleme", href: "/live" },
  { label: "Raporlar", href: "/report", active: true },
  { label: "Fiyatlandırma", href: "/pricing" },
];

const tabs: { label: string; value: ActiveTab }[] = [
  { label: "Özet", value: "summary" },
  { label: "Bulgular", value: "findings" },
  { label: "Öneriler", value: "suggestions" },
  { label: "Core Web Vitals", value: "vitals" },
  { label: "Sayfa Detayları", value: "pages" },
];

const scoreCards: ScoreCardItem[] = [
  {
    title: "Performance",
    value: "95",
    icon: "speed",
    active: false,
    desc: "LCP, CLS, FCP, yükleme süresi ve render-blocking kaynakların genel değerlendirmesi.",
  },
  {
    title: "SEO",
    value: "88",
    icon: "search",
    active: true,
    desc: "Meta tag, başlık hiyerarşisi, canonical, sitemap ve yapısal veri kontrolleri.",
  },
  {
    title: "Erişilebilirlik",
    value: "90",
    icon: "accessibility",
    active: false,
    desc: "WCAG uyumluluğu, aria-label, kontrast, klavye erişimi ve form label kontrolleri.",
  },
  {
    title: "UX",
    value: "94",
    icon: "flow",
    active: true,
    desc: "Mobil taşmalar, tıklama alanları, form akışı ve kullanıcı etkileşim kontrolü.",
  },
  {
    title: "Güvenlik",
    value: "91",
    icon: "shield",
    active: true,
    desc: "SSL, güvenlik headerları, mixed content ve eski JS kütüphanesi kontrolleri.",
  },
];

const findings: Finding[] = [
  {
    title: "Eksik meta description",
    desc: "24 sayfada tespit edildi",
    level: "KRİTİK",
    icon: "warning",
    tone: "red",
    solution:
      "Öncelikli olarak kategori, ürün ve landing sayfalarına özgün meta description ekleyin. Her açıklama 140-160 karakter arasında olmalı.",
  },
  {
    title: "Mobilde taşan içerik",
    desc: "Ana sayfada viewport dışı eleman",
    level: "KRİTİK",
    icon: "mobile",
    tone: "red",
    solution:
      "Mobil breakpointlerde genişliği sabit verilen kartları, tabloları ve görselleri kontrol edin. max-width, overflow-hidden ve responsive grid kullanın.",
  },
  {
    title: "LCP süresi yüksek",
    desc: "> 2.5s yükleme süresi",
    level: "YÜKSEK",
    icon: "timer",
    tone: "orange",
    solution:
      "Hero görselini WebP/AVIF formatına çevirin, preload kullanın ve render-blocking CSS/JS kaynaklarını azaltın.",
  },
  {
    title: "Kullanılmayan JavaScript",
    desc: "Boyutu %40 azaltılabilir",
    level: "ORTA",
    icon: "code",
    tone: "orange",
    solution:
      "Sayfa özelinde kullanılmayan scriptleri ayırın. Lazy import, dynamic import ve route bazlı bundle ayırma uygulayın.",
  },
  {
    title: "Alt etiketi eksik görseller",
    desc: "12 görselde eksik",
    level: "ORTA",
    icon: "image",
    tone: "orange",
    solution:
      "İçerik anlamı taşıyan görsellere açıklayıcı alt metin ekleyin. Dekoratif görsellerde alt değeri boş bırakılabilir.",
  },
];

const suggestions: Suggestion[] = [
  {
    title: "Meta description ekleyin",
    desc: "Sayfalarınızın %18’inde meta açıklama bulunmuyor. Bu SEO skorunuzu doğrudan etkiler.",
    impact: "Yüksek",
    actions: [
      "Öncelikli olarak e-ticaret kategori sayfalarına odaklanın.",
      "AI araçları kullanarak toplu açıklama üretebilirsiniz.",
    ],
  },
  {
    title: "LCP performansını iyileştirin",
    desc: "Ana görsel yükleme süresi çok uzun.",
    impact: "Yüksek",
    actions: ["WebP’ye dönüştür", "Kritik CSS’i inline yap"],
  },
];

const vitals: Vital[] = [
  {
    metric: "LCP (Largest Contentful Paint)",
    value: "2.3 sn",
    status: "İyi",
    avg: "2.5 sn",
    trend: "↘ İyileşti",
    tone: "green",
    width: "78%",
  },
  {
    metric: "CLS (Cumulative Layout Shift)",
    value: "0.07",
    status: "İyi",
    avg: "0.10",
    trend: "→ Sabit",
    tone: "green",
    width: "86%",
  },
  {
    metric: "INP (Interaction to Next Paint)",
    value: "145 ms",
    status: "İyileştirilmeli",
    avg: "100 ms",
    trend: "↗ Kötüleşti",
    tone: "orange",
    width: "58%",
  },
];

const pages: PageRow[] = [
  {
    path: "/kategori/elektronik",
    score: "68",
    critical: "2 Kritik",
    warning: "4 Uyarı",
    check: "Bugün 14:30",
  },
  {
    path: "/urun/akilli-telefon-pro",
    score: "72",
    critical: "1 Kritik",
    warning: "3 Uyarı",
    check: "Bugün 14:31",
  },
  {
    path: "/hakkimizda",
    score: "88",
    critical: "—",
    warning: "1 Uyarı",
    check: "Bugün 14:32",
  },
];

function getInitialReportUrl() {
  if (typeof window === "undefined") return "https://ornek-site.com";

  return new URLSearchParams(window.location.search).get("url") ?? "https://ornek-site.com";
}

export default function ReportPage() {
  const router = useRouter();

  const [reportUrl] = useState(getInitialReportUrl);
  const [activeTab, setActiveTab] = useState<ActiveTab>("summary");
  const [selectedScore, setSelectedScore] = useState<ScoreCardItem | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [selectedPage, setSelectedPage] = useState<PageRow | null>(null);
  const [shareLink, setShareLink] = useState("");
  const [note, setNote] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [toast, setToast] = useState("");
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);


  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2500);
  };

  const handlePdfDownload = () => {
    showToast("PDF çıktısı için yazdırma ekranı açılıyor.");
    window.print();
  };

  const handleCsvExport = () => {
    const rows = [
      ["Tip", "Başlık", "Açıklama", "Seviye"],
      ...findings.map((item) => ["Bulgu", item.title, item.desc, item.level]),
      ...vitals.map((item) => ["Core Web Vital", item.metric, item.value, item.status]),
      ...pages.map((item) => ["Sayfa", item.path, `Skor: ${item.score}`, item.critical]),
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
    const link = `${window.location.origin}/report?url=${encodeURIComponent(reportUrl)}`;
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
    router.push(`/scanner?url=${encodeURIComponent(reportUrl)}`);
  };

  const handleArchive = () => {
    setArchiveOpen(false);
    showToast("Rapor arşivlendi.");
    router.push("/history");
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#070b15] text-[#e7e9f4]">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:32px_32px]" />
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
                    onClick={() => window.open(reportUrl, "_blank", "noopener,noreferrer")}
                    className="mt-4 flex max-w-full cursor-pointer items-center gap-2 text-left text-[14px] font-medium text-[#d7dce8] transition hover:text-white sm:text-[16px]"
                  >
                    <span className="truncate">{reportUrl}</span>
                    <Icon name="external" className="size-4 shrink-0 text-[#aebcff]" />
                  </button>

                  <div className="mt-5 flex flex-wrap items-center gap-3 text-[13px] font-bold text-[#c0c7d7]">
                    <span className="inline-flex items-center gap-2">
                      <Icon name="calendar" className="size-4 text-[#b6c3ff]" />
                      10 Haz 2025 14:32
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-[#25d18c]" />
                      Tamamlandı
                    </span>
                    <span className="rounded-md bg-white/[0.12] px-3 py-1 text-[12px] text-[#c8cfdd]">
                      Standart Tarama
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handlePdfDownload}
                    className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-white/[0.13] bg-[#080d18]/80 px-4 text-[13px] font-bold text-[#d7dcea] transition hover:border-white/25 hover:bg-white/[0.06]"
                  >
                    <Icon name="download" className="size-4" />
                    PDF İndir
                  </button>

                  <button
                    type="button"
                    onClick={handleCsvExport}
                    className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-white/[0.13] bg-[#080d18]/80 px-4 text-[13px] font-bold text-[#d7dcea] transition hover:border-white/25 hover:bg-white/[0.06]"
                  >
                    <Icon name="download" className="size-4" />
                    CSV Dışa Aktar
                  </button>

                  <button
                    type="button"
                    onClick={handleReAnalyze}
                    className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-[#2f6df6] px-4 text-[13px] font-extrabold text-white shadow-[0_12px_30px_rgba(47,109,246,0.25)] transition hover:bg-[#3b7aff]"
                  >
                    <Icon name="refresh" className="size-4" />
                    Tekrar Analiz Et
                  </button>
                </div>
              </div>

              <section className="mt-8 grid gap-4 lg:grid-cols-[132px_1fr]">
                <OverallScoreCard />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {scoreCards.map((card) => (
                    <ScoreCard
                      key={card.title}
                      {...card}
                      onClick={() => setSelectedScore(card)}
                    />
                  ))}
                </div>
              </section>

              <nav className="mt-7 flex gap-6 overflow-x-auto border-b border-white/[0.08] text-[14px] font-bold text-[#b2bacb]">
                {tabs.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setActiveTab(tab.value)}
                    className={`relative shrink-0 cursor-pointer pb-3 transition hover:text-white ${
                      activeTab === tab.value ? "text-[#e4e9f7]" : "text-[#a5adbe]"
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.value && (
                      <span className="absolute bottom-0 left-0 h-px w-full bg-[#b8c7ff]" />
                    )}
                  </button>
                ))}
              </nav>

              {(activeTab === "summary" || activeTab === "findings" || activeTab === "suggestions") && (
                <div
                  className={`mt-6 grid gap-4 ${
                    activeTab === "summary" ? "lg:grid-cols-2" : "grid-cols-1"
                  }`}
                >
                  {(activeTab === "summary" || activeTab === "findings") && (
                    <FindingsSection onSelect={setSelectedFinding} />
                  )}

                  {(activeTab === "summary" || activeTab === "suggestions") && (
                    <SuggestionsSection onSelect={setSelectedSuggestion} />
                  )}
                </div>
              )}

              {(activeTab === "summary" || activeTab === "vitals") && (
                <VitalsSection />
              )}

              {(activeTab === "summary" || activeTab === "pages") && (
                <PagesSection onSelect={setSelectedPage} />
              )}
            </div>

            <RightPanel
              note={note}
              savedNote={savedNote}
              shareLink={shareLink}
              onNoteChange={setNote}
              onSaveNote={handleSaveNote}
              onShare={handleShareLink}
              onDownload={handleCsvExport}
              onRefresh={handleReAnalyze}
              onArchive={() => setArchiveOpen(true)}
            />
          </div>
        </section>
      </div>

      {selectedScore && (
        <Modal onClose={() => setSelectedScore(null)} maxWidth="max-w-[520px]">
          <ModalHeader title={selectedScore.title} onClose={() => setSelectedScore(null)} />
          <div className="mt-6 rounded-xl border border-white/[0.08] bg-[#080d18]/70 p-5">
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
        <Modal onClose={() => setSelectedFinding(null)} maxWidth="max-w-[560px]">
          <ModalHeader title="Bulgu Detayı" onClose={() => setSelectedFinding(null)} />
          <div className="mt-6 space-y-4">
            <InfoBox label={selectedFinding.level} title={selectedFinding.title} text={selectedFinding.desc} />
            <InfoBox label="Çözüm Önerisi" title="Nasıl düzeltilir?" text={selectedFinding.solution} />
          </div>
        </Modal>
      )}

      {selectedSuggestion && (
        <Modal onClose={() => setSelectedSuggestion(null)} maxWidth="max-w-[560px]">
          <ModalHeader title="Çözüm Önerisi" onClose={() => setSelectedSuggestion(null)} />
          <div className="mt-6 rounded-xl border border-white/[0.08] bg-[#080d18]/70 p-5">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-[20px] font-extrabold">{selectedSuggestion.title}</h3>
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
          <ModalHeader title="Sayfa Detayı" onClose={() => setSelectedPage(null)} />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <DetailBox label="Sayfa Yolu" value={selectedPage.path} />
            <DetailBox label="Skor" value={selectedPage.score} />
            <DetailBox label="Kritik" value={selectedPage.critical} />
            <DetailBox label="Uyarı" value={selectedPage.warning} />
            <DetailBox label="Son Kontrol" value={selectedPage.check} />
            <DetailBox label="Tam URL" value={`${reportUrl}${selectedPage.path}`} />
          </div>
        </Modal>
      )}

      {archiveOpen && (
        <Modal onClose={() => setArchiveOpen(false)} maxWidth="max-w-[460px]">
          <ModalHeader title="Rapor arşivlensin mi?" onClose={() => setArchiveOpen(false)} />
          <p className="mt-5 text-[14px] font-medium leading-6 text-[#aab3c5]">
            Bu rapor aktif raporlar listesinden kaldırılır ve analiz geçmişinde arşivlenmiş olarak görünür.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setArchiveOpen(false)}
              className="h-10 cursor-pointer rounded-md border border-white/[0.12] px-5 text-[13px] font-extrabold text-[#d8deeb] transition hover:bg-white/[0.06]"
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
            Destek talebi için ayarlar sayfasındaki takım ve destek alanını kullanabilirsin.
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
            Daha fazla tarama kredisi, ekip üyeleri ve gelişmiş raporlama için fiyatlandırma sayfasına gidebilirsin.
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

function OverallScoreCard() {
  return (
    <div className="rounded-xl border border-white/[0.09] bg-[#0d1423]/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="mx-auto grid size-[104px] place-items-center rounded-full bg-[conic-gradient(#21c995_0_92%,#202a3c_92%_100%)]">
        <div className="grid size-[80px] place-items-center rounded-full bg-[#0d1423]">
          <span className="text-[31px] font-extrabold tracking-[-0.05em]">92</span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <span className="rounded-md border border-[#14624d] bg-[#0d372e] px-3 py-1 text-[11px] font-extrabold text-[#22d296]">
          HARİKA
        </span>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-center text-[11px] font-bold text-[#aeb6c8]">
        <span className="text-[#25d18c]">↗ 4</span>
        <span>
          önceki
          <br />
          taramaya göre
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
      className="rounded-lg border border-white/[0.09] bg-[#0d1423]/88 p-4 text-left transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.055]"
    >
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[13px] font-extrabold text-[#b7bfce]">
          <Icon name={icon} className="size-4 text-[#aebcff]" />
          {title}
        </h3>
        {active && <span className="size-2 rounded-full bg-[#25d18c]" />}
      </div>

      <div className="mt-8 flex items-end justify-between">
        <span className="text-[25px] font-extrabold tracking-[-0.04em]">{value}</span>
        <span className="h-8 w-14 bg-[linear-gradient(180deg,rgba(37,209,140,0.04),rgba(37,209,140,0.23))]">
          <span className="mt-7 block h-0.5 w-full bg-[#25d18c]" />
        </span>
      </div>
    </button>
  );
}

function FindingsSection({ onSelect }: { onSelect: (item: Finding) => void }) {
  return (
    <section className="rounded-xl border border-white/[0.09] bg-[#0d1423]/88 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[22px] font-extrabold tracking-[-0.04em]">Kritik Bulgular</h2>
        <span className="shrink-0 rounded-md border border-[#783438] bg-[#32171d] px-2 py-1 text-[11px] font-extrabold text-[#ff777d]">
          5 Önemli Bulgu
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {findings.map((item) => (
          <FindingItem key={item.title} {...item} onClick={() => onSelect(item)} />
        ))}
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
      className="grid w-full cursor-pointer grid-cols-[24px_1fr_auto_14px] items-center gap-3 rounded-lg p-2 text-left transition hover:bg-white/[0.04]"
    >
      <Icon name={icon} className={`size-5 ${tone === "red" ? "text-[#ff9a9f]" : "text-[#f5a623]"}`} />
      <div className="min-w-0">
        <h3 className="truncate text-[14px] font-extrabold leading-5 text-[#dbe1ee]">{title}</h3>
        <p className="mt-1 truncate text-[11px] font-bold text-[#9ba5b8]">{desc}</p>
      </div>
      <span className={`rounded px-2 py-1 text-[10px] font-extrabold ${toneClass}`}>
        {level}
      </span>
      <span className="text-[#aeb6c8]">›</span>
    </button>
  );
}

function SuggestionsSection({ onSelect }: { onSelect: (item: Suggestion) => void }) {
  return (
    <section className="rounded-xl border border-white/[0.09] bg-[#0d1423]/88 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <h2 className="flex items-center gap-2 text-[22px] font-extrabold tracking-[-0.04em]">
        ✨ Akıllı Çözüm Önerileri
      </h2>

      <div className="mt-5 space-y-4">
        {suggestions.map((item) => (
          <SuggestionCard key={item.title} {...item} onClick={() => onSelect(item)} />
        ))}
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
      className="w-full cursor-pointer rounded-lg border border-white/[0.06] bg-white/[0.06] p-4 text-left transition hover:border-white/15 hover:bg-white/[0.085]"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-[15px] font-extrabold leading-5 text-[#f1f4fb]">{title}</h3>
        <span className="shrink-0 text-right text-[11px] font-extrabold text-[#f59d23]">
          ⚡ Etki:
          <br />
          {impact}
        </span>
      </div>

      <p className="mt-2 text-[12px] font-medium leading-5 text-[#c1c8d8]">{desc}</p>

      <ul className="mt-3 space-y-1 text-[11px] font-medium leading-4 text-[#d2d8e6]">
        {actions.map((action) => (
          <li key={action}>• {action}</li>
        ))}
      </ul>
    </button>
  );
}

function VitalsSection() {
  return (
    <section className="mt-6 rounded-xl border border-white/[0.09] bg-[#0d1423]/88 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <h2 className="text-[22px] font-extrabold tracking-[-0.04em]">Core Web Vitals</h2>

      <div className="mt-4 overflow-x-auto border-t border-white/[0.08] pt-4">
        <table className="w-full min-w-[680px] border-collapse">
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
            {vitals.map((item) => (
              <tr key={item.metric} className="border-t border-white/[0.05]">
                <td className="max-w-[220px] py-3 pr-4 text-[13px] font-extrabold leading-5 text-[#cfd5e2]">
                  {item.metric}
                </td>
                <td className={`py-3 pr-4 text-[13px] font-extrabold ${item.tone === "orange" ? "text-[#f49b3a]" : "text-[#dce2ef]"}`}>
                  {item.value}
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-20 overflow-hidden rounded-full bg-white/[0.12]">
                      <span
                        className={`block h-full rounded-full ${
                          item.tone === "orange" ? "bg-[#f49b3a]" : "bg-[#25d18c]"
                        }`}
                        style={{ width: item.width }}
                      />
                    </span>
                    <span className={`text-[12px] font-bold ${item.tone === "orange" ? "text-[#f49b3a]" : "text-[#25d18c]"}`}>
                      {item.status}
                    </span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-[13px] font-bold text-[#aeb6c8]">{item.avg}</td>
                <td className={`py-3 pr-4 text-[13px] font-extrabold ${item.tone === "orange" ? "text-[#ff8f67]" : "text-[#25d18c]"}`}>
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

function PagesSection({ onSelect }: { onSelect: (item: PageRow) => void }) {
  return (
    <section className="mt-6 overflow-hidden rounded-xl border border-white/[0.09] bg-[#0d1423]/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="px-4 py-4">
        <h2 className="text-[22px] font-extrabold tracking-[-0.04em]">En Çok Etkilenen Sayfalar</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-y border-white/[0.08] text-left text-[13px] font-extrabold text-[#9fa8bb]">
              <th className="px-4 py-3">Sayfa Yolu</th>
              <th className="px-4 py-3">Skor</th>
              <th className="px-4 py-3">Kritik</th>
              <th className="px-4 py-3">Uyarı</th>
              <th className="px-4 py-3">Son Kontrol</th>
              <th className="px-4 py-3 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.path} className="border-b border-white/[0.055] transition hover:bg-white/[0.03]">
                <td className="px-4 py-4 text-[13px] font-extrabold text-[#d9dfec]">{page.path}</td>
                <td className={`px-4 py-4 text-[13px] font-extrabold ${Number(page.score) < 80 ? "text-[#f59d23]" : "text-[#25d18c]"}`}>
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
                  <span className="rounded bg-[#302919] px-2 py-1 text-[10px] font-extrabold text-[#f5a623]">
                    {page.warning}
                  </span>
                </td>
                <td className="px-4 py-4 text-[13px] font-bold text-[#aeb6c8]">{page.check}</td>
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
      </div>
    </section>
  );
}

function RightPanel({
  note,
  savedNote,
  shareLink,
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
  onNoteChange: (value: string) => void;
  onSaveNote: () => void;
  onShare: () => void;
  onDownload: () => void;
  onRefresh: () => void;
  onArchive: () => void;
}) {
  return (
    <aside className="space-y-5 xl:sticky xl:top-20 xl:self-start">
      <section className="rounded-xl border border-white/[0.09] bg-[#0d1423]/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <h2 className="text-[20px] font-extrabold tracking-[-0.04em]">Tarama Bilgileri</h2>
        <div className="mt-4 border-t border-white/[0.08] pt-5">
          {[
            ["Toplam Sayfa", "128"],
            ["Süre", "08:47"],
            ["Motor", "Precheck Crawler v2"],
            ["Kapsam", "Tüm Site"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-5 py-3 text-[14px] font-bold">
              <span className="text-[#a5adbe]">{label}</span>
              <span className="text-right text-[#dbe1ee]">{value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-white/[0.09] bg-[#0d1423]/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <h2 className="text-[20px] font-extrabold tracking-[-0.04em]">Rapor İşlemleri</h2>
        <div className="mt-4 border-t border-white/[0.08] pt-5">
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
            <p className="mt-3 break-all rounded-lg border border-white/[0.08] bg-[#080d18]/70 p-3 text-[11px] font-bold text-[#9fa8bb]">
              {shareLink}
            </p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onDownload}
              className="h-9 cursor-pointer rounded-md border border-white/[0.09] bg-[#080d18] text-[12px] font-extrabold text-[#c4cbda] transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              ↓ İndir
            </button>
            <button
              type="button"
              onClick={onRefresh}
              className="h-9 cursor-pointer rounded-md border border-white/[0.09] bg-[#080d18] text-[12px] font-extrabold text-[#c4cbda] transition hover:border-white/20 hover:bg-white/[0.06]"
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

      <section className="rounded-xl border border-white/[0.09] bg-[#0d1423]/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <h2 className="text-[20px] font-extrabold tracking-[-0.04em]">Notlar</h2>
        <textarea
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder="Bu rapora özel not ekleyin..."
          className="mt-4 h-32 w-full resize-none rounded-lg border border-white/[0.08] bg-[#080d18] p-4 text-[13px] font-medium text-white outline-none placeholder:text-[#697386] focus:border-[#8ea1e8]"
        />
        <button
          type="button"
          onClick={onSaveNote}
          className="mt-4 h-10 w-full cursor-pointer rounded-md bg-[#2f6df6] text-[14px] font-extrabold text-white transition hover:bg-[#3b7aff]"
        >
          Kaydet
        </button>

        {savedNote && (
          <p className="mt-3 rounded-lg border border-white/[0.08] bg-[#080d18]/70 p-3 text-[12px] font-medium leading-5 text-[#aab3c5]">
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
    <aside className="hidden w-[208px] shrink-0 border-r border-white/[0.08] bg-[#0c111d]/92 lg:flex lg:flex-col">
      <div className="flex h-[58px] items-center gap-3 border-b border-white/[0.07] px-5">
        <div className="grid size-7 place-items-center rounded-md text-[#aebcff]">
          <Icon name="brand" className="size-6" />
        </div>
        <div>
          <p className="text-[16px] font-extrabold tracking-[-0.03em] text-[#aebcff]">Precheck AI</p>
          <p className="text-[11px] font-medium text-[#9ca4b6]">Enterprise Analytics</p>
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
                  ? "border border-[#8ea1e8] bg-white/[0.08] text-[#dbe4ff]"
                  : "text-[#c2c8d6] hover:bg-white/[0.06] hover:text-white"
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
          className="flex h-9 w-full cursor-pointer items-center gap-3 rounded-md px-3 text-[13px] font-bold text-[#c2c8d6] transition hover:bg-white/[0.06] hover:text-white"
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
    <header className="flex h-[58px] items-center justify-between border-b border-white/[0.08] bg-[#080d18]/75 px-5 backdrop-blur-xl">
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
        <button type="button" className="cursor-pointer text-[#aab2c4] transition hover:text-white">
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
            className="flex cursor-pointer items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 transition hover:bg-white/[0.07]"
          >
            <span className="grid size-5 place-items-center rounded bg-[#273047] text-[10px] font-extrabold text-[#c9d2e6]">
              AD
            </span>
            <div className="text-left">
              <p className="text-[11px] font-extrabold text-[#d8dce8]">Acme Dijital</p>
              <p className="text-[10px] font-medium text-[#858fa4]">Pro Workspace</p>
            </div>
            <span className="text-[#8b94a7]">⌄</span>
          </button>

          {workspaceOpen && (
            <div className="absolute right-0 top-12 z-40 w-[190px] rounded-lg border border-white/[0.09] bg-[#0d1423] p-2 shadow-2xl">
              {["Acme Dijital", "Yeni Workspace", "Workspace Ayarları"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={onWorkspaceClose}
                  className="flex h-9 w-full cursor-pointer items-center rounded-md px-3 text-left text-[12px] font-bold text-[#b8c0d0] transition hover:bg-white/[0.07] hover:text-white"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="hidden items-center gap-3 border-l border-white/[0.09] pl-4 md:flex">
          <div>
            <p className="text-right text-[12px] font-bold text-[#d8dce8]">A. Selim</p>
            <p className="text-right text-[10px] font-medium text-[#858fa4]">Admin</p>
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

function InfoBox({ label, title, text }: { label: string; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#080d18]/70 p-5">
      <p className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#aebcff]">
        {label}
      </p>
      <h3 className="mt-2 text-[18px] font-extrabold">{title}</h3>
      <p className="mt-3 text-[14px] font-medium leading-6 text-[#aab3c5]">{text}</p>
    </div>
  );
}

function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#080d18]/70 p-4">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#7f899d]">
        {label}
      </p>
      <p className="mt-2 break-words text-[14px] font-bold text-[#dce2ef]">{value}</p>
    </div>
  );
}

function Icon({ name, className = "" }: { name: string; className?: string }) {
  const paths: Record<string, ReactNode> = {
    brand: <path d="M4 16 9 9l4 4 7-9M4 20h16" />,
    grid: <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />,
    search: <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4" />,
    live: <path d="M4 12a8 8 0 0 1 4-6.9M20 12a8 8 0 0 0-4-6.9M8 12a4 4 0 0 1 2-3.5M16 12a4 4 0 0 0-2-3.5M12 13h.01" />,
    history: <path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.6M4 4v4.6h4.6M12 8v5l3 2" />,
    file: <path d="M6 3h9l4 4v14H6V3ZM14 3v5h5M9 13h6M9 17h6" />,
    team: <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 20a5 5 0 0 1 10 0M11 20a5 5 0 0 1 10 0" />,
    settings: <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM4 12h2M18 12h2M12 4v2M12 18v2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4" />,
    help: <path d="M12 18h.01M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-.9.8-1.7 1.4-1.7 3.2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />,
    bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />,
    download: <path d="M12 3v12M8 11l4 4 4-4M5 20h14" />,
    refresh: <path d="M4 12a8 8 0 0 1 13.6-5.6L20 9M20 4v5h-5M20 12a8 8 0 0 1-13.6 5.6L4 15M4 20v-5h5" />,
    calendar: <path d="M7 3v4M17 3v4M4 8h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" />,
    external: <path d="M14 4h6v6M20 4l-9 9M20 14v6H4V4h6" />,
    speed: <path d="M4 14a8 8 0 1 1 16 0M12 14l4-4M9 18h6" />,
    accessibility: <path d="M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM4 8h16M12 8v13M8 21l4-8 4 8" />,
    flow: <path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01M7 7h10M7 7v10M17 7v10M7 17h10" />,
    shield: <path d="M12 3 5 6v6c0 4.5 2.9 7.7 7 9 4.1-1.3 7-4.5 7-9V6l-7-3Z" />,
    warning: <path d="M12 4 21 20H3L12 4ZM12 9v5M12 17h.01" />,
    mobile: <path d="M9 2h6v20H9zM12 18h.01" />,
    timer: <path d="M12 8v5l3 2M9 2h6M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />,
    code: <path d="m8 9-4 3 4 3M16 9l4 3-4 3" />,
    image: <path d="M4 5h16v14H4zM8 13l2-2 3 3 2-2 3 4M8 9h.01" />,
    eye: <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />,
    link: <path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1" />,
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