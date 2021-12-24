import { MutationTree } from 'vuex'
import OrderState from './OrderState'
import * as types from './mutation-types'

const mutations: MutationTree <OrderState> = {
  [types.OPEN_ORDERS_INITIAL] ( state , payload ) {
    state.current = payload.current;
  }
}

export default mutations;