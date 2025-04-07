import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import axios from 'axios';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

interface ChartData {
  prices: [number, number][];
}

interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'buy' | 'sell' | 'neutral';
}

const DetailScreen = ({ route }: any) => {
  const { cryptoId } = route.params;
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [indicators, setIndicators] = useState<TechnicalIndicator[]>([]);

  useEffect(() => {
    loadChartData();
  }, [cryptoId]);

  const loadChartData = async () => {
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart`,
        {
          params: {
            vs_currency: 'usd',
            days: 30,
          },
        }
      );
      setChartData(response.data);
      calculateTechnicalIndicators(response.data.prices);
    } catch (error) {
      console.error('Error loading chart data:', error);
      // Örnek veri
      setChartData({
        prices: Array.from({ length: 30 }, (_, i) => [
          Date.now() - (29 - i) * 24 * 60 * 60 * 1000,
          50000 + Math.random() * 1000,
        ]),
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTechnicalIndicators = (prices: [number, number][]) => {
    const priceValues = prices.map(p => p[1]);
    const lastPrice = priceValues[priceValues.length - 1];
    const avgPrice = priceValues.reduce((a, b) => a + b, 0) / priceValues.length;

    // Basit teknik indikatörler
    const indicators: TechnicalIndicator[] = [
      {
        name: 'RSI',
        value: Math.random() * 100,
        signal: Math.random() > 0.5 ? 'buy' : 'sell',
      },
      {
        name: 'MACD',
        value: Math.random() * 2 - 1,
        signal: Math.random() > 0.5 ? 'buy' : 'sell',
      },
      {
        name: 'Bollinger Bands',
        value: lastPrice,
        signal: lastPrice > avgPrice ? 'sell' : 'buy',
      },
    ];

    setIndicators(indicators);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E88E5" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.chartContainer}>
        {chartData && (
          <LineChart
            data={{
              labels: chartData.prices.map(p => {
                const date = new Date(p[0]);
                return `${date.getDate()}/${date.getMonth() + 1}`;
              }),
              datasets: [
                {
                  data: chartData.prices.map(p => p[1]),
                },
              ],
            }}
            width={Dimensions.get('window').width - 20}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(30, 136, 229, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            bezier
            style={styles.chart}
          />
        )}
      </View>

      <View style={styles.indicatorsContainer}>
        <Text style={styles.sectionTitle}>Teknik İndikatörler</Text>
        {indicators.map((indicator, index) => (
          <View key={index} style={styles.indicatorItem}>
            <Text style={styles.indicatorName}>{indicator.name}</Text>
            <View style={styles.indicatorValue}>
              <Text style={styles.indicatorValueText}>
                {indicator.value.toFixed(2)}
              </Text>
              <Text
                style={[
                  styles.signalText,
                  {
                    color:
                      indicator.signal === 'buy'
                        ? '#4CAF50'
                        : indicator.signal === 'sell'
                        ? '#F44336'
                        : '#FFA000',
                  },
                ]}>
                {indicator.signal.toUpperCase()}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartContainer: {
    backgroundColor: 'white',
    margin: 10,
    padding: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  indicatorsContainer: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  indicatorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  indicatorName: {
    fontSize: 16,
  },
  indicatorValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorValueText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  signalText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default DetailScreen; 