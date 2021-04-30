<template>
  <div class="global-map-editor">
    <l-map
      ref="dengzhouMap"
      :minZoom="1"
      :maxZoom="16"
      :zoom="zoom"
      :center="center"
      :options="mapOptions"
      class="mapInstantce"
      @ready="leafletReady"
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
import { tileProviders } from '@/setting.js'
import classifyIconMap from '@/views/map/classify-icon-map.js'
export default {
  name: 'MapContainer',
  props: {
    wrapId: {
      type: String,
      default: 'targetMap'
    },
    // 传入的 geoJSON数据
    geoData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    properties: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  components: {
    LMap,
    LTileLayer,
    // LMarker,
    // LPopup,
    // LTooltip,
    // LControlZoom,
    // LControlAttribution,
    // LControlScale,
    LControlLayers
  },
  computed: {
    ...mapState({}),
    markerIcon() {
      const properties = this.properties
      const icon = classifyIconMap[properties.classifyCode]
        ? classifyIconMap[properties.classifyCode].mapIcon
        : 'defaultMarkerIcon'
      const iconUrl = `/img/map-img/${icon}.png`

      const iconW = 60
      const divIcon = L.divIcon({
        className: 'dIcon',
        html: `<div class="marker-container" style="width:${iconW}px;height:${iconW}px"><span class="circle" style="background:${properties.targetColor}"></span><img src="${iconUrl}"/></div>`,
        iconSize: [iconW, iconW]
      })

      return divIcon
    }
  },
  data() {
    return {
      zoom: 16,
      center: L.latLng(
        this.$store.state.setting.targetCenterCoordinates[1],
        this.$store.state.setting.targetCenterCoordinates[0]
      ),
      currentZoom: 16,
      currentCenter: null,
      showParagraph: false,
      mapOptions: {
        // zoomSnap: 0.5
      },
      // 图层控制器
      layersPosition: 'topleft',
      // 图层集合
      tileProviders: tileProviders,
      // 目标点位
      geoLayer: null,
      map: null
    }
  },
  mounted() {
    this.$nextTick(() => {
      setTimeout(() => {
        let parentDom = document.getElementById(this.wrapId)
        parentDom.style.height = parentDom.getBoundingClientRect().height + 'px'
        // 如果有初始值，则在地图上显示
        const map = this.$refs.dengzhouMap.mapObject
        map.invalidateSize(true)
        this.renderGeoData()
      }, 300)
    })
  },
  methods: {
    // 地图组件就绪
    leafletReady() {
      // this.addKmlLayer('/mapdata/邓州市矢量路网/邓州市_矢量路网/邓州市_矢量路网.kml')
      const map = this.$refs.dengzhouMap.mapObject
      this.map = map
      map.invalidateSize(true)
      map.pm.setLang('zh')
      map.pm.addControls({
        // 1.位置
        position: 'topleft',

        // 2.允许绘制的图元种类
        // 标点
        drawMarker: true,
        // 不需要画圆形标记
        drawCircleMarker: false,
        // 画多边形
        drawPolygon: true,
        // 画折线段
        drawPolyline: true,
        // 画矩形
        drawRectangle: true,
        // 画圆
        drawCircle: true,

        // 3.全局模式，针对所有图层
        editMode: true,
        dragMode: true,
        deleteLayer: true,

        // 4.当前需求明确不要的功能
        // 不需要裁剪多边形这个功能
        cutPolygon: false
      })

      // 自定义一个icon
      var myIcon = L.icon({
        iconUrl: '/img/defaultMarkerIcon.png',
        iconSize: [25, 41]
      })
      // 在地图中标出一个点
      map.pm.enableDraw('Marker', {
        markerStyle: { icon: myIcon }
      })
      map.pm.disableDraw('Marker')
      // 一开一闭完成设置

      // 设置对绘图的监听
      map.on('pm:create', payload => {
        // 标记
        if (payload.shape === 'Marker') {
          map.pm.disableDraw('Marker')
          payload.layer.setIcon(this.markerIcon)
          // 线段 或 折线
        } else if (payload.shape === 'Line') {
          // 单击任何存在的标记表示已完成，因此不用显式变为非激活态
          payload.layer.setStyle({
            color: this.properties.targetColor
          })
        } else if (payload.shape === 'Rectangle') {
          // 不用显式变为非激活态
          payload.layer.setStyle({
            fillColor: this.properties.targetColor,
            fill: true
          })
        } else if (payload.shape === 'Circle') {
          // 不用显式变为非激活态
        } else if (payload.shape === 'Polygon') {
          // 点击第一个标识，形成回路，才算完成
          payload.layer.setStyle({
            color: this.properties.targetColor,
            fillColor: this.properties.targetColor,
            fill: true
          })
        }
        // 情况一，新增，产生了数据变化
        // 输出geoJSON数据
        this.$emit('change', payload.layer.toGeoJSON())
        this.geoLayer && this.geoLayer.remove()
        // 保存当前新增的点位
        this.geoLayer = payload.layer
        this.bindEvents(this.geoLayer)
      })
    },
    // 绑定图层事件
    bindEvents(layer) {
      layer.on('pm:edit', e => {
        this.$emit('change', e.target.toGeoJSON())
      })
    },
    // 渲染geo数据
    renderGeoData() {
      this.geoLayer && this.geoLayer.remove()
      const map = this.$refs.dengzhouMap.mapObject
      if (!this.geoData) {
        // 没有点位信息时将地图平移到默认中心位置
        this.map && this.map.panTo(this.center)
      }
      L.geoJSON(this.geoData, {
        style: feature => {
          return {
            color: this.properties.targetColor,
            fillColor: this.properties.targetColor,
            fill: true
          }
        },
        pointToLayer: (feature, latlng) => {
          return L.marker(latlng, { icon: this.markerIcon })
        },
        onEachFeature: (feature, layer) => {
          this.geoLayer = layer
          this.bindEvents(this.geoLayer)
          const center = layer.getLatLng() || layer.getCenter()
          this.map && this.map.panTo(center)
        }
      }).addTo(map)
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
    }
  }
}
</script>

<style lang="scss">
.global-map-editor {
  width: 100%;
  height: 100%;
  .mapInstantce {
    width: 100%;
    height: 100%;
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
    animation: scale 2s infinite cubic-bezier(0, 0, 0.49, 1.02);
    animation-delay: 150ms;
  }

  .marker-name {
    position: absolute;
    color: #fff;
    font-size: 16px;
    font-weight: bold;
  }
}
</style>
