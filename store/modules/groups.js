/* eslint-disable no-console */
/* global chrome */

const state = {
  groups: []
}

// development data test
const groups = JSON.parse('{"1554551963368":[{"favicon":"chrome-extension://nbbgobnnpkdldnlpeiijaglahllflndk/favicon.ico","id":-1265693564,"tabId":50,"timestamp":1554551963269,"title":"vueextension","url":"chrome-extension://nbbgobnnpkdldnlpeiijaglahllflndk/index.html"},{"favicon":"https://github.githubassets.com/favicon.ico","id":-1295036108,"tabId":26,"timestamp":1554551963269,"title":"UIkit sortable javascript · GitHub","url":"https://gist.github.com/malles/1d1c06eda67cc24aea23"},{"favicon":"https://elearning.unimib.it/theme/image.php/bicocca/theme/1554188620/favicon","id":-843320980,"tabId":13,"timestamp":1554551963269,"title":"Corso: Analisi e Progettazione del Software","url":"https://elearning.unimib.it/course/view.php?id=19224"},{"favicon":"https://cdn.sstatic.net/Sites/stackoverflow/img/favicon.ico?v=4f32ecc8f43d","id":-2089108960,"tabId":45,"timestamp":1554551963269,"title":"How do I correctly clone a JavaScript object? - Stack Overflow","url":"https://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object"},{"favicon":"https://maslosoft.com/icon-32-precomposed.png","id":2110557539,"tabId":43,"timestamp":1554551963269,"title":"How to add array element at specific index in JavaScript? · Maslosoft","url":"https://maslosoft.com/kb/how-to-add-array-element-at-specific-index-in-javascript/"}],"1554630520886":[{"favicon":"https://elearning.unimib.it/theme/image.php/bicocca/theme/1554188620/favicon","id":-2003392132,"tabId":16,"timestamp":1554630520838,"title":"1819-2-E3101Q109","url":"https://elearning.unimib.it/enrol/index.php?id=19224"},{"favicon":"https://en.wikipedia.org/static/favicon/wikipedia.ico","id":1641984888,"tabId":20,"timestamp":1554630520838,"title":"Variance - Wikipedia","url":"https://en.wikipedia.org/wiki/Variance"},{"favicon":"chrome-extension://nbbgobnnpkdldnlpeiijaglahllflndk/favicon.ico","id":-1265693564,"tabId":28,"timestamp":1554630520838,"title":"vueextension","url":"chrome-extension://nbbgobnnpkdldnlpeiijaglahllflndk/index.html"},{"favicon":"https://www.matematicamente.it/forum/styles/style-matheme_se/imageset/favicon-1.0.12.ico","id":514825244,"tabId":19,"timestamp":1554630520838,"title":"linearità del valore atteso - Leggi argomento • Matematicamente.it","url":"https://www.matematicamente.it/forum/linearita-del-valore-atteso-t95302.html"}],"1554711772546":[{"favicon":"https://en.wikipedia.org/static/favicon/wikipedia.ico","id":-2084449721,"tabId":75,"timestamp":1554711772517,"title":"Central limit theorem - Wikipedia","url":"https://en.wikipedia.org/wiki/Central_limit_theorem"},{"favicon":"https://elearning.unimib.it/theme/image.php/bicocca/theme/1554188620/favicon","id":149128976,"tabId":69,"timestamp":1554711772517,"title":"e-Learning - UNIMIB: Log in to the site","url":"https://elearning.unimib.it/login/index.php"},{"favicon":"https://elearning.unimib.it/theme/image.php/bicocca/theme/1554188620/favicon","id":-2003392132,"tabId":68,"timestamp":1554711772516,"title":"1819-2-E3101Q109","url":"https://elearning.unimib.it/enrol/index.php?id=19224"},{"favicon":"https://en.wikipedia.org/static/favicon/wikipedia.ico","id":1641984888,"tabId":72,"timestamp":1554711772517,"title":"Variance - Wikipedia","url":"https://en.wikipedia.org/wiki/Variance"}]}')

const getters = {
  getAllGroups: state => {
    if (!chrome.storage) {
      // out of chrome testing
      state.groups = []
      for (let g in groups) {
        if (groups.hasOwnProperty(g)) {
          state.groups.push({key: g, tabs: groups[g]})
        }
      }
    }
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
        groups.push({ key, tabs: [...data[key]] })
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
      chrome.storage.sync.set({[payload.key]: payload.tabs}, () => {
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

    data.splice(payload.index || 0, 0, payload.tab)

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

    let {tabs, tabIndex} = await new Promise(resolve => {
      chrome.storage.sync.get(payload.key, (results) => {
        let tabs = results[payload.key]
        let tabIndex = tabs.findIndex((t) => t.id === payload.id)

        tabs.splice(payload.newIndex, 0, tabs.splice(tabIndex, 1)[0])

        resolve({tabs, tabIndex})
      })
    })

    await new Promise(resolve => {
      if (chrome.storage) {
        chrome.storage.sync.set({[payload.key]: tabs}, (results) => {
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
    if (!chrome.storage) {
      console.warn('The application must run as chrome extension!')
      return
    }

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
  },
  changeGroup: async (context, payload) => {
    if (!chrome.storage) {
      console.warn('The application must run as chrome extension!')
      return
    }

    let results = await new Promise(resolve => {
      chrome.storage.sync.get(null, (results) => {
        let oldTabs = results[payload.oldKey]
        let newTabs = results[payload.newKey]

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
  }
}

export default {
  state, getters, mutations, actions
}
