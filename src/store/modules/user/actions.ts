import { UserService } from '@/services/UserService'
import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import UserState from './UserState'
import * as types from './mutation-types'
import { hasError, showToast } from '@/utils'
import { translate } from '@/i18n'
import { DateTime } from 'luxon'
import emitter from '@/event-bus'
import { updateInstanceUrl, updateToken, resetConfig } from '@/adapter'
import { prepareAppPermissions, setPermissions } from '@/authorization'
import { OrderService } from '@/services/OrderService'

const actions: ActionTree<UserState, RootState> = {

  /**
 * Login user and return token
 */
  async login ({ commit, dispatch }, { username, password }) {
    try {
      const resp = await UserService.login(username, password)
      if (resp.status === 200 && resp.data) {
        if (resp.data.token) {
          const permissionId = process.env.VUE_APP_PERMISSION_ID;
          if (permissionId) {
            const checkPermissionResponse = await UserService.checkPermission({
              data: {
                permissionId
              },
              headers: {
                Authorization:  'Bearer ' + resp.data.token,
                'Content-Type': 'application/json'
              }
            });

            if (checkPermissionResponse.status === 200 && !hasError(checkPermissionResponse) && checkPermissionResponse.data && checkPermissionResponse.data.hasPermission) {
              commit(types.USER_TOKEN_CHANGED, { newToken: resp.data.token })
              updateToken(resp.data.token)
              dispatch('getProfile')
              if (resp.data._EVENT_MESSAGE_ && resp.data._EVENT_MESSAGE_.startsWith("Alert:")) {
              // TODO Internationalise text
                showToast(translate(resp.data._EVENT_MESSAGE_));
              }
              return resp.data;
            } else {
              const permissionError = 'You do not have permission to access the app.';
              showToast(translate(permissionError));
              console.error("error", permissionError);
              return Promise.reject(new Error(permissionError));
            }
          } else {
            commit(types.USER_TOKEN_CHANGED, { newToken: resp.data.token })
            updateToken(resp.data.token)
            await dispatch('getProfile')
            return resp.data;
          }
        } else if (hasError(resp)) {
          showToast(translate('Sorry, your username or password is incorrect. Please try again.'));
          console.error("error", resp.data._ERROR_MESSAGE_);
          return Promise.reject(new Error(resp.data._ERROR_MESSAGE_));
        }
      } else {
        showToast(translate('Something went wrong'));
        console.error("error", resp.data._ERROR_MESSAGE_);
        return Promise.reject(new Error(resp.data._ERROR_MESSAGE_));
      }
    } catch (err: any) {
      showToast(translate('Something went wrong'));
      console.error("error", err);
      return Promise.reject(new Error(err))
    }
    // return resp
  },

  /**
   * Logout user
   */
  async logout ({ commit }) {
    // TODO add any other tasks if need
    commit(types.USER_END_SESSION)
    resetConfig();
  },

  /**
   * Get User profile
   */
  async getProfile ( { commit }) {
    const resp = await UserService.getProfile()
    if (resp.status === 200) {
      const localTimeZone = DateTime.now().zoneName;
      if (resp.data.userTimeZone !== localTimeZone) {
        emitter.emit('timeZoneDifferent', { profileTimeZone: resp.data.userTimeZone, localTimeZone});
      }
      commit(types.USER_INFO_UPDATED, resp.data);
    }
  },
  /**
   * Update user timeZone
   */
  async setUserTimeZone ( { state, commit }, payload) {
    const resp = await UserService.setUserTimeZone(payload)
    if (resp.status === 200 && !hasError(resp)) {
      const current: any = state.current;
      current.userTimeZone = payload.tzId;
      commit(types.USER_INFO_UPDATED, current);
      showToast(translate("Time zone updated successfully"));
    }
  },

  // Set User Instance Url
  setUserInstanceUrl ({ commit }, payload){
    commit(types.USER_INSTANCE_URL_UPDATED, payload)
    updateInstanceUrl(payload)
  },

  async getConfiguration({ commit }, { productStoreId, token }) {
    try {
      const resp = await OrderService.getProductStoreSetting({
        token,
        inputFields: {
          productStoreId,
          "settingTypeEnumId": ["CUST_DLVRMTHD_UPDATE", "CUST_DLVRADR_UPDATE", "CUST_PCKUP_UPDATE", "CUST_ALLOW_CNCL", "RF_SHIPPING_METHOD", "CUST_ORD_ITEM_SPLIT"],
          "settingTypeEnumId_op": "in"
        },
        viewSize: 100
      })
      if (!hasError(resp)) {
        const permissions = resp.data.docs.filter((permission: any) => permission.settingValue == 'true').map((permission: any) => permission.settingTypeEnumId)
        const deliveryMethod = resp.data.docs.find((permission: any) => permission.settingTypeEnumId === 'RF_SHIPPING_METHOD')?.settingValue
        const isSplitEnabled = resp.data.docs.find((permission: any) => permission.settingTypeEnumId === 'CUST_ORD_ITEM_SPLIT')?.settingValue
        const isCancellationAllowed = resp.data.docs.find((permission: any) => permission.settingTypeEnumId === 'CUST_ALLOW_CNCL')?.settingValue
        const appPermissions = prepareAppPermissions(permissions);
        setPermissions(appPermissions);
        commit(types.USER_DELIVERY_METHOD_UPDATED, deliveryMethod ? JSON.parse(deliveryMethod)?.shipmentMethodTypeId : "STANDARD");
        commit(types.USER_PERMISSIONS_UPDATED, appPermissions);
        commit(types.USER_ORDER_SPLIT_CONFIG_UPDATED, isSplitEnabled === "true");
        commit(types.USER_ITEM_CANCELLATION_CONFIG_UPDATED, isCancellationAllowed === "true");
      }
    } catch (error) {
      console.error(error)
    }
  }
}

export default actions;