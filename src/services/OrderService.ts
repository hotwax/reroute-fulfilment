import { api } from '@/adapter';

const getOrder = async (orderId: string): Promise <any>  => {
  return api({
    url: `orders/${orderId}`,
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

export const OrderService = {
  getOrder,
  updateShippingAddress,
  updatePickupFacility,
  cancelOrderItem
}