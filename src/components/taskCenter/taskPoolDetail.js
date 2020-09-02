import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { InputNumber, Input, Button, Row, Col, Select, Breadcrumb, Affix } from 'antd';
import message from '@wanhu/antd-legacy/lib/message';
import { Form, ViewOrEdit, fieldBuilder as field, formBuilder as form } from '../common/form';
import Title from '../common/Title'
import TaskFilterEdit from '../common/TaskFilterEdit';
import SelectSystemUser from '../common/SelectSystemUser';
import SelectSystemUserGroup from '../common/SelectSystemUserGroup';
import TaskPoolEffectiveRuleEditor, { validateEffectiveRule } from '../common/TaskPoolEffectiveRuleEditor';
import Constant from '../common/Constant';
import AsyncEvent from '../common/AsyncEvent';
import moment from 'moment';
import { testPermission } from '../common/HasPermission';

import { connect } from '../../states/taskCenter/taskPoolDetail';
import { connectRouter } from '../../mixins/router';

const formDef = Form.def(
    {
        name: field().required('请输入任务池名称')
                     .maxLength(50),
        status: field(),
        users: field(),
        userGroup: field(),
        filters: field().required('请至少添加一个筛选条件'),
        effectiveRule: field()
                       .required('请选择一个有效规则'),
        acceptRule: field().required().initialValue(true),
        returnRule: field().required('请输入正确的超期天数')
                           .maxLength(3, '请输入正确的超期天数')
                           .integer('请输入正确的超期天数')
                           .minMax(1, 999, '请输入正确的超期天数'),
        remarks: field().maxLength(100),
    },
    form()
        .fieldValidator('effectiveRule', validateEffectiveRule)
        .requiredAny(['users', 'userGroup'], '请至少选择一个用户或用户组')
        .nestedForm('filters')
);

const formItemStyle = {
    labelCol: { span:2 },
    wrapperCol: { span:22 }
};

const halfFormItemStyle = {
    labelCol: { span:4 },
    wrapperCol: { span:20 }
};

const TaskPoolStatus = {
    1: '正常',
    2: '禁用',
};

const styles = {
    box: {
        padding: 20
    },
    foot: {
        textAlign: 'center',
        height: 60,
        lineHeight: '60px'
    },
    footBtn: {
        marginRight: 10
    }
}

class TaskPoolDetail extends Component {

    constructor(props){
        super(props);
        this.taskPoolId = this.props.match.params.taskPoolId;
    }

    componentWillMount(){
        this.props.getTaskPoolById(this.taskPoolId);
    }

    componentWillUnmount(){
        this.props.resetPage();
    }

    componentWillReceiveProps(props) {
        if (this.taskPoolId !== props.match.params.taskPoolId) {
            this.taskPoolId = this.props.match.params.taskPoolId;
            this.props.resetPage();
            this.props.getTaskPoolById(this.taskPoolId);
        }
    }

    initData = fields => {
        this.form.setFieldsValue(fields);
    }

    saveTaskPool = () => {
        this.form.validateFieldsAndScroll({ force: true }, (err, values) => {
            if (err) {
                console.log('验证失败', err, values);
            } else {
                this.props.saveTaskPool(this.taskPoolId, values);
            }
        });
    }

    editStatusChanged = (val) => {
        if (val) {
            this.props.backupFormAndBeginEdit(this.props.formData);
        } else {
            this.props.stopFormEdit(this.props.formEdit.fields);
        }
    }

    cancelEdit = () => {
        this.props.stopFormEdit(this.props.formEdit.fields);
    }

    successfulFinishEdit = () => {
        message.success('保存成功', 3);
        this.props.stopFormEdit();
    }

    get returnToTaskListUrl(){
        if (this.props.router.query.r && this.props.router.query.r.indexOf('/taskPoolList') === 0) {
            return this.props.router.query.r;
        } else {
            return '/taskPoolList';
        }
    }

