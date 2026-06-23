"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

type BillingCycle = "monthly" | "yearly";

type Plan = {
  slug: string;
  name: string;
  desc: string;
  monthlyPrice: string;
  yearlyMonthlyPrice: string;
  yearlyTotal: string;
  button: string;
  featured: boolean;
  type: "starter" | "pro" | "agency";
  features: string[];
};

type FaqItem = {
  q: string;
  a: string;
};

const navItems = [
  { label: "Ürün", href: "/" },
  { label: "Özellikler", href: "/#features" },
  { label: "Nasıl Çalışır", href: "/#how-it-works" },
  { label: "Raporlar", href: "/report" },
  { label: "Fiyatlandırma", href: "/pricing", active: true },
];

const plans: Plan[] = [
  {
    slug: "starter",
    name: "Starter",
    desc: "Bireysel geliştiriciler ve küçük projeler için.",
    monthlyPrice: "₺599",
    yearlyMonthlyPrice: "₺479",
    yearlyTotal: "₺5.750 / yıl",
    button: "Başlangıç Paketi",
    featured: false,
    type: "starter",
    features: [
      "5.000 Tarama Kredisi",
      "1 Ekip Üyesi",
      "Temel Analizler",
      "SEO & Erişilebilirlik",
      "PDF Export",
    ],
  },
  {
    slug: "pro",
    name: "Pro",
    desc: "Büyüyen ekipler ve aktif projeler için.",
    monthlyPrice: "₺1.499",
    yearlyMonthlyPrice: "₺1.199",
    yearlyTotal: "₺14.390 / yıl",
    button: "Pro'ya Geç",
    featured: true,
    type: "pro",
    features: [
      "20.000 Tarama Kredisi",
      "5 Ekip Üyesi",
      "Tüm Analizler",
      "PDF & CSV Export",
      "10 Site İzleme",
      "AI Çözüm Önerileri",
    ],
  },
  {
    slug: "agency",
    name: "Agency",
    desc: "Büyük ölçekli operasyonlar ve ajanslar için.",
    monthlyPrice: "₺3.999",
    yearlyMonthlyPrice: "₺3.199",
    yearlyTotal: "₺38.390 / yıl",
    button: "Agency ile İletişime Geç",
    featured: false,
    type: "agency",
    features: [
      "100.000 Tarama Kredisi",
      "Sınırsız Ekip Üyesi",
      "White Label Raporlama",
      "Tam API Erişimi",
      "Özel Hesap Yöneticisi",
    ],
  },
];

const comparisonRows = [
  ["Tarama Kredisi / Ay", "5.000", "20.000", "100.000"],
  ["Ekip Üyesi", "1", "5", "Sınırsız"],
  ["Canlı İzleme", "1 Site", "10 Site", "Sınırsız"],
  ["Rapor Dışa Aktarma", "PDF", "PDF & CSV", "PDF & CSV"],
  ["AI Çözüm Önerileri", "—", "check", "check"],
  ["API Erişimi", "—", "check", "check"],
  ["White Label Rapor", "—", "—", "check"],
  ["Öncelikli Destek", "—", "check", "check"],
];

const faqs: FaqItem[] = [
  {
    q: "Tarama kredisi nedir?",
    a: "Her analiz ettiğiniz web sayfası veya endpoint belirli miktarda tarama kredisi harcar. Krediler her fatura döneminde yenilenir.",
  },
  {
    q: "Yıllık ödeme avantajı nedir?",
    a: "Yıllık ödeme seçildiğinde aylık maliyet yaklaşık %20 düşer. Ödeme 12 aylık toplu olarak alınır.",
  },
  {
    q: "Planımı sonradan değiştirebilir miyim?",
    a: "Evet. İstediğiniz zaman daha üst plana geçebilir veya bir sonraki fatura döneminde planınızı düşürebilirsiniz.",
  },
  {
    q: "Agency planında white label var mı?",
    a: "Evet. Agency planında raporları kendi logonuz, marka renginiz ve özel alan adınızla sunabilirsiniz.",
  },
  {
    q: "Kredi kartı gerekli mi?",
    a: "Ücretsiz deneme için kredi kartı gerekmez. Ücretli plana geçerken ödeme bilgisi istenir.",
  },
];

