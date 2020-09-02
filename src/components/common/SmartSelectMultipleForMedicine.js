import React, { Component } from 'react'

import { Row, Col, Button, Select, Tag } from 'antd'
import WHButton from './WHButton'
import NotEditableField from './NotEditableField'
import SmartSelectForMedicine from '../common/SmartSelectForMedicine'

export default class SmartSelectMultipleForMedicine extends Component {

  constructor(props) {
    super(props)
    let value = props.value ? props.value : []
    this.state = {
      value,
    }
  }

  componentWillReceiveProps(nextProps) {
    let newValue
    if('value' in nextProps){
      newValue = nextProps.value ? nextProps.value : []
      this.setState({value: newValue})
    }
  }

  changeStatus(d){
    let index = -1
    for(let i=0; i<this.state.value.length; i++){
      if(d.id === this.state.value[i].id){
        index = i
        break
      }
    }
    let newValue
    newValue = [...this.state.value.slice(0, index), ...this.state.value.slice(index + 1)]
    this.setState({value: newValue})
    this.triggerChange(newValue)
  }

  triggerChange = (newValue) => {
    const onChange = this.props.onChange
    if (onChange) {
      onChange(newValue)
    }
  }

  handleSelect = (value, option) => {
    value = JSON.parse(value)
    let index = -1
    this.state.value.forEach((row, i) => {
      if(value.baseDrugId == row.id){
        index = i
      }
    })
    if(index !== -1) return
    let productName = value.productName ? `(${value.productName})` : ''
    let newState = [...this.state.value, {id: value.baseDrugId, name: value.commonName + productName}]
    this.setState({value: newState})
    this.triggerChange(newState)
  }

  render() {
    if(!this.props.editStatus || this.props.notEditableOnly === true){
      if(this.state.value){
        let tags = this.state.value.map((d, index) => {
          return <Tag key={index}>{d.name}</Tag>
        })
        return (
          <NotEditableField
            {...this.props}
          >
            {tags}
          </NotEditableField>
        )
      }
    }

    const options = this.state.value.map((d, index)=> {
        return <WHButton style={{marginRight: 5, marginBottom:10, maxWidth: 120, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}} key={index} onClick={this.changeStatus.bind(this, d)} selected={true} >{d.name}</WHButton>
    })

    return (
      <Row gutter={10}>
        <Col span={6}>
          <SmartSelectForMedicine
            placeholder="请选择药品"
            uuid={this.props.uuid}
            style={{width: '100%'}}
            dropdownWidth={500}
            editStatus={this.props.editStatus}
            notEditableOnly={this.props.notEditableOnly}
            onSelect={this.handleSelect}
            hospitalId={this.props.hospitalId}
            mapValueToAutoComplete={value => {
              try{
                value = JSON.parse(value)
                if(typeof value === 'object'){
                  value = ''
                }else{
                  value = value + ''
                }
              }catch(e){
                // 这时候value是个字符串
              }
              return value
            }}
          />
        </Col>
        <Col span={18}>{options}</Col>
      </Row>
    )
  }
}
