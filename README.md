# 🚀 Kripto Sohbeti - Turkish Crypto Tracker

Modern ve kullanıcı dostu Türkçe kripto para takip uygulaması.

## ✨ Özellikler

- **Real-time Crypto Data**: CoinMarketCap API ile güncel kripto para verileri
- **Hybrid News System**: RSS feeds + AI-generated crypto news
- **Market Analysis**: Piyasa durumu, dominance, fear & greed index
- **Exchanges**: Kripto para borsaları ve trading pairs
- **Events Calendar**: Kripto para etkinlikleri ve duyurular
- **Long/Short Ratios**: Piyasa sentiment analizi
- **Responsive Design**: Tüm cihazlarda mükemmel görünüm

## 🛠️ Teknolojiler

### Backend (Flask)
- Python 3.8+
- Flask & Flask-CORS
- CoinMarketCap API
- RSS Feed Processing
- Real-time Data Aggregation

### Frontend (React)
- React 18
- Modern CSS3
- Responsive Design
- Real-time Updates

## 🏃‍♂️ Yerel Kurulum

### 1. Repository'yi klonlayın
```bash
git clone https://github.com/OnurGuner5728/kriptosohbeti.git
cd kriptosohbeti
```

### 2. Backend Kurulumu
```bash
pip install -r requirements.txt
python api_server.py
```

### 3. Frontend Kurulumu
```bash
cd crypto-react-app
npm install
npm start
```

## 🌐 Production Deployment

### Backend - Railway.app
1. [Railway.app](https://railway.app)'e gidin
2. GitHub repository'sini bağlayın
3. Environment variables ekleyin:
   ```
   COINMARKETCAP_API_KEY=your_api_key_here
   ```
4. Otomatik deploy başlayacak

### Frontend - Netlify
1. [Netlify](https://netlify.com)'ye gidin
2. GitHub repository'sini bağlayın
3. Build settings:
   ```
   Base directory: crypto-react-app
   Build command: npm run build
   Publish directory: crypto-react-app/build
   ```
4. Environment variables:
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app/api
   ```

## 📋 API Endpoints

- `GET /api/health` - Health check
- `GET /api/crypto-data?limit=100` - Crypto data
- `GET /api/news` - Hybrid news (RSS + AI)
- `GET /api/exchanges` - Exchange data
- `GET /api/events` - Crypto events
- `GET /api/global-metrics` - Market metrics
- `GET /api/long-short` - Long/Short ratios

## 🔧 Konfigürasyon

### config.py
```python
COINMARKETCAP_API_KEY = "your_api_key_here"
```

### Environment Variables
```bash
# Backend
COINMARKETCAP_API_KEY=your_api_key_here
PORT=5000

# Frontend
REACT_APP_API_URL=https://your-backend-url.railway.app/api
```

## 📱 Özellik Detayları

### 🏠 Ana Sayfa
- Piyasa genel durumu
- Yükselenler/düşenler
- Hybrid haberler carousel
- Market dominance
- Fear & Greed index

### 💰 Kripto Sayfası
- Tüm kripto paralar listesi
- Detaylı fiyat bilgileri
- Piyasa değeri ve hacim
- Filtreleme ve sıralama

### 📈 Borsalar
- Kripto para borsaları
- Trading pairs
- Hacim ve güven skoru
- Borsalar arası karşılaştırma

### 📰 Haberler
- RSS feed haberleri
- AI-generated crypto news
- Kategori bazlı filtreleme
- Detaylı haber görüntüleme

### 📅 Takvim
- Kripto etkinlikleri
- Mainnet güncellemeleri
- Partnership duyuruları
- Etkinlik reminder'ları

## 🎨 UI/UX Özellikleri

- **Dark Theme**: Modern koyu tema
- **Responsive Design**: Mobil uyumlu
- **Loading States**: Kullanıcı deneyimi
- **Error Handling**: Hata yönetimi
- **Real-time Updates**: Canlı veri
- **Smooth Animations**: Akıcı geçişler

## 🔒 Güvenlik

- API rate limiting
- CORS protection
- Input validation
- Error handling
- Environment variables

## 📊 Performance

- Optimized API calls
- Lazy loading
- Caching strategies
- Minimal bundle size
- Fast rendering

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🎯 Roadmap

- [ ] Portfolio tracker
- [ ] Price alerts
- [ ] Trading signals
- [ ] Mobile app
- [ ] Multi-language support
- [ ] Advanced charting
- [ ] Social features

## 📞 İletişim

- **Geliştirici**: OnurGuner5728
- **GitHub**: https://github.com/OnurGuner5728/kriptosohbeti
- **Email**: [Your Email]

---

### 🌟 Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!

**Live Demo**: [Netlify'da Canlı Görüntüle](https://your-app-name.netlify.app) 