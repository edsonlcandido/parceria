<template>
  <div class="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2.5">
    <button
      type="button"
      class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 active:scale-95 transition-transform"
      @click="move(-1)"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    <span class="flex-1 text-center text-sm font-semibold text-slate-900">{{ label }}</span>

    <button
      type="button"
      class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 active:scale-95 transition-transform"
      @click="move(1)"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d ?? 1)
}

function firstDayIso(date: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth(), 1)
  return d.toISOString().slice(0, 10)
}

const current = ref(props.modelValue ? parseIso(props.modelValue) : new Date())

watch(() => props.modelValue, (v) => {
  if (v) current.value = parseIso(v)
})

const label = computed(() => {
  const month = current.value.toLocaleDateString('pt-BR', { month: 'long' })
  const year = String(current.value.getFullYear()).slice(2)
  return `${month.charAt(0).toUpperCase() + month.slice(1)}/${year}`
})

function move(step: number) {
  const d = new Date(current.value.getFullYear(), current.value.getMonth() + step, 1)
  current.value = d
  emit('update:modelValue', firstDayIso(d))
}
</script>
