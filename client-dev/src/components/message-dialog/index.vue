<template>
	<message-dialog class="message-dialog">
		<confirm :show.sync="phone_show" :cancel-text="'取消'" :confirm-text="'确认'" :title="'手机绑定'" @on-confirm="doBindPhone(phone,verifyCode)" >
	        <input type="text" placeholder="手机号" v-model="phone" style="width: 90%; border: 1px solid #a0a0a0; border-radius: .25rem; height: 1.6rem; padding-left: 0.5rem;" />
	        <div style="margin-top: 1rem;">
	          <input type="text" placeholder="验证码" v-model="verifyCode" style="width: 40%; border: 1px solid #a0a0a0; border-radius: .25rem; height:ΩΩΩ 1.6rem; padding-left: 0.5rem; margin-right: 9%;" />
	          <x-button mini type="primary" :disabled="!isNaN(countTime)" style="width:40%; font-size: 0.8rem" @click='doSendCode(phone)'>{{verify}}{{countTime}}</x-button>
	        </div>
  		</confirm>
	</message-dialog>
</template>

<script>
import {XButton, Confirm} from 'vux/src/components';
export default {
	components: {
    XButton,
    Confirm
  },
  data: function () {
  	return {
      verify:'',
      countTime:'发送验证码',
      phone: null,
      verifyCode: null
    }
  },
  props: {
  	phone_show: false,
  	isBindPhone: false
  },
  methods: {
  	doSendCode (phone) {
      if (!isNaN(this.countTime)) {
        return;
      }
      var re_phone = /\d{11}/;
      if (!re_phone.test(phone)) {
        return this.$root.$emit("doToast", "您输入的手机号有误", "warn");
      }
      var that = this;
      
      this.$root.loading = true;
      that.$http.get(this.$root.server + '/lantu/verifyPhone/sendCode?phone=' + phone).then(function (res) {
        if (res.data.status == 0) {
          that.$root.$emit("doToast", res.data.msg, "warn");
        } if (res.data.status == 1) {
          that.verify = '已发送:';
          that.countTime = 60;
          var inter = setInterval(function(){
            if ((that.countTime--) < 1) {
              clearInterval(inter);
              that.verify = '';
              that.countTime = '重新发送';
            }
          }, 1000);
        }
        that.$root.loading = false;
      });
    },
   	doBindPhone: function(phone, code) {
      if (isNaN(this.countTime)) {
        return this.$root.$emit('doToast', "请先发送验证码", "warn");
      }
      var re_phone = /\d{11}/;
      if (!re_phone.test(phone)) {
        return this.$root.$emit('doToast', "您输入的手机号有误", "warn");
      }
      if (!code) {
        return this.$root.$emit('doToast', "请填写验证码", "warn");
      }
      var that = this;
      that.$root.loading = true;
      that.$http.get(this.$root.server + '/lantu/verifyPhone/verifyCode?phone=' + phone + '&code=' + code).then(function (res) {
        if (res.data.status == 0) {
          that.$root.$emit('doToast', res.data.msg, "warn");
        } else if (res.data.status == 1) {
          that.phone_show = false;
          that.bindSuccess(that.phone);
        }
        that.$root.loading = false;
      });
    },
    bindSuccess: function (phone) {
    	this.$emit('bind-success', phone);
    }
  }
}
</script>