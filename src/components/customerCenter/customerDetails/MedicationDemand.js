import React from 'react'
import { Route } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Breadcrumb, Table } from 'antd'
import Title from '../../common/Title'
import BaseComponent from '../../BaseComponent'
import MedicineRequirment from './MedicineRequirment'

const { Column } = Table

class MedicationDemand extends BaseComponent {

  constructor (props) {
    super(props)
    this.customerId = props.customerId
    this.isShow = props.source === 'customerDetails'
  }

  render () {
    return (
      <div>
      <div className='table-box block'>
        <Route
          path={`${this.props.match.url}/:pageNumber?`}
          render={(props) => <MedicineRequirment disableAffix={this.props.disableAffix} {...props} patientId={this.customerId} patientType={this.isShow ? 'formal' : 'potential'} />}
        />
      </div>
      </div>
    )
  }
}

function select (state) {
  return {
    params: state.routerReducer.location.state,
  }
}
export default connect(select)(MedicationDemand)
