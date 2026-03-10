<template>
  <nav class="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/50 bg-white/95 backdrop-blur-md md:hidden">
    <div class="mx-auto flex max-w-md items-center justify-around px-4 py-4">
      <RouterLink 
        :to="tokenRoute('/dashboard')" 
        class="group inline-flex flex-col items-center gap-2 text-xs font-semibold text-slate-600 transition-all duration-300 hover:text-primary-600" 
        active-class="text-primary-600"
      >
        <div class="rounded-lg bg-slate-100 p-2 transition-all duration-300 group-hover:bg-primary-100 group-active:bg-primary-200">
          <HomeIcon class="h-5 w-5" />
        </div>
        <span>Dashboard</span>
      </RouterLink>

      <RouterLink 
        :to="tokenRoute('/contas')" 
        class="group inline-flex flex-col items-center gap-2 text-xs font-semibold text-slate-600 transition-all duration-300 hover:text-primary-600" 
        active-class="text-primary-600"
      >
        <div class="rounded-lg bg-slate-100 p-2 transition-all duration-300 group-hover:bg-primary-100 group-active:bg-primary-200">
          <BuildingLibraryIcon class="h-5 w-5" />
        </div>
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
