import React, { Component } from 'react'
import { Button, Row, Modal } from 'antd';
import message from '@wanhu/antd-legacy/lib/message';
import AsyncEvent from '../common/AsyncEvent';
import { Form, fieldBuilder as field } from '../common/form';
import { connect } from '../../states/taskCenter/newFrozen'
import { connectModalHelper } from '../../mixins/modal';
import SelectSingleHospital from '../common/SelectSingleHospital'
import SelectSystemFrozenType from '../common/SelectSystemFrozenType'

const permission = 'crm.admin';
const SelectSingleHospitalForDataRange = SelectSingleHospital.forDataRange(permission, 'or', {status: 0});

const formDef = Form.def(
    {
        frozenHospital: field().required('不能为空'),
        freeze: field().required('不能为空'),
    },
);

const formItemStyle = {
    labelCol: { span:3 },
    wrapperCol: { span:21 }
};

class NewFrozen extends Component {

    componentWillMount(){
        this.frozenId = this.props.currentModalParam;
        if (this.frozenId) {
            this.props.getFrozen(this.frozenId);
        }
    }

    componentWillReceiveProps(props) {
        if (this.frozenId !== props.currentModalParam){
            this.frozenId = props.currentModalParam;
            if (this.frozenId) {
                this.props.getFrozen(this.frozenId);
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
        this.form.resetFields(['freeze']);
    }

    submit = () => {

        this.form.validateFields((err, values) => {
            if (err) return;
            if (this.frozenId) {
                this.props.updateFrozen(this.frozenId, values);
            } else {
                const frozenList = this.props.frozenList.list || [];
                const frozenHospital = values.frozenHospital;
                if(frozenHospital && frozenList.some(o => o.id === frozenHospital.id)) {
                    message.error(`"${frozenHospital.name}"已存在记录，请勿重复添加`, 3)
                    return;
                }
                this.props.createFrozen(values);
            }
        });
    }

    finishCreateFrozen = () => {
        message.success('冻结机构创建成功', 3);
        this.hideGroupModal();
    }

    finishGetFrozen = (values) => {
        this.form.setFieldsValue(values);
    }

    finishUpdateFrozen = () => {
        message.success('保存成功', 3);
        this.hideGroupModal();
    }

    render() {
        const title = this.frozenId ? '编辑冻结机构' : '新建冻结机构';
        const frozenHospital = this.props.formData.frozenHospital;
        const frozenHospitalId = frozenHospital && frozenHospital.value && frozenHospital.value.id
        const props = frozenHospitalId ? {} : { disabled: true };
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
                        <Form.Item field="frozenHospital" label="冻结机构" required={this.frozenId ? false : undefined} {...formItemStyle}>
                            <SelectSingleHospitalForDataRange disabled={this.frozenId ? true : false}/>
                        </Form.Item>
                        <Form.Item field="freeze" label="冻结类型" onChange={this.resetUsers} {...formItemStyle}>
                            <SelectSystemFrozenType normalize {...props}/>
                        </Form.Item>
                    </Form>
                </Modal>
                <AsyncEvent async={this.props.createFrozenResult} onFulfill={this.finishCreateFrozen} alertError/>
                <AsyncEvent async={this.props.getFrozenResult} onFulfill={this.finishGetFrozen} alertError/>
                <AsyncEvent async={this.props.updateFrozenResult} onFulfill={this.finishUpdateFrozen} alertError/>
            </div>
        )
    }
}

export default connectModalHelper(connect(NewFrozen));
