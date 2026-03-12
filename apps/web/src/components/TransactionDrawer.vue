<template>
  <div v-if="open" class="fixed inset-0 z-50 bg-slate-900/40">
    <div class="ml-auto h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-2xl">
      <div class="mb-5 flex items-center justify-between">
        <h3 class="text-2xl font-bold text-slate-900">{{ editing ? 'Editar Lançamento' : 'Novo Lançamento' }}</h3>
        <button class="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold" @click="$emit('close')">Fechar</button>
      </div>

      <!-- Toggle Consolidado / Planejado -->
      <div class="mb-5 flex rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          class="flex-1 rounded-lg py-2 text-sm font-semibold transition-all"
          :class="!planned ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'"
          @click="planned = false"
        >
          Consolidado
        </button>
        <button
          type="button"
          class="flex-1 rounded-lg py-2 text-sm font-semibold transition-all"
          :class="planned ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'"
          @click="planned = true"
        >
          Planejado
        </button>
      </div>

      <form class="space-y-4" @submit.prevent="submitForm">
        <label class="block">
          <span class="mb-1 block text-sm font-semibold">Conta</span>
          <select v-model="form.account_id" class="w-full rounded-xl border border-slate-300 px-3 py-3" :required="!planned">
            <option value="">{{ planned ? 'Nenhuma (opcional)' : 'Selecione' }}</option>
            <option v-for="account in accounts" :key="account.id" :value="account.id">{{ accountLabel(account) }}</option>
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

        <div class="block">
          <span class="mb-1 block text-sm font-semibold">Mês da Fatura</span>
          <MonthPicker v-model="form.monthly_budget" />
        </div>

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
import MonthPicker from './MonthPicker.vue'
import { parseLocalDate } from '../utils/date'

const props = defineProps<{
  open: boolean
  coupleId: string
  accounts: RecordModel[]
  model?: RecordModel | null
  prefilledAccountId?: string
  selectedMonth?: Date
  partner1Name?: string
  partner2Name?: string
  user1Id?: string | null
  user2Id?: string | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: { id?: string; data: TransactionPayload }): void
}>()

function ownerName(userId: string | null | undefined): string {
  if (!userId) return 'Casal'
  if (userId === props.user1Id) return props.partner1Name || ''
  if (userId === props.user2Id) return props.partner2Name || ''
  return ''
}

function accountLabel(account: RecordModel): string {
  const name = account.name as string
  const owner = ownerName(account.user_id as string | null)
  return owner ? `${name} - ${owner}` : name
}

function firstDayOfMonth(date: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth(), 1)
  return d.toISOString().slice(0, 10)
}

const planned = ref(false)

const isCartaoAccount = computed(() => {
  const account = props.accounts.find((a) => a.id === form.value.account_id)
  return account?.type === 'cartao'
})

const form = ref({
  account_id: '',
  type: 'expense' as 'income' | 'expense',
  amount: 0,
  description: '',
  date: new Date().toISOString().slice(0, 10),
  consolidated: false,
  monthly_budget: '',
})

const editing = computed(() => !!props.model)

watch(
  () => [props.model, props.open, props.prefilledAccountId] as const,
  ([value]) => {
    const baseMonth = props.selectedMonth ?? new Date()
    if (!value) {
      planned.value = false
      if (props.prefilledAccountId) {
        form.value = {
          account_id: props.prefilledAccountId,
          type: 'income',
          amount: 0,
          description: 'Saldo inicial',
          date: new Date().toISOString().slice(0, 10),
          consolidated: true,
          monthly_budget: firstDayOfMonth(baseMonth),
        }
      } else {
        form.value = {
          account_id: props.accounts[0]?.id || '',
          type: 'expense',
          amount: 0,
          description: '',
          date: new Date().toISOString().slice(0, 10),
          consolidated: false,
          monthly_budget: firstDayOfMonth(baseMonth),
        }
      }
      return
    }

    const hasAccount = !!(value.account_id as string)
    planned.value = !hasAccount

    form.value = {
      account_id: (value.account_id as string) || '',
      type: (value.type as 'income' | 'expense') || 'expense',
      amount: (value.amount as number) || 0,
      description: (value.description as string) || '',
      date: new Date(value.date as string).toISOString().slice(0, 10),
      consolidated: !!value.consolidated,
      monthly_budget: value.monthly_budget
        ? new Date(value.monthly_budget as string).toISOString().slice(0, 10)
        : firstDayOfMonth(baseMonth),
    }
  },
  { immediate: true }
)

watch(
  () => form.value.account_id,
  () => {
    if (isCartaoAccount.value && !form.value.monthly_budget) {
      form.value.monthly_budget = firstDayOfMonth(props.selectedMonth ?? new Date())
    }
  }
)

function submitForm() {
  const selectedAccount = props.accounts.find((acc) => acc.id === form.value.account_id)

  const payload: TransactionPayload = {
    couple_id: props.coupleId,
    account_id: form.value.account_id || null,
    user_id: selectedAccount?.user_id || null,
    type: form.value.type,
    amount: Number(form.value.amount),
    description: form.value.description,
    date: new Date(form.value.date).toISOString(),
    consolidated: !planned.value,
    monthly_budget: form.value.monthly_budget
      ? `${form.value.monthly_budget}T17:00:00.000Z`
      : null,
  }

  emit('save', { id: props.model?.id, data: payload })
}
</script>
