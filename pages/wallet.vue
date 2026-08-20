<template>
  <div class="max-w-4xl mx-auto px-4 py-6 sm:px-6 space-y-5">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
        Ví MOON
      </h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Số dư, lịch sử biến động và rút tiền
      </p>
    </div>

    <!-- Balance card -->
    <div
      class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-[#ff4b0b] p-5 text-white shadow-[0_16px_40px_-14px_rgba(255,87,34,.5)] sm:p-6"
    >
      <div class="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div class="absolute -bottom-10 -left-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

      <div class="relative flex items-center justify-between">
        <span class="text-[11px] font-semibold uppercase tracking-wider text-white/80">
          Số dư khả dụng
        </span>
        <WalletIcon class="h-5 w-5 text-white/70" />
      </div>

      <div class="relative mt-2">
        <span v-if="walletLoading" class="inline-block h-8 w-32 animate-pulse rounded-lg bg-white/20" />
        <span v-else class="text-3xl font-black tracking-tight">
          {{ fmt.currency(wallet.available_balance) }}
        </span>
      </div>

      <div class="relative mt-4 grid grid-cols-2 gap-2.5">
        <div class="rounded-2xl bg-white/15 px-3.5 py-2.5 backdrop-blur-sm">
          <div class="text-[11px] font-medium text-white/80">Đang chờ xử lý</div>
          <div class="mt-0.5 text-sm font-bold">{{ fmt.currency(wallet.pending_balance) }}</div>
        </div>
        <div class="rounded-2xl bg-white/15 px-3.5 py-2.5 backdrop-blur-sm">
          <div class="text-[11px] font-medium text-white/80">Tổng đã nhận</div>
          <div class="mt-0.5 text-sm font-bold">{{ fmt.currency(wallet.total_earned) }}</div>
        </div>
      </div>

      <button
        type="button"
        @click="openWithdrawModal"
        class="relative mt-4 w-full rounded-2xl bg-white py-3 text-sm font-extrabold tracking-wide text-orange-600 transition hover:bg-white/90"
      >
        Rút tiền
      </button>
    </div>

    <!-- Tabs -->
    <div class="inline-flex rounded-2xl bg-surface-100 p-1 dark:bg-dark-50">
      <button
        v-for="t in tabs"
        :key="t.id"
        type="button"
        @click="activeTab = t.id"
        class="rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
        :class="activeTab === t.id
          ? 'bg-white text-brand-600 shadow-card dark:bg-dark-100 dark:text-brand-300'
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- ================= LỊCH SỬ ================= -->
    <section v-if="activeTab === 'ledger'" class="space-y-2.5">
      <div v-if="ledgerLoading && ledger.length === 0" class="space-y-2.5">
        <div v-for="i in 4" :key="i" class="h-16 animate-pulse rounded-2xl bg-surface-100 dark:bg-dark-50" />
      </div>

      <div
        v-else-if="!ledgerLoading && ledger.length === 0"
        class="rounded-2xl border border-dashed border-surface-200 py-12 text-center text-sm text-gray-400 dark:border-dark-50"
      >
        Chưa có biến động nào
      </div>

      <div
        v-for="l in ledger"
        v-else
        :key="l.id"
        class="flex items-center justify-between gap-3 rounded-2xl border border-surface-200 bg-white p-3.5 dark:border-dark-50 dark:bg-dark-100"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div
            class="grid h-9 w-9 shrink-0 place-items-center rounded-full"
            :class="l.direction === 'credit'
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
              : 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400'"
          >
            <ArrowDownIcon v-if="l.direction === 'credit'" class="h-4 w-4" />
            <ArrowUpIcon v-else class="h-4 w-4" />
          </div>
          <div class="min-w-0">
            <div class="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {{ l.description || ledgerTypeLabel(l.type) }}
            </div>
            <div class="text-xs text-gray-400">{{ fmt.dateTime(l.created_at) }}</div>
          </div>
        </div>
        <div class="shrink-0 text-right">
          <div
            class="text-sm font-extrabold"
            :class="l.direction === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'"
          >
            {{ l.direction === "credit" ? "+" : "-" }}{{ fmt.currency(l.amount) }}
          </div>
          <div class="text-[11px] text-gray-400">{{ fmt.currency(l.balance_after) }}</div>
        </div>
      </div>

      <div class="pt-1 text-center">
        <button
          v-if="ledgerMeta.next"
          type="button"
          :disabled="ledgerLoading"
          @click="loadMoreLedger"
          class="btn-ghost btn-sm text-xs text-brand-600 disabled:opacity-50 dark:text-brand-300"
        >
          {{ ledgerLoading ? "Đang tải..." : "Xem thêm" }}
        </button>
      </div>
    </section>

    <!-- ================= RÚT TIỀN ================= -->
    <section v-else class="space-y-5">
      <!-- Withdrawal methods -->
      <div class="rounded-2xl border border-surface-200 bg-white p-4 dark:border-dark-50 dark:bg-dark-100">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-gray-900 dark:text-white">Tài khoản nhận tiền</h3>
          <button
            type="button"
            @click="showAddMethod = !showAddMethod"
            class="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-300"
          >
            {{ showAddMethod ? "Đóng" : "+ Thêm tài khoản" }}
          </button>
        </div>

        <!-- Add method form -->
        <form
          v-if="showAddMethod"
          @submit.prevent="submitAddMethod"
          class="mt-3 space-y-2.5 rounded-xl bg-surface-50 p-3 dark:bg-dark-50"
        >
          <div class="grid grid-cols-2 gap-2.5">
            <select
              v-model="methodForm.bank_code"
              required
              class="col-span-1 rounded-xl border border-surface-200 bg-white px-3 py-2 text-xs dark:border-dark-50 dark:bg-dark-100"
            >
              <option value="" disabled>Ngân hàng</option>
              <option v-for="b in bankOptions" :key="b" :value="b">{{ b }}</option>
            </select>
            <input
              v-model="methodForm.account_number"
              required
              inputmode="numeric"
              placeholder="Số tài khoản"
              class="col-span-1 rounded-xl border border-surface-200 bg-white px-3 py-2 text-xs dark:border-dark-50 dark:bg-dark-100"
            />
          </div>
          <input
            v-model="methodForm.account_name"
            required
            placeholder="Tên chủ tài khoản"
            class="w-full rounded-xl border border-surface-200 bg-white px-3 py-2 text-xs dark:border-dark-50 dark:bg-dark-100"
          />
          <button
            type="submit"
            :disabled="addingMethod"
            class="w-full rounded-xl bg-brand-500 py-2 text-xs font-bold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {{ addingMethod ? "Đang lưu..." : "Lưu tài khoản" }}
          </button>
        </form>

        <div v-if="methodsLoading" class="mt-3 space-y-2">
          <div v-for="i in 2" :key="i" class="h-12 animate-pulse rounded-xl bg-surface-100 dark:bg-dark-50" />
        </div>

        <div v-else-if="methods.length === 0" class="mt-3 text-xs text-gray-400">
          Chưa có tài khoản nhận tiền nào
        </div>

        <div v-else class="mt-3 space-y-2">
          <div
            v-for="m in methods"
            :key="m.id"
            class="flex items-center justify-between rounded-xl border border-surface-200 px-3 py-2.5 dark:border-dark-50"
          >
            <div class="min-w-0">
              <div class="text-xs font-bold text-gray-900 dark:text-white">
                {{ m.bank_code }} · {{ m.account_number_masked }}
              </div>
              <div class="text-[11px] text-gray-400 truncate">{{ m.account_name }}</div>
            </div>
            <button
              type="button"
              @click="deleteMethod(m.id)"
              class="shrink-0 text-gray-300 hover:text-rose-500"
            >
              <TrashIcon class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Withdrawal history -->
      <div>
        <h3 class="mb-2.5 text-sm font-bold text-gray-900 dark:text-white">Lịch sử yêu cầu rút tiền</h3>

        <div v-if="withdrawalsLoading && withdrawals.length === 0" class="space-y-2.5">
          <div v-for="i in 3" :key="i" class="h-16 animate-pulse rounded-2xl bg-surface-100 dark:bg-dark-50" />
        </div>

        <div
          v-else-if="!withdrawalsLoading && withdrawals.length === 0"
          class="rounded-2xl border border-dashed border-surface-200 py-10 text-center text-sm text-gray-400 dark:border-dark-50"
        >
          Chưa có yêu cầu rút tiền nào
        </div>

        <div v-else class="space-y-2.5">
          <div
            v-for="w in withdrawals"
            :key="w.id"
            class="rounded-2xl border border-surface-200 bg-white p-3.5 dark:border-dark-50 dark:bg-dark-100"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <StatusBadge kind="withdrawal" :status="w.status" />
                  <span class="text-[11px] text-gray-400">{{ fmt.dateTime(w.created_at) }}</span>
                </div>
                <div class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  {{ w.withdrawal_method?.bank_code }} · {{ w.withdrawal_method?.account_number_masked }}
                </div>
                <div v-if="w.reject_reason" class="mt-1 text-[11px] text-rose-500">
                  Lý do: {{ w.reject_reason }}
                </div>
              </div>
              <div class="shrink-0 text-sm font-extrabold text-gray-900 dark:text-white">
                {{ fmt.currency(w.amount) }}
              </div>
            </div>
          </div>

          <div class="pt-1 text-center">
            <button
              v-if="withdrawalsMeta.next"
              type="button"
              :disabled="withdrawalsLoading"
              @click="loadMoreWithdrawals"
              class="btn-ghost btn-sm text-xs text-brand-600 disabled:opacity-50 dark:text-brand-300"
            >
              {{ withdrawalsLoading ? "Đang tải..." : "Xem thêm" }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Withdraw modal -->
    <div
      v-if="showWithdrawModal"
      class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      @click.self="closeWithdrawModal"
    >
      <div class="w-full max-w-sm rounded-t-3xl bg-white p-5 shadow-modal dark:bg-dark-100 sm:rounded-3xl">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-bold text-gray-900 dark:text-white">Rút tiền</h3>
          <button @click="closeWithdrawModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>

        <form @submit.prevent="submitWithdraw" class="mt-4 space-y-3">
          <div v-if="methods.length === 0" class="rounded-xl bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-950/20 dark:text-amber-300">
            Bạn cần thêm tài khoản nhận tiền trước khi rút.
          </div>

          <div v-else>
            <label class="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Tài khoản nhận tiền</label>
            <select
              v-model="withdrawForm.withdrawal_method_id"
              required
              class="w-full rounded-xl border border-surface-200 bg-white px-3 py-2.5 text-sm dark:border-dark-50 dark:bg-dark-100"
            >
              <option value="" disabled>Chọn tài khoản</option>
              <option v-for="m in methods" :key="m.id" :value="m.id">
                {{ m.bank_code }} · {{ m.account_number_masked }} — {{ m.account_name }}
              </option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
              Số tiền (tối thiểu {{ fmt.currency(MIN_WITHDRAWAL) }})
            </label>
            <input
              v-model="withdrawForm.amount"
              type="number"
              :min="MIN_WITHDRAWAL"
              :max="Number(wallet.available_balance) || undefined"
              required
              placeholder="50000"
              class="w-full rounded-xl border border-surface-200 bg-white px-3 py-2.5 text-sm dark:border-dark-50 dark:bg-dark-100"
            />
            <div class="mt-1 text-[11px] text-gray-400">
              Khả dụng: {{ fmt.currency(wallet.available_balance) }}
            </div>
          </div>

          <button
            type="submit"
            :disabled="submittingWithdraw || methods.length === 0"
            class="w-full rounded-xl bg-brand-500 py-3 text-sm font-extrabold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {{ submittingWithdraw ? "Đang gửi..." : "Xác nhận rút tiền" }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { WalletIcon, ArrowDownIcon, ArrowUpIcon, TrashIcon, XMarkIcon } from "@heroicons/vue/24/outline";

definePageMeta({ middleware: "auth" });

const api = useApi();
const toast = useToast();
const fmt = useFormat();

const MIN_WITHDRAWAL = 50000;
const bankOptions = ["VCB", "TCB", "MB", "ACB", "BIDV", "VTB", "STB", "TPB", "VPB", "MSB"];

const tabs = [
  { id: "ledger", label: "Lịch sử" },
  { id: "withdraw", label: "Rút tiền" },
];
const activeTab = ref<"ledger" | "withdraw">("ledger");

// ---- Wallet balance ----
const wallet = reactive({ available_balance: "0", pending_balance: "0", total_earned: "0" });
const walletLoading = ref(true);

async function fetchWallet() {
  walletLoading.value = true;
  try {
    const res = await api.get<any>("/api/wallet/");
    Object.assign(wallet, res.data || {});
  } catch (err: any) {
    toast.error(err?.data?.message || "Không tải được số dư ví");
  } finally {
    walletLoading.value = false;
  }
}

// ---- Ledger ----
const ledger = ref<any[]>([]);
const ledgerMeta = reactive<{ next: string | null }>({ next: null });
const ledgerLoading = ref(false);
const ledgerPage = ref(1);

const ledgerTypeLabels: Record<string, string> = {
  cashback: "Cashback",
  withdrawal: "Rút tiền",
  refund: "Hoàn tiền",
  bonus: "Thưởng",
  adjustment: "Điều chỉnh",
};
function ledgerTypeLabel(type: string) {
  return ledgerTypeLabels[type] || type;
}

async function fetchLedger(append = false) {
  ledgerLoading.value = true;
  try {
    const res = await api.get<any>("/api/wallet/transactions/", { page: ledgerPage.value });
    ledger.value = append ? [...ledger.value, ...(res.data || [])] : res.data || [];
    ledgerMeta.next = res.metadata?.next ?? null;
  } catch (err: any) {
    toast.error(err?.data?.message || "Không tải được lịch sử ví");
  } finally {
    ledgerLoading.value = false;
  }
}

function loadMoreLedger() {
  ledgerPage.value += 1;
  fetchLedger(true);
}

// ---- Withdrawal methods ----
const methods = ref<any[]>([]);
const methodsLoading = ref(false);
const showAddMethod = ref(false);
const addingMethod = ref(false);
const methodForm = reactive({ bank_code: "", account_number: "", account_name: "" });

async function fetchMethods() {
  methodsLoading.value = true;
  try {
    const res = await api.get<any>("/api/wallet/withdrawal-methods/");
    methods.value = res.data || [];
  } catch (err: any) {
    toast.error(err?.data?.message || "Không tải được danh sách tài khoản");
  } finally {
    methodsLoading.value = false;
  }
}

async function submitAddMethod() {
  addingMethod.value = true;
  try {
    await api.post("/api/wallet/withdrawal-methods/", { type: "bank", ...methodForm });
    toast.success("Thêm tài khoản nhận tiền thành công");
    methodForm.bank_code = "";
    methodForm.account_number = "";
    methodForm.account_name = "";
    showAddMethod.value = false;
    fetchMethods();
  } catch (err: any) {
    toast.error(err?.data?.message || "Không thêm được tài khoản");
  } finally {
    addingMethod.value = false;
  }
}

async function deleteMethod(id: string) {
  if (!confirm("Xoá tài khoản nhận tiền này?")) return;
  try {
    await api.delete(`/api/wallet/withdrawal-methods/${id}/`);
    methods.value = methods.value.filter((m) => m.id !== id);
    toast.success("Đã xoá tài khoản nhận tiền");
  } catch (err: any) {
    toast.error(err?.data?.message || "Không xoá được tài khoản");
  }
}

// ---- Withdrawals ----
const withdrawals = ref<any[]>([]);
const withdrawalsMeta = reactive<{ next: string | null }>({ next: null });
const withdrawalsLoading = ref(false);
const withdrawalsPage = ref(1);

async function fetchWithdrawals(append = false) {
  withdrawalsLoading.value = true;
  try {
    const res = await api.get<any>("/api/wallet/withdrawals/", { page: withdrawalsPage.value });
    withdrawals.value = append ? [...withdrawals.value, ...(res.data || [])] : res.data || [];
    withdrawalsMeta.next = res.metadata?.next ?? null;
  } catch (err: any) {
    toast.error(err?.data?.message || "Không tải được lịch sử rút tiền");
  } finally {
    withdrawalsLoading.value = false;
  }
}

function loadMoreWithdrawals() {
  withdrawalsPage.value += 1;
  fetchWithdrawals(true);
}

const showWithdrawModal = ref(false);
const submittingWithdraw = ref(false);
const withdrawForm = reactive({ withdrawal_method_id: "", amount: "" });

function openWithdrawModal() {
  withdrawForm.withdrawal_method_id = methods.value[0]?.id || "";
  withdrawForm.amount = "";
  showWithdrawModal.value = true;
}

function closeWithdrawModal() {
  showWithdrawModal.value = false;
}

async function submitWithdraw() {
  const amount = Number(withdrawForm.amount);
  if (!amount || amount < MIN_WITHDRAWAL) {
    toast.error(`Số tiền rút tối thiểu là ${fmt.currency(MIN_WITHDRAWAL)}`);
    return;
  }
  if (amount > Number(wallet.available_balance)) {
    toast.error("Số dư khả dụng không đủ");
    return;
  }

  submittingWithdraw.value = true;
  try {
    await api.post("/api/wallet/withdrawals/", {
      withdrawal_method_id: withdrawForm.withdrawal_method_id,
      amount: String(amount),
    });
    toast.success("Tạo yêu cầu rút tiền thành công");
    closeWithdrawModal();
    fetchWallet();
    withdrawalsPage.value = 1;
    fetchWithdrawals(false);
  } catch (err: any) {
    toast.error(err?.data?.message || "Không tạo được yêu cầu rút tiền");
  } finally {
    submittingWithdraw.value = false;
  }
}

watch(activeTab, (tab) => {
  if (tab === "withdraw") {
    if (methods.value.length === 0 && !methodsLoading.value) fetchMethods();
    if (withdrawals.value.length === 0 && !withdrawalsLoading.value) fetchWithdrawals();
  }
});

onMounted(() => {
  fetchWallet();
  fetchLedger();
  fetchMethods();
});
</script>
