import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { label: "Ürün", href: "/" },
  { label: "Özellikler", href: "/#features" },
  { label: "Nasıl Çalışır", href: "/#how-it-works" },
  { label: "Raporlar", href: "/report" },
  { label: "Fiyatlandırma", href: "/pricing", active: true },
];

const plans = [
  {
    name: "Starter",
    desc: "Bireysel geliştiriciler ve küçük projeler için.",
    price: "₺599",
    yearly: "Yıllık ödemede ₺5.750 / yıl",
    button: "Başlangıç Paketi",
    href: "/auth",
    featured: false,
    features: [
      "5.000 Tarama Kredisi",
      "1 Ekip Üyesi",
      "Temel performans analizleri",
      "SEO & erişilebilirlik",
      "PDF Export",
      "1 site canlı izleme",
      "E-posta desteği",
    ],
  },
  {
    name: "Pro",
    desc: "Büyüyen ekipler ve aktif projeler için.",
    price: "₺1.499",
    yearly: "Yıllık ödemede ₺14.390 / yıl",
    button: "Pro'ya Geç",
    href: "/auth",
    featured: true,
    features: [
      "20.000 Tarama Kredisi",
      "5 Ekip Üyesi",
      "Tüm gelişmiş analizler",
      "PDF & CSV Export",
      "10 site canlı izleme",
      "Akıllı çözüm önerileri",
      "Öncelikli destek",
      "API erişimi",
    ],
  },
  {
    name: "Agency",
    desc: "Büyük ölçekli operasyonlar ve ajanslar için.",
    price: "₺3.999",
    yearly: "Yıllık ödemede ₺38.390 / yıl",
    button: "Agency ile İletişime Geç",
    href: "/auth",
    featured: false,
    features: [
      "100.000 Tarama Kredisi",
      "Sınırsız Ekip Üyesi",
      "Tüm gelişmiş analizler",
      "PDF & CSV Export",
      "Sınırsız canlı izleme",
      "White-label rapor",
      "Öncelikli destek",
      "Hesap yöneticisi",
      "API erişimi",
    ],
  },
];

const comparisonRows = [
  ["Tarama Kredisi / Ay", "5.000", "20.000", "100.000"],
  ["Ekip Üyesi", "1", "5", "Sınırsız"],
  ["Canlı İzleme", "1 Site", "10 Site", "Sınırsız"],
  ["Rapor Dışa Aktarma", "PDF", "PDF & CSV", "PDF & CSV"],
  ["Akıllı Çözüm Önerileri", "—", "check", "check"],
  ["API Erişimi", "—", "check", "check"],
  ["White-label Rapor", "—", "—", "check"],
  ["Öncelikli Destek", "—", "check", "check"],
];

