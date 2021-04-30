<template>
  <a-drawer
    title="修改目标点位"
    :maskClosable="false"
    width="650"
    placement="right"
    :closable="false"
    @close="onClose"
    :visible="editVisiable"
    style="height: calc(100% - 55px);overflow: auto;padding-bottom: 53px;"
  >
    <a-form :form="form">
      <a-form-item label="姓名" v-bind="formItemLayout">
        <a-input v-decorator="['name',{ rules: [{ required: true, message: '请输入姓名!' }] }]" />
      </a-form-item>
      <a-form-item label="性别" v-bind="formItemLayout">
        <a-select v-decorator="['gender',{ rules: [{ required: true, message: '请选择性别!' }] }]">
          <a-select-option :value="0">男</a-select-option>
          <a-select-option :value="1">女</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="年龄" v-bind="formItemLayout">
        <a-input-number
          v-decorator="['age',{ rules: [{ required: true, message: '请输入年龄!' }] }]"
          :min="1"
          :max="200"
        />
      </a-form-item>
      <a-form-item label="政治面貌" v-bind="formItemLayout">
        <a-select
          v-decorator="['politicsStatus',{ rules: [{ required: true, message: '请选择政治面貌!' }] }]"
        >
          <a-select-option :value="1">党员</a-select-option>
          <a-select-option :value="2">团员</a-select-option>
          <a-select-option :value="3">群众</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="教育水平" v-bind="formItemLayout">
        <a-select
          v-decorator="['educationLevel',{ rules: [{ required: true, message: '请选择教育水平!' }] }]"
        >
          <a-select-option :value="1">本科以上</a-select-option>
          <a-select-option :value="2">专科</a-select-option>
          <a-select-option :value="3">高中</a-select-option>
          <a-select-option :value="4">初中</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="服役情况" v-bind="formItemLayout">
        <a-select
          v-decorator="['serviceStatus',{ rules: [{ required: true, message: '请选择服役情况!' }] }]"
        >
          <a-select-option :value="1">现役</a-select-option>
          <a-select-option :value="2">非现役</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="兵员类型" v-bind="formItemLayout">
        <a-select v-decorator="['type',{ rules: [{ required: true, message: '请选择类型!' }] }]">
          <a-select-option :value="0">应急力量</a-select-option>
          <a-select-option :value="1">专业力量</a-select-option>
          <a-select-option :value="2">特殊力量</a-select-option>
          <a-select-option :value="3">其它</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="所属分队" v-bind="formItemLayout">
        <a-select
          v-decorator="['contingentId',{ rules: [{ required: true, message: '请选择所属分队!' }] }]"
          showSearch
          :filterOption="filterOption"
        >
          <a-select-option
            v-for="(item, index) in units"
            :key="index"
            :value="item.id"
          >{{item.contingentName}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="专业" v-bind="formItemLayout">
        <a-input v-decorator="['orgPost']" />
      </a-form-item>
      <a-form-item label="联系方式" v-bind="formItemLayout">
        <a-input v-decorator="['telephone']" />
      </a-form-item>
      <a-form-item label="家庭地址" v-bind="formItemLayout">
        <a-input v-decorator="['homeAddress']" />
      </a-form-item>
    </a-form>
    <div class="drawer-bootom-button">
      <a-button style="margin-right: .8rem" @click="onClose">取消</a-button>
      <a-button @click="handleSubmit" type="primary" :loading="loading">提交</a-button>
    </div>
  </a-drawer>
</template>
<script>
const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 18 }
}
export default {
  name: 'SoldierEdit',
  props: {
    editVisiable: {
      default: false
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
  data() {
    return {
      loading: false,
      recordId: '',
      formItemLayout,
      form: this.$form.createForm(this),
      units: []
    }
  },
  methods: {
    filterOption(input, option) {
      return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
    },
    reset() {
      this.loading = false
      this.formData = {}
      this.form.resetFields()
    },
    onClose() {
      this.reset()
      this.$emit('close')
    },
    setFormValues({ ...record }) {
      this.recordId = record.id
      let fields = [
        'name',
        'contingentId',
        'orgPost',
        'telephone',
        'homeAddress',
        'gender',
        'age',
        'politicsStatus',
        'educationLevel',
        'serviceStatus',
        'type'
      ]
      Object.keys(record).forEach(key => {
        if (fields.indexOf(key) !== -1) {
          this.form.getFieldDecorator(key)
          let obj = {}
          obj[key] = record[key]
          this.form.setFieldsValue(obj)
        }
      })
    },
    handleSubmit() {
      this.form.validateFields((err, values) => {
        if (!err) {
          this.loading = true
          const params = this.form.getFieldsValue()
          params.id = this.recordId
          this.$request({
            url: '/api/v1/sandtable-troops/saveSandTableTroops',
            method: 'post',
            data: { ...params }
          })
            .then(() => {
              this.reset()
              this.$emit('success')
            })
            .catch(() => {
              this.loading = false
            })
        }
      })
    }
  },
  watch: {
    editVisiable() {
      if (this.editVisiable) {
        this.$get('/api/v1/sandtable-contingent/listSandTableContingents', {
          queryAreaType: this.queryAreaType,
          queryAreaName: this.queryAreaName,
          pageNum: 1,
          pageSize: 1000000000
        }).then(r => {
          if (r.data.status === 200) {
            const data = r.data.data
            this.units = data.records
          }
        })
      }
    }
  }
}
</script>
