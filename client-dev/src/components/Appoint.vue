<template>
  <div class="appoint page" style='width:100%'>
    <scroller v-ref:refresh :use-pullup="false" :use-pulldown="true" :pullup-config="upConfig" :pulldown-config="upConfig"  lock-x :scrollbar-y="false"  @pulldown:loading='doPulldown(true)'>
      <scroller v-ref:scroller  lock-y :scrollbar-x="false" >
        <div id="scroll-content" v-el:scrollcontent :style="calculateWidth(weekList)">
          <div class="scroll-item last" @click="more_week('last', $event)"></div>
          <div class="scroll-item" v-for="item in weekList" :class="[current_date == item.date ? 'active' : '']" @click="changeDay(item.date)" >
            {{item.name}}<br><span>{{treatDate(item.date)}}</span>
          </div>
          <div class="scroll-item next" @click="more_week('next', $event)"></div>
        </div>
      </scroller>
      <cell v-for="courtList in episode_court_map.list" :title="courtList.episode | episode" :is-link="false" >
        <button-tab class='court-list'>
           <button-tab-item v-for="(index, court) in courtList.courtList" class='court' :class="[treatDivide2(index) ?'court-l' : 'court-r', court.status == 2 ? 'disable' : '', court.status == 1 ? 'active' : '']"  @click.stop.prevent='courtClick(court)' ><span>￥{{courtList.episode | getPrice current_date}}</span></button-tab-item>
        </button-tab>
      </cell>
      <cell :is-link="false" style='display: block; text-align: left'><span class='description avai'>&nbsp;&nbsp;&nbsp; </span><span style='color:#000'>可预订</span><span class='description choose'>&nbsp;&nbsp;&nbsp; </span><span style='color:#000'>选中</span><span class='description disable'>&nbsp;&nbsp;&nbsp; </span><span style='color:#000'>不可定</span></cell>
      <cell :is-link="false"></cell>
    </scroller>
    <x-button type='primary' :disabled='episode_court_map.isPay' style="position: fixed; bottom: 0; background-color: #f27330; opacity: 0.9; border-radius: 0;"  @click='doAppoint'>{{episode_court_map.isPay ? '已预约' : '我要预定'}}</x-button>
    <div>
      <confirm :show.sync="show" :cancel-text="'取消'" :confirm-text="'去支付'" :title="'预约确认'" @on-confirm="doAppointConfirm" >
        <div v-for='episode in appointText' style="text-align: center">
          {{episode.episode | episode}}
          <span v-for='court in episode.courtList' style="padding-left: 0.3rem"><font color="red">{{court}}</font>号场</span>
        </div>
      </confirm>
      <message-dialog :phone_show.sync='phone_show' @bind-success='doAppoint' ></message-dialog>
      <side-bar :show.sync='left' width='45%' transition-type='vux-popup-left'>
        <div>
          <p class="center"><img :src="customer.avatarUrl"></p>
          <cell :title='customer.nickname'><i slot="icon" width="20" class="fa-i fa fa-user-o  icon"  aria-hidden="true"></i></cell>
          <cell  is-link @click='phone_show = !phone_show'><i slot="icon" width="20" class="fa-i fa fa-mobile-phone  icon"  aria-hidden="true"></i><div slot='after-title'>{{customer.phone}}</div></cell>
          <cell  is-link @click='toMy'><div slot='after-title' style="width:5rem"><i slot="icon" width="20" class="fa-i fa fa-list  icon"  aria-hidden="true"></i>我的订单</div></cell>
        </div>
      </side-bar>
    </div>
  </div>
</template>

