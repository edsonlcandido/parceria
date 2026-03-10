<template>
  <div class="min-h-screen bg-[#e9edf4] pb-20">
    <main class="mx-auto max-w-md px-3 py-4">
      <MonthNavigator v-model="transactionsStore.selectedMonth" />

      <OwnerFilter
        v-model="transactionsStore.selectedOwner"
        :partner1-name="coupleStore.partner1Name"
        :partner2-name="coupleStore.partner2Name"
      />

      <section class="mt-6 space-y-4">
        <SummaryCard label="Contas" type="conta" :value="totals.contas" />
        <SummaryCard label="Cartões" type="cartao" :value="totals.cartoes" />
        <SummaryCard label="Receitas" type="income" :value="totals.receitas" />
        <SummaryCard label="Despesas" type="expense" :value="totals.despesas" />
      </section>

      <section class="mt-6 text-right">
        <p class="text-4xl font-medium text-slate-500">Saldo do Mês</p>
        <p class="text-6xl font-bold" :class="totals.saldoMes >= 0 ? 'text-green-700' : 'text-red-600'">
          {{ formatCurrency(totals.saldoMes) }}
        </p>
      </section>

      <section class="mt-8">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-6xl font-bold text-slate-900">Lançamentos</h2>
          <button class="rounded-2xl bg-blue-600 px-4 py-3 text-xl font-semibold text-white" @click="openCreateDrawer">
            + Novo
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
