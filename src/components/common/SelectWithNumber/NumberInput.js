import React, { Component } from 'react';

export default class SelectWithNumber extends Component {

    state = {

    }

    focus() {
        if (this.input) {
            this.input.focus();
            this.selectAll();
        }
    }

    selectAll() {
        if (this.input && this.input.setSelectionRange) {
            setTimeout(() => this.input.setSelectionRange(0, this.input.value.length));
        }
    }

    refInput = ref => this.input = ref;

    onChange = e => {
        const match = /\d+/.exec(e.target.value);
        let v;
        if (match) {
            v = Number(match[0]);
        } else {
            v = undefined;
        }
        this.props.onChange(v);
    }

    onIncrease = e => {
        this.props.onChange(1 + (Number(this.props.value) || 0));
        this.selectAll();
    }

    onDecrease = e => {
        this.props.onChange(-1 + (Number(this.props.value) || 0));
        this.selectAll();
    }

    preventDefault = e => {
        e.preventDefault();
        e.stopPropagation();
    }

    onFocus = e => {
        this.setState({ focused: true });
        if (this.props.onFocus) {
            this.props.onFocus(e);
        }
    }

    onBlur = e => {
        this.setState({ focused: false });
        if (this.props.onBlur) {
            this.props.onBlur(e);
        }
    }

    stopPropagation = e => {
        e.stopPropagation();
    }

    render() {
        const { style, className = '', value, onChange, onFocus, onBlur, ...restProps } = this.props;
        return <div className={`wh-input-number ${className} ${this.state.focused ? 'wh-input-number-focused': ''}`}
            style={style}
            onClick={this.stopPropagation}
            >
            <input type="text"
                ref={this.refInput} {...restProps} className="ant-input"
                value={`${value}`}
                onChange={this.onChange}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                />
            <button className="minus" onMouseDown={this.preventDefault} onClick={this.onDecrease}>-</button>
            <button className="plus" onMouseDown={this.preventDefault} onClick={this.onIncrease}>+</button>
        </div>
    }
}
