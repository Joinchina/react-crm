import React, { Component } from 'react'
import { Row, Col, Input, Select, DatePicker, Button, Table } from 'antd'
import { connect as connectOrderList } from '../../../states/toolcase/incomeList'
import moment from 'moment'
import { TablePage } from '../../common/table-page';
import DateRangePicker from '../../common/DateRangePicker'
import { Form } from '../../common/form';
import { connectModalHelper } from '../../../mixins/modal';
import { connectRouter } from '../../../mixins/router';
import SelectSingleHospital from '../../common/SelectSingleHospital'
import HasPermission from '../../common/HasPermission';
import api from '../../../api/api';
import { centToYuan } from '../../../helpers/money';
import './index.scss';

const { MonthPicker } = DatePicker;
const QueryKeyChoices = [{
    value: 'orderfillNo',
    label: '包裹单编号',
}, {
    value: 'name',
    label: '会员',
}];

const StatusChoices = [
    { value: '0', label: '未对账' },
    { value: '1', label: '已对账' },
];

const StatusMap = {};
StatusChoices.forEach(item => StatusMap[item.value] = item.label);

const mapChoiceToOption = (choice, i) => <Select.Option key={i} value={choice.value} title={choice.label}>{choice.label}</Select.Option>

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
        parse: val => val || 'orderfillNo',
        stringify: val => val === 'orderfillNo' ? undefined : val
    },
    queryText: {},
    statementStatus: {},
    hospitalIds: {
        parse: val => val ? { id: val } : undefined,
        stringify: val => val ? val.id : undefined
    },
    statementDate: {
        parse: val => val ? moment(val).isValid() ? moment(val) : undefined : undefined,
        stringify: val => val ? moment.isMoment(val) ? val.format('YYYY-MM') : '' : undefined
    },
    accountDate: dateRangeField,
});


class IncomeList extends Component {

    state = {}

    loadData = async ({values, pageIndex, pageSize}) => {
        const where = this.mapFormValuesToQuery(values);
        this.props.searchOrder(where, pageIndex, pageSize);
        const { sum } = this.state;
        if (!sum || pageIndex === 1) {//仅在刷新页面或查询条件变更回到第一页时请求接口
            this.setState({ sum: null });
            let sumRes = await api.getIncomesSum(where);
            sumRes = { id: "sum", orderfillNo: '合计', ...sumRes };
            this.setState({ sum: sumRes });
        }
    }

    mapFormValuesToQuery(values) {
        const where = {};
        if (values.queryKey && values.queryText) {
            where[values.queryKey] = values.queryText
        }
        where.statementDate = values.statementDate ? moment(values.statementDate).format('YYYYMM') : undefined;
        where.statementStatus = values.statementStatus;
        where.hospitalIds = values.hospitalIds && values.hospitalIds.id;
        if (values.accountDate && values.accountDate.length > 0) {
            if (values.accountDate[0]) {
                where.accountDateStart = values.accountDate[0].format('YYYY-MM-DD');
            }
            if (values.accountDate[1]){
                where.accountDateEnd = values.accountDate[1].format('YYYY-MM-DD');
            }
        }
        return where;
    }

    resetData = () => {
        this.props.resetOrder();
    }

    componentWillUnmount() {
        this.props.resetOrder();
    }

    onExportTable(values) {
        const where = this.mapFormValuesToQuery(values);
        api.downloadIncomeTable(where);
    }

