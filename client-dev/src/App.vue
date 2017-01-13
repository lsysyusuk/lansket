<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<style lang="less">
@import '~vux/src/styles/reset';

</style>
<style>
	body {
  background-color: #fbf9fe;
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
body {
	overflow: hidden
}
</style>

