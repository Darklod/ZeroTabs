<template>
  <div>
    <Tab v-for="(tab, index) in tabs" :groupKey="groupKey" :index="index" :id="tab.id" :key="tab.id" />
  </div>
</template>

<script>
import Tab from '../components/Tab.vue'

export default {
  name: 'TabList',
  components: {
    Tab
  },
  props: {
    groupKey: String
  },
  computed: {
    tabs() {
      return this.$store.getters.getTabs(this.groupKey)
    }
  }
}
</script>