    render() {
        const columns = [{
            title: '包裹单编号',
            dataIndex: 'orderfillNo',
            render: text => <span title={text}>{text}</span>
        },{
            title: '会员',
            dataIndex: 'name',
            render: text => <span title={text}>{text}</span>
        },{
            title: '签约机构',
            dataIndex: 'hospitalName',
            render: text => <span title={text}>{text}</span>
        },{
            title: '通用名（商品名）',
            dataIndex: 'drugName',
            render: text => <span title={text}>{text}</span>
        },{
            title: '规格',
            dataIndex: 'standard',
            render: text => <span title={text}>{text}</span>
        },{
            title: '分类',
            dataIndex: 'largeClass',
            render: text => <span title={text}>{text}</span>
        },{
            title: '数量',
            dataIndex: 'number',
            className: 'singleline',
            render: text => <span title={text}>{text}</span>
        },{
            title: '单价',
            dataIndex: 'price',
            className: 'singleline',
            render: text => <span title={text && centToYuan(text, 2)}>{text && centToYuan(text, 2)}</span>
        },{
            title: '小计金额',
            dataIndex: 'subAmount',
            className: 'singleline',
            render: text => <span title={text && centToYuan(text, 2)}>{text && centToYuan(text, 2)}</span>
        },{
            title: '金额',
            dataIndex: 'amount',
            className: 'singleline',
            render: text => <span title={text && centToYuan(text, 2)}>{text && centToYuan(text, 2)}</span>
        },{
            title: '报销金额',
            dataIndex: 'refundAmount',
            className: 'singleline',
            render: text => <span title={text && centToYuan(text, 2)}>{text && centToYuan(text, 2)}</span>
        },{
            title: '实收金额',
            dataIndex: 'realAmount',
            className: 'singleline',
            render: text => <span title={text && centToYuan(text, 2)}>{text && centToYuan(text, 2)}</span>
        },{
            title: '对账状态',
            dataIndex: 'statementStatus',
            className: 'singleline',
            render: status => <span>{StatusMap[status]}</span>
        },{
            title: '对账月份',
            dataIndex: 'statementDate',
            className: 'singleline',
            render: (text) => <span title={text ? moment(text).format('YYYYMM') : null}>{text ? moment(text).format('YYYYMM') : null}</span>
        },{
            title: '记账日期',
            dataIndex: 'accountDate',
            className: 'singleline',
            render: (text) => <span title={text ? moment(text).format('YYYY-MM-DD') : null}>{text ? moment(text).format('YYYY-MM-DD') : null}</span>
        }];
        let incomeList = this.props.incomeList;
        if (this.state.sum && incomeList && incomeList.list && incomeList.list.length > 0) {
            const list = [...incomeList.list];
            const lastItem = {
                ...list[list.length - 1],
            };
            lastItem.children = lastItem.children ? [...lastItem.children] : [];
            lastItem.children.push(this.state.sum);
            list[list.length - 1] = lastItem;
            incomeList = {
                ...incomeList,
                list,
            };
        }
        const expandedRowKeys = this.props.incomeList && this.props.incomeList.list &&
            this.props.incomeList.list.map(item => item.id);
        return (
            <div className="income-list">
                <TablePage
                    className="table-narrow"
                    def={tableDef}
                    data={incomeList}
                    onLoadData={this.loadData}
                    onResetData={this.resetData}
                    tableRef={table => this.table = table}
                    autoLoad={false}
                    rowKey="id"
                    expandedRowKeys={expandedRowKeys}
                    renderFormFields={(values, loadData) => {
                        let searchProps;
                        switch (values.queryKey) {
                            case 'orderfillNo':
                                searchProps = { placeholder: '请输入包裹单编号' };
                                break;
                            case 'name':
                                searchProps = { placeholder: '请输入会员姓名' };
                                break;
                            default:
                                searchProps = { disabled: true };
                                break;
                        }
                        return <Row gutter={10} className="block filter-box">
                                <Col span={2} key="1">
                                    <Form.Item field="queryKey" height="auto">
                                        <Select>{ QueryKeyChoices.map(mapChoiceToOption) }</Select>
                                    </Form.Item>
                                </Col>
                                <Col span={4} key="2">
                                    <Form.Item field="queryText" height="auto">
                                        <Input {...searchProps} onPressEnter={loadData}/>
                                    </Form.Item>
                                </Col>
                            <Col span={4}>
                                <Form.Item field="hospitalIds" height="auto">
                                    <SelectSingleHospital placeholder="请选择签约机构" allowClear={true} />
                                </Form.Item>
                            </Col>
                            <Col span={3}>
                                <Form.Item field="statementStatus" height="auto">
                                    <Select placeholder="请选择对账状态" allowClear>{ StatusChoices.map(mapChoiceToOption) }</Select>
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item field="statementDate" height="auto">
                                    <MonthPicker size="default" placeholder="请选择对账月份" style={{width: '100%'}}/>
                                </Form.Item>
                            </Col>
                            <Col span={5}>
                                <Form.Item field="accountDate" height="auto">
                                    <DateRangePicker size="default" placeholder="请选择记账日期"/>
                                </Form.Item>
                            </Col>
                            <Col span={2}>
                                <HasPermission match={{ $any: [ 'billing.inout.view', 'billing.inout.export'] }}>
                                    <Button onClick={loadData} style={{width:'100%','minWidth':0}} type="primary">查询</Button>
                                </HasPermission>
                            </Col>
                        </Row>
                    }}
                    renderFooter={(values) => <div>
                        <Row>
                            <HasPermission match="billing.inout.export">
                                <Button type="primary" onClick={()=>this.onExportTable(values)}> 导出 </Button>
                            </HasPermission>
                        </Row>
                    </div>}
                    footerHeight={36}
                    columns={columns}
                />
            </div>
        )
    }
}

export default connectRouter(connectModalHelper(connectOrderList(IncomeList)));
