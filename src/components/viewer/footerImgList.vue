<template>
  <div class="footer_self_carousel">
    <ul :style="style">
      <li @click="handleClick(item , index)" :class="index === currentIndex ? 'footer_small_img_isactive' : ''" v-for="(item, index) in listArr" :key="index">
        <div :style="`background: url(${item.uri}) no-repeat; backgroundSize: 100% 100%; height: 50px`"></div>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  props: {
    changeIndex: {
      default: 0
    },
    isFull: false,
    listArr: {
      default: []
    }
  },
  data () {
    return {
      currentIndex: 0
    }
  },
  computed: {
    style () {
      return {
        width: `${this.listArr.length * 50}px`,
        maxWidth: '500px'
      }
    }
  },
  mounted () {
    console.log(this.changeIndex)
    this.currentIndex = this.changeIndex
  },
  methods: {
    handleClick (item, index) {
      this.currentIndex = index
      this.$emit('getImgData', item, index)
    }
  },
  watch: {
    changeIndex (newIndex, index) {
      console.log(newIndex)
      if (typeof newIndex === 'number') {
        this.currentIndex = newIndex
        console.log(this.isFull)
        this.$emit('getImgData', this.listArr[newIndex], index, true)
      }
    }
  }
}
</script>
<style>
.footer_self_carousel {
  width: 100%;
  background-color: rgba(0,0,0,.5);
}
.footer_self_carousel ul {
  margin: 0 auto;
  display: flex;
  overflow: hidden;
}
.footer_self_carousel ul li {
  width: 40px;
  height: auto;
  opacity: 0.5;
}
.footer_self_carousel ul .footer_small_img_isactive {
  opacity: 1;
}
</style>
