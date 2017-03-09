<template>
  <div class="appoint page">
    <x-header :left-options="{showBack: false}" :right-options="{showMore: isManager}" >篮&nbsp;&nbsp;途</x-header>
    <x-button type='primary' style="position: fixed; bottom: 0; background-color:#f27330; opacity: 0.9; border-radius: 0;" @click='doAppoint'>微信支付</x-button>
  </div>
</template>

<script>
import {XHeader, Group, Cell, ButtonTab, ButtonTabItem, XButton, Confirm, Scroller, XInput} from 'vux/src/components';
import { _ } from 'underscore/underscore-min';
export default {
  components: {
    Group,
    Cell,
    XHeader,
    ButtonTab,
    ButtonTabItem,
    XButton,
    Confirm,
    Scroller,
    XInput
  },
  data: function (){
    console.log("data start");
    
    
    return {
      // note: changing this line won't causes changes
      // with hot-reload because the reloaded component
      // preserves its current state and we are modifying
      // its initial state.
      args: {}
    }
    
  },
  ready (){
    console.log("ready start");
    window.lantu = {};
    var that = this;
    lantu.onBridgeReady = function() {
      alert(1)
      WeixinJSBridge.invoke('getBrandWCPayRequest', that.args, function (res) {
          if (res.err_msg == "get_brand_wcpay_request:ok") {
            // 进入订单系那详情画面
            console.log('success')
          } else {
            alert(res.err_msg)
            console.log('fail')
          }
        });
    }
    var that = this;
    that.$root.loading = true;
    that.$http.get(this.$root.server + '/lantu/customer/earnest/pay.json?code=' + that.$route.params.code).then(function (res) {
      console.log(res.data.payargs);
      that.args = res.data.payargs;
      that.$root.loading = false;
    });
  },
  methods: {
    doAppoint: function () {
      console.log('pay');
      if (typeof WeixinJSBridge == "undefined") {
        if (document.addEventListener) {
          document.addEventListener('WeixinJSBridgeReady', lantu.onBridgeReady, false);
        } else if (document.attachEvent) {
          document.attachEvent('WeixinJSBridgeReady', lantu.onBridgeReady);
          document.attachEvent('onWeixinJSBridgeReady', lantu.onBridgeReady);
        }
      } else {
        lantu.onBridgeReady();
      }
    }
  }
}

</script>

<style scope>
.logo {
  width: 100px;
  height: 100px
}
</style>