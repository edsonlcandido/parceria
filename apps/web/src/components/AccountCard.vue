<template>
  <article
    class="flex cursor-pointer items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-sm active:scale-[0.98] transition-transform"
    @click="$emit('select')"
  >
    <!-- Ícone -->
    <div
      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
      :class="account.type === 'conta' ? 'bg-sky-100' : 'bg-violet-100'"
    >
      <svg v-if="account.type === 'conta'" class="h-5 w-5 text-sky-600" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11" />
      </svg>
      <svg v-else class="h-5 w-5 text-violet-600" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path stroke-linecap="round" d="M2 10h20" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 15h4" />
      </svg>
    </div>

    <!-- Info -->
    <div class="min-w-0 flex-1">
      <p class="truncate font-semibold text-slate-900 leading-tight">{{ account.name }}</p>
      <p class="mt-0.5 text-xs text-slate-500">{{ ownerLabel }}</p>
    </div>

    <!-- Saldo + chevron -->
    <div class="flex items-center gap-2">
      <p class="text-sm font-bold" :class="balanceColor">{{ formattedBalance }}</p>
      <svg class="h-4 w-4 text-slate-300" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
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
  (e: 'select'): void
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
