<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <h1>{{ $t("Your Order") }}</h1>
      <ion-item lines="none" class="border">
        <ion-label>
          {{ order.customerName }}
          <p>{{ order.id }}</p>
        </ion-label>
        <ion-note slot="end">{{ moment(order.orderDate).local().format("MMM Do YYYY") }}</ion-note>
      </ion-item>
      <div v-for="(shipGroup, index) of order.shipGroup" :key="index">
        <ion-card v-for="item of shipGroup.items" :key="item.id">
          <ion-item lines="full">
            <ion-thumbnail slot="start">
              <Image :src="getProduct(item.productId).mainImageUrl" />
            </ion-thumbnail>
            <ion-label slot="start">
              <p>{{ item.brandName }}</p>
              <h2>{{ item.name }}</h2>
              <p>{{ $t("Color") }}: {{ $filters.getFeatures(getProduct(item.productId).featureHierarchy, '1/COLOR/') }}</p>
              <p>{{ $t("Size") }}: {{ $filters.getFeatures(getProduct(item.productId).featureHierarchy, '1/SIZE/') }}</p>
            </ion-label>
            <!-- TODO: handle all the status cases correctly -->
            <ion-badge slot="end" v-if="item.status === 'ITEM_COMPLETED'" color="success">{{ 'Completed' }}</ion-badge>
            <ion-badge slot="end" v-if="item.status === 'ITEM_APPROVED'" color="warning">{{ 'Approved' }}</ion-badge>
            <ion-badge slot="end" v-if="item.status === 'ITEM_CANCELED'" color="danger">{{ 'Canceled' }}</ion-badge>
          </ion-item>
          <ion-item v-if="shipGroup.shipmentMethodTypeId === 'STOREPICKUP'">
            <ion-label>{{ $t('Store pickup') }}</ion-label>
            <ion-button @click="updateShipmentAddress(shipGroup)" color="medium" fill="outline">{{ $t("Get it delivered") }}</ion-button>
          </ion-item>
          <ion-item v-else>
            <ion-label>{{ $t('Delivery') }}</ion-label>
            <ion-button @click="changePickupPreference(shipGroup)" color="medium" fill="outline">{{ $t("Pick up today") }}</ion-button>
          </ion-item>
          <ion-item v-if="shipGroup.shipmentMethodTypeId !== 'STOREPICKUP'" lines="full">
            <ion-label slot="start">{{ shipGroup.shipmentMethodTypeId }}</ion-label>
            <ion-label slot="end">{{ item.promisedDatetime }}</ion-label>
          </ion-item>
          <ion-item>
            <ion-list>
              <ion-label>{{ shipGroup.shipTo.postalAddress.toName }}</ion-label>
              <ion-label>{{ shipGroup.shipTo.postalAddress.address1 }} </ion-label>
              <ion-label>{{ shipGroup.shipTo.postalAddress.city}} {{ shipGroup.shipTo.postalAddress.country}} {{ shipGroup.shipTo.postalAddress.postalCode}}</ion-label>
            </ion-list>
            <ion-button slot="end" color="medium" fill="outline" v-if="shipGroup.shipmentMethodTypeId === 'STOREPICKUP'" @click="changePickupPreference(shipGroup)">{{ $t("Change store") }}</ion-button>
            <ion-button slot="end" color="medium" fill="outline" v-else @click="updateShipmentAddress(shipGroup)">{{ $t("Edit address") }}</ion-button>
          </ion-item>
          <ion-item lines="none">
            <ion-checkbox v-model="shipGroup.selected" slot="start" />
            <ion-label>{{ $t("Cancel this item") }}</ion-label>
          </ion-item>
        </ion-card>
      </div>
      <ion-button>{{ $t("Save changes to order") }}</ion-button>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCheckbox,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonThumbnail,
  modalController
} from "@ionic/vue";
import { defineComponent } from "vue";
import { Plugins } from '@capacitor/core';
import { showToast } from '@/utils';
import ShipmentAddressModal from "@/views/ShipmentAddressModal.vue";
import { mapGetters, useStore } from 'vuex'
import Image from "@/components/Image.vue";
import StoreModal from "./StoreModal.vue";
import moment from 'moment';

const { Clipboard } = Plugins;

export default defineComponent({
  components: {
    Image,
    IonBadge,
    IonButton,
    IonCard,
    IonCheckbox,
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
    async changePickupPreference (shipGroup: any) {
      const modal = await modalController.create({
        component: StoreModal,
        componentProps: {
          shipGroup,
        },
      });
      await modal.present();
    },
    async updateShipmentAddress (shipGroup: any) {
      const modal = await modalController
        .create({
          component: ShipmentAddressModal,
          componentProps: {
            shipGroup
          }
        })
      return modal.present();
    }
  },
  setup () {
    const store = useStore();
    return {
      moment,
      store
    }
  }
});
</script>

<style scoped>
  h1 {
    text-align: center;
  }
  .border {
    border: 1px solid #92949C;
    border-radius: 8px;
  }
</style>
