import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Breadcrumb, Row, Col, Form, Affix, Button } from 'antd'
import message from '@wanhu/antd-legacy/lib/message'
import Title from '../../common/Title'

import SmartInput from '../../common/SmartInput'
import { renewMemberInfoForm, resetMemberInfoForm } from '../../../states/customerCenter/memberInfoForm'
import BaseComponent from '../../BaseComponent'
import { isLagel } from '../../../helpers/checkDataType'
import SmartSelectBox from '../../common/SmartSelectBox'
import { patientAction, updatePatientStatusAction, checkAccountNoAction, checkMemberCardAction, resetCustomerDetails } from '../../../states/customerCenter/customerDetails'
import AlertError, { alertError } from '../../common/AlertError'

import {checkAccountNo,checkMemberCard} from '../../../api'
import context from '../../../api/contextCreator'
import { testPermission } from '../../common/HasPermission'

import { ViewOrEdit } from '../../common/form';
import PatientBindInfo from '../../weixin/PatientBindInfo';

const FormItem = Form.Item
class MemberInfor extends BaseComponent {

  constructor(props) {
    super(props)
    this.state = {
      formData:{},
      editStatus: false
    }
    this.customerId = props.customerId
    this.isShow = props.source === 'customerDetails'
  }

  componentDidMount (props, state) {
    this.props.patientAction(this.customerId)
  }

