import React, { Component } from 'react'
import { Input } from 'antd' 
export default class TextAreaField extends Component {

    handleChange = e => {
      if (this.props.onChange) {
        this.props.onChange(e.target.value);
      }
    }
  
    render(){
      const { value, onChange, style, maxLength, minRows, ...rest } = this.props;
      return (
        <div style={{
            ...style,
            position: 'relative'
          }} {...rest}>
          <Input
            value={value || ''}
            type='textarea'
            autosize={{minRows: minRows || 2}}
            maxLength={maxLength || '500'}
            onChange={this.handleChange}
            style={{paddingBottom: 20}}
          />
          <span style={{position: 'absolute', bottom: 0, right:5}}>{ value ? value.length : 0}/{maxLength || '500'}</span>
        </div>
      )
    }
  }