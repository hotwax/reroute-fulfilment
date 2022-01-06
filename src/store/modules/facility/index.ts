import getters from './getters'
import mutations from './mutations'
import { Module } from 'vuex'
import FacilityState from './FacilityState'
import RootState from '../../RootState'
import actions from './actions'

const facilityModule: Module<FacilityState, RootState> = {
  namespaced: true,
  state: {
    facilities: {}
  },
  getters,
  mutations,
  actions
}

export default facilityModule; 