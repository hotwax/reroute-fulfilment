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
    <ion-card>
      <ion-item lines="none">
        <ion-label>{{ $t("Showing pickup locations near") }}</ion-label>
      </ion-item>
      <ion-item v-if="shipGroup.shipmentMethodTypeId === 'STOREPICKUP'">
        <ion-label color="dark">{{ shipGroup.facilityName }}</ion-label>
      </ion-item>
      <ion-item v-else>
        <ion-list>
          <ion-label>{{ shipGroup.shipTo.postalAddress.toName }}</ion-label>
          <ion-label color="dark">{{ shipGroup.shipTo.postalAddress.address1 }} </ion-label>
          <ion-label color="dark">{{ shipGroup.shipTo.postalAddress.city }} {{ shipGroup.shipTo.postalAddress.country }} {{ shipGroup.shipTo.postalAddress.postalCode }}</ion-label>
        </ion-list>
      </ion-item>
    </ion-card>
    <ion-radio-group v-if="nearbyStores.length" v-model="facilityId">
      <ion-list>
        <ion-list-header lines="full" color="light">
          <ion-label>{{ $t("Nearby stores") }}</ion-label>
        </ion-list-header>
        <ion-item v-for="store of nearbyStores" :key="store.facilityId" lines="none">
          <ion-label>{{ store.facilityName }}</ion-label>
          <ion-label slot="end">distance</ion-label>
          <ion-radio :value="store.facilityId" slot="end" />
        </ion-item>
      </ion-list>
    </ion-radio-group>
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
import { showToast } from '@/utils';

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
      nearbyStores: {} as any,
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
        let shipGroupLocationResp
        if (this.shipGroup.shipmentMethodTypeId === 'STOREPICKUP' && this.shipGroup.selectedShipmentMethodTypeId === 'STOREPICKUP') {
          shipGroupLocationResp = await FacilityService.getNearByStores({
            "viewSize": 50,
            "filters": ["storeType: RETAIL_STORE"],
            "sortBy": "storeName asc",
          })

          const facilityIds = shipGroupLocationResp.data.response.docs.map((store: any) => store.storeCode)
          const productInventoryResp = await StockService.checkInventory({
            "filters": {
              "productId": this.productIds,
              "facilityId": facilityIds
            },
            "fieldsToSelect": ["atp", "facilityName", "facilityId"],
          });
          this.nearbyStores = productInventoryResp.data.docs.filter((store: any) => store.atp > 0)
        } else {
          shipGroupLocationResp = await FacilityService.getLatLong({
            "json": {
              "query": `postcode: ${this.shipGroup.shipTo.postalAddress.postalCode}`
            }
          })
          const storeLookupResp = await FacilityService.getNearByStores({
            "viewSize": 50,
            "filters": ["storeType: RETAIL_STORE"],
            // "point": shipGroupLocationResp.data.response.docs[0].location,
            "point": "25.78,-80.36",
            "distance": 50,
            "fieldsToSelect": ["storeCode", "storeName", "dist"]
          })
          const facilityIds = storeLookupResp.data.response.docs.map((store: any) => store.storeCode)
          const productInventoryResp = await StockService.checkInventory({
            "filters": {
              "productId": this.productIds,
              "facilityId": facilityIds
            },
            "fieldsToSelect": ["atp", "facilityName", "facilityId"],
          });
          this.nearbyStores = productInventoryResp.data.docs.filter((store: any) => store.atp > 0)
          console.log('this.nearbyStores', this.nearbyStores)
        }
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
    },
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    return { closeOutline, router, store };
  }
});
</script>