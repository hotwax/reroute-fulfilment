import { api } from '@/adapter';

const getOrder = async (orderId: string): Promise <any>  => {
  return api({
    url: `orders/${orderId}`,
    method: "get",
    cache: true
  });
}

const updateShippingAddress = async (payload: any): Promise <any>  => {
  return api({
    url: "service/updateShippingInformationOfShipGroup", 
    method: "post",
    data: payload,
  });
}

const updateFacility = async (payload: any): Promise <any>  => {
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
  updateFacility,
  cancelOrderItem
}