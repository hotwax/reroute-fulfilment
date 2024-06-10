import { api } from '@/adapter';

const getOrder = async (token: string): Promise <any>  => {
  return api({
    url: "getRerouteOrder",
    method: "POST",
    data: {
      token
    }
  });
}

const updateShippingAddress = async (payload: any): Promise <any>  => {
  return api({
    url: "updateShippingAddressRerouteOrder",
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
    url: 'getProductStoreSetting',
    method: "post",
    data: payload
  });
}

export const OrderService = {
  getOrder,
  updateShippingAddress,
  updatePickupFacility,
  cancelOrderItem,
  getProductStoreSetting
}