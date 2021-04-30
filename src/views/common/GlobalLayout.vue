<template>
  <a-layout>
    <global-header :menuData="menuData" :collapsed="collapsed" />
    <drawer v-if="isMobile" :openDrawer="collapsed" @change="onDrawerChange">
      <sider-menu
        :theme="theme"
        :menuData="menuData"
        :collapsed="false"
        :collapsible="false"
        @menuSelect="onMenuSelect"
        @toggleCollapse="toggleCollapse"
      />
    </drawer>
    <sider-menu
      :theme="theme"
      v-else-if="layout === 'side'"
      :menuData="menuData"
      :collapsed="collapsed"
      :collapsible="true"
      class="side-menu-container"
      @toggleCollapse="toggleCollapse"
    />
    <drawer :open-drawer="settingBar" placement="right">
      <setting />
    </drawer>
    <a-layout :style="{ paddingLeft: paddingLeft }">
      <a-layout-content
        :style="{ minHeight: minHeight, margin: '20px 14px 0' }"
        :class="fixHeader ? 'fixed-header-content' : null"
      >
        <slot></slot>
      </a-layout-content>
      <a-layout-footer style="padding: .29rem 0" class="copyright">
        <global-footer :copyright="copyright" />
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script>
import GlobalHeader from './GlobalHeader'
import GlobalFooter from './GlobalFooter'
import Drawer from '~/tool/Drawer'
import SiderMenu from '~/menu/SiderMenu'
import Setting from '~/setting/Setting'
import { mapState, mapMutations } from 'vuex'
import { triggerWindowResizeEvent } from 'utils/common'

const minHeight = window.innerHeight - 64 - 24 - 66

let menuData = []

export default {
  name: 'GlobalLayout',
  components: { Setting, SiderMenu, Drawer, GlobalFooter, GlobalHeader },
  data() {
    return {
      minHeight: minHeight + 'px',
      collapsed: false,
      menuData: menuData
    }
  },
  computed: {
    paddingLeft() {
      return this.fixSiderbar && this.layout === 'side' && !this.isMobile ? `${this.sidebarOpened ? 256 : 80}px` : '0'
    },
    ...mapState({
      sidebarOpened: state => state.setting.sidebar.opened,
      isMobile: state => state.setting.isMobile,
      theme: state => state.setting.theme,
      layout: state => state.setting.layout,
      copyright: state => state.setting.copyright,
      fixSiderbar: state => state.setting.fixSiderbar,
      fixHeader: state => state.setting.fixHeader,
      settingBar: state => state.setting.settingBar.opened
    })
  },
  methods: {
    ...mapMutations({ setSidebar: 'setting/setSidebar' }),
    toggleCollapse() {
      this.collapsed = !this.collapsed
      this.setSidebar(!this.collapsed)
      triggerWindowResizeEvent()
    },
    onDrawerChange(show) {
      this.collapsed = show
    },
    onMenuSelect() {
      this.toggleCollapse()
    }
  },
  beforeCreate() {
    let routers = this.$db.get('USER_ROUTER')
    menuData = routers
      .find(item => item.path === '/')
      .children.filter(menu => {
        let meta = menu.meta
        if (typeof meta.isShow === 'undefined') {
          return true
        } else return meta.isShow
      })
  }
}
</script>

<style lang="less" scoped>
.setting {
  background-color: #1890ff;
  color: #fff;
  border-radius: 5px 0 0 5px;
  line-height: 40px;
  font-size: 22px;
  width: 40px;
  height: 40px;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
}
.fixed-header-content {
  margin: 76px 12px 0 !important;
}

.side-menu-container {
  margin-top: 50px;
  height: calc(100vh - 50px);
}
</style>

<style lang="scss">
// leaflet 全局样式
.leaflet-bottom.leaflet-right {
  // 消除版权
  display: none !important;
}
// 对leaflet全局样式的改写
.leaflet-container {
  background: #35549d !important;
}
</style>
