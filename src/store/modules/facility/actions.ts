import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import FacilityState from './FacilityState'
import { FacilityService } from "@/services/FacilityService";
import { hasError } from '@/utils';
import * as types from './mutation-types'

const actions: ActionTree<FacilityState , RootState> ={
  async fetchFacilities ({ commit }, payload) {

    const query = {
      "json": {
        "params": {
          "rows": 1000,
          "q": "docType:STORE AND storeCode : *",
          "q.op": "AND"
        }
      }
    }

    let resp;
    
    try {
      resp = await FacilityService.getFacilities(query);
      if (resp.status === 200 && resp.data.response.numFound > 0 && !hasError(resp)) {
        commit(types.FACILITY_UPDATED, { facilities: resp.data.response.docs })
      }
      console.log(resp)
    } catch(err) {
      console.log(err)
      console.error("Something went wrong")
    }
    return resp;
  },
}

export default actions;