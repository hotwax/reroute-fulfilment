<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start" @click="closeModal()">
        <ion-button>
          <ion-icon :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate("Shipping address") }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <div v-if="isLoading" class="empty-state">
      <ion-spinner name="crescent" />
      <ion-label>{{ translate("Loading address.") }}</ion-label>
    </div>
    <template v-else>
      <ion-list>
        <ion-item>
          <ion-input :label="translate('First name')" class="ion-text-right" name="firstName" v-model="address.firstName" id="firstName" type="text"/>
        </ion-item>
        <ion-item>
          <ion-input :label="translate('Last name')" class="ion-text-right" name="lastName" v-model="address.lastName" id="lastName" type="text"/>
        </ion-item>
        <ion-item>
          <ion-input :label="translate('Street')" class="ion-text-right" name="street" v-model="address.address1" id="address1" type="text"/>
        </ion-item>
        <ion-item>
          <ion-input :label="translate('City')" class="ion-text-right" name="city" v-model="address.city" id="city" type="text"/>
        </ion-item>
        <ion-item>
          <ion-select :label="translate('State')" :placeholder="translate('Select')" interface="popover" v-model="address.stateProvinceGeoId">
            <ion-select-option v-for="state in states" :key="state.geoId" :value="state.geoId" >{{ state.geoName }}</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-input :label="translate('Zipcode')" class="ion-text-right" name="zipcode" v-model="address.postalCode" id="postalCode"/>
        </ion-item>
      </ion-list>
      <div class="ion-text-center ion-margin">
        <ion-button @click="updateAddress()">{{ translate("Save shipping address") }}</ion-button>
      </div>
    </template>
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
  IonSpinner,
  IonTitle, 
  IonToolbar, 
  modalController,
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { closeOutline } from 'ionicons/icons';
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
    IonLabel,
    IonList,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonTitle,
    IonToolbar
  },
  data() {
    return {
      address: {
        firstName: "",
        lastName: "",
        address1: "",
        city: "",
        stateProvinceGeoId: "",
        postalCode: "",
        countryGeoId: ""
      } as any,
      contactMechId: '',
      states: [] as any,
      isLoading: false
    };
  },
  props: ["shipGroup", "token", "updatedAddress"],
  async mounted() {
    this.isLoading = true;
    await this.getAssociatedStates()
    this.prepareAddress();
    this.isLoading = false;
  },
  methods: {
    async updateAddress() {
      const hasEmptyValues = Object.keys(this.address).some((field: string) => {
        this.address[field] = this.address[field].trim();
        return !this.address[field];
      })
      if (hasEmptyValues) return showToast(translate("Please fill all the fields"))
      const state = this.states.find((state: any) => state.geoId === this.address.stateProvinceGeoId);
      // In some cases, we get a stateProvinceGeoId that does not exist in data, thus state is not displayed on the UI but originally the field has information thus toast of empty field is not displayed
      // thus added a check that if the geoCode is not found in the states fetched from the server, do not stop the address update process and pass the same state that was previously in the address.
      this.address.stateCode = state?.geoCode || this.address.stateProvinceGeoId;
      this.closeModal(this.address);
    },
    prepareAddress() {
      if(this.updatedAddress.address1) {
        this.address = this.updatedAddress
        return;
      }

      this.address.address1 = this.shipGroup.shipTo.postalAddress.address1
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

    closeModal(address?: any) {
      modalController.dismiss({ dismissed: true, updatedAddress: address });
    },
  },
  setup() {
    const store = useStore();
    return {
      closeOutline,
      store,
      translate
    };
  }
});
</script>