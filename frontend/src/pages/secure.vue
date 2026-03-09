<template>
  <q-page class="q-pa-xl bg-travel text-white">
    <!-- Hero Section -->
    <div class="column items-center text-center q-mb-xl hero-section">
      <div class="hero-icon-wrapper q-mb-lg">
        <q-icon name="admin_panel_settings" size="100px" class="text-negative glow-effect" />
      </div>
      <h1 class="hero-title travel-gradient animated-title">SUPERADMIN PANELİ</h1>
      <div class="hero-subtitle subtitle-text">
        <q-icon name="security" size="22px" class="q-mr-sm text-negative" />
        <span class="travel-gradient">Güvenli Erişim Bölgesi</span>
      </div>
    </div>

    <!-- Login Section (if not logged in) -->
    <div v-if="!isAdminLoggedIn" class="row justify-center">
      <div class="col-12 col-md-6 col-lg-4">
        <q-card class="auth-modal glass-effect-enhanced" dark>
          <q-card-section class="q-pa-xl">
            <div class="text-center q-mb-lg">
              <q-icon name="lock" size="64px" class="text-negative glow-effect" />
              <h2 class="text-h4 text-weight-bold travel-gradient q-mt-md q-mb-xs">SuperAdmin Girişi</h2>
              <p class="text-grey-4">Yönetici paneline erişmek için giriş yapın</p>
            </div>

            <q-input
              v-model="adminUsername"
              outlined
              dark
              label="Kullanıcı Adı"
              class="q-mb-md custom-input-enhanced"
              :rules="[val => !!val || 'Kullanıcı adı gereklidir']"
            >
              <template v-slot:prepend>
                <q-icon name="person" color="negative" />
              </template>
            </q-input>

            <q-input
              v-model="adminPassword"
              outlined
              dark
              label="Şifre"
              :type="showPassword ? 'text' : 'password'"
              class="q-mb-lg custom-input-enhanced"
              :rules="[val => !!val || 'Şifre gereklidir']"
              @keyup.enter="handleAdminLogin"
            >
              <template v-slot:prepend>
                <q-icon name="lock" color="negative" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <q-btn
              label="Giriş Yap"
              color="negative"
              icon-right="arrow_forward"
              :loading="authLoading"
              @click="handleAdminLogin"
              class="full-width action-button-enhanced"
              size="lg"
              unelevated
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Admin Dashboard (if logged in) -->
    <div v-else>
      <!-- Header Actions -->
      <div class="row justify-between items-center q-mb-xl">
        <div>
          <q-chip color="negative" text-color="white" icon="admin_panel_settings" class="user-chip">
            Hoş geldin, {{ adminName }}!
          </q-chip>
        </div>
        <div>
          <q-btn 
            label="Yenile" 
            color="primary" 
            @click="loadUsers"
            icon="refresh"
            class="q-mr-md"
            outline
            unelevated
          />
          <q-btn 
            label="Çıkış" 
            color="grey-7" 
            @click="adminLogout"
            icon="logout"
            outline
            unelevated
          />
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row q-col-gutter-md q-mb-xl">
        <div class="col-12 col-md-4">
          <q-card class="stat-card glass-effect-enhanced" dark>
            <q-card-section>
              <div class="row items-center">
                <q-icon name="people" size="48px" class="text-primary q-mr-md" />
                <div>
                  <div class="text-h3 text-weight-bold">{{ users.length }}</div>
                  <div class="text-grey-4">Toplam Kullanıcı</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card class="stat-card glass-effect-enhanced" dark>
            <q-card-section>
              <div class="row items-center">
                <q-icon name="verified_user" size="48px" class="text-positive q-mr-md" />
                <div>
                  <div class="text-h3 text-weight-bold">{{ activeUsers }}</div>
                  <div class="text-grey-4">Aktif Kullanıcı</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card class="stat-card glass-effect-enhanced" dark>
            <q-card-section>
              <div class="row items-center">
                <q-icon name="schedule" size="48px" class="text-accent q-mr-md" />
                <div>
                  <div class="text-h3 text-weight-bold">{{ recentUsers }}</div>
                  <div class="text-grey-4">Son 7 Gün</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Users Table -->
      <q-card class="glass-effect-enhanced" dark>
        <q-card-section>
          <div class="text-h5 text-weight-bold q-mb-md">
            <q-icon name="people" size="28px" class="q-mr-sm" />
            Kayıtlı Kullanıcılar
          </div>

          <!-- Loading State -->
          <div v-if="loadingUsers" class="text-center q-pa-xl">
            <q-spinner-orbit color="primary" size="64px" />
            <div class="text-h6 q-mt-md">Kullanıcılar yükleniyor...</div>
          </div>

          <!-- Users Table -->
          <q-table
            v-else
            :rows="users"
            :columns="columns"
            row-key="id"
            dark
            flat
            :rows-per-page-options="[10, 25, 50, 100]"
            class="users-table"
          >
            <template v-slot:body-cell-name="props">
              <q-td :props="props">
                <div class="row items-center">
                  <q-avatar color="primary" text-color="white" size="32px" class="q-mr-sm">
                    {{ props.row.name.charAt(0).toUpperCase() }}
                  </q-avatar>
                  <span class="text-weight-medium">{{ props.row.name }}</span>
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-email="props">
              <q-td :props="props">
                <q-chip color="grey-8" text-color="white" dense>
                  <q-icon name="email" size="16px" class="q-mr-xs" />
                  {{ props.row.email }}
                </q-chip>
              </q-td>
            </template>

            <template v-slot:body-cell-password="props">
              <q-td :props="props">
                <div class="row items-center q-gutter-xs">
                  <q-chip color="grey-9" text-color="white" dense class="password-chip">
                    <q-icon name="lock" size="14px" class="q-mr-xs" />
                    {{ showPasswords[props.row.id] ? props.row.password : '••••••••••' }}
                  </q-chip>
                  <q-btn
                    flat
                    round
                    dense
                    size="sm"
                    :icon="showPasswords[props.row.id] ? 'visibility_off' : 'visibility'"
                    @click="togglePasswordVisibility(props.row.id)"
                    color="grey-5"
                  >
                    <q-tooltip>{{ showPasswords[props.row.id] ? 'Gizle' : 'Göster' }}</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-createdAt="props">
              <q-td :props="props">
                <div>
                  <div class="text-weight-medium">{{ formatDate(props.row.createdAt) }}</div>
                  <div class="text-caption text-grey-5">{{ formatTime(props.row.createdAt) }}</div>
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn
                  flat
                  round
                  dense
                  color="primary"
                  icon="visibility"
                  @click="viewUserDetails(props.row)"
                  class="q-mr-xs"
                >
                  <q-tooltip>Detayları Görüntüle</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="accent"
                  icon="edit"
                  @click="openChangePassword(props.row)"
                >
                  <q-tooltip>Şifre Değiştir</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <!-- User Details Dialog -->
    <q-dialog v-model="userDetailsDialog">
      <q-card class="glass-effect-enhanced" dark style="min-width: 500px">
        <q-card-section class="q-pa-xl">
          <div class="text-h5 text-weight-bold travel-gradient q-mb-md">
            <q-icon name="person" size="32px" class="q-mr-sm" />
            Kullanıcı Detayları
          </div>

          <q-separator dark class="q-mb-lg" />

          <div v-if="selectedUser" class="user-details">
            <div class="detail-row q-mb-md">
              <div class="detail-label">Ad Soyad:</div>
              <div class="detail-value">{{ selectedUser.name }}</div>
            </div>
            <div class="detail-row q-mb-md">
              <div class="detail-label">Email:</div>
              <div class="detail-value">{{ selectedUser.email }}</div>
            </div>
            <div class="detail-row q-mb-md">
              <div class="detail-label">Kullanıcı ID:</div>
              <div class="detail-value text-grey-5">{{ selectedUser.id }}</div>
            </div>
            <div class="detail-row q-mb-md">
              <div class="detail-label">Kayıt Tarihi:</div>
              <div class="detail-value">{{ formatDate(selectedUser.createdAt) }} - {{ formatTime(selectedUser.createdAt) }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Son Güncelleme:</div>
              <div class="detail-value">{{ formatDate(selectedUser.updatedAt) }} - {{ formatTime(selectedUser.updatedAt) }}</div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn label="Kapat" flat color="grey-5" @click="userDetailsDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Change Password Dialog -->
    <q-dialog v-model="changePasswordDialog">
      <q-card class="glass-effect-enhanced" dark style="min-width: 450px">
        <q-card-section class="q-pa-xl">
          <div class="text-h5 text-weight-bold travel-gradient q-mb-md">
            <q-icon name="lock_reset" size="32px" class="q-mr-sm" />
            Şifre Değiştir
          </div>

          <q-separator dark class="q-mb-lg" />

          <div v-if="selectedUserForPassword" class="q-mb-lg">
            <div class="text-subtitle1 text-grey-4 q-mb-xs">Kullanıcı:</div>
            <div class="text-h6 text-weight-medium">{{ selectedUserForPassword.name }}</div>
            <div class="text-caption text-grey-5">{{ selectedUserForPassword.email }}</div>
          </div>

          <q-input
            v-model="newPassword"
            outlined
            dark
            label="Yeni Şifre (min 6 karakter)"
            :type="showNewPassword ? 'text' : 'password'"
            class="q-mb-md custom-input-enhanced"
            :rules="[val => !!val || 'Şifre gereklidir', val => val.length >= 6 || 'En az 6 karakter olmalı']"
            @keyup.enter="handleChangePassword"
          >
            <template v-slot:prepend>
              <q-icon name="lock" color="accent" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="showNewPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showNewPassword = !showNewPassword"
              />
            </template>
          </q-input>

          <q-input
            v-model="confirmPassword"
            outlined
            dark
            label="Şifre Tekrar"
            :type="showNewPassword ? 'text' : 'password'"
            class="q-mb-lg custom-input-enhanced"
            :rules="[val => !!val || 'Şifre tekrarı gereklidir', val => val === newPassword || 'Şifreler eşleşmiyor']"
            @keyup.enter="handleChangePassword"
          >
            <template v-slot:prepend>
              <q-icon name="lock" color="accent" />
            </template>
          </q-input>

          <q-btn
            label="Şifreyi Güncelle"
            color="accent"
            icon-right="check"
            :loading="passwordLoading"
            @click="handleChangePassword"
            class="full-width action-button-enhanced"
            size="lg"
            unelevated
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn label="İptal" flat color="grey-5" @click="closeChangePassword" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';

const $q = useQuasar();

// Admin auth state
const isAdminLoggedIn = ref(false);
const adminName = ref('');
const adminToken = ref('');
const adminUsername = ref('');
const adminPassword = ref('');
const showPassword = ref(false);
const authLoading = ref(false);

// Users data
const users = ref([]);
const loadingUsers = ref(false);
const selectedUser = ref(null);
const userDetailsDialog = ref(false);

// Change password state
const changePasswordDialog = ref(false);
const selectedUserForPassword = ref(null);
const newPassword = ref('');
const confirmPassword = ref('');
const showNewPassword = ref(false);
const passwordLoading = ref(false);

// Table columns
const columns = [
  { name: 'name', label: 'Ad Soyad', field: 'name', align: 'left', sortable: true },
  { name: 'email', label: 'Email', field: 'email', align: 'left', sortable: true },
  { name: 'password', label: 'Şifre (Hash)', field: 'password', align: 'left', sortable: false },
  { name: 'createdAt', label: 'Kayıt Tarihi', field: 'createdAt', align: 'left', sortable: true },
  { name: 'actions', label: 'İşlemler', field: 'actions', align: 'center' }
];

// Password visibility state
const showPasswords = ref({});

// Computed stats
const activeUsers = computed(() => users.value.length);
const recentUsers = computed(() => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return users.value.filter(user => new Date(user.createdAt) >= sevenDaysAgo).length;
});

