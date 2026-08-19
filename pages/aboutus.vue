<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <div class="max-w-3xl mx-auto px-4 py-10 sm:py-14">
      <!-- Badge -->
      <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 text-brand-600 text-xs font-semibold mb-5">
        <UserGroupIcon class="w-3.5 h-3.5" />
        GIỚI THIỆU VỀ CHÚNG TÔI
      </div>

      <!-- Heading -->
      <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
        Chào mừng bạn đến với <span class="text-brand-600">MeMoon</span>
      </h1>
      <p class="text-gray-500 dark:text-gray-400 mb-8">
        Kết nối mua sắm trực tuyến, tích lũy thông minh
      </p>

      <!-- Main card -->
      <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 sm:p-8 space-y-10">
        <!-- Sứ mệnh & Tầm nhìn -->
        <section>
          <h2 class="flex items-center gap-2.5 text-lg font-bold text-gray-900 dark:text-white mb-4">
            <span class="w-1 h-5 rounded-full bg-brand-600"></span>
            Sứ mệnh & Tầm nhìn
          </h2>
          <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-300 mb-4">
            Trong kỷ nguyên bùng nổ của thương mại điện tử, việc tối ưu hóa chi tiêu đã trở thành một nhu cầu
            thiết yếu đối với người tiêu dùng thông minh. Sứ mệnh của <strong class="text-gray-900 dark:text-white">MeMoon</strong>
            là mang lại một giải pháp mua sắm kinh tế nhất:
            <strong class="text-gray-900 dark:text-white">"Giúp mọi người mua online bất cứ thứ gì cũng rẻ hơn"</strong>.
          </p>
          <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            Tầm nhìn của chúng tôi là trở thành trợ lý mua sắm và hoàn tiền tích lũy hàng đầu Việt Nam, giúp mọi
            đơn hàng trực tuyến của bạn đều được sinh lời trực tiếp và tối ưu hóa tối đa giá trị thực tế của mỗi
            đồng tiền bạn tiêu dùng.
          </p>
        </section>

        <!-- Mô hình hoạt động -->
        <section>
          <h2 class="flex items-center gap-2.5 text-lg font-bold text-gray-900 dark:text-white mb-4">
            <span class="w-1 h-5 rounded-full bg-brand-600"></span>
            Mô hình hoạt động của MeMoon
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-5">
            Chúng tôi hoạt động dựa trên mô hình tiếp thị liên kết (Affiliate Marketing) minh bạch và đôi bên
            cùng có lợi (Win - Win):
          </p>
          <div class="grid sm:grid-cols-3 gap-4">
            <div
              v-for="step in steps"
              :key="step.number"
              class="rounded-xl border p-4"
              :class="step.highlight ? 'border-brand-200 bg-brand-50/50 dark:bg-brand-900/10' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40'"
            >
              <div
                class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-3"
                :class="step.highlight ? 'bg-brand-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'"
              >
                {{ step.number }}
              </div>
              <div
                class="font-semibold text-sm mb-1.5"
                :class="step.highlight ? 'text-brand-600' : 'text-gray-900 dark:text-white'"
              >
                {{ step.title }}
              </div>
              <p class="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                <template v-if="step.boldParts">
                  <template v-for="(part, i) in step.boldParts" :key="i">
                    <strong v-if="part.bold" class="text-gray-700 dark:text-gray-200">{{ part.text }}</strong>
                    <template v-else>{{ part.text }}</template>
                  </template>
                </template>
                <template v-else>{{ step.description }}</template>
              </p>
            </div>
          </div>
        </section>

        <!-- Giá trị cốt lõi -->
        <section>
          <h2 class="flex items-center gap-2.5 text-lg font-bold text-gray-900 dark:text-white mb-4">
            <span class="w-1 h-5 rounded-full bg-brand-600"></span>
            Giá trị cốt lõi
          </h2>
          <div class="grid sm:grid-cols-3 gap-4">
            <div
              v-for="value in coreValues"
              :key="value.title"
              class="rounded-xl border border-gray-100 dark:border-gray-800 p-4"
            >
              <div class="w-9 h-9 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 mb-3">
                <component :is="value.icon" class="w-5 h-5" />
              </div>
              <div class="font-semibold text-sm text-gray-900 dark:text-white mb-1.5">{{ value.title }}</div>
              <p class="text-xs leading-relaxed text-gray-500 dark:text-gray-400">{{ value.description }}</p>
            </div>
          </div>
        </section>

        <!-- Mục tiêu -->
        <section>
          <h2 class="flex items-center gap-2.5 text-lg font-bold text-gray-900 dark:text-white mb-4">
            <span class="w-1 h-5 rounded-full bg-brand-600"></span>
            Mục tiêu của chúng tôi
          </h2>
          <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            MeMoon đang hướng tới việc
            <strong class="text-gray-900 dark:text-white">tích hợp sâu rộng hầu hết các sàn thương mại điện tử hàng đầu tại Việt Nam</strong>
            (bao gồm Shopee, Lazada, Tiki, TikTok Shop...) cùng hàng loạt thương hiệu dịch vụ ăn uống, đặt vé máy
            bay, du lịch khác. Mục tiêu của chúng tôi là phủ sóng 100% nhu cầu trực tuyến của bạn, cứ hễ bạn phát
            sinh giao dịch online là có MeMoon đồng hành hoàn tiền.
          </p>
        </section>

        <!-- Thông tin liên hệ -->
        <section>
          <h2 class="flex items-center gap-2.5 text-lg font-bold text-gray-900 dark:text-white mb-4">
            <span class="w-1 h-5 rounded-full bg-brand-600"></span>
            Thông tin liên hệ
          </h2>
          <div class="rounded-xl border border-gray-100 dark:border-gray-800 p-5">
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-5">
              Nếu có bất kỳ thắc mắc, đề xuất hợp tác hoặc cần hỗ trợ về dịch vụ hoàn tiền, vui lòng kết nối với
              nhóm phát triển của chúng tôi:
            </p>
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="flex gap-3 rounded-lg border border-gray-100 dark:border-gray-800 p-4">
                <MapPinIcon class="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div>
                  <div class="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">Đơn vị chủ quản</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Nhóm phát triển MeMoon</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Địa chỉ: A14B2 Yên Hòa, Cầu Giấy, Hà Nội</div>
                </div>
              </div>
              <div class="flex gap-3 rounded-lg border border-gray-100 dark:border-gray-800 p-4">
                <EnvelopeIcon class="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div>
                  <div class="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">Kênh hỗ trợ trực tuyến</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    Mọi yêu cầu kỹ thuật xin gửi về hòm thư:
                    <a href="mailto:support@MeMoon.vn" class="text-brand-600 hover:text-brand-700 font-medium underline">
                      support@MeMoon.vn
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Footer -->
      <p class="text-center text-xs text-gray-400 mt-8">
        © {{ new Date().getFullYear() }} MeMoon.vn · Mua sắm thả ga, hoàn tiền cực đã
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  UserGroupIcon,
  MapPinIcon,
  EnvelopeIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/vue/24/outline'

