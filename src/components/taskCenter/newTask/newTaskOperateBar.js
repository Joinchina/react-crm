import React, { Component } from 'react';
import { Row, Col, Input, Checkbox, Select, Button, Modal, DatePicker, Dropdown, Menu } from 'antd';
import { Form, fieldBuilder, RenderEditor } from '../../common/form';
import { SelectSingleTaskType, subTypesForPrimaryType } from '../../common/SelectSingleTaskType';
import moment from 'moment';
import './newTaskOperateBar.scss';
import { closest, hasClass } from '../../../helpers/dom';

const Alignment = {
    points: [ 'bl', 'tl' ],
    offset: [ 0, -4 ],
    overflow: {
        adjustX: 0,
        adjustY: 1,
    },
}

const formDef = Form.def({
    content: fieldBuilder().validator(()=>null),
    taskType: fieldBuilder().validator(()=>null),
    taskReclassify: fieldBuilder().validator(()=>null),
    remarks: fieldBuilder().validator(()=>null),
});

const Today = moment().hour(23).minute(59).second(59).millisecond(999);

export default class NewTaskOperateBar extends Component {

    state = {};

    componentWillReceiveProps(nextProps){
        if (this.props.patientId !== nextProps.patientId) {
            this.form && this.form.resetFields();
        }
    }

    completeTask = () => {
        this.form.validateFields((err, values) => {
            const isFromTaskDetail = this.props.task ? true : false;
            if (!isFromTaskDetail) {
                if (!values.content) {
                    this.form.setFields({
                        content: {
                            errors: ['请填写主题']
                        }
                    });
                    return;
                }
                if (!values.taskType) {
                    this.form.setFields({
                        taskType: {
                            errors: ['请选择任务类型']
                        }
                    });
                    return;
                }
                if (!values.taskReclassify) {
                    this.form.setFields({
                        taskReclassify: {
                            errors: ['请选择任务类型']
                        }
                    });
                    return;
                }
            }
            if (!values.remarks) {
                this.form.setFields({
                    remarks: {
                        errors: ['请填写备注']
                    }
                });
                return;
            }
            let params;
            if (isFromTaskDetail) {
                params = {
                    remarks: values.remarks,
                    taskStatus: 2,
                    objectType: this.props.isPotential ? 4 : 0,
                    objectId: this.props.patientId
                };
            } else {
                params = {
                    content: values.content,
                    remarks: values.remarks,
                    taskType: Number(values.taskType.id),
                    taskReclassify: Number(values.taskReclassify.id),
                    taskStatus: 2,
                    objectType: this.props.isPotential ? 4 : 0,
                    objectId: this.props.patientId
                };
            }
            this.props.onNewProcessTask(params);
        });
    }

    delayTask = () => {
        this.form.validateFields((err, values) => {
            const isFromTaskDetail = this.props.task ? true : false;
            if (!isFromTaskDetail) {
                if (!values.content) {
                    this.form.setFields({
                        content: {
                            errors: ['请填写主题']
                        }
                    });
                    return;
                }
                if (!values.taskType) {
                    this.form.setFields({
                        taskType: {
                            errors: ['请选择任务类型']
                        }
                    });
                    return;
                }
                if (!values.taskReclassify) {
                    this.form.setFields({
                        taskReclassify: {
                            errors: ['请选择任务类型']
                        }
                    });
                    return;
                }
            }
            if (!values.remarks) {
                this.form.setFields({
                    remarks: {
                        errors: ['请填写备注']
                    }
                });
                return;
            }
            let params;
            if (isFromTaskDetail) {
                params = {
                    remarks: values.remarks,
                    taskStatus: 1,
                    objectType: this.props.isPotential ? 4 : 0,
                    objectId: this.props.patientId
                };
            } else {
                params = {
                    content: values.content,
                    remarks: values.remarks,
                    taskType: Number(values.taskType.id),
                    taskReclassify: Number(values.taskReclassify.id),
                    taskStatus: 1,
                    objectType: this.props.isPotential ? 4 : 0,
                    objectId: this.props.patientId
                };
            }
            this.props.onNewProcessTask(params);
        });
    }