export default function PricingPage() {
  const router = useRouter();

  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isAgencyOpen, setIsAgencyOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState("");

  const handleSelectPlan = (plan: Plan) => {
    if (plan.type === "agency") {
      setIsAgencyOpen(true);
      return;
    }

    setSelectedPlan(plan);
  };

  const handleContinue = () => {
    if (!selectedPlan) return;

    router.push(`/auth?plan=${selectedPlan.slug}&billing=${billing}`);
  };

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2500);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#050916] text-[#e8ebf5]">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(47,109,246,0.18),transparent_32%),linear-gradient(180deg,rgba(8,13,24,0.1),#050916_84%)]" />

      <div className="relative z-10">
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuToggle={() => setIsMobileMenuOpen((current) => !current)}
          onMobileMenuClose={() => setIsMobileMenuOpen(false)}
        />

        <section className="mx-auto max-w-[1180px] px-5 pb-16 pt-14 text-center sm:px-6 md:pb-20 md:pt-20">
          <div className="mx-auto inline-flex rounded-full border border-white/[0.09] bg-white/[0.09] px-4 py-1.5 text-[11px] font-extrabold tracking-[0.05em] text-[#b7c3dc] sm:text-[12px]">
            Esnek. Şeffaf. Ölçeklenebilir.
          </div>

          <h1 className="mx-auto mt-5 max-w-[760px] text-[38px] font-extrabold leading-[1.08] tracking-[-0.06em] text-[#e7eaf5] sm:text-[48px] md:text-[60px]">
            İhtiyacınıza göre ölçeklenen fiyatlandırma
          </h1>

          <p className="mx-auto mt-6 max-w-[720px] text-[15px] font-medium leading-7 text-[#b8bfce] sm:text-[17px] sm:leading-8">
            İster bireysel projeleriniz için ister kurumsal ekipleriniz için kullanın.
            Sürpriz ücretler olmadan, sadece kullandığınız kadar ödeyin.
          </p>

          <div className="mt-12 flex justify-center md:mt-16">
            <div className="inline-flex rounded-full border border-white/[0.08] bg-white/[0.16] p-1">
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className={`h-9 cursor-pointer rounded-full px-8 text-[13px] font-bold transition sm:px-12 ${
                  billing === "monthly"
                    ? "bg-white/[0.12] text-white"
                    : "text-[#c6cddb] hover:text-white"
                }`}
              >
                Aylık
              </button>

              <button
                type="button"
                onClick={() => setBilling("yearly")}
                className={`flex h-9 cursor-pointer items-center gap-2 rounded-full px-6 text-[13px] font-bold transition sm:px-8 ${
                  billing === "yearly"
                    ? "bg-white/[0.12] text-white"
                    : "text-[#c6cddb] hover:text-white"
                }`}
              >
                Yıllık
                <span className="rounded bg-[#123d2f] px-2 py-1 text-[10px] font-extrabold text-[#26d18c]">
                  -%20
                </span>
              </button>
            </div>
          </div>

          <div className="mt-16 grid items-stretch gap-5 text-left md:mt-24 lg:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard
                key={plan.name}
                plan={plan}
                billing={billing}
                onSelect={() => handleSelectPlan(plan)}
              />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-5 py-12 sm:px-6 md:py-16">
          <div className="text-center">
            <span className="rounded-full border border-white/[0.08] bg-white/[0.06] px-4 py-1 text-[12px] font-extrabold text-[#aebcff]">
              Karşılaştırma
            </span>
            <h2 className="mt-4 text-[28px] font-extrabold tracking-[-0.05em] text-[#e7eaf5] sm:text-[36px]">
              Planları detaylı karşılaştır
            </h2>
          </div>

          <div className="mt-10 overflow-x-auto rounded-xl border border-white/[0.09] bg-[#0d1423]/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
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
                  <tr
                    key={feature}
                    className="border-t border-white/[0.055] text-[14px] font-medium text-[#b8bfce]"
                  >
                    <td className="px-6 py-5 font-bold text-[#d8deeb]">{feature}</td>
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

        <section className="mx-auto max-w-[920px] px-5 py-12 sm:px-6 md:py-16">
          <div className="text-center">
            <span className="rounded-full border border-white/[0.08] bg-white/[0.06] px-4 py-1 text-[12px] font-extrabold text-[#aebcff]">
              SSS
            </span>
            <h2 className="mt-4 text-[28px] font-extrabold tracking-[-0.05em] text-[#e7eaf5] sm:text-[36px]">
              Sıkça Sorulan Sorular
            </h2>
          </div>

          <div className="mt-10 space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={faq.q}
                  className={`overflow-hidden rounded-lg border bg-[#0d1423]/90 transition duration-500 ease-out ${
                    isOpen
                      ? "border-white/[0.18] shadow-[0_18px_45px_rgba(0,0,0,0.18)]"
                      : "border-white/[0.09]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/[0.035]"
                    aria-expanded={isOpen}
                  >
                    <h3 className="text-[15px] font-bold text-[#cbd2df]">{faq.q}</h3>
                    <Icon
                      name="chevron"
                      className={`size-5 shrink-0 text-[#aeb6c8] transition-transform duration-500 ease-out ${
                        isOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 pt-1 text-[13px] font-medium leading-6 text-[#8f98aa]">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-5 py-14 sm:px-6 md:py-20">
          <div className="rounded-2xl border border-white/[0.1] bg-[#172030]/95 px-6 py-12 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:px-8 md:py-16">
            <h2 className="text-[28px] font-extrabold tracking-[-0.05em] text-[#e3e7f2] sm:text-[36px]">
              Hemen Precheck AI ile tanışın
            </h2>

            <p className="mx-auto mt-5 max-w-[640px] text-[16px] font-medium leading-7 text-[#aeb6c8] sm:text-[18px]">
              14 gün boyunca tüm özellikleri ücretsiz deneyin. Kredi kartı gerekmez.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => router.push("/auth")}
                className="inline-flex h-[52px] cursor-pointer items-center justify-center rounded-lg bg-[#2f6df6] px-10 text-[16px] font-bold text-white shadow-[0_16px_38px_rgba(47,109,246,0.3)] transition hover:bg-[#3b7aff] sm:h-14 sm:px-16 sm:text-[18px]"
              >
                Ücretsiz Dene
              </button>

              <button
                type="button"
                onClick={() => router.push("/report")}
                className="inline-flex h-[52px] cursor-pointer items-center justify-center rounded-lg border border-white/[0.08] bg-[#0d1423] px-10 text-[16px] font-bold text-[#cbd2df] transition hover:border-white/20 hover:bg-white/[0.06] sm:h-14 sm:px-16 sm:text-[18px]"
              >
                Demo Raporu İncele
              </button>
            </div>

            <div className="mt-7 flex flex-wrap justify-center gap-5 text-[13px] font-medium text-[#7f899d] sm:gap-8">
              <span>✓ Kredi kartı gerekmez</span>
              <span>✓ 14 gün tam erişim</span>
              <span>✓ İstediğin zaman iptal et</span>
            </div>
          </div>
        </section>

        <Footer />
      </div>

      {selectedPlan && (
        <Modal onClose={() => setSelectedPlan(null)} maxWidth="max-w-[520px]">
          <ModalHeader
            title={`${selectedPlan.name} planına geç`}
            onClose={() => setSelectedPlan(null)}
          />

          <div className="mt-6 rounded-xl border border-white/[0.08] bg-[#080d18]/70 p-5">
            <p className="text-[14px] font-medium leading-6 text-[#aab3c5]">
              Seçilen plan:
            </p>

            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <h3 className="text-[24px] font-extrabold">{selectedPlan.name}</h3>
                <p className="mt-1 text-[13px] font-medium text-[#8f98aa]">
                  {billing === "monthly" ? "Aylık ödeme" : "Yıllık ödeme"}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[30px] font-extrabold tracking-[-0.06em]">
                  {billing === "monthly"
                    ? selectedPlan.monthlyPrice
                    : selectedPlan.yearlyMonthlyPrice}
                </p>
                <p className="text-[12px] font-bold text-[#8f98aa]">/ay</p>
              </div>
            </div>

            {billing === "yearly" && (
              <p className="mt-4 rounded-lg border border-[#145d49] bg-[#0c332a] px-3 py-2 text-[12px] font-bold text-[#22d296]">
                Yıllık ödeme toplamı: {selectedPlan.yearlyTotal}
              </p>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setSelectedPlan(null)}
              className="h-10 cursor-pointer rounded-md border border-white/[0.12] px-5 text-[13px] font-extrabold text-[#d8deeb] transition hover:bg-white/[0.06]"
            >
              Vazgeç
            </button>

            <button
              type="button"
              onClick={handleContinue}
              className="h-10 cursor-pointer rounded-md bg-[#2f6df6] px-5 text-[13px] font-extrabold text-white transition hover:bg-[#3b7aff]"
            >
              Devam Et
            </button>
          </div>
        </Modal>
      )}

      {isAgencyOpen && (
        <Modal onClose={() => setIsAgencyOpen(false)} maxWidth="max-w-[560px]">
          <ModalHeader
            title="Agency planı için iletişim"
            onClose={() => setIsAgencyOpen(false)}
          />

          <div className="mt-6 space-y-4">
            <Input label="Ad Soyad" placeholder="Adınızı yazın" />
            <Input label="E-posta" placeholder="ornek@firma.com" />
            <Input label="Şirket" placeholder="Şirket adınız" />

            <textarea
              placeholder="İhtiyacınızı kısaca anlatın..."
              className="h-28 w-full resize-none rounded-lg border border-white/[0.1] bg-[#080d18] px-4 py-3 text-[14px] font-medium text-white outline-none placeholder:text-[#697386] focus:border-[#8ea1e8]"
            />

            <button
              type="button"
              onClick={() => {
                setIsAgencyOpen(false);
                showToast("Agency talebiniz alındı.");
              }}
              className="h-11 w-full cursor-pointer rounded-md bg-[#2f6df6] text-[14px] font-extrabold text-white transition hover:bg-[#3b7aff]"
            >
              Talep Gönder
            </button>
          </div>
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

function Header({
  isMobileMenuOpen,
  onMobileMenuToggle,
  onMobileMenuClose,
}: {
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
  onMobileMenuClose: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#0f121d]/92 backdrop-blur-xl">
      <div className="mx-auto flex h-[70px] max-w-[1180px] items-center justify-between px-5 sm:px-6 md:h-[76px]">
        <Link
          href="/"
          className="cursor-pointer text-[16px] font-extrabold text-[#c7d4ff]"
        >
          Precheck AI
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`relative cursor-pointer text-[15px] font-medium transition hover:text-white ${
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

        <div className="hidden items-center gap-5 sm:flex">
          <Link
            href="/auth"
            className="cursor-pointer text-[15px] font-medium text-[#c7cdd9] transition hover:text-white"
          >
            Giriş Yap
          </Link>

          <Link
            href="/auth"
            className="inline-flex h-10 cursor-pointer items-center rounded-lg bg-[#2f6df6] px-6 text-[15px] font-bold text-white shadow-[0_12px_28px_rgba(47,109,246,0.3)] transition hover:bg-[#3b7aff]"
          >
            Ücretsiz Dene
          </Link>
        </div>

        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="grid size-10 cursor-pointer place-items-center rounded-lg border border-white/[0.1] text-[#dce5ff] md:hidden"
        >
          <Icon name={isMobileMenuOpen ? "x" : "menu"} className="size-5" />
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-white/[0.07] bg-[#0f121d] px-5 py-4 md:hidden">
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={onMobileMenuClose}
                className={`flex h-10 cursor-pointer items-center rounded-lg px-3 text-[14px] font-bold ${
                  item.active
                    ? "bg-white/[0.08] text-[#dce5ff]"
                    : "text-[#aeb4c2]"
                }`}
              >
                {item.label}
              </Link>
            ))}

            <div className="grid gap-2 pt-3 sm:hidden">
              <Link
                href="/auth"
                onClick={onMobileMenuClose}
                className="flex h-10 cursor-pointer items-center justify-center rounded-lg border border-white/[0.1] text-[14px] font-bold text-[#c7cdd9]"
              >
                Giriş Yap
              </Link>
              <Link
                href="/auth"
                onClick={onMobileMenuClose}
                className="flex h-10 cursor-pointer items-center justify-center rounded-lg bg-[#2f6df6] text-[14px] font-bold text-white"
              >
                Ücretsiz Dene
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function PlanCard({
  plan,
  billing,
  onSelect,
}: {
  plan: Plan;
  billing: BillingCycle;
  onSelect: () => void;
}) {
  const price = billing === "monthly" ? plan.monthlyPrice : plan.yearlyMonthlyPrice;
  const billingNote =
    billing === "monthly" ? "Aylık faturalandırılır" : `Yıllık ödeme: ${plan.yearlyTotal}`;

  return (
    <div
      className={`relative flex min-h-[560px] flex-col rounded-xl border p-7 transition hover:-translate-y-1 hover:border-white/20 sm:p-9 lg:min-h-[630px] ${
        plan.featured
          ? "border-[#596c9e] bg-[#182131] shadow-[0_24px_80px_rgba(47,109,246,0.15),inset_0_1px_0_rgba(255,255,255,0.04)] lg:-mt-5"
          : "border-white/[0.09] bg-[#0d1423]/92"
      }`}
    >
      {plan.featured && (
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b8c7ff] px-5 py-2 text-[11px] font-extrabold text-white shadow-[0_10px_30px_rgba(184,199,255,0.3)]">
          EN POPÜLER
        </div>
      )}

      <h3 className="text-[24px] font-extrabold tracking-[-0.04em] text-[#e7eaf5]">
        {plan.name}
      </h3>

      <p className="mt-3 min-h-[44px] text-[14px] font-medium leading-5 text-[#aab2c2]">
        {plan.desc}
      </p>

      <div className="mt-8">
        <span className="text-[46px] font-extrabold tracking-[-0.08em] text-[#e7eaf5] sm:text-[50px]">
          {price}
        </span>
        <span className="ml-2 text-[14px] font-bold text-[#aab2c2]">/ay</span>
      </div>

      <p className="mt-2 text-[13px] font-bold text-[#8e98aa]">{billingNote}</p>

      <ul className="mt-8 space-y-4">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex items-center gap-3 text-[14px] font-bold text-[#aeb6c8]"
          >
            <Icon name="checkCircle" className="size-5 shrink-0 text-[#b8c7ff]" />
            {feature}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onSelect}
        className={`mt-auto inline-flex h-14 cursor-pointer items-center justify-center rounded-lg text-[16px] font-bold transition ${
          plan.featured
            ? "bg-[#2f6df6] text-white shadow-[0_14px_34px_rgba(47,109,246,0.28)] hover:bg-[#3b7aff]"
            : "border border-white/[0.1] bg-[#080d18]/50 text-[#cbd2df] hover:border-white/20 hover:bg-white/[0.06]"
        }`}
      >
        {plan.button}
      </button>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#090e18]">
      <div className="mx-auto grid max-w-[1180px] gap-10 px-5 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <h2 className="text-[16px] font-extrabold text-[#c7d4ff]">Precheck AI</h2>
          <p className="mt-5 max-w-[360px] text-[14px] font-medium leading-7 text-[#a2abbc]">
            Modern web uygulamaları için akıllı test ve izleme platformu.
            Hataları kullanıcılarınızdan önce bulun.
          </p>
        </div>

        <FooterCol
          title="Ürün"
          items={[
            ["Özellikler", "/#features"],
            ["Nasıl Çalışır", "/#how-it-works"],
            ["Fiyatlandırma", "/pricing"],
            ["Rapor Örnekleri", "/report"],
          ]}
        />

        <FooterCol
          title="Kaynaklar"
          items={[
            ["Dokümantasyon", "/docs"],
            ["API", "/docs/api"],
            ["Blog", "/blog"],
            ["Yardım", "/settings"],
          ]}
        />

        <FooterCol
          title="Şirket"
          items={[
            ["Hakkımızda", "/"],
            ["Kariyer", "/career"],
            ["Gizlilik", "/privacy"],
            ["Kullanım Koşulları", "/terms"],
          ]}
        />
      </div>

      <div className="mx-auto flex max-w-[1180px] flex-col gap-4 border-t border-white/[0.04] px-5 py-8 text-[13px] font-medium text-[#8993a6] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span>© 2025 Precheck AI. Tüm hakları saklıdır.</span>
        <div className="flex items-center gap-5">
          <Icon name="globe" className="size-5" />
          <Icon name="mail" className="size-5" />
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  items,
}: {
  title: string;
  items: [string, string][];
}) {
  return (
    <div>
      <h3 className="text-[15px] font-extrabold text-[#e4e8f3]">{title}</h3>
      <div className="mt-6 space-y-4">
        {items.map(([item, href]) => (
          <Link
            key={item}
            href={href}
            className="block cursor-pointer text-[14px] font-medium text-[#a4adbf] transition hover:text-white"
          >
            {item}
          </Link>
        ))}
      </div>
    </div>
  );
}

function Input({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-extrabold text-[#aeb6c8]">
        {label}
      </span>
      <input
        placeholder={placeholder}
        className="h-11 w-full cursor-text rounded-lg border border-white/[0.1] bg-[#080d18] px-4 text-[14px] font-medium text-white outline-none placeholder:text-[#697386] focus:border-[#8ea1e8]"
      />
    </label>
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

function ModalHeader({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
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

function renderValue(value: string) {
  if (value === "check") {
    return <Icon name="checkCircle" className="mx-auto size-5 text-[#b8c7ff]" />;
  }

  if (value === "—") {
    return <span className="text-[#667085]">—</span>;
  }

  return value;
}

function Icon({ name, className = "" }: { name: string; className?: string }) {
  const paths: Record<string, ReactNode> = {
    check: <path d="M20 6 9 17l-5-5" />,
    checkCircle: (
      <path d="M9 12l2 2 4-5M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />
    ),
    globe: (
      <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
    ),
    mail: <path d="M4 6h16v12H4zM4 7l8 6 8-6" />,
    chevron: <path d="m6 9 6 6 6-6" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    x: <path d="M6 6l12 12M18 6 6 18" />,
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