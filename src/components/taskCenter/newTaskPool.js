import React, { Component } from 'react';
import { InputNumber, Input, Button, Row, Modal } from 'antd';
import message from '@wanhu/antd-legacy/lib/message'
import { Form, fieldBuilder as field, formBuilder as form, RenderEditor } from '../common/form';
import TaskFilterEdit from '../common/TaskFilterEdit';
import { getLocation } from '../common/QueryRoute';
import SelectSystemUser from '../common/SelectSystemUser';
import SelectSystemUserGroup from '../common/SelectSystemUserGroup';
import TaskPoolEffectiveRuleEditor, { validateEffectiveRule } from '../common/TaskPoolEffectiveRuleEditor';
import Constant from '../common/Constant';
import AlertError from '../common/AlertError';
import connectModal from '../../mixins/modal';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { updateFormField, submitNewTaskPool, resetForm } from '../../states/taskCenter/newTaskPool';

const formDef = Form.def(
    {
        name: field().required('不能为空')
                     .maxLength(50),
        users: field(),
        userGroup: field(),
        filters: field().required('不能为空'),
        effectiveRule: field()
                       .required('不能为空'),
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
    labelCol: { span:3 },
    wrapperCol: { span:21 }
};


class NewTaskPool extends Component {

    hideModal = () => {
        this.props.resetForm();
        this.props.closeModal();
    }

    submit = () => {
        this.form.validateFieldsAndScroll({ force: true }, (err, values) => {
            if (err) {
                console.log('验证失败', err, values);
            } else {
                this.props.submitNewTaskPool(values);
            }
        });
    }

    componentWillReceiveProps(props) {
        if (props.submitStatus === 'fulfilled' && this.props.submitStatus !== 'fulfilled') {
            message.success('新建任务池成功', 3);
            this.hideModal();
        }
    }

    render(){
        const footer = <Row>
            <AlertError status={this.props.submitStatus} payload={this.props.submitPayload} />
            <Button loading={this.props.submitStatus === 'pending'} onClick={this.submit} type='primary'>保存</Button>
            <Button disabled={this.props.submitStatus === 'pending'} onClick={this.hideModal} className='cancelButton'>取消</Button>
        </Row>;
        return <Modal title='新建任务池'
                visible={true}
                maskClosable={false}
                onCancel={this.hideModal}
                width={900}
                footer={footer}
                className="-x-region-create_task_pool"
                >
            <Form def={formDef}
                data={this.props.formData}
                onFieldsChange={fields => this.props.updateFormField(fields)}
                formRef={form => this.form = form}
                >
                <Form.Item field="name" label="名称" {...formItemStyle}>
                    <div><Form.Item.Editor><Input/></Form.Item.Editor></div>
                </Form.Item>
                <Form.Item field="users" label="用户" {...formItemStyle}>
                    <Form.Item.Editor>
                        <SelectSystemUser keyword="用户" placeholder="请选择"/>
                    </Form.Item.Editor>
                </Form.Item>
                <Form.Item field="userGroup" label="用户组" {...formItemStyle}>
                    <SelectSystemUserGroup keyword="用户组" placeholder="请选择"/>
                </Form.Item>
                <Form.Item field="filters" label="筛选条件" {...formItemStyle}>
                    <TaskFilterEdit />
                </Form.Item>
                <Form.Item field="effectiveRule" label="有效规则" {...formItemStyle}>
                    <TaskPoolEffectiveRuleEditor/>
                </Form.Item>
                <Form.Item field="acceptRule" label="领取规则" {...formItemStyle}>
                    <Form.Item.Editor><Constant constant={1}/></Form.Item.Editor> 按创建时间顺序
                </Form.Item>
                <Form.Item field="returnRule" label="归还规则" {...formItemStyle}>
                    未完成超期自动归还 <Form.Item.Editor><InputNumber placeholder="请输入超期天数" style={{width: 140}}/></Form.Item.Editor>
                </Form.Item>
                <Form.Item field="remarks" label="说明" {...formItemStyle}>
                    <Input type="textarea" autosize={{minRows: 2, maxRows: 4}}/>
                </Form.Item>
            </Form>
        </Modal>
    }
}

export default connectModal(connect(
    state => ({
        formData: state.taskCenter.newTaskPool.formData,
        submitStatus: state.taskCenter.newTaskPool.submit.status,
        submitPayload: state.taskCenter.newTaskPool.submit.payload,
        auth: state.auth.payload,
    }),
    dispatch => bindActionCreators({
        updateFormField,
        submitNewTaskPool,
        resetForm
    }, dispatch)
)(NewTaskPool));