    render(){
        const allowEdit = testPermission('crm.task_pool.edit');
        return <div>
            <Breadcrumb className='breadcrumb-box'>
                <Breadcrumb.Item>
                    <Link to={this.returnToTaskListUrl}>任务池管理</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    任务池详情
                </Breadcrumb.Item>
            </Breadcrumb>
            <div className='block'>
                <Title left={10}>
                    任务池详情
                </Title>
                <div style={styles.box}>
                    <Form def={formDef}
                        data={this.props.formData}
                        onFieldsChange={this.props.updateFormField}
                        formRef={form => this.form = form}
                        hideRequiredMark={!this.props.formEdit.editing}
                        >
                        <ViewOrEdit.Group value={this.props.formEdit.editing} onChange={this.editStatusChanged} disabled={!allowEdit}>
                            <Row>
                                <Col span={12}>
                                    <Form.Item field="name" label="名称" {...halfFormItemStyle}>
                                        <ViewOrEdit placeholder="-" editComponent={Input}/>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item field="status" label="状态" {...halfFormItemStyle}>
                                        <ViewOrEdit
                                            viewRenderer={props => TaskPoolStatus[props.value]}
                                            editRenderer={props => <Select {...props}>
                                                <Select.Option value="1">{TaskPoolStatus[1]}</Select.Option>
                                                <Select.Option value="2">{TaskPoolStatus[2]}</Select.Option>
                                            </Select>}/>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.Item field="users" label="用户" {...formItemStyle}>
                                <ViewOrEdit
                                    viewRenderer={props => <SelectSystemUser.Viewer {...props} keyword="用户"/>}
                                    editRenderer={props => <SelectSystemUser {...props} keyword="用户"/>} />
                            </Form.Item>
                            <Form.Item field="userGroup" label="用户组" {...formItemStyle}>
                                <ViewOrEdit
                                    viewRenderer={props => <SelectSystemUserGroup.Viewer {...props} keyword="用户组"/>}
                                    editRenderer={props => <SelectSystemUserGroup {...props} keyword="用户组"/>} />
                            </Form.Item>
                            <Form.Item field="effectiveRule" label="有效规则" {...formItemStyle}>
                                <ViewOrEdit
                                    viewRenderer={props => {
                                        if (!props.value) return '-';
                                        if (props.value.rule == 1) {
                                            return '长期有效';
                                        } else if (props.value.rule == 2) {
                                            return `从 ${moment(props.value.range[0]).format('YYYY-MM-DD')} 至 ${moment(props.value.range[1]).format('YYYY-MM-DD')} 有效`;
                                        } else {
                                            return `未知规则：${props.value.rule}`
                                        }
                                    }}
                                    editRenderer={props => <TaskPoolEffectiveRuleEditor {...props}/> }/>
                            </Form.Item>
                            <Form.Item field="acceptRule" label="领取规则" {...formItemStyle}>
                                <ViewOrEdit
                                    changeEditingDisabled={true}
                                    viewRenderer={props => '按创建时间顺序'}
                                    editRenderer={props => <span><Constant constant={1} {...props}/> 按创建时间顺序</span> }/>
                            </Form.Item>
                            <Form.Item field="returnRule" label="归还规则" {...formItemStyle}>
                                <ViewOrEdit
                                    viewRenderer={props => `未完成超期${props.value}天自动归还`}
                                    editRenderer={props => <span>
                                        未完成超期自动归还 <Form.Item.Editor><InputNumber {...props} placeholder="请输入超期天数" style={{width: 140}}/></Form.Item.Editor>
                                    </span>}/>
                            </Form.Item>
                            <Form.Item field="remarks" label="说明" {...formItemStyle}>
                                <ViewOrEdit
                                    editRenderer={props => <Input type="textarea" {...props} autosize={{minRows: 2, maxRows: 4}}/> } />
                            </Form.Item>
                            <Form.Item field="filters" label="筛选条件" {...formItemStyle}>
                                <ViewOrEdit
                                    viewRenderer={props => <TaskFilterEdit.Viewer {...props} style={{marginBottom:10}}/>}
                                    editRenderer={props => <TaskFilterEdit {...props}/>} />
                            </Form.Item>
                        </ViewOrEdit.Group>
                    </Form>
                </div>
            </div>
            { this.props.formEdit.editing ?
                <Affix offsetBottom={0} ref={affix => affix && affix.updatePosition({})}>
                    <div className='block' style={styles.foot}>
                        <Button style={styles.footBtn} loading={this.props.saveTaskPoolResult.status === 'pending'} onClick={this.saveTaskPool} type='primary'>保存</Button>
                        <Button disabled={this.props.saveTaskPoolResult.status === 'pending'} onClick={this.cancelEdit} className='cancelButton'>取消</Button>
                    </div>
                </Affix>
                : null
            }
            <AsyncEvent async={this.props.saveTaskPoolResult} onFulfill={this.successfulFinishEdit} alertError/>
            <AsyncEvent async={this.props.taskPool} onFulfill={this.initData} alertError/>
        </div>;
    }
}

export default connectRouter(connect(TaskPoolDetail));
