<template>
  <div class="mt-4 flex gap-2 overflow-x-auto pb-1">
    <button
      v-for="option in options"
      :key="option.value"
      class="inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition"
      :class="option.value === modelValue ? 'border-slate-400 bg-white text-slate-900 shadow-sm' : 'border-slate-200 bg-slate-100 text-slate-600'"
      @click="emit('update:modelValue', option.value)"
    >
      <component :is="option.icon" class="h-4 w-4" />
      <span>{{ option.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { UserGroupIcon, UserIcon } from '@heroicons/vue/24/outline'
import type { OwnerSlot } from '../stores/transactions'

const props = defineProps<{
  modelValue: OwnerSlot
  partner1Name: string
  partner2Name: string
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: OwnerSlot): void }>()

const options = computed(() => [
  { value: 'casal' as const, label: 'Casal', icon: UserGroupIcon },
  { value: 'usuario_1' as const, label: props.partner1Name, icon: UserIcon },
  { value: 'usuario_2' as const, label: props.partner2Name, icon: UserIcon },
])
</script>