  componentWillUnmount () {
    this.props.resetCustomerDetails()
    this.props.resetMemberInfoForm()
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.customerDetails.checkMemberCard != nextProps.customerDetails.checkMemberCard && nextProps.customerDetails.checkMemberCard.status === 'rejected'){
      if(nextProps.customerDetails.checkMemberCard.payload){
        if(nextProps.customerDetails.checkMemberCard.payload.code === 105){
          let accountNo = this.props.form.getFieldValue('accountNo')
          this.props.form.setFields({accountNo:{value:accountNo, errors:['会员卡号已被使用']}})
        }else if(nextProps.customerDetails.checkMemberCard.payload.code === 106 || nextProps.customerDetails.checkMemberCard.payload.code === 206){
          let accountNo = this.props.form.getFieldValue('accountNo')
          this.props.form.setFields({accountNo:{value:accountNo, errors:['请输入正确的会员卡号']}})
        }
      }
    }
    if(this.props.customerDetails.postResult && this.props.customerDetails.postResult != nextProps.customerDetails.postResult && nextProps.customerDetails.postResult && nextProps.customerDetails.postResult.status === 'fulfilled'){
      this.props.patientAction(this.customerId)
      this.setState({
        editStatus: false
      })
    }
  }

  switchState = () => { this.setState({editStatus: !this.state.editStatus}) }

  async checkAccountNoFun (values) {
    try{
      let accountNo
      let { data } = this.result('customerDetails')
      data = isLagel(data)
      const accountInfo = isLagel(data.accountInfo)
      let before = accountInfo.accountNo
      if(before !== values.accountNo){
        accountNo = await checkMemberCard(context(), values.accountNo)
      }
      if(accountNo && (accountNo.code !==0)){
        return false
      }else{
        return true
      }
   }catch(e){
     if(e.code === 105 || e.code ===106 || e.code ===206){
       return false
     }else{
       alertError({
           status: e.status,
           code: e.code,
           message: e.message
       })
       console.error(e)
     }
   }
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      this.checkAccountNoFun(values).then(
        (res) => {
          if (res && !err) {
            this.update(values)
          }
        },
        (res) => {
          message.error(res)
        }
      )
    })
  }

  handleCancel = (e) => {
    e.preventDefault()
    this.setState({
      editStatus: false
    },() => this.props.form.resetFields())
  }

  update (params) {
    const checkUndefined = (data) => {
      if(data === undefined || data === null){
        return ''
      }
      return data
    }
    const checkArray = (data, index = 0) => {
      if(Array.isArray(data)){
        return checkUndefined(data[index])
      }
      return ''
    }
    const data = {
      accountNo: checkUndefined(params.accountNo),
      status: parseInt(checkArray(params.disabled), 10)
    }
    if(this.isShow){
      this.props.updatePatientStatusAction(this.customerId, data)
    }else{

    }
  }

  checkAccountNo = (rule, value, callback) => {
    let { data } = this.result('customerDetails')
    data = isLagel(data)
    const accountInfo = isLagel(data.accountInfo)
    let before = accountInfo.accountNo
    if(before === value){
      callback()
      return
    }
    if(value){
      this.props.checkMemberCardAction(value)
    }
    callback()
  }

  get permission () {
    let { data } = super.result('customerDetails')
    data = isLagel(data)
    return !data.isEdit
    /*
    const res = testPermission({
      $any: [
           'patient.edit',
           'patient.admin'
       ]
    })
    return !res
    */
  }

  render () {
    let { data } = super.result('customerDetails')
    data = isLagel(data)

    const accountInfo = isLagel(data.accountInfo)
    const styles = this.styles()
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    }
    const { getFieldDecorator } = this.props.form
    const mapPropsToFormItems = {
      switchState:this.switchState,
      editStatus:this.state.editStatus,
      notEditableOnly: this.permission
    }
    let status = []
    if(data.status === 1){
      status = ['1']
    }
    if(data.status === 0){
      status = ['0']
    }
    return (
      <div>
      <div className='block'>
        <div style={styles.box}>
        <Row gutter={20}>
          <Col span={12}>
            <FormItem
              label="会员卡号"
              {...formItemLayout}
            >
              {getFieldDecorator('accountNo',
                {
                  initialValue: accountInfo.accountNo,
                  validateTrigger: 'onBlur',
                  rules: [
                    {required: true, message: '不能为空'},
                    {pattern: /^\d*$/, message: '请输入正确的会员卡号'},
                    {validator: this.checkAccountNo}
                  ],
                })(
                  <SmartInput
                    {...mapPropsToFormItems}
                    placeholder=""
                    maxLength='17'
                  />
                )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label="账户状态"
              {...formItemLayout}
            >
              {getFieldDecorator('disabled',
                {
                  initialValue: status,
                  rules: [{required: true, message: '不能为空'}],
                })(
                  <SmartSelectBox
                    {...mapPropsToFormItems}
                    buttonOptions={
                      [
                        {id: '0', name: '正常'},
                        {id: '1', name: '禁用'}
                      ]
                    }
                  />
                )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={20}>
          <Col span={12}>
            <FormItem
              label="注册时间"
              {...formItemLayout}
            >
              {getFieldDecorator('SmartInputCreateDate',
                {
                  initialValue: data.createDate,
                  rules: [
                    ],
                })(
                  <SmartInput
                    {...mapPropsToFormItems}
                    placeholder=""
                    notEditableOnly={true}
                  />
                )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label="注册方式"
              {...formItemLayout}
            >
              {getFieldDecorator('SmartInputRegisterSource',
                {
                  initialValue: data.registerSource,
                  rules: [
                    ],
                })(
                  <SmartInput
                    {...mapPropsToFormItems}
                    placeholder=""
                    notEditableOnly={true}
                  />
                )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={20}>
          <Col span={12}>
            <FormItem
              label="账户余额"
              {...formItemLayout}
            >
              {getFieldDecorator('SmartInputBalance',
                {
                  initialValue: parseInt(accountInfo.balance || 0, 10).toFixed(1),
                  rules: [
                    ],
                })(
                  <SmartInput
                    {...mapPropsToFormItems}
                    placeholder=""
                    notEditableOnly={true}
                  />
                )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label="账户积分"
              {...formItemLayout}
            >
              {getFieldDecorator('SmartInputCreditPints',
                {
                  initialValue: accountInfo.creditPints || 0,
                  rules: [
                    ],
                })(
                  <SmartInput
                    {...mapPropsToFormItems}
                    placeholder=""
                    notEditableOnly={true}
                  />
                )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label="创建人"
              {...formItemLayout}
            >
              {getFieldDecorator('createBy',
                {
                  initialValue: data.createBy,
                  rules: [
                    ],
                })(
                  <SmartInput
                    {...mapPropsToFormItems}
                    placeholder=""
                    notEditableOnly={true}
                  />
                )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label="微信名称"
              {...formItemLayout}
            >
                <ViewOrEdit editing={false} changeEditingDisabled
                    viewRenderer={() => <PatientBindInfo
                        patientId={this.props.customerId}
                        patientName={this.props.customerDetails.customerDetailData && this.props.customerDetails.customerDetailData.payload && this.props.customerDetails.customerDetailData.payload.name}
                        />}
                    />
            </FormItem>
          </Col>
        </Row>
        </div>
      </div>
      {
        this.state.editStatus ?
        <Row>
          <Col>
            <Affix offsetBottom={0} ref={affix => affix && affix.updatePosition({})}>
            <div className='block' style={styles.foot}>
              <Button style={styles.footBtn} loading={this.props.customerDetails.updateState === 'pending'}
                type="primary" onClick={this.handleSubmit}>保存</Button>
              <Button disabled={this.props.customerDetails.updateState === 'pending'}
                onClick={this.handleCancel} className='cancelButton'>取消</Button>
              <AlertError status={this.props.customerDetails.updateState} payload={this.props.customerDetails.updateResult}/>
            </div>
           </Affix>
          </Col>
        </Row>
        :
        null
      }
      </div>
    )
  }

  styles () {
    return {
      box:{
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
}

const Wrapper = Form.create({
  mapPropsToFields(props){
    return { ...props.memberInfoForm }
  },
  onFieldsChange(props, fields){
    props.renewMemberInfoForm(fields)
  }
})(MemberInfor)

function select (state) {
  return {
    params: state.routerReducer.location.state,
    memberInfoForm: state.memberInfoForm,
    customerDetails: state.customerDetails
  }
}

function mapDispachToProps (dispatch) {
  return bindActionCreators({ renewMemberInfoForm, patientAction, updatePatientStatusAction, checkAccountNoAction,
  checkMemberCardAction, resetCustomerDetails, resetMemberInfoForm }, dispatch)
}

export default connect(select, mapDispachToProps)(Wrapper)
