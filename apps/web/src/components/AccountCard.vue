<template>
  <article class="rounded-3xl bg-white p-5 shadow-sm">
    <div class="flex items-start justify-between gap-3">
      <!-- Ícone + info -->
      <div class="flex items-start gap-3">
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
          :class="account.type === 'conta' ? 'bg-sky-100' : 'bg-violet-100'"
        >
          <!-- Conta corrente: banco -->
          <svg v-if="account.type === 'conta'" class="h-5 w-5 text-sky-600" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11" />
          </svg>
          <!-- Cartão: cartão de crédito -->
          <svg v-else class="h-5 w-5 text-violet-600" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path stroke-linecap="round" d="M2 10h20" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 15h4" />
          </svg>
        </div>

        <div>
          <p class="font-bold text-slate-900 leading-tight">{{ account.name }}</p>
          <p class="mt-0.5 text-xs text-slate-500">{{ ownerLabel }}</p>
          <span
            class="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
            :class="account.type === 'conta' ? 'bg-sky-50 text-sky-600' : 'bg-violet-50 text-violet-600'"
          >
            {{ account.type === 'conta' ? 'Conta corrente' : 'Cartão' }}
          </span>
        </div>
      </div>

      <!-- Saldo -->
      <div class="text-right">
        <p class="text-xs text-slate-400">Saldo</p>
        <p
          class="text-lg font-bold leading-tight"
          :class="balanceColor"
        >
          {{ formattedBalance }}
        </p>
      </div>
    </div>

    <!-- Ações -->
    <div class="mt-4 flex gap-2 border-t border-slate-100 pt-4">
      <button
        class="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2 text-sm font-semibold text-slate-700 active:scale-95"
        @click="$emit('edit')"
      >
        Editar
      </button>
      <button
        class="flex-1 rounded-xl border border-rose-100 bg-rose-50 py-2 text-sm font-semibold text-rose-600 active:scale-95"
        @click="$emit('delete')"
      >
        Excluir
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RecordModel } from 'pocketbase'

const props = defineProps<{
  account: RecordModel
  balance: number
  ownerLabel: string
}>()

defineEmits<{
  (e: 'edit'): void
  (e: 'delete'): void
}>()

const formattedBalance = computed(() => {
  const abs = Math.abs(props.balance)
  const formatted = abs.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  return props.balance < 0 ? `- ${formatted}` : formatted
})

const balanceColor = computed(() => {
  if (props.account.type === 'cartao') {
    return props.balance >= 0 ? 'text-slate-900' : 'text-rose-600'
  }
  return props.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'
})
</script>
