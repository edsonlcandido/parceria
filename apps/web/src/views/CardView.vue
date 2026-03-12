<template>
  <div class="min-h-screen bg-[#e9edf4] pb-28">
    <main class="mx-auto max-w-2xl px-4 py-6">

      <!-- Navegador de mês -->
      <div class="mb-6">
        <MonthNavigator v-model="transactionsStore.selectedMonth" />
      </div>

      <!-- Resumo total -->
      <div class="mb-6 flex items-center justify-between rounded-2xl bg-white px-5 py-4 shadow-sm">
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Total da Fatura</p>
          <p class="mt-1 text-2xl font-bold" :class="grandTotal <= 0 ? 'text-rose-600' : 'text-slate-900'">
            {{ formatCurrency(Math.abs(grandTotal)) }}
          </p>
        </div>
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100">
          <svg class="h-6 w-6 text-violet-600" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path stroke-linecap="round" d="M2 10h20" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 15h4" />
          </svg>
        </div>
      </div>

      <!-- Vazio -->
      <div v-if="cartaoAccounts.length === 0" class="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
        <p class="font-semibold text-slate-900">Nenhum cartão cadastrado</p>
        <p class="mt-1 text-sm text-slate-500">Adicione um cartão em Contas</p>
      </div>

      <!-- Um bloco por cartão -->
      <section v-for="card in cartaoAccounts" :key="card.id" class="mb-6">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-xs font-bold uppercase tracking-widest text-slate-400">{{ card.name }}</h2>
          <span
            class="text-sm font-bold"
            :class="cardTotal(card.id) <= 0 ? 'text-rose-600' : 'text-slate-900'"
          >
            {{ formatCurrency(Math.abs(cardTotal(card.id))) }}
          </span>
        </div>

        <TransactionTable
          :rows="cardTransactions(card.id)"
          :accounts="accountsStore.accounts"
          :partner1-name="coupleStore.partner1Name"
          :partner2-name="coupleStore.partner2Name"
          :user1-id="coupleStore.user1Id"
          :user2-id="coupleStore.user2Id"
          @edit="openEditDrawer"
          @remove="removeTransaction"
        />
      </section>
    </main>

    <!-- FAB novo lançamento -->
    <button
      class="fixed bottom-24 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg active:scale-95 transition-transform"
      @click="openCreateDrawer"
    >
      <svg class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </button>

    <TransactionDrawer
      :open="drawerOpen"
      :model="editingTransaction"
      :couple-id="coupleStore.id || ''"
      :accounts="accountsStore.accounts"
      :selected-month="transactionsStore.selectedMonth"
      @close="closeDrawer"
      @save="saveTransaction"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { RecordModel } from 'pocketbase'
import MonthNavigator from '../components/MonthNavigator.vue'
import TransactionTable from '../components/TransactionTable.vue'
import TransactionDrawer from '../components/TransactionDrawer.vue'
import { useCoupleStore } from '../stores/couple'
import { useAccountsStore } from '../stores/accounts'
import { useTransactionsStore } from '../stores/transactions'

const route = useRoute()
const coupleStore = useCoupleStore()
const accountsStore = useAccountsStore()
const transactionsStore = useTransactionsStore()

const drawerOpen = ref(false)
const editingTransaction = ref<RecordModel | null>(null)

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

function cardTransactions(accountId: string): RecordModel[] {
  return transactionsStore.transactions.filter(
    (tx) => tx.account_id === accountId && isBillingMonth(tx)
  )
}

function cardTotal(accountId: string): number {
  return cardTransactions(accountId).reduce((sum, tx) => {
    const amount = Number(tx.amount || 0)
    return sum + (tx.type === 'expense' ? -amount : amount)
  }, 0)
}

const grandTotal = computed(() =>
  cartaoAccounts.value.reduce((sum, card) => sum + cardTotal(card.id), 0)
)

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function openCreateDrawer() {
  editingTransaction.value = null
  drawerOpen.value = true
}

function openEditDrawer(tx: RecordModel) {
  editingTransaction.value = tx
  drawerOpen.value = true
}

function closeDrawer() {
  drawerOpen.value = false
  editingTransaction.value = null
}

async function saveTransaction(payload: { id?: string; data: any }) {
  if (payload.id) {
    await transactionsStore.updateTransaction(payload.id, payload.data)
  } else {
    await transactionsStore.createTransaction(payload.data)
  }
  closeDrawer()
}

async function removeTransaction(id: string) {
  if (!confirm('Excluir este lançamento?')) return
  await transactionsStore.deleteTransaction(id)
}
</script>
