import Vue from 'vue'
import Febs from './FEBS'
import router from './router'
import Antd from 'ant-design-vue'
import store from './store'
import request from 'utils/request'
import db from 'utils/localstorage'
import VueApexCharts from 'vue-apexcharts'
// 地图用到的样式
import 'leaflet/dist/leaflet.css'

import 'ant-design-vue/dist/antd.css'

// 引入自定义图标库
import '@/fonts/iconfont.css'
import '@/fonts/iconfont.js'

// 引入elementui，主要是用颜色选择器，暂无其它好用组件
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import 'utils/install'

Vue.config.productionTip = false
Vue.use(db)
Vue.use(VueApexCharts)

Vue.component('apexchart', VueApexCharts)
Vue.use(ElementUI)
Vue.use(Antd)

Vue.use({
  install(Vue) {
    Vue.prototype.$db = db
  }
})

Vue.prototype.$post = request.post
Vue.prototype.$get = request.get
Vue.prototype.$put = request.put
Vue.prototype.$delete = request.delete
Vue.prototype.$export = request.export
Vue.prototype.$download = request.download
Vue.prototype.$upload = request.upload
Vue.prototype.$request = request.request

const initVue = () => {
  /* eslint-disable no-new */
  new Vue({
    router,
    store,
    render: h => h(Febs)
  }).$mount('#febs')
}

// 先获取配置参数后再渲染界面，保证界面能使用到系统配置参数
request.get('/api/v1/sandtable_target/getCurrentCity').then(res => {
  initVue()
  if (res.data.status === 200) {
    store.commit('setting/setCurrentCity', res.data.data)
    console.log('===')
    console.log(res.data.data)
  }
}).catch(() => {
  initVue()
})
