import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RecordModel } from 'pocketbase'
import pb from '../services/pocketbase'

export type AccountType = 'conta' | 'cartao'

export interface AccountPayload {
  couple_id: string
  user_id: string | null
  name: string
  type: AccountType
  initialBalance?: number
}

export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref<RecordModel[]>([])

  async function fetchAccounts(coupleId: string) {
    if (!coupleId) {
      accounts.value = []
      return
    }

    const result = await pb.collection('accounts').getFullList({
      sort: '-created',
      filter: `couple_id = \"${coupleId}\"`,
    })

    accounts.value = result
  }

  async function createAccount(payload: AccountPayload) {
    const { initialBalance = 0, ...accountData } = payload

    const created = await pb.collection('accounts').create(accountData)

    if (initialBalance !== 0) {
      const positive = Math.abs(initialBalance)
      const transactionType =
        created.type === 'cartao'
          ? initialBalance > 0
            ? 'expense'
            : 'income'
          : initialBalance > 0
            ? 'income'
            : 'expense'

      await pb.collection('transactions').create({
        couple_id: created.couple_id,
        account_id: created.id,
        user_id: created.user_id || null,
        amount: positive,
        description: 'Saldo inicial',
        type: transactionType,
        date: new Date().toISOString(),
        consolidated: true,
      })
    }

    accounts.value = [created, ...accounts.value]
    return created
  }

  async function updateAccount(id: string, payload: Partial<AccountPayload>) {
    const updated = await pb.collection('accounts').update(id, payload)
    const index = accounts.value.findIndex((account) => account.id === id)

    if (index >= 0) accounts.value[index] = updated

    return updated
  }

  async function deleteAccount(id: string) {
    await pb.collection('accounts').delete(id)
    accounts.value = accounts.value.filter((account) => account.id !== id)
  }

  return {
    accounts,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
  }
})
