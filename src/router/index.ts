import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import Order from "@/views/Order.vue"

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: "/order",
  },
  {
    path: "/order",
    name: "Order",
    component: Order
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router