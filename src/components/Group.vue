<template>
  <div>
    <div class="uk-grid" uk-grid>
      <div class="uk-width-expand uk-first-column">
        <div v-if="!edit" @dblclick="showEdit" class="uk-text uk-text-large uk-text-capitalize">{{title}}</div>
        <form v-else @submit="editTitle">
          <input class="uk-input uk-form-small"
                 v-bind:class="{ 'uk-form-danger': hasError }"
                 @keyup="onChangeHandler"
                 placeholder="Title"
                 v-model="title">
        </form>
      </div>
      <div class="uk-width-auto">
        <ul class="uk-iconnav">
          <span class="uk-icon icon-button"
                uk-icon="download"
                uk-tooltip="title: Export Urls; pos: top-center; delay: 200"/>
          <span class="uk-icon icon-button"
                uk-icon="forward"
                uk-tooltip="title: Restore All; pos: top-center; delay: 200"
                @click="restoreTabs"/>
          <span class="uk-icon icon-button"
                uk-icon="trash"
                uk-tooltip="title: Delete Group; pos: top-center; delay: 200"
                @click="removeGroup" />
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

// TODO: addCustomGroups, OpenOnlySelected, DeleteOnlySelected, UpdateOnDrag, Export
// TODO: FIX sameUrl -> sameId

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
      title: 'Untitled',
      hasError: false
    }
  },
  beforeMount() {
    // fetch title
    this.title = 'Untitled'
  },
  mounted() {
    let ref = this.$refs[this.getKey.toString()]
    let $el = ref.$el

    // Change position between groups
    UIkit.util.on($el, 'added', (e, options, item) => {
      console.log('added triggered', [e, options, item])
      // different groups
      let newGroupKey = e.target.id
      console.log({'oldKey': this.getKey, 'newKey': newGroupKey})
      ////// ??????????? ///////
      // update
    });

    // Change position in the same group
    UIkit.util.on($el, 'moved', (e, options, item) => {
      let id = item.id
      let key = e.target.id
      let newIndex = [...ref.$el.children].findIndex((child) => child.id === id)

      this.$store.dispatch('moveTab', { key, id, newIndex })
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
        // dispatch
      }
    },
    onChangeHandler() {
      if (this.title === '') {
        this.hasError = true
        // title required
      } else if (this.title.length > 12) {
        this.hasError = true
        // title must be less than 12 characters long
      } else {
        this.hasError = false
      }
    },
    showEdit() {
      this.edit = true
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
