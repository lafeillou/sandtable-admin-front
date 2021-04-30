<template>
  <a-drawer
    title="新增目标点位"
    :maskClosable="false"
    width="80%"
    placement="right"
    :closable="false"
    @close="onClose"
    :visible="addVisiable"
    :bodyStyle="{ padding: 0, 'padding-bottom': '0 !important' }"
    style="height: calc(100% - 55px);overflow: auto;padding-bottom: 53px;"
  >
    <a-form :form="form" layout="vertical" class="target-form-container">
      <a-row>
        <a-col :span="16">
          <div class="map-container">
            <div class="map" style="width:100%;" id="targetMap">
              <!--地图定位器组件-->
              <MapEditor
                ref="mapEditor"
                @change="mapEditorChangeHandle"
                wrapId="targetMap"
                :geoData="geoData"
                :properties="formData"
              />
            </div>
          </div>
          <div class="resources">
            <div class="upload-list">
              <a-upload
                :showUploadList="false"
                :headers="headers"
                :action="baseURL + '/api/v1/file/upload'"
                :disabled="pictureList.length >= 5"
                listType="picture-card"
                accept="image/*"
                multiple
                @change="e => handleUploadChange(e, 'image')"
              >
                <div>
                  <a-icon :type="pictureUpload ? 'loading' : 'plus'" />
                  <div class="ant-upload-text">选择图片</div>
                </div>
              </a-upload>
              <div class="resource-list">
                <img v-for="(img, index) in pictureList" :key="index" :src="baseURL + img.fullPath" />
              </div>
            </div>
            <div class="upload-list">
              <a-upload
                :showUploadList="false"
                :headers="headers"
                :action="baseURL + '/api/v1/file/upload'"
                :disabled="mediaList.length >= 1"
                listType="picture-card"
                multiple
                accept=".mp4, .webm, .ogg"
                @change="e => handleUploadChange(e, 'video')"
              >
                <div>
                  <a-icon :type="mediaUpload ? 'loading' : 'plus'" />
                  <div class="ant-upload-text">选择视频</div>
                </div>
              </a-upload>
              <div class="resource-list">
                <video
                  v-for="(media, index) in mediaList"
                  :key="index"
                  :src="baseURL + media.fullPath"
                  autoplay
                  controls="controls"
                >
                  浏览器不支持
                </video>
              </div>
            </div>
          </div>
        </a-col>
        <a-col :span="8" class="form-container">
          <a-form-item label="目标类型：" v-bind="formItemLayout">
            <a-select
              v-decorator="['classifyCode', { rules: [{ required: true, message: '请输入目标类型!' }] }]"
              placeholder="请输入目标类型"
            >
              <a-select-option v-for="(item, index) in classifys" :key="index" :value="item.classifyCode">{{
                item.classifyName
              }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="目标名称：" v-bind="formItemLayout">
            <a-input
              v-decorator="['targetName', { rules: [{ required: true, message: '请输入目标名称!' }] }]"
              placeholder="请输入目标名称"
            />
          </a-form-item>
          <a-form-item label="业务类型" v-bind="formItemLayout">
            <a-input v-decorator="['targetType']" />
          </a-form-item>
          <a-form-item label="负责人姓名" v-bind="formItemLayout">
            <a-input v-decorator="['liablePerson']" />
          </a-form-item>
          <a-form-item label="责任人电话" v-bind="formItemLayout">
            <a-input v-decorator="['liableTellephone']" />
          </a-form-item>
          <a-form-item label="目标颜色" v-bind="formItemLayout">
            <a-input v-decorator="['targetColor']" />
          </a-form-item>
          <a-form-item label="目标尺寸" v-bind="formItemLayout">
            <a-input v-decorator="['targetSize']" />
          </a-form-item>
          <!-- <a-form-item label="省" v-bind="formItemLayout">
            <a-input v-decorator="['targetProvience', { rules: [{ required: true, message: '请输入省!' }] }]" />
          </a-form-item>
          <a-form-item label="市" v-bind="formItemLayout">
            <a-input v-decorator="['targetCity', { rules: [{ required: true, message: '请输入市!' }] }]" />
          </a-form-item>
          <a-form-item label="区" v-bind="formItemLayout">
            <a-input v-decorator="['targetDistrict', { rules: [{ required: true, message: '请输入区!' }] }]" />
          </a-form-item> -->
          <!--省/市/区（县）三级选择器-->
          <a-form-item label="省/市/区(县)">
            <a-cascader
              :default-value="[defaultValue.targetProvience, defaultValue.targetCity, defaultValue.targetDistrict]"
              :options="options"
              change-on-select
              placeholder="请选择省/市/区(县)"
              @change="onCascaderChange"
              :load-data="loadCasecaderData"
              :fieldNames="{ value: 'id', label: 'name', children: 'children' }"
            />
          </a-form-item>
          <a-form-item label="目标说明：" v-bind="formItemLayout">
            <a-textarea v-decorator="['targetDesc']" :rows="8" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <div class="drawer-bootom-button">
      <a-button style="margin-right: .8rem" @click="onClose">取消</a-button>
      <a-button @click="handleSubmit" type="primary" :loading="loading || pictureUpload || mediaUpload">提交</a-button>
    </div>
  </a-drawer>
</template>
<script>
import MapEditor from '@/components/mapEditor'
import { baseURL } from '@/setting'
import { province } from './js/province.js'
import { city } from './js/city.js'
import { country } from './js/country.js'

import _ from 'lodash'

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 }
}
const defaultValue = {
  targetProvience: '河南省',
  targetCity: '周口市',
  targetDistrict: '川汇区'
  // targetProvience: '410000000000',
  // targetCity: '410100000000',
  // targetDistrict: '410102000000'
}

