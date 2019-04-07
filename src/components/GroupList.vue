<template>
  <div class="uk-child-width-1-4@m  uk-child-width-1-2@s" id="group-list" uk-grid="masonry: true">
    <Group v-for="group in groupList" :groupKey="group.key" :key="group.key" />
  </div>
</template>

<script>
import Group from '../components/Group.vue'

export default {
  name: 'GroupList',
  components: {
    Group
  },
  data: () => {
    return {
      groups: []
    }
  },
  mounted() {
    this.$store.dispatch('getGroups')
  },
  computed: {
    groupList() {
      return this.$store.getters.getAllGroups
    }
  }
}
</script>
