<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="option in options"
      :key="option.value"
      class="inline-flex items-center gap-2 rounded-lg border-2 px-5 py-2.5 text-sm font-semibold transition-all duration-200"
      :class="option.value === modelValue 
        ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-md' 
        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'"
      @click="emit('update:modelValue', option.value)"
    >
      <component :is="option.icon" class="h-5 w-5" />
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
