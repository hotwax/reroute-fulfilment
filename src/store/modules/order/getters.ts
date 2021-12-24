import { GetterTree } from "vuex";
import OrderState from "./OrderState"
import RootState from "../../RootState";

const getters: GetterTree<OrderState , RootState> = {
  getOrder: (state) => {
    return state.order.list;
  },
  getCurrent (state) {
    return state.current;
  }
}

export default getters;