import { api } from '@/adapter';

const getOrder = async (): Promise <any>  => {
  return api({
    url: "orders",
    method: "get",
  });
}

const updateShippingAddress = async (payload: any): Promise <any>  => {
  return api({
    url: "service/updateShippingInformationOfShipGroup", 
    method: "post",
    data: payload,
  });
}

const updatePickupFacility = async (payload: any): Promise <any>  => {
  return api({
    url: "service/updateOrderItemShipGroup", 
    method: "post",
    data: payload,
  });
}

const cancelOrderItem = async (payload: any): Promise <any>  => {
  return api({
    url: 'cancelOrderItem',
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