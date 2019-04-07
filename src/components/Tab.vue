<template>
  <div class="uk-margin uk-margin-small" :id="id">
    <div class="uk-card uk-card-default uk-card-body uk-card-small">
      <div class="uk-grid-small uk-flex-middle" uk-grid>
        <div class="uk-width-auto">
          <img :src="this.tab.favicon" width="16" height="16"/>
        </div>
        <div class="uk-width-expand">
          <div class="uk-text-truncate" @dblclick="restoreTab">
            {{index}} {{this.tab.title}}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Tab',
  props: {
    groupKey: String,
    id: Number,
    index: Number
  },
  methods: {
    restoreTab() {
      chrome.tabs.create({url: this.tab.url})
      this.$store.dispatch('removeTab', { 'key': this.groupKey, 'id': this.id })
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
      padding: 10px 20px;
  }

  .uk-text-truncate {
    cursor: pointer;
  }
</style>
