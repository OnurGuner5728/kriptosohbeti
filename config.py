import os
from dotenv import load_dotenv

# .env dosyasını yükle
load_dotenv()

# API anahtarını .env dosyasından al
COINMARKETCAP_API_KEY = os.getenv('COINMARKETCAP_API_KEY')

if not COINMARKETCAP_API_KEY:
    raise ValueError("COINMARKETCAP_API_KEY .env dosyasında bulunamadı!") 