import getters from './getters'
import mutations from './mutations'
import { Module } from 'vuex'
import OrdersState from './OrdersState'
import RootState from '../../RootState'
import actions from './actions'

const ordersModule: Module<OrdersState, RootState> = {
    namespaced: true,
    state: {
        current: {},
        orders: {
            list: {},
            totalCount: 0
        }
    },
    getters,
    mutations,
    actions
}

export default ordersModule; 