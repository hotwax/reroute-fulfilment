import { OrderService } from "@/services/OrderService";
import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import OrderState from './OrderState'
import * as types from './mutation-types'
import { hasError , showToast } from "@/utils";
import { translate } from "@/i18n";
import emitter from '@/event-bus'

const actions: ActionTree<OrderState , RootState> ={
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
        commit(types.OPEN_ORDERS_INITIAL, { current: resp.data })
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
          } catch(err){
            console.log(err)
            showToast(translate("Something went wrong"))
          }
          return resp;
  },
  }

export default actions;