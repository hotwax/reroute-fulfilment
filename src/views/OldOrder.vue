<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <main>
        <div v-if="Object.keys(order).length">
          <ion-item class="ion-text-center" lines="none">
            <h1>{{ translate("Your Order") }}</h1>
          </ion-item>
          <ion-card>
            <ion-item lines="none" class="border">
              <ion-label>
                {{ order.customerName }}
                <p>{{ order.id }}</p>
              </ion-label>
              <ion-note slot="end">{{ $filters.formatDate(order.orderDate) }}</ion-note>
            </ion-item>
          </ion-card>

          <div v-if="order.statusId !== 'ORDER_CANCELLED' && order.shipGroup.length > 0" >
            <ion-card v-for="(shipGroup, index) of order.shipGroup" :key="index">
              <ion-item lines="full">
                <ion-label>{{ translate("was unable to prepare your order. Please select alternate options.", { facilityName: getStoreName(originFacilityId) }) }}</ion-label>
              </ion-item>

              <ion-item lines="none">
                <ion-select :label="translate('Delivery method')" :disabled="!hasPermission(Actions.APP_SHPGRP_DLVRMTHD_UPDATE)" interface="popover" :value="shipGroup.selectedShipmentMethodTypeId" @ionChange="updateDeliveryMethod($event, shipGroup)">
                  <ion-select-option v-for="method in deliveryMethods" :key="method.value" :value="method.value">{{ method.name }}</ion-select-option>
                </ion-select>
              </ion-item>

              <ion-segment v-if="isSplitEnabled && nearbyStores.length" @ionChange="segmentChanged($event)" v-model="selectedSegment">
                <ion-segment-button value="together">
                  <ion-label>{{ translate("Together") }}</ion-label>
                </ion-segment-button>
                <ion-segment-button value="separate">
                  <ion-label>{{ translate("Separate") }}</ion-label>
                </ion-segment-button>
              </ion-segment>
              <ion-item v-else>
                <ion-label>{{ translate("These products are not available at a single store for pickup. Please select alternate options for items individually.") }}</ion-label>
              </ion-item>

              <ion-button expand="block" class="ion-margin" fill="outline">
                <ion-icon :icon="colorWandOutline" slot="start" />
                {{ translate("Suggest store") }}
              </ion-button>

              <ion-item lines="full">
                <ion-label>
                  <p>{{ translate("We'll try to find a location with the most items in stock.") }}</p>
                </ion-label>
              </ion-item>

              <ion-item v-show="item.status !== 'ITEM_CANCELLED'" v-for="item of shipGroup.items" :key="item.id" lines="full">
                <ion-thumbnail slot="start">
                  <Image :src='getProduct(item.productId).mainImageUrl' />
                </ion-thumbnail>
                <ion-label>
                  {{ item.name }}
                  <p v-for="(attribute, feature) in ($filters.groupFeatures(getProduct(item.productId).featureHierarchy))" :key="attribute" >
                    <span class="sentence-case">{{ feature }}</span>: {{ attribute }}
                  </p>
                </ion-label>

                <ion-button v-if="selectedSegment === 'separate' && shipGroup.selectedShipmentMethodTypeId === 'STOREPICKUP'" slot="end" fill="clear">
                  <ion-icon :icon="item.selectedFacilityId ? storefrontOutline : addOutline" slot="icon-only" />
                </ion-button>
              </ion-item>

              <ion-item v-if="shipGroup.selectedShipmentMethodTypeId === 'STOREPICKUP' && shipGroup.selectedFacility">
                <ion-label>
                  {{ shipGroup.selectedFacility.facilityName }}
                  <p>{{ shipGroup.selectedFacility.address1 }}</p>
                  <p>{{ shipGroup.selectedFacility.city }} {{ shipGroup.selectedFacility.stateCode }} {{ shipGroup.shipTo.postalAddress.country }} {{ shipGroup.selectedFacility.postalCode }}</p>
                </ion-label>
              </ion-item>
              <ion-item v-else-if="shipGroup.selectedShipmentMethodTypeId !== 'STOREPICKUP' && shipGroup.updatedAddress">
                <ion-label>
                  {{ shipGroup.updatedAddress.firstName }} {{ shipGroup.updatedAddress.lastName }}
                  <p>{{ shipGroup.updatedAddress.address1 }}</p>
                  <p>{{ shipGroup.updatedAddress.city }} {{ shipGroup.updatedAddress.stateCode }} {{ shipGroup.updatedAddress.postalCode }}</p>
                </ion-label>
              </ion-item>

              <ion-button v-if="shipGroup.selectedShipmentMethodTypeId === 'STOREPICKUP' && selectedSegment === 'together'" :disabled="!hasPermission(Actions.APP_SHPGRP_PCKUP_UPDATE)" @click="updatePickupLocation(shipGroup, true)" expand="block" fill="outline" class="ion-margin">{{ shipGroup.selectedFacility ? translate("Change pickup location") : translate("Select pickup location")}}</ion-button>
              <ion-button v-else-if="shipGroup.selectedShipmentMethodTypeId !== 'STOREPICKUP'" :disabled="!hasPermission(Actions.APP_SHPGRP_DLVRADR_UPDATE) && shipGroup.shipmentMethodTypeId !== 'STOREPICKUP'" @click="updateDeliveryAddress(shipGroup)" expand="block" fill="outline" class="ion-margin">{{ shipGroup.updatedAddress ? translate("Edit address") : translate("Add address") }}</ion-button>

              <div class="actions">
                <ion-button :disabled="(!shipGroup.updatedAddress && (!shipGroup.selectedFacility || shipGroup.selectedFacility.facilityId == shipGroup.facilityId))" @click="save(shipGroup)" fill="clear">{{ translate("Save changes") }}</ion-button>
                <ion-button v-if="hasPermission(Actions.APP_SHPGRP_CNCL)" @click="cancel(shipGroup)" fill="clear" color="danger">{{ translate("Cancel") }}</ion-button>
              </div>
            </ion-card>
            
          </div>
          <div v-else-if="isOrderUpdated" class="ion-text-center ion-padding-top">
            <ion-label>{{ translate("An email will be sent to you when your item(s) are ready to collect at the new requested location(s).") }}</ion-label>
          </div>
          <div v-else class="ion-text-center ion-padding-top">
            <ion-label>{{ translate("Order item not eligible for reroute fulfilment") }}</ion-label>
          </div>
        </div>
        <div v-else-if="loader == null" class="ion-text-center ion-padding-top">
          <ion-label>{{ translate("Order not found") }}</ion-label>
        </div>
      </main>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  alertController,
  IonButton,
  IonCard,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonNote,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonSegment,
  IonSegmentButton,
  IonThumbnail,
  loadingController,
  modalController,
} from "@ionic/vue";
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import { mapGetters, useStore } from 'vuex'
import { OrderService } from "@/services/OrderService";
import { translate } from "@/i18n";
import { hasError, showToast } from "@/utils";
import Image from "@/components/Image.vue";
import AddressModal from "@/views/AddressModal.vue";
import { ProductService } from "@/services/ProductService";
import PickupLocationModal from "@/views/PickupLocationModal.vue";
import { Actions, hasPermission } from '@/authorization'
import { initialise } from '@/adapter'
import { addOutline, colorWandOutline, storefrontOutline } from "ionicons/icons";
import { FacilityService } from '@/services/FacilityService';
import { StockService } from '@/services/StockService';

