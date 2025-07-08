// Backend API kullanıyoruz - Artık doğrudan CoinMarketCap API'sine değil, kendi backend'imize bağlanıyoruz
async function getCryptoData() {
    try {
        const response = await fetch('http://localhost:5000/api/crypto-data?limit=100');

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

async function displayCryptoData() {
    const cryptoData = await getCryptoData();
    if (!cryptoData) return;

    const container = document.getElementById('crypto-container');
    if (!container) return;

    // Tablo başlığını oluştur
    const table = document.createElement('table');
    table.className = 'crypto-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Sıra</th>
                <th>İsim</th>
                <th>Sembol</th>
                <th>Fiyat (USD)</th>
                <th>24s Değişim (%)</th>
                <th>Piyasa Değeri (USD)</th>
                <th>24s Hacim (USD)</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;

    // Verileri tabloya ekle
    const tbody = table.querySelector('tbody');
    cryptoData.forEach((crypto, index) => {
        const row = document.createElement('tr');
        const priceChange = crypto.quote.USD.percent_change_24h;
        const priceChangeClass = priceChange >= 0 ? 'positive' : 'negative';
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${crypto.name}</td>
            <td>${crypto.symbol}</td>
            <td>$${crypto.quote.USD.price.toFixed(2)}</td>
            <td class="${priceChangeClass}">${priceChange.toFixed(2)}%</td>
            <td>$${(crypto.quote.USD.market_cap / 1000000).toFixed(2)}M</td>
            <td>$${(crypto.quote.USD.volume_24h / 1000000).toFixed(2)}M</td>
        `;
        tbody.appendChild(row);
    });

    container.innerHTML = '';
    container.appendChild(table);
}

// Sayfa yüklendiğinde verileri göster
document.addEventListener('DOMContentLoaded', displayCryptoData);

// Her 1 dakikada bir verileri güncelle
setInterval(displayCryptoData, 60000); 