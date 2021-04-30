<template>
  <div class="card-bg-2">
    <div class="header">
      <img src="/img/graphs-img/title-icon-rect.png" class="title-icon" />
      <span class="title-text">服役统计</span>
    </div>
    <div class="content">
      <div ref="chart1" class="chart"></div>
      <div ref="chart2" class="chart"></div>
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
      this.$get('/api/v1/statistics/getStatisticsTroopsNumberByService', {
        queryAreaType: this.queryAreaType,
        queryAreaName: this.queryAreaName
      }).then(r => {
        if (r.data.status === 200) {
          this.result = r.data.data
          let sum = 0
          this.result.forEach(item => {
            sum += item.number
          })

          const container1 = this.$refs.chart1
          const data1 = [this.result[0]]
          data1.push({
            dimensionName: '其他',
            number: sum - data1[0].number,
            percent: (100 * (sum - data1[0].number)) / sum + '%'
          })
          this.initGraph(container1, data1, '#4FB1FE')

          const container2 = this.$refs.chart2
          const data2 = [this.result[1]]
          data2.push({
            dimensionName: '其他',
            number: sum - data2[0].number,
            percent: (100 * (sum - data2[0].number)) / sum + '%'
          })
          this.initGraph(container2, data2, '#FFE836')
        }
      })
    },
    initGraph(container, graphData, color) {
      var chart = new G2.Chart({
        container: container,
        width: container.offsetWidth,
        height: container.offsetHeight,
        padding: 'auto'
      })

      chart.source(graphData)
      chart.legend(false)
      chart.tooltip(false)
      chart.coord('theta', {
        radius: 0.8,
        innerRadius: 0.85
      })
      chart
        .intervalStack()
        .position('number')
        .color('dimensionName', [color, '#092D4F'])
      chart.guide().html({
        position: ['50%', '50%'],
        html: `<div style="color: #fff;text-align:center;width: 100%;">${graphData[0].number}</div>`
      })
      chart.guide().html({
        position: ['90%', '50%'],
        html: `<div style="color: #fff;"><span style="display:inline-block;width:8px;height:8px;border-radius:100%;background-color:${color};"></span><div>${graphData[0].dimensionName}</div></div>`
      })
      chart.render()
    }
  }
}
</script>

<style lang="scss" scoped>
.chart {
  height: 50%;
}
</style>
