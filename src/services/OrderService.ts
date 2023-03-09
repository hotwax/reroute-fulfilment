import api from '@/api';

const getOrder = async (payload: any): Promise <any>  => {
  return api({
    // url: "orders/10707", // perryellis
    url: "orders/10273", // dev-hc and perryellis standard
    // url: "orders/10707", // perryellis storepickup
    method: "post",
    data: payload,
    cache: true
  });
}

const updateShipGroup = async (payload: any): Promise <any>  => {
  return api({
    url: "service/updateShippingInformationOfShipGroup", 
    method: "post",
    data: payload,
  });
}

const getContactMechId = async (payload: any): Promise <any>  => {
  return api({
    url: "service/createPostalAddress", 
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
  updateShipGroup,
  getContactMechId,
  getAssociatedStates
}