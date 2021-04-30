<template>
  <div class="card-bg-1">
    <div class="header">
      <img src="/img/graphs-img/title-icon-circle.png" class="title-icon" />
      <span class="title-text">学历统计</span>
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
      this.$get('/api/v1/statistics/getStatisticsTroopsNumberByEducation', {
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
      let sum = 0
      graphData.forEach(item => {
        sum += item.number
      })
      chart.legend(false)
      chart.facet('rect', {
        fields: ['dimensionName'],
        padding: 20,
        showTitle: false,
        eachView: function eachView(view, facet) {
          var data = facet.data
          data.push({
            dimensionName: '其他',
            number: sum - data[0].number,
            percent: (100 * (sum - data[0].number)) / sum + '%'
          })
          view.source(data)
          chart.tooltip(false)
          view.coord('theta', {
            radius: 0.8,
            innerRadius: 0.85
          })
          view
            .intervalStack()
            .position('number')
            .color('dimensionName', ['#4FB1FE', '#092D4F'])
          view.guide().html({
            position: ['50%', '50%'],
            html: `<div style="color: #fff;text-align:center;width: 100%;">${data[0].number}</div>`
          })
          view.guide().html({
            position: ['50%', '80%'],
            html: `<div style="color: #fff;text-align:center;width: 100%;">${data[0].dimensionName}</div>`
          })
        }
      })
      chart.render()
    }
  }
}
</script>

<style>
</style>
