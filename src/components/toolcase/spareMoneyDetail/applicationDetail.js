import React, { Component } from 'react'
import { Breadcrumb, Table, Row, Col, Spin } from 'antd';
import { Link, Route } from 'react-router-dom';
import querystring from 'querystring';
import { connectRouter } from '../../../mixins/router';
import { connect as connectApplicationDetail } from '../../../states/toolcase/applicationDetail'
import { connect as connectSpareMoneyDetail } from '../../../states/toolcase/spareMoneyDetail'
import { TablePage } from '../../common/table-page';
import { centToYuan } from '../../../helpers/money';
import WHLabel from '../../common/WH-Label'


const TypeMap = {
    3: '报销',
    4: '撤回报销款',
    5: '备用金申领',
    6: '备用金调整',
};

const StatusMap = {
    1: '未对账',
    2: '对账中',
    3: '已对账',
}

const LabelMap = [
    { name: '机构', key: 'doctorHospital' },
    { name: '申领人', key: 'applyUser' },
    { name: '申领日期', key: 'createDate' },
    { name: '申领包裹数', key: 'orderFillCount' },
    { name: '报销款金额', key: 'applyBXMoney', isMoney: true },
    { name: '撤回报销款金额', key: 'applyDKMoney', isMoney: true },
    { name: '实际申领总金额', key: 'applyMoney', isMoney: true }
]

const tableDef = TablePage.def({
    text: {}
})

class ApplicationDetail extends Component {
    constructor(props) {
        super(props)
        this.hospitalAccountId = this.props.match.params.hospitalAccountId;
        this.depositId = this.props.match.params.depositId;
    }

    loadData = ({values, pageIndex, pageSize}) => {
        const where = {};
        where.hospitalAccountId = this.hospitalAccountId;
        where.depositId = this.depositId;
        this.props.searchSpareMoneyJournal(where, pageIndex, pageSize);
    }

    componentWillMount() {
        this.props.searchApplicationDetail(this.depositId)
    }

    get returnToSpareMoneyListUrl() {
        let parUrl = this.props.router.query.r
        if(parUrl && parUrl.indexOf('?') >= 0) {
            const qs = parUrl.slice(parUrl.indexOf('?') + 1);
            const q = querystring.parse(qs);
            if (q.r) {
                return q.r;
            }
        }
        return '/spareMoneyList'
    }

    get returnToApplicationUrl() {
        if (this.props.router.query.r) {
            return this.props.router.query.r;
        } else {
            return '/spareMoneyList';
        }
    }

    resetData = () => {
        this.props.resetSpareMoneyDetail();
    }

    componentWillUnmount() {
        this.props.resetSpareMoneyDetail()
    }

    render() {
        const Column = TablePage.Column;
        const data = this.props.applicationDetail.status === 'fulfilled' ? this.props.applicationDetail.payload : {};
        return (
            <div>
                <Breadcrumb className='breadcrumb-box'>
                    <Breadcrumb.Item>
                        <Link to={this.returnToSpareMoneyListUrl}>备用金管理</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to={this.returnToApplicationUrl}>备用金申领单</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        申领单详情
                    </Breadcrumb.Item>
                </Breadcrumb>
                <Spin spinning={this.props.applicationDetail.status === 'pending'}>
                    <div className="block" style={{padding: 20}}>
                        <Row className='label-box' gutter={40}>
                        {
                            LabelMap.map((o, i) => (<Col key={i} className='label-col' span={12}>
                                <WHLabel title={o.name} text={o.isMoney && data[o.key] !== undefined ? centToYuan(data[o.key], 2) : data[o.key]}/>
                            </Col>))
                        }
                        </Row>
                    </div>
                </Spin>
                <TablePage
                    tableRef={table => this.table = table}
                    def={tableDef}
                    data={this.props.spareMoneyDetail}
                    onLoadData={this.loadData}
                    onResetData={this.resetData}
                    rowKey={(row, index) => index}
                    renderFormFields={(values, loadData) => null}
                >
                    <Column title="交易时间"
                        dataIndex="transactionDate"
                        key="transactionDate"
                    />
                    <Column title="记账日期" className="singleline"
                        dataIndex="accountingDate"
                        key="accountingDate"
                    />
                    <Column title="类型" className="singleline"
                        dataIndex="type"
                        key="type"
                        render={type => TypeMap[type] || '未知类型'}
                    />
                    <Column title="入" className="singleline"
                        dataIndex="balanceIn"
                        key="balanceIn"
                        render={money=>centToYuan(money, 2)}
                        />
                    <Column title="出" className="singleline"
                        dataIndex="balanceOut"
                        key="balanceOut"
                        render={money=>centToYuan(money, 2)}
                        />
                    <Column title="状态" className="singleline"
                        dataIndex="status"
                        key="status"
                        render={status => StatusMap[status] || '未知状态'}
                        />
                    <Column title="包裹编号" className="singleline"
                        dataIndex="orderfillNo"
                        key="orderfillNo"
                        />
                    <Column title="会员" className="singleline max-w-150"
                        dataIndex="patientName"
                        key="patientName"
                        />
                    <Column title="备注" className="singleline max-w-150"
                        dataIndex="remarks"
                        key="remarks"
                        />
                </TablePage>
            </div>
        )
    }
}

export default connectRouter(connectApplicationDetail(connectSpareMoneyDetail(ApplicationDetail)))
