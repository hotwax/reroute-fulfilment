<template>
  <ion-page>
    <ion-content>
      <h1>{{ $t("Your Order") }}</h1>
      <ion-card>
        <ion-item lines="none">
          <ion-label>
            <h2>Customer Name</h2>
            <p>Order ID</p>
          </ion-label>
          <ion-note slot="end">order date</ion-note>        
        </ion-item>
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
  IonThumbnail,
  popoverController,
  modalController  
} from "@ionic/vue";
import { defineComponent } from "vue";
import ChangePickupPreferencePopover from "./ChangePickupPreferencePopover.vue";
import Image from "@/components/Image.vue";
import UpdateShipmentAddressModal from "./UpdateShipmentAddressModal.vue";

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
   IonThumbnail,
  },
  methods: {
    async changePickupPreference(ev: Event) {
      const popover = await popoverController.create({
        component: ChangePickupPreferencePopover,
      });
      await popover.present();
    },

    async updateShipmentAddress() {
      const modal = await modalController
        .create({
          component: UpdateShipmentAddressModal
        })
      return modal.present();
    },
  },
});
</script>

<style scoped>
  h1 {
    text-align: center;
  }
</style>
