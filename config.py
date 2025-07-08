import os
from dotenv import load_dotenv

# .env dosyasını yükle
load_dotenv()

# API anahtarını environment variable'dan al (Railway için)
COINMARKETCAP_API_KEY = os.getenv('COINMARKETCAP_API_KEY')

if not COINMARKETCAP_API_KEY:
    print("⚠️  COINMARKETCAP_API_KEY bulunamadı! Demo data kullanılacak.")
    print("💡 Production için Railway'da environment variable'ı ayarlayın.")
    COINMARKETCAP_API_KEY = "demo_key"  # Fallback value 