<template>
  <ion-content>
    <ion-list>
      <ion-item>
        <ion-icon slot="start" :icon="storefrontOutline" />
        <ion-label @click="storeModal"> {{ $t("Change Store") }}</ion-label>
      </ion-item>
      <ion-item lines="none">
        <ion-icon slot="start" :icon="mailOutline" />
        <ion-label @click="deliveryStoreModal">{{ $t("Get it shipped") }}</ion-label>
      </ion-item>     
    </ion-list>
  </ion-content>
</template>

<script>
import storeModal from './StoreModal.vue';
import deliveryStoreModal from './DeliveryStoreModal.vue';
import { IonContent, IonIcon, IonLabel, IonList, IonItem, modalController } from '@ionic/vue';
import { defineComponent } from 'vue';
import { 
  storefrontOutline,
  mailOutline,
} from 'ionicons/icons';

export default defineComponent({
  name: 'Popover',
  components: { IonContent, IonIcon, IonLabel, IonList, IonItem },
  methods: {
     async storeModal() {
      const modal = await modalController
        .create({
          component: storeModal
        })
      return modal.present();
    },
     async deliveryStoreModal() {
      const modal = await modalController
        .create({
          component: deliveryStoreModal
        })
      return modal.present();
    },
  },
  setup() {
    return {
      storefrontOutline,
      mailOutline
    }
  }
});
</script>