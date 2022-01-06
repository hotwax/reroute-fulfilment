import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import FacilityState from './FacilityState'
import { FacilityService } from "@/services/FacilityService";
import { hasError } from '@/utils';
import * as types from './mutation-types'

const actions: ActionTree<FacilityState , RootState> ={
  async fetchFacilities ({ commit }, payload) {

    // currently hardcoded the lat lng and distance
    const query = {
      "json": {
        "params": {
          "q": "docType:STORE",
          "pt": "40.72, -74",
          "d": "50000",
          "fq": "{!geofilt}",
          "sort": "geodist() asc",
          "sfield": "latlon",
          "rows": 50
        }
      }
    }

    let resp;
    
    try {
      resp = await FacilityService.getFacilities(query);
      if (resp.status === 200 && resp.data.response.numFound > 0 && !hasError(resp)) {
        commit(types.FACILITY_UPDATED, { facilities: resp.data.response.docs })
      }
    } catch(err) {
      console.log(err)
      console.error("Something went wrong")
    }
    return resp;
  },
}

export default actions;