definePageMeta({ layout: 'default' })

const steps = [
  {
    number: 1,
    title: 'Mua sắm liên kết',
    description: 'Bạn truy cập các sàn TMĐT (Shopee, Lazada, Tiki...) thông qua các liên kết mua sắm được cấu hình trên MeMoon.',
    highlight: false,
  },
  {
    number: 2,
    title: 'Nhận hoa hồng',
    description: 'Khi đơn hàng hoàn thành thành công, các đối tác thương mại điện tử sẽ chi trả một khoản hoa hồng tiếp thị cho MeMoon.',
    highlight: false,
  },
  {
    number: 3,
    title: 'Chia sẻ hoàn tiền',
    highlight: true,
    boldParts: [
      { text: 'Chúng tôi không giữ lại toàn bộ mà ', bold: false },
      { text: 'chia sẻ lại phần lớn số tiền hoa hồng này', bold: true },
      { text: ' cho bạn dưới dạng tiền tích lũy trực tiếp vào ví MeMoon.', bold: false },
    ],
  },
]

const coreValues = [
  {
    title: 'Lợi ích tối đa',
    description: 'MeMoon luôn nỗ lực tối ưu hệ thống, nâng cao tỉ lệ hoàn tiền để mang lại giá trị chiết khấu thực tế cao nhất cho người dùng.',
    icon: BanknotesIcon,
  },
  {
    title: 'Uy tín rút tiền',
    description: 'Mọi khoản tích lũy của bạn được quản lý và đối soát cực kỳ rõ ràng, minh bạch. Đảm bảo hỗ trợ rút tiền nhanh chóng về MoMo, ngân hàng.',
    icon: BuildingLibraryIcon,
  },
  {
    title: 'Hỗ trợ nhanh chóng',
    description: 'Đội ngũ kỹ thuật và chăm sóc khách hàng luôn túc trực, phản hồi và giải quyết các khiếu nại về đơn hàng hay lệnh rút tiền nhanh nhất.',
    icon: QuestionMarkCircleIcon,
  },
]
</script>