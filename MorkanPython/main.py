from kivy.app import App
from kivy.uix.screenmanager import ScreenManager, Screen
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.button import Button
from kivy.uix.label import Label
from kivy.uix.scrollview import ScrollView
from kivy.uix.gridlayout import GridLayout
from kivy.uix.image import Image
from kivy.core.window import Window
from kivy.uix.textinput import TextInput
from kivy.garden.chart import LineChart
import requests
from datetime import datetime
import json

class HomeScreen(Screen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        layout = BoxLayout(orientation='vertical', padding=10, spacing=10)
        
        # Başlık
        title = Label(
            text='MORKAN',
            font_size='24sp',
            size_hint_y=None,
            height='50dp'
        )
        layout.add_widget(title)
        
        # GridView için ScrollView
        scroll = ScrollView()
        self.crypto_grid = GridLayout(
            cols=2,  # İki sütunlu grid
            spacing=10,
            padding=10,
            size_hint_y=None,
            row_default_height=120  # Her satırın yüksekliği
        )
        self.crypto_grid.bind(minimum_height=self.crypto_grid.setter('height'))
        scroll.add_widget(self.crypto_grid)
        layout.add_widget(scroll)
        
        # Haberler butonu
        news_button = Button(
            text='Kripto Haberler',
            size_hint_y=None,
            height='50dp',
            background_color=(0.12, 0.53, 0.9, 1)
        )
        news_button.bind(on_press=self.go_to_news)
        layout.add_widget(news_button)
        
        self.add_widget(layout)
        self.load_cryptos()

    def load_cryptos(self):
        try:
            response = requests.get(
                'https://api.coingecko.com/api/v3/coins/markets',
                params={
                    'vs_currency': 'usd',
                    'order': 'market_cap_desc',
                    'per_page': 10,
                    'page': 1,
                    'sparkline': False
                }
            )
            cryptos = response.json()
            
            for crypto in cryptos:
                # Her kripto için kart oluştur
                card = BoxLayout(
                    orientation='vertical',
                    size_hint_y=None,
                    height='120dp',
                    padding=10,
                    spacing=5,
                    background_color=(0.95, 0.95, 0.95, 1)
                )
                
                # Kripto adı ve sembolü
                header = BoxLayout(orientation='horizontal', size_hint_y=None, height='30dp')
                name_label = Label(
                    text=crypto['name'],
                    font_size='16sp',
                    size_hint_x=0.7
                )
                symbol_label = Label(
                    text=crypto['symbol'].upper(),
                    font_size='14sp',
                    color=(0.5, 0.5, 0.5, 1),
                    size_hint_x=0.3
                )
                header.add_widget(name_label)
                header.add_widget(symbol_label)
                
                # Fiyat bilgisi
                price_label = Label(
                    text=f"${crypto['current_price']:,.2f}",
                    font_size='18sp',
                    bold=True,
                    size_hint_y=None,
                    height='30dp'
                )
                
                # 24 saatlik değişim
                change_label = Label(
                    text=f"{crypto['price_change_percentage_24h']:+.2f}%",
                    font_size='14sp',
                    size_hint_y=None,
                    height='20dp',
                    color=(0.3, 0.8, 0.3, 1) if crypto['price_change_percentage_24h'] >= 0 else (0.8, 0.3, 0.3, 1)
                )
                
                # Kart içeriğini ekle
                card.add_widget(header)
                card.add_widget(price_label)
                card.add_widget(change_label)
                
                # Tıklama olayı
                card.bind(on_touch_down=lambda x, crypto=crypto: self.show_detail(crypto))
                
                self.crypto_grid.add_widget(card)
                
        except Exception as e:
            print(f"Error loading cryptos: {e}")
            # Örnek veri
            sample_crypto = {
                'id': 'bitcoin',
                'name': 'Bitcoin',
                'symbol': 'BTC',
                'current_price': 50000,
                'price_change_percentage_24h': 2.5
            }
            self.show_crypto_item(sample_crypto)

    def show_detail(self, crypto):
        self.manager.current = 'detail'
        self.manager.get_screen('detail').load_crypto(crypto)

    def go_to_news(self, instance):
        self.manager.current = 'news'

class DetailScreen(Screen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.layout = BoxLayout(orientation='vertical', padding=10, spacing=10)
        self.add_widget(self.layout)

    def load_crypto(self, crypto):
        self.layout.clear_widgets()
        
        # Başlık
        title = Label(
            text=f"{crypto['name']} ({crypto['symbol'].upper()})",
            font_size='20sp',
            size_hint_y=None,
            height='50dp'
        )
        self.layout.add_widget(title)
        
        # Grafik
        try:
            response = requests.get(
                f"https://api.coingecko.com/api/v3/coins/{crypto['id']}/market_chart",
                params={
                    'vs_currency': 'usd',
                    'days': 30
                }
            )
            chart_data = response.json()
            
            # Grafik widget'ı burada oluşturulacak
            # (Kivy garden chart kullanımı için ek kod gerekebilir)
            
        except Exception as e:
            print(f"Error loading chart data: {e}")
        
        # Teknik indikatörler
        indicators = BoxLayout(orientation='vertical', size_hint_y=None, height='200dp')
        indicators.add_widget(Label(text='Teknik İndikatörler', font_size='18sp'))
        
        # Örnek indikatörler
        indicator_names = ['RSI', 'MACD', 'Bollinger Bands']
        for name in indicator_names:
            value = f"{name}: {round(100 * (crypto['current_price'] / 50000), 2)}"
            indicators.add_widget(Label(text=value))
        
        self.layout.add_widget(indicators)

class NewsScreen(Screen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        layout = BoxLayout(orientation='vertical', padding=10, spacing=10)
        
        # Başlık
        title = Label(
            text='Kripto Haberler',
            font_size='24sp',
            size_hint_y=None,
            height='50dp'
        )
        layout.add_widget(title)
        
        # Haber listesi için ScrollView
        scroll = ScrollView()
        self.news_list = GridLayout(
            cols=1,
            spacing=10,
            size_hint_y=None,
            padding=10
        )
        self.news_list.bind(minimum_height=self.news_list.setter('height'))
        scroll.add_widget(self.news_list)
        layout.add_widget(scroll)
        
        self.add_widget(layout)
        self.load_news()

    def load_news(self):
        try:
            response = requests.get(
                'https://newsapi.org/v2/everything',
                params={
                    'q': 'cryptocurrency OR bitcoin OR ethereum',
                    'language': 'en',
                    'sortBy': 'publishedAt',
                    'apiKey': 'YOUR_API_KEY'  # NewsAPI anahtarınızı buraya ekleyin
                }
            )
            news = response.json()['articles']
            
            for article in news:
                news_item = BoxLayout(
                    orientation='horizontal',
                    size_hint_y=None,
                    height='100dp',
                    padding=10,
                    spacing=10
                )
                
                # Haber içeriği
                content = BoxLayout(orientation='vertical')
                title = Label(
                    text=article['title'],
                    font_size='16sp',
                    size_hint_y=None,
                    height='40dp'
                )
                description = Label(
                    text=article['description'],
                    font_size='14sp',
                    size_hint_y=None,
                    height='40dp'
                )
                source = Label(
                    text=f"{article['source']['name']} - {datetime.strptime(article['publishedAt'], '%Y-%m-%dT%H:%M:%SZ').strftime('%d/%m/%Y')}",
                    font_size='12sp',
                    size_hint_y=None,
                    height='20dp',
                    color=(0.5, 0.5, 0.5, 1)
                )
                
                content.add_widget(title)
                content.add_widget(description)
                content.add_widget(source)
                
                news_item.add_widget(content)
                self.news_list.add_widget(news_item)
                
        except Exception as e:
            print(f"Error loading news: {e}")
            # Örnek haber
            sample_news = {
                'title': 'Bitcoin Yükselişe Geçti',
                'description': 'Bitcoin son 24 saatte %5 değer kazandı ve 50.000 dolar seviyesini aştı.',
                'source': {'name': 'Kripto Haber'},
                'publishedAt': datetime.now().strftime('%Y-%m-%dT%H:%M:%SZ')
            }
            self.show_news_item(sample_news)

class MorkanApp(App):
    def build(self):
        Window.clearcolor = (0.95, 0.95, 0.95, 1)
        sm = ScreenManager()
        sm.add_widget(HomeScreen(name='home'))
        sm.add_widget(DetailScreen(name='detail'))
        sm.add_widget(NewsScreen(name='news'))
        return sm

if __name__ == '__main__':
    MorkanApp().run() 