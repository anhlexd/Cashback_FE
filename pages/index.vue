<template>
  <div class="min-h-screen bg-white text-[#202124] dark:bg-gray-950 dark:text-white">

    <!-- =========================================================
         HERO
    ========================================================== -->
    <section class="relative overflow-hidden">
      <div
        class="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.08fr_.92fr] lg:px-10 lg:pb-28 lg:pt-20"
      >

        <!-- LEFT -->
        <div class="relative z-10">

          <!-- Trust badge -->
          <div
            class="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3.5 py-2 text-[11px] font-semibold text-orange-500 shadow-sm dark:border-orange-900/50 dark:bg-gray-900"
          >
            <span
              class="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,.10)]"
            />

            <span class="text-gray-500 dark:text-gray-300">
              ♡
            </span>

            <span>
              Trợ lý mua sắm của 2.300+ người dùng thông thái
            </span>
          </div>

          <!-- Heading -->
          <h1
            class="max-w-[760px] text-[44px] font-black leading-[.98] tracking-[-2.5px] text-[#17181a] sm:text-[56px] lg:text-[62px] xl:text-[68px] dark:text-white"
          >
            Sắm Shopee, TikTok,
            <br />

            Lazada, ShopeeFood

            <br />

            <span class="text-[#ff4b0b]">
              Hoàn tiền lên tới 100%
            </span>

            hoa hồng
          </h1>

          <!-- Description -->
          <p
            class="mt-7 max-w-[690px] text-[15px] leading-6 text-gray-500 sm:text-[16px]"
          >
            Cập nhật voucher, mã giảm giá liên tục mỗi giờ.
            Rút tiền về ngân hàng 24/7 nhanh chóng.
          </p>

          <!-- Search label -->
          <div
            class="mt-9 flex max-w-[675px] items-center justify-between px-1"
          >
            <span
              class="text-[10px] font-bold uppercase tracking-wider text-gray-400"
            >
              DÁN LINK TỪ ỨNG DỤNG:
            </span>

            <div class="flex items-center gap-1.5">

              <span
                class="rounded-md bg-orange-50 px-2 py-1 text-[9px] font-bold text-orange-500"
              >
                Shopee
              </span>

              <span
                class="rounded-md bg-cyan-50 px-2 py-1 text-[9px] font-bold text-cyan-500"
              >
                TikTok
              </span>

              <span
                class="rounded-md bg-pink-50 px-2 py-1 text-[9px] font-bold text-pink-500"
              >
                Lazada
              </span>

              <span
                class="rounded-md bg-orange-50 px-2 py-1 text-[9px] font-bold text-orange-600"
              >
                ShopeeFood
              </span>

            </div>
          </div>

          <!-- Search -->
          <form
            @submit.prevent="handleSubmit"
            class="mt-2 flex h-12 w-full max-w-[675px] items-center rounded-2xl border border-gray-200 bg-white p-1 shadow-[0_4px_16px_rgba(0,0,0,.04)] transition-all focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100 dark:border-gray-700 dark:bg-gray-900 dark:focus-within:border-orange-500 dark:focus-within:ring-orange-950/40"
          >
            <input
              v-model="productUrl"
              type="url"
              placeholder="Dán link sản phẩm Shopee, TikTok, Lazada hoặc ShopeeFood..."
              class="min-w-0 flex-1 bg-transparent px-4 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:ring-0 sm:text-[13px] dark:text-white dark:placeholder:text-gray-500"
            />

            <button
              type="submit"
              :disabled="submitting"
              class="h-10 shrink-0 rounded-xl border border-gray-100 bg-gray-50 px-5 text-[10px] font-bold tracking-wide text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-60 sm:px-6 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <span
                v-if="submitting"
                class="mr-1.5 inline-block h-3.5 w-3.5 align-[-2px] animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"
              />

              <span v-else>
                KIỂM TRA HOÀN TIỀN
              </span>
            </button>
          </form>

          <!-- Error -->
          <div
            v-if="error"
            class="mt-3 flex max-w-[675px] items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600"
          >
            <ExclamationCircleIcon class="h-4 w-4 shrink-0" />
            {{ error }}
          </div>

        </div>

        <!-- RIGHT PHONE -->
        <div
          class="relative flex min-h-[570px] items-center justify-center lg:min-h-[650px]"
        >

          <!-- Orange glow -->
          <div
            class="absolute right-5 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-orange-100/70 blur-[90px]"
          />

          <!-- Phone -->
          <div
            class="relative z-10 w-[292px] rounded-[48px] border-[6px] border-[#202124] bg-[#f7f7f7] p-2.5 shadow-[0_30px_80px_rgba(0,0,0,.20)] sm:w-[310px]"
          >

            <!-- Dynamic island -->
            <div
              class="absolute left-1/2 top-3 z-20 flex h-7 w-[105px] -translate-x-1/2 items-center justify-center rounded-full bg-black"
            >
              <span class="h-2 w-2 rounded-full bg-gray-800" />
            </div>

            <!-- Phone screen -->
            <div
              class="overflow-hidden rounded-[37px] bg-[#f7f7f7]"
            >

              <!-- Mobile header -->
              <div class="border-b border-gray-200 bg-white px-4 pb-2 pt-11">
                <div class="flex items-center justify-between">

                  <div class="flex items-center gap-1.5">
                    <div
                      class="grid h-7 w-7 place-items-center rounded-lg bg-black text-sm font-black text-white"
                    >
                      M
                    </div>

                    <div>
                      <div class="text-[10px] font-extrabold">
                        memoon.vn
                      </div>

                      <div class="text-[5px] text-gray-400">
                        Mua sắm thông minh, hoàn tiền cực đã
                      </div>
                    </div>
                  </div>

                  <span class="text-gray-500">
                    ♧
                  </span>

                </div>
              </div>

              <!-- Mobile body -->
              <div class="space-y-3 p-3">

                <div>
                  <div class="text-[13px] font-bold">
                    Mua sắm online
                    <span class="text-orange-500">🛒</span>
                  </div>

                  <div class="text-[7px] text-gray-400">
                    Tự động tích lũy hoàn tiền vào tài khoản
                  </div>
                </div>

                <!-- Balance -->
                <div class="grid grid-cols-2 gap-2">

                  <div
                    class="rounded-2xl border border-gray-200 bg-white p-3"
                  >
                    <div
                      class="text-[6px] uppercase tracking-wider text-gray-400"
                    >
                      KHẢ DỤNG
                    </div>

                    <div
                      class="mt-1 text-[13px] font-extrabold text-orange-500"
                    >
                      {{ formatNumber(wallet.available || 1450000) }}
                      <span class="text-[8px]">🪙</span>
                    </div>
                  </div>

                  <div
                    class="rounded-2xl border border-gray-200 bg-white p-3"
                  >
                    <div
                      class="text-[6px] uppercase tracking-wider text-gray-400"
                    >
                      ĐANG XỬ LÝ
                    </div>

                    <div
                      class="mt-1 text-[13px] font-extrabold text-gray-400"
                    >
                      {{ formatNumber(wallet.pending || 185000) }}
                      <span class="text-[8px]">🪙</span>
                    </div>
                  </div>

                </div>

                <!-- Product search -->
                <div
                  class="rounded-2xl border border-gray-200 bg-white p-3"
                >

                  <div class="flex items-center justify-between">

                    <span
                      class="text-[7px] font-semibold text-gray-400"
                    >
                      DÁN LINK SẢN PHẨM
                    </span>

                    <div class="flex gap-1 text-[5px] font-bold">

                      <span class="rounded bg-orange-50 px-1 text-orange-500">
                        Shopee
                      </span>

                      <span class="rounded bg-cyan-50 px-1 text-cyan-500">
                        TikTok
                      </span>

                      <span class="rounded bg-pink-50 px-1 text-pink-500">
                        Lazada
                      </span>

                    </div>

                  </div>

                  <div
                    class="mt-2 flex h-8 items-center rounded-lg border border-gray-200 px-2"
                  >
                    <span
                      class="min-w-0 flex-1 truncate text-[6px] text-gray-400"
                    >
                      https://shopee.vn/product/...
                    </span>

                    <span
                      class="rounded-full bg-orange-500 px-2 py-1 text-[6px] font-bold text-white"
                    >
                      Dán
                    </span>
                  </div>

                  <!-- Fake product -->
                  <div
                    class="mt-2 rounded-xl border border-orange-200 bg-orange-50/30 p-2"
                  >

                    <div class="flex gap-2">

                      <div
                        class="h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br from-gray-700 to-gray-950"
                      />

                      <div class="min-w-0">
                        <div class="truncate text-[8px] font-bold">
                          Áo thun Unisex Cotton
                        </div>

                        <div class="text-[5px] text-gray-400">
                          Official Store · ★ 4.9
                        </div>

                        <div class="mt-1 flex items-center gap-1">
                          <span class="text-[8px] font-bold">
                            250.000đ
                          </span>

                          <span
                            class="rounded bg-red-500 px-1 text-[5px] font-bold text-white"
                          >
                            -15%
                          </span>

                          <span
                            class="rounded bg-yellow-400 px-1 text-[5px] font-bold"
                          >
                            FLASH
                          </span>
                        </div>
                      </div>

                    </div>

                    <div
                      class="my-2 border-t border-dashed border-orange-200"
                    />

                    <div class="flex justify-between">
                      <span class="text-[6px] text-gray-400">
                        DỰ KIẾN HOÀN:
                      </span>

                      <span
                        class="text-[8px] font-bold text-orange-500"
                      >
                        +18.500đ
                      </span>
                    </div>

                    <button
                      class="mt-2 w-full rounded-full bg-orange-500 py-1.5 text-[7px] font-bold text-white"
                    >
                      MUA NGAY CÓ HOÀN TIỀN →
                    </button>

                  </div>

                </div>

                <!-- Coupons -->
                <div class="space-y-1.5">

                  <div
                    class="flex overflow-hidden rounded-lg border border-orange-200 bg-white"
                  >
                    <div
                      class="flex w-12 items-center justify-center bg-orange-500 text-[6px] font-bold text-white"
                    >
                      Facebook
                    </div>

                    <div class="flex-1 p-2">
                      <div class="text-[7px] font-bold">
                        Giảm 25% Giảm tối đa 500kđ
                      </div>

                      <div class="text-[5px] text-gray-400">
                        Đơn tối thiểu 50kđ
                      </div>
                    </div>
                  </div>

                  <div
                    class="flex overflow-hidden rounded-lg border border-orange-200 bg-white"
                  >
                    <div
                      class="flex w-12 items-center justify-center bg-orange-500 text-[6px] font-bold text-white"
                    >
                      Instagram
                    </div>

                    <div class="flex-1 p-2">
                      <div class="text-[7px] font-bold">
                        Giảm 22% Giảm tối đa 300kđ
                      </div>

                      <div class="text-[5px] text-gray-400">
                        Đơn tối thiểu 50kđ
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>

          <!-- Caption -->
          <div
            class="absolute bottom-0 right-0 hidden text-[11px] italic text-gray-400 lg:block"
          >
            📱 Giao diện Dashboard thực tế trên iPhone 15 Pro
          </div>

        </div>

      </div>
    </section>


    <!-- =========================================================
         WHY MONIMONI
    ========================================================== -->
    <section class="border-t border-gray-100 py-20 sm:py-24">

      <div class="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">

        <!-- Heading -->
        <div class="mx-auto max-w-3xl text-center">

          <h2
            class="text-3xl font-black tracking-tight sm:text-4xl"
          >
            Lý do chọn Monimoni
          </h2>

          <p
            class="mt-3 text-sm leading-6 text-gray-500 sm:text-[15px]"
          >
            Giải quyết triệt để 2 lấn cấn lớn nhất của khách hàng:
            hoàn tiền thật 100% & mã voucher sống 24/7.
          </p>

        </div>


        <!-- Cards -->
        <div
          class="mt-10 grid gap-6 lg:grid-cols-[1.35fr_1fr]"
        >

          <!-- Big card -->
          <div
            class="rounded-[28px] border border-gray-200 bg-white p-7 shadow-[0_8px_30px_rgba(0,0,0,.03)] sm:p-8"
          >

            <div class="flex items-start justify-between">

              <div
                class="grid h-11 w-11 place-items-center rounded-2xl border border-orange-200 bg-orange-50 text-orange-500"
              >
                %
              </div>

              <span
                class="rounded-full bg-orange-500 px-3 py-1.5 text-[9px] font-bold text-white"
              >
                LUÔN HOÀN CAO NHẤT
              </span>

            </div>

            <h3
              class="mt-5 text-2xl font-black tracking-tight"
            >
              Hoàn tiền cao nhất thị trường & Rút 0đ phí
            </h3>

            <p
              class="mt-2 max-w-2xl text-sm leading-6 text-gray-500"
            >
              So sánh trực quan: Các ứng dụng truyền thống thường giữ lại
              40–50% hoa hồng quảng cáo. Tại Monimoni, chúng tôi cam kết
              chia sẻ lại đến
              <strong class="text-orange-500">
                100% khoản hoa hồng
              </strong>
              cho bạn. Tích lũy đủ từ 50k là rút thẳng về ngân hàng
              24/7 không tính phí.
            </p>

            <!-- Comparison -->
            <div class="mt-8 grid gap-3 sm:grid-cols-2">

              <div
                class="rounded-2xl border border-orange-200 bg-orange-50/60 p-4"
              >
                <div
                  class="text-[9px] font-bold uppercase tracking-wider text-orange-500"
                >
                  MONIMONI CASHBACK
                </div>

                <div
                  class="mt-2 text-lg font-extrabold text-orange-500"
                >
                  Hoàn đến 100% hoa hồng
                </div>

                <div
                  class="mt-1 text-[10px] text-orange-500"
                >
                  ✓ Rút không mất phí
                </div>
              </div>

              <div
                class="rounded-2xl border border-gray-200 bg-gray-50 p-4"
              >
                <div
                  class="text-[9px] font-bold uppercase tracking-wider text-gray-400"
                >
                  ỨNG DỤNG THÔNG THƯỜNG
                </div>

                <div
                  class="mt-2 text-lg font-extrabold text-gray-400"
                >
                  Giữ lại 40–50% hoa hồng
                </div>

                <div
                  class="mt-1 text-[10px] text-gray-400"
                >
                  × Tốn phí rút & duyệt lâu
                </div>
              </div>

            </div>

          </div>


          <!-- Right cards -->
          <div class="grid gap-6">

            <!-- Card 1 -->
            <div
              class="rounded-[28px] border border-gray-200 bg-white p-7 shadow-[0_8px_30px_rgba(0,0,0,.03)]"
            >

              <div class="flex items-start justify-between">

                <div
                  class="grid h-11 w-11 place-items-center rounded-2xl border border-orange-200 bg-orange-50 text-orange-500"
                >
                  ↻
                </div>

                <span
                  class="rounded-full border border-orange-200 px-3 py-1 text-[9px] font-semibold text-orange-500"
                >
                  Cập nhật mỗi giờ
                </span>

              </div>

              <h3 class="mt-5 text-lg font-extrabold">
                Voucher cập nhật 24/7
              </h3>

              <p
                class="mt-3 text-sm leading-6 text-gray-500"
              >
                Hệ thống tự động quét và lọc mã giảm giá độc quyền
                liên tục từ Facebook & Insta group. Mã nào dán dùng
                được ngay.
              </p>

            </div>


            <!-- Card 2 -->
            <div
              class="rounded-[28px] border border-gray-200 bg-white p-7 shadow-[0_8px_30px_rgba(0,0,0,.03)]"
            >

              <div class="flex items-start justify-between">

                <div
                  class="grid h-11 w-11 place-items-center rounded-2xl border border-orange-200 bg-orange-50 text-orange-500"
                >
                  ▱
                </div>

                <span
                  class="rounded-full border border-orange-200 px-3 py-1 text-[9px] font-semibold text-orange-500"
                >
                  Shopee · TikTok · Lazada
                </span>

              </div>

              <h3 class="mt-5 text-lg font-extrabold">
                Đa nền tảng toàn diện
              </h3>

              <p
                class="mt-3 text-sm leading-6 text-gray-500"
              >
                Phủ rộng từ Shopee, TikTok Shop, Lazada đến ShopeeFood.
                Chỉ 1 ứng dụng duy nhất cho mọi nhu cầu mua sắm
                & order đồ ăn.
              </p>

            </div>

          </div>

        </div>

      </div>
    </section>


    <!-- =========================================================
         4 STEPS
    ========================================================== -->
    <section class="border-t border-gray-100 py-20 sm:py-24">

      <div class="mx-auto max-w-6xl px-6 sm:px-8">

        <!-- Heading -->
        <div class="text-center">

          <h2
            class="text-3xl font-black tracking-tight sm:text-4xl"
          >
            Hướng dẫn 4 bước đơn giản
          </h2>

          <p
            class="mt-3 text-sm text-gray-500 sm:text-[15px]"
          >
            Thao tác cực kỳ đơn giản, giữ nguyên 100% thói quen
            mua sắm thông thường của bạn.
          </p>

        </div>


        <!-- Timeline -->
        <div class="relative mt-12 space-y-8">

          <!-- Vertical line -->
          <div
            class="absolute left-[24px] top-8 hidden h-[calc(100%-65px)] w-px bg-gray-200 sm:block"
          />


          <!-- STEP 1 -->
          <div class="relative flex gap-5 sm:gap-7">

            <div
              class="relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full bg-orange-500 text-sm font-bold text-white shadow-[0_0_0_5px_white]"
            >
              1
            </div>

            <div
              class="flex-1 rounded-[26px] border border-orange-300 bg-white p-6 shadow-[0_8px_25px_rgba(255,87,34,.06)] sm:p-8"
            >

              <div
                class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
              >

                <div class="flex items-center gap-3">

                  <div
                    class="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-500"
                  >
                    ↗
                  </div>

                  <h3 class="text-lg font-extrabold">
                    Chọn sản phẩm & Sao chép đường dẫn
                  </h3>

                </div>

                <span
                  class="w-fit rounded-full border border-orange-200 px-3 py-1.5 text-[9px] font-bold text-orange-500"
                >
                  Thao tác 3s
                </span>

              </div>

              <p
                class="mt-4 pl-0 text-sm leading-6 text-gray-500 sm:pl-[52px]"
              >
                Mở ứng dụng Shopee, TikTok Shop, Lazada hoặc ShopeeFood,
                chọn sản phẩm muốn mua → Nhấn nút Chia sẻ →
                Chọn "Sao chép đường dẫn" (Copy Link).
              </p>

            </div>

          </div>


          <!-- STEP 2 -->
          <div class="relative flex gap-5 sm:gap-7">

            <div
              class="relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gray-200 bg-white text-sm font-bold text-gray-500 shadow-[0_0_0_5px_white]"
            >
              2
            </div>

            <div
              class="flex-1 rounded-[26px] border border-gray-200 bg-white p-6 sm:p-8"
            >

              <div
                class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
              >

                <div class="flex items-center gap-3">

                  <div
                    class="grid h-10 w-10 place-items-center rounded-xl bg-gray-100 text-gray-500"
                  >
                    □
                  </div>

                  <h3 class="text-lg font-extrabold">
                    Mở Monimoni & Dán link chuyển sàn
                  </h3>

                </div>

                <span
                  class="w-fit rounded-full border border-orange-200 px-3 py-1.5 text-[9px] font-bold text-orange-500"
                >
                  Kích hoạt hoàn tiền
                </span>

              </div>

              <p
                class="mt-4 text-sm leading-6 text-gray-500 sm:pl-[52px]"
              >
                Mở app Monimoni – dán link vừa sao chép vào thanh
                tìm kiếm → Bấm kích hoạt để chuyển hướng tự động
                về lại ứng dụng mua sắm.
              </p>

            </div>

          </div>


          <!-- STEP 3 -->
          <div class="relative flex gap-5 sm:gap-7">

            <div
              class="relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gray-200 bg-white text-sm font-bold text-gray-500 shadow-[0_0_0_5px_white]"
            >
              3
            </div>

            <div
              class="flex-1 rounded-[26px] border border-gray-200 bg-white p-6 sm:p-8"
            >

              <div
                class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
              >

                <div class="flex items-center gap-3">

                  <div
                    class="grid h-10 w-10 place-items-center rounded-xl bg-gray-100 text-gray-500"
                  >
                    ♧
                  </div>

                  <h3 class="text-lg font-extrabold">
                    Áp voucher & Mua sắm như bình thường
                  </h3>

                </div>

                <span
                  class="w-fit rounded-full border border-orange-200 px-3 py-1.5 text-[9px] font-bold text-orange-500"
                >
                  Săn deal nhảy
                </span>

              </div>

              <p
                class="mt-4 text-sm leading-6 text-gray-500 sm:pl-[52px]"
              >
                Tự động săn & áp dụng các mã giảm giá/voucher độc quyền
                (nếu có). Bạn tiến hành đặt hàng trực tiếp như thói quen
                thường ngày.
              </p>

            </div>

          </div>


          <!-- STEP 4 -->
          <div class="relative flex gap-5 sm:gap-7">

            <div
              class="relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gray-200 bg-white text-sm font-bold text-gray-500 shadow-[0_0_0_5px_white]"
            >
              4
            </div>

            <div
              class="flex-1 rounded-[26px] border border-gray-200 bg-white p-6 sm:p-8"
            >

              <div
                class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
              >

                <div class="flex items-center gap-3">

                  <div
                    class="grid h-10 w-10 place-items-center rounded-xl bg-gray-100 text-gray-500"
                  >
                    ▣
                  </div>

                  <h3 class="text-lg font-extrabold">
                    Nhận tiền vào ví & Rút về ngân hàng
                  </h3>

                </div>

                <span
                  class="w-fit rounded-full border border-orange-200 px-3 py-1.5 text-[9px] font-bold text-orange-500"
                >
                  Tiền về thật 100%
                </span>

              </div>

              <p
                class="mt-4 text-sm leading-6 text-gray-500 sm:pl-[52px]"
              >
                Tiền hoàn sẽ tự động ghi nhận vào ví Monimoni.
                Khi tích lũy đủ từ 50.000đ, bạn có thể rút thẳng
                về tài khoản ngân hàng hoặc MoMo 24/7.
              </p>

            </div>

          </div>

        </div>

      </div>
    </section>


    <!-- =========================================================
         RESULT MODAL / PRODUCT RESULT
    ========================================================== -->
    <div
      v-if="result"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      @click.self="result = null"
    >

      <div
        class="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl dark:bg-gray-900"
      >

        <!-- Product -->
        <div class="p-5 sm:p-6">

          <div class="flex items-start justify-between gap-4">

            <div class="flex min-w-0 gap-3">

              <img
                v-if="result.product_info?.image"
                :src="result.product_info.image"
                alt=""
                class="h-16 w-16 shrink-0 rounded-xl object-cover"
              />

              <div class="min-w-0">

                <h3
                  class="line-clamp-2 text-sm font-bold sm:text-base"
                >
                  {{
                    result.product_info?.name ||
                    'Sản phẩm Shopee'
                  }}
                </h3>

                <div
                  v-if="result.product_info?.shop_name"
                  class="mt-1 text-xs text-gray-400"
                >
                  {{ result.product_info.shop_name }}
                </div>

                <div
                  v-if="result.product_info?.rating"
                  class="mt-1 flex items-center gap-1 text-xs text-orange-500"
                >
                  <StarIcon class="h-3.5 w-3.5 fill-current" />

                  {{ result.product_info.rating }}
                </div>

              </div>

            </div>

            <button
              type="button"
              class="rounded-full p-2 text-gray-400 hover:bg-gray-100"
              @click="result = null"
            >
              ✕
            </button>

          </div>


          <!-- Price -->
          <div
            class="mt-5 grid grid-cols-2 gap-4 rounded-2xl bg-gray-50 p-4 dark:bg-gray-800"
          >

            <div>
              <div
                class="text-[10px] uppercase tracking-wider text-gray-400"
              >
                GIÁ SẢN PHẨM
              </div>

              <div class="mt-1 text-xl font-black">
                {{
                  formatNumber(
                    result.product_info?.original_price
                  )
                }}đ
              </div>
            </div>

            <div class="text-right">
              <div
                class="text-[10px] uppercase tracking-wider text-gray-400"
              >
                TÍCH LŨY NHẬN VỀ
              </div>

              <div
                class="mt-1 text-xl font-black text-orange-500"
              >
                +{{
                  formatNumber(
                    result.product_info?.estimated_cashback
                  )
                }}đ
              </div>
            </div>

          </div>


          <!-- Price stats -->
          <div
            v-if="result.product_info?.price_stats"
            class="mt-4"
          >

            <div
              class="rounded-2xl border border-orange-200 bg-orange-50 p-4"
            >

              <div
                class="flex items-center gap-2 text-sm font-bold text-orange-500"
              >
                <ExclamationCircleIcon class="h-4 w-4" />

                Giá hiện tại đang cao
              </div>

              <p
                class="mt-1 text-xs text-gray-500"
              >
                Nên chờ sale hoặc tìm shop khác trước khi mua.
              </p>

            </div>

            <div class="mt-4">

              <div
                class="h-1.5 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-orange-500"
              />

              <div
                class="mt-2 grid grid-cols-3 text-center"
              >

                <div>
                  <div class="text-[10px] text-gray-400">
                    THẤP NHẤT
                  </div>

                  <div
                    class="mt-1 text-sm font-bold text-emerald-600"
                  >
                    {{
                      formatNumber(
                        result.product_info.price_stats.minPrice
                      )
                    }}đ
                  </div>
                </div>

                <div>
                  <div class="text-[10px] text-gray-400">
                    TRUNG BÌNH
                  </div>

                  <div class="mt-1 text-sm font-bold">
                    {{
                      formatNumber(
                        Math.round(
                          result.product_info.price_stats.avgPrice
                        )
                      )
                    }}đ
                  </div>
                </div>

                <div>
                  <div class="text-[10px] text-gray-400">
                    CAO NHẤT
                  </div>

                  <div
                    class="mt-1 text-sm font-bold text-orange-500"
                  >
                    {{
                      formatNumber(
                        result.product_info.price_stats.maxPrice
                      )
                    }}đ
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>


        <!-- Action -->
        <div
          class="flex gap-2 border-t border-gray-100 p-5 dark:border-gray-800"
        >

          <button
            type="button"
            @click="shareResultLink"
            class="rounded-xl border border-gray-200 px-5 py-3 text-xs font-bold text-gray-600 hover:bg-gray-50"
          >
            Chia sẻ
          </button>

          <a
            :href="
              result.short_tracking_url ||
              result.tracking_url
            "
            target="_blank"
            rel="noopener"
            class="flex-1 rounded-xl bg-orange-500 py-3 text-center text-xs font-extrabold text-white hover:bg-orange-600"
          >
            MUA NGAY CÓ HOÀN TIỀN →
          </a>

        </div>

      </div>

    </div>

  </div>
