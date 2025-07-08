# Kripto Sohbeti - Kripto Para Takip Uygulaması

Bu proje, kripto para verilerini takip etmek için geliştirilmiş bir web uygulamasıdır.

## Özellikler

- **Kripto Para Listesi**: CoinMarketCap API'den güncel kripto para verileri
- **Long/Short Analizi**: Kripto para pozisyon analizi
- **Haberler**: Kripto para haberleri
- **Takvim**: Kripto para etkinlikleri
- **Güvenli API**: Backend üzerinden güvenli API çağrıları

## Kurulum

### 1. Gereksinimler

```bash
# Python bağımlılıklarını yükleyin
pip install -r requirements.txt
```

### 2. Ortam Değişkenleri

`.env` dosyası zaten oluşturuldu ve CoinMarketCap API anahtarınızı içeriyor.

### 3. Çalıştırma

#### Backend API Sunucusu (Önce bu çalıştırılmalı)
```bash
python api_server.py
```

Backend sunucusu http://localhost:5000 adresinde çalışacak.

#### Frontend (HTML dosyaları)
- `index.html` - Ana sayfa
- `borsa.html` - Borsa verileri
- `haberler.html` - Haberler
- `kp.html` - Kripto para detayları

## Güvenlik İyileştirmeleri

✅ **API anahtarı güvenliği**: API anahtarı artık `.env` dosyasında güvenli şekilde saklanıyor
✅ **Backend/Frontend ayrımı**: Frontend doğrudan API anahtarına erişemiyor
✅ **CORS güvenliği**: Backend sadece belirlenen domainlerden istekleri kabul ediyor

## Dosya Yapısı

```
Kripto Sohbeti/
├── .env                    # Ortam değişkenleri (API anahtarı)
├── config.py              # Yapılandırma (güvenli API anahtarı okuma)
├── api_server.py          # Backend API sunucusu
├── coinmarketcap_data.py  # CoinMarketCap veri çekme fonksiyonları
├── requirements.txt       # Python bağımlılıkları
├── index.html             # Ana sayfa
├── coinmarketcap.js       # Frontend kripto para verileri
├── long-short.js          # Long/Short analizi
├── script1.js             # Genel JavaScript fonksiyonları
└── diğer dosyalar...
```

## Kullanım

1. **Backend'i başlatın**: `python api_server.py`
2. **Tarayıcıda HTML dosyalarını açın**: `index.html`
3. **Veriler otomatik olarak yüklenecek**

## API Endpoints

- `GET /api/crypto-data` - Kripto para listesi
- `GET /api/long-short` - Long/Short verileri  
- `GET /api/health` - API durumu

## Sorun Giderme

**Veriler yüklenmiyor?**
- Backend API sunucusunun çalıştığından emin olun
- Tarayıcı console'unda hata mesajlarını kontrol edin
- API anahtarının `.env` dosyasında doğru şekilde tanımlandığından emin olun 