<template>
  <a-layout-sider
    :class="[theme, 'sider', isMobile ? null : 'shadow', fixSiderbar ? 'ant-fixed-sidemenu' : null]"
    width="256px"
    :collapsible="collapsible"
    v-model="collapsed"
    :trigger="null"
  >
    <i-menu :theme="theme" :collapsed="collapsed" :menuData="menuData" @select="onSelect" />
    <div class="trigger-container">
      <a-icon
        v-if="layout === 'side'"
        class="trigger"
        :type="collapsed ? 'menu-unfold' : 'menu-fold'"
        @click="toggleCollapse"
      />
    </div>
  </a-layout-sider>
</template>

<script>
import IMenu from './menu'
import { mapState } from 'vuex'

export default {
  name: 'SiderMenu',
  components: { IMenu },
  props: {
    collapsible: {
      type: Boolean,
      required: false,
      default: false
    },
    collapsed: {
      type: Boolean,
      required: false,
      default: false
    },
    menuData: {
      type: Array,
      required: true
    },
    theme: {
      type: String,
      required: false,
      default: 'dark'
    }
  },
  computed: {
    ...mapState({
      isMobile: state => state.setting.isMobile,
      layout: state => state.setting.layout,
      fixSiderbar: state => state.setting.fixSiderbar
    })
  },
  methods: {
    toggleCollapse() {
      this.$emit('toggleCollapse')
    },
    onSelect(obj) {
      this.$emit('menuSelect', obj)
    }
  }
}
</script>

<style lang="less" scoped>
.shadow {
  box-shadow: 1px 0 6px rgba(0, 21, 41, 0.35);
}
.sider {
  z-index: 16;
  position: relative;
  overflow-x: hidden;
  &.light {
    background-color: #fff;
  }
  &.dark {
    .trigger-container {
      color: #fff;
      background: #292e36 !important;
    }
  }
  &.ant-fixed-sidemenu {
    position: fixed;
    overflow-y: auto;
    height: 100%;

    .ant-menu {
      height: calc(100% - 96px);
      padding-top: 30px;
    }

    .trigger-container {
      height: 40px;
      line-height: 40px;
      text-align: center;
    }
  }
}
</style>
