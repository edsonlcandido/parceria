<template>
  <div class="min-h-screen bg-[#e9edf4] pb-24">
    <main class="mx-auto max-w-2xl px-4 py-6">

      <!-- Header -->
      <div class="mb-6 flex items-center gap-3">

        <h1 class="flex-1 text-2xl font-bold text-slate-900">Contas</h1>
        <button
          class="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white active:scale-95"
          @click="openCreate"
        >
          + Nova conta
        </button>
      </div>

      <!-- Empty state -->
      <div v-if="contaAccounts.length === 0" class="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
        <div class="mb-3 text-4xl">🏦</div>
        <p class="font-semibold text-slate-900">Nenhuma conta aqui</p>
        <p class="mt-1 text-sm text-slate-500">Clique em "+ Nova conta" para adicionar</p>
      </div>

      <!-- Contas -->
      <section v-else class="space-y-2">
        <AccountCard
          v-for="account in contaAccounts"
          :key="account.id"
          :account="account"
          :balance="balanceByAccount[account.id] ?? 0"
          :owner-label="ownerLabel(account.user_id as string | null)"
          @select="openActions(account)"
        />
      </section>
    </main>

    <!-- Actions drawer (direita → esquerda) -->
    <div v-if="actionsAccount" class="fixed inset-0 z-50 bg-slate-900/40" @click.self="actionsAccount = null">
      <div class="ml-auto h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-2xl">
        <div class="mb-6 flex items-center justify-between">
          <div>
            <h3 class="text-2xl font-bold text-slate-900">{{ actionsAccount.name }}</h3>
            <p class="mt-0.5 text-sm text-slate-500">Conta corrente</p>
          </div>
          <button class="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold" @click="actionsAccount = null">Fechar</button>
        </div>

        <div class="space-y-3">
          <button
            class="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-700 active:scale-[0.98] transition-transform"
            @click="openEdit(actionsAccount); actionsAccount = null"
          >
            <svg class="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6.536-6.536a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 14H9v-3z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18" />
            </svg>
            Editar conta
          </button>
          <button
            v-if="!showBalanceUpdate"
            class="flex w-full items-center gap-3 rounded-2xl border border-teal-100 bg-teal-50 px-4 py-4 text-sm font-semibold text-teal-700 active:scale-[0.98] transition-transform"
            @click="openBalanceUpdate"
          >
            <svg class="h-5 w-5 text-teal-500" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            Atualizar saldo
          </button>
          <div v-if="showBalanceUpdate" class="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div>
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Saldo atual</p>
              <p class="text-lg font-bold mt-0.5" :class="currentActionsBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'">
                {{ Math.abs(currentActionsBalance).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
              </p>
            </div>
            <label class="block">
              <span class="mb-1 block text-sm font-semibold text-slate-700">Novo saldo</span>
              <input
                v-model.number="newBalanceValue"
                type="number"
                step="0.01"
                class="w-full rounded-xl border border-slate-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="0,00"
              />
            </label>
            <div class="flex gap-2">
              <button
                type="button"
                class="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                @click="showBalanceUpdate = false"
              >
                Cancelar
              </button>
              <button
                type="button"
                class="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                @click="submitBalanceUpdate"
              >
                Confirmar
              </button>
            </div>
          </div>
          <button
            class="flex w-full items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-4 text-sm font-semibold text-rose-600 active:scale-[0.98] transition-transform"
            @click="removeAccount(actionsAccount.id); actionsAccount = null"
          >
            <svg class="h-5 w-5 text-rose-400" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Excluir conta
          </button>
        </div>
      </div>
    </div>

    <AccountDrawer
      :open="drawerOpen"
      :model="editingAccount"
      :couple-id="coupleStore.id || ''"
      :partner1-name="coupleStore.partner1Name"
      :partner2-name="coupleStore.partner2Name"
      :user1-id="coupleStore.user1Id"
      :user2-id="coupleStore.user2Id"
      @close="closeDrawer"
      @save="saveAccount"
    />

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { RecordModel } from 'pocketbase'
import AccountDrawer from '../components/AccountDrawer.vue'
import AccountCard from '../components/AccountCard.vue'
import { useAccountsStore } from '../stores/accounts'
import { useTransactionsStore } from '../stores/transactions'
import { useCoupleStore } from '../stores/couple'

const route = useRoute()
const coupleStore = useCoupleStore()
const accountsStore = useAccountsStore()
const transactionsStore = useTransactionsStore()

const drawerOpen = ref(false)
const editingAccount = ref<RecordModel | null>(null)
const actionsAccount = ref<RecordModel | null>(null)

onMounted(async () => {
  const token =
    typeof route.query.access_token === 'string'
      ? route.query.access_token
      : coupleStore.getStoredToken()
  if (!token) return

  const loaded = await coupleStore.loadByToken(token)
  if (loaded && coupleStore.id) {
    await Promise.all([
      accountsStore.fetchAccounts(coupleStore.id),
      transactionsStore.fetchTransactions(coupleStore.id),
    ])
  }
})

const contaAccounts = computed(() =>
  accountsStore.accounts.filter((a) => a.type === 'conta'),
)

const balanceByAccount = computed(() => {
  const map: Record<string, number> = {}
  for (const tx of transactionsStore.transactions) {
    if (!tx.consolidated) continue
    const id = tx.account_id as string
    if (!(id in map)) map[id] = 0
    map[id] += tx.type === 'income' ? Number(tx.amount) : -Number(tx.amount)
  }
  return map
})

function ownerLabel(userId: string | null): string {
  if (!userId) return 'Casal'
  if (userId === coupleStore.user1Id) return coupleStore.partner1Name
  if (userId === coupleStore.user2Id) return coupleStore.partner2Name
  return 'Outro'
}

const showBalanceUpdate = ref(false)
const newBalanceValue = ref(0)

const currentActionsBalance = computed(() => {
  if (!actionsAccount.value) return 0
  return balanceByAccount.value[actionsAccount.value.id] ?? 0
})

function openActions(model: RecordModel) {
  actionsAccount.value = model
  showBalanceUpdate.value = false
}

function openBalanceUpdate() {
  newBalanceValue.value = currentActionsBalance.value
  showBalanceUpdate.value = true
}

async function submitBalanceUpdate() {
  if (!actionsAccount.value || !coupleStore.id) return
  const diff = newBalanceValue.value - currentActionsBalance.value
  if (diff === 0) {
    showBalanceUpdate.value = false
    actionsAccount.value = null
    return
  }
  const today = new Date().toISOString().split('T')[0]
  await transactionsStore.createTransaction({
    couple_id: coupleStore.id,
    account_id: actionsAccount.value.id,
    user_id: (actionsAccount.value.user_id as string) || null,
    amount: Math.abs(diff),
    description: 'Ajuste de saldo',
    type: diff > 0 ? 'income' : 'expense',
    date: today,
    consolidated: true,
  })
  showBalanceUpdate.value = false
  actionsAccount.value = null
}

function openCreate() {
  editingAccount.value = null
  drawerOpen.value = true
}

function openEdit(model: RecordModel) {
  editingAccount.value = model
  drawerOpen.value = true
}

function closeDrawer() {
  drawerOpen.value = false
  editingAccount.value = null
}

async function saveAccount(payload: { id?: string; data: any }) {
  if (payload.id) {
    await accountsStore.updateAccount(payload.id, payload.data)
  } else {
    await accountsStore.createAccount(payload.data)
    if (coupleStore.id) {
      await transactionsStore.fetchTransactions(coupleStore.id)
    }
  }
  closeDrawer()
}

async function removeAccount(id: string) {
  if (!confirm('Excluir esta conta? As transações vinculadas não serão removidas.')) return
  await accountsStore.deleteAccount(id)
}
</script>
