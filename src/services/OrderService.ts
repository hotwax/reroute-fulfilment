import { api, client } from '@/adapter';
import store from '@/store';
import { hasError } from '@hotwax/oms-api';

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

const fetchOrderFacilityChangeHistory = async (payload: any): Promise<any> => {
  let baseURL = store.getters['user/getInstanceUrl'];
  baseURL = baseURL && baseURL.startsWith('http') ? baseURL : `https://${baseURL}.hotwax.io/api/`;
 
 
  return client({
    url: "performFind",
    method: "POST",
    data: payload,
    baseURL,
    headers: {
      Authorization: 'Bearer ' + process.env.VUE_APP_BASE,
      'Content-Type': 'application/json'
    }
  })
}

const releaseOrderItem = async (payload: any): Promise<any> => {
  let baseURL = store.getters['user/getInstanceUrl'];
  baseURL = baseURL && baseURL.startsWith('http') ? baseURL : `https://${baseURL}.hotwax.io/api/`;

  return client({
    url: "releaseOrderItem",
    method: "POST",
    data: payload,
    baseURL,
    headers: {
      Authorization: 'Bearer ' + process.env.VUE_APP_BASE,
      'Content-Type': 'application/json'
    }
  });
} 

export const OrderService = {
  fetchOrderFacilityChangeHistory,
  getOrder,
  updateShippingAddress,
  updatePickupFacility,
  cancelOrderItem,
  getProductStoreSetting,
  releaseOrderItem
}