import React, { Component } from 'react';
import { Tag } from 'antd';
import './index.scss';

export default class Removable extends Component {

    onRemove = () => {
        if (this.props.onChange) {
            this.props.onChange(null);
        }
    }

    render() {
        const { className, value, onChange, renderer, ...rest } = this.props;
        if (value) {
            return <Tag className={className ? `wh-removable ${className}` : 'wh-removable'} closable afterClose={this.onRemove} {...rest}>{ renderer ? renderer(value) : value}</Tag>
        } else {
            return null;
        }
    }
}
