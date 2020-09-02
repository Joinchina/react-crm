import React from 'react'
import { Radio  } from 'antd'
const RadioGroup = Radio.Group
import NotEditableField from './NotEditableField'
import SmartFieldBase from './SmartFieldBase'
/*
 * 参数
 *    props.switchState       func  切换编辑状态的方法 一般从Form所在的组件定义并传递到以Smart开头的表单域
 *      switchState = ()=>{this.setState({editStatus: !this.state.editStatus})}
 *    props.editStatus        bool  当前编辑状态
 *    props.notEditableOnly   bool  是否允许编织
 *    props.value Object
 */
class SmartCheckbox extends SmartFieldBase{

  render() {
    const {switchState, editStatus, notEditableOnly, transform, ...rest} = this.props
    if(!this.props.editStatus || notEditableOnly === true){
      return (
        <NotEditableField
          switchState={switchState}
          editStatus={editStatus}
          notEditableOnly={notEditableOnly}
        >
          {
            transform(this.state.value)
          }
        </NotEditableField>
      )
    }

    return (
      <RadioGroup {...rest} onChange={this.handleValueChange} value={this.state.value}>
        {this.props.children}
      </RadioGroup>
    )
  }
}

export default SmartCheckbox
