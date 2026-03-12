<template>
  <div class="min-h-screen bg-[#e9edf4] pb-24">
    <main class="mx-auto max-w-2xl px-4 py-6">

      <!-- Header -->
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Contas</h1>
          <p class="text-sm text-slate-500">{{ accountsStore.accounts.length }} conta{{ accountsStore.accounts.length !== 1 ? 's' : '' }} cadastrada{{ accountsStore.accounts.length !== 1 ? 's' : '' }}</p>
        </div>
        <button
          class="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white active:scale-95"
          @click="openCreate"
        >
          + Nova conta
        </button>
      </div>

      <!-- Empty state -->
      <div v-if="accountsStore.accounts.length === 0" class="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
        <div class="mb-3 text-4xl">🏦</div>
        <p class="font-semibold text-slate-900">Nenhuma conta ainda</p>
        <p class="mt-1 text-sm text-slate-500">Clique em "Nova conta" para começar</p>
      </div>

      <!-- Contas correntes -->
      <section v-if="contaAccounts.length > 0" class="mb-6">
        <h2 class="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Contas correntes</h2>
        <div class="space-y-3">
          <AccountCard
            v-for="account in contaAccounts"
            :key="account.id"
            :account="account"
            :balance="accountBalance(account.id)"
            :owner-label="ownerLabel(account.user_id as string | null)"
            @edit="openEdit(account)"
            @delete="removeAccount(account.id)"
          />
        </div>
      </section>

      <!-- Cartões -->
      <section v-if="cartaoAccounts.length > 0">
        <h2 class="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Cartões de crédito</h2>
        <div class="space-y-3">
          <AccountCard
            v-for="account in cartaoAccounts"
            :key="account.id"
            :account="account"
            :balance="accountBalance(account.id)"
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
const cartaoAccounts = computed(() =>
  accountsStore.accounts.filter((a) => a.type === 'cartao'),
)

function accountBalance(accountId: string): number {
  return transactionsStore.transactions
    .filter((tx) => tx.account_id === accountId && tx.consolidated)
    .reduce((sum, tx) => {
      return tx.type === 'income' ? sum + (tx.amount as number) : sum - (tx.amount as number)
    }, 0)
}

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
  }
  closeDrawer()
}

async function removeAccount(id: string) {
  if (!confirm('Excluir esta conta? As transações vinculadas não serão removidas.')) return
  await accountsStore.deleteAccount(id)
}
</script>