<script>
import {XHeader, Group, Cell, ButtonTab, ButtonTabItem, XButton, Confirm, Scroller, XInput, Blur} from 'vux/src/components';
import MessageDialog from './message-dialog/MessageDialog.vue'
import SideBar from './side-bar/SideBar.vue'
import constant from '../constant.js'
import Vue from 'vue'
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
    MessageDialog,
    SideBar,
    Blur
  },
  data: function (){
    console.log("data start");
    return {
      episode_court_map: [],
      episode_court_map_week: {},
      weekList: [],
      current_date: '',
      show: false,
      appointText:[],
      appointInfo:[],
      phone_show:false,
      isBindPhone:false,
      isManager:false,
      upConfig:{autoRefresh:false, upContent:' ', downContent:' ', content:' ', loadingContent:' ', height:50},
      left: false,
      customer: {},
      clickTime: 0
    }
    
  },
  ready (){
    console.log("ready start");
    // this.doPulldown(true);
  },
  route: {
    data (transition) {
      console.log("route start");
      var that = this
      var toManage = function () {
        this.$router.go('/manage');
      }
      var showSide = function () {
        that.left = !that.left
      };
      this.$root.$emit('initMenu', {showBack: false, showMore:true, showMenu: true, title: '篮 途'}, showSide, toManage)
      this.doPulldown(false);
    }
  },
  methods: {
    courtClick: function (court) {
      if (court.status == 2 || this.episode_court_map.isPay) {
        return
      }
      court.status = (court.status + 1) % 2;
    },
    treatDivide2: function(num) {
      return (num % 2) > 0 ? false : true
    },
    doAppoint: function (phone) {
      if (phone && phone.length > 0) {
        this.isBindPhone = true;
      }
      if (!this.isBindPhone) {
        return this.phone_show = true;
      }
      var appointInfo = [];
      var appointText = [];
      _.each(this.episode_court_map.list, function (_episode) {
        var _a = [];
        _.each(_episode.courtList, function (court) {
          if (court.status == 1) {
            appointInfo.push({'episode': _episode.episode, 'court': court.court, 'status': 1})
            _a.push(court.court);
          }
        })
        if (_a.length > 0) {
            appointText.push({'episode': _episode.episode, 'courtList': _a})
        }
      });
      this.appointText = appointText;
      this.appointInfo = appointInfo;
      if (appointInfo.length > 0) {
        this.show = true;
      } else {
        this.$root.$emit('doToast', "请选择场地~", "warn");
      }
      
    },
    doAppointConfirm: function () {
      var getTotalFun = Vue.filter('getTotal');
      var _total = getTotalFun({appointDate: this.current_date, appointInfo:this.appointInfo});
      var that = this;
      that.$root.loading = true;
      this.$http.post(this.$root.server + '/lantu/customer/doAppoint.json',{appointDate:this.current_date, appointInfo: JSON.stringify(this.appointInfo), hour: _total.hour, price: _total.price}).then(function (res) {
        that.$root.loading = false;
        if (res.data.status == 0) {
          that.$root.$emit('doToast', res.data.msg, "warn");
        } else if(res.data.status == 1) {
          that.episode_court_map_week[that.current_date] = that.episode_court_map;

          // that.$root.$emit('doToast', "预约成功", "success")
          this.$router.go({name: 'order', params: {code: res.data.code}})
        }
      });
    },
    calculateWidth: function (weekList) {
      return "width:" + ((weekList.length) * 4.6 + 4.6 + 0.1) + "rem";
    },
    changeDay: function (date) {
      this.current_date = date;
      if (!this.episode_court_map_week[date]) {
        this.episode_court_map_week[date] = {list: JSON.parse(constant.episode), isPay:false};
      }
      this.episode_court_map = this.episode_court_map_week[date];
    },
    treatDate: function (date) {
      return date.substring(5);
    },
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
    more_week: function (ctrl, event) {
      if (event.timeStamp - this.clickTime <= 1000) {
        return;
      }
      this.clickTime = event.timeStamp;
      var count = 7;
      var i = 0;
      var d;
      while (i < count) {
        if (ctrl == 'last') {
          d = new Date(this.weekList[0].date);
        } else {
          d = new Date(this.weekList[this.weekList.length-1].date);
        }
        if (ctrl == 'last') {
          this.weekList.unshift(this.next_day(d, ctrl));
        } else {
          this.weekList.push(this.next_day(d, ctrl));
        }
        var width = this.$els.scrollcontent.style.width;
        i++;
      }
      width = width.substring(0, width.length-3);
      width = (parseInt(width) + 4.6 * count) + "rem";
      this.$els.scrollcontent.style.width = width;
      if (ctrl == 'next') {
        var _sw = document.getElementById("scroll-content").scrollWidth;
        var _cw =  document.body.clientWidth
        var pos = {left: _sw - _cw};
      }
      this.$nextTick(() => {
        this.$refs.scroller.reset(pos)
      });

      var that = this;
      var _start,_end;
      if (ctrl == 'last') {
        _start = that.weekList[0].date;
        _end = that.weekList[6].date;
      } else if (ctrl == 'next') {
        _start = that.weekList[that.weekList.length - 7].date;
        _end = that.weekList[that.weekList.length - 1].date;
      }

      that.$root.loading = true;
      that.$http.get(this.$root.server + '/lantu/customer/appointList4week.json?start=' + _start + '&end=' +  _end).then(function (res) {
        that.episode_court_map_week = _.extend(that.episode_court_map_week,res.data.episode_court_map_week);
        that.$root.loading = false;
      });
    },
    toManage: function () {
      this.$router.go('/manage')
    },
    toMy: function () {
      this.left = false;
      this.$router.go('/my')
    },
    doPulldown: function (refresh) {
      var that = this;
      that.$root.loading = true;
      if (refresh || this.weekList.length <= 0) {
        var weekList = [];
        while(weekList.length < 7) {
          if (weekList.length == 0) {
            weekList.push(that.next_day())
          } else {
            weekList.push(that.next_day(weekList[weekList.length - 1].date, 'next'))
          }
        }
        that.weekList = weekList;
        that.current_date = that.weekList[2].date;
        that.$nextTick(() => {
          that.$refs.scroller.reset()
        });
      }
      that.$http.get(this.$root.server + '/lantu/customer/appointList4week.json?ca='+ refresh +'&start=' + that.weekList[0].date + '&end=' +  that.weekList[6].date).then(function (res) {
        if (res.data.customer) {
          that.customer = res.data.customer
        }
        if (!refresh) {
          that.isBindPhone = res.data.isBindPhone
          that.isManager = res.data.isManager
        }
        that.episode_court_map_week = res.data.episode_court_map_week;
        that.episode_court_map = res.data.episode_court_map_week[that.weekList[2].date];
        if (!that.episode_court_map) {
          that.episode_court_map = {list: JSON.parse(constant.episode), isPay:false};
        }
        if (that.$refs.refresh.pulldown) {
          that.$refs.refresh.reset()
          that.$refs.refresh.pulldown.reset();
        }
        that.$root.loading = false;

      });
    }
  }
}

