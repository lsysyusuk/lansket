<template>
	<div class="my page" style="background:#fff">
		<scroller v-ref:list :use-pullup="true" :use-pulldown="true" :pullup-config="upConfig" :pulldown-config="upConfig"  lock-x :scrollbar-y="false"  @pullup:loading='doPullup()' @pulldown:loading='doPulldown()'>
	    <div :style="calculateHeight(appointList)" >
	      <cell v-for="appoint in appointList" :title="appoint.appointDate"  v-link="{name: 'order', params:{code:appoint.code}}" is-link>
	        <!-- <img slot="icon" class='icon' :src="appoint.customer.avatarUrl" style="width:2rem;border-radius:0.5rem"> -->
	        <div slot="after-title" class="main-color" style="width:5rem" >{{appoint.isPay | status appoint.valid}}</div>
	        {{appoint.hour}}场时 |￥{{appoint.price}}
	      </cell>
	      <div v-show='appointList.length == 0' style="padding-top:2rem; color:#f27330; text-align: center;">
	        <icon type="info" class="icon_big"></icon>
	        <p>暂无内容</p>
	      </div>
	    </div>
	  </scroller>
	</div>
</template>

<script>
import {XHeader, Tab, TabItem, Swiper, SwiperItem, Scroller, Group, Cell, Confirm, Switch, Icon} from 'vux/src/components';
import { _ } from 'underscore/underscore-min';

export default {
	components: {
    XHeader,
    Tab,
    TabItem,
    Swiper,
    SwiperItem,
    Scroller,
    Group,
    Cell,
    Confirm,
    Switch,
    Icon
  },
  data () {
  	return {
  		appointList: [],
  		page: 0,
  		size: 10,
  		count: 0,
      upConfig:{autoRefresh:false, upContent:' ', downContent:' ', content:' ', loadingContent:' ', height:30}
  	}
  },
  ready () {
    this.resetScroll('down');
  },
  route: {
  	data (transition) {
  		var that = this
      this.$root.$emit('initMenu', {showBack: true, showMore:false, showMenu: false, title: '我的订单'}, null, null);
    	that.getAppointList(true);
  	}
  },
  methods: {
  	resetScroll: function (type) {
      var that = this;
      that.$nextTick(() => {
        that.$refs.list.reset()
      });
      if ((that.page + 1) * that.size >= that.count) {
        that.$refs.list.pullup.stop();
      } else {
        that.$refs.list.pullup.restart();
      }
      if (type == 'up') {
        that.$refs.list.pullup.complete();
      } else if (type == 'down') {
        that.$refs.list.pulldown.reset();
      }
    },
    doPullup: function () {
    	this.page++;
    	var that = this
    	that.getAppointList(false, function () {
    		that.resetScroll('up')
    	});
    },
    doPulldown: function () {
    	var that = this
    	that.getAppointList(true, function () {
    		that.resetScroll('down')
    	});
    },
    calculateHeight: function () {
    	return "height:" + this.appointList.length * 4 + "rem";
    },
    getAppointList: function (refresh, callback) {
    	var that = this;
      that.$root.loading = true;
      if (refresh) {
      	that.page = 0
      }
      that.$http.get(this.$root.server + '/lantu/customer/my/orders.json?page=' + that.page + '&size=' + that.size).then(function (res) {
      	if (res.data.status == 1) {
	        if (refresh) {
      			that.appointList = res.data.list;
	        } else {
	        	that.appointList = that.appointList.concat(res.data.list);
	        }
	        that.count = res.data.count;
	        if (callback && typeof callback == 'function') {
	        	callback();
	        }
      	} else {
      		that.$root.$emit('doToast', '网络故障', 'warn');
      	}
	      that.$root.loading = false;
      });
    }
  },
}
</script>

<style scope>
.my .weui_cell {
	height: 2rem;
	padding: 0.9rem 0.75rem;
}
</style>