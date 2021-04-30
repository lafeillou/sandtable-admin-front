<template>
  <div class="global-map-container">
    <div class="bg-border">
      <div class="top-left">
        <img src="/img/border_1.png" class="bg-top-left bg-border-item" />
        <img src="/img/border_2.png" class="bg-top-left-2 bg-border-item" />
        <img src="/img/border_3.png" class="bg-top-left-3 bg-border-item" />
      </div>
      <img src="/img/img_title.png" class="bg-top-center bg-border-item" />
      <div class="top-right">
        <img src="/img/border_1.png" class="bg-top-right bg-border-item" />
        <img src="/img/border_2.png" class="bg-top-right-2 bg-border-item" />
        <img src="/img/border_3.png" class="bg-top-right-3 bg-border-item" />
      </div>
      <div class="bottom-left">
        <img src="/img/border_4.png" class="bg-bottom-left bg-border-item" />
        <img src="/img/border_2.png" class="bg-bottom-left-2 bg-border-item" />
        <img src="/img/border_3.png" class="bg-bottom-left-3 bg-border-item" />
      </div>
      <div class="bottom-right">
        <img src="/img/border_4.png" class="bg-bottom-right bg-border-item" />
        <img src="/img/border_2.png" class="bg-bottom-right-2 bg-border-item" />
        <img src="/img/border_3.png" class="bg-bottom-right-3 bg-border-item" />
      </div>
    </div>
    <div class="tools-container">
      <div :class="['handle-pannel-btn', { opened: pannelVisible }]" @click="pannelVisible = !pannelVisible"></div>
      <div :class="['handle-pannel-dialog', { opened: pannelVisible }]">
        <div class="handle-pannel-dialog-body">
          <div class="custom-border-radius">
            <span class="border-radius-right-top"></span>
            <span class="border-radius-right-bottom"></span>
          </div>
          <!-- <div v-if="false" class="mode-container">
            <a-select v-model="isTogetherMode" style="width: 120px" @change="resetCheckStatus">
              <a-select-option :value="1">共存模式</a-select-option>
              <a-select-option :value="0">互斥模式</a-select-option>
            </a-select>
          </div> -->
          <div class="mode-container">
            <a-switch
              @change="onSwitchChange"
              checked-children="开"
              un-checked-children="关"
              :checked="this.allLightsOn"
            />
          </div>
          <div class="clissify-list">
            <div
              v-for="(item, index) in classifys"
              :key="index"
              class="classify-item"
              @click="item.expanded = !item.expanded"
            >
              <div class="item-content">
                <svg class="icon" aria-hidden="true">
                  <use :xlink:href="item.targetClassify | classifyIconFilter" />
                </svg>
                <span class="name">{{ item.targetClassify.classifyName }}</span>
              </div>
              <div v-show="item.expanded" class="item-children" @click.stop>
                <div
                  v-for="(child, index) in item.targets"
                  :key="index"
                  class="child-item"
                  @click="handleTargetClick(child)"
                >
                  <span class="child-icon"></span>
                  <span :class="['name', { 'current-node': child === currentTarget }]">{{ child.targetName }}</span>
                  <a-checkbox
                    v-show="isTogetherMode"
                    :checked="child.checked"
                    class="item-checkbox"
                    @change="e => targetCheckChange(e, child)"
                  ></a-checkbox>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div :class="['information-display-dialog', { opened: informationDisplayVisible }]">
      <div class="custom-border-radius">
        <span class="border-radius-left-top"></span>
        <span class="border-radius-left-bottom"></span>
      </div>
      <div class="information-header">
        <span class="title">{{ currentTarget ? currentTarget.targetName : '' }}</span>
        <span class="btns">
          <span class="soldier-dialog-btn" @click="soldierDialogVisible = true">兵力部署</span>
          <a-icon type="close" class="close-btn" @click.native="informationDisplayVisible = false" />
        </span>
      </div>
      <a-tabs v-model="informationTabIndex" defaultActiveKey="1" class="information-content">
        <a-tab-pane key="1">
          <span slot="tab"> <a-icon type="font-size" />附近兵员 </span>
          <div class="information-tab-content sodier-search">
            <div style="padding: 12px 0;">
              <span>{{ currentTarget | latPosition }}</span>
              <span style="display:inline-block;width:30px;"></span>
              <span>{{ currentTarget | lngPosition }}</span>
            </div>
            <div class="search-label">{{ `查询范围半径（${searchRadius}km）` }}</div>
            <a-row>
              <a-col :span="1" style="height:36px;line-height:36px;text-align:right;padding-right:4px;">0</a-col>
              <a-col :span="22">
                <a-slider
                  :min="0"
                  :max="50"
                  :step="1"
                  v-model="searchRadius"
                  @change="updateSearchArea"
                  @afterChange="refreshAreaSodiers"
                />
              </a-col>
              <a-col :span="1" style="height:36px;line-height:36px;">50</a-col>
            </a-row>
            <a-collapse :bordered="false" expandIconPosition="right" accordion>
              <div style="color:#fff;">{{ `查询范围内兵力详情（共${searchSoldierList.length}人）` }}</div>
              <a-collapse-panel v-for="(item, index) in searchSoldierList" :key="index" :style="{ border: 'none' }">
                <template slot="header">
                  <span style="display:inline-block;width:80px;">{{ item.name }}</span>
                  <span>{{ item.targetName }}</span>
                </template>
                <div>组织岗位：{{ item.orgPost }}</div>
                <div>所在分队：{{ item.contingentName }}</div>
                <div>家庭住址：{{ item.homeAddress }}</div>
                <div>联系电话：{{ item.telephone }}</div>
              </a-collapse-panel>
            </a-collapse>
          </div>
        </a-tab-pane>
        <a-tab-pane key="2">
          <span slot="tab"> <a-icon type="fund" />图片 </span>
          <div class="information-tab-content">
            <img
              v-for="(img, index) in currentTarget ? currentTarget.pictureList : []"
              :key="index"
              :src="baseURL + img.fullPath"
              @click="
                handleWebsocketMessage({
                  data: JSON_STRINGIFY([
                    {
                      eventSource: 'PAD',
                      eventAction: 'SHOW',
                      eventType: 'PICTURE',
                      eventAttachmentUrl: img.fullPath
                    }
                  ])
                })
              "
            />
          </div>
        </a-tab-pane>
        <a-tab-pane key="3">
          <span slot="tab"> <a-icon type="play-circle" />视频 </span>
          <div v-if="informationDisplayVisible && informationTabIndex == 3" class="information-tab-content">
            <video
              ref="tabVideos"
              v-for="(video, index) in currentTarget ? currentTarget.mediaList : []"
              :key="index"
              :src="baseURL + video.fullPath"
              autoplay
              preload
              controls="controls"
              @click="
                handleWebsocketMessage({
                  data: JSON_STRINGIFY([
                    {
                      eventSource: 'PAD',
                      eventAction: 'SHOW',
                      eventType: 'VIDEO',
                      eventAttachmentUrl: video.fullPath
                    }
                  ])
                })
              "
            >
              浏览器不支持
            </video>
          </div>
        </a-tab-pane>
      </a-tabs>
      <a-modal
        v-model="soldierDialogVisible"
        title="兵力部署"
        wrapClassName="map-solider-display-dialog"
        :footer="null"
        :width="1000"
      >
        <div class="custom-border-radius">
          <span class="border-radius-right-top"></span>
          <span class="border-radius-right-bottom"></span>
          <span class="border-radius-left-top"></span>
          <span class="border-radius-left-bottom"></span>
        </div>
        <div class="body-content">
          <a-table
            :columns="columns"
            :rowKey="record => record.id"
            :dataSource="soldierList"
            :pagination="pagination"
            :loading="loading"
            :rowClassName="soldierRowClass"
            @change="handleSoldierTableChange"
          ></a-table>
        </div>
      </a-modal>
      <a-modal
        v-model="previewDialogVisible"
        :title="eventData.eventType === 'PICTURE' ? '图片预览' : '视频预览'"
        wrapClassName="map-target-preview-dialog"
        :footer="null"
        :width="dialogWidth"
      >
        <div class="custom-border-radius">
          <span class="border-radius-right-top"></span>
          <span class="border-radius-right-bottom"></span>
          <span class="border-radius-left-top"></span>
          <span class="border-radius-left-bottom"></span>
        </div>
        <div v-if="previewDialogVisible" class="body-content">
          <img v-show="eventData.eventType === 'PICTURE'" :src="baseURL + eventData.eventAttachmentUrl" />
          <video
            ref="previewVideo"
            v-show="eventData.eventType === 'VIDEO'"
            :src="baseURL + eventData.eventAttachmentUrl"
            controls="controls"
            autoplay
            preload
          >
            浏览器不支持
          </video>
        </div>
      </a-modal>
    </div>
    <l-map
      ref="dengzhouMap"
      class="map-container"
      :zoom="zoom"
      :minZoom="1"
      :maxZoom="16"
      :center="center"
      :options="mapOptions"
      @leaflet:load="leafletLoaded"
      @update:center="centerUpdate"
      @update:zoom="zoomUpdate"
    >
      <l-control-layers :position="layersPosition" :collapsed="true" :sort-layers="false" />
      <l-tile-layer
        v-for="tileProvider in tileProviders"
        :key="tileProvider.name"
        :name="tileProvider.name"
        :visible="tileProvider.visible"
        :url="tileProvider.url"
        :attribution="tileProvider.attribution"
        layer-type="base"
      />
    </l-map>
    <div class="layer-switch-controls">
      <span
        :class="[
          'switch-btn',
          { 'is-current': tileProviders.findIndex(item => item.visible && item.name === '地图') > -1 }
        ]"
        @click="switchLayer('地图')"
        >地图</span
      >
      <span
        :class="[
          'switch-btn',
          { 'is-current': tileProviders.findIndex(item => item.visible && item.name === '卫星') > -1 }
        ]"
        @click="switchLayer('卫星')"
        >卫星</span
      >
    </div>
  </div>
