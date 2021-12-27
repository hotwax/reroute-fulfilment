import { MutationTree } from 'vuex'
import FacilityState from './FacilityState'
import * as types from './mutation-types'

const mutations: MutationTree <FacilityState> = {
  [types.FACILITY_UPDATED] ( state , payload ) {
    state.facilities = payload.facilities;
  }
}

export default mutations;