<template>
  <a-modal
    title="兵员配置"
    :visible="visible"
    :width="1100"
    :bodyStyle="{height: '600px', padding: '0'}"
    @ok="handleSubmit"
    @cancel="onClose"
  >
    <a-row class="team-setting-container">
      <a-col :span="8" class="left">
        <div class="search-container">
          <a-input v-model="leftSearch" :allowClear="true" placeholder="输入分队或兵员名称搜索" />
        </div>
        <div class="list-container">
          <div v-for="(unit, index) in leftUnits" :key="index" class="unit-item">
            <div class="unit-item-content">
              <a-icon
                class="expand-icon"
                :style="{visibility: unitShowSoldiers(unit).length ? 'visible': 'hidden'}"
                :type="unit.sandtableContingent.expanded?'caret-down':'caret-right'"
                @click.native="unit.sandtableContingent.expanded=!unit.sandtableContingent.expanded"
              />
              <a-checkbox
                :checked="unit.sandtableContingent.checked"
                @change="(e)=> unitCheckChange(e, unit)"
              >{{unit.sandtableContingent.contingentName}}</a-checkbox>
            </div>
            <div v-show="unit.sandtableContingent.expanded" class="children-list">
              <div v-for="(child, index) in unitShowSoldiers(unit)" :key="index" class="child-item">
                <a-checkbox
                  :checked="child.checked"
                  @change="(e)=> leftSoldierChecked(e, child, unit)"
                >{{child.name}}</a-checkbox>
              </div>
            </div>
          </div>
        </div>
      </a-col>
      <a-col :md="2" :sm="24" class="transfer-btns-container">
        <div class="transfer-btns">
          <div>
            <a-icon :class="{disabled: !leftChecked.length}" type="right" @click.native="go2Right" />
          </div>
          <div>
            <a-icon :class="{disabled: !rightChecked.length}" type="left" @click.native="go2Left" />
          </div>
        </div>
      </a-col>
      <a-col :span="14" class="right">
        <div class="search-container">
          <a-input v-model="rightSearch" :allowClear="true" placeholder="输入兵员名称搜索" />
        </div>
        <div class="list-container">
          <div class="list-item">
            <span class="name" style="padding-left: 24px;">姓名</span>
            <span class="unit" style="padding-left: 24px;">所属分队</span>
            <span class="telephone">联系方式</span>
          </div>
          <div v-for="(soldier, index) in showSoldiers" :key="index" class="list-item">
            <a-checkbox
              :checked="soldier.checked"
              class="name"
              @change="(e)=> rightSoldierChecked(e, soldier)"
            >{{soldier.name}}</a-checkbox>
            <span class="unit" style="padding-left: 24px;">{{soldier.contingentName}}</span>
            <span class="telephone">{{soldier.telephone}}</span>
          </div>
        </div>
      </a-col>
    </a-row>
  </a-modal>
