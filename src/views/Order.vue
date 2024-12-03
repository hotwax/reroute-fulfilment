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
              <ion-note slot="end">{{ $filters.formatDate(order.orderDate, "yyyy-MM-dd HH:mm:ss") }}</ion-note>
            </ion-item>
          </ion-card>

          <ion-card  v-if="order.statusId !== 'ORDER_CANCELLED' && Object.keys(order.shipGroup).length > 0">
            <ion-item lines="full" v-if="originFacilityName">
              <ion-label>{{ translate("was unable to prepare your order. Please select alternate options.", { facilityName: originFacilityName }) }}</ion-label>
            </ion-item>

            <ion-item lines="none">
              <ion-select :label="translate('Delivery method')" :disabled="!hasPermission(Actions.APP_SHPGRP_DLVRMTHD_UPDATE)" interface="popover" :value="order.shipGroup.selectedShipmentMethodTypeId" @ionChange="updateDeliveryMethod($event, order.shipGroup)">
                <ion-select-option v-for="method in deliveryMethods" :key="method.value" :value="method.value">{{ method.name }}</ion-select-option>
              </ion-select>
            </ion-item>

            <template v-if="order.shipGroup.selectedShipmentMethodTypeId === 'STOREPICKUP' && isSplitEnabled">
              <ion-segment v-if="nearbyStores.length" @ionChange="segmentChanged($event, order.shipGroup)" v-model="selectedSegment">
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
            </template>

            <!-- Todo: add support for the store suggestion. -->
            <!-- <ion-button expand="block" class="ion-margin" fill="outline">
              <ion-icon :icon="colorWandOutline" slot="start" />
              {{ translate("Suggest store") }}
            </ion-button> -->

            <!-- <ion-item lines="full">
              <ion-label>
                <p>{{ translate("We'll try to find a location with the most items in stock.") }}</p>
              </ion-label>
            </ion-item> -->

            <template  v-for="item of order.shipGroup.items" :key="item.id">
              <ion-item v-if="item.status !== 'ITEM_CANCELLED' && !item.selectedFacilityId && !item.isOutOfStock" lines="full">
                <ion-thumbnail slot="start">
                  <Image :src='getProduct(item.productId).mainImageUrl' />
                </ion-thumbnail>
                <ion-label>
                  <p class="overline" v-if="item.isItemCancelled">{{ translate(isCancellationAllowed ? "Cancel" : "Request Cancellation") }}</p>
                  {{ item.name }}
                  <p v-for="(attribute, feature) in ($filters.groupFeatures(getProduct(item.productId).featureHierarchy))" :key="attribute" >
                    <span class="sentence-case">{{ feature }}</span>: {{ attribute }}
                  </p>
                </ion-label>

                <template v-if="selectedSegment === 'separate' && order.shipGroup.selectedShipmentMethodTypeId === 'STOREPICKUP'">
                  <ion-chip color="danger" outline v-if="item.isItemCancelled" slot="end">
                    <ion-icon :icon="medkitOutline" />
                    <ion-icon :icon="closeCircleOutline" @click="item.isItemCancelled = false" />
                  </ion-chip>
                  <ion-button v-else slot="end" fill="clear" @click="updatePickupLocation(false, item.selectedFacilityId, item)">
                    <ion-icon :icon="addOutline" slot="icon-only" />
                    <ion-icon :icon="storefrontOutline" slot="icon-only" />
                  </ion-button>
                </template>
              </ion-item>
            </template>

            <div v-if="outOfStockItems.length">
              <ion-item-divider color="light">
                <ion-label>{{ translate("Out of stock") }}</ion-label>
              </ion-item-divider>

              <div v-for="item in outOfStockItems" :key="item.id">
                <ion-item lines="full">
                  <ion-thumbnail slot="start">
                    <Image :src='getProduct(item.productId).mainImageUrl' />
                  </ion-thumbnail>
                  <ion-label>
                    <p class="overline" v-if="item.isItemCancelled">{{ translate(isCancellationAllowed ? "Cancel" :"Request Cancellation") }}</p>
                    {{ item.name }}
                    <p v-for="(attribute, feature) in ($filters.groupFeatures(getProduct(item.productId).featureHierarchy))" :key="attribute" >
                      <span class="sentence-case">{{ feature }}</span>: {{ attribute }}
                    </p>
                  </ion-label>

                  <ion-chip color="danger" outline v-if="item.isItemCancelled" slot="end">
                    <ion-icon :icon="medkitOutline" />
                    <ion-icon :icon="closeCircleOutline" @click="item.isItemCancelled = false" />
                  </ion-chip>
                  <ion-button color="danger" fill="clear" slot="end" v-else @click="item.isItemCancelled = true">
                    <ion-icon :icon="medkitOutline" slot="icon-only" />
                  </ion-button>
                </ion-item>
              </div>
            </div>

            <div v-for="(items, facilityId) in selectedItemsByFacility" :key="facilityId">
              <ion-item-divider color="light" v-if="items.length">
                <ion-label>{{ facilityId }}</ion-label>
              </ion-item-divider>

              <div v-for="item in items" :key="item.id">
                <ion-item v-if="item.status !== 'ITEM_CANCELLED'" lines="full">
                  <ion-thumbnail slot="start">
                    <Image :src='getProduct(item.productId).mainImageUrl' />
                  </ion-thumbnail>
                  <ion-label>
                    {{ item.name }}
                    <p v-for="(attribute, feature) in ($filters.groupFeatures(getProduct(item.productId).featureHierarchy))" :key="attribute" >
                      <span class="sentence-case">{{ feature }}</span>: {{ attribute }}
                    </p>
                  </ion-label>

                  <ion-button slot="end" fill="clear" @click="removeItemFromFacility(item, facilityId)" color="medium">
                    <ion-icon :icon="removeCircleOutline" slot="icon-only" />
                  </ion-button>
                </ion-item>
              </div>
            </div>

            <ion-item v-if="order.shipGroup.selectedShipmentMethodTypeId === 'STOREPICKUP' && selectedFacility.facilityId">
              <ion-label>
                {{ selectedFacility.facilityName }}
                <p>{{ selectedFacility.address1 }}</p>
                <p>{{ selectedFacility.city }} {{ selectedFacility.stateCode }} {{ order.shipGroup.shipTo.postalAddress.country }} {{ selectedFacility.postalCode }}</p>
              </ion-label>
            </ion-item>
            <ion-item v-else-if="order.shipGroup.selectedShipmentMethodTypeId !== 'STOREPICKUP' && customerAddress.toName">
              <ion-label>
                {{ customerAddress.toName }}
                <p>{{ customerAddress.address1 }}</p>
                <p>{{ customerAddress.city }} {{ customerAddress.stateCode }} {{ customerAddress.postalCode }}</p>
              </ion-label>
            </ion-item>

            <ion-button v-if="order.shipGroup.selectedShipmentMethodTypeId === 'STOREPICKUP' && selectedSegment === 'together'" :disabled="!hasPermission(Actions.APP_SHPGRP_PCKUP_UPDATE)" @click="updatePickupLocation(true, selectedFacility.facilityId)" expand="block" fill="outline" class="ion-margin">{{ selectedFacility.facilityId ? translate("Change pickup location") : translate("Select pickup location")}}</ion-button>

            <div class="actions">
              <ion-button :disabled="!isOrderItemsEligibleForUpdation(order.shipGroup)" @click="confirmSave(order.shipGroup)" fill="clear">{{ translate("Save changes") }}</ion-button>
              <ion-button @click="cancelOrder(order.shipGroup)" fill="clear" color="danger">{{ translate(isCancellationAllowed ? "Cancel" : "Request cancel") }}</ion-button>
            </div>
          </ion-card>
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
  IonChip,
  IonContent,
  IonIcon,
  IonItem,
  IonItemDivider,
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
import { ProductService } from "@/services/ProductService";
import PickupLocationModal from "@/views/PickupLocationModal.vue";
import { Actions, hasPermission } from '@/authorization'
import { initialise } from '@/adapter'
import { addOutline, closeCircleOutline, colorWandOutline, medkitOutline, removeCircleOutline, storefrontOutline } from "ionicons/icons";
import { FacilityService } from '@/services/FacilityService';
import { StockService } from '@/services/StockService';

