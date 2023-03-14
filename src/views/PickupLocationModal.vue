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
    <ion-list v-if="nearbyStores.length">
      <ion-list-header lines="full" color="light">
        <ion-label>{{ $t("Nearby stores") }}</ion-label>
      </ion-list-header>
      <ion-radio-group v-model="facilityId">
        <ion-item v-for="store of nearbyStores" :key="store.facilityId">
          <ion-label>{{ store.facilityName }}</ion-label>
          <!-- Showing store distance in miles -->
          <ion-label v-if="store.distance" slot="end">{{ store.distance }} {{ $t("mi") }}</ion-label>
          <ion-radio :value="store.facilityId" slot="end" />
        </ion-item>
      </ion-radio-group>
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
    this.showStores()
  },
  methods: {
    async getStores(point?: string) {
      let payload = {
        "viewSize": process.env.VUE_APP_VIEW_SIZE,
        "filters": ["storeType: RETAIL_STORE"]
      } as any

      if (point) {
        payload.point = point
        payload.distance = 50
      }
      
      try {
        const storeLookupResp = await FacilityService.getStores(payload)
        if (storeLookupResp.status !== 200 || hasError(storeLookupResp) || !storeLookupResp.data.response.numFound) {
          return showToast(translate("Something went wrong while fetching nearby stores"))
        } else {
          return storeLookupResp
        }
      } catch (error) {
        console.error(error)
        showToast(translate("Something went wrong while fetching nearby stores"));
      }
    },

    async getLocation() {
      try {
        const shipGroupLocationResp = await FacilityService.getLocation({
          "json": {
            "query": `postcode: ${this.shipGroup.shipTo.postalAddress.postalCode}`
          }
        })

        if (shipGroupLocationResp.status !== 200 || hasError(shipGroupLocationResp) || !shipGroupLocationResp.data.response.numFound) {
          return showToast(translate("Something went wrong while fetching nearby stores"))
        } else {
          return shipGroupLocationResp
        }
      } catch (error) {
        console.error(error)
        showToast(translate("Something went wrong while fetching nearby stores"));
      }
    },

    async checkInventory(facilityIds: Array<string>) {
      try {
        const productInventoryResp = await StockService.checkInventory({
          "filters": {
            "productId": this.productIds,
            "facilityId": facilityIds
          },
          "fieldsToSelect": ["atp", "facilityName", "facilityId"],
        });

        if (productInventoryResp.status !== 200 || hasError(productInventoryResp) || !productInventoryResp.data.count) {
          return showToast(translate("Something went wrong while fetching nearby stores"))
        }
        return productInventoryResp.data.docs.filter((store: any) => store.atp > 0)
      } catch (error) {
        console.error(error)
        showToast(translate("Something went wrong while fetching nearby stores"));
      }
    },

    async showStores() {
      try {
        let shipGroupLocationResp: any, storeLookupResp: any;
        if (this.shipGroup.shipmentMethodTypeId === 'STOREPICKUP' && this.shipGroup.selectedShipmentMethodTypeId === 'STOREPICKUP') {
          storeLookupResp = await this.getStores()
        } else {
          shipGroupLocationResp = await this.getLocation()
          storeLookupResp = await this.getStores(shipGroupLocationResp.data.response.docs[0].location)
        }
        const facilityIds = storeLookupResp.data.response.docs.map((store: any) => store.storeCode)
        const storesWithInventory = await this.checkInventory(facilityIds)
        
        storeLookupResp.data.response.docs.map((storeData: any) => {
          const inventoryDetails = storesWithInventory.find((store: any) => store.facilityId === storeData.storeCode);
          if (inventoryDetails) this.nearbyStores.push({ ...inventoryDetails, distance: storeData.dist });
        });
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