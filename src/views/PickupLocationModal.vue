<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start" @click="closeModal()">
        <ion-button>
          <ion-icon :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate("Select pickup location") }}</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content>
    <ion-list v-if="stores.length">
      <ion-accordion-group>
        <ion-accordion>
          <ion-item slot="header" color="light">
            <ion-icon :icon="locationOutline" slot="start" />
            <ion-label>{{ translate("Showing pickup location near your saved address") }}</ion-label>
          </ion-item>
          <ion-item slot="content">
            <ion-label>
              {{ customerAddress.toName }}
              <p>{{ customerAddress.address1 }}</p>
              <p>{{ customerAddress.city }} {{ customerAddress.stateProvinceGeoId }} {{ customerAddress.postalCode }}</p>
            </ion-label>
          </ion-item>
        </ion-accordion>
      </ion-accordion-group>

      <ion-radio-group v-model="selectedFacilityIdValue">
        <ion-item lines="none">
          <ion-radio label-placement="end" value="cancel">
            <ion-label>{{ translate("Request cancelation") }}</ion-label>
          </ion-radio>
        </ion-item>

        <ion-list-header lines="full" color="light">
          <ion-label>{{ translate("Nearby stores") }}</ion-label>
        </ion-list-header>

        <ion-item v-for="store of stores" :key="store.facilityId">
          <ion-radio :value="store.facilityId" label-placement="end">
            <ion-label>
              {{ store.facilityName }}
              <p>{{ store.address1 }}</p>
              <p>{{ store.city }}{{ store.city && store.state ? ", " : "" }}{{ store.state }}</p>
            </ion-label>
            <!-- Showing store distance in miles -->
            <ion-label v-if="store.distance">{{ store.distance }} {{ translate("mi") }}</ion-label>
          </ion-radio>
        </ion-item>
      </ion-radio-group>
    </ion-list>
    <ion-item v-else lines="none" class="ion-text-center">
      <ion-label>{{ translate("Inventory not available at any nearby store, please select alternate delivery method") }}</ion-label>
    </ion-item>

    <div v-if="stores.length" class="ion-text-center">
      <ion-button  @click="save()">{{ translate("Save selection") }}</ion-button>
    </div>
  </ion-content>
</template>

<script lang="ts">
import {
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonRadio,
  IonRadioGroup,
  IonTitle,
  IonToolbar,
  modalController
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { closeOutline, locationOutline } from 'ionicons/icons';
import { useRouter } from "vue-router";
import { useStore } from "@/store";
import { translate } from '@/i18n';

export default defineComponent({
  name: 'PickupLocationModal',
  components: {
    IonAccordion,
    IonAccordionGroup,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonList,
    IonListHeader,
    IonLabel,
    IonRadio,
    IonRadioGroup,
    IonTitle,
    IonToolbar
  },
  data() {
    return {
      loader: null as any,
      stores: [] as any,
      facilityId: '',
      selectedFacilityIdValue: ""
    }
  },
  props: ["nearbyStores", "isPickupForAll", "availableStores", "storesWithInventory", "selectedFacilityId", "currentProductId", "customerAddress"],
  async mounted() {
    if(this.isPickupForAll) {
      this.stores = this.nearbyStores
    } else {
      this.availableStores.map((store: any) => {
        const inventoryDetails = this.storesWithInventory.find((storeInv: any) => store.storeCode === storeInv.facilityId && storeInv.productId === this.currentProductId)
        if(inventoryDetails) this.stores.push({...store, ...inventoryDetails, distance: store.dist })
      })
    }
    if(this.selectedFacilityId) this.selectedFacilityIdValue = this.selectedFacilityId
  },
  methods: {
    closeModal(payload = {}) {
      modalController.dismiss({ dismissed: true, ...payload });
    },
    save() {
      this.closeModal({ selectedFacilityId: this.selectedFacilityIdValue })
    }
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    return {
      closeOutline,
      locationOutline,
      router,
      store,
      translate
    };
  }
});
</script>

<style scoped>
/* Styling to add the facility name and its display side by side as ion-radio label */
ion-radio::part(label) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%
}
</style>