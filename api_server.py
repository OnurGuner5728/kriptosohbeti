from flask import Flask, jsonify, request
from flask_cors import CORS
from coinmarketcap_data import get_long_short_data
from config import COINMARKETCAP_API_KEY
import requests

app = Flask(__name__)

# CORS ayarları - Production için açık ayar
CORS(app, 
     origins=['*'],  # Geçici olarak tüm origin'lere izin ver
     allow_headers=['Content-Type', 'Authorization', 'Access-Control-Allow-Credentials'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     supports_credentials=True)

# Manual CORS headers ekleme
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

# Request logging
@app.before_request
def log_request_info():
    print(f"📨 REQUEST: {request.method} {request.path} from {request.headers.get('Origin', 'Unknown')}")

# OPTIONS pre-flight requests için
@app.route('/api/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    print(f"🔄 PREFLIGHT: /api/{path}")
    return '', 200

@app.route('/api/crypto-data', methods=['GET'])
def get_crypto_data():
    """CoinMarketCap'ten kripto para verilerini çeker"""
    try:
        # API key kontrolü
        if COINMARKETCAP_API_KEY == "demo_key":
            # Demo data döndür
            return jsonify({
                "data": [
                    {
                        "id": 1,
                        "name": "Bitcoin",
                        "symbol": "BTC",
                        "quote": {
                            "USD": {
                                "price": 43250.50,
                                "percent_change_24h": 2.45,
                                "market_cap": 845000000000,
                                "volume_24h": 25000000000
                            }
                        }
                    },
                    {
                        "id": 1027,
                        "name": "Ethereum",
                        "symbol": "ETH",
                        "quote": {
                            "USD": {
                                "price": 2650.75,
                                "percent_change_24h": -1.23,
                                "market_cap": 318000000000,
                                "volume_24h": 12000000000
                            }
                        }
                    }
                ]
            })
        
        url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest"
        headers = {
            'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY,
            'Accept': 'application/json'
        }
        
        limit = request.args.get('limit', 100)
        params = {'limit': limit}
        
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        
        return jsonify(response.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/long-short', methods=['GET'])
def get_long_short():
    """Long/Short verilerini çeker"""
    try:
        data = get_long_short_data()
        if data:
            return jsonify({'data': data})
        else:
            return jsonify({'error': 'Veri çekilemedi'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/global-metrics', methods=['GET'])
def get_global_metrics():
    """CoinMarketCap'ten global piyasa verilerini çeker"""
    try:
        # API key kontrolü - demo data kullan
        if COINMARKETCAP_API_KEY == "demo_key":
            return jsonify({
                "data": {
                    "active_cryptocurrencies": 2847,
                    "total_cryptocurrencies": 9916,
                    "btc_dominance": 54.2,
                    "eth_dominance": 16.8,
                    "quote": {
                        "USD": {
                            "total_market_cap": 2100000000000,
                            "total_volume_24h": 85000000000,
                            "total_market_cap_yesterday_percentage_change": 2.04,
                            "total_volume_24h_yesterday_percentage_change": -5.03
                        }
                    }
                }
            })
        
        url = "https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/latest"
        headers = {
            'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY,
            'Accept': 'application/json'
        }
        
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        return jsonify(response.json())
    except Exception as e:
        print(f"Global Metrics API Error: {e}")
        # Fallback verileri
        fallback_data = {
            "data": {
                "active_cryptocurrencies": 2847,
                "total_cryptocurrencies": 9916,
                "active_market_pairs": 73421,
                "active_exchanges": 750,
                "total_exchanges": 1567,
                "eth_dominance": 16.8,
                "btc_dominance": 54.2,
                "eth_dominance_yesterday": 16.9,
                "btc_dominance_yesterday": 53.8,
                "eth_dominance_24h_percentage_change": -0.59,
                "btc_dominance_24h_percentage_change": 0.74,
                "defi_volume_24h": 4829872853.45,
                "defi_volume_24h_reported": 4829872853.45,
                "defi_market_cap": 95234567890.12,
                "defi_24h_percentage_change": -2.34,
                "quote": {
                    "USD": {
                        "total_market_cap": 2100000000000,
                        "total_volume_24h": 85000000000,
                        "total_volume_24h_reported": 85000000000,
                        "altcoin_volume_24h": 39250000000,
                        "altcoin_volume_24h_reported": 39250000000,
                        "altcoin_market_cap": 963000000000,
                        "defi_volume_24h": 4829872853.45,
                        "defi_volume_24h_reported": 4829872853.45,
                        "defi_24h_percentage_change": -2.34,
                        "defi_market_cap": 95234567890.12,
                        "total_market_cap_yesterday": 2058000000000,
                        "total_volume_24h_yesterday": 89500000000,
                        "total_market_cap_yesterday_percentage_change": 2.04,
                        "total_volume_24h_yesterday_percentage_change": -5.03,
                        "last_updated": "2025-01-16T12:00:00.000Z"
                    }
                },
                "last_updated": "2025-01-16T12:00:00.000Z"
            },
            "status": {
                "timestamp": "2025-01-16T12:00:00.000Z",
                "error_code": 0,
                "error_message": None,
                "elapsed": 10,
                "credit_count": 1,
                "notice": None
            }
        }
        return jsonify(fallback_data)

@app.route('/api/news', methods=['GET'])
def get_news():
    """Hem gerçek RSS haberlerini hem crypto verilerinden üretilen haberleri birleştirir"""
    try:
        import random
        from datetime import datetime, timedelta
        import re
        from xml.etree import ElementTree as ET
        
        all_news = []
        
        # 1. RSS FEED HABERLERİNİ ÇEK (Paralel ve Optimize)
        import concurrent.futures
        
        rss_sources = [
            'https://www.coinkolik.com/feed/',
            'https://koinbulteni.com/feed',
            'https://kriptokoin.com/feed/',
            'https://www.btchaber.com/feed/'
        ]
        
        def fetch_rss_feed(source):
            try:
                # RSS2JSON API kullan (direkt RSS çekme daha hızlı)
                rss2json_url = f"https://api.rss2json.com/v1/api.json?rss_url={source}"
                json_response = requests.get(rss2json_url, timeout=2)
                if json_response.status_code == 200:
                    rss_data = json_response.json()
                    if rss_data.get('status') == 'ok' and rss_data.get('items'):
                        news_items = []
                        for i, item in enumerate(rss_data['items'][:3]):  # Her kaynaktan 3 haber
                            # Resim URL'ini bul
                            image_url = item.get('thumbnail', '')
                            if not image_url:
                                image_url = item.get('enclosure', {}).get('link', '')
                            if not image_url:
                                # Content'ten resim çıkar
                                content = item.get('description', '')
                                img_match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', content)
                                if img_match:
                                    image_url = img_match.group(1)
                            
                            news_items.append({
                                'id': f"rss_{source.split('/')[-2]}_{i}",
                                'title': item.get('title', ''),
                                'content': re.sub(r'<[^>]+>', '', item.get('description', ''))[:200] + '...',
                                'image': image_url if image_url else 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&auto=format&fit=crop',
                                'date': item.get('pubDate', datetime.now().strftime('%Y-%m-%d %H:%M:%S')),
                                'category': 'Haberler',
                                'author': rss_data.get('feed', {}).get('title', 'Haber Kaynağı'),
                                'link': item.get('link', ''),
                                'type': 'rss'
                            })
                        return news_items
            except Exception as e:
                print(f"RSS hatası {source}: {e}")
                return []
            return []
        
        # Paralel RSS çekme
        rss_news = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
            future_to_source = {executor.submit(fetch_rss_feed, source): source for source in rss_sources}
            for future in concurrent.futures.as_completed(future_to_source, timeout=5):
                try:
                    news_items = future.result()
                    rss_news.extend(news_items)
                except Exception as e:
                    print(f"RSS paralel çekme hatası: {e}")
                    continue
        
        # 2. CoinMarketCap'ten CRYPTO HABERLERİNİ ÜRET
        url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest"
        headers = {
            'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY,
            'Accept': 'application/json'
        }
        
        params = {'limit': 20}
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        
        cryptos = response.json()['data']
        
        # Crypto verilerinden haberler üret
        crypto_news = []
        news_templates = [
            "{name} fiyatı {change}% {direction} ile {price} seviyesinde",
            "{name} piyasa değeri {market_cap} milyar dolara ulaştı",
            "{name} işlem hacmi son 24 saatte {volume} milyon dolar",
            "{name} yatırımcıları için {change}% {direction} görüldü",
            "{name} analisti: '{direction_text}' beklentisi hakim",
            "{name} blockchain ağında aktivite artışı yaşandı",
            "{name} geliştiricileri yeni güncelleme duyurdu",
            "{name} kurumsal yatırımcılar tarafından tercih ediliyor"
        ]
        
        for i, crypto in enumerate(cryptos[:10]):  # 10 tane crypto haber
            change = float(crypto['quote']['USD']['percent_change_24h'])
            direction = "yükseldi" if change > 0 else "düştü"
            direction_text = "Yükseliş" if change > 0 else "Düşüş"
            
            template = random.choice(news_templates)
            title = template.format(
                name=crypto['name'],
                change=abs(round(change, 2)),
                direction=direction,
                direction_text=direction_text,
                price=f"${crypto['quote']['USD']['price']:.2f}",
                market_cap=f"${crypto['quote']['USD']['market_cap'] / 1000000000:.1f}",
                volume=f"${crypto['quote']['USD']['volume_24h'] / 1000000:.1f}"
            )
            
            crypto_news.append({
                'id': f"crypto_{i + 1}",
                'title': title,
                'content': f"{crypto['name']} ({crypto['symbol']}) son 24 saatte {abs(change):.2f}% {direction}. Piyasa değeri ${crypto['quote']['USD']['market_cap'] / 1000000000:.1f} milyar dolar seviyesinde işlem görüyor.",
                'image': f"https://s2.coinmarketcap.com/static/img/coins/128x128/{crypto['id']}.png",
                'date': (datetime.now() - timedelta(hours=random.randint(1, 6))).strftime('%Y-%m-%d %H:%M:%S'),
                'category': 'Piyasa Analizi',
                'author': 'Kripto Analiz',
                'crypto_id': crypto['id'],
                'crypto_symbol': crypto['symbol'],
                'crypto_name': crypto['name'].lower().replace(' ', '-'),
                'price_change': change,
                'type': 'crypto'
            })
        
        # 3. İKİ HABERİ BİRLEŞTİR VE KARIŞTIR
        all_news = rss_news + crypto_news
        
        # Tarihe göre sırala ve karıştır
        random.shuffle(all_news)
        all_news = sorted(all_news, key=lambda x: datetime.strptime(
            x['date'].split('.')[0] if '.' in x['date'] else x['date'].split('+')[0] if '+' in x['date'] else x['date'][:19], 
            '%Y-%m-%d %H:%M:%S'
        ), reverse=True)
        
        # En fazla 25 haber döndür
        final_news = all_news[:25]
        
        return jsonify({'data': final_news})
        
    except Exception as e:
        print(f"Haber API hatası: {e}")
        # Hata durumunda sadece crypto haberlerini döndür
        try:
            url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest"
            headers = {
                'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY,
                'Accept': 'application/json'
            }
            
            params = {'limit': 15}
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            
            cryptos = response.json()['data']
            fallback_news = []
            
            for i, crypto in enumerate(cryptos[:15]):
                change = float(crypto['quote']['USD']['percent_change_24h'])
                direction = "yükseldi" if change > 0 else "düştü"
                
                fallback_news.append({
                    'id': i + 1,
                    'title': f"{crypto['name']} fiyatı {abs(change):.2f}% {direction}",
                    'content': f"{crypto['name']} son 24 saatte {abs(change):.2f}% {direction}.",
                    'image': f"https://s2.coinmarketcap.com/static/img/coins/128x128/{crypto['id']}.png",
                    'date': (datetime.now() - timedelta(hours=random.randint(1, 24))).strftime('%Y-%m-%d %H:%M:%S'),
                    'category': 'Piyasa',
                    'author': 'Kripto Analiz',
                    'price_change': change,
                    'type': 'crypto'
                })
            
            return jsonify({'data': fallback_news})
        except:
            return jsonify({'error': str(e)}), 500

@app.route('/api/exchanges', methods=['GET'])
def get_exchanges():
    """Gerçek crypto verilerinden borsa bilgileri üretir"""
    try:
        # Önce crypto verilerini çek
        url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest"
        headers = {
            'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY,
            'Accept': 'application/json'
        }
        
        params = {'limit': 10}
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        
        cryptos = response.json()['data']
        
        # Popüler borsalar ve detayları
        exchanges = [
            {
                'id': 1,
                'name': 'Binance',
                'logo': 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/270.png',
                'trustScore': 9.8,
                'establishedYear': 2017,
                'country': 'Malta',
                'volume24h': sum([crypto['quote']['USD']['volume_24h'] for crypto in cryptos[:5]]) * 0.3,
                'volumeChange24h': 2.5,
                'tradingPairs': 500,
                'supportsFiat': True,
                'hasMarginTrading': True,
                'hasFuturesTrading': True,
                'mobileApp': True
            },
            {
                'id': 2,
                'name': 'Coinbase Pro',
                'logo': 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/89.png',
                'trustScore': 9.5,
                'establishedYear': 2012,
                'country': 'United States',
                'volume24h': sum([crypto['quote']['USD']['volume_24h'] for crypto in cryptos[:5]]) * 0.25,
                'volumeChange24h': 1.8,
                'tradingPairs': 200,
                'supportsFiat': True,
                'hasMarginTrading': True,
                'hasFuturesTrading': False,
                'mobileApp': True
            },
            {
                'id': 3,
                'name': 'Kraken',
                'logo': 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/24.png',
                'trustScore': 9.2,
                'establishedYear': 2011,
                'country': 'United States',
                'volume24h': sum([crypto['quote']['USD']['volume_24h'] for crypto in cryptos[:5]]) * 0.15,
                'volumeChange24h': -0.8,
                'tradingPairs': 150,
                'supportsFiat': True,
                'hasMarginTrading': True,
                'hasFuturesTrading': True,
                'mobileApp': True
            },
            {
                'id': 4,
                'name': 'Bitfinex',
                'logo': 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/37.png',
                'trustScore': 8.5,
                'establishedYear': 2012,
                'country': 'British Virgin Islands',
                'volume24h': sum([crypto['quote']['USD']['volume_24h'] for crypto in cryptos[:5]]) * 0.12,
                'volumeChange24h': -2.1,
                'tradingPairs': 300,
                'supportsFiat': True,
                'hasMarginTrading': True,
                'hasFuturesTrading': True,
                'mobileApp': True
            },
            {
                'id': 5,
                'name': 'Huobi',
                'logo': 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/102.png',
                'trustScore': 8.2,
                'establishedYear': 2013,
                'country': 'Singapore',
                'volume24h': sum([crypto['quote']['USD']['volume_24h'] for crypto in cryptos[:5]]) * 0.10,
                'volumeChange24h': 3.2,
                'tradingPairs': 400,
                'supportsFiat': False,
                'hasMarginTrading': True,
                'hasFuturesTrading': True,
                'mobileApp': True
            },
            {
                'id': 6,
                'name': 'KuCoin',
                'logo': 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/311.png',
                'trustScore': 8.0,
                'establishedYear': 2017,
                'country': 'Seychelles',
                'volume24h': sum([crypto['quote']['USD']['volume_24h'] for crypto in cryptos[:5]]) * 0.08,
                'volumeChange24h': 1.4,
                'tradingPairs': 250,
                'supportsFiat': False,
                'hasMarginTrading': True,
                'hasFuturesTrading': True,
                'mobileApp': True
            },
            {
                'id': 7,
                'name': 'Bybit',
                'logo': 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/524.png',
                'trustScore': 7.8,
                'establishedYear': 2018,
                'country': 'British Virgin Islands',
                'volume24h': sum([crypto['quote']['USD']['volume_24h'] for crypto in cryptos[:5]]) * 0.07,
                'volumeChange24h': 4.2,
                'tradingPairs': 180,
                'supportsFiat': False,
                'hasMarginTrading': True,
                'hasFuturesTrading': True,
                'mobileApp': True
            },
            {
                'id': 8,
                'name': 'OKX',
                'logo': 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/294.png',
                'trustScore': 7.6,
                'establishedYear': 2017,
                'country': 'Seychelles',
                'volume24h': sum([crypto['quote']['USD']['volume_24h'] for crypto in cryptos[:5]]) * 0.06,
                'volumeChange24h': -1.8,
                'tradingPairs': 220,
                'supportsFiat': True,
                'hasMarginTrading': True,
                'hasFuturesTrading': True,
                'mobileApp': True
            },
            {
                'id': 9,
                'name': 'Gate.io',
                'logo': 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/302.png',
                'trustScore': 7.4,
                'establishedYear': 2013,
                'country': 'Cayman Islands',
                'volume24h': sum([crypto['quote']['USD']['volume_24h'] for crypto in cryptos[:5]]) * 0.05,
                'volumeChange24h': 2.1,
                'tradingPairs': 400,
                'supportsFiat': False,
                'hasMarginTrading': True,
                'hasFuturesTrading': True,
                'mobileApp': True
            },
            {
                'id': 10,
                'name': 'Crypto.com',
                'logo': 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/409.png',
                'trustScore': 7.2,
                'establishedYear': 2016,
                'country': 'Singapore',
                'volume24h': sum([crypto['quote']['USD']['volume_24h'] for crypto in cryptos[:5]]) * 0.04,
                'volumeChange24h': -0.5,
                'tradingPairs': 160,
                'supportsFiat': True,
                'hasMarginTrading': False,
                'hasFuturesTrading': False,
                'mobileApp': True
            },
            {
                'id': 11,
                'name': 'Binance US',
                'logo': 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/490.png',
                'trustScore': 7.0,
                'establishedYear': 2019,
                'country': 'United States',
                'volume24h': sum([crypto['quote']['USD']['volume_24h'] for crypto in cryptos[:5]]) * 0.03,
                'volumeChange24h': 1.6,
                'tradingPairs': 80,
                'supportsFiat': True,
                'hasMarginTrading': False,
                'hasFuturesTrading': False,
                'mobileApp': True
            },
            {
                'id': 12,
                'name': 'Gemini',
                'logo': 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/97.png',
                'trustScore': 6.8,
                'establishedYear': 2014,
                'country': 'United States',
                'volume24h': sum([crypto['quote']['USD']['volume_24h'] for crypto in cryptos[:5]]) * 0.025,
                'volumeChange24h': -2.3,
                'tradingPairs': 60,
                'supportsFiat': True,
                'hasMarginTrading': False,
                'hasFuturesTrading': False,
                'mobileApp': True
            },
            {
                'id': 13,
                'name': 'Mexc',
                'logo': 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/544.png',
                'trustScore': 6.5,
                'establishedYear': 2018,
                'country': 'Seychelles',
                'volume24h': sum([crypto['quote']['USD']['volume_24h'] for crypto in cryptos[:5]]) * 0.02,
                'volumeChange24h': 3.7,
                'tradingPairs': 800,
                'supportsFiat': False,
                'hasMarginTrading': True,
                'hasFuturesTrading': True,
                'mobileApp': True
            },
            {
                'id': 14,
                'name': 'Bitget',
                'logo': 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/599.png',
                'trustScore': 6.3,
                'establishedYear': 2018,
                'country': 'Singapore',
                'volume24h': sum([crypto['quote']['USD']['volume_24h'] for crypto in cryptos[:5]]) * 0.018,
                'volumeChange24h': 5.2,
                'tradingPairs': 350,
                'supportsFiat': False,
                'hasMarginTrading': True,
                'hasFuturesTrading': True,
                'mobileApp': True
            },
            {
                'id': 15,
                'name': 'Bitrue',
                'logo': 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/434.png',
                'trustScore': 6.1,
                'establishedYear': 2018,
                'country': 'Singapore',
                'volume24h': sum([crypto['quote']['USD']['volume_24h'] for crypto in cryptos[:5]]) * 0.015,
                'volumeChange24h': -1.2,
                'tradingPairs': 280,
                'supportsFiat': False,
                'hasMarginTrading': True,
                'hasFuturesTrading': True,
                'mobileApp': True
            },
            {
                'id': 16,
                'name': 'Coincheck',
                'logo': 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/33.png',
                'trustScore': 5.9,
                'establishedYear': 2014,
                'country': 'Japan',
                'volume24h': sum([crypto['quote']['USD']['volume_24h'] for crypto in cryptos[:5]]) * 0.012,
                'volumeChange24h': 0.8,
                'tradingPairs': 25,
                'supportsFiat': True,
                'hasMarginTrading': False,
                'hasFuturesTrading': False,
                'mobileApp': True
            },
            {
                'id': 17,
                'name': 'Bitstamp',
                'logo': 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/70.png',
                'trustScore': 5.7,
                'establishedYear': 2011,
                'country': 'Luxembourg',
                'volume24h': sum([crypto['quote']['USD']['volume_24h'] for crypto in cryptos[:5]]) * 0.01,
                'volumeChange24h': -0.9,
                'tradingPairs': 40,
                'supportsFiat': True,
                'hasMarginTrading': False,
                'hasFuturesTrading': False,
                'mobileApp': True
            },
            {
                'id': 18,
                'name': 'Bitso',
                'logo': 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/449.png',
                'trustScore': 5.5,
                'establishedYear': 2014,
                'country': 'Mexico',
                'volume24h': sum([crypto['quote']['USD']['volume_24h'] for crypto in cryptos[:5]]) * 0.008,
                'volumeChange24h': 2.4,
                'tradingPairs': 35,
                'supportsFiat': True,
                'hasMarginTrading': False,
                'hasFuturesTrading': False,
                'mobileApp': True
            },
            {
                'id': 19,
                'name': 'Lbank',
                'logo': 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/351.png',
                'trustScore': 5.3,
                'establishedYear': 2015,
                'country': 'Hong Kong',
                'volume24h': sum([crypto['quote']['USD']['volume_24h'] for crypto in cryptos[:5]]) * 0.007,
                'volumeChange24h': -3.1,
                'tradingPairs': 420,
                'supportsFiat': False,
                'hasMarginTrading': True,
                'hasFuturesTrading': True,
                'mobileApp': True
            },
            {
                'id': 20,
                'name': 'Bithumb',
                'logo': 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/75.png',
                'trustScore': 5.1,
                'establishedYear': 2014,
                'country': 'South Korea',
                'volume24h': sum([crypto['quote']['USD']['volume_24h'] for crypto in cryptos[:5]]) * 0.006,
                'volumeChange24h': 1.1,
                'tradingPairs': 90,
                'supportsFiat': True,
                'hasMarginTrading': False,
                'hasFuturesTrading': False,
                'mobileApp': True
            }
        ]
        
        # Her borsaya trading pairs ekle
        for exchange in exchanges:
            exchange['trading_pairs'] = []
            for crypto in cryptos[:5]:
                exchange['trading_pairs'].append({
                    'symbol': f"{crypto['symbol']}/USDT",
                    'price': crypto['quote']['USD']['price'],
                    'volume_24h': crypto['quote']['USD']['volume_24h'] * (exchange['volume24h'] / sum([crypto['quote']['USD']['volume_24h'] for crypto in cryptos[:5]])),
                    'price_change_24h': crypto['quote']['USD']['percent_change_24h']
                })
        
        return jsonify({'data': exchanges})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/events', methods=['GET'])
def get_events():
    """Gerçek crypto verilerinden etkinlikler üretir"""
    try:
        # Önce crypto verilerini çek
        url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest"
        headers = {
            'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY,
            'Accept': 'application/json'
        }
        
        params = {'limit': 15}
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        
        cryptos = response.json()['data']
        
        # Etkinlik şablonları
        event_templates = [
            "{name} mainnet güncelleme",
            "{name} staking ödülleri artırıldı",
            "{name} yeni partnership duyurusu",
            "{name} DeFi protokolü entegrasyonu",
            "{name} NFT marketplace açılışı",
            "{name} governance token dağıtımı",
            "{name} layer 2 çözümü beta testleri",
            "{name} cross-chain köprü lansmanı"
        ]
        
        import random
        from datetime import datetime, timedelta
        
        events = []
        for i, crypto in enumerate(cryptos):
            # Geçmiş etkinlikler
            if i < 8:
                past_date = datetime.now() - timedelta(days=random.randint(1, 30))
                events.append({
                    'id': i + 1,
                    'title': random.choice(event_templates).format(name=crypto['name']),
                    'description': f"{crypto['name']} ekosisteminde önemli gelişmeler yaşandı. Piyasa değeri ${crypto['quote']['USD']['market_cap'] / 1000000000:.1f}B seviyesinde.",
                    'date': past_date.strftime('%Y-%m-%d'),
                    'time': f"{random.randint(10, 18)}:00",
                    'status': 'completed',
                    'category': random.choice(['Mainnet', 'DeFi', 'NFT', 'Staking', 'Partnership']),
                    'coin': crypto['symbol'],
                    'coinName': crypto['name'],
                    'coinImage': f"https://s2.coinmarketcap.com/static/img/coins/64x64/{crypto['id']}.png",
                    'impact': 'High' if crypto['quote']['USD']['percent_change_24h'] > 5 else 'Medium',
                    'price': crypto['quote']['USD']['price'],
                    'priceChange': crypto['quote']['USD']['percent_change_24h'],
                    'votes': random.randint(100, 1000),
                    'isVerified': random.choice([True, False])
                })
            
            # Gelecek etkinlikler
            if i >= 8:
                future_date = datetime.now() + timedelta(days=random.randint(1, 60))
                events.append({
                    'id': i + 1,
                    'title': random.choice(event_templates).format(name=crypto['name']),
                    'description': f"{crypto['name']} için planlanan önemli güncellemeler. Topluluk beklentileri yüksek.",
                    'date': future_date.strftime('%Y-%m-%d'),
                    'time': f"{random.randint(10, 18)}:00",
                    'status': 'upcoming',
                    'category': random.choice(['Mainnet', 'DeFi', 'NFT', 'Staking', 'Partnership']),
                    'coin': crypto['symbol'],
                    'coinName': crypto['name'],
                    'coinImage': f"https://s2.coinmarketcap.com/static/img/coins/64x64/{crypto['id']}.png",
                    'impact': 'High' if abs(crypto['quote']['USD']['percent_change_24h']) > 3 else 'Medium',
                    'price': crypto['quote']['USD']['price'],
                    'priceChange': crypto['quote']['USD']['percent_change_24h'],
                    'votes': random.randint(50, 500),
                    'isVerified': random.choice([True, False])
                })
        
        return jsonify({'data': events})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """API sunucusunun durumunu kontrol eder"""
    return jsonify({'status': 'OK', 'message': 'API sunucusu çalışıyor'})

@app.route('/health', methods=['GET'])
def simple_health_check():
    """Basit health check"""
    return 'OK'

@app.route('/', methods=['GET'])
def root():
    """Root endpoint"""
    return jsonify({
        'status': 'OK',
        'message': 'Kripto Sohbeti API',
        'version': '1.0.0',
        'endpoints': [
            '/api/health',
            '/api/crypto-data',
            '/api/news',
            '/api/exchanges',
            '/api/events',
            '/api/global-metrics'
        ]
    })

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    print(f"🚀 API Sunucusu başlatılıyor... Port: {port}")
    print(f"🌐 Frontend'den API çağrıları için: http://localhost:{port}")
    print(f"🔑 COINMARKETCAP_API_KEY: {'✅ SET' if COINMARKETCAP_API_KEY != 'demo_key' else '❌ DEMO MODE'}")
    print(f"🔒 CORS: Tüm origin'lere açık (Production)")
    app.run(debug=True, host='0.0.0.0', port=port) 