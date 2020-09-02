import React, { Component } from 'react'
import { Row, Button, DatePicker, Modal } from 'antd';
import message from '@wanhu/antd-legacy/lib/message'
import AsyncEvent from '../common/AsyncEvent';
import { Form, fieldBuilder as field } from '../common/form';
import { connect } from '../../states/toolcase/newSpareMoney'
import { connectModalHelper } from '../../mixins/modal';
import DateRangePicker from '../common/DateRangePicker';
import moment from 'moment';

const formDef = Form.def(
    {
        endDate: field().required('请选择时间')
    },
);

const formItemStyle = {
    labelCol: { span:8 },
    wrapperCol: { span:12 }
};

class NewSpareMoney extends Component {

    componentWillMount() {
        this.hospitalAccountId = this.props.currentModalParam
    }

    componentWillReceiveProps(props) {
        if(this.hospitalAccountId !== props.currentModalParam) {
            this.hospitalAccountId = props.currentModalParam;
            if(!this.hospitalAccountId) {
                this.props.resetForm()
            }
        }
    }

    hideSpareMoneyModal = () => {
        this.props.resetForm();
        this.props.closeModal();
    }

    submit = () => {
        this.form.validateFields((err, values) => {
            if (err) return;
            this.props.appliSpareMoney({
                hospitalAccountId: this.hospitalAccountId,
                endDate: moment(values.endDate).format('YYYY-MM-DD'),
            });
        });
    }

    finishCreateSpareMoney = () => {
        message.success('申领成功', 3);
        this.hideSpareMoneyModal();
    }

    render() {
        return (
            <div>
                <Modal
                    title="备用金申领"
                    visible={true}
                    width={500}
                    maskClosable={false}
                    onCancel={this.hideSpareMoneyModal}
                    footer={
                        <Row>
                            <Button onClick={this.submit} type="primary">保存</Button>
                            <Button onClick={this.hideSpareMoneyModal} className='cancelButton'>取消</Button>
                        </Row>
                    }
                >
                    <Form def={formDef}
                        data={this.props.formData}
                        onFieldsChange={this.props.updateFormField}
                        formRef={form => this.form = form}>
                        <Form.Item field="endDate" label="记账截止日期" {...formItemStyle}>
                            <DatePicker
                                disabledDate={current => current && current.valueOf() > Date.now()}
                            />
                        </Form.Item>
                    </Form>
                </Modal>
                <AsyncEvent async={this.props.applySpareMoneyResult} onFulfill={this.finishCreateSpareMoney} alertError/>
            </div>
        )
    }
}

export default connectModalHelper(connect(NewSpareMoney));
