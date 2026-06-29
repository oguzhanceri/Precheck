import { mergeDuplicateFindings } from "@/lib/merge-findings";

export type PerformanceVital = {
  metric: string;
  value: string;
  rawValue: number | null;
  status: "good" | "needs-improvement" | "poor";
};

export type PerformanceFinding = {
  title: string;
  desc: string;
  level: "critical" | "high" | "medium" | "low";
  icon: string;
  category: "performance";
  solution: string;
  causes?: string[];
};

export type PerformanceSuggestion = {
  title: string;
  desc: string;
  impact: "Yüksek" | "Orta" | "Düşük";
  actions: string[];
  category: "performance";
};

export type PerformanceAnalysisResult = {
  score: number;
  vitals: PerformanceVital[];
  findings: PerformanceFinding[];
  suggestions: PerformanceSuggestion[];
  raw?: unknown;
};

type LighthouseAudit = {
  id: string;
  title?: string;
  description?: string;
  score?: number | null;
  numericValue?: number;
  displayValue?: string;
};

type AuditTranslation = {
  title: string;
  desc: string;
  solution: string;
  actions: string[];
  causes: string[];
};

const API_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

const auditTranslations: Record<string, AuditTranslation> = {
  "largest-contentful-paint": {
    title: "Largest Contentful Paint (LCP) süresi yüksek",
    desc: "Sayfanın ana içerik öğesi geç yükleniyor. Bu durum kullanıcının ilk yükleme deneyimini olumsuz etkiler.",
    solution:
      "Hero görselini, kritik CSS’i, font yüklemelerini ve sunucu yanıt süresini optimize edin.",
    actions: [
      "LCP öğesini tespit edip boyutunu küçültün.",
      "Hero görseli için preload kullanın.",
      "Kritik CSS dışındaki stilleri geciktirin.",
    ],
    causes: [
      "Hero veya ana görsel çok büyük olabilir.",
      "LCP öğesi için preload kullanılmıyor olabilir.",
      "Sunucu yanıt süresi yüksek olabilir.",
      "Kritik CSS veya font yüklemeleri ilk render’ı geciktiriyor olabilir.",
    ],
  },
  "cumulative-layout-shift": {
    title: "Cumulative Layout Shift (CLS) iyileştirilmeli",
    desc: "Sayfa yüklenirken beklenmeyen yerleşim kaymaları oluşuyor olabilir.",
    solution:
      "Görsel, iframe, reklam ve dinamik içerikler için sabit width/height veya aspect-ratio tanımlayın.",
    actions: [
      "Görsellere width ve height değerleri ekleyin.",
      "Sonradan yüklenen banner veya popup alanları için yer ayırın.",
      "Font değişimlerinden kaynaklı layout shift’i azaltın.",
    ],
    causes: [
      "Görsellerde width/height veya aspect-ratio eksik olabilir.",
      "Sonradan yüklenen banner, popup veya iframe alanı sayfayı itiyor olabilir.",
      "Font yüklenirken metin ölçüleri değişiyor olabilir.",
      "Dinamik içerikler için önceden alan ayrılmamış olabilir.",
    ],
  },
  "interaction-to-next-paint": {
    title: "Interaction to Next Paint (INP) ölçümü kontrol edilmeli",
    desc: "Kullanıcı etkileşimlerinden sonra sayfanın yanıt verme süresi yüksek olabilir veya laboratuvar testinde ölçülememiş olabilir.",
    solution:
      "Ana thread üzerindeki uzun JavaScript işlemlerini azaltın ve event handler’ları hafifletin.",
    actions: [
      "Uzun çalışan JavaScript görevlerini parçalayın.",
      "Ağır event listener işlemlerini sadeleştirin.",
      "Üçüncü parti scriptleri azaltın.",
    ],
    causes: [
      "Click, scroll veya input event handler’ları ağır çalışıyor olabilir.",
      "Ana thread uzun JavaScript görevleriyle meşgul olabilir.",
      "Üçüncü parti scriptler etkileşim yanıtını geciktiriyor olabilir.",
      "Yoğun DOM güncellemeleri etkileşim sonrası render’ı geciktiriyor olabilir.",
    ],
  },
  "first-contentful-paint": {
    title: "First Contentful Paint (FCP) geç oluşuyor",
    desc: "Sayfada ilk metin veya görsel içeriğin görünmesi uzun sürüyor.",
    solution:
      "Render-blocking CSS/JS kaynaklarını azaltın, font ve kritik CSS yüklemesini optimize edin.",
    actions: [
      "Kritik CSS’i inline veya öncelikli hale getirin.",
      "Gereksiz render-blocking scriptleri defer edin.",
      "Font dosyaları için preload ve font-display kullanın.",
    ],
    causes: [
      "Render-blocking CSS veya JavaScript kaynakları olabilir.",
      "Font dosyaları geç yükleniyor olabilir.",
      "Kritik CSS ayrıştırılmamış olabilir.",
      "Sunucu HTML yanıtı yavaş dönüyor olabilir.",
    ],
  },
  "speed-index": {
    title: "Speed Index değeri yüksek",
    desc: "Sayfanın görsel olarak tamamlanması beklenenden uzun sürüyor.",
    solution:
      "İlk ekranda görünen kaynakları hafifletin ve kritik olmayan içerikleri lazy load edin.",
    actions: [
      "İlk ekrandaki görselleri optimize edin.",
      "Aşağıdaki görseller için lazy loading kullanın.",
      "Kritik olmayan animasyon ve scriptleri erteleyin.",
    ],
    causes: [
      "İlk ekrandaki medya dosyaları büyük olabilir.",
      "Lazy loading stratejisi eksik veya yanlış kullanılıyor olabilir.",
      "Animasyonlar veya ağır scriptler ilk yüklemeyi yavaşlatıyor olabilir.",
      "CSS ve font yüklemeleri görsel tamamlanmayı geciktiriyor olabilir.",
    ],
  },
  "total-blocking-time": {
    title: "Total Blocking Time (TBT) yüksek",
    desc: "JavaScript ana thread’i uzun süre meşgul ettiği için sayfa etkileşime geç hazır hale geliyor.",
    solution:
      "Büyük JavaScript paketlerini bölün, kullanılmayan kodları kaldırın ve üçüncü parti scriptleri azaltın.",
    actions: [
      "Bundle analizini çalıştırın.",
      "Dynamic import ile ağır modülleri ayırın.",
      "Üçüncü parti scriptleri sadece gerekli sayfalarda yükleyin.",
    ],
    causes: [
      "Büyük JavaScript bundle’ları ana thread’i bloke ediyor olabilir.",
      "Üçüncü parti scriptler uzun task oluşturuyor olabilir.",
      "Kullanılmayan JavaScript ilk yüklemede çalışıyor olabilir.",
      "Ağır componentler route bazlı bölünmemiş olabilir.",
    ],
  },
  "render-blocking-resources": {
    title: "Render-blocking kaynaklar sayfayı geciktiriyor",
    desc: "CSS veya JavaScript dosyaları sayfanın ilk render edilmesini engelliyor.",
    solution:
      "Kritik CSS’i ayırın, gerekli olmayan CSS/JS dosyalarını defer veya async yükleyin.",
    actions: [
      "Kritik CSS’i önceliklendirin.",
      "Gereksiz stylesheet dosyalarını kaldırın.",
      "Script dosyalarında defer/async stratejisi kullanın.",
    ],
    causes: [
      "CSS dosyaları render öncesi bloklayıcı yükleniyor olabilir.",
      "Script dosyalarında defer veya async kullanılmıyor olabilir.",
      "Kritik olmayan stylesheet dosyaları ilk render’a dahil edilmiş olabilir.",
      "Font veya ikon kütüphaneleri ilk render’ı geciktiriyor olabilir.",
    ],
  },
  "unused-javascript": {
    title: "Kullanılmayan JavaScript kodu fazla",
    desc: "Sayfada yüklenen JavaScript’in bir kısmı ilk yüklemede kullanılmıyor.",
    solution:
      "Kod bölme, tree-shaking ve dynamic import kullanarak ilk yüklenen JS miktarını azaltın.",
    actions: [
      "Kullanılmayan component ve kütüphaneleri kaldırın.",
      "Route bazlı code splitting uygulayın.",
      "Ağır paketleri daha hafif alternatiflerle değiştirin.",
    ],
    causes: [
      "Sayfada kullanılmayan component kodları bundle’a dahil edilmiş olabilir.",
      "Route bazlı code splitting eksik olabilir.",
      "Ağır üçüncü parti paketler ilk yüklemeye eklenmiş olabilir.",
      "Tree-shaking verimli çalışmıyor olabilir.",
    ],
  },
  "unused-css-rules": {
    title: "Kullanılmayan CSS kuralları fazla",
    desc: "Sayfada yüklenen CSS’in bir kısmı mevcut görünümde kullanılmıyor.",
    solution:
      "CSS dosyalarını sadeleştirin, purge/content ayarlarını kontrol edin ve sayfa bazlı CSS yüklemeyi tercih edin.",
    actions: [
      "Tailwind content path ayarlarını kontrol edin.",
      "Kullanılmayan global CSS sınıflarını temizleyin.",
      "Sayfaya özel CSS yükleme stratejisi kullanın.",
    ],
    causes: [
      "Global CSS içinde kullanılmayan kurallar olabilir.",
      "Tailwind content path ayarları eksik olabilir.",
      "Tüm sayfaların CSS’i tek dosyada yükleniyor olabilir.",
      "Eski componentlerden kalan stiller temizlenmemiş olabilir.",
    ],
  },
  "uses-optimized-images": {
    title: "Görseller optimize edilmemiş",
    desc: "Bazı görseller gereğinden büyük veya sıkıştırılmamış olabilir.",
    solution:
      "Görselleri sıkıştırın, doğru boyutta servis edin ve modern formatlara dönüştürün.",
    actions: [
      "Büyük görselleri yeniden boyutlandırın.",
      "Görselleri WebP veya AVIF formatına çevirin.",
      "Kalite oranını görsel kayıp yaratmadan düşürün.",
    ],
    causes: [
      "Görseller gerçek görüntüleme boyutundan büyük servis ediliyor olabilir.",
      "Görsel sıkıştırma uygulanmamış olabilir.",
      "Eski JPG/PNG formatları kullanılıyor olabilir.",
      "CDN veya image optimization pipeline eksik olabilir.",
    ],
  },
  "uses-webp-images": {
    title: "Modern görsel formatları kullanılmıyor",
    desc: "WebP veya AVIF gibi modern formatlar kullanılmadığı için görsel dosya boyutları yüksek kalıyor.",
    solution: "JPG/PNG görselleri WebP veya AVIF formatında sunun.",
    actions: [
      "WebP/AVIF çıktıları oluşturun.",
      "Picture elementi veya CDN format dönüşümü kullanın.",
      "Eski formatları fallback olarak bırakın.",
    ],
    causes: [
      "Görseller JPG/PNG olarak servis ediliyor olabilir.",
      "CDN format dönüşümü aktif olmayabilir.",
      "Picture/source fallback yapısı kurulmamış olabilir.",
      "Image pipeline modern format üretmiyor olabilir.",
    ],
  },
  "uses-responsive-images": {
    title: "Responsive görsel boyutları eksik",
    desc: "Mobil ve desktop cihazlara aynı büyük görseller gönderiliyor olabilir.",
    solution:
      "srcset, sizes veya framework image optimizasyonu ile cihaza uygun görsel boyutu sunun.",
    actions: [
      "srcset ve sizes değerlerini ekleyin.",
      "Mobil için daha küçük görsel varyasyonları üretin.",
      "Next.js Image benzeri optimizasyon yapıları kullanın.",
    ],
    causes: [
      "srcset veya sizes değerleri eksik olabilir.",
      "Mobil cihazlara desktop boyutlu görsel gönderiliyor olabilir.",
      "Image component optimizasyonu kullanılmıyor olabilir.",
      "Farklı breakpointler için görsel varyasyonları üretilmemiş olabilir.",
    ],
  },
  "server-response-time": {
    title: "Sunucu yanıt süresi yüksek",
    desc: "HTML dokümanının sunucudan dönmesi uzun sürüyor.",
    solution:
      "Cache, CDN, veritabanı sorguları ve backend yanıt süresini optimize edin.",
    actions: [
      "CDN cache yapılandırmasını kontrol edin.",
      "Backend sorgularını optimize edin.",
      "Statik sayfalar için cache stratejisi ekleyin.",
    ],
    causes: [
      "HTML yanıtı cache’lenmiyor olabilir.",
      "Backend veya veritabanı sorguları yavaş olabilir.",
      "CDN yapılandırması eksik olabilir.",
      "Sunucu konumu hedef kullanıcıya uzak olabilir.",
    ],
  },
  "dom-size": {
    title: "DOM boyutu fazla büyük",
    desc: "Sayfadaki HTML eleman sayısı yüksek olduğu için render ve etkileşim performansı düşebilir.",
    solution:
      "Gereksiz wrapper elemanları azaltın, liste ve grid alanlarında daha sade DOM yapısı kullanın.",
    actions: [
      "Tekrarlı wrapper div yapılarını sadeleştirin.",
      "Uzun listelerde pagination veya virtual scroll kullanın.",
      "Gizli ama DOM’da kalan içerikleri azaltın.",
    ],
    causes: [
      "Gereksiz wrapper div kullanımı fazla olabilir.",
      "Uzun listeler DOM’da tamamen render ediliyor olabilir.",
      "Gizli tab/popup içerikleri DOM’da tutuluyor olabilir.",
      "Component yapısı gereğinden fazla nested olabilir.",
    ],
  },
  "third-party-summary": {
    title: "Üçüncü parti script yükü yüksek",
    desc: "Harici servislerden gelen scriptler yükleme ve etkileşim performansını etkiliyor.",
    solution:
      "Analytics, chat, pixel ve embed scriptlerini sadece gerekli olduğunda yükleyin.",
    actions: [
      "Gereksiz üçüncü parti scriptleri kaldırın.",
      "Scriptleri consent sonrası yükleyin.",
      "async/defer stratejisini uygulayın.",
    ],
    causes: [
      "Analytics, chat, pixel veya embed scriptleri ilk yüklemede çalışıyor olabilir.",
      "Üçüncü parti scriptler async/defer olmadan yükleniyor olabilir.",
      "Kullanılmayan harici servis kodları sayfada kalmış olabilir.",
      "Consent sonrası yükleme stratejisi uygulanmıyor olabilir.",
    ],
  },
  "bootup-time": {
    title: "JavaScript çalışma süresi yüksek",
    desc: "Tarayıcı JavaScript dosyalarını parse ve execute ederken fazla zaman harcıyor.",
    solution:
      "JavaScript paketlerini küçültün, ağır kütüphaneleri azaltın ve kodu parçalara ayırın.",
    actions: [
      "Bundle boyutunu analiz edin.",
      "Ağır kütüphaneler için alternatif kullanın.",
      "İlk yüklemede gerekmeyen kodları lazy yükleyin.",
    ],
    causes: [
      "JavaScript bundle boyutu büyük olabilir.",
      "Ağır kütüphaneler ilk yüklemede parse ediliyor olabilir.",
      "Dynamic import kullanılmıyor olabilir.",
      "Client-side hydration yükü fazla olabilir.",
    ],
  },
  "mainthread-work-breakdown": {
    title: "Main thread iş yükü fazla",
    desc: "Tarayıcının ana iş parçacığı render, script ve style hesaplamalarıyla fazla meşgul oluyor.",
    solution:
      "Uzun JavaScript görevlerini azaltın, layout thrashing oluşturan işlemleri temizleyin.",
    actions: [
      "Uzun task oluşturan scriptleri tespit edin.",
      "DOM okuma/yazma işlemlerini gruplayın.",
      "Animasyonlarda transform ve opacity tercih edin.",
    ],
    causes: [
      "Ana thread uzun JavaScript görevleriyle meşgul olabilir.",
      "Layout thrashing oluşturan DOM okuma/yazma işlemleri olabilir.",
      "Ağır animasyonlar layout veya paint maliyeti oluşturuyor olabilir.",
      "Script, style ve render hesaplamaları aynı anda yoğunlaşıyor olabilir.",
    ],
  },
};