</template>


<script setup lang="ts">

import {
  ExclamationCircleIcon,
} from '@heroicons/vue/24/outline'

import {
  StarIcon,
} from '@heroicons/vue/24/solid'


definePageMeta({
  middleware: 'auth',
})


const authStore = useAuthStore()
const config = useRuntimeConfig()


/* =========================================================
   STATE
========================================================= */

const productUrl = ref('')
const submitting = ref(false)
const error = ref('')
const result = ref<any>(null)


const wallet = reactive({
  available: 0,
  pending: 0,
})


/* =========================================================
   FORMAT
========================================================= */

function formatNumber(n: number) {
  return new Intl.NumberFormat('vi-VN').format(
    n || 0,
  )
}


/* =========================================================
   DETECT PLATFORM
========================================================= */

function detectPlatform(
  url: string,
): string | null {

  const u = url.toLowerCase()

  if (u.includes('shopee.')) {
    return 'shopee'
  }

  if (u.includes('lazada.')) {
    return 'lazada'
  }

  if (
    u.includes('tiktok.') ||
    u.includes('vt.tiktok')
  ) {
    return 'tiktok'
  }

  return null
}


/* =========================================================
   SHOPEE PRODUCT ID
========================================================= */

function extractProductId(
  url: string,
): string {

  try {

    const path =
      url.split('?')[0]

    const match =
      path.match(/\.(\d+)\.(\d+)$/)

    return match
      ? match[2]
      : ''

  } catch {

    return ''

  }
}


