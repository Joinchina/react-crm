/*
 * @Author: wangchongguang 
 * @Date: 2017-10-26 10:38:59 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2017-11-07 15:36:14
 * 健康档案--并发症 
 */
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Form, DatePicker, Row, Col, Affix, Button, Select} from 'antd'
import Title from '../../../common/Title'
import { isArray } from '../../../../helpers/checkDataType'
import NotEditableField from '../../../common/NotEditableField'
import SmartSelectSingle from '../../../common/SmartSelectSingle'
import moment from 'moment'
import { testPermission } from '../../../common/HasPermission'
import SmartInput from '../../../common/SmartInput'
import { getChronicDiseaseAction, getGradingAction } from '../../../../states/customerCenter/medicalRecord'
const FormItem = Form.Item

class complicationHistory extends Component {

  constructor(props) {
    super(props)
    this.uuid = 0
    this.form = props.form
  }

  componentWillMount(){
    const { getFieldDecorator } = this.form
    getFieldDecorator('complicationHistoryKeys', { initialValue: [this.uuid] })
  }

  componentWillReceiveProps(nextProps){
    if(this.props.customerDetailsMedicalRecord.editStatus != nextProps.customerDetailsMedicalRecord.editStatus && nextProps.customerDetailsMedicalRecord.editStatus){
      let getMedicalRecordResult = nextProps.customerDetailsMedicalRecord.getMedicalRecordResult
      if(getMedicalRecordResult.payload && Array.isArray(getMedicalRecordResult.payload.complication)){
        const { getFieldDecorator, setFieldsValue } = this.form
        let newcomplicationHistoryKeys = []
        this.uuid = 0//nextProps变化时，this.uuid从0计
        getMedicalRecordResult.payload.complication.map((row, index) => {
          let uuid = ++this.uuid
          getFieldDecorator(`complicationHistory_${uuid}_disease`, {initialValue: {key: String(row.chronicDiseaseId), label: row.chronicDiseaseTitle}})
          getFieldDecorator(`complicationHistory_${uuid}_class`, {initialValue: {key: row.gradingId?String(row.gradingId):undefined, label: row.gradingTitle?row.gradingTitle:undefined}})
          getFieldDecorator(`complicationHistory_${uuid}_diagnosedDate`, {initialValue: row.diagnosedDate?moment(row.diagnosedDate):undefined})
          getFieldDecorator(`complicationHistory_${uuid}_createTime`, {initialValue: row.createDate.split(' ')[0]})
          getFieldDecorator(`complicationHistory_${uuid}_creator`, {initialValue: row.createByName})
          getFieldDecorator(`complicationHistory_${uuid}_id`, {initialValue: row.id})
          newcomplicationHistoryKeys.push(uuid)
        })
        newcomplicationHistoryKeys.push(++this.uuid)
        setFieldsValue({complicationHistoryKeys: newcomplicationHistoryKeys})
      }
    }
  }

  handleChange(k, type, value){
   
    const { getFieldValue, setFieldsValue } = this.form
    const complicationHistoryKeys = [...getFieldValue('complicationHistoryKeys')]
    let lastKey = complicationHistoryKeys.pop()
    let newHistoryKeys = complicationHistoryKeys.filter((element, index, array)=>{
      const lastValue = getFieldValue(`complicationHistory_${element}_disease`)
      if( k === element && lastValue && lastValue.key){        
        if(value && value.key && value.key !== lastValue.key){    
            let classField = {}
            classField[`complicationHistory_${element}_class`] = undefined
            setFieldsValue(classField)   
        }
          let chronicDiseaseId = lastValue.key;
          this.props.getGradingAction(chronicDiseaseId)           
      }    
      let drugsValue = getFieldValue(`complicationHistory_${element}_drugs`)
      if(( k == element && type === 'disease' ? value : getFieldValue(`complicationHistory_${element}_disease`))
        || ( k == element && type === 'diagnosedDate' ? value : getFieldValue(`complicationHistory_${element}_diagnosedDate`))
        || ( k == element && type === 'drugs' && Array.isArray(value) ? value.length : (Array.isArray(drugsValue) && drugsValue.length) )
      ){
        return true
      }
      return false
    })
    const lastDrugsValue = k == lastKey && type === 'drugs'  ? value : getFieldValue(`complicationHistory_${lastKey}_drugs`)
    const lastDiagnosedDateValue = k == lastKey && type === 'diagnosedDate' ? value : getFieldValue(`complicationHistory_${lastKey}_diagnosedDate`)
    const lastDiseaseValue = k == lastKey && type === 'disease' ? value : getFieldValue(`complicationHistory_${lastKey}_disease`)
    const lastDiseaseClassValue = k == lastKey && type === 'class' ? value : getFieldValue(`complicationHistory_${lastKey}_class`)
    
    if( lastDiseaseValue || lastDiagnosedDateValue || Array.isArray(lastDrugsValue) && lastDrugsValue.length ){
      newHistoryKeys.push(lastKey)
      // 重置最后一行
      let fieldsDataForReset = {}
      fieldsDataForReset[`complicationHistory_${lastKey}_disease`] = lastDiseaseValue
      fieldsDataForReset[`complicationHistory_${lastKey}_class`] = lastDiseaseClassValue
      fieldsDataForReset[`complicationHistory_${lastKey}_diagnosedDate`] = lastDiagnosedDateValue
      fieldsDataForReset[`complicationHistory_${lastKey}_createTime`] = ''
      fieldsDataForReset[`complicationHistory_${lastKey}_creator`] = ''
      setFieldsValue(fieldsDataForReset)
      newHistoryKeys.push(++this.uuid)
    }else{
      newHistoryKeys.push(lastKey)
    }

    setFieldsValue({complicationHistoryKeys: newHistoryKeys})
  }

