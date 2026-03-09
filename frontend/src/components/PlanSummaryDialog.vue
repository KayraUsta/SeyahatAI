<template>
  <q-dialog v-model="isOpen" maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card class="bg-travel summary-card" dark>
      <q-bar class="summary-header-enhanced">
        <q-icon name="analytics" size="28px" class="glow-effect" />
        <div class="text-h5 text-weight-bold q-ml-sm">📊 Seyahat Planlarım Özeti</div>
        <q-space />
        <q-btn dense flat icon="refresh" @click="loadSummary" :loading="loading" size="md">
          <q-tooltip>Yenile</q-tooltip>
        </q-btn>
        <q-btn dense flat icon="close" v-close-popup size="md" />
      </q-bar>

      <q-card-section class="q-pa-xl">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state-enhanced">
          <div class="stats-animation-wrapper">
            <q-icon name="analytics" size="80px" class="text-accent pulse-animation" />
            <q-icon name="show_chart" size="50px" class="chart-float-1 text-primary" />
            <q-icon name="pie_chart" size="45px" class="chart-float-2 text-secondary" />
          </div>
          <div class="text-h5 text-weight-bold q-mt-xl travel-gradient">Özet hazırlanıyor...</div>
          <q-linear-progress indeterminate color="accent" class="q-mt-md progress-glow" style="width: 300px; margin: 0 auto;" />
        </div>

        <!-- Summary Content -->
        <div v-else-if="summary" class="summary-content">
          <!-- Stats Cards Grid -->
          <div class="row q-col-gutter-lg q-mb-xl">
            <!-- Plans Card -->
            <div class="col-12 col-md-4">
              <q-card class="stat-card-modern plan-card" dark flat>
                <div class="card-icon-wrapper">
                  <q-icon name="map" size="64px" class="card-icon" />
                </div>
                <q-card-section>
                  <div class="stat-number animated-count">{{ summary.plans.total }}</div>
                  <div class="stat-label">Toplam Plan</div>
                  <q-separator dark class="q-my-md" />
                  <div class="stat-detail">
                    <q-icon name="favorite" color="red" size="20px" />
                    <span>{{ summary.plans.favorites }} Favori</span>
                  </div>
                </q-card-section>
                <div class="card-glow plan-glow"></div>
              </q-card>
            </div>

            <!-- Budget Card -->
            <div class="col-12 col-md-4">
              <q-card class="stat-card-modern budget-card" dark flat>
                <div class="card-icon-wrapper">
                  <q-icon name="account_balance_wallet" size="64px" class="card-icon" />
                </div>
                <q-card-section>
                  <div class="stat-number animated-count">{{ summary.budgets.total }}</div>
                  <div class="stat-label">Bütçe Planı</div>
                  <q-separator dark class="q-my-md" />
                  <div class="stat-detail">
                    <q-icon name="trending_up" color="green" size="20px" />
                    <span>{{ formatCurrency(summary.budgets.totalAmount) }}</span>
                  </div>
                  <div class="stat-detail">
                    <q-icon name="trending_down" color="red" size="20px" />
                    <span>{{ formatCurrency(summary.budgets.totalExpenses) }} harcandı</span>
                  </div>
                  <div class="stat-detail highlight">
                    <q-icon name="savings" color="yellow" size="20px" />
                    <span>{{ formatCurrency(summary.budgets.remaining) }} kaldı</span>
                  </div>
                </q-card-section>
                <div class="card-glow budget-glow"></div>
              </q-card>
            </div>

            <!-- Todo Card -->
            <div class="col-12 col-md-4">
              <q-card class="stat-card-modern todo-card" dark flat>
                <div class="card-icon-wrapper">
                  <q-icon name="checklist" size="64px" class="card-icon" />
                </div>
                <q-card-section>
                  <div class="stat-number animated-count">{{ summary.todos.totalItems }}</div>
                  <div class="stat-label">Yapılacak Görev</div>
                  <q-separator dark class="q-my-md" />
                  <div class="stat-detail">
                    <q-icon name="check_circle" color="green" size="20px" />
                    <span>{{ summary.todos.completed }} Tamamlandı</span>
                  </div>
                  <div class="stat-detail">
                    <q-icon name="pending" color="orange" size="20px" />
                    <span>{{ summary.todos.pending }} Bekliyor</span>
                  </div>
                  <div class="stat-detail highlight">
                    <q-icon name="percent" color="blue" size="20px" />
                    <span>%{{ summary.todos.completionRate }} Tamamlanma</span>
                  </div>
                </q-card-section>
                <div class="card-glow todo-glow"></div>
              </q-card>
            </div>
          </div>

          <!-- Detailed Sections -->
          <div class="row q-col-gutter-lg">
            <!-- Recent Plans -->
            <div class="col-12 col-md-6">
              <q-card class="detail-card-modern" dark flat>
                <q-card-section class="detail-header">
                  <q-icon name="history" size="28px" class="q-mr-sm text-primary" />
                  <span class="text-h6 text-weight-bold">Son Planlar</span>
                </q-card-section>
                <q-separator dark />
                <q-card-section>
                  <div v-if="summary.plans.recent.length === 0" class="text-center text-grey-5 q-pa-md">
                    Henüz plan eklenmemiş
                  </div>
                  <div v-else class="recent-list">
                    <div 
                      v-for="(plan, index) in summary.plans.recent" 
                      :key="plan.id"
                      class="recent-item"
                      :style="{ animationDelay: `${index * 0.1}s` }"
                    >
                      <q-icon name="location_on" size="20px" class="text-accent" />
                      <div class="recent-content">
                        <div class="recent-title">{{ plan.title }}</div>
                        <div class="recent-date">{{ formatDate(plan.createdAt) }}</div>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Budget by Category -->
            <div class="col-12 col-md-6">
              <q-card class="detail-card-modern" dark flat>
                <q-card-section class="detail-header">
                  <q-icon name="pie_chart" size="28px" class="q-mr-sm text-secondary" />
                  <span class="text-h6 text-weight-bold">Harcama Dağılımı</span>
                </q-card-section>
                <q-separator dark />
                <q-card-section>
                  <div v-if="Object.keys(summary.budgets.byCategory).length === 0" class="text-center text-grey-5 q-pa-md">
                    Henüz harcama eklenmemiş
                  </div>
                  <div v-else class="category-list">
                    <div 
                      v-for="(amount, category, index) in summary.budgets.byCategory" 
                      :key="category"
                      class="category-item"
                      :style="{ animationDelay: `${index * 0.1}s` }"
                    >
                      <div class="category-info">
                        <q-icon :name="getCategoryIcon(category)" size="20px" :color="getCategoryColor(category)" />
                        <span class="category-name">{{ category }}</span>
                      </div>
                      <div class="category-amount">{{ formatCurrency(amount) }}</div>
                      <div class="category-bar">
                        <div 
                          class="category-bar-fill" 
                          :style="{ width: getPercentage(amount) + '%', backgroundColor: getCategoryColor(category) }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-section q-mt-xl text-center">
            <q-btn 
              label="Yeni Plan Oluştur" 
              color="primary" 
              icon="add_circle"
              size="lg"
              class="q-mr-md action-btn-summary"
              @click="$emit('create-plan')"
              unelevated
            />
            <q-btn 
              label="Planlarıma Dön" 
              color="grey-7" 
              icon="arrow_back"
              size="lg"
              class="action-btn-summary"
              v-close-popup
              outline
              unelevated
            />
          </div>
        </div>

        <!-- Error State -->
        <div v-else class="error-state text-center q-pa-xl">
          <q-icon name="error_outline" size="80px" class="text-red" />
          <div class="text-h5 q-mt-md">Özet yüklenemedi</div>
          <q-btn 
            label="Tekrar Dene" 
            color="primary" 
            icon="refresh"
            @click="loadSummary"
            class="q-mt-lg"
            unelevated
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';

