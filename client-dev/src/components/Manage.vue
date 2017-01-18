<template>
  <div class="page manage" style="background:#fff">
    <x-header :left-options="{showBack: true}" >篮&nbsp;&nbsp;途</x-header>
    <div style="height:100%">
       <tab :index.sync="index" v-ref:tab :line-width=2 active-color='#fc378c' style="height:2rem;">
        <tab-item  class="vux-center"  v-for="item in list">{{item}}</tab-item>
      </tab>
      <swiper :index.sync="index" v-ref:swiper height="100%" :show-dots="false"  :style="calculateWidth(appointList4week.after)" >
        <swiper-item>
          <scroller v-ref:after :use-pullup="true" :use-pulldown="true" :pullup-config="upConfig" :pulldown-config="upConfig"  lock-x :scrollbar-y="false"  @pullup:loading='doPullup()' @pulldown:loading='doPulldown()' height="100%">
            <div v-el:aftercontent :style="calculateWidth(appointList4week.after)" >
              <group :title="day.date" v-for="day in appointList4week.after">
                <cell v-for="appoint in day.appoint" :title="appoint.customer.nickname"  @click="appointDetail(appoint)"  is-link>
                  <img slot="icon" :src="appoint.customer.avatarUrl" style="width:2rem;border-radius:0.5rem">
                  <a slot="after-title" :href="'tel:' + appoint.customer.phone" @click.stop='' >{{appoint.customer.phone}}</a>
                  {{getTotal(appoint.appointInfo).count}}场时 |￥{{getTotal(appoint.appointInfo).price}}
                </cell>
              </group>
              <div style="padding-top:2rem; color:#f27330; text-align: center;">
                <icon :show='appointList4week.after.length == 0' type="info" class="icon_big"></icon>
                <p>暂无内容</p>
              </div>
            </div>
          </scroller>
        </swiper-item>
        <swiper-item>
          <scroller v-ref:past :use-pullup="true" :use-pulldown="true" :pullup-config="upConfig" :pulldown-config="upConfig"  lock-x :scrollbar-y="false"  @pullup:loading='doPullup()' @pulldown:loading='doPulldown()'>
            <div v-el:aftercontent :style="calculateWidth(appointList4week.past)" >
              <group :title="day.date" v-for="day in appointList4week.past">
                <cell v-for="appoint in day.appoint" :title="appoint.customer.nickname"  @click="appointDetail(appoint)"  is-link>
                  <img slot="icon" :src="appoint.customer.avatarUrl" style="width:2rem;border-radius:0.5rem">
                  <a slot="after-title" :href="'tel:' + appoint.customer.phone" @click.stop='' >{{appoint.customer.phone}}</a>
                  {{getTotal(appoint.appointInfo).count}}场时 |￥{{getTotal(appoint.appointInfo).price}}
                </cell>
              </group>
              <div style="padding-top:2rem; color:#f27330; text-align: center;">
                <icon :show='appointList4week.after.length == 0' type="info" class="icon_big"></icon>
                <p>暂无内容</p>
              </div>
            </div>
          </scroller>
        </swiper-item>
      </swiper>
    </div>
    <confirm :show.sync="detail_show" :cancel-text="'取消'" :confirm-text="'确认'" title="预约详情" @on-confirm="doSaveAppoint()" >
      <group>
        <switch class='pay-valid' :title="'支付:' + (editAppoint.isPay ? '是' : '否')"  :value.sync="editAppoint.isPay"></switch>
        <switch class='pay-valid' :title="'状态:' + (editAppoint.valid ? '有效' : '无效')"  :value.sync="editAppoint.valid"></switch>
      </group>
      <group v-for='ec in editAppoint.appointInfo' >
        <switch  :title="treatEpisode(ec.episode) + ' | ' + ec.court + '号场' + (ec.status == 1 ? '(有效)' : '(失效)')" :title="ec.status ? '有效' : '失效'" :value.sync="ec.status"></switch>
      </group>
    </confirm>
    <toast :show.sync="toast.show" :text="toast.text" :type="toast.type"></toast>
    <loading :show.sync="loading" :text="'加载中'"></loading>
  </div>
</template>

