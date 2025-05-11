import { createRouter, createWebHistory } from 'vue-router'

// 路由配置 ，这里使用了路由懒加载
// 路由懒加载 就是把组件分割成小一些的代码块，然后当路由被访问的时候才加载对应组件
const routes = [
  {
    path: '/',
    name: 'Overview',
    component: () => import('../views/overview/index.vue')
  },
  {
    path: '/detail/:buildingId',
    name: 'Detail',
    component: () => import('../views/detail/index.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router