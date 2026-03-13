import { createRouter, createWebHistory } from 'vue-router'
import { useCoupleStore } from '../stores/couple'
import OnboardingView from '../views/OnboardingView.vue'
import DashboardView from '../views/DashboardView.vue'
import AccountsView from '../views/AccountsView.vue'
import CardView from '../views/CardView.vue'
import SettingsView from '../views/SettingsView.vue'

const router = createRouter({
  history: createWebHistory('/app/'),
  routes: [
    {
      path: '/',
      name: 'onboarding',
      component: OnboardingView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresToken: true },
    },
    {
      path: '/contas',
      name: 'accounts',
      component: AccountsView,
      meta: { requiresToken: true },
    },
    {
      path: '/cartao',
      name: 'cards',
      component: CardView,
      meta: { requiresToken: true },
    },
    {
      path: '/configuracoes',
      name: 'settings',
      component: SettingsView,
      meta: { requiresToken: true },
    },
  ],
})

function withToken(path: string, token: string) {
  return { path, query: { access_token: token } }
}

router.beforeEach(async (to, _from, next) => {
  const coupleStore = useCoupleStore()
  const queryToken = typeof to.query.access_token === 'string' ? to.query.access_token : ''
  const storedToken = coupleStore.getStoredToken()
  const token = queryToken || storedToken

  if (!token && to.meta.requiresToken) {
    coupleStore.clear()
    next({ path: '/' })
    return
  }

  if (token && queryToken !== token) {
    next(withToken(to.path, token))
    return
  }

  if (!token) {
    next()
    return
  }

  if (!coupleStore.isReady || coupleStore.accessToken !== token) {
    const ok = await coupleStore.loadByToken(token)

    if (!ok) {
      coupleStore.clear()
      next({ path: '/' })
      return
    }
  }

  if (to.path === '/') {
    next(withToken('/dashboard', token))
    return
  }

  next()
})

export default router
