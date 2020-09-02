/* eslint-disable class-methods-use-this */
import React from 'react';
import propTypes from 'prop-types';
import InputNumber from '@wanhu/antd-legacy/lib/inputNumber';
import Select from '@wanhu/antd-legacy/lib/select';
import AntdBaseEditor, { BaseComponent, InputKeyCodeHandlers } from './antd-editor';
import Handsontable from '../lib';
import 'antd/lib/input-number/style/css';
import 'antd/lib/select/style/css';
import './number-select.css';
import makeAntdRenderer from './antd-renderer';

const { KEY_CODES } = Handsontable.helper;
const allowKeys = '-.0123456789';
const allowKeyCodes = [
    KEY_CODES.BACKSPACE, KEY_CODES.DELETE, KEY_CODES.HOME, KEY_CODES.END,
    KEY_CODES.ARROW_LEFT, KEY_CODES.ARROW_RIGHT, KEY_CODES.ARROW_DOWN, KEY_CODES.ARROW_UP,
];
class NumberSelectEditor extends BaseComponent {
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

    moveUp() {
        const { currentFocus } = this.state;
        if (currentFocus === 1) {
            this.increase();
        } else if (currentFocus === 2) {
            this.selectPrev();
        }
    }

    moveDown() {
        const { currentFocus } = this.state;
        if (currentFocus === 1) {
            this.decrease();
        } else if (currentFocus === 2) {
            this.selectNext();
        }
    }

    increase() {
        const { step } = this.props;
        const { value1, value2 } = this.state;
        let value = Number(value1);
        if (Number.isNaN(value)) {
            value = 0;
        }
        this.setValue([value + step, value2]);
    }

    decrease() {
        const { step } = this.props;
        const { value1, value2 } = this.state;
        let value = Number(value1);
        if (Number.isNaN(value)) {
            value = 0;
        }
        this.setValue([value - step, value2]);
    }

    selectNext() {
        const { value2 } = this.state;
        const { source } = this.props;
        const selectedIndex = source.findIndex(s => s.id === value2);
        if (selectedIndex < source.length - 1) {
            this.setState({ value2: source[selectedIndex + 1].id });
        } else {
            this.setState({ value2: source[source.length - 1].id });
        }
    }

    selectPrev() {
        const { value2 } = this.state;
        const { source } = this.props;
        const selectedIndex = source.findIndex(s => s.id === value2);
        if (selectedIndex >= 1) {
            this.setState({ value2: source[selectedIndex - 1].id });
        } else {
            this.setState({ value2: source[0].id });
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

    round(value) {
        const { precision } = this.props;
        if (typeof precision !== 'number') {
            return value;
        }
        return value.toFixed(precision);
    }

    parseValue1(v) {
        if (v === null || v === undefined || v === '') {
            return '';
        }
        const value = Number(v);
        if (Number.isNaN(value)) {
            return '';
        }
        return value;
    }

    parseValue2(v) {
        const { source } = this.props;
        const selectedItem = source.find(s => s.id === v);
        return (selectedItem && selectedItem.id) || null;
    }

    setValue = (v) => {
        if (Array.isArray(v)) {
            this.setState({
                value1: this.parseValue1(v[0]),
                value2: this.parseValue2(v[1]),
            });
        } else if (typeof v === 'string') {
            const arr = v.split(',');
            this.setState({
                value1: this.parseValue1(arr[0]),
                value2: this.parseValue2(arr[1]),
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
        return `${this.formatValue(value1, '')},${value2 || ''}`;
    }

    refElementR = (ref) => {
        this.elementR = ref;
    }

    onFocusL = () => this.setState({ currentFocus: 1 });

    onFocusR = () => this.setState({ currentFocus: 2 });

    getPopupContainer = () => {
        const { container } = this.props;
        return container;
    }

    open() {
        this.setState({ currentFocus: 1 });
    }

    close() {
        this.setState({ currentFocus: 0 });
    }

    render() {
        const { value1, value2, currentFocus } = this.state;
        const {
            source, min, max, step,
        } = this.props;
        const options = source.map(s => (
            <Select.Option key={s.id} value={s.id}>
                {s.name}
            </Select.Option>
        ));
        return (
            <div className="ht-antd-number-select">
                <InputNumber
                    className="ht-antd-number-select-l"
                    ref={this.refElement}
                    onChange={this.onChangeL}
                    value={value1}
                    min={min}
                    max={max}
                    step={step}
                    onFocus={this.onFocusL}
                    onKeyDown={this.onKeyDown}
                />
                <Select
                    className="ht-antd-number-select-r"
                    dropdownClassName="ht-antd-dropdown"
                    ref={this.refElementR}
                    onChange={this.onChangeR}
                    value={value2}
                    onFocus={this.onFocusR}
                    open={currentFocus === 2}
                    getPopupContainer={this.getPopupContainer}
                    dropdownMatchSelectWidth={false}
                    onKeyDown={this.onKeyDown}
                >
                    { options}
                </Select>
            </div>
        );
    }
}

class AntdNumberSelectEditor extends AntdBaseEditor {
    handleKeyCodes = {
        ...InputKeyCodeHandlers,
        [Handsontable.helper.KEY_CODES.ARROW_UP]: (editor) => {
            editor.reactComponent.moveUp();
            return false;
        },
        [Handsontable.helper.KEY_CODES.ARROW_DOWN]: (editor) => {
            editor.reactComponent.moveDown();
            return false;
        },
        [Handsontable.helper.KEY_CODES.ARROW_LEFT]: editor => !editor.reactComponent.moveLeft(),
        [Handsontable.helper.KEY_CODES.ARROW_RIGHT]: editor => !editor.reactComponent.moveRight(),
    }

    open() {
        super.open();
        this.reactComponent.open();
    }

    close() {
        super.close();
        this.reactComponent.close();
    }

    render() {
        return (
            <NumberSelectEditor
                {...this.cellProperties}
                onSubmit={this.onSubmit}
                onCancel={this.onCancel}
                container={this.instance.rootElement}
            />
        );
    }
}

function renderer(value, cellProperties) {
    let v1;
    let v2;
    if (Array.isArray(value)) {
        ([v1, v2] = value);
    } else if (typeof value === 'string') {
        const arr = value.split(',');
        ([v1, v2] = arr);
    } else {
        v1 = null;
        v2 = null;
    }
    const { source } = cellProperties;
    const selectedItem = source.find(s => s.id === v2);
    v2 = (selectedItem && selectedItem.name);
    if (v1 === null || v1 === undefined) {
        v1 = '';
    }
    if (v2 === null || v2 === undefined) {
        v2 = '';
    }
    const arrow = '<span class="ant-select-arrow" unselectable="on" style="user-select: none;"><i class="anticon anticon-down ant-select-arrow-icon"><svg viewBox="64 64 896 896" class="" data-icon="down" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z"></path></svg></i></span>';
    const html = `<div class="ht-antd-number-select-l">${v1}</div><div class="ht-antd-number-select-r">${v2}${arrow}</div>`;
    return html;
}


export default {
    editor: AntdNumberSelectEditor,
    renderer: makeAntdRenderer(renderer),
    className: 'ht-antd-number-select',
};
