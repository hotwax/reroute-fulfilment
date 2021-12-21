<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <h1>{{ $t("Your Order") }}</h1>
      <OrderItemCard v-if="orders" :order="orders" />
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonContent,
  IonPage  
} from "@ionic/vue";
import { defineComponent } from "vue";
import OrderItemCard from '@/components/OrderItemCard.vue';
import { mapGetters, useStore } from 'vuex'

export default defineComponent({
  components: {
   IonContent,
   IonPage,
   OrderItemCard
  },     
  computed: {
    ...mapGetters({
      orders: 'orders/getCurrent',
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
