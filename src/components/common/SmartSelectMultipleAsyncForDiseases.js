import React, { Component } from 'react'

import { SmartSelectMultipleAsync } from './SmartSelectMultiple'

export default class SmartSelectMultipleAsyncForDiseases extends Component{

  onChange = (value) => {
    const onChange = this.props.onChange
    if (onChange) {
      onChange(value)
    }
  }

  render(){
    return (
      <SmartSelectMultipleAsync
        {...this.props}
        asyncMapResultToState={this.asyncMapResultToState}
        asyncResultId='SmartSelectMultipleAsyncForDiseases'
        asyncRequestFuncName='getDisease'
      />
    )
  }
}
