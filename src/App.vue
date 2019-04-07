<template>
  <div class="uk-container uk-container-center">
    <!--<h1 class="uk-heading-primary" id="title">ゼロタブ</h1>-->
    <div class="uk-section">
      <div class="uk-container">
        <GroupList />

        <br />
        <button v-on:click="addGroup">NEW GROUP</button>
        <br />

      </div>
    </div>
  </div>
</template>

<script>
import GroupList from './components/GroupList.vue'
import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';

UIkit.use(Icons);

export default {
  name: 'app',
  components: {
    GroupList
  },
  methods: {
    addGroup() {
      let timestamp = Date.now().toString()
      this.$store.dispatch('saveGroup', { 'key': timestamp, 'tabs': [] })
    }
  }
}
</script>

<style lang="less">
  @import "../node_modules/uikit/src/less/uikit.less";
  @font_path: "assets/fonts";

  * {
    font-family: 'Noto Sans';
    font-size: 12px;
  }

  html {
    background-attachment: fixed;
    background-image: linear-gradient(-225deg, #3D4E81 0%, #5753C9 48%, #6E7FF3 100%);
    height: 100%;
  }

  @font-face {
    font-family: "KosugiMaru";
    src: url("@{font_path}/KosugiMaru-Regular.ttf");
  }

  #title {
    font-family: "KosugiMaru";
    color: white;
  }
</style>
