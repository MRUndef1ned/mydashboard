# Nexus Dashboard

Koyu tonlarda, modern ve şık bir dashboard arayüzü. İlk aşamada görsel katman; sayfa geçişleri ve kimlik doğrulama eklendi.

## Özellikler

- Koyu tema (indigo / cyan vurgu renkleri)
- Yumuşak sayfa geçiş animasyonları (Framer Motion)
- Kimlik doğrulama (giriş / kayıt, korumalı rotalar)
- 6 dashboard sayfası: Genel Bakış, Analitik, Projeler, Ekip, Mesajlar, Ayarlar
- Glassmorphism kartlar ve gradient arka plan

## Kurulum

```bash
npm install
npm run dev
```

Tarayıcıda `http://localhost:5173` adresini açın.

## Giriş Bilgileri

Demo hesap:

- **E-posta:** `demo@nexus.com`
- **Şifre:** `demo123`

Yeni hesap oluşturmak için kayıt sayfasını kullanabilirsiniz. Oturum bilgisi `localStorage`'da saklanır.

## Teknolojiler

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- React Router 7
- Framer Motion
- Lucide React (ikonlar)

## Sonraki Adımlar

- Backend API entegrasyonu
- Mobil responsive sidebar
- Gerçek zamanlı veri
