<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="end" @click="closeModal()" >
        <ion-button >
          <ion-icon :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ $t("Select pickup location") }}</ion-title>
    </ion-toolbar>   
  </ion-header> 
  <ion-content>
    <ion-card v-if="shipGroup.shipmentMethodTypeId === 'STOREPICKUP'">
      <ion-card-header>
        <ion-card-title>{{ $t("Current pick up store") }}</ion-card-title>
      </ion-card-header>
      <ion-item lines="none">
        <ion-icon slot="start" :icon="businessOutline" />
        <ion-list>
          <ion-label>{{ shipGroup.shipTo.postalAddress.toName }}</ion-label>
          <ion-label>{{ shipGroup.shipTo.postalAddress.address1 }} </ion-label>
          <ion-label>{{ shipGroup.shipTo.postalAddress.city}} {{ shipGroup.shipTo.postalAddress.country}} {{ shipGroup.shipTo.postalAddress.postalCode}}</ion-label>
        </ion-list>
        <ion-note slot="end">{{ $t("remaining stock") }}</ion-note>
      </ion-item>
    </ion-card>
    <ion-card v-else>
      <ion-card-header>
        <ion-card-title>{{ $t("Current delivery address") }}</ion-card-title>
      </ion-card-header>
      <ion-item lines="none">
        <ion-icon slot="start" :icon="mailOutline" />
        <ion-list>
          <ion-label>{{ shipGroup.shipTo.postalAddress.toName }}</ion-label>
          <ion-label>{{ shipGroup.shipTo.postalAddress.address1 }} </ion-label>
          <ion-label>{{ shipGroup.shipTo.postalAddress.city}} {{ shipGroup.shipTo.postalAddress.country}} {{ shipGroup.shipTo.postalAddress.postalCode}}</ion-label>
        </ion-list>
        <ion-note slot="end">{{ shipGroup.shipmentMethodTypeId }}</ion-note>
      </ion-item>
    </ion-card>
    <ion-radio-group>
      <ion-list>
        <ion-list-header lines="full" color="light">
          <ion-label>{{ $t("Nearby stores") }}</ion-label>
        </ion-list-header>
        <ion-item v-for="(facility, index) in nearbyFacilities()" :key="index">
          <ion-label>{{ $t(facility.storeName) }}</ion-label>
          <ion-radio slot="end" :value="facility.storeName" @click="storeSelected(facility)"/>
        </ion-item>
      </ion-list>
      <ion-list>
        <ion-list-header lines="full" color="light">
          <ion-label>{{ $t("Other stores") }}</ion-label>
        </ion-list-header>
        <ion-item v-for="(facility, index) in otherFacilities()" :key="index">
          <ion-label>{{ $t(facility.storeName) }}</ion-label>
          <ion-radio slot="end" :value="facility.storeName" @click="storeSelected(facility)"/>
        </ion-item>
      </ion-list>
    </ion-radio-group>
  </ion-content>
</template>

<script lang="ts">
import { IonButton, IonButtons, IonCard, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonNote, IonRadio, IonRadioGroup, IonTitle,  IonToolbar,modalController } from '@ionic/vue';
import { defineComponent } from 'vue';
import { businessOutline, closeOutline, mailOutline } from 'ionicons/icons';
import { useRouter } from "vue-router";
import { useStore } from "@/store";
import { mapGetters } from 'vuex';

export default defineComponent({
  name: 'StoreModal',
  components: { IonButton, IonButtons, IonCard, IonCardHeader, IonCardTitle,IonContent, IonHeader, IonIcon, IonItem, IonList, IonListHeader, IonLabel, IonNote, IonRadio, IonRadioGroup, IonTitle,  IonToolbar},
  methods: {
    closeModal () {
      modalController.dismiss({ dismissed: true });
    },
    nearbyFacilities () {
      // TODO: need to optimize code to properly handle the condition to display stores
      let i = 0;
      return Object.values(this.facilities).filter((facility: any) => {
        if (i < 3) {
          i++;
          return facility
        }
      })
    },
    otherFacilities () {
      // TODO: need to optimize code to properly handle the condition to display stores
      let i = 3;
      return Object.values(this.facilities).slice(3).filter((facility: any) => {
        if (i < this.facilities.length - 3) {
          i++;
          return facility
        }
      })
    },
    storeSelected (facility: any) {
      this.closeModal();
    }
  },
  props: ["shipGroup"],
  computed: {
    ...mapGetters({
      facilities: 'facility/getFacilities'
    })
  },
  mounted () {
    this.store.dispatch('facility/fetchFacilities')
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    return { businessOutline, closeOutline, router, store, mailOutline};
  }
});
</script>