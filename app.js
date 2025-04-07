// API endpoint'leri
const API_BASE_URL = 'http://localhost:3000/api';

// Grafik değişkenleri
let priceChart = null;

// Sayfa yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', () => {
    loadTop10Cryptos();
    loadNews();
    setupCryptoSelect();
    
    // Her 5 dakikada bir verileri güncelle
    setInterval(() => {
        loadTop10Cryptos();
        loadNews();
    }, 300000);
});

// Top 10 kripto paraları yükle
async function loadTop10Cryptos() {
    try {
        const response = await fetch(`${API_BASE_URL}/top10`);
        const data = await response.json();
        
        const top10Container = document.getElementById('top10-container');
        top10Container.innerHTML = '';

        data.forEach(crypto => {
            const cryptoCard = createCryptoCard(crypto);
            top10Container.appendChild(cryptoCard);
        });
    } catch (error) {
        console.error('Top 10 kripto para yüklenirken hata:', error);
        showError('Kripto para verileri yüklenirken bir hata oluştu.');
    }
}

// Kripto para kartı oluştur
function createCryptoCard(crypto) {
    const priceChange = crypto.price_change_percentage_24h;
    const priceChangeClass = priceChange >= 0 ? 'text-green-500' : 'text-red-500';
    
    const card = document.createElement('div');
    card.className = 'bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors transform hover:scale-105';
    card.innerHTML = `
        <div class="flex items-center justify-between mb-2">
            <img src="${crypto.image}" alt="${crypto.name}" class="w-8 h-8">
            <span class="${priceChangeClass} text-sm">
                ${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%
            </span>
        </div>
        <h3 class="text-sm font-semibold">${crypto.name}</h3>
        <p class="text-xs text-gray-600">$${crypto.current_price.toLocaleString()}</p>
    `;
    
    card.addEventListener('click', () => {
        updateChart(crypto.id);
        document.getElementById('crypto-select').value = crypto.id;
    });
    
    return card;
}

// Haberleri yükle
async function loadNews() {
    try {
        const response = await fetch(`${API_BASE_URL}/news`);
        const data = await response.json();
        
        const newsContainer = document.getElementById('news-container');
        newsContainer.innerHTML = '';

        data.forEach(news => {
            const newsItem = createNewsItem(news);
            newsContainer.appendChild(newsItem);
        });
    } catch (error) {
        console.error('Haberler yüklenirken hata:', error);
        showError('Haberler yüklenirken bir hata oluştu.');
    }
}

// Haber öğesi oluştur
function createNewsItem(news) {
    const item = document.createElement('div');
    item.className = 'border-b pb-4 hover:bg-gray-50 p-2 rounded transition-colors';
    item.innerHTML = `
        <div class="flex items-start">
            <img src="${news.thumb_2x}" alt="${news.title}" class="w-20 h-20 object-cover rounded mr-3">
            <div>
                <h3 class="font-semibold mb-2 hover:text-blue-600">${news.title}</h3>
                <p class="text-sm text-gray-600 mb-2 line-clamp-2">${news.description}</p>
                <div class="flex items-center text-xs text-gray-500">
                    <i class="far fa-clock mr-1"></i>
                    ${new Date(news.published_at).toLocaleDateString('tr-TR')}
                    <a href="${news.url}" target="_blank" class="ml-auto text-blue-500 hover:underline">
                        Devamını Oku
                    </a>
                </div>
            </div>
        </div>
    `;
    return item;
}

// Kripto para seçim listesini ayarla
async function setupCryptoSelect() {
    try {
        const response = await fetch(`${COINGECKO_API}/coins/list`);
        const data = await response.json();
        
        const select = document.getElementById('crypto-select');
        
        data.forEach(crypto => {
            const option = document.createElement('option');
            option.value = crypto.id;
            option.textContent = crypto.name;
            select.appendChild(option);
        });

        select.addEventListener('change', (e) => {
            if (e.target.value) {
                updateChart(e.target.value);
            }
        });
    } catch (error) {
        console.error('Kripto para listesi yüklenirken hata:', error);
        showError('Kripto para listesi yüklenirken bir hata oluştu.');
    }
}

// Grafik güncelle
async function updateChart(cryptoId) {
    try {
        const response = await fetch(`${API_BASE_URL}/chart/${cryptoId}`);
        const data = await response.json();
        
        const prices = data.prices.map(price => ({
            x: new Date(price[0]),
            y: price[1]
        }));

        if (priceChart) {
            priceChart.destroy();
        }

        const ctx = document.getElementById('priceChart').getContext('2d');
        priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Fiyat (USD)',
                    data: prices,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day'
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Grafik güncellenirken hata:', error);
        showError('Grafik güncellenirken bir hata oluştu.');
    }
}

// Hata mesajı göster
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
} 