import { createRouter, createWebHashHistory } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Users from '../views/Users.vue'
import Templates from '../views/Templates.vue'
import RiskRules from '../views/RiskRules.vue'
import Laws from '../views/Laws.vue'
import Analyses from '../views/Analyses.vue'

const routes = [
  { path: '/login', component: Login, meta: { title: '登录' } },
  {
    path: '/',
    component: AdminLayout,
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', component: Dashboard, meta: { title: '数据看板' } },
      { path: 'users', component: Users, meta: { title: '用户管理' } },
      { path: 'templates', component: Templates, meta: { title: '合同模板' } },
      { path: 'risk-rules', component: RiskRules, meta: { title: '风险规则' } },
      { path: 'laws', component: Laws, meta: { title: '法条库' } },
      { path: 'analyses', component: Analyses, meta: { title: '分析与反馈' } },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to) => {
  const token = localStorage.getItem('cr_admin_token')
  if (to.path !== '/login' && !token) {
    return '/login'
  }
  if (to.path === '/login' && token) {
    return '/dashboard'
  }
  return true
})

export default router