<template>
  <q-dialog v-model="show" transition-show="scale" transition-hide="scale">
    <q-card class="budget-dialog-ultra" dark style="min-width: 700px; max-width: 900px;">
      <q-bar class="budget-header">
        <q-icon name="account_balance_wallet" size="28px" class="glow-icon" />
        <div class="text-h6 text-weight-bold q-ml-sm">💰 Bütçe Yönetimi</div>
        <q-space />
        <q-btn dense flat round icon="close" v-close-popup />
      </q-bar>

      <!-- Liste Görünümü -->
      <q-card-section v-if="!selectedBudget" class="q-pa-xl">
        <div class="create-section">
          <div class="section-header q-mb-lg">
            <q-icon name="add_circle" size="32px" color="primary" />
            <span class="text-h5 q-ml-sm">Yeni Bütçe</span>
          </div>
          
          <q-input v-model="travelName" outlined dark label="Seyahat Adı" class="modern-input q-mb-md">
            <template v-slot:prepend><q-icon name="flight_takeoff" color="primary" /></template>
          </q-input>
          
          <q-input v-model.number="totalBudget" outlined dark type="number" label="Toplam Bütçe" class="modern-input q-mb-lg">
            <template v-slot:prepend><q-icon name="payments" color="primary" /></template>
            <template v-slot:append><span class="currency">₺</span></template>
          </q-input>
          
          <q-btn label="Bütçe Oluştur" icon="add" color="primary" :loading="loading" @click="createBudget" 
            class="full-width modern-btn" size="lg" unelevated />
        </div>

        <q-separator dark class="separator q-my-xl" />

        <div class="list-section">
          <div class="section-header q-mb-md">
            <q-icon name="wallet" size="28px" color="accent" />
            <span class="text-h6 q-ml-sm">Kayıtlı Bütçeler</span>
          </div>
          
          <div v-if="budgets.length === 0" class="empty-state">
            <q-icon name="account_balance_wallet" size="80px" class="text-grey-6" />
            <div class="text-subtitle1 text-grey-5 q-mt-md">Henüz bütçe oluşturmadınız</div>
          </div>
          
          <div v-else class="budget-grid">
            <q-card v-for="budget in budgets" :key="budget.id" 
              class="budget-card" dark flat clickable @click="selectBudget(budget)">
              <q-card-section class="q-pa-md">
                <div class="card-header">
                  <div>
                    <div class="name">{{ budget.travelName }}</div>
                    <div class="total">{{ budget.totalBudget.toLocaleString() }} ₺</div>
                  </div>
                  <q-chip :color="budget.remainingBudget >= 0 ? 'positive' : 'negative'" text-color="white">
                    <q-icon name="trending_up" size="16px" class="q-mr-xs" />
                    {{ budget.remainingBudget.toLocaleString() }} ₺
                  </q-chip>
                </div>
                <q-linear-progress :value="budget.totalExpenses / budget.totalBudget" 
                  :color="budget.remainingBudget >= 0 ? 'positive' : 'negative'" 
                  size="8px" rounded class="q-mt-md" />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>

      <!-- Detay Görünümü -->
      <q-card-section v-else class="detail-section q-pa-xl">
        <q-btn flat round icon="arrow_back" @click="selectedBudget = null" class="back-btn q-mb-lg" />
        
        <div class="travel-badge q-mb-xl">
          <q-icon name="luggage" size="24px" />
          <span class="text-h5 q-ml-sm">{{ selectedBudget.travelName }}</span>
        </div>

        <div class="stats-row q-mb-xl">
          <div class="stat-card total">
            <q-icon name="account_balance" size="32px" />
            <div>
              <div class="label">Toplam Bütçe</div>
              <div class="value">{{ selectedBudget.totalBudget.toLocaleString() }} ₺</div>
            </div>
          </div>
          
          <div class="stat-card spent">
            <q-icon name="shopping_cart" size="32px" />
            <div>
              <div class="label">Harcanan</div>
              <div class="value">{{ selectedBudget.totalExpenses.toLocaleString() }} ₺</div>
            </div>
          </div>
          
          <div class="stat-card" :class="selectedBudget.remainingBudget >= 0 ? 'remaining' : 'over'">
            <q-icon :name="selectedBudget.remainingBudget >= 0 ? 'savings' : 'warning'" size="32px" />
            <div>
              <div class="label">{{ selectedBudget.remainingBudget >= 0 ? 'Kalan' : 'Aşım' }}</div>
              <div class="value">{{ Math.abs(selectedBudget.remainingBudget).toLocaleString() }} ₺</div>
            </div>
          </div>
        </div>

        <div class="progress-wrapper q-mb-xl">
          <div class="progress-labels">
            <span>Bütçe Kullanımı</span>
            <span>{{ Math.round((selectedBudget.totalExpenses / selectedBudget.totalBudget) * 100) }}%</span>
          </div>
          <q-linear-progress :value="selectedBudget.totalExpenses / selectedBudget.totalBudget" 
            :color="selectedBudget.remainingBudget >= 0 ? 'positive' : 'negative'" 
            size="24px" rounded />
        </div>

        <div class="add-expense q-mb-xl">
          <div class="section-header-small q-mb-md">
            <q-icon name="add_shopping_cart" size="24px" />
            <span>Yeni Harcama</span>
          </div>
          <div class="expense-grid">
            <q-input v-model="expenseDesc" outlined dark placeholder="Açıklama" dense>
              <template v-slot:prepend><q-icon name="description" /></template>
            </q-input>
            <q-input v-model.number="expenseAmount" outlined dark type="number" placeholder="Tutar" dense>
              <template v-slot:prepend><q-icon name="attach_money" /></template>
            </q-input>
            <q-select v-model="expenseCategory" :options="categories" outlined dark dense>
              <template v-slot:prepend><q-icon name="category" /></template>
            </q-select>
            <q-btn icon="add_circle" label="Ekle" color="primary" @click="addExpense" :loading="loading" unelevated />
          </div>
        </div>

        <div class="expenses-section">
          <div class="section-header-small q-mb-md">
            <q-icon name="receipt_long" size="24px" />
            <span>Harcamalar ({{ selectedBudget.expenses?.length || 0 }})</span>
          </div>
          
          <div v-if="!selectedBudget.expenses || selectedBudget.expenses.length === 0" class="empty-small">
            <q-icon name="receipt" size="60px" />
            <div>Henüz harcama yok</div>
          </div>
          
          <div v-else class="expenses-list">
            <div v-for="expense in selectedBudget.expenses" :key="expense.id" class="expense-item">
              <div class="expense-icon">
                <q-icon :name="getCategoryIcon(expense.category)" size="24px" />
              </div>
              <div class="expense-info">
                <div class="desc">{{ expense.description }}</div>
                <div class="meta">
                  <q-chip dense size="sm" :color="getCategoryColor(expense.category)" text-color="white">
                    {{ expense.category }}
                  </q-chip>
                  <span>{{ new Date(expense.date).toLocaleDateString('tr-TR') }}</span>
                </div>
              </div>
              <div class="amount">{{ expense.amount.toLocaleString() }} ₺</div>
              <q-btn flat dense round icon="delete" color="negative" @click="deleteExpense(expense.id)" />
            </div>
          </div>
        </div>

        <q-btn label="Bütçeyi Sil" icon="delete_forever" color="negative" outline @click="deleteBudget" 
          class="full-width q-mt-xl" size="md" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';

