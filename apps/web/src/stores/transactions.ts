import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { RecordModel } from 'pocketbase'
import pb from '../services/pocketbase'

export type OwnerSlot = 'casal' | 'usuario_1' | 'usuario_2'

export interface TransactionPayload {
  couple_id: string
  account_id: string
  owner_slot: OwnerSlot
  amount: number
  description?: string
  type: 'income' | 'expense'
  date: string
  consolidated: boolean
}

function isSameMonth(dateString: string, baseDate: Date): boolean {
  const date = new Date(dateString)
  return date.getMonth() === baseDate.getMonth() && date.getFullYear() === baseDate.getFullYear()
}

export const useTransactionsStore = defineStore('transactions', () => {
  const transactions = ref<RecordModel[]>([])
  const selectedMonth = ref(new Date())
  const selectedOwner = ref<OwnerSlot>('casal')

  const byOwner = computed(() => {
    if (selectedOwner.value === 'casal') return transactions.value
    return transactions.value.filter((tx) => tx.owner_slot === selectedOwner.value)
  })

  const monthTransactions = computed(() => {
    return byOwner.value.filter((tx) => isSameMonth(tx.date as string, selectedMonth.value))
  })

  async function fetchTransactions(coupleId: string) {
    if (!coupleId) {
      transactions.value = []
      return
    }

    const result = await pb.collection('transactions').getFullList({
      sort: '-date,-created',
      filter: `couple_id = \"${coupleId}\"`,
    })

    transactions.value = result
  }

  async function createTransaction(payload: TransactionPayload) {
    const created = await pb.collection('transactions').create(payload)
    transactions.value = [created, ...transactions.value]
    return created
  }

  async function updateTransaction(id: string, payload: Partial<TransactionPayload>) {
    const updated = await pb.collection('transactions').update(id, payload)
    const index = transactions.value.findIndex((tx) => tx.id === id)

    if (index >= 0) transactions.value[index] = updated

    return updated
  }

  async function deleteTransaction(id: string) {
    await pb.collection('transactions').delete(id)
    transactions.value = transactions.value.filter((tx) => tx.id !== id)
  }

  return {
    transactions,
    selectedMonth,
    selectedOwner,
    byOwner,
    monthTransactions,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  }
})
