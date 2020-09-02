import React, { Component } from 'react'
import { Modal, Row, Col, Input, Button } from 'antd'
import message from '@wanhu/antd-legacy/lib/message'
import { Link } from 'react-router-dom'
import { connect as connectState } from '../../states/toolcase/spareMoneyList';
import { connectModalHelper } from '../../mixins/modal';
import { connectRouter } from '../../mixins/router';
import { Form } from '../common/form';
import ScrollIntoView from '../common/ScrollIntoView';
import { TablePage } from '../common/table-page';
import AsyncEvent from '../common/AsyncEvent';
import { centToYuan } from '../../helpers/money'
import HasPermission, { testPermission } from '../common/HasPermission';

const TableColumn = TablePage.Column;
const tableDef = TablePage.def({
    queryHospital: {}
})

class SpareMoneyList extends Component {

    componentWillReceiveProps(props) {
        if (this.props.currentModal === 'newSpareMoney' && !props.currentModal) {
            this.table.reload();
        }
    }

    componentWillUnmount(){
        this.props.resetSpareMoney();
    }

    loadData = ({values, pageIndex, pageSize}) => {
        const where = {};
        where.doctorHospitalName = values.queryHospital;
        this.props.searchSpareMoney(where, pageIndex, pageSize);
    }

    openNewModal(id) {
        this.props.openModal('newSpareMoney', id);
    }

    resetData = () => {
        this.props.resetSpareMoney();
    }

    render() {
        return (
            <div>
                <TablePage
                    def={tableDef}
                    data={this.props.spareMoneyList}
                    onLoadData={this.loadData}
                    onResetData={this.resetData}
                    tableRef={table => this.table = table}
                    autoLoad={true}
                    rowKey="id"
                    renderFormFields={(values, loadData) => (
                        <Row gutter={10} className="block filter-box">
                            <Col span={8}>
                                <Form.Item field='queryHospital' height="auto">
                                    <Input placeholder="请输入机构名称" onPressEnter={loadData}/>
                                </Form.Item>
                            </Col>
                            <Col span={3}>
                                <Button onClick={loadData} style={{width:'100%','minWidth':0}} type="primary">查询</Button>
                            </Col>
                        </Row>
                    )}
                >
                    <TableColumn title="机构" className="singleline max-w-200"
                        dataIndex="doctorHospitalName"
                        key="doctorHospitalName"
                        render={(text, record) =>
                            <Link to={`spareMoneyDetail/${record.id}?r=${encodeURIComponent(this.props.router.fullPath)}`}>
                                <span className="clickable">{text}</span>
                            </Link>
                        }
                    />
                    <TableColumn title="备用金总额" className="singleline"
                        dataIndex="balance"
                        key="balance"
                        render={value => (
                            <span className={value < 0 ? 'red' : ''}>{centToYuan(value, 2)}</span>
                        )}
                    />
                    <TableColumn title="未审核申领单" className="singleline"
                        dataIndex="applyCount"
                        key="applyCount"
                        render={value =>
                            Number(value) > 0 ? <span>有</span> : <span>无</span>
                        }
                    />
                    <TableColumn title="未申领包裹总数" className="singleline"
                        dataIndex="noApplyOrderFill"
                        key="noApplyOrderFill"
                    />
                    <TableColumn title="未申领总金额" className="singleline"
                        dataIndex="noApplyMoney"
                        key="noApplyMoney"
                        render={value =>
                            <span>{centToYuan(value, 2)}</span>
                        }
                    />
                    { testPermission('billing.h_account.edit') ?
                    <TableColumn title="操作" className="singleline"
                        dataIndex="noApplyMoney"
                        key="id"
                        render={(value, record) =>
                            Number(value) > 0 ?
                            <span className="clickable" onClick={() => this.openNewModal(record.id)}>申领</span> :
                            null
                        }
                    /> : null
                    }
                </TablePage>
            </div>
        )
    }
}

export default connectRouter(connectModalHelper(connectState(SpareMoneyList)))
