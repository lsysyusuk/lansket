<template>
  <div class="page manage" style="background:#fff">
    <x-header :left-options="{showBack: true}" >篮&nbsp;&nbsp;途</x-header>
    <div>
       <tab :index.sync="index" v-ref:tab :line-width=2 active-color='#fc378c' style="height:3rem">
        <tab-item  class="vux-center"  v-for="item in list" >{{item}}</tab-item>
      </tab>
      <swiper :index.sync="index" v-ref:swiper height="100%" :show-dots="false"  :style="calculateWidth(appointList4week)" >
        <swiper-item>
          <scroller v-ref:after  lock-x :scrollbar-y="false" >
            <div v-el:aftercontent :style="calculateWidth(appointList4week)" >
              <group :title="day.date" v-for="day in appointList4week">
                <cell v-for="appoint in day.appoint" :title="appoint.customer.nickname"  @click="appointDetail(appoint)"  is-link>
                  <img slot="icon" :src="appoint.customer.avatarUrl" style="width:2rem;border-radius:0.5rem">
                  <a slot="after-title" :href="'tel:' + appoint.customer.phone" @click.stop='' >{{appoint.customer.phone}}</a>
                  {{getTotal(appoint.appointInfo).count}}场时 |￥{{getTotal(appoint.appointInfo).price}}
                </cell>
              </group>
            </div>
          </scroller>
        </swiper-item>
        <swiper-item>
          <scroller v-ref:past  lock-x :scrollbar-y="false" >
            <div v-el:pastcontent :style="calculateWidth(appointList4week)" >
              <group :title="day.date" v-for="day in appointList4week">
                <cell v-for="appoint in day.appoint" :title="appoint.customer.nickname"></cell>
              </group>
            </div>
          </scroller>
        </swiper-item>
        <!-- <swiper-item>
          <scroller v-ref:last  lock-x :scrollbar-y="false" style="height:800px">
            <div v-el:scrollcontent style="height:800px">
              <group :title="day.date" v-for="day in appointList4week">
                <cell v-for="appoint in day.appoint" :title="appoint.customer.nickname"></cell>
              </group>
            </div>
          </scroller>
        </swiper-item> -->
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
      <!-- <div v-for='ec in editAppoint.appointInfo' style="text-align: center">
          {{treatEpisode(ec.episode)}}
          <span style="padding-left: 0.3rem"><font color="red">{{ec.court}}</font>号场</span>
          
        </div> -->
    </confirm>
    <toast :show.sync="toast.show" :text="toast.text" :type="toast.type"></toast>
    <loading :show.sync="loading" :text="'加载中'"></loading>
  </div>
</template>

<script>
import {XHeader, Tab, TabItem, Swiper, SwiperItem, Scroller, Group, Cell, Confirm, Switch, Toast,Loading} from 'vux/src/components';
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
    Loading
  },
  data () {
    var weekList = [];
    while(weekList.length < 7) {
      if (weekList.length == 0) {
        weekList.push(this.next_day())
      } else {
        weekList.push(this.next_day(weekList[weekList.length - 1].date, 'next'))
      }
    }
    return {
      // note: changing this line won't causes changes
      // with hot-reload because the reloaded component
      // preserves its current state and we are modifying
      // its initial state.
      msg: 'Hello World!',
      server: "",
      // server: "http://127.0.0.1",
      weekList: weekList,
      appointList4week: [],
      list:['after', 'past'],
      index:0,
      detail_show:false,
      toast:{show:false, type:"success", text:""},
      loading:false,
      editAppoint:{}
    }
  },
  ready (){
    console.log("ready start");
    var that = this;
    that.loading = true;
    // that.$http.get(this.server + '/lantu/customer/appointList.json?date=' + that.weekList[0].date).then(function (res) {
    //   that.episode_court_map = res.data.episode_court_map;
    //   that.appointJson = res.data.appointJson;
    //   that.loading = false;
    // });
    that.$http.get(this.server + '/lantu/manager/appointList4week.json?start=' + that.weekList[0].date + '&end=' +  that.weekList[6].date).then(function (res) {
      that.appointList4week = res.data.appointList4week;
      // that.isBindPhone = res.data.isBindPhone
      that.$nextTick(() => {
        that.$refs.after.reset()
        that.$refs.past.reset()
      });
      that.loading = false;
    });
  },
  methods: {
    next_day: function (d, ctrl) {
        var week_map = ['周日', '周一','周二','周三','周四','周五','周六'];
        if (d) {
          d = new Date(d);
          if (ctrl == "last") {
            d = +d - 1000*60*60*24;
          } else {
            d = +d + 1000*60*60*24;
          }
          d = new Date(d);
        } else {
          d = new Date();
          d = +d - 1000*60*60*24*2;
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
        return {'name': week_map[d.getDay()], 'date': s};
    },
    calculateWidth: function (appointList4week) {
      var hn = _.reduce(appointList4week,function (m,n) {
        return m + (n.appoint.length * 4.5 + 3);
      },0);
      return "height:" + hn + "rem";
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
</style>
