<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-primary-50/30 pb-24">
    <main class="mx-auto max-w-2xl px-4 py-6">
      <!-- Header -->
      <div class="mb-10">
        <div class="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h1 class="text-4xl font-bold text-slate-900">Contas e Cartões</h1>
            <p class="mt-2 text-slate-600">Gerencie suas contas e cartões</p>
          </div>
          <button 
            class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:from-primary-700 hover:to-primary-800 active:scale-95 whitespace-nowrap"
            @click="openCreate"
          >
            <span class="text-lg">+</span>
            <span>Nova Conta</span>
          </button>
        </div>
      </div>

      <!-- Accounts Grid -->
      <section class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <article 
          v-for="account in accountsStore.accounts" 
          :key="account.id" 
          class="group relative overflow-hidden rounded-2xl border border-slate-200/50 bg-white p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary-200"
        >
          <!-- Background gradient on hover -->
          <div class="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          
          <!-- Content -->
          <div class="relative z-10">
            <div class="mb-4 flex items-start justify-between gap-2">
              <div class="flex-1">
                <h3 class="text-xl font-bold text-slate-900">{{ account.name }}</h3>
                <p class="mt-1 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <span class="inline-block h-2 w-2 rounded-full" :class="account.type === 'conta' ? 'bg-blue-500' : 'bg-purple-500'"></span>
                  {{ account.type === 'conta' ? 'Conta Corrente' : 'Cartão' }}
                </p>
                <p class="mt-2 text-sm text-slate-600">{{ ownerLabel(account.owner_slot as string) }}</p>
              </div>
              <div class="text-3xl" :class="account.type === 'conta' ? '🏦' : '💳'"></div>
            </div>

            <!-- Actions -->
            <div class="mt-6 flex gap-2">
              <button 
                class="flex-1 rounded-lg border border-primary-300 bg-primary-50 px-3 py-2 text-sm font-semibold text-primary-700 transition-all duration-200 hover:bg-primary-100 active:scale-95"
                @click="openEdit(account)"
              >
                Editar
              </button>
              <button 
                class="flex-1 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition-all duration-200 hover:bg-rose-100 active:scale-95"
                @click="removeAccount(account.id)"
              >
                Excluir
              </button>
            </div>
          </div>
        </article>

        <!-- Empty State -->
        <div v-if="accountsStore.accounts.length === 0" class="col-span-full rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center">
          <div class="text-4xl mb-3">📭</div>
          <h3 class="text-lg font-semibold text-slate-900">Nenhuma conta criada</h3>
          <p class="mt-2 text-slate-600">Clique em "Nova Conta" para adicionar sua primeira conta ou cartão</p>
        </div>
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