  remove(k){
    const complicationHistory = this.form.getFieldValue('complicationHistoryKeys')
    if (complicationHistory.length === 1) {
      return
    }
    this.form.setFieldsValue({
      complicationHistoryKeys: complicationHistory.filter(key => key !== k),
    })
  }

  getChronicDease = () => {
    const param = {
      type:2,
      status:1
    }
    this.props.getChronicDiseaseAction(param)
  }
  
  getEditebleRow() {
    let grading = []
    let chronicDisease = []
    let chronicDiseaseOptions = undefined
    const medicalRecordResult = this.props.customerDetailsMedicalRecord.getMedicalRecordResult   
    const historyLength = medicalRecordResult.payload.complication.length
    const { getFieldDecorator, getFieldValue } = this.form
    const complicationHistoryKeys = getFieldValue('complicationHistoryKeys')
    if(this.props.customerDetailsMedicalRecord && this.props.customerDetailsMedicalRecord.getChronicDiseaseResult && this.props.customerDetailsMedicalRecord.getChronicDiseaseResult.status === "fulfilled"){
      chronicDisease = this.props.customerDetailsMedicalRecord.getChronicDiseaseResult.payload
    }
    //console.log(chronicDisease)
    return complicationHistoryKeys.map((k, index) => {
      if(k === 0){
        return//点击保存回显后complicationHistoryKeys为空
      }
      chronicDiseaseOptions  = chronicDisease.map((item,index) => {
        return <Select.Option key={String(item.id)} >{item.title?item.title:item.name?item.name:undefined}</Select.Option>
      })
      let gradingOptions
      if(this.props.customerDetailsMedicalRecord && this.props.customerDetailsMedicalRecord.getGradingResult && this.props.customerDetailsMedicalRecord.getGradingResult.status === "fulfilled"){
        grading = this.props.customerDetailsMedicalRecord.getGradingResult.payload
        gradingOptions = grading.map((item,index) => {
          return <Select.Option key={String(item.id)||'0'} >{item.title?item.title:item.name?item.name:undefined}</Select.Option>
        })
      }   
      let required = complicationHistoryKeys.length - 1 === index ? false : true
      getFieldDecorator(`complicationHistory_${k}_id`)
      
      return (
        <tr key={k}>
          <td style={{verticalAlign: 'top'}} >
            <FormItem
              label=""
            >
              {getFieldDecorator(`complicationHistory_${k}_disease`,
                {
                  onChange: this.handleChange.bind(this, k, 'disease'),
                  rules: [
                    { required: required, message: '不可为空' },
                  ],
                })(
                  <SmartSelectSingle
                    placeholder="请选择"
                    showSearch={true}
                    hideBottomLine={true}
                    selectStyle={{width: 150,borderBottom:"none"}}
                    editStatus={complicationHistoryKeys.length - 1 !== index ? k <= historyLength ? false : true : true}
                    notEditableOnly={complicationHistoryKeys.length - 1 !== index ? k <= historyLength ? true : false : false}
                    onFocus={this.getChronicDease}
                  >
                  { chronicDiseaseOptions }
                  </SmartSelectSingle>
              )
              }
            </FormItem>
          </td>
          <td style={{verticalAlign: 'top'}}>
              <FormItem>
              {getFieldDecorator(`complicationHistory_${k}_class`,
              {
                onChange: this.handleChange.bind(this, k, 'class'),
                rules :[{ required: required, message: '不可为空' },]
              })(
                <SmartSelectSingle
                    selectStyle={{width: 150,borderBottom:"none"}}
                    placeholder="请选择"
                    showSearch={true}                    
                    editStatus={true}
                    notEditableOnly={false}
                    onFocus={this.handleChange.bind(this, k, 'class')}
                  >
                  { gradingOptions }
                </SmartSelectSingle>
              )}
              </FormItem>
          </td>
          <td style={{verticalAlign: 'top'}}>
            <FormItem
              label=""
            >
              {getFieldDecorator(`complicationHistory_${k}_diagnosedDate`,
                {
                  onChange: this.handleChange.bind(this, k, 'diagnosedDate'),
                  rules: [
                     { required: required, message: '不可为空' }
                    ],
                })(
                  <DatePicker
                    placeholder='请选择'
                    disabledDate={ current => current && current.valueOf() > Date.now() }
                  />
                )}
            </FormItem>
          </td>
          <td style={{verticalAlign: 'top'}}>
              <FormItem
              className="createTime"
              >
              {getFieldDecorator(`complicationHistory_${k}_createTime`,
              {
                rules :[],
              })(
                <SmartInput notEditableOnly={true} hideBottomLine={true}/>
              )}
              </FormItem>
          </td>
          <td style={{verticalAlign: 'top'}}>
              <FormItem>
              {getFieldDecorator(`complicationHistory_${k}_creator`,
              {
                rules :[]
              })(
                <SmartInput notEditableOnly={true} hideBottomLine={true}/>
              )}
              </FormItem>
          </td>   
          <td style={{verticalAlign: 'top'}}>
            <div style={{display: complicationHistoryKeys.length - 1 == index ? 'none' : ''}}>
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

  switchState =() => {
    this.props.setEditStatusAction(true)
  }

  render () {
    let trs = [], noDataTr
    let editStatus = this.props.customerDetailsMedicalRecord.editStatus
    const formItems = editStatus ? this.getEditebleRow() : null
    const medicalRecordResult = this.props.customerDetailsMedicalRecord.getMedicalRecordResult
    if(!editStatus && medicalRecordResult.payload && Array.isArray(medicalRecordResult.payload.complication)){
      trs = medicalRecordResult.payload.complication.map((row, index) => {
        return (
          <tr key={index}>
            <td>{row.chronicDiseaseTitle}</td>
            <td>{row.gradingTitle}</td>
            <td>{row.diagnosedDate?row.diagnosedDate.split(' ')[0]:''}</td>
            <td>{row.createDate.split(' ')[0]}</td>
            <td>{row.createByName}</td>
          </tr>
       )
      })
    }
    if(!editStatus && trs.length === 0 && !this.props.loading){
      noDataTr = <tr><td colSpan='6'>暂无数据</td></tr>
    }

    return (
      <div className='form-table-box block' id='customerDetailsMedicalRecord' style={{marginBottom: 30}}>
        <Title text='并发症' left={20} />
        <NotEditableField
          editStatus={!editStatus}
          notEditableOnly={this.permission || editStatus}
          switchState={()=>{this.props.setEditStatusAction(true)}}
        />
          <table>
            <thead>
              <tr>
                <th width='12.5%'>并发症</th>
                <th width='12.5%'>分级</th>
                <th width='37.5%'>确诊时间</th>
                <th width='12.5%'>创建时间</th>
                <th width='10%'>创建人</th>             
                { editStatus ? <th width='5%'>操作</th> : null }
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
const MedicalRecordForm = Form.create({
  mapPropsToFields(props){
    return {...props.customerDetailsMedicalRecord.formData}
  },
  onFieldsChange(props, fields){
    props.renewFormDataAction(fields)
  }
})(complicationHistory)

function select (state) {
  return {
    customerDetailsMedicalRecord: state.customerDetailsMedicalRecord
  }
}

function mapDispachToProps (dispatch) {
  return bindActionCreators( {getChronicDiseaseAction, getGradingAction }, dispatch)
}

export default connect(select, mapDispachToProps)(MedicalRecordForm)