export default defineComponent({
  name: "Order",
  components: {
    Image,
    IonButton,
    IonCard,
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonNote,
    IonSelect,
    IonSelectOption,
    IonSegment,
    IonSegmentButton,
    IonThumbnail,
    IonPage,
  },
  data() {
    return {
      loader: null as any,
      maxAge: process.env.VUE_APP_CACHE_MAX_AGE ? parseInt(process.env.VUE_APP_CACHE_MAX_AGE) : 0,
      order: {} as any,
      products: {} as any,
      deliveryMethods: [
        {
          name: 'Store pickup',
          value: 'STOREPICKUP'
        },
        {
          name: 'Shipping',
          value: 'STANDARD'
        }
      ],
      isOrderUpdated: false,
      selectedSegment: "together",
      originFacilityId: "",
      cutomerAddress: {} as any,
      nearbyStores: [] as any,
      availableStores: [] as any,
      storesWithInventory: [] as any,
    }
  },
  computed: {
    ...mapGetters({
      deliveryMethod: 'user/getDeliveryMethod',
      isSplitEnabled: 'user/isSplitEnabled',
    })
  },
  props: ["token"],
  async mounted() {
    if (Object.keys(this.$route.query).length > 0) {
      if(!this.$route.query.oms || !this.token) {
        // invalid request
        return;
      }
      initialise({
        token: "",  // Not passing token, as in this app we don't want to send the token in the Authorizartion header and instead the token will be passed in the params/body
        instanceUrl: `${this.$route.query.oms}/api/`,
        cacheMaxAge: this.maxAge,
        events: {
          responseError: () => {
            setTimeout(() => this.dismissLoader(), 100);
          }
        }
      })
      this.store.dispatch("user/setUserInstanceUrl", `${this.$route.query.oms}/api/`)
      await this.getOrder();
      this.fetchOrderFacilityChangeHistory()
      await this.getPickupStores();
      if(!this.nearbyStores.length) this.selectedSegment = "separate"
    }
  },
  methods: {
    async presentLoader() {
      this.loader = await loadingController
        .create({
          message: translate("Fetching order details."),
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
    async getOrder() {
      await this.presentLoader()
      let resp;
      let order
      if(!this.token) {
        return;
      }

      try {
        resp = await OrderService.getOrder({
          token: this.token
        });
        if (!hasError(resp) && resp.data.id) {
          order = resp.data;
          const productIds: any = new Set();
          order.shipGroup = order.shipGroup.filter((group: any) => {
            if(group.facilityId === 'PICKUP_REJECTED' && group.shipmentMethodTypeId === 'STOREPICKUP') {
              group.selectedShipmentMethodTypeId = group.shipmentMethodTypeId;
              group.items = group.items.filter((item: any) => {
                if (item.status == 'ITEM_CANCELLED') return false;
                productIds.add(item.productId);
                return true;
              })
              return group.items.length > 0;
            }
          })

          if (productIds.length) await this.fetchProducts([...productIds])
          await this.store.dispatch("user/getConfiguration", { productStoreId: order.productStoreId, token: this.token});
          this.order = order;
          if (productIds.size) await this.fetchProducts([...productIds])
        }
      } catch (error) {
        console.error(error)
      }
      this.dismissLoader()
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
      }
    },

    
    async updateShippingAddress(shipGroup: any) {
      let resp
      const payload = {
        "orderId": this.order.id,
        "shipGroupSeqId": shipGroup.shipGroupSeqId,
        "contactMechId": shipGroup.shipmentMethodTypeId === 'STOREPICKUP' ? "" :shipGroup.shipTo.postalAddress.id,
        "shipmentMethod": `${this.deliveryMethod}@_NA_`,
        "contactMechPurposeTypeId": "SHIPPING_LOCATION",
        "facilityId": shipGroup.facilityId,
        "toName": `${shipGroup.updatedAddress.firstName} ${shipGroup.updatedAddress.lastName}`,
        "address1": shipGroup.updatedAddress.address1,
        "city": shipGroup.updatedAddress.city,
        "stateProvinceGeoId": shipGroup.updatedAddress.stateProvinceGeoId,
        "postalCode": shipGroup.updatedAddress.postalCode,
        "countryGeoId": shipGroup.updatedAddress.countryGeoId,
        "token": this.token
      } as any

      if (shipGroup.selectedShipmentMethodTypeId === shipGroup.shipmentMethodTypeId) {
        // In case of address edit, we honour the previously selected delivery method
        payload.shipmentMethod = `${shipGroup.shipmentMethodTypeId}@_NA_`
        payload.isEdited = true
      }

      try {
        resp = await OrderService.updateShippingAddress(payload);
        if (resp.status === 200 && !hasError(resp) && resp.data) {
          shipGroup.shipTo.postalAddress = shipGroup.updatedAddress
          shipGroup.updatedAddress = null
          showToast(translate("Changes saved"))
          this.isOrderUpdated = true
        } else {
          showToast(translate("Failed to update the shipping addess"))
        }
      } catch (error) {
        console.error(error)
        showToast(translate("Failed to update the shipping addess"))
      }
      this.getOrder();
    },

    async updatePickupFacility(shipGroup: any) {
      let resp
      const payload = {
        "orderId": this.order.id,
        "shipGroupSeqId": shipGroup.shipGroupSeqId,
        "contactMechId": shipGroup.shipTo.postalAddress.id,
        "shipmentMethod": "STOREPICKUP@_NA_@CARRIER", // TODO Check why CARRIER is needed
        "contactMechPurposeTypeId": "SHIPPING_LOCATION",
        "facilityId": shipGroup.selectedFacility.facilityId,
        "token": this.token
      }

      try {
        resp = await OrderService.updatePickupFacility(payload);
        if (resp.status === 200 && !hasError(resp)) {
          shipGroup.facilityId = shipGroup.selectedFacility.facilityId
          showToast(translate("Changes saved"))
          this.isOrderUpdated = true
        } else {
          showToast(translate("Failed to update the pickup store"))
        }
      } catch (error) {
        console.error(error)
        showToast(translate("Failed to update the pickup store"))
      }
      this.getOrder();
    },

    updateDeliveryMethod(event: any, shipGroup: any) {
      const group = this.order.shipGroup.find((group: any) => group.shipGroupSeqId === shipGroup.shipGroupSeqId);
      group.selectedShipmentMethodTypeId = event.detail.value;
      // Resetting the previous changes on method change
      this.resetShipGroup(shipGroup)
    },

    async updateDeliveryAddress(shipGroup: any) {
      const modal = await modalController
        .create({
          component: AddressModal,
          // Adding backdropDismiss as false because on dismissing the modal through backdrop,
          // backrop.role returns 'backdrop' giving unexpected result
          backdropDismiss: false,
          componentProps: {
            shipGroup,
            token: this.token,
          }
        })
      modal.onDidDismiss().then((result) => {
        if (result.role) {
          // role will have the passed data
          shipGroup.updatedAddress = result.role
        }
      });
      return modal.present();
    },

    async updatePickupLocation(shipGroup: any, isPickupForAll: boolean) {
      const modal = await modalController
        .create({
          component: PickupLocationModal,
          // Adding backdropDismiss as false because on dismissing the modal through backdrop,
          // backrop.role returns 'backdrop' giving unexpected result
          backdropDismiss: false,
          componentProps: {
            isPickupForAll,
            storesWithInventory: this.storesWithInventory,
            nearbyStores: this.nearbyStores,
            availableStores: this.availableStores
          }
        })
      modal.onDidDismiss().then((result) => {
        
        if (result.role) {
          // role will have the passed data
          shipGroup.selectedFacility = result.role
        }
      });
      return modal.present();
    },

    async save(shipGroup: any) {
      const message = translate("Are you sure you want to save the changes?");
      const alert = await alertController.create({
        header: translate("Save changes"),
        message,
        buttons: [
          {
            text: translate("Cancel"),
          },
          {
            text: translate("Confirm"),
            handler: () => {
              shipGroup.selectedShipmentMethodTypeId === 'STOREPICKUP' ? this.updatePickupFacility(shipGroup) : this.updateShippingAddress(shipGroup);   
            }
          }
        ],
      });
      return alert.present();
    },

    async cancelShipGroup(shipGroup: any) {
      let resp
      const itemReasonMap = {} as any
      shipGroup.items.map((item: any) => itemReasonMap[item.itemSeqId] = 'OICR_CHANGE_MIND')
      const payload = {
        "orderId": this.order.id,
        "shipGroupSeqId": shipGroup.shipGroupSeqId,
        "itemReasonMap": itemReasonMap,
        "token": this.token
      } as any

      try {
        resp = await OrderService.cancelOrderItem(payload);
        if (resp.status === 200 && !hasError(resp) && resp.data.orderId == this.order.id) {
          shipGroup.isCancelled = true;
          showToast(translate("Order cancelled successfully"))
        } else {
          showToast(translate("Failed to cancel the order"))
        }
      } catch (error) {
        console.error(error)
        showToast(translate("Failed~ to cancel the order"))
      }
      this.getOrder();
    },

    async cancel(shipGroup: any) {
      const message = translate("Are you sure you want to cancel the order items?");
      const alert = await alertController.create({
        header: translate("Cancel items"),
        message,
        buttons: [
          {
            text: translate("Don't Cancel"),
          },
          {
            text: translate("Cancel"),
            handler: () => {
              this.cancelShipGroup(shipGroup);
            }
          }
        ],
      });
      return alert.present();
    },

    resetShipGroup(shipGroup: any) {
      shipGroup.updatedAddress = null
      shipGroup.selectedFacility = null
    },

    segmentChanged(event: any) {
      this.selectedSegment = event.detail.value 
    },

    getStoreName(facilityId: any) {
      return this.nearbyStores.find((store: any) => store.storeCode === facilityId)?.storeName
    },

    async fetchOrderFacilityChangeHistory() {
      try {
        const resp = await OrderService.fetchOrderFacilityChangeHistory({
          entityName: "OrderFacilityChange",
          inputFields: {
            orderId: this.order.id,
            orderItemSeqId: this.order.shipGroup[0].items[0].itemSeqId
          },
          viewSize: 2,
          orderBy: "changeDatetime ASC"
        })
        if(!hasError(resp)) {
          this.originFacilityId = resp.data.docs[0]?.facilityId
        } else {
          throw resp.data;
        }
      } catch(error: any) {
        console.error(error);
      }
    },

    async getPickupStores() {
      try {
        let stores;
        let point = ""
        if(this.cutomerAddress?.latitude) {
          point = `${this.cutomerAddress.latitude},${this.cutomerAddress.longitude}`
        }

        stores = await this.getStores(point ? point : '')
        this.availableStores = stores;

        if (!stores?.length) return;

        const facilityIds = stores.map((store: any) => store.storeCode)
        const productIds = [...new Set(this.order.shipGroup[0].items.map((item: any) => item.productId))] as any;
        const storesWithInventory = await this.checkInventory(facilityIds, productIds)
        this.storesWithInventory = storesWithInventory

        if (!storesWithInventory?.length) return;

        stores.map((storeData: any) => {
          const inventoryDetails = storesWithInventory.filter((store: any) => store.facilityId === storeData.storeCode);
          if (inventoryDetails.length === productIds.length) this.nearbyStores.push({...storeData, ...inventoryDetails[0], distance: storeData.dist });
        });
      } catch (error) {
        console.error(error)
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

    async getStores(point?: string) {
      let payload = {
        "viewSize": process.env.VUE_APP_VIEW_SIZE,
        "filters": ["storeType: RETAIL_STORE", "pickup_pref: true"]
      } as any

      if(point) {
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

  },
  setup() {
    const router = useRouter();
    const store = useStore();
    return {
      Actions,
      addOutline,
      hasPermission,
      colorWandOutline,
      router,
      store,
      storefrontOutline,
      translate
    };
  }
});
</script>

<style scoped>
  @media (min-width: 700px) {
    main {
      max-width: 400px;
      margin: auto;
    }
  }

  .actions {
    display: flex;
    justify-content: space-between;
    border-top: 1px solid var(--ion-color-light);
  }
</style>