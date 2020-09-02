import React, { Component } from 'react';
import { forTaskType as selectSingleTaskAnswerStatusForTaskType } from '../../common/SelectSingleTaskAnswerStatus';
import { forTaskType as selectSingleTaskDealStatusForTaskType } from '../../common/SelectSingleTaskDealStatus';
import { Row, Col, Input, Checkbox, Select, Button, Modal, DatePicker, Dropdown, Menu } from 'antd';
import message from '@wanhu/antd-legacy/lib/message'
import { Form, fieldBuilder } from '../../common/form';
import moment from 'moment';
import { closest, hasClass } from '../../../helpers/dom';
import './taskOperateBar.scss';

const Alignment = {
    points: [ 'bl', 'tl' ],
    offset: [ 0, -4 ],
    overflow: {
        adjustX: 0,
        adjustY: 1,
    },
}

const formDef = Form.def({
    answerStatus: fieldBuilder().validator(()=>null),
    messageTemplate: fieldBuilder().validator(()=>null),
    dealStatus: fieldBuilder().validator(()=>null),
    resultStatus: fieldBuilder().validator(()=>null),
    remarks: fieldBuilder().maxLength('500'),
    delayTime: fieldBuilder().validator(()=>null),
});

const Today = moment().hour(23).minute(59).second(59).millisecond(999);

export default class TaskOperateBar extends Component {

    alertError(msg) {
        message.error(msg, 3);
    }

    completeTaskWithFreeze = (freeze) => {
        if (freeze && freeze.key) {
            freeze = freeze.key;
        }
        this.form.validateFields((err, values) => {
            if (!values.answerStatus) {
                this.form.setFields({
                    answerStatus: {
                        value: values.answerStatus,
                        errors: ['请选择接听状态']
                    }
                });
                return;
            }

            const answerStatus = values.answerStatus;
            const r = {
                answerStatus,
                remarks: values.remarks
            };
            if(this.props.messageTemplateData && this.props.messageTemplateData.length) {
                if(!values.messageTemplate) {
                    this.form.setFields({
                        messageTemplate: {
                            value: values.messageTemplate,
                            errors: ['请选择短信发送模板']
                        }
                    });
                    return;
                }
                r.templateId = values.messageTemplate;
            }
            const needDeal = answerStatus.allowDeal;
            if (needDeal){
                if (!values.dealStatus) {
                    this.form.setFields({
                        dealStatus: {
                            value: values.dealStatus,
                            errors: ['请选择处理状态']
                        }
                    });
                    return;
                }
                const dealStatus = values.dealStatus;
                r.dealStatus = dealStatus;
                let fields;
                switch (dealStatus.taskResultType) {
                    case 'choice': {
                        if (!values.resultStatus) {
                            fields = fields || {};
                            fields.resultStatus = {
                                value: values.resultStatus,
                                errors: ['请选择处理结果']
                            };
                        }
                        r.resultStatus = values.resultStatus;
                    } break;
                    case 'delay': {
                        const delayTime = this.props.delayTime || values.delayTime;
                        if (!values.resultStatus) {
                            fields = fields || {};
                            fields.resultStatus = {
                                value: values.resultStatus,
                                errors: ['请选择延期原因']
                            };
                        }
                        if (!delayTime) {
                            fields = fields || {};
                            fields.delayTime = {
                                value: values.delayTime,
                                errors: ['请选择延期时间']
                            };
                        }
                        r.resultStatus = values.resultStatus;
                        r.delayTime = delayTime;
                    } break;
                    case 'delayNoReason': {
                        const delayTime = this.props.delayTime || values.delayTime;
                        if (!delayTime) {
                            fields = fields || {};
                            fields.delayTime = {
                                value: values.delayTime,
                                errors: ['请选择延期时间']
                            };
                        }
                        r.delayTime = delayTime;
                    } break;
                    default:
                }
                const needRemarks = dealStatus.needRemarks && (dealStatus.needRemarks === true || dealStatus.needRemarks === r.resultStatus);
                if (needRemarks && !values.remarks) {
                    fields = fields || {};
                    fields.remarks = {
                        value: values.remarks,
                        errors: ['请填写备注信息']
                    };
                }
                if (fields) {
                    this.form.setFields(fields);
                    return;
                }
            }
            this.props.onProcessTask({
                ...r,
                taskStatus: 2,
                freeze: freeze
            });
        });
    }

    completeTask = () => {
        this.completeTaskWithFreeze(undefined);
    }

