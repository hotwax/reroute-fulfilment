import api from '@/api';

const getOrders = async (payload: any): Promise <any>  => {
  return api({
   // TODO: We can replace this with any API
    url: "orders/NN10000", 
    method: "post",
    data: payload,
    cache: true
  });
}

export const OrderService = {
  getOrders
}