/* =========================================================
   PRODUCT INFO API
========================================================= */

async function fetchProductInfo(
  platform: string,
  url: string,
) {

  const response =
    await fetch(
      `${config.public.apiBase}/api/affiliate/${platform}/product-info/?url=${encodeURIComponent(url)}`,
      {
        headers: {
          Authorization:
            `Token ${authStore.token}`,
        },
      },
    )

  const body =
    await response
      .json()
      .catch(() => ({}))


  if (
    !response.ok ||
    !body?.success
  ) {

    throw new Error(
      body?.message ||
      'Không lấy được thông tin sản phẩm',
    )

  }


  return body.data
}


/* =========================================================
   CREATE AFFILIATE
========================================================= */

async function createAffiliateClick(
  platform: string,
  url: string,
) {

  const response =
    await fetch(
      `${config.public.apiBase}/api/affiliate/click/`,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',

          Authorization:
            `Token ${authStore.token}`,
        },

        body: JSON.stringify({
          platform,
          product_url: url,
          product_id:
            extractProductId(url),
        }),
      },
    )


  const body =
    await response
      .json()
      .catch(() => ({}))


  if (
    !response.ok ||
    !body?.success
  ) {

    throw new Error(
      body?.message ||
      body?.detail ||
      'Không tạo được link hoàn tiền',
    )

  }


  return body.data
}


