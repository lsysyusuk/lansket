<template>
  <div class='app-root'>
    <x-header class='nav-btn top' :left-options="{showBack: showBack}" :right-options="{showMore: showMore}" @on-click-more="clickRight" >{{title}}<div v-if=showMenu slot='left'><i class='fa-i fa fa-user-circle' style='font-size: 1.3rem; margin-left: -0.3rem;' aria-hidden='true' @click='clickLeft'></i></div></x-header>
    <!-- <transition name="fade"> -->
      <router-view v-if='show' @upup='doToast()' keep-alive transition transition-mode="out-in"></router-view>
    <!-- </transition> -->
      <toast :show.sync="toast.show" :text="toast.text" :type="toast.type"></toast>
      <loading :show.sync="loading" :text="'加载中'"></loading>
      <a v-if='showBack' @click='back' class="bottom-back"><i class='fa-i fa fa-chevron-left' aria-hidden='true'></i></a>
  </div>
</template>

<script>
import {Toast, Loading, XHeader} from 'vux/src/components';
export default {
  components: {
    Toast,
    Loading,
    XHeader
  },
  data: function () {
    return {
      toast:{show:false, type:"success", text:""},
      loading:false,
      server: "",
      show: false,
      showBack: false,
      showMore: false,
      showMenu: false,
      leftMenu: '',
      title: '篮 途'
      // server: "http://127.0.0.1",
    }
  },
  created () {
      setTimeout(() => {
          this.show = true;
      }, 0);
  },
  events: {
    doToast: function(text, type) {
      this.toast.text = text;
      if (type && type.length > 0) {
        this.toast.type = type;
      }
      this.toast.show = true;
    },
    initMenu: function(option, clickLeft, clickRight) {
      if (typeof option.showBack != 'undefined') {
        this.showBack = option.showBack;
      }
      if (typeof option.showMore != 'undefined') {
        this.showMore = option.showMore;
      }
      if (typeof option.showMenu != 'undefined') {
        this.showMenu = option.showMenu;
      }
      if (typeof option.title != 'undefined') {
        this.title = option.title;
      }
      if (typeof clickLeft == 'function') {
        this.clickLeft = clickLeft;
      }
      if (typeof clickRight == 'function') {
        this.clickRight = clickRight;
      }
    }
  },
  methods: {
    clickRight: function() {

    },
    clickLeft: function() {

    },
    back: function () {
      history.back()
    }
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
  overflow: hidden;
  padding-top: 3.1rem
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
  width: 100%;
  z-index: 100;
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
.bottom-back {
  position: absolute;
  right: 0;
  bottom: 4rem;
  width: 2.5rem;
  height: 2.5rem;
  background-color: #f27330;
  text-align: center;
  border-radius: 2rem;
  opacity: 0.9;
}
.bottom-back i {
  font-size: 1.3rem; 
  margin-left: -0.3rem; 
  color: #fff;
  line-height: 2.5rem
}
.vux-header .vux-header-left .vux-header-back {
  /*width: 2rem;*/
  /*height: 2rem;*/
  /*margin-left: -.5rem;*/
  /*margin-top: -.5rem;*/
}
</style>

