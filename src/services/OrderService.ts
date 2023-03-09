import api from '@/api';

const getOrder = async (payload: any): Promise <any>  => {
  return api({
    // url: "orders/10707", // perryellis
    url: "orders/10273", // dev-hc and perryellis standard
    // url: "orders/11430", // dev-hc storepickup
    // url: "orders/10707", // perryellis storepickup
    method: "post",
    data: payload,
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