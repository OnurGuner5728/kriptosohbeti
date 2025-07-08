// CoinMarketCal API entegrasyonu
const COINMARKETCAL_API_KEY = '1KKpBUGNqU4XAcsCBX2nC3Wk9eSrRSKd4Yu9fyWY';

async function fetchCryptoCalendar() {
    const list = document.getElementById('crypto-calendar-list');
    if (!list) return;
    
    list.innerHTML = '<div class="crypto-calendar-loading">Yükleniyor...</div>';

    try {
        // Bugünün tarihi ve 7 gün sonrası için tarih aralığı
        const today = new Date();
        const toDate = new Date();
        toDate.setDate(today.getDate() + 7);
        
        const response = await fetch(`https://api.coinmarketcal.com/v1/events?from=${today.toISOString().split('T')[0]}&to=${toDate.toISOString().split('T')[0]}`, {
            method: 'GET',
            headers: {
                'x-api-key': COINMARKETCAL_API_KEY,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('API yanıt vermedi');
        }

        const data = await response.json();

        if (!data || !data.length) {
            list.innerHTML = '<div class="crypto-calendar-loading">Etkinlik bulunamadı.</div>';
            return;
        }

        // Filtreleri uygula
        const searchVal = document.getElementById('crypto-calendar-search')?.value.toLowerCase() || '';
        const importanceVal = document.getElementById('crypto-calendar-importance')?.value || 'all';

        let filteredEvents = data.filter(event => {
            const matchesSearch = !searchVal || 
                (event.title && event.title.toLowerCase().includes(searchVal)) ||
                (event.description && event.description.toLowerCase().includes(searchVal));
            
            const matchesImportance = importanceVal === 'all' || event.importance === importanceVal;

            return matchesSearch && matchesImportance;
        });

        // Etkinlikleri tarihe göre grupla
        let lastDate = '';
        let html = '';

        filteredEvents.forEach(event => {
            const eventDate = new Date(event.date_event).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            if (eventDate !== lastDate) {
                html += `<div class="calendar-date-header">${eventDate}</div>`;
                lastDate = eventDate;
            }

            html += `
                <div class="crypto-calendar-event">
                    <div class="crypto-calendar-flag">
                        ${event.coins && event.coins[0] ? 
                            `<img src="${event.coins[0].image_url}" alt="${event.coins[0].symbol}" style="width:32px;height:32px;border-radius:6px;background:#222;">` : 
                            ''}
                    </div>
                    <div class="crypto-calendar-event-main">
                        <div class="crypto-calendar-event-title">${event.title}</div>
                        <div class="crypto-calendar-event-desc">${event.description || ''}</div>
                        <div class="crypto-calendar-event-meta">
                            <span class="crypto-calendar-event-time">${new Date(event.date_event).toLocaleTimeString('tr-TR')}</span>
                            <span class="crypto-calendar-event-importance">${event.importance || 'Normal'}</span>
                            <span class="crypto-calendar-event-category">${event.category || 'Genel'}</span>
                        </div>
                        <div class="crypto-calendar-event-meta">
                            ${event.coins ? `<span>İlgili Coinler: ${event.coins.map(c => c.symbol).join(', ')}</span>` : ''}
                            ${event.source ? `<span>Kaynak: <a href="${event.source}" target="_blank" style="color:#ffb300;">Detaylar</a></span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });

        list.innerHTML = html || '<div class="crypto-calendar-loading">Filtrenize uygun etkinlik bulunamadı.</div>';

    } catch (error) {
        console.error('Takvim verileri alınamadı:', error);
        list.innerHTML = '<div class="crypto-calendar-loading">Veriler alınamadı. Lütfen daha sonra tekrar deneyin.</div>';
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const refreshBtn = document.getElementById('crypto-calendar-refresh');
    const searchInput = document.getElementById('crypto-calendar-search');
    const importanceSelect = document.getElementById('crypto-calendar-importance');

    if (refreshBtn) refreshBtn.addEventListener('click', fetchCryptoCalendar);
    if (searchInput) searchInput.addEventListener('input', fetchCryptoCalendar);
    if (importanceSelect) importanceSelect.addEventListener('change', fetchCryptoCalendar);

    // Sayfa yüklendiğinde verileri çek
    fetchCryptoCalendar();
}); 