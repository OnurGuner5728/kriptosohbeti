import requests
from config import COINMARKETCAP_API_KEY

def get_long_short_data():
    url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest"
    headers = {
        'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY,
        'Accept': 'application/json'
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        # İlk 10 kripto para için long/short oranlarını hesapla
        long_short_data = []
        for coin in data['data'][:10]:
            # Burada gerçek long/short verilerini çekmek için
            # CoinMarketCap'in özel API endpoint'lerini kullanabilirsiniz
            long_short_data.append({
                'symbol': coin['symbol'],
                'name': coin['name'],
                'price': coin['quote']['USD']['price'],
                'long_ratio': 0.0,  # Bu değerler API'den gelecek
                'short_ratio': 0.0  # Bu değerler API'den gelecek
            })
        
        return long_short_data
    except Exception as e:
        print(f"Hata oluştu: {str(e)}")
        return None

if __name__ == "__main__":
    data = get_long_short_data()
    if data:
        for coin in data:
            print(f"{coin['name']} ({coin['symbol']}):")
            print(f"Fiyat: ${coin['price']:.2f}")
            print(f"Long/Short Oranı: {coin['long_ratio']}/{coin['short_ratio']}")
            print("---") 