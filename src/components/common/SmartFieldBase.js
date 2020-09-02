import { Component } from 'react'
import PropTypes from 'prop-types'

class SmartFieldBase extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: this.props.value || undefined,
    }
  }

  componentWillReceiveProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps) {
      //console.log('---------------nextProps.value', nextProps.value)
      this.setState({value: nextProps.value})
    }
  }

  handleValueChange = (value) => {
    this.setState({value})
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
}

SmartFieldBase.propTypes = {
  //switchState: PropTypes.func.isRequired,
  editStatus: PropTypes.bool.isRequired
}

export default SmartFieldBase
