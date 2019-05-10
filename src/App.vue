<template>
  <div id="container">
    <div class="uk-container uk-container-center">
      <div class="uk-section">
        <div class="uk-container">
          <GroupList />
        </div>
      </div>
    </div>
    <footer class="uk-sticky uk-padding-small">
      <div class="uk-card uk-card-small uk-card-default uk-card-body" id="footer-padding">
        <div class="uk-grid-collapse" uk-grid>
          <div class="uk-width-expand" id="center-title">
            <h3>ゼロタブ</h3>
          </div>
          <div class="uk-width-auto">
            <button class="uk-button uk-button-default" type="button" v-on:click="addGroup">NEW GROUP</button>
          </div>
        </div>
      </div>
    </footer>
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
      this.$store.dispatch('saveGroup', { 'key': timestamp, 'tabs': [], 'title': '', color: '' })
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

  #center-title {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  #container {
    margin-bottom: 110px;
    overflow: auto;
    height: calc(100vh - 110px);
  }

  #container::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
    background-color: #F5F5F5;
  }

  #container::-webkit-scrollbar {
    margin-right: 15px;
    width: 10px;
    background-color: #F5F5F5;
  }

  #container::-webkit-scrollbar-thumb {
    background-color: #F90; 
    background-image: linear-gradient(45deg,
                                      rgba(255, 255, 255, .2) 25%,
                                      transparent 25%,
                                      transparent 50%,
                                      rgba(255, 255, 255, .2) 50%,
                                      rgba(255, 255, 255, .2) 75%,
                                      transparent 75%,
                                      transparent)
  }

  footer {
    position: fixed;
    bottom: 0;
    right: 0;
    left: 0;
    margin: auto;
  }

  #footer-padding {
    padding: 10px 10px 10px 20px;
  }

</style>