<script>
import {XHeader, Tab, TabItem, Swiper, SwiperItem, Scroller, Group, Cell, Confirm, Switch, Toast, Loading, Icon} from 'vux/src/components';
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
    Toast,
    Loading,
    Icon
  },
  data () {
    var today = this.current_day(new Date());
    var yesterday = this.current_day(new Date(), true);
    return {
      // note: changing this line won't causes changes
      // with hot-reload because the reloaded component
      // preserves its current state and we are modifying
      // its initial state.
      msg: 'Hello World!',
      server: "",
      // server: "http://127.0.0.1",
      appointList4week: {after:[], past:[]},
      list:['after', 'past'],
      index:0,
      first:true,
      detail_show:false,
      toast:{show:false, type:"success", text:""},
      loading:false,
      upConfig:{autoRefresh:false, upContent:' ', downContent:' ', content:' ', loadingContent:' ', height:30},
      currentDate:{after:today, past:yesterday, today:today, yesterday:yesterday},
      editAppoint:{}
    }
  },
  watch: {
    index: function () {
      if (this.first) {
        this.doPulldown();
        this.first = false;
      }
    }
  },
  ready (){
    console.log("ready start");
    var that = this;
    that.loading = true;
    that.$http.get(this.server + '/lantu/manager/appointList4week.json?start=' + that.currentDate.after + '&type=after').then(function (res) {
      that.appointList4week.after = res.data.appointList4week;
      that.currentDate.after = res.data.current;
      // that.isBindPhone = res.data.isBindPhone
      that.$nextTick(() => {
        that.$refs.after.reset()
        that.$refs.past.reset()
      });
      if (res.data.isComplete) {
        that.$refs.after.pullup.stop();
      }
      that.loading = false;
    });
  },
  methods: {
    current_day: function (d, last) {
      if (last) {
        d = +d - 1000*60*60*24;
        d = new Date(d);
      }
      var month = (d.getMonth()+1);
      var day = d.getDate();
      if (month < 10) {
        month = "0" + month;
      }
      if (day < 10) {
        day = "0" + day;
      }
      var s = d.getFullYear()+"-"+month+"-"+day;
      return s;
    },
    calculateWidth: function (appointList4week) {
      var hn = _.reduce(appointList4week,function (m,n) {
        return m + (n.appoint.length * 4 + 2);
      },0);
      return "height:" + hn + "rem; min-height: 100%;";
    },
    getTotal: function (ecList) {
      var court = _.reduce(ecList, function (m,n) {
        return {count:(m.count + 2), price:(m.price + 200)}
      },{count:0, price:0})
      return court;
    },
    appointDetail: function (appoint) {
      this.detail_show = true;
      this.editAppoint = appoint;
    },
    doSaveAppoint: function () {
      var that = this;
      var appoint = JSON.stringify(this.editAppoint)
      that.loading = true;
      this.$http.post(this.server + '/lantu/manager/updateAppoint.json', {appoint:appoint}).then(function(res) {
        if (res.data.status == 1) {
          that.doToast("修改成功")
        } else {
          that.doToast("修改失败","warn")
        }
        that.loading = false;
      })
    },
    treatEpisode: function(num) {
        return (num +':00-' + (parseInt(num)+2) + ':00');
    },
    doToast: function(text, type) {
      var _type = "success";
      if (type) {
        _type = type
      }
      this.toast.text = text;
      this.toast.type = _type;
      this.toast.show = true;
    },
    doPullup: function() {
      var that = this;
      that.loading = true;
      var type = this.index > 0 ? 'past' : 'after';
      that.$http.get(this.server + '/lantu/manager/appointList4week.json?start=' + that.currentDate[this.index > 0 ? 'past' : 'after'] + '&type=' + type).then(function (res) {
        that.appointList4week[this.index > 0 ? 'past' : 'after'] = that.appointList4week[this.index > 0 ? 'past' : 'after'].concat(res.data.appointList4week);
        that.currentDate[this.index > 0 ? 'past' : 'after'] = res.data.current;
        that.$nextTick(() => {
          that.$refs[this.index > 0 ? 'past' : 'after'].reset()
        });
        if (res.data.isComplete) {
          that.$refs[this.index > 0 ? 'past' : 'after'].pullup.stop();
        }
        this.$refs[this.index > 0 ? 'past' : 'after'].pullup.complete();
        that.loading = false;
      });
    },
    doPulldown: function () {
      var that = this;
      that.loading = true;
      var type = this.index > 0 ? 'past' : 'after';
      that.$http.get(this.server + '/lantu/manager/appointList4week.json?start=' + that.currentDate[this.index > 0 ? 'yesterday' : 'today'] + '&type=' + type).then(function (res) {
        that.appointList4week[this.index > 0 ? 'past' : 'after'] = res.data.appointList4week;
        that.currentDate[this.index > 0 ? 'past' : 'after'] = res.data.current;
        // that.isBindPhone = res.data.isBindPhone
        that.$refs[this.index > 0 ? 'past' : 'after'].pulldown.reset();
        that.$nextTick(() => {
          that.$refs[this.index > 0 ? 'past' : 'after'].reset()
        });
        if (res.data.isComplete) {
          that.$refs[this.index > 0 ? 'past' : 'after'].pullup.stop();
        } else {
          that.$refs[this.index > 0 ? 'past' : 'after'].pullup.restart();
        }
        that.loading = false;
      });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style >
h1 {
  color: #42b983;
}
.vux-header {
  background-color: #f27330 !important;
  margin: 0 0 0.2rem;
  box-shadow: 0 0 0.5rem #000;
}
.vux-tab-item {
  line-height: inherit !important;
  color: #f27330 !important;
}
.weui_cells {
  font-size: 0.8rem
}
.weui_cells_title {
  margin-top: 0.5rem !important;
  height: 1rem !important;
}
.weui_switch {
  width: 2.5rem;
  height: 1rem
}
.weui_switch:after {
  width: 0.9rem;
  height: 0.9rem;
}
.weui_switch:before {
  width: 2.35rem;
  height: 0.9rem;
}
.weui_cell_switch {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  height: auto !important;
  padding: 0.4rem 0 !important;
}
.vux-no-group-title {
  margin: 0rem
}
.weui_cell_bd {
  margin-left: 0.5rem !important
}
.pay-valid {
  padding: 0;
  width: 50%;
  display: inline;
}
.pay-valid div {
  display: table-cell !important ;
  padding: 0 !important;
}
a {
  color: #f27330;
}
.weui_dialog_bd {
  text-align: left !important
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
.icon_big.weui_icon_info:before {
  font-size: 5rem;
  color: #f27330;
}
</style>
