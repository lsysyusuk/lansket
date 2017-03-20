<template>
  <div class="order page" style="background:#fff">
    <x-header class='nav-btn top' :left-options="{showBack: true}" :right-options="{showMore: isManager}" >订单详情</x-header>
    <div class='content' :class='[!appoint.isPay ? "has-bottom" : "", appoint.code ? "" : "hide"]'>
      <group title='订单信息'>
      <cell title=' 订单号' :value='appoint.code'>
        <i slot="icon" width="20" class="fa-i fa fa-list-alt main-color icon"  aria-hidden="true"></i>
      </cell>
      <cell title='创建时间' :value='appoint.createTime | formateDateTime'>
        <i slot="icon" width="20" class="fa-i fa fa-clock-o main-color icon"  aria-hidden="true"></i>
      </cell>
      <cell title='预定时间'>
        <i slot="icon" width="20" class="fa-i fa fa-clock-o main-color icon"  aria-hidden="true"></i>
        {{appoint.appointDate}} ({{appoint.appointDate | week}})
      </cell>
      <cell title='总价'>
        <i slot="icon" width="20" class="fa-i fa fa-money main-color icon"  aria-hidden="true"></i>
        <div slot="value">
          <span class='main-color'>{{appoint.price}}元</span>
        </div>
      </cell>
      <cell title='状态'>
        <i slot="icon" width="20" class="fa-i fa fa-cog main-color icon"  aria-hidden="true"></i>
        <div slot="value">
          <span class='main-color'>{{appoint.isPay | status appoint.valid}}</span>
        </div>
      </cell>
      </group>
      <divider class="tips"><i class="fa-i fa fa-exclamation-circle main-color icon" aria-hidden="true"></i>支付后不可更改，如有任何疑问，请联系球场</divider>
      <group title='预定场次' class='ep-info'>
        <cell  v-for='ae in appoint.appointInfo' :title='ae.episode | episodeCourt ae.court' >
          <div slot='value'>
            <span class='main-color'>￥{{ae.episode | getPrice appoint.appointDate}}</span>
          </div>
        </cell>
      </group>
    </div>
    <x-button :class='appoint.isPay || !appoint.valid ? "hide" : ""' type='primary' class='nav-btn bottom' @click='doAppoint'>微信支付</x-button>
  </div>
</template>

<script>
import {XHeader, Group, Cell, ButtonTab, ButtonTabItem, XButton, Confirm, Scroller, XInput, Divider} from 'vux/src/components';
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
    XInput,
    Divider
  },
  data: function (){
    console.log("data start");
    return {
      // note: changing this line won't causes changes
      // with hot-reload because the reloaded component
      // preserves its current state and we are modifying
      // its initial state.
      args: {},
      appoint: {},
      expire: '',
      lock: false
    }
    
  },
  ready (){
    console.log("ready start");
  },
  route: {
    data (transition) {
      console.log("route start");
      window.lantu = {};
      var that = this;
      lantu.onBridgeReady = function() {
        WeixinJSBridge.invoke('getBrandWCPayRequest', that.args, function (res) {
            if (res.err_msg == "get_brand_wcpay_request:ok") {
              // 进入订单系那详情画面
              console.log('success');
              that.appoint.isPay = true;
              that.$root.$emit('doToast', "支付成功", "success")
            } else {
              console.log('fail');
              that.$root.$emit('doToast', "支付失败,请返回并重新预定", "warn");
              that.lock = false;
            }
          });
      }
      var that = this;
      that.$root.loading = true;
      that.$http.get(this.$root.server + '/lantu/customer/earnest/pay.json?code=' + that.$route.params.code).then(function (res) {
        console.log(res.data.payargs);
        that.args = res.data.payargs;
        that.appoint = res.data.appoint;
        that.expire = res.data.expire;
        that.$root.loading = false;
      });
    }
  },
  methods: {
    doAppoint: function () {
      if (this.lock) {
        return ;
      }
      this.lock = true;
      console.log('pay');
      if (new Date() > new Date(this.expire)) {
        return that.$root.$emit('doToast', "订单已过期,请返回并重新预定", "warn");
      }
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
.ep-info .weui_cell_primary {
    -webkit-box-fles: 2 !important;
    flex: 2 !important;
}
.ep-info .weui_cells {
  /*max-height: 15rem;*/
  overflow-y: auto;
}
.order {
  overflow: auto
}
.content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  top: 3rem;
  overflow: auto;
}
.content.has-bottom {
  bottom: 3rem;
}
.tips {
  font-size: 0.6rem;
  color: red;
}
.vux-divider:after, .vux-divider:before {
  background: none
}
</style>