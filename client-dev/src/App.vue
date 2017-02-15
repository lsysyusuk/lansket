<template>
  <div >
    <!-- <transition name="fade"> -->
      <router-view @upup='doToast()' keep-alive transition transition-mode="out-in"></router-view>
    <!-- </transition> -->
      <toast :show.sync="toast.show" :text="toast.text" :type="toast.type"></toast>
      <loading :show.sync="loading" :text="'加载中'"></loading>
  </div>
</template>

<script>
import {Toast, Loading} from 'vux/src/components';
export default {
  components: {
    Toast,
    Loading
  },
  data: function () {
    return {
      toast:{show:false, type:"success", text:""},
      loading:false,
      // server: "",
      server: "http://127.0.0.1",
    }
  },
  events: {
    doToast: function(text, type) {
      this.toast.text = text;
      if (type && type.length > 0) {
        this.toast.type = type;
      }
      this.toast.show = true;
    },
  }
}
 
</script>


<style lang="less">
@import '~vux/src/styles/reset';
@import '~font-awesome/less/font-awesome';

</style>
<style>
/*@import '~font-awesome/css/font-awesome.min.css'*/

html {
  height: 100%
}
body {
  background-color: #fbf9fe;
  overflow: hidden;
  height: 100%;
}

@media screen and (min-width: 320px) {
  html {
    font-size: 14px !important;
  }
}

@media screen and (min-width: 360px) {
  html {
    font-size: 16px !important;
  }
}

.page {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  font-size: 16px;
  height: 100%;
  background: url(assets/flour.png);
  overflow: hidden
}
.v-transition {
  transition: all .3s ease;
  /*height: 30px;*/
  padding: auto;
  overflow: hidden;
}
/* .expand-enter 定义进入的开始状态 */
.v-enter {
  height: 0;
  padding: 0 80%;
  opacity: 0;
}
/* .expand-leave 定义离开的结束状态 */
.v-leave {
  height: 0;
  padding: 0 80%;
  opacity: 0;
}
</style>

