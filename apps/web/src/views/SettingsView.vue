<template>
  <div class="min-h-screen bg-[#e9edf4] pb-24">
    <main class="mx-auto max-w-2xl px-4 py-6">

      <!-- Header -->
      <div class="mb-6 flex items-center gap-3">
        <button
          class="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm active:scale-95"
          @click="router.back()"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-2xl font-bold text-slate-900">Configurações</h1>
      </div>

      <!-- Parceiros -->
      <section class="mb-4 rounded-3xl bg-white p-5 shadow-sm">
        <h2 class="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Parceiros</h2>

        <div class="space-y-3">
          <!-- Usuário 1 -->
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-100">
              <svg class="h-5 w-5 text-sky-600" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>

            <div class="flex-1">
              <template v-if="editing1">
                <input
                  ref="input1Ref"
                  v-model="name1Draft"
                  class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                  @keydown.enter="saveName1"
                  @keydown.escape="editing1 = false"
                />
              </template>
              <template v-else>
                <p class="font-semibold text-slate-900">{{ coupleStore.partner1Name }}</p>
                <p class="text-xs text-slate-400">Parceiro(a) 1</p>
              </template>
            </div>

            <div class="flex gap-1">
              <template v-if="editing1">
                <button
                  class="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white active:scale-95"
                  @click="saveName1"
                >Salvar</button>
                <button
                  class="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 active:scale-95"
                  @click="editing1 = false"
                >Cancelar</button>
              </template>
              <button
                v-else
                class="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 active:scale-95"
                @click="startEdit1"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                </svg>
              </button>
            </div>
          </div>

          <div class="border-t border-slate-100" />

          <!-- Usuário 2 -->
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-100">
              <svg class="h-5 w-5 text-violet-600" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>

            <div class="flex-1">
              <template v-if="editing2">
                <input
                  ref="input2Ref"
                  v-model="name2Draft"
                  class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                  @keydown.enter="saveName2"
                  @keydown.escape="editing2 = false"
                />
              </template>
              <template v-else>
                <p class="font-semibold text-slate-900">{{ coupleStore.partner2Name }}</p>
                <p class="text-xs text-slate-400">Parceiro(a) 2</p>
              </template>
            </div>

            <div class="flex gap-1">
              <template v-if="editing2">
                <button
                  class="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white active:scale-95"
                  @click="saveName2"
                >Salvar</button>
                <button
                  class="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 active:scale-95"
                  @click="editing2 = false"
                >Cancelar</button>
              </template>
              <button
                v-else
                class="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 active:scale-95"
                @click="startEdit2"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Link de acesso -->
      <section class="rounded-3xl bg-white p-5 shadow-sm">
        <h2 class="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">Link de acesso</h2>
        <p class="mb-4 text-xs text-slate-500">Compartilhe este link com seu parceiro(a) para acessar o espaço compartilhado.</p>

        <div class="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p class="flex-1 truncate text-xs font-mono text-slate-600">{{ shareUrl }}</p>
          <button
            class="shrink-0 rounded-xl px-3 py-2 text-xs font-semibold transition-colors active:scale-95"
            :class="copied ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-900 text-white'"
            @click="copyUrl"
          >
            {{ copied ? 'Copiado!' : 'Copiar' }}
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCoupleStore } from '../stores/couple'

const router = useRouter()
const coupleStore = useCoupleStore()

const editing1 = ref(false)
const editing2 = ref(false)
const name1Draft = ref('')
const name2Draft = ref('')
const input1Ref = ref<HTMLInputElement | null>(null)
const input2Ref = ref<HTMLInputElement | null>(null)
const copied = ref(false)

const shareUrl = computed(() => {
  const base = window.location.origin + '/app/'
  return `${base}?access_token=${coupleStore.accessToken}`
})

function startEdit1() {
  name1Draft.value = coupleStore.partner1Name
  editing1.value = true
  nextTick(() => input1Ref.value?.focus())
}

function startEdit2() {
  name2Draft.value = coupleStore.partner2Name
  editing2.value = true
  nextTick(() => input2Ref.value?.focus())
}

async function saveName1() {
  if (!name1Draft.value.trim() || !coupleStore.user1Id) return
  await coupleStore.updateUserName(coupleStore.user1Id, name1Draft.value.trim())
  editing1.value = false
}

async function saveName2() {
  if (!name2Draft.value.trim() || !coupleStore.user2Id) return
  await coupleStore.updateUserName(coupleStore.user2Id, name2Draft.value.trim())
  editing2.value = false
}

async function copyUrl() {
  await navigator.clipboard.writeText(shareUrl.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}
</script>
