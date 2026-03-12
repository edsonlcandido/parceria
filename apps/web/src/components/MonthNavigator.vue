<template>
  <div class="rounded-2xl bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 px-6 py-5 shadow-lg">
    <div class="flex items-center justify-between">
      <button
        class="rounded-lg p-2 text-white/80 transition-all duration-200 hover:bg-white/20 active:scale-95"
        @click="moveMonth(-1)"
        aria-label="Mês anterior"
      >
        <ChevronLeftIcon class="h-6 w-6" />
      </button>

      <div class="flex items-center gap-3 text-white">
        <CalendarDaysIcon class="h-5 w-5" />
        <strong class="text-lg font-semibold">{{ monthLabel }}</strong>
      </div>

      <button
        class="rounded-lg p-2 text-white/80 transition-all duration-200 hover:bg-white/20 active:scale-95"
        @click="moveMonth(1)"
        aria-label="Próximo mês"
      >
        <ChevronRightIcon class="h-6 w-6" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{ modelValue: Date }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: Date): void }>()

const monthLabel = computed(() => {
  const month = props.modelValue.toLocaleDateString('pt-BR', { month: 'long' })
  const year = String(props.modelValue.getFullYear()).slice(2)
  return `${month.charAt(0).toUpperCase() + month.slice(1)}/${year}`
})

function moveMonth(step: number) {
  const value = new Date(props.modelValue)
  value.setMonth(value.getMonth() + step)
  emit('update:modelValue', value)
}
</script>
