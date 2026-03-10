<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200/50 bg-white shadow-lg">
    <div class="overflow-x-auto">
      <table class="min-w-full text-left text-sm">
        <thead class="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <tr>
            <th class="px-6 py-4 font-semibold text-slate-700">Parceiro</th>
            <th class="px-6 py-4 font-semibold text-slate-700">Tipo</th>
            <th class="px-6 py-4 font-semibold text-slate-700">Conta</th>
            <th class="px-6 py-4 font-semibold text-slate-700">Descrição</th>
            <th class="px-6 py-4 font-semibold text-slate-700">Valor</th>
            <th class="px-6 py-4 font-semibold text-slate-700">Data</th>
            <th class="px-6 py-4 font-semibold text-slate-700">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr v-for="item in rows" :key="item.id" class="transition-colors duration-200 hover:bg-slate-50">
            <td class="px-6 py-4">
              <span class="inline-flex rounded-lg px-3 py-1 text-xs font-semibold text-white" :class="ownerClass(item.owner_slot)">
                {{ ownerLabel(item.owner_slot) }}
              </span>
            </td>
            <td class="px-6 py-4 font-medium text-slate-900">
              <span class="inline-flex items-center gap-1">
                <span class="inline-block h-2 w-2 rounded-full" :class="item.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                {{ item.type === 'income' ? 'Receita' : 'Despesa' }}
              </span>
            </td>
            <td class="px-6 py-4 text-slate-700">{{ accountName(item.account_id) }}</td>
            <td class="px-6 py-4 text-slate-600">{{ item.description || '-' }}</td>
            <td class="px-6 py-4 font-semibold" :class="item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'">
              {{ formatCurrency(item.amount as number) }}
            </td>
            <td class="px-6 py-4 text-slate-600 text-xs">{{ formatDate(item.date as string) }}</td>
            <td class="px-6 py-4">
              <div class="flex gap-2">
                <button 
                  class="rounded-lg border border-primary-300 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 transition-all duration-200 hover:bg-primary-100 active:scale-95"
                  @click="$emit('edit', item)"
                >
                  Editar
                </button>
                <button 
                  class="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-all duration-200 hover:bg-rose-100 active:scale-95"
                  @click="$emit('remove', item.id)"
                >
                  Excluir
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="rows.length === 0">
            <td colspan="7" class="px-6 py-12 text-center text-slate-500">
              <div class="flex flex-col items-center gap-2">
                <span class="text-sm">Sem lançamentos no período.</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RecordModel } from 'pocketbase'

const props = defineProps<{
  rows: RecordModel[]
  accounts: RecordModel[]
  partner1Name: string
  partner2Name: string
}>()

defineEmits<{
  (e: 'edit', value: RecordModel): void
  (e: 'remove', id: string): void
}>()

function ownerLabel(ownerSlot: string) {
  if (ownerSlot === 'usuario_1') return props.partner1Name
  if (ownerSlot === 'usuario_2') return props.partner2Name
  return 'Casal'
}

function ownerClass(ownerSlot: string) {
  if (ownerSlot === 'usuario_1') return 'bg-gradient-to-r from-blue-600 to-blue-700'
  if (ownerSlot === 'usuario_2') return 'bg-gradient-to-r from-cyan-600 to-teal-600'
  return 'bg-gradient-to-r from-slate-600 to-slate-700'
}

function accountName(id: string) {
  return (props.accounts.find((item) => item.id === id)?.name as string) || 'Conta removida'
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(dateValue: string) {
  return new Date(dateValue).toLocaleDateString('pt-BR')
}
</script>
