import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import pb from '../services/pocketbase'

export type OwnerSlot = 'casal' | 'usuario_1' | 'usuario_2'

const ACCESS_TOKEN_KEY = 'parceria_access_token'

function safeFilterValue(value: string): string {
  return value.split('"').join('\\"')
}

function generateToken(length = 32): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, (n) => chars[n % chars.length]).join('')
}

export const useCoupleStore = defineStore('couple', () => {
  const id = ref<string | null>(null)
  const name = ref('Nossa Parceria')
  const accessToken = ref<string>('')
  const partner1Name = ref('Usuário 1')
  const partner2Name = ref('Usuário 2')

  const isReady = computed(() => !!id.value && !!accessToken.value)

  async function loadByToken(token: string): Promise<boolean> {
    if (!token) return false

    try {
      const record = await pb
        .collection('couples')
        .getFirstListItem(`access_token = \"${safeFilterValue(token)}\"`)

      id.value = record.id
      name.value = (record.name as string) || 'Nossa Parceria'
      accessToken.value = token
      partner1Name.value = (record.partner1_name as string) || 'Usuário 1'
      partner2Name.value = (record.partner2_name as string) || 'Usuário 2'
      localStorage.setItem(ACCESS_TOKEN_KEY, token)
      return true
    } catch {
      return false
    }
  }

  async function initCouple(): Promise<string> {
    const token = generateToken(32)
    const created = await pb.collection('couples').create({
      name: 'Nossa Parceria',
      access_token: token,
      partner1_name: 'Usuário 1',
      partner2_name: 'Usuário 2',
    })

    id.value = created.id
    name.value = (created.name as string) || 'Nossa Parceria'
    accessToken.value = token
    partner1Name.value = (created.partner1_name as string) || 'Usuário 1'
    partner2Name.value = (created.partner2_name as string) || 'Usuário 2'
    localStorage.setItem(ACCESS_TOKEN_KEY, token)

    return token
  }

  function getStoredToken(): string {
    return localStorage.getItem(ACCESS_TOKEN_KEY) || ''
  }

  function clear() {
    id.value = null
    name.value = 'Nossa Parceria'
    accessToken.value = ''
    partner1Name.value = 'Usuário 1'
    partner2Name.value = 'Usuário 2'
    localStorage.removeItem(ACCESS_TOKEN_KEY)
  }

  return {
    id,
    name,
    accessToken,
    partner1Name,
    partner2Name,
    isReady,
    loadByToken,
    initCouple,
    getStoredToken,
    clear,
  }
})
