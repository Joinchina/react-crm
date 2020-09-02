import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Tag, Row, Col, Input, AutoComplete } from 'antd'


import NotEditableField from './NotEditableField'

import { getMedicineAction, getThrottleMedicineAction, resetDrugsAction } from '../../states/smartSelectForMedicine'

import SelectWithNumber from './SelectWithNumber';
const Option = SelectWithNumber.Option
import SelectPlaceholder from './SelectPlaceholder';

class SmartSelectForMedicine extends Component {

    constructor(pros) {
        super()
        this.state = {
        }
    }

    handleChange = (value) => {
        this.setState({ value })
        if (this.props.handleNameChange) {
            this.props.handleNameChange(this.props.uuid, 'name', value)
        }
        const onChange = this.props.onChange
        if (onChange) {
            onChange(value)
        }

        this.send(value);
    }

    send = (value) => {
        if (this.props.delay) {
            this.props.getThrottleMedicineAction(value, 0, 10, this.props.hospitalId)
        } else {
            if(window.STORE_LOGINNAME.split(',').indexOf(this.props.auth.loginName) >= 0){
                this.props.getMedicineAction(value, 0, 10, window.STORE_HOSPITALID)
            }else{
                this.props.getMedicineAction(value, 0, 10, this.props.hospitalId, this.props.patientId)
            }

        }
    }

    componentWillReceiveProps(nextProps) {
        if ('value' in nextProps) {
            this.setState({ value: nextProps.value })
        }
    }

    loadNextPage = () => {
        if (this.props.smartSelectForMedicine.status != 'pending') {
            if (this.props.smartSelectForMedicine.params) {
                let keyWord = this.state.value
                let limit = this.props.smartSelectForMedicine.params.limit
                let skip = this.props.smartSelectForMedicine.params.skip + limit
                this.props.getMedicineAction(keyWord, skip, limit, this.props.hospitalId, this.props.patientId);
            }
        }
    }

    mapAsyncDataToOption = data => {
        return data.map((row, index) => {
            let productName = row.productName ? `(${row.productName})` : ''
            let statusMap = { 0: '正常', 2: '目录外', 3: '停售' }
            let status
            if (row.status > 1) {
                status = <Tag style={{ marginLeft: 5 }} color='#e44d42'>{statusMap[row.status]}</Tag>
            }
            return (
                <Option key={index} value={JSON.stringify(row)}>
                    <Row>
                        <Col span={12} style={{ whiteSpace: 'normal' }}>
                            <span>{row.commonName}{productName}{status}</span>
                        </Col>
                        <Col span={12} style={{ whiteSpace: 'normal' }}>
                            <p>{row.preparationUnit + '*' + row.packageSize + row.minimumUnit + '/' + row.packageUnit}</p>
                            <p>{row.producerName}</p>
                        </Col>
                    </Row>
                </Option>
            )
        })
    }

    resetDrugs = () => {
        this.setState({
            value: ''
        });
        this.props.resetDrugsAction()
    }

    render() {
        let { uuid, handleNameChange, editStatus, notEditableOnly, ...rest } = this.props
        let value = this.state.value
        if (this.props.mapValueToAutoComplete) {
            value = this.props.mapValueToAutoComplete(value)
        } else {
            try {
                value = JSON.parse(value)
                if (typeof value === 'object') {
                    let productName = value.productName ? `(${value.productName})` : ''
                    value = value.commonName + productName
                } else {
                    value = String(value)
                }
            } catch (e) {
                // 这时候value是个字符串
            }
        }

        if (!editStatus || notEditableOnly === true) {
            return (
                <NotEditableField
                    editStatus={editStatus}
                    notEditableOnly={notEditableOnly}
                    hideBottomLine={true}
                >
                    {value}
                </NotEditableField>
            )
        }

        const fieldName = `medicine_${uuid}_name`
        let options = []
        if (value && this.props.smartSelectForMedicine && Array.isArray(this.props.smartSelectForMedicine.payload) && this.props.smartSelectForMedicine.payload.length) {
            options = this.props.mapAsyncDataToOption ? this.props.mapAsyncDataToOption(this.props.smartSelectForMedicine.payload) : this.mapAsyncDataToOption(this.props.smartSelectForMedicine.payload)
        } else if (value) {
            options.push(<Option key='null' value='notFound' disabled>
                <SelectPlaceholder keyword="药品" status={this.props.smartSelectForMedicine.status} />
            </Option>)
        }
        return (
            <div id={fieldName}>
                <SelectWithNumber
                    {...rest}
                    max={999}
                    value={value}
                    onChange={this.handleChange}
                    dropdownStyle={{ width: this.props.dropdownWidth ? this.props.dropdownWidth : 970 }}
                    onScrollToBottom={this.loadNextPage}
                    resetDrugs={this.resetDrugs}
                    getPopupContainer={() => document.getElementById(fieldName)}
                >
                    {options}
                </SelectWithNumber>
            </div>
        )
    }
}

function select(state) {
    return {
        auth: state.auth.payload,
        smartSelectForMedicine: state.smartSelectForMedicine
    }
}

function mapDispachToProps(dispatch) {
    return bindActionCreators({ getMedicineAction, getThrottleMedicineAction, resetDrugsAction }, dispatch)
}

export default connect(select, mapDispachToProps)(SmartSelectForMedicine)