/* =========================================================
   SUBMIT
========================================================= */

async function submitLink(
  url: string,
) {

  const platform =
    detectPlatform(url)


  if (!platform) {

    error.value =
      'Link chưa được hỗ trợ. Hiện chỉ hỗ trợ Shopee, Lazada, TikTok Shop.'

    return
  }


  submitting.value = true
  error.value = ''
  result.value = null


  try {

    const [
      productInfo,
      click,
    ] = await Promise.all([

      fetchProductInfo(
        platform,
        url,
      ),

      createAffiliateClick(
        platform,
        url,
      ),

    ])


    const info =
      productInfo?.raw?.productInfo


    result.value = {

      ...click,

      product_info: info
        ? {

            name:
              info.productName,

            image:
              productInfo.image,

            shop_name:
              info.shopName,

            rating:
              info.rating,

            sold_count:
              info.sales,

            original_price:
              info.price,

            estimated_cashback:
              info.commission,

            price_stats:
              info.priceStats,

          }

        : null,

    }


    await fetchWalletStats()


  } catch (
    err: any
  ) {

    error.value =
      err?.message ||
      'Không tạo được link hoàn tiền'

  } finally {

    submitting.value = false

  }

}


/* =========================================================
   FORM
========================================================= */

function handleSubmit() {

  const url =
    productUrl.value.trim()

  if (!url) {
    return
  }

  submitLink(url)

}


