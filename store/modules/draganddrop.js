const state = {
  added: false,
  removed: false,
  oldKey: '',
  newKey: '',
  tabId: '',
  newIndex: 0
}

const getters = {
  getMove: (state) => {
    return state
  }
}

const mutations = {
  add: (state, payload) => {
    state.newKey = payload.newKey
    state.newIndex = payload.newIndex
    state.added = true
  },
  remove: (state, payload) => {
    state.oldKey = payload.oldKey
    state.tabId = payload.tabId
    state.removed = true
  },
  reset: (state) => {
    state.removed = false
    state.added = false
  }
}

const actions = {
  add: async (context, payload) => {
    context.commit('add', payload)
  },
  remove: async (context, payload) => {
    context.commit('remove', payload)
  },
  reset: async (context, payload) => {
    context.commit('reset', payload)
  }
}

export default {
  state, getters, mutations, actions
}
