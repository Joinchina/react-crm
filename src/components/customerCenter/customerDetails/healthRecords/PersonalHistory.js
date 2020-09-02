import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Tag, Form, Input, DatePicker, Spin, Row, Col, Affix, Button ,Select} from 'antd'
import Title from '../../../common/Title'
import { SmartSelectMultipleAsync } from '../../../common/SmartSelectMultiple'
import { isArray, isLagel } from '../../../../helpers/checkDataType'
import NotEditableField from '../../../common/NotEditableField'
import SmartSelectSingle from '../../../common/SmartSelectSingle'
import { SmartSelectSingleForSource } from '../../../common/SmartSelectSingleForSource'
import SmartSelectMultipleForMedicine from '../../../common/SmartSelectMultipleForMedicine'
import moment from 'moment'
const FormItem = Form.Item
import { testPermission } from '../../../common/HasPermission'

import SmartInput from '../../../common/SmartInput'
import { getChronicDiseaseAction } from '../../../../states/customerCenter/medicalRecord'
import './HealthRecords.css'
class PersonalHistory extends Component {

  constructor(props) {
    super(props)
    this.uuid = 0
    this.form = props.form
  }

  componentWillMount(){
    const { getFieldDecorator } = this.form
    getFieldDecorator('personalHistoryKeys', { initialValue: [this.uuid] })
  }

  componentWillReceiveProps(nextProps){
    if(this.props.customerDetailsMedicalRecord.editStatus != nextProps.customerDetailsMedicalRecord.editStatus && nextProps.customerDetailsMedicalRecord.editStatus){
      let getMedicalRecordResult = nextProps.customerDetailsMedicalRecord.getMedicalRecordResult
      if(getMedicalRecordResult.payload && Array.isArray(getMedicalRecordResult.payload.personalMedicalHistory)){
        const { getFieldDecorator, setFieldsValue, getFieldValue } = this.form
        let newPersonalHistoryKeys = []
        this.uuid = 0//nextProps变化时，this.uuid从0计       
        getMedicalRecordResult.payload.personalMedicalHistory.map((row, index) => {
          let uuid = ++this.uuid//每map一次，uuid累加一次
          
          getFieldDecorator(`personalHistory_${uuid}_disease`, {initialValue: {key: String(row.disease.id), label: row.disease.name}})
          getFieldDecorator(`personalHistory_${uuid}_class`, {initialValue: {key: row.chronicDisease.id?String(row.chronicDisease.id):undefined,label: row.chronicDisease.name?row.chronicDisease.name:undefined}})
          getFieldDecorator(`personalHistory_${uuid}_diagnosedDate`, {initialValue: moment(row.diagnosedDate)})
          getFieldDecorator(`personalHistory_${uuid}_drugs`, {initialValue: row.drugs})
         
          let createDate = row.createDate.split(" ")[0]
          getFieldDecorator(`personalHistory_${uuid}_createTime`, {initialValue: createDate})
          getFieldDecorator(`personalHistory_${uuid}_creator`, {initialValue: row.createByName})
          getFieldDecorator(`personalHistory_${uuid}_id`, {initialValue: row.id})
          newPersonalHistoryKeys.push(uuid)
        })
        newPersonalHistoryKeys.push(++this.uuid)
        setFieldsValue({personalHistoryKeys: newPersonalHistoryKeys})
      }
    }
  }

