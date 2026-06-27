"use client";

import { createLiveHref } from "@/lib/routes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

type PageScopeOption = {
  value: string;
  label: string;
  custom?: boolean;
};

const sidebarItems = [
  { label: "Genel Bakış", href: "/dashboard", icon: "grid" },
  { label: "Yeni Tarama", href: "/scanner", icon: "scan", active: true },
  { label: "Analiz Geçmişi", href: "/history", icon: "history" },
  { label: "Raporlar", href: "/history", icon: "chart" },
  { label: "Takım", href: "/settings", icon: "team" },
  { label: "Ayarlar", href: "/settings", icon: "settings" },
];

const protocolOptions = [
  { value: "https://", label: "https://" },
  { value: "http://", label: "http://" },
];

const scopeOptions = [
  { value: "sitemap", label: "Tüm Site (Sitemap bazlı)" },
  { value: "single-page", label: "Tek Sayfa" },
  { value: "manual-pages", label: "Belirli Sayfalar" },
  { value: "staging", label: "Staging Ortamı" },
];

const depthOptions = [
  { value: "low", label: "Düşük (1 seviye)" },
  { value: "medium", label: "Orta (2 seviye)" },
  { value: "high", label: "Derin (3 seviye)" },
  { value: "full", label: "Tam Crawl" },
];

const pageScopeOptions: PageScopeOption[] = [
  { value: "home", label: "Ana Sayfa" },
  { value: "products", label: "Ürünler Dizini" },
  { value: "blog", label: "Blog Kategorisi" },
];

const deviceOptions = [
  {
    value: "mobile-320",
    title: "Mobil XS",
    desc: "320px - 479px",
    icon: "mobile",
  },
  {
    value: "mobile-480",
    title: "Mobil",
    desc: "480px - 767px",
    icon: "mobile",
  },
  {
    value: "tablet-768",
    title: "Tablet",
    desc: "768px - 1023px",
    icon: "tablet",
  },
  {
    value: "tablet-1024",
    title: "Tablet Yatay",
    desc: "1024px - 1279px",
    icon: "tablet",
  },
  {
    value: "desktop-1280",
    title: "Desktop",
    desc: "1280px - 1439px",
    icon: "desktop",
  },
  {
    value: "laptop-1440",
    title: "Laptop",
    desc: "1440px - 1679px",
    icon: "desktop",
  },
  {
    value: "wide-1680",
    title: "Geniş Ekran",
    desc: "1680px - 1919px",
    icon: "desktop",
  },
  {
    value: "full-1920",
    title: "Full HD+",
    desc: "1920px+",
    icon: "desktop",
  },
];

const modules = [
  {
    title: "Performans",
    desc: "LCP, CLS, FCP metrikleri",
    icon: "speed",
  },
  {
    title: "Responsive QA",
    desc: "Taşma, kırılım ve yatay scroll",
    icon: "device",
  },
  {
    title: "SEO",
    desc: "Meta, başlık ve yapısal veri",
    icon: "search",
  },
  {
    title: "Erişilebilirlik",
    desc: "WCAG, label, alt ve kontrast",
    icon: "accessibility",
  },
  {
    title: "Interaction QA",
    desc: "Buton, modal, toggle ve dropdown",
    icon: "flow",
  },
  {
    title: "Security Basics",
    desc: "SSL, headers ve HTTPS kontrolü",
    icon: "shield",
  },
  {
    title: "Görsel QA",
    desc: "Görsel regresyon ve hizalama",
    icon: "eye",
  },
  {
    title: "Form Kontrolleri",
    desc: "Validasyon ve etiket testi",
    icon: "form",
  },
];

const recentTargets = [
  {
    site: "ornek-site.com",
    url: "https://ornek-site.com",
    date: "10 May 2025",
    status: "Tamamlandı",
    duration: "9dk 24sn",
    type: "success",
  },
  {
    site: "shop.acmedijital.com",
    url: "https://shop.acmedijital.com",
    date: "09 May 2025",
    status: "Uyarı",
    duration: "6dk 48sn",
    type: "warning",
  },
  {
    site: "blog.acmedijital.com",
    url: "https://blog.acmedijital.com",
    date: "09 May 2025",
    status: "Tamamlandı",
    duration: "7dk 31sn",
    type: "success",
  },
  {
    site: "landing.yeniurun.com",
    url: "https://landing.yeniurun.com",
    date: "08 May 2025",
    status: "İnceleniyor",
    duration: "-",
    type: "info",
  },
  {
    site: "beta.acmedijital.com",
    url: "https://beta.acmedijital.com",
    date: "07 May 2025",
    status: "Uyarı",
    duration: "5dk 12sn",
    type: "warning",
  },
];

