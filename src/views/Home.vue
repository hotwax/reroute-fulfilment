<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <h1>{{ $t("Your Order") }}</h1>
      <ion-card  v-if="products.length > 0">
        <ion-item lines="none">
          <ion-searchbar @ionFocus="selectSearchBarText($event)" v-model="queryString" :placeholder="$t('Search')" v-on:keyup.enter="getProducts()"/>
          <ion-list v-if="products.length > 0">
          <ion-label>
            <h2>Customer Name</h2>
            <p>Order ID</p>
          </ion-label>
          <ion-note slot="end">order date</ion-note>  
           </ion-list>      
        </ion-item>
        <ion-item lines="full">
          <order-list-item v-for="product in products" :key="product.productId" :product="product"/>
          <ion-infinite-scroll @ionInfinite="loadMoreProducts($event)" threshold="100px" :disabled="!isScrollable">
          <ion-infinite-scroll-content loading-spinner="crescent" :loading-text="$t('Loading')"></ion-infinite-scroll-content>
        </ion-infinite-scroll>
          <ion-thumbnail slot="start">
            <Image src="https://gravatar.com/avatar/dba6bae8c566f9d4041fb9cd9ada7741?d=identicon&f=y" />
          </ion-thumbnail>
          <ion-label slot="start">
            <p>BRAND</p>
            <h2>Virtual Name</h2>
            <p>{{ $t("Color") }}: color</p>
            <p>{{ $t("Size") }}: size</p>
          </ion-label>
          <ion-badge slot="end">status</ion-badge>
        </ion-item>
        <ion-item>
          <ion-label>{{ $t("Store pickup") }}</ion-label>
          <ion-button @click="changePickupPreference"  color="medium" fill="outline">Change</ion-button>
        </ion-item>
        <ion-item lines="full">
          <ion-label>{{ $t("Ship to") }}</ion-label>  
          <ion-button  color="medium" fill="outline" @click="updateShipmentAddress">Edit</ion-button>
        </ion-item>
        <ion-item lines="none">
          <ion-label color="danger">{{ $t("Cancel Item") }}</ion-label>  
        </ion-item>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonBadge,
  IonButton,
  IonCard,
  IonContent,
  IonItem,
  IonLabel,
  IonNote,
  IonPage,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonList,
  IonThumbnail,
  popoverController,
  modalController  
} from "@ionic/vue";
import { defineComponent } from "vue";
import PickupPreferencePopover from "./PickupPreferencePopover.vue";
import Image from "@/components/Image.vue";
import ShipmentAddressModal from "./ShipmentAddressModal.vue";
import { mapGetters, useStore } from 'vuex'
// import { showToast } from '@/utils'
// import { translate } from '@/i18n'
import OrderListItem from '@/components/OrderListItem.vue'

export default defineComponent({
  components: {
   Image,
   IonBadge,
   IonButton,
   IonCard,
   IonContent,
   IonItem,
   IonLabel,
   IonNote,
   IonPage,
   IonInfiniteScroll,
   IonInfiniteScrollContent,
   IonList,
   IonThumbnail,
   OrderListItem
  },     
  computed: {
    ...mapGetters({
      products: 'product/getSearchProducts',
      isScrollable: 'product/isScrollable'
    })
  },
  mounted (){
    this.getProducts(process.env.VUE_APP_VIEW_SIZE,0) 
  },
  methods: {
    async loadMoreProducts (event: any) {
      this.getProducts(
        undefined,
        Math.ceil(this.products.length / process.env.VUE_APP_VIEW_SIZE).toString()
      ).then(() => {
        event.target.complete();
      })
    },
    async changePickupPreference(ev: Event) {
      const popover = await popoverController.create({
        component: PickupPreferencePopover,
      });
      await popover.present();
    },

    async updateShipmentAddress() {
      const modal = await modalController
        .create({
          component: ShipmentAddressModal
        })
      return modal.present();
    },
    data (){
    return {
      queryString: ''
    }
  },
    async getProducts(vSize: any, vIndex: any) {
      const viewSize = vSize ? vSize : process.env.VUE_APP_VIEW_SIZE;
      const viewIndex = vIndex ? vIndex : 0;
      const payload = {
        viewSize,
        viewIndex,
        // queryString: '*' + this.queryString + '*'
      }
      // if (this.queryString) {
        await this.store.dispatch("order/getProduct", payload);
      // } else {
      //   showToast(translate("Enter product sku to search"))
      // }
    }

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
