# Precheck AI

Next.js + TypeScript + Tailwind CSS ile hazırlanmış yayın öncesi web denetim platformu başlangıç yapısı.

## Komutlar

```bash
npm install
npm run dev
```

Tarayıcıda aç:

```txt
http://localhost:3000
```

## Hazır rotalar

- `/` Landing Page
- `/dashboard` Genel Bakış
- `/scanner` Yeni Tarama
- `/live` Canlı İzleme
- `/report` Detaylı Rapor
- `/history` Analiz Geçmişi
- `/pricing` Fiyatlandırma
- `/auth` Giriş / Kayıt başlangıcı
- `/settings` Ayarlar / Takım

## Klasör yapısı

```txt
src/
  app/
  components/
    layout/
    ui/
  lib/
  types/
```

## Sonraki adım

İlk olarak Landing Page tasarımını Stitch çıktısına göre birebir kodlayıp ardından dashboard ekranlarına geçmek mantıklı olur.
