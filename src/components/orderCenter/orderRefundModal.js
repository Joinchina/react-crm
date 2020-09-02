import React, { Component } from 'react'
import { Input, Button, Row, Col, Modal, Radio } from 'antd';
import message from '@wanhu/antd-legacy/lib/message';
import AsyncEvent from '../common/AsyncEvent';
import { connect } from '../../states/orderCenter/orderRefundModal'
import { connectModalHelper } from '../../mixins/modal';
import { Form, fieldBuilder as field, formBuilder as form } from '../common/form';
import api from '../../api/api';
import refund from '../../images/refund.png';


const formDef = Form.def(
    {
        reason: field().required('撤单原因不能为空'),
        comment: field().required('撤单原因不能为空')
    },
);

class OrderRefundModal extends Component {
    constructor(props) {
        super(props)
        this.orderId = this.props.currentModalParam;
        this.state = {
            billingReimburseResult: null,
            visible: false,
            disabled: false,
        }
    }

    componentWillMount() {
        if (!this.props.cancelReason.payload) {
            this.props.getCancelReason()
        }
    }

    async componentWillReceiveProps(nextProps) {
        const status = this.props.cancelOrderResult.status;
        const nextStatus = nextProps.cancelOrderResult.status;
        if (status !== nextStatus) {
            const cancelOrderResult = nextProps.cancelOrderResult.payload
            if (nextStatus === 'rejected') {
                this.setState({ disabled: false });
                message.error(cancelOrderResult.message);
            }
            if (nextStatus === 'fulfilled') {
                this.setState({ disabled: true });
                const billingReimburseResult = await api.getBillingReimburse(this.orderId);
                this.setState({ disabled: false });
                if (billingReimburseResult) {
                    this.setState({ billingReimburseResult, visible: true });
                } else {
                    this.finishCancelOrder();
                }
            }
        }
    }

    hideModal = () => {
        this.props.resetForm();
        this.props.closeModal();
    }

    finishCancelOrder = (param) => {
        if (param) {
            this.setState({ visible: false });
        } else {
            message.success('撤单成功', 3);
        }
        this.hideModal();
    }

    submit = () => {
        this.setState({ disabled: true });
        this.form.validateFields((err, values) => {
            if (err) {
                this.setState({ disabled: false });
                return;
            }
            this.props.cancelOrder(this.orderId, values.reason.id, values.comment);
        });
    }

    render() {
        const reason = this.form && this.form.getFieldValue('reason');
        const needComment = reason && reason.needComment;
        let { billingReimburseResult, visible, disabled } = this.state;
        let drugDetail;
        if (billingReimburseResult) {
            drugDetail = billingReimburseResult.drugs && billingReimburseResult.drugs.length > 0 ?
                billingReimburseResult.drugs.map((drug) =>
                    <Row gutter={16}>
                        <Col span={16}>{drug.drugName} X {drug.number}</Col>
                    </Row>
                ) : null;
        } else {
            billingReimburseResult = {};
        }
        return (
            <div>
                <Modal
                    title='撤单原因'
                    visible={true}
                    width={500}
                    maskClosable={false}
                    onCancel={this.hideModal}
                    style={{ backgroundColor: '#f8f8f8' }}
                    footer={
                        <Row>
                            <Button onClick={this.submit} type="primary" disabled={disabled} loading={disabled}>确定</Button>
                            <Button onClick={this.hideModal} className='cancelButton'>取消</Button>
                        </Row>
                    }
                >
                    <Form def={formDef}
                        data={this.props.formData}
                        onFieldsChange={this.props.updateFormField}
                        formRef={form => this.form = form}>
                        <div style={styles.reasons}>
                            <Form.Item field="reason" >
                                <Radio.Group>
                                    {
                                        this.props.cancelReason.status === 'fulfilled' && this.props.cancelReason.payload && this.props.cancelReason.payload.map((o, i) =>
                                            <Radio key={i} value={o} style={{ width: '100%' }}>
                                                {o.name}
                                            </Radio>)
                                    }
                                </Radio.Group>
                            </Form.Item>
                        </div>
                        {needComment ?
                            <div style={styles.detailReason}>
                                <Form.Item field="comment" >
                                    <Input type="textarea" maxLength="50"
                                        placeholder="请输入详细撤单原因"
                                        autosize={{ minRows: 2, maxRows: 6 }} />
                                </Form.Item>
                                <div style={{ marginTop: '-24px', fontSize: '12px', float: 'right' }}>最多50个字</div>
                            </div>
                            : null
                        }
                    </Form>

                </Modal>
                <Modal
                    title="撤单成功"
                    width="600px"
                    visible={visible}
                    onCancel={() => this.finishCancelOrder(1)}
                    footer={
                        <Row>
                            <Button type="primary" onClick={() => this.finishCancelOrder(1)}>确定</Button>
                        </Row>
                    }
                >
                    <div>
                        <div style={{ textAlign: 'center' }}>
                            <img style={styles.menuItemImg} src={refund} alt="登记用药" title="登记用药" />
                            <div style={{ fontSize: '18px', marginBottom: '32px' }}>退款中</div>
                        </div>
                        <Row gutter={10} style={styles.row}>
                            <Col style={styles.label} span={8}>退费总额：</Col>
                            <Col span={16} style={styles.label2} > ¥{billingReimburseResult.amount}</Col>
                        </Row>
                        {(billingReimburseResult.returnAmount * 1) ? (
                            <div>
                                <Row gutter={10} style={styles.row}>
                                    <Col style={styles.label} span={8}>付款应退：</Col>
                                    <Col span={16} style={styles.label2} > ¥{billingReimburseResult.returnAmount}</Col>
                                </Row>
                                <Row gutter={10} style={styles.row}>
                                    <Col style={styles.label} span={8}></Col>
                                    <Col span={16} style={styles.tip}>（预计2-5工作日退至原付款人账户）</Col>
                                </Row>
                            </div>
                        ) : null}
                        {billingReimburseResult.returnPoints ? (
                            <Row gutter={10} style={styles.row}>
                                <Col style={styles.label} span={8}>积分应退：</Col>
                                <Col span={16} style={styles.label2} >
                                    ¥{(billingReimburseResult.returnPoints / 100).toFixed(2)}（折合积分：{billingReimburseResult.returnPoints}）
                                </Col>
                            </Row>
                        ) : null}
                        <Row gutter={10} style={styles.row}>
                            <Col style={styles.label} span={8}>退款单号：</Col>
                            <Col span={16} style={styles.label2}>{billingReimburseResult.reimburseNo}</Col>
                        </Row>
                        <Row gutter={10} style={styles.row}>
                            <Col style={styles.label} span={8}>退药明细：</Col>
                            <Col span={16} style={styles.label2}>{drugDetail}</Col>
                        </Row>
                    </div>
                </Modal>
                <AsyncEvent async={this.props.cancelReason} alertError />
                {/* <AsyncEvent async={this.props.cancelOrderResult} onFulfill={this.finishCancelOrder} alertError/> */}
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
    label: {
        padding: '5px',
        textAlign: 'right',
    },
    label2: {
        padding: '5px',
    },
    tip: {
        color: '#707070',
        padding: '5px',
    }
}

export default connectModalHelper(connect(OrderRefundModal));
