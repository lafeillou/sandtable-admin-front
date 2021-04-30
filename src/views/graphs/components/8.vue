<template>
  <div class="card-bg-1">
    <div class="header">
      <img src="/img/graphs-img/title-icon-circle.png" class="title-icon" />
      <span class="title-text">TOP10</span>
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
      this.$get('/api/v1/statistics/getStatisticsTroopsNumberTopTen', {
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

      graphData.sort((a, b) => {
        return a.value - b.value
      })

      chart.source(graphData)
      chart.legend(false)
      chart.axis('targetName', {
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
      chart.axis('value', {
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
      chart.coord().transpose()
      chart
        .interval()
        .position('targetName*value')
        .size(16)
        .color('targetName', [
          '#FF953F',
          '#FDC85E',
          '#F7EF5F',
          '#DFFD47',
          '#CDFF50',
          '#A1FF47',
          '#A1FF47',
          '#A1FF47',
          '#A1FF47',
          '#A1FF47'
        ])
      chart.render()
    }
  }
}
</script>

<style>
</style>
