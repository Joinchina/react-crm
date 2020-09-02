import React from 'react';
import PropTypes from 'prop-types';

export default function FieldDecorator(props, context) {
    const { getFieldDecorator } = context.form;
    const dec = getFieldDecorator(props.field, {
        rules: [context.formDef.fields[props.field].rule]
    });
    if (!props.children) {
        return null;
    } else if (React.isValidElement(props.children)) {
        return dec(context.formDef.fields[props.field].decorator(props.children));
    } else {
        throw new Error('FieldDecorator shold not have more than 1 child');
    }
}

FieldDecorator.contextTypes = {
    form: PropTypes.object,
    formDef: PropTypes.object,
}
