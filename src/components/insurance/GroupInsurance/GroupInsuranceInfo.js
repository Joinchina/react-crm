import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Breadcrumb, Table, Timeline } from 'antd';
import Title from '../../common/Title';
import WHLabel from '../../common/WH-Label';
import Prompt from '../../common/Prompt'
import moment from 'moment';

import api from '../../../api/api';
import { connect } from '../../../states/insurance/groupInsuranceList';
import { connectRouter } from '../../../mixins/router';
// 会员卡片弹窗
import CustomerCart from '../../customerCenter/CustomerCard';

import './index.css';

const StatusChoices = [{
    value: '0',
    label: '待确认',
}, {
    value: '2',
    label: '已作废',
}, {
    value: '1',
    label: '已承保',
}, {
    value: '3',
    label: '已完成',
}];


const PatientOrderStatusChoices = [{
    value: '0',
    label: '待确认',
}, {
    value: '1',
    label: '已确认',
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
}];

const duration = [{ value: '1', label: '一年' },];
const payObj = [{ value: '1', label: '投保人全额承担' },];
const insuranceType = [{ value: '1', label: '城镇职工' },];
const payFrequency = [
    { value: '1', label: '月缴' },
    { value: '2', label: '季缴' },
    { value: '3', label: '年缴' }
];
const payWay = [{ value: '1', label: '转账或支票' },];
const insuranceFrequency = [{ value: '1', label: '即时' },];
const insurancePlanType = [{ value: '1', label: '其他' },];

function getLabel(itemMap, itemValue) {
    const item = itemMap.find(i => i.value == itemValue);
    return item ? item.label : '';
}
class GroupInsuranceInfo extends Component {

    constructor(props) {
        super(props);
        this.insuranceId = this.props.match.params.insuranceId;
        this.props.getGroupInsuranceById(this.insuranceId);
        this.state = {
            loading: false,
            countDataSource: [],
            orderList: [],
            customerCardVisible: false,
            currentCustomerId: null,

        }
    }

    async componentDidMount() {
        this.setState({ loading: true });
        const orderList = await api.getGroupInsuranceOrderList(this.insuranceId);
        this.setState({ orderList });
        const countDataSource = this.countDataSource(orderList);
        this.setState({ countDataSource, loading: false });

    }

    componentWillReceiveProps(props) {
        if (this.insuranceId !== props.match.params.insuranceId) {
            this.insuranceId = this.props.match.params.insuranceId;
            this.props.resetPage();
            this.props.getGroupInsuranceById(this.insuranceId);
        }
    }

    countDataSource(orderList) {
        const insurancedPatient = {
            code: '主被保险人',
            count: orderList.length,
        }
        let insuredList = [...orderList];
        let countInsuredList = '';
        while (insuredList && insuredList.length > 0) {
            if (!insuredList || insuredList.length <= 0) {
                break;
            }
            const code = insuredList[0].insuredProfessionType;
            const count = [...insuredList].filter(item => item.insuredProfessionType === code);
            countInsuredList += (countInsuredList ? '\n  ' : '  ') + (code || '') + (count.length || '')
            insuredList = insuredList.filter(item => item.insuredProfessionType !== code);
        }
        const countInsured = {
            code: '被保险人职业类别',
            count: countInsuredList,
        }
        let countDataSource = [];
        while (orderList && orderList.length > 0) {
            if (!orderList || orderList.length <= 0) {
                break;
            }
            const insurancePackageName = orderList[0].insurancePackageName;
            const code = orderList[0].code;
            const count = [...orderList].filter(item => item.code === code && item.insurancePackageName === insurancePackageName);
            countDataSource.push({ code: `${insurancePackageName || ''}-${code || ''}`, count: count.length });
            orderList = orderList.filter(item => item.code !== code && item.insurancePackageName !== insurancePackageName);
        }
        countDataSource.push(insurancedPatient);
        countDataSource.push(countInsured);
        return countDataSource;
    }

    get returnToTaskListUrl() {
        if (this.props.router.query.r && this.props.router.query.r.indexOf('/groupInsurance') === 0) {
            return this.props.router.query.r;
        } else {
            return '/groupInsurance';
        }
    }
    // 显示会员卡片
    showCustomerCard = (id) => {
        // console.log('showCustomerCard id:', id);
        this.setState({
            customerCardVisible: true,
            currentCustomerId: id,
        });
    };
    hideCustomerCard = () => {
        this.setState({
            customerCardVisible: false,
        });
    };


    render() {
        const { loading, orderList, countDataSource } = this.state;
        const data = this.props.insuranceInfo.payload || {};

        const insuranceFlow = data.records || [];
        const countColumns = [{
            title: '项目',
            dataIndex: 'code',
            key: 'code',
            width: 300,
        }, {
            title: '人数（人）',
            dataIndex: 'count',
            key: 'count',
            width: 300,
        }]
        const columns = [{
            title: '会员服务订单编号',
            dataIndex: 'orderNo',
            key: 'orderNo',
        }, {
            title: '服务产品',
            dataIndex: 'insuranceProductName',
            key: 'insuranceProductName',
        }, {
            title: '保额',
            dataIndex: 'coverageAmount',
            key: 'coverageAmount',
        }, {
            title: '被保险人姓名',
            dataIndex: 'insuredName',
            key: 'insuredName',
            render:(insuredName,row)=>{
                return (
                    <span
                        style={{ textDecoration: 'underline', cursor: 'pointer' }}
                        onClick={() => {
                        this.showCustomerCard(row.insuredId);
                        }}
                    >
                        {insuredName}
                    </span>

                )
            }
        }, {
            title: '被保险人身份证号',
            dataIndex: 'insuredIdCard',
            key: 'insuredIdCard',
        }, {
            title: '被保险人生日',
            dataIndex: 'insuredBirthday',
            key: 'insuredBirthday',
        }, {
            title: '年龄',
            dataIndex: 'age',
            key: 'age',
            render: (age, insurance) => {
                const today = moment();
                const birth = moment(insurance.insuredBirthday);
                const diff = today.diff(birth, 'years');
                return diff;
            }
        }, {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                if (status === null || status === undefined) return '';
                const found = PatientOrderStatusChoices.find(t => t.value === `${status}`)
                if (found) {
                    return found.label;
                }
                return '未知状态';
            }
        }, {
            title: '下单时间',
            dataIndex: 'orderDate',
            key: 'orderDate',
        }
        ];
        return <div >
            <CustomerCart
            id={this.state.currentCustomerId}
            visible={this.state.customerCardVisible}
            hideCustomerCard={this.hideCustomerCard}
            ></CustomerCart>

