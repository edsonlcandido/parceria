<template>
  <div class="flex flex-col gap-3">
    <div
      v-for="item in rows"
      :key="item.id"
      class="rounded-xl bg-white p-4 shadow-sm border border-slate-100"
    >
      <div class="flex items-center gap-3">
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

        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-slate-900 truncate">{{ item.description || (item.type === 'income' ? 'Receita' : 'Despesa') }}</p>
          <p class="text-xs text-slate-400 mt-0.5">{{ accountName(item.account_id) }} · {{ ownerLabel(item.user_id) }}</p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <div class="text-right">
            <p class="text-sm font-bold" :class="item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'">
              {{ item.type === 'income' ? '+' : '-' }}{{ formatCurrency(item.amount as number) }}
            </p>
            <p class="text-xs text-slate-400 mt-0.5">{{ formatDate(item.date as string) }}</p>
          </div>
          <button
            class="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 active:scale-95"
            @click="actionsItem = item"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div class="mt-3 flex items-center">
        <span
          v-if="item.consolidated"
          class="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700"
        >Consolidado</span>
        <span
          v-else
          class="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700"
        >Pendente</span>
      </div>
    </div>

    <div v-if="rows.length === 0" class="py-12 text-center text-slate-400">
      <p class="text-sm">Sem lançamentos no período.</p>
    </div>
  </div>

  <!-- Actions drawer -->
  <div v-if="actionsItem" class="fixed inset-0 z-50 bg-slate-900/40" @click.self="actionsItem = null">
    <div class="ml-auto h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-2xl">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h3 class="text-2xl font-bold text-slate-900">{{ actionsItem.description || (actionsItem.type === 'income' ? 'Receita' : 'Despesa') }}</h3>
          <p class="mt-0.5 text-sm text-slate-500">
            {{ formatCurrency(actionsItem.amount as number) }} · {{ formatDate(actionsItem.date as string) }}
          </p>
        </div>
        <button class="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold" @click="actionsItem = null">Fechar</button>
      </div>

      <div class="space-y-3">
        <button
          class="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-700 active:scale-[0.98] transition-transform"
          @click="$emit('edit', actionsItem!); actionsItem = null"
        >
          <svg class="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6.536-6.536a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 14H9v-3z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18" />
          </svg>
          Editar lançamento
        </button>

        <button
          class="flex w-full items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-4 text-sm font-semibold text-rose-600 active:scale-[0.98] transition-transform"
          @click="confirmRemove(actionsItem!)"
        >
          <svg class="h-5 w-5 text-rose-400" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Excluir lançamento
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { RecordModel } from 'pocketbase'

const props = defineProps<{
  rows: RecordModel[]
  accounts: RecordModel[]
  partner1Name: string
  partner2Name: string
  user1Id: string | null
  user2Id: string | null
}>()

const emit = defineEmits<{
  (e: 'edit', value: RecordModel): void
  (e: 'remove', id: string): void
}>()

const actionsItem = ref<RecordModel | null>(null)

function ownerLabel(userId: string | null) {
  if (!userId) return 'Casal'
  if (userId === props.user1Id) return props.partner1Name
  if (userId === props.user2Id) return props.partner2Name
  return 'Outro'
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

function confirmRemove(item: RecordModel) {
  if (!confirm('Excluir este lançamento?')) return
  emit('remove', item.id)
  actionsItem.value = null
}
</script>
