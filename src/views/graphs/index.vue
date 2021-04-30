<template>
  <div class="graphs-container">
    <div class="global-title">
      <img src="/img/graphs-img/title.png" />
    </div>
    <div class="global-content">
      <a-row v-for="(row, rindex) in rows" :key="rindex" :gutter="row.gutter" class="content-row">
        <a-col v-for="(col, cindex) in row.cols" :key="cindex" :span="col.span" class="content-col">
          <component :is="col.component" class="card"></component>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rows: [
        {
          gutter: 24,
          cols: [
            {
              span: 8,
              component: () => import('./components/1')
            },
            {
              span: 4,
              component: () => import('./components/2')
            },
            {
              span: 4,
              component: () => import('./components/3')
            },
            {
              span: 8,
              component: () => import('./components/4')
            }
          ]
        },
        {
          gutter: 24,
          cols: [
            {
              span: 8,
              component: () => import('./components/5')
            },
            {
              span: 4,
              component: () => import('./components/6')
            },
            {
              span: 4,
              component: () => import('./components/7')
            },
            {
              span: 8,
              component: () => import('./components/8')
            }
          ]
        }
      ]
    }
  }
}
</script>

<style lang="scss">
.graphs-container {
  position: fixed;
  width: 100%;
  height: 100%;
  background-image: url(/img/graphs-img/bg.png);
  background-repeat: no-repeat;
  background-size: 100% 100%;

  .global-title {
    position: relative;
    top: 0;
    left: 0;
    text-align: center;
    height: 90px;
  }

  .global-content {
    position: relative;
    padding: 0 24px;

    .content-row {
      position: relative;
      height: 400px;
      margin-top: 24px;

      &:first-child {
        margin-top: 0;
      }

      .content-col {
        height: 100%;

        .card {
          height: 100%;

          &.card-bg-1 {
            background: url(/img/graphs-img/card1.png);
            background-repeat: no-repeat;
            background-size: 100% 100%;
          }

          &.card-bg-2 {
            background: url(/img/graphs-img/card2.png);
            background-repeat: no-repeat;
            background-size: 100% 100%;
          }

          .header {
            display: flex;
            height: 50px;
            align-items: center;
            font-size: 16px;

            .title-icon {
              margin-right: 8px;
              margin-left: 24px;
            }

            .title-text {
              color: #fff;
            }
          }

          .content {
            position: relative;
            height: calc(100% - 50px);
            padding: 16px;

            .graph-chart {
              height: 100%;
            }
          }
        }
      }
    }
  }
}
</style>
