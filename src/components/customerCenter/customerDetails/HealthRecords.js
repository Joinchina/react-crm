import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Button, Affix, Spin, Radio, Breadcrumb, Row, Col, Form } from 'antd'
import message from '@wanhu/antd-legacy/lib/message'
const FormItem = Form.Item
import AlertError from '../../common/AlertError'

import Title from '../../common/Title'

import PersonalHistory from './healthRecords/PersonalHistory'
import FamilyHistory from './healthRecords/FamilyHistory'
import ComplicationHistory from './healthRecords/Complication'

import SmartInput from '../../common/SmartInput'
import SmartSelectBox from '../../common/SmartSelectBox'
import SmartRadio from '../../common/SmartRadio'

import BaseComponent from '../../BaseComponent'

import { getFormalPatientAction, getPotentialPatientAction, setEditStatusAction, renewFormDataAction, getMedicalRecord, putMedicalRecord,getUserInfoAction } from '../../../states/customerCenter/medicalRecord'
import { testPermission } from '../../common/HasPermission'

class HealthRecords extends BaseComponent {

  constructor (props) {
    super(props)
    this.state = {
      hospitalId: ''
    }
    this.medicalRecord = {}
    this.customerId = props.customerId
    this.isShow = props.source === 'customerDetails'
  }

  componentDidMount(){
    this.props.getUserInfoAction()
    this.props.getMedicalRecord(this.customerId)
    if(this.isShow){
      this.props.getFormalPatientAction(this.customerId)
    }else{
      this.props.getPotentialPatientAction(this.customerId)
    }
  }

  componentWillReceiveProps(nextProps){

    if(this.props.customerDetailsMedicalRecord.getMedicalRecordResult != nextProps.customerDetailsMedicalRecord.getMedicalRecordResult){
      if(nextProps.customerDetailsMedicalRecord.getMedicalRecordResult.status === 'fulfilled'){
        const { getFieldDecorator } = this.props.form
        const fieldsData = nextProps.customerDetailsMedicalRecord.getMedicalRecordResult.payload
        getFieldDecorator('height', { initialValue: fieldsData.height })
        getFieldDecorator('weight', { initialValue: fieldsData.weight})
        getFieldDecorator('bloodType', { initialValue: fieldsData.bloodType ? [fieldsData.bloodType] : [] })
        getFieldDecorator('rhBloodType', { initialValue: fieldsData.rhBloodType})
        const height = fieldsData.height/100
        getFieldDecorator('BMI', { initialValue: isNaN(fieldsData.weight/(height*height))?'':(fieldsData.weight/(height*height)).toFixed(1)})
        getFieldDecorator('allergies', { initialValue: fieldsData.allergies})
        getFieldDecorator('sport', { initialValue: fieldsData.dictExercise })
        getFieldDecorator('taste', { initialValue: fieldsData.dictAppetite })
        getFieldDecorator('drink', { initialValue: fieldsData.dictLiquor })
        getFieldDecorator('smoke', { initialValue: fieldsData.dictSmoke })
      }
    }

    if(this.props.customerDetailsMedicalRecord.putMedicalRecordResult != nextProps.customerDetailsMedicalRecord.putMedicalRecordResult){
      if(nextProps.customerDetailsMedicalRecord.putMedicalRecordResult.status === 'fulfilled'){
        this.props.setEditStatusAction(false)
        this.props.form.resetFields()
        const { getFieldDecorator } = this.props.form
        //getFieldDecorator('familyHistoryKeys', { initialValue: [0] })
        //getFieldDecorator('personalHistoryKeys', { initialValue: [0] })
        this.props.getMedicalRecord(this.customerId)
      }
    }

    if(this.props.customerDetailsMedicalRecord.getPotentialPatientResult != nextProps.customerDetailsMedicalRecord.getPotentialPatientResult){
      if(nextProps.customerDetailsMedicalRecord.getPotentialPatientResult.status === 'fulfilled'){
        this.setState({hospitalId: nextProps.customerDetailsMedicalRecord.getPotentialPatientResult.payload.hospital.id})
      }
    }

    if(this.props.customerDetailsMedicalRecord.getFormalPatientResult != nextProps.customerDetailsMedicalRecord.getFormalPatientResult){
      if(nextProps.customerDetailsMedicalRecord.getFormalPatientResult.status === 'fulfilled'){
        this.setState({hospitalId: nextProps.customerDetailsMedicalRecord.getFormalPatientResult.payload.hospital.id})
      }
    }

  }

  componentWillUnmount(){
    this.props.setEditStatusAction(false)
    this.props.form.resetFields()
  }

