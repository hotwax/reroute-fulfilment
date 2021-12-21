import { MutationTree } from 'vuex'
import OrdersState from './OrdersState'
import * as types from './mutation-types'

const mutations: MutationTree <OrdersState> = {
    [types.OPEN_ORDERS_INITIAL] ( state , payload ) {
        state.current = payload.current;
    }
}

export default mutations;