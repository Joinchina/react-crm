import React, { Component } from 'react';
import { Input } from 'antd';
import getTrackerId from './util';

export default class TrackableInput extends Component {

  render(){
    let { trackerId, className = "", ...rest } = this.props;
    trackerId = getTrackerId(trackerId);
    if (!trackerId) {
      return <Input {...this.props}/>
    }
    return <Input 
      className={`-x-type-input -x-id-${trackerId} ${className}`}
      {...rest}  />
  }
}