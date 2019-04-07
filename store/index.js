import Vue from 'vue'
import Vuex from 'vuex'

import groups from './modules/groups'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {},
  getters: {},
  mutations: {},
  actions: {},

  modules: {
    groups
  }
})