    transfer = () => {
        this.form.validateFields((err, values) => {
            const isFromTaskDetail = this.props.task ? true : false;
            if (!isFromTaskDetail) {
                if (!values.content) {
                    this.form.setFields({
                        content: {
                            errors: ['请填写主题']
                        }
                    });
                    return;
                }
                if (!values.taskType) {
                    this.form.setFields({
                        taskType: {
                            errors: ['请选择任务类型']
                        }
                    });
                    return;
                }
                if (!values.taskReclassify) {
                    this.form.setFields({
                        taskReclassify: {
                            errors: ['请选择任务类型']
                        }
                    });
                    return;
                }
            }
            if (!values.remarks) {
                this.form.setFields({
                    remarks: {
                        errors: ['请填写备注']
                    }
                });
                return;
            }
            let params;
            if (isFromTaskDetail) {
                params = {
                    remarks: values.remarks,
                    taskStatus: 1,
                    objectType: this.props.isPotential ? 4 : 0,
                    objectId: this.props.patientId
                };
            } else {
                params = {
                    content: values.content,
                    remarks: values.remarks,
                    taskType: Number(values.taskType.id),
                    taskReclassify: Number(values.taskReclassify.id),
                    taskStatus: 1,
                    objectType: this.props.isPotential ? 4 : 0,
                    objectId: this.props.patientId
                };
            }
            this.props.onTransfer(params);
        });
    }

    onTaskTypeChange = (value) => {
        this.form.setFields({
            taskReclassify: {
                value: undefined,
            }
        });
        if (value) {
            const selectedType = this.taskType.find(t => t.id === Number(value));
            this.setState({ selectedType });
        }
    }

    render() {
        const SelectSingleTaskTypeNew = SelectSingleTaskType.forGroupType(2);//新建任务只能选择新类型的类型（一级）
        const isFromTaskDetail = this.props.task ? true : false;
        const selectedTaskTypeId = this.props.operateData && this.props.operateData.taskType && this.props.operateData.taskType.value && this.props.operateData.taskType.value.id;
        return <div className="task-operate-bar">
            <Form def={formDef} data={this.props.operateData} onFieldsChange={this.props.onOperateDataChange} formRef={form=>this.form = form}>
                <Row gutter={10} style={{marginBottom:10}}>
                    <Col span={10}>
                        <Form.Item field="content" height="auto">
                            <Input maxLength='200' placeholder="主题" disabled={isFromTaskDetail}/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Row gutter={10}>
                            <Col span={8}></Col>
                            <Col span={8}>
                                <Form.Item field="taskType" height="auto">
                                    <SelectSingleTaskTypeNew disabled={isFromTaskDetail} getPopupContainer={closest(hasClass('task-operate-bar'))} placeholder="类型（一级）" allowClear/>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item field="taskReclassify" height="auto">
                                    <RenderEditor
                                        disabled={isFromTaskDetail}
                                        type={subTypesForPrimaryType(selectedTaskTypeId)}
                                        placeholder="类型（二级）"
                                        allowClear
                                        normalize="unselectNonMatched"
                                        getPopupContainer={closest(hasClass('task-operate-bar'))}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Col>
                    <Col span={2}></Col>
                    <Col span={4} style={{ textAlign: 'center' }}>
                        <Button type="primary" onClick={this.completeTask} style={{width: '60%'}}>完成</Button>
                    </Col>
                </Row>
                <Row gutter={10}>
                    <Col span={18}>
                        <Form.Item field="remarks" height="auto">
                            <Input maxLength='500' placeholder="备注：记录通话情况及处理结果"/>
                        </Form.Item>
                    </Col>
                    <Col span={3}></Col>
                    <Col span={2}>
                        <Row className="oprow">
                            <Col span={12}>
                                <div className="oplink" onClick={this.delayTask}>稍后</div>
                            </Col>
                            <Col span={12}>
                                <div className="oplink" onClick={this.transfer}>转移</div>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Form>
        </div>
    }
}
