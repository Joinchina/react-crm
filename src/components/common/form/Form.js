import React, { Component } from 'react';
import { Form as AntdForm } from 'antd';
import blacklist from 'blacklist';
import PropTypes from 'prop-types';
import FormItem from './FormItem';
import { getParams } from 'rc-form/lib/utils';
import formValidator from './formBuilder';
import fieldValidator from './fieldBuilder';
import _ from 'underscore';

class Form extends Component {

    static childContextTypes = {
        formDef: PropTypes.object,
        decoratedForm: PropTypes.object,
    }

    static propTypes = {
        def: PropTypes.object.isRequired,
        data: PropTypes.object,
        onFieldsChange: PropTypes.func,
        values: PropTypes.object,
        onValuesChange: PropTypes.func,
        formRef: PropTypes.func
    }

    get decoratedForm(){
        if (!this._decoratedForm || this._decoratedForm.originalForm !== this.props.form) {
            const thisForm = this;
            this._decoratedForm = Object.create(this.props.form, {
                originalForm: {
                    value: this.props.form
                },
                validatingAllFields: {
                    get(){
                        return thisForm.validatingAllFields;
                    },
                    set(val) {
                        thisForm.validatingAllFields = val;
                    }
                },
                validateFields: {
                    value: function(ns, opt, cb) {
                        const { names, options, callback } = getParams(ns, opt, cb);
                        const validatingAllFields = !names || names.indexOf('__form') >= 0;
                        this.validatingAllFields = validatingAllFields;
                        this.originalForm.validateFields(names, options, (...args) => {
                            this.validatingAllFields = false;
                            if (callback) {
                                callback(...args);
                            }
                        });
                    }
                },
                validateFieldsAndScroll: {
                    value: function(ns, opt, cb) {
                        const { names, options, callback } = getParams(ns, opt, cb);
                        const validatingAllFields = !names || names.indexOf('__form') >= 0;
                        this.validatingAllFields = validatingAllFields;
                        this.originalForm.validateFieldsAndScroll(names, options, (...args) => {
                            this.validatingAllFields = false;
                            if (callback) {
                                callback(...args);
                            }
                        });
                    }
                }
            });
        }
        return this._decoratedForm;
    }

    constructor(props) {
        super(props);
        if (props.formRef) {
            props.formRef(this.decoratedForm);
        }
    }

    componentWillReceiveProps(props) {
        if (props.formRef) {
            props.formRef(this.decoratedForm);
        }
    }

    getChildContext() {
        return {
            formDef: this.props.def,
            decoratedForm: this.decoratedForm
        };
    }

    render(){
        const internalField = <FormItem field="__form" className="wh-form-internal-field"/>;
        let children;
        if (Array.isArray(this.props.children)) {
            children = [...this.props.children, internalField]
        } else {
            children = [this.props.children, internalField];
        }
        const props = blacklist(this.props, 'def', 'data', 'onFieldsChange', 'values', 'onValuesChange', 'form', 'formRef');
        props.className = this.props.className ? `wh-form ${this.props.className}` : 'wh-form';
        return React.createElement(AntdForm, props, ...children);
    }
}

const ConnectedForm = AntdForm.create({
    onFieldsChange(props, fields) {
        if (props.onFieldsChange) {
            props.onFieldsChange(fields);
        }
    },
    onValuesChange(props, values) {
        if (props.onValuesChange) {
            props.onValuesChange(values);
        }
    },
    mapPropsToFields(props) {
        if (props.data) {
            return { ...props.data };
        } else if (props.values) {
            const r = {};
            for (const name in props.values) {
                r[name] = {
                    name: name,
                    value: props.values[name],
                    touched: false,
                    dirty: false
                };
            }
            return r;
        }
    }
})(Form);

ConnectedForm.Unmanaged = class UnmanagedForm extends Component {

    static propTypes = {
        onFieldsChange: (props, propName, componentName) => {
            if (props[propName] !== undefined) {
                return new Error(`${componentName} should not have prop ${propName}`);
            }
        },
        mapPropsToFields: (props, propName, componentName) => {
            if (props[propName] !== undefined) {
                return new Error(`${componentName} should not have prop ${propName}`);
            }
        },
    }

    state = {};

    updateFormField = (fields) => this.setState(fields);

    onValuesChange = (changedValues) => {
        if (this.props.onValuesChange) {
            this.props.onValuesChange(changedValues);
        }
        if (this.props.onFullValuesChange) {
            const values = _.mapObject(this.state, field => field && field.value);
            this.props.onFullValuesChange({
                ...values,
                ...changedValues,
            });
        }
    }

    render(){
        const { onValuesChange, onFullValuesChange, ...props } = this.props;
        return <ConnectedForm {...props} data={this.state} onFieldsChange={this.updateFormField} onValuesChange={this.onValuesChange}/>;
    }
}

ConnectedForm.Item = FormItem;
ConnectedForm.def = function(f, form) {
    for (const name in f) {
        if (name === '__form') {
            throw new Error('Cannot use "__form" as field name because it is reserved for internal use');
        }
    }
    const validator = form || formValidator();
    const builtValidator = validator.build();
    const fields = builtValidator.fieldDecorator({
        ...f,
        __form: fieldValidator()
    });
    const builtFields = {};
    for (const name in fields) {
        if (fields[name]) {
            builtFields[name] = fields[name].build()
        }
    }
    return {
        fields: builtFields,
        validator: builtValidator
    };
}

export default ConnectedForm;