</script>

<style scoped>
.logo {
  width: 100px;
  height: 100px
}
.flex-demo {
   width: 3.5rem;
  text-align: center;
  color: #fff;
  background-color: #20b907;
  margin-bottom: 0rem;
  border-radius: 0rem;
  -webkit-background-clip: padding-box;
}
.weui_cell {
  padding: 0 !important;
  margin: 0.5rem 0.5rem 0rem !important;
  height: 3rem !important;
}
.vux-button-group > a:first-child {
    border-width: 1px;
    border-top-left-radius: 0!important;
    border-bottom-left-radius: 0!important;
    background-clip: padding-box;
}
.vux-button-group > a:last-child {
    border-top-right-radius: 0!important;
    border-bottom-right-radius: 0!important;
    background-clip: padding-box;
}
.court-list {
   display: block !important;
}
.court {
  position: relative;
  border: 0 !important;
  height: 3rem !important;
  display: inline-block !important;
  width: 25% !important;
}
.court-l {
  background: url(../assets/court-l.png) no-repeat center!important;
  background-size:100% 100% !important;
}
.court-r {
  background: url(../assets/court-r.png) no-repeat center!important;
  background-size:100% 100% !important;
}
.court-l span{
  position: absolute;
  right: 0.4rem;
  top: 0.6rem;
  color: #999;
}
.court-r span{
  position: absolute;
  left: 0.2rem;
  top: 0.6rem;
  color: #999;
}
.court-l.active {
   background: url(../assets/court-l-active.png) no-repeat center!important;
   background-size:100% 100% !important;
}
.court-r.active {
   background: url(../assets/court-r-active.png) no-repeat center!important;
   background-size:100% 100% !important;
}
.court-l.disable {
   background: url(../assets/court-l-disable.png) no-repeat center!important;
   background-size:100% 100% !important;
}
.court-r.disable {
   background: url(../assets/court-r-disable.png) no-repeat center!important;
   background-size:100% 100% !important;
}
.court.active span{
  color: #fff;
}
.weui_cell:before {
  border: 0 !important;
}


.scroll-item {
  display: inline-block;
  width: 4.4rem;
  text-align: center;
  box-shadow: 0 0.2rem 0.2rem #f27330;
  margin: 0 0.1rem 0.2rem;
}
.scroll-item.active {
  background-color: #f27330;
}
.scroll-item.last {
  width: 2rem;
  height: 2rem;
  margin: 0;
  background: url(../assets/last-week.png) no-repeat center!important;
  background-size:100% 100% !important;
}
.scroll-item.next {
  width: 2rem;
  height: 2rem;
  margin: 0;
  background: url(../assets/next-week.png) no-repeat center!important;
  background-size:100% 100% !important;
}
.description {
  margin: 0 0.3rem 0 2rem; 
}
.description.avai {
  background-color: #ffffff;
}
.description.choose {
  background-color: #f27330;
}
.description.disable {
  background-color: #bfbfbf;
}
.weui_dialog_bd {
  text-align: center !important;
}
.weui_btn_disabled {
  background-color: #c1c1c1 !important;
}
.center {
  text-align: center;
  padding-top: 1rem;
  color: #000;
}
.center img {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  border: 4px solid #ececec;
}
.weui_cell_bd > p {
  color: #fff !important;
}
</style>