import React, { Component } from 'react'
import { Input } from 'antd'

import NotEditableField from './NotEditableField'
//import SmartFieldBase from './SmartFieldBase'

/*
 * 参数
 *    props.switchState       func  切换编辑状态的方法 一般从Form所在的组件定义并传递到以Smart开头的表单域
 *      switchState = ()=>{this.setState({editStatus: !this.state.editStatus})}
 *    props.editStatus        bool  当前编辑状态
 *    props.notEditableOnly   bool  是否允许编织
 *    props.prefix            bool  非编辑状前缀
 *    props.value Object
 */
class SmartInput extends Component{

  handleValueChange = (value, y) => {
    this.triggerChange(value)
  }

  triggerChange = (value) => {
    // Should provide an event to pass value to Form.
    const onChange = this.props.onChange
    if (onChange) {
      onChange(value)
    }
  }

  render() {
    const {switchState, editStatus, notEditableOnly, hideBottomLine, ...rest} = this.props
    if(!this.props.editStatus || notEditableOnly === true){
      return (
        <NotEditableField
          switchState={switchState}
          editStatus={editStatus}
          notEditableOnly={notEditableOnly}
          hideBottomLine={hideBottomLine}
        >
        {this.props.prefix}{this.props.value}{this.props.suffix}
        </NotEditableField>
      )
    }

    return (
      <Input
        {...rest}
        onChange={this.handleValueChange}
      />
    )
  }
}

export default SmartInput
