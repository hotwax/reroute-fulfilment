<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="end" @click="closeDeliveryStoreModal()" >
        <ion-button >
          <ion-icon :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ $t("Choose a different store for pickup") }}</ion-title>  
    </ion-toolbar>   
  </ion-header> 
  <ion-content>
    <ion-card>
      <ion-card-header>
      <ion-card-title>Current delivery address</ion-card-title>
      </ion-card-header>
      <ion-item lines="none">
        <ion-icon slot="start" :icon="mailOutline" />
        <ion-label>
         <h2>John Doe</h2>
         <p>{{ $t("3 Time Square") }}</p>
         <p>{{ $t("New York NY") }}</p>
        </ion-label>
        <ion-note>{{ $t("<shipping method>") }}</ion-note>
      </ion-item>      
    </ion-card>  
    <ion-list>
      <ion-list-header lines="full" color="light">
        <ion-label>Nearby stores</ion-label>
      </ion-list-header>
      <ion-item>
        <ion-label>{{ $t("Store name") }}</ion-label>
        <ion-checkbox slot="end" />
      </ion-item>
      <ion-item>
        <ion-label>{{ $t("Store name") }}</ion-label>
        <ion-checkbox slot="end" />
      </ion-item>
      <ion-item>
        <ion-label>{{ $t("Store name") }}</ion-label>
        <ion-checkbox slot="end" />
      </ion-item>
    </ion-list>  
    <ion-list>
      <ion-list-header lines="full" color="light">
          <ion-label>Nearby stores</ion-label>
        </ion-list-header>
      <ion-item>
        <ion-label>{{ $t("Store name") }}</ion-label>
        <ion-checkbox slot="end" />
      </ion-item>
      <ion-item>
        <ion-label>{{ $t("Store name") }}</ion-label>
        <ion-checkbox slot="end" />
      </ion-item>
      <ion-item>
        <ion-label>{{ $t("Store name") }}</ion-label>
        <ion-checkbox slot="end" />
      </ion-item>
    </ion-list>
  </ion-content>
</template>

<script lang="ts">
import { IonButton, IonButtons, IonCard, IonCardHeader, IonCardTitle, IonCheckbox, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonNote, IonTitle,  IonToolbar,modalController } from '@ionic/vue';
import { defineComponent } from 'vue';
import { mailOutline, closeOutline } from 'ionicons/icons';
import { useRouter } from "vue-router";
import { useStore } from "@/store";

export default defineComponent({
  name: 'ChangeStoreModal',  
  components: { IonButton, IonButtons, IonCard, IonCardHeader, IonCardTitle, IonCheckbox,IonContent, IonHeader, IonIcon, IonItem, IonList, IonListHeader, IonLabel, IonNote, IonTitle,  IonToolbar},
  methods:{
    closeDeliveryStoreModal(){
      modalController.dismiss({dismissed:true});
    },
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    return { mailOutline, closeOutline, router, store };
  }
});
</script>