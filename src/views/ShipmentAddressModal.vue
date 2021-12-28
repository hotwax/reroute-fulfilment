<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>{{ $t("Shipment Details") }}</ion-title>
      <ion-buttons slot="end" @click="closeShipmentModal()" >
        <ion-button >
          <ion-icon :icon="closeOutline" />
        </ion-button>
      </ion-buttons>  
    </ion-toolbar>   
  </ion-header> 
  <ion-content>
    <ion-list>
      <ion-item>
        <ion-label position="floating">{{ $t("First name") }}</ion-label>
        <ion-input name="firstName" v-model="shipmentAddress.firstName" id="firstName" type="text" required />
      </ion-item>
      <ion-item>
        <ion-label position="floating">{{ $t("Last name") }}</ion-label>
        <ion-input name="lastName" v-model="shipmentAddress.lastName" id="lastName" type="text" required />
      </ion-item>
      <ion-item>
        <ion-label position="floating">{{ $t("Street") }}</ion-label>
        <ion-input name="street" v-model="shipmentAddress.street" id="street" type="text" required />
      </ion-item>
      <ion-item>
        <ion-label position="floating">{{ $t("City") }}</ion-label>
        <ion-input name="city" v-model="shipmentAddress.city" id="city" type="text" required />
      </ion-item>
      <ion-item>
        <ion-label position="floating">{{ $t("State") }}</ion-label>
        <ion-input name="state" v-model="shipmentAddress.state" id="state" type="text" required />
      </ion-item>
      <ion-item>
        <ion-label position="floating">{{ $t("Zip code") }}</ion-label>
        <ion-input name="zipcode" v-model="shipmentAddress.zipcode" id="zipcode" type="number" required />
      </ion-item>
    </ion-list>
    <div class="details">
      <ion-button @click="updateShipmentAddress()">{{ $t("Ship to this address") }}</ion-button>
    </div>
  </ion-content>
</template>

<script lang="ts">
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonInput, IonLabel, IonList, IonSelect, IonSelectOption, IonTitle,  IonToolbar,modalController } from '@ionic/vue';
import { defineComponent } from 'vue';
import { closeOutline } from 'ionicons/icons';
import { useRouter } from "vue-router";
import { useStore } from "@/store";

export default defineComponent({
  name: 'ShipmentModal',  
  components: { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonInput, IonLabel, IonList, IonSelect, IonSelectOption, IonTitle,  IonToolbar},
  data() {
    return {
      shipmentAddress:{
        firstName: "",
        lastName: "",
        street: "",
        city: "",
        state: "",
        zipcode: ""
      }     
    };
  },
  methods:{
    updateShipmentAddress() {
      if (this.shipmentAddress) {
        this.store.dispatch('user/shipmentAddress', this.shipmentAddress);
      }
    },
    closeShipmentModal(){
      modalController.dismiss({dismissed:true});
    },
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    return { closeOutline, router, store };
  }
});
</script>