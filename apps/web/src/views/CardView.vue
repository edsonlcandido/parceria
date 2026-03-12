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
        <AccountCard
          v-for="card in cartaoAccounts"
          :key="card.id"
          :account="card"
          :balance="cardTotal(card.id)"
          :owner-label="ownerLabel(card.user_id as string | null)"
          @select="openActions(card)"
        />
      </div>
    </main>

    <!-- Actions drawer -->
    <div v-if="actionsAccount" class="fixed inset-0 z-50 bg-slate-900/40" @click.self="actionsAccount = null">
      <div class="ml-auto h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-2xl">
        <div class="mb-6 flex items-center justify-between">
          <div>
            <h3 class="text-2xl font-bold text-slate-900">{{ actionsAccount.name }}</h3>
            <p class="mt-0.5 text-sm text-slate-500">Cartão de crédito</p>
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
            Editar cartão
          </button>
          <button
            class="flex w-full items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-4 text-sm font-semibold text-rose-600 active:scale-[0.98] transition-transform"
            @click="removeAccount(actionsAccount.id); actionsAccount = null"
          >
            <svg class="h-5 w-5 text-rose-400" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Excluir cartão
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
import AccountCard from '../components/AccountCard.vue'
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
const actionsAccount = ref<RecordModel | null>(null)

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

function openActions(model: RecordModel) {
  actionsAccount.value = model
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

async function removeAccount(id: string) {
  if (!confirm('Excluir este cartão? As transações vinculadas não serão removidas.')) return
  await accountsStore.deleteAccount(id)
}
</script>
