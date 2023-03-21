<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>{{ $t("Shipping address") }}</ion-title>
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
        <ion-label position="floating">{{ $t("First name") }}</ion-label>
        <ion-input name="firstName" v-model="address.firstName" id="firstName" type="text"/>
      </ion-item>
      <ion-item>
        <ion-label position="floating">{{ $t("Last name") }}</ion-label>
        <ion-input name="lastName" v-model="address.lastName" id="lastName" type="text"/>
      </ion-item>
      <ion-item>
        <ion-label position="floating">{{ $t("Street") }}</ion-label>
        <ion-input name="street" v-model="address.address1" id="address1" type="text"/>
      </ion-item>
      <ion-item>
        <ion-label position="floating">{{ $t("City") }}</ion-label>
        <ion-input name="city" v-model="address.city" id="city" type="text"/>
      </ion-item>
      <ion-item>
        <ion-label>{{ $t("State") }}</ion-label>
        <ion-select interface="popover" v-model="address.stateCode">
          <ion-select-option v-for="state in states" :key="state.geoId" :value="state.geoId" >{{ state.geoName }}</ion-select-option>
        </ion-select>
      </ion-item>
      <ion-item>
        <ion-label position="floating">{{ $t("Zipcode") }}</ion-label>
        <ion-input name="zipcode" v-model="address.postalCode" id="postalCode"/>
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
import { UtilityService } from '@/services/UtilityService';

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
      address: {
        firstName: "",
        lastName: "",
        address1: "",
        city: "",
        stateCode: "",
        postalCode: "",
        country: this.shipGroup.shipTo.postalAddress.country
      } as any,
      contactMechId: '',
      states: {} as any
    };
  },
  props: ["shipGroup"],
  mounted() {
    this.getAssociatedStates()
  },
  methods: {
    async updateAddress() {
      const hasEmptyValues = Object.keys(this.address).some((field: string) => {
        this.address[field] = this.address[field].trim();
        return !this.address[field];
      })
      if (hasEmptyValues) return showToast(translate("Please fill all the fields"))
      this.close(this.address);
    },

    async getAssociatedStates() {
      try {
        const payload = {
          "countryGeoId": this.shipGroup.shipTo.postalAddress.countryGeoId,
          "viewSize": process.env.VUE_APP_VIEW_SIZE
        }
        const resp = await UtilityService.getAssociatedStates(payload);
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

    close(address?: any) {
      modalController.dismiss({ dismissed: true }, address);
    },
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    return { closeOutline, router, store };
  }
});
</script>