  handleSubmit = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return
      }
      let dataForPost = {}
      const { getFieldValue } = this.props.form

      let weight = getFieldValue(`weight`)
      dataForPost.weight = weight ? weight : ''
      dataForPost.height = getFieldValue(`height`)
      dataForPost.allergies = getFieldValue(`allergies`)
      dataForPost.rhBloodType = getFieldValue(`rhBloodType`)
      dataForPost.bloodType = getFieldValue(`bloodType`)[0]

      let personalHistoryKeys = [...getFieldValue('personalHistoryKeys')]
      //console.log('-------',personalHistoryKeys)
      personalHistoryKeys.pop()
      let personalMedicalHistory = []
      personalMedicalHistory = personalHistoryKeys.map( v => {
        let data = {}
        let disease = getFieldValue(`personalHistory_${v}_disease`)
        if(disease){
          data.disease = {
            id: disease.key,
            name: disease.label
          }
        }
        let chronicDisease = getFieldValue(`personalHistory_${v}_class`)
        if(chronicDisease){
          data.chronicDiseaseId = Number(chronicDisease.key)
        }
        data.diagnosedDate = getFieldValue(`personalHistory_${v}_diagnosedDate`).format('YYYY-MM-DD HH:mm:ss')
        let drugs = getFieldValue(`personalHistory_${v}_drugs`)
        if(drugs && Array.isArray(drugs)){
          data.drugs = drugs.map((item)=>{
            return {
              id: item.id,
              name: item.name
            }
          })
        }else{
          data.drugs = []
        }
        data.id = getFieldValue(`personalHistory_${v}_id`)
        return data

      })
      dataForPost.personalMedicalHistory = JSON.stringify(personalMedicalHistory)

      let complicationKeys = [...getFieldValue('complicationHistoryKeys')]
      complicationKeys.pop()
      let complication = []
      complication = complicationKeys.map( v => {
        let data = {}
        let chronicDisease = getFieldValue(`complicationHistory_${v}_disease`)
        if(chronicDisease){
          data.chronicDiseaseId = Number(chronicDisease.key)
        }
        let grading = getFieldValue(`complicationHistory_${v}_class`)
        if(grading){
          data.gradingId = Number(grading.key)
        }
        data.diagnosedDate = getFieldValue(`complicationHistory_${v}_diagnosedDate`).format('YYYY-MM-DD HH:mm:ss')
        data.id = getFieldValue(`complicationHistory_${v}_id`)
        return data
      })
      dataForPost.complication = JSON.stringify(complication)
      let familyHistoryKeys = [...getFieldValue('familyHistoryKeys')]
      familyHistoryKeys.pop()
      let history = []
      history = familyHistoryKeys.map( v => {
        let data = { }
        data.diseases =  getFieldValue(`familyHistory_${v}_disease`).map((item)=>{
          return {
            id: item.id,
            name: item.name
          }
        })
        data.relation = getFieldValue(`familyHistory_${v}_relation`)
        data.id = getFieldValue(`familyHistory_${v}_id`)
        return data
      })
      dataForPost.familyMedicalHistory = JSON.stringify(history)

      this.props.putMedicalRecord(this.customerId, dataForPost)
    })
  }

  styles () {
    return {
      box: {
        padding: 20
      },
      foot: {
        textAlign: 'center',
        height: 60,
        lineHeight: '60px'
      },
      footBtn: {
        marginRight: 10
      }
    }
  }

  get permission () {
    let data = this.props.customerDetailsMedicalRecord.getMedicalRecordResult.status === 'fulfilled' && this.props.customerDetailsMedicalRecord.getMedicalRecordResult.payload;
    return !data.isEdit
    /*
    const res = testPermission({
      $any: [
           'patient.edit',
           'patient.admin'
       ]
    })
    if(data.isEdit) return !data.isEdit
    return !res
    */
  }

  render () {
    const styles = this.styles()
    let editStatus = this.props.customerDetailsMedicalRecord.editStatus
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    }
    const { getFieldDecorator } = this.props.form
    const mapPropsToFormItems = {
      switchState: ()=>this.props.setEditStatusAction(true),
      editStatus,
      notEditableOnly: this.permission
    }
    return (
      <div>
        <AlertError {...this.props.customerDetailsMedicalRecord.getMedicalRecordResult} />
        <AlertError {...this.props.customerDetailsMedicalRecord.putMedicalRecordResult} />
        <Spin
          spinning={this.props.customerDetailsMedicalRecord.getMedicalRecordResult.status === 'pending'}
        >
          <div className='block'>
            <div>
              <Title text='体征' left={20}/>
              <div style={styles.box}>
                <Row gutter={20}>
                  <Col span={12}>
                    <FormItem
                      label="身高（cm）"
                      {...formItemLayout}

                    >
                      {getFieldDecorator('height',
                        {
                          rules: [
                          ],
                        })(
                          <SmartInput
                            notEditableOnly={true}
                          />
                        )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      label="体重（kg）"

                      {...formItemLayout}
                    >
                      {getFieldDecorator('weight',
                        {
                          rules: [
                            ],
                        })(
                          <SmartInput
                            notEditableOnly={true}
                          />
                        )}
                    </FormItem>
                  </Col>
                  </Row>
                  <Row gutter={20}>


                    <Col span={6}>
                      <FormItem
                        label="血型"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                      >
                        {getFieldDecorator('bloodType',
                          {
                          })(
                            <SmartSelectBox
                              {...mapPropsToFormItems}
                              notEditableOnly={!editStatus}
                              buttonOptions={
                                [
                                  {
                                    id: 'A',
                                    name: 'A'
                                  },
                                  {
                                    id: 'B',
                                    name: 'B'
                                  },
                                  {
                                    id: 'AB',
                                    name: 'AB'
                                  },
                                  {
                                    id: 'O',
                                    name: 'O'
                                  }
                                ]
                              }
                            />
                          )
                        }
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem
                        wrapperCol={{ span: 24 }}
                      >
                      {
                        //+ - RH阳性、阴性
                        getFieldDecorator('rhBloodType',
                          {
                            rules: [
                              ],
                          })(
                            <SmartRadio
                              {...mapPropsToFormItems}
                              placeholder=""
                              transform={
                                (item) => {
                                  switch (item) {
                                    case '+': return 'RH阳性'
                                    case '-': return '阴性'
                                    default:  return item
                                  }
                                }
                              }
                            >
                            <Radio value='+'>RH阳性</Radio>
                            <Radio value='-'>阴性</Radio>
                            </SmartRadio>
                          )
                      }
                      </FormItem>
                    </Col>
                    <Col span={12}>
                    <FormItem
                      label="BMI"

                      {...formItemLayout}
                    >
                      {getFieldDecorator('BMI',
                        {
                          rules: [
                            ],
                        })(
                          <SmartInput
                            notEditableOnly={true}
                          />
                        )}
                    </FormItem>
                    </Col>

                </Row>

                <Row>
                  <Col span={24}>
                    <FormItem
                      label="过敏史"
                      labelCol={{ span: 2 }}
                      wrapperCol={{ span: 22 }}

                    >
                      {getFieldDecorator('allergies',
                        {
                          rules: [
                            ],
                        })(
                          <SmartInput
                            {...mapPropsToFormItems}
                            placeholder=""
                            type='textarea'
                            maxLength='500'
                            autosize={{minRows: 4}}
                          />
                        )}
                    </FormItem>
                  </Col>
                </Row>
              </div>
              <Title text='生活习惯' left={20}/>
              <div style={styles.box}>
                <Row gutter={20}>
                  <Col span={12}>
                    <FormItem
                      label="运动"
                      {...formItemLayout}

                    >
                    {getFieldDecorator('sport')(
                      <SmartInput notEditableOnly={true}/>
                    )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      label="口味轻重"
                      labelCol={{ span: 6 }}
                      wrapperCol={{ span: 18 }}

                    >
                    {getFieldDecorator('taste')(
                      <SmartInput notEditableOnly={true}/>
                    )}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={20}>
                  <Col span={12}>
                    <FormItem
                      label="日饮酒量"
                      {...formItemLayout}

                    >
                    {getFieldDecorator('drink')(
                      <SmartInput notEditableOnly={true}/>
                    )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      label="日吸烟量（支/天）"
                      labelCol={{ span: 6 }}
                      wrapperCol={{ span: 18 }}

                    >
                    {getFieldDecorator('smoke')(
                      <SmartInput notEditableOnly={true}/>
                    )}
                    </FormItem>
                  </Col>
                </Row>
              </div>
            </div>
            <PersonalHistory {...this.props} hospitalId={this.state.hospitalId} />
            <ComplicationHistory {...this.props} hospitalId={this.state.hospitalId} />
            <FamilyHistory {...this.props } hospitalId={this.state.hospitalId}/>
          </div>
        </Spin>
        {
          editStatus
          ?
            <Row>
              <Col>
                  {
                      this.props.disableAffix ?
                      <div className='block' style={styles.foot}>
                        <Button loading={ this.props.customerDetailsMedicalRecord.putMedicalRecordResult.status === 'pending' } onClick={this.handleSubmit.bind(this)} type='primary'>保存</Button>
                        <Button style={{marginLeft: 10}}
                          onClick={ () => {
                            this.props.setEditStatusAction(false)
                            this.props.form.resetFields()
                          }}
                          className='cancelButton'
                        >取消</Button>
                      </div>
                      :
                      <Affix offsetBottom={0} ref={affix => affix && affix.updatePosition({})}>
                          <div className='block' style={styles.foot}>
                            <Button loading={ this.props.customerDetailsMedicalRecord.putMedicalRecordResult.status === 'pending' } onClick={this.handleSubmit.bind(this)} type='primary'>保存</Button>
                            <Button style={{marginLeft: 10}}
                              onClick={ () => {
                                this.props.setEditStatusAction(false)
                                this.props.form.resetFields()
                              }}
                              className='cancelButton'
                            >取消</Button>
                          </div>
                       </Affix>
                   }
              </Col>
            </Row>
          :
            null
        }
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
})(HealthRecords)

function select (state) {
  return {
    customerDetailsMedicalRecord: state.customerDetailsMedicalRecord
  }
}

function mapDispachToProps (dispatch) {
  return bindActionCreators( { getUserInfoAction,getFormalPatientAction, getPotentialPatientAction,renewFormDataAction, setEditStatusAction, getMedicalRecord, putMedicalRecord }, dispatch)
}

export default connect(select, mapDispachToProps)(MedicalRecordForm)