// Check if admin is already logged in
onMounted(() => {
  const token = localStorage.getItem('adminToken');
  const username = localStorage.getItem('adminUsername');
  if (token && username) {
    adminToken.value = token;
    adminName.value = username;
    isAdminLoggedIn.value = true;
    loadUsers();
  }
});

// Admin login
async function handleAdminLogin() {
  if (!adminUsername.value || !adminPassword.value) {
    $q.notify({
      type: 'negative',
      message: 'Lütfen kullanıcı adı ve şifre girin',
      position: 'top'
    });
    return;
  }

  authLoading.value = true;
  try {
    const response = await axios.post('http://localhost:3001/api/admin/login', {
      username: adminUsername.value,
      password: adminPassword.value
    });

    adminToken.value = response.data.token;
    adminName.value = response.data.admin.username;
    isAdminLoggedIn.value = true;

    // Save to localStorage
    localStorage.setItem('adminToken', response.data.token);
    localStorage.setItem('adminUsername', response.data.admin.username);

    $q.notify({
      type: 'positive',
      message: 'Giriş başarılı! Hoş geldiniz.',
      position: 'top',
      icon: 'check_circle'
    });

    // Load users
    await loadUsers();
  } catch (error) {
    console.error('Admin login error:', error);
    $q.notify({
      type: 'negative',
      message: error.response?.data?.error || 'Giriş başarısız',
      position: 'top'
    });
  } finally {
    authLoading.value = false;
  }
}

