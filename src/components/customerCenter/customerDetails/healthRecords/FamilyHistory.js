import React, { Component } from 'react'
import { Tag, Form, Input, DatePicker, Spin, Row, Col, Affix, Button, Select } from 'antd'
import Title from '../../../common/Title'
import { isArray, isLagel } from '../../../../helpers/checkDataType'
import { SmartSelectMultipleAsync } from '../../../common/SmartSelectMultiple'
import NotEditableField from '../../../common/NotEditableField'
import { setEditStatusAction, renewFormDataAction, getFamilyHistory, putFamilyHistory } from '../../../../states/customerCenter/medicalRecord'
import SmartSelectMultipleAsyncForDiseases from '../../../common/SmartSelectMultipleAsyncForDiseases'
import { testPermission } from '../../../common/HasPermission'
import SmartInput from '../../../common/SmartInput'

const FormItem = Form.Item
const Option = Select.Option

const RELATION = [
    { key: '1', value: '父亲' },
    { key: '2', value: '母亲' },
    { key: '3', value: '兄弟' },
    { key: '4', value: '姐妹' },
    { key: '5', value: '叔伯' },
    { key: '6', value: '姑' },
    { key: '7', value: '姨' },
    { key: '8', value: '舅' },
    { key: '9', value: '祖父' },
    { key: '10', value: '祖母' },
    { key: '11', value: '外祖父' },
    { key: '12', value: '外祖母' },
    { key: '13', value: '表兄弟' },
    { key: '14', value: '表姐妹' },
    { key: '15', value: '堂兄弟' },
    { key: '16', value: '堂姐妹' },
]

const relationMap = {}
RELATION.forEach(item => relationMap[item.key] = item.value)


export default class FamilyHistory extends Component{

  constructor(props) {
    super(props)
    this.uuid = 0
    this.form = props.form
  }

  componentWillMount(){
    const { getFieldDecorator } = this.form
    getFieldDecorator('familyHistoryKeys', { initialValue: [this.uuid] })
  }

  componentWillReceiveProps(nextProps){
    if(this.props.customerDetailsMedicalRecord.editStatus != nextProps.customerDetailsMedicalRecord.editStatus && nextProps.customerDetailsMedicalRecord.editStatus){
      let getMedicalRecordResult = nextProps.customerDetailsMedicalRecord.getMedicalRecordResult
      if(getMedicalRecordResult.payload && Array.isArray(getMedicalRecordResult.payload.familyMedicalHistory)){
        const { getFieldDecorator, setFieldsValue } = this.form
        let newFamilyHistoryKeys = []
        this.uuid = 0//nextProps变化时，this.uuid从0计
        getMedicalRecordResult.payload.familyMedicalHistory.map((row, index) => {
          let uuid = ++this.uuid
          newFamilyHistoryKeys.push(uuid)
          getFieldDecorator(`familyHistory_${uuid}_relation`, {initialValue: String(row.relation)})
          getFieldDecorator(`familyHistory_${uuid}_disease`, {initialValue: row.diseases})
          getFieldDecorator(`familyHistory_${uuid}_createTime`, {initialValue: row.createDate.split(' ')[0]})
          getFieldDecorator(`familyHistory_${uuid}_creator`, {initialValue: row.createByName})
          getFieldDecorator(`familyHistory_${uuid}_id`, {initialValue: row.id})
        })
        newFamilyHistoryKeys.push(++this.uuid)
        setFieldsValue({familyHistoryKeys: newFamilyHistoryKeys})
      }
    }
  }

  handleChange(k, type, value){
    const { getFieldValue, setFieldsValue } = this.form
    const familyHistoryKeys = [...getFieldValue('familyHistoryKeys')]
    let lastKey = familyHistoryKeys.pop()
    let newHistoryKeys = familyHistoryKeys.filter((element, index, array)=>{
      let diseasesValue = getFieldValue(`familyHistory_${element}_disease`)
      if(( k == element && type === 'disease' && Array.isArray(value) ? value.length : Array.isArray(diseasesValue) && diseasesValue.length )
        || ( k == element && type === 'relation' ? value : getFieldValue(`familyHistory_${element}_relation`))
      )return true
      return false
    })
    const lastRelationValue = k == lastKey && type === 'relation' ? value : getFieldValue(`familyHistory_${lastKey}_relation`)

    const lastDiseaseValue = k == lastKey && type === 'disease' ? value : getFieldValue(`familyHistory_${lastKey}_disease`)
    if( Array.isArray(lastDiseaseValue) && lastDiseaseValue.length || lastRelationValue){
      newHistoryKeys.push(lastKey)
      // 重置最后一行
      let fieldsDataForReset = {}
      fieldsDataForReset[`familyHistory_${lastKey}_relation`] = lastRelationValue
      fieldsDataForReset[`familyHistory_${lastKey}_disease`] = lastDiseaseValue
      fieldsDataForReset[`familyHistory_${lastKey}_createTime`] = ''
      fieldsDataForReset[`familyHistory_${lastKey}_creator`] = ''
      setFieldsValue(fieldsDataForReset)
      newHistoryKeys.push(++this.uuid)
    }
    else{
      newHistoryKeys.push(lastKey)
    }

    setFieldsValue({familyHistoryKeys: newHistoryKeys})
  }