const importantAuditIds = Object.keys(auditTranslations);

function scoreToPercent(score?: number | null) {
  if (typeof score !== "number") return 0;
  return Math.round(score * 100);
}

function getStatus(metric: string, value: number | null): PerformanceVital["status"] {
  if (value === null) return "poor";

  if (metric === "CLS") {
    if (value <= 0.1) return "good";
    if (value <= 0.25) return "needs-improvement";
    return "poor";
  }

  if (metric === "INP") {
    if (value <= 200) return "good";
    if (value <= 500) return "needs-improvement";
    return "poor";
  }

  if (metric === "LCP") {
    if (value <= 2500) return "good";
    if (value <= 4000) return "needs-improvement";
    return "poor";
  }

  if (metric === "FCP") {
    if (value <= 1800) return "good";
    if (value <= 3000) return "needs-improvement";
    return "poor";
  }

  if (metric === "TBT") {
    if (value <= 200) return "good";
    if (value <= 600) return "needs-improvement";
    return "poor";
  }

  if (metric === "Speed Index") {
    if (value <= 3400) return "good";
    if (value <= 5800) return "needs-improvement";
    return "poor";
  }

  return "needs-improvement";
}

function formatMs(value?: number) {
  if (typeof value !== "number") return "Ölçülemedi";
  if (value >= 1000) return `${(value / 1000).toFixed(2)} sn`;
  return `${Math.round(value)} ms`;
}