const props = defineProps({ modelValue: Boolean });
const emit = defineEmits(['update:modelValue']);
const $q = useQuasar();
const show = ref(props.modelValue);
const budgets = ref([]);
const selectedBudget = ref(null);
const loading = ref(false);
const travelName = ref('');
const totalBudget = ref(null);
const expenseDesc = ref('');
const expenseAmount = ref(null);
const expenseCategory = ref('Diğer');
const categories = ['Ulaşım', 'Konaklama', 'Yemek', 'Aktivite', 'Alışveriş', 'Diğer'];

watch(() => props.modelValue, (val) => { show.value = val; if (val) loadBudgets(); });
watch(show, (val) => emit('update:modelValue', val));

const loadBudgets = async () => {
  try {
    const res = await axios.get('/api/budgets');
    budgets.value = res.data.budgets;
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Bütçeler yüklenemedi' });
  }
};

const createBudget = async () => {
  if (!travelName.value || !totalBudget.value) {
    $q.notify({ type: 'warning', message: 'Lütfen tüm alanları doldurun' });
    return;
  }
  loading.value = true;
  try {
    await axios.post('/api/budgets', { travelName: travelName.value, totalBudget: totalBudget.value });
    $q.notify({ type: 'positive', message: 'Bütçe oluşturuldu!' });
    travelName.value = '';
    totalBudget.value = null;
    loadBudgets();
  } catch (err) {
    $q.notify({ type: 'negative', message: err.response?.data?.error || 'Hata oluştu' });
  } finally {
    loading.value = false;
  }
};

const selectBudget = (budget) => { selectedBudget.value = budget; };

const addExpense = async () => {
  if (!expenseDesc.value || !expenseAmount.value) {
    $q.notify({ type: 'warning', message: 'Açıklama ve tutar gerekli' });
    return;
  }
  loading.value = true;
  try {
    const res = await axios.post(`/api/budgets/${selectedBudget.value.id}/expenses`, {
      description: expenseDesc.value, amount: expenseAmount.value, category: expenseCategory.value
    });
    selectedBudget.value = res.data.budget;
    expenseDesc.value = '';
    expenseAmount.value = null;
    $q.notify({ type: 'positive', message: 'Harcama eklendi!' });
    loadBudgets();
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Harcama eklenemedi' });
  } finally {
    loading.value = false;
  }
};

const deleteExpense = async (expenseId) => {
  try {
    const res = await axios.delete(`/api/budgets/${selectedBudget.value.id}/expenses/${expenseId}`);
    selectedBudget.value = res.data.budget;
    $q.notify({ type: 'positive', message: 'Harcama silindi' });
    loadBudgets();
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Silinemedi' });
  }
};