export default function ScannerPage() {
  const router = useRouter();

  const [protocol, setProtocol] = useState("https://");
  const [targetUrl, setTargetUrl] = useState("");
  const [scopeType, setScopeType] = useState("sitemap");
  const [crawlDepth, setCrawlDepth] = useState("medium");
  const [selectedPages, setSelectedPages] = useState<string[]>(["home"]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>(
    deviceOptions.map((device) => device.value),
  );
  const [enabledModules, setEnabledModules] = useState<string[]>(
    modules.map((moduleItem) => moduleItem.title),
  );
  const [scanMessage, setScanMessage] = useState("");
  const [scanMessageType, setScanMessageType] = useState<"success" | "error">(
    "success",
  );
  const [isAddPageOpen, setIsAddPageOpen] = useState(false);
  const [newPagePath, setNewPagePath] = useState("");
  const [customPages, setCustomPages] = useState<PageScopeOption[]>([]);
  const [isStartingScan, setIsStartingScan] = useState(false);

  const selectedModuleCount = enabledModules.length;
  const selectedDeviceCount = selectedDevices.length;
  const allPageScopeOptions = [...pageScopeOptions, ...customPages];

  const setErrorMessage = (message: string) => {
    setScanMessageType("error");
    setScanMessage(message);
  };

  const setSuccessMessage = (message: string) => {
    setScanMessageType("success");
    setScanMessage(message);
  };

  const togglePageScope = (value: string) => {
    setSelectedPages((current) => {
      if (current.includes(value)) {
        return current.filter((item) => item !== value);
      }

      return [...current, value];
    });
  };

  const handleAddCustomPage = () => {
    const trimmedPath = newPagePath.trim();

    if (!trimmedPath) {
      setErrorMessage("Lütfen eklenecek sayfa path'ini girin.");
      return;
    }

    const normalizedPath = trimmedPath.startsWith("/")
      ? trimmedPath
      : `/${trimmedPath}`;

    const pageValue = `custom:${normalizedPath}`;

    setCustomPages((current) => {
      const alreadyExists = current.some((page) => page.value === pageValue);

      if (alreadyExists) return current;

      return [
        ...current,
        {
          value: pageValue,
          label: normalizedPath,
          custom: true,
        },
      ];
    });

    setSelectedPages((current) => {
      if (current.includes(pageValue)) return current;

      return [...current, pageValue];
    });

    setScopeType("manual-pages");
    setNewPagePath("");
    setIsAddPageOpen(false);
    setScanMessage("");
  };

  const removeCustomPage = (value: string) => {
    setCustomPages((current) => current.filter((page) => page.value !== value));
    setSelectedPages((current) => current.filter((page) => page !== value));
  };

  const toggleDevice = (value: string) => {
    setSelectedDevices((current) => {
      if (current.includes(value)) {
        return current.filter((item) => item !== value);
      }

      return [...current, value];
    });
  };

  const toggleAllDevices = () => {
    setSelectedDevices((current) => {
      if (current.length === deviceOptions.length) {
        return [];
      }

      return deviceOptions.map((device) => device.value);
    });
  };

  const toggleModule = (title: string) => {
    setEnabledModules((current) => {
      if (current.includes(title)) {
        return current.filter((item) => item !== title);
      }

      return [...current, title];
    });
  };

  const applyTargetUrl = (url: string) => {
    setProtocol(url.startsWith("http://") ? "http://" : "https://");
    setTargetUrl(url.replace(/^https?:\/\//, ""));
    setScanMessage("");
  };

  const handleStartScan = async () => {
  const cleanedTargetUrl = targetUrl
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

  if (!cleanedTargetUrl) {
    setErrorMessage("Lütfen analiz etmek istediğiniz alan adını girin.");
    return;
  }

  if (scopeType === "manual-pages" && !selectedPages.length) {
    setErrorMessage(
      "Belirli sayfa taraması için en az bir sayfa seçmelisiniz.",
    );
    return;
  }

  if (!selectedDevices.length) {
    setErrorMessage("En az bir ekran boyutu seçmelisiniz.");
    return;
  }

  if (!enabledModules.length) {
    setErrorMessage("En az bir analiz modülü seçmelisiniz.");
    return;
  }

  const fullUrl = `${protocol}${cleanedTargetUrl}`;

  setIsStartingScan(true);
  setSuccessMessage(`${fullUrl} için tarama başlatılıyor...`);

  try {
    const response = await fetch("/api/scans", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: fullUrl,
        scopeType,
        crawlDepth,
        selectedPages,
        selectedDevices,
        enabledModules,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message ?? "Tarama başlatılamadı.");
    }

    const nextScanId =
      data?.scan?.id ??
      data?.data?.id ??
      data?.id ??
      data?.scanId;

    if (!nextScanId) {
      throw new Error("API scanId döndürmedi.");
    }

    router.push(createLiveHref(nextScanId, fullUrl));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Tarama başlatılamadı.";

    setErrorMessage(message);
  } finally {
    setIsStartingScan(false);
  }
};

  return (
    <main className="min-h-screen overflow-hidden bg-[#070b15] text-[#e7e9f4]">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-size-[32px_32px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_35%_0%,rgba(64,102,255,0.13),transparent_34%),linear-gradient(180deg,rgba(8,13,24,0.1),#070b15_85%)]" />

      <div className="relative z-10 flex min-h-screen">
        <Sidebar />

        <section className="min-w-0 flex-1">
          <Topbar />

          <div className="grid gap-6 px-4 py-6 sm:px-6 lg:py-8 xl:grid-cols-[1fr_240px] 2xl:grid-cols-[1fr_270px]">
            <div className="min-w-0">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <h1 className="text-[28px] font-extrabold tracking-[-0.04em] text-[#e9ecf6]">
                    Yeni Tarama
                  </h1>
                  <p className="mt-2 text-[14px] font-medium text-[#b5bdcc]">
                    Yayınlamadan önce sitenizi kapsamlı şekilde analiz edin.
                  </p>
                </div>

                <Link
                  href="/history"
                  className="hidden h-10 cursor-pointer items-center gap-2 rounded-md border border-white/12 bg-[#111827]/70 px-4 text-[13px] font-bold text-[#c4cad8] transition hover:border-white/25 hover:bg-white/6 lg:inline-flex"
                >
                  <Icon name="history" className="size-4" />
                  Geçmiş Taramalar
                </Link>
              </div>

              <section className="mt-9 rounded-2xl border border-white/9 bg-[#0d1423]/88 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:p-6">
                <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                  <div>
                    <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-widest text-[#9ba5ba]">
                      Hedef URL
                    </label>

                    <div className="flex h-14.5 overflow-hidden rounded-lg border border-white/13 bg-[#080d18]">
                      <select
                        value={protocol}
                        onChange={(event) => setProtocol(event.target.value)}
                        className="w-24 cursor-pointer appearance-none border-r border-white/8 bg-white/4 px-4 text-[15px] font-bold text-[#c8d1e4] outline-none"
                      >
                        {protocolOptions.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                            className="bg-[#080d18] text-[#c7cdda]"
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        value={targetUrl}
                        onChange={(event) => {
                          const value = event.target.value;

                          if (value.startsWith("https://")) {
                            setProtocol("https://");
                            setTargetUrl(value.replace("https://", ""));
                          } else if (value.startsWith("http://")) {
                            setProtocol("http://");
                            setTargetUrl(value.replace("http://", ""));
                          } else {
                            setTargetUrl(value);
                          }

                          setScanMessage("");
                        }}
                        placeholder="ornek-site.com"
                        className="min-w-0 flex-1 cursor-text bg-transparent px-5 text-[16px] font-medium text-white outline-none placeholder:text-[#606a7e]"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleStartScan}
                    disabled={isStartingScan}
                    className="mt-auto h-14.5 cursor-pointer rounded-lg bg-[#2f6df6] px-7 text-[18px] font-extrabold text-white shadow-[0_14px_38px_rgba(47,109,246,0.34)] transition hover:-translate-y-0.5 hover:bg-[#3b7aff] disabled:cursor-not-allowed disabled:opacity-60 sm:text-[20px]"
                  >
                    {isStartingScan ? "Başlatılıyor..." : "Taramayı Başlat"}
                  </button>
                </div>

                <div className="mt-5 flex flex-col gap-2">
                  <p className="flex items-center gap-2 text-[13px] font-medium text-[#aebcff]">
                    <Icon name="info" className="size-4" />
                    Sadece doğruladığınız veya yetkiniz olan alan adlarını
                    tarayın.
                  </p>

                  {scanMessage && (
                    <p
                      className={`text-[13px] font-bold ${
                        scanMessageType === "error"
                          ? "text-[#ff777d]"
                          : "text-[#25d18c]"
                      }`}
                    >
                      {scanMessage}
                    </p>
                  )}
                </div>
              </section>

              <section className="mt-6 rounded-2xl border border-white/9 bg-[#0d1423]/88 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:p-6">
                <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="flex items-center gap-3 text-[24px] font-extrabold tracking-[-0.04em] text-[#dce2ef] sm:text-[26px]">
                    <Icon name="target" className="size-7 text-[#aebcff]" />
                    Tarama Kapsamı
                  </h2>

                  <button
                    type="button"
                    onClick={() => setIsAddPageOpen((current) => !current)}
                    className="cursor-pointer text-left text-[13px] font-bold text-[#aeb6c8] transition hover:text-white sm:text-right"
                  >
                    + Sayfa Ekle
                  </button>
                </div>

                <div className="mt-7 grid gap-6 md:grid-cols-2">
                  <SelectBox
                    label="Kapsam Tipi"
                    value={scopeType}
                    options={scopeOptions}
                    onChange={setScopeType}
                  />

                  <SelectBox
                    label="Derinlik (Crawl Depth)"
                    value={crawlDepth}
                    options={depthOptions}
                    onChange={setCrawlDepth}
                  />
                </div>

                {isAddPageOpen && (
                  <div className="mt-6 rounded-xl border border-white/10 bg-[#080d18]/80 p-4">
                    <label className="mb-2 block text-[12px] font-bold text-[#aab2c4]">
                      Manuel sayfa path’i ekle
                    </label>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        type="text"
                        value={newPagePath}
                        onChange={(event) => setNewPagePath(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            handleAddCustomPage();
                          }
                        }}
                        placeholder="/kampanya/yaz-indirimi"
                        className="h-10 min-w-0 flex-1 cursor-text rounded-md border border-white/12 bg-[#070b15] px-4 text-[14px] font-medium text-white outline-none placeholder:text-[#606a7e] focus:border-[#7f8fca]"
                      />

                      <button
                        type="button"
                        onClick={handleAddCustomPage}
                        className="h-10 cursor-pointer rounded-md bg-[#2f6df6] px-5 text-[13px] font-extrabold text-white transition hover:bg-[#3b7aff]"
                      >
                        Ekle
                      </button>
                    </div>

                    <p className="mt-2 text-[12px] font-medium text-[#7f899d]">
                      Örnek: /hakkimizda, /urun/akilli-telefon-pro,
                      /blog/web-performans
                    </p>
                  </div>
                )}

                <div className="mt-7 flex flex-wrap gap-3">
                  {allPageScopeOptions.map((item) => {
                    const isSelected = selectedPages.includes(item.value);

                    return (
                      <div
                        key={item.value}
                        className={`inline-flex h-9 items-center overflow-hidden rounded-full border text-[13px] font-semibold transition ${
                          isSelected
                            ? "border-[#aebcff]/70 bg-[#1b2337] text-[#dbe4ff]"
                            : "border-white/[0.14] bg-[#080d18]/70 text-[#aab2c4] hover:border-white/25 hover:bg-white/[0.07]"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => togglePageScope(item.value)}
                          className="flex h-full cursor-pointer items-center px-4"
                        >
                          {isSelected && <span className="mr-2">✓</span>}
                          {item.label}
                        </button>

                        {item.custom && (
                          <button
                            type="button"
                            onClick={() => removeCustomPage(item.value)}
                            className="flex h-full cursor-pointer items-center border-l border-white/12 px-3 text-[#aab2c4] transition hover:bg-white/8 hover:text-white"
                            aria-label={`${item.label} sayfasını kaldır`}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="mt-6 rounded-2xl border border-white/9 bg-[#0d1423]/88 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:p-6">
                <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="flex items-center gap-3 text-[24px] font-extrabold tracking-[-0.04em] text-[#dce2ef] sm:text-[26px]">
                      <Icon name="device" className="size-7 text-[#aebcff]" />
                      Cihaz Kapsamı
                    </h2>

                    <p className="mt-3 max-w-180 text-[13px] font-medium leading-6 text-[#8f98aa]">
                      Seçilen ekran ölçülerinde taşma, kırılan grid/flex
                      yapıları, font ölçekleri, yatay scroll ve mobil
                      etkileşimler kontrol edilir.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="w-fit rounded-md bg-white/8 px-3 py-1.5 text-[12px] font-extrabold text-[#aeb6c8]">
                      {selectedDeviceCount}/{deviceOptions.length} Seçili
                    </span>

                    <button
                      type="button"
                      onClick={toggleAllDevices}
                      className="cursor-pointer text-[13px] font-bold text-[#aeb6c8] transition hover:text-white"
                    >
                      {selectedDeviceCount === deviceOptions.length
                        ? "Temizle"
                        : "Tümünü Seç"}
                    </button>
                  </div>
                </div>

                <div className="mt-7 grid gap-5 xs:grid-cols-2 md:grid-cols-4">
                  {deviceOptions.map((device) => (
                    <DeviceCard
                      key={device.value}
                      title={device.title}
                      desc={device.desc}
                      icon={device.icon}
                      active={selectedDevices.includes(device.value)}
                      onClick={() => toggleDevice(device.value)}
                    />
                  ))}
                </div>
              </section>

              <section className="mt-6 rounded-2xl border border-white/9 bg-[#0d1423]/88 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:p-6">
                <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="flex items-center gap-3 text-[24px] font-extrabold tracking-[-0.04em] text-[#dce2ef] sm:text-[26px]">
                    <Icon name="module" className="size-7 text-[#aebcff]" />
                    Analiz Modülleri
                  </h2>

                  <span className="w-fit rounded-md bg-white/8 px-3 py-1.5 text-[12px] font-extrabold text-[#aeb6c8]">
                    {selectedModuleCount}/{modules.length} Seçili
                  </span>
                </div>

                <div className="mt-7 grid gap-5 xs:grid-cols-2 md:grid-cols-4">
                  {modules.map((moduleItem) => (
                    <ModuleCard
                      key={moduleItem.title}
                      {...moduleItem}
                      enabled={enabledModules.includes(moduleItem.title)}
                      onToggle={() => toggleModule(moduleItem.title)}
                    />
                  ))}
                </div>
              </section>

              <section className="mt-6 overflow-hidden rounded-2xl border border-white/9 bg-[#0d1423]/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <div className="flex items-center justify-between px-4 py-5 sm:px-6">
                  <h2 className="text-[24px] font-extrabold tracking-[-0.04em] text-[#dce2ef] sm:text-[26px]">
                    Son Hedefler
                  </h2>
                  <Link
                    href="/history"
                    className="cursor-pointer text-[13px] font-bold text-[#aebcff] transition hover:text-white"
                  >
                    Tümünü Gör
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-205 border-collapse">
                    <thead>
                      <tr className="border-y border-white/9 text-left text-[11px] font-extrabold uppercase tracking-widest text-[#9aa3b5]">
                        <th className="px-6 py-4">Site</th>
                        <th className="px-6 py-4">Tarih</th>
                        <th className="px-6 py-4">Modüller</th>
                        <th className="px-6 py-4">Durum</th>
                        <th className="px-6 py-4">Süre</th>
                        <th className="px-6 py-4 text-right">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTargets.map((row) => (
                        <tr
                          key={row.site}
                          className="border-b border-white/6 transition hover:bg-white/2.5"
                        >
                          <td className="px-6 py-5">
                            <p className="text-[14px] font-extrabold text-[#dce1ef]">
                              {row.site}
                            </p>
                            <p className="mt-1 text-[12px] font-medium text-[#8d96a8]">
                              {row.url}
                            </p>
                          </td>
                          <td className="px-6 py-5 text-[13px] font-bold text-[#a4adbe]">
                            {row.date}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-[#b5c3ff]">
                              <Icon name="speed" className="size-4" />
                              <Icon name="search" className="size-4" />
                              <Icon name="shield" className="size-4" />
                              <span className="text-[12px] font-bold text-[#b8c0d0]">
                                +6
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <StatusBadge type={row.type} label={row.status} />
                          </td>
                          <td className="px-6 py-5 text-[13px] font-bold text-[#aeb6c8]">
                            {row.duration}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-end gap-4 text-[#aab2c4]">
                              <button
                                type="button"
                                onClick={() => applyTargetUrl(row.url)}
                                className="cursor-pointer transition hover:text-white"
                                aria-label={`${row.site} için yeni tarama hazırla`}
                              >
                                <Icon name="chart" className="size-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => applyTargetUrl(row.url)}
                                className="cursor-pointer transition hover:text-white"
                                aria-label={`${row.site} için tekrar analiz hazırla`}
                              >
                                <Icon name="refresh" className="size-4" />
                              </button>
                              <button
                                type="button"
                                className="cursor-pointer transition hover:text-[#ff777d]"
                              >
                                <Icon name="trash" className="size-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <RightPanel
              selectedDeviceCount={selectedDeviceCount}
              selectedModuleCount={selectedModuleCount}
            />
          </div>
        </section>
      </div>
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
              className={`flex h-11 cursor-pointer items-center gap-4 rounded-md px-4 text-[14px] font-bold transition ${
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
            <Link
              href="/pricing"
              className="cursor-pointer text-[#b8c5ff] transition hover:text-white"
            >
              Paketleri İncele
            </Link>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <button className="flex h-9 w-full cursor-pointer items-center gap-4 rounded-md px-4 text-[14px] font-bold text-[#a5adbe] transition hover:bg-white/6 hover:text-white">
            <Icon name="help" className="size-4" />
            Destek
          </button>
          <button className="flex h-9 w-full cursor-pointer items-center gap-4 rounded-md px-4 text-[14px] font-bold text-[#a5adbe] transition hover:bg-white/6 hover:text-white">
            <Icon name="logout" className="size-4" />
            Çıkış Yap
          </button>
        </div>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="flex h-17.5 items-center justify-between border-b border-white/8 bg-[#080d18]/75 px-4 backdrop-blur-xl sm:px-6">
      <nav className="hidden items-center gap-7 lg:flex">
        {[
          ["Dashboard", "/dashboard"],
          ["Tarama", "/scanner"],
          ["Canlı İzleme", "/scanner"],
          ["Raporlar", "/history"],
          ["Fiyatlandırma", "/pricing"],
        ].map(([item, href]) => (
          <Link
            key={item}
            href={href}
            className={`cursor-pointer text-[13px] font-bold transition hover:text-white ${
              item === "Tarama" ? "text-white" : "text-[#969faf]"
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

        <button
          type="button"
          className="cursor-pointer text-[#aab2c4] transition hover:text-white"
        >
          <Icon name="bell" className="size-5" />
        </button>

        <button
          type="button"
          className="cursor-pointer text-[#aab2c4] transition hover:text-white"
        >
          <Icon name="settings" className="size-5" />
        </button>

        <Link
          href="/history"
          className="hidden h-9 cursor-pointer items-center gap-2 rounded-md border border-white/10 bg-white/3 px-4 text-[13px] font-bold text-[#c0c7d5] transition hover:bg-white/6 xl:inline-flex"
        >
          <Icon name="history" className="size-4" />
          Geçmiş Taramalar
        </Link>

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

function SelectBox({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: {
    value: string;
    label: string;
  }[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-[13px] font-bold text-[#aab2c4]">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full cursor-pointer appearance-none rounded-lg border border-white/13 bg-[#080d18] px-4 pr-10 text-[15px] font-semibold text-[#c7cdda] outline-none transition hover:border-white/25 focus:border-[#aebcff]"
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-[#080d18] text-[#c7cdda]"
            >
              {option.label}
            </option>
          ))}
        </select>

        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8993a6]">
          ⌄
        </span>
      </div>
    </div>
  );
}

function DeviceCard({
  title,
  desc,
  icon,
  active,
  onClick,
}: {
  title: string;
  desc: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex h-38.5 cursor-pointer flex-col items-center justify-center rounded-xl border px-3 text-center transition duration-300 ${
        active
          ? "border-[#aebcff] bg-[#1a2031] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          : "border-white/[0.14] bg-[#080d18]/80 hover:border-white/30 hover:bg-[#101827]"
      }`}
    >
      <Icon
        name={icon}
        className={`size-10 transition ${
          active ? "text-[#b9c7ff]" : "text-[#aeb6c8] group-hover:text-[#b9c7ff]"
        }`}
      />

      <span
        className={`mt-5 text-[22px] font-semibold tracking-[-0.03em] transition ${
          active ? "text-[#dce2ef]" : "text-[#b9bfcc] group-hover:text-[#dce2ef]"
        }`}
      >
        {title}
      </span>

      <span className="mt-1 text-[14px] font-semibold text-[#9ca4b6]">
        {desc}
      </span>
    </button>
  );
}

function ModuleCard({
  title,
  desc,
  icon,
  enabled,
  onToggle,
}: {
  title: string;
  desc: string;
  icon: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`group rounded-xl border p-6 transition duration-300 ${
        enabled
          ? "border-white/16 bg-[#080d18]/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]"
          : "border-white/8 bg-[#080d18]/45 opacity-60"
      }`}
    >
      <div className="flex items-start justify-between gap-4 bgw">
        <Icon
          name={icon}
          className={`size-7 transition ${
            enabled ? "text-[#b9c7ff]" : "text-[#7f899d]"
          }`}
        />

        <button
          type="button"
          onClick={onToggle}
          aria-pressed={enabled}
          className={`relative h-6 w-11 cursor-pointer rounded-full transition duration-300 ${
            enabled ? "bg-[#aebcff]!" : "bg-white/[0.016]!"
          }`}
        >
          <span
            className={`absolute top-1 size-4 rounded-full bg-white shadow-sm transition duration-300 ${
              enabled ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>

      <h3 className="mt-7 text-[20px] font-semibold tracking-[-0.03em] text-[#d6dbea]">
        {title}
      </h3>

      <p className="mt-2 min-h-12.5 text-[15px] font-medium leading-[1.35] text-[#a0a9bb]">
        {desc}
      </p>
    </div>
  );
}

function RightPanel({
  selectedDeviceCount,
  selectedModuleCount,
}: {
  selectedDeviceCount: number;
  selectedModuleCount: number;
}) {
  return (
    <aside className="space-y-6 xl:sticky xl:top-20 xl:self-start">
      <InfoCard title="Sistem Durumu" dot>
        <p className="text-[12px] font-medium text-[#9aa4b8]">
          Tüm sistemler operasyonel
        </p>
        <div className="mt-5 space-y-3 text-[12px] font-bold">
          {[
            ["Tarama Motoru", "12ms"],
            ["Veritabanı", "4ms"],
            ["Analiz API", "28ms"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-[#a7b0c2]">
                <span className="size-1.5 rounded-full bg-[#25d18c]" />
                {label}
              </span>
              <span className="text-[#d5dbea]">{value}</span>
            </div>
          ))}
        </div>
      </InfoCard>

      <InfoCard title="Tarama Özeti" icon="target">
        <div className="mt-4 space-y-3 text-[12px] font-bold">
          <div className="flex items-center justify-between">
            <span className="text-[#a7b0c2]">Ekran ölçüsü</span>
            <span className="text-[#d5dbea]">{selectedDeviceCount} adet</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#a7b0c2]">Analiz modülü</span>
            <span className="text-[#d5dbea]">{selectedModuleCount} adet</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#a7b0c2]">Responsive QA</span>
            <span className="text-[#25d18c]">Aktif</span>
          </div>
        </div>
      </InfoCard>

      <InfoCard title="Kuyruk Durumu" icon="queue">
        <div className="mt-3 flex items-center gap-4">
          <div className="grid size-11 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5 text-[20px] font-extrabold">
            3
          </div>
          <div>
            <p className="text-[13px] font-bold text-[#cdd3df]">
              Aktif tarama kuyruğu normal
            </p>
            <p className="mt-1 text-[12px] font-medium text-[#8c96a9]">
              Sıradaki: 3 • Bekleme: 12 dk
            </p>
          </div>
        </div>
      </InfoCard>

      <InfoCard title="Tahmini Tarama Süresi" icon="timer">
        <p className="mt-5 text-[24px] font-extrabold tracking-[-0.04em]">
          8 - 12 dk
        </p>
      </InfoCard>

      <InfoCard title="Tarama İpuçları" icon="bulb">
        <div className="mt-4 space-y-3 text-[12px] font-medium leading-5 text-[#a2acbd]">
          <p>⊙ Çok ekran seçmek responsive sorunları daha iyi yakalar.</p>
          <p>⊙ 320px ve 480px mobil kırılımlarını ayrı kontrol edin.</p>
          <p>⊙ 1440px üzeri ekranlarda boşluk ve grid hizası kontrol edilir.</p>
        </div>
      </InfoCard>
    </aside>
  );
}

function InfoCard({
  title,
  children,
  dot,
  icon,
}: {
  title: string;
  children: ReactNode;
  dot?: boolean;
  icon?: string;
}) {
  return (
    <div className="rounded-xl border border-white/9 bg-[#0d1423]/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="flex items-center justify-between gap-4">
        <h3 className="flex items-center gap-2 text-[15px] font-extrabold text-[#d9deeb]">
          {icon && <Icon name={icon} className="size-4 text-[#aebcff]" />}
          {title}
        </h3>
        {dot && <span className="size-2 rounded-full bg-[#25d18c]" />}
      </div>
      {children}
    </div>
  );
}

function StatusBadge({ type, label }: { type: string; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-md border px-3 py-1 text-[12px] font-extrabold ${
        type === "warning"
          ? "border-[#6d501d] bg-[#332613] text-[#f2a71e]"
          : type === "info"
            ? "border-[#1f4d88] bg-[#132949] text-[#4992ff]"
            : "border-[#14624d] bg-[#0d372e] text-[#22d296]"
      }`}
    >
      {label}
    </span>
  );
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
    speed: <path d="M4 14a8 8 0 1 1 16 0M12 14l4-4M9 18h6" />,
    search: <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4" />,
    shield: (
      <path d="M12 3 5 6v6c0 4.5 2.9 7.7 7 9 4.1-1.3 7-4.5 7-9V6l-7-3Z" />
    ),
    device: <path d="M4 5h16v10H4zM9 20h6M12 15v5" />,
    desktop: <path d="M4 5h16v10H4zM9 20h6M12 15v5" />,
    tablet: <path d="M7 3h10v18H7zM12 18h.01" />,
    mobile: <path d="M9 2h6v20H9zM12 18h.01" />,
    accessibility: (
      <path d="M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM4 8h16M12 8v13M8 21l4-8 4 8" />
    ),
    flow: (
      <path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01M7 7h10M7 7v10M17 7v10M7 17h10" />
    ),
    eye: (
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    ),
    form: <path d="M4 4h16v16H4zM8 8h8M8 12h8M8 16h4" />,
    module: <path d="M12 3 4 7l8 4 8-4-8-4ZM4 12l8 4 8-4M4 17l8 4 8-4" />,
    info: (
      <path d="M12 16v-4M12 8h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />
    ),
    target: (
      <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    ),
    queue: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
    sync: (
      <path d="M4 4v6h6M20 20v-6h-6M5 15a7 7 0 0 0 12 3M19 9A7 7 0 0 0 7 6" />
    ),
    timer: <path d="M12 8v5l3 2M9 2h6M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />,
    bulb: (
      <path d="M9 18h6M10 22h4M8 14a6 6 0 1 1 8 0c-1 1-1 2-1 3H9c0-1 0-2-1-3Z" />
    ),
    refresh: (
      <path d="M4 12a8 8 0 0 1 13.6-5.6L20 9M20 4v5h-5M20 12a8 8 0 0 1-13.6 5.6L4 15M4 20v-5h5" />
    ),
    trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3" />,
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