const $q = useQuasar();

const props = defineProps({
  modelValue: Boolean
});

const emit = defineEmits(['update:modelValue', 'create-plan']);

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const loading = ref(false);
const summary = ref(null);

// Watch for dialog open
watch(isOpen, (newVal) => {
  if (newVal) {
    loadSummary();
  }
});

const loadSummary = async () => {
  loading.value = true;
  try {
    const response = await axios.get('/api/plans/summary');
    summary.value = response.data.summary;
  } catch (error) {
    console.error('Summary load error:', error);
    $q.notify({
      type: 'negative',
      message: 'Özet yüklenirken hata oluştu',
      icon: 'error',
      position: 'top'
    });
    summary.value = null;
  } finally {
    loading.value = false;
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0
  }).format(amount || 0);
};

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('tr-TR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const getCategoryIcon = (category) => {
  const icons = {
    'Ulaşım': 'directions_car',
    'Konaklama': 'hotel',
    'Yemek': 'restaurant',
    'Aktivite': 'local_activity',
    'Alışveriş': 'shopping_bag',
    'Diğer': 'category'
  };
  return icons[category] || 'category';
};

const getCategoryColor = (category) => {
  const colors = {
    'Ulaşım': 'blue',
    'Konaklama': 'purple',
    'Yemek': 'orange',
    'Aktivite': 'green',
    'Alışveriş': 'pink',
    'Diğer': 'grey'
  };
  return colors[category] || 'grey';
};

