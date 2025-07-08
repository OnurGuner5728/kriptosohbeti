// API endpoint'ler
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
const BINANCE_API_URL = 'https://api.binance.com/api/v3';

// CoinGecko API'den veri çekme
async function fetchCryptoData() {
    try {
        const response = await fetch(`${COINGECKO_API_URL}/global`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Veri çekme hatası:', error);
        return null;
    }
}

// Binance API'den Long/Short verisi çekme
async function fetchBinanceLongShortData() {
    try {
        const response = await fetch(`${BINANCE_API_URL}/ticker/24hr?symbol=BTCUSDT`);
        const data = await response.json();
        return {
            longAccountRatio: (parseFloat(data.buyVolume) / (parseFloat(data.buyVolume) + parseFloat(data.sellVolume)) * 100).toFixed(2),
            shortAccountRatio: (parseFloat(data.sellVolume) / (parseFloat(data.buyVolume) + parseFloat(data.sellVolume)) * 100).toFixed(2),
            timestamp: Date.now()
        };
    } catch (error) {
        console.error('Binance Long/Short veri çekme hatası:', error);
        return null;
    }
}

// Binance API'den Taker Buy/Sell Volume verisi çekme
async function fetchBinanceTakerVolume() {
    try {
        const response = await fetch(`${BINANCE_API_URL}/ticker/24hr?symbol=BTCUSDT`);
        const data = await response.json();
        return [{
            buyVol: data.buyVolume,
            sellVol: data.sellVolume,
            timestamp: Date.now()
        }];
    } catch (error) {
        console.error('Binance Taker Volume veri çekme hatası:', error);
        return null;
    }
}

// Verileri güncelleme fonksiyonu
async function updateCryptoData() {
    const cryptoData = await fetchCryptoData();
    const longShortData = await fetchBinanceLongShortData();
    const takerVolumeData = await fetchBinanceTakerVolume();

    if (cryptoData) {
        updateUIWithCryptoData(cryptoData);
    }

    if (longShortData) {
        updateUIWithLongShortData(longShortData);
    }

    if (takerVolumeData) {
        updateUIWithTakerVolumeData(takerVolumeData);
    }
}

// UI güncelleme fonksiyonları
function updateUIWithCryptoData(data) {
    const container = document.getElementById('crypto-data-container');
    if (!container) return;

    const marketData = data.data;
    if (marketData) {
        const html = `
            <div class="crypto-data-card">
                <h3>Toplam Piyasa Değeri</h3>
                <div class="crypto-data-value">$${formatNumber(marketData.total_market_cap.usd)}</div>
                <div class="crypto-data-change ${marketData.market_cap_change_percentage_24h_usd >= 0 ? '' : 'negative'}">
                    ${marketData.market_cap_change_percentage_24h_usd.toFixed(2)}% (24s)
                </div>
            </div>
            <div class="crypto-data-card">
                <h3>24s Hacim</h3>
                <div class="crypto-data-value">$${formatNumber(marketData.total_volume.usd)}</div>
                <div class="crypto-data-change">
                    ${marketData.volume_change_percentage_24h.toFixed(2)}% (24s)
                </div>
            </div>
            <div class="crypto-data-card">
                <h3>BTC Dominansı</h3>
                <div class="crypto-data-value">${marketData.market_cap_percentage.btc.toFixed(2)}%</div>
                <div class="crypto-data-change">
                    ETH: ${marketData.market_cap_percentage.eth.toFixed(2)}%
                </div>
            </div>
        `;
        container.innerHTML = html;
    }
}

function updateUIWithLongShortData(data) {
    const container = document.getElementById('longshort-container');
    if (!container) return;

    if (data && data.length > 0) {
        const latestData = data[0];
        const longRatio = parseFloat(latestData.longAccountRatio) * 100;
        const shortRatio = parseFloat(latestData.shortAccountRatio) * 100;
        
        const html = `
            <div class="longshort-card">
                <h3>BTC Long/Short Oranı</h3>
                <div class="longshort-data">
                    <div class="long-data">
                        <span class="label">Long</span>
                        <span class="value">${longRatio.toFixed(2)}%</span>
                    </div>
                    <div class="short-data">
                        <span class="label">Short</span>
                        <span class="value">${shortRatio.toFixed(2)}%</span>
                    </div>
                </div>
                <div class="timestamp">Son Güncelleme: ${new Date(latestData.timestamp).toLocaleString('tr-TR')}</div>
            </div>
        `;
        container.innerHTML = html;
    }
}

function updateUIWithTakerVolumeData(data) {
    const container = document.getElementById('taker-volume-container');
    if (!container) return;

    if (data && data.length > 0) {
        const latestData = data[0];
        const buyVolume = parseFloat(latestData.buyVol);
        const sellVolume = parseFloat(latestData.sellVol);
        
        const html = `
            <div class="taker-volume-card">
                <h3>BTC Taker Buy/Sell Hacmi</h3>
                <div class="taker-volume-data">
                    <div class="buy-volume">
                        <span class="label">Buy Volume</span>
                        <span class="value">${formatNumber(buyVolume)}</span>
                    </div>
                    <div class="sell-volume">
                        <span class="label">Sell Volume</span>
                        <span class="value">${formatNumber(sellVolume)}</span>
                    </div>
                </div>
                <div class="timestamp">Son Güncelleme: ${new Date(latestData.timestamp).toLocaleString('tr-TR')}</div>
            </div>
        `;
        container.innerHTML = html;
    }
}

// Sayıları formatla
function formatNumber(num) {
    return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2,
        notation: 'compact',
        compactDisplay: 'short'
    }).format(num);
}

