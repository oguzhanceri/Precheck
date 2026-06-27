import Link from "next/link";
import type { ReactNode } from "react";

const features = [
  {
    icon: "refresh",
    title: "Otomatik Test Akışı",
    desc: "CI/CD süreçlerinize entegre olun, her deploy öncesi otomatik testleri tetikleyin ve hataları canlıya çıkmadan yakalayın.",
  },
  {
    icon: "doc",
    title: "Detaylı Hata Raporu",
    desc: "Hataların tam olarak nerede olduğunu, neden kaynaklandığını ve nasıl çözüleceğini gösteren aksiyon odaklı raporlar alın.",
  },
  {
    icon: "checklist",
    title: "Yayın Öncesi Kontrol",
    desc: "Staging ortamınızı tarayın, kırık linkleri, eksik varlıkları ve performans darboğazlarını prod öncesi temizleyin.",
  },
  {
    icon: "monitor",
    title: "Responsive Kontrol",
    desc: "Farklı ekran boyutlarında otomatik render alarak taşan içerikleri, gizlenen butonları ve mobil uyumluluk sorunlarını tespit edin.",
  },
  {
    icon: "search",
    title: "SEO Denetimi",
    desc: "Meta etiketleri, canonical linkleri, sitemap geçerliliğini ve on-page SEO metriklerini otomatik olarak analiz edin.",
  },
  {
    icon: "cursor",
    title: "UI / Etkileşim Hataları",
    desc: "Çalışmayan butonları, form validasyon hatalarını ve konsol loglarındaki JavaScript istisnalarını simüle ederek bulun.",
  },
];

const trustItems = [
  { icon: "card", label: "Kredi kartı gerekmez" },
  { icon: "timer", label: "2 dakikada ilk rapor" },
  { icon: "cloud", label: "Kurulum yok" },
  { icon: "pdf", label: "PDF / CSV rapor" },
  { icon: "shield", label: "Yayın öncesi kalite kontrol" },
];

const workflowSteps = [
  {
    icon: "link",
    title: "URL gir",
    desc: "Analiz etmek istediğiniz web sitesinin veya staging ortamının adresini sisteme girin.",
  },
  {
    icon: "cpu",
    title: "Otomatik testleri çalıştır",
    desc: "AI motorumuz 100'den fazla kontrol noktasını simüle edilmiş cihazlarda tarasın.",
  },
  {
    icon: "chart",
    title: "Öncelikli raporu al",
    desc: "Hataları, önem derecelerini ve çözüm önerilerini içeren detaylı raporunuzu inceleyin.",
  },
];

const insights = [
  {
    icon: "bulb",
    title: "Akıllı Çözüm Önerileri",
    desc: "Her hata için doğrudan uygulanabilir kod düzeyinde çözüm tavsiyeleri alın.",
  },
  {
    icon: "gauge",
    title: "Core Web Vitals Analizi",
    desc: "Google sıralamalarınızı etkileyen LCP, INP ve CLS metriklerinin detaylı dökümü.",
  },
  {
    icon: "share",
    title: "Kolay Paylaşım",
    desc: "Raporları PDF, CSV olarak indirin veya güvenli bir link ile ekibinizle paylaşın.",
  },
];

const audiences = [
  {
    icon: "terminal",
    title: "Frontend Geliştiriciler",
    desc: "Kodunuzun performansını ölçün, best practice'lere uygunluğunu test edin ve debug süresini azaltın.",
  },
  {
    icon: "briefcase",
    title: "Ajanslar",
    desc: "Müşterilerinize teslim edeceğiniz projelerin hatasız olduğunu kanıtlayın ve beyaz etiketli raporlar sunun.",
  },
  {
    icon: "grid",
    title: "Ürün Ekipleri",
    desc: "Yeni özelliklerin mevcut deneyimi bozmadığından emin olun, metrikleri ekipler arası şeffafça paylaşın.",
  },
  {
    icon: "bug",
    title: "QA Uzmanları",
    desc: "Manuel test yükünü azaltın. Regresyonları otomatik yakalayarak test süreçlerini hızlandırın.",
  },
];

