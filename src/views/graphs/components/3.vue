<template>
  <div class="card-bg-2">
    <div class="header">
      <img src="/img/graphs-img/title-icon-rect.png" class="title-icon" />
      <span class="title-text">年龄统计</span>
    </div>
    <div class="content">
      <div v-for="(item, index) in result" :key="index" class="item-row">
        <div class="number">{{item.number}}</div>
        <div class="item-content">
          <span class="label">{{item.dimensionName}}</span>
          <span class="bg">
            <span
              class="percent"
              :style="{width: item.percent,background: `url(/img/graphs-img/color${index + 1}.png)`}"
            ></span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
      this.$get('/api/v1/statistics/getStatisticsTroopsNumberByAge', {
        queryAreaType: this.queryAreaType,
        queryAreaName: this.queryAreaName
      }).then(r => {
        if (r.data.status === 200) {
          this.result = r.data.data
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.item-row {
  position: relative;
  color: #fff;
  height: 100px;
  padding: 0 12px;

  .number {
    text-align: right;
  }

  .item-content {
    position: relative;
    height: 20px;
    display: flex;
    align-items: center;

    .label {
      display: inline-block;
      width: 70px;
    }

    .bg {
      position: relative;
      display: inline-block;
      width: calc(100% - 70px);
      height: 100%;
      background: #172846;

      .percent {
        display: inline-block;
        height: 100%;
        background-repeat: no-repeat;
        background-size: 100% 100%;
      }
    }
  }
}
</style>
