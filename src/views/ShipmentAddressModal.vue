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
        <ion-label position="floating">{{ $t("Street name") }}
        <ion-input name="streetname" v-model="shipmentAddress.streetname" id="streetname"  type="text" required></ion-input></ion-label>
        <ion-input />
      </ion-item> 
      <ion-item>
        <ion-label position="floating">{{ $t("House/Apartment number") }}
        <ion-input name="apartmentnumber" v-model="shipmentAddress.apartmentnumber" id="apartmentnumber"  type="number" required></ion-input></ion-label>
        <ion-input />
      </ion-item>     
      <ion-item>
        <ion-label position="floating">{{ $t("City") }}
        <ion-input name="city" v-model="shipmentAddress.city" id="city"  type="text" required></ion-input></ion-label> 
        <ion-input />
      </ion-item>     
      <ion-item>
        <ion-label position="floating">{{ $t("State / Province") }}
        <ion-input name="state" v-model="shipmentAddress.state" id="state"  type="text" required></ion-input></ion-label> 
        <ion-input />
      </ion-item>
      <ion-item>
        <ion-label position="floating">{{ $t("Zip code") }}
        <ion-input name="zipcode" v-model="shipmentAddress.zipcode" id="zipcode"  type="number" required></ion-input></ion-label> 
        <ion-input />
      </ion-item>
      <ion-item>
        <ion-label position="floating">{{ $t("Country") }}
        <ion-input name="country" v-model="shipmentAddress.country" id="country" required></ion-input></ion-label>
        <ion-input />
        <ion-select>
          <ion-select-option>Afghanistan</ion-select-option>
          <ion-select-option>Albania</ion-select-option>
          <ion-select-option>India</ion-select-option>
          <ion-select-option>United States</ion-select-option>   
        </ion-select>
      </ion-item>
    </ion-list>
    <div class="details">
    <ion-button @click="updateShipmentAddress()">{{ $t("Save") }}</ion-button>
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
      streetname: "",
      apartmentnumber: "",
      city: "",
      state: "",
      zipcode: "",
      country: ""
      }     
    };
  },
  methods:{
    updateShipmentAddress() {
        if (this.shipmentAddress) {
          this.store.dispatch('user/shipmentAddress', this.shipmentAddress);
          console.log("Address Updated");
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