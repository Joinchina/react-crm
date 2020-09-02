import React, { Component } from 'react';
import {
    Modal, Row, Col, Input, Button, Upload,
} from 'antd';
import message from '@wanhu/antd-legacy/lib/message';
import { connect as connectState } from '../../states/taskCenter/frozenList';
import { connectModalHelper } from '../../mixins/modal';
import { Form } from '../common/form';
import { TablePage } from '../common/table-page';
import AsyncEvent from '../common/AsyncEvent';
import { url } from '../../api';
import PropTypes from '../../helpers/prop-types';

const TableColumn = TablePage.Column;
const tableDef = TablePage.def({
    queryText: {},
    status: {},
});

class FrozenList extends Component {
    static propTypes = {
        currentModal: PropTypes.string,
        openModal: PropTypes.func,
        updateImportStatus: PropTypes.func.isRequired,
        searchFrozen: PropTypes.func.isRequired,
        resetFrozen: PropTypes.func.isRequired,
        deleteFrozen: PropTypes.func.isRequired,
        frozenList: PropTypes.asyncResult(PropTypes.shape({
            list: PropTypes.array,
        })).isRequired,
        importResult: PropTypes.asyncResult(PropTypes.object).isRequired,
        deleteStatus: PropTypes.func,
    };

    static defaultProps = {
        currentModal: undefined,
        openModal: undefined,
        deleteStatus: undefined,
    };

    componentWillReceiveProps(nextProps) {
        const { currentModal } = this.props;
        if (currentModal === 'newFrozen' && !nextProps.currentModal) {
            this.table.reload();
        }
    }

    onImportChange = (changes) => {
        const { updateImportStatus } = this.props;
        updateImportStatus(changes.file.status, changes.file.response, changes.file.error);
    }

    onDownloadUrl = () => {
        window.location.href = 'http://wanhuhealth.oss-cn-beijing.aliyuncs.com/crm-web/static/files/%E5%86%BB%E7%BB%93%E9%85%8D%E7%BD%AE%E6%A8%A1%E6%9D%BF.xlsx';
    }

    openNewFrozenModal = () => {
        const { openModal } = this.props;
        openModal('newFrozen');
    }

    loadData = ({ values, pageIndex, pageSize }) => {
        const where = {};
        where.name = values.queryText;
        where.status = values.status;
        const { searchFrozen } = this.props;
        searchFrozen(where, pageIndex, pageSize);
    }

    resetData = () => {
        const { resetFrozen } = this.props;
        resetFrozen();
    }

    finishDeleteStatus = () => {
        message.success('删除冻结机构成功', 3);
        this.table.reload({ scrollToTop: false });
    }

    finishImport = () => {
        message.success('导入冻结机构成功', 3);
        this.table.reload();
    }

    deleteFrozen(data) {
        const { deleteFrozen } = this.props;
        Modal.confirm({
            title: `确认要删除冻结机构“${data.name}”吗？`,
            onOk: () => {
                deleteFrozen(data.id);
            },
            onCancel() {},
        });
    }


    editFrozen(id) {
        const { openModal } = this.props;
        openModal('newFrozen', id);
    }

    /* eslint-disable class-methods-use-this */
    importFaild(nextPayload) {
        let errorTitle;
        let errorMessage = '';
        if (/^.+，.+：.+；/.test(nextPayload.message)) {
            const errorArray = nextPayload.message.split('，');
            [errorTitle] = [errorArray[0]];
            errorMessage = errorArray[1].split('；');
            if (Array.isArray(errorMessage)) {
                errorMessage = errorMessage.map((row, index) => (
                    /* eslint-disable-next-line */
                    <p key={index}>
                        {row}
                    </p>
                ));
                errorMessage = (
                    <div>
                        {errorMessage}
                    </div>
                );
            }
        } else {
            errorTitle = nextPayload.message;
        }
        Modal.error({
            title: errorTitle,
            content: errorMessage,
        });
    }

    render() {
        const {
            frozenList, importResult, deleteStatus,
        } = this.props;
        return (
            <div>
                <TablePage
                    def={tableDef}
                    data={frozenList}
                    onLoadData={this.loadData}
                    onResetData={this.resetData}
                    autoLoad={false}
                    tableRef={(table) => { this.table = table; }}
                    rowKey="id"
                    renderFormFields={(values, loadData) => (
                        <Row gutter={10} className="block filter-box">
                            <Col span={10}>
                                <Form.Item field="queryText" height="auto">
                                    <Input placeholder="请输入冻结机构名称" onPressEnter={loadData} />
                                </Form.Item>
                            </Col>
                            <Col span={3}>
                                <Button onClick={loadData} style={{ width: '100%', minWidth: 0 }} type="primary">
                                    查询
                                </Button>
                            </Col>
                            <Col span={3}>
                                <Button onClick={this.openNewFrozenModal} style={{ width: '100%', minWidth: 0 }} type="primary">
                                    新建
                                </Button>
                            </Col>
                            <Col span={3}>
                                <Upload
                                    showUploadList={false}
                                    className="fullwidth"
                                    name="file"
                                    action={url('/enum/hospital/freeze/importData')}
                                    onChange={this.onImportChange}
                                    withCredentials
                                >
                                    <Button className="fullwidth" type="primary">
                                        导入
                                    </Button>
                                </Upload>
                            </Col>
                        </Row>
                    )}
                    renderFooter={() => (
                        <Button onClick={this.onDownloadUrl} type="primary">
                        模板下载
                        </Button>
                    )}
                >
                    <TableColumn
                        title="冻结机构"
                        className="singleline"
                        dataIndex="name"
                        key="name"
                    />
                    <TableColumn
                        title="冻结类型"
                        className="singleline"
                        dataIndex="content"
                        key="content"
                    />
                    <TableColumn
                        title="操作"
                        className="singleline"
                        dataIndex="id"
                        key="id"
                        renderTip={() => null}
                        render={(id, record) => (
                            <span>
                                {/* eslint-disable-next-line */}
                                <a
                                    className="clickable"
                                    title="编辑"
                                    onClick={() => this.editFrozen(id)}
                                >
                                    编辑
                                </a>
                                {/* eslint-disable-next-line */}
                                <a className="clickable" title="删除" onClick={() => this.deleteFrozen(record)}>
                                    删除
                                </a>
                            </span>
                        )}
                    />
                </TablePage>
                <AsyncEvent async={deleteStatus} onFulfill={this.finishDeleteStatus} alertError />
                <AsyncEvent
                    async={importResult}
                    onFulfill={this.finishImport}
                    onReject={this.importFaild}
                />
            </div>
        );
    }
}


export default connectModalHelper(connectState(FrozenList));
