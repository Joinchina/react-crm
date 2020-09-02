import React, { Component } from 'react';
import { Radio, DatePicker } from 'antd';

const effectiveRuleOptions = [
    { value: '1', label: '长期有效' },
    { value: '2', label: '指定时间内有效' }
];

export default class TaskPoolEffectiveRuleEditor extends Component {

    updateRule = (e) => {
        if (this.props.onChange) {
            this.props.onChange({
                rule: e.target.value,
                range: this.props.value && this.props.value.range
            });
        }
    }

    updateRange = (range) => {
        if (this.props.onChange) {
            this.props.onChange({
                range,
                rule: this.props.value && this.props.value.rule || '2'
            });
        }
        if (this.props.onChangeRange) {
            this.props.onChangeRange(range);
        }
    }

    render(){
        const value = this.props.value;
        const rule = value && value.rule;
        const range = value && value.range;

        return <div>
            <Radio.Group options={effectiveRuleOptions} value={rule} onChange={this.updateRule}/>
            <DatePicker.RangePicker value={range} onChange={this.updateRange} disabled={rule === '1'}/>
        </div>
    }
}

export function validateEffectiveRule(val) {
    if (val && val.rule === '2' && !val.range) {
        return '不能为空';
    }
    return null;
}
