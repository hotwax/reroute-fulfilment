import api from '@/api';

const getOrder = async (orderId: any): Promise <any>  => {
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

const getAssociatedStates = async (payload: any): Promise <any>  => {
  return api({
    url: "getAssociatedStateList", 
    method: "post",
    data: payload,
  });
}

export const OrderService = {
  getOrder,
  updateShippingAddress,
  getAssociatedStates,
  updateFacility
}