function Icon({
  name,
  className = "size-5",
}: {
  name: string;
  className?: string;
}) {
  const common = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  };

  const paths: Record<string, ReactNode> = {
    logo: (
      <>
        <path d="M7 17V9" />
        <path d="M12 17V5" />
        <path d="M17 17v-4" />
        <path d="M5 19h14" />
      </>
    ),
    sparkles: (
      <>
        <path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3z" />
        <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z" />
        <path d="M5 13l.7 1.8L7.5 15l-1.8.7L5 17.5l-.7-1.8L2.5 15l1.8-.7L5 13z" />
      </>
    ),
    play: <path d="M8 5v14l11-7-11-7z" />,
    file: (
      <>
        <path d="M7 3h7l5 5v13H7z" />
        <path d="M14 3v6h5" />
        <path d="M10 13h6" />
        <path d="M10 17h4" />
      </>
    ),
    card: (
      <>
        <path d="M3 7h18v10H3z" />
        <path d="M3 10h18" />
        <path d="M7 15h3" />
        <path d="M2 4l20 16" />
      </>
    ),
    timer: (
      <>
        <path d="M10 2h4" />
        <path d="M12 14l3-3" />
        <circle cx="12" cy="14" r="7" />
      </>
    ),
    cloud: (
      <>
        <path d="M17.5 18H8a5 5 0 1 1 1.6-9.7A6 6 0 0 1 21 11.5 3.5 3.5 0 0 1 17.5 18z" />
        <path d="M9 15h6" />
      </>
    ),
    pdf: (
      <>
        <path d="M6 3h9l3 3v15H6z" />
        <path d="M9 15v-4h1.5a1.5 1.5 0 0 1 0 3H9" />
        <path d="M14 11v4" />
        <path d="M14 11h2" />
        <path d="M14 13h1.5" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z" />
        <path d="M9 12l2 2 4-5" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 12a8 8 0 0 1-13.7 5.7L4 15" />
        <path d="M4 15v5h5" />
        <path d="M4 12A8 8 0 0 1 17.7 6.3L20 9" />
        <path d="M20 9V4h-5" />
      </>
    ),
    doc: (
      <>
        <path d="M6 3h9l3 3v15H6z" />
        <path d="M15 3v4h4" />
        <path d="M9 11h6" />
        <path d="M9 15h6" />
      </>
    ),
    checklist: (
      <>
        <path d="M6 4h12v16H6z" />
        <path d="M9 9l1 1 2-2" />
        <path d="M14 9h1" />
        <path d="M9 15l1 1 2-2" />
        <path d="M14 15h1" />
      </>
    ),
    monitor: (
      <>
        <path d="M3 5h18v12H3z" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
        <path d="M7 9h5v4H7z" />
        <path d="M16 9h1" />
        <path d="M16 13h1" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="6" />
        <path d="M16 16l4 4" />
        <path d="M9 11l1.5 1.5L14 9" />
      </>
    ),
    cursor: (
      <>
        <path d="M5 4l14 8-6 1.5L10 20z" />
        <path d="M13 13l4 6" />
      </>
    ),
    link: (
      <>
        <path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1 1" />
        <path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 1 0 12 20.1l1-1" />
      </>
    ),
    cpu: (
      <>
        <path d="M8 8h8v8H8z" />
        <path d="M4 10h4" />
        <path d="M4 14h4" />
        <path d="M16 10h4" />
        <path d="M16 14h4" />
        <path d="M10 4v4" />
        <path d="M14 4v4" />
        <path d="M10 16v4" />
        <path d="M14 16v4" />
      </>
    ),
    chart: (
      <>
        <path d="M5 19V5" />
        <path d="M19 19H5" />
        <path d="M9 16v-5" />
        <path d="M13 16V8" />
        <path d="M17 16v-3" />
      </>
    ),
    bulb: (
      <>
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M8 14a6 6 0 1 1 8 0c-1 1-1 2-1 4H9c0-2 0-3-1-4z" />
      </>
    ),
    gauge: (
      <>
        <path d="M4 14a8 8 0 1 1 16 0" />
        <path d="M12 14l4-4" />
        <path d="M8 18h8" />
      </>
    ),
    share: (
      <>
        <path d="M8 12l8-5" />
        <path d="M8 12l8 5" />
        <circle cx="5" cy="12" r="3" />
        <circle cx="19" cy="6" r="3" />
        <circle cx="19" cy="18" r="3" />
      </>
    ),
    terminal: (
      <>
        <path d="M3 6h18v12H3z" />
        <path d="M7 10l3 2-3 2" />
        <path d="M12 15h5" />
      </>
    ),
    briefcase: (
      <>
        <path d="M10 6V4h4v2" />
        <path d="M4 7h16v12H4z" />
        <path d="M4 12h16" />
      </>
    ),
    grid: (
      <>
        <path d="M4 4h6v6H4z" />
        <path d="M14 4h6v6h-6z" />
        <path d="M4 14h6v6H4z" />
        <path d="M14 14h6v6h-6z" />
      </>
    ),
    bug: (
      <>
        <path d="M8 8a4 4 0 0 1 8 0v7a4 4 0 0 1-8 0z" />
        <path d="M3 13h5" />
        <path d="M16 13h5" />
        <path d="M4 19l4-3" />
        <path d="M20 19l-4-3" />
        <path d="M10 4l-1-2" />
        <path d="M14 4l1-2" />
      </>
    ),
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  };

  return <svg {...common}>{paths[name] ?? paths.chart}</svg>;
}

