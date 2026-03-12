<template>
  <div class="min-h-screen bg-[#e9edf4] pb-24">
    <main class="mx-auto max-w-2xl px-4 py-6">

      <!-- Header -->
      <div class="mb-6 flex items-center gap-3">
        <h1 class="flex-1 text-2xl font-bold text-slate-900">Cartões</h1>
        <button
          class="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white active:scale-95"
          @click="openCreate"
        >
          + Novo cartão
        </button>
      </div>

      <!-- Navegador de mês -->
      <div class="mb-6">
        <MonthNavigator v-model="transactionsStore.selectedMonth" />
      </div>

      <!-- Vazio -->
      <div v-if="cartaoAccounts.length === 0" class="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
        <div class="mb-3 text-4xl">💳</div>
        <p class="font-semibold text-slate-900">Nenhum cartão cadastrado</p>
        <p class="mt-1 text-sm text-slate-500">Clique em "+ Novo cartão" para adicionar</p>
      </div>

      <!-- Cards -->
      <div v-else class="space-y-2">
        <article
          v-for="card in cartaoAccounts"
          :key="card.id"
          class="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-sm"
        >
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100">
            <svg class="h-5 w-5 text-violet-600" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path stroke-linecap="round" d="M2 10h20" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 15h4" />
            </svg>
          </div>

          <div class="min-w-0 flex-1">
            <p class="truncate font-semibold text-slate-900 leading-tight">{{ card.name }}</p>
            <p class="mt-0.5 text-xs text-slate-500">{{ ownerLabel(card.user_id as string | null) }}</p>
          </div>

          <p class="text-sm font-bold" :class="cardTotal(card.id) <= 0 ? 'text-rose-600' : 'text-slate-900'">
            {{ formatCurrency(Math.abs(cardTotal(card.id))) }}
          </p>
        </article>
      </div>
    </main>

    <AccountDrawer
      :open="drawerOpen"
      :model="editingAccount"
      :couple-id="coupleStore.id || ''"
      :partner1-name="coupleStore.partner1Name"
      :partner2-name="coupleStore.partner2Name"
      :user1-id="coupleStore.user1Id"
      :user2-id="coupleStore.user2Id"
      default-type="cartao"
      @close="closeDrawer"
      @save="saveAccount"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { RecordModel } from 'pocketbase'
import MonthNavigator from '../components/MonthNavigator.vue'
import AccountDrawer from '../components/AccountDrawer.vue'
import { useCoupleStore } from '../stores/couple'
import { useAccountsStore } from '../stores/accounts'
import { useTransactionsStore } from '../stores/transactions'
import type { AccountPayload } from '../stores/accounts'

const route = useRoute()
const coupleStore = useCoupleStore()
const accountsStore = useAccountsStore()
const transactionsStore = useTransactionsStore()

const drawerOpen = ref(false)
const editingAccount = ref<RecordModel | null>(null)

onMounted(async () => {
  const token = typeof route.query.access_token === 'string'
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

const cartaoAccounts = computed(() =>
  accountsStore.accounts.filter((a) => a.type === 'cartao')
)

function isBillingMonth(tx: RecordModel): boolean {
  const dateStr = (tx.monthly_budget || tx.date) as string
  const d = new Date(dateStr)
  return (
    d.getMonth() === transactionsStore.selectedMonth.getMonth() &&
    d.getFullYear() === transactionsStore.selectedMonth.getFullYear()
  )
}

function cardTotal(accountId: string): number {
  return transactionsStore.transactions
    .filter((tx) => tx.account_id === accountId && isBillingMonth(tx))
    .reduce((sum, tx) => {
      const amount = Number(tx.amount || 0)
      return sum + (tx.type === 'expense' ? -amount : amount)
    }, 0)
}

function ownerLabel(userId: string | null): string {
  if (!userId) return 'Casal'
  if (userId === coupleStore.user1Id) return coupleStore.partner1Name
  if (userId === coupleStore.user2Id) return coupleStore.partner2Name
  return 'Outro'
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function openCreate() {
  editingAccount.value = null
  drawerOpen.value = true
}

function closeDrawer() {
  drawerOpen.value = false
  editingAccount.value = null
}

async function saveAccount(payload: { id?: string; data: AccountPayload }) {
  const data = { ...payload.data, type: 'cartao' as const }
  if (payload.id) {
    await accountsStore.updateAccount(payload.id, data)
  } else {
    await accountsStore.createAccount(data)
    if (coupleStore.id) {
      await transactionsStore.fetchTransactions(coupleStore.id)
    }
  }
  closeDrawer()
}
</script>
