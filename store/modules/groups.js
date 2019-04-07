/* global chrome */

const state = {
  groups: []
}

const getters = {
  getAllGroups: state => {
    return state.groups
  },
  getGroupByKey: state => (groupKey) => {
    return state.groups.find((g) => g.key === groupKey)
  },
  getTabs: state => (groupKey) => {
    return getters.getGroupByKey(state)(groupKey).tabs
  },
  getTab: state => (groupKey, id) => {
    return getters.getTabs(state)(groupKey).find((t) => t.id === id)
  }
}

const mutations = {
  setGroups: (state, payload) => {
    state.groups = payload
  },
  addGroup: (state, payload) => {
    if (!state.groups) {
      state.groups = []
    }
    if (!state.groups.some((g) => g.key === payload.key)) {
      state.groups.push(payload)
    }
  },
  removeGroup: (state, payload) => {
    let index = state.groups.findIndex((g) => g.key === payload.key)
    state.groups.splice(index, 1)
  },
  moveTab: (state, payload) => {
    let tabs = state.groups.find((g) => g.key === payload.key).tabs
    tabs.splice(payload.newIndex, 0, tabs.splice(payload.oldIndex, 1)[0])
  },
  removeTab: (state, payload) => {
    let tabs = state.groups.find((g) => g.key === payload.key).tabs
    let index = tabs.findIndex((t) => t.id === payload.id)
    tabs.splice(index, 1)
  },
  removeTabs: (state, payload) => {
    let tabs = state.groups.find((g) => g.key === payload.key).tabs

    for (let id in payload.ids) {
      let index = tabs.findIndex((t) => t.id === id)
      tabs.splice(index, 1)
    }
  }
}

const actions = {
  getGroup: async (context, payload) => {
    let data = await new Promise(resolve => {
      chrome.storage.sync.get(payload.key, (results) => {
        resolve(results)
      })
    })
    context.commit('addGroup', data)
  },
  getGroups: async (context) => {
    let data = await new Promise(resolve => {
      chrome.storage.sync.get(null, (results) => {
        resolve(results)
      })
    })

    let groups = []
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        groups.push({ key, tabs: [...data[key]] })
      }
    }
    context.commit('setGroups', groups)
  },
  saveGroup: async (context, payload) => {
    await new Promise(resolve => {
      chrome.storage.sync.set({[payload.key]: payload.tabs}, () => {
        resolve()
      })
    })
    context.commit('addGroup', payload)
  },
  removeGroup: async (context, payload) => {
    await new Promise(resolve => {
      chrome.storage.sync.remove([payload.key], () => {
        resolve()
      })
    })
    context.commit('removeGroup', payload)
  },
  moveTab: async (context, payload) => {
    /* let {indexA, indexB, data} = await new Promise(resolve => {
      chrome.storage.sync.get(null, (results) => {
        let indexA = results[payload.keyA].findIndex((t) => t.id === payload.idA)
        let indexB = results[payload.keyB].findIndex((t) => t.id === payload.idB)
        resolve(indexA, indexB, results)
      })
    })
    if (payload.keyA === payload.keyB) {
      let tabs = data[payload.keyA]

    } else {
      let tabsA = data[payload.keyA]
      let tabsB = data[payload.keyB]
      // DON'T SWITCH ....
      // tabsA.push(indexA, )
    } */

    // MOVE IF SAME GROUP

    // fetch and return newTabs
    let {tabs, tabIndex} = await new Promise(resolve => {
      chrome.storage.sync.get(payload.key, (results) => {
        let tabs = results[payload.key]
        let tabIndex = tabs.findIndex((t) => t.id.toString() === payload.id)

        tabs.splice(payload.newIndex, 0, tabs.splice(tabIndex, 1)[0])

        resolve({tabs, tabIndex})
      })
    })

    // save tabs in the storage
    await new Promise(resolve => {
      chrome.storage.sync.set({[payload.key]: tabs}, (results) => {
        resolve(results)
      })
    })

    context.commit('moveTab', {key: payload.key, newIndex: payload.newIndex, oldIndex: tabIndex})
  },
  removeTab: async (context, payload) => {
    let data = await new Promise(resolve => {
      chrome.storage.sync.get(payload.key, (results) => {
        let index = results[payload.key].findIndex((t) => t.id === payload.id)
        results[payload.key].splice(index, 1)
        resolve(results[payload.key])
      })
    })

    data = await new Promise(resolve => {
      chrome.storage.sync.set({[payload.key]: data}, (results) => {
        resolve(results)
      })
    })

    context.commit('removeTab', payload)
  },
  removeTabs: async (context, payload) => {
    let newTabs = await new Promise(resolve => {
      chrome.storage.sync.get(payload.key, (results) => {
        results = results[payload.key].filter((t) => payload.ids.indexOf(t.id) === -1)
        resolve(results)
      })
    })

    await new Promise(resolve => {
      chrome.storage.sync.set({[payload.key]: newTabs}, (results) => {
        resolve(results)
      })
    })

    context.commit('removeTabs', payload)
  }
}

export default {
  state, getters, mutations, actions
}
