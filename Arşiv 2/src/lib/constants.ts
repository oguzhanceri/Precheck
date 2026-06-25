import type { MetricItem, NavItem } from "@/types";

export const marketingNav: NavItem[] = [
  { label: "Platform", href: "#platform" },
  { label: "Özellikler", href: "#features" },
  { label: "Süreç", href: "#workflow" },
  { label: "Fiyatlandırma", href: "/pricing" },
];

export const appNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Yeni Tarama", href: "/scanner" },
  { label: "Canlı İzleme", href: "/live" },
  { label: "Detaylı Rapor", href: "/report" },
  { label: "Geçmiş", href: "/history" },
  { label: "Ayarlar", href: "/settings" },
];

export const dashboardMetrics: MetricItem[] = [
  { label: "Ortalama Kalite Skoru", value: "94", change: "+12 bu hafta", tone: "success" },
  { label: "Tespit Edilen Hata", value: "128", change: "34 kritik", tone: "warning" },
  { label: "Tamamlanan Tarama", value: "2.4K", change: "+18%", tone: "info" },
  { label: "Takım Kullanımı", value: "78%", change: "stabil", tone: "neutral" },
];

export const recentScans = [
  { url: "stitch-preview.app", score: 96, status: "Temiz", date: "Bugün 22:14" },
  { url: "client-landing.com", score: 81, status: "Uyarı", date: "Bugün 18:32" },
  { url: "checkout-flow.io", score: 68, status: "Kritik", date: "Dün 23:09" },
];

export const reportFindings = [
  {
    title: "Mobil kırılımda CTA alanı sıkışıyor",
    desc: "375px görünümde hero CTA grubu ikinci satıra düşüyor ve görsel alanla çakışıyor.",
    tag: "Responsive",
    level: "Kritik",
  },
  {
    title: "Meta açıklaması eksik",
    desc: "Landing sayfası için SEO açıklaması tanımlanmamış. Arama sonucu görünürlüğünü düşürebilir.",
    tag: "SEO",
    level: "Uyarı",
  },
  {
    title: "Görsellerde width/height eksikleri var",
    desc: "Layout shift riskini azaltmak için medya öğelerine boyut bilgisi eklenmeli.",
    tag: "Performance",
    level: "Bilgi",
  },
];
