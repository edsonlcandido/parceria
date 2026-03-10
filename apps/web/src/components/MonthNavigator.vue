<template>
  <div class="rounded-3xl bg-gradient-to-r from-teal-400 to-cyan-300 px-4 py-4 shadow-md">
    <div class="flex items-center justify-between">
      <button
        class="rounded-full p-2 text-slate-800 hover:bg-white/30"
        @click="moveMonth(-1)"
        aria-label="Mês anterior"
      >
        <ChevronLeftIcon class="h-5 w-5" />
      </button>

      <div class="flex items-center gap-2 text-slate-900">
        <CalendarDaysIcon class="h-5 w-5" />
        <strong class="text-xl">{{ monthLabel }}</strong>
      </div>

      <button
        class="rounded-full p-2 text-slate-800 hover:bg-white/30"
        @click="moveMonth(1)"
        aria-label="Próximo mês"
      >
        <ChevronRightIcon class="h-5 w-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{ modelValue: Date }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: Date): void }>()

const monthLabel = computed(() =>
  props.modelValue.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).replace(/^./, (letter) => letter.toUpperCase())
)

function moveMonth(step: number) {
  const value = new Date(props.modelValue)
  value.setMonth(value.getMonth() + step)
  emit('update:modelValue', value)
}
</script>
