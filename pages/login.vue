<template>
  <div>
    <!-- Đăng nhập -->
    <template v-if="stage === 'login'">
      <h1 class="text-xl font-bold text-gray-900 mb-1">Đăng nhập</h1>
      <p class="text-sm text-gray-500 mb-6">Chào mừng trở lại IDT</p>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="you@company.com"
            class="auth-input"
            required
          />
        </div>
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-xs font-medium text-gray-600">Mật khẩu</label>
            <button
              type="button"
              class="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
              @click="openForgot"
            >
              Quên mật khẩu?
            </button>
          </div>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPass ? 'text' : 'password'"
              placeholder="••••••••"
              class="auth-input pr-10"
              required
            />
            <button
              type="button"
              @click="showPass = !showPass"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <EyeIcon v-if="!showPass" class="w-4 h-4" />
              <EyeSlashIcon v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div v-if="error" class="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
          <ExclamationCircleIcon class="w-4 h-4 flex-shrink-0 mt-0.5" />
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-brand-600/25"
        >
          <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-gray-500">
        Chưa có tài khoản?
        <NuxtLink to="/register" class="text-brand-600 hover:text-brand-700 font-medium transition-colors">Đăng ký ngay</NuxtLink>
      </p>
    </template>

    <!-- Quên mật khẩu - Bước 1: nhập email -->
    <template v-else-if="stage === 'forgot-email'">
      <button
        type="button"
        class="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        @click="closeForgot"
      >
        <ArrowLeftIcon class="w-3.5 h-3.5" />
        Quay lại đăng nhập
      </button>

      <h1 class="text-xl font-bold text-gray-900 mb-1">Quên mật khẩu</h1>
      <p class="text-sm text-gray-500 mb-6">Nhập email để nhận mã OTP đặt lại mật khẩu</p>

      <form @submit.prevent="handleSendOtp" class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
          <input
            v-model="forgotForm.email"
            type="email"
            placeholder="you@company.com"
            class="auth-input"
            required
          />
        </div>

        <div v-if="forgotError" class="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
          <ExclamationCircleIcon class="w-4 h-4 flex-shrink-0 mt-0.5" />
          {{ forgotError }}
        </div>

        <button
          type="submit"
          :disabled="forgotLoading"
          class="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-brand-600/25"
        >
          <span v-if="forgotLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {{ forgotLoading ? 'Đang gửi mã...' : 'Gửi mã OTP' }}
        </button>
      </form>
    </template>

    <!-- Quên mật khẩu - Bước 2: nhập OTP + mật khẩu mới -->
    <template v-else-if="stage === 'forgot-reset'">
      <button
        type="button"
        class="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        @click="stage = 'forgot-email'"
      >
        <ArrowLeftIcon class="w-3.5 h-3.5" />
        Quay lại
      </button>

      <h1 class="text-xl font-bold text-gray-900 mb-1">Đặt lại mật khẩu</h1>
      <p class="text-sm text-gray-500 mb-6">
        Nhập mã OTP đã gửi đến
        <span class="font-medium text-gray-700">{{ forgotForm.email }}</span>
        và mật khẩu mới
      </p>

      <form @submit.prevent="handleResetPassword" class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1.5">Mã OTP</label>
          <input
            v-model="forgotForm.otp"
            inputmode="numeric"
            maxlength="6"
            class="auth-input text-center tracking-[0.5em] font-mono text-lg"
            placeholder="------"
            required
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1.5">Mật khẩu mới</label>
          <div class="relative">
            <input
              v-model="forgotForm.new_password"
              :type="showNewPass ? 'text' : 'password'"
              placeholder="Ít nhất 6 ký tự"
              class="auth-input pr-10"
              required
              minlength="6"
            />
            <button
              type="button"
              @click="showNewPass = !showNewPass"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <EyeIcon v-if="!showNewPass" class="w-4 h-4" />
              <EyeSlashIcon v-else class="w-4 h-4" />
            </button>
          </div>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1.5">Xác nhận mật khẩu mới</label>
          <div class="relative">
            <input
              v-model="forgotForm.new_password2"
              :type="showNewPass2 ? 'text' : 'password'"
              placeholder="Nhập lại mật khẩu"
              class="auth-input pr-16"
              required
            />
            <div v-if="forgotForm.new_password2" class="absolute right-9 top-1/2 -translate-y-1/2">
              <CheckCircleIcon v-if="forgotPasswordsMatch" class="w-4 h-4 text-green-600" />
              <XCircleIcon v-else class="w-4 h-4 text-red-500" />
            </div>
            <button
              type="button"
              @click="showNewPass2 = !showNewPass2"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <EyeIcon v-if="!showNewPass2" class="w-4 h-4" />
              <EyeSlashIcon v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div v-if="forgotError" class="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
          <ExclamationCircleIcon class="w-4 h-4 flex-shrink-0 mt-0.5" />
          {{ forgotError }}
        </div>

        <button
          type="submit"
          :disabled="forgotLoading"
          class="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-brand-600/25"
        >
          <span v-if="forgotLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {{ forgotLoading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu' }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-gray-500">
        Không nhận được mã?
        <button
          type="button"
          class="text-brand-600 hover:text-brand-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="resendCooldown > 0 || resendLoading"
          @click="handleResendOtp"
        >
          {{ resendCooldown > 0 ? `Gửi lại (${resendCooldown}s)` : (resendLoading ? 'Đang gửi...' : 'Gửi lại mã') }}
        </button>
      </p>
    </template>

    <!-- Quên mật khẩu - thành công -->
    <template v-else>
      <div class="text-center py-4 space-y-4">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 text-green-600">
          <CheckCircleIcon class="w-7 h-7" />
        </div>
        <p class="text-sm text-gray-600">Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.</p>
        <button
          type="button"
          class="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md shadow-brand-600/25"
          @click="closeForgotAfterSuccess"
        >
          Đăng nhập
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/vue/24/outline'

