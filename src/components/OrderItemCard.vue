<template>
  <ion-card>
    <ion-item lines="none">
      <ion-label>
        <h1>{{ orders.customerName }}</h1>
        <p>{{ orders.orderId }}</p>
      </ion-label>
        <ion-note slot="end">order date</ion-note>        
      </ion-item>
      <ProductListItem v-for="item in orders.items" :key="item.itemId" :item="item" />
      <ion-item lines="full">   
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
</template>    

<script lang="ts">
import {
  IonBadge,
  IonButton,
  IonCard,
  IonItem,
  IonLabel,
  IonNote,
  IonThumbnail,
  popoverController,
  modalController
} from "@ionic/vue";
import Image from "@/components/Image.vue";
import ProductListItem from '@/components/ProductListItem.vue';
import { Plugins } from '@capacitor/core';
import { showToast } from '@/utils';
import PickupPreferencePopover from "@/views/PickupPreferencePopover.vue";
import ShipmentAddressModal from "@/views/ShipmentAddressModal.vue";

const { Clipboard } = Plugins;

export default({
  name: 'OrderItemCard',
  components: {
   Image,
   IonBadge,
   IonButton,
   IonCard,
   IonItem,
   IonLabel,
   IonNote,
   IonThumbnail,
   ProductListItem
  },
  props: ["orders"],
  methods: {
    async copyToClipboard(text: string) {
      await Clipboard.write({
        string: text
      }).then(() => {
        showToast('Copied')
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
  },
})
</script>