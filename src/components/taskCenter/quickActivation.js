import React, { Component } from 'react';
import { Button, Row, Modal, DatePicker } from 'antd';
import message from '@wanhu/antd-legacy/lib/message'
import { Form, fieldBuilder } from '../common/form';
import AlertError from '../common/AlertError';
import { connectModalHelper } from '../../mixins/modal';
import { connect } from '../../states/taskCenter/quickActivation';
import { SelectSingleOfficeByTree } from '../common/SelectSingleOfficeByTree';
import ClientProgressModal from '../common/ClientProgressModal';
import api from '../../api/api';

import moment from 'moment';

const formDef = Form.def(
    {
        range: fieldBuilder().required('请选择登记时间范围')
                    .maxDate(moment())
                    .validator(val => {
                        if (!val || !val[0] || !val[1]) {
                            return '请选择登记时间范围';
                        }
                        if (val[1].diff(val[0], 'days') > 30) {
                            return '登记时间范围不能大于31天'
                        }
                    }),
        company: fieldBuilder().required('不能为空'),
    }
);

const formItemStyle = {
    labelCol: { span: 5 },
    wrapperCol: { span: 18 }
};

class QuickActivationModal extends Component {

    state = {
        startSubmit: null
    }

    hideModal = () => {
        this.setState({ startSubmit: null });
        this.props.closeModal();
    }

    createProgress(startDate, endDate, companyId) {
        return async (tick) => {
            const start = startDate.format("YYYY-MM-DD");
            const end = endDate.format("YYYY-MM-DD");
            const inactive = await api.checkQuickActivateInactivePatients(
                start,
                end,
                companyId);
            if (!inactive.count) {
                throw new Error("没有符合快捷激活条件的患者");
            }
            const total = inactive.count;
            let current = 0;
            let isComplete = false;
            while(!isComplete) {
                const r = await api.quickActivateInactivePatients(
                    start,
                    end,
                    companyId
                );
                isComplete = r.isComplete;
                current += r.count;
                tick(current, Math.max(current, total));
            }
        }
    }

    submit = () => {
        this.form.validateFieldsAndScroll({ force: true }, (err, values) => {
            if (err) {
                console.log('验证失败', err, values);
            } else {
                this.setState({ startSubmit: this.createProgress(values.range[0], values.range[1], values.company.id) });
            }
        });
    }

    componentWillUnmount(){
        this.props.reset();
    }

    onSuccess = () => {
        message.success('快捷激活成功', 3);
        this.hideModal();
    }

    onError = (err) => {
        message.error(err.message, 3);
        this.setState({ startSubmit: null });
    }

    render(){
        const footer = <Row>
            <AlertError async={this.props.submit}/>
            <Button loading={this.props.submit.status === 'pending'} onClick={this.submit} type='primary'>确定</Button>
            <Button disabled={this.props.submit.status === 'pending'} onClick={this.hideModal} className='cancelButton'>取消</Button>
        </Row>;
        return <div>
        <Modal title='快捷激活'
                visible={this.props.submit.status !== 'fulfilled'}
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
                <Form.Item field="range" label="登记时间" {...formItemStyle}>
                    <DatePicker.RangePicker style={{width:'100%'}}/>
                </Form.Item>
                <Form.Item field="company" label="数据范围" {...formItemStyle}>
                    <SelectSingleOfficeByTree/>
                </Form.Item>
            </Form>
        </Modal>
        {
            this.state.startSubmit ?
            <ClientProgressModal
                onStart={this.state.startSubmit}
                progressTip="正在进行快捷激活，请勿关闭本页面，否则会中断该操作。"
                autoHide
                onSuccess={this.onSuccess}
                onError={this.onError}
            />
            : null
        }
        </div>
    }
}

export default connectModalHelper(connect(QuickActivationModal));