export default defineComponent({
  name: "Order",
  components: {
    Image,
    IonButton,
    IonCard,
    IonChip,
    IonContent,
    IonIcon,
    IonItem,
    IonItemDivider,
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
      originFacilityName: "",
      selectedSegment: "together",
      customerAddress: {} as any,
      nearbyStores: [] as any,
      availableStores: [] as any,
      storesWithInventory: [] as any,
      selectedFacility: {} as any,
      selectedItemsByFacility: {} as any,
      isOrderUpdated: false,
      outOfStockItems: [] as any
    }
  },
  computed: {
    ...mapGetters({
      deliveryMethod: 'user/getDeliveryMethod',
      isSplitEnabled: 'user/isSplitEnabled',
      isCancellationAllowed: 'user/isCancellationAllowed'
    })
  },
  props: ["token"],
  async mounted() {
    if(Object.keys(this.$route.query).length > 0) {
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
      if(this.order?.shipGroup && Object.keys(this.order.shipGroup).length){
        this.customerAddress = this.order.shipGroup.shipTo?.postalAddress ? this.order.shipGroup.shipTo.postalAddress : {}
        await this.getPickupStores();
        this.fetchOrderFacilityChangeHistory()
        if(!this.nearbyStores.length) {
          this.selectedSegment = "separate";
          this.checkForOutOfStockItems(this.order.shipGroup)
        } 
      }
    }
  },
  methods: {
    async presentLoader() {
      this.loader = await loadingController.create({
        message: translate("Fetching order details."),
        translucent: true,
      });
      await this.loader.present();
    },
    dismissLoader() {
      if(this.loader) {
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

        if(!hasError(resp) && resp.data.id) {
          order = resp.data;
          const productIds: any = new Set();
          const shipGroup = order.shipGroup.find((group: any) => {
            if(group.facilityId === 'PICKUP_REJECTED' && group.shipmentMethodTypeId === "STOREPICKUP") {
              group.selectedShipmentMethodTypeId = group.shipmentMethodTypeId;
              group.items = group.items.filter((item: any) => {
                if(item.status == "ITEM_CANCELLED" || item.status === "ITEM_REQ_CANCELATN") return false;
                productIds.add(item.productId);
                return true;
              })
              return group.items.length > 0;
            }
          })
          order.shipGroup = shipGroup ? shipGroup : {}
          if(productIds.length) await this.fetchProducts([...productIds])
          await this.store.dispatch("user/getConfiguration", { productStoreId: order.productStoreId, token: this.token});
          this.order = order;
          if(productIds.size) await this.fetchProducts([...productIds])
        }
      } catch (error) {
        console.error(error)
      }
      this.dismissLoader()
    },

    async fetchOrderFacilityChangeHistory() {
      let originFacilityName = "", resp;

      try {
        resp = await OrderService.getRerouteOrderFacilityChangeHistory({ "token": this.token, facilityId: "PICKUP_REJECTED" })

        if(!hasError(resp) && resp.data?.facilityChangeHistory?.length) {
          const oldestBrokeringHistory = resp.data.facilityChangeHistory.reduce((oldest: any, current: any) => current.changeDatetime > oldest.changeDatetime ? current : oldest);
          const fromFacilityId = oldestBrokeringHistory.fromFacilityId;

          originFacilityName = this.availableStores.find((store: any) => store.storeCode === fromFacilityId)?.storeName

          if(!originFacilityName) {
            resp = await FacilityService.getStores({
              "viewSize": process.env.VUE_APP_VIEW_SIZE,
              "filters": [`storeCode: ${fromFacilityId}`]
            })

            if(!hasError(resp) && resp.data.response.numFound) {
              originFacilityName = resp.data?.response.docs[0].storeName
            } else {
              throw resp.data;
            }
          }
        } else {
          throw resp.data;
        }
      } catch(error: any) {
        console.error(error);
      }

      this.originFacilityName = originFacilityName
    },

    async getPickupStores() {
      try {
        let stores, point = "";

        if(this.customerAddress?.latitude) {
          point = `${this.customerAddress.latitude},${this.customerAddress.longitude}`
        }

        stores = await this.getStores(point)
        this.availableStores = stores;

        if(!stores?.length) return;

        const facilityIds = stores.map((store: any) => store.storeCode)
        const productIds = [...new Set(this.order.shipGroup.items.map((item: any) => item.productId))] as any;
        this.storesWithInventory = await this.checkInventory(facilityIds, productIds)

        if(!this.storesWithInventory?.length) return;

        stores.map((storeData: any) => {
          const inventoryDetails = this.storesWithInventory.filter((store: any) => store.facilityId === storeData.storeCode);
          if(inventoryDetails.length === productIds.length) this.nearbyStores.push({...storeData, ...inventoryDetails[0], distance: storeData.dist });
        });
      } catch (error) {
        console.error(error)
      }
    },

    async fetchProducts(productIds: any) {
      const productIdFilter = productIds.reduce((filter: string, productId: any) => {
        if(filter !== '') filter += ' OR '
        return filter += productId;
      }, '');

      try {
        const resp = await ProductService.fetchProducts({
          "filters": ['productId: (' + productIdFilter + ')'],
          "viewSize": productIds.length
        })

        if(resp.status === 200 && !hasError(resp) && resp.data) {
          resp.data.response.docs.forEach((product: any) => {
            this.products[product.productId] = product
          });
        }
      } catch (error) {
        console.error(error)
      }
    },

    segmentChanged(event: any, shipGroup: any) {
      this.selectedSegment = event.detail.value 
      if(shipGroup.selectedShipmentMethodTypeId === "STOREPICKUP") {
        this.selectedFacility = {}
        this.selectedItemsByFacility = {}
        this.order.shipGroup.items.map((item: any) => {
          item.selectedFacilityId = ""
        })
      }
    },

    getProduct(productId: string) {
      return this.products[productId] ? this.products[productId] : {}
    },

    updateDeliveryMethod(event: any, shipGroup: any) {
      shipGroup.selectedShipmentMethodTypeId = event.detail.value;
      if(event.detail.value !== "STOREPICKUP") {
        this.selectedFacility = {};
        this.selectedItemsByFacility = {};
        this.order.shipGroup.items.map((item: any) => {
          item.selectedFacilityId = ""
          item.isItemCancelled = false
        })
      }
    },

    checkForOutOfStockItems(shipGroup: any) {
      shipGroup.items.map((item: any) => {
        const isInventoryAvailable = this.storesWithInventory.some((store: any) => store.productId === item.productId && Number(store.atp) > 0)

        if(!isInventoryAvailable) {
          item.isOutOfStock = true;
          this.outOfStockItems.push(item);
        }
      })
    },

    async updatePickupLocation(isPickupForAll: boolean, selectedFacilityId: any, item?: any) {
      const modal = await modalController.create({
        component: PickupLocationModal,
        componentProps: {
          isPickupForAll,
          storesWithInventory: this.storesWithInventory,
          nearbyStores: this.nearbyStores,
          availableStores: this.availableStores,
          selectedFacilityId,
          customerAddress: this.customerAddress,
          currentProductId: item?.productId
        }
      })

      modal.onDidDismiss().then((result) => {
        const selectedOptionId = result.data?.selectedOptionId;

        if(selectedOptionId) {
          if(selectedOptionId === "cancel") {
            item.isItemCancelled = true;    
          } else {
            if(isPickupForAll) {
              this.selectedFacility = this.nearbyStores.find((store: any) => store.facilityId === selectedOptionId);
            } else {
              item.selectedFacilityId = selectedOptionId
              if(this.selectedItemsByFacility[selectedOptionId]?.length) this.selectedItemsByFacility[selectedOptionId].push(item);
              else this.selectedItemsByFacility[selectedOptionId] = [item]
            }
          }
        }
      });

      return modal.present();
    },

    async cancelShipGroup(shipGroup: any, cancelledItems: any) {
      let resp;
      const itemReasonMap = {} as any;

      try {
        if(!this.isCancellationAllowed) {
          const itemsToCancel = cancelledItems?.length ? cancelledItems : shipGroup.items
          const itemIds = [] as any;

          itemsToCancel.map((item: any) => {
            itemIds.push(item.itemSeqId)
            itemReasonMap[`crm_cancellationReason:${item.itemSeqId}`] = "Customer cancellation from reroute app"
          })

          resp = await OrderService.requestCancelRerouteOrderItem({
            "orderId": this.order.id,
            "token": this.token,
            "orderItemSeqId": itemIds,
            ...itemReasonMap
          })

          if(!hasError(resp)) {
            return true;
          } else {
            throw resp.data;
          }
        } else {
          let payload = {
            "orderId": this.order.id,
            "shipGroupSeqId": shipGroup.shipGroupSeqId,
            "token": this.token
          } as any

          if(!cancelledItems.length) {
            shipGroup.items.map((item: any) => {
              itemReasonMap[`irm_${item.itemSeqId}`] = "OICR_CHANGE_MIND"
              itemReasonMap[`icm_${item.itemSeqId}`] = "Canceled by customer using Re-Route"
            })
 
            payload = { ...payload, ...itemReasonMap }

            resp = await OrderService.cancelOrderItem(payload);
            if(!hasError(resp)) {
              return true;
            } else {
              throw resp.data;
            }
          } else {
            const responses = await Promise.allSettled(cancelledItems.map(async(item: any) => {
              payload[`irm_${item.itemSeqId}`] = "OICR_CHANGE_MIND"
              payload[`icm_${item.itemSeqId}`] = "Canceled by customer using Re-Route"
              payload["orderItemSeqId"] = item.itemSeqId

              return await OrderService.cancelOrderItem(payload)
            }))

            const hasFailedResponse = responses.some((response: any) => response.status === 'rejected')
            return !hasFailedResponse
          }
        }
      } catch(error) {
        console.error(error);
      }
      return false
    },

    async cancelOrder(shipGroup: any) {
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
            handler: async () => {
              // Todo: handle case for the request cancellation
              const isCancelled = await this.cancelShipGroup(shipGroup, []);
              showToast(translate(isCancelled ? "Order cancelled successfully." : "Failed to cancel the order."))
              this.getOrder()
            }
          }
        ],
      });
      return alert.present();
    },

    async confirmSave(shipGroup: any) {
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
              this.saveOrder(shipGroup)
            }
          }
        ],
      });
      return alert.present();
    },

    async saveOrder(shipGroup: any) {
      const isStorePickupSelected = (shipGroup.selectedShipmentMethodTypeId === "STOREPICKUP");
      let isUpdated = false, hasFailure = false;

      if(this.selectedSegment === "together") {
        if(isStorePickupSelected) {
          isUpdated = await this.updatePickupFacility(shipGroup)
          showToast(translate(isUpdated ? "Pickup facility updated successfully." : "Failed to update the pickup store."))
        } else {
          isUpdated = await this.updateShippingMethod(shipGroup)

          if(isUpdated) {
            const isUpdated = await this.brokerOrderItem(shipGroup.items, true);
            if(!isUpdated) hasFailure = true;
          } else {
            hasFailure = true;
          }

          showToast(translate(hasFailure ? "Failed to update the shipping addess." : "Shipping address updated successfully."))
        }
      } else {
        const itemsForCancellation = shipGroup.items.filter((item: any) => item.isItemCancelled);
        const itemsWithFacility = shipGroup.items.filter((item: any) => item.selectedFacilityId)
        const itemsForShipping = shipGroup.items.filter((item: any) => !(item.isItemCancelled || item.selectedFacilityId))

        if(itemsForCancellation.length) {
          isUpdated = await this.cancelShipGroup(shipGroup, itemsForCancellation)
          if(!isUpdated) hasFailure = true;
        }

        if(itemsWithFacility.length) {
          isUpdated = await this.brokerOrderItem(itemsWithFacility, false)
          if(!isUpdated) hasFailure = true;
        }

        if(shipGroup.selectedShipmentMethodTypeId !== "STOREPICKUP" && this.customerAddress.address1 && itemsForShipping.length) {
          if(await this.updateShippingMethod(shipGroup)) {
            isUpdated = await this.brokerOrderItem(itemsForShipping, true);
            if(!isUpdated) hasFailure = true; 
          } else {
            hasFailure = true;
          }
        }

        showToast(translate(hasFailure ? "Failed to re-route some order items." : "Order items re-routed successfully."))
      }
      this.getOrder();
    },

    async brokerOrderItem(items: any, isShippingOrder: boolean) {
      const responses = await Promise.allSettled(items.map(async(item: any) => await OrderService.releaseRerouteOrderItem({
        orderId: this.order.id,
        orderItemSeqId: item.itemSeqId,
        fromFacilityId: this.order.facilityId,
        toFacilityId: isShippingOrder ? "_NA_" : item.selectedFacilityId,
        token: this.token
      })))
      const hasFailedResponse = responses.some((response: any) => response.status === 'rejected')
      return !hasFailedResponse
    },

    isOrderItemsEligibleForUpdation(shipGroup: any) {
      if(this.selectedSegment === "together") {
        return shipGroup.selectedShipmentMethodTypeId === "STOREPICKUP" ? this.selectedFacility.facilityId : this.customerAddress.address1
      } else {
        return shipGroup.selectedShipmentMethodTypeId === "STOREPICKUP" ? !shipGroup.items.some((item: any) => !(item.selectedFacilityId || item.isItemCancelled)) : this.customerAddress.address1
      }
    },

    async updatePickupFacility(shipGroup: any) {
      let resp
      const payload = {
        "orderId": this.order.id,
        "shipGroupSeqId": shipGroup.shipGroupSeqId,
        "contactMechId": shipGroup.shipTo.postalAddress.id,
        "shipmentMethod": "STOREPICKUP@_NA_@CARRIER", // TODO Check why CARRIER is needed
        "contactMechPurposeTypeId": "SHIPPING_LOCATION",
        "facilityId": this.selectedFacility.facilityId,
        "token": this.token
      }

      try {
        resp = await OrderService.updatePickupFacility(payload);
        if(resp.status === 200 && !hasError(resp)) {
          shipGroup.facilityId = this.selectedFacility.facilityId
          this.isOrderUpdated = true
          return true;
        } else {
          throw resp.data;
        }
      } catch(error) {
        console.error(error)
      }
      return false;
    },

    async updateShippingMethod(shipGroup: any) {
      let resp

      const payload = {
        "orderId": this.order.id,
        "shipGroupSeqId": shipGroup.shipGroupSeqId,
        "shipmentMethod": `${this.deliveryMethod}@_NA_`,
        "contactMechPurposeTypeId": "SHIPPING_LOCATION",
        "facilityId": "_NA_",
        "contactMechId": this.customerAddress.id,
        "token": this.token
      } as any

      try {
        resp = await OrderService.updateShippingAddress(payload);
        if(!hasError(resp)) {
          this.isOrderUpdated = true
          return true;
        } else {
          throw resp.data;
        }
      } catch (error) {
        console.error(error)
      }
      return false;
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
        if(storeLookupResp.status !== 200 || hasError(storeLookupResp) || !storeLookupResp.data.response.numFound) {
          return [];
        } 
        return storeLookupResp.data.response.docs
      } catch (error) {
        console.error(error)
      }
    },

    removeItemFromFacility(item: any, facilityId: any) {
      this.selectedItemsByFacility[facilityId] = this.selectedItemsByFacility[facilityId].filter((currentItem: any) => currentItem.itemSeqId !== item.itemSeqId);
      item.selectedFacilityId = "";
    }
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    return {
      Actions,
      closeCircleOutline,
      addOutline,
      hasPermission,
      colorWandOutline,
      medkitOutline,
      removeCircleOutline,
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

  .overline {
    color: red;
  }
</style>