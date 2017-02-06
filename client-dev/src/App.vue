<template>
  <div >
    <!-- <transition name="fade"> -->
      <router-view keep-alive transition transition-mode="out-in"></router-view>
    <!-- </transition> -->
  </div>
</template>

<script >
 
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

