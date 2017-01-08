<template>
  <div class="appoint">
    <x-header :left-options="{showBack: false}" ></x-header>
  <scroller v-ref:scroller v-ref:scroller lock-y :scrollbar-x="false">
    <div id="scroll-content" v-el:scrollcontent :style="calculateWidth(weekList)" >
      <div class="scroll-item" v-for="item in weekList" :class="[current_date == item.date ? 'active' : '']" @click="changeDay(item.date)" >
        {{item.name}}<br><span>{{treatDate(item.date)}}</span>
    </div>
  </div>
</scroller>
  <cell v-for="courtList in episode_court_map" :title="treatEpisode(courtList.episode)" :is-link="false" >
      <button-tab class='court-list'>
         <button-tab-item v-for="(index, court) in courtList.courtList" :class="[treatDivide2(index) ?'court-l' : 'court-r', court.status == 2 ? 'disable' : '', court.status == 1 ? 'active' : '']"  @click='courtClick(court)' ><span>￥200</span></button-tab-item>
      </button-tab>
    </cell>
    <cell :is-link="false" style='display: block; text-align: left'><span class='description avai'>&nbsp;&nbsp;&nbsp; </span><span style='color:#000'>可预订</span><span class='description choose'>&nbsp;&nbsp;&nbsp; </span><span style='color:#000'>选中</span><span class='description disable'>&nbsp;&nbsp;&nbsp; </span><span style='color:#000'>不可定</span></cell>
    <cell :is-link="false"></cell>
  <!-- <group>
    
    
  </group> -->
  <x-button type='primary' style="position: fixed; bottom: 0; background-color:#f27330" @click='doAppoint'>我要预定</x-button>
  </div>
  
</template>

<script>
import {XHeader, Group, Cell, ButtonTab, ButtonTabItem, XButton, Scroller} from 'vux/src/components';
import { _ } from 'underscore/underscore-min';
// import Scroller from './Scroller'
export default {
  components: {
    Group,
    Cell,
    XHeader,
    ButtonTab,
    ButtonTabItem,
    XButton,
    Scroller
  },
  data: function (){
    console.log("data start");
    var weekList = [];
    while(weekList.length < 7) {
      if (weekList.length == 0) {
        weekList.push(this.next_day())
      } else {
        weekList.push(this.next_day(weekList[weekList.length - 1].date))
      }
    }
    
    return {
      // note: changing this line won't causes changes
      // with hot-reload because the reloaded component
      // preserves its current state and we are modifying
      // its initial state.
      appointJson: [],
      episode_court_map: [],
      weekList: weekList,
      current_date: weekList[2].date,
    }
    
  },
  ready (){
    console.log("ready start");
    var that = this;
    that.$http.get('http://127.0.0.1/lantu/customer/appointList.json?date=' + that.current_date,{'date': '2017-01-05'}).then(function (res) {
      that.episode_court_map = res.data.episode_court_map;
      that.appointJson = res.data.appointJson;
    });
  },
  methods: {
    courtClick: function (court) {
      if (court.status == 2) {
        return
      }
      court.status = (court.status + 1) % 2;
    },
    treatEpisode: function(num) {
        return (num +':00-' + (parseInt(num)+2) + ':00');
    },
    treatDivide2: function(num) {
      return (num % 2) > 0 ? false : true
    },
    doAppoint: function () {
      var appointInfo = [];
      _.each(this.episode_court_map, function (_episode) {
          _.each(_episode.courtList, function (court) {
            if (court.status == 1) {
              appointInfo.push({'episode': _episode.episode, 'court': court.court, 'status': 1})
            }
          })
      });
      this.$http.post('http://127.0.0.1/lantu/customer/doAppoint.json',{appointDate:this.current_date, appointInfo: JSON.stringify(appointInfo)}).then(function (res) {
      console.log(res.data);
      });
    },
    calculateWidth: function (weekList) {
      return "width:" + weekList.length * 4.6 + "rem";
    },
    changeDay: function (date) {
      // this.weekList.push(this.next_day(date));
      // var width = this.$els.scrollcontent.style.width;
      // width = width.substring(0, width.length-5);
      // width = (parseInt(width) + 4.6) + "rem";
      // this.$els.scrollcontent.style.width = width
      // this.$nextTick(() => {
      //   this.$refs.scroller.reset()
      // })
      this.current_date = date;
      var that = this;
      that.$http.get('http://127.0.0.1/lantu/customer/appointList.json?date=' + that.current_date, {'date': '2017-01-05'}).then(function (res) {
        that.episode_court_map = res.data.episode_court_map;
        that.appointJson = res.data.appointJson;
      });
    },
    treatDate: function (date) {
      return date.substring(5);
    },
    next_day: function (d) {
        var week_map = ['周日', '周一','周二','周三','周四','周五','周六'];
        if (d) {
          d = new Date(d);
          d = +d + 1000*60*60*24;
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
    }
    
  }
}

</script>

<style>
.vux-header {
  background-color: #f27330 !important;
  margin: 0 0 0.2rem;
  box-shadow: 0 0 0.5rem #000;
}
.vux-demo {
  text-align: center;
}

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
   /*width: 16.5rem;*/
   display: block !important;
}
.court-l {
  position: relative;
  padding-left: 0.1rem;
  background: url(../assets/court-l.png) no-repeat center!important;
  background-size:100% 100% !important;
  border: 0 !important;
  height: 3rem !important;
  display: inline-block !important;
  width: 25% !important;
}
.court-r {
  position: relative;
  background: url(../assets/court-r.png) no-repeat center!important;
  background-size:100% 100% !important;
  border: 0 !important;
  height: 3rem !important;
  display: inline-block !important;
  width: 25% !important;
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
.court-l.active span{
  color: #fff;
}
.court-r.active span{
  color: #fff;
}
.weui_cell:before {
  border: 0 !important;
}
.weui_cell_primary {
  -webkit-box-fles: 1 !important;
  flex: 1 !important;
  font-size: 0.8rem;
}
.weui_cell_ft {
  -webkit-flex-box: 3;
  flex: 3;
}
.scroll-item {
  display: inline-block;
  width: 4.4rem;
  text-align: center;
  box-shadow: 0 0.1rem 0.2rem #f27330;
  margin: 0 0.1rem 0.2rem;
}
.scroll-item.active {
  background-color: #f27330;
}
.appoint {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  font-size: 16px;
  height: 100%;
  background: url(../assets/flour.png);
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
</style>