<template>
  <div class="card-bg-1">
    <div class="header">
      <img src="/img/graphs-img/title-icon-circle.png" class="title-icon" />
      <span class="title-text">人员数量统计</span>
    </div>
    <div class="content">
      <div ref="chart" class="graph-chart"></div>
    </div>
  </div>
</template>

<script>
import G2 from '@antv/g2'
export default {
  data() {
    return {
      result: []
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
      this.refreshData()
    })
  },
  methods: {
    refreshData() {
      this.$get('/api/v1/statistics/getStatisticsTroopsNumberByType', {
        queryAreaType: this.queryAreaType,
        queryAreaName: this.queryAreaName
      }).then(r => {
        if (r.data.status === 200) {
          this.result = r.data.data
          const container = this.$refs.chart
          this.initGraph(container, this.result)
        }
      })
    },
    initGraph(container, graphData) {
      var chart = new G2.Chart({
        container: container,
        width: container.offsetWidth,
        height: container.offsetHeight,
        padding: 'auto'
      })

      chart.source(graphData)
      chart.legend(false)
      chart.axis('dimensionName', {
        line: {
          lineWidth: 1, // 设置线的宽度
          stroke: '#42a0f8' // 设置线的颜色
        },
        grid: null,
        label: {
          textStyle: {
            fill: '#fff'
          }
        }
      })
      chart.axis('number', {
        line: {
          lineWidth: 1, // 设置线的宽度
          stroke: '#42a0f8' // 设置线的颜色
        },
        grid: null,
        label: {
          textStyle: {
            fill: '#fff'
          }
        }
      })
      chart
        .interval()
        .position('dimensionName*number')
        .size(16)
        .color('dimensionName', ['#F9CE03', '#4FB1FE', '#43BC75', '#E74E08'])
      chart.render()
    }
  }
}
</script>

<style scoped>
</style>
