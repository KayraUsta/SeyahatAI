<template>
<q-page class="q-pa-xl bg-travel text-white">

<!-- Hero Section -->
<div class="column items-center text-center q-mb-xxl hero-section">
  <div class="hero-icon-wrapper q-mb-lg">
    <div class="floating-icons">
      <q-icon name="flight" size="100px" class="text-primary glow-effect rotating-icon" />
      <q-icon name="luggage" size="40px" class="floating-icon-1 text-accent" />
      <q-icon name="explore" size="35px" class="floating-icon-2 text-secondary" />
      <q-icon name="map" size="30px" class="floating-icon-3 text-info" />
    </div>
  </div>
  <h1 class="hero-title travel-gradient animated-title">YOLA ÇIK, YOL AÇIK</h1>
  <div class="hero-subtitle subtitle-text">
    <q-icon name="auto_awesome" size="22px" class="q-mr-sm text-accent" />
    <span class="travel-gradient">AI SEYAHAT PLANLAYICI</span>
  </div>
  <div class="feature-badges q-mt-lg">
    <q-badge class="feature-badge" color="primary" outline>
      <q-icon name="auto_awesome" size="18px" class="q-mr-xs" />
      Akıllı Planlama
    </q-badge>
    <q-badge class="feature-badge" color="accent" outline>
      <q-icon name="schedule" size="18px" class="q-mr-xs" />
      Hızlı Sonuç
    </q-badge>
    <q-badge class="feature-badge" color="secondary" outline>
      <q-icon name="verified" size="18px" class="q-mr-xs" />
      Güvenilir
    </q-badge>
  </div>

  <!-- Giriş / Kayıt Butonları -->
  <div v-if="!isLoggedIn" class="auth-buttons-wrapper q-mt-lg">
    <q-btn 
      label="Giriş Yap" 
      color="primary" 
      @click="openLogin"
      icon="login"
      class="auth-btn"
      unelevated
    />
    <q-btn 
      label="Kayıt Ol" 
      color="accent" 
      @click="openRegister"
      icon="person_add"
      class="auth-btn"
      unelevated
    />
  </div>
  <div v-else class="user-info-wrapper q-mt-lg">
    <q-chip color="primary" text-color="white" icon="account_circle" class="user-chip">
      Hoş geldin, {{ userName }}!
    </q-chip>
    <q-btn 
      label="Planlarım" 
      color="accent" 
      @click="showMyPlans"
      icon="bookmark"
      class="auth-btn"
      outline
      unelevated
    />
    <q-btn 
      label="Çıkış" 
      color="grey-7" 
      @click="logout"
      icon="logout"
      class="auth-btn"
      outline
      unelevated
    />
  </div>

