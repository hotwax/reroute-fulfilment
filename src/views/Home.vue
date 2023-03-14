<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div v-if="Object.keys(order).length">
        <ion-item class="ion-text-center" lines="none">
          <h1>{{ $t("Your Order") }}</h1>
        </ion-item>
        <ion-card>
          <ion-item lines="none" class="border">
            <ion-label>
              {{ order.customerName }}
              <p>{{ order.id }}</p>
            </ion-label>
            <ion-note slot="end">{{ $filters.formatUtcDate(order.orderDate) }}</ion-note>
          </ion-item>
        </ion-card>
        <div v-for="(shipGroup, index) of order.shipGroup" :key="index">
          <!-- Only show shipGroups having product/items -->
          <ion-card v-if="shipGroup.items.length">
            <ion-item v-for="item of shipGroup.items" :key="item.id" lines="full">
              <ion-thumbnail slot="start">
                <Image :src='getProduct(item.productId).mainImageUrl' />
              </ion-thumbnail>
              <ion-label slot="start">
                <p>{{ item.brandName }}</p>
                <h2>{{ item.name }}</h2>
                <p v-for="(attribute, feature) in ($filters.groupFeatures(getProduct(item.productId).featureHierarchy))" :key="attribute" >
                  <span class="sentence-case">{{ feature }}</span>: {{ attribute }}
                </p>
              </ion-label>
            </ion-item>
            <!-- TODO -->
            <!-- <ion-item>
              <ion-label>
                status description
              </ion-label>
            </ion-item> -->
            <ion-item>
              <ion-label>{{ $t('Delivery method') }}</ion-label>
              <ion-select interface="popover" :value="shipGroup.selectedShipmentMethodTypeId" @ionChange="updateDeliveryMethod($event, shipGroup)">
                <ion-select-option v-for="method in deliveryMethods" :key="method.value" :value="method.value">{{ method.name }}</ion-select-option>
              </ion-select>
            </ion-item>
            <ion-button v-if="shipGroup.selectedShipmentMethodTypeId === 'STOREPICKUP'" @click="updatePickupLocation(shipGroup)" expand="block" fill="outline">{{ $t("Select pickup location")}}</ion-button>
            <ion-item v-else>
              <ion-list v-if="shipGroup.editedShipmentAddress">
                <ion-label>{{ shipGroup.editedShipmentAddress.firstName }} {{ shipGroup.editedShipmentAddress.lastName }}</ion-label>
                <ion-label color="dark">{{ shipGroup.editedShipmentAddress.address1 }} </ion-label>
                <ion-label color="dark">{{ shipGroup.editedShipmentAddress.city }} {{ shipGroup.editedShipmentAddress.stateCode }} {{ shipGroup.editedShipmentAddress.postalCode }}</ion-label>
              </ion-list>
              <ion-list v-else>
                <ion-label>{{ shipGroup.shipTo.postalAddress.toName }}</ion-label>
                <ion-label color="dark">{{ shipGroup.shipTo.postalAddress.address1 }} </ion-label>
                <ion-label color="dark">{{ shipGroup.shipTo.postalAddress.city }} {{ shipGroup.shipTo.postalAddress.stateCode }} {{ shipGroup.shipTo.postalAddress.postalCode }}</ion-label>
              </ion-list>
              <ion-button slot="end" @click="updateShipmentAddress(shipGroup)" color="medium" fill="outline">{{ $t("Edit address") }}</ion-button>
            </ion-item>
            <!-- <ion-item v-if="shipGroup.selectedShipmentMethodTypeId !== 'STOREPICKUP'" lines="none">
              <ion-label>{{ $t("Estimated delivery") }}</ion-label>
              <ion-label slot="end">{{ $t("03/03/2023") }}</ion-label>
            </ion-item> -->
            <ion-item v-if="shipGroup.trackingNumber">
              <ion-label>{{ $t('Tracking code') }}</ion-label>
              <ion-note slot="end">{{ shipGroup.trackingNumber }}</ion-note>
            </ion-item>
            <!-- Disabling the buttons if address or facility is not added or after the changes are saved-->
            <ion-button :disabled="(!shipGroup.editedShipmentAddress && !shipGroup.selectedFacilityId) || areChangesSaved" @click="save(shipGroup)" fill="clear">{{ $t("Save changes") }}</ion-button>
            <ion-button :disabled="(!shipGroup.editedShipmentAddress && !shipGroup.selectedFacilityId) || areChangesSaved" @click="resetChanges(shipGroup)" fill="clear" color="danger">{{ $t("Cancel") }}</ion-button>
          </ion-card>
        </div>
      </div>
      <div v-else class="ion-text-center ion-padding-top">
        <ion-label>{{ $t("Something went wrong while fetching the order details") }}</ion-label>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  alertController,
  IonButton,
  IonCard,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonThumbnail,
  modalController,
} from "@ionic/vue";
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import { mapGetters, useStore } from 'vuex'
import { OrderService } from "@/services/OrderService";
import { translate } from "@/i18n";
import { hasError, showToast } from "@/utils";
import Image from "@/components/Image.vue";
import ShipmentAddressModal from "@/views/ShipmentAddressModal.vue";
import { ProductService } from "@/services/ProductService";
import PickupLocationModal from "./PickupLocationModal.vue";