    closeTask = () => {
        this.form.validateFields((err, values) => {
            const fields = {};
            let anyError;
            if (!values.remarks) {
                fields.remarks = {
                    value: values.remarks,
                    errors: ['请填写关闭任务原因']
                };
                anyError = true;
            }
            if (anyError) {
                this.form.setFields(fields);
                return;
            }
            Modal.confirm({
                title: '是否确认关闭任务，关闭后不可修改',
                onOk:() => {
                    this.props.onProcessTask({
                        ...values,
                        taskStatus: 4,
                    });
                },
                onCancel(){

                }
            });
        });
    }

    delayTask = () => {
        this.form.validateFields((err, values) => {
            const answerStatus = values.answerStatus;
            const r = {
                answerStatus,
                remarks: values.remarks
            };
            if (answerStatus) {
                const needDeal = answerStatus.allowDeal;
                if (needDeal){
                    const dealStatus = values.dealStatus;
                    r.dealStatus = dealStatus;
                    if (dealStatus) {
                        if (dealStatus.taskResultType === 'choice') {
                            r.resultStatus = values.resultStatus;
                        } else if (dealStatus.taskResultType === 'delay') {
                            const delayTime = this.props.delayTime || values.delayTime;
                            r.resultStatus = values.resultStatus;
                            r.delayTime = delayTime;
                        } else if (dealStatus.taskResultType === 'delayNoReason') {
                            const delayTime = this.props.delayTime || values.delayTime;
                            r.delayTime = delayTime;
                        }
                    }
                }
            }
            this.props.onProcessTask({
                ...r,
                taskStatus: 1,
            });
        });
    }

    changeAnswerStatus = val => {
        const allowDeal = val && val.allowDeal;
        if (!allowDeal) {
            if (this.form.getFieldValue('delayTime') || this.form.getFieldError('delayTime')) {
                this.form.resetFields(['delayTime']);
            }
        }
        this.form.resetFields(['messageTemplate']);
        this.props.handleGetMessageTemplate(this.props.patientId, { taskType: Number(this.props.taskType), answerStatus: Number(val.value) })
    }

    disabledPreviousDays = (date) => {
        return Today.isAfter(date);
    }

    transfer = () => {
        this.props.onTransfer();
    }

