import viewerComponent from '../components/viewer/viewer.vue'
const viewer = {
  install: function (Vue) {
    if (typeof window !== 'undefined' && window.Vue) {
      Vue = window.Vue
    }
    Vue.component(viewerComponent.name, viewerComponent)
  }
}
// 导出模块
export default viewer