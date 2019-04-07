/* global chrome */

chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.getAllInWindow(null, (tabs) => {
    tabs = tabs.map((tab) => {
      return {
        id: hashCode(tab.url),
        tabId: tab.id,
        url: tab.url,
        favicon: tab.favIconUrl,
        title: tab.title,
        timestamp: Date.now()
      }
    })

    chrome.tabs.create({ url: 'index.html' }, (activeTab) => {
      let Ids = tabs.map((tab) => tab.tabId).filter((id) => id !== activeTab.id)

      let timestamp = Date.now().toString()

      chrome.storage.sync.get(timestamp, (results) => {
        // merge old to new tabs to avoid losses
        let savedTabs = results[timestamp]
        if (savedTabs && savedTabs.length > 0) {
          tabs = arrayUnion(tabs, savedTabs)
        }
        // remove duplicates
        tabs = getUnique(tabs, 'id')

        // save to the store
        chrome.storage.sync.set({[timestamp]: tabs}, () => {
          chrome.tabs.remove(Ids, () => {
            // removed
          })
        })
      })
    })
  })
})

let hashCode = (str) => {
  var hash = 0

  if (str.length === 0) {
    return hash
  }

  for (var i = 0; i < str.length; i++) {
    var char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }

  return hash
}

// source: https://www.w3resource.com/javascript-exercises/javascript-array-exercise-22.php
let arrayUnion = (a, b) => {
  let obj = {}

  for (let i = a.length - 1; i >= 0; --i) {
    obj[a[i].id] = a[i]
  }

  for (let i = b.length - 1; i >= 0; --i) {
    obj[b[i].id] = b[i]
  }

  let res = []
  for (let k in obj) {
    if (obj.hasOwnProperty(k)) {
      res.push(obj[k])
    }
  }

  return res
}

// source: https://dev.to/eatsjobs/comment/771m
let getUnique = (arr, key) => {
  const map = new Map()

  arr.map(el => {
    if (!map.has(el[key])) {
      map.set(el[key], el)
    }
  })

  return [...map.values()]
}
