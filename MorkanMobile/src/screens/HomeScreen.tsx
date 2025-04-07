import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
} from 'react-native';
import axios from 'axios';

interface Crypto {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

const HomeScreen = ({ navigation }: any) => {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadCryptos = async () => {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/coins/markets',
        {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 10,
            page: 1,
            sparkline: false,
          },
        }
      );
      setCryptos(response.data);
    } catch (error) {
      console.error('Error loading cryptos:', error);
      // Örnek veri
      setCryptos([
        {
          id: 'bitcoin',
          name: 'Bitcoin',
          symbol: 'BTC',
          current_price: 50000,
          price_change_percentage_24h: 2.5,
          image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
        },
        // Diğer örnek kriptolar...
      ]);
    }
  };

  useEffect(() => {
    loadCryptos();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCryptos();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Crypto }) => (
    <TouchableOpacity
      style={styles.cryptoItem}
      onPress={() => navigation.navigate('Detail', { cryptoId: item.id })}>
      <View style={styles.cryptoInfo}>
        <Image source={{ uri: item.image }} style={styles.cryptoIcon} />
        <View>
          <Text style={styles.cryptoName}>{item.name}</Text>
          <Text style={styles.cryptoSymbol}>{item.symbol.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.priceInfo}>
        <Text style={styles.cryptoPrice}>
          ${item.current_price.toLocaleString()}
        </Text>
        <Text
          style={[
            styles.priceChange,
            {
              color: item.price_change_percentage_24h >= 0 ? '#4CAF50' : '#F44336',
            },
          ]}>
          {item.price_change_percentage_24h.toFixed(2)}%
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cryptos}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      <TouchableOpacity
        style={styles.newsButton}
        onPress={() => navigation.navigate('News')}>
        <Text style={styles.newsButtonText}>Kripto Haberler</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  cryptoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cryptoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cryptoIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  cryptoName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cryptoSymbol: {
    fontSize: 14,
    color: '#666',
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  cryptoPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  priceChange: {
    fontSize: 14,
    marginTop: 4,
  },
  newsButton: {
    backgroundColor: '#1E88E5',
    padding: 15,
    margin: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  newsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen; 