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
      if (chrome.storage) {
        chrome.storage.sync.get(payload.key, (results) => {
          resolve(results)
        })
      } else {
        console.warn('The application must run as chrome extension!')
        resolve()
      }
    })
    context.commit('addGroup', data)
  },
  getGroups: async (context) => {
    let data = await new Promise(resolve => {
      if (chrome.storage) {
        chrome.storage.sync.get(null, (results) => {
          resolve(results)
        })
      } else {
        console.warn('The application must run as chrome extension!')
        resolve()
      }
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
      if (chrome.storage) {
        chrome.storage.sync.set({[payload.key]: payload.tabs}, () => {
          resolve()
        })
      } else {
        console.warn('The application must run as chrome extension!')
        resolve()
      }
    })
    context.commit('addGroup', payload)
  },
  removeGroup: async (context, payload) => {
    await new Promise(resolve => {
      if (chrome.storage) {
        chrome.storage.sync.remove([payload.key], () => {
          resolve()
        })
      } else {
        console.warn('The application must run as chrome extension!')
        resolve()
      }
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
      if (chrome.storage) {
        chrome.storage.sync.get(payload.key, (results) => {
          let tabs = results[payload.key]
          let tabIndex = tabs.findIndex((t) => t.id.toString() === payload.id)

          tabs.splice(payload.newIndex, 0, tabs.splice(tabIndex, 1)[0])

          resolve({tabs, tabIndex})
        })
      } else {
        console.warn('The application must run as chrome extension!')
        resolve()
      }
    })

    // save tabs in the storage
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
    let data = await new Promise(resolve => {
      if (chrome.storage) {
        chrome.storage.sync.get(payload.key, (results) => {
          let index = results[payload.key].findIndex((t) => t.id === payload.id)
          results[payload.key].splice(index, 1)
          resolve(results[payload.key])
        })
      } else {
        console.warn('The application must run as chrome extension!')
        resolve()
      }
    })

    data = await new Promise(resolve => {
      if (chrome.storage) {
        chrome.storage.sync.set({[payload.key]: data}, (results) => {
          resolve(results)
        })
      } else {
        console.warn('The application must run as chrome extension!')
        resolve()
      }
    })

    context.commit('removeTab', payload)
  },
  removeTabs: async (context, payload) => {
    let newTabs = await new Promise(resolve => {
      if (chrome.storage) {
        chrome.storage.sync.get(payload.key, (results) => {
          results = results[payload.key].filter((t) => payload.ids.indexOf(t.id) === -1)
          resolve(results)
        })
      } else {
        console.warn('The application must run as chrome extension!')
        resolve()
      }
    })

    await new Promise(resolve => {
      if (chrome.storage) {
        chrome.storage.sync.set({[payload.key]: newTabs}, (results) => {
          resolve(results)
        })
      } else {
        console.warn('The application must run as chrome extension!')
        resolve()
      }
    })

    context.commit('removeTabs', payload)
  }
}

export default {
  state, getters, mutations, actions
}
