import React, { Component } from 'react'
import { Input, Button, Row, Col, Modal } from 'antd';
import message from '@wanhu/antd-legacy/lib/message';
import AsyncEvent from '../common/AsyncEvent';
import { Form, fieldBuilder as field, formBuilder as form } from '../common/form';
import { connect } from '../../states/configure/newAccount'
import { connectModalHelper } from '../../mixins/modal';

const formDef = Form.def(
    {
        loginName: field().required('不能为空'),
        thirdLoginName: field().required('不能为空'),
        thirdPassword: field().required('不能为空'),
    },
);

const formItemStyle = {
    labelCol: { span:5 },
    wrapperCol: { span:18 }
};

class NewAccount extends Component {

    componentWillMount(){
        this.accountId = this.props.currentModalParam;
        if (this.accountId) {
            this.props.getAccount(this.accountId);
        }
    }

    componentWillReceiveProps(props) {
        if (this.accountId !== props.currentModalParam){
            this.accountId = props.currentModalParam;
            if (this.accountId) {
                this.props.getAccount(this.accountId);
            } else {
                this.props.resetForm();
            }
        }
    }

    hideAccountModal = () => {
        this.props.resetForm();
        this.props.closeModal();
    }

    submit = () => {
        this.form.validateFields((err, values) => {
            if (err) return;
            if (this.accountId) {
                this.props.updateAccount(this.accountId, values);
            } else {
                const account = this.props.account.list;
                const newAccount = values.loginName;
                if(newAccount && account.some(o => o.loginName === newAccount)) {
                    message.error(`账号"${newAccount}"已存在记录，请勿重复添加`, 3)
                    return;
                }
                this.props.createAccount(values);
            }
        });
    }

    finishCreateAccount = () => {
        message.success('账号创建成功', 3);
        this.hideAccountModal();
    }

    finishGetAccount = (values) => {
        this.form.setFieldsValue(values);
    }

    finishUpdateAccount = () => {
        message.success('保存成功', 3);
        this.hideAccountModal();
    }

    render() {
        const title = this.accountId ? '编辑账号配置' : '新建账号配置';
        return (
            <div>
                <Modal
                    title={title}
                    visible={true}
                    width={900}
                    maskClosable={false}
                    onCancel={this.hideAccountModal}
                    footer={
                        <Row>
                            <Button onClick={this.submit} type="primary">保存</Button>
                            <Button onClick={this.hideAccountModal} className='cancelButton'>取消</Button>
                        </Row>
                    }
                >
                    <Form def={formDef}
                        data={this.props.formData}
                        onFieldsChange={this.props.updateFormField}
                        formRef={form => this.form = form}>
                        <Form.Item field="loginName" label="万户账号" {...formItemStyle}>
                            <Input maxLength="50"/>
                        </Form.Item>
                        <Form.Item field="thirdLoginName" label="第三方登录账号" {...formItemStyle}>
                            <Input maxLength="50" />
                        </Form.Item>
                        <Form.Item field="thirdPassword" label="第三方密码" {...formItemStyle}>
                            <Input maxLength="50" />
                        </Form.Item>
                    </Form>
                </Modal>
                <AsyncEvent async={this.props.createAccountResult} onFulfill={this.finishCreateAccount} alertError/>
                <AsyncEvent async={this.props.getAccountResult} onFulfill={this.finishGetAccount} alertError/>
                <AsyncEvent async={this.props.updateAccountResult} onFulfill={this.finishUpdateAccount} alertError/>
            </div>
        )
    }
}

export default connectModalHelper(connect(NewAccount));
