import React, { Component } from 'react'

import { SmartSelectMultipleAsync } from './SmartSelectMultiple'

export default class SmartSelectMultipleAsyncForTags extends Component{

  onChange = (value) => {
    const onChange = this.props.onChange
    if (onChange) {
      onChange(value)
    }
  }

  asyncMapResultToState = (data) => {
    return data.map( (d, index) => {
      return {id:d.id, name:d.name}
    })
  }

  render(){
    //console.log('-----------', this.props.value)
    return (
      <SmartSelectMultipleAsync
        {...this.props}
        asyncMapResultToState={this.asyncMapResultToState}
        asyncResultId='SmartSelectMultipleAsyncForTags'
        asyncRequestFuncName='getTagsByType'
      />
    )
  }
}
