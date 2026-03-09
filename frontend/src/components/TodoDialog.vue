<template>
  <q-dialog v-model="show" transition-show="scale" transition-hide="scale">
    <q-card class="todo-dialog-ultra" dark style="min-width: 700px; max-width: 900px;">
      <q-bar class="todo-header">
        <q-icon name="checklist" size="28px" class="glow-icon" />
        <div class="text-h6 text-weight-bold q-ml-sm">✅ Yapılacaklar Listesi</div>
        <q-space />
        <q-btn dense flat round icon="close" v-close-popup />
      </q-bar>

      <!-- Liste Görünümü -->
      <q-card-section v-if="!selectedList" class="q-pa-xl">
        <div class="create-section">
          <div class="section-header q-mb-lg">
            <q-icon name="add_circle" size="32px" color="secondary" />
            <span class="text-h5 q-ml-sm">Yeni Liste</span>
          </div>
          
          <q-input v-model="travelName" outlined dark label="Seyahat Adı" class="modern-input q-mb-lg">
            <template v-slot:prepend><q-icon name="flight" color="secondary" /></template>
          </q-input>
          
          <q-btn label="Liste Oluştur" icon="add" color="secondary" :loading="loading" @click="createList" 
            class="full-width modern-btn" size="lg" unelevated />
        </div>

        <q-separator dark class="separator q-my-xl" />

        <div class="list-section">
          <div class="section-header q-mb-md">
            <q-icon name="format_list_bulleted" size="28px" color="accent" />
            <span class="text-h6 q-ml-sm">Listelerim</span>
          </div>
          
          <div v-if="lists.length === 0" class="empty-state">
            <q-icon name="checklist" size="80px" class="text-grey-6" />
            <div class="text-subtitle1 text-grey-5 q-mt-md">Henüz liste oluşturmadınız</div>
          </div>
          
          <div v-else class="todo-grid">
            <q-card v-for="list in lists" :key="list.id" 
              class="todo-card" dark flat clickable @click="selectList(list)">
              <q-card-section class="q-pa-md">
                <div class="card-header">
                  <div>
                    <div class="name">{{ list.travelName }}</div>
                    <div class="count">{{ list.items?.length || 0 }} madde</div>
                  </div>
                  <q-circular-progress
                    :value="list.items?.length ? (completedCount(list) / list.items.length) * 100 : 0"
                    size="50px"
                    :thickness="0.15"
                    color="positive"
                    track-color="grey-8"
                    class="progress-circle"
                  >
                    <span class="progress-text">{{ completedCount(list) }}/{{ list.items?.length || 0 }}</span>
                  </q-circular-progress>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>

      <!-- Detay Görünümü -->
      <q-card-section v-else class="detail-section q-pa-xl">
        <q-btn flat round icon="arrow_back" @click="selectedList = null" class="back-btn q-mb-lg" />
        
        <div class="travel-badge q-mb-xl">
          <q-icon name="travel_explore" size="24px" />
          <span class="text-h5 q-ml-sm">{{ selectedList.travelName }}</span>
          <q-space />
          <q-chip color="positive" text-color="white">
            {{ completedCount(selectedList) }}/{{ selectedList.items?.length || 0 }} Tamamlandı
          </q-chip>
        </div>

        <div class="add-item-section q-mb-xl">
          <div class="add-item-grid">
            <q-input v-model="newItem" outlined dark placeholder="Yeni görev ekle..." dense
              @keyup.enter="addItem" class="modern-input">
              <template v-slot:prepend><q-icon name="task_alt" color="secondary" /></template>
            </q-input>
            <q-btn label="Ekle" icon="add" color="secondary" @click="addItem" :loading="loading" 
              class="add-btn" unelevated />
          </div>
        </div>

        <div class="items-section">
          <div v-if="!selectedList.items || selectedList.items.length === 0" class="empty-small">
            <q-icon name="playlist_add_check" size="60px" />
            <div>Henüz görev yok</div>
          </div>
          
          <transition-group v-else name="item-list" tag="div" class="items-list">
            <div v-for="item in selectedList.items" :key="item.id" 
              class="todo-item" :class="{ completed: item.completed }">
              <q-checkbox :model-value="item.completed" 
                @update:model-value="toggleItem(item)" 
                color="positive" 
                size="md"
                class="item-checkbox" />
              
              <div class="item-content">
                <div class="item-text" :class="{ strike: item.completed }">{{ item.text }}</div>
                <div class="item-date">{{ new Date(item.createdAt).toLocaleString('tr-TR') }}</div>
              </div>
              
              <q-btn flat dense round icon="delete" color="negative" 
                @click="deleteItem(item.id)" class="delete-btn" />
            </div>
          </transition-group>
        </div>

        <div class="progress-summary q-mt-xl q-mb-lg">
          <div class="summary-label">İlerleme</div>
          <q-linear-progress 
            :value="selectedList.items?.length ? (completedCount(selectedList) / selectedList.items.length) : 0"
            color="positive" 
            size="20px" 
            rounded 
            class="progress-bar" />
        </div>

        <q-btn label="Listeyi Sil" icon="delete_forever" color="negative" outline @click="deleteList" 
          class="full-width" size="md" />
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
const lists = ref([]);
const selectedList = ref(null);
const travelName = ref('');
const newItem = ref('');
const loading = ref(false);

