<template>
  <a-card :bordered="false" class="card-area">
    <div :class="advanced ? 'search' : null">
      <a-form layout="horizontal">
        <div :class="advanced ? null: 'fold'">
          <a-row>
            <a-col :md="12" :sm="24">
              <a-form-item label="名称" :labelCol="{span: 5}" :wrapperCol="{span: 18, offset: 1}">
                <a-input v-model="queryParams.keyword" allowClear />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="创建时间" :labelCol="{span: 5}" :wrapperCol="{span: 18, offset: 1}">
                <range-date @change="handleDateChange" ref="createTime"></range-date>
              </a-form-item>
            </a-col>
          </a-row>
        </div>
        <span style="float: right; margin-top: 3px;">
          <a-button type="primary" @click="search">查询</a-button>
          <a-button style="margin-left: 8px" @click="reset">重置</a-button>
        </span>
      </a-form>
    </div>
    <div>
      <div class="operator">
        <a-button v-hasPermission="['target:add']" type="primary" ghost @click="add">新增</a-button>
        <a-button v-hasPermission="['target:delete']" @click="batchDelete">删除</a-button>
        <a-upload
          v-hasPermission="['target:import']"
          :showUploadList="false"
          :headers="headers"
          :action="baseURL + '/api/v1/sandtable-troops/batch_insert'"
          accept=".xls, .xlsx"
          @change="handleUploadChange"
        >
          <a-button type="upload" :loading="uploading">批量导入</a-button>
        </a-upload>
      </div>
      <a-table
        :columns="columns"
        :rowKey="record => record.id"
        :dataSource="dataSource"
        :pagination="pagination"
        :loading="loading"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        @change="handleTableChange"
      >
        <template slot="operation" slot-scope="text, record">
          <a-icon
            v-hasPermission="['target:update']"
            type="setting"
            targetName
            theme="twoTone"
            twoToneColor="#4a9ff5"
            @click="edit(record)"
            title="修改"
          ></a-icon>
          <a-badge v-hasNoPermission="['target:update']" status="warning" text="无权限"></a-badge>
        </template>
      </a-table>
    </div>
    <soldier-add @success="handleAddSuccess" @close="handleAddClose" :addVisiable="addVisiable"></soldier-add>
    <soldier-edit
      ref="editDialog"
      @success="handleDeptEditSuccess"
      @close="handleDeptEditClose"
      :editVisiable="editVisiable"
    ></soldier-edit>
  </a-card>
</template>

<script>
import SoldierAdd from './Add'
import SoldierEdit from './Edit'
import RangeDate from '@/components/datetime/RangeDate'
import { baseURL } from '@/setting'

