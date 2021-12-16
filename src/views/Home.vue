<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <h1>{{ $t("Your Order") }}</h1>
      <OrderItemCard v-for="orders in orders" :key="orders.orderId" :orders="orders" />
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonContent,
  IonPage } from "@ionic/vue";
import { defineComponent } from "vue";
import OrderItemCard from '@/components/OrderItemCard.vue'
import { mapGetters, useStore } from 'vuex'

export default defineComponent({
  components: {
   IonContent,
   IonPage,
   OrderItemCard
  },     
  computed: {
    ...mapGetters({
      orders: 'orders/getOrders',
      products: 'product/getProducts',
      isScrollable: 'product/isScrollable',
    })
  },
  data (){
    return {
      queryString: ''
    }
  },
  props: ['id'],
  async mounted () {
    this.getOrders(process.env.VUE_APP_VIEW_SIZE,0);
  },
  methods: {
    async loadMoreProducts (event: any) {
      this.getOrders(
        undefined,
        Math.ceil(this.products.length / process.env.VUE_APP_VIEW_SIZE).toString()
      ).then(() => {
        event.target.complete();
      })
    },
    async getOrders(vSize: any, vIndex: any) {
      const viewSize = vSize ? vSize : process.env.VUE_APP_VIEW_SIZE;
      const viewIndex = vIndex ? vIndex : 0;
      const payload = {
        viewSize,
        viewIndex,
      }
        await this.store.dispatch("orders/getOrders", payload);
  },
  },
  setup() {
    const store = useStore();
    return {
      store
    }
  },
});
</script>

<style scoped>
  h1 {
    text-align: center;
  }
</style>
