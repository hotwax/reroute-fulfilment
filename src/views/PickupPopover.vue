<template>
  <ion-content class="ion-padding">
    <ion-list>
      <ion-item>
        <ion-icon slot="start" :icon="storefrontOutline" />
        <ion-label> {{ $t("Change Store") }}</ion-label>
      </ion-item>
      <ion-item lines="none">
        <ion-icon slot="start" :icon="mailOutline" />
        <ion-label>{{ $t("Get it shipped") }}</ion-label>
      </ion-item>     
    </ion-list>
  </ion-content>
</template>

<script>
import { IonContent } from '@ionic/vue';
import { defineComponent } from 'vue';
import { 
 storefrontOutline,
 mailOutline,
} from 'ionicons/icons';

export default defineComponent({
  name: 'Popover',
  components: { IonContent },
  setup() {
    return {
      storefrontOutline,
      mailOutline
    }
  }
});
</script>