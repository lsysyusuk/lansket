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
      server: "",
      // server: "http://127.0.0.1",
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

.vux-header {
  background-color: #f27330 !important;
  margin: 0 0 0.2rem;
  box-shadow: 0 0 0.5rem #000;
}
.page {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  /*width: 100%;*/
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
  /*height: 0;*/
  padding: 0 80%;
  /*opacity: 0;*/
}
/* .expand-leave 定义离开的结束状态 */
.v-leave {
  /*height: 0;*/
  padding: 0 80%;
  /*opacity: 0;*/
}
.main-color {
  color: #f27330;
}
.weui_cells {
  font-size: 0.8rem !important
}
.weui_cell_ft {
  -webkit-flex-box: 3 ;
  flex: 3 ;
}
.weui_cell_primary {
  -webkit-box-fles: 1 !important;
  flex: 1 !important;
  font-size: 0.8rem;
}
.icon {
    margin-right: 0.5rem
}
.nav-btn {
  position: absolute !important; 
  table-layout: fixed; 
  background-color: #f27330 !important; 
  opacity: 0.9; 
  border-radius: 0 !important;
  height: 3rem;
  line-height: normal !important;
  vertical-align: middle !important;
  width: 100%
}
.nav-btn.bottom {
  bottom: 0; 
}
.nav-btn.top {
  top: 0; 
}
.hide {
  display: none !important;
}

.xs-plugin-pulldown-container:after {
    content: '';
    display: block;
    width: 2rem;
    height:1.2rem;
    margin-left: -1rem;
    position: absolute;
    left: 50%;
    bottom: 0.5rem;
    background: url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%2026%2040'%3E%3Cpolygon%20points%3D'9%2C22%209%2C0%2017%2C0%2017%2C22%2026%2C22%2013.5%2C40%200%2C22'%20fill%3D'%238c8c8c'%2F%3E%3C%2Fsvg%3E")  no-repeat center;
}
.xs-plugin-pulldown-up:after {
  transform: rotate(180deg);
  -webkit-transform: rotate(180deg); 
}
.xs-plugin-pullup-undefined {
  display: none
}
.icon_big.weui_icon_info:before {
  font-size: 5rem;
  color: #f27330;
}
</style>

