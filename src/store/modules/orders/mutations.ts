import { MutationTree } from 'vuex'
import OrdersState from './OrdersState'
import * as types from './mutation-types'

const mutations: MutationTree <OrdersState> = {
    [types.OPEN_ORDERS_INITIAL] ( state , payload ) {
        state.orders.list = payload.orders
        state.orders.totalCount = payload.ordersCount
    }
}

export default mutations;