</template>
<script>
export default {
  name: 'SandtableSetTeam',
  props: {
    visible: {
      default: false
    }
  },
  data() {
    return {
      loading: false,
      // 所有分队及分队下人员
      units: [],
      // 分配到的分队及人员
      placedUnits: [],
      // 分配到的所有人员
      soldiers: [],
      // 目标点位
      target: {},
      // 左侧搜索框关键字
      leftSearch: '',
      // 右侧搜索框关键字
      rightSearch: '',
      // 左侧选中的人员
      leftChecked: [],
      // 右侧选中的人员
      rightChecked: []
    }
  },
  computed: {
    // 左侧过滤后的分队
    leftUnits() {
      return this.units.filter(unit => {
        if (unit.sandtableContingent.contingentName.indexOf(this.leftSearch) > -1) {
          return true
        }

        const arr = unit.troopsList.filter(soldier => soldier.name.indexOf(this.leftSearch) > -1)
        return arr.length
      })
    },
    // 左侧过滤后的兵员
    unitShowSoldiers() {
      return function(unit) {
        if (unit.sandtableContingent.contingentName.indexOf(this.leftSearch) > -1) {
          return unit.troopsList.filter(item => this.soldiers.findIndex(s => s.id === item.id) < 0)
        }

        const arr = unit.troopsList.filter(soldier => soldier.name.indexOf(this.leftSearch) > -1)
        return arr.filter(item => this.soldiers.findIndex(s => s.id === item.id) < 0)
      }
    },
    // 过滤后的兵员
    showSoldiers() {
      return this.soldiers.filter(s => s.name.indexOf(this.rightSearch) > -1)
    }
  },
  methods: {
    // 分队选中
    unitCheckChange(e, unit) {
      const checked = e.target.checked
      this.$set(unit.sandtableContingent, 'checked', checked)
      unit.troopsList.forEach(item => {
        this.$set(item, 'checked', checked)

        // 选中目标
        const index = this.leftChecked.findIndex(l => l.id === item.id)
        if (checked) {
          index < 0 && this.leftChecked.push(item)
        } else {
          index > -1 && this.leftChecked.splice(index, 1)
        }
      })
    },
    // 左侧兵员选中
    leftSoldierChecked(e, soldier, unit) {
      const checked = e.target.checked
      this.$set(soldier, 'checked', checked)

      // 选中目标
      const index = this.leftChecked.findIndex(l => l.id === soldier.id)
      if (checked) {
        index < 0 && this.leftChecked.push(soldier)
      } else {
        index > -1 && this.leftChecked.splice(index, 1)
      }
    },
    // 右侧兵员选中
    rightSoldierChecked(e, soldier) {
      const checked = e.target.checked
      this.$set(soldier, 'checked', checked)

      // 选中目标
      const index = this.rightChecked.findIndex(r => r.id === soldier.id)
      if (checked) {
        index < 0 && this.rightChecked.push(soldier)
      } else {
        index > -1 && this.rightChecked.splice(index, 1)
      }
    },
    // 添加到右边
    go2Right() {
      this.leftChecked.forEach(item => {
        item.checked = false
        this.soldiers.push(item)
      })
      this.leftChecked = []
      this.resetLeftStatus()
    },
    // 返回左侧
    go2Left() {
      this.rightChecked.forEach(item => {
        item.checked = false

        const index = this.soldiers.findIndex(s => s.id === item.id)
        index > -1 && this.soldiers.splice(index, 1)
      })
      this.rightChecked = []
    },
    // 重置左侧状态
    resetLeftStatus() {
      this.units.forEach(unit => {
        this.$set(unit.sandtableContingent, 'checked', false)

        unit.troopsList.forEach(soldier => {
          this.$set(soldier, 'checked', false)
        })
      })
    },
    // 关闭
    onClose() {
      this.$emit('close')
    },
    // 提交
    handleSubmit() {
      this.loading = true
      const troopsIds = []
      this.soldiers.forEach(soldier => {
        troopsIds.push(soldier.id)
      })
      this.$request({
        url: '/api/v1/sandtable_target/distributeTroops',
        method: 'post',
        data: {
          targetId: this.target.id,
          troopsIds: troopsIds
        }
      })
        .then(res => {
          this.loading = false
          if (res.data.status === 200) {
            this.$emit('success')
          }
        })
        .catch(() => {
          this.loading = false
        })
    }
  },
  watch: {
    visible() {
      if (this.visible) {
        // 查询所有分队及分队下人员
        this.$get('/api/v1/sandtable-contingent/getAllContingentTroops').then(r => {
          if (r.data.status === 200) {
            this.units = r.data.data
            this.units.forEach(unit => {
              this.$set(unit.sandtableContingent, 'checked', false)
              this.$set(unit.sandtableContingent, 'expanded', false)

              unit.troopsList.forEach(soldier => {
                this.$set(soldier, 'checked', false)
              })
            })
          }
        })

        // 查询分配到的分队及人员
        this.$get('/api/v1/sandtable_target/getTroopsByTargetId', {
          targetId: this.target.id
        }).then(r => {
          if (r.data.status === 200) {
            this.placedUnits = r.data.data
            let arr = []
            this.placedUnits.forEach(unit => {
              arr = arr.concat(unit.troopsList)
            })
            this.soldiers = arr
          }
        })
      }
    }
  }
}
</script>
<style scoped lang="scss">
.team-setting-container {
  height: 100%;
  position: relative;
  border-top: 1px solid #ddd;

  .left,
  .right {
    height: 100%;
  }

  .left {
    border-right: 1px solid #ddd;

    .list-container {
      position: relative;
      height: calc(100% - 60px);
      overflow-y: auto;
      padding: 0 24px;
      padding-bottom: 24px;

      .unit-item {
        margin-top: 12px;
        &:first-child {
          margin-top: 0;
        }

        .expand-icon {
          cursor: pointer;
          margin-right: 6px;
        }
      }

      .children-list {
        padding-left: 40px;

        .child-item {
          position: relative;
          margin-top: 12px;
        }
      }
    }
  }

  .right {
    border-left: 1px solid #ddd;

    .list-container {
      position: relative;
      height: calc(100% - 60px);
      overflow-y: auto;
      padding: 0 24px;
      padding-bottom: 24px;

      .list-item {
        margin-top: 12px;

        .name {
          display: inline-block;
          width: 30%;
        }

        .unit {
          display: inline-block;
          width: 40%;
        }

        .telephone {
          display: inline-block;
          width: 30%;
        }
      }
    }
  }

  .search-container {
    height: 60px;
    line-height: 60px;
    padding: 0 24px;
  }

  .transfer-btns-container {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;

    .transfer-btns {
      width: 100%;
      text-align: center;

      .anticon {
        margin: 24px 0;
        cursor: pointer;
        background: #42a0f8;
        color: #fff;
        padding: 4px;
        border: 1px solid transparent;

        &.disabled {
          background: #f5f5f5;
          color: #999;
          border: 1px solid #d9d9d9;
          cursor: not-allowed;
        }
      }
    }
  }
}
</style>
