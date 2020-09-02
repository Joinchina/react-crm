import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Breadcrumb, Table, Timeline, Spin, Icon } from 'antd';
import Title from '../../common/Title';
import WHLabel from '../../common/WH-Label';
import Prompt from '../../common/Prompt'
import moment from 'moment';
import Viewer from '../../toolcase/Viewer';
import api from '../../../api/api';
import { connect } from '../../../states/insurance/revokeOrderInfo';
import { connectRouter } from '../../../mixins/router';
import { centToYuan, isValidMoneyCent, refundRountCentPercentToCent } from '../../../helpers/money';

class RevokeOrderInfo extends Component {

    constructor(props) {
        super(props);
        this.insuranceId = this.props.match.params.insuranceId;
        this.state = {
            loading: false,
            orderList: [],
        }
    }

    async componentDidMount() {
        this.props.getRevokeOrderDetail(this.insuranceId);
    }

    componentWillReceiveProps(props) {
        if (this.insuranceId !== props.match.params.insuranceId) {
            this.insuranceId = this.props.match.params.insuranceId;
            this.props.resetPage();
        }
    }
    get backToIndex() {
        if (this.props.router.query.r && this.props.router.query.r.indexOf('/patientInsurance') === 0) {
            return this.props.router.query.r;
        } else {
            return '/patientInsurance';
        }
    }

    render() {
        const { loading, orderList } = this.state;
        const data = this.props.revokeOrderDetail && this.props.revokeOrderDetail.payload || {};
        return <Spin
                spinning={this.props.revokeOrderDetail && this.props.revokeOrderDetail.status === 'pending'}
            >
            <Breadcrumb className='breadcrumb-box'>
                <Breadcrumb.Item>
                    <Link to={this.backToIndex}>会员服务管理</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    退款单详情
                </Breadcrumb.Item>
            </Breadcrumb>
            <Title text='退款单号' num={data.reimburseNo || ''} left={5} />
            <div style={{ backgroundColor: '#fff' }}>
                <Row className='label-box' gutter={40}>
                    <Col className='label-col' span={8}>
                        <WHLabel title='订单金额：' text={data.amount ? `¥${data.amount}` : ''} />
                    </Col>
                    <Col className='label-col' span={8}>
                        <WHLabel title='退款总额：' text={data.reimbuseAmount ? `¥${data.reimbuseAmount}` : ''} />
                    </Col>
                    {data.specialApply ? <Col className='label-col' span={8}>
                        <WHLabel title='特殊申请：' text={data.specialApply || ''} />
                    </Col> : null}
                </Row>
                <Title text='退款明细' left={5} />
                <div className="label-box">
                    {data.payments && data.payments.length ? data.payments.map((item, index) => (
                        <Row gutter={40} key={item.id || index}>
                            <Col className="label-col" span={8}>
                                <WHLabel title="退款方式" text={item.paymentTypeName} />
                            </Col>
                            <Col className="label-col" span={8}>
                                <WHLabel
                                    title="退款金额"
                                    text={`¥${item.amount}`}
                                />
                            </Col>
                            <Col className="label-col" span={8}>
                                <WHLabel title="扣费金额" text={`¥${item.deductAmount}`} />
                            </Col>
                        </Row>
                        )) : null
                    }
                </div>
                <Title text='系统信息' left={5} />
                <Row className='label-box' gutter={40}>
                    <Col className='label-col' span={8}>
                        <WHLabel title='提交人' text={data && data.createBy || ''} />
                    </Col>
                    <Col className='label-col' span={8}>
                        <WHLabel title='提交时间' text={data && data.createDate || ''} />
                    </Col>
                    <Col className='label-col' span={8}>
                        <WHLabel title='提交来源' text={data && data.channelName || ''} />
                    </Col>
                </Row>
            </div>
        </Spin>
    }
}

export default connectRouter(connect(RevokeOrderInfo));
