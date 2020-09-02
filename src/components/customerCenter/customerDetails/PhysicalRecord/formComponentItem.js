import React, { Component } from 'react';
import { Select, Row, Col, Input } from 'antd';
import { closestScrollableArea } from '../../../../helpers/dom';

class SelectScrUnit extends Component {
    render(){
        return <Select allowClear {...this.props} getPopupContainer={closestScrollableArea}
                    placeholder="请选择单位"
                >
            <Select.Option value="1">umol/L</Select.Option>
            <Select.Option value="2">mg/dl</Select.Option>
        </Select>;
    }
}

class SelectMAU extends Component {
    render() {
        return <Select allowClear {...this.props}
            getPopupContainer={closestScrollableArea}
            placeholder="请选择">
                <Select.Option value="1">ug/min</Select.Option>
                <Select.Option value="2">mg/24h</Select.Option>
            </Select>
    }
}

export { SelectMAU, SelectScrUnit };





class SelectDrink extends Component {
    render() {
        return <Select allowClear {...this.props}
            getPopupContainer={closestScrollableArea}
            placeholder="请选择酒类">
                <Select.Option value="1">白酒(两)</Select.Option>
                <Select.Option value="2">啤酒(瓶)</Select.Option>
                <Select.Option value="3">红酒(杯)</Select.Option>
            </Select>
    }
}

export { SelectDrink };



const fundoscopyMapOne = [
    { value: "1", label: '正常' },
    { value: '2', label: '非增殖期糖尿病视网膜病变' },
    { value: '3', label: '增殖期糖尿病视网膜病变' },
]

const fundoscopyMapTwo = [
    { value: "4", label: '高血压视网膜病变Ⅰ级' },
    { value: '5', label: '高血压视网膜病变Ⅱ级' },
    { value: '6', label: '高血压视网膜病变Ⅲ级' },
    { value: '7', label: '高血压视网膜病变Ⅳ级' },
]

export function SelectFundoscopy(props) {
    const arr = props.type === 1 ? fundoscopyMapOne.concat(fundoscopyMapTwo) :
                props.type === 2 ? fundoscopyMapOne :
                props.type === 3 ? [{ value: '1', label: '正常' }].concat(fundoscopyMapTwo) : [];
    return <Select {...props} allowClear
        getPopupContainer={closestScrollableArea}
        placeholder="请选择">
        {
            arr.map(o => <Select.Option key={o.value} value={o.value}>{o.label}</Select.Option>)
        }
    </Select>
}

export function SelectFootExamination(props) {
    return <Select {...props} allowClear getPopupContainer={closestScrollableArea}
        placeholder="请选择">
        <Select.Option value='-1'>正常</Select.Option>
        <Select.Option value='0'>0级</Select.Option>
        <Select.Option value="1">1级</Select.Option>
        <Select.Option value="2">2级</Select.Option>
        <Select.Option value="3">3级</Select.Option>
        <Select.Option value="4">4级</Select.Option>
        <Select.Option value="5">5级</Select.Option>
    </Select>
}

export function SelectPNP(props) {
    return <Select {...props} allowClear getPopupContainer={closestScrollableArea}
        placeholder="请选择">
        <Select.Option value='0'>无</Select.Option>
        <Select.Option value="1">轻度</Select.Option>
        <Select.Option value="2">中度</Select.Option>
        <Select.Option value="3">重度</Select.Option>
    </Select>
}

export function SelectIsExercise(props) {
    return <Select {...props} allowClear getPopupContainer={closestScrollableArea}
        placeholder="请选择">
        <Select.Option value='0'>否</Select.Option>
        <Select.Option value="1">是</Select.Option>
    </Select>
}

export function SelectAppetite(props) {
    return <Select {...props} allowClear getPopupContainer={closestScrollableArea}
        placeholder="请选择">
        <Select.Option value='1'>轻</Select.Option>
        <Select.Option value="2">重</Select.Option>
    </Select>
}

export function SelectIsOral(props) {
    return <Select {...props} allowClear getPopupContainer={closestScrollableArea}
        placeholder="请选择">
        <Select.Option value='0'>未完成</Select.Option>
        <Select.Option value="1">已完成</Select.Option>
    </Select>
}
