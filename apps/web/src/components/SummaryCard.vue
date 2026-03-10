<template>
  <article class="group relative overflow-hidden rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-2xl" :class="cardGradient">
    <div class="absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-10" :class="iconBgClass"></div>
    
    <div class="relative z-10">
      <div class="mb-4 flex items-center gap-3">
        <div class="rounded-lg p-3 transition-transform duration-300 group-hover:scale-110" :class="iconBgClass">
          <component :is="icon" class="h-6 w-6" :class="iconClass" />
        </div>
        <p class="text-sm font-medium uppercase tracking-wide text-white/80">{{ label }}</p>
      </div>

      <p class="text-3xl font-bold text-white">{{ formattedValue }}</p>
    </div>
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

const iconBgClass = computed(() => {
  if (props.type === 'conta') return 'bg-white/20'
  if (props.type === 'cartao') return 'bg-white/20'
  if (props.type === 'income') return 'bg-white/20'
  return 'bg-white/20'
})

const iconClass = computed(() => 'text-white')
</script>
