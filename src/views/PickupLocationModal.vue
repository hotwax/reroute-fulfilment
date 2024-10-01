<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="end" @click="close()">
        <ion-button>
          <ion-icon :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ $t("Select Pickup Location") }}</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content>
    <ion-accordion-group v-if="!isSearchingEnabled">
      <ion-accordion value="rejectedFacility" v-if="shipGroup.shipmentMethodTypeId === 'STOREPICKUP'">
        <ion-item slot="header" color="light">
          <ion-icon slot="start" :icon="locationOutline"></ion-icon>
          <ion-label>{{ $t("Showing pickup locations near") }} {{ storePickupRejectedFacility.postalCode }}</ion-label>
        </ion-item>
        <ion-item slot="content" lines="none">
          <ion-label slot="start">
            {{ storePickupRejectedFacility.storeName }}
            <p>{{ storePickupRejectedFacility.address1 }}</p>
            <p>{{ storePickupRejectedFacility.address2 }}</p>
            <p>{{ storePickupRejectedFacility.city }}{{ storePickupRejectedFacility.city && storePickupRejectedFacility.state ? ", " : "" }}{{ storePickupRejectedFacility.state }} {{ storePickupRejectedFacility.postalCode }}</p>
          </ion-label>
          <ion-button fill="clear" slot="end" @click="enableSearching">
            {{ $t("Edit Zip Code") }}
          </ion-button>
        </ion-item>
      </ion-accordion>
      <ion-accordion value="rejectedFacility" v-else>
        <ion-item slot="header" color="light">
          <ion-icon slot="start" :icon="locationOutline"></ion-icon>
          <ion-label>{{ $t("Showing pickup locations near") }} {{ shipGroup.shipTo.postalAddress.postalCode }}</ion-label>
        </ion-item>
        <ion-item slot="content" lines="none">
          <ion-label slot="start">
            {{ shipGroup.shipTo.postalAddress.toName }}
            <p>{{ shipGroup.shipTo.postalAddress.address1 }}</p>
            <p>{{ shipGroup.shipTo.postalAddress.address2 }}</p>
            <p>{{ shipGroup.shipTo.postalAddress.city }}{{ shipGroup.shipTo.postalAddress.city && shipGroup.shipTo.postalAddress.stateCode ? ", " : "" }}{{ shipGroup.shipTo.postalAddress.stateCode }} {{ shipGroup.shipTo.postalAddress.country }} {{ shipGroup.shipTo.postalAddress.postalCode }}</p>
          </ion-label>
          <ion-button fill="clear" slot="end" @click="enableSearching">
            {{ $t("Edit Zip Code") }}
          </ion-button>
        </ion-item>
      </ion-accordion>
    </ion-accordion-group>
    <form
      v-else
      @submit.prevent="searchStores()"
    >
      <ion-searchbar :placeholder="$t('Search Zip Code')" v-model="queryString" />
      <ion-button class="ion-margin" type="submit" expand="block">{{ $t("Find Stores") }}</ion-button>
    </form>

    <div v-if="isLoadingStores" class="empty-state">
      <ion-item lines="none">
        <ion-spinner name="crescent" slot="start" />
        {{ $t("Fetching stores.") }}
      </ion-item>
    </div>
    <ion-list v-else-if="nearbyStores.length">
      <ion-list-header lines="full" color="light">
        <ion-label>{{ $t("Nearby Stores") }}</ion-label>
      </ion-list-header>
      <ion-radio-group v-model="selectedFacility">
        <ion-item v-for="store of nearbyStores" :key="store.facilityId">
          <ion-radio :value="store" label-placement="end">
            <ion-label>
              {{ store.facilityName }}
              <p>{{ store.address1 }}</p>
              <p>{{ store.address2 }}</p>
              <p>{{ store.city }}{{ store.city && store.state ? ", " : "" }}{{ store.state }} {{ store.postalCode }}</p>
            </ion-label>
            <!-- Showing store distance in miles -->
            <ion-label v-if="store.distance">{{ store.distance }} {{ $t("miles") }}</ion-label>
          </ion-radio>
        </ion-item>
      </ion-radio-group>
    </ion-list>
    <ion-item v-else-if="errorMessage" lines="none" class="ion-text-center">
      <ion-label>{{ $t(errorMessage) }}</ion-label>
    </ion-item>

    <ion-fab v-if="nearbyStores.length" vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button :disabled="Object.keys(selectedFacility).length == 0 || selectedFacility.facilityId == shipGroup.facilityId" @click="updateFacility()">
        <ion-icon :icon="saveOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-content>
