<template>
  <div class="siderbar_detail_img" ref="siderbar" :style="getStyle">
    <slot name="get_siderbar"></slot>
  </div>
</template>
<script>
import {listener} from './util'
export default {
  props: {
    contentWidth: {
      default: ''
    },
    position: {
      default: ''
    }
  },
  data () {
    return {
      // siderbar prop
      startSidTop: 0,
      startSidLeft: 0,
      moveSidTop: 0,
      moveSidLeft: 0
    }
  },
  computed: {
    getStyle () {
      if (this.position === 'left') {
        return {
          left: 0
        }
      }
      return {
        right: 0
      }
    }
  },
  mounted () {
  },
  methods: {
    sidMoveMove (e) {
      let x = e.clientX - this.startSidLeft
      let y = e.clientY - this.startSidTop
      this.moveSidTop = y
      this.moveSidLeft = x
    },
    mousedown (e) {
      this.startSidLeft = e.clientX - this.$refs.siderbar.offsetLeft
      this.startSidTop = e.clientY - this.$refs.siderbar.offsetTop
      this.mousemove(this.$refs.siderbar, this.sidMoveMove)
      this.mouseup(this.$refs.siderbar, this.sidMoveMove)
    },
    mouseup (element, handle) {
      listener.addListener(document, 'mouseup', function () {
        element && listener.removeListener(element, 'mousemove', handle)
      })
    },
    mousemove (element, handle) {
      listener.addListener(element, 'mousemove', handle)
    },
    handleClose () {
      this.$emit('close', false)
    }
  }
}
</script>
<style>
.siderbar_detail_img {
  position: absolute;
  top: 0;
  width: 22%;
  bottom: 0;
  padding: 2%;
  background-color: #ffffff;
}
.closeBtn {
  background: rgb(126, 122, 122);
  background-image: url('./images/icons.png');
  background-repeat: no-repeat;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-position: -260px 0;
  position: absolute;
  top: -10px;
  right: -10px;
  border: 2px solid #ffffff;
}
</style>
