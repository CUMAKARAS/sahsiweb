import React, { useEffect, useState } from 'react';
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
import axios from 'axios';

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

interface CryptoData {
  id: string;
  name: string;
  current_price: number;
  image: string;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
}

interface NewsData {
  title: string;
  description: string;
  url: string;
  thumb_2x: string;
  published_at: string;
}

interface ChartData {
  labels: Date[];
  datasets: {
    label: string;
    data: { x: Date; y: number }[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
    tension: number;
  }[];
}

function App() {
  const [top10Cryptos, setTop10Cryptos] = useState<CryptoData[]>([]);
  const [news, setNews] = useState<NewsData[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState<string>('');
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<'1d' | '7d' | '30d'>('7d');

  const loadTop10Cryptos = async () => {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 10,
          sparkline: false,
          locale: 'tr'
        }
      });
      setTop10Cryptos(response.data);
    } catch (error) {
      console.error('Top 10 kripto para yüklenirken hata:', error);
    }
  };

  const loadNews = async () => {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/news', {
        params: {
          locale: 'tr'
        }
      });
      setNews(response.data);
    } catch (error) {
      console.error('Haberler yüklenirken hata:', error);
    }
  };

  const loadChartData = async (cryptoId: string) => {
    try {
      const days = timeRange === '1d' ? 1 : timeRange === '7d' ? 7 : 30;
      const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: days,
          interval: timeRange === '1d' ? 'hourly' : 'daily'
        }
      });

      const prices = response.data.prices.map((price: [number, number]) => ({
        x: new Date(price[0]),
        y: price[1]
      }));

      setChartData({
        labels: prices.map(p => p.x),
        datasets: [{
          label: 'Fiyat (USD)',
          data: prices,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.4
        }]
      });
    } catch (error) {
      console.error('Grafik verisi yüklenirken hata:', error);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await Promise.all([loadTop10Cryptos(), loadNews()]);
    if (selectedCrypto) {
      await loadChartData(selectedCrypto);
    }
    setIsLoading(false);
  };

  const handleDetailedAnalysis = () => {
    if (selectedCrypto) {
      window.open(`https://www.coingecko.com/en/coins/${selectedCrypto}`, '_blank');
    }
  };

  const toggleFavorite = (cryptoId: string) => {
    setFavorites(prev => {
      if (prev.includes(cryptoId)) {
        return prev.filter(id => id !== cryptoId);
      } else {
        return [...prev, cryptoId];
      }
    });
  };

  useEffect(() => {
    loadTop10Cryptos();
    loadNews();
  }, []);

  useEffect(() => {
    if (selectedCrypto) {
      loadChartData(selectedCrypto);
    }
  }, [selectedCrypto, timeRange]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Navbar */}
      <nav className="bg-indigo-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">Morkan</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{isLoading ? 'Yenileniyor...' : 'Yenile'}</span>
              </button>
              <div className="hidden md:flex space-x-6">
                <a href="#" className="hover:text-indigo-200 transition-colors">Ana Sayfa</a>
                <a href="#" className="hover:text-indigo-200 transition-colors">Haberler</a>
                <a href="#" className="hover:text-indigo-200 transition-colors">Analiz</a>
                <a href="#" className="hover:text-indigo-200 transition-colors">Hakkımızda</a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Top 10 Kripto Para Listesi */}
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Top 10 Kripto Para
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {top10Cryptos.map(crypto => (
              <div
                key={crypto.id}
                className="bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600 transition-all transform hover:scale-105 border border-gray-600"
                onClick={() => setSelectedCrypto(crypto.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <img src={crypto.image} alt={crypto.name} className="w-8 h-8 rounded-full" />
                  <span className={`text-sm font-semibold ${crypto.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {crypto.price_change_percentage_24h >= 0 ? '+' : ''}{crypto.price_change_percentage_24h.toFixed(2)}%
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white">{crypto.name}</h3>
                <p className="text-xs text-gray-400">${crypto.current_price.toLocaleString()}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-500">MCap: ${(crypto.market_cap / 1000000000).toFixed(2)}B</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(crypto.id);
                    }}
                    className={`text-sm ${favorites.includes(crypto.id) ? 'text-yellow-400' : 'text-gray-500'} hover:text-yellow-400 transition-colors`}
                  >
                    {favorites.includes(crypto.id) ? '★' : '☆'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ana İçerik */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sol Taraf - Haberler */}
          <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
              </svg>
              Kripto Para Haberleri
            </h2>
            <div className="space-y-4">
              {news.map((item, index) => (
                <div key={index} className="border-b border-gray-700 pb-4 hover:bg-gray-700 p-3 rounded-lg transition-colors">
                  <div className="flex items-start">
                    <img src={item.thumb_2x} alt={item.title} className="w-20 h-20 object-cover rounded-lg mr-3" />
                    <div>
                      <h3 className="font-semibold mb-2 hover:text-indigo-400 transition-colors">{item.title}</h3>
                      <p className="text-sm text-gray-400 mb-2 line-clamp-2">{item.description}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span className="mr-2">{new Date(item.published_at).toLocaleDateString('tr-TR')}</span>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="ml-auto text-indigo-400 hover:text-indigo-300 transition-colors">
                          Devamını Oku →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sağ Taraf - Analiz Araçları */}
          <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Teknik Analiz
            </h2>
            <div className="mb-4">
              <select
                value={selectedCrypto}
                onChange={(e) => setSelectedCrypto(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
              >
                <option value="">Kripto Para Seçin</option>
                {top10Cryptos.map(crypto => (
                  <option key={crypto.id} value={crypto.id}>{crypto.name}</option>
                ))}
              </select>
            </div>
            {selectedCrypto && (
              <div className="mb-4 flex space-x-2">
                <button
                  onClick={() => setTimeRange('1d')}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    timeRange === '1d' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  } transition-colors`}
                >
                  24 Saat
                </button>
                <button
                  onClick={() => setTimeRange('7d')}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    timeRange === '7d' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  } transition-colors`}
                >
                  7 Gün
                </button>
                <button
                  onClick={() => setTimeRange('30d')}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    timeRange === '30d' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  } transition-colors`}
                >
                  30 Gün
                </button>
              </div>
            )}
            <div className="h-64 bg-gray-700 rounded-lg p-4">
              {chartData ? (
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        labels: {
                          color: '#fff'
                        }
                      }
                    },
                    scales: {
                      x: {
                        grid: {
                          color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                          color: '#fff'
                        }
                      },
                      y: {
                        grid: {
                          color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                          color: '#fff'
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  Grafik verisi yükleniyor...
                </div>
              )}
            </div>
            {selectedCrypto && (
              <button
                onClick={handleDetailedAnalysis}
                className="mt-4 w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Detaylı Analiz</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 mt-12 py-8 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Morkan</h3>
              <p className="text-sm">Kripto para analiz ve haber platformu</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Hızlı Bağlantılar</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Ana Sayfa</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Haberler</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Analiz</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">İletişim</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  info@morkan.com
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +90 555 123 4567
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 Morkan. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App; 
