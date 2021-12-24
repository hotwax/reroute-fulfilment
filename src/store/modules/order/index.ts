import getters from './getters'
import mutations from './mutations'
import { Module } from 'vuex'
import OrderState from './OrderState'
import RootState from '../../RootState'
import actions from './actions'

const orderModule: Module<OrderState, RootState> = {
  namespaced: true,
  state: {
    current: {},
    order: {
      list: {},
      totalCount: 0
    }
  },
  getters,
  mutations,
  actions
}

export default orderModule; 