</template>

<script>
import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup,
  LTooltip,
  LControlZoom,
  LControlAttribution,
  LControlScale,
  LControlLayers
} from 'vue2-leaflet'
import L from 'leaflet'
import 'leaflet-plugins/layer/vector/KML'

import { mapState, mapMutations } from 'vuex'
import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import classifyIconMap from './classify-icon-map.js'
import { tileProviders, baseURL } from '@/setting.js'

export default {
  name: 'MapContainer',
  components: {
    LMap,
    LTileLayer,
    LControlLayers
  },
  data() {
    return {
      baseURL,
      loading: false, // 加载状态
      zoom: 14,
      center: L.latLng(
        this.$store.state.setting.targetCenterCoordinates[1],
        this.$store.state.setting.targetCenterCoordinates[0]
      ),
      currentZoom: 14,
      currentCenter: null,
      showParagraph: false,
      mapOptions: {
        // zoomSnap: 0.5
      },
      map: null,
      // 图层控制器
      layersPosition: 'topleft',
      // 图层集合
      tileProviders: JSON.parse(JSON.stringify(tileProviders)),
      // 操作面板打开状态
      pannelVisible: false,
      // 信息展示面板打开状态
      informationDisplayVisible: false,
      // 分类集合
      classifys: [],
      // 图标集合
      classifyIconMap,
      // 是否为共存模式(1:共存，0: 互斥)
      isTogetherMode: 0,
      // 树形列表中当前选中项
      currentTarget: null,
      // 点位坐标集合
      geoJsonArr: [],
      // 地图点位layer集合
      layerMap: {},
      // 点位集合
      targetMap: {},
      // 兵力部署对话框
      soldierDialogVisible: false,
      // 兵力部署列表
      soldierList: [],
      pagination: {
        defaultCurrent: 1,
        defaultPageSize: 8,
        showTotal: (total, range) => `共 ${total} 条数据`
      },
      // tab标签页
      informationTabIndex: '1',
      // 图片或视频预览
      previewDialogVisible: false,
      // 接收websocket的事件类型
      eventData: {},
      // 同时展示所有点位
      showAll: true,
      allLightsOn: false,
      dialogWidth: window.innerWidth * 0.7,
      // 点位附近兵员
      searchSoldierList: [],
      // 搜索圆
      circleLayer: null,
      // 搜索半径
      searchRadius: 0,
      JSON_STRINGIFY: JSON.stringify
    }
  },
  computed: {
    columns() {
      let { sortedInfo } = this
      sortedInfo = sortedInfo || {}
      return [
        {
          title: '姓名',
          dataIndex: 'name'
        },
        {
          title: '电话',
          dataIndex: 'telephone'
        },
        {
          title: '组织岗位',
          dataIndex: 'orgPost'
        },
        {
          title: '所在分队',
          dataIndex: 'contingentName'
        },
        {
          title: '家庭住址',
          dataIndex: 'homeAddress'
        }
      ]
    },
    queryAreaName() {
      return this.$store.state.setting.queryAreaName
    },
    queryAreaType() {
      return this.$store.state.setting.queryAreaType
    }
  },
  mounted() {
    this.refreshClassifys()
    this.initWebsocket()
  },
  filters: {
    classifyIconFilter(classify) {
      return classifyIconMap[classify.classifyCode] ? `#${classifyIconMap[classify.classifyCode].icon}` : '#'
    },
    latPosition(target) {
      if (!target) {
        return ''
      }

      const coordinates = target.geoJson.geometry.coordinates
      return `经度：${coordinates[0]} °E`
    },
    lngPosition(target) {
      if (!target) {
        return ''
      }

      const coordinates = target.geoJson.geometry.coordinates
      return `纬度：${coordinates[1]} °N`
    }
  },
  methods: {
    // 全亮灭开关
    onSwitchChange(checked) {
      // 一下为亮灭测试，没有通知后台
      // this.resetCheckStatus()
      // if (checked) {
      //   this.allLightsOn = true
      //   this.classifys.forEach(item => {
      //     item.targets.forEach(t => {
      //       this.renderGeoJson(t.geoJson, true)
      //     })
      //   })
      // } else {
      //   this.allLightsOn = false
      //   this.classifys.forEach(item => {
      //     item.targets.forEach(t => {
      //       this.renderGeoJson(t.geoJson)
      //     })
      //   })
      // }
      // 发送请求给后台，全亮灯/灭灯
      this.$request({
        url: '/api/v1/sandtable_event/target_control',
        method: 'post',
        data: {
          targetId: '',
          eventSource: 'PC',
          eventType: 'MAP',
          eventAction: 'SHOWALLTARGETS',
          eventAttachmentUrl: checked
        }
      }).then(res => {
        this.resetCheckStatus()
        if (checked) {
          this.allLightsOn = true
          this.classifys.forEach(item => {
            item.targets.forEach(t => {
              this.renderGeoJson(t.geoJson, true)
            })
          })
        } else {
          this.allLightsOn = false
          this.classifys.forEach(item => {
            item.targets.forEach(t => {
              this.renderGeoJson(t.geoJson)
            })
          })
        }
      })
    },
    // 地图加载完成
    leafletLoaded() {
      // this.addKmlLayer('/mapdata/邓州市矢量路网/邓州市_矢量路网/邓州市_矢量路网.kml')
      const map = this.$refs.dengzhouMap.mapObject
      map.pm.setLang('zh')
      this.map = map
      this.circleLayer = L.circle([this.center.lat, this.center.lng], { radius: 0 })
      this.circleLayer.addTo(map)
    },
    // 加载kml数据并添加到图层
    addKmlLayer(url) {
      const map = this.$refs.dengzhouMap.mapObject
      var track = new L.KML(url, { async: true })
        .on('loaded', e => {
          map.fitBounds(e.target.getBounds())
        })
        .addTo(map)
      L.control.layers({}, { Track: track }).addTo(map)
    },
    zoomUpdate(zoom) {
      this.currentZoom = zoom
    },
    centerUpdate(center) {
      this.currentCenter = center
    },
    // 渲染geojson数据
    renderGeoJson(geoJson, animation) {
      if (!geoJson) {
        return
      }

      const target = this.targetMap[geoJson.targetId]
      if (!target) {
        return
      }

      L.geoJSON(geoJson, {
        style: feature => {
          return { color: target.targetColor, fillColor: target.targetColor, fill: true }
        },
        pointToLayer: (feature, latlng) => {
          const icon = classifyIconMap[target.classifyCode]
            ? classifyIconMap[target.classifyCode].mapIcon
            : 'defaultMarkerIcon'
          const iconUrl = `/img/map-img/${icon}.png`
          const iconW = 60
          let divIcon
          if (animation) {
            divIcon = L.divIcon({
              className: 'dIcon',
              html: `<div class="marker-container" style="width:${iconW}px;height:${iconW}px"><span class="circle" style="background:${
                target.targetColor
              };"></span><img src="${iconUrl}"/><p class="marker-name" style="left:${iconW}px;top:${iconW / 2 - 8}px">${
                target.targetName
              }</p></div>`,
              iconSize: [iconW, iconW]
            })
          } else {
            divIcon = L.divIcon({
              className: 'dIcon',
              html: `<div class="marker-container" style="width:${iconW}px;height:${iconW}px"><img src="${iconUrl}"/><p class="marker-name" style="left:${iconW}px;top:${iconW /
                2 -
                8}px">${target.targetName}</p></div>`,
              iconSize: [iconW, iconW]
            })
          }

          return L.marker(latlng, { icon: divIcon, title: target.targetName, zIndexOffset: animation ? 100 : 0 })
        },
        onEachFeature: (feature, layer) => {
          this.layerMap[geoJson.targetId] = layer
          layer.on('click', ev => {
            this.informationDisplayVisible = true
          })
        }
      }).addTo(this.map)
    },
    // 清除目标点位
    clearTargetLayers() {
      Object.keys(this.layerMap).forEach(id => {
        const targetLayer = this.layerMap[id]
        targetLayer.remove()
      })
    },
    // 刷新分类
    refreshClassifys() {
      this.$get('/api/v1/sandtable_target/getTreeListByArea', {
        queryAreaType: this.queryAreaType,
        queryAreaName: this.queryAreaName
      }).then(res => {
        if (res.data.status === 200) {
          this.targetMap = {}
          this.classifys = res.data.data || []
          this.classifys.forEach(item => {
            this.$set(item, 'expanded', false)
            item.targets.forEach(target => {
              this.targetMap[target.id] = target
              this.$set(target, 'checked', false)
              const targetLocationArea = target.targetLocationArea
              try {
                const geoJson = JSON.parse(targetLocationArea)
                target.geoJson = geoJson
                if (geoJson) {
                  geoJson.targetId = target.id
                  this.showAll && this.renderGeoJson(target.geoJson)
                }
              } catch (error) {}
            })
          })
        }
      })
    },
    // 点击点位，点位选中状态变化
    handleTargetClick(target) {
      let checked = !target.checked
      if (!this.isTogetherMode) {
        // 互斥模式点击必是选中
        checked = true
      }

      this.targetCheckChange(
        {
          target: {
            checked
          }
        },
        target
      )
    },
    // 目标选中变化
    targetCheckChange(e, target) {
      this.currentTarget = target
      if (!this.isTogetherMode) {
        // 互斥模式需要取消其它选中
        this.resetCheckStatus()
        this.showAll &&
          this.classifys.forEach(item => {
            item.targets.forEach(t => {
              t !== target && this.renderGeoJson(t.geoJson)
            })
          })
      }

      const checked = e.target.checked
      if (checked) {
        this.locateTarget(target)
        this.sendTargetControl()
      } else {
        this.cancelTargetLocate(target)
      }
    },
    // 目标定位
    locateTarget(target) {
      this.$set(target, 'checked', true)
      // 添加点位对应的地图图层
      this.renderGeoJson(target.geoJson, true)
      const targetLayer = this.layerMap[target.id]
      if (targetLayer) {
        const center = targetLayer.getLatLng() || targetLayer.getCenter()
        this.map.panTo(center)
      }
    },
    // 取消目标定位
    cancelTargetLocate(target) {
      this.$set(target, 'checked', false)
      this.informationDisplayVisible = false
      const targetLayer = this.layerMap[target.id]
      // 删除点位对应的地图图层
      targetLayer && targetLayer.remove()
    },
    // 重置选中状态
    resetCheckStatus() {
      this.classifys.forEach(item => {
        item.targets.forEach(target => {
          this.cancelTargetLocate(target)
        })
      })
    },
    // 刷新兵力部署列表
    refreshSoldierList() {
      this.$get('/api/v1/sandtable_target/getTroopsByTargetIdPage', {
        targetId: this.currentTarget.id,
        pageNum: this.pagination.current || 1,
        pageSize: this.pagination.defaultPageSize
      }).then(r => {
        if (r.data.status === 200) {
          const pagination = { ...this.pagination }
          const data = r.data.data
          this.loading = false
          this.soldierList = data.records
          pagination.total = data.total
          this.pagination = pagination
        }
      })
    },
    // 点击分页
    handleSoldierTableChange(pagination, filters, sorter) {
      this.pagination = pagination
      this.refreshSoldierList()
    },
    // 兵员行样式
    soldierRowClass(record, index) {
      if (index % 2 === 0) {
        // 偶数行
        return 'even-row'
      } else {
        // 奇数行
        return 'odd-row'
      }
    },
    // 向后台发送点位控制消息
    sendTargetControl() {
      const targetId = this.currentTarget.id
      const eventSource = 'PC'
      const eventType = 'OBJECT'
      const eventAction = 'LOCATE'
      const eventAttachmentUrl = ''
      this.$request({
        url: '/api/v1/sandtable_event/target_control',
        method: 'post',
        data: {
          targetId,
          eventSource,
          eventType,
          eventAction,
          eventAttachmentUrl
        }
      }).then(r => {
        if (r.data.status !== 200) {
          this.$message.warning(r.data.message)
        }
      })
    },
    // 初始化websocket
    initWebsocket() {
      if ('WebSocket' in window) {
        const user = this.$store.state.account.user
        this.websocket = new WebSocket(`ws://${this.baseURL.split('http://')[1]}/ws/${user.id}`)
        // 连接错误
        this.websocket.onerror = this.handleWebsocketError
        // 连接成功
        this.websocket.onopen = this.handleWebsocketOpen
        // 收到消息的回调
        this.websocket.onmessage = this.handleWebsocketMessage
        // 连接关闭的回调
        this.websocket.onclose = this.handleWebsocketClose
        // 监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
        window.onbeforeunload = this.closeWebSocket
      } else {
        console.log('当前浏览器 Not support websocket')
      }
    },
    // 连接错误
    handleWebsocketError() {
      console.log('WebSocket连接发生错误' + '   状态码：' + this.websocket.readyState)
    },
    // 连接成功
    handleWebsocketOpen() {
      console.log('WebSocket连接成功' + '   状态码：' + this.websocket.readyState)
    },
    // 收到消息的回调
    handleWebsocketMessage(event) {
      console.log('接收消息', event.data)
      let data = null
      // 吞掉错误
      try {
        data = JSON.parse(event.data)[0]
      } catch (error) {
        return
      }
      const eventSource = data.eventSource
      const eventAction = data.eventAction
      if (eventSource === 'PC') {
        return
      }

      this.eventData = data
      switch (eventAction) {
        // PC端控制则无需应答
        case 'SWITCH':
          this.handleSwitchAction(data)
          break
        // PC端控制则无需应答
        case 'SHOW':
          this.handleShowAction(data)
          break
        // PC端控制则无需应答
        case 'HIDE':
          this.handleHideAction(data)
          break
        // PC端控制则无需应答
        case 'UNSWITCH':
          this.informationDisplayVisible = false
          break
        // PC端控制则无需应答
        case 'MOVE':
          this.handleMoveAction(data)
          break
        // PC端控制则无需应答
        case 'SHOWALLTARGETS':
          this.handleShowAllChange(data)
          break
        // PC端控制则无需应答
        case 'SWITCHLAYER':
          this.handleSwitchLayer(data)
          break
        // PC端控制则无需应答
        case 'DRAWCIRCLE':
          this.handleDrawCircle(data)
          break
        default:
          this.handleLocateAction(data) // LOCATE
      }
    },
    // 目标对象附加tab页的切换动作
    handleSwitchAction(data) {
      this.handleLocateAction(data)
      this.informationDisplayVisible = true
      const eventType = data.eventType
      switch (eventType) {
        case 'DESCRIBE':
          this.informationTabIndex = '1'
          break
        case 'PICTURE':
          this.informationTabIndex = '2'
          break
        case 'VIDEO':
          this.informationTabIndex = '3'
          break
        default:
      }
    },
    // 附件资料在地图中央的居中弹层展示或播放
    handleShowAction(data) {
      this.handleLocateAction(data)
      if (data.eventType === 'TROOPS') {
        // 打开兵力部署对话框
        this.soldierDialogVisible = true
      } else {
        this.previewDialogVisible = true
      }
      // show之前先切换到文字，以销毁tab页中video
      this.informationTabIndex = '1'
      this.$nextTick(() => {
        if (data.eventType === 'PICTURE') {
          this.informationTabIndex = '2'
        } else if (data.eventType === 'VIDEO') {
          this.informationTabIndex = '3'
        }
      })
    },
    // 关闭兵力部署弹框或视频图片预览框
    handleHideAction(data) {
      const eventType = data.eventType
      if (eventType === 'TROOPS') {
        this.soldierDialogVisible = false
      } else {
        this.previewDialogVisible = false
      }
    },
    // 目标对象在地图中定位
    handleLocateAction(data) {
      const targetId = data.targetId
      const target = this.targetMap[targetId]
      if (!target) {
        return
      }

      // 互斥模式需要取消其它选中
      if (!this.isTogetherMode) {
        this.resetCheckStatus()
        this.showAll &&
          this.classifys.forEach(item => {
            item.targets.forEach(t => {
              t !== target && this.renderGeoJson(t.geoJson)
            })
          })
      }

      // 设置target为新的选中
      this.currentTarget = target
      this.locateTarget(target)

      // this.$nextTick(() => {
      //   // 设置target为新的选中
      //   this.currentTarget = target
      //   this.locateTarget(target)
      // })
    },
    // 地图移动事件
    handleMoveAction(data) {
      const moveOpts = JSON.parse(data.eventAttachmentUrl)
      this.map.setView(moveOpts.center, moveOpts.zoom)
    },
    // 是否显示所有切换
    handleShowAllChange(data) {
      this.showAll = data.eventAttachmentUrl === 'true'
      this.resetCheckStatus()
      const target = this.currentTarget
      if (!this.isTogetherMode) {
        // 互斥模式需要取消其它选中
        this.showAll &&
          this.classifys.forEach(item => {
            item.targets.forEach(t => {
              t !== target && this.renderGeoJson(t.geoJson)
            })
          })
      }

      target && this.renderGeoJson(target.geoJson, true)
    },
    // 切换图层事件
    handleSwitchLayer(data) {
      const layerName = JSON.parse(data.eventAttachmentUrl).layerName
      this.switchLayer(layerName)
    },
    // 根据图层名切换图层
    switchLayer(layerName) {
      this.tileProviders.forEach(item => {
        if (item.name === layerName) {
          item.visible = true
        } else {
          item.visible = false
        }
      })
    },
    // 画圆事件
    handleDrawCircle(data) {
      this.handleLocateAction(data)
      this.informationDisplayVisible = true
      this.informationTabIndex = '1'

      const radius = JSON.parse(data.eventAttachmentUrl).radius / 1000
      this.searchRadius = radius
      this.$nextTick(() => {
        this.updateSearchArea(this.searchRadius)
        this.refreshAreaSodiers(this.searchRadius)
      })
    },
    // 连接关闭
    handleWebsocketClose() {
      console.log('WebSocket连接关闭' + '   状态码：' + this.websocket.readyState)
    },
    // 主动关闭websocket
    closeWebSocket() {
      this.websocket.close()
    },
    // 刷新地图上框选范围
    updateSearchArea(value) {
      if (!this.currentTarget) {
        return
      }

      const currentLayer = this.layerMap[this.currentTarget.id]
      const latlng = currentLayer.getLatLng()
      this.circleLayer.setLatLng([latlng.lat, latlng.lng])
      this.circleLayer.setRadius(value * 1000)
    },
    // 根据点位id及半径查询范围兵员
    refreshAreaSodiers(value) {
      if (!this.currentTarget) {
        return
      }

      this.$request({
        url: '/api/v1/sandtable_target/getSurroundingTroopsInfo',
        method: 'post',
        data: {
          targetId: this.currentTarget.id,
          radius: value
        }
      }).then(r => {
        if (r.data.status === 200) {
          this.searchSoldierList = r.data.data
        }
      })
    }
  },
  watch: {
    pannelVisible() {
      if (this.pannelVisible) {
        this.refreshClassifys()
      }
    },
    soldierDialogVisible() {
      if (this.soldierDialogVisible) {
        this.refreshSoldierList()
      }
    },
    informationTabIndex() {
      if (this.informationTabIndex === '3') {
        setTimeout(() => {
          this.$refs.tabVideos &&
            this.$refs.tabVideos.forEach(video => {
              if (this.previewDialogVisible) {
                video.pause()
              }
            })
          this.$refs.previewVideo.play()
        }, 300)
      }
    },
    informationDisplayVisible() {
      if (!this.informationDisplayVisible) {
        this.circleLayer.setRadius(0)
        this.searchRadius = 0
      } else {
        this.$nextTick(() => {
          this.refreshAreaSodiers()
        })
      }
    }
  }
}
</script>

