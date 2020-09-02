import React, { Component } from 'react'
import { Row, Col, Input, Button, Modal } from 'antd'
import message from '@wanhu/antd-legacy/lib/message';
import { TablePage } from '../common/table-page';
import SelectSingleOfficeByTree from '../common/SelectSingleOfficeByTree'
import AlertError from '../common/AlertError';
import { Form } from '../common/form';
import { connectModalHelper } from '../../mixins/modal';
import { connectRouter } from '../../mixins/router';
import { connect as connectState } from '../../states/configure/groupList';
import HasPermission, { testPermission } from '../common/HasPermission';

const STATUS = {1: '正常', 2: '禁用'}

const TableColumn = TablePage.Column;
const tableDef = TablePage.def({
    queryName: {},
    queryHospital: {
        parse: val => val ? { id: val } : undefined,
        stringify: val => val ? val.id : undefined
    },
})

class UsersConfigure extends Component {

    componentWillReceiveProps(props) {
        if (this.props.currentModal === 'userGroup' && !props.currentModal) {
            this.table.reload();
        }
        if (props.updateStatus.status === 'fulfilled' && this.props.updateStatus.status !== 'fulfilled') {
            let msg;
            if (props.updateStatus.op === 'disable') {
                msg = '禁用用户组成功';
            } else if (props.updateStatus.op === 'enable') {
                msg = '启用用户组成功';
            } else {
                msg = '操作成功';
            }
            message.success(msg, 3);
            this.table.reload();
        }
        if (props.deleteStatus.status === 'fulfilled' && this.props.deleteStatus.status !== 'fulfilled') {
            message.success('删除用户组成功', 3);
            this.table.reload();
        }
    }

    loadData = ({values, pageIndex, pageSize}) => {
        const where = {};
        where.name = values.queryName;
        where.ownerCompany = values.queryHospital && values.queryHospital.id;
        this.props.searchGroup(where, pageIndex, pageSize);
    }


    editGroup(id) {
        this.props.openModal('userGroup', id);
    }

    openCreateModal = () => {
        this.props.openModal('userGroup');
    }

    deletePool(pool) {
        Modal.confirm({
            title: `确认要删除用户组吗？`,
            onOk: () => {
                this.props.deleteGroup(pool.id);
            },
            onCancel(){}
        });
    }

    toggleGroupStatus(data) {
        let status;
        let visable;
        if(data.status == 1) {
            status = 2;
            visable = 'disable';
        }
        if(data.status == 2) {
            status = 1;
            visable = 'enable';
        }
        this.props.updateGroup(data.id, visable, {
            name: data.name,
            status,
        });
    }

    resetData = () => {
        this.props.resetGroup();
    }

    componentWillUnmount(){
        this.props.resetGroup();
    }

    render() {
        return (
            <div>
                <AlertError async={this.props.updateStatus}/>
                <AlertError async={this.props.deleteStatus}/>
                <TablePage
                    def={tableDef}
                    data={this.props.groups}
                    onLoadData={this.loadData}
                    onResetData={this.resetData}
                    tableRef={table => this.table = table}
                    autoLoad={true}
                    rowKey="id"
                    renderFormFields={(values, loadData) => (
                        <Row gutter={10} className="block filter-box">
                            <Col span={5}>
                                <Form.Item field="queryName" height="auto">
                                    <Input placeholder="请输入用户组名称" onPressEnter={loadData} />
                                </Form.Item>
                            </Col>
                            <Col span={5}>
                                <Form.Item field="queryHospital" height="auto">
                                    <SelectSingleOfficeByTree placeholder="请选择归属公司"/>
                                </Form.Item>
                            </Col>
                            <Col span={3}>
                                <Button type="primary" onClick={loadData}>查询</Button>
                            </Col>
                            <Col span={3}>
                                <Button type="primary" onClick={this.openCreateModal}>新建</Button>
                            </Col>
                        </Row>
                    )}
                >
                        <TableColumn title="用户组名称" className="singleline max-w-200"
                            dataIndex="name"
                            key="name"/>
                        <TableColumn title="归属公司" className="singleline"
                            dataIndex="ownerCompanyName"
                            key="ownerCompanyName"/>
                        <TableColumn title="说明" className="singleline max-w-300"
                            dataIndex="remarks"
                            key="remarks"/>
                        <TableColumn title="状态" className="singleline"
                            dataIndex="status"
                            key="status"
                            render={text => STATUS[text]}/>
                        { testPermission('crm.admin') ?
                        <TableColumn title="操作" className="singleline"
                            key="action"
                            dataIndex="status"
                            renderTip={() => null}
                            render={(status, record) => {
                                return <span>
                                    <a className="clickable"
                                        onClick={() => this.toggleGroupStatus(record)}>
                                        {status == 1 ? '禁用' : '启用'}
                                    </a>
                                    <a className="clickable"
                                        onClick={() => this.editGroup(record.id)}>
                                        编辑
                                    </a>
                                    <a className="clickable"
                                        onClick={() => this.deletePool(record)}
                                        >
                                        删除
                                    </a>
                                </span>
                            }}/> : null
                        }

                </TablePage>
            </div>
        )
    }
}

export default connectRouter(connectModalHelper(connectState(UsersConfigure)));