const getPercentage = (amount) => {
  if (!summary.value) return 0;
  const total = summary.value.budgets.totalExpenses;
  if (total === 0) return 0;
  return Math.round((amount / total) * 100);
};
</script>

<style scoped>
.summary-card {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.summary-header-enhanced {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(168, 85, 247, 0.3) 100%);
  backdrop-filter: blur(10px);
  padding: 16px 24px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.3);
}

/* Loading Animation */
.stats-animation-wrapper {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
}

.pulse-animation {
  animation: pulse 2s ease-in-out infinite;
}

.chart-float-1 {
  position: absolute;
  top: 20px;
  right: 20px;
  animation: float 3s ease-in-out infinite;
}

.chart-float-2 {
  position: absolute;
  bottom: 20px;
  left: 20px;
  animation: float 3s ease-in-out infinite 0.5s;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

/* Stat Cards */
.stat-card-modern {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideInUp 0.6s ease-out;
}

.stat-card-modern:hover {
  transform: translateY(-10px);
  border-color: rgba(99, 102, 241, 0.5);
}

.card-icon-wrapper {
  text-align: center;
  padding: 30px 0 10px;
}

.card-icon {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.5));
  animation: iconGlow 3s ease-in-out infinite;
}

@keyframes iconGlow {
  0%, 100% { filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.5)); }
  50% { filter: drop-shadow(0 0 30px rgba(168, 85, 247, 0.8)); }
}

.stat-number {
  font-size: 64px;
  font-weight: 900;
  text-align: center;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 18px;
  text-align: center;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-detail {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  color: #cbd5e1;
  font-size: 14px;
}

.stat-detail.highlight {
  color: #fbbf24;
  font-weight: 700;
}

.card-glow {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  opacity: 0;
  transition: opacity 0.4s;
}

.stat-card-modern:hover .card-glow {
  opacity: 1;
}

.plan-glow {
  background: linear-gradient(90deg, #6366f1, #a855f7);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.8);
}

.budget-glow {
  background: linear-gradient(90deg, #10b981, #3b82f6);
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.8);
}

.todo-glow {
  background: linear-gradient(90deg, #f59e0b, #ef4444);
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.8);
}

/* Detail Cards */
.detail-card-modern {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  animation: slideInUp 0.8s ease-out;
}

.detail-header {
  display: flex;
  align-items: center;
  padding: 20px;
  background: rgba(99, 102, 241, 0.1);
}

/* Recent Items */
.recent-list, .category-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s;
  animation: fadeInLeft 0.6s ease-out;
}

.recent-item:hover {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.3);
  transform: translateX(5px);
}

.recent-content {
  flex: 1;
}

.recent-title {
  font-size: 16px;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 4px;
}

.recent-date {
  font-size: 13px;
  color: #94a3b8;
}

/* Category Items */
.category-item {
  animation: fadeInRight 0.6s ease-out;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.category-name {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  color: #e2e8f0;
}

.category-amount {
  font-size: 16px;
  font-weight: 700;
  color: #fbbf24;
}

.category-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 8px;
}

.category-bar-fill {
  height: 100%;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 10px currentColor;
}

/* Action Buttons */
.action-btn-summary {
  padding: 12px 32px;
  border-radius: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s;
}

.action-btn-summary:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
}

/* Animations */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Animated Count Effect */
.animated-count {
  animation: countUp 1s ease-out;
}

@keyframes countUp {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Loading & Error States */
.loading-state-enhanced,
.error-state {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.progress-glow {
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
}
</style>
