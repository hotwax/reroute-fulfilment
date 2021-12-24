<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="end" @click="closeChangeStoreModal()" >
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
        <ion-card-title>{{ $t("Current pick up store") }}</ion-card-title>
      </ion-card-header>
      <ion-item lines="none">
        <ion-icon slot="start" :icon="businessOutline" />
        <ion-label>
         <h2>Time Square</h2>
         <p>{{ $t("3 Time Square") }}</p>
         <p>{{ $t("New York NY") }}</p> 
        </ion-label>
        <ion-note>{{ $t("remaining stock") }}</ion-note>
      </ion-item>     
    </ion-card>  
    <ion-list>
      <ion-list-header lines="full" color="light">
        <ion-label>{{ $t("Nearby stores") }}</ion-label>
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
        <ion-label>{{ $t("Nearby stores") }}</ion-label>
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
import { IonButton, IonButtons, IonCard, IonCardHeader, IonCardTitle, IonCheckbox, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonNote, IonTitle,  IonToolbar,modalController, popoverController } from '@ionic/vue';
import { defineComponent } from 'vue';
import { businessOutline, closeOutline } from 'ionicons/icons';
import { useRouter } from "vue-router";
import { useStore } from "@/store";

export default defineComponent({
  name: 'ChangeStoreModal',  
  components: { IonButton, IonButtons, IonCard, IonCardHeader, IonCardTitle, IonCheckbox,IonContent, IonHeader, IonIcon, IonItem, IonList, IonListHeader, IonLabel, IonNote, IonTitle,  IonToolbar},
  methods:{
    closeChangeStoreModal(){
      modalController.dismiss({dismissed:true});
    },
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    return { businessOutline, closeOutline, router, store };
  }
});
</script>