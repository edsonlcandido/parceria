<template>
  <div class="min-h-screen bg-[#e9edf4] pb-20">
    <main class="mx-auto max-w-md px-3 py-4">
      <header class="mb-5 flex items-center justify-between rounded-3xl bg-white px-4 py-4 shadow-sm">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Contas</h1>
          <p class="text-sm text-slate-500">Gerencie contas e cartões</p>
        </div>
        <button class="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white" @click="openCreate">
          Nova Conta
        </button>
      </header>

      <section class="space-y-3">
        <article v-for="account in accountsStore.accounts" :key="account.id" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="text-lg font-bold text-slate-900">{{ account.name }}</p>
              <p class="text-sm text-slate-500">{{ account.type === 'conta' ? 'Conta' : 'Cartão' }} • {{ ownerLabel(account.owner_slot as string) }}</p>
            </div>
            <div class="flex gap-2">
              <button class="rounded-lg bg-slate-100 px-3 py-1 text-sm font-semibold" @click="openEdit(account)">Editar</button>
              <button class="rounded-lg bg-red-100 px-3 py-1 text-sm font-semibold text-red-700" @click="removeAccount(account.id)">Excluir</button>
            </div>
          </div>
        </article>
      </section>
    </main>

    <AccountDrawer
      :open="drawerOpen"
      :model="editingAccount"
      :couple-id="coupleStore.id || ''"
      :partner1-name="coupleStore.partner1Name"
      :partner2-name="coupleStore.partner2Name"
      @close="closeDrawer"
      @save="saveAccount"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { RecordModel } from 'pocketbase'
import AccountDrawer from '../components/AccountDrawer.vue'
import { useAccountsStore } from '../stores/accounts'
import { useCoupleStore } from '../stores/couple'

const route = useRoute()
const coupleStore = useCoupleStore()
const accountsStore = useAccountsStore()

const drawerOpen = ref(false)
const editingAccount = ref<RecordModel | null>(null)

onMounted(async () => {
  const token = typeof route.query.access_token === 'string' ? route.query.access_token : coupleStore.getStoredToken()
  if (!token) return

  const loaded = await coupleStore.loadByToken(token)
  if (loaded && coupleStore.id) {
    await accountsStore.fetchAccounts(coupleStore.id)
  }
})

function ownerLabel(ownerSlot: string) {
  if (ownerSlot === 'usuario_1') return coupleStore.partner1Name
  if (ownerSlot === 'usuario_2') return coupleStore.partner2Name
  return 'Casal'
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
  await accountsStore.deleteAccount(id)
}
</script>
