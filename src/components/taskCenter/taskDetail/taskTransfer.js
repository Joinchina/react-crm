import React, { Component } from 'react';
import { Button, Row, Col, Modal, Select } from 'antd';
import { Form, fieldBuilder, RenderEditor, FieldLabel } from '../../common/form';
import SelectSingleUserGroup from '../../common/SelectSingleUserGroup';
import SelectSingleUser from '../../common/SelectSingleUser';

const formDef = Form.def(
    {
        group: fieldBuilder().required('请选择用户组'),
        user: fieldBuilder().required('请选择用户'),
    }
);

class TaskTransferModal extends Component {

    hideModal = () => {
        this.props.onHideModal();
    }

    componentWillMount() {

    }

    onChangeGroup = (group) => {
        this.form.resetFields(['user']);
    }

    submit = () => {
        this.form.validateFields((err, values) => {
            this.props.onSubmit(values);
        });
    }

    render(){
        const footer = <Row>
            <Button loading={this.props.submitResult.status === 'pending'} onClick={this.submit} type='primary'>确定</Button>
            <Button disabled={this.props.submitResult.status === 'pending'} onClick={this.hideModal} className='cancelButton'>取消</Button>
        </Row>;
        const SelectSingleUserGroupForUser = SelectSingleUserGroup.forUserId(this.props.userId);
        const group = this.props.formData.group &&  this.props.formData.group.value;
        const props = group ?
            {
                type: SelectSingleUser.inUserGroup(group.id),
                normalize: "unselectNonMatched",
                reloadOnMount: true,
                filter: user => user.id !== this.props.userId,
            } :
            {
                type: Select,
                disabled: true
            };
        return <Modal title='转移任务'
                visible={this.props.visible}
                maskClosable={false}
                onCancel={this.hideModal}
                width={500}
                footer={footer}
                >
            <Form def={formDef}
                data={this.props.formData}
                onFieldsChange={this.props.updateFormField}
                formRef={form => this.form = form}
                >
                <Row>
                    <Col span={5}>
                        <FieldLabel required label="用户组"/>
                    </Col>
                    <Col span={18}>
                        <div className="ant-form">
                            <Form.Item field="group" height="auto" onChange={this.onChangeGroup}>
                                <SelectSingleUserGroupForUser reloadOnMount/>
                            </Form.Item>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col span={5}>
                        <FieldLabel required label="用户"/>
                    </Col>
                    <Col span={18}>
                        <div className="ant-form">
                            <Form.Item field="user" height="auto" >
                                <RenderEditor {...props}/>
                            </Form.Item>
                        </div>
                    </Col>
                </Row>
            </Form>
        </Modal>
    }
}

export default TaskTransferModal;
