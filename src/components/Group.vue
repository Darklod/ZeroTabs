<template>
  <div>
    <div class="uk-grid" uk-grid>
      <div class="uk-width-expand uk-first-column">
        <div v-if="!edit"
             @dblclick="showEdit"
             class="uk-text uk-text-large uk-text-capitalize">
             {{group.title || 'Untitled'}}
        </div>
        <form v-else @submit="editTitle">
          <input class="uk-input uk-form-small"
                 v-bind:class="{ 'uk-form-danger': hasError }"
                 ref="editTitle"
                 @keyup="onChangeHandler"
                 placeholder="題を入力"
                 v-model="newTitle">
        </form>
      </div>
      <div class="uk-width-auto">
        <ul class="uk-iconnav">
          <li>
            <span class="uk-icon icon-button"
                uk-icon="download"
                uk-tooltip="title: Export Urls; pos: top-center; delay: 200"
                @click="download"/>
          </li>
          <li>
            <span class="uk-icon icon-button"
                uk-icon="forward"
                uk-tooltip="title: Restore All; pos: top-center; delay: 200"
                @click="restoreTabs"/>
          </li>
          <li>
            <span class="uk-icon icon-button"
                uk-icon="trash"
                uk-tooltip="title: Delete Group; pos: top-center; delay: 200"
                @click="removeGroup" />
          </li>
        </ul>
      </div>
    </div>
    <div class="uk-grid uk-grid-match uk-margin-bottom uk-margin-remove-top" uk-grid>
      <div class="uk-width-expand uk-text uk-text-small">{{getDate}}</div>
      <div class="uk-width-auto uk-text uk-text-small">{{group.tabs.length || 0}}タブ</div>
    </div>
    <TabList uk-sortable="group: sortable-group" :groupKey="groupKey" :id="groupKey" :ref="groupKey"/>
  </div>
</template>

// TODO: addCustomGroups, OpenOnlySelected, DeleteOnlySelected

<script>
import TabList from '../components/TabList.vue'
import UIkit from 'uikit'

export default {
  name: 'Group',
  components: {
    TabList
  },
  props: {
    groupKey: String
  },
  data: () => {
    return {
      edit: false,
      hasError: false,
      newTitle: ''
    }
  },
  mounted() {
    let $el = this.$refs[this.getKey.toString()].$el

    // Change position between groups
    UIkit.util.on($el, 'added', (e, options, item) => {
      let newKey = e.target.id // new group key
      let newIndex = [...$el.children].findIndex((child) => child.id === item.id)
      this.$store.dispatch('add', {newKey, newIndex})
    });

    UIkit.util.on($el, 'removed', (e, options, item) => {
      let oldKey = e.target.id // old group key
      let tabId = parseInt(item.id)
      this.$store.dispatch('remove', {oldKey, tabId})
    })

    UIkit.util.on($el, 'stop', (e, options, item) => {
      if (this.move.added && this.move.removed) {
        this.$store.dispatch('changeGroup', {
          oldKey: this.move.oldKey,
          newKey: this.move.newKey,
          newIndex: this.move.newIndex,
          id: this.move.tabId
        })
        this.$store.dispatch('reset')
      }
    })

    // Change position in the same group
    UIkit.util.on($el, 'moved', (e, options, item) => {
      let key = e.target.id
      let newIndex = [...$el.children].findIndex((child) => child.id === item.id)

      this.$store.dispatch('moveTab', { key, id: parseInt(item.id), newIndex })
    });
  },
  computed: {
    getDate() {
      let millis = parseInt(this.groupKey)
      let date = new Date(millis)
      let d = date.getDate()
      let M = date.getMonth()
      let y = date.getFullYear()
      let h = ('0' + date.getHours()).slice(-2)
      let m = ('0' + date.getMinutes()).slice(-2)
      return y + "年" + M + "月" + d + "日" + " - " + h + ":" + m
    },
    group() {
      return this.$store.getters.getGroupByKey(this.groupKey)
    },
    getEditState() {
      return this.edit
    },
    getKey() {
      return this.groupKey
    },
    move() {
      return this.$store.getters.getMove
    }
  },
  methods: {
    removeGroup() {
      this.$store.dispatch('removeGroup', { 'key': this.groupKey })
    },
    restoreTabs() {
      this.group.tabs.forEach(tab => chrome.tabs.create({ url: tab.url }))

      let ids = this.group.tabs.map((tab) => tab.id)
      this.$store.dispatch('removeTabs', { 'key': this.groupKey, 'ids': ids })
    },
    editTitle(e) {
      e.preventDefault()

      if (!this.hasError) {
        this.edit = false
        this.$store.dispatch('setTitle', { key: this.groupKey, title: this.newTitle })
      }
    },
    onChangeHandler(e) {
      if (e.keyCode == 27) {
        this.edit = false
        return
      }

      if (this.newTitle === '') {
        this.hasError = true
        // title required
        console.log('title required')
      } else if (this.newTitle.length > 12) {
        this.hasError = true
        // title must be less than 12 characters long
        console.log('title must be less than 12 characters long')
      } else {
        this.hasError = false
      }
    },
    showEdit() {
      this.edit = true
      this.newTitle = this.group.title
      this.$nextTick(function() {   // function scope needed
        this.$refs["editTitle"].focus()
      });
    },
    download() {
      let urls = this.group.tabs.map(t => t.url).join('\n')
      
      let blob = new Blob([urls], {type: "text/plain"});
      let url = URL.createObjectURL(blob);

      chrome.downloads.download({ url: url, filename: this.group.title.concat('.txt') })
    }
  }
}

</script>

<style scoped>
  .uk-sortable {
    border: 4px dashed white;
    padding: 10px;
  }

  .uk-text {
    color: white;
  }

  .uk-icon {
    display: flex;
    justify-content: center;
    height: 36px;
    float: right;
    margin: 0;

    color: white;
    cursor: pointer;
    transition: all .2s ease-in-out;
  }

  .uk-icon:hover {
      transform: scale(1.3)
  }

  .uk-input.uk-form-danger {
    border: 1px solid #f0506e;
  }
</style>
