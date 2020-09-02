import React, { Component } from 'react'
import { Form, Row, Col, Tag} from 'antd'
import message from '@wanhu/antd-legacy/lib/message'
import SmartSelectBox from '../common/SmartSelectBox'
import SmartInputNumber  from '../common/SmartInputNumber'
import SmartSelectForMedicineWithNumber from '../common/SmartSelectForMedicineWithNumber'
import { centToYuan, refundRountCentPercentToCent } from '../../helpers/money'
const AmountFieldOptions = {
  rules: [
      { required: true, message:'不能为空' },
  ]
}
const FormItem = Form.Item

export default class AddMedicineRequirement extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
    this.uuid = 0
    this.form = props.form
  }

  componentWillMount(){
    const { getFieldDecorator } = this.form
    getFieldDecorator('medicineKeys', { initialValue: [] })
  }

  componentWillReceiveProps(nextProps){
    const { getFieldDecorator } = this.form
    getFieldDecorator('medicineKeys', { initialValue: [] })
  }

  removeRow = k => {
    // can use data-binding to get\
    const medicineKeys = this.form.getFieldValue('medicineKeys')
    // We need at least one passenger
    if (medicineKeys.length === 0) {
      return
    }
    //每次增减药品数量又删除时，此时值会存上，下次选择该药品应重置
    this.form.setFieldsValue({
      medicineKeys: medicineKeys.filter(key => key !== k),
      [`medicine_${k}_dosage`]: 1
    })
  }

  mapAsyncDataToOption = data => {
    const { getFieldDecorator } = this.props.form
    return data.map((row, index) => {
      let productName = row.productName ? `(${row.productName})` : ''
      let statusMap = {0: '正常', 2:'目录外', 3:'停售'}
      let status
      if(row.status > 1){
        status = <Tag style={{marginLeft: 5}} color='#e44d42'>{statusMap[row.status]}</Tag>
      }
      let priceCent = row.priceCent
      if(!priceCent){
        priceCent = 0
      }
      let price = row.priceCent ? `零售价：¥${centToYuan(priceCent, 2)}` : ''
      let whScale = priceCent ? `报销比例：${row.whScale}%` : ''
      let reimbursement
      if(row.priceCent){
        const actualPriceCent = priceCent - (priceCent * (row.whScale / 100.00));
        reimbursement = `报销价：¥${Math.round(actualPriceCent * 100 )/10000}`

      }
      return (
        <Option key={index} value={JSON.stringify(row)}>
          <Row gutter={5}>
            <Col span={6} style={{whiteSpace: 'normal'}}>
              <span>{row.commonName}{productName}{status}</span>
            </Col>
            <Col span={6} style={{whiteSpace: 'normal'}}>
              <p>{row.preparationUnit + '*' + row.packageSize + row.minimumUnit + '/' + row.packageUnit}</p>
              <p>{row.producerName}</p>
            </Col>
            <Col span={4}>{price}</Col>
            <Col span={4}>{whScale}</Col>
            <Col span={4}>{reimbursement}</Col>
          </Row>
        </Option>
      )
    })
  }

  handleMedicineSelect = (value, number) => {
    const { getFieldDecorator, getFieldValue, setFieldsValue } = this.props.form
    value = typeof value == 'object' ? value : JSON.parse(value)
    let uuid = value.baseDrugId
    let dataFieldName = `medicine_${uuid}_data`
    let dataFieldValue = getFieldValue(dataFieldName)
    let medicineKeys = getFieldValue('medicineKeys')
    if(medicineKeys.indexOf(uuid) !== -1){
      let productName = value.productName ? `(${value.productName})` : ''
      message.warning(`${value.commonName}${productName} 已存在`)
      return
    }
    this.addDrguToForm(value, number)
  }

  addDrguToForm = (value, number) => {
    let uuid = value.baseDrugId
    const { getFieldDecorator, getFieldValue, setFieldsValue, resetFields} = this.props.form
    let medicineKeys = getFieldValue('medicineKeys')
    setFieldsValue({medicineKeys: [...medicineKeys, uuid]})
    getFieldDecorator(`medicine_${uuid}_data`, {initialValue: value})
    getFieldDecorator(`medicine_${uuid}_dosage`, {
        ...AmountFieldOptions,
        initialValue: number<999?number:999
    })
    // 解决删除后重新添加同一药品表单值不正常问题
    resetFields([`medicine_${uuid}_amount`])
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.form
    const { isEstimatedPickup } = this.props;
    const medicineKeys = getFieldValue('medicineKeys')
    const formItems = medicineKeys.map((k, index) => {
      const medicineRowData = getFieldValue(`medicine_${k}_data`)
      if(!medicineRowData){
        return
      }
      let productName = medicineRowData.productName ? `(${medicineRowData.productName})` : ''
      let standard = medicineRowData.standard ? medicineRowData.standard : medicineRowData.preparationUnit + '*' + medicineRowData.packageSize + medicineRowData.minimumUnit + '/' + medicineRowData.packageUnit
      const isNotCatalogue = Boolean(medicineRowData.status === '2');
      return (
        <tbody key={k}>
          <tr>
            <td style={{color: isNotCatalogue ? 'red' : ''}}>{medicineRowData.commonName?medicineRowData.commonName:''}{productName}{status}</td>
            <td style={{color: isNotCatalogue ? 'red' : ''}}>{standard}</td>
            <td style={{color: isNotCatalogue ? 'red' : ''}}>{medicineRowData.producerName?medicineRowData.producerName:''}</td>

            <td>
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
                  placeholder="请输入用量"
                  min={1}
                  max={999}
                  maxLength='3'
                  parser={(value)=> {
                    value = parseInt(value, 10)
                    return isNaN(value) ? '' : value
                  }}
                  text={medicineRowData.packageUnit}
              />

                )}
              </FormItem>
            </td>
            <td>
            {
              isEstimatedPickup && medicineRowData.status === '0' ?
                <FormItem
                    label=""
                >
                    {getFieldDecorator(`medicine_${k}_isRegularMedication`,
                    {
                        rules: [{required: true, message: '不能为空'}],
                        initialValue: ['0']
                    })(
                        <SmartSelectBox
                        editStatus={true}
                        notEditableOnly={false}
                        buttonOptions={
                            [
                            {id: '1', name: '是'},
                            {id: '0', name: '否'}
                            ]
                        }
                        />
                    )}
                </FormItem>
                : null
            }
            </td>
            <td>
              <div>
                <FormItem>
                  <a onClick={() => this.removeRow(k)}>删除</a>
                </FormItem>
              </div>
            </td>

          </tr>
        </tbody>
      )
    })
    return (
      <div className='form-table-box block' id='addCustomerMedicine'>
        <table>
          <thead>
            <tr>
                <th width='25%'> 通用名（商品名）</th>
                <th width='12.5%'>规格</th>
                <th width='15%'>生产企业</th>
                <th width='25%'>单月用量(盒/瓶，包装单位)</th>
                <th width='15%'>{isEstimatedPickup === true ? '规律取药药品' : ''}</th>
                <th>操作</th>
            </tr>
          </thead>
          {formItems}
          <tbody>
            <tr>
              <td colSpan="50">
                <Col span={12}>
                  <SmartSelectForMedicineWithNumber
                    {...this.props}
                    editStatus={true}
                    uuid='AddCustomerMedication'
                    placeholder='阿司匹林/ASPL'
                    onSelect={this.handleMedicineSelect}
                    mapAsyncDataToOption={this.mapAsyncDataToOption}
                    mapValueToAutoComplete={value => {
                      try{
                        value = JSON.parse(value)
                        return typeof value == 'object' ? '' : String(value)
                      }catch(e){
                        return value
                      }
                    }}
                  />
                </Col>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

}
