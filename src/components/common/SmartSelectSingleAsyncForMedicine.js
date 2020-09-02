import React, { Component } from 'react'

import { SmartSelectSingleAsync } from './SmartSelectSingle'

export default class SmartSelectSingleAsyncForMedicine extends Component{

  onChange = (value) => {
    const onChange = this.props.onChange
    if (onChange) {
      onChange(value)
    }
  }

  onSelect = value => {
    let propsOnSelect = this.props.onSelect
    if(propsOnSelect){
      propsOnSelect(value)
    }
  }

  asyncMapResultToState = data => {
    let propsAsyncMapResultToState = this.props.asyncMapResultToState
    if(propsAsyncMapResultToState){
      propsAsyncMapResultToState(data)
    }
    //console.log('------------asyncMapResultToState', data)
  }

  render(){
    return (
      <SmartSelectSingleAsync
        {...this.props}
        asyncMapResultToState={this.asyncMapResultToState}
        onChange={this.onChange}
        onSelect={this.onSelect}
        asyncResultId='SmartSelectSingleAsyncForMedicine'
        asyncRequestFuncName='getMedicine'
      />
    )
  }
}
