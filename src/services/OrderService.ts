import { api } from '@/adapter';
import store from '@/store';

const getOrder = async (payload: any): Promise <any>  => {
  let baseURL = store.getters['user/getInstanceUrl'];
  baseURL = baseURL && baseURL.startsWith('http') ? baseURL : `https://${baseURL}.hotwax.io/api/`;
  return api({
    url: "getRerouteOrder",
    method: "post",
    data: payload
  });
}

const updateShippingAddress = async (payload: any): Promise <any>  => {
  return api({
    url: "updateShippingAddressOfRerouteOrder",
    method: "post",
    data: payload
  });
}

const updatePickupFacility = async (payload: any): Promise <any>  => {
  return api({
    url: "updatePickupFacility",
    method: "post",
    data: payload
  });
}

const cancelOrderItem = async (payload: any): Promise <any>  => {
  return api({
    url: "cancelRerouteOrderItem",
    method: "post",
    data: payload
  });
}

const getProductStoreSetting = async (payload: any): Promise<any> => {
  return api({
    url: "getProductStoreSettingForRerouteOrder",
    method: "post",
    data: payload
  });
}

const getRerouteOrderBrokeringHistory = async (payload: any): Promise<any> => {
  return api({
    url: "getRerouteOrderBrokeringHistory",
    method: "post",
    data: payload
  });
}

export const OrderService = {
  getOrder,
  getRerouteOrderBrokeringHistory,
  updateShippingAddress,
  updatePickupFacility,
  cancelOrderItem,
  getProductStoreSetting
}