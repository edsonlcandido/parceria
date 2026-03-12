<template>
  <div v-if="open" class="fixed inset-0 z-50 bg-slate-900/40">
    <div class="ml-auto h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-2xl">
      <div class="mb-5 flex items-center justify-between">
        <h3 class="text-2xl font-bold text-slate-900">{{ editing ? 'Editar Lançamento' : 'Novo Lançamento' }}</h3>
        <button class="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold" @click="$emit('close')">Fechar</button>
      </div>

      <form class="space-y-4" @submit.prevent="submitForm">
        <label class="block">
          <span class="mb-1 block text-sm font-semibold">Conta</span>
          <select v-model="form.account_id" class="w-full rounded-xl border border-slate-300 px-3 py-3" required>
            <option value="" disabled>Selecione</option>
            <option v-for="account in accounts" :key="account.id" :value="account.id">{{ account.name }}</option>
          </select>
        </label>

        <label class="block">
          <span class="mb-1 block text-sm font-semibold">Responsável</span>
          <select v-model="form.user_id" class="w-full rounded-xl border border-slate-300 px-3 py-3">
            <option :value="null">Casal</option>
            <option v-if="user1Id" :value="user1Id">{{ partner1Name }}</option>
            <option v-if="user2Id" :value="user2Id">{{ partner2Name }}</option>
          </select>
        </label>

        <label class="block">
          <span class="mb-1 block text-sm font-semibold">Tipo</span>
          <select v-model="form.type" class="w-full rounded-xl border border-slate-300 px-3 py-3" required>
            <option value="income">Receita</option>
            <option value="expense">Despesa</option>
          </select>
        </label>

        <label class="block">
          <span class="mb-1 block text-sm font-semibold">Valor</span>
          <input v-model.number="form.amount" class="w-full rounded-xl border border-slate-300 px-3 py-3" type="number" min="0" step="0.01" required />
        </label>

        <label class="block">
          <span class="mb-1 block text-sm font-semibold">Descrição</span>
          <input v-model="form.description" class="w-full rounded-xl border border-slate-300 px-3 py-3" type="text" />
        </label>

        <label class="block">
          <span class="mb-1 block text-sm font-semibold">Data</span>
          <input v-model="form.date" class="w-full rounded-xl border border-slate-300 px-3 py-3" type="date" required />
        </label>

        <label class="flex items-center gap-2">
          <input v-model="form.consolidated" type="checkbox" />
          <span class="text-sm font-semibold">Consolidado</span>
        </label>

        <button class="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800" type="submit">
          Salvar
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { RecordModel } from 'pocketbase'
import type { TransactionPayload } from '../stores/transactions'

const props = defineProps<{
  open: boolean
  coupleId: string
  accounts: RecordModel[]
  partner1Name: string
  partner2Name: string
  user1Id: string | null
  user2Id: string | null
  model?: RecordModel | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: { id?: string; data: TransactionPayload }): void
}>()

const form = ref({
  account_id: '',
  user_id: null as string | null,
  type: 'expense' as 'income' | 'expense',
  amount: 0,
  description: '',
  date: new Date().toISOString().slice(0, 10),
  consolidated: false,
})

const editing = computed(() => !!props.model)

watch(
  () => props.model,
  (value) => {
    if (!value) {
      form.value = {
        account_id: props.accounts[0]?.id || '',
        user_id: null,
        type: 'expense',
        amount: 0,
        description: '',
        date: new Date().toISOString().slice(0, 10),
        consolidated: false,
      }
      return
    }

    form.value = {
      account_id: (value.account_id as string) || '',
      user_id: (value.user_id as string) || null,
      type: (value.type as 'income' | 'expense') || 'expense',
      amount: (value.amount as number) || 0,
      description: (value.description as string) || '',
      date: new Date(value.date as string).toISOString().slice(0, 10),
      consolidated: !!value.consolidated,
    }
  },
  { immediate: true }
)

function submitForm() {
  const payload: TransactionPayload = {
    couple_id: props.coupleId,
    account_id: form.value.account_id,
    user_id: form.value.user_id,
    type: form.value.type,
    amount: Number(form.value.amount),
    description: form.value.description,
    date: new Date(form.value.date).toISOString(),
    consolidated: form.value.consolidated,
  }

  emit('save', { id: props.model?.id, data: payload })
}
</script>
