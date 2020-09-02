import React, { Component } from 'react'
import { Row, Col, Input, Select, Button, Breadcrumb } from 'antd';
import message from '@wanhu/antd-legacy/lib/message'
import { Link } from 'react-router-dom';
import { Form } from '../../common/form';
import { TablePage } from '../../common/table-page';
import DateRangePicker from '../../common/DateRangePicker';
import moment from 'moment';
import { connect } from '../../../states/toolcase/spareMoneyDetail';
import { connectRouter } from '../../../mixins/router';
import { centToYuan } from '../../../helpers/money';
import HasPermission, { testPermission } from '../../common/HasPermission';
import ProgressModal from '../../common/ProgressModal';
import AsyncEvent from '../../common/AsyncEvent';

const QueryKeyChoices = [{
    value: 'applyUser',
    label: '申领人',
}, {
    value: 'approveUser',
    label: '审批人',
}];

const StatusChoices = [{
    value: '1',
    label: '未审核',
}, {
    value: '2',
    label: '已审核',
}, {
    value: '3',
    label: '已驳回',
}];

const StatusMap = {};
StatusChoices.forEach(item => StatusMap[item.value] = item.label);

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
        parse: val => val || 'applyUser',
        stringify: val => val === 'applyUser' ? undefined : val
    },
    queryText: {},
    applicationStatus: {},
    createDate: dateRangeField,
    approveTime: dateRangeField,
});

class Application extends Component {
    constructor(props){
        super(props);
        this.hospitalAccountId = this.props.hospitalAccountId;
    }

    mapFormValuesToQuery(values) {
        const where = {};
        where.hospitalAccountId = this.hospitalAccountId;
        if (values.queryKey && values.queryText) {
            where[values.queryKey] = { $like: `%${values.queryText}%`};
        }
        where.status = values.applicationStatus || values.status;
        if (values.createDate && values.createDate.length > 0) {
            where.createDate = {};
            if (values.createDate[0]) {
                where.createDate.$gte = values.createDate[0].format('YYYY-MM-DD');
            }
            if (values.createDate[1]){
                where.createDate.$lte = values.createDate[1].format('YYYY-MM-DD');
            }
        }
        if (values.approveTime && values.approveTime.length > 0) {
            where.approveTime = {};
            if (values.approveTime[0]) {
                where.approveTime.$gte = values.approveTime[0].format('YYYY-MM-DD');
            }
            if (values.approveTime[1]){
                where.approveTime.$lte = values.approveTime[1].format('YYYY-MM-DD');
            }
        }
        if (values.limit) {
          where.limit = values.limit;
        }
        return where;
    }

    loadData = ({values, pageIndex, pageSize}) => {
        this.props.searchSpareMoneyApplication(this.mapFormValuesToQuery(values), pageIndex, pageSize);
    }

    resetData = () => {
        this.props.resetSpareMoneyDetail();
    }

    componentWillUnmount() {
        this.props.resetSpareMoneyDetail();
    }

    exportApplicationTable(values) {
        this.props.exportExcel(this.mapFormValuesToQuery(values));
    }

    downloadExportResult = (values) => {
        this.props.downloadExportResult(this.mapFormValuesToQuery(values));
    }

    // onExportSuccess = (data) => {
    //     this.props.downloadExportResult(data);
    // }

    // onExportError = (err) => {
    //     message.error(err.message, 3);
    //     this.props.resetExportResult();
    // }

    render() {
        const Column = TablePage.Column;
        return (
            <div>
                <TablePage
                    tableRef={table => this.table = table}
                    def={tableDef}
                    data={this.props.spareMoneyApplication}
                    onLoadData={this.loadData}
                    onResetData={this.resetData}
                    autoLoad={false}
                    rowKey={(row, index) => index}
                    renderFormFields={(values, loadData) => {
                        let searchProps;
                        switch (values.queryKey) {
                            case 'applyUser':
                                searchProps = { placeholder: '请输入申领人姓名' };
                                break;
                            case 'approveUser':
                                searchProps = { placeholder: '请输入审批人姓名' };
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
                            <Col span={2}>
                                <Form.Item field="applicationStatus" height="auto">
                                    <Select placeholder="请选择状态" allowClear>{ StatusChoices.map(mapChoiceToOption) }</Select>
                                </Form.Item>
                            </Col>
                            <Col span={5}>
                                <Form.Item field="createDate" height="auto">
                                    <DateRangePicker size="default" placeholder="请选择申领日期"/>
                                </Form.Item>
                            </Col>
                            <Col span={5}>
                                <Form.Item field="approveTime" height="auto">
                                    <DateRangePicker size="default" placeholder="请选择审批日期"/>
                                </Form.Item>
                            </Col>
                            <Col span={2}>
                                <Button onClick={loadData} style={{width:'100%','minWidth':0}} type="primary">查询</Button>
                            </Col>
                            <Col span={2}>
                                <HasPermission match="billing.h_account.admin">
                                    <Button style={{width:'100%','minWidth':0}} type="primary" onClick={() => this.exportApplicationTable(values)}>导出</Button>
                                </HasPermission>
                            </Col>
                        </Row>
                    }}
                    >
                    <Column title="机构"
                        dataIndex="doctorHospital"
                        key="doctorHospital"
                        render={(name, record) =>
                            <Link to={`/applicationDetail/${this.hospitalAccountId}/${record.id}?r=${encodeURIComponent(this.props.router.fullPath)}`}>
                            <span className="clickable">{name}</span>
                            </Link>}
                    />
                    <Column title="申领人" className="singleline"
                        dataIndex="applyUser"
                        key="applyUser"
                    />
                    <Column title="申领包裹数" className="singleline"
                        dataIndex="orderFillCount"
                        key="orderFillCount"
                    />
                    <Column title="申领金额" className="singleline"
                        dataIndex="applyMoney"
                        key="applyMoney"
                        render={money=>centToYuan(money, 2)}
                        />
                    <Column title="申领日期" className="singleline"
                        dataIndex="createDate"
                        key="createDate"
                        />
                    <Column title="审批人" className="singleline"
                        dataIndex="approveUser"
                        key="approveUser"
                        />
                    <Column title="审批日期" className="singleline"
                        dataIndex="approveTime"
                        key="approveTime"
                        />
                    <Column title="状态" className="singleline"
                        dataIndex="status"
                        key="status"
                        render={status => StatusMap[status] || '未知状态'}
                        />
                </TablePage>
                <AsyncEvent async={this.props.exportResult} onFulfill={this.downloadExportResult} alertError/>
                {
                    // this.props.exportResult.status === 'fulfilled' ?
                    // <ProgressModal session={this.props.exportResult.payload}
                    //     autoHide
                    //     progressTip="正在导出数据，请勿关闭本页面，否则会中断该操作。"
                    //     onSuccess={this.onExportSuccess}
                    //     onError={this.onExportError}
                    // />
                    // : null
                }
            </div>
        )
    }
}

export default connectRouter(connect(Application))


//export default Application
