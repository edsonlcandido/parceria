import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { RecordModel } from 'pocketbase'
import pb from '../services/pocketbase'

export interface RecurringTransactionPayload {
  couple_id: string
  user_id: string | null
  description: string
  amount: number
  type: 'income' | 'expense'
  day: number
}

export const useRecurringTransactionsStore = defineStore('recurringTransactions', () => {
  const items = ref<RecordModel[]>([])

  const sortedByDay = computed(() => {
    return [...items.value].sort((a, b) => (a.day as number) - (b.day as number))
  })

  async function fetchAll(coupleId: string) {
    if (!coupleId) {
      items.value = []
      return
    }
    items.value = await pb.collection('recurring_transactions').getFullList({
      sort: 'day',
      filter: `couple_id = "${coupleId}"`,
    })
  }

  async function create(payload: RecurringTransactionPayload) {
    const created = await pb.collection('recurring_transactions').create(payload)
    items.value.push(created)
    return created
  }

  async function update(id: string, payload: Partial<RecurringTransactionPayload>) {
    const updated = await pb.collection('recurring_transactions').update(id, payload)
    const index = items.value.findIndex((item) => item.id === id)
    if (index >= 0) items.value[index] = updated
    return updated
  }

  async function remove(id: string) {
    await pb.collection('recurring_transactions').delete(id)
    items.value = items.value.filter((item) => item.id !== id)
  }

  return {
    items,
    sortedByDay,
    fetchAll,
    create,
    update,
    remove,
  }
})
