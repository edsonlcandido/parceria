<template>
  <nav class="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/60 bg-white/95 backdrop-blur-md">
    <div class="mx-auto flex max-w-md items-center justify-around px-2 pb-3 pt-2">

      <RouterLink
        :to="tokenRoute('/dashboard')"
        class="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors"
        :class="isActive('/dashboard') ? 'text-slate-900' : 'text-slate-400'"
      >
        <svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
        </svg>
        <span class="text-[10px] font-semibold">Início</span>
      </RouterLink>

      <RouterLink
        :to="tokenRoute('/contas')"
        class="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors"
        :class="isActive('/contas') ? 'text-slate-900' : 'text-slate-400'"
      >
        <svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11" />
        </svg>
        <span class="text-[10px] font-semibold">Contas</span>
      </RouterLink>

      <RouterLink
        :to="tokenRoute('/configuracoes')"
        class="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors"
        :class="isActive('/configuracoes') ? 'text-slate-900' : 'text-slate-400'"
      >
        <svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <circle cx="12" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span class="text-[10px] font-semibold">Ajustes</span>
      </RouterLink>

    </div>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

function isActive(path: string) {
  return route.path === path
}

function tokenRoute(path: string) {
  const accessToken = typeof route.query.access_token === 'string' ? route.query.access_token : ''
  return accessToken ? { path, query: { access_token: accessToken } } : { path }
}
</script>
