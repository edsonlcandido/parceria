<template>
  <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
    <div class="overflow-x-auto">
      <table class="min-w-[860px] w-full text-left text-base">
        <thead class="bg-slate-100 text-slate-800">
          <tr>
            <th class="px-5 py-4">Parceiro</th>
            <th class="px-5 py-4">Tipo</th>
            <th class="px-5 py-4">Conta</th>
            <th class="px-5 py-4">Descrição</th>
            <th class="px-5 py-4">Valor</th>
            <th class="px-5 py-4">Data</th>
            <th class="px-5 py-4">Consolidado</th>
            <th class="px-5 py-4">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in rows" :key="item.id" class="border-t border-slate-200">
            <td class="px-5 py-4">
              <span class="rounded-full px-3 py-1 text-sm font-semibold text-white" :class="ownerClass(item.owner_slot)">
                {{ ownerLabel(item.owner_slot) }}
              </span>
            </td>
            <td class="px-5 py-4">{{ item.type === 'income' ? 'Receita' : 'Despesa' }}</td>
            <td class="px-5 py-4">{{ accountName(item.account_id) }}</td>
            <td class="px-5 py-4">{{ item.description || '-' }}</td>
            <td class="px-5 py-4 font-semibold" :class="item.type === 'income' ? 'text-green-700' : 'text-red-600'">
              {{ formatCurrency(item.amount as number) }}
            </td>
            <td class="px-5 py-4">{{ formatDate(item.date as string) }}</td>
            <td class="px-5 py-4">{{ item.consolidated ? 'Sim' : 'Não' }}</td>
            <td class="px-5 py-4">
              <div class="flex gap-2">
                <button class="rounded-lg bg-slate-100 px-3 py-1 text-sm font-semibold" @click="$emit('edit', item)">Editar</button>
                <button class="rounded-lg bg-red-100 px-3 py-1 text-sm font-semibold text-red-700" @click="$emit('remove', item.id)">Excluir</button>
              </div>
            </td>
          </tr>
          <tr v-if="rows.length === 0">
            <td colspan="8" class="px-5 py-8 text-center text-slate-500">Sem lançamentos no período.</td>
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
  if (ownerSlot === 'usuario_1') return 'bg-blue-600'
  if (ownerSlot === 'usuario_2') return 'bg-teal-500'
  return 'bg-slate-600'
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
