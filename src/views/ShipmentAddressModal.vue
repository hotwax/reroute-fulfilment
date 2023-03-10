<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>{{ $t("Shipment address") }}</ion-title>
      <ion-buttons slot="end" @click="closeShipmentModal()">
        <ion-button>
          <ion-icon :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content>
    <ion-list>
      <ion-item>
        <ion-label position="floating">{{ $t("First name") }}</ion-label>
        <ion-input name="firstName" v-model="shipmentAddress.firstName" id="firstName" type="text" required />
      </ion-item>
      <ion-item>
        <ion-label position="floating">{{ $t("Last name") }}</ion-label>
        <ion-input name="lastName" v-model="shipmentAddress.lastName" id="lastName" type="text" required />
      </ion-item>
      <ion-item>
        <ion-label position="floating">{{ $t("Street") }}</ion-label>
        <ion-input name="street" v-model="shipmentAddress.address1" id="address1" type="text" required />
      </ion-item>
      <ion-item>
        <ion-label position="floating">{{ $t("City") }}</ion-label>
        <ion-input name="city" v-model="shipmentAddress.city" id="city" type="text" required />
      </ion-item>
      <ion-item>
        <ion-label>{{ $t("State") }}</ion-label>
        <ion-select interface="popover" :value="shipmentAddress.stateCode"  @ionChange="setState($event)">
          <ion-select-option v-for="state in states" :key="state.geoId" :value="state.geoId" >{{ state.geoName }}</ion-select-option>
        </ion-select>
      </ion-item>
      <ion-item>
        <ion-label position="floating">{{ $t("Zipcode") }}</ion-label>
        <ion-input name="zipcode" v-model="shipmentAddress.postalCode" id="postalCode" required />
      </ion-item>
    </ion-list>
    <div class="ion-text-center">
      <ion-button @click="updateShipmentAddress()">{{ $t("Save shipping address") }}</ion-button>
    </div>
  </ion-content>
</template>

<script lang="ts">
import { 
  IonButton, 
  IonButtons, 
  IonContent, 
  IonHeader, 
  IonIcon, 
  IonItem, 
  IonInput, 
  IonLabel, 
  IonList, 
  IonSelect,
  IonSelectOption,
  IonTitle, 
  IonToolbar, 
  modalController
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { closeOutline } from 'ionicons/icons';
import { useRouter } from "vue-router";
import { useStore } from "@/store";
import { translate } from '@/i18n';
import { hasError, showToast } from '@/utils';
import { OrderService } from '@/services/OrderService';

export default defineComponent({
  name: 'ShipmentModal',
  components: {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonInput,
    IonLabel,
    IonList,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar
  },
  data() {
    return {
      shipmentAddress: {
        firstName: "",
        lastName: "",
        address1: "",
        city: "",
        stateCode: "",
        postalCode: "",
        country: "USA"
      },
      contactMechId: '',
      states: {} as any
    };
  },
  props: ["shipGroup"],
  mounted() {
    this.getAssociatedStates()
  },
  methods: {
    async updateShipmentAddress() {
      if (this.shipmentAddress.firstName !== "" && this.shipmentAddress.lastName !== "" && this.shipmentAddress.address1 !== "" && this.shipmentAddress.city !== "" && this.shipmentAddress.stateCode !== "" && this.shipmentAddress.postalCode !== "") {
        // manually updating as option for updating country is not given in the form
        this.shipmentAddress.country = this.shipGroup.shipTo.postalAddress.country
        this.closeShipmentModal(this.shipmentAddress);
      } else {
        showToast(translate("Please fill all the fields"))
      }
    },

    async getAssociatedStates() {
      try {
        const payload = {
          // Currently giving support for states within the same country only
          // TODO: add support for fetching states from other country

          // Previously countryGeoId was- 
          // "countryGeoId": this.shipGroup.shipTo.postalAddress.countryGeoId,
          // but now the data doesn't source us that, hence, hardcoded
          "countryGeoId": "USA",
          "viewSize": 60
        }
        const resp = await OrderService.getAssociatedStates(payload);
        if (resp.status === 200 && !hasError(resp) && resp.data.stateList.length) {
          this.states = resp.data.stateList.map((state: string) => {
            const stateData = state.split(': ')
            return { 'geoName': stateData[0], 'geoId': stateData[1] }
          });
        } else {
          showToast(translate("Something went wrong, could not fetch the associated states"))
        }
      } catch (error) {
        console.error(error)
        showToast(translate("Something went wrong, could not fetch the associated states"))
      }
    },

    setState(event: any) {
      this.shipmentAddress.stateCode = event.detail.value;
    },

    closeShipmentModal(shipmentAddress?: any) {
      modalController.dismiss({ dismissed: true }, shipmentAddress);
    },
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    return { closeOutline, router, store };
  }
});
</script>