definePageMeta({ layout: 'auth' })

const authStore = useAuthStore()
const router = useRouter()
const config = useRuntimeConfig()

const form = reactive({ email: '', password: '' })
const forgotForm = reactive({ email: '', otp: '', new_password: '', new_password2: '' })

const loading = ref(false)
const error = ref('')
const showPass = ref(false)

// login | forgot-email | forgot-reset | forgot-success
const stage = ref<'login' | 'forgot-email' | 'forgot-reset' | 'forgot-success'>('login')

const forgotLoading = ref(false)
const forgotError = ref('')
const showNewPass = ref(false)
const showNewPass2 = ref(false)

const resendLoading = ref(false)
const resendCooldown = ref(0)
let resendTimer: ReturnType<typeof setInterval> | null = null

const forgotPasswordsMatch = computed(
  () => !!forgotForm.new_password2 && forgotForm.new_password === forgotForm.new_password2
)

function startResendCooldown(seconds = 60) {
  resendCooldown.value = seconds
  if (resendTimer) clearInterval(resendTimer)
  resendTimer = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0 && resendTimer) {
      clearInterval(resendTimer)
      resendTimer = null
    }
  }, 1000)
}

onBeforeUnmount(() => {
  if (resendTimer) clearInterval(resendTimer)
})

function openForgot() {
  stage.value = 'forgot-email'
  forgotError.value = ''
  forgotForm.email = form.email
  forgotForm.otp = ''
  forgotForm.new_password = ''
  forgotForm.new_password2 = ''
}

function closeForgot() {
  stage.value = 'login'
  forgotError.value = ''
  if (resendTimer) {
    clearInterval(resendTimer)
    resendTimer = null
  }
  resendCooldown.value = 0
  Object.assign(forgotForm, { email: '', otp: '', new_password: '', new_password2: '' })
}

function closeForgotAfterSuccess() {
  form.email = forgotForm.email
  form.password = ''
  closeForgot()
}

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    await authStore.login(form.email, form.password)
    router.push('/')
  } catch (err: any) {
    const data = err?.data || err
    error.value = data?.message || data?.detail || 'Đăng nhập thất bại'
  } finally {
    loading.value = false
  }
}

// Bước 1: Gửi email -> BE gửi OTP reset password
async function handleSendOtp() {
  forgotLoading.value = true
  forgotError.value = ''
  try {
    const response = await fetch(`${config.public.apiBase}/api/account/forgot-password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: forgotForm.email }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data?.message || 'Gửi mã OTP thất bại')
    }
    stage.value = 'forgot-reset'
    startResendCooldown()
  } catch (err: any) {
    forgotError.value = err?.message || 'Gửi mã OTP thất bại'
  } finally {
    forgotLoading.value = false
  }
}

async function handleResendOtp() {
  resendLoading.value = true
  forgotError.value = ''
  try {
    const response = await fetch(`${config.public.apiBase}/api/account/forgot-password/resend-otp/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: forgotForm.email }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data?.message || 'Gửi lại mã thất bại')
    }
    startResendCooldown()
  } catch (err: any) {
    forgotError.value = err?.message || 'Gửi lại mã thất bại'
  } finally {
    resendLoading.value = false
  }
}

// Bước 2: Xác nhận OTP + mật khẩu mới -> BE đổi mật khẩu, xóa token cũ
async function handleResetPassword() {
  if (forgotForm.new_password !== forgotForm.new_password2) {
    forgotError.value = 'Mật khẩu không khớp'
    return
  }

  forgotLoading.value = true
  forgotError.value = ''
  try {
    const response = await fetch(`${config.public.apiBase}/api/account/reset-password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: forgotForm.email,
        otp: forgotForm.otp,
        new_password: forgotForm.new_password,
      }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data?.message || 'Đặt lại mật khẩu thất bại')
    }
    stage.value = 'forgot-success'
  } catch (err: any) {
    forgotError.value = err?.message || 'Đặt lại mật khẩu thất bại'
  } finally {
    forgotLoading.value = false
  }
}
</script>

<style scoped>
.auth-input {
  @apply w-full px-3.5 py-2.5 bg-white border border-surface-200 rounded-lg text-gray-900
         placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40
         focus:border-brand-400 text-sm transition-all shadow-sm;
}
</style>