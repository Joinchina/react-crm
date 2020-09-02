import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Breadcrumb, Table, Timeline, Spin, Icon } from 'antd';
import Title from '../../common/Title';
import WHLabel from '../../common/WH-Label';
import Prompt from '../../common/Prompt'
import moment from 'moment';
import Viewer from '../../toolcase/Viewer';
import api from '../../../api/api';
import { connect } from '../../../states/insurance/insuranceOrderInfo';
import { connectRouter } from '../../../mixins/router';
import { centToYuan, isValidMoneyCent, refundRountCentPercentToCent } from '../../../helpers/money';
import './index.css'

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
        label: '投保中',
    }, {
        value: '1',
        label: '已投保',
    }, {
        value: '2',
        label: '作废',
    }, {
        value: '3',
        label: '已完成',
    }, {
        value: '4',
        label: '待退保',
    }, {
        value: '5',
        label: '已退保',
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

function getBirthdayFromIdCard(idCard) {
    var birthday = "";
    if(idCard != null && idCard != ""){
        if(idCard.length == 15){
            birthday = "19"+idCard.substr(6,6);
        } else if(idCard.length == 18){
            birthday = idCard.substr(6,8);
        }

        birthday = birthday.replace(/(.{4})(.{2})/,"$1-$2-");
    }

    return birthday;
}

class InsuranceOrderInfo extends Component {

    constructor(props) {
        super(props);
        this.insuranceId = this.props.match.params.insuranceId;
        this.props.getInsuranceOrderInfos(this.insuranceId);
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
        const data = this.props.insuranceOrderInfo.payload || {};
        const insuranceInfo = data || {};
        const columns = [
            {
                title: '子编码',
                dataIndex: 'seq',
                key: 'seq',
            },{
                title: '保障条款',
                dataIndex: 'clause',
                key: 'clause',
            }, {
                title: '保额',
                dataIndex: 'coverageAmount',
                key: 'coverageAmount',
            }, {
                title: '免赔额',
                dataIndex: 'deductibleAmount',
                key: 'deductibleAmount',
            }, {
                title: '报销比例',
                dataIndex: 'scale',
                key: 'scale',
            }
        ];
        const tableFoot = <div>
            <div style={{ float: 'left' }}>
                <div>
                    {insuranceInfo.pdfUrl ? <span>保险凭证：<a style={{ color: '#108ee9'}} download='d_file' href={insuranceInfo.pdfUrl || ''}>保险凭证.pdf</a></span> : null}
                </div>
            </div>
        </div>
        return <Spin
                spinning={this.props.insuranceOrderInfo.status === 'pending'}
            >
            <div className='insurance_order_info'>
            <Breadcrumb className='breadcrumb-box'>
                <Breadcrumb.Item>
                    <Link to={this.backToIndex}>会员服务管理</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    保险订单详情
                </Breadcrumb.Item>
            </Breadcrumb>
            <Title text='保险订单单号' num={insuranceInfo.orderNo} left={5}>
                <Prompt text={getLabel(PatientOrderStatusChoices, insuranceInfo.status) || '投保中'} />
            </Title>
            <div style={{ backgroundColor: '#fff' }}>
                <Row className='label-box' gutter={40}>
                    <Col className='label-col' span={8}>
                        <WHLabel title='投保单流水号：' text={insuranceInfo.sequenceNo} />
                    </Col>
                    <Col className='label-col' span={8}>
                        <WHLabel title='保单号：' text={insuranceInfo.status == 0 ? '' : insuranceInfo.insuranceOrdrNo} />
                    </Col>
                    <Col className='label-col' span={8}>
                        <WHLabel title='保险期间：' text={insuranceInfo.status == 0 ? '' : insuranceInfo.startDate ? `${insuranceInfo.startDate || '-'}至${insuranceInfo.endDate || '-'}` : ''} />
                    </Col>
                </Row>
                <Row className='label-box' gutter={40}>
                    <Col className='label-col' span={8}>
                        <WHLabel title='服务产品名称：' text={insuranceInfo.productName || '-'} />
                    </Col>
                    <Col className='label-col' span={8}>
                        <WHLabel title='保险类型：' text={insuranceInfo.insuranceType == 1 ? '个险' : insuranceInfo.insuranceType == 2 ? '团险' : '-'} />
                    </Col>
                    <Col className='label-col' span={8}>
                        <WHLabel title='产品编码：' text={insuranceInfo.productCode || '-'} />
                    </Col>
                </Row>
                <Row className='label-box' gutter={40}>
                    <Col className='label-col' span={8}>
                        <WHLabel title='等待期：' text={insuranceInfo.delayDays || insuranceInfo.delayDays == 0 ? insuranceInfo.delayDays + '天' : '-'} />
                    </Col>
                    <Col className='label-col' span={8}>
                        <WHLabel title='承保公司：' text={insuranceInfo.company || '-'} />
                    </Col>
                </Row>
                <Title text='保险条款' left={5} />
                <div className="table-box tableBox" >
                    <Table loading={loading} dataSource={insuranceInfo.clauses} rowKey={record => record.id} columns={columns} pagination={false} bordered={false} footer={() => {return tableFoot}}/>
                </div>
                <Title text='订单流水' left={5} />
                <Timeline className='timeline-box'>
                    {
                        insuranceInfo && insuranceInfo.logs && insuranceInfo.logs.length ? insuranceInfo.logs.map((item, index) => {
                            return (
                                <Timeline.Item key={index}>
                                    <span>{moment(item.date).format('YYYY-MM-DD HH:mm:ss')}</span>
                                    {item.content}
                                </Timeline.Item>
                            )
                        }) : null
                    }
                </Timeline>
                <Title text='被保人信息' left={5} />
                <Row className='label-box' gutter={40}>
                    <Col className='label-col' span={6}>
                        <WHLabel title='被保人' text={insuranceInfo && insuranceInfo.insuredName} />
                    </Col>
                    <Col className='label-col' span={6}>
                        <WHLabel title='身份证号' text={insuranceInfo && insuranceInfo.insuredIdCard} />
                    </Col>
                    <Col className='label-col' span={6}>
                        <WHLabel title='性别/年龄' text={`${insuranceInfo && insuranceInfo.sex == 1 ? '男' : insuranceInfo.sex == 0 ? '女' : '-'} / ${insuranceInfo && insuranceInfo.age || '-'}`} />
                    </Col>
                    <Col className='label-col' span={6}>
                        <WHLabel title='生日' text={getBirthdayFromIdCard(insuranceInfo && insuranceInfo.insuredIdCard)} />
                    </Col>
                </Row>
                <Row className='label-box' gutter={40}>
                    <Col className='label-col' span={6}>
                        <WHLabel title='医保类型' text={'城镇职工'} />
                    </Col>
                    <Col className='label-col' span={6}>
                        <WHLabel title='在职状态' text={'在职'} />
                    </Col>
                    <Col className='label-col' span={6}>
                        <WHLabel title='职业类别' text={'一类'} />
                    </Col>
                    <Col className='label-col' span={6}>
                        <WHLabel title='职业代码' text={insuranceInfo && insuranceInfo.professionCode} />
                    </Col>
                </Row>
                <Title text='受益人信息' left={5} />
                <Row className='label-box' gutter={40}>
                    <Col className='label-col' span={8}>
                        <WHLabel title='受益人' text={insuranceInfo && insuranceInfo.beneficiary} />
                    </Col>
                    <Col className='label-col' span={8}>
                        <WHLabel title='开户行' text={insuranceInfo && insuranceInfo.brankName} />
                    </Col>
                    <Col className='label-col' span={8}>
                        <WHLabel title='银行账号' text={insuranceInfo && insuranceInfo.brankCardNo} />
                    </Col>
                </Row>
                <Title text='系统信息' left={5} />
                <Row className='label-box' gutter={40}>
                    <Col className='label-col' span={8}>
                        <WHLabel title='创建人' text={insuranceInfo && insuranceInfo.createBy} />
                    </Col>
                    <Col className='label-col' span={8}>
                        <WHLabel title='创建时间' text={insuranceInfo && insuranceInfo.createDate} />
                    </Col>
                    <Col className='label-col' span={8}>
                        <WHLabel title='创建来源' text={insuranceInfo && insuranceInfo.channel} />
                    </Col>
                </Row>
            </div>
            </div>
        </Spin>
    }
}

export default connectRouter(connect(InsuranceOrderInfo));
