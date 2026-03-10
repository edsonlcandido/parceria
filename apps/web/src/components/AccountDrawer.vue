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
          <select v-model="form.owner_slot" class="w-full rounded-xl border border-slate-300 px-3 py-3" required>
            <option value="casal">Casal</option>
            <option value="usuario_1">{{ partner1Name }}</option>
            <option value="usuario_2">{{ partner2Name }}</option>
          </select>
        </label>

        <label class="block" v-if="!editing">
          <span class="mb-1 block text-sm font-semibold">Saldo Inicial</span>
          <input v-model.number="form.initialBalance" class="w-full rounded-xl border border-slate-300 px-3 py-3" type="number" step="0.01" />
        </label>

        <button class="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700" type="submit">
          Salvar
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { RecordModel } from 'pocketbase'
import type { AccountPayload, AccountType, OwnerSlot } from '../stores/accounts'

const props = defineProps<{
  open: boolean
  coupleId: string
  partner1Name: string
  partner2Name: string
  model?: RecordModel | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: { id?: string; data: AccountPayload }): void
}>()

const form = ref({
  name: '',
  type: 'conta' as AccountType,
  owner_slot: 'casal' as OwnerSlot,
  initialBalance: 0,
})

const editing = computed(() => !!props.model)

watch(
  () => props.model,
  (value) => {
    if (!value) {
      form.value = {
        name: '',
        type: 'conta',
        owner_slot: 'casal',
        initialBalance: 0,
      }
      return
    }

    form.value = {
      name: (value.name as string) || '',
      type: (value.type as AccountType) || 'conta',
      owner_slot: (value.owner_slot as OwnerSlot) || 'casal',
      initialBalance: 0,
    }
  },
  { immediate: true }
)

function submitForm() {
  emit('save', {
    id: props.model?.id,
    data: {
      couple_id: props.coupleId,
      name: form.value.name,
      type: form.value.type,
      owner_slot: form.value.owner_slot,
      initialBalance: Number(form.value.initialBalance || 0),
    },
  })
}
</script>
