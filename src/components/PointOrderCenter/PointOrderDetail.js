import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Breadcrumb, Table, Timeline, Spin } from 'antd';
import Title from '../common/Title';
import WHLabel from '../common/WH-Label';
import Prompt from '../common/Prompt'
import moment from 'moment';
import Viewer from '../toolcase/Viewer';
import { connect } from '../../states/insurance/insuranceInfo';
import { connectRouter } from '../../mixins/router';
import { centToYuan, isValidMoneyCent } from '../../helpers/money';


const styles = {
    text: {
      wordWrap: 'break-word'
    },
    title: {
      display: 'inline-block',
      height: 22,
      lineHeight: '22px',
      backgroundColor: 'white',
      paddingRight: 10,
      marginBottom: '-1px'
    },
    box: {
      borderBottom: 'solid 1px #e0e0e2',
      minHeight: '22px',
      display: 'flex'
    }
}

const PatientOrderStatusChoices = [
    {
        value: '0',
        label: '待确认',
    }, {
        value: '1',
        label: '已下单',
    }, {
        value: '2',
        label: '核保中',
    }, {
        value: '3',
        label: '已承保',
    }, {
        value: '4',
        label: '已完成',
    }, {
        value: '5',
        label: '已出险',
    }, {
        value: '6',
        label: '已撤单',
    }, {
        value: '7',
        label: '失效',
    }
];

const payStatus = [
    {
        value: '0', label: '待支付'
    },
    {
        value: '1', label: '支付成功'
    },
    {
        value: '2', label: '支付失败'
    },
]

function getLabel(itemMap, itemValue) {
    const item = itemMap.find(i => i.value == itemValue);
    return item ? item.label : '';
}
class PointOrderDetail extends Component {

    constructor(props) {
        super(props);
        this.insuranceId = this.props.match.params.insuranceId;
        this.props.getInsuranceOrderDetail(this.insuranceId);
        this.state = {
            loading: false,
            orderList: [],
        }
    }

