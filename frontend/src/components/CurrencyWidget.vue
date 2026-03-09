<template>
  <q-card class="currency-widget glass-effect-enhanced" dark>
    <q-card-section class="q-pa-md">
      <div class="row items-center q-mb-md">
        <q-icon name="currency_exchange" size="28px" class="text-accent q-mr-sm" />
        <div class="text-subtitle1 text-weight-bold">Döviz Kurları</div>
        <q-space />
        <q-btn 
          flat 
          dense 
          round 
          icon="refresh" 
          size="sm"
          @click="loadCurrencyRates"
          :loading="loading"
          class="refresh-btn"
        />
      </div>

      <div v-if="loading && !rates.length" class="text-center q-py-md">
        <q-spinner-dots color="accent" size="40px" />
      </div>

      <div v-else-if="error" class="text-center q-py-md">
        <q-icon name="error_outline" size="48px" class="text-negative q-mb-sm" />
        <div class="text-caption text-grey-5">{{ error }}</div>
        <q-btn 
          flat 
          dense 
          label="Tekrar Dene" 
          color="accent" 
          size="sm"
          @click="loadCurrencyRates"
          class="q-mt-sm"
        />
      </div>

      <div v-else class="currency-list">
        <div 
          v-for="rate in rates" 
          :key="rate.code"
          class="currency-item q-pa-sm q-mb-xs"
        >
          <div class="row items-center">
            <div class="currency-flag">{{ rate.flag }}</div>
            <div class="col q-ml-sm">
              <div class="text-weight-bold">{{ rate.code }}</div>
              <div class="text-caption text-grey-5">{{ rate.name }}</div>
            </div>
            <div class="text-right">
              <div class="text-h6 text-weight-bold" :class="rate.changeClass">
                ₺{{ rate.value }}
              </div>
              <div class="text-caption" :class="rate.changeClass">
                <q-icon :name="rate.changeIcon" size="14px" />
                {{ rate.change }}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="lastUpdate" class="text-center text-caption text-grey-6 q-mt-sm">
        Son güncelleme: {{ lastUpdate }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const loading = ref(false);
const error = ref('');
const rates = ref([]);
const lastUpdate = ref('');

const currencyConfig = [
  { code: 'USD', name: 'Amerikan Doları', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'İngiliz Sterlini', flag: '🇬🇧' },
  { code: 'CHF', name: 'İsviçre Frangı', flag: '🇨🇭' },
  { code: 'JPY', name: 'Japon Yeni', flag: '🇯🇵' }
];

const loadCurrencyRates = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    // Backend proxy üzerinden döviz kurlarını al (CORS sorunu yok)
    const response = await axios.get('http://localhost:3001/api/currency/rates');
    
    const data = response.data;
    const ratesData = data.rates;
    
    rates.value = currencyConfig.map(config => {
      const value = (1 / ratesData[config.code]).toFixed(2);
      const change = (Math.random() * 2 - 1).toFixed(2); // Simüle değişim
      
      return {
        ...config,
        value: value,
        change: Math.abs(change),
        changeClass: change >= 0 ? 'text-positive' : 'text-negative',
        changeIcon: change >= 0 ? 'arrow_upward' : 'arrow_downward'
      };
    });
    
    lastUpdate.value = new Date().toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
  } catch (err) {
    console.error('Currency fetch error:', err);
    error.value = 'Kur bilgileri yüklenemedi';
    
    // Hata durumunda örnek veri göster
    rates.value = [
      { code: 'USD', name: 'Amerikan Doları', flag: '🇺🇸', value: '34.52', change: '0.15', changeClass: 'text-positive', changeIcon: 'arrow_upward' },
      { code: 'EUR', name: 'Euro', flag: '🇪🇺', value: '37.18', change: '0.23', changeClass: 'text-positive', changeIcon: 'arrow_upward' },
      { code: 'GBP', name: 'İngiliz Sterlini', flag: '🇬🇧', value: '43.67', change: '0.08', changeClass: 'text-negative', changeIcon: 'arrow_downward' },
      { code: 'CHF', name: 'İsviçre Frangı', flag: '🇨🇭', value: '39.21', change: '0.12', changeClass: 'text-positive', changeIcon: 'arrow_upward' },
      { code: 'JPY', name: 'Japon Yeni', flag: '🇯🇵', value: '0.23', change: '0.05', changeClass: 'text-negative', changeIcon: 'arrow_downward' }
    ];
    lastUpdate.value = new Date().toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadCurrencyRates();
});
</script>

<style scoped>
.currency-widget {
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.currency-list {
  max-height: 350px;
  overflow-y: auto;
}

.currency-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.currency-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.currency-flag {
  font-size: 32px;
  line-height: 1;
}

.refresh-btn {
  transition: transform 0.3s ease;
}

.refresh-btn:hover {
  transform: rotate(180deg);
}

.text-positive {
  color: #4CAF50;
}

.text-negative {
  color: #F44336;
}

/* Scrollbar */
.currency-list::-webkit-scrollbar {
  width: 6px;
}

.currency-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.currency-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}

.currency-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
