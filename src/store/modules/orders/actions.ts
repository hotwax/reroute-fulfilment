import { OrderService } from "@/services/OrderService";
import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import OrdersState from './OrdersState'
import * as types from './mutation-types'
import { hasError , showToast } from "@/utils";
import { translate } from "@/i18n";
import emitter from '@/event-bus'

const actions: ActionTree<OrdersState , RootState> ={
  async getOrders ({ commit , state }, payload) {
    // Show loader only when new query and not the infinite scroll
    if (payload.viewIndex === 0) emitter.emit("presentLoader");
    let resp;
    const obj = {
        "sortBy": payload.sortBy,
        "sortOrder": payload.sortOrder,
        "viewSize": payload.viewSize,
        "viewIndex": payload.viewIndex,
        "facilityId": payload.facilityId
    };
    try {
        resp = await OrderService.getOrders(obj)
        if(resp.status === 200 && resp.data.count > 0 && !hasError(resp)) {
            let orders = resp.data.docs ;
            const ordersCount = resp.data.count ;
            if(payload.viewIndex && payload.viewIndex > 0) orders = state.orders.concat(orders)
            commit(types.OPEN_ORDERS_INITIAL, {orders: orders , ordersCount: ordersCount});
            let productIds: any = new Set();
            orders.map((order: any) => {
              order.shipGroup.map((group: any) => {
                group.items.map((item: any) => {
                  if (item.productId) productIds.add(item.productId);
                })
              });
            });
            // Converted to list as methods like reduce not supported
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