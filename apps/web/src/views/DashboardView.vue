<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-primary-50/30 pb-24">
    <main class="mx-auto max-w-2xl px-4 py-6">
      <!-- Header with Month Navigator -->
      <div class="mb-8">
        <MonthNavigator v-model="transactionsStore.selectedMonth" />
      </div>

      <!-- Owner Filter + Settings -->
      <div class="mb-8 flex items-center gap-3">
        <OwnerFilter
          v-model="transactionsStore.selectedOwner"
          :partner1-name="coupleStore.partner1Name"
          :partner2-name="coupleStore.partner2Name"
          :user1-id="coupleStore.user1Id"
          :user2-id="coupleStore.user2Id"
          class="flex-1"
        />
        <button
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm transition-colors hover:text-slate-900 active:scale-95"
          title="Configurações"
          @click="router.push({ name: 'settings' })"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.43.992a6.932 6.932 0 010 .255c-.008.378.137.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
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

        <TransactionTable
          :rows="transactionsStore.monthTransactions"
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
      if (!isCartao) {
        if (type === 'income') receitas += amount
        else despesas += amount

        if (tx.consolidated) {
          if (type === 'income') receitasConsolidadas += amount
          else despesasConsolidadas += amount
        }
      }

      if (type === 'income') receitasTodas += amount
      else despesasTodas += amount
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
</script>
