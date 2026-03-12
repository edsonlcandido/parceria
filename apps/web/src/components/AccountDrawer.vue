<template>
  <div v-if="open" class="fixed inset-0 z-50 bg-slate-900/40">
    <div class="ml-auto h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-2xl">
      <div class="mb-5 flex items-center justify-between">
        <h3 class="text-2xl font-bold text-slate-900">{{ editing ? 'Editar Conta' : 'Nova Conta' }}</h3>
        <button class="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold" @click="$emit('close')">Fechar</button>
      </div>

      <form class="space-y-4" @submit.prevent="submitForm">
        <label class="block">
          <span class="mb-1 block text-sm font-semibold">Nome</span>
          <input v-model="form.name" class="w-full rounded-xl border border-slate-300 px-3 py-3" required />
        </label>

        <label class="block">
          <span class="mb-1 block text-sm font-semibold">Tipo</span>
          <select v-model="form.type" class="w-full rounded-xl border border-slate-300 px-3 py-3" required>
            <option value="conta">Conta</option>
            <option value="cartao">Cartão</option>
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

        <label class="block" v-if="!editing">
          <span class="mb-1 block text-sm font-semibold">Saldo Inicial</span>
          <input v-model.number="form.initialBalance" class="w-full rounded-xl border border-slate-300 px-3 py-3" type="number" step="0.01" placeholder="0,00" />
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
import type { AccountPayload, AccountType } from '../stores/accounts'

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
  (e: 'save', payload: { id?: string; data: AccountPayload }): void
}>()

const form = ref({
  name: '',
  type: 'conta' as AccountType,
  user_id: null as string | null,
  initialBalance: 0,
})

const editing = computed(() => !!props.model)

function resetForm() {
  form.value = { name: '', type: 'conta', user_id: null, initialBalance: 0 }
}

watch(
  () => props.model,
  (value) => {
    if (!value) {
      resetForm()
      return
    }
    form.value = {
      name: (value.name as string) || '',
      type: (value.type as AccountType) || 'conta',
      user_id: (value.user_id as string) || null,
      initialBalance: 0,
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
      name: form.value.name,
      type: form.value.type,
      user_id: form.value.user_id,
      initialBalance: Number(form.value.initialBalance || 0),
    },
  })
}
</script>
