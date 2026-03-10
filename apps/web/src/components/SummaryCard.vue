<template>
  <article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <div class="mb-4 flex items-center gap-3">
      <div class="rounded-full p-3" :class="iconBgClass">
        <component :is="icon" class="h-6 w-6" :class="iconClass" />
      </div>
      <p class="text-2xl font-medium text-slate-500">{{ label }}</p>
    </div>

    <p class="text-5xl font-bold" :class="valueClass">{{ formattedValue }}</p>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  BuildingLibraryIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps<{
  label: string
  value: number
  type: 'conta' | 'cartao' | 'income' | 'expense'
}>()

const formattedValue = computed(() =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(props.value)
)

const valueClass = computed(() => {
  if (props.type === 'expense' || props.type === 'cartao') return 'text-red-600'
  return props.value < 0 ? 'text-red-600' : 'text-green-700'
})

const icon = computed(() => {
  if (props.type === 'conta') return BuildingLibraryIcon
  if (props.type === 'cartao') return CreditCardIcon
  if (props.type === 'income') return ArrowTrendingUpIcon
  return ArrowTrendingDownIcon
})

const iconBgClass = computed(() => {
  if (props.type === 'conta') return 'bg-blue-100'
  if (props.type === 'cartao') return 'bg-teal-100'
  if (props.type === 'income') return 'bg-green-100'
  return 'bg-rose-100'
})

const iconClass = computed(() => {
  if (props.type === 'conta') return 'text-blue-600'
  if (props.type === 'cartao') return 'text-teal-600'
  if (props.type === 'income') return 'text-green-600'
  return 'text-rose-600'
})
</script>
