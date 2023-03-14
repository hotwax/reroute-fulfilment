<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="end" @click="closeShipmentAddressModal()">
        <ion-button>
          <ion-icon :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ $t("Select pickup location") }}</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content>
    <ion-card v-if="shipGroup.shipmentMethodTypeId !== 'STOREPICKUP'">
      <ion-item lines="none">
        <ion-label>{{ $t("Showing pickup locations near") }}</ion-label>
      </ion-item>
      <ion-item>
        <ion-list>
          <ion-label>{{ shipGroup.shipTo.postalAddress.toName }}</ion-label>
          <ion-label color="dark">{{ shipGroup.shipTo.postalAddress.address1 }} </ion-label>
          <ion-label color="dark">{{ shipGroup.shipTo.postalAddress.city }} {{ shipGroup.shipTo.postalAddress.country }} {{ shipGroup.shipTo.postalAddress.postalCode }}</ion-label>
        </ion-list>
      </ion-item>
    </ion-card>
    <ion-list v-if="nearbyStores.length" >
      <ion-list-header lines="full" color="light">
        <ion-label>{{ $t("Nearby stores") }}</ion-label>
      </ion-list-header>
      <ion-item v-for="store of nearbyStores" :key="store.facilityId">
        <ion-radio-group v-model="facilityId">
          <ion-label>{{ store.facilityName }}</ion-label>
          <!-- Showing store distance in miles -->
          <ion-label v-if="store.distance" slot="end">{{ store.distance }} {{ $t("mi") }}</ion-label>
          <ion-radio :value="store.facilityId" slot="end" />
        </ion-radio-group>
      </ion-item>
    </ion-list>
    <ion-item v-else lines="none" class="ion-text-center">
      <ion-label>{{ $t("No nearby stores found") }}</ion-label>
    </ion-item>
    <!-- Only show select button if there are stores to select from -->
    <div v-if="nearbyStores.length" class="ion-text-center">
      <ion-button @click="updateShipmentStore()">{{ $t("Select pickup location") }}</ion-button>
    </div>
  </ion-content>
</template>

<script lang="ts">
import {
  IonButton,
  IonButtons,
  IonCard,
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
import { closeOutline } from 'ionicons/icons';
import { useRouter } from "vue-router";
import { useStore } from "@/store";
import { FacilityService } from '@/services/FacilityService';
import { StockService } from '@/services/StockService';
import { translate } from '@/i18n';
import { hasError, showToast } from '@/utils';

export default defineComponent({
  name: 'StoreModal',
  components: {
    IonButton,
    IonButtons,
    IonCard,
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
      nearbyStores: [] as any,
      facilityId: ''
    }
  },
  props: ["shipGroup", "productIds"],
  mounted() {
    this.getNearbyStores()
  },
  methods: {
    async getNearbyStores() {
      try {
        let shipGroupLocationResp: any, productInventoryResp: any, storeLookupResp: any, facilityIds;
        if (this.shipGroup.shipmentMethodTypeId === 'STOREPICKUP' && this.shipGroup.selectedShipmentMethodTypeId === 'STOREPICKUP') {
          storeLookupResp = await FacilityService.getStores({
            "viewSize": 60,
            "filters": ["storeType: RETAIL_STORE"],
          })

          if (storeLookupResp.status !== 200 || hasError(storeLookupResp) || !storeLookupResp.data.response.numFound) {
            return showToast(translate("Something went wrong while fetching nearby stores"))
          }
        } else {
          shipGroupLocationResp = await FacilityService.getLocation({
            "json": {
              "query": `postcode: ${this.shipGroup.shipTo.postalAddress.postalCode}`
            }
          })

          if (shipGroupLocationResp.status !== 200 || hasError(shipGroupLocationResp) || !shipGroupLocationResp.data.response.numFound) {
            return showToast(translate("Something went wrong while fetching nearby stores"))
          }

          storeLookupResp = await FacilityService.getStores({
            "viewSize": 60,
            "filters": ["storeType: RETAIL_STORE"],
            "point": shipGroupLocationResp.data.response.docs[0].location,
            "distance": 50,
            "fieldsToSelect": ["storeCode", "storeName", "dist"]
          })

          if (storeLookupResp.status !== 200 || hasError(storeLookupResp) || !storeLookupResp.data.response.numFound) {
            return showToast(translate("Something went wrong while fetching nearby stores"))
          }
        }
        facilityIds = storeLookupResp.data.response.docs.map((store: any) => store.storeCode)
        productInventoryResp = await StockService.checkInventory({
          "filters": {
            "productId": this.productIds,
            "facilityId": facilityIds
          },
          "fieldsToSelect": ["atp", "facilityName", "facilityId"],
        });

        if (productInventoryResp.status !== 200 || hasError(productInventoryResp) || !productInventoryResp.data.count) {
          return showToast(translate("Something went wrong while fetching nearby stores"))
        }
        const storesWithInventory = productInventoryResp.data.docs.filter((store: any) => store.atp > 0)
        storesWithInventory.map((store: any) => {
          const storeDetails = storeLookupResp.data.response.docs.find((data: any) => data.storeCode === store.facilityId );
          if (storeDetails) this.nearbyStores.push({...store, distance: storeDetails.dist});
        });
        // sorting in alphabetical order 
        this.nearbyStores.sort((a: any, b: any) => a.facilityName.localeCompare(b.facilityName))
      } catch (error) {
        console.error(error)
        showToast(translate("Something went wrong while fetching nearby stores"));
      }
    },

    updateShipmentStore() {
      if (this.facilityId) {
        this.closeShipmentAddressModal(this.facilityId);
      } else {
        showToast(translate("Please select a pickup location"));
      }
    },

    closeShipmentAddressModal(facilityId?: string) {
      modalController.dismiss({ dismissed: true }, facilityId);
    }
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    return { closeOutline, router, store };
  }
});
</script>