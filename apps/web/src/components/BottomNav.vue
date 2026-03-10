<template>
  <nav class="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
    <div class="mx-auto flex max-w-md items-center justify-around p-3">
      <RouterLink :to="tokenRoute('/dashboard')" class="inline-flex flex-col items-center gap-1 text-sm font-semibold text-slate-600" active-class="text-blue-700">
        <HomeIcon class="h-5 w-5" />
        <span>Dashboard</span>
      </RouterLink>

      <RouterLink :to="tokenRoute('/contas')" class="inline-flex flex-col items-center gap-1 text-sm font-semibold text-slate-600" active-class="text-blue-700">
        <BuildingLibraryIcon class="h-5 w-5" />
        <span>Contas</span>
      </RouterLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { BuildingLibraryIcon, HomeIcon } from '@heroicons/vue/24/outline'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

function tokenRoute(path: string) {
  const accessToken = typeof route.query.access_token === 'string' ? route.query.access_token : ''
  return accessToken ? { path, query: { access_token: accessToken } } : { path }
}
</script>
