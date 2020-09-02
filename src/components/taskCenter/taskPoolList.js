import React, { Component } from 'react'
import { Row, Col, Input, Select, Button, Modal } from 'antd';
import message from '@wanhu/antd-legacy/lib/message';
import { Form } from '../common/form';
import { TablePage } from '../common/table-page';
import { connect as connectState } from '../../states/taskCenter/taskPoolList';
import AsyncEvent from '../common/AsyncEvent';
import { connectRouter } from '../../mixins/router';
import history from '../../history'
const TableColumn = TablePage.Column;
import HasPermission, { testPermission } from '../common/HasPermission';

const QueryKeyChoices = [{
    value: 'name',
    label: '名称',
},{
    value: 'remarks',
    label: '说明',
},{
    value: 'createByName',
    label: '创建人'
}];

const StatusChoices = [{
    value: '1',
    label: '正常',
},{
    value: '2',
    label: '禁用',
}];

const mapChoiceToOption = (choice, i) => <Select.Option key={i} value={choice.value}>{choice.label}</Select.Option>;

const tableDef = TablePage.def({
    queryKey: {
        parse: val => val || 'name',
        stringify: val => val === 'name' ? undefined : val
    },
    queryText: {},
    status: {},
});

const styles = {
    taskPoolRemarks: {
        whiteSpace:'nowrap',
        maxWidth: 300,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
}

class TaskPoolList extends Component {

    componentWillReceiveProps(props) {
        if (this.props.router.modal === 'newTaskPool' && !props.router.modal) {
            this.table.reload();
        }
    }

    componentWillUnmount(){
        this.props.resetTaskPools();
    }

    loadData = ({values, pageIndex, pageSize}) => {
        const where = {};
        if (values.queryKey && values.queryText) {
            where[values.queryKey] = values.queryText;
        }
        where.status = values.status;
        this.props.searchTaskPool(where, pageIndex, pageSize);
    }

    resetData = () => {
        this.props.resetTaskPools();
    }

    finishUpdateStatus = (result, op) => {
        let msg;
        if (op === 'disable') {
            msg = '禁用任务池成功';
        } else if (op === 'enable') {
            msg = '启用任务池成功';
        } else {
            msg = '操作成功';
        }
        message.success(msg, 3);
        this.table.reload({ scrollToTop: false });
    }

    finishDeleteStatus = () => {
        message.success('删除任务池成功', 3);
        this.table.reload({ scrollToTop: false });
    }

    openNewTaskPoolModal = () => {
        this.props.router.openModal('newTaskPool');
    }

    disablePool(pool) {
        this.props.updateTaskPool(pool.id, 'disable', {
            status: 2
        });
    }

    enablePool(pool) {
        this.props.updateTaskPool(pool.id, 'enable', {
            status: 1
        });
    }

    deletePool(pool) {
        Modal.confirm({
            title: `确认要删除任务池“${pool.name}”吗？`,
            onOk: () => {
                this.props.deleteTaskPool(pool.id);
            },
            onCancel(){}
        });
    }

    showDetail = (pool) => {
        history.push(`/taskPoolDetail/${pool.id}?r=${encodeURIComponent(this.props.router.fullPath)}`);
    }

    render() {

        return (
            <div>
                <TablePage
                    def={tableDef}
                    data={this.props.taskPools}
                    autoLoad={false}
                    onLoadData={this.loadData}
                    onResetData={this.resetData}
                    tableRef={table => this.table = table}
                    rowKey='id'
                    renderFormFields={(values, loadData) => {
                        const queryKey = values.queryKey;
                        let searchProps;
                        switch (queryKey) {
                            case 'name':
                                searchProps = { placeholder: '请输入名称' };
                                break;
                            case 'remarks':
                                searchProps = { placeholder: '请输入说明' };
                                break;
                            case 'createByName':
                                searchProps = { placeholder: '请输入创建人' };
                                break;
                            default:
                                searchProps = { disabled: true };
                                break;
                        }
                        return <Row gutter={10} className="block filter-box">
                            <Col span={4}>
                                <Form.Item field="queryKey" height="auto">
                                    <Select>{ QueryKeyChoices.map(mapChoiceToOption) }</Select>
                                </Form.Item>
                            </Col>
                            <Col span={10}>
                                <Form.Item field="queryText" height="auto">
                                    <Input {...searchProps} onPressEnter={loadData}/>
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item field="status" height="auto">
                                    <Select placeholder="状态" allowClear>{ StatusChoices.map(mapChoiceToOption) }</Select>
                                </Form.Item>
                            </Col>
                            <Col span={3}>
                                <Button onClick={loadData} style={{width:'100%','minWidth':0}} type="primary">查询</Button>
                            </Col>
                            <Col span={3}>
                                <HasPermission match="crm.task_pool.edit"><Button onClick={this.openNewTaskPoolModal} style={{width:'100%','minWidth':0}} type="primary">新建</Button></HasPermission>
                            </Col>
                        </Row>
                    }}
                    >
                        <TableColumn title="名称" className="singleline max-w-200"
                            dataIndex="name"
                            key="name"
                            onCellClick={this.showDetail}
                            render={text=><span className="clickable">{text}</span>}
                        />
                        <TableColumn title="任务数" className="singleline"
                            dataIndex="count"
                            key="count"
                        />
                        <TableColumn title="说明"
                            dataIndex="remarks"
                            key="remarks"
                            render={text => <div style={styles.taskPoolRemarks}>{text}</div>}
                        />
                        <TableColumn title="状态" className="singleline"
                            dataIndex="status"
                            key="status"
                            render={(status, pool)  => {
                                if (status === null || status === undefined) return '';
                                const found = StatusChoices.find(t => t.value === `${status}`)
                                if (found) {
                                    return found.label;
                                }
                                return '未知状态';
                            }}
                            />
                        <TableColumn title="创建人" className="singleline"
                            dataIndex="createByName"
                            key="createByName"
                            />
                        <TableColumn title="创建时间" className="singleline"
                            dataIndex="createDate"
                            key="createDate"
                            />
                        {
                            testPermission('crm.task_pool.admin') ?
                            <TableColumn title="操作" className="singleline"
                                dataIndex="status"
                                key="op"
                                renderTip={()=>null}
                                render={(status, pool) => {
                                    let toggleBtn;
                                    if (status == 1) {
                                        toggleBtn = <span className="clickable" onClick={()=>this.disablePool(pool)}>禁用</span>
                                    } else if (status == 2) {
                                        toggleBtn = <span className="clickable" onClick={()=>this.enablePool(pool)}>启用</span>
                                    }
                                    return <span>
                                        { toggleBtn }
                                        <span className="clickable" onClick={()=>this.deletePool(pool)}>删除</span>
                                    </span>
                                }}
                                />
                            : null
                        }
                </TablePage>
                <AsyncEvent async={this.props.updateStatus} onFulfill={this.finishUpdateStatus} alertError/>
                <AsyncEvent async={this.props.deleteStatus} onFulfill={this.finishDeleteStatus} alertError/>
            </div>
        )
    }
}

export default connectRouter(connectState(TaskPoolList));