export default {
  name: 'Soldiers',
  components: { SoldierAdd, SoldierEdit, RangeDate },
  data() {
    return {
      baseURL,
      advanced: false,
      dataSource: [],
      selectedRowKeys: [],
      queryParams: {
        keyword: '',
        pageNum: 1,
        pageSize: 10
      },
      sortedInfo: null,
      pagination: {
        pageSizeOptions: ['10', '20', '30', '40', '100'],
        defaultCurrent: 1,
        defaultPageSize: 10,
        showSizeChanger: true,
        showTotal: (total, range) => `显示 ${range[0]} ~ ${range[1]} 条记录，共 ${total} 条记录`
      },
      loading: false,
      addVisiable: false,
      editVisiable: false,
      headers: {
        Authentication: this.$store.state.account.token
      },
      uploading: false
    }
  },
  computed: {
    columns() {
      let { sortedInfo } = this
      sortedInfo = sortedInfo || {}
      return [
        {
          title: '姓名',
          dataIndex: 'name'
        },
        {
          title: '所属分队',
          dataIndex: 'contingentName'
        },
        {
          title: '专业',
          dataIndex: 'orgPost'
        },
        {
          title: '联系电话',
          dataIndex: 'telephone'
        },
        {
          title: '家庭地址',
          dataIndex: 'homeAddress'
        },
        {
          title: '操作',
          dataIndex: 'operation',
          scopedSlots: { customRender: 'operation' },
          fixed: 'right',
          width: 120
        }
      ]
    }
  },
  mounted() {
    this.fetch()
  },
  methods: {
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },
    handleAddClose() {
      this.addVisiable = false
    },
    handleAddSuccess() {
      this.addVisiable = false
      this.$message.success('新增成功')
      this.fetch()
    },
    add() {
      this.addVisiable = true
    },
    handleDeptEditClose() {
      this.editVisiable = false
    },
    handleDeptEditSuccess() {
      this.editVisiable = false
      this.$message.success('修改成功')
      this.fetch()
    },
    edit(record) {
      this.editVisiable = true
      this.$refs.editDialog.setFormValues(record)
    },
    handleDateChange(value) {
      if (value) {
        this.queryParams.createTimeFrom = value[0]
        this.queryParams.createTimeTo = value[1]
      }
    },
    batchDelete() {
      if (!this.selectedRowKeys.length) {
        this.$message.warning('请选择需要删除的记录')
        return
      }
      let that = this
      this.$confirm({
        title: '确定删除所选中的记录?',
        content: '当您点击确定按钮后，这些记录将会被彻底删除，如果其包含子记录，也将一并删除！',
        centered: true,
        onOk() {
          let ids = []
          let selectedRowKeysStr = ',' + that.selectedRowKeys.join(',') + ','
          ids.push(
            that.dataSource
              .filter(f => {
                return selectedRowKeysStr.indexOf(',' + f.id + ',') > -1
              })
              .map(m => {
                return m.id
              })
          )
          that.$delete('/api/v1/sandtable-troops/' + ids.join(',')).then(() => {
            that.$message.success('删除成功')
            that.selectedRowKeys = []
            that.fetch()
          })
        },
        onCancel() {
          that.selectedRowKeys = []
        }
      })
    },
    exportExcel() {
      let { sortedInfo } = this
      let sortField, sortOrder
      // 获取当前列的排序和列的过滤规则
      if (sortedInfo) {
        sortField = sortedInfo.field
        sortOrder = sortedInfo.order
      }
      this.$export('dept/excel', {
        sortField: sortField,
        sortOrder: sortOrder,
        ...this.queryParams
      })
    },
    search() {
      let { sortedInfo } = this
      let sortField, sortOrder
      // 获取当前列的排序和列的过滤规则
      if (sortedInfo) {
        sortField = sortedInfo.field
        sortOrder = sortedInfo.order
      }
      this.fetch(
        Object.assign(
          {
            sortField: sortField,
            sortOrder: sortOrder,
            ...this.queryParams
          },
          { pageNum: 1, pageSize: 10 }
        )
      )
    },
    reset() {
      // 取消选中
      this.selectedRowKeys = []
      // 重置列排序规则
      this.sortedInfo = null
      // 重置查询参数
      this.queryParams.keyword = ''
      // 清空时间选择
      this.$refs.createTime.reset()
      this.fetch()
    },
    handleTableChange(pagination, filters, sorter) {
      const pager = { ...this.pagination }
      pager.current = pagination.current
      pager.pageSize = pagination.pageSize
      this.pagination = pager
      this.queryParams.pageNum = pagination.current
      this.queryParams.pageSize = pagination.pageSize
      this.fetch({
        sortField: sorter.field,
        sortOrder: sorter.order,
        ...this.queryParams,
        ...filters
      })
    },
    fetch(params) {
      if (!params) {
        params = this.queryParams
      }
      this.loading = true
      this.$get('/api/v1/sandtable-troops/listSandTableTroops', {
        ...params
      }).then(r => {
        if (r.data.status === 200) {
          const pagination = { ...this.pagination }
          const data = r.data.data
          this.loading = false
          this.dataSource = data.records
          pagination.total = data.total
          this.pagination = pagination
        }
      })
    },
    // 上传状态改变回调
    handleUploadChange(e) {
      const uploadIndex = e.fileList.findIndex(file => file.status === 'uploading')
      if (uploadIndex > -1) {
        this.uploading = true
      } else {
        this.uploading = false
      }

      if (e.file.status === 'done') {
        const response = e.file.response
        if (response.status === 200) {
          this.fetch()
        } else {
          this.$message.warning(response.message)
        }
      } else if (e.file.status === 'error') {
        const response = e.file.response
        this.$message.warning(response.message)
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import '../../../../public/less/Common';
</style>