function formatCls(value?: number) {
  if (typeof value !== "number") return "Ölçülemedi";
  return value.toFixed(3);
}

function getAudit(audits: Record<string, LighthouseAudit>, id: string) {
  return audits[id];
}

function createVital(
  label: string,
  audit: LighthouseAudit | undefined,
  formatter: (value?: number) => string = formatMs,
): PerformanceVital {
  const rawValue =
    typeof audit?.numericValue === "number" ? audit.numericValue : null;

  return {
    metric: label,
    value: formatter(audit?.numericValue),
    rawValue,
    status: getStatus(label, rawValue),
  };
}

function auditToFinding(audit: LighthouseAudit): PerformanceFinding | null {
  if (audit.score === null || audit.score === undefined) return null;
  if (audit.score >= 0.9) return null;

  const translation = auditTranslations[audit.id];

  if (!translation) return null;

  const level: PerformanceFinding["level"] =
    audit.score <= 0.25 ? "critical" : audit.score <= 0.5 ? "high" : "medium";

  return {
    title: translation.title,
    desc: audit.displayValue
      ? `${translation.desc} Sonuç: ${audit.displayValue}`
      : translation.desc,
    level,
    icon: level === "critical" ? "alert-triangle" : "zap",
    category: "performance",
    solution: translation.solution,
    causes: translation.causes,
  };
}

