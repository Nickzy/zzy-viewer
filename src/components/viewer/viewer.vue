<template>
  <div class="wrap__mask" v-if="isShowSelf" :style="isFullscreen? '' : 'padding: 10px 50px'">
    <div v-if="isFullscreen" style="width: 100%; height: 100%">
      <img 
        :draggable="false"
        style="width: 100%; height: 100%"
        :src="src"
        alt=""
      />
    </div>
    <div class="content_img" v-if="!isFullscreen">
      <div class="closeBtn" @click="handleClose"></div>
      <div class="self_img" :style="wrapImgStyle" ref="wrapMoveImg">
        <div :style="percentStyle" :class="transformStatus ? 'self_img_transition current_img_percent' : 'current_img_percent'">{{`${scaleSize}%`}}</div>
        <img 
          ref="canMoveImg"
          @mousedown="mousedown"
          :draggable="false"
          :style="style"
          :src="src"
          alt=""
        />
        <a download @click="downloadIamge('down', 'aaa')" href="javascript:;">点击下载</a>
        <div class="footer_operation">
          <ul class="button_operation" @click="handleClick">
            <li data-action="zoom-in"></li>
            <li data-action="zoom-out"></li>
            <li data-action="one-to-one"></li>
            <li data-action="reset"></li>
            <li data-action="prev"></li>
            <li data-action="play"></li>
            <li data-action="next"></li>
            <li data-action="rotate-left"></li>
            <li data-action="rotate-right"></li>
            <li data-action="flip-horizontal"></li>
            <li data-action="flip-vertical"></li>
          </ul>
          <footer-img-list @getImgData="getImgData" :listArr="list" :isFull="false" :changeIndex="currentIndex"></footer-img-list>
        </div>
      </div>
      <siderbar-detail v-if="isHasSiderBar" :contentWidth="contentWidth" :position="position" @close="close">
        <template slot="get_siderbar">
          <slot name="siderbar"></slot>
        </template>
      </siderbar-detail>
    </div>
  </div>
