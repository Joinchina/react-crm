/* eslint-disable class-methods-use-this */
import React from 'react';
import propTypes from 'prop-types';
import InputNumber from '@wanhu/antd-legacy/lib/inputNumber';
import AntdBaseEditor, { BaseComponent } from './antd-editor';
import 'antd/lib/input-number/style/css';
import Handsontable from '../lib';
import './two-number.css';
import cachedHtmlRenderer from '../cached-html-renderer';


const { KEY_CODES } = Handsontable.helper;
const allowKeys = '-.0123456789';
const allowKeyCodes = [
    KEY_CODES.BACKSPACE, KEY_CODES.DELETE, KEY_CODES.HOME, KEY_CODES.END,
    KEY_CODES.ARROW_LEFT, KEY_CODES.ARROW_RIGHT, KEY_CODES.ARROW_DOWN, KEY_CODES.ARROW_UP,
];
class TwoNumberEditor extends BaseComponent {
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

    state = {
        value1: null,
        value2: null,
        currentFocus: 1,
    }

    onKeyDown = (e) => {
        if (e.ctrlKey || e.altKey) {
            return;
        }
        if (allowKeyCodes.includes(e.keyCode)) {
            return;
        }
        if (e.keyCode === KEY_CODES.ENTER) {
            if (this.props.onSubmit) {
                this.props.onSubmit(e.ctrlKey);
            }
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
        const { step } = this.props;
        const { value1, value2, currentFocus } = this.state;
        if (currentFocus === 1) {
            let value = Number(value1);
            if (Number.isNaN(value)) {
                value = 0;
            }
            this.setValue([this.round(value + step), value2]);
        } else if (currentFocus === 2) {
            let value = Number(value2);
            if (Number.isNaN(value)) {
                value = 0;
            }
            this.setValue([value1, this.round(value + step)]);
        }
    }

    decrease() {
        const { step } = this.props;
        const { value1, value2, currentFocus } = this.state;
        if (currentFocus === 1) {
            let value = Number(value1);
            if (Number.isNaN(value)) {
                value = 0;
            }
            this.setValue([this.round(value - step), value2]);
        } else if (currentFocus === 2) {
            let value = Number(value2);
            if (Number.isNaN(value)) {
                value = 0;
            }
            this.setValue([value1, this.round(value - step)]);
        }
    }

    moveLeft() {
        const { currentFocus } = this.state;
        if (currentFocus === 1) {
            return false;
        }
        this.setState({ currentFocus: 1 });
        this.element.focus();
        return true;
    }

    moveRight() {
        const { currentFocus } = this.state;
        if (currentFocus === 2) {
            return false;
        }
        this.setState({ currentFocus: 2 });
        this.elementR.focus();
        return true;
    }

    onChangeL = (value1) => {
        this.setState({ value1 });
    }

    onChangeR = (value2) => {
        this.setState({ value2 });
    }

    parseValue(v) {
        if (v === null || v === undefined || v === '') {
            return '';
        }
        const value = Number(v);
        if (Number.isNaN(value)) {
            return '';
        }
        return value;
    }

    setValue = (v) => {
        if (Array.isArray(v)) {
            this.setState({
                value1: this.parseValue(v[0]),
                value2: this.parseValue(v[1]),
            });
        } else if (typeof v === 'string') {
            const arr = v.split(',');
            this.setState({
                value1: this.parseValue(arr[0]),
                value2: this.parseValue(arr[1]),
            });
        } else {
            this.setState({ value1: null, value2: null });
        }
    }

    formatValue(v, defaultValue = null) {
        let value = v;
        if (value === null || value === undefined || value === '') {
            return defaultValue;
        }
        value = Number(value);
        if (Number.isNaN(value)) {
            return defaultValue;
        }
        return this.round(value);
    }

    getValue() {
        const { value1, value2 } = this.state;
        return `${this.formatValue(value1, '')},${this.formatValue(value2, '')}`;
    }

    refElementR = (ref) => {
        this.elementR = ref;
    }

    onFocusL = () => this.setState({ currentFocus: 1 });

    onFocusR = () => this.setState({ currentFocus: 2 });

    render() {
        const { value1, value2 } = this.state;
        const {
            min, max, step,
        } = this.props;
        return (
            <div className="ht-antd-two-number">
                <InputNumber
                    className="ht-antd-two-number-l"
                    ref={this.refElement}
                    onChange={this.onChangeL}
                    value={value1}
                    min={min}
                    max={max}
                    step={step}
                    onFocus={this.onFocusL}
                    onKeyDown={this.onKeyDown}
                />
                <InputNumber
                    className="ht-antd-two-number-r"
                    ref={this.refElementR}
                    onChange={this.onChangeR}
                    value={value2}
                    min={min}
                    max={max}
                    step={step}
                    onFocus={this.onFocusR}
                    onKeyDown={this.onKeyDown}
                />
            </div>
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
        [Handsontable.helper.KEY_CODES.ARROW_LEFT]: editor => !editor.reactComponent.moveLeft(),
        [Handsontable.helper.KEY_CODES.ARROW_RIGHT]: editor => !editor.reactComponent.moveRight(),
    }

    getContainerClassName() {
        return 'ht-antd-two-number-box';
    }

    render() {
        return (
            <TwoNumberEditor
                {...this.cellProperties}
                onSubmit={this.onSubmit}
                onCancel={this.onCancel}
            />
        );
    }
}

function renderer(hotInstance, td, row, column, prop, value, cellProperties) {
    let v1;
    let v2;
    if (Array.isArray(value)) {
        ([v1, v2] = value);
    } else if (typeof value === 'string') {
        const arr = value.split(',');
        ([v1, v2] = arr);
    }
    if (v1 === null || v1 === undefined) {
        v1 = '';
    }
    if (v2 === null || v2 === undefined) {
        v2 = '';
    }
    const html = `<div class="ht-antd-two-number-l">${v1}</div><div class="ht-antd-two-number-r">${v2}</div>`;
    return cachedHtmlRenderer(
        hotInstance,
        td,
        row,
        column,
        prop,
        html,
        cellProperties,
    );
}


export default {
    editor: AntdNumberEditor,
    renderer,
    className: 'ht-antd-two-number',
};
