import React, { Component } from 'react'
import { Modal, Row, Col, Input, Button } from 'antd'
import message from '@wanhu/antd-legacy/lib/message';
import { connect as connectState } from '../../states/configure/account';
import { connectModalHelper } from '../../mixins/modal';
import { Form } from '../common/form';
import ScrollIntoView from '../common/ScrollIntoView';
import { TablePage } from '../common/table-page';
import AsyncEvent from '../common/AsyncEvent';
import HasPermission, { testPermission } from '../common/HasPermission';

const TableColumn = TablePage.Column;
const tableDef = TablePage.def({
    queryText: {}
})

class Account extends Component {

    componentWillReceiveProps(props) {
        if (this.props.currentModal === 'newAccount' && !props.currentModal) {
            this.table.reload();
        }
    }

    loadData = ({values, pageIndex, pageSize}) => {
        const where = {};
        where.loginName = values.queryText;
        this.props.searchAccount(where, pageIndex, pageSize);
    }

    finishDeleteStatus = () => {
        message.success('删除账号配置成功', 3);
        this.table.reload({ scrollToTop: false });
    }

    openNewAccountModal = () => {
        this.props.openModal('newAccount');
    }

    editAccount(id) {
        this.props.openModal('newAccount', id);
    }

    deleteAccount(data) {
        Modal.confirm({
            title: `确认要删除账号配置吗？`,
            onOk: () => {
                this.props.deleteAccount(data.id);
            },
            onCancel(){}
        });
    }

    resetData = () => {
        this.props.resetAccount();
    }

    componentWillUnmount(){
        this.props.resetAccount();
    }

    render() {
        return (
            <div>
                <TablePage
                    def={tableDef}
                    data={this.props.account}
                    onLoadData={this.loadData}
                    onResetData={this.resetData}
                    autoLoad={true}
                    tableRef={table => this.table = table}
                    rowKey="id"
                    renderFormFields={(values, loadData) => (
                        <Row gutter={10} className="block filter-box">
                            <Col span={10}>
                                <Form.Item field='queryText' height="auto">
                                    <Input placeholder="请输入万户账号" onPressEnter={loadData} />
                                </Form.Item>
                            </Col>
                            <Col span={3}>
                                <Button onClick={loadData} style={{width:'100%','minWidth':0}} type="primary">查询</Button>
                            </Col>
                            <Col span={3}>
                                <Button onClick={this.openNewAccountModal} style={{width:'100%','minWidth':0}} type="primary">新建</Button>
                            </Col>
                        </Row>
                    )}
                >
                    <TableColumn title="万户账号" className="singleline max-w-200"
                        dataIndex="loginName"
                        key="loginName"
                    />
                    <TableColumn title="姓名" className="singleline max-w-200"
                        dataIndex="name"
                        key="name"
                    />
                    <TableColumn title="第三方账号" className="singleline max-w-200"
                        dataIndex="thirdLoginName"
                        key="thirdLoginName"
                    />
                    <TableColumn title="第三方账号密码" className="singleline"
                        dataIndex="thirdPassword"
                        key="thirdPassword"
                    />
                    <TableColumn title="操作" className="singleline"
                        dataIndex="id"
                        key="id"
                        renderTip={()=>null}
                        render={(id, record) => (
                            <span>
                                <a className="clickable"
                                    onClick={() => this.editAccount(id)}
                                >编辑</a>
                                <a className="clickable" onClick={() => this.deleteAccount(record)}>删除</a>
                            </span>
                        )}
                    />
                </TablePage>
                <AsyncEvent async={this.props.deleteStatus} onFulfill={this.finishDeleteStatus} alertError/>
            </div>
        )
    }
}

export default connectModalHelper(connectState(Account))
