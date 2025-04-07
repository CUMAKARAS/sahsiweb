import React from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';

// Chart.js bileşenlerini kaydet
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

// Tip tanımlamaları
interface Crypto {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

interface News {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
}

interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'buy' | 'sell' | 'neutral';
}

function App() {
  const [top10Cryptos, setTop10Cryptos] = React.useState<Crypto[]>([]);
  const [news, setNews] = React.useState<News[]>([]);
  const [selectedCrypto, setSelectedCrypto] = React.useState<Crypto | null>(null);
  const [chartData, setChartData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showSearchResults, setShowSearchResults] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<Crypto[]>([]);

  // Top 10 kripto paraları yükle
  const loadTop10Cryptos = async () => {
    try {
      const response = await axios.get(
        'https://api.morkan.com/api/cryptos/top10',
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );
      setTop10Cryptos(response.data);
    } catch (error) {
      console.error('Kripto para verileri yüklenirken hata:', error);
      // Hata durumunda örnek veriler göster
      setTop10Cryptos([
        {
          id: 'bitcoin',
          name: 'Bitcoin',
          symbol: 'BTC',
          current_price: 45000,
          price_change_percentage_24h: 2.5,
          image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png'
        },
        {
          id: 'ethereum',
          name: 'Ethereum',
          symbol: 'ETH',
          current_price: 2500,
          price_change_percentage_24h: -1.2,
          image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png'
        }
      ]);
    }
  };

  // Haberleri yükle
  const loadNews = async () => {
    try {
      const response = await axios.get(
        'https://api.morkan.com/api/news',
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );
      
      if (response.data) {
        setNews(response.data);
      } else {
        console.error('Haber verisi beklenen formatta değil:', response.data);
      }
    } catch (error) {
      console.error('Haberler yüklenirken hata:', error);
      // Hata durumunda örnek haberler göster
      setNews([
        {
          title: 'Morkan Kripto Para Platformu Yayında',
          url: 'https://www.morkan.com',
          source: 'Morkan',
          publishedAt: new Date().toISOString()
        },
        {
          title: 'Bitcoin ve Altcoinlerde Yükseliş',
          url: 'https://www.morkan.com',
          source: 'Morkan',
          publishedAt: new Date().toISOString()
        }
      ]);
    }
  };

  // Grafik verilerini yükle
  const loadChartData = async (cryptoId: string) => {
    try {
      const response = await axios.get(
        `https://api.morkan.com/api/cryptos/${cryptoId}/chart`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      const chartData = {
        labels: response.data.prices.map((price: any) => new Date(price.timestamp)),
        datasets: [
          {
            label: 'Fiyat (USD)',
            data: response.data.prices.map((price: any) => price.value),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }
        ]
      };

      setChartData(chartData);
    } catch (error) {
      console.error('Grafik verileri yüklenirken hata:', error);
    }
  };

  // Yenileme işlemi
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadTop10Cryptos(), loadNews()]);
      if (selectedCrypto) {
        await loadChartData(selectedCrypto.id);
      }
    } catch (error) {
      console.error('Yenileme sırasında hata:', error);
    }
    setIsLoading(false);
  };

  // Detaylı analiz sayfasını aç
  const handleDetailedAnalysis = (cryptoId: string) => {
    window.open(`https://www.morkan.com/crypto/${cryptoId}`, '_blank');
  };

  // Favorilere ekle/çıkar
  const toggleFavorite = (cryptoId: string) => {
    setFavorites(prev => 
      prev.includes(cryptoId) 
        ? prev.filter(id => id !== cryptoId)
        : [...prev, cryptoId]
    );
  };

  // Arama fonksiyonu
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      // Örnek arama sonuçları
      const results = top10Cryptos.filter(crypto => 
        crypto.name.toLowerCase().includes(query.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // Saf fonksiyonlar
  const calculateRSI = (prices: number[]): number => {
    if (prices.length < 14) return 0;
    
    const changes = prices.slice(1).map((price, i) => price - prices[i]);
    const gains = changes.map(change => change > 0 ? change : 0);
    const losses = changes.map(change => change < 0 ? -change : 0);
    
    const avgGain = gains.slice(0, 14).reduce((sum, gain) => sum + gain, 0) / 14;
    const avgLoss = losses.slice(0, 14).reduce((sum, loss) => sum + loss, 0) / 14;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  };

  const calculateMACD = (prices: number[]): { macd: number; signal: number; histogram: number } => {
    if (prices.length < 26) return { macd: 0, signal: 0, histogram: 0 };
    
    const ema12 = prices.slice(-12).reduce((sum, price) => sum + price, 0) / 12;
    const ema26 = prices.slice(-26).reduce((sum, price) => sum + price, 0) / 26;
    const macd = ema12 - ema26;
    const signal = macd * 0.2 + macd * 0.8; // 9 günlük EMA
    const histogram = macd - signal;
    
    return { macd, signal, histogram };
  };

  const calculateBollingerBands = (prices: number[]): { upper: number; middle: number; lower: number } => {
    if (prices.length < 20) return { upper: 0, middle: 0, lower: 0 };
    
    const sma = prices.slice(-20).reduce((sum, price) => sum + price, 0) / 20;
    const stdDev = Math.sqrt(
      prices.slice(-20).reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / 20
    );
    
    return {
      upper: sma + (2 * stdDev),
      middle: sma,
      lower: sma - (2 * stdDev)
    };
  };

  // Immutable veri dönüşümleri için higher-order fonksiyonlar
  const analyzePriceData = (prices: number[]): TechnicalIndicator[] => {
    const rsi = calculateRSI(prices);
    const { macd, signal } = calculateMACD(prices);
    const { upper, middle, lower } = calculateBollingerBands(prices);
    const currentPrice = prices[prices.length - 1];
    
    return [
      {
        name: 'RSI',
        value: rsi,
        signal: rsi > 70 ? 'sell' : rsi < 30 ? 'buy' : 'neutral'
      },
      {
        name: 'MACD',
        value: macd,
        signal: macd > signal ? 'buy' : 'sell'
      },
      {
        name: 'Bollinger Bands',
        value: currentPrice,
        signal: currentPrice > upper ? 'sell' : currentPrice < lower ? 'buy' : 'neutral'
      }
    ];
  };

  // Sayfa yüklendiğinde verileri getir
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          loadTop10Cryptos(),
          loadNews()
        ]);
      } catch (error) {
        console.error('Veriler yüklenirken hata:', error);
      }
    };

    fetchData();
  }, []);

  // Seçili kripto para değiştiğinde grafik verilerini güncelle
  React.useEffect(() => {
    if (selectedCrypto) {
      loadChartData(selectedCrypto.id);
    }
  }, [selectedCrypto]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-accent">KriptoPulse</h1>
              <span className="text-sm text-gray-300">Kripto Dünyasının Nabzı</span>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Kripto ara..."
                className="px-4 py-2 rounded-lg bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
              >
                Yenile
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Başlıklar */}
          <div className="lg:col-span-3 grid grid-cols-3 gap-6 mb-6">
            <div className="bg-white shadow-lg rounded-lg p-4">
              <h2 className="text-lg font-semibold text-center">Kripto Haberler</h2>
            </div>
            <div className="bg-white shadow-lg rounded-lg p-4">
              <h2 className="text-lg font-semibold text-center">Top 10 Kripto Para</h2>
            </div>
            <div className="bg-white shadow-lg rounded-lg p-4">
              <h2 className="text-lg font-semibold text-center">Teknik Analiz</h2>
            </div>
          </div>

          {/* Sol Kolon - Haberler */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-primary mb-4">Son Haberler</h2>
              <div className="space-y-4">
                {news.map((item, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-100 last:border-0 pb-4 last:pb-0"
                  >
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block hover:bg-gray-50 rounded-lg p-3 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-primary hover:text-accent transition-colors">
                            {item.title}
                          </h3>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-sm text-gray-500">{item.source}</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-sm text-gray-500">
                              {new Date(item.publishedAt).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Orta Kolon - Top 10 Kripto Paralar */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-lg rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {top10Cryptos.map((crypto) => (
                  <div
                    key={crypto.id}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={crypto.image}
                          alt={crypto.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-primary">{crypto.name}</h3>
                          <p className="text-sm text-gray-500">{crypto.symbol.toUpperCase()}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleFavorite(crypto.id)}
                        className={`p-2 rounded-full ${
                          favorites.includes(crypto.id)
                            ? 'text-accent'
                            : 'text-gray-400 hover:text-accent'
                        }`}
                      >
                        <svg
                          className="w-6 h-6"
                          fill={favorites.includes(crypto.id) ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-primary">
                        ${crypto.current_price.toLocaleString()}
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          crypto.price_change_percentage_24h >= 0
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      >
                        {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
                        {crypto.price_change_percentage_24h.toFixed(2)}%
                        <span className="text-gray-500 ml-1">(24s)</span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleDetailedAnalysis(crypto.id)}
                      className="mt-4 w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                    >
                      Detaylı Analiz
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sağ Kolon - Teknik Analiz */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-lg rounded-lg p-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Kripto para ara..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((crypto) => (
                      <div
                        key={crypto.id}
                        className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSelectedCrypto(crypto);
                          setShowSearchResults(false);
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <img
                            src={crypto.image}
                            alt={crypto.name}
                            className="w-6 h-6 rounded-full"
                          />
                          <div>
                            <h3 className="font-medium text-sm">{crypto.name}</h3>
                            <p className="text-xs text-gray-500">{crypto.symbol.toUpperCase()}</p>
                          </div>
                        </div>
                        <span className="font-medium text-sm">${crypto.current_price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedCrypto ? (
                <>
                  <div className="flex justify-between items-center mt-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <img
                        src={selectedCrypto.image}
                        alt={selectedCrypto.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <h3 className="font-medium">{selectedCrypto.name}</h3>
                        <p className="text-sm text-gray-500">{selectedCrypto.symbol.toUpperCase()}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDetailedAnalysis(selectedCrypto.id)}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
                    >
                      Detaylı Analiz
                    </button>
                  </div>
                  {chartData && (
                    <>
                      <div className="h-64 mb-4">
                        <Line
                          key={selectedCrypto.id}
                          data={chartData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              x: {
                                type: 'time',
                                time: {
                                  unit: 'day',
                                  displayFormats: {
                                    day: 'MMM d'
                                  }
                                },
                                title: {
                                  display: true,
                                  text: 'Tarih'
                                }
                              },
                              y: {
                                title: {
                                  display: true,
                                  text: 'Fiyat (USD)'
                                }
                              }
                            },
                            plugins: {
                              legend: {
                                display: false
                              }
                            }
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {chartData.datasets[0].data.length >= 26 && analyzePriceData(chartData.datasets[0].data).map((indicator, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm font-medium">{indicator.name}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">{indicator.value.toFixed(2)}</span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                indicator.signal === 'buy' ? 'bg-green-100 text-green-800' :
                                indicator.signal === 'sell' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {indicator.signal === 'buy' ? 'Al' :
                                 indicator.signal === 'sell' ? 'Sat' : 'Nötr'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="mt-4 text-center text-gray-500 text-sm">
                  Teknik analiz için bir kripto para seçin
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-4 right-15 bg-white/80 backdrop-blur-sm shadow-lg rounded-lg px-4 py-2">
        <p className="text-gray-500 text-xs">
          © 2024 Morkan. Tüm hakları saklıdır.
        </p>
      </footer>
    </div>
  );
}

export default App;
