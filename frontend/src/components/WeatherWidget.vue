<template>
  <q-card class="weather-widget glass-effect-enhanced" dark>
    <q-card-section class="q-pa-md">
      <div class="row items-center q-mb-md">
        <q-icon name="wb_sunny" size="28px" class="text-warning q-mr-sm" />
        <div class="text-h6 text-weight-bold">Hava Durumu</div>
        <q-space />
        <q-btn flat dense round icon="refresh" size="sm" @click="loadWeather" :loading="loading">
          <q-tooltip>Yenile</q-tooltip>
        </q-btn>
      </div>

      <q-input
        v-model="cityInput"
        outlined
        dense
        dark
        label="Şehir"
        placeholder="İstanbul, Paris, Tokyo..."
        @keyup.enter="searchCity"
        class="q-mb-md"
      >
        <template v-slot:prepend><q-icon name="location_city" /></template>
        <template v-slot:append>
          <q-btn flat dense round icon="search" size="sm" @click="searchCity" :loading="loading" />
        </template>
      </q-input>

      <div v-if="loading" class="text-center q-py-lg">
        <q-spinner-orbit color="accent" size="50px" />
      </div>

      <div v-else-if="error" class="text-center q-py-md">
        <q-icon name="error_outline" size="50px" class="text-negative" />
        <div class="text-caption q-mt-sm">{{ error }}</div>
      </div>

      <div v-else-if="currentWeather">
        <div class="row items-center justify-between q-mb-md">
          <div>
            <div class="text-h6">{{ currentWeather.city }}, {{ currentWeather.country }}</div>
            <div class="text-caption text-grey-4">{{ currentWeather.description }}</div>
          </div>
          <img :src="`https://openweathermap.org/img/wn/${currentWeather.icon}@2x.png`" style="width: 60px;" />
        </div>
        
        <div class="text-h3 text-weight-bold text-center q-mb-sm" style="color: #FFC107;">
          {{ currentWeather.temp }}°C
        </div>
        
        <div class="row q-gutter-sm justify-center q-mb-md">
          <q-chip dense color="blue-grey-8" text-color="white" icon="water_drop">
            {{ currentWeather.humidity }}%
          </q-chip>
          <q-chip dense color="blue-grey-8" text-color="white" icon="air">
            {{ currentWeather.wind_speed }} m/s
          </q-chip>
        </div>

        <q-separator dark class="q-mb-md" />

        <div v-if="forecast && forecast.daily">
          <div class="text-subtitle2 q-mb-sm">5 Günlük Tahmin</div>
          <div class="row q-col-gutter-xs">
            <div v-for="(day, index) in forecast.daily" :key="index" class="col">
              <q-card flat bordered class="text-center q-pa-xs" style="background: rgba(255,255,255,0.05);">
                <div class="text-caption">{{ formatDate(day.date) }}</div>
                <img :src="`https://openweathermap.org/img/wn/${day.icon}.png`" style="width: 40px;" />
                <div class="text-caption">
                  <span class="text-weight-bold">{{ day.temp_max }}°</span>
                  <span class="text-grey-5">{{ day.temp_min }}°</span>
                </div>
              </q-card>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center q-py-lg">
        <q-icon name="cloud_queue" size="60px" class="text-grey-6" />
        <div class="text-caption q-mt-sm">Bir şehir ara</div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';

const props = defineProps({
  city: { type: String, default: '' },
  autoLoad: { type: Boolean, default: true }
});

const $q = useQuasar();
const cityInput = ref(props.city || '');
const currentWeather = ref(null);
const forecast = ref(null);
const loading = ref(false);
const error = ref('');

const loadWeather = async () => {
  if (!cityInput.value.trim()) {
    error.value = 'Lütfen bir şehir girin';
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    const currentRes = await axios.get(`/api/weather/current/${encodeURIComponent(cityInput.value)}`);
    currentWeather.value = currentRes.data;
    const forecastRes = await axios.get(`/api/weather/${encodeURIComponent(cityInput.value)}?days=5`);
    forecast.value = forecastRes.data;
  } catch (err) {
    error.value = err.response?.data?.error || 'Hava durumu bilgisi alınamadı';
    currentWeather.value = null;
    forecast.value = null;
    $q.notify({ type: 'negative', message: error.value, position: 'top' });
  } finally {
    loading.value = false;
  }
};

const searchCity = () => loadWeather();

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.toDateString() === today.toDateString()) return 'Bugün';
  if (date.toDateString() === tomorrow.toDateString()) return 'Yarın';
  return date.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric' });
};

onMounted(() => {
  if (props.autoLoad && cityInput.value) loadWeather();
});

defineExpose({
  loadWeather,
  setCity: (city) => {
    cityInput.value = city;
    loadWeather();
  }
});
</script>

<style scoped>
.weather-widget {
  min-width: 280px;
  max-width: 400px;
}
</style>