</div>

 

    <!-- Search Section -->
    <div class="row justify-center q-mb-xl">
      <div class="col-12 col-md-10 col-lg-8">
        <q-card class="search-card q-pa-xl glass-effect-enhanced" dark>
          <q-card-section class="q-pa-none">
            <div class="search-header q-mb-md">
              <q-icon name="travel_explore" size="32px" class="text-accent q-mr-sm" />
              <span class="text-h6 text-weight-bold">Seyahat Planını Olustur</span>
            </div>
            
            <q-input
              v-model="queryText"
              outlined
              dark
              label="Hayalindeki seyahat neresi?"
              placeholder="-rn: Tokyo'da 5 günlük macera, Paris'te romantik bir haftasonu, Bali'de yoga tatili..."
              class="q-mb-lg custom-input-enhanced"
              :disable="isLoading"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="accent" class="pulse-icon" />
               </template>
              <template v-slot:append>
                <q-icon name="explore" color="secondary" />
              </template>
            </q-input>

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-8">
                <q-btn
                  label="SEYAHAT PLANI OLUŞTUR"
                  color="accent"
                  icon-right="flight_takeoff"
                  :loading="isLoading"
                  @click="getTravelPlan"
                  class="full-width action-button-enhanced"
                  size="lg"
                  :disable="!queryText.trim()"
                  unelevated
                >
                  <template v-slot:loading>
                    <q-spinner-orbit class="on-left" color="white" size="24px" />
                    Planınız Hazırlanıyor...
                  </template>
                </q-btn>
              </div>
              <div class="col-12 col-md-4">
                <q-btn
                  label="Kararsız Kaldım"
                  color="primary"
                  outline
                  icon="help_outline"
                  @click="openIndecisive"
                  class="full-width"
                  size="lg"
                  unelevated
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Result Section -->
    <transition
      enter-active-class="animated zoomIn"
      leave-active-class="animated zoomOut"
      mode="out-in"
      duration="300"
    >
      <div v-if="responseText" class="row justify-center q-col-gutter-lg">
        <div class="col-12 col-md-8 col-lg-7">
          <q-card class="result-card q-pa-xl glass-effect-enhanced" dark>
            <q-card-section class="q-pa-none">
              <div class="result-header q-mb-lg">
                <div class="row items-center q-mb-md">
                  <div class="result-icon-wrapper q-mr-md">
                    <q-icon name="travel_explore" color="accent" size="48px" class="glow-effect" />
                  </div>
                  <div>
                    <div class="text-h4 text-weight-bold travel-gradient">️ SEYAHAT PLANIN HAZIR!</div>
                    <div class="text-subtitle1 text-grey-4">Harika bir yolculuk seni bekliyor</div>
                  </div>
                </div>
                
                <div class="action-buttons-wrapper">
                  <q-btn 
                    label="Yeni Plan" 
                    color="grey-7" 
                    outline 
                    @click="clearResults"
                    icon="add_circle_outline"
                    class="action-btn-modern"
                    unelevated
                  />
                  <q-btn 
                    label="Paylaş" 
                    color="primary" 
                    @click="sharePlan"
                    icon="share"
                    class="action-btn-modern"
                    unelevated
                  />
                  <q-btn 
                    label="Kaydet" 
                    color="accent" 
                    icon="bookmark"
                    class="action-btn-modern"
                    @click="saveTravelPlan"
                    unelevated
                  />
                </div>
              </div>

              <q-separator color="accent" class="q-mb-xl separator-glow" />

              <div class="travel-content q-pa-md scroll-design-enhanced">
                <div v-html="formattedResponse" class="text-body1 line-height-2 content-text-enhanced"></div>
              </div>
            </q-card-section>
          </q-card>
        </div>
        
        <!-- Weather Widget -->
        <div class="col-12 col-md-4 col-lg-3">
          <WeatherWidget :city="extractedCity" :auto-load="true" ref="weatherWidget" />
          
          <!-- Currency Widget -->
          <div class="q-mt-md">
            <CurrencyWidget />
          </div>
        </div>
      </div>
    </transition>

   
    <!-- Loading Dialog -->
    <q-dialog v-model="isLoading" persistent seamless>
      <q-card class="loading-card glass-effect-enhanced" dark>
        <q-card-section class="column items-center q-pa-xl">
          <div class="plane-container-enhanced q-mb-lg">
            <q-icon name="flight" size="90px" class="text-accent flying-plane-enhanced" />
            <q-icon name="cloud" size="40px" class="cloud-1 text-grey-6" />
            <q-icon name="cloud" size="35px" class="cloud-2 text-grey-7" />
            <q-icon name="cloud" size="30px" class="cloud-3 text-grey-6" />
          </div>
          <div class="text-h4 text-weight-bold travel-gradient q-mb-md">️ Seyahat Planı Hazırlanıyor</div>
          <div class="text-h6 text-grey-3 text-center q-mb-md">
            AI, sizin için özel seyahat rotanızı çiziyor...
          </div>
          <div class="loading-steps text-center q-mb-lg">
            <div class="text-caption text-grey-4">🔍 Destinasyon analiz ediliyor</div>
            <div class="text-caption text-grey-4"> Rotalar belirleniyor</div>
            <div class="text-caption text-grey-4"> Öneriler hazırlanıyor</div>
          </div>
          <q-linear-progress 
            dark 
            rounded 
            size="12px" 
            color="accent" 
            class="q-mt-md full-width progress-glow"
            indeterminate 
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Budget Dialog -->
    <BudgetDialog v-model="budgetDialog" />

    <!-- Todo Dialog -->
    <TodoDialog v-model="todoDialog" />

    <!-- Plan Summary Dialog -->
    <PlanSummaryDialog v-model="planSummaryDialog" @create-plan="createNewPlan" />

    <!-- Login Dialog -->
    <q-dialog v-model="loginDialog">
      <q-card class="auth-modal login-modal glass-effect-enhanced" dark style="min-width: 400px">
        <q-card-section class="q-pa-xl">
          <div class="text-center q-mb-lg">
            <q-icon name="login" size="64px" class="text-primary glow-effect" />
            <h2 class="text-h4 text-weight-bold travel-gradient q-mt-md q-mb-xs">Giriş Yap</h2>
            <p class="text-grey-4">Seyahat planlarına erişmek için giriş yapın</p>
          </div>

          <q-input
            v-model="loginEmail"
            outlined
            dark
            label="Email"
            type="email"
            class="q-mb-md custom-input-enhanced"
            :rules="[val => !!val || 'Email gereklidir']"
          >
            <template v-slot:prepend>
              <q-icon name="email" color="primary" />
            </template>
          </q-input>

          <q-input
            v-model="loginPassword"
            outlined
            dark
            label="Şifre"
            :type="showLoginPassword ? 'text' : 'password'"
            class="q-mb-lg custom-input-enhanced"
            :rules="[val => !!val || 'Şifre gereklidir']"
            @keyup.enter="handleLogin"
          >
            <template v-slot:prepend>
              <q-icon name="lock" color="primary" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="showLoginPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showLoginPassword = !showLoginPassword"
              />
            </template>
          </q-input>

          <q-btn
            label="Giriş Yap"
            color="primary"
            icon-right="arrow_forward"
            :loading="authLoading"
            @click="handleLogin"
            class="full-width action-button-enhanced q-mb-md"
            size="lg"
            unelevated
          />

          <div class="text-center">
            <q-btn
              label="Şifremi Unuttum"
              flat
              color="grey-5"
              @click="openForgotPassword"
              class="forgot-password-btn"
              size="sm"
            />
          </div>
        </q-card-section>

        <q-card-actions class="q-pa-md q-gutter-sm">
       
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="registerDialog">
      <q-card class="auth-modal register-modal glass-effect-enhanced" dark style="min-width: 400px">
        <q-card-section class="q-pa-xl">
          <div class="text-center q-mb-lg">
            <q-icon name="person_add" size="64px" class="text-accent glow-effect" />
            <h2 class="text-h4 text-weight-bold travel-gradient q-mt-md q-mb-xs">Kayıt Ol</h2>
            <p class="text-grey-4">Seyahat planlarını kaydetmek için üye ol</p>
          </div>

          <q-input
            v-model="registerName"
            outlined
            dark
            label="Ad Soyad"
            class="q-mb-md custom-input-enhanced"
            :rules="[val => !!val || 'İsim gereklidir']"
          >
            <template v-slot:prepend>
              <q-icon name="person" color="accent" />
            </template>
          </q-input>

          <q-input
            v-model="registerEmail"
            outlined
            dark
            label="Email"
            type="email"
            class="q-mb-md custom-input-enhanced"
            :rules="[val => !!val || 'Email gereklidir']"
          >
            <template v-slot:prepend>
              <q-icon name="email" color="accent" />
            </template>
          </q-input>

          <q-input
            v-model="registerPassword"
            outlined
            dark
            label="Şifre (min 6 karakter)"
            :type="showRegisterPassword ? 'text' : 'password'"
            class="q-mb-lg custom-input-enhanced"
            :rules="[val => !!val || 'Şifre gereklidir', val => val.length >= 6 || 'En az 6 karakter olmalı']"
            @keyup.enter="handleRegister"
          >
            <template v-slot:prepend>
              <q-icon name="lock" color="accent" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="showRegisterPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showRegisterPassword = !showRegisterPassword"
              />
            </template>
          </q-input>

          <q-btn
            label="Kayıt Ol"
            color="accent"
            icon-right="arrow_forward"
            :loading="authLoading"
            @click="handleRegister"
            class="full-width action-button-enhanced q-mb-md"
            size="lg"
            unelevated
          />

          <div class="text-center">
            <q-btn
              label="Zaten hesabın var mı? Giriş Yap"
              flat
              color="primary"
              @click="openLogin"
              class="switch-auth-btn"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn label="Kapat" flat color="grey-5" @click="registerDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Forgot Password Dialog -->
    <q-dialog v-model="forgotPasswordDialog">
      <q-card class="auth-modal glass-effect-enhanced" dark style="min-width: 450px">
        <q-card-section class="q-pa-xl">
          <div class="text-center q-mb-lg">
            <q-icon name="lock_reset" size="64px" class="text-warning glow-effect" />
            <h2 class="text-h4 text-weight-bold travel-gradient q-mt-md q-mb-xs">Şifremi Unuttum</h2>
            <p class="text-grey-4">{{ forgotPasswordStep === 1 ? 'Email adresinizi girin' : forgotPasswordStep === 2 ? 'Doğrulama kodunu girin' : 'Yeni şifrenizi belirleyin' }}</p>
          </div>

          <!-- Step 1: Email -->
          <div v-if="forgotPasswordStep === 1">
            <q-input
              v-model="forgotEmail"
              outlined
              dark
              label="Email"
              type="email"
              class="q-mb-lg custom-input-enhanced"
              :rules="[val => !!val || 'Email gereklidir']"
              @keyup.enter="sendResetCode"
            >
              <template v-slot:prepend>
                <q-icon name="email" color="warning" />
              </template>
            </q-input>

            <q-btn
              label="Kod Gönder"
              color="warning"
              icon-right="send"
              :loading="forgotPasswordLoading"
              @click="sendResetCode"
              class="full-width action-button-enhanced"
              size="lg"
              unelevated
            />
          </div>

          <!-- Step 2: Verify Code -->
          <div v-if="forgotPasswordStep === 2">
            <q-banner class="bg-info text-white q-mb-md" rounded>
              <template v-slot:avatar>
                <q-icon name="info" color="white" />
              </template>
              Email adresinize 6 haneli doğrulama kodu gönderildi. Kod 15 dakika geçerlidir.
              <div v-if="devResetCode" class="q-mt-sm text-weight-bold">
                <q-icon name="code" /> Geliştirme Kodu: {{ devResetCode }}
              </div>
            </q-banner>

            
            <q-input
              v-model="resetCode"
              outlined
              dark
              label="Doğrulama Kodu (6 haneli)"
              type="text"
              maxlength="6"
              class="q-mb-lg custom-input-enhanced"
              :rules="[val => !!val || 'Kod gereklidir', val => val.length === 6 || '6 haneli kod girin']"
              @keyup.enter="verifyResetCode"
            >
              <template v-slot:prepend>
                <q-icon name="pin" color="warning" />
              </template>
            </q-input>

            <div class="row q-gutter-sm">
              <q-btn
                label="Geri"
                color="grey-7"
                outline
                @click="forgotPasswordStep = 1"
                class="col"
                unelevated
              />
              <q-btn
                label="Doğrula"
                color="warning"
                icon-right="check"
                :loading="forgotPasswordLoading"
                @click="verifyResetCode"
                class="col action-button-enhanced"
                unelevated
              />
            </div>
          </div>

          <!-- Step 3: New Password -->
          <div v-if="forgotPasswordStep === 3">
            <q-input
              v-model="newPasswordReset"
              outlined
              dark
              label="Yeni Şifre (min 6 karakter)"
              :type="showNewPasswordReset ? 'text' : 'password'"
              class="q-mb-md custom-input-enhanced"
              :rules="[val => !!val || 'Şifre gereklidir', val => val.length >= 6 || 'En az 6 karakter olmalı']"
            >
              <template v-slot:prepend>
                <q-icon name="lock" color="warning" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="showNewPasswordReset ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showNewPasswordReset = !showNewPasswordReset"
                />
              </template>
            </q-input>

            <q-input
              v-model="confirmPasswordReset"
              outlined
              dark
              label="Şifre Tekrar"
              :type="showNewPasswordReset ? 'text' : 'password'"
              class="q-mb-lg custom-input-enhanced"
              :rules="[val => !!val || 'Şifre tekrarı gereklidir', val => val === newPasswordReset || 'Şifreler eşleşmiyor']"
              @keyup.enter="resetPassword"
            >
              <template v-slot:prepend>
                <q-icon name="lock" color="warning" />
              </template>
            </q-input>

            <q-btn
              label="Şifreyi Değiştir"
              color="warning"
              icon-right="check_circle"
              :loading="forgotPasswordLoading"
              @click="resetPassword"
              class="full-width action-button-enhanced"
              size="lg"
              unelevated
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn label="İptal" flat color="grey-5" @click="closeForgotPassword" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- My Plans Dialog - İyileştirilmiş -->
    <q-dialog v-model="myPlansDialog" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="bg-travel" dark>
        <q-bar class="plans-header-enhanced">
          <q-icon name="bookmark" size="28px" class="glow-effect" />
          <div class="text-h5 text-weight-bold q-ml-sm">️ Seyahat Planlarım</div>
          <q-space />
          <q-chip :label="`${savedPlans.length} Plan`" color="accent" text-color="white" icon="list" />
          <q-btn dense flat icon="close" @click="myPlansDialog = false" size="md" />
        </q-bar>

        <q-card-section class="q-pa-xl">
          <!-- Dialog içi aksiyonlar (merkezde, modern) -->
          <div class="plans-actions row q-gutter-md q-mb-lg justify-center items-center">
            <q-btn 
              size="md"
              class="neo-btn neo-info"
              icon="map"
              label="Türkiye Haritam"
              @click="openTurkeyMap"
              unelevated
            />
            <q-btn 
              size="md"
              class="neo-btn neo-primary"
              icon="analytics"
              label="Plan Özeti"
              @click="openPlanSummary"
              unelevated
            />
            <q-btn 
              size="md"
              class="neo-btn neo-accent"
              icon="account_balance_wallet"
              label="Bütçe"
              @click="openBudgetDialog"
              unelevated
            />
            <q-btn 
              size="md"
              class="neo-btn neo-secondary"
              icon="checklist"
              label="Yapılacaklar"
              @click="openTodoDialog"
              unelevated
            />
          </div>

          <!-- Loading State -->
          <div v-if="loadingPlans" class="loading-state-enhanced">
            <div class="plane-animation-wrapper">
              <q-icon name="flight" size="80px" class="text-accent flying-plane-enhanced" />
              <q-icon name="cloud" size="40px" class="cloud-float-1 text-grey-6" />
              <q-icon name="cloud" size="35px" class="cloud-float-2 text-grey-7" />
            </div>
            <div class="text-h5 text-weight-bold q-mt-xl travel-gradient">Planlarınız yükleniyor...</div>
            <q-linear-progress indeterminate color="accent" class="q-mt-md progress-glow" style="width: 300px; margin: 0 auto;" />
          </div>

          <!-- Empty State -->
          <div v-else-if="savedPlans.length === 0" class="empty-state-enhanced">
            <div class="empty-icon-container">
              <q-icon name="travel_explore" size="150px" class="text-grey-6 float-animation" />
              <q-icon name="flight_takeoff" size="60px" class="text-accent small-float-animation" />
            </div>
            <div class="text-h4 text-weight-bold q-mt-xl travel-gradient">Henüz Plan Yok</div>
            <div class="text-h6 text-grey-4 q-mt-md">İlk seyahat planını oluştur ve maceraya başla!</div>
            <q-btn
              label="Plan Oluştur"
              color="accent"
              icon="add_circle"
              size="lg"
              class="q-mt-xl action-button-enhanced"
              @click="myPlansDialog = false"
              unelevated
            />
          </div>

          <!-- Plans Grid -->
          <div v-else class="row q-col-gutter-lg">
            <div
              v-for="(plan, index) in savedPlans"
              :key="plan.id"
              class="col-12 col-md-6 col-lg-4 plan-card-wrapper"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <q-card class="plan-card-modern" dark>
                <!-- Favorite Badge -->
                <div v-if="plan.isFavorite" class="favorite-star-badge">
                  <q-icon name="star" size="20px" color="yellow" />
                </div>

                <q-card-section class="plan-card-top">
                  <div class="row items-start justify-between">
                    <div class="col-10">
                      <div class="plan-title-modern">
                        ️ {{ plan.title }}
                      </div>
                      <div class="plan-date-modern">
                        <q-icon name="schedule" size="14px" />
                        {{ formatDate(plan.createdAt) }}
                      </div>
                    </div>
                    <q-btn
                      :icon="plan.isFavorite ? 'favorite' : 'favorite_border'"
                      :color="plan.isFavorite ? 'red' : 'grey-5'"
                      flat
                      round
                      dense
                      @click="toggleFavorite(plan.id)"
                      class="favorite-btn-modern"
                    >
                      <q-tooltip>{{ plan.isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle' }}</q-tooltip>
                    </q-btn>
                  </div>
                </q-card-section>

                <q-separator dark />

                <q-card-section class="plan-card-middle">
                  <div class="plan-query-modern">
                    <q-icon name="location_on" size="16px" class="q-mr-xs text-accent" />
                    {{ plan.query }}
                  </div>
                </q-card-section>

                <q-separator dark />

                <q-card-actions class="plan-card-bottom">
                  <q-btn
                    flat
                    color="primary"
                    icon="visibility"
                    label="Görüntüle"
                    @click="viewPlan(plan)"
                    class="plan-action-btn"
                  />
                  <q-space />
                  <q-btn
                    flat
                    color="negative"
                    icon="delete"
                    @click="deletePlan(plan.id)"
                    class="plan-action-btn"
                  >
                    <q-tooltip>Planı Sil</q-tooltip>
                  </q-btn>
                </q-card-actions>

                <!-- Hover Glow -->
                <div class="card-glow-overlay"></div>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Türkiye Haritam Dialog -->
    <q-dialog v-model="turkeyMapDialog" maximized transition-show="fade" transition-hide="fade">
      <q-card class="turkey-map-card" dark>
        <q-bar class="turkey-map-header">
          <q-icon name="map" size="28px" class="text-cyan" />
          <div class="text-h6 text-weight-bold q-ml-sm">Türkiye Haritam</div>
          <q-space />
          <q-btn dense flat icon="refresh" class="q-mr-sm" @click="resetTurkeyMap" />
          <q-btn dense flat icon="close" @click="turkeyMapDialog = false" />
        </q-bar>
        
        <q-card-section class="turkey-map-body q-pa-lg">
          <div class="map-info-banner q-mb-md">
            <q-icon name="touch_app" size="24px" class="q-mr-sm" />
            <span>İllere tıklayarak ziyaret ettiğiniz yerleri işaretleyin!</span>
          </div>
          
          <!-- D3.js Harita Container -->
          <div id="turkey-map-d3" ref="turkeyMapRef" class="turkey-map-d3-container"></div>
          
          <div class="map-stats q-mt-lg">
            <div class="stat-card">
              <q-icon name="location_city" size="32px" class="text-cyan" />
              <div class="stat-value">{{ visitedCityCount }}</div>
              <div class="stat-label">Ziyaret Edilen İl</div>
            </div>
            <div class="stat-card">
              <q-icon name="flag" size="32px" class="text-green" />
              <div class="stat-value">81</div>
              <div class="stat-label">Toplam İl</div>
            </div>
            <div class="stat-card">
              <q-icon name="explore" size="32px" class="text-orange" />
              <div class="stat-value">%{{ visitedPercentage }}</div>
              <div class="stat-label">Keşif Oranı</div>
            </div>
          </div>
          
          <!-- Progress Bar -->
          <div class="map-progress q-mt-md">
            <q-linear-progress 
              :value="visitedPercentage / 100" 
              size="12px" 
              color="cyan" 
              track-color="grey-9"
              rounded
            />
            <div class="progress-label">{{ visitedCityCount }} / 81 il ziyaret edildi</div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- View Plan Dialog -->
    <q-dialog v-model="viewPlanDialog">
      <q-card class="glass-effect-enhanced" dark style="min-width: 600px; max-width: 900px">
        <q-card-section class="q-pa-xl">
          <div class="text-h4 text-weight-bold travel-gradient q-mb-md">
            {{ selectedPlan?.title }}
          </div>
          <div class="text-caption text-grey-4 q-mb-lg">
            {{ formatDate(selectedPlan?.createdAt) }}
          </div>
          <q-separator class="q-mb-lg" />
          <div class="travel-content scroll-design-enhanced" style="max-height: 60vh">
            <div v-html="formatPlanContent(selectedPlan?.planContent)" class="text-body1 line-height-2 content-text-enhanced"></div>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn label="Kapat" flat color="grey-5" @click="viewPlanDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Kararsız Kaldım Dialog (Sabit Planlar) -->
    <q-dialog v-model="indecisiveDialog">
      <q-card class="glass-effect-enhanced indecisive-dialog-card" dark style="min-width: 720px; max-width: 1100px">
        <q-bar>
          <q-icon name="psycholo" />
          <div class="text-subtitle1 q-ml-sm">Kararsız Kaldım</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup @click="indecisiveDialog = false" />
        </q-bar>

        <q-separator dark />

        <q-card-section class="q-gutter-lg">
          <div class="text-subtitle1 text-grey-3 q-mb-sm">Bölge Seç</div>
          <div class="row items-center q-gutter-sm q-mb-md">
            <q-btn size="lg" :color="predefActive === 'TR' ? 'accent' : 'grey-7'" :outline="predefActive !== 'TR'" label="Türkiye" @click="predefActive = 'TR'" unelevated class="region-select-btn" />
            <q-btn size="lg" :color="predefActive === 'INTL' ? 'accent' : 'grey-7'" :outline="predefActive !== 'INTL'" label="Yurt Dışı" @click="predefActive = 'INTL'" unelevated class="region-select-btn" />
            <q-space />
            <q-btn color="secondary" icon="casino" label="Şans Çarkı" @click="openSpinDialog" :disable="isSpinning" unelevated class="spin-wheel-btn" />
          </div>

          <div v-show="predefActive === 'TR'">
            <div class="text-h6 q-mb-sm">🇹🇷 Türkiye İçin En Çok Tercih Edilen 5 Seyahat Planı</div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6" v-for="(plan, i) in predefPlans.tr" :key="'tr-'+i">
                <q-card class="modern-plan-card" flat>
                  <div class="card-gradient-border"></div>
                  <q-card-section class="card-content q-pb-sm">
                    <div class="plan-header">
                      <div class="plan-icon">
                        <q-icon name="explore" size="32px" />
                      </div>
                      <div class="plan-title">{{ plan.title }}</div>
                    </div>
                    <div class="plan-info">
                      <div class="info-item">
                        <q-icon name="route" size="18px" />
                        <span>{{ plan.route }}</span>
                      </div>
                      <div class="info-item">
                        <q-icon name="event" size="18px" />
                        <span>{{ plan.duration }}</span>
                      </div>
                      <div class="info-item">
                        <q-icon name="sell" size="18px" />
                        <span>{{ plan.themes }}</span>
                      </div>
                      <div class="info-item highlight">
                        <q-icon name="thumb_up" size="18px" />
                        <span>{{ plan.advantage }}</span>
                      </div>
                    </div>
                  </q-card-section>
                  <q-card-actions class="card-actions">
                    <q-btn color="primary" label="Detayları Gör" icon-right="arrow_forward" 
                      @click="showPredefDetail(plan)" class="full-width detail-btn-modern" unelevated />
                  </q-card-actions>
                  <div class="card-shine"></div>
                </q-card>
              </div>
            </div>
          </div>

          <div v-show="predefActive === 'INTL'">
            <div class="text-h6 q-mb-sm">🌍 Yurt Dışı İçin En Çok Tercih Edilen 5 Seyahat Planı</div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6" v-for="(plan, i) in predefPlans.intl" :key="'intl-'+i">
                <q-card class="modern-plan-card" flat>
                  <div class="card-gradient-border"></div>
                  <q-card-section class="card-content q-pb-sm">
                    <div class="plan-header">
                      <div class="plan-icon">
                        <q-icon name="flight_takeoff" size="32px" />
                      </div>
                      <div class="plan-title">{{ plan.title }}</div>
                    </div>
                    <div class="plan-info">
                      <div class="info-item">
                        <q-icon name="route" size="18px" />
                        <span>{{ plan.route }}</span>
                      </div>
                      <div class="info-item">
                        <q-icon name="event" size="18px" />
                        <span>{{ plan.duration }}</span>
                      </div>
                      <div class="info-item">
                        <q-icon name="sell" size="18px" />
                        <span>{{ plan.themes }}</span>
                      </div>
                      <div class="info-item highlight">
                        <q-icon name="thumb_up" size="18px" />
                        <span>{{ plan.advantage }}</span>
                      </div>
                    </div>
                  </q-card-section>
                  <q-card-actions class="card-actions">
                    <q-btn color="primary" label="Detayları Gör" icon-right="arrow_forward" 
                      @click="showPredefDetail(plan)" class="full-width detail-btn-modern" unelevated />
                  </q-card-actions>
                  <div class="card-shine"></div>
                </q-card>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Şans Çarkı Dialog - Modern -->
    <q-dialog v-model="spinDialog" transition-show="scale" transition-hide="scale">
      <q-card class="wheel-dialog-ultra" dark>
        <!-- Animated Header -->
        <div class="wheel-header-ultra">
          <div class="header-glow"></div>
          <div class="header-content">
            <div class="wheel-icon-wrapper">
              <q-icon name="casino" size="36px" class="wheel-icon-spin" />
              <div class="icon-ring"></div>
            </div>
            <div class="header-text">
              <h2 class="wheel-title">Şans Çarkı</h2>
              <p class="wheel-subtitle">Kaderine bir şans ver!</p>
            </div>
          </div>
          <q-btn dense flat round icon="close" v-close-popup :disable="isSpinning" class="close-btn-ultra" />
        </div>
        
        <q-card-section class="wheel-body-ultra">
          <!-- Region Selector - Pill Style -->
          <div class="region-selector-ultra">
            <div class="region-pill-container">
              <button 
                v-for="region in [{id: 'TR', icon: '🇹🇷', label: 'Türkiye'}, {id: 'INTL', icon: '🌍', label: 'Yurt Dışı'}, {id: 'MIX', icon: '🎲', label: 'Karışık'}]"
                :key="region.id"
                :class="['region-pill', { active: spinRegion === region.id }]"
                @click="changeRegion(region.id)"
                :disabled="isSpinning"
              >
                <span class="pill-icon">{{ region.icon }}</span>
                <span class="pill-label">{{ region.label }}</span>
                <span v-if="spinRegion === region.id" class="pill-glow"></span>
              </button>
            </div>
            <div class="region-count">
              <q-icon name="format_list_numbered" size="16px" />
              <span>{{ wheelItems.length }} destinasyon</span>
            </div>
          </div>

          <!-- Wheel Stage -->
          <div class="wheel-stage">
            <!-- Outer Glow Ring -->
            <div class="wheel-outer-ring" :class="{ spinning: isSpinning }"></div>
            
            <!-- Wheel Container -->
            <div class="wheel-wrapper">
              <canvas ref="wheelCanvas" width="400" height="400" class="wheel-canvas-ultra"></canvas>
              
              <!-- Center Button -->
              <div 
                class="wheel-center-ultra" 
                @click="!isSpinning && spinWheel()" 
                :class="{ disabled: isSpinning || wheelItems.length === 0, spinning: isSpinning }"
              >
                <div class="center-inner">
                  <q-icon v-if="!isSpinning" name="play_arrow" size="40px" />
                  <q-spinner-orbit v-else size="40px" color="white" />
                </div>
                <div class="center-ring"></div>
                <div class="center-pulse" v-if="!isSpinning"></div>
              </div>
              
              <!-- Pointer -->
              <div class="wheel-pointer-ultra">
                <svg viewBox="0 0 40 50" class="pointer-svg">
                  <defs>
                    <linearGradient id="pointerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style="stop-color:#FF6B6B"/>
                      <stop offset="100%" style="stop-color:#EE5A5A"/>
                    </linearGradient>
                    <filter id="pointerShadow">
                      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.5"/>
                    </filter>
                  </defs>
                  <polygon points="20,50 0,0 40,0" fill="url(#pointerGrad)" filter="url(#pointerShadow)"/>
                  <circle cx="20" cy="8" r="4" fill="#fff" opacity="0.8"/>
                </svg>
              </div>
            </div>

            <!-- Decorative Lights -->
            <div class="wheel-lights">
              <span v-for="i in 16" :key="i" class="light-dot" :style="{ '--i': i }"></span>
            </div>
          </div>

          <!-- Result Section -->
          <transition name="result-fade">
            <div v-if="selectedResultTitle" class="result-section-ultra">
              <div class="confetti-burst" v-if="showConfetti">
                <span v-for="i in 30" :key="i" class="confetti-piece" :style="confettiStyle(i)"></span>
              </div>
              <div class="result-card">
                <div class="result-icon">
                  <q-icon name="emoji_events" size="48px" />
                </div>
                <div class="result-content">
                  <span class="result-label">Tebrikler! Destinasyonun:</span>
                  <h3 class="result-title">{{ selectedResultTitle }}</h3>
                </div>
                <q-btn 
                  label="Planı İncele" 
                  icon="arrow_forward" 
                  color="white" 
                  text-color="primary"
                  @click="viewWheelResult" 
                  class="result-btn"
                  unelevated
                />
              </div>
            </div>
          </transition>

          <!-- Spin Button -->
          <div class="spin-action-ultra">
            <button 
              class="spin-btn-ultra"
              @click="spinWheel"
              :disabled="isSpinning || wheelItems.length === 0"
              :class="{ spinning: isSpinning }"
            >
              <span class="btn-bg"></span>
              <span class="btn-content">
                <q-icon v-if="!isSpinning" name="refresh" size="24px" class="spin-icon" />
                <q-spinner-dots v-else size="24px" />
                <span>{{ isSpinning ? 'Çark Dönüyor...' : 'Çarkı Çevir' }}</span>
              </span>
            </button>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Kararsız Kaldım Detay Dialog -->
    <q-dialog v-model="predefDetailDialog">
      <q-card class="glass-effect-enhanced predef-detail-dialog-card" dark style="min-width: 720px; max-width: 1100px">
        <q-card-section class="q-pa-lg">
          <div class="row items-center justify-between q-mb-md">
            <div>
              <div class="text-h5 text-weight-bold travel-gradient">{{ predefSelectedPlan?.title }}</div>
              <div class="row q-gutter-xs q-mt-sm">
                <q-chip size="md" color="accent" text-color="white" outline icon="event" class="region-chip">{{ predefSelectedPlan?.duration }}</q-chip>
                <q-chip size="md" color="secondary" text-color="white" outline icon="public" class="region-chip">{{ predefSelectedPlan?.region === 'TR' ? 'Türkiye' : 'Yurt Dışı' }}</q-chip>
              </div>
            </div>
            <q-btn dense flat icon="close" v-close-popup />
          </div>

          <q-separator dark class="q-mb-md" />

          <div class="travel-guide-content scroll-design-enhanced" style="max-height: 60vh">
            <div v-if="predefSelectedPlan?.content" v-html="formatPlanContent(predefSelectedPlan.content)" class="text-body1 line-height-2 content-text-enhanced"></div>
            <div v-else class="text-center text-grey-5 q-pa-xl">
              <q-icon name="info" size="48px" />
              <div class="q-mt-md">Bu plan için detaylı içerik hazırlanıyor...</div>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat color="grey-5" label="Kapat" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';
import * as d3 from 'd3';
import BudgetDialog from '../components/BudgetDialog.vue';
import TodoDialog from '../components/TodoDialog.vue';
import PlanSummaryDialog from '../components/PlanSummaryDialog.vue';
import WeatherWidget from '../components/WeatherWidget.vue';
import CurrencyWidget from '../components/CurrencyWidget.vue';

const $q = useQuasar();

// API Base URL - Production veya Development
const isProduction = window.location.hostname !== 'localhost';
axios.defaults.baseURL = isProduction ? 'https://api.yolacikai.com' : 'http://localhost:3001';

const queryText = ref('');
const responseText = ref('');
const isLoading = ref(false);
const weatherWidget = ref(null);

const extractedCity = computed(() => {
  if (!queryText.value) return '';
  const cities = ['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Paris', 'London', 'Tokyo', 'Istanbul'];
  const query = queryText.value.toLowerCase();
  for (const city of cities) {
    if (query.includes(city.toLowerCase())) return city;
  }
  return queryText.value.split(' ')[0] || '';
});

// Auth State
const loginDialog = ref(false);
const registerDialog = ref(false);
const loginEmail = ref('');
const loginPassword = ref('');
const registerName = ref('');
const registerEmail = ref('');
const registerPassword = ref('');
const showLoginPassword = ref(false);
const showRegisterPassword = ref(false);
const authLoading = ref(false);
const token = ref(localStorage.getItem('token') || '');
const userName = ref(localStorage.getItem('userName') || '');
const userId = ref(localStorage.getItem('userId') || '');
const isLoggedIn = computed(() => !!token.value);

// Forgot Password State
const forgotPasswordDialog = ref(false);
const forgotPasswordStep = ref(1); // 1: Email, 2: Code, 3: New Password
const forgotEmail = ref('');
const resetCode = ref('');
const newPasswordReset = ref('');
const confirmPasswordReset = ref('');
const showNewPasswordReset = ref(false);
const forgotPasswordLoading = ref(false);
const devResetCode = ref(''); // For development only

// Budget dialog state
const budgetDialog = ref(false);
const openBudgetDialog = () => {
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
  }
  budgetDialog.value = true;
};

// Todo dialog state
const todoDialog = ref(false);
const openTodoDialog = () => {
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
  }
  todoDialog.value = true;
};

