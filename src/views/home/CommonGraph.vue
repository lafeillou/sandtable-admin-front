<template>
  <div class="common-graph-container">
    <a-row class="full-height">
      <a-col :span="16" class="full-height">
        <a-row class="full-height">
          <a-col :span="8" class="full-height card">
            <img src="/img/icon_1.png" class="card-icon" />
            <span class="card-content">
              <div class="label">系统当天访问量</div>
              <div class="number">{{result.dayTraffic}}</div>
            </span>
          </a-col>
          <a-col :span="8" class="full-height card">
            <img src="/img/icon_2.png" class="card-icon" />
            <span class="card-content">
              <div class="label">当前亮灯数量</div>
              <div class="number">{{result.lightUpNumber}}</div>
            </span>
          </a-col>
          <a-col :span="8" class="full-height card">
            <img src="/img/icon_3.png" class="card-icon" />
            <span class="card-content">
              <div class="label">待定数据</div>
              <div class="number">362</div>
            </span>
          </a-col>
        </a-row>
      </a-col>
      <a-col :span="8" class="full-height">
        <a-row class="full-height">
          <a-col :span="12" class="full-height graph-card">
            <div ref="pieChart1" class="graph-container"></div>
          </a-col>
          <a-col :span="12" class="full-height graph-card">
            <div ref="pieChart2" class="graph-container"></div>
          </a-col>
        </a-row>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import G2 from '@antv/g2'
export default {
  data() {
    return {
      result: {
        // 系统当天访问量
        dayTraffic: 0,
        // 当前亮灯数量
        lightUpNumber: 0,
        graphData1: {
          label: '内存使用率',
          rate: 0
        },
        graphData2: {
          label: 'CPU使用率',
          rate: 0
        }
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.refreshData()
    })
  },
  methods: {
    refreshData() {
      this.$get('/api/v1/statistics/getTopData').then(r => {
        if (r.data.status === 200) {
          this.result = r.data.data
          const pie1 = this.$refs.pieChart1
          const pie2 = this.$refs.pieChart2
          this.initGraph(pie1, this.result.graphData1)
          this.initGraph(pie2, this.result.graphData2)
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

      const data = [
        {
          type: 'use',
          value: graphData.rate
        },
        {
          type: 'extra',
          value: 100 - graphData.rate
        }
      ]
      chart.source(data)
      chart.legend(false)
      chart.coord('theta', {
        radius: 0.8,
        innerRadius: 0.9
      })
      chart.tooltip(false)
      chart
        .intervalStack()
        .position('value')
        .color('type', ['#198DF8', '#F0F2F5'])
      chart.guide().html({
        position: ['50%', '50%'],
        html: `
        <div style="font-size:36px;font-weight:bold;">${graphData.rate}%</>
        <div style="font-size:12px;color: #999;">${graphData.label}</div>
        `
      })
      chart.render()
    }
  }
}
</script>

<style lang="scss" scoped>
.common-graph-container {
  position: relative;
  height: 230px;
  background: #fff;

  .full-height {
    height: 100%;
  }

  .label {
    color: #999;
  }

  .number {
    color: #333;
    font-size: 36px;
    font-weight: bold;
  }

  .card {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    .card-icon {
      display: inline-block;
      width: 72px;
      height: 72px;
    }

    .card-content {
      margin-left: 16px;
    }
  }

  .graph-card {
    position: relative;
    padding: 24px;

    .graph-container {
      position: relative;
      width: 100%;
      height: 100%;
    }
  }
}
</style>