  remove(k){
    // can use data-binding to get
    const familyHistoryKeys = this.form.getFieldValue('familyHistoryKeys')
    // We need at least one passenger
    if (familyHistoryKeys.length === 1) {
      return
    }
    //console.log(this.props.form.getFieldValue('familyHistoryKeys'))
    //console.log(k)
    // can use data-binding to set
    this.form.setFieldsValue({
      familyHistoryKeys: familyHistoryKeys.filter(key => key !== k),
    })
  }

  getEditebleRow = () => {
    const { getFieldDecorator, getFieldValue } = this.form
    const familyHistoryKeys = getFieldValue('familyHistoryKeys')
    const medicalRecordResult = this.props.customerDetailsMedicalRecord.getMedicalRecordResult
    const historyLength = medicalRecordResult.payload.familyMedicalHistory.length
    return familyHistoryKeys.map((k, index) => {
      if(k === 0){
        return//点击保存回显后familyHistoryKeys为空
      }
      let relationIdx = getFieldValue(`familyHistory_${k}_relation`)
      let required = familyHistoryKeys.length - 1 == index ? false : true
      getFieldDecorator(`familyHistory_${k}_id`)
      return (
        <tr key={k}>
          <td style={{verticalAlign: 'top'}}>
            <FormItem
              label=""
              required={false}
            >
              { getFieldDecorator(`familyHistory_${k}_relation`,
                {
                  onChange: this.handleChange.bind(this, k, 'relation'),
                  rules: [
                    {required: required, message: '不可为空'},
                  ],
                })(
                  <Select
                  placeholder='请选择'
                  style={{ width: 150 }}
                  >
                  {
                      RELATION.map((item, i) => <Option key={i} value={item.key}>{item.value}</Option>)
                  }
                  </Select>
              )}

            </FormItem>
          </td>
          <td style={{verticalAlign: 'top'}}>
            <FormItem
              label=""
              required={false}
            >
              {getFieldDecorator(`familyHistory_${k}_disease`,
                {
                  onChange: this.handleChange.bind(this, k, 'disease'),
                  rules: [
                     {required: required, message: '不可为空'}
                    ],
                })(
                  <SmartSelectMultipleAsyncForDiseases
                    placeholder='请选择其他疾病'
                    selectStyle={{width: 150}}
                    editStatus={true}
                    defaultButtonCount={0}
                  />
                )}
            </FormItem>
          </td>
          <td style={{verticalAlign: 'top'}}>
              <FormItem
              className="createTime"
              >
              {getFieldDecorator(`familyHistory_${k}_createTime`,
              {
                rules :[],
              })(
                <SmartInput notEditableOnly={true} hideBottomLine={true}/>
              )}
              </FormItem>
          </td>
          <td style={{verticalAlign: 'top'}}>
              <FormItem>
              {getFieldDecorator(`familyHistory_${k}_creator`,
              {
                rules :[]
              })(
                <SmartInput notEditableOnly={true} hideBottomLine={true}/>
              )}
              </FormItem>
          </td>
          <td style={{verticalAlign: 'top'}}>
            <div style={{display: familyHistoryKeys.length - 1 == index ? 'none' : ''}}>
              <FormItem>
                <a onClick={this.remove.bind(this, k)}>删除</a>
              </FormItem>
            </div>
          </td>
        </tr>
      )
    })
  }

  get permission () {
    let data = this.props.customerDetailsMedicalRecord.getMedicalRecordResult.status === 'fulfilled' && this.props.customerDetailsMedicalRecord.getMedicalRecordResult.payload;
    const res = testPermission({
      $any: [
           'patient.edit',
           'patient.admin'
       ]
    })
    return !data.isEdit || !res
  }

  render () {
    let trs = [], noDataTr
    let editStatus = this.props.customerDetailsMedicalRecord.editStatus
    const formItems = editStatus ? this.getEditebleRow() : null
    const medicalRecordResult = this.props.customerDetailsMedicalRecord.getMedicalRecordResult
    if(!editStatus && medicalRecordResult.payload && Array.isArray(medicalRecordResult.payload.familyMedicalHistory)){
      trs = medicalRecordResult.payload.familyMedicalHistory.map((row, index) => {
        return (
          <tr key={index}>
            <td>
              { relationMap[row.relation] || '未知' }
            </td>
            <td>{isArray(row.diseases) && row.diseases.map((item, index) => <Tag key={index} style={{marginBottom: 5}}>{item.name}</Tag>)}</td>
            { editStatus ? <td></td> : null }
            <td>{row.createDate.split(" ")[0]}</td>
            <td>{row.createByName}</td>
          </tr>
        )
      })
    }
    if(!editStatus && trs.length === 0 && !this.props.loading){
      noDataTr = <tr><td colSpan='2'>暂无数据</td></tr>
    }
    return (
      <div className='form-table-box block' id='customerDetailsMedicalRecord' style={{marginBottom: 30}}>
        <Title text='家族病史' left={20} />
          <NotEditableField
            editStatus={!editStatus}
            notEditableOnly={this.permission || editStatus}
            switchState={()=>this.props.setEditStatusAction(true)}
          />
          <table>
            <thead>
              <tr>
                <th width='12.5%'>与本人关系</th>
                <th width='50%'>疾病</th>
                <th width='12.5%'>创建时间</th>
                <th width='10%'>创建人</th>
                { editStatus ? <th width="5%">操作</th> : null }
              </tr>
            </thead>
            <tbody>
              {formItems}
              {trs}
              {noDataTr}
            </tbody>
          </table>
      </div>
    )
  }
}
