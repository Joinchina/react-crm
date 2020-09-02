import React, { Component } from 'react'
import { Checkbox, Form, Input, Select } from 'antd'
const CheckboxGroup = Checkbox.Group
const Option = Select.Option
const FormItem = Form.Item

export default class AddCustomerContact extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
    this.uuid = 0
    this.form = props.form
  }

  componentWillMount(){
    const { getFieldDecorator } = this.form
    getFieldDecorator('contactKeys', { initialValue: [this.uuid] })
  }

  handleGuardianChange(fieldName, value){
    //console.log('-----------checkBoxValue', value)
    //e.stopPropagation()
    const selected = value.length
    if(!selected){
      return
    }
    let contactKeys = [...this.form.getFieldValue('contactKeys')]
    contactKeys.pop()
    let fieldsForReset = []
    contactKeys.forEach(k => {
      let name = `contact_${k}_isGuardian`
      if(fieldName !== name){
        fieldsForReset.push(name)
      }
    })
    //console.log('-----------fieldsForReset', fieldsForReset)
    this.form.resetFields(fieldsForReset)
  }

  handleChange(k, type, value){
    const { getFieldValue, setFieldsValue } = this.form
    let contactKeys = [...getFieldValue('contactKeys')]
    let lastKey = contactKeys.pop()
    let newContactkeys = contactKeys.filter((element, index, array)=>{
      if(( k == element && type === 'gender' ? value : getFieldValue(`contact_${element}_gender`))
        || ( k == element && type === 'relation' ? value : getFieldValue(`contact_${element}_relation`))
        || ( k == element && type === 'phone' && value ? value.target.value : getFieldValue(`contact_${element}_phone`))
        || ( k == element && type === 'name' && value ? value.target.value : getFieldValue(`contact_${element}_name`))
      )return true
      return false
    })

    const lastGenderValue = k == lastKey && type === 'gender' ? value : getFieldValue(`contact_${lastKey}_gender`)
    const lastRelationValue = k == lastKey && type === 'relation' ? value : getFieldValue(`contact_${lastKey}_relation`)
    const lastMachineNumberValue = k == lastKey && type === 'phone' ? value.target.value : getFieldValue(`contact_${lastKey}_phone`)
    const lastNameValue = k == lastKey && type === 'name' ? value.target.value : getFieldValue(`contact_${lastKey}_name`)
    if( lastGenderValue || lastRelationValue || lastMachineNumberValue || lastNameValue ){
      newContactkeys.push(lastKey)
      // 重置最后一行
      let fieldsDataForReset = {}
      fieldsDataForReset[`contact_${lastKey}_gender`] = lastGenderValue
      fieldsDataForReset[`contact_${lastKey}_relation`] = lastRelationValue
      fieldsDataForReset[`contact_${lastKey}_phone`] = lastMachineNumberValue
      fieldsDataForReset[`contact_${lastKey}_name`] = lastNameValue
      setFieldsValue(fieldsDataForReset)
      newContactkeys.push(++this.uuid)
    }else{
      newContactkeys.push(++this.uuid)
    }
    setFieldsValue({contactKeys: newContactkeys})
  }

  remove(k){
    // can use data-binding to get
    const contactKeys = this.form.getFieldValue('contactKeys')
    // We need at least one passenger
    if (contactKeys.length === 1) {
      return
    }

    // can use data-binding to set
    this.form.setFieldsValue({
      contactKeys: contactKeys.filter(key => key != k),
    })
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.form
    const contactKeys = getFieldValue('contactKeys')
    const formItems = contactKeys.map((k, index) => {
      let required = contactKeys.length - 1 == index ? false : true
      //console.log('--------required', required)
      return (
        <tr key={k}>
          <td style={{verticalAlign: 'top'}}>
            <FormItem
              label=''
              required={false}
            >
              {getFieldDecorator(`contact_${k}_name`, {
                rules: [
                  {required: required, message: '不能为空'},
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
              required={false}
            >
              {getFieldDecorator(`contact_${k}_gender`, {
              })(
                <Select
                  placeholder='请选择'
                  onChange={this.handleChange.bind(this, k, 'gender')}
                  getPopupContainer={()=> {
                    //console.log('-----------', this.props.uuid)
                    return document.getElementById(this.props.uuid)
                  }
                  }
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
              required={false}
            >
              {getFieldDecorator(`contact_${k}_relation`, {
                rules:[
                  {required: required, message: '不能为空'},
                ]
              })(
                <Select
                  placeholder='请选择'
                  onChange={this.handleChange.bind(this, k, 'relation')}
                  getPopupContainer={()=> document.getElementById(this.props.uuid)}
                >
                  <Option value='1'>子女</Option>
                  <Option value='2'>兄弟姐妹</Option>
                  <Option value='3'>父母</Option>
                  <Option value='4'>配偶</Option>
                  <Option value='5'>亲友</Option>
                  <Option value='6'>其他</Option>
                </Select>
              )}
            </FormItem>
          </td>

          <td style={{verticalAlign: 'top'}}>
            <FormItem
              label=''
              required={false}
            >
              {getFieldDecorator(`contact_${k}_phone`, {
                rules: [
                  {required: required, message: '不能为空'},
                  {max: 16, message: '不能多于16个字符'},
                  {pattern: /^\d*$|^\d(\d|\-(?=\d))*$/g, message: '请输入正确的联系方式'},
                ],
              })(
                <Input
                  onChange={this.handleChange.bind(this, k, 'phone')}
                  placeholder="联系方式"
                  maxLength='16'
                />
              )}
            </FormItem>
          </td>

          <td style={{verticalAlign: 'top'}} style={{display: contactKeys.length - 1 == index ? 'none' : ''}}>
            <FormItem
              label=''
              required={false}
            >
              {getFieldDecorator(`contact_${k}_isGuardian`, {
              })(
                <CheckboxGroup
                  onChange={this.handleGuardianChange.bind(this, 'contact_' + k + '_isGuardian')}
                >
                  <Checkbox value='1'/>
                </CheckboxGroup>
              )}
            </FormItem>
          </td>

          <td style={{verticalAlign: 'top'}}>
            <div>
              <div style={{display: contactKeys.length - 1 == index ? 'none' : ''}}>
                <FormItem>
                  <a onClick={this.remove.bind(this, k)}>删除</a>
                </FormItem>
              </div>
            </div>
          </td>

        </tr>
      )
    })

    const styles = this.getStyles()
    return (
      <div id={this.props.uuid} className='form-table-box block' id='addCustomerContact' style={{marginBottom: 30}}>
        <table>
          <thead>
            <tr>
              <th>姓名</th>
              <th width='100'>性别</th>
              <th width='100'>关系</th>
              <th>联系方式</th>
              <th>监护人</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {formItems}
          </tbody>
        </table>
      </div>
    )
  }

  getStyles (options) {
    return {
    }
  }

}
