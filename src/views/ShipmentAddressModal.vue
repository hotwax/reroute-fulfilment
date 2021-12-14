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
        <ion-label position="floating">{{ $t("Street name") }}</ion-label>
      </ion-item> 
      <ion-item>
        <ion-label position="floating">{{ $t("House/Apartment number") }}</ion-label>
      </ion-item>     
      <ion-item>
        <ion-label position="floating">{{ $t("City") }}</ion-label> 
      </ion-item>     
      <ion-item>
        <ion-label position="floating">{{ $t("State / Province") }}</ion-label>    
      </ion-item>
      <ion-item>
        <ion-label position="floating">{{ $t("Zip code") }}</ion-label> 
      </ion-item>
      <ion-item>
        <ion-label position="floating">{{ $t("Country") }}</ion-label>   
        <ion-select>
          <ion-select-option>Afghanistan</ion-select-option>
          <ion-select-option>Albania</ion-select-option>
          <ion-select-option>India</ion-select-option>
          <ion-select-option>United States</ion-select-option>   
        </ion-select>
      </ion-item>
    </ion-list>
    <ion-button>{{ $t("Save") }}</ion-button>
 </ion-content>
</template>

<script>
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonTitle,  IonToolbar,modalController } from '@ionic/vue';
import { defineComponent } from 'vue';
import { closeOutline } from 'ionicons/icons';

export default defineComponent({
  name: 'ShipmentModal',  
  components: { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonTitle,  IonToolbar},
  methods:{
    closeShipmentModal(){
      modalController.dismiss({dismissed:true});
    }
  },

  setup() {
    return { closeOutline };
  }
});
</script>