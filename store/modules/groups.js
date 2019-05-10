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
    // push only if ...? //
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
  addTab: (state, payload) => {
    let tabs = state.groups.find((g) => g.key === payload.key).tabs
    tabs.splice(payload.index, 0, payload.tab)
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
  },
  changeGroup: (state, payload) => {
    let oldTabs = state.groups.find((g) => g.key === payload.oldKey).tabs
    let newTabs = state.groups.find((g) => g.key === payload.newKey).tabs

    let oldIndex = oldTabs.findIndex(t => t.id === payload.id)
    let newIndex = payload.newIndex

    newTabs.splice(newIndex, 0, oldTabs.splice(oldIndex, 1)[0])
  },
  setTitle: (state, payload) => {
    state.groups.find(g => g.key === payload.key).title = payload.title
  }
}

const actions = {
  getGroup: async (context, payload) => {
    if (!chrome.storage) {
      console.warn('The application must run as chrome extension!')
      return
    }

    let data = await new Promise(resolve => {
      chrome.storage.sync.get(payload.key, (results) => {
        resolve(results)
      })
    })

    context.commit('addGroup', data)
  },
  getGroups: async (context) => {
    if (!chrome.storage) {
      console.warn('The application must run as chrome extension!')
      return
    }

    let data = await new Promise(resolve => {
      chrome.storage.sync.get(null, (results) => {
        resolve(results)
      })
    })

    let groups = []
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        let tabs = data[key].tabs
        let title = data[key].title
        let color = data[key].color

        groups.push({ key, title, tabs, color })
      }
    }

    context.commit('setGroups', groups)
  },
  saveGroup: async (context, payload) => {
    if (!chrome.storage) {
      console.warn('The application must run as chrome extension!')
      return
    }

    await new Promise(resolve => {
      let value = {
        tabs: payload.tabs,
        key: payload.key,
        title: payload.title,
        color: payload.color
      }

      chrome.storage.sync.set({[payload.key]: value}, () => {
        resolve()
      })
    })

    context.commit('addGroup', payload)
  },
  removeGroup: async (context, payload) => {
    if (!chrome.storage) {
      console.warn('The application must run as chrome extension!')
      return
    }

    await new Promise(resolve => {
      chrome.storage.sync.remove([payload.key], () => {
        resolve()
      })
    })

    context.commit('removeGroup', payload)
  },
  addTab: async (context, payload) => {
    if (!chrome.storage) {
      console.warn('The application must run as chrome extension!')
      return
    }

    let data = await new Promise(resolve => {
      chrome.storage.sync.get(payload.key, (results) => {
        resolve(results[payload.key])
      })
    })

    data.tabs.splice(payload.index || 0, 0, payload.tab)

    await new Promise(resolve => {
      chrome.storage.sync.set({[payload.key]: data}, (results) => {
        resolve(results)
      })
    })

    context.commit('addTab', payload)
  },
  moveTab: async (context, payload) => {
    if (!chrome.storage) {
      console.warn('The application must run as chrome extension!')
      return
    }

    let {group, tabIndex} = await new Promise(resolve => {
      chrome.storage.sync.get(payload.key, (results) => {
        let group = results[payload.key]
        let tabs = group.tabs
        let tabIndex = tabs.findIndex((t) => t.id === payload.id)

        tabs.splice(payload.newIndex, 0, tabs.splice(tabIndex, 1)[0])

        resolve({group, tabIndex})
      })
    })

    await new Promise(resolve => {
      if (chrome.storage) {
        chrome.storage.sync.set({[payload.key]: group}, (results) => {
          resolve(results)
        })
      } else {
        console.warn('The application must run as chrome extension!')
        resolve()
      }
    })

    context.commit('moveTab', {key: payload.key, newIndex: payload.newIndex, oldIndex: tabIndex})
  },
  removeTab: async (context, payload) => {
    if (!chrome.storage) {
      console.warn('The application must run as chrome extension!')
      return
    }

    let data = await new Promise(resolve => {
      chrome.storage.sync.get(payload.key, (results) => {
        let tabs = results[payload.key].tabs
        let index = tabs.findIndex((t) => t.id === payload.id)
        tabs.splice(index, 1)
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
    if (!chrome.storage) {
      console.warn('The application must run as chrome extension!')
      return
    }

    let newGroup = await new Promise(resolve => {
      chrome.storage.sync.get(payload.key, (results) => {
        results[payload.key].tabs.filter((t) => payload.ids.indexOf(t.id) === -1)
        resolve(results[payload.key])
      })
    })

    await new Promise(resolve => {
      chrome.storage.sync.set({[payload.key]: newGroup}, (results) => {
        resolve(results)
      })
    })

    context.commit('removeTabs', payload)
  },
  changeGroup: async (context, payload) => {
    if (!chrome.storage) {
      console.warn('The application must run as chrome extension!')
      return
    }

    let results = await new Promise(resolve => {
      chrome.storage.sync.get(null, (results) => {
        let oldTabs = results[payload.oldKey].tabs
        let newTabs = results[payload.newKey].tabs

        let oldIndex = oldTabs.findIndex(t => t.id === payload.id)
        let newIndex = payload.newIndex

        newTabs.splice(newIndex, 0, oldTabs.splice(oldIndex, 1)[0])

        resolve(results)
      })
    })

    await new Promise(resolve => {
      chrome.storage.sync.set(results, () => {
        resolve()
      })
    })

    context.commit('changeGroup', payload)
  },
  setTitle: async (context, payload) => {
    if (!chrome.storage) {
      console.warn('The application must run as chrome extension!')
      return
    }

    let newGroup = await new Promise(resolve => {
      chrome.storage.sync.get([payload.key], (results) => {
        let group = results[payload.key]
        group.title = payload.title
        resolve(group)
      })
    })

    await new Promise(resolve => {
      chrome.storage.sync.set({[payload.key]: newGroup}, () => {
        resolve()
      })
    })

    context.commit('setTitle', payload)
  }
}

export default {
  state, getters, mutations, actions
}
