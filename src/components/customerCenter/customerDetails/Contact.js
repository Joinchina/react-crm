import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Spin, Affix, Checkbox, Button, InputNumber, DatePicker, Form, Input, Row, Col, Select, Modal, notification } from 'antd'
const CheckboxGroup = Checkbox.Group
import IDValidator from 'id-validator'
const Option = Select.Option
const FormItem = Form.Item
import AlertError from '../../common/AlertError'

import { renewFormDataAction, putPatientContactAction, getPatientContactAction, setEditStatusAction } from '../../../states/customerCenter/contact'
import NotEditableField from '../../common/NotEditableField'
import { testPermission } from '../../common/HasPermission'

class Contact extends Component{
  constructor(props) {
    super(props)
    this.state = {
    }
    this.uuid = 0
    this.form = props.form
  }

  componentDidMount(){
    this.props.getPatientContactAction(this.props.patientId)
  }

  componentWillMount(){
    const { getFieldDecorator } = this.form
    getFieldDecorator('contactKeys', { initialValue: [this.uuid] })
  }

  componentWillReceiveProps(nextProps){

    if(this.props.customerDetailsContact.editStatus != nextProps.customerDetailsContact.editStatus && nextProps.customerDetailsContact.editStatus){
      let getContactResult = nextProps.customerDetailsContact.getContactResult
      if(getContactResult.payload && Array.isArray(getContactResult.payload.list)){
        const { getFieldDecorator, setFieldsValue } = this.form
        let newContactkeys = []
        getContactResult.payload.list.map((row, index) => {
          let uuid = ++this.uuid
          newContactkeys.push(uuid)
          getFieldDecorator(`contact_${uuid}_name`, { initialValue: row.name })
          let gender
          if(row.sex != '1' && row.sex != '0'){
            gender = undefined
          }else{
            gender = String(row.sex)
          }
          getFieldDecorator(`contact_${uuid}_gender`, { initialValue: gender })
          getFieldDecorator(`contact_${uuid}_relation`, { initialValue: String(row.relation) })
          getFieldDecorator(`contact_${uuid}_machineNumber`, { initialValue: row.machineNumber })
          let isDefault = row.isDefault != '0' ? ['1'] : undefined
          getFieldDecorator(`contact_${uuid}_isDefault`, { initialValue: isDefault})
          getFieldDecorator(`contact_${uuid}_id`, { initialValue: row.id })
        })
        newContactkeys.push(++this.uuid)
        setFieldsValue({contactKeys: newContactkeys})
      }
    }

    if(this.props.customerDetailsContact.putContactResult != nextProps.customerDetailsContact.putContactResult){
      if(nextProps.customerDetailsContact.putContactResult.status === 'fulfilled'){
        this.uuid = 0
        this.props.setEditStatusAction(false)
        this.props.form.resetFields()
        this.props.getPatientContactAction(this.props.patientId)
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
      //console.log('form data before:', values)
      const { getFieldValue } = this.form
      let contactKeys = [...getFieldValue('contactKeys')]
      contactKeys.pop()
      let contacts = []
      if(contactKeys.length){
        contacts = contactKeys.map( v => {
          let isDefault = getFieldValue(`contact_${v}_isDefault`)
          let data = { patientId: {id: this.props.patientId} }
          data.name = getFieldValue(`contact_${v}_name`)
          data.id = getFieldValue(`contact_${v}_id`)
          data.sex = getFieldValue(`contact_${v}_gender`)
          data.relation = getFieldValue(`contact_${v}_relation`)
          data.machineNumber = getFieldValue(`contact_${v}_machineNumber`)
          data.isDefault = Array.isArray(isDefault) && isDefault.length ? 1 : 0
          return data
        })
      }
      let dataForPost = {data: JSON.stringify(contacts)}
      this.props.putPatientContactAction(this.props.patientId, dataForPost)
    })
  }

