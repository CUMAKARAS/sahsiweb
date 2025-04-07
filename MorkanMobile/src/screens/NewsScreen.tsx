import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
  Linking,
} from 'react-native';
import axios from 'axios';

interface NewsItem {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  source: {
    name: string;
  };
  publishedAt: string;
}

const NewsScreen = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadNews = async () => {
    try {
      const response = await axios.get(
        'https://newsapi.org/v2/everything',
        {
          params: {
            q: 'cryptocurrency OR bitcoin OR ethereum',
            language: 'en',
            sortBy: 'publishedAt',
            apiKey: 'YOUR_API_KEY', // NewsAPI anahtarınızı buraya ekleyin
          },
        }
      );
      setNews(response.data.articles);
    } catch (error) {
      console.error('Error loading news:', error);
      // Örnek haberler
      setNews([
        {
          title: 'Bitcoin Yükselişe Geçti',
          description:
            'Bitcoin son 24 saatte %5 değer kazandı ve 50.000 dolar seviyesini aştı.',
          url: 'https://example.com/news1',
          urlToImage: 'https://picsum.photos/200',
          source: {
            name: 'Kripto Haber',
          },
          publishedAt: new Date().toISOString(),
        },
        // Diğer örnek haberler...
      ]);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: NewsItem }) => (
    <TouchableOpacity
      style={styles.newsItem}
      onPress={() => Linking.openURL(item.url)}>
      <Image source={{ uri: item.urlToImage }} style={styles.newsImage} />
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle}>{item.title}</Text>
        <Text style={styles.newsDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.newsFooter}>
          <Text style={styles.newsSource}>{item.source.name}</Text>
          <Text style={styles.newsDate}>
            {new Date(item.publishedAt).toLocaleDateString('tr-TR')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={news}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  newsItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  newsImage: {
    width: 100,
    height: 100,
  },
  newsContent: {
    flex: 1,
    padding: 10,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  newsDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsSource: {
    fontSize: 12,
    color: '#1E88E5',
    fontWeight: 'bold',
  },
  newsDate: {
    fontSize: 12,
    color: '#999',
  },
});

export default NewsScreen; 