import React, { Component } from 'react'

import { SmartSelectMultipleAsync } from './SmartSelectMultiple'

export default class SmartSelectMultipleAsyncForTaskType extends Component{

  onChange = (value) => {
    const onChange = this.props.onChange
    if (onChange) {
      onChange(value)
    }
  }

  asyncMapResultToState = (data) => {
    return data.map( (d, index) => {
      return {id:d.patientFreezeFlag, name:d.name + '冻结'}
    })
  }

  render(){
    return (
      <SmartSelectMultipleAsync
        {...this.props}
        asyncMapResultToState={this.asyncMapResultToState}
        asyncResultId='SmartSelectMultipleAsyncForTaskType'
        asyncRequestFuncName='getTaskType'
      />
    )
  }
}
