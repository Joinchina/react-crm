import React from 'react';
import { Form as AntdForm } from 'antd';
import PropTypes from 'prop-types';
import blacklist from 'blacklist';
import Editor, { FormItemEditorProxy } from './FormItemEditor';

export const FormItemEditor = Symbol('FormItemEditor');

function findEditorInChildren(children) {
    if (Array.isArray(children)) {
        return children.some(c => findEditorInChildren(c));
    } else {
        if (children.type && children.type[FormItemEditor]) {
            return true;
        }
        return Boolean(children.props && children.props.children && findEditorInChildren(children.props.children));
    }
}

export default function FormItem(props, context) {
    const field = context.formDef.fields[props.field];
    if (!field) {
        throw new Error(`Field ${props.field} is not defined in form`);
    }
    const { getFieldDecorator } = context.decoratedForm;
    const rule = field.rule(context.decoratedForm);
    const validateTrigger = field.validateTrigger === undefined ? 'onChange' : field.validateTrigger;
    let onChange;
    if (!field.onChange && !props.onChange) {
        onChange = null;
    } else if (!field.onChange) {
        onChange = props.onChange;
    } else if (!props.onChange) {
        onChange = field.onChange;
    } else {
        onChange = (...args) => {
            props.onChange(...args);
            field.onChange(...args);
        }
    }
    const dec = getFieldDecorator(props.field, {
        rules: rule ? [rule] : null,
        onChange: onChange,
        initialValue: field.initialValue,
        validateTrigger: validateTrigger
    });
    const nProps = blacklist(props, 'field', 'children', 'height', 'wrapper');
    if (props.height === 'auto') {
        nProps.className = nProps.className ? `wh-form-item-auto-height ${nProps.className}` : 'wh-form-item-auto-height';
    }
    const Wrapper = props.wrapper || AntdForm.Item;
    if (!props.children) {
        return <Wrapper {...nProps}></Wrapper>;
    } else if (findEditorInChildren(props.children)) {
        const proxyProps = {
            formDef: context.formDef,
            field: props.field
        };
        let decoratedEditor;
        if (Array.isArray(props.children)) {
            decoratedEditor = dec(React.createElement(FormItemEditorProxy, proxyProps, ...props.children));
        } else {
            decoratedEditor = dec(React.createElement(FormItemEditorProxy, proxyProps, props.children));
        }
        return <Wrapper {...nProps}>
            { decoratedEditor }
        </Wrapper>;
    } else if (React.isValidElement(props.children)) {
        return <Wrapper {...nProps}>
            { dec(context.formDef.fields[props.field].decorator(props.children)) }
        </Wrapper>;
    } else {
        throw new Error('FormItem shold not have more than 1 child without FormItemEditor');
    }
}

FormItem.contextTypes = {
    decoratedForm: PropTypes.object,
    // form: PropTypes.object,
    formDef: PropTypes.object,
}

FormItem.propTypes = {
    field: PropTypes.string.isRequired
};

Editor[FormItemEditor] = true;

FormItem.Editor = Editor;
