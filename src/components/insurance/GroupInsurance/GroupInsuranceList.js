import React, { Component } from 'react'
import { Row, Col, Input, Select, Button, Modal, DatePicker } from 'antd';
import message from '@wanhu/antd-legacy/lib/message';
import { Form } from '../../common/form';
import { TablePage } from '../../common/table-page';
import { connect as connectState } from '../../../states/insurance/groupInsuranceList';
import AsyncEvent from '../../common/AsyncEvent';
import { connectRouter } from '../../../mixins/router';
const TableColumn = TablePage.Column;
import history from '../../../history'
import HasPermission, { testPermission } from '../../common/HasPermission';
import moment from 'moment';
import api from '../../../api/api';

const StatusChoices = [{
    value: '0',
    label: '待确认',
}, {
    value: '1',
    label: '已承保',
}, {
    value: '3',
    label: '已完成',
}, {
    value: '4',
    label: '待退保',
}, {
    value: '5',
    label: '已退保',
}];

const QueryKeyChoices = [{
    value: 'insurOrderNo',
    label: '保单号',
    placeholder: '请输入保单号',
}, {
    value: 'orderNo',
    label: '投保单流水号',
    placeholder: '请输入投保单流水号',
}];

const mapChoiceToOption = (choice, i) => <Select.Option key={i} value={choice.value}>{choice.label}</Select.Option>;

const tableDef = TablePage.def({
    queryKey: {
        parse: val => val || 'orderNo',
        stringify: val => val === 'orderNo' ? undefined : val
    },
    queryText: {},
    status: {},
});

