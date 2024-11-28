import { GetterTree } from 'vuex'
import UserState from './UserState'
import RootState from '@/store/RootState'

const getters: GetterTree <UserState, RootState> = {
    isAuthenticated (state) {
        return !!state.token;
    },
    isUserAuthenticated(state) {
        return state.token && state.current
    },
    getUserToken (state) {
        return state.token
    },
    getUserProfile (state) {
        return state.current
    },
    getInstanceUrl (state) {
        const baseUrl = process.env.VUE_APP_BASE_URL;
        return baseUrl ? baseUrl : state.instanceUrl;
    },
    getDeliveryMethod (state) {
        return state.deliveryMethod ? state.deliveryMethod : 'STANDARD'
    },
    getUserPermissions (state) {
        return state.permissions;
    },
    isSplitEnabled (state) {
        return state.isSplitEnabled;
    },
    isCancellationAllowed (state) {
        return state.isCancellationAllowed
    }
}
export default getters;