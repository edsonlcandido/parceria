<template>
  <div v-if="open" class="fixed inset-0 z-50 bg-slate-900/40">
    <div class="ml-auto h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-2xl">
      <div class="mb-5 flex items-center justify-between">
        <h3 class="text-2xl font-bold text-slate-900">{{ editing ? 'Editar Fixo' : 'Novo Fixo' }}</h3>
        <button class="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold" @click="$emit('close')">Fechar</button>
      </div>

      <form class="space-y-4" @submit.prevent="submitForm">
        <label class="block">
          <span class="mb-1 block text-sm font-semibold">Descrição</span>
          <input v-model="form.description" class="w-full rounded-xl border border-slate-300 px-3 py-3" type="text" required />
        </label>

        <label class="block">
          <span class="mb-1 block text-sm font-semibold">Valor</span>
          <input v-model.number="form.amount" class="w-full rounded-xl border border-slate-300 px-3 py-3" type="number" min="0" step="0.01" required />
        </label>

        <label class="block">
          <span class="mb-1 block text-sm font-semibold">Tipo</span>
          <select v-model="form.type" class="w-full rounded-xl border border-slate-300 px-3 py-3" required>
            <option value="income">Receita</option>
            <option value="expense">Despesa</option>
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
          <span class="mb-1 block text-sm font-semibold">Dia do mês</span>
          <input v-model.number="form.day" class="w-full rounded-xl border border-slate-300 px-3 py-3" type="number" min="1" max="31" required />
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
import type { RecurringTransactionPayload } from '../stores/recurringTransactions'

const props = defineProps<{
  open: boolean
  coupleId: string
  partner1Name: string
  partner2Name: string
  user1Id: string | null
  user2Id: string | null
  model?: RecordModel | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: { id?: string; data: RecurringTransactionPayload }): void
}>()

const form = ref({
  description: '',
  amount: 0,
  type: 'expense' as 'income' | 'expense',
  user_id: null as string | null,
  day: 1,
})

const editing = computed(() => !!props.model)

function resetForm() {
  form.value = {
    description: '',
    amount: 0,
    type: 'expense',
    user_id: null,
    day: 1,
  }
}

watch(
  () => props.model,
  (value) => {
    if (!value) {
      resetForm()
      return
    }
    form.value = {
      description: (value.description as string) || '',
      amount: (value.amount as number) || 0,
      type: (value.type as 'income' | 'expense') || 'expense',
      user_id: (value.user_id as string) || null,
      day: (value.day as number) || 1,
    }
  },
  { immediate: true }
)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && !props.model) resetForm()
  }
)

function submitForm() {
  emit('save', {
    id: props.model?.id,
    data: {
      couple_id: props.coupleId,
      user_id: form.value.user_id,
      description: form.value.description,
      amount: Number(form.value.amount),
      type: form.value.type,
      day: Number(form.value.day),
    },
  })
}
</script>