<style lang="scss">
$height1: 56px;
.global-map-container {
  position: fixed;
  width: 100%;
  height: 100%;

  .bg-border-item {
    position: absolute;
    background: transparent;
    z-index: 10;

    &.bg-top-left {
      height: $height1;
      left: 0;
      top: 0;
    }

    &.bg-top-left-2 {
      top: $height1;
    }

    &.bg-top-left-3 {
      left: $height1;
      top: $height1;
    }

    &.bg-top-center {
      height: 66px;
      top: 0;
      left: calc(50% - 306px);
      z-index: 11;
    }

    &.bg-top-right {
      height: $height1;
      right: 0;
      top: 0;
      transform: rotateY(180deg);
    }

    &.bg-top-right-2 {
      right: 0;
      top: $height1;
      transform: rotateY(180deg);
    }

    &.bg-top-right-3 {
      right: $height1;
      top: $height1;
      transform: rotateY(180deg);
    }

    &.bg-bottom-left {
      left: 0;
      bottom: 0;
    }

    &.bg-bottom-left-2 {
      left: 0;
      bottom: $height1;
      transform: rotateX(180deg);
    }

    &.bg-bottom-left-3 {
      left: $height1;
      bottom: $height1;
      transform: rotateX(180deg);
    }

    &.bg-bottom-right {
      right: 0;
      bottom: 0;
      transform: rotateY(180deg);
    }

    &.bg-bottom-right-2 {
      right: 0;
      bottom: $height1;
      transform: rotate(180deg);
    }

    &.bg-bottom-right-3 {
      right: $height1;
      bottom: $height1;
      transform: rotate(180deg);
    }
  }

  .tools-container {
    .handle-pannel-btn {
      position: fixed;
      width: 56px;
      height: 800px;
      left: 0;
      top: calc(50% - 400px);
      z-index: 9;
      background-image: url(/img/icon_btn_open.png);
      cursor: pointer;

      &.opened {
        background-image: url(/img/icon_btn_close.png);
      }
    }

    .handle-pannel-dialog {
      position: fixed;
      width: 323px;
      height: calc(100vh - 112px);
      left: -800px;
      top: $height1;
      z-index: 5;
      background: url(/img/img_bg_1.png) center center no-repeat;
      background-size: cover;
      transition: left 0.3s;

      &.opened {
        left: $height1;
      }

      .handle-pannel-dialog-body {
        position: relative;
        width: 100%;
        height: 100%;

        .mode-container {
          height: 40px;
          line-height: 40px;
          // padding: 8px 16px 8px 16px;
          .ant-switch {
            float: right;
            margin-right: 20px;
            margin-top: 8px;
          }
        }

        .clissify-list {
          position: relative;
          font-size: 16px;
          height: calc(100% - 96px);
          // padding-top: 40px;
          overflow-x: hidden;
          overflow-y: auto;

          .classify-item {
            // background-color: #111f43;
            background-color: rgba(255, 255, 255, 0.1);

            .item-content {
              position: relative;
              height: 36px;
              line-height: 36px;
              cursor: pointer;
              padding: 0 16px;
            }

            svg {
              position: relative;
              width: 26px;
              height: 26px;
              top: -4px;
              margin-right: 6px;
            }

            .name {
              display: inline-block;
              color: #fff;
              max-width: 70%;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;

              &.current-node {
                color: #3174b5;
              }
            }

            .item-children {
              position: relative;
              padding-left: 16px;
              background: #1b2c56;

              .child-item {
                position: relative;
                height: 36px;
                line-height: 36px;
                cursor: pointer;
                padding: 0 16px;
              }

              .child-icon {
                position: relative;
                display: inline-block;
                width: 8px;
                height: 8px;
                background: red;
                border-radius: 100%;
                margin-right: 6px;
                top: -14px;
              }

              .item-checkbox {
                float: right;
                font-size: 14px;
              }
            }
          }
        }
      }
    }
  }

  .information-display-dialog {
    position: fixed;
    width: 400px;
    height: calc(100vh - 112px);
    right: -400px;
    top: $height1;
    z-index: 5;
    background: url(/img/img_bg_2.png) center center no-repeat;
    background-size: cover;
    transition: right 0.3s;
    padding: 0 1px;

    &.opened {
      right: $height1;
    }

    .information-header {
      position: relative;
      background-color: rgba(255, 255, 255, 0.05);
      height: 40px;
      line-height: 40px;
      color: #fff;
      padding: 0 24px;

      .title {
        display: inline-block;
        max-width: 70%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .btns {
        float: right;
        z-index: 99;

        .soldier-dialog-btn {
          font-size: 14px;
          cursor: pointer;
          color: #3174b5;
          margin-right: 12px;

          &:hover {
            color: #1890ff;
          }
        }

        .close-btn {
          cursor: pointer;
          color: #3174b5;

          &:hover {
            color: #1890ff;
          }
        }
      }
    }

    .information-content {
      position: relative;
      height: calc(100% - 40px);

      .ant-tabs-nav-scroll {
        padding: 0 24px;
      }

      .ant-tabs-tab {
        color: #fff;

        &.ant-tabs-tab-active {
          color: #1890ff;
        }
      }

      .ant-tabs-content {
        height: calc(100% - 60px);
      }

      .ant-tabs-tabpane {
        position: relative;
        height: calc(100% - 28px);
        overflow-y: auto;

        .information-tab-content {
          padding: 16px 24px;
          color: #fff;

          &.sodier-search {
            padding: 0 8px;

            .ant-collapse {
              background: transparent;
              margin-top: 12px;

              .ant-collapse-header {
                color: #fff !important;
              }

              .ant-collapse-content-box {
                color: #999;
                background: rgba(255, 255, 255, 0.1);
              }
            }
          }

          .search-label {
            color: #fff;
          }

          img {
            width: 100%;
            margin-top: 16px;

            &:first-child {
              margin-top: 0;
            }
          }

          video {
            width: 100%;
            margin-top: 16px;

            &:first-child {
              margin-top: 0;
            }
          }
        }
      }
    }
  }

  .map-container {
    position: fixed;
    height: 100%;
    width: 100%;
    // 下载的地图是透明的，加上背景色，后续换地图资源后可去掉
    background: #35549d;
    left: 0;
    top: 0;
  }
}

.map-solider-display-dialog {
  .ant-modal {
    top: 20vh !important;
  }

  .ant-modal-content {
    background: #081a48;
    border: 1px solid #3584c7;

    $rowHeight: 50px;

    .ant-modal-header {
      position: relative;
      padding: 0 24px;
      background-color: rgba(255, 255, 255, 0.2);
      height: $rowHeight;
      line-height: $rowHeight;
      border-bottom: none;

      .ant-modal-title {
        height: $rowHeight;
        line-height: $rowHeight;
        color: #fff;
      }
    }

    .ant-modal-close {
      height: $rowHeight;
      line-height: $rowHeight;

      .anticon {
        position: relative;
        top: -4px;
        font-size: 16px;
        color: #3174b5;

        &:hover {
          color: #1890ff;
        }
      }
    }

    .ant-modal-body {
      padding-bottom: 0;
    }

    .body-content {
      position: relative;

      .ant-table {
        height: 406px;
        color: #fff;
        margin-bottom: 12px;
        overflow-y: auto;

        thead {
          tr {
            th {
              background-color: rgba(255, 255, 255, 0.2);
              border-bottom: none;
              color: #fff;
              padding: 12px 16px;
            }
          }
        }

        tr {
          &:hover {
            > td {
              background-color: rgba(255, 255, 255, 0.3) !important;
            }
          }

          > td {
            border-bottom: none;
            padding: 12px 16px;
          }
        }

        .odd-row {
          background-color: rgba(255, 255, 255, 0.2);
        }
      }

      .ant-pagination {
        .ant-pagination-total-text {
          position: absolute;
          left: 0;
          color: #fff;
        }

        .ant-pagination-prev,
        .ant-pagination-next {
          background-color: transparent;
          border-color: rgba(255, 255, 255, 0.3);

          &.ant-pagination-disabled {
            a {
              color: rgba(255, 255, 255, 0.3);
            }
          }

          a {
            background-color: transparent;
            color: #fff;
          }
        }

        .ant-pagination-item {
          background-color: transparent;
          border-color: rgba(255, 255, 255, 0.3);

          &.ant-pagination-item-active {
            background-color: #45aeff;
          }

          a {
            color: #fff;
          }
        }
      }
    }
  }
}

.map-target-preview-dialog {
  .ant-modal {
    top: 15vh !important;
  }

  .ant-modal-content {
    background: #081a48;
    border: 1px solid #3584c7;

    $rowHeight: 50px;

    .ant-modal-header {
      position: relative;
      padding: 0 24px;
      background-color: rgba(255, 255, 255, 0.2);
      height: $rowHeight;
      line-height: $rowHeight;
      border-bottom: none;

      .ant-modal-title {
        height: $rowHeight;
        line-height: $rowHeight;
        color: #fff;
      }
    }

    .ant-modal-close {
      height: $rowHeight;
      line-height: $rowHeight;

      .anticon {
        position: relative;
        top: -4px;
        font-size: 16px;
        color: #3174b5;

        &:hover {
          color: #1890ff;
        }
      }
    }

    .ant-modal-body {
      padding: 0;

      .body-content {
        min-height: 300px;

        img,
        video {
          width: 100%;
          max-height: 600px;
        }
      }
    }
  }
}

/*0%开始，100%结束*/
@keyframes scale {
  0% {
    transform: scale(1);
  }
  50%,
  75% {
    transform: scale(3);
  }
  78%,
  100% {
    opacity: 0;
  }
}

.marker-container {
  position: relative;

  img {
    width: 100%;
    height: 100%;
  }

  .circle {
    position: absolute;
    display: inline-block;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    opacity: 0.8;
    background-color: #ffff00;
    animation: scale 1.5s infinite cubic-bezier(0, 0, 0.49, 1.02);
    animation-delay: 350ms;
  }

  .marker-name {
    position: absolute;
    color: #fff;
    font-size: 16px;
    font-weight: bold;
  }
}

.layer-switch-controls {
  position: fixed;
  left: 94px;
  bottom: 64px;
  border-radius: 4px;
  overflow: hidden;

  .switch-btn {
    display: inline-block;
    padding: 8px 24px;
    background: #292e36;
    color: #fff;
    cursor: pointer;

    &.is-current {
      background: blue;
    }
  }
}
</style>
