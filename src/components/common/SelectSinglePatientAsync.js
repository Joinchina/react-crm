import React, { Component } from 'react';
import { Select, Spin } from 'antd';
import timeout from '../../helpers/timeout'
import { connect } from '../../states/components/selectSinglePatientAsync';
import SelectPlaceholder from './SelectPlaceholder';
import { closestScrollableArea } from '../../helpers/dom';

class SelectSinglePatientAsync extends Component {

    constructor(props) {
        super(props)
        this.state = {
            key: undefined
        }
    }

    searchPatient = async (key)=> {
        this.setState({ key });
        if(key) {
            this.props.searchPatientAction(key);
        } else {
            this.setState({ key: undefined });
            this.clearOptions()
        }
    }

    componentWillReceiveProps(props) {
        if(this.props.patientList.status !== 'fulfilled' && props.patientList.status === 'fulfilled' && !this.state.key) {
            this.clearOptions()
        }
    }

    onSelect = value => {
        const label = this.mapValueToLabel(value);
        this.setState({
            key: label,
        })
        if(this.props.onSelect) {
            this.props.onSelect(value)
        }
    }

    onChange = value => {
        if(this.props.onSelect) {
            this.props.onSelect(value)
        }
    }

    mapValueToLabel = (value) => {
        return this.props.searchList.filter(o => o.value === value)[0].label;
    }

    mapDataToOption = data => {
        if(!data.length) {
            return null;
        }
        let options = data.map(o => <Select.Option key={o.value} value={o.value}>{o.label}</Select.Option>)
        if(data.length > 10){
          options.pop()
          options.push(<Select.Option key='more' value='more' disabled={true} style={{textAlign: 'center'}}>搜索结果过多，请尝试输入全名或其他信息</Select.Option>)
        }
        return options;
    }

    getNotFoundContent () {
        if (!this.state.key) {
            return null;
        }
        let status;
        if (this.props.patientList){
            status = this.props.patientList.status;
        } else {
            status = 'pending';
        }
        return status ? <SelectPlaceholder
            keyword={this.props.keyword} status={status} onReload={this.reload}
            loadingTip={this.props.loadingTip} errorTip={this.props.errorTip}
            emptyTip={this.props.emptyTip} /> : null;
    }

    clearOptions = () => {
        this.props.clearOptionsAction()
    }

    render() {
        const data = this.props.patientList.status === 'fulfilled' && this.props.patientList.payload;
        return (
            <Select
                showSearch
                allowClear
                filterOption={false}
                placeholder={this.props.placeholder}
                notFoundContent={this.getNotFoundContent()}
                onSearch={this.searchPatient}
                disabled={this.props.disabled}
                onChange={this.onChange}
                onBlur={this.clearOptions}
                getPopupContainer={closestScrollableArea}
                defaultActiveFirstOption={false}
                onSelect={this.onSelect}
                >
            { this.mapDataToOption(data) }
            </Select>
        )
    }
}

export default connect(SelectSinglePatientAsync);
