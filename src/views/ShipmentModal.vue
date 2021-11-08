<template>
 <ion-header>
    <ion-toolbar>
      <ion-title>{{ $t("Shipment Details") }}</ion-title>
      <ion-buttons slot="end" @click="closeModal()" >
          <ion-button >
             <ion-icon :icon="closeOutline"></ion-icon>
          </ion-button>
      </ion-buttons>  
    </ion-toolbar>   
 </ion-header>
 
 <ion-content class="ion-padding">
     <ion-list>
         <ion-item>
             <ion-label position="floating">{{ $t("Street name") }}</ion-label>
             <ion-input></ion-input>
         </ion-item>
      
         <ion-item>
             <ion-label position="floating">{{ $t("House/Apartment number") }}</ion-label>
             <ion-input></ion-input>
         </ion-item>
     
         <ion-item>
             <ion-label position="floating">{{ $t("City") }}</ion-label>
             <ion-input></ion-input>
         </ion-item>
     
         <ion-item>
             <ion-label position="floating">{{ $t("State / Province") }}</ion-label>
             <ion-input></ion-input>
         </ion-item>
      
         <ion-item>
             <ion-label position="floating">{{ $t("Zip code") }}</ion-label>
             <ion-input></ion-input>
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
 
     <ion-button @click="closeModal()">{{ $t("Save") }}</ion-button>
 </ion-content>
</template>

<script>
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonInput,IonLabel, IonList, IonSelect, IonSelectOption, IonTitle,  IonToolbar,modalController } from '@ionic/vue';
import { defineComponent } from 'vue';
import { 
  closeOutline
} from 'ionicons/icons';

export default defineComponent({
  name: 'ShipmentModal',  
  components: { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonInput,IonLabel, IonList, IonSelect, IonSelectOption, IonTitle,  IonToolbar},
  methods:{
    closeModal(){
      modalController.dismiss({dismissed:true});
    }
  },
   setup() {
    return {
     closeOutline
    }
  }
});
</script>