function createSuggestions(findings: PerformanceFinding[]): PerformanceSuggestion[] {
  return findings.slice(0, 6).map((finding) => {
    const auditId = importantAuditIds.find(
      (id) => auditTranslations[id].title === finding.title,
    );

    const actions = auditId
      ? auditTranslations[auditId].actions
      : [
          "İlgili Lighthouse audit detayını kontrol edin.",
          "Gereksiz kaynakları azaltın.",
          "Değişiklik sonrası tekrar analiz çalıştırın.",
        ];

    return {
      title: `${finding.title} için aksiyon planı`,
      desc: finding.desc,
      impact:
        finding.level === "critical" || finding.level === "high"
          ? "Yüksek"
          : "Orta",
      category: "performance",
      actions,
    };
  });
}

export async function analyzePerformance(
  url: string,
): Promise<PerformanceAnalysisResult> {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;

  const params = new URLSearchParams({
    url,
    category: "performance",
    strategy: "mobile",
  });

  if (apiKey) {
    params.set("key", apiKey);
  }

  const response = await fetch(`${API_ENDPOINT}?${params.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`PageSpeed API hatası: ${response.status}`);
  }

  const data = await response.json();

  const lighthouse = data.lighthouseResult;
  const audits: Record<string, LighthouseAudit> = lighthouse?.audits || {};
  const performanceScore = scoreToPercent(
    lighthouse?.categories?.performance?.score,
  );

  const vitals: PerformanceVital[] = [
    createVital("LCP", getAudit(audits, "largest-contentful-paint")),
    createVital("CLS", getAudit(audits, "cumulative-layout-shift"), formatCls),
    createVital("INP", getAudit(audits, "interaction-to-next-paint")),
    createVital("FCP", getAudit(audits, "first-contentful-paint")),
    createVital("Speed Index", getAudit(audits, "speed-index")),
    createVital("TBT", getAudit(audits, "total-blocking-time")),
  ];

  const findings = importantAuditIds
    .map((id) => getAudit(audits, id))
    .filter(Boolean)
    .map((audit) => auditToFinding(audit))
    .filter(Boolean) as PerformanceFinding[];

  const mergedFindings = mergeDuplicateFindings(findings);

  return {
    score: performanceScore,
    vitals,
    findings: mergedFindings,
    suggestions: createSuggestions(mergedFindings),
    raw: data,
  };
}