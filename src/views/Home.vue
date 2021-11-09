<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-text id="title">
        <h1>{{ $t("Your Order") }}</h1>
      </ion-text>
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
            <Image src="https://gravatar.com/avatar/dba6bae8c566f9d4041fb9cd9ada7741?d=identicon&f=y"></Image>
          </ion-thumbnail>
          <ion-label slot="start">
            <p>BRAND</p>
            <h2>Virtual Name</h2>
            <p>{{ $t("Color") }}: color</p>
            <p>{{ $t("Size") }}: size</p>
          </ion-label>
          <ion-badge slot="end" color="primary">status</ion-badge>
        </ion-item>
        <ion-item>
          <ion-label>{{ $t("Store pickup") }}</ion-label>
          <ion-button @click="openPickupPopover"  color="medium" fill="outline">Change</ion-button>
        </ion-item>
        <ion-item lines="full">
          <ion-label>{{ $t("Ship to") }}</ion-label>  
          <ion-button  color="medium" fill="outline" @click="openShipmentModal">Edit</ion-button>
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
  IonText,
  IonThumbnail,
  popoverController,  
} from "@ionic/vue";
import { defineComponent } from "vue";
import Popover from "./PickupPopover.vue";
import Image from "@/components/Image.vue";

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
   IonText,
   IonThumbnail,
  },
  methods: {
    async openPickupPopover(ev: Event) {
      const popover = await popoverController.create({
        component: Popover,
<<<<<<< HEAD
=======
        cssClass: "my-custom-class",
>>>>>>> parent of adcbd792... Implemented modal component to accept shipment details
        event: ev,
        translucent: true,
      });
      await popover.present();
    },
<<<<<<< HEAD

    async openShipmentModal() {
      const modal = await modalController
        .create({
          component: ShipmentModal
        })
      return modal.present();
    },
=======
>>>>>>> parent of adcbd792... Implemented modal component to accept shipment details
  },
});
</script>

<style scoped>
#container {
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;
  color: #8c8c8c;
  margin: 0;
}

#container a {
  text-decoration: none;
}
#your-order {
  position: absolute;
  width: 123px;
  height: 31px;
  left: calc(50% - 123px / 2 + 0.5px);
  top: 128px;
  visibility: visible;
}
#title h1 {
  font-size: 26px;
  line-height: 120%;
  /* or 31px */
  text-align: center;
  color: rgba(0, 0, 0, 0.87);
}
ion-content {
  visibility: visible;
}
#label {
  width: 100px;
  padding: 0;
}
.myCustomSelect {
  max-width: 100% !important;
}
</style>