    render() {
        const SelectSingleTaskAnswerStatus = selectSingleTaskAnswerStatusForTaskType(this.props.taskType);
        const SelectSingleTaskDealStatus = selectSingleTaskDealStatusForTaskType(this.props.taskType);

        let cols = 8;
        const formData = this.props.operateData || {};
        const answerStatus = formData.answerStatus && formData.answerStatus.value || {};
        const needDeal = answerStatus.allowDeal;
        const showDeal = needDeal && !answerStatus.hideDeal;
        if (showDeal) cols += 4;
        if (this.props.messageTemplateData && this.props.messageTemplateData.length) cols += 4;
        const dealStatus = formData.dealStatus && formData.dealStatus.value || {};
        let resultEditor = needDeal && dealStatus.taskResultType;
        if (resultEditor === 'choice' || resultEditor === 'addOrder') {
            cols += 4;
        } else if (resultEditor === 'delayNoReason') {
            cols += 4;
            if (this.props.delayTime) {
                cols += 4;
            }
        } else if (resultEditor === 'delay') {
            cols += 8;
            if (this.props.delayTime) {
                cols += 4;
            }
        }
        const dealFilter = this.props.delayDisabled ?
            (deal => deal.taskResultType !== 'delay' && deal.taskResultType !== 'delayNoReason') :
            null;

        return <div className="task-operate-bar">
            <Form def={formDef} data={this.props.operateData} onFieldsChange={this.props.onOperateDataChange} formRef={form=>this.form = form}>
                <Row gutter={10} style={{marginBottom:10}}>
                    <Col span={4}>
                        <Form.Item field="answerStatus" height="auto" onChange={this.changeAnswerStatus}>
                            <SelectSingleTaskAnswerStatus placeholder="选择接听状态"
                                getPopupContainer={closest(hasClass('task-operate-bar'))}
                                dropdownAlign={Alignment}
                                />
                        </Form.Item>
                    </Col>
                    <Col span={4}  style={{display: this.props.messageTemplateData && this.props.messageTemplateData.length ? undefined : 'none'}}>
                        <Form.Item field="messageTemplate" height="auto" >
                            <Select
                                placeholder="选择短信发送模板" getPopupContainer={closest(hasClass('task-operate-bar'))}
                                dropdownAlign={Alignment}
                                >
                                {
                                    this.props.messageTemplateData && this.props.messageTemplateData.map(result =>
                                    <Select.Option key={result.id} value={result.id}>{result.content}</Select.Option>)
                                }
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={4} style={{display: showDeal ? undefined : 'none'}}>
                        <Form.Item field="dealStatus" height="auto" onChange={()=>this.form.resetFields(['resultStatus', 'delayTime'])} >
                            <SelectSingleTaskDealStatus nonNull filter={dealFilter} placeholder="选择处理状态"
                                getPopupContainer={closest(hasClass('task-operate-bar'))}
                                dropdownAlign={Alignment}
                                />
                        </Form.Item>
                    </Col>
                    <Col span={4} style={{display: resultEditor === 'addOrder' ? undefined : 'none'}}>
                        <Button style={{width:'100%'}} type="primary" onClick={this.props.onNewOrder}>登记用药</Button>
                    </Col>
                    <Col span={4} style={{display: (resultEditor === 'choice' || resultEditor === 'delay') ? undefined : 'none'}}>
                        <Form.Item field="resultStatus" height="auto">
                            <Select
                                placeholder={resultEditor === 'choice' ? "选择处理结果" : "选择延期原因"} getPopupContainer={closest(hasClass('task-operate-bar'))}
                                dropdownAlign={Alignment}
                                >
                                {
                                    dealStatus.taskResult && dealStatus.taskResult.map(result =>
                                    <Select.Option key={result.id} value={result.value}>{result.name}</Select.Option>)
                                }
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={4} style={{display: (resultEditor === 'delay' || resultEditor === 'delayNoReason') && !this.props.delayTime ? undefined : 'none'}}>
                        <Form.Item field="delayTime" height="auto">
                            <DatePicker style={{width:'100%'}} placeholder="选择延期时间" disabledDate={this.disabledPreviousDays}
                                getCalendarContainer={closest(hasClass('task-operate-bar'))}
                                placement="topLeft"
                            />
                        </Form.Item>
                    </Col>
                    {
                        (resultEditor === 'delay' || resultEditor === 'delayNoReason') && this.props.delayTime ?
                        <Col span={8}>
                            <span style={{color:'white',lineHeight:'32px'}}>最终回收日期：{ this.props.delayTime.format('YYYY-MM-DD dddd') }</span>
                        </Col> : null
                    }
                    <Col span={24 - cols}></Col>
                    <Col span={4}>
                        <Dropdown.Button className="opbutton" type="primary"
                            onClick={this.completeTask} trigger={['click']}
                            overlay={<Menu onClick={this.completeTaskWithFreeze} selectedKeys={[]}>
                                <Menu.Item key="1">完成并冻结本类任务</Menu.Item>
                                <Menu.Item key="2">完成并冻结所有类型任务</Menu.Item>
                            </Menu>}
                            placement="topRight"
                            getPopupContainer={closest(hasClass('task-operate-bar'))}
                            >
                            完成
                        </Dropdown.Button>
                    </Col>
                </Row>
                <Row gutter={10}>
                    <Col span={12}>
                        <Form.Item field="remarks" height="auto">
                            <Input placeholder="备注：记录通话情况"/>
                        </Form.Item>
                    </Col>
                    <Col span={8}></Col>
                    <Col span={4}>
                        <Row className="oprow">
                            <Col span={8}>
                                <div className="oplink" onClick={this.delayTask}>稍后</div>
                            </Col>
                            <Col span={8}>
                                <div className="oplink" onClick={this.transfer}>转移</div>
                            </Col>
                            <Col span={8}>
                                <div className="oplink" onClick={this.closeTask}>关闭</div>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Form>
        </div>
    }
}

class FreezeCheckBox extends Component {

    onCheckOne = (e) => {
        const checked = e.target.checked;
        this.props.onChange(checked ? 1 : undefined);
    }

    onCheckTwo = (e) => {
        const checked = e.target.checked;
        this.props.onChange(checked ? 2 : undefined);
    }

    render() {
        return <div style={{color:'white'}}>
            <Checkbox checked={this.props.value === 1} onChange={this.onCheckOne}>冻结本类任务</Checkbox>
            <Checkbox checked={this.props.value === 2} onChange={this.onCheckTwo}>冻结所有类型任务</Checkbox>
        </div>
    }
}
