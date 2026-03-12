<template>
  <div class="min-h-screen bg-[#e9edf4] pb-24">
    <main class="mx-auto max-w-2xl px-4 py-6">

      <!-- Header -->
      <div class="mb-6 flex items-center gap-3">
        <button
          class="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm active:scale-95"
          @click="router.back()"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="flex-1 text-2xl font-bold text-slate-900">Contas</h1>
        <button
          class="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white active:scale-95"
          @click="openCreate"
        >
          + Nova conta
        </button>
      </div>

      <!-- Filter tabs -->
      <div class="mb-5 flex gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-all active:scale-95"
          :class="selectedType === tab.value
            ? 'border-slate-900 bg-slate-900 text-white'
            : 'border-slate-200 bg-white text-slate-600'"
          @click="setFilter(tab.value)"
        >
          {{ tab.label }}
          <span class="ml-1 text-xs opacity-60">({{ tab.count }})</span>
        </button>
      </div>

      <!-- Empty state -->
      <div v-if="visibleAccounts.length === 0" class="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
        <div class="mb-3 text-4xl">🏦</div>
        <p class="font-semibold text-slate-900">Nenhuma conta aqui</p>
        <p class="mt-1 text-sm text-slate-500">Clique em "+ Nova conta" para adicionar</p>
      </div>

      <!-- Contas correntes -->
      <section v-if="showContas && contaAccounts.length > 0" class="mb-6">
        <h2 class="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Contas correntes</h2>
        <div class="space-y-3">
          <AccountCard
            v-for="account in contaAccounts"
            :key="account.id"
            :account="account"
            :balance="balanceByAccount[account.id] ?? 0"
            :owner-label="ownerLabel(account.user_id as string | null)"
            @edit="openEdit(account)"
            @delete="removeAccount(account.id)"
          />
        </div>
      </section>

      <!-- Cartões -->
      <section v-if="showCartoes && cartaoAccounts.length > 0">
        <h2 class="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Cartões de crédito</h2>
        <div class="space-y-3">
          <AccountCard
            v-for="account in cartaoAccounts"
            :key="account.id"
            :account="account"
            :balance="balanceByAccount[account.id] ?? 0"
            :owner-label="ownerLabel(account.user_id as string | null)"
            @edit="openEdit(account)"
            @delete="removeAccount(account.id)"
          />
        </div>
      </section>
    </main>

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
import { useRoute, useRouter } from 'vue-router'
import type { RecordModel } from 'pocketbase'
import AccountDrawer from '../components/AccountDrawer.vue'
import AccountCard from '../components/AccountCard.vue'
import { useAccountsStore } from '../stores/accounts'
import { useTransactionsStore } from '../stores/transactions'
import { useCoupleStore } from '../stores/couple'

const route = useRoute()
const router = useRouter()
const coupleStore = useCoupleStore()
const accountsStore = useAccountsStore()
const transactionsStore = useTransactionsStore()

const drawerOpen = ref(false)
const editingAccount = ref<RecordModel | null>(null)

type FilterType = 'all' | 'conta' | 'cartao'
const selectedType = ref<FilterType>('all')

onMounted(async () => {
  const filterParam = route.query.filter as string | undefined
  if (filterParam === 'conta' || filterParam === 'cartao') {
    selectedType.value = filterParam
  }

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
const cartaoAccounts = computed(() =>
  accountsStore.accounts.filter((a) => a.type === 'cartao'),
)

const showContas = computed(() => selectedType.value === 'all' || selectedType.value === 'conta')
const showCartoes = computed(() => selectedType.value === 'all' || selectedType.value === 'cartao')

const visibleAccounts = computed(() => {
  if (selectedType.value === 'conta') return contaAccounts.value
  if (selectedType.value === 'cartao') return cartaoAccounts.value
  return accountsStore.accounts
})

const tabs = computed(() => [
  { value: 'all' as FilterType, label: 'Todos', count: accountsStore.accounts.length },
  { value: 'conta' as FilterType, label: 'Contas', count: contaAccounts.value.length },
  { value: 'cartao' as FilterType, label: 'Cartões', count: cartaoAccounts.value.length },
])

function setFilter(type: FilterType) {
  selectedType.value = type
  router.replace({ query: { ...route.query, filter: type === 'all' ? undefined : type } })
}

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
