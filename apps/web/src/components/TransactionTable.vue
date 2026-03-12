<template>
  <div class="flex flex-col gap-3">
    <div
      v-for="item in rows"
      :key="item.id"
      class="rounded-xl bg-white p-4 shadow-sm border border-slate-100 active:scale-[0.98] transition-transform duration-150"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            :class="item.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'"
          >
            <svg v-if="item.type === 'income'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-slate-900 truncate">{{ item.description || (item.type === 'income' ? 'Receita' : 'Despesa') }}</p>
            <p class="text-xs text-slate-400 mt-0.5">{{ accountName(item.account_id) }} · {{ ownerLabel(item.owner_slot) }}</p>
          </div>
        </div>
        <div class="text-right shrink-0">
          <p class="text-sm font-bold" :class="item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'">
            {{ item.type === 'income' ? '+' : '-' }}{{ formatCurrency(item.amount as number) }}
          </p>
          <p class="text-xs text-slate-400 mt-0.5">{{ formatDate(item.date as string) }}</p>
        </div>
      </div>
      <div class="mt-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span
            v-if="item.consolidated"
            class="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700"
          >Consolidado</span>
          <span
            v-else
            class="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700"
          >Pendente</span>
        </div>
        <div class="flex gap-2">
          <button
            class="rounded-lg px-3 py-1.5 text-xs font-semibold text-primary-600 transition-colors hover:bg-primary-50 active:scale-95"
            @click="$emit('edit', item)"
          >Editar</button>
          <button
            class="rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 active:scale-95"
            @click="$emit('remove', item.id)"
          >Excluir</button>
        </div>
      </div>
    </div>

    <div v-if="rows.length === 0" class="py-12 text-center text-slate-400">
      <p class="text-sm">Sem lançamentos no período.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RecordModel } from 'pocketbase'

const props = defineProps<{
  rows: RecordModel[]
  accounts: RecordModel[]
  partner1Name: string
  partner2Name: string
}>()

defineEmits<{
  (e: 'edit', value: RecordModel): void
  (e: 'remove', id: string): void
}>()

function ownerLabel(ownerSlot: string) {
  if (ownerSlot === 'usuario_1') return props.partner1Name
  if (ownerSlot === 'usuario_2') return props.partner2Name
  return 'Casal'
}

function accountName(id: string) {
  return (props.accounts.find((item) => item.id === id)?.name as string) || 'Conta removida'
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(dateValue: string) {
  return new Date(dateValue).toLocaleDateString('pt-BR')
}
</script>
