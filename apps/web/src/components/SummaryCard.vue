<template>
  <article class="group flex items-center justify-between rounded-2xl p-4 shadow-md transition-all duration-300 hover:shadow-lg active:scale-[0.98]" :class="cardGradient">
    <div class="flex items-center gap-4">
      <div class="rounded-lg p-2.5 bg-white/20">
        <component :is="icon" class="h-5 w-5 text-white" />
      </div>
      <div>
        <p class="text-xs font-medium uppercase tracking-wide text-white/70">{{ label }}</p>
        <p class="text-xl font-bold text-white">{{ formattedValue }}</p>
      </div>
    </div>
    <ChevronRightIcon class="h-5 w-5 text-white/50 transition-transform duration-200 group-hover:translate-x-1" />
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  BuildingLibraryIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChevronRightIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps<{
  label: string
  value: number
  type: 'conta' | 'cartao' | 'income' | 'expense'
}>()

const formattedValue = computed(() =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(props.value)
)

const cardGradient = computed(() => {
  if (props.type === 'conta') return 'bg-gradient-to-br from-blue-500 to-blue-700'
  if (props.type === 'cartao') return 'bg-gradient-to-br from-cyan-500 to-teal-600'
  if (props.type === 'income') return 'bg-gradient-to-br from-emerald-500 to-green-600'
  return 'bg-gradient-to-br from-rose-500 to-red-600'
})

const icon = computed(() => {
  if (props.type === 'conta') return BuildingLibraryIcon
  if (props.type === 'cartao') return CreditCardIcon
  if (props.type === 'income') return ArrowTrendingUpIcon
  return ArrowTrendingDownIcon
})
</script>
