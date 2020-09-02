import React, { Component } from 'react'
import Contact from './Contact'

class Contacts extends Component {

  constructor (props) {
    super(props)
    this.customerId = props.customerId
    this.isShow = props.source === 'customerDetails'
  }

  render () {
    return (
      <div>
        <div className='table-box block'>
          <Contact patientId={this.customerId} />
        </div>
      </div>
    )
  }
}



export default Contacts
