<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="end" @click="close()">
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
          <ion-label color="dark">{{ shipGroup.shipTo.postalAddress.city }} {{ shipGroup.shipTo.postalAddress.stateCode }} {{ shipGroup.shipTo.postalAddress.country }} {{ shipGroup.shipTo.postalAddress.postalCode }}</ion-label>
        </ion-list>
      </ion-item>
    </ion-card>
    <ion-list v-if="nearbyStores.length">
      <ion-list-header lines="full" color="light">
        <ion-label>{{ $t("Nearby stores") }}</ion-label>
      </ion-list-header>
      <ion-radio-group v-model="selectedFacility">
        <ion-item v-for="store of nearbyStores" :key="store.facilityId">
          <ion-radio :value="store">
              <ion-label>{{ store.facilityName }}</ion-label>
              <!-- Showing store distance in miles -->
              <ion-label v-if="store.distance">{{ store.distance }} {{ $t("mi") }}</ion-label>
          </ion-radio>
        </ion-item>
      </ion-radio-group>
    </ion-list>
    <ion-item v-else lines="none" class="ion-text-center">
      <ion-label>{{ $t("No nearby stores found") }}</ion-label>
    </ion-item>
    <!-- Only show select button if there are stores to select from -->
    <div v-if="nearbyStores.length" class="ion-text-center">
      <ion-button :disabled="Object.keys(selectedFacility).length == 0 || selectedFacility.facilityId == shipGroup.facilityId"  @click="updateFacility()">{{ $t("Select pickup location") }}</ion-button>
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
  loadingController,
  modalController
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { closeOutline } from 'ionicons/icons';
import { useRouter } from "vue-router";
import { useStore } from "@/store";
import { FacilityService } from '@/services/FacilityService';
import { StockService } from '@/services/StockService';
import { hasError } from '@/utils';
import { UtilityService } from '@/services/UtilityService';

export default defineComponent({
  name: 'PickupLocationModal',
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
      loader: null as any,
      nearbyStores: [] as any,
      facilityId: '',
      selectedFacility: {}
    }
  },
  props: ["shipGroup"],
  async mounted() {
    await this.presentLoader()
    await this.getPickupStores();
    this.dismissLoader()
    
  },
  methods: {
    async presentLoader() {
      this.loader = await loadingController
        .create({
          message: this.$t("Fetching stores."),
          translucent: true,
        });
      await this.loader.present();
    },
    dismissLoader() {
      if (this.loader) {
        this.loader.dismiss();
        this.loader = null;
      }
    },
    async getStores(point?: string) {
      let payload = {
        "viewSize": process.env.VUE_APP_VIEW_SIZE,
        "filters": ["storeType: RETAIL_STORE"]
      } as any

      if (point) {
        payload.point = point
      }
      
      try {
        const storeLookupResp = await FacilityService.getStores(payload)
        if (storeLookupResp.status !== 200 || hasError(storeLookupResp) || !storeLookupResp.data.response.numFound) {
          return [];
        } 
        return storeLookupResp.data.response.docs
      } catch (error) {
        console.error(error)
      }
    },

    async getDeliveryAddressGeoLocation() {
      try {
        const shipGroupLocationResp = await UtilityService.getGeoLocation({
          "json": {
            "query": `postcode: ${this.shipGroup.shipTo.postalAddress.postalCode}`
          }
        })

        if (shipGroupLocationResp.status !== 200 || hasError(shipGroupLocationResp) || !shipGroupLocationResp.data.response.numFound) {
          return '';
        }
        return shipGroupLocationResp.data.response.docs[0].location
      } catch (error) {
        console.error(error)
      }
    },

    async checkInventory(facilityIds: Array<string>) {
      const productIds = this.shipGroup.items.map((item: any) => item.productId)
      let isScrollable = true, viewSize = 100, total = 0;
      let productInventoryResp = [] as any;

      try {
        while(isScrollable) {
          const resp = await StockService.checkInventory({
            "filters": {
              "productId": productIds,
              "facilityId": facilityIds
            },
            "fieldsToSelect": ["productId", "atp", "facilityName", "facilityId"],
            viewSize
          });

          if(!hasError(resp) && resp.data.count) {
            if(!productInventoryResp.length) {
              productInventoryResp = resp.data.docs
              total = resp.data.count;
            } else {
              productInventoryResp = productInventoryResp.concat(resp.data.docs)
            }
            if(productInventoryResp >= total) isScrollable = false;
          }
        }
        return productInventoryResp.filter((store: any) => store.atp > 0)
      } catch (error) {
        console.error(error)
      }
    },

    async getPickupStores() {
      try {
        let stores;
        if (this.shipGroup.shipmentMethodTypeId === 'STOREPICKUP') {
          // shipgroup is in brokering queue in this case so we do not
          // have any facility hence, all the stores are fetched
          stores = await this.getStores()
        } else {
          const location = await this.getDeliveryAddressGeoLocation()
          if (!location) return;
          stores = await this.getStores(location)
        }

        if (!stores?.length) return;

        const facilityIds = stores.map((store: any) => store.storeCode)
        const storesWithInventory = await this.checkInventory(facilityIds)

        if (!storesWithInventory?.length) return;
        const productIds = this.shipGroup.items.map((item: any) => item.productId)

        stores.map((storeData: any) => {
          const inventoryDetails = storesWithInventory.filter((store: any) => store.facilityId === storeData.storeCode);
          if (inventoryDetails.length === productIds.length) this.nearbyStores.push({...storeData, ...inventoryDetails[0], distance: storeData.dist });
        });
      } catch (error) {
        console.error(error)
      }
    },

    updateFacility() {
      this.close(this.selectedFacility);
    },

    close(selectedFacility?: any) {
      modalController.dismiss({ dismissed: true }, selectedFacility);
    }
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    return { closeOutline, router, store };
  }
});
</script>

<style scoped>
/* Styling to add the facility name and its display side by side as ion-radio label */
ion-radio::part(label) {
  display: flex;
  justify-content: space-between;
  width: 100%
}
</style>