  handleChange(k, type, value){
      
    const { getFieldValue, setFieldsValue } = this.form
    const personalHistoryKeys = [...getFieldValue('personalHistoryKeys')]
    let lastKey = personalHistoryKeys.pop()
    let newHistoryKeys = personalHistoryKeys.filter((element, index, array)=>{
      const lastValue = getFieldValue(`personalHistory_${element}_disease`)
      if( k === element && lastValue && lastValue.key){          
        if(value && value.key && value.key !== lastValue.key){    
            let classField = {}
            classField[`personalHistory_${element}_class`] = undefined
            setFieldsValue(classField)    
        } 
          let diseaseId = lastValue.key;
          let param={
            diseaseId:diseaseId,
            type:1,
            status:1
          }
          this.props.getChronicDiseaseAction(param)                
      }
      let drugsValue = getFieldValue(`personalHistory_${element}_drugs`)
      if(( k == element && type === 'disease' ? value : getFieldValue(`personalHistory_${element}_disease`))
        || ( k == element && type === 'diagnosedDate' ? value : getFieldValue(`personalHistory_${element}_diagnosedDate`))
        || ( k == element && type === 'drugs' && Array.isArray(value) ? value.length : (Array.isArray(drugsValue) && drugsValue.length) )
      ){
        return true
      }
      return false
    })
    const lastDrugsValue = k == lastKey && type === 'drugs'  ? value : getFieldValue(`personalHistory_${lastKey}_drugs`)
    const lastDiagnosedDateValue = k == lastKey && type === 'diagnosedDate' ? value : getFieldValue(`personalHistory_${lastKey}_diagnosedDate`)
    const lastDiseaseValue = k == lastKey && type === 'disease' ? value : getFieldValue(`personalHistory_${lastKey}_disease`)
    const lastDiseaseClassValue = k == lastKey && type === 'class' ? value : getFieldValue(`personalHistory_${lastKey}_class`)
    
    if( lastDiseaseValue || lastDiagnosedDateValue || Array.isArray(lastDrugsValue) && lastDrugsValue.length ){
      newHistoryKeys.push(lastKey)
      // 重置最后一行
      let fieldsDataForReset = {}
      fieldsDataForReset[`personalHistory_${lastKey}_drugs`] = lastDrugsValue
      fieldsDataForReset[`personalHistory_${lastKey}_disease`] = lastDiseaseValue
      fieldsDataForReset[`personalHistory_${lastKey}_class`] = lastDiseaseClassValue
      fieldsDataForReset[`personalHistory_${lastKey}_diagnosedDate`] = lastDiagnosedDateValue
      fieldsDataForReset[`personalHistory_${lastKey}_createTime`] = ''
      fieldsDataForReset[`personalHistory_${lastKey}_creator`] = ''
      setFieldsValue(fieldsDataForReset)
      newHistoryKeys.push(++this.uuid)
    }else{
      newHistoryKeys.push(lastKey)
    }

    setFieldsValue({personalHistoryKeys: newHistoryKeys})
  }

  remove(k){
    // can use data-binding to get
    const personalHistoryKeys = this.form.getFieldValue('personalHistoryKeys')
    // We need at least one passenger
    if (personalHistoryKeys.length === 1) {
      return
    }
    // can use data-binding to set
    this.form.setFieldsValue({
      personalHistoryKeys: personalHistoryKeys.filter(key => key !== k),
    })
  }

