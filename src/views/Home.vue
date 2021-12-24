<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <h1>{{ $t("Your Order") }}</h1>
      <ion-item lines="none">
        <ion-label>
          <h1>{{ order.customerName }}</h1>
          <p>{{ order.id }}</p>
        </ion-label>
          <ion-note slot="end">{{ order.orderDate }}</ion-note>
      </ion-item>
      <div v-for="(shipGroup, index) of order.shipGroup" :key="index">
        <ion-card>
          <ion-item v-for="item of shipGroup.items" :key="item.id" lines="full">
            <ion-thumbnail slot="start">
              <Image :src="getProduct(item.productId).mainImageUrl" />
            </ion-thumbnail>
            <ion-label slot="start">
              <p>{{item.brandName}}</p>
              <h2>{{ item.name }}</h2>
              <p>{{ $t("Color") }} : {{ $filters.getFeatures(getProduct(item.productId).featureHierarchy, '1/COLOR/') }}</p>
              <p>{{ $t("Size") }} : {{ $filters.getFeatures(getProduct(item.productId).featureHierarchy, '1/SIZE/') }}</p>
            </ion-label>
            <ion-badge slot="end">{{item.status}}</ion-badge>
          </ion-item>
          <ion-item>
            <ion-label>{{ shipGroup.shipmentMethodTypeId }} </ion-label>
            <ion-button @click="changePickupPreference"  color="medium" fill="outline">{{ $t("Change") }}</ion-button>
          </ion-item>
          <ion-item>
            <ion-list>
            <ion-label>{{ shipGroup.shipTo.postalAddress.toName }}</ion-label>
            <ion-label>{{ shipGroup.shipTo.postalAddress.address1 }} </ion-label>
            <ion-label>{{ shipGroup.shipTo.postalAddress.city}} {{ shipGroup.shipTo.postalAddress.country}} {{ shipGroup.shipTo.postalAddress.postalCode}}</ion-label>
            </ion-list>
            <ion-button  slot="end" color="medium" fill="outline" @click="updateShipmentAddress">{{ $t("Edit") }}</ion-button>
          </ion-item>
          <ion-item lines="none">
            <ion-label color="danger">{{ $t("Cancel Item") }}</ion-label>
          </ion-item>
        </ion-card>
      </div>
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
  IonList,
  IonNote,
  IonPage,
  IonThumbnail,
  popoverController,
  modalController
} from "@ionic/vue";
import { defineComponent } from "vue";
import { Plugins } from '@capacitor/core';
import { showToast } from '@/utils';
import PickupPreferencePopover from "@/views/PickupPreferencePopover.vue";
import ShipmentAddressModal from "@/views/ShipmentAddressModal.vue";
import { mapGetters, useStore } from 'vuex'
import Image from "@/components/Image.vue";

const { Clipboard } = Plugins;

export default defineComponent({
  components: {
    Image,
    IonBadge,
    IonButton,
    IonCard,
    IonContent,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonPage,
    IonThumbnail
  },     
  computed: {
    ...mapGetters({
      products: 'product/fetchProducts',
      order: 'order/getOrder',
      getProduct: 'product/getProduct'
    })
  },
  data () {
    return {
      queryString: ''
    }
  },
  async mounted () {
    this.getOrder(process.env.VUE_APP_VIEW_SIZE,0);
  },
  methods: {
    async getOrder (vSize: any, vIndex: any) {
      const viewSize = vSize ? vSize : process.env.VUE_APP_VIEW_SIZE;
      const viewIndex = vIndex ? vIndex : 0;
      const payload = {
        viewSize,
        viewIndex,
      }
      await this.store.dispatch("order/getOrder", payload);
    },
    async copyToClipboard(text: string) {
      await Clipboard.write({
        string: text
      }).then(() => {
        showToast('Copied')
      })
    },
    async changePickupPreference (ev: Event) {
      const popover = await popoverController.create({
        component: PickupPreferencePopover,
      });
      await popover.present();
    },
    async updateShipmentAddress () {
      const modal = await modalController
        .create({
          component: ShipmentAddressModal
        })
      return modal.present();
    }
  },
  setup () {
    const store = useStore();
    return {
      store
    }
  }
});
</script>

<style scoped>
  h1 {
    text-align: center;
  }
</style>
