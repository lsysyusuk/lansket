<template>
  <div class="page manage" style="background: #fff; width:100%">
    <div style="height:100%" :show="isManager">
       <tab :index.sync="index" v-ref:tab :line-width=2 active-color='#fc378c' style="height:2rem;">
        <tab-item  class="vux-center"  v-for="item in list">{{item}}</tab-item>
      </tab>
      <swiper :index.sync="index" height="100%" :show-dots="false"  style="height: 1rem; min-height: 100%" >
        <swiper-item v-ref:list v-for="name in list">
          <scroller  :use-pullup="true" :use-pulldown="true" :pullup-config="upConfig" :pulldown-config="upConfig"  lock-x :scrollbar-y="false"  @pullup:loading='doPullup()' @pulldown:loading='doPulldown()'>
            <div :style="calculateWidth(appointList4week[name])" >
              <group :title="day.date" v-for="day in appointList4week[name]">
                <cell v-for="appoint in day.appoint" :title="appoint.customer.nickname"  @click="appointDetail(appoint)"  is-link>
                  <img slot="icon" class='icon' :src="appoint.customer.avatarUrl" style="width:2rem;border-radius:0.5rem">
                  <a slot="after-title" :href="'tel:' + appoint.customer.phone" @click.stop='' >{{appoint.customer.phone}}</a>
                  <i class="fa-i fa fa-money" :class="appoint.isPay ? 'main-color' : ''"  aria-hidden="true"></i><i class="fa-i fa fa-check-square-o" :class="appoint.valid ? 'main-color' : ''" aria-hidden="true"></i>{{appoint.hour}}场时 |￥{{appoint.price}}
                </cell>
              </group>
              <div v-show='appointList4week[name].length == 0' style="padding-top:2rem; color:#f27330; text-align: center;">
                <icon  type="info" class="icon_big"></icon>
                <p>暂无内容</p>
              </div>
            </div>
          </scroller>
        </swiper-item>
      </swiper>
    </div>
    <div :show='isManager' style="padding-top:2rem; color:#f27330; text-align: center;">
                <icon  type="info" class="icon_big"></icon>
                <p>抱歉，您没有权限</p>
    </div>
    <confirm :show.sync="detail_show" :cancel-text="'取消'" :confirm-text="'确认'" title="预约详情" @on-confirm="doSaveAppoint()" >
      <cell style='height: 1rem !important; margin-top:0 !important'><i class="fa-i fa fa-clock-o"  aria-hidden="true"></i>{{editAppoint.createTime | formateDateTime}}</cell>
      <group>
        <switch class='pay-valid' :title="'支付:' + (editAppoint.isPay ? '是' : '否')"  :value.sync="editAppoint.isPay"></switch>
        <switch class='pay-valid' :title="'状态:' + (editAppoint.valid ? '有效' : '无效')"  :value.sync="editAppoint.valid"></switch>
      </group>
      <group v-for='ec in editAppoint.appointInfo' >
        <switch :title="treatEpisode(ec.episode) + ' | ' + ec.court + '号场' + (ec.status == 1 ? '(有效)' : '(失效)')" :value.sync="ec.status"></switch>
      </group>
    </confirm>
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
    var today = this.current_day(new Date());
    var yesterday = this.current_day(new Date(), true);
    return {
      // note: changing this line won't causes changes
      // with hot-reload because the reloaded component
      // preserves its current state and we are modifying
      // its initial state.
      appointList4week: {after:[], past:[]},
      list:['after', 'past'],
      index:0,
      first:true,
      detail_show:false,
      isManager:false,
      upConfig:{autoRefresh:false, upContent:' ', downContent:' ', content:' ', loadingContent:' ', height:30},
      currentDate:{after:today, past:yesterday, today:today, yesterday:yesterday},
      editAppoint:{}
    }
  },
  route: {
    data (transition) {
      this.$root.$emit('initMenu', {showBack: true, showMore:false, showMenu: false}, null, null);
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
    that.$root.loading = true;
    that.$http.get(this.$root.server + '/lantu/manager/appointList4week.json?start=' + that.currentDate.after + '&type=after').then(function (res) {
      that.appointList4week.after = res.data.appointList4week;
      that.currentDate.after = res.data.current;
      that.isManager = res.data.isManager;
      that.resetScroll('down', res.data.isComplete);
      that.$root.loading = false;
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
        return m + (n.appoint.length * 3.6 + 2.4);
      },0);
      return "height:" + hn + "rem; min-height: 100%;";
    },
    appointDetail: function (appoint) {
      this.detail_show = true;
      this.editAppoint = appoint;
    },
    doSaveAppoint: function () {
      var that = this;
      var appoint = JSON.stringify(this.editAppoint)
      that.$root.loading = true;
      this.$http.post(this.$root.server + '/lantu/manager/updateAppoint.json', {appoint:appoint}).then(function(res) {
        if (res.data.status == 1) {
          that.$root.$emit('doToast',"修改成功")
        } else {
          that.$root.$emit('doToast', "修改失败","warn")
        }
        that.$root.loading = false;
      })
    },
    treatEpisode: function(num) {
        return (num +':00-' + (parseInt(num)+2) + ':00');
    },
    resetScroll: function (type, stop) {
      var that = this;
      that.$nextTick(() => {
        that.$refs.list[this.index].$children[0].reset()
      });
      if (stop) {
        that.$refs.list[this.index].$children[0].pullup.stop();
      } else {
        that.$refs.list[this.index].$children[0].pullup.restart();
      }
      if (type == 'up') {
        that.$refs.list[this.index].$children[0].pullup.complete();
      } else if (type == 'down') {
        that.$refs.list[this.index].$children[0].pulldown.reset();
      }
    },
    doPullup: function() {
      var that = this;
      that.$root.loading = true;
      var type = this.list[this.index];
      that.$http.get(this.$root.server + '/lantu/manager/appointList4week.json?start=' + that.currentDate[this.index > 0 ? 'past' : 'after'] + '&type=' + type).then(function (res) {
        that.appointList4week[type] = that.appointList4week[type].concat(res.data.appointList4week);
        that.currentDate[type] = res.data.current;
        that.resetScroll('up', res.data.isComplete);
        that.$root.loading = false;
      });
    },
    doPulldown: function () {
      var that = this;
      that.$root.loading = true;
      var type = this.list[this.index];
      that.$http.get(this.$root.server + '/lantu/manager/appointList4week.json?start=' + that.currentDate[this.index > 0 ? 'yesterday' : 'today'] + '&type=' + type).then(function (res) {
        that.appointList4week[type] = res.data.appointList4week;
        that.currentDate[type] = res.data.current;
        that.resetScroll('down', res.data.isComplete);
        that.$root.loading = false;
      });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1 {
  color: #42b983;
}
.vux-tab-item {
  line-height: inherit !important;
  color: #f27330 !important;
}

a {
  color: #f27330;
}

.fa-i {
  margin-right: 0.2rem;
  font-size: 1rem;
}


.weui_dialog_bd {
  text-align: left !important
}
.weui_cell_bd {
  margin-left: 0.5rem !important
}
</style>
<style>
.weui_cells_title {
  margin-top: 0.5rem !important;
  height: 1rem !important;
}
.weui_dialog_bd {
  max-height: 15rem;
  overflow-y: scroll;
}
.weui_cell_switch {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  height: auto !important;
  padding: 0.4rem 0 !important;
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
.pay-valid {
  padding: 0;
  width: 50%;
  display: inline;
}
.pay-valid div {
  display: table-cell !important ;
  padding: 0 !important;
}
.vux-no-group-title {
  margin: 0rem
}
</style>
