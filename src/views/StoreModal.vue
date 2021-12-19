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
      <ion-card-header>Current pick up store</ion-card-header>
      <ion-item lines="none">
        <ion-icon :icon="business-outline" />
        <ion-label>
         <h2>Time Square</h2>
         <p>{{ $t("3 Time Square") }}</p>
         <p>{{ $t("New York NY") }}</p>
        </ion-label>
        <ion-note>{{ $t("remaining stock") }}</ion-note>
      </ion-item>      
    </ion-card>  
    <ion-list>
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
import { IonButton, IonButtons, IonCheckbox, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonNote, IonTitle,  IonToolbar,modalController } from '@ionic/vue';
import { defineComponent } from 'vue';
import { businessOutline } from 'ionicons/icons';
import { useRouter } from "vue-router";
import { useStore } from "@/store";

export default defineComponent({
  name: 'ChangeStoreModal',  
  components: { IonButton, IonButtons, IonCheckbox,IonContent, IonHeader, IonIcon, IonItem, IonList, IonLabel, IonNote, IonTitle,  IonToolbar},
  methods:{
    closeChangeStoreModal(){
      modalController.dismiss({dismissed:true});
    },
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    return { businessOutline, router, store };
  }
});
</script>