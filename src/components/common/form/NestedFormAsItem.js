import React, { Component } from 'react';

export default class NestedFormAsItem extends Component {

    constructor(props, ...args) {
        super(props, ...args);
        if (props.validatorRef) {
            props.validatorRef(this.validator);
        }
    }

    componentWillReceiveProps(props) {
        if (props.validatorRef) {
            props.validatorRef(this.validator);
        }
    }

    validator = (callback) => {
        if (!this.props.form) {
            callback();
            return;
        }
        const form = this.props.form;
        form.validateFields(err => {
            callback(err);
        });
    }
}