export default {
  name: 'SandtableTargetAdd',
  props: {
    addVisiable: {
      default: false
    }
  },
  components: {
    MapEditor
  },
  data() {
    return {
      baseURL,
      loading: false,
      formItemLayout,
      classifys: [],
      form: this.$form.createForm(this, {
        onValuesChange: (_, values) => {
          Object.assign(this.formData, values)
        }
      }),
      formData: {},
      targetLocationArea: '',
      geoData: null,
      headers: {
        Authentication: this.$store.state.account.token
      },
      pictureList: [],
      pictureUpload: false,
      mediaList: [],
      mediaUpload: false,
      // 省/市/区（县）级联菜单
      options: province,
      defaultValue
    }
  },
  mounted() {
    this.initFormData(defaultValue)
  },
  methods: {
    // 加载省市区某一级的数据
    loadCasecaderData(selectedOptions) {
      const level = selectedOptions.length
      const targetOption = selectedOptions[selectedOptions.length - 1]
      targetOption.loading = true
      // load options lazily
      targetOption.loading = false
      if (level === 1) {
        targetOption.children = city[targetOption.id]
        targetOption.children = targetOption.children.map(o => {
          o.isLeaf = false
          return o
        })
      } else if (level === 2) {
        targetOption.children = country[targetOption.id]
        targetOption.children = targetOption.children.map(o => {
          o.isLeaf = true
          return o
        })
      }
      this.options = [...this.options]
    },
    // 省市区（县）级联菜单
    onCascaderChange(value) {
      console.log(value)
    },
    // 接收地图定位器过来的数据
    mapEditorChangeHandle(data) {
      // data就是要存储的目标数据，格式为标准的geoJSON
      console.log(JSON.stringify(data))
      this.targetLocationArea = JSON.stringify(data)
    },
    reset() {
      this.loading = false
      this.pictureList = []
      this.mediaList = []
      this.form.resetFields()
    },
    onClose() {
      this.reset()
      this.$emit('close')
    },
    onOpen() {
      this.$refs.mapEditor.renderGeoData()
    },
    // 初始化表单
    initFormData(defaultValue) {
      let fields = ['targetProvience', 'targetCity', 'targetDistrict']
      Object.keys(defaultValue).forEach(key => {
        if (fields.indexOf(key) !== -1) {
          this.form.getFieldDecorator(key)
          let obj = {}
          obj[key] = defaultValue[key]
          this.form.setFieldsValue(obj)
        }
      })

      this.$get('/api/v1/sandtable_target/listTargetClassify', {}).then(r => {
        if (r.data.status === 200) {
          this.classifys = r.data.data
        }
      })
    },
    // 表单提交
    handleSubmit() {
      this.form.validateFields((err, values) => {
        if (!err) {
          const params = this.form.getFieldsValue()
          params.targetLocationArea = this.targetLocationArea
          if (!this.targetLocationArea) {
            this.$message.warning('请标注目标点位')
            return
          }

          params.pictureList = this.pictureList
          params.mediaList = this.mediaList
          this.loading = true
          this.$request({
            url: '/api/v1/sandtable_target/saveSandTableTarget',
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
    },
    // 图片上传状态改变回调
    handleUploadChange(e, type) {
      // 图片上传状态
      const pictureIndex = e.fileList.findIndex(file => file.type.indexOf('image') > -1 && file.status === 'uploading')
      if (pictureIndex > -1) {
        this.pictureUpload = true
      } else {
        this.pictureUpload = false
      }

      // 视频上传状态
      const videoIndex = e.fileList.findIndex(file => file.type.indexOf('video') > -1 && file.status === 'uploading')
      if (videoIndex > -1) {
        this.mediaUpload = true
      } else {
        this.mediaUpload = false
      }

      const index = e.fileList.findIndex(file => file.status === 'uploading')
      if (index < 0) {
        this.loading = false
      }
      if (e.file.status === 'done') {
        const response = e.file.response
        if (response.status === 200) {
          const list = type === 'image' ? this.pictureList : this.mediaList
          const maxLength = type === 'image' ? 5 : 1
          list.length < maxLength &&
            list.push({
              fileId: response.data.fileId,
              fullPath: response.data.fileFullPath,
              sort: list.length + 1
            })
        } else {
          this.$message.warning(response.message)
        }
      }
    }
  },
  watch: {
    addVisiable() {
      if (this.addVisiable) {
        this.initFormData(defaultValue)
        setTimeout(() => {
          this.onOpen()
        }, 300)
      }
    }
  }
}
</script>
<style scoped lang="scss">
.target-form-container {
  height: calc(100vh - 55px) !important;
  position: relative;
  box-sizing: border-box;
  padding: 16px 24px;

  .map-container {
    background: #35549d;
    // padding-right: 24px;

    .map {
      height: 550px;
      // border: 1px solid #ddd;
    }
  }

  .upload-list {
    position: relative;
    margin-top: 12px;

    .resource-list {
      position: absolute;
      display: inline-block;
      height: 104px !important;
      width: calc(100% - 104px);
      left: 104px;
      top: 0;
      text-align: left;

      img {
        width: 104px;
        height: 104px;
        margin-left: 16px;
      }

      video {
        width: 320px;
        margin-left: 16px;
      }
    }
  }
}
</style>
