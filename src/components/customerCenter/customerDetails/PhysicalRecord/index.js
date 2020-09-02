import React, { Component } from 'react';
import { connect as connectRedux } from '../../../../states/customerCenter/physicalRecord';
import { TablePage } from '../../../common/table-page';
import { connectModalHelper } from '../../../../mixins/modal';
import { connectRouter } from '../../../../mixins/router';
import { Modal, Row, Col, Input, Button } from 'antd';
import message from '@wanhu/antd-legacy/lib/message'
import HasPermission, { testPermission } from '../../../common/HasPermission';
import NotEditableField from '../../../common/NotEditableField';
import moment from 'moment';
import { physicalType } from '../../../../helpers/enums';
import AsyncEvent from '../../../common/AsyncEvent';
import { Link } from 'react-router-dom'


const TableColumn = TablePage.Column;
const tableDef = TablePage.def({});
const PhysicalStatus = {
    1: '未提交',
    2: '已提交'
}

class PhysicalRecord extends Component {
    loadData = ({ pageIndex, pageSize }) => {
        this.props.getPhysicalRecordAction(this.props.customerId, pageIndex, pageSize);
    }

    resetData = () => {
        this.props.resetPhysicalRecordAction();
    }

    componentWillUnmount() {
        this.resetData();
    }

    deletePhysicalRecord = id => {
        Modal.confirm({
            title: `确认要删除体检记录吗？`,
            onOk: () => this.props.deletePhysicalRecordAction(this.props.customerId, id)
        });
    }

    finishDeletePhysicalRecord = () => {
        message.success('删除体检记录成功', 2);
        this.table.reload({ scrollToTop: false });
    }

    componentWillReceiveProps(props) {
        if (this.props.currentModal === 'newPhysicalRecord' && !props.currentModal) {
            this.table.reload();
        }
    }

    render() {
        return (
            <div className="block table-box">
                <TablePage
                    def={tableDef}
                    data={this.props.physicalRecordList}
                    onLoadData={this.loadData}
                    onResetData={this.resetData}
                    tableRef={table => this.table = table}
                    autoLoad
                    rowKey="id"
                    renderFormFields={() => <Row gutter={10}>
                            <Col span={20} />
                            <Col span={4}>
                                <HasPermission match='patient.edit'>
                                    <NotEditableField style={{border:'none'}}
                                        switchState={() => this.props.openModal('newPhysicalRecord', this.props.customerId)} />
                                </HasPermission>
                            </Col>
                        </Row>}>
                    <TableColumn title="体检日期" className="singleline"
                        dataIndex="physicalExaminationDate"
                        key="physicalExaminationDate"
                        render={(physicalExaminationDate, record) =>
                            <Link to={`${this.props.orderDetailPath || '/physicalRecordDetail'}/${this.props.customerId}/${record.id}?r=${encodeURIComponent(this.props.router.fullPath)}`}>
                                <span className="clickable">{physicalExaminationDate && moment(physicalExaminationDate).format('YYYY-MM-DD') || ''}</span>
                            </Link>
                        }
                    />
                    <TableColumn title="体检类型" className="singleline"
                        dataIndex="type"
                        key="type"
                        render={type => physicalType.map[type]}
                    />
                    <TableColumn title="提交日期" className="singleline"
                            dataIndex="submitDate"
                            key="submitDate"
                            render={(submitDate, order) => <span>{order.status === 2 && submitDate && moment(submitDate).format('YYYY-MM-DD') || ''}</span>}
                        />
                    <TableColumn title="创建人" className="singleline"
                        dataIndex="createUserName"
                        key="createUserName"
                    />
                    <TableColumn title="状态" className="singleline"
                        dataIndex="status"
                        key="status"
                        render={status => <span style={{color: status === 1 ? 'red' : ''}}>{PhysicalStatus[status]}</span>}
                    />
                    {
                        testPermission('patient.edit') ?
                        <TableColumn title="操作" className="singleline"
                            dataIndex="id"
                            key="id"
                            renderTip={() => null}
                            render={(id, record) => {
                                if(record.status === 1) {
                                    return <div>
                                        <Link to={`${this.props.orderDetailPath || '/physicalRecordDetail'}/${this.props.customerId}/${record.id}?edit=edit&r=${encodeURIComponent(this.props.router.fullPath)}`}>
                                            <span title='编辑' className="clickable" style={{marginRight: 10}}>编辑</span>
                                        </Link>
                                        <span title='删除' className="clickable" onClick={() => this.deletePhysicalRecord(id)}>删除</span>
                                    </div>
                                }
                            }}
                        /> : null
                    }
                </TablePage>
                <AsyncEvent async={this.props.deletePhysicalRecordResult} onFulfill={this.finishDeletePhysicalRecord} alertError />
            </div>
        )
    }
}

export default connectRouter(connectModalHelper(connectRedux(PhysicalRecord)));
