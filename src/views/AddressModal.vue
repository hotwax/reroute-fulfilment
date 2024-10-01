<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>{{ $t("Shipping Address") }}</ion-title>
      <ion-buttons slot="end" @click="close()">
        <ion-button>
          <ion-icon :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content>
    <ion-list>
      <ion-item>
        <ion-input :label="$t('First Name')" class="ion-text-right" name="firstName" v-model="address.firstName" id="firstName" type="text"/>
      </ion-item>
      <ion-item>
        <ion-input :label="$t('Last Name')" class="ion-text-right" name="lastName" v-model="address.lastName" id="lastName" type="text"/>
      </ion-item>
      <ion-item>
        <ion-input :label="$t('Address')" class="ion-text-right" name="street" v-model="address.address1" id="address1" type="text"/>
      </ion-item>
      <ion-item>
        <ion-input :label="$t('Apartment, Suite, etc.')" class="ion-text-right" name="street" v-model="address.address2" id="address2" type="text"/>
      </ion-item>
      <ion-item>
        <ion-input :label="$t('City')" class="ion-text-right" name="city" v-model="address.city" id="city" type="text"/>
      </ion-item>
      <ion-item>
        <ion-select :label="$t('State')" interface="popover" v-model="address.stateProvinceGeoId">
          <ion-select-option v-for="state in states" :key="state.geoId" :value="state.geoId" >{{ state.geoName }}</ion-select-option>
        </ion-select>
      </ion-item>
      <ion-item>
        <ion-input :label="$t('Zip Code')" class="ion-text-right" name="zipcode" v-model="address.postalCode" id="postalCode"/>
      </ion-item>
    </ion-list>
    <div class="ion-text-center">
      <ion-button @click="updateAddress()">{{ $t("Save shipping address") }}</ion-button>
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
  IonList, 
  IonSelect,
  IonSelectOption,
  IonTitle, 
  IonToolbar, 
  modalController,
  loadingController
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { closeOutline } from 'ionicons/icons';
import { useRouter } from "vue-router";
import { useStore } from "@/store";
import { translate } from '@/i18n';
import { hasError, showToast } from '@/utils';
import { UtilityService } from '@/services/UtilityService';

export default defineComponent({
  name: 'AddressModal',
  components: {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonInput,
    IonList,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar
  },
  data() {
    return {
      address: {
        firstName: "",
        lastName: "",
        address1: "",
        address2: "",
        city: "",
        stateProvinceGeoId: "",
        postalCode: "",
        countryGeoId: ""
      } as any,
      contactMechId: '',
      states: [] as any,
      loader: null as any
    };
  },
  props: ["shipGroup", "token"],
  async mounted() {
    this.presentLoader()
    await this.getAssociatedStates()
    if (this.shipGroup.shipmentMethodTypeId != 'STOREPICKUP') this.prepareAddress();
    this.dismissLoader()
  },
  methods: {
    async updateAddress() {
      const hasEmptyValues = Object.keys(this.address).some((field: string) => {
        this.address[field] = this.address[field].trim();
        return !this.address[field] && field !== 'address2';
      })
      if (hasEmptyValues) return showToast(translate("Please fill all the fields"))
      const state = this.states.find((state: any) => state.geoId === this.address.stateProvinceGeoId);
      // In some cases, we get a stateProvinceGeoId that does not exist in data, thus state is not displayed on the UI but originally the field has information thus toast of empty field is not displayed
      // thus added a check that if the geoCode is not found in the states fetched from the server, do not stop the address update process and pass the same state that was previously in the address.
      this.address.stateCode = state?.geoCode || this.address.stateProvinceGeoId;
      this.close(this.address);
    },
    prepareAddress() {
      if(this.shipGroup?.updatedAddress) {
        this.address = this.shipGroup.updatedAddress
        return;
      }

      this.address.address1 = this.shipGroup.shipTo.postalAddress.address1
      this.address.address2 = this.shipGroup.shipTo.postalAddress.address2
      this.address.city = this.shipGroup.shipTo.postalAddress.city
      this.address.postalCode = this.shipGroup.shipTo.postalAddress.postalCode
      this.address.stateProvinceGeoId = this.shipGroup.shipTo.postalAddress.stateProvinceGeoId
    
      if (this.shipGroup.shipTo.postalAddress.toName) {
        const toNameSplit = this.shipGroup.shipTo.postalAddress.toName.split(" ");
        toNameSplit.length > 0 && (this.address.firstName = toNameSplit[0]);
        toNameSplit.length > 1 && (this.address.lastName = toNameSplit[1]);
      }
    },
    async getAssociatedStates() {
      try {
        const payload = {
          "token": this.token,
          "countryGeoId": this.shipGroup.shipTo.postalAddress.countryGeoId,
          "viewSize": process.env.VUE_APP_VIEW_SIZE
        }
        const resp = await UtilityService.getAssociatedStates(payload);
        if (!hasError(resp)) {
          this.states = resp.data.states;
          this.address.countryGeoId = resp.data.countryGeoId;
        }
      } catch (error) {
        console.error(error)
      }
    },

    close(address?: any) {
      modalController.dismiss({ dismissed: true }, address);
    },
    async presentLoader() {
      this.loader = await loadingController
        .create({
          message: this.$t("Fetching address")
        });
      await this.loader.present();
    },
    dismissLoader() {
      if (this.loader) {
        this.loader.dismiss();
        this.loader = null;
      }
    },
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    return { closeOutline, router, store };
  }
});
</script>

<style>
/* Removes the background color on autofill of input fields */
input:-webkit-autofill,
input:-webkit-autofill:focus {
  transition: background-color 0s 600000s, color 0s 600000s !important;
}
</style>