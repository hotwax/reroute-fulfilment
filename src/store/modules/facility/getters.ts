import { GetterTree } from "vuex";
import FacilityState from "./FacilityState"
import RootState from "../../RootState";

const getters: GetterTree<FacilityState , RootState> = {
  getFacilities: (state) => {
    return state.facilities;
  }
}

export default getters;