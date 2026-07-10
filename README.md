# Nexus Dashboard

Koyu tonlarda, modern ve şık bir dashboard arayüzü. Canlı borsa verisi (BIST + ABD), kimlik doğrulama ve sayfa geçişleri içerir.

## Özellikler

- **Canlı Borsa** — BIST ve ABD hisselerinin anlık fiyatları (10sn güncelleme)
- Koyu tema (indigo / cyan vurgu renkleri)
- Yumuşak sayfa geçiş animasyonları (Framer Motion)
- Kimlik doğrulama (giriş / kayıt, korumalı rotalar)
- Komut paleti (`⌘K` / `Ctrl+K`)
- Bildirim paneli ve toast mesajları
- Animasyonlu KPI sayaçları
- Mobil uyumlu açılır sidebar

## Kurulum

```bash
npm install
npm run dev
```

Bu komut **hem frontend** (port 5173) **hem API sunucusunu** (port 3001) birlikte başlatır.

Tarayıcıda `http://localhost:5173` adresini açın.

> **Önemli:** Sadece `vite` çalıştırırsanız borsa verisi gelmez. Mutlaka `npm run dev` kullanın.

## Giriş Bilgileri

Demo hesap:

- **E-posta:** `demo@nexus.com`
- **Şifre:** `demo123`

## Borsa Kullanımı

1. Sol menüden **Borsa** sayfasına gidin
2. **Hisse Ekle** ile BIST (THYAO, GARAN...) veya ABD (AAPL, NVDA...) hissesi ekleyin
3. Fiyatlar her 10 saniyede otomatik güncellenir
4. Genel Bakış sayfasında canlı ticker şeridi görünür

Varsayılan izleme listesi: THYAO, GARAN, AKBNK, EREGL, AAPL, MSFT, NVDA, TSLA

## Teknolojiler

- React 19 + TypeScript
- Vite 6 + Express API
- Yahoo Finance (BIST `.IS` + ABD sembolleri)
- Server-Sent Events (SSE) canlı akış
- Tailwind CSS 4
- React Router 7 + Framer Motion

## API Endpoints

| Endpoint | Açıklama |
|----------|----------|
| `GET /api/stocks?symbols=AAPL,THYAO.IS` | Anlık fiyat |
| `GET /api/stocks/stream?symbols=...` | SSE canlı akış |
| `GET /api/stocks/search?q=thyao` | Hisse arama |

## Sonraki Adımlar

- WebSocket ile milisaniye düzeyinde güncelleme
- Portföy değer hesaplama
- Fiyat alarmları