// Plan Summary dialog state
const planSummaryDialog = ref(false);
const openPlanSummary = () => {
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
  }
  planSummaryDialog.value = true;
};

// Türkiye Haritam dialog state
const turkeyMapDialog = ref(false);
const turkeyMapRef = ref(null);
const visitedCities = ref([]);
const visitedCityCount = computed(() => visitedCities.value.length);
const visitedPercentage = computed(() => Math.round((visitedCities.value.length / 81) * 100));

const openTurkeyMap = () => {
  turkeyMapDialog.value = true;
  loadVisitedCities();
  nextTick(() => {
    setTimeout(() => {
      initTurkeyMap();
    }, 100);
  });
};

const loadVisitedCities = () => {
  const stored = localStorage.getItem('selectedCities');
  if (stored) {
    visitedCities.value = JSON.parse(stored);
  }
};

const resetTurkeyMap = () => {
  localStorage.removeItem('selectedCities');
  visitedCities.value = [];
  initTurkeyMap();
};

const initTurkeyMap = async () => {
  const container = document.getElementById('turkey-map-d3');
  if (!container) return;
  
  // Clear previous map
  container.innerHTML = '';
  
  const HOVER_COLOR = '#4dd0e1';
  const MAP_COLOR = '#1e3a5f';
  const STROKE_COLOR = '#0d2137';
  
  try {
    const response = await fetch('/tr-cities.json');
    const data = await response.json();
    
    const width = Math.min(container.clientWidth, 1000);
    const height = width * 0.5;
    
    const projection = d3.geoMercator();
    projection.fitSize([width, height], data);
    const path = d3.geoPath().projection(projection);
    
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
    
    const g = svg.append('g')
      .selectAll('path')
      .data(data.features)
      .join('path')
      .attr('d', path)
      .attr('fill', (d) => {
        if (visitedCities.value.includes(d.properties.name)) {
          d.noFill = true;
          return HOVER_COLOR;
        }
        return MAP_COLOR;
      })
      .attr('stroke', STROKE_COLOR)
      .attr('stroke-width', 0.5)
      .attr('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('fill', HOVER_COLOR);
      })
      .on('mouseout', function(event, d) {
        if (!d.noFill) d3.select(this).attr('fill', MAP_COLOR);
      })
      .on('click', function(event, d) {
        d.noFill = d.noFill || false;
        if (!d.noFill) {
          d3.select(this).attr('fill', HOVER_COLOR);
          if (!visitedCities.value.includes(d.properties.name)) {
            visitedCities.value.push(d.properties.name);
          }
        } else {
          d3.select(this).attr('fill', MAP_COLOR);
          const index = visitedCities.value.indexOf(d.properties.name);
          if (index !== -1) {
            visitedCities.value.splice(index, 1);
          }
        }
        d.noFill = !d.noFill;
        localStorage.setItem('selectedCities', JSON.stringify(visitedCities.value));
      });
    
  } catch (error) {
    console.error('Turkey map error:', error);
  }
};

const createNewPlan = () => {
  planSummaryDialog.value = false;
  myPlansDialog.value = false;
  clearResults();
};

// Plans State
const myPlansDialog = ref(false);
const viewPlanDialog = ref(false);
const savedPlans = ref([]);
// Kararsız Kaldım (Sabit Planlar)
const indecisiveDialog = ref(false);
const predefDetailDialog = ref(false);
const predefSelectedPlan = ref(null);
const predefActive = ref('TR'); // TR | INTL

// Rastgele 5 plan seçimi için shuffle fonksiyonu
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Rastgele seçilmiş planlar (her sayfa yüklendiğinde değişir)
const displayedPlansTR = ref([]);
const displayedPlansINTL = ref([]);

