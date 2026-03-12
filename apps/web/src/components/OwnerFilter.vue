<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="option in options"
      :key="option.value ?? 'casal'"
      class="inline-flex items-center gap-2 rounded-lg border-2 px-5 py-2.5 text-sm font-semibold transition-all duration-200"
      :class="option.value === modelValue 
        ? 'border-slate-900 bg-slate-900 text-white shadow-md' 
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

const props = defineProps<{
  modelValue: string | null
  partner1Name: string
  partner2Name: string
  user1Id: string | null
  user2Id: string | null
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: string | null): void }>()

const options = computed(() => [
  { value: null as string | null, label: 'Casal', icon: UserGroupIcon },
  { value: props.user1Id, label: props.partner1Name, icon: UserIcon },
  { value: props.user2Id, label: props.partner2Name, icon: UserIcon },
])
</script>