watch(() => props.modelValue, (val) => { show.value = val; if (val) loadLists(); });
watch(show, (val) => emit('update:modelValue', val));

const completedCount = (list) => (list.items || []).filter(i => i.completed).length;

const loadLists = async () => {
  try {
    const res = await axios.get('/api/todos');
    lists.value = res.data.lists || [];
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Listeler yüklenemedi' });
  }
};

const createList = async () => {
  if (!travelName.value) {
    $q.notify({ type: 'warning', message: 'Seyahat adı gerekli' });
    return;
  }
  loading.value = true;
  try {
    await axios.post('/api/todos', { travelName: travelName.value });
    travelName.value = '';
    $q.notify({ type: 'positive', message: 'Liste oluşturuldu' });
    loadLists();
  } catch (e) {
    $q.notify({ type: 'negative', message: e.response?.data?.error || 'Hata oluştu' });
  } finally {
    loading.value = false;
  }
};

const selectList = (list) => { selectedList.value = list; };

const addItem = async () => {
  if (!newItem.value) return;
  loading.value = true;
  try {
    const res = await axios.post(`/api/todos/${selectedList.value.id}/items`, { text: newItem.value });
    selectedList.value = res.data.list;
    newItem.value = '';
    loadLists();
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Madde eklenemedi' });
  } finally {
    loading.value = false;
  }
};

const toggleItem = async (item) => {
  try {
    const res = await axios.patch(`/api/todos/${selectedList.value.id}/items/${item.id}/toggle`);
    selectedList.value = res.data.list;
    loadLists();
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Güncellenemedi' });
  }
};

const deleteItem = async (itemId) => {
  try {
    const res = await axios.delete(`/api/todos/${selectedList.value.id}/items/${itemId}`);
    selectedList.value = res.data.list;
    loadLists();
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Silinemedi' });
  }
};

const deleteList = async () => {
  $q.dialog({ title: 'Emin misin?', message: 'Liste kalıcı silinecek', cancel: true, dark: true }).onOk(async () => {
    try {
      await axios.delete(`/api/todos/${selectedList.value.id}`);
      selectedList.value = null;
      loadLists();
      $q.notify({ type: 'positive', message: 'Liste silindi' });
    } catch (e) {
      $q.notify({ type: 'negative', message: 'Silinemedi' });
    }
  });
};
</script>

<style scoped>
.todo-dialog-ultra {
  background: linear-gradient(135deg, rgba(30,30,46,0.95), rgba(24,24,37,0.98));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.1);
}
.todo-header {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
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
.modern-btn {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  font-weight: 600;
  transition: all 0.3s;
}
.modern-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(17,153,142,0.4); }
.separator {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  height: 2px;
}
.empty-state { text-align: center; padding: 60px 20px; opacity: 0.6; }
.todo-grid { display: grid; gap: 16px; }
.todo-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  transition: all 0.3s;
  cursor: pointer;
}
.todo-card:hover {
  background: rgba(255,255,255,0.06);
  border-color: rgba(17,153,142,0.5);
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.3);
}
.card-header { display: flex; justify-content: space-between; align-items: center; }
.name { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
.count { font-size: 14px; color: #9E9E9E; }
.progress-circle { font-weight: 600; }
.progress-text { font-size: 12px; font-weight: 600; }
.back-btn { background: rgba(255,255,255,0.05); }
.back-btn:hover { background: rgba(255,255,255,0.1); }
.travel-badge {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  background: linear-gradient(135deg, rgba(17,153,142,0.2), rgba(56,239,125,0.2));
  border-radius: 16px;
  border: 1px solid rgba(17,153,142,0.3);
}
.add-item-section {
  .add-item-grid {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 12px;
  }
  .add-btn {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  }
}
.items-section {
  min-height: 300px;
  max-height: 500px;
  overflow-y: auto;
}
.items-section::-webkit-scrollbar { width: 6px; }
.items-section::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
.items-list { display: flex; flex-direction: column; gap: 12px; }
.todo-item {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s;
}
.todo-item:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.15); }
.todo-item.completed {
  opacity: 0.6;
  background: rgba(76,175,80,0.1);
  border-color: rgba(76,175,80,0.3);
}
.item-content { flex: 1; }
.item-text {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
  transition: all 0.3s;
}
.item-text.strike {
  text-decoration: line-through;
  color: #9E9E9E;
}
.item-date { font-size: 12px; color: #9E9E9E; }
.delete-btn { opacity: 0; transition: opacity 0.2s; }
.todo-item:hover .delete-btn { opacity: 1; }
.progress-summary {
  .summary-label {
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
    color: #BDBDBD;
  }
  .progress-bar {
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }
}
.empty-small { text-align: center; padding: 40px; opacity: 0.5; color: #9E9E9E; }
.item-list-enter-active, .item-list-leave-active { transition: all 0.4s ease; }
.item-list-enter-from { opacity: 0; transform: translateX(-30px); }
.item-list-leave-to { opacity: 0; transform: translateX(30px); }
</style>