const deleteBudget = async () => {
  $q.dialog({ title: 'Emin misin?', message: 'Bu bütçe kalıcı olarak silinecek', cancel: true, dark: true }).onOk(async () => {
    try {
      await axios.delete(`/api/budgets/${selectedBudget.value.id}`);
      $q.notify({ type: 'positive', message: 'Bütçe silindi' });
      selectedBudget.value = null;
      loadBudgets();
    } catch (err) {
      $q.notify({ type: 'negative', message: 'Silinemedi' });
    }
  });
};

const getCategoryIcon = (cat) => ({ 'Ulaşım': 'directions_car', 'Konaklama': 'hotel', 'Yemek': 'restaurant', 'Aktivite': 'local_activity', 'Alışveriş': 'shopping_bag', 'Diğer': 'more_horiz' }[cat] || 'attach_money');
const getCategoryColor = (cat) => ({ 'Ulaşım': 'blue', 'Konaklama': 'purple', 'Yemek': 'orange', 'Aktivite': 'teal', 'Alışveriş': 'pink', 'Diğer': 'grey' }[cat] || 'grey');
</script>

<style scoped>
.budget-dialog-ultra {
  background: linear-gradient(135deg, rgba(30,30,46,0.95), rgba(24,24,37,0.98));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.1);
}
.budget-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px 20px;
}
.glow-icon { animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
.section-header { display: flex; align-items: center; font-weight: 600; }
.modern-input :deep(.q-field__control) {
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  transition: all 0.3s;
}
.modern-input :deep(.q-field__control:hover) { background: rgba(255,255,255,0.08); }
.currency { font-weight: 600; color: #FFC107; }
.modern-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-weight: 600;
  transition: all 0.3s;
}
.modern-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(102,126,234,0.4); }
.separator {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  height: 2px;
}
.empty-state { text-align: center; padding: 60px 20px; opacity: 0.6; }
.budget-grid { display: grid; gap: 16px; }
.budget-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  transition: all 0.3s;
  cursor: pointer;
}
.budget-card:hover {
  background: rgba(255,255,255,0.06);
  border-color: rgba(102,126,234,0.5);
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.3);
}
.card-header { display: flex; justify-content: space-between; align-items: flex-start; }
.name { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
.total { font-size: 14px; color: #9E9E9E; }
.back-btn { background: rgba(255,255,255,0.05); }
.back-btn:hover { background: rgba(255,255,255,0.1); }
.travel-badge {
  display: inline-flex;
  align-items: center;
  padding: 12px 24px;
  background: linear-gradient(135deg, rgba(102,126,234,0.2), rgba(118,75,162,0.2));
  border-radius: 16px;
  border: 1px solid rgba(102,126,234,0.3);
}
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
.stat-card {
  padding: 20px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s;
}
.stat-card:hover { transform: translateY(-4px); }
.label { font-size: 12px; text-transform: uppercase; opacity: 0.7; margin-bottom: 4px; }
.value { font-size: 24px; font-weight: 700; }
.stat-card.total { background: linear-gradient(135deg, rgba(33,150,243,0.2), rgba(3,169,244,0.1)); border: 1px solid rgba(33,150,243,0.3); color: #2196F3; }
.stat-card.spent { background: linear-gradient(135deg, rgba(255,152,0,0.2), rgba(255,193,7,0.1)); border: 1px solid rgba(255,152,0,0.3); color: #FF9800; }
.stat-card.remaining { background: linear-gradient(135deg, rgba(76,175,80,0.2), rgba(129,199,132,0.1)); border: 1px solid rgba(76,175,80,0.3); color: #4CAF50; }
.stat-card.over { background: linear-gradient(135deg, rgba(244,67,54,0.2), rgba(239,83,80,0.1)); border: 1px solid rgba(244,67,54,0.3); color: #F44336; }
.progress-wrapper .progress-labels { display: flex; justify-content: space-between; margin-bottom: 8px; color: #BDBDBD; }
.section-header-small { display: flex; align-items: center; gap: 8px; font-weight: 600; }
.expense-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr auto;
  gap: 12px;
}
@media (max-width: 768px) { .expense-grid { grid-template-columns: 1fr; } }
.expenses-list { max-height: 400px; overflow-y: auto; }
.expenses-list::-webkit-scrollbar { width: 6px; }
.expenses-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
.expense-item {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  margin-bottom: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s;
}
.expense-item:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.15); }
.expense-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: rgba(102,126,234,0.2); border-radius: 50%; color: #667eea; }
.expense-info { flex: 1; }
.desc { font-weight: 600; margin-bottom: 4px; }
.meta { display: flex; align-items: center; gap: 12px; font-size: 12px; color: #9E9E9E; }
.amount { font-size: 18px; font-weight: 700; color: #FF5252; }
.empty-small { text-align: center; padding: 40px; opacity: 0.5; color: #9E9E9E; }
</style>
