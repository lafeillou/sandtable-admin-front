<template>
  <div class="troops-graph-container">
    <div class="header">
      <span class="label">目标点位兵力部署情况</span>
    </div>
    <div ref="chartContainer" class="content">
      <div
        ref="chart"
        class="graph-container"
        :style="{ width: `${(this.graphData.length / showNum) * 100}%` }"
      ></div>
    </div>
  </div>
</template>

<script>
import G2 from '@antv/g2'
export default {
  data() {
    return {
      graphData: [],
      showNum: 15
    }
  },
  computed: {
    queryAreaName() {
      return this.$store.state.setting.queryAreaName
    },
    queryAreaType() {
      return this.$store.state.setting.queryAreaType
    }
  },
  mounted() {
    this.$nextTick(() => {
      setTimeout(() => {
        this.refreshData()
      }, 100)
    })
  },
  methods: {
    buildGraphData() {
      this.graphData = []
      for (let i = 0; i < 90; i++) {
        this.graphData.push({
          targetName: `测试目标点位${i + 1}`,
          value: Math.floor(Math.random() * (1 - 100) + 100)
        })
      }
    },
    refreshData() {
      this.$get('/api/v1/statistics/sandTableTroopsRank', {
        queryAreaType: this.queryAreaType,
        queryAreaName: this.queryAreaName
      }).then(r => {
        if (r.data.status === 200) {
          this.graphData = r.data.data
          this.initGraph()
        }
      })
    },
    initGraph() {
      // 创建图表
      const chartContainer = this.$refs.chartContainer
      const container = this.$refs.chart
      const chart = new G2.Chart({
        container: container,
        width: chartContainer.offsetWidth * (this.graphData.length / this.showNum),
        height: container.offsetHeight,
        padding: 'auto'
      })
      chart.source(this.graphData)
      chart.scale('value', {
        alias: '数目'
      })
      chart
        .interval()
        .position('targetName*value')
        .size(16)
      chart.render()
    }
  }
}
</script>

<style lang="scss" scoped>
.troops-graph-container {
  position: relative;
  margin-top: 16px;
  height: calc(100vh - 344px);
  background: #fff;

  .header {
    height: 40px;
    line-height: 40px;
    border-bottom: 1px solid #ddd;
    padding: 0 16px;

    .label {
      color: #666;
      font-weight: bold;
    }
  }

  .content {
    position: relative;
    height: calc(100% - 41px);
    overflow-x: auto;
    overflow-y: hidden;
  }

  .graph-container {
    height: 100%;
  }
}
</style>
