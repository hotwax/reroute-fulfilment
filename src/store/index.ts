import { createStore, useStore as useVuexStore } from "vuex"
import mutations  from './mutations'
import getters  from './getters'
import actions from './actions'
import RootState from './RootState'
import createPersistedState from "vuex-persistedstate";
import userModule from './modules/user';
import productModule from "./modules/product"
import orderModule from "./modules/order"

const state: any = {
}
const persistState = createPersistedState({
  paths: ['user'],
  fetchBeforeUse: true
})
const store = createStore<RootState>({
  state,
  actions,
  mutations,
  getters,
  plugins: [ persistState ],
  modules: { 
    'user': userModule,
    'product': productModule,
    'order': orderModule,
  },
})

export default store
export function useStore(): typeof store {
  return useVuexStore()
}