// Sayfa yüklendiğinde verileri çek
document.addEventListener('DOMContentLoaded', () => {
    updateCryptoData();
    // Her 5 dakikada bir verileri güncelle
    setInterval(updateCryptoData, 5 * 60 * 1000);
});

// Kripto Para Takvimi Fonksiyonları
async function fetchCalendarEvents() {
    try {
        const response = await fetch('https://coindar.org/api/v2/events');
        const data = await response.json();
        
        // Verileri işle ve HTML'e dönüştür
        const calendarContainer = document.getElementById('calendar-container');
        if (!calendarContainer) return;

        if (!data || data.length === 0) {
            calendarContainer.innerHTML = '<div class="calendar-loading">Etkinlik bulunamadı.</div>';
            return;
        }

        let html = '';
        data.forEach(event => {
            const date = new Date(event.date);
            const formattedDate = date.toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            html += `
                <div class="calendar-event-card">
                    <div class="event-icon-wrapper">
                        <img src="${event.coin_image || 'https://cryptologos.cc/logos/bitcoin-btc-logo.png'}" 
                             alt="${event.coin_name}" 
                             class="event-logo">
                    </div>
                    <div class="event-details">
                        <span class="event-title">${event.title}</span>
                        <span class="event-coin">${event.coin_name}</span>
                        <p class="event-description">${event.description || ''}</p>
                        <span class="event-time">${formattedDate}</span>
                    </div>
                </div>
            `;
        });

        calendarContainer.innerHTML = html;

    } catch (error) {
        console.error('Takvim verileri çekilirken hata oluştu:', error);
        const calendarContainer = document.getElementById('calendar-container');
        if (calendarContainer) {
            calendarContainer.innerHTML = '<div class="calendar-loading">Veriler alınamadı.</div>';
        }
    }
}

// Sayfa yüklendiğinde takvimi başlat
document.addEventListener('DOMContentLoaded', () => {
    initializeCalendar();
});

// Mobil menü işlevselliği
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.main-nav');
    const calendarDropdownParent = document.querySelector('.calendar-dropdown-parent');
    const calendarMenuBtn = document.querySelector('.calendar-menu-btn');
    const calendarDropdownMenu = document.querySelector('.calendar-dropdown-menu');

    // Mobil menü toggle
    mobileMenuBtn.addEventListener('click', function() {
        mainNav.classList.toggle('active');
        this.classList.toggle('active');
    });

    // Takvim dropdown toggle
    calendarMenuBtn.addEventListener('click', function(e) {
        e.preventDefault();
        calendarDropdownParent.classList.toggle('open');
    });

    // Sayfa dışına tıklandığında menüleri kapat
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.calendar-dropdown-parent')) {
            calendarDropdownParent.classList.remove('open');
        }
        if (!e.target.closest('.main-nav') && !e.target.closest('.mobile-menu-btn')) {
            mainNav.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        }
    });

    // Ekran boyutu değiştiğinde menüleri sıfırla
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            mainNav.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            calendarDropdownParent.classList.remove('open');
        }
    });
});

// CoinMarketCal API Integration
const COINMARKETCAL_API_KEY = '1KKpBUGNqU4XAcsCBX2nC3Wk9eSrRSKd4Yu9fyWY';

async function fetchCryptoCalendarEvents() {
    try {
        const response = await fetch('https://api.coinmarketcal.com/v1/events', {
            method: 'GET',
            headers: {
                'x-api-key': COINMARKETCAL_API_KEY,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching crypto calendar events:', error);
        return null;
    }
}

function displayCryptoCalendarEvents(events) {
    const calendarContainer = document.getElementById('crypto-calendar');
    if (!calendarContainer) return;

    calendarContainer.innerHTML = '';

    if (!events || !events.length) {
        calendarContainer.innerHTML = '<p>No events found</p>';
        return;
    }

    const eventsList = document.createElement('div');
    eventsList.className = 'crypto-events-list';

    events.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = 'crypto-event-item';
        eventElement.innerHTML = `
            <div class="event-date">${new Date(event.date_event).toLocaleDateString()}</div>
            <div class="event-title">${event.title}</div>
            <div class="event-coin">${event.coins[0].symbol}</div>
            <div class="event-description">${event.description}</div>
        `;
        eventsList.appendChild(eventElement);
    });

    calendarContainer.appendChild(eventsList);
}

// Initialize crypto calendar
async function initCryptoCalendar() {
    const events = await fetchCryptoCalendarEvents();
    displayCryptoCalendarEvents(events);
}

// Call the initialization function when the page loads
document.addEventListener('DOMContentLoaded', initCryptoCalendar);