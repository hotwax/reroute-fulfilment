import { MutationTree } from 'vuex'
import OrderState from './OrderState'
import * as types from './mutation-types'

const mutations: MutationTree <OrderState> = {
  [types.ORDER_CURRENT] ( state , payload ) {
    state.order = payload.current;
  }
}

export default mutations;