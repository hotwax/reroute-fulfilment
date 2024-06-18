import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import Order from "@/views/Order.vue"

const routes: Array<RouteRecordRaw> = [
  {
    path: "/order/:token",
    name: "Order",
    component: Order,
    props: true
  },
  {
    path: '/:token',  // Added this route as when using redirect we can't define props as true and thus the redirect fails
    name: "Order",
    component: Order,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router