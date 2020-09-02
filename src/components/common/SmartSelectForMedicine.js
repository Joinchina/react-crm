import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Tag, Row, Col, Input, AutoComplete } from 'antd'
const Option = AutoComplete.Option

import NotEditableField from './NotEditableField'

import { getMedicineAction, getThrottleMedicineAction } from '../../states/smartSelectForMedicine'

class SmartSelectForMedicine extends Component{
  constructor(pros){
    super()
    this.state = {
    }
  }

  handleChange = (value) => {
    this.setState({value})
    if(this.props.handleNameChange){
      this.props.handleNameChange( this.props.uuid, 'name', value)
    }
    const onChange = this.props.onChange
    if(onChange) {
      onChange(value)
    }

    try{
      value = JSON.parse(value)
      if(typeof value === 'object'){
        let productName = value.productName ? `(${value.productName})` : ''
        value = value.commonName + productName
      }else{
        value = String(value)
        this.send(value)
      }
    }catch(e){
      // 这时候value是个字符串
      this.send(value)
    }
  }

  send = (value) => {
    if(this.props.delay){
      this.props.getThrottleMedicineAction(value, 0, 10, this.props.hospitalId)
    }else{
      this.props.getMedicineAction(value, 0, 10, this.props.hospitalId, this.props.patientId)
    }
  }

  componentWillReceiveProps(nextProps){
    if('value' in nextProps){
      this.setState({value: nextProps.value})
    }
  }

  componentDidUpdate(){
    const fieldNode = document.getElementById(`medicine_${this.props.uuid}_name`)
    if(!fieldNode) return
    let optionsBox = fieldNode.getElementsByClassName('ant-select-dropdown-menu ant-select-dropdown-menu-vertical ant-select-dropdown-menu-root')[0]
    if(!optionsBox) return
    optionsBox.onscroll = ()=>{
      let height = optionsBox.scrollHeight
      let scrollTop = optionsBox.scrollTop
      let clientHeight = optionsBox.clientHeight
      if(scrollTop + clientHeight > height - 200 && this.props.smartSelectForMedicine.status != 'pending'){
        let keyWord = this.state.value
        let limit = this.props.smartSelectForMedicine.params.limit
        let skip = this.props.smartSelectForMedicine.params.skip + limit
        this.props.getMedicineAction(keyWord, skip, limit, this.props.hospitalId, this.props.patientId)
      }
    }
  }

  mapAsyncDataToOption = data => {
    return data.map((row, index) => {
      let productName = row.productName ? `(${row.productName})` : ''
      let statusMap = {0: '正常', 2:'目录外', 3:'停售'}
      let status
      if(row.status > 1){
        status = <Tag style={{marginLeft: 5}} color='#e44d42'>{statusMap[row.status]}</Tag>
      }
      return (
        <Option key={index} disabled={this.props.source === 'medicineRequirement' ? false : row.status > 1} value={JSON.stringify(row)}>
          <Row>
            <Col span={12} style={{whiteSpace: 'normal'}}>
              <span>{row.commonName}{productName}{status}</span>
            </Col>
            <Col span={12} style={{whiteSpace: 'normal'}}>
              <p>{row.preparationUnit + '*' + row.packageSize + row.minimumUnit + '/' + row.packageUnit}</p>
              <p>{row.producerName}</p>
            </Col>
          </Row>
        </Option>
      )
    })
  }

  render(){
    let { uuid, handleNameChange, editStatus, notEditableOnly, ...rest } = this.props
    let value = this.state.value
    if(this.props.mapValueToAutoComplete){
      value = this.props.mapValueToAutoComplete(value)
    }else{
      try{
        value = JSON.parse(value)
        if(typeof value === 'object'){
          let productName = value.productName ? `(${value.productName})` : ''
          value = value.commonName + productName
        }else{
          value = String(value)
        }
      }catch(e){
        // 这时候value是个字符串
      }
    }

    if(!editStatus || notEditableOnly === true){
      return (
        <NotEditableField
          editStatus={editStatus}
          notEditableOnly={notEditableOnly}
          hideBottomLine={true}
        >
          {value}
        </NotEditableField>
      )
    }

    const fieldName = `medicine_${uuid}_name`
    let options = []
    if( value && this.props.smartSelectForMedicine && Array.isArray(this.props.smartSelectForMedicine.payload) && this.props.smartSelectForMedicine.payload.length ){
      options = this.props.mapAsyncDataToOption ? this.props.mapAsyncDataToOption(this.props.smartSelectForMedicine.payload) : this.mapAsyncDataToOption(this.props.smartSelectForMedicine.payload)
    }else if(value){
      options.push(<Option key='0' value='notFound' disabled >未搜索到匹配项</Option>)
    }
    return (
      <div id={fieldName}>
        <AutoComplete
          {...rest}
          value={value}
          dataSource={options}
          allowClear={true}
          onChange={this.handleChange}
          getPopupContainer={()=> document.getElementById(fieldName)}
          dropdownMatchSelectWidth={false}
          dropdownStyle={{ width: this.props.dropdownWidth ? this.props.dropdownWidth : 850 }}
        >
          <Input
            maxLength='100'
          />
        </AutoComplete>
      </div>
    )
  }
}

function select(state){
  return { smartSelectForMedicine: state.smartSelectForMedicine }
}

function mapDispachToProps(dispatch){
  return bindActionCreators( { getMedicineAction, getThrottleMedicineAction }, dispatch)
}

export default connect(select, mapDispachToProps)(SmartSelectForMedicine)
