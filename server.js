const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// CoinGecko API endpoint'leri
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Top 10 kripto para endpoint'i
app.get('/api/top10', async (req, res) => {
    try {
        const response = await axios.get(`${COINGECKO_API}/coins/markets`, {
            params: {
                vs_currency: 'usd',
                order: 'market_cap_desc',
                per_page: 10,
                sparkline: false
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Top 10 kripto para hatası:', error);
        res.status(500).json({ error: 'Veriler alınırken bir hata oluştu' });
    }
});

// Haberler endpoint'i
app.get('/api/news', async (req, res) => {
    try {
        const response = await axios.get(`${COINGECKO_API}/news`);
        res.json(response.data);
    } catch (error) {
        console.error('Haberler hatası:', error);
        res.status(500).json({ error: 'Haberler alınırken bir hata oluştu' });
    }
});

// Kripto para listesi endpoint'i
app.get('/api/coins', async (req, res) => {
    try {
        const response = await axios.get(`${COINGECKO_API}/coins/list`);
        res.json(response.data);
    } catch (error) {
        console.error('Kripto para listesi hatası:', error);
        res.status(500).json({ error: 'Liste alınırken bir hata oluştu' });
    }
});

// Fiyat grafiği endpoint'i
app.get('/api/chart/:id', async (req, res) => {
    try {
        const response = await axios.get(`${COINGECKO_API}/coins/${req.params.id}/market_chart`, {
            params: {
                vs_currency: 'usd',
                days: 7
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Grafik hatası:', error);
        res.status(500).json({ error: 'Grafik verisi alınırken bir hata oluştu' });
    }
});

// Ana sayfa
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Sunucuyu başlat
app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
}); 