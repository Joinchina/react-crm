import React, { Component } from 'react'
import { Row, Col, Input, Select, Button, Breadcrumb, } from 'antd';
import { Form } from '../../common/form';
import { TablePage } from '../../common/table-page';
import DateRangePicker from '../../common/DateRangePicker';
import moment from 'moment';
import { connect } from '../../../states/toolcase/spareMoneyDetail';
import { connectRouter } from '../../../mixins/router';
import { centToYuan } from '../../../helpers/money';

const QueryKeyChoices = [{
    value: 'patientName',
    label: '会员',
}, {
    value: 'orderfillNo',
    label: '包裹编号',
}];

const StatusChoices = [{
    value: '1',
    label: '未对账',
}, {
    value: '2',
    label: '对账中',
}, {
    value: '3',
    label: '已对账',
}];

const TypeChoices = [{
    value: '3',
    label: '报销',
}, {
    value: '4',
    label: '撤回报销款',
}, {
    value: '5',
    label: '备用金申领',
}, {
    value: '6',
    label: '备用金调整',
}];

const StatusMap = {};
StatusChoices.forEach(item => StatusMap[item.value] = item.label);

const TypeMap = {};
TypeChoices.forEach(item => TypeMap[item.value] = item.label);

const mapChoiceToOption = (choice, i) => <Select.Option key={i} value={choice.value}>{choice.label}</Select.Option>

const dateRangeField = {
    parse: val => val ? val.split(',').map(s => {
        if (!s) return undefined;
        const m = moment(s);
        return m.isValid() ? m : undefined
    }) : undefined,
    stringify: val => val ? val.map(d => (d && moment.isMoment(d)) ? d.format('YYYY-MM-DD') : '').join(',') : undefined
};

const tableDef = TablePage.def({
    queryKey: {
        parse: val => val || 'patientName',
        stringify: val => val === 'patientName' ? undefined : val
    },
    queryText: {},
    spareMoneyType: {},
    spareMoneyStatus: {},
    dealDate: dateRangeField,
    accountDate: dateRangeField,
});

class Stream extends Component {
    constructor(props){
        super(props);
        this.hospitalAccountId = this.props.hospitalAccountId;
    }

    loadData = ({values, pageIndex, pageSize}) => {
        const where = {};
        where.hospitalAccountId = this.hospitalAccountId;
        if (values.queryKey && values.queryText) {
            if(values.queryKey === 'patientName') {
                where[values.queryKey] = { $like: `%${values.queryText}%`};
            } else if (values.queryKey === 'orderfillNo') {
                where[values.queryKey] = values.queryText
            }
        }
        where.type = values.spareMoneyType;
        where.status = values.spareMoneyStatus;
        if (values.dealDate && values.dealDate.length > 0) {
            where.transactionDate = {};
            if (values.dealDate[0]) {
                where.transactionDate.$gte = values.dealDate[0].format('YYYY-MM-DD');
            }
            if (values.dealDate[1]){
                where.transactionDate.$lte = values.dealDate[1].format('YYYY-MM-DD');
            }
        }
        if (values.accountDate && values.accountDate.length > 0) {
            where.accountingDate = {};
            if (values.accountDate[0]) {
                where.accountingDate.$gte = values.accountDate[0].format('YYYY-MM-DD');
            }
            if (values.accountDate[1]){
                where.accountingDate.$lte = values.accountDate[1].format('YYYY-MM-DD');
            }
        }
        this.props.searchSpareMoneyJournal(where, pageIndex, pageSize);
    }

    resetData = () => {
        this.props.resetSpareMoneyDetail();
    }

    componentWillUnmount() {
        this.props.resetSpareMoneyDetail();
    }

    render() {
        const Column = TablePage.Column;
        return (
            <div>
                <TablePage
                    tableRef={table => this.table = table}
                    def={tableDef}
                    data={this.props.spareMoneyDetail}
                    onLoadData={this.loadData}
                    onResetData={this.resetData}
                    autoLoad={false}
                    rowKey={(row, index) => index}
                    renderFormFields={(values, loadData) => {
                        let searchProps;
                        switch (values.queryKey) {
                            case 'patientName':
                                searchProps = { placeholder: '请输入会员名称' };
                                break;
                            case 'orderfillNo':
                                searchProps = { placeholder: '请输入包裹编号' };
                                break;
                            default:
                                searchProps = { disabled: true };
                                break;
                        }
                        return <Row gutter={10} className="block filter-box">
                            <Col span={2}>
                                <Form.Item field="queryKey" height="auto">
                                    <Select>{ QueryKeyChoices.map(mapChoiceToOption) }</Select>
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item field="queryText" height="auto">
                                    <Input {...searchProps} onPressEnter={loadData}/>
                                </Form.Item>
                            </Col>
                            <Col span={3}>
                                <Form.Item field="spareMoneyType" height="auto">
                                    <Select placeholder="请选择交易类型" allowClear>{ TypeChoices.map(mapChoiceToOption) }</Select>
                                </Form.Item>
                            </Col>
                            <Col span={2}>
                                <Form.Item field="spareMoneyStatus" height="auto">
                                    <Select placeholder="请选择状态" allowClear>{ StatusChoices.map(mapChoiceToOption) }</Select>
                                </Form.Item>
                            </Col>
                            <Col span={5}>
                                <Form.Item field="dealDate" height="auto">
                                    <DateRangePicker size="default" placeholder="请选择交易时间"/>
                                </Form.Item>
                            </Col>
                            <Col span={5}>
                                <Form.Item field="accountDate" height="auto">
                                    <DateRangePicker size="default" placeholder="请选择记账日期"/>
                                </Form.Item>
                            </Col>
                            <Col span={2}>
                                <Button onClick={loadData} style={{width:'100%','minWidth':0}} type="primary">查询</Button>
                            </Col>
                        </Row>
                    }}
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

export default connectRouter(connect(Stream))
