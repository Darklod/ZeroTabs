import Vue from 'vue'
import Vuex from 'vuex'

import groups from './modules/groups'
import draganddrop from './modules/draganddrop'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {},
  getters: {},
  mutations: {},
  actions: {},

  modules: {
    groups,
    draganddrop
  }
})