</template>

<script lang="ts">
import {
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonRadio,
  IonRadioGroup,
  IonSearchbar,
  IonSpinner,
  IonTitle,
  IonToolbar,
  modalController
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { closeOutline, locationOutline, saveOutline } from 'ionicons/icons';
import { useRouter } from "vue-router";
import { useStore } from "@/store";
import { FacilityService } from '@/services/FacilityService';
import { StockService } from '@/services/StockService';
import { hasError } from '@/utils';
import { UtilityService } from '@/services/UtilityService';

export default defineComponent({
  name: 'PickupLocationModal',
  components: {
    IonAccordion,
    IonAccordionGroup,
    IonButton,
    IonButtons,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonItem,
    IonList,
    IonListHeader,
    IonLabel,
    IonRadio,
    IonRadioGroup,
    IonSearchbar,
    IonSpinner,
    IonTitle,
    IonToolbar
  },
  data() {
    return {
      loader: null as any,
      nearbyStores: [] as any,
      facilityId: '',
      selectedFacility: {},
      isSearchingEnabled: false,  // displays searchbar on the UI
      queryString: "",
      isLoadingStores: false,   // displays spinner on UI
      errorMessage: ""
    }
  },
  watch: {
    queryString: {
      async handler() {
        if (!this.queryString.trim().length) {
          this.isLoadingStores = true;
          this.nearbyStores = [];
          await this.getPickupStores()
          this.isLoadingStores = false;
        }
      },
    },
  },
  props: ["shipGroup", "storePickupRejectedFacility"],
  async mounted() {
    this.isLoadingStores = true

    if(!this.storePickupRejectedFacility?.storeCode) {
      this.isSearchingEnabled = true
    }

    await this.getPickupStores()
    this.isLoadingStores = false
  },
  methods: {
    async getStores(point?: string) {
      let payload = {
        "viewSize": process.env.VUE_APP_VIEW_SIZE,
        "filters": ["storeType: RETAIL_STORE OR WAREHOUSE", "pickup_pref: true"]
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

    async getDeliveryAddressGeoLocation(postalCode?: string) {
      if(!postalCode) {
        return '';
      }

      const truncatedPostalcode = postalCode.replace(/^0+/, '');
      const query = postalCode === truncatedPostalcode ? `postcode:${postalCode}` : `postcode:${postalCode} OR ${truncatedPostalcode}`;

      try {
        const shipGroupLocationResp = await UtilityService.getGeoLocation({
          "json": {
            "query": query
          }
        })

        if (shipGroupLocationResp.status !== 200 || hasError(shipGroupLocationResp) || !shipGroupLocationResp.data.response.numFound) {
          return '';
        }
        return shipGroupLocationResp.data.response.docs[0].location
      } catch (error) {
        console.error(error)
        return '';
      }
    },

    async checkInventory(facilityIds: Array<string>, productIds: Array<string>) {
      let isScrollable = true, viewSize = 250, viewIndex = 0, total = 0;
      let productInventoryResp = [] as any;

      try {
        while(isScrollable) {
          const resp = await StockService.checkInventory({
            "filters": {
              "productId": productIds,
              "facilityId": facilityIds
            },
            "fieldsToSelect": ["productId", "atp", "facilityName", "facilityId"],
            viewSize,
            viewIndex
          });

          if(!hasError(resp) && resp.data.count) {
            if(!productInventoryResp.length) {
              productInventoryResp = resp.data.docs
              total = resp.data.count;
            } else {
              productInventoryResp = productInventoryResp.concat(resp.data.docs)
            }
            if(productInventoryResp.length >= total) isScrollable = false;
            viewIndex++;
          }
        }
        return productInventoryResp.filter((store: any) => store.atp > 0)
      } catch (error) {
        console.error(error)
      }
    },

    getStoreDistance(store: any) {
      return (store.dist || store.dist >= 0) && store.dist !== 'Infinity'
      ? `${parseFloat((store.dist).toFixed(1)).toLocaleString()}`
      : "";
    },

    enableSearching() {
      this.isSearchingEnabled = true
      this.nearbyStores = []
    },

    async getPickupStores() {
      try {
        let stores;
        if (this.shipGroup.shipmentMethodTypeId === 'STOREPICKUP') {
          stores = await this.getStores(this.storePickupRejectedFacility ? this.storePickupRejectedFacility?.latlon : '')
        } else {
          const location = await this.getDeliveryAddressGeoLocation(this.shipGroup.shipTo.postalAddress.postalCode)
          if (!location) {
            this.errorMessage = "Zip code not found or invalid"
            return;
          }
          stores = await this.getStores(location)
        }

        if (!stores?.length) {
          this.errorMessage = "No stores found"
          return;
        }

        const facilityIds = stores.map((store: any) => store.storeCode)
        const productIds = [...new Set(this.shipGroup.items.map((item: any) => item.productId))] as any;
        const storesWithInventory = await this.checkInventory(facilityIds, productIds)

        if (!storesWithInventory?.length) {
          this.errorMessage = "Inventory not available at any nearby store, please select alternate delivery method"
          return;
        }

        stores.map((storeData: any) => {
          const inventoryDetails = storesWithInventory.filter((store: any) => store.facilityId === storeData.storeCode);
          if (inventoryDetails.length === productIds.length) this.nearbyStores.push({...storeData, ...inventoryDetails[0], distance: this.getStoreDistance(storeData) });
        });
      } catch (error) {
        this.errorMessage = "No stores found"
        console.error(error)
      }
    },

    updateFacility() {
      this.close(this.selectedFacility);
    },

    close(selectedFacility?: any) {
      modalController.dismiss({ dismissed: true }, selectedFacility);
    },

    async searchStores() {
      // If the searching is already in progress then clicking the button multiple should not initiate the search again
      if(this.isLoadingStores) {
        return;
      }

      if(!this.queryString.trim().length) {
        this.errorMessage = "Search for a postal code to check for pickup stores"
        return;
      }

      this.isLoadingStores = true;
      this.nearbyStores = []

      let stores = []
      const location = await this.getDeliveryAddressGeoLocation(this.queryString.trim())
      if (!location) {
        this.isLoadingStores = false;
        this.errorMessage = "Zip code not found or invalid"
        return;
      }

      stores = await this.getStores(location)

      if (!stores?.length) {
        this.isLoadingStores = false;
        this.errorMessage = "No stores found"
        return;
      }

      const facilityIds = stores.map((store: any) => store.storeCode)
      const productIds = [...new Set(this.shipGroup.items.map((item: any) => item.productId))] as any;
      const storesWithInventory = await this.checkInventory(facilityIds, productIds)

      if (!storesWithInventory?.length) {
        this.isLoadingStores = false;
        this.errorMessage = "Inventory not available at any nearby store, please select alternate delivery method"
        return;
      }

      stores.map((storeData: any) => {
        const inventoryDetails = storesWithInventory.filter((store: any) => store.facilityId === storeData.storeCode);
        if (inventoryDetails.length === productIds.length) this.nearbyStores.push({...storeData, ...inventoryDetails[0], distance: this.getStoreDistance(storeData) });
      });

      this.isLoadingStores = false;
    }
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    return { closeOutline, locationOutline, saveOutline, router, store };
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

ion-content {
  --padding-bottom: 80px;
}

.empty-state {
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
}
</style>