            <Breadcrumb className='breadcrumb-box'>
                <Breadcrumb.Item>
                    <Link to={this.returnToTaskListUrl}>投保单管理</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    投保单详情
                </Breadcrumb.Item>
            </Breadcrumb>
            <Title text='投保单流水号' num={data.orderNo} left={5}>
                <Prompt text={getLabel(StatusChoices, data.status || '-1') || '未知状态'} />
            </Title>
            <div style={{ backgroundColor: '#fff' }}>
                <Row className='label-box' gutter={40}>
                    <Col className='label-col' span={8}>
                        <WHLabel title='保险类型：' text={data ? data.type == 1 ? '个险' : data.type == 2 ? '团险' : '-' : '-'} />
                    </Col>
                    <Col className='label-col' span={8}>
                        <WHLabel title='保单号/合同号：' text={data.insurOrderNo} />
                    </Col>
                    <Col className='label-col' span={8}>
                        <WHLabel title='保单文件：' text={data.fileUrl ? `<a class="d_sty" download='d_file' href=${data.fileUrl || ''}>${data.insurOrderNo || 'xxxx'}.pdf</a>` : '-'} />
                    </Col>
                </Row>
                <Row className='label-box' gutter={40}>
                    <Col className='label-col' span={8}>
                        <WHLabel title='投保日期：' text={data.insureDate} />
                    </Col>
                    <Col className='label-col' span={8}>
                        <WHLabel title='保险期间：' text={`${data.startDate || '-'}至${data.endDate || '-'}`} />
                    </Col>
                    <Col className='label-col' span={8}>
                        <WHLabel title='保险期限：' text={getLabel(duration, data.duration || '1')} />
                    </Col>
                </Row>
                <Row className='label-box' gutter={40}>
                    <Col className='label-col' span={8}>
                        <WHLabel title='承保公司：' text={data.insuranceCompany || '-'} />
                    </Col>
                    <Col className='label-col' span={8}>
                        <WHLabel title='保险产品代码：' text={data.insuranceProductCode || '-'} />
                    </Col>
                </Row>
                <Row className='label-box' gutter={40}>
                    <Col className='label-col' span={8}>
                        <WHLabel title='缴费主体：' text={getLabel(payObj, data.payObj || '1')} />
                    </Col>
                    <Col className='label-col' span={8}>
                        <WHLabel title='缴费方式：' text={getLabel(payWay, data.payWay || '1')} />
                    </Col>
                </Row>
                <Row className='label-box' gutter={40}>
                    <Col className='label-col' span={8}>
                        <WHLabel title='缴费频次：' text={getLabel(payFrequency, data.payFrequency || '1')} />
                    </Col>
                    <Col className='label-col' span={8}>
                        <WHLabel title='当前缴费期数：' text={data.period ? `${data.period}` : ''} />
                    </Col>
                    <Col className='label-col' span={8}>
                        <WHLabel title='末次缴费日期：' text={data.lastPayDate} />
                    </Col>
                </Row>
                <Row className='label-box' gutter={40}>
                    <Col className='label-col' span={8}>
                        <WHLabel title='提交时间：' text={data.createDate} />
                    </Col>
                    <Col className='label-col' span={8}>
                        <WHLabel title='提交人：' text={data.createBy} />
                    </Col>
                </Row>
                <Title text='被保人信息' left={5} />
                <Row style={{ marginTop: '20px', marginBottom: '10px' }}>
                    <Col>
                        <label for="insuranceNo" title="投保清单">投保清单</label>
                    </Col>
                </Row>
                <div className="table-box tableBox" >
                    <Table loading={loading} dataSource={orderList} rowKey={record => record.insuredId} columns={columns} pagination={false} bordered={false} />
                </div>

                {/* <Row style={{ marginTop: '20px', marginBottom: '10px' }}>
                    <Col>
                        <label for="insuranceNo" title="投保清单">统计数据</label>
                    </Col>
                </Row>
                <div className="table-box tableBox" style={{ width: '50%' }}>
                    <Table loading={loading} dataSource={countDataSource} rowKey={record => record.id} columns={countColumns} pagination={false} bordered={false} />
                </div> */}
                <div style={{ marginTop: '10px' }}></div>
                <Title text='投保单流水' left={5} />
                <Timeline className='timeline-box'>
                    {
                        insuranceFlow.map((item, index) => {
                            return (
                                <Timeline.Item key={index}>
                                    <span><i></i>{moment(item.date).format('YYYY-MM-DD HH:mm:ss')}</span>
                                    {item.content}
                                </Timeline.Item>
                            )
                        })
                    }

                </Timeline>
            </div>
        </div>;
    }
}

export default connectRouter(connect(GroupInsuranceInfo));