const allPredefPlans = ref({
  tr: [
    {
      title: 'Ege Kıyıları Tatil Planı',
      route: 'İzmir  Çeşme  Kuşadası → Didim → Bodrum',
      duration: '6–8 gün',
      themes: 'Deniz, plaj, gece hayatı, yöresel lezzetler',
      advantage: 'Yaz tatili için popüler, ulaşımı kolay',
      region: 'TR',
      content: `# 🌊 Ege Kıyıları Tatil Planı

## Giriş
Ege'nin turkuaz sularında unutulmaz bir yolculuğa hazır mısınız? İzmir'den başlayıp Bodrum'a uzanan bu rota, deniz, tarih ve eğlenceyi bir araya getiriyor.

## 📍 Günlük Program

### 1. Gün: İzmir - Şehir Keşfi
- **Sabah**: Kordon'da kahvaltı, Saat Kulesi fotoğraf molası
- **Öğle**: Kemeraltı Çarşısı'nda alışveriş ve boyoz tadımı
- **Akşam**: Alsancak'ta meyhane turu, rakı-balık keyfi

### 2. Gün: Çeşme - Plaj ve Rüzgar
- **Sabah**: Ilıca plajında termal su deneyimi
- **Öğle**: Alaçatı'da taş sokaklarda gezinti, rüzgar sörfü izleme
- **Akşam**: Çeşme Marina'da gün batımı, canlı müzik eşliğinde akşam yemeği

### 3. Gün: Kuşadası - Antik Şehir
- **Sabah**: Efes Antik Kenti gezisi (3-4 saat)
- **Öğle**: Şirince köyünde şarap tadımı ve yerel lezzetler
- **Akşam**: Kuşadası Marina'da yürüyüş, Güvercinada manzarası

### 4. Gün: Didim - Apollon Tapınağı
- **Sabah**: Apollon Tapınağı ziyareti
- **Öğle**: Altınkum plajında deniz keyfi
- **Akşam**: Sahil restoranlarında taze balık

### 5-6. Gün: Bodrum - Eğlence Başkenti
- **Gün 5**: Bodrum Kalesi, Sualtı Arkeoloji Müzesi, Gümbet plajı
- **Gün 6**: Tekne turu (Kara Ada, Akvaryum Koyu), gece hayatı

## 🍽️ Mutlaka Tadın
- Boyoz (İzmir)
- Kumru (Çeşme)
- Alaçatı ot kavurması
- Bodrum mandalinası

## 💰 Tahmini Bütçe
- Ekonomik: 8.000-12.000 TL
- Orta: 15.000-20.000 TL
- Lüks: 25.000+ TL

## 🎒 Yanınıza Alın
- Güneş kremi (SPF 50+)
- Deniz ayakkabısı
- Şapka ve güneş gözlüğü
- Hafif yazlık giysiler`
    },
    {
      title: 'Kapadokya & İç Anadolu Planı',
      route: 'Nevşehir  Göreme  Ürgüp  Avanos  Ihlara Vadisi',
      duration: '3-5 gün',
      themes: 'Balon turu, tarihi yerler, doğa yürüyüşleri',
      advantage: 'Dünya çapında ünlü, kısa tatiller için uygun',
      region: 'TR',
      content: `# 🎈 Kapadokya & İç Anadolu Planı

## Giriş
Peri bacaları, yeraltı şehirleri ve gün doğumunda balon turları... Kapadokya, dünyanın en büyüleyici destinasyonlarından biri!

## 📍 Günlük Program

### 1. Gün: Nevşehir - Giriş
- **Sabah**: Kayseri/Nevşehir havalimanına varış
- **Öğle**: Göreme Açık Hava Müzesi (UNESCO Dünya Mirası)
- **Akşam**: Göreme panorama noktasında gün batımı

### 2. Gün: Balon Turu ve Vadiler
- **Sabah**: Sıcak hava balonu turu (05:00-07:00) ⭐
- **Öğle**: Paşabağ (Keşişler Vadisi) ve Devrent Vadisi
- **Akşam**: Avanos'ta çömlekçilik atölyesi ziyareti

### 3. Gün: Yeraltı Şehirleri
- **Sabah**: Derinkuyu veya Kaymaklı Yeraltı Şehri
- **Öğle**: Ihlara Vadisi yürüyüşü (4 km)
- **Akşam**: Selime Katedrali, Nar Gölü manzarası

### 4. Gün: Ürgüp ve Çevre
- **Sabah**: Ürgüp şehir turu, Üç Güzeller
- **Öğle**: Şarap mahzenlerinde tadım
- **Akşam**: ATV safari turu (opsiyonel)

## 🍽️ Yerel Lezzetler
- Testi kebabı
- Mantı (Kayseri usulü)
- Kayısı tatlısı
- Kapadokya şarapları

## 💰 Tahmini Bütçe
- Ekonomik: 6.000-9.000 TL
- Orta: 12.000-18.000 TL (balon dahil)
- Lüks: 25.000+ TL

## 📸 Fotoğraf Noktaları
- Love Valley gün doğumu
- Uçhisar Kalesi panorama
- Göreme peri bacaları
- Balon uçuşu sırasında havadan çekim`
    },
    {
      title: 'Akdeniz Turkuaz Kıyıları Planı',
      route: 'Antalya  Kaş  Kalkan  Fethiye  Ölüdeniz',
      duration: '6-9 gün',
      themes: 'Deniz, tekne turları, doğa aktiviteleri',
      advantage: 'Turkuaz denizler, Likya Yolu yürüyüş rotaları',
      region: 'TR',
      content: `# 🏖️ Akdeniz Turkuaz Kıyıları Planı

## Giriş
Türkiye'nin en turkuaz sularına sahip kıyı şeridi! Kaş'tan Ölüdeniz'e uzanan bu rota, doğa ve deniz tutkunları için cennet.

## 📍 Günlük Program

### 1-2. Gün: Antalya - Şehir ve Plaj
- **Gün 1**: Kaleiçi gezisi, Hadrian Kapısı, Düden Şelalesi
- **Gün 2**: Konyaaltı plajı, Antalya Akvaryum, teleferik turu

### 3-4. Gün: Kaş - Dalış Cenneti
- **Gün 3**: Kaş merkez, Antiphellos Antik Tiyatrosu, marina yürüyüşü
- **Gün 4**: Kekova tekne turu (Batık Şehir), Simena Kalesi

### 5. Gün: Kalkan - Sakin Koy
- **Sabah**: Kaputaş plajı (merdiven iniş)
- **Öğle**: Kalkan'da öğle yemeği, taş sokaklar
- **Akşam**: Marina'da gün batımı

### 6-7. Gün: Fethiye - Ölüdeniz
- **Gün 6**: 12 Adalar tekne turu, Kelebekler Vadisi
- **Gün 7**: Ölüdeniz Lagünü, yamaç paraşütü (opsiyonel)

### 8. Gün: Saklıkent Kanyonu
- **Sabah**: Saklıkent Milli Parkı yürüyüşü
- **Öğle**: Tlos Antik Kenti
- **Akşam**: Fethiye'ye dönüş

## 🤿 Aktiviteler
- Dalış (Kaş'ta 15+ dalış noktası)
- Yamaç paraşütü (Babadağ)
- Kano turu (Saklıkent)
- Tekne turları

## 💰 Tahmini Bütçe
- Ekonomik: 10.000-15.000 TL
- Orta: 18.000-25.000 TL
- Lüks: 35.000+ TL

## 🌊 En İyi Plajlar
- Kaputaş (turkuaz su)
- Ölüdeniz Lagünü
- Kelebekler Vadisi
- Patara (18 km uzunluk)`
    },
    {
      title: 'Karadeniz Yeşil Yol Planı',
      route: 'Trabzon  Rize  Ayder Yaylası  Uzungöl  Artvin',
      duration: '6-7 gün',
      themes: 'Yayla turizmi, doğa, şelaleler, yöresel mutfak',
      advantage: 'Serin iklim, doğa severler için ideal',
      region: 'TR',
      content: `# 🌲 Karadeniz Yeşil Yol Planı

## Giriş
Yemyeşil dağlar, sisli yaylalar ve çağlayan şelaleler... Karadeniz'in eşsiz doğasında huzur dolu bir yolculuk!

## 📍 Günlük Program

### 1. Gün: Trabzon - Tarihi Merkez
- **Sabah**: Sümela Manastırı (erken gidiş önerilir)
- **Öğle**: Uzungöl'de öğle yemeği ve göl kenarı yürüyüşü
- **Akşam**: Trabzon merkez, Atatürk Köşkü

### 2. Gün: Rize - Çay Bahçeleri
- **Sabah**: Rize çay fabrikası ziyareti
- **Öğle**: Fırtına Vadisi, Zilkale
- **Akşam**: Ayder Yaylası'na çıkış

### 3. Gün: Ayder Yaylası
- **Sabah**: Ayder Şelalesi, doğa yürüyüşü
- **Öğle**: Kaplıca banyosu
- **Akşam**: Yayla evlerinde konaklama

### 4. Gün: Artvin - Dağlar Arası
- **Sabah**: Artvin'e geçiş, Karagol-Sahara Milli Parkı
- **Öğle**: Savsat, Karagol gölü
- **Akşam**: Artvin merkez

### 5. Gün: Macahel Vadisi
- **Sabah**: Macahel (Camili) Vadisi trekking
- **Öğle**: Piknik ve doğa fotoğrafları
- **Akşam**: Borçka'da konaklama

## 🍵 Yerel Lezzetler
- Hamsi (her türlü)
- Mıhlama (muğlama)
- Lahana sarması
- Karadeniz pidesi
- Laz böreği

## 💰 Tahmini Bütçe
- Ekonomik: 7.000-10.000 TL
- Orta: 12.000-16.000 TL
- Lüks: 20.000+ TL

## 🌧️ İpucu
- Yağmur yağabilir, yağlık ve yağmurluk alın
- Yaz aylarında bile serin olabilir
- Trekking ayakkabısı şart`
    },
    {
      title: 'Marmara Kültür & Tarih Planı',
      route: 'İstanbul  Bursa  Çanakkale  Edirne  Tekirdağ',
      duration: '5-7 gün',
      themes: 'Osmanlı tarihi, müzeler, gastronomi, şehir keşfi',
      advantage: 'Tarih ve kültür odaklı, şehirler arası kolay ulaşım',
      region: 'TR',
      content: `# 🕌 Marmara Kültür & Tarih Planı

## Giriş
Osmanlı İmparatorluğu'nun izlerini takip edin! İstanbul'dan Edirne'ye uzanan bu rota, tarih ve kültür tutkunları için bir ziyafet.

## 📍 Günlük Program

### 1-2. Gün: İstanbul - İki Kıta
- **Gün 1**: Sultanahmet (Ayasofya, Topkapı, Yerebatan), Boğaz turu
- **Gün 2**: KapalıÇarşı, Galata, Taksim, Istiklal

### 3. Gün: Bursa - Yeşil Şehir
- **Sabah**: Uludağ teleferik
- **Öğle**: Yeşil Türbe, Ulucami
- **Akşam**: İskender kebap (orjinal)

### 4. Gün: Çanakkale - Şehitler Diyarı
- **Sabah**: Gelibolu yarımadası (57. Alay, Şehitler Anıtı)
- **Öğle**: Çanakkale Şehitleri Anıtı
- **Akşam**: Truva Antik Kenti

### 5. Gün: Edirne - Üç Şerefeli
- **Sabah**: Selimiye Camii (UNESCO)
- **Öğle**: Eski Cami, Edirne Sarayı
- **Akşam**: Tava ciğeri ve Edirne peyniri

### 6. Gün: Tekirdağ - Trakya
- **Sabah**: Rakipça bağları, şarap tadımı
- **Öğle**: Tekirdağ köftesi
- **Akşam**: İstanbul'a dönüş

## 🍽️ Mutlaka Tadın
- İskender kebap (Bursa)
- Tava ciğeri (Edirne)
- Tekirdağ köftesi
- Edirne peyniri

## 💰 Tahmini Bütçe
- Ekonomik: 8.000-12.000 TL
- Orta: 15.000-20.000 TL
- Lüks: 28.000+ TL

## 🏛️ Tarih Noktaları
- Ayasofya (537 yılından)
- Topkapı Sarayı
- Selimiye Camii
- Gelibolu Şehitlikleri`
    },
    {
      title: 'Güneydoğu Anadolu Gastronomi Turu',
      route: 'Gaziantep → Şanlıurfa → Mardin → Diyarbakır → Adıyaman',
      duration: '5-7 gün',
      themes: 'Gastronomi, tarih, kültür, antik şehirler',
      advantage: 'Türkiye\'nin en zengin mutfak kültürü, Nemrut Dağı',
      region: 'TR',
      content: `# 🍖 Güneydoğu Anadolu Gastronomi Turu

## Giriş
Türkiye'nin gastronomi başkenti Gaziantep'ten başlayıp, tarihi Mezopotamya topraklarında eşsiz bir lezzet ve kültür yolculuğu!

## 📍 Günlük Program

### 1-2. Gün: Gaziantep - Lezzet Başkenti
- **Gün 1**: Zeugma Mozaik Müzesi, Gaziantep Kalesi, baklavacılar çarşısı
- **Gün 2**: Yemek atölyesi (lahmacun, kebap), bakırcılar çarşısı

### 3. Gün: Şanlıurfa - Peygamberler Şehri
- **Sabah**: Balıklıgöl, Hz. İbrahim Mağarası
- **Öğle**: Gümrük Hanı'nda çiğ köfte
- **Akşam**: Harran antik şehri, konik evler

### 4. Gün: Mardin - Taş Şehir
- **Sabah**: Mardin Kalesi, taş sokaklar
- **Öğle**: Kasımiye Medresesi, Zinciriye Medresesi
- **Akşam**: Mezopotamya manzaralı teras yemeği

### 5. Gün: Diyarbakır - Surlar Şehri
- **Sabah**: Diyarbakır Surları (UNESCO), Ulu Cami
- **Öğle**: Hasan Paşa Hanı, kaburga dolması
- **Akşam**: On Gözlü Köprü, Dicle kenarı

### 6. Gün: Adıyaman - Nemrut
- **Sabah**: Nemrut Dağı gün doğumu turu ⭐
- **Öğle**: Arsemia antik şehri
- **Akşam**: Cendere Köprüsü

## 🍽️ Mutlaka Tadın
- Antep baklavası
- Lahmacun ve kebaplar
- Çiğ köfte (Urfa)
- Kaburga dolması
- Mırra kahvesi

## 💰 Tahmini Bütçe
- Ekonomik: 6.000-9.000 TL
- Orta: 12.000-16.000 TL
- Lüks: 22.000+ TL`
    },
    {
      title: 'Batı Karadeniz Doğa Rotası',
      route: 'Safranbolu → Amasra → Sinop → Kastamonu → Ilgaz',
      duration: '4-6 gün',
      themes: 'Osmanlı mimarisi, sahil kasabaları, doğa',
      advantage: 'Sakin atmosfer, otantik kasabalar, uygun fiyat',
      region: 'TR',
      content: `# 🏘️ Batı Karadeniz Doğa Rotası

## Giriş
UNESCO Dünya Mirası Safranbolu'dan başlayıp, Karadeniz'in sakin koylarında huzur dolu bir yolculuk!

## 📍 Günlük Program

### 1. Gün: Safranbolu - Osmanlı Mirası
- **Sabah**: Eski Çarşı, tarihi konaklar
- **Öğle**: Cinci Hanı, lokum tadımı
- **Akşam**: Hıdırlık Tepesi manzarası

### 2. Gün: Amasra - İki Denizli Şehir
- **Sabah**: Amasra Kalesi, Kemere Köprüsü
- **Öğle**: Küçük Liman'da balık
- **Akşam**: Boztepe'de gün batımı

### 3. Gün: Sinop - Türkiye'nin En Kuzeyi
- **Sabah**: Sinop Cezaevi Müzesi
- **Öğle**: Hamsilos Koyu (fiyort benzeri)
- **Akşam**: İnceburun Feneri (en kuzey nokta)

### 4. Gün: Kastamonu - Tarihi Şehir
- **Sabah**: Kastamonu Kalesi
- **Öğle**: Nasrullah Meydanı, pastırma tadımı
- **Akşam**: Ilgaz Dağı Milli Parkı

## 🍽️ Yerel Lezzetler
- Safran çayı ve lokumu
- Amasra pidesi
- Sinop mantısı
- Kastamonu pastırması

## 💰 Tahmini Bütçe
- Ekonomik: 5.000-7.000 TL
- Orta: 9.000-13.000 TL
- Lüks: 18.000+ TL`
    },
    {
      title: 'Göller Bölgesi & Lavanta Rotası',
      route: 'Isparta → Eğirdir → Sagalassos → Burdur → Salda Gölü',
      duration: '3-5 gün',
      themes: 'Doğa, göller, lavanta tarlaları, antik şehir',
      advantage: 'Türkiye\'nin Maldivleri Salda, lavanta mevsimi',
      region: 'TR',
      content: `# 💜 Göller Bölgesi & Lavanta Rotası

## Giriş
Mor lavanta tarlaları, turkuaz göller ve antik şehirler... Göller Bölgesi'nin büyüleyici güzelliklerini keşfedin!

## 📍 Günlük Program

### 1. Gün: Isparta - Gül ve Lavanta
- **Sabah**: Gül müzesi, gül yağı fabrikası
- **Öğle**: Lavanta tarlaları fotoğraf turu (Haziran-Temmuz)
- **Akşam**: Isparta merkez, yerel lezzetler

### 2. Gün: Eğirdir - Göl Cenneti
- **Sabah**: Eğirdir Gölü tekne turu
- **Öğle**: Yeşilada'da balık yemeği
- **Akşam**: Göl kenarında gün batımı

### 3. Gün: Sagalassos - Antik Şehir
- **Sabah**: Sagalassos Antik Kenti (iyi korunmuş)
- **Öğle**: Ağlasun köyünde öğle yemeği
- **Akşam**: Burdur'a geçiş

### 4. Gün: Salda Gölü - Türkiye'nin Maldivleri
- **Sabah**: Salda Gölü beyaz kumsal
- **Öğle**: Göl kenarında piknik
- **Akşam**: Burdur Gölü flamingo izleme

## 🌸 En İyi Zaman
- Lavanta: Haziran-Temmuz
- Gül: Mayıs-Haziran
- Göller: Yıl boyu güzel

## 💰 Tahmini Bütçe
- Ekonomik: 4.000-6.000 TL
- Orta: 8.000-12.000 TL
- Lüks: 16.000+ TL`
    },
    {
      title: 'Likya Yolu Trekking Planı',
      route: 'Fethiye → Faralya → Kabak → Patara → Kaş',
      duration: '5-8 gün',
      themes: 'Trekking, doğa, antik kalıntılar, kamp',
      advantage: 'Dünyanın en iyi 10 yürüyüş rotasından biri',
      region: 'TR',
      content: `# 🥾 Likya Yolu Trekking Planı

## Giriş
National Geographic tarafından dünyanın en iyi 10 uzun mesafe yürüyüş rotasından biri seçilen Likya Yolu'nda macera!

## 📍 Günlük Program

### 1. Gün: Fethiye - Başlangıç
- **Sabah**: Ölüdeniz'den başlangıç
- **Öğle**: Kelebekler Vadisi'ne iniş
- **Akşam**: Faralya'da konaklama

### 2. Gün: Faralya - Kabak
- **Sabah**: Faralya'dan Kabak'a yürüyüş (3-4 saat)
- **Öğle**: Kabak Koyu'nda deniz molası
- **Akşam**: Kabak'ta kamp veya bungalov

### 3. Gün: Kabak - Sidyma
- **Sabah**: Dağ yürüyüşü
- **Öğle**: Sidyma antik kenti
- **Akşam**: Köy evinde konaklama

### 4. Gün: Letoon - Xanthos
- **Sabah**: Letoon antik kenti (UNESCO)
- **Öğle**: Xanthos harabeleri
- **Akşam**: Patara'ya varış

### 5. Gün: Patara - Kalkan
- **Sabah**: Patara antik kenti ve plajı
- **Öğle**: Kalkan'a yürüyüş
- **Akşam**: Kalkan'da kutlama yemeği

## 🎒 Yanınıza Alın
- Trekking ayakkabısı (su geçirmez)
- 30-40L sırt çantası
- Su matarası (2L+)
- Güneş koruma
- İlk yardım kiti

## 💰 Tahmini Bütçe
- Ekonomik: 5.000-8.000 TL (kamp)
- Orta: 10.000-15.000 TL (pansiyon)
- Lüks: 20.000+ TL (butik otel)`
    },
    {
      title: 'Doğu Anadolu Keşif Rotası',
      route: 'Van → Akdamar → Doğubayazıt → Kars → Ani',
      duration: '5-7 gün',
      themes: 'Tarih, doğa, kültür, fotoğrafçılık',
      advantage: 'Türkiye\'nin en az keşfedilmiş bölgesi, Ani harabeleri',
      region: 'TR',
      content: `# 🏔️ Doğu Anadolu Keşif Rotası

## Giriş
Van Gölü'nün turkuaz sularından Ani'nin hayalet şehrine, Doğu'nun gizemli güzelliklerini keşfedin!

## 📍 Günlük Program

### 1-2. Gün: Van - İnci Şehri
- **Gün 1**: Van Kalesi, Van Kedisi Evi, kahvaltı sokağı
- **Gün 2**: Akdamar Adası ve Kilisesi (tekne turu)

### 3. Gün: Doğubayazıt - Ağrı Dağı
- **Sabah**: İshak Paşa Sarayı
- **Öğle**: Ağrı Dağı manzarası
- **Akşam**: Meteor çukuru

### 4. Gün: Kars - Kafkas Kapısı
- **Sabah**: Kars Kalesi, Fethiye Camii
- **Öğle**: Kars kaşarı ve kazı tadımı
- **Akşam**: Baltık mimarisi sokakları

### 5. Gün: Ani - Hayalet Şehir
- **Tam gün**: Ani Harabeleri (UNESCO) ⭐
- Selçuklu ve Ermeni mimarisi
- 1001 kilise şehri

## 🍽️ Yerel Lezzetler
- Van kahvaltısı (otlu peynir, kaymak)
- Kars kazı
- Kars gravyeri
- Cağ kebabı

## 💰 Tahmini Bütçe
- Ekonomik: 6.000-9.000 TL
- Orta: 12.000-16.000 TL
- Lüks: 22.000+ TL

## 📸 Fotoğraf Noktaları
- Akdamar Kilisesi gün batımı
- İshak Paşa Sarayı panorama
- Ani surları ve stepler`
    }
  ],
  intl: [
    {
      title: 'Avrupa Başkentleri Turu',
      route: 'Paris  Brüksel  Amsterdam  Berlin  Prag',
      duration: '7-10 gün',
      themes: 'Sanat, tarih, kültür, şehir hayatı',
      advantage: 'Ulaşımı kolay, kısa mesafeli şehir geçişleri',
      region: 'INTL',
      content: `# 🇪🇺 Avrupa Başkentleri Turu

## Giriş
Avrupa'nın en ikonik 5 başkentinde sanat, tarih ve kültür dolu bir yolculuğa çıkın!

## 📍 Günlük Program

### 1-2. Gün: Paris - Işıklar Şehri
- **Gün 1**: Eyfel Kulesi, Champs-Élysées, Arc de Triomphe
- **Gün 2**: Louvre Müzesi, Notre-Dame, Seine nehir turu

### 3. Gün: Brüksel - Çikolata Cenneti
- **Sabah**: Grand Place, Manneken Pis
- **Öğle**: Atomium, çikolata müzesi
- **Akşam**: Belga birası tadımı

### 4-5. Gün: Amsterdam - Kanallar Şehri
- **Gün 4**: Anne Frank Evi, Van Gogh Müzesi, kanal turu
- **Gün 5**: Zaanse Schans (yel değirmenleri), bisiklet turu

### 6-7. Gün: Berlin - Tarih ve Sanat
- **Gün 6**: Brandenburg Kapısı, Berlin Duvarı, Checkpoint Charlie
- **Gün 7**: Müzeler Adası, Reichstag, Tiergarten

### 8-9. Gün: Prag - Altın Şehir
- **Gün 8**: Prag Kalesi, Charles Köprüsü, Eski Şehir Meydanı
- **Gün 9**: Astronomik Saat, Vltava nehir gezisi

## 🍽️ Mutlaka Tadın
- Croissant (Paris)
- Waffle & çikolata (Brüksel)
- Stroopwafel (Amsterdam)
- Currywurst (Berlin)
- Trdelnik (Prag)

## 💰 Tahmini Bütçe
- Ekonomik: 25.000-35.000 TL
- Orta: 40.000-55.000 TL
- Lüks: 70.000+ TL

## 🚆 Ulaşım
- Şehirler arası: Tren (Eurail Pass)
- Şehir içi: Metro/tramvay kartları`
    },
    {
      title: 'Balkan Kültür & Doğa Planı',
      route: 'Belgrad  Saraybosna  Mostar  Dubrovnik  Kotor',
      duration: '6-8 gün',
      themes: 'Tarih, doğa, deniz tatili, yöresel yemekler',
      advantage: 'Uygun fiyatlı, vize kolaylığı, yakın destinasyon',
      region: 'INTL',
      content: `# 🏞️ Balkan Kültür & Doğa Planı

## Giriş
Balkanlar'ın gizemli tarihi, muhteşem doğası ve sıcak insanıyla tanışın!

## 📍 Günlük Program

### 1. Gün: Belgrad - Sırbistan
- **Sabah**: Kalemegdan Kalesi, Sava ve Tuna nehirleri manzarası
- **Öğle**: Knez Mihailova Caddesi, Skadarlija (Bohemya mahallesi)
- **Akşam**: Nehir kenarında rakija tadımı

### 2. Gün: Saraybosna - Bosna Hersek
- **Sabah**: Başçarşı, Sebilj Çeşmesi
- **Öğle**: Latin Köprüsü, Bosna mutfağı
- **Akşam**: Tunnel Müzesi (Savaş Tüneli)

### 3. Gün: Mostar - Tarihi Köprü
- **Sabah**: Stari Most (Eski Köprü), köprü atlayıcıları izleme
- **Öğle**: Eski şehir gezisi, bakır el sanatları
- **Akşam**: Neretva nehri kenarında akşam yemeği

### 4-5. Gün: Dubrovnik - Hırvatistan
- **Gün 4**: Eski Şehir surları, Game of Thrones lokasyonları
- **Gün 5**: Lokrum Adası, teleferik ile Srd Dağı

### 6. Gün: Kotor - Karadağ
- **Sabah**: Kotor Körfezi tekne turu
- **Öğle**: Kotor Eski Şehir, sur yürüyüşü (1350 basamak)
- **Akşam**: Perast köyü ziyareti

## 🍽️ Yerel Lezzetler
- Ćevapçiçi (Bosna)
- Burek (her yerde)
- Pljeskavica (Sırp hamburgeri)
- Taze deniz ürünleri (Adriyatik)

## 💰 Tahmini Bütçe
- Ekonomik: 15.000-22.000 TL
- Orta: 25.000-35.000 TL
- Lüks: 45.000+ TL

## 📌 İpuçları
- Vize: Türkiye pasaportu ile çoğu ülkeye vizesiz
- Para birimi: Euro ve yerel para kabul edilir
- Uygun fiyatlı konaklama seçenekleri bol`
    },
    {
      title: 'İskandinav & Kuzey Işıkları Planı',
      route: 'Stockholm  Oslo  Bergen  Tromsø  Reykjavik',
      duration: '8-12 gün',
      themes: 'Kuzey ışıkları, doğa, fiyortlar, modern şehirler',
      advantage: 'Doğa severler için eşsiz deneyim',
      region: 'INTL',
      content: `# ❄️ İskandinav & Kuzey Işıkları Planı

## Giriş
Kuzey Işıkları'nın dansını izleyin, fiyortları keşfedin! İskandinavülkelerinin eşsiz güzelliklerinde unutulmaz bir macera.

## 📍 Günlük Program

### 1-2. Gün: Stockholm - İsveç
- **Gün 1**: Gamla Stan (Eski Şehir), Kraliyet Sarayı
- **Gün 2**: Vasa Müzesi, Skansen Açık Hava Müzesi

### 3-4. Gün: Oslo - Norveç
- **Gün 3**: Vikinggemi Müzesi, Opera Binası
- **Gün 4**: Holmenkollen atlama kulesi, Vigeland Parkı

### 5-6. Gün: Bergen - Fiyortlar Kapısı
- **Gün 5**: Bryggen renkli evler, Floibanen teleferik
- **Gün 6**: Sognefjord fiyort turu (tam gün)

### 7-9. Gün: Tromsø - Kuzey Işıkları
- **Gün 7**: Polaria Akvaryum, Arktik Katedrali
- **Gün 8**: Köpek kizağı safari, aurora izleme turu
- **Gün 9**: Karı motosikleti, kuzey ışıkları fotoğrafı

### 10-12. Gün: Reykjavik - İzlanda
- **Gün 10**: Altın Çember (Gullfoss, Geysir, Thingvellir)
- **Gün 11**: Blue Lagoon termal havuz
- **Gün 12**: Reykjavik şehir turu, Hallgrímskirkja

## 🍽️ Yerel Lezzetler
- Köfte (Köttbullar - İsveç)
- Somon (her yerde)
- Ren geyik eti (Norveç)
- Skyr yoğurdu (İzlanda)

## 💰 Tahmini Bütçe
- Ekonomik: 45.000-60.000 TL
- Orta: 70.000-90.000 TL
- Lüks: 120.000+ TL

## 🌌 Kuzey Işıkları İpuçları
- En iyi dönem: Eylül-Mart
- Karanlık ve açık hava gerekli
- Sabrınızı alın, doğa olayıdır!
- Sıcak tutan giysiler şart`
    },
    {
      title: 'Asya Egzotik Macera Planı',
      route: 'Bangkok  Chiang Mai  Hanoi  Halong Bay  Bali',
      duration: '10-14 gün',
      themes: 'Tropikal plajlar, doğa, kültür, macera',
      advantage: 'Egzotik tatil, uygun maliyetli aktiviteler',
      region: 'INTL',
      content: `# 🌴 Asya Egzotik Macera Planı

## Giriş
Asya'nın en egzotik destinasyonlarında tropikal cennet, tapinaklar ve macera dolu bir yolculuk!

## 📍 Günlük Program

### 1-3. Gün: Bangkok - Tayland
- **Gün 1**: Grand Palace, Wat Pho (Uzanan Buda)
- **Gün 2**: Yüzen pazar, Wat Arun, Khao San Road
- **Gün 3**: Ayutthaya antik şehir turu

### 4-5. Gün: Chiang Mai - Kuzey Tayland
- **Gün 4**: Fil kurtarma merkezi, Doğa yürüyüşü
- **Gün 5**: Doi Suthep tapınağı, gece pazarı

### 6-8. Gün: Hanoi & Halong Bay - Vietnam
- **Gün 6**: Hanoi Eski Mahalle, Hoan Kiem Gölü
- **Gün 7-8**: Halong Bay cruise (2 gece tekne turu)

### 9-12. Gün: Bali - Endonezya
- **Gün 9**: Ubud (Tegalalang pirinç terasları, Maymun Ormanı)
- **Gün 10**: Tanah Lot tapınağı, gün batımı
- **Gün 11**: Nusa Penida ada turu (Kelingking Beach)
- **Gün 12**: Seminyak plajı, spa günü

## 🍜 Mutlaka Tadın
- Pad Thai (Tayland)
- Tom Yum çorbası
- Pho (Vietnam)
- Nasi Goreng (Bali)
- Taze tropikal meyveler

## 💰 Tahmini Bütçe
- Ekonomik: 30.000-40.000 TL
- Orta: 45.000-60.000 TL
- Lüks: 80.000+ TL

## 🏝️ Aktiviteler
- Fil kurtarma merkezi
- Halong Bay cruise
- Dalış (Bali)
- Tapınak turları
- Thai masajı`
    },
    {
      title: 'Amerika Şehir & Doğa Planı',
      route: 'New York  Washington D.C.  Orlando  Miami  Grand Canyon (Las Vegas üzerinden)',
      duration: '10-14 gün',
      themes: 'Şehir hayatı, eğlence parkları, doğa harikaları',
      advantage: 'Hem şehir hem doğa deneyimi bir arada',
      region: 'INTL',
      content: `# 🗽️ Amerika Şehir & Doğa Planı

## Giriş
Amerika'nın ikonik şehirleri ve muhteşem doğa harikalarını bir arada keşedin!

## 📍 Günlük Program

### 1-3. Gün: New York - Uykusuz Şehir
- **Gün 1**: Times Square, Broadway show, Empire State
- **Gün 2**: Özgürlük Heykeli, Wall Street, Brooklyn Köprüsü
- **Gün 3**: Central Park, MoMA, 5th Avenue alışveriş

### 4. Gün: Washington D.C. - Başkent
- **Sabah**: Beyaz Saray, Capitol Binası
- **Öğle**: Smithsonian Müzeleri (Air & Space)
- **Akşam**: Lincoln Memorial, Washington Anıtı

### 5-7. Gün: Orlando - Eğlence Merkezi
- **Gün 5**: Walt Disney World - Magic Kingdom
- **Gün 6**: Universal Studios, Harry Potter World
- **Gün 7**: SeaWorld veya Kennedy Space Center

### 8-9. Gün: Miami - Plaj ve Küba Havasi
- **Gün 8**: South Beach, Art Deco District
- **Gün 9**: Everglades timsah turu, Little Havana

### 10-12. Gün: Las Vegas & Grand Canyon
- **Gün 10**: Las Vegas Strip, Fremont Street
- **Gün 11**: Grand Canyon Güney Kenarı (tam gün tur)
- **Gün 12**: Hoover Barajı, Red Rock Canyon

## 🍔 Mutlaka Tadın
- New York pizza
- Philly cheesesteak
- BBQ kaburga (Güney)
- Cuban sandwich (Miami)
- In-N-Out Burger (Batı)

## 💰 Tahmini Bütçe
- Ekonomik: 50.000-70.000 TL
- Orta: 80.000-110.000 TL
- Lüks: 150.000+ TL

## ✈️ Ulaşım
- Şehirler arası: İç hat uçuşlar
- Araba kiralama (Las Vegas-Grand Canyon)
- Metro/Uber (şehir içi)

## 🎫 Tema Park İpuçları
- Fast Pass alın (kuyruk atlamak için)
- Erken gidin (açılışta kalabalık az)
- Su ve atıştırmalık yanınızda olsun`
    },
    {
      title: 'Japonya Kültür & Modernite Planı',
      route: 'Tokyo → Kyoto → Osaka → Nara → Hiroshima',
      duration: '10-14 gün',
      themes: 'Gelenek, modernite, gastronomi, tapınaklar',
      advantage: 'Doğu ile Batı\'nın mükemmel sentezi',
      region: 'INTL',
      content: `# 🇯🇵 Japonya Kültür & Modernite Planı

## Giriş
Antik tapınaklardan neon ışıklı sokaklara, Japonya'nın büyüleyici dünyasına hoş geldiniz!

## 📍 Günlük Program

### 1-4. Gün: Tokyo - Mega Şehir
- **Gün 1**: Shibuya geçidi, Harajuku, Meiji Tapınağı
- **Gün 2**: Senso-ji Tapınağı, Akihabara (elektronik/anime)
- **Gün 3**: Tsukiji balık pazarı, Tokyo Tower, Ginza
- **Gün 4**: DisneySea veya teamLab Borderless

### 5-7. Gün: Kyoto - Antik Başkent
- **Gün 5**: Fushimi Inari (1000 torii), Gion (geyşa bölgesi)
- **Gün 6**: Kinkaku-ji (Altın Tapınak), Arashiyama bambu ormanı
- **Gün 7**: Nara geyikleri, Todai-ji tapınağı

### 8-9. Gün: Osaka - Yemek Cenneti
- **Gün 8**: Osaka Kalesi, Dotonbori sokak yemekleri
- **Gün 9**: Universal Studios Japan

### 10-11. Gün: Hiroshima - Barış Şehri
- **Gün 10**: Barış Anıt Parkı, Atom Bombası Kubbesi
- **Gün 11**: Miyajima Adası, yüzen torii kapısı

## 🍜 Mutlaka Tadın
- Ramen (her bölgenin farklı stili)
- Sushi (Tsukiji'de taze)
- Takoyaki (Osaka)
- Okonomiyaki
- Matcha tatlıları

## 💰 Tahmini Bütçe
- Ekonomik: 40.000-55.000 TL
- Orta: 65.000-85.000 TL
- Lüks: 120.000+ TL

## 🚄 Ulaşım
- JR Pass (7/14/21 gün) - şehirler arası tren
- IC Card (Suica/Pasmo) - şehir içi`
    },
    {
      title: 'Akdeniz Adaları Turu',
      route: 'Santorini → Mykonos → Girit → Rodos → Kıbrıs',
      duration: '8-12 gün',
      themes: 'Ada tatili, plaj, tarih, romantizm',
      advantage: 'Yunan adalarının büyüsü, yakın destinasyon',
      region: 'INTL',
      content: `# 🏝️ Akdeniz Adaları Turu

## Giriş
Beyaz badanalı evler, mavi kubbeler ve turkuaz denizler... Ege ve Akdeniz'in en güzel adalarında rüya gibi bir tatil!

## 📍 Günlük Program

### 1-2. Gün: Santorini - Romantik Ada
- **Gün 1**: Oia köyü, mavi kubbeli kiliseler, gün batımı
- **Gün 2**: Fira merkez, volkanik plajlar, şarap tadımı

### 3-4. Gün: Mykonos - Parti Adası
- **Gün 3**: Küçük Venedik, yel değirmenleri, Matoyianni sokağı
- **Gün 4**: Paradise Beach, Delos Adası antik kalıntıları

### 5-6. Gün: Girit - Büyük Ada
- **Gün 5**: Knossos Sarayı (Minos uygarlığı), Heraklion
- **Gün 6**: Chania eski liman, Samaria Kanyonu (opsiyonel)

### 7-8. Gün: Rodos - Şövalyeler Adası
- **Gün 7**: Rodos Eski Şehir (UNESCO), Şövalyeler Caddesi
- **Gün 8**: Lindos Akropolü, Anthony Quinn Koyu

### 9-10. Gün: Kıbrıs - Afrodit'in Adası
- **Gün 9**: Paphos (UNESCO), Afrodit'in Kayası
- **Gün 10**: Lefkoşa, Girne Kalesi

## 🍷 Yerel Lezzetler
- Yunan salatası
- Moussaka
- Souvlaki
- Hellim peyniri (Kıbrıs)
- Ouzo ve Raki

## 💰 Tahmini Bütçe
- Ekonomik: 25.000-35.000 TL
- Orta: 40.000-55.000 TL
- Lüks: 75.000+ TL`
    },
    {
      title: 'Güney Amerika Macera Planı',
      route: 'Rio de Janeiro → Buenos Aires → Patagonya → Machu Picchu',
      duration: '12-16 gün',
      themes: 'Macera, doğa, kültür, dans',
      advantage: 'Dünyanın en etkileyici doğa harikaları',
      region: 'INTL',
      content: `# 🌎 Güney Amerika Macera Planı

## Giriş
Samba ritimlerinden And Dağları'nın zirvelerine, Güney Amerika'nın büyüleyici kıtasında unutulmaz bir macera!

## 📍 Günlük Program

### 1-3. Gün: Rio de Janeiro - Brezilya
- **Gün 1**: Corcovado (Kurtarıcı İsa heykeli), Copacabana
- **Gün 2**: Şeker Dağı teleferik, Ipanema plajı
- **Gün 3**: Santa Teresa mahallesi, samba gecesi

### 4-6. Gün: Buenos Aires - Arjantin
- **Gün 4**: La Boca renkli evler, San Telmo pazarı
- **Gün 5**: Recoleta Mezarlığı, Puerto Madero
- **Gün 6**: Tango show, Arjantin bifteği

### 7-9. Gün: Patagonya - Doğanın Gücü
- **Gün 7**: El Calafate'ye uçuş
- **Gün 8**: Perito Moreno Buzulu ⭐
- **Gün 9**: Los Glaciares Milli Parkı trekking

### 10-13. Gün: Peru - İnka Mirası
- **Gün 10**: Lima şehir turu, ceviche tadımı
- **Gün 11**: Cusco'ya uçuş, aklimatizasyon
- **Gün 12**: Kutsal Vadi turu
- **Gün 13**: Machu Picchu ⭐⭐

## 🍖 Mutlaka Tadın
- Churrasco (Brezilya)
- Asado (Arjantin biftek)
- Ceviche (Peru)
- Empanadas
- Pisco Sour

## 💰 Tahmini Bütçe
- Ekonomik: 50.000-70.000 TL
- Orta: 80.000-110.000 TL
- Lüks: 150.000+ TL`
    },
    {
      title: 'Orta Doğu Tarih & Kültür Planı',
      route: 'Dubai → Abu Dhabi → Ürdün (Petra) → İsrail (Kudüs)',
      duration: '8-10 gün',
      themes: 'Lüks, tarih, din, çöl macerası',
      advantage: 'Modern lüks ve antik tarih bir arada',
      region: 'INTL',
      content: `# 🕌 Orta Doğu Tarih & Kültür Planı

## Giriş
Gökdelenlerin gölgesinden antik Petra'nın pembe kayalarına, Orta Doğu'nun kontrastlarını keşfedin!

## 📍 Günlük Program

### 1-2. Gün: Dubai - Lüks Şehir
- **Gün 1**: Burj Khalifa, Dubai Mall, Dubai Fountain
- **Gün 2**: Palmiye Adası, Atlantis, çöl safarisi

### 3. Gün: Abu Dhabi - Başkent
- **Sabah**: Şeyh Zayed Camii (muhteşem mimari)
- **Öğle**: Louvre Abu Dhabi
- **Akşam**: Corniche sahil yürüyüşü

### 4-5. Gün: Ürdün - Petra
- **Gün 4**: Amman Kalesi, Roma Tiyatrosu
- **Gün 5**: Petra Antik Kenti (Hazine binası) ⭐

### 6. Gün: Wadi Rum - Çöl Kampı
- **Tam gün**: Wadi Rum çöl turu, jeep safari
- **Gece**: Çöl kampında yıldızlar altında konaklama

### 7-8. Gün: Kudüs - Kutsal Şehir
- **Gün 7**: Eski Şehir, Ağlama Duvarı, Kutsal Kabir Kilisesi
- **Gün 8**: Zeytin Dağı, Yad Vashem, Mahane Yehuda pazarı

## 🍽️ Yerel Lezzetler
- Hummus ve falafel
- Mansaf (Ürdün)
- Shawarma
- Knafeh tatlısı
- Arap kahvesi

## 💰 Tahmini Bütçe
- Ekonomik: 35.000-50.000 TL
- Orta: 60.000-80.000 TL
- Lüks: 120.000+ TL`
    },
    {
      title: 'Afrika Safari & Doğa Planı',
      route: 'Cape Town → Kruger Park → Victoria Falls → Zanzibar',
      duration: '10-14 gün',
      themes: 'Safari, vahşi yaşam, doğa, plaj',
      advantage: 'Big Five safari deneyimi, eşsiz doğa',
      region: 'INTL',
      content: `# 🦁 Afrika Safari & Doğa Planı

## Giriş
Afrika'nın vahşi doğasında Big Five'ı izleyin, Victoria Şelalesi'nin gücüne tanık olun!

## 📍 Günlük Program

### 1-3. Gün: Cape Town - Güney Afrika
- **Gün 1**: Table Mountain teleferik, V&A Waterfront
- **Gün 2**: Cape Point, Ümit Burnu, penguen kolonisi
- **Gün 3**: Şarap bölgeleri (Stellenbosch, Franschhoek)

### 4-6. Gün: Kruger Milli Parkı - Safari
- **Gün 4**: Johannesburg'a uçuş, Kruger'a transfer
- **Gün 5**: Sabah ve akşam safari (Big Five arayışı) ⭐
- **Gün 6**: Tam gün safari, bush walk

### 7-8. Gün: Victoria Falls - Zimbabwe/Zambia
- **Gün 7**: Victoria Şelalesi (Dünyanın en büyük perdesi)
- **Gün 8**: Zambezi nehir turu, bungee jumping (opsiyonel)

### 9-11. Gün: Zanzibar - Tanzanya
- **Gün 9**: Stone Town UNESCO, baharat turu
- **Gün 10**: Nungwi plajı, şnorkeling
- **Gün 11**: Dolphin turu, gün batımı cruise

## 🦓 Big Five
- Aslan
- Leopar
- Fil
- Gergedan
- Buffalo

## 💰 Tahmini Bütçe
- Ekonomik: 55.000-75.000 TL
- Orta: 90.000-120.000 TL
- Lüks: 180.000+ TL

## 💉 Sağlık
- Sarı humma aşısı gerekli
- Sıtma profilaksisi önerilir
- Seyahat sigortası şart`
    }
  ]
});