// Load users
async function loadUsers() {
  loadingUsers.value = true;
  try {
    const response = await axios.get('http://localhost:3001/api/admin/users', {
      headers: {
        Authorization: `Bearer ${adminToken.value}`
      }
    });

    users.value = response.data.users;
    
    $q.notify({
      type: 'positive',
      message: `${users.value.length} kullanıcı yüklendi`,
      position: 'top',
      icon: 'check_circle'
    });
  } catch (error) {
    console.error('Load users error:', error);
    $q.notify({
      type: 'negative',
      message: error.response?.data?.error || 'Kullanıcılar yüklenemedi',
      position: 'top'
    });

    // If unauthorized, logout
    if (error.response?.status === 401 || error.response?.status === 403) {
      adminLogout();
    }
  } finally {
    loadingUsers.value = false;
  }
}

// Admin logout
function adminLogout() {
  isAdminLoggedIn.value = false;
  adminToken.value = '';
  adminName.value = '';
  adminUsername.value = '';
  adminPassword.value = '';
  users.value = [];
  
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUsername');

  $q.notify({
    type: 'info',
    message: 'Çıkış yapıldı',
    position: 'top',
    icon: 'logout'
  });
}

// View user details
function viewUserDetails(user) {
  selectedUser.value = user;
  userDetailsDialog.value = true;
}

