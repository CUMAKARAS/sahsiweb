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

  const loadTop10Cryptos = async () => {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 10,
          sparkline: false
        }
      });
      setTop10Cryptos(response.data);
    } catch (error) {
      console.error('Top 10 kripto para yüklenirken hata:', error);
    }
  };

  const loadNews = async () => {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/news');
      setNews(response.data);
    } catch (error) {
      console.error('Haberler yüklenirken hata:', error);
    }
  };

  const loadChartData = async (cryptoId: string) => {
    try {
      const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: 7
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
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
      // Detaylı analiz sayfasına yönlendirme
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
  }, [selectedCrypto]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">Morkan</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Yenileniyor...' : 'Yenile'}
              </button>
              <div className="hidden md:flex space-x-4">
                <a href="#" className="hover:text-blue-200">Ana Sayfa</a>
                <a href="#" className="hover:text-blue-200">Haberler</a>
                <a href="#" className="hover:text-blue-200">Analiz</a>
                <a href="#" className="hover:text-blue-200">Hakkımızda</a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Top 10 Kripto Para Listesi */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Top 10 Kripto Para</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {top10Cryptos.map(crypto => (
              <div
                key={crypto.id}
                className="bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors transform hover:scale-105"
                onClick={() => setSelectedCrypto(crypto.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <img src={crypto.image} alt={crypto.name} className="w-8 h-8" />
                  <span className={`text-sm ${crypto.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {crypto.price_change_percentage_24h >= 0 ? '+' : ''}{crypto.price_change_percentage_24h.toFixed(2)}%
                  </span>
                </div>
                <h3 className="text-sm font-semibold">{crypto.name}</h3>
                <p className="text-xs text-gray-600">${crypto.current_price.toLocaleString()}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(crypto.id);
                  }}
                  className={`mt-2 text-sm ${favorites.includes(crypto.id) ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-500 transition-colors`}
                >
                  {favorites.includes(crypto.id) ? '★' : '☆'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Ana İçerik */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sol Taraf - Haberler */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Kripto Para Haberleri</h2>
            <div className="space-y-4">
              {news.map((item, index) => (
                <div key={index} className="border-b pb-4 hover:bg-gray-50 p-2 rounded transition-colors">
                  <div className="flex items-start">
                    <img src={item.thumb_2x} alt={item.title} className="w-20 h-20 object-cover rounded mr-3" />
                    <div>
                      <h3 className="font-semibold mb-2 hover:text-blue-600">{item.title}</h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span className="mr-2">{new Date(item.published_at).toLocaleDateString('tr-TR')}</span>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="ml-auto text-blue-500 hover:underline">
                          Devamını Oku
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sağ Taraf - Analiz Araçları */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Teknik Analiz</h2>
            <div className="mb-4">
              <select
                value={selectedCrypto}
                onChange={(e) => setSelectedCrypto(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Kripto Para Seçin</option>
                {top10Cryptos.map(crypto => (
                  <option key={crypto.id} value={crypto.id}>
                    {crypto.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="h-64">
              {chartData && (
                <Line
                  data={chartData}
                  options={{
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
                  }}
                />
              )}
            </div>
            {selectedCrypto && (
              <button
                onClick={handleDetailedAnalysis}
                className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Detaylı Analiz
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-8">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Morkan</h3>
              <p className="text-gray-400">Kripto para analiz ve haber platformu</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Hızlı Bağlantılar</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Ana Sayfa</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Haberler</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Analiz</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">İletişim</h3>
              <ul className="space-y-2">
                <li className="text-gray-400">info@morkan.com</li>
                <li className="text-gray-400">+90 555 123 4567</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Morkan. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App; 