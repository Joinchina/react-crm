import React from 'react';
import propTypes from 'prop-types';
import InputNumber from '@wanhu/antd-legacy/lib/inputNumber';
import Handsontable from '../lib';
import 'antd/lib/input-number/style/css';
import './number.css';
import AntdBaseEditor, { BaseComponent } from './antd-editor';
import makeAntdRenderer from './antd-renderer';

function isEmpty(val) {
    return val === undefined || val === null || val === '';
}

const { KEY_CODES } = Handsontable.helper;
const allowKeys = '-.0123456789';
const allowKeyCodes = [
    KEY_CODES.BACKSPACE, KEY_CODES.DELETE, KEY_CODES.HOME, KEY_CODES.END,
    KEY_CODES.ARROW_LEFT, KEY_CODES.ARROW_RIGHT, KEY_CODES.ARROW_DOWN, KEY_CODES.ARROW_UP,
];
class NumberEditor extends BaseComponent {
    static propTypes = {
        min: propTypes.number,
        max: propTypes.number,
        step: propTypes.number,
        precision: propTypes.number,
    }

    static defaultProps = {
        min: -Infinity,
        max: Infinity,
        formatter: {
            parse: Number,
            stringify: String,
        },
        step: 1,
        precision: 0,
    }

    handleSubmit(e) {
        const { ctrlKey } = e;
        if (isEmpty(this.state.value) && !isEmpty(this.props.defaultValue)) {
            this.setState({
                value: this.props.defaultValue,
            }, () => {
                this.props.onSubmit(ctrlKey);
            });
        } else if (this.state.value > this.props.max) {
            this.setState({
                value: this.props.max,
            }, () => {
                this.props.onSubmit(ctrlKey);
            });
        } else if (this.state.value < this.props.min) {
            this.setState({
                value: this.props.min,
            }, () => {
                this.props.onSubmit(ctrlKey);
            });
        } else {
            this.props.onSubmit(ctrlKey);
        }
    }

    onKeyDown = (e) => {
        if (e.ctrlKey || e.altKey) {
            return;
        }
        if (allowKeyCodes.includes(e.keyCode)) {
            return;
        }
        if (e.keyCode === KEY_CODES.ENTER) {
            this.handleSubmit(e);
            return;
        }
        if (e.keyCode === KEY_CODES.ESCAPE) {
            if (this.props.onCancel) {
                this.props.onCancel(e.ctrlKey);
            }
            return;
        }
        if (allowKeys.includes(e.key)) {
            if (e.shiftKey) {
                e.preventDefault();
            }
        } else {
            e.preventDefault();
        }
    }

    round(value) {
        const { precision } = this.props;
        if (typeof precision !== 'number') {
            return value;
        }
        return value.toFixed(precision);
    }

    increase() {
        const { step, defaultValue } = this.props;
        let { value } = this.state;
        if (value === '') {
            value = NaN;
        }
        value = Number(value);
        if (Number.isNaN(value)) {
            value = defaultValue || 0;
        }
        this.setValue(this.round(value + step));
    }

    decrease() {
        const { step, defaultValue } = this.props;
        let { value } = this.state;
        if (value === '') {
            value = NaN;
        }
        value = Number(value);
        if (Number.isNaN(value)) {
            value = defaultValue || 0;
        }
        this.setValue(this.round(value - step));
    }

    onChange = (value) => {
        this.setState({ value });
    }

    setValue = (value) => {
        this.setState({ value });
    }

    getValue() {
        let { value } = this.state;
        if (value === '') {
            value = NaN;
        }
        value = Number(value);
        if (Number.isNaN(value)) {
            return null;
        }
        return this.round(value);
    }

    render() {
        const { value } = this.state;
        const {
            min, max, step, placeholder, defaultValue,
        } = this.props;
        return (
            <InputNumber
                ref={this.refElement}
                onChange={this.onChange}
                value={value}
                min={min}
                max={max}
                step={step}
                placeholder={placeholder || defaultValue}
                onKeyDown={this.onKeyDown}
            />
        );
    }
}

class AntdNumberEditor extends AntdBaseEditor {
    handleKeyCodes = {
        ...AntdBaseEditor.InputKeyCodeHandlers,
        [Handsontable.helper.KEY_CODES.ARROW_UP]: (editor) => {
            editor.reactComponent.increase();
            return false;
        },
        [Handsontable.helper.KEY_CODES.ARROW_DOWN]: (editor) => {
            editor.reactComponent.decrease();
            return false;
        },
        [Handsontable.helper.KEY_CODES.ENTER]: (editor, event) => {
            editor.reactComponent.handleSubmit(event);
            return false;
        },
    }

    /* eslint-disable-next-line class-methods-use-this */
    getContainerClassName() {
        return 'ht-antd-number';
    }

    initValueFromEvent(e) {
        if (allowKeys.includes(e.key)) {
            this.setValue('');
        }
    }

    render() {
        const {
            min, max, step, precision, placeholder, defaultValue,
        } = this.cellProperties;
        return (
            <NumberEditor
                min={min}
                max={max}
                step={step}
                precision={precision}
                placeholder={placeholder}
                defaultValue={defaultValue}
                onSubmit={this.onSubmit}
                onCancel={this.onCancel}
            />
        );
    }
}

export default {
    editor: AntdNumberEditor,
    renderer: makeAntdRenderer(),
    className: 'ht-antd-number',
};
