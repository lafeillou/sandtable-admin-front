<template>
  <a-drawer
    title="新增分队"
    :maskClosable="false"
    width="650"
    placement="right"
    :closable="false"
    @close="onClose"
    :visible="addVisiable"
    style="height: calc(100% - 55px);overflow: auto;padding-bottom: 53px;"
  >
    <a-form :form="form">
      <a-form-item label="分队名称" v-bind="formItemLayout">
        <a-input
          v-decorator="['contingentName',{ rules: [{ required: true, message: '请输入分队名称!' }] }]"
        />
      </a-form-item>
      <a-form-item label="分队类型" v-bind="formItemLayout">
        <a-input v-decorator="['contingentType']" />
      </a-form-item>
      <a-form-item label="队长" v-bind="formItemLayout">
        <a-input
          v-decorator="['contingentCaptain',{ rules: [{ required: true, message: '请选择分队队长!' }] }]"
        />
      </a-form-item>
      <a-form-item label="分队联系方式" v-bind="formItemLayout">
        <a-input v-decorator="['captainTelephone']" />
      </a-form-item>
      <a-form-item label="分队地址" v-bind="formItemLayout">
        <a-input v-decorator="['contingentAddress']" />
      </a-form-item>
      <a-form-item label="省份" v-bind="formItemLayout">
        <a-input v-decorator="['contingentProvince']" />
      </a-form-item>
      <a-form-item label="市" v-bind="formItemLayout">
        <a-input v-decorator="['contingentCity']" />
      </a-form-item>
      <a-form-item label="区县" v-bind="formItemLayout">
        <a-input v-decorator="['contingentDistrict']" />
      </a-form-item>
      <a-form-item label="分队说明" v-bind="formItemLayout">
        <a-textarea v-decorator="['contingentDesc']" />
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
  name: 'UnitAdd',
  props: {
    addVisiable: {
      default: false
    }
  },
  data() {
    return {
      loading: false,
      formItemLayout,
      form: this.$form.createForm(this)
    }
  },
  methods: {
    reset() {
      this.loading = false
      this.form.resetFields()
    },
    onClose() {
      this.reset()
      this.$emit('close')
    },
    handleSubmit() {
      this.form.validateFields((err, values) => {
        if (!err) {
          this.loading = true
          const params = this.form.getFieldsValue()
          this.$request({
            url: '/api/v1/sandtable-contingent/saveSandTableContingent',
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
  }
}
</script>
