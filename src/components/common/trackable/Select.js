import React, { Component } from 'react';
import { Select } from 'antd';
import getTrackerId from './util';

export default class TrackableSelect extends Component {

  static Option = Select.Option;
  static OptGroup = Select.OptGroup;

  constructor(...args) {
    super(...args);
    this.instanceId = Math.random().toString(36).substr(-4);
  }

  render(){
    let { trackerId, className = "", dropdownClassName = "", children, ...rest } = this.props;
    trackerId = getTrackerId(trackerId);
    if (!trackerId) {
      return <Select {...this.props}/>;
    }
    return <Select 
      className={`-x-type-select -x-id-${trackerId} -x-instance-${this.instanceId} ${className}`}
      dropdownClassName={`-x-id-${trackerId}-dropdown -x-instance-${this.instanceId} ${dropdownClassName}`}
      children={React.Children.map(children, (elem, index) => React.cloneElement(elem, {
        className: `-x-repeat-${trackerId} -x-index-${index} -x-key-${elem.key} ${elem.props.className || ""}`
      }))}
      {...rest}  />
  }
}