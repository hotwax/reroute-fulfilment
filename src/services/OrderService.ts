import { api } from '@/adapter';

const getOrder = async (payload: any): Promise <any>  => {
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

const getRerouteOrderFacilityChangeHistory = async (payload: any): Promise<any> => {
  return api({
    url: "getRerouteOrderFacilityChangeHistory",
    method: "post",
    data: payload
  });
}

const releaseRerouteOrderItem = async (payload: any): Promise<any> => {
  return api({
    url: "releaseRerouteOrderItem",
    method: "post",
    data: payload
  });
}

const requestCancelRerouteOrderItem = async (payload: any): Promise<any> => {
  return api({
    url: "requestCancelRerouteOrderItem",
    method: "post",
    data: payload
  });
}

export const OrderService = {
  getOrder,
  getRerouteOrderFacilityChangeHistory,
  updateShippingAddress,
  updatePickupFacility,
  cancelOrderItem,
  getProductStoreSetting,
  releaseRerouteOrderItem,
  requestCancelRerouteOrderItem
}