function Logo() {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5">
      <span className="flex size-8 items-center justify-center rounded-md bg-[#2f6df6] text-white shadow-[0_12px_34px_rgba(47,109,246,0.35)] transition lg:group-hover:scale-105 duration-500">
        <Icon name="logo" className="size-4" />
      </span>
      <span className="text-[21px] font-bold tracking-[-0.04em] text-[#e5e7ef]">
        Precheck AI
      </span>
    </Link>
  );
}

function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <h2 className="text-balance max-lg:text-[31px] font-bold leading-tight tracking-[-0.055em] text-[#e7e9f3] text-[34px]">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-[#b3b7c7]">{desc}</p>
    </div>
  );
}

function FeatureCard({ item }: { item: (typeof features)[number] }) {
  return (
    <a
      href="/scanner"
      className="group rounded-2xl border border-white/8 bg-[#090d16]/90 p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition duration-300 hover:-translate-y-1 hover:border-[#3d5ed7]/45 hover:bg-[#101621] md:p-9"
    >
      <div className="flex size-12 items-center justify-center rounded-xl border border-[#4e69cb]/60 bg-[#172448] text-[#a9bbff] shadow-[inset_0_0_18px_rgba(94,128,255,0.14)]">
        <Icon name={item.icon} />
      </div>
      <h3 className="mt-8 text-[20px] font-bold tracking-[-0.04em] text-[#d8dbe6]">
        {item.title}
      </h3>
      <p className="mt-3 max-w-lg text-[15px] font-medium leading-6 text-[#969ba9]">
        {item.desc}
      </p>
      <div className="mt-7 inline-flex items-center gap-2 text-[15px] font-bold text-[#aebeff] transition hover:text-white">
        Detayları gör{" "}
        <Icon
          name="arrow"
          className="size-4 transition group-hover:translate-x-1"
        />
      </div>
    </a>
  );
}