class GroupInsurance extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            insurId: null,
            confirmDate: null,
            confirmDateExplain: null,
            insurOrderNoExplain: null,
        }
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.router.modal === 'newGroupInsurance' && !nextProps.router.modal) {
            this.table.reload();
        }
    }

    componentWillUnmount() {
        this.props.resetGroupInsurances();
    }

    loadData = ({ values, pageIndex, pageSize }) => {
        const where = {};
        if (values.queryKey && values.queryText) {
            where[values.queryKey] = values.queryText;
        }
        where.status = values.status;
        this.props.searchGroupInsurances(where, pageIndex, pageSize);
    }

    resetData = () => {
        this.props.resetGroupInsurances();
    }

    openNewGroupInsuranceModal = () => {
        this.props.router.openModal('newGroupInsurance');
    }

    showDetail = (insurance) => {
        if (insurance.status === 0) {
            return;
        }
        history.push(`/groupInsuranceDetail/${insurance.insurId}?r=${encodeURIComponent(this.props.router.fullPath)}`);
    }

    updateInsurance = (insurance) => {
        this.props.router.openModal('newGroupInsurance', insurance.insurId);
    }

    openConfirmModal = (insurance) => {
        this.setState({ visible: true, insurId: insurance.insurId, insurOrderNo: '', confirmDate: null })
    }

    cancelInsurance = (insurance) => {
        Modal.confirm({
            title: `该操作不可撤销，且被作废的投保单流水号不可再用。确认作废吗？`,
            onOk: () => {
                this.props.cancelGroupInsurance(insurance.insurId);
            },
            onCancel() { }
        });
    }

    onChange = (date, dateString) => {
        if (!dateString) {
            this.setState({ confirmDateExplain: '不能为空' });
        }
        this.setState({ confirmDate: dateString, confirmDateExplain: '' });
    }
    insurOrderNoOnChange = val => {
        if (!val.target.value) {
            this.setState({ insurOrderNoExplain: '不能为空' });
        }
        this.setState({ insurOrderNo: val.target.value, insurOrderNoExplain: '' });
    }
    insuranceConfirmation = () => {
        const { insurId, confirmDate, insurOrderNo } = this.state;
        if (!confirmDate) {
            this.setState({ confirmDateExplain: '不能为空' });
        }
        if (!insurOrderNo) {
            this.setState({ insurOrderNoExplain: '不能为空' });
        }
        if (confirmDate && insurOrderNo) {
            this.props.confirmGroupInsurance(insurId, confirmDate, insurOrderNo);
            this.setState({ visible: false, confirmDate: null, insurId: null, confirmDateExplain: '', insurOrderNo: null, insurOrderNoExplain: '' });
        }
    }

    finishConfirmStatus = () => {
        message.success('承保确认成功', 3);
        this.table.reload({ scrollToTop: false });
    }
    finishCancelStatus = () => {
        message.success('投保单已作废', 3);
        this.table.reload({ scrollToTop: false });
    }

    exportList = (insuranceItem) => {
        window.open(`_api/team_insurance/${insuranceItem.insurId}/download`);
    }

    render() {
        const { visible, confirmDateExplain, confirmDate, insurOrderNo, insurOrderNoExplain } = this.state;
        return (
            <div>
                <Modal
                    visible={visible}
                    title={<span>承保确认</span>}
                    onCancel={() => this.setState({ visible: false })}
                    onOk={() => this.insuranceConfirmation()}
                    okText="提交"
                >

                    <Row>
                        <Col span={6} style={{ lineHeight: '36px' }}>
                            <span style={{ color: 'red' }}>*</span>投保日期:
                        </Col>
                        <Col span={16}>
                            <DatePicker onChange={this.onChange} value={confirmDate ? moment(confirmDate) : null} />
                            <div className="ant-form-explain" style={{ color: 'red' }}>{confirmDateExplain}</div>
                        </Col>
                    </Row>
                    <Row style={{ paddingTop: '10px' }}>
                        <Col span={6} style={{ lineHeight: '36px' }}>
                            <span style={{ color: 'red' }}>*</span>保单号:
                        </Col>
                        <Col span={16}>
                            <Input onChange={this.insurOrderNoOnChange} value={insurOrderNo} maxLength={100} />
                            <div className="ant-form-explain" style={{ color: 'red' }}>{insurOrderNoExplain}</div>
                        </Col>
                    </Row>
                    <Row style={{ paddingTop: '10px' }}>
                        <Col span={2} />
                        <Col span={16}>以上提交后不可修改，请谨慎操作。</Col>
                    </Row>

                </Modal>
                <TablePage
                    def={tableDef}
                    data={this.props.groupInsurances}
                    autoLoad={false}
                    onLoadData={this.loadData}
                    onResetData={this.resetData}
                    tableRef={table => this.table = table}
                    rowKey='insurId'
                    renderFormFields={(values, loadData) => {
                        let searchProps;
                        const selectedItem = QueryKeyChoices.find(item => item.value === values.queryKey);
                        searchProps = { placeholder: selectedItem.placeholder || '' };
                        return <Row gutter={10} className="block filter-box">
                            <Col span={3} key="1">
                                <Form.Item field="queryKey" height="auto">
                                    <Select>{QueryKeyChoices.map(mapChoiceToOption)}</Select>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item field="queryText" height="auto">
                                    <Input {...searchProps} onPressEnter={loadData} maxLength={100} />
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item field="status" height="auto">
                                    <Select placeholder="投保单状态" allowClear>{StatusChoices.map(mapChoiceToOption)}</Select>
                                </Form.Item>
                            </Col>
                            <Col span={3}>
                                <Button onClick={loadData} style={{ width: '100%', 'minWidth': 0 }} type="primary">查询</Button>
                            </Col>
                            <Col span={3}>
                                <HasPermission match="crm.task_pool.edit"><Button onClick={this.openNewGroupInsuranceModal} style={{ width: '100%', 'minWidth': 0 }} type="primary">新建</Button></HasPermission>
                            </Col>
                        </Row>
                    }}
                >
                    <TableColumn title="投保单流水号" className="singleline max-w-200"
                        dataIndex="orderNo"
                        key="orderNo"
                        onCellClick={(insurance) => this.showDetail(insurance)}
                        render={(text, insurance) =>
                            insurance.status === 0 ?
                                text : <span className="clickable">{text}</span>
                        }
                    />
                    <TableColumn title="保单号" className="singleline max-w-200"
                        dataIndex="insurOrderNo"
                        key="insurOrderNo"
                    />
                    <TableColumn title="类型" className="singleline"
                        dataIndex="type"
                        key="type"
                        render = {(type) => {
                            if(type == 1){
                                return '个险';
                            }else if(type == 2){
                                return '团险';
                            } else {
                                return '-'
                            }
                        }}
                    />
                    <TableColumn title="投保日期" className="singleline"
                        dataIndex="insurDate"
                        key="insurDate"
                    />
                    <TableColumn title="保险期间" className="singleline"
                        dataIndex="duration"
                        key="duration"
                    />
                    <TableColumn title="投保单状态" className="singleline"
                        dataIndex="status"
                        key="status"
                        render={(status) => {
                            if (status === null || status === undefined) return '';
                            const found = StatusChoices.find(t => t.value === `${status}`)
                            if (found) {
                                return found.label;
                            }
                            return '未知状态';
                        }}
                    />
                    <TableColumn title="提交时间" className="singleline"
                        dataIndex="createDate"
                        key="createDate"
                    />
                    {
                        testPermission('groupInsurance.edit') || testPermission('groupInsurance.export') ?
                            <TableColumn title="操作" className="singleline"
                                dataIndex="status"
                                key="op"
                                renderTip={() => null}
                                render={(status, insurance) => {
                                    let toggleBtn;
                                    if (status == 0) {
                                        toggleBtn = <span>
                                            {testPermission('groupInsurance.edit') ? <span className="clickable" onClick={() => this.updateInsurance(insurance)}>修改</span> : null}
                                            {testPermission('groupInsurance.edit') ? <span className="clickable" onClick={() => this.openConfirmModal(insurance)}>承保确认</span> : null}
                                            {testPermission('groupInsurance.export') ? <span className="clickable" onClick={() => this.exportList(insurance)}>导出清单</span> : null}
                                        </span>
                                    } else if (testPermission('groupInsurance.export')) {
                                        toggleBtn = <span>
                                            <span className="clickable" onClick={() => this.exportList(insurance)}>导出清单</span>
                                        </span>
                                    }

                                    return toggleBtn
                                }}
                            />
                            : null
                    }
                </TablePage>
                <AsyncEvent async={this.props.cancelStatus} onFulfill={this.finishCancelStatus} alertError />
                <AsyncEvent async={this.props.confirmStatus} onFulfill={this.finishConfirmStatus} alertError />
            </div>
        )
    }
}

export default connectRouter(connectState(GroupInsurance));
