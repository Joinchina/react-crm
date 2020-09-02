import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import SmartSelectBox from './SmartSelectBox'

import {getButtonOptionsAction } from '../../states/smartSelectBoxForInsurance'

class SmartSelectBoxForInsurance extends Component{

  onChange = (value) => {
    const onChange = this.props.onChange
    if (onChange) {
      onChange(value)
    }
  }

  render(){
    return (
      <SmartSelectBox
        {...this.props}
        onChange={this.onChange}
        buttonOptions={this.props.smartSelectBoxForInsurance.buttonOptions}
      />
    )
  }

  componentDidMount(){
    this.props.getButtonOptionsAction()
  }
}

function select(state){
  return { smartSelectBoxForInsurance: state.smartSelectBoxForInsurance }
}

function mapDispachToProps(dispatch){
  return bindActionCreators( { getButtonOptionsAction }, dispatch)
}

export default connect(select, mapDispachToProps)(SmartSelectBoxForInsurance)
