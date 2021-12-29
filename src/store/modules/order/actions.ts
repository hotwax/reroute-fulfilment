import { OrderService } from "@/services/OrderService";
import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import OrderState from './OrderState'
import * as types from './mutation-types'
import { hasError , showToast } from "@/utils";
import { translate } from "@/i18n";
import emitter from '@/event-bus'

const actions: ActionTree<OrderState , RootState> = {
  async getOrder ({ commit }, payload) {
    let resp;
    const obj = {
      "sortBy": payload.sortBy,
      "sortOrder": payload.sortOrder,
      "viewSize": payload.viewSize,
      "viewIndex": payload.viewIndex,
      "facilityId": payload.facilityId
    };
    try {
      resp = await OrderService.getOrder(obj);
      const order = resp.data;
      if (resp.status === 200 && resp.data && !hasError(resp)) {
        commit(types.ORDER_CURRENT, { current: resp.data })
        let productIds: any = new Set();
        order.shipGroup.map((group: any) => {
          group.items.map((item: any) => {
            if (item.productId) productIds.add(item.productId);
          })
        })
        productIds = [...productIds]
        if (productIds.length) {
          this.dispatch('product/fetchProducts', { productIds })
        }
        return resp.data;
      } else {
        showToast(translate("Orders Not Found"))
      }
      if(payload.viewIndex === 0) emitter.emit("dismissLoader");
    } catch (err) {
      console.log(err)
      showToast(translate("Something went wrong"))
    }
    return resp;
  },

  updateItemShipmentAddress ({ commit }, payload) {
    if (payload.shipGroup.shipmentMethodTypeId === 'STOREPICKUP') {
      payload.shipGroup.shipmentMethodTypeId = 'STANDARD'
    }
    const { firstName, lastName, street, city, shippingState, zipcode } = payload.shipmentAddress;
    payload.shipGroup.shipTo.postalAddress.toName = firstName + lastName;
    payload.shipGroup.shipTo.postalAddress.address1 = street;
    payload.shipGroup.shipTo.postalAddress.city = city;
    payload.shipGroup.shipTo.postalAddress.state = shippingState;
    payload.shipGroup.shipTo.postalAddress.postalCode = zipcode;
  }
}

export default actions;