function HeroPreview() {
  return (
    <div className="relative mx-auto w-full rounded-[17px] border border-white/9 bg-[#111724] p-2 shadow-[0_30px_110px_rgba(0,0,0,0.45)] lg:mr-0">
      <div className="rounded-[14px] border border-white/6 bg-[#0d111c] p-5 md:p-7">
        <div className="flex items-center justify-between max-xl:flex-col gap-4 border-b border-white/6 pb-6">
          <div className="flex items-center gap-3.5 max-xl:w-full">
            <span className="flex size-9 items-center justify-center rounded-lg border border-white/6 bg-[#1b2030] text-[#aebdff]">
              <Icon name="search" className="size-5" />
            </span>
            <div>
              <p className="text-[17px] font-bold leading-5 tracking-[-0.04em] text-[#d9dce7]">
                Yeni Kapsamlı Tarama
              </p>
              <p className="mt-1 text-xs font-medium text-[#a2a6b5]">
                Canlı Ortam
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 overflow-hidden rounded-lg border border-white/4 bg-[#1b202c] p-1 xl:max-w-82.5 max-xl:min-w-full">
            <div className="flex-1 truncate px-4 py-2.5 text-[15px] font-semibold text-[#afb3c1]">
              https://ornek-site.com
            </div>
            <Link
              href="/scanner"
              className="inline-flex items-center gap-1.5 rounded-md bg-[#2f6df6] px-3 py-2 text-sm font-bold text-white shadow-[0_14px_28px_rgba(47,109,246,0.28)]"
            >
              <Icon name="play" className="size-4" /> Başlat
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1.27fr]">
          <div className="grid gap-5 md:grid-cols-[0.85fr_1.15fr] xl:contents">
            <div className="rounded-xl border border-white/6 bg-[#1b202b] p-5 col-span-2 text-center">
              <p className="text-xs font-bold text-[#9da2b0]">Genel Sağlık</p>
              <div className="mx-auto mt-4 grid size-23 place-items-center rounded-full bg-[conic-gradient(#34d69b_0_76%,#263040_76%_100%)] p-1.5">
                <div className="grid size-full place-items-center rounded-full bg-[#1b202b] text-[24px] font-bold tracking-[-0.04em] text-[#d9dce7]">
                  92
                </div>
              </div>
              <span className="mt-4 inline-flex rounded-md border border-[#1a6f55] bg-[#103f34] px-3 py-1 text-xs font-bold text-[#24d598]">
                Mükemmel
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 xl:grid-cols-1 max-xl:col-span-2">
              {[
                ["Performans", "96", "gauge"],
                ["SEO", "88", "search"],
                ["Erişilebilirlik", "91", "cursor"],
                ["UX", "93", "link"],
                ["Güvenlik", "98", "shield"],
              ].map(([label, value, icon], index) => (
                <div
                  key={label}
                  className={
                    index === 4 ? "col-span-2 xl:col-span-1" : undefined
                  }
                >
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-white/4 bg-[#191e2a] px-3 py-3">
                    <span className="flex min-w-0 items-center gap-2 text-xs font-semibold text-[#9da2b0]">
                      <Icon
                        name={icon}
                        className="size-4 shrink-0 text-[#a9bbff]"
                      />
                      <span className="truncate">{label}</span>
                    </span>
                    <strong
                      className={
                        value === "88" ? "text-[#f3d64d]" : "text-[#3be1a0]"
                      }
                    >
                      {value}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/6 bg-[#1b202b] p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#a5a9b7]">
                Aktivite Günlüğü
              </h3>
            </div>
            <div className="mt-5 space-y-5 border-l border-white/8 pl-4">
              {[
                ["Analiz tamamlandı", "Şimdi", "bg-[#34d69b]"],
                ["12 kritik kontrol tamamlandı", "2 sn önce", "bg-[#b4c2ff]"],
                ["Lighthouse skorları alındı", "5 sn önce", "bg-[#b4c2ff]"],
                ["Tarama başlatıldı", "8 sn önce", "bg-[#b4c2ff]"],
              ].map(([title, time, dot]) => (
                <div key={title} className="relative">
                  <span
                    className={`absolute -left-5.25 top-1.5 size-2 rounded-full ${dot}`}
                  />
                  <p className="text-xs font-bold leading-4 text-[#d3d6e0]">
                    {title}
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-[#6f7483]">
                    {time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-white/6 bg-[#1b202b] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#a5a9b7]">
              Bulunan Sorunlar
            </h3>
            <span className="text-[11px] font-semibold text-[#7b8190]">
              3 Toplam
            </span>
          </div>
          <div className="space-y-4">
            {[
              [
                "Eksik meta description",
                "Kritik",
                "bg-[#ff6f73]",
                "border-red-400/20 bg-red-400/10 text-red-300",
              ],
              [
                "Büyük görsel boyutu (hero-img.jpg)",
                "Yüksek",
                "bg-[#f0c94a]",
                "border-amber-400/20 bg-amber-400/10 text-amber-300",
              ],
              [
                "Contrast oranı düşük metin (Footer)",
                "Orta",
                "bg-[#6caeff]",
                "border-blue-400/20 bg-blue-400/10 text-blue-300",
              ],
            ].map(([title, level, dot, pill]) => (
              <div
                key={title}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`size-1.5 shrink-0 rounded-full ${dot}`} />
                  <span className="truncate text-xs font-semibold text-[#c0c4d0]">
                    {title}
                  </span>
                </div>
                <span
                  className={`rounded-md border px-2 py-1 text-[11px] font-bold ${pill}`}
                >
                  {level}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportMockup() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/9 bg-[#0b101b] shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
      <div className="flex items-center justify-between border-b border-white/8 bg-[#101621] px-5 py-3">
        <div className="flex gap-2">
          <span className="size-2.5 rounded-full bg-[#f0525a]" />
          <span className="size-2.5 rounded-full bg-[#f0b543]" />
          <span className="size-2.5 rounded-full bg-[#2bbf79]" />
        </div>
        <div className="hidden rounded-md bg-white/[0.035] px-4 py-1.5 text-xs font-bold tracking-[0.08em] text-[#838899] sm:block">
          precheck.ai/report/xyz-123
        </div>
        <div className="flex gap-3 text-[#8f96ab]">
          <Icon name="pdf" className="size-4" />
          <Icon name="share" className="size-4" />
        </div>
      </div>

      <div className="p-5 md:p-8">
        <div className="flex flex-col gap-4 border-b border-white/4 pb-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-[26px] font-bold tracking-[-0.055em] text-[#e4e7f0]">
              E-ticaret Ana Sayfa Analizi
            </h3>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm font-semibold text-[#8f96a6]">
              <span>◷ Bugün 14:30</span>
              <span>▯ Mobil (3G)</span>
            </div>
          </div>
          <span className="inline-flex w-fit rounded-lg border border-red-400/20 bg-red-500/12 px-4 py-2 text-sm font-bold text-[#ff747c]">
            ● 2 Kritik Hata Bulundu
          </span>
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-3">
          {[
            [
              "LCP (Largest Contentful Paint)",
              "3.2s",
              "İyileştirilmeli",
              "text-[#f6c84d]",
              "border-amber-400/20 bg-amber-400/10 text-amber-300",
            ],
            [
              "INP (Interaction to Next Paint)",
              "42ms",
              "İyi",
              "text-[#31d89b]",
              "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
            ],
            [
              "CLS (Cumulative Layout Shift)",
              "0.28",
              "Kötü",
              "text-[#ff747c]",
              "border-red-400/20 bg-red-400/10 text-red-300",
            ],
          ].map(([label, value, status, color, pill]) => (
            <div
              key={label}
              className="rounded-xl border border-white/5.5 bg-[#1b202c] p-5"
            >
              <p className="text-xs font-bold text-[#9298a8]">{label}</p>
              <div className="mt-2 flex items-center gap-2">
                <strong
                  className={`text-[33px] max-xl:text-[26px] max-lg:text-[22px] font-bold tracking-[-0.03em] ${color}`}
                >
                  {value}
                </strong>
                <span
                  className={`rounded-md border px-2 py-1 text-[10px] font-bold ${pill}`}
                >
                  {status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-[#ff4c57]/45 bg-[#240e18] p-5 shadow-[0_0_0_1px_rgba(255,76,87,0.06)] md:p-6">
          <div className="flex items-start gap-4 max-md:w-full max-md:overflow-x-auto">
            <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border border-red-400 text-xs font-bold text-[#ff6068]">
              !
            </span>
            <div>
              <h4 className="text-[17px] font-bold tracking-[-0.035em] text-[#e7e9f3]">
                Cumulative Layout Shift çok yüksek (Hero Section)
              </h4>
              <p className="mt-2 text-[14px] font-medium leading-6 text-[#a6abb8]">
                Sayfa yüklenirken hero görseli için alan ayrılmamış. Bu durum
                içerik kaymasına ve kötü kullanıcı deneyimine neden oluyor. LCP
                metriklerinizi de olumsuz etkiliyor.
              </p>
              <div className="mt-5 rounded-lg bg-[#222632] p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#aeb6c8]">
                  ‹› Çözüm Önerisi
                </p>
                <pre className="overflow-x-auto rounded-md bg-[#080c13] px-4 py-3 text-sm font-bold text-[#53ddb0]">
                  <code>
                    {'<img src="hero.jpg" width="800" height="400" />'}
                  </code>
                </pre>
                <p className="mt-3 text-xs font-medium leading-5 text-[#8f96a6]">
                  Görsel etiketine `width` ve `height` niteliklerini ekleyerek
                  tarayıcının alanı önceden ayırmasını sağlayın.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070b14] text-[#e6e8f2]">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px)] bg-size-[32px_32px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(73,111,255,0.16),transparent_34rem),radial-gradient(circle_at_30%_45%,rgba(88,120,255,0.08),transparent_40rem)]" />

      <header className="relative z-20 border-b border-white/5.5 bg-[#070a12]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-6 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-11 text-[15px] font-medium text-[#b0b4c2] lg:flex">
            <a className="transition hover:text-white" href="#features">
              Özellikler
            </a>
            <a className="transition hover:text-white" href="#workflow">
              Nasıl Çalışır
            </a>
            <a className="transition hover:text-white" href="#reports">
              Raporlar
            </a>
            <Link className="transition hover:text-white" href="/pricing">
              Fiyatlandırma
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              className="hidden text-[15px] font-medium text-[#b8bcc8] transition hover:text-white sm:block"
              href="/auth"
            >
              Giriş Yap
            </Link>
            <Link
              href="/scanner"
              className="rounded-lg bg-[#2f6df6] px-5 py-3 text-[15px] font-bold text-white shadow-[0_14px_36px_rgba(47,109,246,0.35)] transition hover:-translate-y-0.5 hover:bg-[#3f7bff]"
            >
              Ücretsiz Dene
            </Link>
          </div>
        </div>
      </header>

      <section className="relative z-10 border-b border-white/4">
        <div className="mx-auto grid max-w-[1600px] items-center gap-12 px-6 xl:grid-cols-[0.98fr_1.3fr] py-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#58679c] bg-[#111827]/70 px-3.5 py-2 text-[13px] font-bold tracking-[0.02em] text-[#aebbff]">
              <Icon name="sparkles" className="size-4" /> AI Destekli Web Kalite
              Analizi v2.0
            </div>
            <h1 className="mt-7 xl:max-w-170 text-balance text-[48px] font-extrabold leading-[1.04] tracking-[-0.04em] text-[#e7e9f3] max-sm:text-[32px] max-lg:text-[42px]">
              Sitenizi canlıya almadan önce tüm{" "}
              <span className="bg-linear-to-r from-[#a8bbff] to-[#2f6df6] bg-clip-text text-transparent">
                kritik hataları
              </span>{" "}
              yakalayın.
            </h1>
            <p className="mt-8 xl:max-w-156.25 text-[20px] font-medium leading-8 text-[#b8bdcb]">
              Performans, mobil uyumluluk, SEO, erişilebilirlik, güvenlik ve
              etkileşim sorunlarını tek taramada analiz edin. Yayına çıkmadan
              önce detaylı rapor alın, riskleri minimize edin.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/scanner"
                className="inline-flex h-12 items-center justify-center gap-3 rounded-lg bg-[#2f6df6] px-7 text-[16px] font-bold text-white shadow-[0_14px_38px_rgba(47,109,246,0.34)] transition hover:-translate-y-0.5 hover:bg-[#3c7aff]"
              >
                <Icon name="play" className="size-5 fill-white" /> Analiz Başlat
              </Link>
              <Link
                href="/history"
                className="inline-flex h-12 items-center justify-center gap-3 rounded-lg border border-white/13 bg-white/2 px-7 text-[16px] font-bold text-[#e0e3ed] transition hover:border-white/25 hover:bg-white/6"
              >
                <Icon name="file" className="size-5" /> Demo Raporu İncele
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-5 text-sm font-medium text-[#9ca2b1]">
              <div className="flex -space-x-2">
                {["QA", "Dev", "PM"].map((item) => (
                  <span
                    key={item}
                    className="grid size-8 place-items-center rounded-full border border-[#090d16] bg-[#1d2433] text-[11px] font-bold text-white"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <span>+500 ürün ekibi tarafından güveniliyor</span>
            </div>
          </div>
          <HeroPreview />
        </div>

        <div className="mx-auto max-w-[1600px] px-6 py-10 max-lg:py-6">
          <div className="grid gap-5 text-center sm:grid-cols-2 lg:grid-cols-5">
            {trustItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-center gap-3 text-sm font-bold text-[#9ea6bb]"
              >
                <Icon name={item.icon} className="size-5 text-[#9fb0e7]" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="features"
        className="relative z-10 mx-auto max-w-[1600px] px-6 py-20 max-xl:py-16 max-lg:py-8 max-md:py-4"
      >
        <SectionHeader
          title="Her yönüyle kusursuz web deneyimi"
          desc="Precheck AI, sitenizi son kullanıcı gözünden ve arama motoru standartlarından geçirerek görünmez hataları görünür kılar."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((item) => (
            <FeatureCard key={item.title} item={item} />
          ))}
        </div>
      </section>

      <section
        id="workflow"
        className="relative z-10 mx-auto max-w-[1600px] px-6 py-12 lg:px-8 max-lg:py-6"
      >
        <div className="rounded-3xl border border-white/8 bg-[linear-gradient(180deg,rgba(28,33,46,0.82),rgba(15,19,29,0.92))] px-6 py-12 shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_30px_110px_rgba(0,0,0,0.18)] md:px-10 md:py-14">
          <SectionHeader
            title="Nasıl Çalışır?"
            desc="Sadece 3 adımda sitenizin sağlık durumunu öğrenin."
          />
          <div className="relative mt-12 grid gap-12 md:grid-cols-3">
            <div className="absolute left-[16%] right-[16%] top-9.5 hidden h-px bg-[#48516f] md:block" />
            {workflowSteps.map((step, index) => (
              <div key={step.title} className="relative text-center">
                <div className="relative mx-auto grid size-20 place-items-center rounded-2xl border border-[#4b5474] bg-[#0c111b] text-[#b8c7ff]">
                  <span className="absolute -left-3 -top-3 grid size-7 place-items-center rounded-full bg-[#a7b9ff] text-[13px] font-bold text-[#29406f]">
                    {index + 1}
                  </span>
                  <Icon name={step.icon} className="size-6" />
                </div>
                <h3 className="mt-6 text-[19px] font-bold tracking-[-0.04em] text-[#e1e4ee]">
                  {step.title}
                </h3>
                <p className="mx-auto mt-3 max-w-82.5 text-[15px] font-medium leading-6 text-[#acb1c0]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="reports"
        className="relative z-10 mx-auto grid max-w-[1600px] gap-10 px-6 py-12 max-md:py-4 lg:grid-cols-[0.52fr_1fr] lg:items-center lg:px-8"
      >
        <div>
          <h2 className="text-balance text-[32px] font-extrabold leading-[1.05] tracking-[-0.06em] text-[#e7e9f3] md:text-[34px]">
            Aksiyon alınabilir içgörüler
          </h2>
          <p className="mt-5 max-w-95 text-[17px] font-medium leading-7 text-[#b3b8c6]">
            Sadece hata listesi sunmuyoruz. Sorunların nasıl çözüleceğini, hangi
            dosyalarda bulunduğunu ve düzeltildiğinde performansınıza ne kadar
            katkı sağlayacağını net bir şekilde gösteriyoruz.
          </p>
          <div className="mt-8 space-y-7">
            {insights.map((item) => (
              <div key={item.title} className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#172033] text-[#a9bbff]">
                  <Icon name={item.icon} className="size-4" />
                </span>
                <div>
                  <h3 className="text-[17px] font-bold text-[#e3e6f0]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[15px] font-medium leading-6 text-[#a7adbd]">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <ReportMockup />
      </section>

      <section className="relative z-10 mx-auto max-w-[1600px] px-6 py-16 lg:px-8 max-lg:py-10 max-md:py-4">
        <SectionHeader
          title="Herkes için kalite güvencesi"
          desc="Ekipler arası şeffaflık ve standartlaşmış web kalitesi."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {audiences.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-white/8 bg-[#141923]/78 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
            >
              <Icon name={item.icon} className="size-5 text-[#b5c4ff]" />
              <h3 className="mt-8 text-[17px] font-bold tracking-[-0.03em] text-[#e1e4ee]">
                {item.title}
              </h3>
              <p className="mt-3 text-[13px] font-medium leading-6 text-[#a7adba]">
                {item.desc}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-[1600px] px-6 py-20 max-xl:py-15 max-lg:py-8 max-md:py-4 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-[#465c9b]/55 bg-[radial-gradient(circle_at_45%_100%,rgba(45,96,255,0.2),transparent_27rem),linear-gradient(180deg,#181d2a,#101726)] px-6 py-16 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:px-10">
          <h2 className="mx-auto max-w-155 text-balance text-[39px] font-extrabold leading-[1.08] tracking-[-0.06em] text-[#e7e9f3]">
            Canlıya çıkmadan önce riskleri görün.
          </h2>
          <p className="mx-auto mt-5 max-w-160 text-[18px] font-medium leading-7 text-[#b9c0cf]">
            Precheck AI ile web kalitesini standartlaştırın, hataları
            önceliklendirin ve güvenle yayına çıkın.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/scanner"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-[#2f6df6] px-7 text-[16px] font-bold text-white shadow-[0_16px_42px_rgba(47,109,246,0.34)] transition hover:-translate-y-0.5 hover:bg-[#3c7aff]"
            >
              Ücretsiz Denemeyi Başlat
            </Link>
            <Link
              href="/history"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-white/[0.14] bg-[#111727] px-7 text-[16px] font-bold text-[#dfe2ec] transition lg:hover:border-white/25 lg:hover:bg-white/6"
            >
              Demo Raporu İncele
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-[#a4abc0]">
            <span>◎ Kredi kartı gerekmez</span>
            <span>◎ 2 dakikada ilk analiz</span>
            <span>◎ İstediğin zaman iptal et</span>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 bg-[#080c14]">
        <div className="mx-auto grid max-w-[1600px] gap-10 px-6 py-14 md:grid-cols-[1.25fr_2fr] lg:px-8">
          <div>
            <Logo />
            <p className="mt-6 max-w-105 text-[14px] font-medium leading-6 text-[#a4aaba]">
              Web sitenizi son kullanıcıya ulaşmadan önce performans, SEO,
              erişilebilirlik ve güvenlik açısından analiz eden yapay zeka
              destekli kalite kontrol platformu.
            </p>
            <span className="mt-8 flex size-9 items-center justify-center rounded-full bg-white/6 text-[#aeb8d3]">
              <Icon name="share" className="size-4" />
            </span>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              [
                "ÜRÜN",
                "Özellikler",
                "Nasıl Çalışır",
                "Fiyatlandırma",
                "Rapor Örnekleri",
              ],
              [
                "KAYNAKLAR",
                "Dokümantasyon",
                "API Referansı",
                "Blog",
                "Yardım Merkezi",
              ],
              [
                "ŞİRKET",
                "Hakkımızda",
                "Kariyer",
                "Gizlilik Politikası",
                "Kullanım Koşulları",
              ],
            ].map(([title, ...links]) => (
              <div key={title}>
                <h3 className="text-xs font-extrabold tracking-[0.12em] text-[#dce1ef]">
                  {title}
                </h3>
                <div className="mt-6 grid gap-5 text-[14px] font-medium text-[#a5abb9]">
                  {links.map((item) => (
                    <a
                      key={item}
                      className="transition hover:text-white"
                      href="#features"
                    >
                      {item}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="h-1.5 bg-[#7b62ff]" />
      </footer>
    </main>
  );
}