// Rastgele planları yenile
const refreshDisplayedPlans = () => {
  displayedPlansTR.value = shuffleArray(allPredefPlans.value.tr).slice(0, 5);
  displayedPlansINTL.value = shuffleArray(allPredefPlans.value.intl).slice(0, 5);
};

// Sayfa yüklendiğinde rastgele planları seç
refreshDisplayedPlans();

// Görüntülenecek planlar (template'de kullanılacak)
const predefPlans = computed(() => ({
  tr: displayedPlansTR.value,
  intl: displayedPlansINTL.value
}));

const openIndecisive = () => {
  predefActive.value = 'TR';
  refreshDisplayedPlans(); // Her açılışta yeni rastgele planlar
  indecisiveDialog.value = true;
};

const showPredefDetail = (plan) => {
  predefSelectedPlan.value = plan;
  predefDetailDialog.value = true;
};

const buildQueryFromPredefPlan = (plan) => {
  return `${plan.title} için ${plan.duration} süreli detaylı bir seyahat planı oluştur. Rota: ${plan.route}. Temalar: ${plan.themes}. Avantaj: ${plan.advantage}. Günlük rota, ulaşım ve konaklama önerileri içersin.`;
};

const buildPredefContent = (plan) => {
  return `## ${plan.title}\n\n**Rota:** ${plan.route}\n\n**Süre:** ${plan.duration}\n\n**Temalar:** ${plan.themes}\n\n**Avantaj:** ${plan.advantage}`;
};

const selectPredefPlan = async (plan) => {
  indecisiveDialog.value = false;
  predefDetailDialog.value = false;
  queryText.value = buildQueryFromPredefPlan(plan);
  $q.notify({ message: 'Seçilen plan tercihlerinize göre hazırlanıyor...', color: 'info', icon: 'rocket_launch' });
  const prev = responseText.value;
  await getTravelPlan();
  if (!responseText.value || responseText.value === prev || /hata oluYtu/i.test(responseText.value)) {
    responseText.value = buildPredefContent(plan);
    $q.notify({ message: 'AI yanıtı alınamadı, plan özeti gösteriliyor.', color: 'warning', icon: 'warning' });
  }
};

// Detay DiyaloYu için yardımcılar
const routeList = (plan) => { if (!plan?.route) return []; return plan.route.split("").map(s => s.trim()).filter(Boolean); };

const themeList = (plan) => {
  if (!plan?.themes) return [];
  return plan.themes.split(',').map(s => s.trim()).filter(Boolean);
};

const suggestedActivities = (plan) => {
  const title = plan?.title || '';
  if (/Kapadokya/i.test(title)) return ['Gün doğumunda balon turu', 'Aşk Vadisi yürüyüşü', 'Yeraltı şehirleri ziyareti'];
  if (/Ege|Akdeniz/i.test(title)) return ['Tekne turu', 'Sahil yürüyüşü', 'Yerel pazar keşfi'];
  if (/Karadeniz/i.test(title)) return ['Yayla trekking', 'Şelale rotaları', 'Fırtına Deresi rafting'];
  if (/Avrupa BaYkentleri/i.test(title)) return ['Müze pass ile kültür turu', 'Tarihi meydanlar yürüyüşü', 'Kanal turu'];
  if (/Balkan/i.test(title)) return ['Eski şehir turları', 'Kıyı yürüyüşü', 'Yerel mutfak tadımı'];
  if (/İskandinav|Kuzey Işıkları/i.test(title)) return ['Aurora izleme turları', 'Fiyort tekne gezisi', 'Şehir bisiklet turu'];
  if (/Asya/i.test(title)) return ['Tapınak turları', 'Gece pazarları', 'Ada turları'];
  if (/Amerika/i.test(title)) return ['Şehir gözlem terasları', 'Ulusal park yürüyüşü', 'Tema park ziyareti'];
  return ['Şehir yürüyüş turu', 'Yerel lezzet durakları', 'Panoramik fotoğraf noktaları'];
};

const suggestedStays = (plan) => {
  const region = plan?.region;
  if (region === 'TR') return ['Merkezde butik otel', 'Sahil kenarında apart', 'Doğa içi bungalov'];
  return ['Şehir merkezinde otel', 'Ulaşım hatlarına yakın konaklama', 'Yerel konseptli butik otel'];
};

const suggestedTransport = (plan) => {
  const region = plan?.region;
  if (region === 'TR') return ['Şehirler arası otobüs/araç', 'Araç kiralama ile esnek rota', 'Kısa mesafede minibüs/dolmuş'];
  return ['Ucuz uçuşlar arası geçiş', 'Şehir içi toplu taşıma kartı', 'Yürünebilir merkezler için bisiklet/skuter'];
};
// Detay görselleri
const imageList = (plan) => {
  if (!plan) return [];
  const seed = encodeURIComponent((plan.title || plan.region || 'travel') + '-' + Date.now());
  // -rnek görseller (picsum) ?" her açılıta farklı seed ile 4 kare
  return [1, 2, 3, 4].map(i => `https://picsum.photos/seed/${seed}-${i}/1024/576`);
};

// 'Seç' akıYı: plan özetini üret, panoya kopyala ve giriY kutusuna yapıYtır
const buildPredefSummary = (plan) => {
  if (!plan) return '';
  const lines = [
    `${plan.title}`,
    `Rota: ${plan.route}`,
    `Süre: ${plan.duration}`,
    `Temalar: ${plan.themes}`,
    `Avantaj: ${plan.advantage}`
  ];
  return lines.join('\n');
};

const selectPredefSummary = async (plan) => {
  const summary = buildPredefSummary(plan);
  // Input alanına yerleYtir
  queryText.value = summary;
  // Panoya kopyala (destek yoksa sessiz geç)
  try {
    await navigator.clipboard.writeText(summary);
    $q.notify({ message: 'Plan özeti kopyalandı ve metin kutusuna eklendi.', color: 'positive', icon: 'content_copy' });
  } catch (e) {
    $q.notify({ message: '-zet kutuya eklendi. Kopyalama izin vermedi.', color: 'info', icon: 'info' });
  }
  // Otomatik oluşturma YOK; dialogları kapat
  predefDetailDialog.value = false;
  indecisiveDialog.value = false;
};
const selectedPlan = ref(null);
const loadingPlans = ref(false);