</template>
<script>
import footerImgList from './footerImgList'
import siderbarDetail from './siderbarDetail'
import {listener} from './util'
import screenfull from 'screenfull'
export default {
  name: 'viewer',
  props: {
    position: {
      default: ''
    },
    list: {
      default: []
    },
    index: {
      default: null
    },
    isHasSiderBar: {
      default: false
    },
    bottom: {
      default: 10,
      type: Number
    },
    top: {
      default: 30,
      type: Number
    },
    fatherElement: {
      default: null
    }
  },
  data () {
    return {
      nsNum: 0,
      isShowSelf: false,
      // 图片属性
      width: null,
      height: 0,
      defailtMinWidth: 20,
      defailtMaxWidth: 800,
      changeHeiht: 0,
      moveTop: 0,
      moveLeft: 0,
      beforeTop: 0,
      beforeLeft: 0,
      startTop: 0,
      startLeft: 0,
      currentIndex: 0,
      startDistance: 0,
      scaleSize: 0,
      initPercent: 0,
      percentIsShow: false,
      initData: null,
      rotate: 0,
      toggleRotateX: false,
      toggleRotateY: false,
      transforms: [],
      transformStatus: false,
      isFullscreen: false,
      isOneByOne: false,
      playOfImg: null,
      src: '',
      numSetimeout: 0
    }
  },
  components: {footerImgList, siderbarDetail},
  computed: {
    style () {
      if (this.width) {
        return {
          width: `${this.width}px`,
          top: `${this.moveTop}px`,
          left: `${this.moveLeft}px`
        }
      } else {
        return {
          width: 0,
          top: '50%',
          left: '50%'
        }
      }
    },
    contentWidth () {
      let element = document.querySelector('.content_img')
      return element && element.clientWidth
    },
    wrapImgStyle () {
      if (!this.isHasSiderBar) {
        return {
          width: '100%'
        }
      }
      if (this.position === 'left') {
        return {
          right: 0
        }
      }
      return {
        left: 0
      }
    },
    percentStyle () {
      if (this.initData && this.initData.wrapWidth) {
        let width = this.$refs.wrapMoveImg.querySelector('.current_img_percent').clientWidth
        return {
          display: this.percentIsShow ? 'block' : 'none',
          left: `${(this.initData.wrapWidth - width) / 2}px`
        }
      } else {
        return {
          display: this.percentIsShow ? 'block' : 'none'
        }
      }
    }
  },
  mounted () {
    let _this = this
    this.$nextTick(function () {
      // 拖动图片初始属性
      document.body.addEventListener('mousewheel', _this.mouseSheel)
      window.addEventListener('resize', function () {
        _this.isFullscreen = screenfull.isFullscreen
        if (!screenfull.isFullscreen && _this.$refs.wrapMoveImg) {
          _this.initData.wrapWidth = _this.$refs.wrapMoveImg.clientWidth
          _this.initData.wrapHeight = _this.$refs.wrapMoveImg.clientHeight
          _this.init(_this, _this.src)
        }
      })
    })
  },
  methods: {
    init (_this, src, cb) {
      return new Promise((resolve, reject) => {
        let imgObj = new Image()
        imgObj.src = src
        // 底部操作栏高度
        let footerHeight = document.querySelector('.footer_operation').clientHeight
        // 图片可移动范围
        let wrapWidth = _this.$refs.wrapMoveImg.clientWidth
        let wrapHeight = _this.$refs.wrapMoveImg.clientHeight
        // 拖动图片初始属性
        _this.imgIsComplet(imgObj, (img) => {
          let imgRealWidth = imgObj.width
          let imgRealHeight = imgObj.height
          let lastW = ''
          let lastH = ''
          let w = 1
          let resultH = wrapHeight - (_this.top + footerHeight)
          // 计算图片大小
          if (imgRealWidth > wrapWidth) {
            lastW = wrapWidth * 0.8
            let curImgHeight = imgRealHeight * lastW / imgRealWidth
            if (curImgHeight > resultH) {
              curImgHeight = resultH - _this.bottom
              w = curImgHeight / imgRealHeight
              lastW = w * imgRealWidth
              lastH = curImgHeight
            } else {
              w = curImgHeight / imgRealHeight
            }
          } else {
            let curImgHeight = imgRealHeight
            if (curImgHeight > resultH) {
              curImgHeight = resultH - _this.bottom
              w = curImgHeight / imgRealHeight
              lastW = w * imgRealWidth
              lastH = curImgHeight
            } else {
              lastW = imgRealWidth
              lastH = curImgHeight
            }
          }
          let top = 30
          let left = (wrapWidth - lastW) / 2
          // 设置图片初始属性
          _this.width = lastW
          _this.height = lastH
          _this.changeHeiht = lastH
          _this.moveTop = top
          _this.moveLeft = left
          _this.beforeTop = 0
          _this.beforeLeft = 0
          _this.defailtMinWidth = imgRealWidth * 0.01
          _this.defailtMaxWidth = imgRealWidth * 10
          _this.scaleSize = Math.floor(w * 100)
          _this.initPercent = w
          // 存储初始属性
          _this.src = src
          let data = {wrapWidth, wrapHeight, imgRealWidth, lastW, imgRealHeight, lastH, rotate: 0, w, top, left}
          _this.initData = data
          resolve()
        })
      })
    },
    reset () {
      let {lastW, lastH, top, left} = this.initData
      this.width = lastW
      this.changeHeiht = lastH
      this.moveTop = top
      this.moveLeft = left
      this.beforeTop = 0
      this.beforeLeft = 0
      this.transforms = []
      this.rotate = 0
      this.toggleRotateX = false
      this.toggleRotateY = false
      this.isOneByOne = false
      this.initPercent = this.initData.w
      this.scaleSize = Math.floor(this.initData.w * 100)
      this.scaleSizeChange()
    },
    scaleSizeChange () {
      this.percentIsShow = true
      this.transition()
      if (this.scaleSizeChange) {
        clearTimeout(this.scaleSizeTimer)
      }
      this.scaleSizeTimer = setTimeout(() => {
        this.percentIsShow = false
      }, 1000)
    },
    getSelfWidth (minWidth, maxWidth, delta, realWidth) {
      return Math.max(minWidth, Math.min(maxWidth, (realWidth * (1 + (delta / 100)))))
    },
    // 拖动事件
    mousedown (e) {
      this.startLeft = e.clientX - this.$refs.canMoveImg.offsetLeft
      this.startTop = e.clientY - this.$refs.canMoveImg.offsetTop
      this.mousemove(this.$refs.wrapMoveImg, this._mouseMove)
      this.mouseup(this.$refs.wrapMoveImg, this._mouseMove)
    },
    mouseup (element, handle) {
      let _this = this
      listener.addListener(document, 'mouseup', function (e) {
        _this.startDistance = 0
        element && listener.removeListener(element, 'mousemove', handle)
      })
    },
    _mouseMove (e) {
      let x = e.clientX - this.startLeft
      let y = e.clientY - this.startTop
      this.moveTop = y
      this.moveLeft = x
      this.beforeTop = y
      this.beforeLeft = x
    },
    mousemove (element, handle) {
      listener.addListener(element, 'mousemove', handle)
    },
    mouseSheel (event) {
      if (!screenfull.isFullscreen && this.isShowSelf) {
        let e = event
        e.preventDefault()
        let delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)))
        let p = delta / 100
        let ns = this.initPercent
        ns += p
        ns = ns < 0.01 ? 0.01 : (ns > 10 ? 10 : ns) //可以缩小到0.01,放大到5倍
        this.getNsNum(ns)
        let x = e.pageX - 50 - this.$refs.wrapMoveImg.offsetLeft
        let y = e.pageY - 10
        let left = this.moveLeft - (x  - this.moveLeft) * p / this.initPercent
        let top = this.moveTop - (y - this.moveTop) * p / this.initPercent
        if (this.nsNum <= 1) {
          this.width = this.initData.imgRealWidth * ns
          this.height = this.initData.imgRealWidth * ns
          this.moveTop = top
          this.moveLeft = left
        }
        this.initPercent = ns
        this.scaleSize = Math.round(ns * 100)
        this.scaleSizeChange()
        this.transition()
      }
      // return false
    },
    getNsNum (ns) {
      if (ns === 0.01) {
        this.nsNum = this.nsNum + 1
      } else {
        this.nsNum = 0
      }
    },
    transition () {
      this.transformStatus = true
      if (this.transitionTimer) {
        clearTimeout(this.transitionTimer)
      }
      this.transitionTimer = setTimeout(() => {
        this.transformStatus = false
      }, 3000)
    },
    addListener () {
      document.body.addEventListener('mousewheel', this.mouseSheel)
    },
    close () {
      this.isShowSelf = false
      // this.$destroy()
    },
    handleClose () {
      this.close()
    },
    setinitPercent (p) {
      let ns = this.initPercent
      ns += p
      ns = ns < 0.01 ? 0.01 : (ns > 10 ? 10 : ns) //可以缩小到0.01,放大到5倍
      this.getNsNum(ns)
      let x = 50 + this.$refs.wrapMoveImg.offsetLeft + this.width
      let y = 10 + this.height + this.$refs.wrapMoveImg.offsetTop
      let left = this.moveLeft - (this.width / 2) * p / this.initPercent
      let top = this.moveTop - (this.height / 2) * p / this.initPercent
      if (this.nsNum <= 1) {
        this.width = this.initData.imgRealWidth * ns
        this.height = this.initData.imgRealWidth * ns
        this.moveTop = top
        this.moveLeft = left
      }
      this.initPercent = ns
      this.scaleSize = Math.round(ns * 100)
      this.scaleSizeChange()
    },
    handleClick (e) {
      let btnText = e.target.dataset.action
      switch (btnText) {
        case 'reset':
          this.reset()
          break
        case 'zoom-in':
          if (this.initPercent < 0.01) {
            return
          }
          this.setinitPercent(0.01)
          break
        case 'zoom-out':
          if (this.initPercent > 10) {
            return
          }
          this.setinitPercent(-0.01)
          break
        case 'rotate-left':
          this.rotate--
          this.filterTransForms('rotate')
          this.transforms.push(`rotate(${this.rotate * 90}deg)`)
          break
        case 'rotate-right':
          this.rotate++
          this.filterTransForms('rotate')
          this.transforms.push(`rotate(${this.rotate * 90}deg)`)
          break
        case 'flip-horizontal':
          this.toggleRotateX = !this.toggleRotateX
          this.filterTransForms('scaleX')
          this.transforms.push(`scaleX(${this.toggleRotateX ? -1 : 1})`)
          break
        case 'flip-vertical':
          this.toggleRotateY = !this.toggleRotateY
          this.filterTransForms('scaleY')
          this.transforms.push(`scaleY(${this.toggleRotateY ? -1 : 1})`)
          break
        case 'prev':
          if (this.currentIndex > 0) {
            this.width = 0
            this.currentIndex--
          }
          break
        case 'next':
          if (this.currentIndex < this.list.length - 1) {
            this.width = 0
            this.currentIndex++
          }
          break
        case 'play':
          screenfull.request()
          break
        case 'one-to-one':
          this.isOneByOne = !this.isOneByOne
          let {imgRealWidth, imgRealHeight, wrapWidth, wrapHeight, lastW, lastH} = this.initData
          if (this.isOneByOne) {
            if (this.scaleSize !== 100) {
              this.width = imgRealWidth
              this.changeHeiht = imgRealHeight
              this.moveTop = (wrapHeight - imgRealHeight) / 2
              this.moveLeft = (wrapWidth - imgRealWidth) / 2
              this.scaleSize = 100
              this.initPercent = 1
            }
          } else {
            this.width = lastW
            this.changeHeiht = lastH
            this.moveTop = this.beforeTop || this.initData.top
            this.moveLeft = this.beforeLeft || this.initData.left
            this.scaleSize = Math.floor((this.width / this.initData.imgRealWidth) * 100)
            this.initPercent = this.width / this.initData.imgRealWidth
          }
          this.scaleSizeChange()
          break
      }
    },
    filterTransForms (type) {
      if (this.transforms.length) {
        this.transforms = this.transforms.filter(item => {
          return item.indexOf(type) === -1
        })
      }
    },
    imgIsComplet (img, callback) {
      let timer = setInterval(() => {
        if (img.complete) {
          callback(img)
          clearInterval(timer)
        }
      }, 100)
    },
    show (event) {
      let e = event
      let src = e.target.src
      if (!screenfull.isFullscreen && src) {
        this.list.forEach((item, index) => {
          if (src.indexOf(item.uri) !== -1) {
            this.isShowSelf = true
            this.$nextTick(() => {
              this.init(this, this.list[index].uri)
              this.currentIndex = index
            })
          }
        })
      }
    },
    getImgData (item, index, isChange) {
      let _this = this
      this.width = null
      this.changeHeiht = 0
      this.isOneByOne = false
      let Img = new Image()
      Img.src = item.uri
      this.imgIsComplet(this.$refs.canMoveImg, (img) => {
        _this.init(_this, item.uri)
      })
      if (!isChange) {
        this.currentIndex = index
      }
    },
    fullImgClick () {
      screenfull.exit()
    },
    imgPlay () {
      let _this = this
      this.playOfImg = setInterval(() => {
        if (_this.currentIndex < _this.list.length - 1) {
          _this.currentIndex++
        } else {
          _this.currentIndex = 0
        }
        if (_this.list.length) {
          _this.src = _this.list[_this.currentIndex].uri
        }
      }, 2000)
      window.addEventListener('click', this.fullImgClick)
    },
    imgStop () {
      let _this = this
      this.playOfImg && clearInterval(this.playOfImg)
      window.removeEventListener('click', this.fullImgClick, false)
      this.$nextTick(function () {
        if (_this.list.length) {
          _this.imgIsComplet(_this.$refs.canMoveImg, (img) => {
            _this.init(_this, _this.src)
          })
        }
      })
    },
    downloadIamge (selector, name) {
      // 通过选择器获取img元素
      var img = this.$refs.canMoveImg
      // 将图片的src属性作为URL地址
      var url = img.src
      var a = document.createElement('a')
      var event = new MouseEvent('click')
      a.download = name || '下载图片名称'
      a.href = url
      a.dispatchEvent(event)
    }
  },
  beforeDestroy () {
  },
  destroyed () {
    // 组建销毁移除监听事件
    listener.removeListener(document.body, 'mousewheel', this.mouseSheel)
    // listener.removeListener(document.body, 'mousewheel', _this.mouseSheel)
    // 属性初始化
  },
  watch: {
    transforms (newValue, value) {
      if (newValue.length && this.$refs.canMoveImg) {
        this.$refs.canMoveImg.style.transform = newValue.join(' ')
      }
      if (!newValue.length && this.$refs.canMoveImg) {
        this.$refs.canMoveImg.style.transform = newValue.join(' ')
      }
    },
    isFullscreen (newValue, value) {
      if (newValue) {
        this.imgPlay()
      } else {
        this.imgStop()
      }
    },
    index (newValue, value) {
      if (typeof newValue === 'number') {
        this.currentIndex = newValue
      }
    },
    fatherElement (newValue, value) {
      newValue && newValue.addEventListener('click', this.show)
    }
  }
}
</script>
<style >
.wrap__mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,.5);
  z-index: 10000000;
  user-select: none;
}
.self_img_transition {
  transition: all 0.3s ease;
}
.content_img {
  position: relative;
  /* overflow: hidden; */
  display: flex;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,.3);
}
.self_img img {
  display: block;
  cursor: pointer;
  position: absolute;
  width: auto;
  height: auto;
}
.current_img_percent {
  position: absolute;
  color: #ffffff;
  top: 40%;
  font-size: 12px;
  background: rgb(0,0,0);
  text-align: center;
  line-height: 20px;
  border-radius: 8px;
  padding: 0 10px;
  z-index: 100;
  user-select: none;
}
.self_img {
  position: absolute;
  width: 72%;
  height: 100%;
  background: rgba(0,0,0,.2);
  overflow: hidden;
  transition: all 2s;
}
.footer_operation {
  position: absolute;
  width: 100%;
  bottom: 0;
}
.button_operation {
  width: 270px;
  margin: 0 auto 5px;
  display: flex;
  justify-content: flex-start;
}
.button_operation li {
  cursor: pointer;
  width: 20px;
  height: 20px;
  margin: 2px;
  background-color: #000000;
  opacity: 0.5;
  border-radius: 50%;
  background-image: url('./images/icons.png');
  background-repeat: no-repeat;
}
.button_operation li:hover {
  opacity: 0.8;
}
.button_operation li:nth-child(1) {
  background-position: 0 0;
}
.button_operation li:nth-child(2) {
  background-position: -20px 0;
}
.button_operation li:nth-child(3) {
  background-position: -40px 0;
}
.button_operation li:nth-child(4) {
  background-position: -60px 0;
}
.button_operation li:nth-child(5) {
  background-position: -80px 0;
}
.button_operation li:nth-child(6) {
  background-position: -100px 0;
}
.button_operation li:nth-child(7) {
  background-position: -120px 0;
}
.button_operation li:nth-child(8) {
  background-position: -140px 0;
}
.button_operation li:nth-child(9) {
  background-position: -160px 0;
}
.button_operation li:nth-child(10) {
  background-position: -180px 0;
}
.button_operation li:nth-child(11) {
  background-position: -200px 0;
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
  z-index: 2;
}
</style>
