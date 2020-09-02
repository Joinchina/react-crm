import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Form, InputNumber, Input, AutoComplete, Select } from 'antd'
import message from '@wanhu/antd-legacy/lib/message'
const FormItem = Form.Item

import SmartInput from '../common/SmartInput'
import SmartSelectForMedicine from '../common/SmartSelectForMedicine'
import SmartInputNumber  from '../common/SmartInputNumber'

const Option = Select.Option

export default class AddCustomerMedicineRow extends Component {
  constructor(props){
    super(props)
    this.state = {
      editStatus: true,
      notEditableOnly: false,
      packageUnit: ''
    }
    this.asyncResultId = "AddCustomerMedicineRow_" + props.k
    this.asyncResult = []
  }

  handleChange(...args){
    this.props.handleChange(...args)
  }

  componentWillMount(){
    const { getFieldDecorator } = this.props.form
    getFieldDecorator(`medicine_${this.props.k}_data`, null)
  }

  onSelect(key, data, option){
    this.setState({ isSelect: true })
    const { setFieldsValue, getFieldValue, resetFields } = this.props.form
    let value = JSON.parse(data)

    let medicineKeys = getFieldValue('medicineKeys')
    for( let k in medicineKeys){
      let drug = getFieldValue(`medicine_${medicineKeys[k]}_data`)
      if(drug && drug.baseDrugId == value.baseDrugId){
        let productName = drug.productName ? `(${drug.productName})` : ''
        message.warning(`${drug.commonName}${productName} 已存在`)
        this.props.handleChange(key, 'name', '')
        setTimeout(()=>{
          resetFields([`medicine_${key}_name`])
        }, 10)
        return
      }
    }
    const { k } = this.props
    let newFieldsData = {}
    newFieldsData[`medicine_${k}_data`] = value
    newFieldsData[`medicine_${k}_name`] = value.commonName
    newFieldsData[`medicine_${k}_standard`] = value.preparationUnit + '*' + value.packageSize + value.minimumUnit + '/' + value.packageUnit
    newFieldsData[`medicine_${k}_company`] = value.producerName
    if(value){
      newFieldsData[`medicine_${k}_dosage`] = 1
    }
    setFieldsValue(newFieldsData)
    this.setState({
      //packageUnit:value.packageUnit != '未知' ? value.packageUnit : '',
      packageUnit:value.packageUnit,
      editStatus: false,
      notEditableOnly: true
    })
  }

  onBlur = () => {
    if (this.props.value) {
      this.setState({ isBlur: true })
    }
  }

  asyncMapResultToState = asyncResult => {
    this.asyncResult = asyncResult
  }

  checkMedicineName = (rule, value, callback) => {
    try{
      value = JSON.parse(value)
      if(typeof value === 'object'){
        value = value.commonName
      }else{
        value = String(value)
      }
    }catch(e){
      // 这时候value是个字符串
    }
    value = String(value)
    if(value.length > 100){
      callback('最多输入100个字符')
    }else{
      callback()
    }
  }

  render() {
    const { k, index, form } = this.props
    const { getFieldDecorator } = form
    const fieldName = `medicine_${k}_name`
    let required = this.props.listLength - 1 == index ? false : true
    return (
      <tr >
        <td width={150}>
          <FormItem
            label=''
          >
            {getFieldDecorator(fieldName, {
              initialValue: '',
              rules: [
                { required, message: '不能为空' },
                {validator: this.checkMedicineName}
              ]
            })(
              <SmartSelectForMedicine
                uuid={k}
                placeholder="阿司匹林/ASPL"
                disabled={ this.props.hospitalId ? false : true }
                style={{width: '100%'}}
                delay={true}
                source='medicineRequirement'
                hospitalId={this.props.hospitalId}
                editStatus={this.state.editStatus}
                notEditableOnly={this.state.notEditableOnly}
                handleNameChange={this.props.handleChange}
                onSelect={this.onSelect.bind(this, k)}
                onBlur={this.onBlur}
              />
            )}
          </FormItem>
        </td>

        <td>
          <FormItem
            label=''
          >
            {getFieldDecorator(`medicine_${k}_standard`, {
              rules: [
                { max: 100, message: '不能多于100个字符'},
              ],
            })(
              <SmartInput
                editStatus={false}
                disabled={ this.props.hospitalId ? false : true }
                notEditableOnly={true}
                hideBottomLine={true}
                onChange={this.handleChange.bind(this, k, 'standard')}
                placeholder="请输入规格"
                maxLength='100'
              />
            )}
          </FormItem>
        </td>

        <td>
          <FormItem
            label=''
          >
            {getFieldDecorator(`medicine_${k}_company`, {
              rules: [
                { max: 100, message: '不能多于100个字符'},
              ],
            })(
              <SmartInput
                editStatus={false}
                //disabled={ this.props.hospitalId ? false : true }
                notEditableOnly={true}
                hideBottomLine={true}
                onChange={this.handleChange.bind(this, k, 'company')}
                placeholder="请输入生产企业"
                maxLength='100'
              />
            )}
          </FormItem>
        </td>

        <td>
          {this.state.isSelect ?
          <FormItem
            label=''
          >
            {getFieldDecorator(`medicine_${k}_dosage`, {
                rules: [{required: true, message: '不能为空'}],
                initialValue: 1
            })(

              <SmartInputNumber
                editStatus={true}
                hideBottomLine={true}
                disabled={ this.props.hospitalId ? false : true }
                min={1}
                max={999}
                placeholder="请输入用量"
                onChange={this.handleChange.bind(this, k, 'dosage')}
                text={this.state.packageUnit}
                maxLength='3'
                parser={(value)=> {
                  value = parseInt(value, 10)
                  return isNaN(value) ? '' : value
                }}
              />

            )}
          </FormItem>:
          <span></span>
          }
        </td>
        <td>
          {this.state.isSelect || this.state.isBlur ?<FormItem
            label=''
          >
            {getFieldDecorator(`medicine_${k}_useStatus`, {
                rules: [{required: true, message: '不能为空'}],
            })(
             <Select placeholder="请选择使用状态">
               <Option key='1' title="使用中">使用中</Option>
               <Option key='2' title="已停用">已停用</Option>
             </Select>
            )}
          </FormItem> : null}
        </td>
        {this.props.showCreateDateField ? <td></td> : null}

        <td>
          <div style={{display: this.props.listLength - 1 == index ? 'none' : ''}}>
            <FormItem>
              {/* this.props.editAndCancel && !this.state.editStatus && <a onClick={() => this.props.removeRow(this.props.k)}>编辑</a> */}
              <a onClick={() => this.props.removeRow(this.props.k)}>删除</a>
            </FormItem>
          </div>
        </td>

      </tr>
    )
  }
}
