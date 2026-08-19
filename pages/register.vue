<template>
  <div>
    <!-- BƯỚC 1: NHẬP THÔNG TIN ĐĂNG KÝ -->
    <template v-if="step === 'form'">
      <h1 class="text-xl font-bold text-gray-900 mb-1">Tạo tài khoản</h1>
      <p class="text-sm text-gray-500 mb-6">Bắt đầu nhận CashBack với MEMOON</p>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1.5">Họ và tên</label>
          <input v-model="form.fullname" class="auth-input" placeholder="Nguyễn Văn A" required />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
          <input v-model="form.email" type="email" class="auth-input" placeholder="you@company.com" required />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1.5">Số điện thoại</label>
          <input v-model="form.phone_number" class="auth-input" placeholder="09xxxxxxxx" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1.5">Mật khẩu</label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPass ? 'text' : 'password'"
              class="auth-input pr-10"
              placeholder="Ít nhất 6 ký tự"
              required
              minlength="6"
            />
            <button
              type="button"
              @click="showPass = !showPass"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              :title="showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
            >
              <EyeIcon v-if="!showPass" class="w-4 h-4" />
              <EyeSlashIcon v-else class="w-4 h-4" />
            </button>
          </div>
          <!-- Password strength meter -->
          <div v-if="form.password" class="mt-1.5 flex items-center gap-2">
            <div class="flex-1 flex gap-1">
              <div
                v-for="i in 4" :key="i"
                class="h-1 flex-1 rounded-full transition-colors"
                :class="passStrength >= i ? strengthBarColor : 'bg-gray-200'"
              ></div>
            </div>
            <span class="text-[10px] font-medium" :class="strengthTextColor">{{ strengthLabel }}</span>
          </div>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1.5">Xác nhận mật khẩu</label>
          <div class="relative">
            <input
              v-model="form.password2"
              :type="showPass2 ? 'text' : 'password'"
              class="auth-input pr-16"
              placeholder="Nhập lại mật khẩu"
              required
            />
            <div v-if="form.password2" class="absolute right-9 top-1/2 -translate-y-1/2">
              <CheckCircleIcon v-if="passwordsMatch" class="w-4 h-4 text-green-600" />
              <XCircleIcon v-else class="w-4 h-4 text-red-500" />
            </div>
            <button
              type="button"
              @click="showPass2 = !showPass2"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              :title="showPass2 ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
            >
              <EyeIcon v-if="!showPass2" class="w-4 h-4" />
              <EyeSlashIcon v-else class="w-4 h-4" />
            </button>
          </div>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1.5">Mã giới thiệu (nếu có)</label>
          <input v-model="form.referral_code" class="auth-input font-mono" placeholder="ABC123" />
        </div>

        <div v-if="error" class="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
          <ExclamationCircleIcon class="w-4 h-4 flex-shrink-0 mt-0.5" />
          {{ error }}
        </div>

        <button type="submit" :disabled="loading" class="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-brand-600/25">
          <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {{ loading ? 'Đang gửi mã OTP...' : 'Đăng ký' }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-gray-500">
        Đã có tài khoản?
        <NuxtLink to="/login" class="text-brand-600 hover:text-brand-700 font-medium">Đăng nhập</NuxtLink>
      </p>
    </template>

    <!-- BƯỚC 2: XÁC NHẬN OTP -->
    <template v-else>
      <button
        type="button"
        class="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        @click="backToForm"
      >
        <ArrowLeftIcon class="w-3.5 h-3.5" />
        Quay lại
      </button>

      <h1 class="text-xl font-bold text-gray-900 mb-1">Xác nhận email</h1>
      <p class="text-sm text-gray-500 mb-6">
        Nhập mã OTP đã được gửi đến
        <span class="font-medium text-gray-700">{{ form.email }}</span>
      </p>

      <form @submit.prevent="handleVerifyOtp" class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1.5">Mã OTP</label>
          <input
            v-model="otp"
            inputmode="numeric"
            maxlength="6"
            class="auth-input text-center tracking-[0.5em] font-mono text-lg"
            placeholder="------"
            required
          />
        </div>

        <div v-if="otpError" class="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
          <ExclamationCircleIcon class="w-4 h-4 flex-shrink-0 mt-0.5" />
          {{ otpError }}
        </div>

        <button type="submit" :disabled="otpLoading" class="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-brand-600/25">
          <span v-if="otpLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {{ otpLoading ? 'Đang xác nhận...' : 'Xác nhận' }}
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
  </div>
</template>

<script setup lang="ts">
import {
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/vue/24/outline'

definePageMeta({ layout: 'auth' })

const authStore = useAuthStore()
const router = useRouter()
const config = useRuntimeConfig()

const step = ref<'form' | 'otp'>('form')

const form = reactive({
  email: '',
  fullname: '',
  phone_number: '',
  password: '',
  password2: '',
  referral_code: '',
})

const loading = ref(false)
const error = ref('')
const showPass = ref(false)
const showPass2 = ref(false)

const otp = ref('')
const otpLoading = ref(false)
const otpError = ref('')

const resendLoading = ref(false)
const resendCooldown = ref(0)
let resendTimer: ReturnType<typeof setInterval> | null = null

const passStrength = computed(() => {
  const p = form.password
  if (!p) return 0
  let score = 0
  if (p.length >= 6) score++
  if (p.length >= 12) score++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) score++
  return Math.min(score, 4)
})

const strengthLabel = computed(() => ['Yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'][passStrength.value] || '')
const strengthBarColor = computed(() => {
  const s = passStrength.value
  if (s <= 1) return 'bg-red-500'
  if (s === 2) return 'bg-orange-400'
  if (s === 3) return 'bg-yellow-400'
  return 'bg-green-500'
})
const strengthTextColor = computed(() => {
  const s = passStrength.value
  if (s <= 1) return 'text-red-600'
  if (s === 2) return 'text-orange-600'
  if (s === 3) return 'text-yellow-700'
  return 'text-green-600'
})

const passwordsMatch = computed(() => !!form.password2 && form.password === form.password2)

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

// BƯỚC 1: Gửi thông tin đăng ký -> BE gửi OTP
async function handleRegister() {
  if (form.password !== form.password2) {
    error.value = 'Mật khẩu không khớp'
    return
  }

  loading.value = true
  error.value = ''
  try {
    const response = await fetch(`${config.public.apiBase}/api/account/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email,
        fullname: form.fullname,
        phone_number: form.phone_number || undefined,
        password: form.password,
        referral_code: form.referral_code || undefined,
      }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data?.message || 'Đăng ký thất bại')
    }
    step.value = 'otp'
    otpError.value = ''
    otp.value = ''
    startResendCooldown()
  } catch (err: any) {
    error.value = err?.message || 'Đăng ký thất bại'
  } finally {
    loading.value = false
  }
}

// BƯỚC 2: Xác nhận OTP -> BE tạo User + trả token
async function handleVerifyOtp() {
  otpLoading.value = true
  otpError.value = ''
  try {
    const response = await fetch(`${config.public.apiBase}/api/account/register/verify-otp/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email, otp: otp.value }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data?.message || 'Mã OTP không chính xác')
    }

    const { token, ...user } = data.data
    authStore.setToken(token)
    authStore.setUser(user)
    router.push('/')
  } catch (err: any) {
    otpError.value = err?.message || 'Xác nhận OTP thất bại'
  } finally {
    otpLoading.value = false
  }
}

async function handleResendOtp() {
  resendLoading.value = true
  otpError.value = ''
  try {
    const response = await fetch(`${config.public.apiBase}/api/account/register/resend-otp/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data?.message || 'Gửi lại mã thất bại')
    }
    startResendCooldown()
  } catch (err: any) {
    otpError.value = err?.message || 'Gửi lại mã thất bại'
  } finally {
    resendLoading.value = false
  }
}

function backToForm() {
  step.value = 'form'
  otp.value = ''
  otpError.value = ''
  if (resendTimer) {
    clearInterval(resendTimer)
    resendTimer = null
  }
  resendCooldown.value = 0
}
</script>

<style scoped>
.auth-input {
  @apply w-full px-3.5 py-2.5 bg-white border border-surface-200 rounded-lg text-gray-900
         placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40
         focus:border-brand-400 text-sm transition-all shadow-sm;
}
</style>