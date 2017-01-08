<template>
  <div>
  <div id="wrapper" v-el:wrapper>
    <div id="scroller">
      <ul id="scrollerUl" v-el:ul :style="getWidth">
        <li v-for="item in menu" track-by="$index" class="li" :class="{bot:this.index==$index}"  @click="checkIt($index,item)">{{item.name}}</li>
      </ul>
    </div>
  </div>
  </div>
</template>
<style scoped>
  #wrapper{
    /*position: absolute;*/
    /*z-index: 1;*/
    height: 40px;
    left: 0;
    width: 100%;
    overflow: hidden;
  }
  #scroller{
    position: absolute;
    /*z-index: 1;*/
    -webkit-tap-highlight-color: rgba(0,0,0,0);
  }
  #scroller ul{
    width: 100%;
    height: 100%;
    text-align: center;
  }
  #scroller li{
    float:left;
    height: 30px;
    line-height: 30px;
    width:4.6rem;
    list-style-type: none;
    background-color: red;
  }
  #scroller .bot{
    border-bottom:2px solid rgb(37, 190, 169);
  }
</style>
<script>
  import IScroll from 'iscroll/build/iscroll-lite.js'
  export default{
    props: {
      menu: {
        type: Array
      },
      selected: {
        type: Boolean,
        require: false,
        default: false
      }
    },
    data () {
      return {
        index: 0
      }
    },
    computed: {
      getWidth () {
        return 'width:' + this.menu.length * 4.6 + 'rem; height:3rem'
      }
    },
    ready () {
      var myScroll = new IScroll(this.$els.wrapper, {scrollX: true, scrollY: false})
      myScroll.say = ''
    },
    methods: {
      checkIt (index, item) {
        alert(1);
        var lis = this.$els.ul.children
        lis[this.index].classList.remove('bot')
        this.index = index
        lis[index].classList.add('bot')
        this.$dispatch('click-msg', item)
      }
    }
  }
</script>