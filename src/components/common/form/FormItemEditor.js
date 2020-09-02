import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default function FormItemEditor(props, context) {
    if (React.isValidElement(props.children)) {
        return context.formField.decorator(props.children, (type, props) => {
            return {
                ...props,
                ...context.formFieldEditor,
                onChange(...args){
                    if (context.formFieldEditor.onChange) {
                        context.formFieldEditor.onChange(...args);
                    }
                    if (props.onChange) {
                        props.onChange(...args);
                    }
                },
            }
        });
    } else {
        throw new Error('FormItemEditor shold have exactly 1 child');
    }
}

FormItemEditor.contextTypes = {
    formField: PropTypes.object,
    formFieldEditor: PropTypes.object
}

export class FormItemEditorProxy extends Component {

    static propTypes = {
        field: PropTypes.string.isRequired,
        formDef: PropTypes.object,
    }

    static childContextTypes = {
        formField: PropTypes.object,
        formFieldEditor: PropTypes.object
    }

    getChildContext() {
        const formField = this.props.formDef.fields[this.props.field];
        const formFieldEditor = { value: this.props.value, onChange: this.props.onChange };
        if (formField.validateTrigger) {
            if (Array.isArray(formField.validateTrigger)) {
                formField.validateTrigger.forEach(p => formFieldEditor[p] = this.props[p]);
            } else {
                formFieldEditor[formField.validateTrigger] = this.props[formField.validateTrigger];
            }
        }        
        return {
            formField,
            formFieldEditor
        };
    }

    render(){
        return <div>{this.props.children}</div>
    }
}
