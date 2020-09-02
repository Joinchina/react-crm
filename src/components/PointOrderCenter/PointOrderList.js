import React, { Component } from 'react'
import { Row, Col, Input, Select, Button, Modal, } from 'antd';
import { Form } from '../common/form';
import { TablePage } from '../common/table-page';
import { connect as connectState } from '../../states/pointOrder/pointOrderList';
import { connectRouter } from '../../mixins/router';
const TableColumn = TablePage.Column;
import {DateRangePicker} from '../common/DateRangePicker'
import history from '../../history'
import moment from 'moment';

const QueryKeyChoices = [{
    value: '1',
    label: '购买人姓名',
}, {
    value: '2',
    label: '购买人手机号',
}, {
    value: '3',
    label: '订单号',
}];

const StatusChoices = [
    { value: '0', label: '待支付' },
    { value: '1', label: '已支付' },
    { value: '2', label: '支付失败' },
];


const mapChoiceToOption = (choice, i) => <Select.Option key={i} value={choice.value}>{choice.label}</Select.Option>;

const tableDef = TablePage.def({
    type: {
        parse: val => val || '1',
        stringify: val => val === '1' ? undefined : val
    },
    search: {},
    startTime: {
        parse: val => (val ? val.split(',').map((s) => {
            if (!s) return undefined;
            const m = moment(s);
            return m.isValid() ? m : undefined;
        }) : undefined),
        stringify: val => (val ? val.map(d => ((d && moment.isMoment(d)) ? d.format('YYYY-MM-DD') : '')).join(',') : undefined),
    },
    status: {}
});

class PointOrderList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            insurId: null,
            confirmDate: null,
            confirmDateExplain: null,
        }
    }

    componentWillUnmount() {
        console.log(this.props);
        this.props.resetPointOrderList();
    }

    loadData = ({ values, pageIndex, pageSize }) => {
        const where = {};
        if (values.startTime && values.startTime.length > 0) {
            if (values.startTime[0]) {
                where.startDate = values.startTime[0].format('YYYY-MM-DD');
            }
            if (values.startTime[1]) {
                where.endDate = values.startTime[1].format('YYYY-MM-DD');
            }
        }
        where.type = values.type;
        where.search = values.search;
        where.status = values.status;
        where.payWay = values.payWay;
        where.payStatus = values.payStatus;
        this.props.searchPointOrderList(where, pageIndex, pageSize);
    }

    resetData = () => {
        this.props.resetPointOrderList();
    }

    showDetail = (insurance) => {
        history.push(`/pointOrderDetail/${insurance.orderId}?r=${encodeURIComponent(this.props.router.fullPath)}`);
    }

    render() {
        const { visible, confirmDateExplain, confirmDate } = this.state;
        return (
            <div>
                <TablePage
                    def={tableDef}
                    data={this.props.pointOrderListStatus}
                    autoLoad={false}
                    onLoadData={this.loadData}
                    onResetData={this.resetData}
                    tableRef={table => this.table = table}
                    rowKey='insurId'
                    renderFormFields={(values, loadData) => {
                        let searchProps;
                        switch (values.type) {
                            case '1':
                                searchProps = { placeholder: '请输入购买人姓名' };
                                break;
                            case '2':
                                searchProps = { placeholder: '请输入购买人手机号' };
                                break;
                            case '3':
                                searchProps = { placeholder: '请输入订单号' };
                                break;
                            default:
                                searchProps = { disabled: true };
                                break;
                        }
                        return <Row gutter={10} className="block filter-box">
                            <Col span={4} key="1">
                                <Form.Item field="type" height="auto">
                                    <Select>{QueryKeyChoices.map(mapChoiceToOption)}</Select>
                                </Form.Item>
                            </Col>
                            <Col span={4} key="2">
                                <Form.Item field="search" height="auto">
                                    <Input {...searchProps} onPressEnter={loadData} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item field="startTime" height="auto">
                                    <DateRangePicker size="default" placeholder="请选择下单时间" />
                                </Form.Item>
                            </Col>
                            <Col span={3}>
                                <Form.Item field="status" height="auto">
                                    <Select placeholder="请选择订单状态" allowClear>{StatusChoices.map(mapChoiceToOption)}</Select>
                                </Form.Item>
                            </Col>
                            <Col span={2}>
                                <Button onClick={loadData} style={{ width: '100%', 'minWidth': 0 }} type="primary">查询</Button>
                            </Col>
                        </Row>
                    }}
                >
                    <TableColumn title="订单号" className="singleline max-w-200"
                        dataIndex="orderNo"
                        key="orderNo"
                        onCellClick={this.showDetail}
                        render={text=><span className="clickable">{text}</span>}
                    />
                    <TableColumn title="名称" className="singleline"
                        dataIndex="insuredName"
                        key="insuredName"
                    />
                    <TableColumn title="品类"
                        dataIndex="insuredIdCard"
                        key="insuredIdCard"
                    />
                    <TableColumn title="数量" className="singleline"
                        dataIndex="insuredPhone"
                        key="insuredPhone"
                    />
                    <TableColumn title="下单时间" className="singleline"
                        dataIndex="insurancePackageName"
                        key="insurancePackageName"
                    />
                    <TableColumn title="购买人" className="singleline"
                        dataIndex="insurancePackageGradeName"
                        key="insurancePackageGradeName"
                    />
                    <TableColumn title="订单状态" className="singleline"
                        dataIndex="status"
                        key="status"
                    />
                    <TableColumn title="操作" className="singleline"
                        dataIndex="payWay"
                        key="payWay"
                    />
                </TablePage>
            </div>
        )
    }
}

export default connectRouter(connectState(PointOrderList));