// Axios interceptor - Her istekte token ekle
axios.interceptors.request.use(config => {
  if (token.value) {
    config.headers.Authorization = `Bearer ${token.value}`;
  }
  return config;
});

// ===== ?ARK (Wheel) State & Metodlar =====
const spinDialog = ref(false);
const spinRegion = ref('TR'); // TR | INTL | MIX
const isSpinning = ref(false);
const selectedResultTitle = ref('');

const getSpinPool = () => {
  // Şans çarkı için tüm planları kullan (10'ar plan)
  if (spinRegion.value === 'TR') return allPredefPlans.value.tr;
  if (spinRegion.value === 'INTL') return allPredefPlans.value.intl;
  // MIX
  return [...allPredefPlans.value.tr, ...allPredefPlans.value.intl];
};

const wheelItems = computed(() => getSpinPool());
const wheelCanvas = ref(null);
const showConfetti = ref(false);
let currentRotation = 0;

const drawWheel = () => {
  const canvas = wheelCanvas.value;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const centerX = 200;
  const centerY = 200;
  const radius = 180;
  const items = wheelItems.value;
  
  if (items.length === 0) return;
  
  const sliceAngle = (2 * Math.PI) / items.length;
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
  
  ctx.clearRect(0, 0, 400, 400);
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(currentRotation);
  
  items.forEach((item, i) => {
    const startAngle = i * sliceAngle;
    const endAngle = startAngle + sliceAngle;
    
    // Draw slice
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw text
    ctx.save();
    ctx.rotate(startAngle + sliceAngle / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText(item.title.substring(0, 20), radius / 1.5, 0);
    ctx.restore();
  });
  
  // Draw center circle
  ctx.beginPath();
  ctx.arc(0, 0, 30, 0, 2 * Math.PI);
  ctx.fillStyle = '#1a1a1a';
  ctx.fill();
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 4;
  ctx.stroke();
  
  ctx.restore();
};

const openSpinDialog = () => {
  spinRegion.value = predefActive.value === 'INTL' ? 'INTL' : 'TR';
  selectedResultTitle.value = '';
  showConfetti.value = false;
  spinDialog.value = true;
  setTimeout(() => drawWheel(), 100);
};

const changeRegion = (region) => {
  spinRegion.value = region;
  currentRotation = 0;
  selectedResultTitle.value = '';
  showConfetti.value = false;
  drawWheel();
};

const playSpinSound = () => {
  const audio = new Audio();
  audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi2Byuzt'; 
  audio.volume = 0.3;
  audio.play().catch(() => {});
};

const playWinSound = () => {
  const audio = new Audio();
  audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi2Byuzt';
  audio.volume = 0.5;
  audio.play().catch(() => {});
};

const spinWheel = async () => {
  if (isSpinning.value || wheelItems.value.length === 0) return;
  
  isSpinning.value = true;
  showConfetti.value = false;
  selectedResultTitle.value = '';
  playSpinSound();
  
  const pool = getSpinPool();
  const targetIndex = Math.floor(Math.random() * pool.length);
  const picked = pool[targetIndex];
  
  const sliceAngle = (2 * Math.PI) / pool.length;
  // Pointer yukarıda (saat 12 = -PI/2), dilimler saat 3'ten başlıyor (0)
  // Hedef dilimin ortasını pointer'a getirmek için:
  // Dilimin ortası = targetIndex * sliceAngle + sliceAngle/2
  // Pointer pozisyonu = -PI/2 (yukarı)
  // Gerekli rotasyon = -(dilimin ortası) - PI/2
  const targetAngle = -(targetIndex * sliceAngle + sliceAngle / 2) - Math.PI / 2;
  const spins = 5;
  const totalRotation = spins * 2 * Math.PI + targetAngle - (currentRotation % (2 * Math.PI));
  
  const duration = 4000;
  const startTime = Date.now();
  const startRotation = currentRotation;
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const easeOut = 1 - Math.pow(1 - progress, 3);
    currentRotation = startRotation + totalRotation * easeOut;
    
    drawWheel();
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      isSpinning.value = false;
      selectedResultTitle.value = picked.title;
      predefSelectedPlan.value = picked;
      showConfetti.value = true;
      playWinSound();
      
      setTimeout(() => {
        showConfetti.value = false;
      }, 3000);
      
      $q.notify({ 
        message: `🎉 ${picked.title}`, 
        color: 'positive', 
        icon: 'celebration',
        timeout: 3000
      });
    }
  };
  
  animate();
};

const viewWheelResult = () => {
  if (predefSelectedPlan.value) {
    showPredefDetail(predefSelectedPlan.value);
    spinDialog.value = false;
  }
};

