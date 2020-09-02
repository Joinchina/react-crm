import React, { Component } from 'react';
import {
    Row, Col, Modal, Form, DatePicker, Input, Select, Button, Radio,
} from 'antd';
import api from '../../../api/api';
import PropTypes from '../../../helpers/prop-types';

const { Item } = Form;
const { Option } = Select;
const { Group } = Radio;
const formItemLayout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};
const worktimeMap = [
    {
        id: '1',
        label: '上午8：00~12：00',
    },
    {
        id: '2',
        label: '下午14：00~17：00',
    },
    {
        id: '3',
        label: '全天8：00~17：00',
    },
];

export default class extends Component {
    static propTypes = {
        modifyed: PropTypes.bool.isRequired,
        cancelled: PropTypes.bool.isRequired,
        onSubmit: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
        submitting: PropTypes.bool.isRequired,
        form: PropTypes.form().isRequired,
        dataSource: PropTypes.shape({}).isRequired,
    };

    state = {};

    componentDidMount() {
        this.init();
    }

    onChangeDate = (date, dateString) => {
        const { form, dataSource } = this.props;
        form.resetFields(['time']);
        const { worktime } = dataSource.doctorSchedules.find(item => item.workday === dateString);
        this.setState({ worktime });
    }

    onOpenChange = (open) => {
        if (open) {
            const { dataSource } = this.props;
            const current = dataSource.reservationRecord;
            const regularTiming = current
                && current.isEstimatedPickup && current.estimatedPickupDate;
            if (regularTiming) {
                this.setState({ isShowRegularTime: true });
            }
        }
    }

    handleDisabledDate = (current) => {
        if (!current) return null;
        const { dataSource } = this.props;
        const allowDate = dataSource.doctorSchedules;
        if (allowDate && allowDate.some(item => item.workday === current.format('YYYY-MM-DD').valueOf())) {
            return current && current.valueOf() < Date.now();
        }
        return current && current.valueOf();
    }

    async init() {
        const reasons = await api.getReservationCancelReason();
        this.setState({ reasons });
    }

    render() {
        const {
            modifyed, cancelled, onSubmit, onCancel, submitting, form, dataSource,
        } = this.props;
        const {
            worktime, isShowRegularTime, reasons,
        } = this.state;
        const { getFieldDecorator, getFieldValue } = form;
        const reason = getFieldValue('reason');
        const showOtherReason = reason && reason === '9';
        const { reservationRecord } = dataSource;
        const timeOptions = worktimeMap.map(time => (
            <Option key={time.id} title={time.label} disabled={worktime !== time.id}>
                {time.label}
            </Option>
        ));
        const modalFooter = (
            <Row>
                <Button type="primary" loading={submitting} onClick={onSubmit}>
                    确定
                </Button>
                <Button type="primary" className="cancelButton" disabled={submitting} onClick={onCancel}>
                    取消
                </Button>
            </Row>
        );
        return (
            <div>
                <Modal
                    title="预约改期"
                    className="modal"
                    width={480}
                    maskClosable={false}
                    visible={modifyed}
                    onCancel={onCancel}
                    footer={modalFooter}
                >
                    <div style={{ height: 100, marginTop: 20 }}>
                        <Row>
                            <Col span={14}>
                                <Item
                                    label="预约时间"
                                    {...formItemLayout}
                                >
                                    {getFieldDecorator(
                                        'day',
                                        {
                                            validateTrigger: ['onChange'],
                                            rules: [
                                                { required: true, message: '不能为空' },
                                            ],
                                        },
                                    )(
                                        <DatePicker
                                            placeholder="请选择预约时间"
                                            showToday={false}
                                            disabledDate={this.handleDisabledDate}
                                            allowClear={false}
                                            style={{ color: '#2a3f54' }}
                                            onChange={this.onChangeDate}
                                            onOpenChange={this.onOpenChange}
                                        />,
                                    )}
                                </Item>
                            </Col>
                            <Col span={10}>
                                <Item
                                    label=""
                                >
                                    {getFieldDecorator(
                                        'time',
                                        {
                                            rules: [
                                                { required: true, message: '不能为空' },
                                            ],
                                        },
                                    )(
                                        <Select
                                            allowClear
                                            style={{ width: 169 }}
                                            placeholder="请选择预约时间"
                                        >
                                            {timeOptions}
                                        </Select>,
                                    )}
                                </Item>
                            </Col>
                        </Row>
                        <Row>
                            {
                                isShowRegularTime
                                && (
                                    <span style={{ margin: '0 0 0 87px' }}>
                                        下次规律取药时间：
                                        {
                                            reservationRecord
                                            && reservationRecord.estimatedPickupDate
                                        }
                                    </span>
                                )
                            }
                        </Row>
                    </div>
                </Modal>
                <Modal
                    title="取消原因"
                    width={500}
                    visible={cancelled}
                    maskClosable={false}
                    onCancel={onCancel}
                    footer={modalFooter}
                >
                    <Row>
                        <Item>
                            {getFieldDecorator(
                                'reason',
                                {
                                    rules: [
                                        { required: true, message: '取消原因不能为空' },
                                    ],
                                },
                            )(
                                <Group>
                                    {
                                        reasons && reasons.map(item => (
                                            <div key={item.value}>
                                                <Radio key={item.value} value={item.value}>
                                                    {item.label}
                                                </Radio>
                                            </div>
                                        ))
                                    }
                                </Group>,
                            )
                            }
                        </Item>
                    </Row>
                    {
                        showOtherReason
                            && (
                                <Row>
                                    <Item>
                                        {getFieldDecorator(
                                            'otherReason',
                                            {
                                                rules: [
                                                    { max: 50, message: '不能多于50个字符' },
                                                    { required: true, message: '请输入详细取消原因' },
                                                ],
                                            },
                                        )(
                                            <Input
                                                type="textarea"
                                                maxLength="50"
                                                autosize={{ minRows: 4, maxRows: 6 }}
                                                placeholder="请输入详细取消原因"
                                            />,
                                        )}
                                        <div style={{ marginTop: '0px', fontSize: '12px', float: 'right' }}>
                                        最多50个字
                                        </div>
                                    </Item>
                                </Row>
                            )
                    }
                </Modal>
            </div>
        );
    }
}
