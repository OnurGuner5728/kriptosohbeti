// CoinMarketCap API anahtarı - Bu dosya tarayıcıda çalıştığı için API anahtarını doğrudan burada saklayamayız
// Güvenlik için, API çağrıları backend (Python) üzerinden yapılmalı
const API_KEY = null; // Güvenlik nedeniyle frontend'de API anahtarı kullanılmamalı

// Long/Short verilerini çeken fonksiyon - Şimdi güvenli backend API kullanıyor
async function fetchLongShortData() {
    try {
        const response = await fetch('http://localhost:5000/api/crypto-data?limit=50');
        
        if (!response.ok) {
            throw new Error('Backend API yanıt vermedi');
        }

        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Veri çekme hatası:', error);
        console.error('Backend API sunucusunun çalıştığından emin olun: python api_server.py');
        return null;
    }
}

// Verileri tabloya ekleyen fonksiyon
function updateLongShortTable(cryptoData) {
    const tableBody = document.querySelector('.longshort-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    cryptoData.forEach(crypto => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${crypto.cmc_rank}</td>
            <td>${crypto.symbol}</td>
            <td>${crypto.name}</td>
            <td>$${crypto.quote.USD.price.toFixed(2)}</td>
            <td>${crypto.quote.USD.percent_change_24h.toFixed(2)}%</td>
            <td>${crypto.quote.USD.volume_24h.toFixed(2)}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Coinglass'tan long/short verilerini çekmek için fonksiyon
async function fetchCoinglassData() {
    try {
        // Coinglass'ın long/short sayfasına istek atıyoruz
        const response = await fetch('https://www.coinglass.com/long-short', {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error('Veri çekme işlemi başarısız oldu');
        }

        const html = await response.text();
        
        // HTML içeriğini parse ediyoruz
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Long/Short oranlarını içeren tabloyu buluyoruz
        const table = doc.querySelector('.long-short-table');
        
        if (!table) {
            throw new Error('Tablo bulunamadı');
        }

        // Verileri işleyip gösteriyoruz
        const rows = table.querySelectorAll('tr');
        const data = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length > 0) {
                const coin = cells[0].textContent.trim();
                const longRatio = cells[1].textContent.trim();
                const shortRatio = cells[2].textContent.trim();
                
                data.push({
                    coin,
                    longRatio,
                    shortRatio
                });
            }
        });

        // Verileri tabloya ekliyoruz
        displayData(data);
        
    } catch (error) {
        console.error('Hata:', error);
        document.getElementById('error-message').textContent = 'Veri çekilirken bir hata oluştu: ' + error.message;
    }
}

// Verileri tabloda göstermek için fonksiyon
function displayData(data) {
    const tableBody = document.getElementById('long-short-table-body');
    tableBody.innerHTML = '';

    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.coin}</td>
            <td>${item.longRatio}</td>
            <td>${item.shortRatio}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Sayfa yüklendiğinde verileri çek
document.addEventListener('DOMContentLoaded', async () => {
    const cryptoData = await fetchLongShortData();
    if (cryptoData) {
        updateLongShortTable(cryptoData);
    }

    fetchCoinglassData();
    
    // Her 5 dakikada bir verileri güncelle
    setInterval(fetchCoinglassData, 5 * 60 * 1000);
}); 