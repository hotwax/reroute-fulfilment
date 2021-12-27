import api from '@/api';

const getOrder = async (payload: any): Promise <any>  => {
  return api({
   // TODO: We can replace this with any API
    url: "orders/NN13120", 
    method: "post",
    data: payload,
    cache: true
  });
}

export const OrderService = {
  getOrder
}