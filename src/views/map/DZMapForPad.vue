<template>
  <div class="global-map-container">
    <l-map
      ref="dengzhouMap"
      :zoom="zoom"
      :minZoom="1"
      :maxZoom="16"
      :center="center"
      :options="mapOptions"
      style="height: 100%;width:100%;"
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
  </div>
</template>

<script>
// import { latLng } from 'leaflet'
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
// import L from './kml-layer.js'
import L from 'leaflet'
import 'leaflet-plugins/layer/vector/KML'

import { mapState, mapMutations } from 'vuex'
import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import { tileProviders } from '@/setting.js'
export default {
  name: 'MapContainer',
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
  data() {
    return {
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
      // 图层控制器
      layersPosition: 'topleft',
      // 图层集合
      tileProviders: tileProviders
    }
  },
  mounted() {},
  methods: {
    // 地图加载完成
    leafletLoaded() {
      // this.addKmlLayer('/mapdata/邓州市矢量路网/邓州市_矢量路网/邓州市_矢量路网.kml')
      const map = this.$refs.dengzhouMap.mapObject
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
        console.log(payload)
        // 标记
        if (payload.shape === 'Marker') {
          map.pm.disableDraw('Marker')
          // 线段 或 折线
        } else if (payload.shape === 'Line') {
          // 单击任何存在的标记表示已完成，因此不用显式变为非激活态
        } else if (payload.shape === 'Rectangle') {
          // 不用显式变为非激活态
        } else if (payload.shape === 'Circle') {
          // 不用显式变为非激活态
        } else if (payload.shape === 'Polygon') {
          // 点击第一个标识，形成回路，才算完成
        }
      })
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
      // fetch(url)
      //   .then(res => res.text())
      //   .then(kmltext => {
      //     const parser = new DOMParser()
      //     const kml = parser.parseFromString(kmltext, 'text/xml')
      //     const track = new L.KML(kml)
      //     const map = this.$refs.dengzhouMap.mapObject
      //     map.addLayer(track)
      //     // // 调整缩放比例
      //     // const bounds = track.getBounds()
      //     // map.fitBounds(bounds)
      //   })
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
.global-map-container {
  position: fixed !important;
  width: 100%;
  height: 100%;
}
</style>