// Format date
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Format time
function formatTime(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Toggle password visibility in table
function togglePasswordVisibility(userId) {
  showPasswords.value[userId] = !showPasswords.value[userId];
}

// Open change password dialog
function openChangePassword(user) {
  selectedUserForPassword.value = user;
  newPassword.value = '';
  confirmPassword.value = '';
  showNewPassword.value = false;
  changePasswordDialog.value = true;
}

// Close change password dialog
function closeChangePassword() {
  changePasswordDialog.value = false;
  selectedUserForPassword.value = null;
  newPassword.value = '';
  confirmPassword.value = '';
}

// Handle change password
async function handleChangePassword() {
  if (!newPassword.value || newPassword.value.length < 6) {
    $q.notify({
      type: 'negative',
      message: 'Yeni şifre en az 6 karakter olmalıdır',
      position: 'top'
    });
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    $q.notify({
      type: 'negative',
      message: 'Şifreler eşleşmiyor',
      position: 'top'
    });
    return;
  }

  passwordLoading.value = true;
  try {
    await axios.patch(
      `http://localhost:3001/api/admin/users/${selectedUserForPassword.value.id}/password`,
      { newPassword: newPassword.value },
      {
        headers: {
          Authorization: `Bearer ${adminToken.value}`
        }
      }
    );

    $q.notify({
      type: 'positive',
      message: `${selectedUserForPassword.value.name} kullanıcısının şifresi başarıyla güncellendi`,
      position: 'top',
      icon: 'check_circle'
    });

    closeChangePassword();
    await loadUsers(); // Reload users to get updated password hash
  } catch (error) {
    console.error('Change password error:', error);
    $q.notify({
      type: 'negative',
      message: error.response?.data?.error || 'Şifre güncellenemedi',
      position: 'top'
    });
  } finally {
    passwordLoading.value = false;
  }
}
</script>

<style scoped>
.bg-travel {
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  min-height: 100vh;
}

.hero-section {
  margin-top: 2rem;
}

.hero-icon-wrapper {
  position: relative;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.glow-effect {
  filter: drop-shadow(0 0 20px currentColor);
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 900;
  letter-spacing: 2px;
  margin: 0;
  text-shadow: 0 0 30px rgba(255, 255, 255, 0.5);
}

.travel-gradient {
  background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.glass-effect-enhanced {
  background: rgba(255, 255, 255, 0.05) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

.auth-modal {
  border-radius: 24px;
}

.custom-input-enhanced {
  border-radius: 12px;
}

.action-button-enhanced {
  border-radius: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  transition: all 0.3s ease;
}

.action-button-enhanced:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.user-chip {
  font-size: 1rem;
  padding: 8px 16px;
}

.stat-card {
  border-radius: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.users-table {
  border-radius: 16px;
}

.user-details {
  font-size: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-label {
  font-weight: 600;
  color: #b0b0b0;
}

.detail-value {
  font-weight: 500;
  text-align: right;
}

.password-chip {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .password-chip {
    max-width: 150px;
  }
}
</style>
