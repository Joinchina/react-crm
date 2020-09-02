import React, { Component } from 'react'
import { Input, Button, Row, Col, Modal, TreeSelect } from 'antd';
import message from '@wanhu/antd-legacy/lib/message';
import AsyncEvent from '../common/AsyncEvent';
import { Form, fieldBuilder as field, formBuilder as form, RenderEditor } from '../common/form';
import SelectSingleOfficeByTree from '../common/SelectSingleOfficeByTree'
import SelectSystemUser from '../common/SelectSystemUser'
import { connect } from '../../states/configure/createGroup'
import { connectModalHelper } from '../../mixins/modal';

const formDef = Form.def(
    {
        name: field().required('不能为空')
                     .maxLength(50),
        ownerCompany: field().required('不能为空'),
        users: field().required('不能为空'),
        remarks: field().maxLength(100),
    }
);

const formItemStyle = {
    labelCol: { span:3 },
    wrapperCol: { span:21 }
};

class CreateGroupModal extends Component {

    componentWillMount(){
        this.groupId = this.props.currentModalParam;
        if (this.groupId) {
            this.props.getGroup(this.groupId);
        }
    }

    componentWillReceiveProps(props) {
        if (this.groupId !== props.currentModalParam){
            this.groupId = props.currentModalParam;
            if (this.groupId) {
                this.props.getGroup(this.groupId);
            } else {
                this.props.resetForm();
            }
        }
    }

    hideGroupModal = () => {
        this.props.resetForm();
        this.props.closeModal();
    }

    resetUsers = () => {
        this.form.resetFields(['users']);
    }

    submit = () => {
        this.form.validateFields((err, values) => {
            if (err) return;
            if (this.groupId) {
                this.props.updateGroup(this.groupId, values);
            } else {
                this.props.createGroup(values);
            }
        });
    }

    finishCreateGroup = () => {
        message.success('用户组创建成功', 3);
        this.hideGroupModal();
    }

    finishGetGroup = (values) => {
        this.form.setFieldsValue(values);
    }

    finishUpdateGroup = () => {
        message.success('保存成功', 3);
        this.hideGroupModal();
    }

    render() {
        const company = this.props.formData.ownerCompany;
        const companyId = company && company.value && company.value.id;
        const SelectSystemUserFromCompany = companyId ? SelectSystemUser.forCompanyId(companyId) : Input;
        const props = companyId ? {} : { disabled: true };
        const title = this.groupId ? '编辑用户组配置' : '新建用户组配置';
        return (
            <div>
                <Modal
                    title={title}
                    visible={true}
                    width={900}
                    maskClosable={false}
                    onCancel={this.hideGroupModal}
                    footer={
                        <Row>
                            <Button onClick={this.submit} type="primary">保存</Button>
                            <Button onClick={this.hideGroupModal} className='cancelButton'>取消</Button>
                        </Row>
                    }
                >
                    <Form def={formDef}
                        data={this.props.formData}
                        onFieldsChange={this.props.updateFormField}
                        formRef={form => this.form = form}>
                        <Form.Item field="name" label="用户组名称" {...formItemStyle}>
                            <Input maxLength="50"/>
                        </Form.Item>
                        <Form.Item field="ownerCompany" label="归属公司" onChange={this.resetUsers} {...formItemStyle}>
                            <SelectSingleOfficeByTree />
                        </Form.Item>
                        <Form.Item field="users" label="用户" {...formItemStyle}>
                            <Form.Item.Editor>
                                <SelectSystemUserFromCompany {...props}/>
                            </Form.Item.Editor>
                        </Form.Item>
                        <Form.Item field="remarks" label="说明" {...formItemStyle}>
                            <Input maxLength="100" type="textarea" autosize={{minRows: 2, maxRows: 4}}/>
                        </Form.Item>
                    </Form>
                </Modal>
                <AsyncEvent async={this.props.createGroupResult} onFulfill={this.finishCreateGroup} alertError/>
                <AsyncEvent async={this.props.getGroupResult} onFulfill={this.finishGetGroup} alertError/>
                <AsyncEvent async={this.props.updateGroupResult} onFulfill={this.finishUpdateGroup} alertError/>
            </div>
        )
    }
}

export default connectModalHelper(connect(CreateGroupModal));
