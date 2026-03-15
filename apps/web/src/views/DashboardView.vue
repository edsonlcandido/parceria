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
          :user1-id="coupleStore.user1Id"
          :user2-id="coupleStore.user2Id"
        />
      </div>

      <!-- Summary Cards -->
      <section class="mb-10 flex flex-col gap-3">
        <SummaryCard
          label="Contas"
          type="conta"
          :value="totals.contas"
          class="cursor-pointer"
          @click="router.push({ name: 'accounts', query: { ...route.query, filter: 'conta' } })"
        />
        <SummaryCard
          label="Cartões"
          type="cartao"
          :value="totals.cartoes"
          class="cursor-pointer"
          @click="router.push({ name: 'cards', query: route.query })"
        />
        <SummaryCard label="Receitas" type="income" :value="totals.receitas" />
        <SummaryCard label="Despesas" type="expense" :value="totals.despesas" />
      </section>

      <!-- Balance Section -->
      <section class="mb-10 space-y-1 text-right">
        <div>
          <span class="text-xs font-medium uppercase tracking-wide text-slate-400">Saldo do Mês</span>
          <p class="text-lg font-bold" :class="totals.saldoMes >= 0 ? 'text-emerald-600' : 'text-rose-600'">
            {{ formatCurrency(totals.saldoMes) }}
          </p>
        </div>
        <div>
          <span class="text-xs font-medium uppercase tracking-wide text-slate-400">Saldo Previsto</span>
          <p class="text-sm font-semibold" :class="totals.saldoPrevisto >= 0 ? 'text-emerald-500' : 'text-rose-500'">
            {{ formatCurrency(totals.saldoPrevisto) }}
          </p>
        </div>
      </section>

      <!-- Transactions Section -->
      <section>
        <div class="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h2 class="text-3xl font-bold text-slate-900">Lançamentos</h2>
          <button 
            class="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-slate-800 active:scale-95"
            @click="openCreateDrawer"
          >
            <span class="text-base">+</span>
            <span>Novo Lançamento</span>
          </button>
        </div>

        <div class="mb-4 relative">
          <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Buscar por descrição ou valor..."
            class="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <TransactionTable
          :rows="filteredTransactions"
          :accounts="accountsStore.accounts"
          :partner1-name="coupleStore.partner1Name"
          :partner2-name="coupleStore.partner2Name"
          :user1-id="coupleStore.user1Id"
          :user2-id="coupleStore.user2Id"
          @edit="openEditDrawer"
          @remove="removeTransaction"
          @consolidate="consolidateTransaction"
        />
      </section>
    </main>

    <TransactionDrawer
      :open="drawerOpen"
      :model="editingTransaction"
      :couple-id="coupleStore.id || ''"
      :accounts="accountsStore.accounts"
      :selected-month="transactionsStore.selectedMonth"
      :partner1-name="coupleStore.partner1Name"
      :partner2-name="coupleStore.partner2Name"
      :user1-id="coupleStore.user1Id"
      :user2-id="coupleStore.user2Id"
      @close="closeDrawer"
      @save="saveTransaction"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { RecordModel } from 'pocketbase'
import MonthNavigator from '../components/MonthNavigator.vue'
import OwnerFilter from '../components/OwnerFilter.vue'
import SummaryCard from '../components/SummaryCard.vue'
import TransactionTable from '../components/TransactionTable.vue'
import TransactionDrawer from '../components/TransactionDrawer.vue'
import { useCoupleStore } from '../stores/couple'
import { useAccountsStore } from '../stores/accounts'
import { useTransactionsStore } from '../stores/transactions'
import { parseLocalDate } from '../utils/date'

const route = useRoute()
const router = useRouter()
const coupleStore = useCoupleStore()
const accountsStore = useAccountsStore()
const transactionsStore = useTransactionsStore()

const drawerOpen = ref(false)
const editingTransaction = ref<RecordModel | null>(null)
const searchQuery = ref('')

const filteredTransactions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return transactionsStore.monthTransactions
  return transactionsStore.monthTransactions.filter((tx) => {
    const description = ((tx.description as string) || '').toLowerCase()
    const amount = Number(tx.amount || 0)
    const amountFormatted = formatCurrency(amount).toLowerCase()
    const amountStr = String(amount).replace('.', ',')
    return description.includes(q) || amountFormatted.includes(q) || amountStr.includes(q)
  })
})

const totals = computed(() => {
  const accountMap = new Map(accountsStore.accounts.map((account) => [account.id, account]))
  let contas = 0
  let cartoes = 0
  let receitas = 0
  let despesas = 0
  let receitasConsolidadas = 0
  let despesasConsolidadas = 0
  let receitasTodas = 0
  let despesasTodas = 0

  for (const tx of transactionsStore.byOwner) {
    const type = tx.type as 'income' | 'expense'
    const amount = Number(tx.amount || 0)
    const account = accountMap.get(tx.account_id as string)
    const isConta = account?.type === 'conta'
    const isCartao = account?.type === 'cartao'

    if (isConta && tx.consolidated) {
      contas += type === 'income' ? amount : -amount
    }

    if (isCartao && tx.consolidated) {
      const billingDateStr = (tx.monthly_budget || tx.date) as string
      const billingDate = parseLocalDate(billingDateStr)
      if (
        billingDate.getMonth() === transactionsStore.selectedMonth.getMonth() &&
        billingDate.getFullYear() === transactionsStore.selectedMonth.getFullYear()
      ) {
        cartoes += type === 'expense' ? -amount : amount
      }
    }

    const refDateStr = isCartao
      ? ((tx.monthly_budget || tx.date) as string)
      : (tx.date as string)
    const refDate = parseLocalDate(refDateStr)
    const isCurrentMonth =
      refDate.getMonth() === transactionsStore.selectedMonth.getMonth() &&
      refDate.getFullYear() === transactionsStore.selectedMonth.getFullYear()

    if (isCurrentMonth) {
      const isBillPayment = !isCartao && (tx.category as string) === 'bill_payment'

      if (!isCartao && !isBillPayment) {
        if (type === 'income') receitas += amount
        else despesas += amount

        if (tx.consolidated) {
          if (type === 'income') receitasConsolidadas += amount
          else despesasConsolidadas += amount
        }
      }

      if (!isBillPayment) {
        if (type === 'income') receitasTodas += amount
        else despesasTodas += amount
      }
    }
  }

  return {
    contas,
    cartoes,
    receitas,
    despesas,
    saldoMes: receitasConsolidadas - despesasConsolidadas,
    saldoPrevisto: receitasTodas - despesasTodas,
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

async function consolidateTransaction(id: string, date: string) {
  await transactionsStore.updateTransaction(id, { consolidated: true, date })
}
</script>