const confettiStyle = (i) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#FFD93D', '#6BCF7F'];
  return {
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 0.5}s`,
    backgroundColor: colors[i % colors.length],
    animationDuration: `${2 + Math.random()}s`
  };
};

// Modallar
const openLogin = () => { 
  loginDialog.value = true; 
  registerDialog.value = false; 
  loginEmail.value = '';
  loginPassword.value = '';
};

const openRegister = () => { 
  registerDialog.value = true; 
  loginDialog.value = false; 
  registerName.value = '';
  registerEmail.value = '';
  registerPassword.value = '';
};

// Auth Functions
const handleLogin = async () => {
  if (!loginEmail.value || !loginPassword.value) {
    $q.notify({ message: 'Tüm alanları doldurunuz', color: 'negative', icon: 'warning' });
    return;
  }

  authLoading.value = true;
  try {
    const response = await axios.post('/api/auth/login', {
      email: loginEmail.value,
      password: loginPassword.value
    });

    token.value = response.data.token;
    userName.value = response.data.user.name;
    userId.value = response.data.user.id;

    localStorage.setItem('token', response.data.token);
    localStorage.setItem('userName', response.data.user.name);
    localStorage.setItem('userId', response.data.user.id);

    $q.notify({ 
      message: `Hoş geldin ${response.data.user.name}!`, 
      color: 'positive', 
      icon: 'check_circle' 
    });

    loginDialog.value = false;
    loginEmail.value = '';
    loginPassword.value = '';
  } catch (error) {
    console.error('Login error:', error);
    $q.notify({ 
      message: error.response?.data?.error || 'Giriş başarısız', 
      color: 'negative', 
      icon: 'error' 
    });
  } finally {
    authLoading.value = false;
  }
};

const handleRegister = async () => {
  if (!registerName.value || !registerEmail.value || !registerPassword.value) {
    $q.notify({ message: 'Tüm alanları doldurunuz', color: 'negative', icon: 'warning' });
    return;
  }

  if (registerPassword.value.length < 6) {
    $q.notify({ message: 'Şifre en az 6 karakter olmalıdır', color: 'negative', icon: 'warning' });
    return;
  }

  authLoading.value = true;
  try {
    const response = await axios.post('/api/auth/register', {
      name: registerName.value,
      email: registerEmail.value,
      password: registerPassword.value
    });

    token.value = response.data.token;
    userName.value = response.data.user.name;
    userId.value = response.data.user.id;

    localStorage.setItem('token', response.data.token);
    localStorage.setItem('userName', response.data.user.name);
    localStorage.setItem('userId', response.data.user.id);

    $q.notify({ 
      message: `Kayıt baYarılı! Hoş geldin ${response.data.user.name}! ?`, 
      color: 'positive', 
      icon: 'check_circle' 
    });

    registerDialog.value = false;
    registerName.value = '';
    registerEmail.value = '';
    registerPassword.value = '';
  } catch (error) {
    console.error('Register error:', error);
    $q.notify({ 
      message: error.response?.data?.error || 'Kayıt baYarısız', 
      color: 'negative', 
      icon: 'error' 
    });
  } finally {
    authLoading.value = false;
  }
};

const logout = () => {
  token.value = '';
  userName.value = '';
  userId.value = '';
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  localStorage.removeItem('userId');
  
  $q.notify({ 
    message: 'Çıkış yapıldı. Görüşmek üzere!', 
    color: 'info', 
    icon: 'logout' 
  });
};

// Forgot Password Functions
const openForgotPassword = () => {
  loginDialog.value = false;
  forgotPasswordDialog.value = true;
  forgotPasswordStep.value = 1;
  forgotEmail.value = '';
  resetCode.value = '';
  newPasswordReset.value = '';
  confirmPasswordReset.value = '';
  devResetCode.value = '';
};

const closeForgotPassword = () => {
  forgotPasswordDialog.value = false;
  forgotPasswordStep.value = 1;
  forgotEmail.value = '';
  resetCode.value = '';
  newPasswordReset.value = '';
  confirmPasswordReset.value = '';
  devResetCode.value = '';
};

const sendResetCode = async () => {
  if (!forgotEmail.value) {
    $q.notify({ message: 'Lütfen email adresinizi girin', color: 'negative' });
    return;
  }

  forgotPasswordLoading.value = true;
  try {
    const response = await axios.post('http://localhost:3001/api/auth/forgot-password', {
      email: forgotEmail.value
    });

    // Store dev code if available
    if (response.data.devCode) {
      devResetCode.value = response.data.devCode;
    }

    $q.notify({
      message: response.data.message,
      color: 'positive',
      icon: 'email',
      timeout: 5000
    });

    forgotPasswordStep.value = 2;
  } catch (error) {
    console.error('Send reset code error:', error);
    $q.notify({
      message: error.response?.data?.error || 'Kod gönderilemedi',
      color: 'negative'
    });
  } finally {
    forgotPasswordLoading.value = false;
  }
};

const verifyResetCode = async () => {
  if (!resetCode.value || resetCode.value.length !== 6) {
    $q.notify({ message: 'Lütfen 6 haneli kodu girin', color: 'negative' });
    return;
  }

  forgotPasswordLoading.value = true;
  try {
    await axios.post('http://localhost:3001/api/auth/verify-reset-code', {
      email: forgotEmail.value,
      code: resetCode.value
    });

    $q.notify({
      message: 'Kod doğrulandı! Yeni şifrenizi belirleyin',
      color: 'positive',
      icon: 'check_circle'
    });

    forgotPasswordStep.value = 3;
  } catch (error) {
    console.error('Verify code error:', error);
    $q.notify({
      message: error.response?.data?.error || 'Kod doğrulanamadı',
      color: 'negative'
    });
  } finally {
    forgotPasswordLoading.value = false;
  }
};

const resetPassword = async () => {
  if (!newPasswordReset.value || newPasswordReset.value.length < 6) {
    $q.notify({ message: 'Şifre en az 6 karakter olmalıdır', color: 'negative' });
    return;
  }

  if (newPasswordReset.value !== confirmPasswordReset.value) {
    $q.notify({ message: 'Şifreler eşleşmiyor', color: 'negative' });
    return;
  }

  forgotPasswordLoading.value = true;
  try {
    await axios.post('http://localhost:3001/api/auth/reset-password', {
      email: forgotEmail.value,
      code: resetCode.value,
      newPassword: newPasswordReset.value
    });

    $q.notify({
      message: 'Şifreniz başarıyla değiştirildi! Giriş yapabilirsiniz',
      color: 'positive',
      icon: 'check_circle',
      timeout: 5000
    });

    closeForgotPassword();
    openLogin();
  } catch (error) {
    console.error('Reset password error:', error);
    $q.notify({
      message: error.response?.data?.error || 'Şifre değiştirilemedi',
      color: 'negative'
    });
  } finally {
    forgotPasswordLoading.value = false;
  }
};

// Gemini format
const formattedResponse = computed(() => {
  if (!responseText.value) return '';
  return formatPlanContent(responseText.value);
});

const formatPlanContent = (content) => {
  if (!content) return '';
  return content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-accent">$1</strong>')
    .replace(/\*(.*?)\n/g, '<div class="q-pl-lg q-mb-sm"><span class="text-accent">-</span> $1</div>')
    .replace(/### (.*?)\n/g, '<h3 class="text-h5 text-weight-bold q-mt-xl q-mb-md text-white">$1</h3>')
    .replace(/## (.*?)\n/g, '<h2 class="text-h4 text-weight-black q-mt-xl q-mb-lg travel-gradient">$1</h2>')
    .replace(/---/g, '<hr class="q-my-xl border-accent">');
};

// Travel Plan
const getTravelPlan = async () => {
  if (!queryText.value.trim()) return;

  isLoading.value = true;
  responseText.value = '';

  try {
    const response = await axios.post('/api/travel', { queryText: queryText.value });
    responseText.value = response.data.plan;
  } catch (err) {
    console.error(err);
    responseText.value = 'ozgünüm, bir hata oluYtu. Lütfen tekrar deneyin.';
  } finally {
    isLoading.value = false;
  }
};

const clearResults = () => {
  responseText.value = '';
  queryText.value = '';
};

// Save Plan
const saveTravelPlan = async () => {
  if (!isLoggedIn.value) {
    $q.notify({ 
      message: 'Planı kaydetmek için giriş yapmalısınız', 
      color: 'warning', 
      icon: 'warning',
      actions: [{ label: 'Giriş Yap', color: 'white', handler: openLogin }]
    });
    return;
  }

  if (!responseText.value) {
    $q.notify({ message: 'Kaydedilecek plan bulunamadı', color: 'negative', icon: 'error' });
    return;
  }

  $q.dialog({
    title: 'Plan Başlığı',
    message: 'Planınıza bir başlık verin:',
    prompt: {
      model: queryText.value.substring(0, 100),
      type: 'text'
    },
    cancel: true,
    persistent: true,
    dark: true
  }).onOk(async (title) => {
    try {
      await axios.post('/api/plans', {
        title: title || queryText.value.substring(0, 100),
        query: queryText.value,
        plan: responseText.value
      });

      $q.notify({ 
        message: 'Plan baYarıyla kaydedildi! "', 
        color: 'positive', 
        icon: 'check_circle' 
      });
    } catch (error) {
      console.error('Save plan error:', error);
      $q.notify({ 
        message: error.response?.data?.error || 'Plan kaydedilemedi', 
        color: 'negative', 
        icon: 'error' 
      });
    }
  });
};

// Share
const sharePlan = async () => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: 'Seyahat Planım',
        text: queryText.value,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(`${queryText.value}\n\n${responseText.value}`);
      $q.notify({ message: 'Plan panoya kopyalandı!', color: 'accent', icon: 'content_copy' });
    }
  } catch {
    $q.notify({ message: 'Paylaşım baYarısız', color: 'negative', icon: 'error' });
  }
};

// My Plans Functions
const showMyPlans = async () => {
  myPlansDialog.value = true;
  await loadPlans();
};

const loadPlans = async () => {
  loadingPlans.value = true;
  try {
    const response = await axios.get('/api/plans');
    savedPlans.value = response.data.plans;
  } catch (error) {
    console.error('Load plans error:', error);
    $q.notify({ 
      message: 'Planlar yüklenemedi', 
      color: 'negative', 
      icon: 'error' 
    });
  } finally {
    loadingPlans.value = false;
  }
};

const viewPlan = (plan) => {
  selectedPlan.value = plan;
  viewPlanDialog.value = true;
};

const deletePlan = async (planId) => {
  $q.dialog({
    title: 'Planı Sil',
    message: 'Bu planı silmek istediYinizden emin misiniz?',
    cancel: true,
    persistent: true,
    dark: true
  }).onOk(async () => {
    try {
      await axios.delete(`/api/plans/${planId}`);
      savedPlans.value = savedPlans.value.filter(p => p.id !== planId);
      $q.notify({ 
        message: 'Plan silindi', 
        color: 'positive', 
        icon: 'delete' 
      });
    } catch (error) {
      console.error('Delete plan error:', error);
      $q.notify({ 
        message: 'Plan silinemedi', 
        color: 'negative', 
        icon: 'error' 
      });
    }
  });
};

const toggleFavorite = async (planId) => {
  try {
    const response = await axios.patch(`/api/plans/${planId}/favorite`);
    const plan = savedPlans.value.find(p => p.id === planId);
    if (plan) {
      plan.isFavorite = response.data.plan.isFavorite;
    }
    $q.notify({ 
      message: response.data.message, 
      color: 'positive', 
      icon: response.data.plan.isFavorite ? 'favorite' : 'favorite_border' 
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    $q.notify({ 
      message: 'İYlem baYarısız', 
      color: 'negative', 
      icon: 'error' 
    });
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });
};

// Check auth on mount
onMounted(async () => {
  if (token.value) {
    try {
      await axios.get('/api/auth/me');
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    }
  }
});
</script>

<style scoped>
/* ===== SEYAHAT TEMALI MODERN TASARIM ===== */

/* Ana Arkaplan - Seyahat Temalı Gradient */
.bg-travel { 
  background: linear-gradient(135deg, #0a1628 0%, #1a2332 25%, #0f1b2e 50%, #1a2840 75%, #0a1628 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  position: relative;
  overflow: hidden;
}

.bg-travel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(0, 188, 212, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(33, 150, 243, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(0, 229, 255, 0.05) 0%, transparent 70%);
  pointer-events: none;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Gradient Text - Seyahat Renkleri */
.travel-gradient { 
  background: linear-gradient(135deg, #00e5ff 0%, #00bcd4 30%, #2196f3 60%, #00e5ff 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientFlow 3s ease infinite;
}

@keyframes gradientFlow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Glass Effect - GeliYtirilmiY */
.glass-effect-enhanced { 
  background: rgba(26, 35, 50, 0.7);
  backdrop-filter: blur(30px) saturate(180%);
  border: 2px solid rgba(0, 188, 212, 0.2);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 0 40px rgba(0, 188, 212, 0.1);
}

/* Kartlar */
.search-card, .result-card, .loading-card { 
  border-radius: 28px;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.search-card:hover, .result-card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 60px rgba(0, 188, 212, 0.2);
  border-color: rgba(0, 188, 212, 0.4);
}

/* Hero Section */
.hero-section {
  animation: fadeInDown 0.8s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Hero Title & Subtitle */
.hero-title {
  font-family: 'Inter', 'Poppins', 'Segoe UI', system-ui, -apple-system, sans-serif;
  font-weight: 900;
  letter-spacing: 0.6px;
  line-height: 1.1;
  margin: 6px 0 2px 0;
  text-align: center;
  font-size: clamp(32px, 5vw, 56px);
  text-shadow: 0 2px 24px rgba(0, 188, 212, 0.15);
}

.hero-subtitle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #cfd8dc;
  font-family: 'Inter', 'Poppins', 'Segoe UI', system-ui, -apple-system, sans-serif;
  font-weight: 600;
  letter-spacing: 0.2px;
  margin-top: 6px;
  font-size: clamp(14px, 2.4vw, 20px);
}

@media (max-width: 600px) {
  .hero-title {
    letter-spacing: 0.3px;
  }
  .hero-subtitle {
    gap: 6px;
  }
}

.animated-title {
  animation: titlePulse 2s ease-in-out infinite;
}

@keyframes titlePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.subtitle-text {
  animation: fadeIn 1s ease-out 0.3s both;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Hero İkonlar */
.hero-icon-wrapper {
  position: relative;
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.floating-icons {
  position: relative;
  width: 100%;
  height: 100%;
}

.rotating-icon {
  animation: rotateFloat 6s ease-in-out infinite;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

@keyframes rotateFloat {
  0%, 100% { transform: translate(-50%, -50%) rotate(-5deg) translateY(0px); }
  25% { transform: translate(-50%, -50%) rotate(5deg) translateY(-10px); }
  50% { transform: translate(-50%, -50%) rotate(-5deg) translateY(0px); }
  75% { transform: translate(-50%, -50%) rotate(5deg) translateY(-10px); }
}

.floating-icon-1, .floating-icon-2, .floating-icon-3 {
  position: absolute;
  animation: floatAround 8s ease-in-out infinite;
}

.floating-icon-1 {
  top: 10%;
  right: 10%;
  animation-delay: 0s;
}

.floating-icon-2 {
  bottom: 15%;
  left: 5%;
  animation-delay: 2s;
}

.floating-icon-3 {
  top: 50%;
  right: 0%;
  animation-delay: 4s;
}

@keyframes floatAround {
  0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.6; }
  25% { transform: translate(10px, -15px) rotate(5deg); opacity: 1; }
  50% { transform: translate(-5px, -10px) rotate(-5deg); opacity: 0.7; }
  75% { transform: translate(15px, 5px) rotate(3deg); opacity: 0.9; }
}

/* Feature Badges */
.feature-badges {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
  animation: fadeIn 1s ease-out 0.5s both;
}

.feature-badge {
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 20px;
  border-width: 2px !important;
  transition: all 0.3s ease;
  cursor: default;
}

.feature-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 188, 212, 0.3);
}

/* Search Header */
.search-header {
  display: flex;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(0, 188, 212, 0.2);
}

/* Input - GeliYtirilmiY */
.custom-input-enhanced :deep(.q-field__control) { 
  border-radius: 16px;
  font-size: 1.15em;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(0, 188, 212, 0.3);
  transition: all 0.3s ease;
}

.custom-input-enhanced :deep(.q-field__control):hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(0, 188, 212, 0.5);
}

.custom-input-enhanced :deep(.q-field__control):focus-within {
  background: rgba(255, 255, 255, 0.1);
  border-color: #00bcd4;
  box-shadow: 0 0 20px rgba(0, 188, 212, 0.3);
}

.pulse-icon {
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

/* Action Button - GeliYtirilmiY */
.action-button-enhanced { 
  border-radius: 16px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  background: linear-gradient(135deg, #00bcd4 0%, #0097a7 100%);
  box-shadow: 0 4px 15px rgba(0, 188, 212, 0.4);
  position: relative;
  overflow: hidden;
}

.action-button-enhanced::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s ease;
}

.action-button-enhanced:hover::before {
  left: 100%;
}

.action-button-enhanced:hover { 
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 188, 212, 0.5);
}

.action-button-enhanced:active {
  transform: translateY(-1px);
}

/* Result Header */
.result-header {
  animation: slideInUp 0.6s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-icon-wrapper {
  animation: bounceIn 0.8s ease-out;
}

@keyframes bounceIn {
  0% { transform: scale(0); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.action-buttons-wrapper {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.action-btn-modern {
  border-radius: 12px;
  padding: 8px 20px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.action-btn-modern:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.separator-glow {
  height: 2px;
  box-shadow: 0 0 10px rgba(0, 188, 212, 0.5);
}

/* Travel Content - GeliYtirilmiY */
.travel-content { 
  max-height: 65vh;
  overflow-y: auto;
  animation: fadeIn 0.8s ease-out 0.3s both;
}

.scroll-design-enhanced::-webkit-scrollbar { 
  width: 10px;
}

.scroll-design-enhanced::-webkit-scrollbar-track { 
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  margin: 8px 0;
}

.scroll-design-enhanced::-webkit-scrollbar-thumb { 
  background: linear-gradient(180deg, #00e5ff, #00bcd4, #0097a7);
  border-radius: 10px;
  border: 2px solid rgba(26, 35, 50, 0.7);
  transition: all 0.3s ease;
}

.scroll-design-enhanced::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #00e5ff, #2196f3);
  box-shadow: 0 0 10px rgba(0, 188, 212, 0.5);
}

.line-height-2 { line-height: 2; }

.content-text-enhanced { 
  font-size: 1.15em;
  color: #e0e0e0;
}

.content-text-enhanced strong {
  font-weight: 700;
  text-shadow: 0 0 10px rgba(0, 188, 212, 0.3);
}

/* Glow Effect */
.glow-effect { 
  filter: drop-shadow(0 0 25px rgba(0, 188, 212, 0.6));
  animation: glowPulse 2s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { filter: drop-shadow(0 0 25px rgba(0, 188, 212, 0.6)); }
  50% { filter: drop-shadow(0 0 35px rgba(0, 188, 212, 0.8)); }
}

/* Loading Dialog - GeliYtirilmiY */
.plane-container-enhanced { 
  position: relative;
  width: 200px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flying-plane-enhanced { 
  animation: flyEnhanced 3s ease-in-out infinite;
  position: relative;
  z-index: 2;
}

@keyframes flyEnhanced { 
  0%, 100% { transform: translateY(0px) rotate(-5deg) translateX(-10px); }
  25% { transform: translateY(-15px) rotate(5deg) translateX(10px); }
  50% { transform: translateY(-5px) rotate(-3deg) translateX(-5px); }
  75% { transform: translateY(-20px) rotate(3deg) translateX(15px); }
}

.cloud-1, .cloud-2, .cloud-3 {
  position: absolute;
  animation: cloudFloat 6s ease-in-out infinite;
  opacity: 0.4;
}

.cloud-1 {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.cloud-2 {
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.cloud-3 {
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes cloudFloat {
  0%, 100% { transform: translateX(0px); opacity: 0.3; }
  50% { transform: translateX(30px); opacity: 0.6; }
}

.plane-container-enhanced::after { 
  content: '';
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 6px;
  background: linear-gradient(90deg, transparent, rgba(0, 188, 212, 0.6), transparent);
  border-radius: 50%;
  animation: shadowPulse 3s ease-in-out infinite;
}

@keyframes shadowPulse { 
  0%, 100% { opacity: 0.4; width: 120px; }
  50% { opacity: 0.8; width: 140px; }
}

.loading-steps {
  animation: fadeIn 1s ease-out 0.5s both;
}

.loading-steps .text-caption {
  margin: 4px 0;
  animation: textFade 3s ease-in-out infinite;
}

.loading-steps .text-caption:nth-child(1) { animation-delay: 0s; }
.loading-steps .text-caption:nth-child(2) { animation-delay: 1s; }
.loading-steps .text-caption:nth-child(3) { animation-delay: 2s; }

@keyframes textFade {
  0%, 100% { opacity: 0.5; }
  33% { opacity: 1; }
}

.progress-glow {
  box-shadow: 0 0 20px rgba(0, 188, 212, 0.5);
}

/* Responsive */
.gap-sm { gap: 12px; }

@media (min-width: 1400px) { 
  .col-lg-8 { max-width: 1200px; }
  .col-lg-10 { max-width: 1400px; }
  .travel-content { max-height: 60vh; }
}

@media (max-width: 1024px) { 
  .q-pa-xl { padding: 24px; }
  .search-card, .result-card { padding: 24px !important; }
  .hero-icon-wrapper { width: 150px; height: 150px; }
}

@media (max-width: 600px) {
  .feature-badges { gap: 8px; }
  .feature-badge { font-size: 12px; padding: 6px 12px; }
  .action-buttons-wrapper { justify-content: center; }
  .action-btn-modern { font-size: 12px; padding: 6px 16px; }
}

/* Auth Buttons Wrapper */
.auth-buttons-wrapper {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  animation: fadeIn 1s ease-out 0.7s both;
}

.user-info-wrapper {
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  animation: fadeIn 1s ease-out 0.7s both;
}

.user-chip {
  font-size: 16px;
  padding: 12px 20px;
  font-weight: 600;
}

/* Modern Auth Butonları */
.auth-btn {
  border-radius: 12px;
  padding: 12px 32px;
  font-weight: 600;
  font-size: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
  min-width: 140px;
  margin: 0 8px;
  margin-bottom: 5%;
}

.auth-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.7s ease;
}

.auth-btn:hover::before {
  left: 100%;
}

.auth-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.auth-btn:active {
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

/* Giriş Yap Butonu */

.auth-btn:hover::after {
  transform: translateX(3px);
}

/* Responsive Tasarım */
@media (max-width: 600px) {
  .auth-btn {
    padding: 10px 24px;
    font-size: 14px;
    min-width: 120px;
    margin: 4px;
  }
  
  .row.gap-sm {
    gap: 8px;
  }
}

/* Loading durumu için */
.auth-btn.loading {
  opacity: 0.8;
  pointer-events: none;
}

.auth-btn.loading::after {
  content: '...';
  animation: loadingDots 1.5s infinite;
}

@keyframes loadingDots {
  0%, 20% { content: '.'; }
  40% { content: '..'; }
  60%, 100% { content: '...'; }
}

/* Focus durumu için */
.auth-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
}
/* Modern Auth Modal Stilleri */
.auth-modal {
  min-width: 400px;
  border-radius: 20px;
  backdrop-filter: blur(20px);
  background: rgba(15, 23, 42, 0.95) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.auth-modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c);
  background-size: 400% 400%;
  animation: gradientShift 3s ease infinite;
}

.login-modal::before {
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.register-modal::before {
  background: linear-gradient(90deg, #f093fb, #f5576c);
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Gradient Text */
.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5576c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* -zelleYtirilmiY Input Alanları */
.custom-input .q-field__control {
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.custom-input .q-field__control:hover {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
}

.custom-input .q-field__control:focus-within {
  border-color: currentColor;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.custom-input .q-field__label {
  color: rgba(255, 255, 255, 0.7) !important;
  font-weight: 500;
}

/* Submit Butonları */
.auth-submit-btn {
  border-radius: 12px;
  padding: 12px;
  font-weight: 600;
  font-size: 16px;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
  margin-top: 10px;
}

.auth-submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.7s ease;
}

.auth-submit-btn:hover::before {
  left: 100%;
}

.auth-submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
}

/* Switch Auth Butonu */
.switch-auth-btn {
  border-radius: 8px;
  padding: 8px 16px;
  transition: all 0.3s ease;
  position: relative;
}

.switch-auth-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.switch-auth-btn::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: currentColor;
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.switch-auth-btn:hover::after {
  width: 100%;
}

/* Responsive Tasarım */
@media (max-width: 600px) {
  .auth-modal {
    min-width: 90vw;
    margin: 20px;
  }
  
  .q-pa-xl {
    padding: 24px;
  }
  
  .text-h4 {
    font-size: 1.5rem;
  }
}

/* Loading Durumu */
.auth-submit-btn.loading {
  opacity: 0.8;
  pointer-events: none;
}

.auth-submit-btn.loading .q-btn__content {
  opacity: 0;
}

.auth-submit-btn.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Plan Cards */
.plan-card {
  transition: all 0.3s ease;
  border-radius: 20px;
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 188, 212, 0.3);
}

.plan-preview {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Switch Auth Button */
.switch-auth-btn {
  transition: all 0.3s ease;
}

.switch-auth-btn:hover {
  transform: scale(1.05);
}

/* ===== PLANLARIM DİYALOGU - İYİLEŞTİRİLMİŞ ===== */

.plans-header-enhanced {
  background: linear-gradient(135deg, #1a2840 0%, #0f1b2e 100%);
  padding: 16px 24px;
  border-bottom: 2px solid rgba(0, 188, 212, 0.3);
}

/* ===== My Plans - Aksiyon Butonları (Ultra Modern) ===== */
.plans-actions {
  padding: 16px 6px 0;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.neo-btn {
  position: relative;
  border-radius: 18px;
  padding: 14px 28px;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.6px;
  text-transform: none;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  backdrop-filter: blur(20px) saturate(180%);
  border: 2px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 2px 4px rgba(255, 255, 255, 0.1),
    inset 0 -2px 4px rgba(0, 0, 0, 0.2);
  transform-style: preserve-3d;
}

.neo-btn .q-icon {
  margin-right: 8px;
  filter: drop-shadow(0 0 8px currentColor);
  transition: transform 0.3s ease;
}

.neo-btn:hover .q-icon {
  transform: scale(1.15) rotate(5deg);
  animation: iconPulseGlow 1.5s ease-in-out infinite;
}

@keyframes iconPulseGlow {
  0%, 100% {
    filter: drop-shadow(0 0 8px currentColor);
  }
  50% {
    filter: drop-shadow(0 0 16px currentColor);
  }
}

.neo-btn:hover {
  transform: translateY(-4px) scale(1.03);
  border-color: rgba(255, 255, 255, 0.25);
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.5),
    0 0 40px currentColor,
    inset 0 2px 8px rgba(255, 255, 255, 0.15);
}

.neo-btn:active {
  transform: translateY(-1px) scale(0.98);
  transition: all 0.1s ease;
}

/* Gradient Backgrounds with Animation */
.neo-primary {
  background: linear-gradient(135deg, 
    rgba(33, 150, 243, 0.35) 0%, 
    rgba(0, 229, 255, 0.28) 50%,
    rgba(33, 150, 243, 0.35) 100%);
  background-size: 200% 200%;
  color: #e3f2fd;
  animation: gradientShift 4s ease infinite;
}

.neo-accent {
  background: linear-gradient(135deg, 
    rgba(0, 188, 212, 0.38) 0%, 
    rgba(0, 229, 255, 0.28) 50%,
    rgba(0, 188, 212, 0.38) 100%);
  background-size: 200% 200%;
  color: #e0f7fa;
  animation: gradientShift 4s ease infinite 0.5s;
}

.neo-secondary {
  background: linear-gradient(135deg, 
    rgba(156, 39, 176, 0.35) 0%, 
    rgba(103, 58, 183, 0.28) 50%,
    rgba(156, 39, 176, 0.35) 100%);
  background-size: 200% 200%;
  color: #f3e5f5;
  animation: gradientShift 4s ease infinite 1s;
}

.neo-info {
  background: linear-gradient(135deg, 
    rgba(0, 188, 212, 0.35) 0%, 
    rgba(0, 150, 170, 0.28) 50%,
    rgba(0, 188, 212, 0.35) 100%);
  background-size: 200% 200%;
  color: #e0f7fa;
  animation: gradientShift 4s ease infinite 0.75s;
}

.neo-info:hover {
  box-shadow:
    0 16px 48px rgba(0, 188, 212, 0.4),
    0 0 60px rgba(0, 188, 212, 0.5),
    inset 0 2px 8px rgba(255, 255, 255, 0.2);
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* Neon Border Effect */
.neo-btn::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 18px;
  padding: 2px;
  background: linear-gradient(135deg, 
    currentColor 0%, 
    transparent 40%, 
    transparent 60%, 
    currentColor 100%);
  background-size: 200% 200%;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0.5;
  pointer-events: none;
  animation: borderRotate 3s linear infinite;
}

@keyframes borderRotate {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
}

/* Shine Effect on Hover */
.neo-btn::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -150%;
  width: 100%;
  height: 200%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.3) 50%, 
    transparent 100%);
  transform: rotate(25deg);
  transition: left 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: none;
}

.neo-btn:hover::after {
  left: 150%;
}

/* Glow Particles Effect */
.neo-primary:hover {
  box-shadow:
    0 16px 48px rgba(33, 150, 243, 0.4),
    0 0 60px rgba(33, 150, 243, 0.5),
    inset 0 2px 8px rgba(255, 255, 255, 0.2);
}

.neo-accent:hover {
  box-shadow:
    0 16px 48px rgba(0, 188, 212, 0.4),
    0 0 60px rgba(0, 188, 212, 0.5),
    inset 0 2px 8px rgba(255, 255, 255, 0.2);
}

.neo-secondary:hover {
  box-shadow:
    0 16px 48px rgba(156, 39, 176, 0.4),
    0 0 60px rgba(156, 39, 176, 0.5),
    inset 0 2px 8px rgba(255, 255, 255, 0.2);
}

/* Responsive Design */
@media (max-width: 768px) {
  .plans-actions {
    gap: 12px !important;
    flex-direction: column;
  }
  
  .neo-btn {
    width: 100%;
    justify-content: center;
    padding: 12px 24px;
    font-size: 14px;
  }
}

/* Accessibility - Focus State */
.neo-btn:focus-visible {
  outline: 3px solid rgba(255, 255, 255, 0.5);
  outline-offset: 4px;
}

/* Loading State Enhanced */
.loading-state-enhanced {
  text-align: center;
  padding: 100px 20px;
  animation: fadeIn 0.5s ease-out;
}

.plane-animation-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 40px;
}

.cloud-float-1, .cloud-float-2 {
  position: absolute;
  animation: cloudFloat 4s ease-in-out infinite;
}

.cloud-float-1 {
  top: 20%;
  left: -60px;
  animation-delay: 0s;
}

.cloud-float-2 {
  top: 60%;
  right: -50px;
  animation-delay: 1s;
}

@keyframes cloudFloat {
  0%, 100% { transform: translateX(0) translateY(0); }
  50% { transform: translateX(20px) translateY(-10px); }
}

/* Empty State Enhanced */
.empty-state-enhanced {
  text-align: center;
  padding: 100px 20px;
  animation: fadeIn 0.5s ease-out;
}

.empty-icon-container {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.float-animation {
  animation: floatUp 3s ease-in-out infinite;
}

.small-float-animation {
  position: absolute;
  top: 10%;
  right: -20%;
  animation: floatRotate 2s ease-in-out infinite;
}

@keyframes floatUp {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes floatRotate {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(10deg); }
}

/* Plan Card Wrapper */
.plan-card-wrapper {
  animation: slideInUp 0.6s ease-out;
  animation-fill-mode: both;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Plan Card Modern */
.plan-card-modern {
  background: rgba(26, 35, 50, 0.85);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(0, 188, 212, 0.25);
  border-radius: 20px;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.plan-card-modern:hover {
  transform: translateY(-10px) scale(1.03);
  border-color: rgba(0, 188, 212, 0.6);
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.5),
    0 0 50px rgba(0, 188, 212, 0.4);
}

.plan-card-modern:hover .card-glow-overlay {
  opacity: 1;
}

.card-glow-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 188, 212, 0.15) 0%, rgba(33, 150, 243, 0.15) 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

/* Favorite Star Badge */
.favorite-star-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255, 193, 7, 0.25);
  backdrop-filter: blur(10px);
  padding: 8px 12px;
  border-radius: 25px;
  border: 2px solid rgba(255, 193, 7, 0.5);
  z-index: 2;
  animation: starPulse 2s ease-in-out infinite;
  box-shadow: 0 0 20px rgba(255, 193, 7, 0.4);
}

@keyframes starPulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(255, 193, 7, 0.4); }
  50% { transform: scale(1.1); box-shadow: 0 0 30px rgba(255, 193, 7, 0.6); }
}

/* Plan Card Sections */
.plan-card-top {
  padding: 24px;
}

.plan-title-modern {
  font-size: 1.2rem;
  font-weight: 700;
  color: #00e5ff;
  text-shadow: 0 0 15px rgba(0, 229, 255, 0.4);
  transition: all 0.3s ease;
  margin-bottom: 8px;
}

.plan-card-modern:hover .plan-title-modern {
  text-shadow: 0 0 25px rgba(0, 229, 255, 0.6);
  transform: translateX(5px);
}

.plan-date-modern {
  font-size: 0.85rem;
  color: #9ca3af;
  display: flex;
  align-items: center;
  gap: 4px;
}

.favorite-btn-modern {
  transition: all 0.3s ease;
}

.favorite-btn-modern:hover {
  transform: scale(1.3) rotate(15deg);
}

.plan-card-middle {
  padding: 20px 24px;
  min-height: 90px;
  background: rgba(0, 0, 0, 0.15);
}

.plan-query-modern {
  font-size: 0.95rem;
  color: #d1d5db;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plan-card-bottom {
  padding: 16px 24px;
  background: rgba(0, 0, 0, 0.25);
}

.plan-action-btn {
  transition: all 0.3s ease;
  font-weight: 600;
}

.plan-action-btn:hover {
  transform: scale(1.1);
}

/* Responsive */
@media (max-width: 1024px) {
  .plans-header-enhanced {
    padding: 12px 16px;
  }
  
  .plan-card-modern {
    margin-bottom: 20px;
  }
}

@media (max-width: 600px) {
  .loading-state-enhanced,
  .empty-state-enhanced {
    padding: 60px 20px;
  }
  
  .empty-icon-container .float-animation {
    font-size: 100px !important;
  }
  
  .plan-title-modern {
    font-size: 1.1rem;
  }
}
/* ===== MODERN KART STİLLERİ ===== */
.modern-plan-card {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
}

.modern-plan-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.card-gradient-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
  opacity: 0;
  transition: opacity 0.3s;
}

.modern-plan-card:hover .card-gradient-border {
  opacity: 1;
}

.card-content {
  position: relative;
  z-index: 1;
}

.plan-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.plan-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.3s;
}

.modern-plan-card:hover .plan-icon {
  transform: rotate(360deg) scale(1.1);
}

.plan-title {
  font-size: 20px;
  font-weight: 700;
  flex: 1;
  background: linear-gradient(135deg, #fff 0%, #a8edea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.plan-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.2s;
}

.info-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(8px);
}

.info-item.highlight {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(129, 199, 132, 0.1));
  border-left: 3px solid #4CAF50;
}

.info-item q-icon {
  color: #667eea;
}

.card-actions {
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
}

.detail-btn-modern {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-weight: 600;
  transition: all 0.3s;
}

.detail-btn-modern:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.5);
}

.card-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: translateX(-100%) translateY(-100%) rotate(45deg);
  transition: transform 0.6s;
}

.modern-plan-card:hover .card-shine {
  transform: translateX(100%) translateY(100%) rotate(45deg);
}

/* ===== TÜRKİYE HARİTAM STİLLERİ ===== */
.turkey-map-card {
  background: linear-gradient(145deg, #0d1b2a 0%, #1b263b 50%, #0d1b2a 100%);
  min-height: 100vh;
}

.turkey-map-header {
  background: linear-gradient(135deg, rgba(0, 188, 212, 0.15) 0%, rgba(0, 150, 170, 0.1) 100%);
  border-bottom: 1px solid rgba(0, 188, 212, 0.2);
  padding: 16px 24px;
}

.turkey-map-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
}

.map-info-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 24px;
  background: linear-gradient(135deg, rgba(0, 188, 212, 0.1) 0%, rgba(0, 150, 170, 0.05) 100%);
  border: 1px solid rgba(0, 188, 212, 0.2);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
}

.turkey-map-d3-container {
  width: 100%;
  max-width: 1000px;
  min-height: 400px;
  background: linear-gradient(145deg, rgba(13, 33, 55, 0.9) 0%, rgba(30, 58, 95, 0.8) 100%);
  border: 1px solid rgba(0, 188, 212, 0.3);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 24px 0;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 60px rgba(0, 188, 212, 0.05);
}

.turkey-map-d3-container svg {
  max-width: 100%;
  height: auto;
}

.turkey-map-d3-container path {
  transition: fill 0.2s ease;
}

.turkey-map-d3-container path:hover {
  filter: brightness(1.2);
}

.map-progress {
  width: 100%;
  max-width: 500px;
  text-align: center;
}

.progress-label {
  margin-top: 8px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

.map-stats {
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
}

.stat-card {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px 32px;
  text-align: center;
  min-width: 160px;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 188, 212, 0.2);
  border-color: rgba(0, 188, 212, 0.3);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  margin: 12px 0 4px;
}

.stat-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

/* ===== ŞANS ÇARKI ULTRA STİLLERİ ===== */
.wheel-dialog-ultra {
  background: linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  min-width: 520px;
  max-width: 600px;
  overflow: hidden;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6), 0 0 100px rgba(102, 126, 234, 0.15);
}

.wheel-header-ultra {
  position: relative;
  padding: 24px 28px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #667eea, #764ba2, transparent);
  animation: glowMove 3s ease-in-out infinite;
}

@keyframes glowMove {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.wheel-icon-wrapper {
  position: relative;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wheel-icon-spin {
  color: #FFD700;
  animation: iconSpin 4s linear infinite;
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
}

@keyframes iconSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.icon-ring {
  position: absolute;
  inset: 0;
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 50%;
  animation: ringPulse 2s ease-in-out infinite;
}

@keyframes ringPulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 0; }
}

.header-text { display: flex; flex-direction: column; }
.wheel-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 0%, #e0e0e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.wheel-subtitle {
  margin: 4px 0 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
}

.close-btn-ultra {
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s;
}
.close-btn-ultra:hover { color: #fff; background: rgba(255, 255, 255, 0.1); }

.wheel-body-ultra {
  padding: 24px 28px 28px;
}

/* Region Selector Pills */
.region-selector-ultra {
  margin-bottom: 24px;
  text-align: center;
}

.region-pill-container {
  display: flex;
  gap: 10px;
  justify-content: center;
  padding: 6px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.region-pill {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.region-pill:hover:not(:disabled) {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

.region-pill.active {
  color: #fff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.region-pill:disabled { opacity: 0.5; cursor: not-allowed; }
.pill-icon { font-size: 1.1rem; }
.pill-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent);
  animation: pillShine 2s ease-in-out infinite;
}

@keyframes pillShine {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

.region-count {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 12px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
}

/* Wheel Stage */
.wheel-stage {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
}

.wheel-outer-ring {
  position: absolute;
  width: 440px;
  height: 440px;
  border-radius: 50%;
  border: 3px solid transparent;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3)) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  transition: all 0.5s;
}

.wheel-outer-ring.spinning {
  animation: ringGlow 0.5s ease-in-out infinite alternate;
}

@keyframes ringGlow {
  from { box-shadow: 0 0 20px rgba(102, 126, 234, 0.3); }
  to { box-shadow: 0 0 40px rgba(118, 75, 162, 0.5); }
}

.wheel-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.wheel-canvas-ultra {
  border-radius: 50%;
  box-shadow: 
    0 0 0 8px rgba(255, 255, 255, 0.1),
    0 0 0 12px rgba(102, 126, 234, 0.2),
    0 20px 60px rgba(0, 0, 0, 0.5),
    inset 0 0 30px rgba(0, 0, 0, 0.3);
}

/* Center Button */
.wheel-center-ultra {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.center-inner {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(145deg, #FFD700 0%, #FF8C00 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a1a2e;
  z-index: 2;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.5);
}

.wheel-center-ultra:hover:not(.disabled) .center-inner {
  transform: scale(1.1);
  box-shadow: 0 8px 30px rgba(255, 215, 0, 0.7);
}

.wheel-center-ultra.disabled { cursor: not-allowed; }
.wheel-center-ultra.disabled .center-inner { opacity: 0.5; }

.center-ring {
  position: absolute;
  inset: 0;
  border: 3px solid rgba(255, 215, 0, 0.4);
  border-radius: 50%;
}

.center-pulse {
  position: absolute;
  inset: -10px;
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 50%;
  animation: centerPulse 2s ease-out infinite;
}

@keyframes centerPulse {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(1.4); opacity: 0; }
}

/* Pointer */
.wheel-pointer-ultra {
  position: absolute;
  top: -15px;
  z-index: 15;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
}

.pointer-svg {
  width: 36px;
  height: 45px;
}

/* Decorative Lights */
.wheel-lights {
  position: absolute;
  width: 460px;
  height: 460px;
  border-radius: 50%;
  pointer-events: none;
}

.light-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #FFD700;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform-origin: 0 0;
  transform: rotate(calc(var(--i) * 22.5deg)) translateX(225px) translateY(-4px);
  animation: lightBlink 1s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.1s);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
}

@keyframes lightBlink {
  0%, 100% { opacity: 0.3; transform: rotate(calc(var(--i) * 22.5deg)) translateX(225px) translateY(-4px) scale(0.8); }
  50% { opacity: 1; transform: rotate(calc(var(--i) * 22.5deg)) translateX(225px) translateY(-4px) scale(1.2); }
}

/* Result Section */
.result-fade-enter-active { animation: resultIn 0.5s ease-out; }
.result-fade-leave-active { animation: resultIn 0.3s ease-in reverse; }

@keyframes resultIn {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.result-section-ultra {
  position: relative;
  margin-top: 24px;
}

.result-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(129, 199, 132, 0.1) 100%);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(76, 175, 80, 0.2);
}

.result-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FFD700 0%, #FFA000 100%);
  border-radius: 16px;
  color: #1a1a2e;
  flex-shrink: 0;
}

.result-content { flex: 1; }
.result-label { font-size: 0.85rem; color: rgba(255, 255, 255, 0.6); }
.result-title {
  margin: 4px 0 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
}

.result-btn {
  flex-shrink: 0;
  font-weight: 600;
  border-radius: 12px;
}

/* Confetti */
.confetti-burst {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.confetti-piece {
  position: absolute;
  width: 10px;
  height: 10px;
  top: 50%;
  left: 50%;
  animation: confettiFall 3s ease-out forwards;
}

@keyframes confettiFall {
  0% { transform: translate(-50%, -50%) rotate(0deg); opacity: 1; }
  100% { transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) rotate(720deg); opacity: 0; }
}

/* Spin Button */
.spin-action-ultra {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.spin-btn-ultra {
  position: relative;
  padding: 16px 48px;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s;
}

.spin-btn-ultra .btn-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  transition: all 0.3s;
}

.spin-btn-ultra:hover:not(:disabled) .btn-bg {
  transform: scale(1.05);
}

.spin-btn-ultra:hover:not(:disabled) {
  box-shadow: 0 8px 30px rgba(17, 153, 142, 0.5);
  transform: translateY(-2px);
}

.spin-btn-ultra:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spin-btn-ultra .btn-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.spin-btn-ultra .spin-icon {
  animation: spinIconRotate 2s linear infinite;
}

@keyframes spinIconRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spin-btn-ultra.spinning .btn-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Legacy styles kept for compatibility */
.result-announcement {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(129, 199, 132, 0.1));
  border: 2px solid #4CAF50;
  border-radius: 16px;
  padding: 24px;
  animation: slideInUp 0.5s ease-out;
}

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

.confetti-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  top: -10px;
  animation: confetti-fall linear forwards;
}

@keyframes confetti-fall {
  to {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

.wheel-box {
  position: relative;
  width: 360px;
  height: 360px;
}

.wheel-visual {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid rgba(0, 188, 212, 0.6);
  box-shadow: 0 0 24px rgba(0, 188, 212, 0.25) inset, 0 0 20px rgba(0,0,0,0.4);
  /* Basit renkli dilimler (placeholder) */
  background: conic-gradient(
    rgba(0, 188, 212, 0.25) 0 60deg,
    rgba(33, 150, 243, 0.25) 60deg 120deg,
    rgba(0, 230, 118, 0.25) 120deg 180deg,
    rgba(255, 193, 7, 0.25) 180deg 240deg,
    rgba(233, 30, 99, 0.25) 240deg 300deg,
    rgba(156, 39, 176, 0.25) 300deg 360deg
  );
}

.wheel-pointer {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 18px solid #00e5ff;
  filter: drop-shadow(0 0 6px rgba(0, 229, 255, 0.7));
  z-index: 3;
}

.wheel-labels {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 88%;
  height: 88%;
  pointer-events: none;
}

.wheel-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: center bottom;
  color: #e5e7eb;
  font-size: 11px;
  font-weight: 700;
  text-shadow: 0 0 8px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,0.8);
  white-space: normal;
  text-align: center;
  max-width: 80px;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.wheel-visual.spinning, .wheel-labels.spinning {
  animation: wheelSpin 1.6s cubic-bezier(0.17, 0.67, 0.2, 1.2);
}

@keyframes wheelSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(720deg); }
}

/* Responsive: küçük ekranlarda çarkı küçült */
@media (max-width: 600px) {
  .wheel-box { width: 260px; height: 260px; }
  .wheel-label { font-size: 9px; max-width: 60px; }
}

/* ===== KARARSIZ KALDIM DIALOG STİLLERİ ===== */
.indecisive-dialog-card, .wheel-dialog-card, .predef-detail-dialog-card {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98)) !important;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(100, 181, 246, 0.2);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

.indecisive-dialog-card .q-bar {
  background: linear-gradient(90deg, rgba(0, 188, 212, 0.15), rgba(33, 150, 243, 0.15));
  border-bottom: 1px solid rgba(0, 188, 212, 0.3);
}

.wheel-dialog-card .q-bar {
  background: linear-gradient(90deg, rgba(156, 39, 176, 0.15), rgba(233, 30, 99, 0.15));
  border-bottom: 1px solid rgba(156, 39, 176, 0.3);
}

.predef-detail-dialog-card .q-bar {
  background: linear-gradient(90deg, rgba(0, 230, 118, 0.15), rgba(0, 188, 212, 0.15));
  border-bottom: 1px solid rgba(0, 230, 118, 0.3);
}

/* Plan kartları */
.indecisive-plan-card {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8)) !important;
  border: 1px solid rgba(100, 181, 246, 0.15) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
}

.indecisive-plan-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 188, 212, 0.1), transparent);
  transition: left 0.5s;
}

.indecisive-plan-card:hover::before {
  left: 100%;
}

.indecisive-plan-card:hover {
  transform: translateY(-4px);
  border-color: rgba(0, 188, 212, 0.4) !important;
  box-shadow: 0 8px 24px rgba(0, 188, 212, 0.2);
}

.indecisive-plan-card .text-subtitle1 {
  color: #e0f2fe;
  font-weight: 700;
  font-size: 1.05rem;
  margin-bottom: 8px;
}

/* Bölge seçim butonları */
.region-select-btn {
  font-size: 1rem !important;
  font-weight: 600 !important;
  padding: 12px 28px !important;
  border-radius: 12px !important;
  transition: all 0.3s ease !important;
}

.region-select-btn:not(.q-btn--outline) {
  box-shadow: 0 4px 12px rgba(0, 188, 212, 0.3);
  animation: regionPulse 2s ease-in-out infinite;
}

@keyframes regionPulse {
  0%, 100% { box-shadow: 0 4px 12px rgba(0, 188, 212, 0.3); }
  50% { box-shadow: 0 6px 20px rgba(0, 188, 212, 0.5); }
}

/* ?ark butonu */
.spin-wheel-btn {
  background: linear-gradient(135deg, #9c27b0, #e91e63) !important;
  font-weight: 600 !important;
  padding: 10px 24px !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 16px rgba(233, 30, 99, 0.4);
  transition: all 0.3s ease !important;
}

.spin-wheel-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 24px rgba(233, 30, 99, 0.6);
}

/* Detay butonu */
.detail-btn {
  background: linear-gradient(135deg, #00bcd4, #2196f3) !important;
  font-weight: 600 !important;
  transition: all 0.3s ease !important;
  border-radius: 8px !important;
}

.detail-btn:hover {
  background: linear-gradient(135deg, #00acc1, #1e88e5) !important;
  box-shadow: 0 4px 12px rgba(0, 188, 212, 0.4);
}

/* Chip'ler */
.region-chip {
  font-weight: 600 !important;
  padding: 8px 16px !important;
}

/* Detay dialog içerik düzeni */
.predef-detail-content {
  background: rgba(15, 23, 42, 0.4);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(100, 181, 246, 0.1);
}

.predef-detail-content .text-subtitle1 {
  color: #67e8f9;
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 12px;
}

.predef-detail-content ul {
  list-style: none;
  padding-left: 0;
}

.predef-detail-content ul li {
  position: relative;
  padding-left: 24px;
  margin-bottom: 8px;
  color: #cbd5e1;
  line-height: 1.6;
}

.predef-detail-content ul li::before {
  content: '-';
  position: absolute;
  left: 0;
  color: #00e5ff;
  font-size: 10px;
}

/* ?ark sonuç alanı */
.wheel-result {
  background: linear-gradient(135deg, rgba(0, 230, 118, 0.15), rgba(0, 188, 212, 0.15));
  border: 2px solid rgba(0, 230, 118, 0.3);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  animation: resultFadeIn 0.5s ease;
}

@keyframes resultFadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

/* Responsive düzenlemeler */
@media (max-width: 768px) {
  .region-select-btn {
    font-size: 0.9rem !important;
    padding: 10px 20px !important;
  }
  
  .indecisive-plan-card .text-subtitle1 {
    font-size: 0.95rem;
  }
}
</style>