export default defineComponent({
  name: "Home",
  components: {
    Image,
    IonButton,
    IonCard,
    IonContent,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonSelect,
    IonSelectOption,
    IonThumbnail,
    IonPage,
  },
  data() {
    return {
      order: {} as any,
      products: {} as any,
      productIds: [] as any,
      deliveryMethods: [
        {
          name: 'Store pickup',
          value: 'STOREPICKUP'
        },
        {
          name: 'Shipping',
          value: 'STANDARD'
        }
      ] as any,
      areChangesSaved: false
    }
  },
  computed: {
    ...mapGetters({
      deliveryMethod: 'user/getDeliveryMethod'
    })
  },
  async mounted() {
    await this.getOrder();
  },
  methods: {
    async getOrder() {
      let resp;
      try {
        resp = await OrderService.getOrder(this.$route.params.orderId);
        if (resp.status === 200 && !hasError(resp) && resp.data) {
          this.order = resp.data;
          let productIds: any = new Set();
          this.order.shipGroup.map((group: any) => {
            group.selectedShipmentMethodTypeId = group.shipmentMethodTypeId;
            group.items.map((item: any) => {
              if (item.productId) productIds.add(item.productId);
            })
          })
          this.productIds = [...productIds]
          await this.fetchProducts(this.productIds)
        } else {
          showToast(translate("Order not Found"))
        }
      } catch (error) {
        console.error(error)
        showToast(translate("Something went wrong"))
      }
    },

    async fetchProducts(productIds: any) {
      const productIdFilter = productIds.reduce((filter: string, productId: any) => {
        if (filter !== '') filter += ' OR '
        return filter += productId;
      }, '');

      try {
        const resp = await ProductService.fetchProducts({
          "filters": ['productId: (' + productIdFilter + ')'],
          "viewSize": productIds.length
        })

        if (resp.status === 200 && !hasError(resp) && resp.data) {
          resp.data.response.docs.forEach((product: any) => {
            this.products[product.productId] = product
          });
        }
      } catch (error) {
        console.error(error)
        showToast(translate("Something went wrong"))
      }
    },

    getProduct(productId: string) {
      return this.products[productId] ? this.products[productId] : {}
    },

    async saveShippingAddressChanges(shipGroup: any) {
      let resp
      const payload = {
        "orderId": this.order.id,
        "shipGroupSeqId": shipGroup.shipGroupSeqId,
        "contactMechId": shipGroup.shipTo.postalAddress.id,
        "shipmentMethod": `${this.deliveryMethod}@_NA_`,
        "contactMechPurposeTypeId": "SHIPPING_LOCATION",
        "facilityId": "WH",
        "toName": `${shipGroup.editedShipmentAddress.firstName} ${shipGroup.editedShipmentAddress.lastName}`,
        "address1": shipGroup.editedShipmentAddress.address1,
        "city": shipGroup.editedShipmentAddress.city,
        "stateCode": shipGroup.editedShipmentAddress.stateCode,
        "postalCode": shipGroup.editedShipmentAddress.postalCode,
        "country": shipGroup.editedShipmentAddress.country
      } as any

      if (shipGroup.selectedShipmentMethodTypeId === shipGroup.shipmentMethodTypeId) {
        // In case of address edit, we honour the previously selected delivery method
        payload.shipmentMethod = `${shipGroup.shipmentMethodTypeId}@_NA_`
        payload.isEdited = true
      }

      try {
        resp = await OrderService.updateShippingAddress(payload);
        if (resp.status === 200 && !hasError(resp) && resp.data) {
          this.areChangesSaved = true;
          showToast(translate("Changes saved"))
        } else {
          showToast(translate("Failed to update the shipping addess"))
        }
      } catch (error) {
        console.error(error)
        showToast(translate("Failed to update the shipping addess"))
      }
    },

    async saveFacilityChanges(shipGroup: any) {
      let resp
      const payload = {
        "orderId": this.order.id,
        "shipGroupSeqId": shipGroup.shipGroupSeqId,
        "contactMechId": shipGroup.shipTo.postalAddress.id,
        "shipmentMethod": `STOREPICKUP@_NA_@CARRIER`,
        "contactMechPurposeTypeId": "SHIPPING_LOCATION",
        "facilityId": shipGroup.selectedFacilityId,
      }

      try {
        resp = await OrderService.updateFacility(payload);
        if (resp.status === 200 && !hasError(resp)) {
          this.areChangesSaved = true;
          showToast(translate("Changes saved"))
        } else {
          showToast(translate("Failed to update the pickup store"))
        }
      } catch (error) {
        console.error(error)
        showToast(translate("Failed to update the pickup store"))
      }
    },

    async saveShipmentChanges(shipGroup: any) {
      shipGroup.selectedShipmentMethodTypeId === 'STOREPICKUP' ? this.saveFacilityChanges(shipGroup) : this.saveShippingAddressChanges(shipGroup);   
    },

    updateDeliveryMethod(event: any, shipGroup: any) {
      this.order.shipGroup.map((group: any) => {
        if (group.shipGroupSeqId === shipGroup.shipGroupSeqId) {
          group.selectedShipmentMethodTypeId = event.detail.value;
        }
      })
      // Resetting the previous changes on method change
      this.resetShipmentChanges(shipGroup)
    },

    async updateShipmentAddress(shipGroup: any) {
      const modal = await modalController
        .create({
          component: ShipmentAddressModal,
          // Adding backdropDismiss as false because on dismissing the modal through backdrop,
          // backrop.role returns 'backdrop' giving unexpected result
          backdropDismiss: false,
          componentProps: {
            shipGroup,
          }
        })
      modal.onDidDismiss().then((shipmentAddress) => {
        if (shipmentAddress.role) {
          // role will have the passed data
          shipGroup.editedShipmentAddress = shipmentAddress.role
        }
      });
      return modal.present();
    },

    async updatePickupLocation(shipGroup: any) {
      const modal = await modalController
        .create({
          component: PickupLocationModal,
          // Adding backdropDismiss as false because on dismissing the modal through backdrop,
          // backrop.role returns 'backdrop' giving unexpected result
          backdropDismiss: false,
          componentProps: {
            shipGroup,
            productIds: this.productIds
          }
        })
      modal.onDidDismiss().then((facilityId) => {
        if (facilityId.role) {
          // role will have the passed data
          shipGroup.selectedFacilityId = facilityId.role
        }
      });
      return modal.present();
    },

    async save(shipGroup: any) {
      const message = this.$t("Are you sure you want to save the changes?");
      const alert = await alertController.create({
        header: this.$t("Save changes"),
        message,
        buttons: [
          {
            text: this.$t("Cancel"),
          },
          {
            text: this.$t("Confirm"),
            handler: () => {
              this.saveShipmentChanges(shipGroup);
            }
          }
        ],
      });
      return alert.present();
    },

    // TODO replace it with cancel option
    async resetChanges(shipGroup: any) {
      const message = this.$t("Are you sure you want to reset the changes?");
      const alert = await alertController.create({
        header: this.$t("Reset changes"),
        message,
        buttons: [
          {
            text: this.$t("Cancel"),
          },
          {
            text: this.$t("Confirm"),
            handler: () => {
              this.resetShipmentChanges(shipGroup);
            }
          }
        ],
      });
      return alert.present();
    },

    resetShipmentChanges(shipGroup: any) {
      shipGroup.editedShipmentAddress = null
      shipGroup.selectedFacilityId = ''
    },
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    return { router, store };
  }
});
</script>