  handleChange(k, type, value){
    const { getFieldValue, setFieldsValue } = this.form
    let contactKeys = [...getFieldValue('contactKeys')]
    let lastKey = contactKeys.pop()
    let newContactkeys = contactKeys.filter((element, index, array)=>{
      if(( k == element && type === 'gender' ? value : getFieldValue(`contact_${element}_gender`))
        || ( k == element && type === 'relation' ? value : getFieldValue(`contact_${element}_relation`))
        || ( k == element && type === 'machineNumber' && value ? value.target.value : getFieldValue(`contact_${element}_machineNumber`))
        || ( k == element && type === 'name' && value ? value.target.value : getFieldValue(`contact_${element}_name`))
      )return true
      return false
    })

    const lastGenderValue = k == lastKey && type === 'gender' ? value : getFieldValue(`contact_${lastKey}_gender`)
    const lastRelationValue = k == lastKey && type === 'relation' ? value : getFieldValue(`contact_${lastKey}_relation`)
    const lastMachineNumberValue = k == lastKey && type === 'machineNumber' ? value.target.value : getFieldValue(`contact_${lastKey}_machineNumber`)
    const lastNameValue = k == lastKey && type === 'name' ? value.target.value : getFieldValue(`contact_${lastKey}_name`)
    if( lastGenderValue || lastRelationValue || lastMachineNumberValue || lastNameValue ){
      newContactkeys.push(lastKey)
      // 重置最后一行
      let fieldsDataForReset = {}
      fieldsDataForReset[`contact_${lastKey}_gender`] = lastGenderValue
      fieldsDataForReset[`contact_${lastKey}_relation`] = lastRelationValue
      fieldsDataForReset[`contact_${lastKey}_machineNumber`] = lastMachineNumberValue
      fieldsDataForReset[`contact_${lastKey}_name`] = lastNameValue
      setFieldsValue(fieldsDataForReset)
      newContactkeys.push(++this.uuid)
    }else{
      newContactkeys.push(++this.uuid)
    }
    setFieldsValue({contactKeys: newContactkeys})
  }

  handleGuardianChange(k, value){
    const selected = value.length
    if(!selected){
      return
    }
    let contactKeys = [...this.form.getFieldValue('contactKeys')]
    contactKeys.pop()
    let fieldsForReset = {}
    contactKeys.forEach(key => {
      if(key != k){
        fieldsForReset[`contact_${key}_isDefault`] = []
      }
    })
    this.form.setFieldsValue(fieldsForReset)
  }

  removeContact(k){
    // can use data-binding to get
    const contactKeys = this.form.getFieldValue('contactKeys')
    // We need at least one passenger
    if (contactKeys.length === 1) {
      return
    }

    // can use data-binding to set
    this.form.setFieldsValue({
      contactKeys: contactKeys.filter(key => key !== k),
    })
  }

  getEditebleRow() {
    const { getFieldDecorator, getFieldValue } = this.form
    const contactKeys = getFieldValue('contactKeys')
    return contactKeys.map((k, index) => {
      let required = contactKeys.length - 1 == index ? false : true
      //console.log('--------length-----index:', `${contactKeys.length - 1}  ${index}`)
      getFieldDecorator(`contact_${k}_id`)
      return (
        <tr key={k}>
          <td style={{verticalAlign: 'top'}}>
            <FormItem
              label=''
            >
              {getFieldDecorator(`contact_${k}_name`, {
                rules: [
                  {required, message: '不能为空'},
                  {max: 20, message: '不能多于20个字符'},
                ],
              })(
                <Input
                  onChange={this.handleChange.bind(this, k, 'name')}
                  placeholder="请输入姓名"
                  maxLength='20'
                />
              )}
            </FormItem>
          </td>

          <td style={{verticalAlign: 'top'}}>
            <FormItem
              label=''
            >
              {getFieldDecorator(`contact_${k}_gender`, {
                rules: [
                ],
              })(
                <Select
                  onChange={this.handleChange.bind(this, k, 'gender')}
                  style={{width: 120}}
                  placeholder='请选择'
                >
                  <Option value='1'>男</Option>
                  <Option value='0'>女</Option>
                </Select>
              )}

            </FormItem>
          </td>

          <td style={{verticalAlign: 'top'}}>
            <FormItem
              label=''
            >
              {getFieldDecorator(`contact_${k}_relation`, {
                rules:[
                  {required, message: '不能为空'},
                ]
              })(
                <Select
                  onChange={this.handleChange.bind(this, k, 'relation')}
                  style={{width: 120}}
                  placeholder='请选择'
                >
                  <Option value='1'>子女</Option>
                  <Option value='2'>兄弟姐妹</Option>
                  <Option value='3'>父母</Option>
                  <Option value='4'>配偶</Option>
                  <Option value='5'>亲友</Option>
                  <Option value='6'>其它</Option>
                </Select>
              )}
            </FormItem>
          </td>

          <td style={{verticalAlign: 'top'}}>
            <FormItem
              label=''
            >
              {getFieldDecorator(`contact_${k}_machineNumber`, {
                rules: [
                  {required: required, message: '不能为空'},
                  {max: 16, message: '不能多于16个字符'},
                  //{pattern: /^\d*$|^\d+-\d+$/g, message: '请输入正确的联系方式'},
                  {pattern: /^\d*$|^\d(\d|\-(?=\d))*$/g, message: '请输入正确的联系方式'},
                ],
              })(
                <Input
                  onChange={this.handleChange.bind(this, k, 'machineNumber')}
                  placeholder="联系方式"
                  maxLength='16'
                />
              )}
            </FormItem>
          </td>

          <td style={{verticalAlign: 'top'}}>
            {contactKeys.length - 1 != index
            ?
              <FormItem
                label=''
              >
                {getFieldDecorator(`contact_${k}_isDefault`, {
                })(
                    <CheckboxGroup
                      onChange={this.handleGuardianChange.bind(this, 'contact_' + k + '_isDefault')}
                    >
                      <Checkbox value='1'/>
                    </CheckboxGroup>
                )}
              </FormItem>
            :
              null
            }
          </td>

          <td style={{verticalAlign: 'top'}}>
            {contactKeys.length - 1 != index
            ?
              <div>
                <FormItem>
                  <a onClick={this.removeContact.bind(this, k)}>删除</a>
                </FormItem>
              </div>
            :
              null
            }
          </td>

        </tr>
      )
    })
  }

