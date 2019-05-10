<template>
  <div class="uk-margin uk-margin-small"
       v-long-press="300"
       @long-press-start="onLongPressStart"
       @long-press-stop="onLongPressStop"
       :id="id">
    <div class="uk-card uk-card-default uk-card-body uk-card-small tab" :ref="id + '-bg'">
      <div class="uk-grid-small uk-flex-middle" uk-grid>
        <div class="uk-width-auto">
          <img alt="icon" :src="this.tab.favicon" width="16" height="16"/>
        </div>
        <div class="uk-width-expand">
          <div class="uk-text-truncate" :ref="id + '-text'" @dblclick="restoreTab">
            {{this.tab.title}}
          </div>
        </div>
        <div class="uk-width-auto">
          <a class="uk-icon icon-button"
             uk-icon="close"
             uk-tooltip="pos: right; title: Delete"
             @click="removeTab"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LongPress from 'vue-directive-long-press'

export default {
  name: 'Tab',
  props: {
    groupKey: String,
    id: Number,
    index: Number
  },
  directives: {
    'long-press': LongPress
  },
  methods: {
    restoreTab() {
      chrome.tabs.create({url: this.tab.url})
      this.$store.dispatch('removeTab', { 'key': this.groupKey, 'id': this.id })
    },
    removeTab() {
      this.$store.dispatch('removeTab', { 'key': this.groupKey, 'id': this.id })
    },
    onLongPressStart () {
      // triggers after 300ms of mousedown
      // this.$refs[this.id + "-bg"].style.background = 'black'
      // this.$refs[this.id + "-text"].style.color = 'white'
    },
    onLongPressStop () {
     // triggers on mouseup of document
    }
  },
  computed: {
    tab() {
      return this.$store.getters.getTab(this.groupKey, this.id)
    }
  }
}
</script>

<style scoped>
  .uk-card-small.uk-card-body {
      padding: 10px;
  }

  .uk-text-truncate {
    cursor: pointer;
  }

  img {
    background: #f8f8f8;
  }
</style>
