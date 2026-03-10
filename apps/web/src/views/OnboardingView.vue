<template>
  <div class="flex min-h-screen items-center justify-center bg-[#e9edf4] px-4">
    <section class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      <h1 class="text-3xl font-bold text-slate-900">Parceria Finance</h1>
      <p class="mt-2 text-slate-600">Crie seu espaço financeiro compartilhado e receba um link seguro de acesso.</p>

      <button
        class="mt-6 w-full rounded-2xl bg-blue-600 px-4 py-3 text-lg font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        :disabled="loading"
        @click="createCouple"
      >
        {{ loading ? 'Criando...' : 'Criar minha parceria' }}
      </button>

      <p v-if="error" class="mt-4 rounded-xl bg-red-100 px-3 py-2 text-sm font-semibold text-red-700">{{ error }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCoupleStore } from '../stores/couple'

const router = useRouter()
const coupleStore = useCoupleStore()

const loading = ref(false)
const error = ref('')

async function createCouple() {
  loading.value = true
  error.value = ''

  try {
    const token = await coupleStore.initCouple()
    await router.push({ path: '/dashboard', query: { access_token: token } })
  } catch (e: any) {
    error.value = e?.message || 'Não foi possível criar a parceria.'
  } finally {
    loading.value = false
  }
}
</script>
