import React, { Component } from 'react'
import { Input, Button, Row, Col, Modal, Select } from 'antd';
import message from '@wanhu/antd-legacy/lib/message'
import AsyncEvent from '../../common/AsyncEvent';
import { connect } from '../../../states/customerCenter/newCommunicationRecord';
import { connectModalHelper } from '../../../mixins/modal';
import { Form, fieldBuilder as field, formBuilder as form } from '../../common/form';
import SelectSinglePatientAsync from '../../common/SelectSinglePatientAsync';


const RECORD_TYPE = [
    { label: '日常记录', value: '1' },
    { label: '特殊需求', value: '2' },
    { label: '反馈建议', value: '3' },
    { label: '投诉意见', value: '4' },
]

const formDef = Form.def(
    {
        patientInfo: field().required('不能为空'),
        title: field().required('不能为空').maxLength(500),
        recordType: field().required('不能为空'),
        content: field().required('不能为空').maxLength(1000),
    }
);

const formItemStyle = {
    labelCol: { span:3 },
    wrapperCol: { span:21 }
};

class CommunicationModal extends Component {

    componentWillMount() {
        let params = this.props.currentModalParam
        if(params) {
            let Ids = params.split(',');
            this.patientId = Ids[0];
            this.recordId = Ids[1];
        }
    }

    componentDidMount(){
        if(this.recordId) {
            this.props.getCommunicationDetailAction(this.recordId);
        }
        if(this.patientId) {
            this.props.getPatientDetailAction(this.patientId);
        }
    }

    finishGetCommunicationDetail = (values) => {
        const { patientInfo, title, recordType, content } = values;
        this.form.setFieldsValue({ patientInfo, title, recordType, content });
    }

    finishGetPatientDetail = (values) => {
        const { patientInfo } = values
        this.form.setFieldsValue({ patientInfo });
    }

    hideModal = () => {
        this.props.resetAction();
        this.props.closeModal();
    }

    selectPatient = value => {
        this.form.setFieldsValue({ patientInfo: value })
    }

    submit = () => {
        this.form.validateFields((err, values) => {
            if (err) return;
            const {  patientInfo, title, recordType, content } = values;
            if(this.recordId) {
                const { patientId } = this.props.communicationDetail.payload;
                const data = {
                    patientId,
                    title, recordType, content,
                }
                this.props.updateRecordAction(this.recordId, data);
            } else {
                let patientId;
                if(this.patientId) {
                    patientId = this.props.patientDetail.payload.patientId
                } else {
                    patientId = patientInfo;
                }
                const data = {
                    patientId,
                    title, recordType, content,
                }
                this.props.createRecordAction(data);
            }
        });
    }

    finishCreateRecord = () => {
        message.success('沟通记录创建成功', 3);
        this.hideModal();
    }

    finishUpdateRecord = () => {
        message.success('沟通记录更新成功', 3);
        this.hideModal();
    }

    render() {
        return (
            <div>
                <Modal
                    title={this.recordId ? '编辑沟通记录' : '新建沟通记录'}
                    visible={true}
                    width={900}
                    maskClosable={false}
                    onCancel={this.hideModal}
                    style={{backgroundColor: '#f8f8f8'}}
                    footer={
                        <Row>
                            <Button onClick={this.submit} type="primary">确定</Button>
                            <Button onClick={this.hideModal} className='cancelButton'>取消</Button>
                        </Row>
                    }
                >
                    <Form def={formDef}
                        data={this.props.formData}
                        onFieldsChange={this.props.updateFormField}
                        formRef={form => this.form = form}>
                        <Form.Item field="patientInfo" label="选择会员" {...formItemStyle}>
                            {this.patientId || this.recordId ?
                                <Input disabled={true} />
                                : <SelectSinglePatientAsync
                                    placeholder="输入会员姓名/身份证号/手机号/其他联系方式"
                                    disabled={!!this.patientId || !!this.recordId}
                                    onSelect={this.selectPatient}
                                    />
                            }
                        </Form.Item>
                        <Form.Item field="title" label="主题" {...formItemStyle}>
                            <Input/>
                        </Form.Item>
                        <Form.Item field="recordType" label="记录类型" {...formItemStyle}>
                            <Select placeholder="请选择记录类型">
                                {RECORD_TYPE.map(o => <Select.Option key={o.value} value={o.value}>{o.label}</Select.Option>)}
                            </Select>
                        </Form.Item>
                        <Form.Item field="content" label="内容" {...formItemStyle}>
                            <Input type="textarea" autosize={{minRows: 8, maxRows: 14}}/>
                        </Form.Item>
                    </Form>
                </Modal>
                <AsyncEvent async={this.props.communicationDetail} onFulfill={this.finishGetCommunicationDetail} alertError/>
                <AsyncEvent async={this.props.patientDetail} onFulfill={this.finishGetPatientDetail} alertError/>
                <AsyncEvent async={this.props.createRecordResult} onFulfill={this.finishCreateRecord} alertError/>
                <AsyncEvent async={this.props.updateRecordResult} onFulfill={this.finishUpdateRecord} alertError/>
            </div>
        )
    }

}

const styles = {
    reasons: {
        lineHeight: 2,
    },
    detailReason: {
        marginTop: 10,
    },
}

export default connectModalHelper(connect(CommunicationModal));
