<template>
  <div class="card-bg-2">
    <div class="header">
      <img src="/img/graphs-img/title-icon-rect.png" class="title-icon" />
      <span class="title-text">性别统计</span>
    </div>
    <div class="content">
      <div ref="chart" class="chart"></div>
      <a-row class="legend">
        <a-col :span="12" class="col-item">
          <img src="/img/graphs-img/male.png" />
          <div>男性</div>
        </a-col>
        <a-col :span="12" class="col-item">
          <img src="/img/graphs-img/female.png" />
          <div>女性</div>
        </a-col>
      </a-row>
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
      this.$get('/api/v1/statistics/getStatisticsTroopsNumberByGender', {
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
        forceFit: true,
        width: container.offsetWidth,
        height: container.offsetHeight,
        padding: 'auto'
      })
      chart.source(graphData)
      chart.coord('theta', {
        radius: 0.75
      })
      chart.legend(false)
      chart.tooltip(false)
      const pie = chart
        .intervalStack()
        .position('number')
        .label('dimensionName', {
          htmlTemplate: function formatter(val, item) {
            return `<div style="color:#fff;">${item.point.number}<span style="color:#45AEFF;padding:0 8px;">(${item.point.percent})</span></div>`
          }
        })
        .color('dimensionName', ['#45AEFF', '#C83677'])
      chart.render()
      pie.setSelected(graphData[0])
    }
  }
}
</script>

<style lang="scss" scoped>
.chart {
  height: 248px;
}
.legend {
  .col-item {
    text-align: center;
    color: #fff;
  }
}
</style>
