// Global Store - contains server information, and user information
import Vue from 'vue'
import Vuex from 'vuex'

import googleDocs from './googleDocs.js'
import tenantSpecificData from '../tenantSpecific.js'

var loadStateStrings = ['CREATED', 'LOADING', 'LOADED', 'ERROR']

const state = {
  pageTitle: 'Default Page Title',
  dataLoadState: 0, // 0 = CREATED, 1 = LOADING, 2 = LOADED, 3 = ERROR
  lastErrorMessage: '',
  loadedGoogleSheet: {
    id: tenantSpecificData.googleDocsSampleSheetID,
    accessLevel: 'UNKNOWN',
    sheets: []
  }
}

const mutations = {
  SET_PAGE_TITLE (state, link) {
    state.pageTitle = 'Example Quasar framework to demo using google doc as datasource - ' + link
  },
  LOGOUT (state) {
    googleDocs.dispatch('DEAUTHENTICATE')
  },
  SET_STATE_LOADING (state) {
    state.dataLoadState = 1
  },
  SET_STATE_LOADED (state) {
    state.dataLoadState = 2
  },
  SET_STATE_ERROR (state, msg) {
    state.lastErrorMessage = msg
    state.dataLoadState = 3
  },
  SET_SHEET_ACCESSLEVEL (state, level) {
    state.loadedGoogleSheet.accessLevel = level
  },
  SET_SHEETS (state, sheets) {
    state.loadedGoogleSheet.sheets = sheets
  }
}

const getters = {
  isLoggedIn: (state, getters) => {
    return googleDocs.getters.isLoggedIn
  },
  loggedInUserInfo: (state, getters) => {
    return googleDocs.getters.userInfo
  },
  dataLoadState: (state, getters) => {
    return loadStateStrings[state.dataLoadState]
  },
  dataLoadStateWithErrorMessage: (state, getters) => {
    if (state.dataLoadState === 3) return loadStateStrings[state.dataLoadState] + ' ' + state.lastErrorMessage
    return loadStateStrings[state.dataLoadState]
  },
  loadedGoogleSheet: (state, getters) => {
    return state.loadedGoogleSheet
  }
}

const actions = {
  LOGIN ({commit}, callbackFN) {
    googleDocs.dispatch('AUTHENTICATE', callbackFN)
  },
  LOADAPPDATA ({commit, state}, callbackFN) {
    commit('SET_STATE_LOADING') // set load state to LOADING
    googleDocs.dispatch('GetSheetAccessLevel', {
      sheetID: state.loadedGoogleSheet.id,
      callbackFN: function (result, message) {
        if (result === 'Success') {
          commit('SET_SHEET_ACCESSLEVEL', message.level) // set load state to LOADED
          commit('SET_SHEETS', message.sheets)
          commit('SET_STATE_LOADED') // set load state to LOADED
          callbackFN(result, 'Dataload complete')
        }
        else {
          commit('SET_STATE_ERROR', message) // set load state to ERROR
          callbackFN(result, message)
        }
      }
    })
  }
}

Vue.use(Vuex)

// Vuex version
export default new Vuex.Store({
  state,
  mutations,
  getters,
  actions
})
