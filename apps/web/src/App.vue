<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-primary-50/30">
    <RouterView />
    <BottomNav v-if="showNav" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import BottomNav from './components/BottomNav.vue'

const route = useRoute()

const showNav = computed(() => route.path !== '/')
</script>
