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
    top: {
      default: 0
    },
    height: {
      default: 0
    },
    left: {
      default: 30
    },
    right: {
      default: 30
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
          top: `${this.top}px`,
          height: `${this.height - 40}px`,
          left: `${this.left}px`
        }
      }
      return {
        top: `${this.top}px`,
        height: `${this.height - 40}px`,
        right: `${this.right}px`
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
  overflow: auto;
  top: 0;
  width: 22%;
  padding: 20px 2%;
  border-radius: 6px;
  background-color: #ffffff;
}
</style>