/* =========================================================
   WALLET
========================================================= */

async function fetchWalletStats() {

  try {

    const response =
      await fetch(
        `${config.public.apiBase}/api/wallet/summary/`,
        {
          headers: {
            Authorization:
              `Token ${authStore.token}`,
          },
        },
      )


    if (!response.ok) {
      return
    }


    const data =
      await response.json()


    wallet.available =
      data.available ??
      data.data?.available ??
      0


    wallet.pending =
      data.pending ??
      data.data?.pending ??
      0

  } catch {

    // Ignore

  }

}


/* =========================================================
   SHARE
========================================================= */

function getResultLink() {

  return (
    result.value?.short_tracking_url ||
    result.value?.tracking_url ||
    productUrl.value
  )

}


async function shareResultLink() {

  const link =
    getResultLink()


  if (
    navigator.share
  ) {

    try {

      await navigator.share({
        title:
          result.value?.product_info?.name ||
          'Sản phẩm hoàn tiền Monimoni',

        url: link,
      })

      return

    } catch {

      // cancelled

    }

  }


  try {

    await navigator.clipboard.writeText(
      link,
    )

  } catch {

    // ignore

  }

}


/* =========================================================
   INIT
========================================================= */

onMounted(() => {

  fetchWalletStats()

})

</script>