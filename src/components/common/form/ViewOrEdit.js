import React, { Component } from 'react';
import NotEditableField from '../NotEditableField';
import propTypes from 'prop-types';
import { FormItemEditor } from './FormItem';

class ViewOrEdit extends Component {

    static [FormItemEditor] = true

    static contextTypes = {
        viewOrEditGroup: propTypes.object,
        formField: propTypes.object,
        formFieldEditor: propTypes.object
    }

    static propTypes = {
        onChange: propTypes.func,
        value: propTypes.any,
        editing: propTypes.bool,
        onChangeEditing: propTypes.func,
        changeEditingDisabled: propTypes.bool,
        placeholder: propTypes.string,
        viewComponent: propTypes.oneOfType([propTypes.func, propTypes.string]),
        viewRenderer: propTypes.func,
        editComponent: propTypes.oneOfType([propTypes.func, propTypes.string]),
        editRenderer: propTypes.func,
    }

    render(){
        const props = this.props;
        const context = this.context;
        let {
            // onChange, value,
            editing, onChangeEditing, changeEditingDisabled,
            placeholder, viewComponent, viewRenderer,
            editComponent, editRenderer,
            ...otherProps
        } = props;

        if (context.viewOrEditGroup) {
            if (editing === undefined) editing = context.viewOrEditGroup.editing;
            if (onChangeEditing === undefined) onChangeEditing = context.viewOrEditGroup.onChangeEditing;
            if (changeEditingDisabled === undefined) changeEditingDisabled = context.viewOrEditGroup.changeEditingDisabled;
        }

        if (context.formFieldEditor) {
            otherProps = { ...otherProps, ...context.formFieldEditor };
        }

        if (editing) {
            const dec = context.formField ? context.formField.decorator : a => a;
            if (editRenderer) {
                return dec(editRenderer(otherProps));
            } else if (editComponent) {
                const EditComponent = editComponent;
                return dec(<EditComponent placeholder={placeholder || ''} {...otherProps}/>);
            } else {
                return null;
            }
        } else {
            let viewNode;
            if (viewRenderer) {
                viewNode = viewRenderer(otherProps);
            } else if (viewComponent) {
                const ViewComponent = viewComponent;
                viewNode = <ViewComponent {...otherProps}/>;
            } else {
                if (otherProps.value === null || otherProps.value === undefined){
                    viewNode = placeholder || '';
                } else {
                    viewNode = `${otherProps.value}`;
                }
            }
            return <NotEditableField
                switchState={() => {
                    if (onChangeEditing) {
                        onChangeEditing(true);
                    }
                }}
                notEditableOnly={changeEditingDisabled}
                >
                    { viewNode }
                </NotEditableField>
        }
    }
}

ViewOrEdit.Group = class ViewOrEditGroup extends Component {

    static propTypes = {
        value: propTypes.any,
        onChange: propTypes.func,
        disabled: propTypes.bool,
    }

    static childContextTypes = {
        viewOrEditGroup: propTypes.object,
    }

    getChildContext(){
        return {
            viewOrEditGroup: {
                editing: this.props.value,
                onChangeEditing: this.props.onChange,
                changeEditingDisabled: this.props.disabled,
            }
        };
    }

    render(){
        const { onChange, value, ...otherProps } = this.props;
        return <div {...otherProps}></div>;
    }
}

export default ViewOrEdit;
export { ViewOrEdit };