  get permission() {
    let data = this.props.customerDetailsContact.getContactResult.status === 'fulfilled' && this.props.customerDetailsContact.getContactResult.payload;
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

  render() {
    let editStatus = this.props.customerDetailsContact.editStatus
    const formItems = editStatus ? this.getEditebleRow() : null
    let trs = [], noDataTr
    let relationMap = {
      '1': '子女',
      '2': '兄弟姐妹',
      '3': '父母',
      '4': '配偶',
      '5': '亲友',
      '6': '其它',
    }
    if(!editStatus && this.props.customerDetailsContact.getContactResult.payload && Array.isArray(this.props.customerDetailsContact.getContactResult.payload.list)){
      trs = this.props.customerDetailsContact.getContactResult.payload.list.map((row, index) => {
        let gender
        if(row.sex == '1'){
          gender = '男'
        }else if(row.sex == '0'){
          gender = '女'
        }else{
          gender = ''
        }
        return (
          <tr key={'uu' + index}>
          <td>{row.name}</td>
            <td>{gender}</td>
            <td>{relationMap[row.relation]}</td>
            <td>{row.machineNumber}</td>
            <td>{row.isDefault == 1 ? '是' : '否'}</td>
            { editStatus ? <td></td> : null }
          </tr>
        )
      })
      if(!editStatus && trs.length === 0 && this.props.customerDetailsContact.getContactResult.status !== 'pending'){
        noDataTr = <tr><td colSpan='10'>暂无数据</td></tr>
      }
    }
    let styles = this.styles()
    return (
      <div className='form-table-box block' id='customerDetailsContact' style={{marginBottom: 30}}>
        <AlertError {...this.props.customerDetailsContact.getContactResult} />
        <AlertError {...this.props.customerDetailsContact.putContactResult} />
        <NotEditableField
          editStatus={editStatus}
          notEditableOnly={this.permission || editStatus}
          switchState={()=>this.props.setEditStatusAction(true)}
        />
        <Spin
          spinning={this.props.customerDetailsContact.getContactResult.status === 'pending'}
        >
          <table>
            <thead>
              <tr>
                <th>姓名</th>
                <th>性别</th>
                <th>关系</th>
                <th>联系方式</th>
                <th>监护人</th>
                { editStatus ? <th>操作</th> : null }
              </tr>
            </thead>
            <tbody>
              {formItems}
              {trs}
              {noDataTr}
            </tbody>
          </table>
        </Spin>
        {
          editStatus
          ?
            <Row>
              <Col>
                <Affix offsetBottom={0} ref={affix => affix && affix.updatePosition({})}>
                  <div className='block' style={styles.foot}>
                    <Button loading={ this.props.customerDetailsContact.putContactResult.status === 'pending' } onClick={this.handleSubmit.bind(this)} type='primary'>保存</Button>
                    <Button style={{marginLeft: 10}} onClick={ () => this.props.setEditStatusAction(false) } className='cancelButton'>取消</Button>
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

const ContactForm = Form.create({
  mapPropsToFields(props){
    return {...props.customerDetailsContact.formData}
  },
  onFieldsChange(props, fields){
    //console.log('--------------', props)
    props.renewFormDataAction(fields)
  }
})(Contact)

function select(state){
  return {customerDetailsContact: state.customerDetailsContact}
}

function mapDispachToProps(dispatch){
  return bindActionCreators( { renewFormDataAction,getPatientContactAction, putPatientContactAction, setEditStatusAction }, dispatch)
}

export default connect(select, mapDispachToProps)(ContactForm)