    async componentDidMount() {
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

    formatMoney(num, digits) {
        num = Number(num);
        if (isValidMoneyCent(num)) {
            return `¥${centToYuan(num, digits || 2)}`;
        } else {
            return '-';
        }
    }

    openImg(pictures) {
        const pic = pictures.map((p) => { return { url: p, alt: p } });
        Viewer(pic, {
            navbar: false,
            toolbar: true,
            title: false,
        });
    }

    render() {
        const { loading, orderList } = this.state;
        const data = this.props.insuranceOrderDetail.payload || {};
        const insuranceInfo = data || {};
        const columns = [
            {
                title: '积分商品编码',
                dataIndex: 'productName',
                key: 'productName',
            }, {
                title: '名称',
                dataIndex: 'coverageAmount',
                key: 'coverageAmount',
            }, {
                title: '规格简述',
                dataIndex: 'deductibleAmount',
                key: 'deductibleAmount',
            }, {
                title: '品类',
                dataIndex: 'deductibleAmount',
                key: 'deductibleAmount',
            }, {
                title: '类型',
                dataIndex: 'deductibleAmount',
                key: 'deductibleAmount',
            }, {
                title: '库存来源',
                dataIndex: 'deductibleAmount',
                key: 'deductibleAmount',
            }, {
                title: '积分单价（分）',
                dataIndex: 'deductibleAmount',
                key: 'deductibleAmount',
            }, {
                title: '数量',
                dataIndex: 'deductibleAmount',
                key: 'deductibleAmount',
            }
        ];
        const tableFoot = <div>
            <div className='table-footer'>
                <div>
                    <span>合计：{this.formatMoney(insuranceInfo.amount || 0)}分</span>
                </div>
            </div>
        </div>
        let nowBirth = '';
        if (insuranceInfo.insured && insuranceInfo.insured.insuredBirthday) {
            const date = new Date(insuranceInfo.insured.insuredBirthday)
            const by = date.getFullYear()
            const bm = date.getMonth() + 1
            const bd = date.getDate()
            nowBirth = `${by}-${bm}-${bd}`
        }
        return <Spin
                spinning={this.props.insuranceOrderDetail.status === 'pending'}
            >
            <Breadcrumb className='breadcrumb-box'>
                <Breadcrumb.Item>
                    <Link to={this.backToIndex}>积分兑换订单管理</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    订单详情
                </Breadcrumb.Item>
            </Breadcrumb>
            <Title text='订单编号' num={insuranceInfo.orderNo} left={5}>
                <Prompt text={getLabel(payStatus, insuranceInfo.payStatus) || '未知状态'} />
            </Title>
            <div style={{ backgroundColor: '#fff' }}>
                <Row className='label-box' gutter={40}>
                    <Col className='label-col' span={8}>
                        <WHLabel title='姓名' text={insuranceInfo.orderStatus == 1 ? '' : insuranceInfo.teamOrderNo} />
                    </Col>
                    <Col className='label-col' span={8}>
                        <WHLabel title='手机号' text={insuranceInfo.orderStatus == 1 || insuranceInfo.orderStatus == 2 ? '' : insuranceInfo.teamInsurOrderNo} />
                    </Col>
                </Row>
                <div className="table-box tableBox" >
                    <Table loading={loading} dataSource={insuranceInfo.packageProduct} rowKey={record => record.id} columns={columns} pagination={false} bordered={false} footer={() => {return tableFoot}}/>
                </div>
                <Title text='订单流水' left={5} />
                <Timeline className='timeline-box'>
                    {
                        insuranceInfo && insuranceInfo.orderLog && insuranceInfo.orderLog.length ? insuranceInfo.orderLog.map((item, index) => {
                            return (
                                <Timeline.Item key={index}>
                                    <span>{moment(item.logTime).format('YYYY-MM-DD HH:mm:ss')}</span>
                                    {item.logContent}
                                </Timeline.Item>
                            )
                        }) : null
                    }
                </Timeline>
                <Title text='应付信息' left={5} />
                <Row className='label-box' gutter={40}>
                    <Col className='label-col' span={6}>
                        <WHLabel title='应付金额' text={insuranceInfo.insured && insuranceInfo.insured.insuredName} />
                    </Col>
                    <Col className='label-col' span={6}>
                        <WHLabel title='运费' text={insuranceInfo.insured && insuranceInfo.insured.insuredIdCard} />
                    </Col>
                </Row>
                <Title text='付款信息' left={5} />
                <Row className='label-box' gutter={40}>
                    <Col className='label-col' span={6}>
                        <WHLabel title='付款项目' text={insuranceInfo.insured && insuranceInfo.insured.insuredInsuranceType == 1 ? '城镇职工' : '-'} />
                    </Col>
                    <Col className='label-col' span={6}>
                        <WHLabel title='付款方式' text={'在职'} />
                    </Col>
                    <Col className='label-col' span={6}>
                        <WHLabel title='付款金额' text={'一类'} />
                    </Col>
                    <Col className='label-col' span={6}>
                        <WHLabel title='付款时间' text={insuranceInfo.insured&&insuranceInfo.insured.insuredProfessionCode} />
                    </Col>
                </Row>
                <Title text='收件人信息' left={5} />
                <Row className='label-box' gutter={40}>
                    <Col className='label-col' span={8}>
                        <WHLabel title='收件人' text={insuranceInfo.beneficiary && insuranceInfo.beneficiary.beneficiaryName} />
                    </Col>
                    <Col className='label-col' span={8}>
                        <WHLabel title='联系方式' text={insuranceInfo.beneficiary && insuranceInfo.beneficiary.beneficiaryBankName} />
                    </Col>
                </Row>
                <Title text='配送信息' left={5} />
                <Row className='label-box' gutter={40}>
                    <Col className='label-col' span={8}>
                        <WHLabel title='配送方式' text={insuranceInfo.createInfo && insuranceInfo.createInfo.createBy} />
                    </Col>
                    <Col className='label-col' span={8}>
                        <WHLabel title='收件地址' text={insuranceInfo.createInfo && insuranceInfo.createInfo.createDate} />
                    </Col>
                    <Col className='label-col' span={8}>
                        <WHLabel title='自提点' text={insuranceInfo.createInfo && insuranceInfo.createInfo.createSource} />
                    </Col>
                </Row>
                <Row className='label-box' gutter={40}>
                    <Col className='label-col' span={8}>
                        <WHLabel title='承运商' text={insuranceInfo.createInfo && insuranceInfo.createInfo.createBy} />
                    </Col>
                    <Col className='label-col' span={8}>
                        <WHLabel title='运单编号' text={insuranceInfo.createInfo && insuranceInfo.createInfo.createDate} />
                    </Col>
                </Row>
                <Title text='配送信息' left={5} />
                <Row className='label-box' gutter={40}>
                    <Col className='label-col' span={8}>
                        <WHLabel title='下单时间' text={insuranceInfo.createInfo && insuranceInfo.createInfo.createBy} />
                    </Col>
                </Row>
            </div>
        </Spin>
    }
}

export default connectRouter(connect(PointOrderDetail));
