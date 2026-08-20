<template>
  <div class="p-6 max-w-2xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Hồ sơ của tôi</h1>

    <!-- Info card -->
    <div class="card p-6">
      <div class="flex items-center gap-5">
        <UserAvatar :user="authStore.user" size="lg" />
        <div>
          <div class="font-bold text-gray-900 dark:text-white text-lg">{{ authStore.user?.fullname }}</div>
          <div class="text-sm text-gray-400">{{ authStore.user?.email }}</div>
          <div class="badge bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 mt-1.5">
            {{ authStore.user?.role }}
          </div>
        </div>
      </div>

      <div v-if="authStore.user?.referral_code || authStore.user?.affiliate_code" class="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-4 text-sm">
        <div v-if="authStore.user?.referral_code">
          <div class="text-gray-400 text-xs mb-0.5">Mã giới thiệu</div>
          <div class="font-mono font-medium text-gray-900 dark:text-white">{{ authStore.user.referral_code }}</div>
        </div>
        <div v-if="authStore.user?.affiliate_code">
          <div class="text-gray-400 text-xs mb-0.5">Mã affiliate</div>
          <div class="font-mono font-medium text-gray-900 dark:text-white">{{ authStore.user.affiliate_code }}</div>
        </div>
      </div>
    </div>

    <!-- Profile form -->
    <div class="card p-6 space-y-4">
      <h3 class="font-semibold text-gray-900 dark:text-white">Thông tin cá nhân</h3>
      <div>
        <label class="label">Họ và tên</label>
        <input v-model="form.fullname" class="input" placeholder="Nguyễn Văn A" />
      </div>
      <div>
        <label class="label">Email</label>
        <input :value="authStore.user?.email" type="email" class="input opacity-60 cursor-not-allowed" disabled />
        <p class="text-xs text-gray-400 mt-1">Email chỉ dùng để hiển thị, không thể thay đổi</p>
      </div>
      <div>
        <label class="label">Số điện thoại</label>
        <input v-model="form.phone_number" class="input" placeholder="09xxxxxxxx" />
      </div>
      <div v-if="saveError" class="text-sm text-red-500 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">{{ saveError }}</div>
      <div v-if="saveSuccess" class="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm">
        <CheckCircleIcon class="w-4 h-4" /> Lưu thành công!
      </div>
      <div class="flex justify-end">
        <button @click="saveProfile" :disabled="saving" class="btn-primary">
          <span v-if="saving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          Lưu thay đổi
        </button>
      </div>
    </div>

    <!-- Change password (OTP-based, vì API không hỗ trợ đổi bằng mật khẩu cũ) -->
    <div class="card p-6 space-y-4">
      <h3 class="font-semibold text-gray-900 dark:text-white">Đổi mật khẩu</h3>

      <template v-if="pwStage === 'idle'">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Hệ thống sẽ gửi mã OTP đến email <span class="font-medium text-gray-700 dark:text-gray-200">{{ authStore.user?.email }}</span> để xác nhận đổi mật khẩu.
        </p>
        <div v-if="passwordError" class="text-sm text-red-500 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">{{ passwordError }}</div>
        <div class="flex justify-end">
          <button @click="sendChangePasswordOtp" :disabled="changingPassword" class="btn-primary">
            <span v-if="changingPassword" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Gửi mã OTP
          </button>
        </div>
      </template>

      <template v-else-if="pwStage === 'confirm'">
        <div>
          <label class="label">Mã OTP</label>
          <input v-model="passwordForm.otp" inputmode="numeric" maxlength="6" class="input font-mono tracking-[0.4em] text-center" placeholder="------" />
        </div>
        <div>
          <label class="label">Mật khẩu mới</label>
          <input v-model="passwordForm.new_password" type="password" class="input" placeholder="Ít nhất 6 ký tự" />
        </div>
        <div>
          <label class="label">Xác nhận mật khẩu mới</label>
          <input v-model="passwordForm.new_password2" type="password" class="input" />
        </div>
        <div v-if="passwordError" class="text-sm text-red-500 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">{{ passwordError }}</div>
        <div class="flex items-center justify-between">
          <button
            type="button"
            class="text-xs text-brand-600 hover:text-brand-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="resendCooldown > 0"
            @click="sendChangePasswordOtp"
          >
            {{ resendCooldown > 0 ? `Gửi lại mã (${resendCooldown}s)` : 'Gửi lại mã' }}
          </button>
          <button @click="confirmChangePassword" :disabled="changingPassword" class="btn-primary">
            <span v-if="changingPassword" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Xác nhận đổi mật khẩu
          </button>
        </div>
      </template>

      <template v-else>
        <div class="text-sm text-green-600 dark:text-green-400 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          Đổi mật khẩu thành công! Vì lý do bảo mật, bạn cần đăng nhập lại...
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckCircleIcon } from '@heroicons/vue/24/outline'

definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const router = useRouter()
const config = useRuntimeConfig()

const saving = ref(false)
const saveSuccess = ref(false)
const saveError = ref('')

const form = reactive({
  fullname: authStore.user?.fullname || '',
  phone_number: authStore.user?.phone_number || '',
})

watch(() => authStore.user, (user) => {
  if (!user) return
  form.fullname = user.fullname || ''
  form.phone_number = user.phone_number || ''
}, { immediate: true })

onMounted(() => {
  if (!authStore.user) authStore.fetchProfile()
})

// idle -> confirm (đã gửi OTP, chờ nhập) -> done
const pwStage = ref<'idle' | 'confirm' | 'done'>('idle')
const changingPassword = ref(false)
const passwordError = ref('')
const resendCooldown = ref(0)
let resendTimer: ReturnType<typeof setInterval> | null = null

const passwordForm = reactive({
  otp: '', new_password: '', new_password2: '',
})

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

async function saveProfile() {
  saving.value = true
  saveSuccess.value = false
  saveError.value = ''
  try {
    const response = await fetch(`${config.public.apiBase}/api/account/me/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${authStore.token}`,
      },
      body: JSON.stringify({
        fullname: form.fullname,
        phone_number: form.phone_number,
      }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data?.message || 'Cập nhật thất bại')
    }
    authStore.setUser(data.data)
    saveSuccess.value = true
    setTimeout(() => (saveSuccess.value = false), 3000)
  } catch (err: any) {
    saveError.value = err?.message || 'Cập nhật thất bại'
  } finally {
    saving.value = false
  }
}

// Bước 1: gửi OTP về chính email của user đang đăng nhập
async function sendChangePasswordOtp() {
  if (!authStore.user?.email) return
  changingPassword.value = true
  passwordError.value = ''
  try {
    const response = await fetch(`${config.public.apiBase}/api/account/forgot-password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: authStore.user.email }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data?.message || 'Gửi mã OTP thất bại')
    }
    pwStage.value = 'confirm'
    startResendCooldown()
  } catch (err: any) {
    passwordError.value = err?.message || 'Gửi mã OTP thất bại'
  } finally {
    changingPassword.value = false
  }
}

// Bước 2: xác nhận OTP + mật khẩu mới
async function confirmChangePassword() {
  if (passwordForm.new_password !== passwordForm.new_password2) {
    passwordError.value = 'Mật khẩu không khớp'
    return
  }
  changingPassword.value = true
  passwordError.value = ''
  try {
    const response = await fetch(`${config.public.apiBase}/api/account/reset-password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: authStore.user!.email,
        otp: passwordForm.otp,
        new_password: passwordForm.new_password,
      }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data?.message || 'Đổi mật khẩu thất bại')
    }
    pwStage.value = 'done'
    // Token cũ đã bị BE xóa sau khi reset -> đăng xuất phía FE và chuyển về login
    setTimeout(async () => {
      await authStore.logout()
      router.push('/login')
    }, 1500)
  } catch (err: any) {
    passwordError.value = err?.message || 'Đổi mật khẩu thất bại'
  } finally {
    changingPassword.value = false
  }
}
</script>