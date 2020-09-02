import React, { Component } from 'react'
import { InputNumber, Row, Col } from 'antd'

import NotEditableField from './NotEditableField'

/*
 * 参数
 *    props.switchState       func  切换编辑状态的方法 一般从Form所在的组件定义并传递到以Smart开头的表单域
 *      switchState = ()=>{this.setState({editStatus: !this.state.editStatus})}
 *    props.editStatus        bool  当前编辑状态
 *    props.notEditableOnly   bool  是否允许编织
 *    props.value             number
 *    props.text              number
 */
export default class SmartInputNumber extends Component{

  handleValueChange = (value) => {
    this.triggerChange(value)
  }

  triggerChange = (value) => {
    //console.log('---------------value', value)
    // Should provide an event to pass value to Form.
    const onChange = this.props.onChange
    if (onChange) {
      onChange(value)
    }
  }

  render() {
    const {text, switchState, editStatus, notEditableOnly, hideBottomLine, ...rest} = this.props;
    if(!this.props.editStatus || notEditableOnly === true){
      return (
        <NotEditableField
          switchState={switchState}
          editStatus={editStatus}
          notEditableOnly={notEditableOnly}
          hideBottomLine={hideBottomLine}
        >
          {this.props.value}{text}
        </NotEditableField>
      )
    }

    return (
      <Row gutter={5}>
        <Col span={18}>
          <InputNumber
            {...rest}
            style={{width:'100%'}}
            onChange={this.handleValueChange}
          />
        </Col>
        <Col span={6}>
          {text}
        </Col>
      </Row>
    )
  }
}
