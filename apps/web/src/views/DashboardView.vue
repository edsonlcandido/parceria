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
        <SummaryCard
          label="Receitas"
          type="income"
          :value="totals.receitas"
          class="cursor-pointer transition-all"
          :class="typeFilter === 'income' ? 'ring-2 ring-white/60 ring-offset-2 ring-offset-emerald-600 scale-[1.02]' : ''"
          @click="typeFilter = typeFilter === 'income' ? null : 'income'"
        />
        <SummaryCard
          label="Despesas"
          type="expense"
          :value="totals.despesas"
          class="cursor-pointer transition-all"
          :class="typeFilter === 'expense' ? 'ring-2 ring-white/60 ring-offset-2 ring-offset-rose-600 scale-[1.02]' : ''"
          @click="typeFilter = typeFilter === 'expense' ? null : 'expense'"
        />
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
          <div class="flex items-center gap-2">
            <button
              class="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 active:scale-95 disabled:opacity-50"
              :disabled="applyingRecurring"
              @click="applyRecurring"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <span>{{ applyingRecurring ? 'Aplicando...' : 'Aplicar Fixos' }}</span>
            </button>
            <button 
              class="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-slate-800 active:scale-95"
              @click="openCreateDrawer"
            >
              <span class="text-base">+</span>
              <span>Novo Lançamento</span>
            </button>
          </div>
        </div>

        <!-- Feedback de aplicação de fixos -->
        <div
          v-if="applyFeedback"
          class="mb-4 rounded-2xl px-4 py-3 text-sm font-medium"
          :class="applyFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'"
        >
          {{ applyFeedback.message }}
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

        <div v-if="typeFilter" class="mb-4 flex items-center gap-2">
          <span
            class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            :class="typeFilter === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'"
          >
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
            </svg>
            Filtrando: {{ typeFilter === 'income' ? 'Receitas' : 'Despesas' }}
          </span>
          <button
            class="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-700"
            @click="typeFilter = null"
          >
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Limpar filtro
          </button>
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
import { computed, onMounted, ref, watch } from 'vue'
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
import { useRecurringTransactionsStore } from '../stores/recurringTransactions'
import { parseLocalDate, isSameMonth } from '../utils/date'

const route = useRoute()
const router = useRouter()
const coupleStore = useCoupleStore()
const accountsStore = useAccountsStore()
const transactionsStore = useTransactionsStore()
const recurringStore = useRecurringTransactionsStore()

const drawerOpen = ref(false)
const editingTransaction = ref<RecordModel | null>(null)
const searchQuery = ref('')
const applyingRecurring = ref(false)
const applyFeedback = ref<{ type: 'success' | 'info'; message: string } | null>(null)
const typeFilter = ref<'income' | 'expense' | null>(null)

watch(
  [() => transactionsStore.selectedMonth, () => transactionsStore.selectedOwner],
  () => { typeFilter.value = null }
)

const filteredTransactions = computed(() => {
  let list = transactionsStore.monthTransactions

  if (typeFilter.value) {
    list = list.filter((tx) => tx.type === typeFilter.value)
  }

  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return list

  return list.filter((tx) => {
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
    recurringStore.fetchAll(coupleStore.id),
  ])
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function buildTargetDate(day: number, base: Date): string {
  const year = base.getFullYear()
  const month = base.getMonth()
  const lastDay = new Date(year, month + 1, 0).getDate()
  const clampedDay = Math.min(day, lastDay)
  const m = String(month + 1).padStart(2, '0')
  const d = String(clampedDay).padStart(2, '0')
  return `${year}-${m}-${d}`
}

function firstDayOfMonthBudget(base: Date): string {
  const year = base.getFullYear()
  const m = String(base.getMonth() + 1).padStart(2, '0')
  return `${year}-${m}-01T17:00:00.000Z`
}

async function applyRecurring() {
  if (!coupleStore.id) return

  const fixos = recurringStore.sortedByDay
  if (fixos.length === 0) {
    applyFeedback.value = { type: 'info', message: 'Nenhum lançamento fixo cadastrado.' }
    setTimeout(() => (applyFeedback.value = null), 4000)
    return
  }

  applyingRecurring.value = true
  applyFeedback.value = null

  const selectedMonth = transactionsStore.selectedMonth
  let added = 0
  let skipped = 0

  for (const fixo of fixos) {
    const desc = (fixo.description as string) || ''
    const alreadyExists = transactionsStore.transactions.some((tx) => {
      const refDate = ((tx.monthly_budget || tx.date) as string) || ''
      return (tx.description as string) === desc && isSameMonth(refDate, selectedMonth)
    })

    if (alreadyExists) {
      skipped++
      continue
    }

    const targetDate = buildTargetDate(fixo.day as number, selectedMonth)
    await transactionsStore.createTransaction({
      couple_id: coupleStore.id,
      account_id: null,
      user_id: (fixo.user_id as string) || null,
      type: fixo.type as 'income' | 'expense',
      amount: fixo.amount as number,
      description: desc,
      date: new Date(targetDate + 'T12:00:00').toISOString(),
      consolidated: false,
      monthly_budget: firstDayOfMonthBudget(selectedMonth),
    })
    added++
  }

  applyingRecurring.value = false

  const parts: string[] = []
  if (added > 0) parts.push(`${added} ${added === 1 ? 'fixo adicionado' : 'fixos adicionados'}`)
  if (skipped > 0) parts.push(`${skipped} já ${skipped === 1 ? 'existia' : 'existiam'}`)
  applyFeedback.value = {
    type: added > 0 ? 'success' : 'info',
    message: parts.join(', ') + '.',
  }
  setTimeout(() => (applyFeedback.value = null), 5000)
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
