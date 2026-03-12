import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { RecordModel } from 'pocketbase'
import pb from '../services/pocketbase'

export interface TransactionPayload {
  couple_id: string
  account_id: string
  user_id: string | null
  amount: number
  description?: string
  type: 'income' | 'expense'
  date: string
  consolidated: boolean
  monthly_budget?: string | null
}

function isSameMonth(dateString: string, baseDate: Date): boolean {
  const date = new Date(dateString)
  return date.getMonth() === baseDate.getMonth() && date.getFullYear() === baseDate.getFullYear()
}

export const useTransactionsStore = defineStore('transactions', () => {
  const transactions = ref<RecordModel[]>([])
  const selectedMonth = ref(new Date())
  const selectedOwner = ref<string | null>(null)

  const byOwner = computed(() => {
    if (selectedOwner.value === null) return transactions.value
    return transactions.value.filter((tx) => tx.user_id === selectedOwner.value)
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
      sort: '-date',
      filter: `couple_id = \"${coupleId}\"`,
    })

    transactions.value = result
  }

  function sortByDate(list: typeof transactions.value) {
    return [...list].sort((a, b) => {
      return new Date(b.date as string).getTime() - new Date(a.date as string).getTime()
    })
  }

  async function createTransaction(payload: TransactionPayload) {
    const created = await pb.collection('transactions').create(payload)
    transactions.value = sortByDate([created, ...transactions.value])
    return created
  }

  async function updateTransaction(id: string, payload: Partial<TransactionPayload>) {
    const updated = await pb.collection('transactions').update(id, payload)
    const index = transactions.value.findIndex((tx) => tx.id === id)
    if (index >= 0) transactions.value[index] = updated
    transactions.value = sortByDate(transactions.value)
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
