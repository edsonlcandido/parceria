<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-primary-50/30 pb-24">
    <main class="mx-auto max-w-2xl px-4 py-6">
      <!-- Header with Month Navigator -->
      <div class="mb-8">
        <MonthNavigator v-model="transactionsStore.selectedMonth" />
      </div>

      <!-- Owner Filter -->
      <div class="mb-8">
        <OwnerFilter
          v-model="transactionsStore.selectedOwner"
          :partner1-name="coupleStore.partner1Name"
          :partner2-name="coupleStore.partner2Name"
        />
      </div>

      <!-- Summary Cards -->
      <section class="mb-10 flex flex-col gap-3">
        <SummaryCard label="Contas" type="conta" :value="totals.contas" />
        <SummaryCard label="Cartões" type="cartao" :value="totals.cartoes" />
        <SummaryCard label="Receitas" type="income" :value="totals.receitas" />
        <SummaryCard label="Despesas" type="expense" :value="totals.despesas" />
      </section>

      <!-- Balance Section -->
      <section class="mb-10 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 shadow-xl text-white">
        <p class="text-sm font-semibold uppercase tracking-wide text-slate-400">Saldo do Mês</p>
        <p class="mt-2 text-5xl font-bold" :class="totals.saldoMes >= 0 ? 'text-emerald-400' : 'text-rose-400'">
          {{ formatCurrency(totals.saldoMes) }}
        </p>
        <div class="mt-4 h-1 w-20 bg-gradient-to-r" :class="totals.saldoMes >= 0 ? 'from-emerald-400 to-green-500' : 'from-rose-400 to-red-500'"></div>
      </section>

      <!-- Transactions Section -->
      <section>
        <div class="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h2 class="text-3xl font-bold text-slate-900">Lançamentos</h2>
          <button 
            class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:from-primary-700 hover:to-primary-800 active:scale-95"
            @click="openCreateDrawer"
          >
            <span class="text-lg">+</span>
            <span>Novo Lançamento</span>
          </button>
        </div>

        <TransactionTable
          :rows="transactionsStore.monthTransactions"
          :accounts="accountsStore.accounts"
          :partner1-name="coupleStore.partner1Name"
          :partner2-name="coupleStore.partner2Name"
          @edit="openEditDrawer"
          @remove="removeTransaction"
        />
      </section>
    </main>

    <TransactionDrawer
      :open="drawerOpen"
      :model="editingTransaction"
      :couple-id="coupleStore.id || ''"
      :accounts="accountsStore.accounts"
      :partner1-name="coupleStore.partner1Name"
      :partner2-name="coupleStore.partner2Name"
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
import OwnerFilter from '../components/OwnerFilter.vue'
import SummaryCard from '../components/SummaryCard.vue'
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

const totals = computed(() => {
  const accountMap = new Map(accountsStore.accounts.map((account) => [account.id, account]))
  let contas = 0
  let cartoes = 0
  let receitas = 0
  let despesas = 0

  for (const tx of transactionsStore.byOwner) {
    const type = tx.type as 'income' | 'expense'
    const amount = Number(tx.amount || 0)
    const account = accountMap.get(tx.account_id as string)
    const isConta = account?.type === 'conta'
    const isCartao = account?.type === 'cartao'

    if (isConta) {
      contas += type === 'income' ? amount : -amount
    }

    if (isCartao) {
      cartoes += type === 'expense' ? -amount : amount
    }

    const monthDate = new Date(tx.date as string)
    if (
      monthDate.getMonth() === transactionsStore.selectedMonth.getMonth() &&
      monthDate.getFullYear() === transactionsStore.selectedMonth.getFullYear()
    ) {
      if (type === 'income') receitas += amount
      else despesas += amount
    }
  }

  return {
    contas,
    cartoes,
    receitas,
    despesas,
    saldoMes: receitas - despesas,
  }
})

onMounted(async () => {
  const token = typeof route.query.access_token === 'string' ? route.query.access_token : coupleStore.getStoredToken()
  if (!token) return

  const loaded = await coupleStore.loadByToken(token)
  if (!loaded || !coupleStore.id) return

  await Promise.all([
    accountsStore.fetchAccounts(coupleStore.id),
    transactionsStore.fetchTransactions(coupleStore.id),
  ])
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function openCreateDrawer() {
  editingTransaction.value = null
  drawerOpen.value = true
}

function openEditDrawer(model: RecordModel) {
  editingTransaction.value = model
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
  await transactionsStore.deleteTransaction(id)
}
</script>