  getEditebleRow() {
    const medicalRecordResult = this.props.customerDetailsMedicalRecord.getMedicalRecordResult 
    const historyLength = medicalRecordResult.payload.personalMedicalHistory.length
    const { getFieldDecorator, getFieldValue, setFieldsValue } = this.form
    const personalHistoryKeys = getFieldValue('personalHistoryKeys')
    return personalHistoryKeys.map((k, index) => {
      if(k === 0){
        return//点击保存回显后personalHistoryKeys为空
      }
      let diseaseClass = []     
      let options
      if(this.props.customerDetailsMedicalRecord && this.props.customerDetailsMedicalRecord.getChronicDiseaseResult && this.props.customerDetailsMedicalRecord.getChronicDiseaseResult.status === "fulfilled"){
        diseaseClass = this.props.customerDetailsMedicalRecord.getChronicDiseaseResult.payload
      }
      //疾病与类型/分级实现联动    
      if(getFieldValue(`personalHistory_${k}_disease`)){
        options = diseaseClass.map((item,index) => {
          return <Select.Option key={String(item.id)} >{item.title?item.title:item.name?item.name:undefined}</Select.Option>
        })
      }
       
      let required = personalHistoryKeys.length - 1 === index ? false : true
      getFieldDecorator(`personalHistory_${k}_id`)
      return (
        <tr key={k}>
          <td style={{verticalAlign: 'top'}}>
            <FormItem
              label=""
            >
              {getFieldDecorator(`personalHistory_${k}_disease`,
                {
                  //initialValue: { key: '4cdb15a7064246abbadd7db9c3bc0a7b', label: '测试病' },
                  onChange: this.handleChange.bind(this, k, 'disease'),
                  rules: [
                    { required: required, message: '不可为空' },
                  ],
                })(               
                    <SmartSelectSingleForSource
                      selectStyle={{width: 150,borderBottom:"none"}}
                      showSearch={true}
                      editStatus={personalHistoryKeys.length - 1 !== index ?k>historyLength?true:false:true}
                      notEditableOnly={personalHistoryKeys.length - 1 !== index ?k>historyLength?false:true:false}
                      placeholder="请选择"
                      asyncResultId='diseaseSmartSelectSingle'
                      asyncRequestFuncName='getDisease'
                      asyncRequestTrigger='componentDidMount'
                      asyncMapResultToState={data => {
                        data = Array.isArray(data) ?
                        data.map(row => {return {value: row.id, text: row.name}})
                        :
                        []
                      return data
                      }}
                    />                   
                )
              }
            </FormItem>
          </td>
          <td style={{verticalAlign: 'top'}}>
              <FormItem>
              {getFieldDecorator(`personalHistory_${k}_class`,
              {
                onChange: this.handleChange.bind(this, k, 'class'),
                rules :[],
              })(
                <SmartSelectSingle
                  selectStyle={{width: 150,borderBottom:"none"}}
                  placeholder="请选择"
                  showSearch={true}                  
                  editStatus={true}
                  notEditableOnly={false}
                  onFocus={this.handleChange.bind(this, k, 'class')}
                >
                  { personalHistoryKeys.length - 1 === index ? '' : options }
                </SmartSelectSingle>
              )}
              </FormItem>
          </td>
          <td style={{verticalAlign: 'top'}}>
            <FormItem
              label=""
            >
              {getFieldDecorator(`personalHistory_${k}_diagnosedDate`,
                {
                  //initialValue: moment('2012-02-12'),
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
              label=""
            >
              {getFieldDecorator(`personalHistory_${k}_drugs`,
                {
                  //initialValue: [{id:'138837', name:'ABC'}],
                  onChange: this.handleChange.bind(this, k, 'drugs'),
                  rules: [
                  ],
                })(

                  <SmartSelectMultipleForMedicine
                    uuid={k}
                    editStatus={true}
                    placeholder="请选择"
                    hospitalId={this.props.hospitalId}
                  />
              )}
            </FormItem>
          </td>
           <td style={{verticalAlign: 'top'}}>
               <FormItem>
                {getFieldDecorator(`personalHistory_${k}_createTime`,
                {
                  rules :[],
                })(
                  <SmartInput notEditableOnly={true} hideBottomLine={true}/>
                )}
              </FormItem> 
          </td>
          <td style={{verticalAlign: 'top'}}>
               <FormItem>
                {getFieldDecorator(`personalHistory_${k}_creator`,
                {
                  rules :[]
                })(
                  <SmartInput notEditableOnly={true} hideBottomLine={true}/>
                )}
              </FormItem> 
          </td>   
          <td style={{verticalAlign: 'top'}}>
            <div style={{display: personalHistoryKeys.length - 1 == index ? 'none' : ''}}>
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
    if(!editStatus && medicalRecordResult.payload && Array.isArray(medicalRecordResult.payload.personalMedicalHistory)){
      trs = medicalRecordResult.payload.personalMedicalHistory.map((row, index) => {
        return (
          <tr key={index}>
            <td>{isLagel(row.disease).name}</td>
            <td>{isLagel(row.chronicDisease).name}</td>
            <td>{row.diagnosedDate.split(' ')[0]}</td>
            <td>{
              isArray(row.drugs) && row.drugs.map( (item, index)=> <Tag style={{marginBottom: 5}} key={index}>{item.name}</Tag> )
            }</td>
            <td>{row.createDate.split(" ")[0]}</td>
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
        <Title text='个人病史及常用药物' left={20} />
        <NotEditableField
          editStatus={!editStatus}
          notEditableOnly={this.permission || editStatus}
          switchState={()=>{this.props.setEditStatusAction(true)}}
        />
          <table>
            <thead>
              <tr>
                <th width='12.5%'>疾病</th>
                <th width='12.5%'>分型</th>
                <th width='12.5%'>确诊时间</th>
                <th width='25%'>常用药物</th>
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
})(PersonalHistory)

function select (state) {
  return {
    customerDetailsMedicalRecord: state.customerDetailsMedicalRecord
  }
}

function mapDispachToProps (dispatch) {
  return bindActionCreators( {getChronicDiseaseAction }, dispatch)
}

export default connect(select, mapDispachToProps)(MedicalRecordForm)