const faqs = [
  {
    q: "Tarama kredisi nedir?",
    a: "Her analiz ettiğiniz web sayfası veya API endpoint'i 1 tarama kredisi harcar. Kredileriniz her fatura döneminde yenilenir.",
  },
  {
    q: "Yıllık ödeme avantajı?",
    a: "Yıllık ödemelerde %20 indirim uygulanır. Fiyatlar tek seferde, 12 aylık toplu olarak tahsil edilir.",
  },
  {
    q: "Plan değişikliği?",
    a: "İstediğiniz zaman bir üst veya alt plana geçiş yapabilirsiniz. Değişiklikler bir sonraki fatura döneminde uygulanır.",
  },
  {
    q: "Veri güvenliği?",
    a: "Verileriniz şifrelenerek saklanır ve GDPR / KVKK uyumlu olarak işlenir. Sunucularımız yüksek güvenlik standartlarıyla korunur.",
  },
  {
    q: "White-label rapor?",
    a: "Raporları kendi logonuz ve kurumsal renklerinizle oluşturabilir, müşterilerinize kendi markanızla sunabilirsiniz.",
  },
  {
    q: "API erişimi?",
    a: "Pro ve Agency planlarında REST API'mizi kullanarak kendi sistemlerinize entegre edebilir, otomasyonlar kurabilirsiniz.",
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050916] text-[#e8ebf5]">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(47,109,246,0.18),transparent_32%),linear-gradient(180deg,rgba(8,13,24,0.1),#050916_84%)]" />

      <div className="relative z-10">
        <Header />

        <section className="mx-auto max-w-[1440px] px-6 pb-20 pt-16 text-center">
          <div className="mx-auto inline-flex rounded-full border border-white/[0.09] bg-white/[0.09] px-4 py-1.5 text-[12px] font-extrabold tracking-[0.05em] text-[#b7c3dc]">
            Esnek. Şeffaf. Ölçeklenebilir.
          </div>

          <h1 className="mx-auto mt-5 max-w-[680px] text-[44px] font-extrabold leading-[1.08] tracking-[-0.06em] text-[#e7eaf5] md:text-[56px]">
            İhtiyacınıza göre ölçeklenen fiyatlandırma
          </h1>

          <p className="mx-auto mt-6 max-w-[700px] text-[17px] font-medium leading-8 text-[#b8bfce]">
            İster bireysel projeleriniz için ister kurumsal ekipleriniz için kullanın.
            Sürpriz ücretler olmadan, sadece kullandığınız kadar ödeyin.
          </p>

          <div className="mt-16 flex justify-center">
            <div className="inline-flex rounded-full border border-white/[0.08] bg-white/[0.16] p-1">
              <button className="h-9 rounded-full bg-white/[0.1] px-12 text-[13px] font-bold text-white">
                Aylık
              </button>
              <button className="flex h-9 items-center gap-2 rounded-full px-8 text-[13px] font-bold text-[#c6cddb]">
                Yıllık
                <span className="rounded bg-[#123d2f] px-2 py-1 text-[10px] font-extrabold text-[#26d18c]">
                  %20
                </span>
              </button>
            </div>
          </div>

          <div className="mt-24 grid items-stretch gap-4 text-left lg:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard key={plan.name} {...plan} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-6 py-14">
          <h2 className="text-center text-[17px] font-extrabold text-[#e7eaf5]">
            Özellik Karşılaştırması
          </h2>

          <div className="mt-10 overflow-hidden rounded-xl border border-white/[0.09] bg-[#0d1423]/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="bg-white/[0.055] text-left text-[15px] font-bold text-[#c5ccda]">
                  <th className="px-6 py-6">Özellik</th>
                  <th className="px-6 py-6 text-center">Starter</th>
                  <th className="px-6 py-6 text-center text-[#b8c7ff]">Pro</th>
                  <th className="px-6 py-6 text-center">Agency</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map(([feature, starter, pro, agency]) => (
                  <tr key={feature} className="border-t border-white/[0.055] text-[14px] font-medium text-[#b8bfce]">
                    <td className="px-6 py-5">{feature}</td>
                    <td className="px-6 py-5 text-center">{renderValue(starter)}</td>
                    <td className="px-6 py-5 text-center font-extrabold text-[#dce3f5]">
                      {renderValue(pro)}
                    </td>
                    <td className="px-6 py-5 text-center">{renderValue(agency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-6 py-12">
          <h2 className="text-center text-[17px] font-extrabold text-[#e7eaf5]">
            Sıkça Sorulan Sorular
          </h2>

          <div className="mt-10 space-y-3">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="overflow-hidden rounded-lg border border-white/[0.09] bg-[#0d1423]/90 px-5 py-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-[15px] font-bold text-[#cbd2df]">{faq.q}</h3>
                  <Icon name="chevron" className="size-5 shrink-0 text-[#aeb6c8]" />
                </div>
                <p className="mt-4 line-clamp-1 text-[13px] font-medium leading-6 text-[#8f98aa]">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-6 py-16">
          <div className="rounded-2xl border border-white/[0.1] bg-[#172030]/95 px-8 py-14 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <h2 className="text-[18px] font-extrabold text-[#e3e7f2]">
              Hemen Precheck AI ile tanışın
            </h2>
            <p className="mx-auto mt-6 max-w-[620px] text-[18px] font-medium text-[#aeb6c8]">
              14 gün boyunca tüm özellikleri ücretsiz deneyin. Kredi kartı gerekmez.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/auth"
                className="inline-flex h-14 items-center justify-center rounded-lg bg-[#2f6df6] px-16 text-[18px] font-bold text-white shadow-[0_16px_38px_rgba(47,109,246,0.3)]"
              >
                Ücretsiz Dene
              </Link>
              <Link
                href="/report"
                className="inline-flex h-14 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0d1423] px-16 text-[18px] font-bold text-[#cbd2df]"
              >
                Demo Raporu İncele
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap justify-center gap-8 text-[13px] font-medium text-[#7f899d]">
              <span>✓ Kredi kartı gerekmez</span>
              <span>✓ 14 gün tam erişim</span>
              <span>✓ İstediğin zaman iptal et</span>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#0f121d]/92 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1180px] items-center justify-between px-6">
        <Link href="/" className="text-[16px] font-extrabold text-[#c7d4ff]">
          Precheck AI
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`relative text-[15px] font-medium ${
                item.active ? "text-[#dce5ff]" : "text-[#aeb4c2]"
              }`}
            >
              {item.label}
              {item.active && (
                <span className="absolute -bottom-[26px] left-0 h-px w-full bg-[#b8c7ff]" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <Link href="/auth" className="hidden text-[15px] font-medium text-[#c7cdd9] sm:inline-flex">
            Giriş Yap
          </Link>
          <Link
            href="/auth"
            className="inline-flex h-10 items-center rounded-lg bg-[#2f6df6] px-6 text-[15px] font-bold text-white shadow-[0_12px_28px_rgba(47,109,246,0.3)]"
          >
            Ücretsiz Dene
          </Link>
        </div>
      </div>
    </header>
  );
}

function PlanCard({
  name,
  desc,
  price,
  yearly,
  button,
  href,
  features,
  featured,
}: {
  name: string;
  desc: string;
  price: string;
  yearly: string;
  button: string;
  href: string;
  features: string[];
  featured: boolean;
}) {
  return (
    <div
      className={`relative flex min-h-[630px] flex-col rounded-xl border p-9 ${
        featured
          ? "-mt-5 border-[#596c9e] bg-[#182131] shadow-[0_24px_80px_rgba(47,109,246,0.15),inset_0_1px_0_rgba(255,255,255,0.04)]"
          : "border-white/[0.09] bg-[#0d1423]/92"
      }`}
    >
      {featured && (
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b8c7ff] px-5 py-2 text-[11px] font-extrabold text-white shadow-[0_10px_30px_rgba(184,199,255,0.3)]">
          EN POPÜLER
        </div>
      )}

      <h3 className="text-[24px] font-extrabold tracking-[-0.04em] text-[#e7eaf5]">{name}</h3>
      <p className="mt-3 min-h-[44px] text-[14px] font-medium leading-5 text-[#aab2c2]">{desc}</p>

      <div className="mt-8">
        <span className="text-[50px] font-extrabold tracking-[-0.08em] text-[#e7eaf5]">{price}</span>
        <span className="ml-2 text-[14px] font-bold text-[#aab2c2]">/ay</span>
      </div>

      <p className="mt-2 text-[13px] font-bold text-[#8e98aa]">{yearly}</p>

      <ul className="mt-8 space-y-4">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-3 text-[14px] font-bold text-[#aeb6c8]">
            <Icon name="check" className="size-5 shrink-0 text-[#b8c7ff]" />
            {feature}
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className={`mt-auto inline-flex h-14 items-center justify-center rounded-lg text-[16px] font-bold ${
          featured
            ? "bg-[#2f6df6] text-white shadow-[0_14px_34px_rgba(47,109,246,0.28)]"
            : "border border-white/[0.1] bg-[#080d18]/50 text-[#cbd2df]"
        }`}
      >
        {button}
      </Link>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#090e18]">
      <div className="mx-auto grid max-w-[1600px] gap-12 px-6 py-16 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <h2 className="text-[16px] font-extrabold text-[#c7d4ff]">Precheck AI</h2>
          <p className="mt-5 max-w-[360px] text-[14px] font-medium leading-7 text-[#a2abbc]">
            Modern web uygulamaları için akıllı test ve izleme platformu.
            Hataları kullanıcılarınızdan önce bulun.
          </p>
        </div>

        <FooterCol title="Ürün" items={["Özellikler", "Nasıl Çalışır", "Fiyatlandırma", "Rapor Örnekleri"]} />
        <FooterCol title="Kaynaklar" items={["Dokümantasyon", "API", "Blog", "Yardım"]} />
        <FooterCol title="Şirket" items={["Hakkımızda", "Kariyer", "Gizlilik", "Kullanım Koşulları"]} />
      </div>

      <div className="mx-auto flex max-w-[1600px] items-center justify-between border-t border-white/[0.04] px-6 py-8 text-[13px] font-medium text-[#8993a6]">
        <span>© 2025 Precheck AI. Tüm hakları saklıdır.</span>
        <div className="flex items-center gap-5">
          <Icon name="globe" className="size-5" />
          <Icon name="mail" className="size-5" />
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-[15px] font-extrabold text-[#e4e8f3]">{title}</h3>
      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <Link key={item} href="#" className="block text-[14px] font-medium text-[#a4adbf]">
            {item}
          </Link>
        ))}
      </div>
    </div>
  );
}

function renderValue(value: string) {
  if (value === "check") {
    return <Icon name="checkCircle" className="mx-auto size-5 text-[#b8c7ff]" />;
  }

  return value;
}

function Icon({ name, className = "" }: { name: string; className?: string }) {
  const paths: Record<string, ReactNode> = {
    check: <path d="M20 6 9 17l-5-5" />,
    checkCircle: <path d="M9 12l2 2 4-5M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />,
    globe: <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />,
    mail: <path d="M4 6h16v12H4zM4 7l8 6 8-6" />,
    chevron: <path d="m6 9 6 6 6-6" />,
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
      {paths[name] ?? paths.check}
    </svg>
  );
}