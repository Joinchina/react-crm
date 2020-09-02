import React, { Component } from 'react'
import { Button, Row, Col, Modal, Badge, Table } from 'antd';
import message from '@wanhu/antd-legacy/lib/message';
import { connect } from '../../states/message/messageCenter';
import { connectModalHelper } from '../../mixins/modal';
import { TablePage } from '../common/ModalPage';
import AsyncEvent from '../common/AsyncEvent';
import WHLabel from '../common/WH-Label';
import querystring from 'querystring';
import _ from 'underscore';
import BaseComponent from '../BaseComponent';
import Title from '../common/Title';
import { centToYuan, isValidMoneyCent, refundRountCentPercentToCent } from '../../helpers/money';

const { Column } = Table
const TableColumn = TablePage.Column;
const tableDef = TablePage.def({
    queryHospital: {}
})



const styles = {
    span: {
        fontWeight: 'normal',
        color: 'inherit',
        marginRight: 20,
    },
    breadcrumb: {
        width: 150,
        float: 'left',
    },
    linkImgArea: {
        width: 50,
        float: 'left',
    },
    linkImg: {
        width: 15,
        height: 15,
        marginRight: 10,
        verticalAlign: 'middle',
        cursor: 'pointer',
    },
};

class MessageCenterModal extends BaseComponent {

    constructor(props) {
        super(props);
        this.state = {
            tabsMap: [
                // { label: '未读消息', key: 'unreadMessage', where: { status: 0, types: "2,4,5" } },
                { label: '配送拒收', key: 'distributionMessage', where: { types: "5" } },
                { label: '药师驳回', key: 'pharmacistDismissedMessage', where: { types: "2" } },
                { label: '订单支付', key: 'payMessage', where: { types: "4" } },
                { label: '全部', key: 'allMessage', where: { types: "2,4,5" } },
            ],
            tab: 'distributionMessage',
        };
        this.tab = 'distributionMessage';
    }

    componentWillReceiveProps(props) {
        if (this.props.currentModal === 'MessageCenter' && !props.currentModal) {
            this.table.reload();
            this.props.searchMessageCount(0);
        }
    }

    componentWillUnmount() {
        this.props.resetMessage();
    }

    loadData = ({ values, pageIndex, pageSize }) => {
        const { tabsMap } = this.state;
        const selectedTab = tabsMap.find(item => item.key === this.tab);
        const { where } = selectedTab;
        this.props.searchMessage(where, pageIndex, pageSize);
        this.props.searchMessageCount(0);
    }

    resetData = () => {
        this.props.resetMessage();
    }

    hideModal = () => {
        this.props.closeModal();
    }

    openTab = (tab) => {
        const path = this.props.history.location.search;
        const qs = querystring.parse(path.substr(1));
        qs.page = 1;
        const a = querystring.stringify(qs);
        this.props.history.push(`${this.props.history.location.pathname}?${a}`);
        this.tab = tab.key;
        this.setState({ tab: tab.key }, this.table.reload());

    }

    finishDeleteStatus = () => {
        message.success('删除消息成功', 3);
        this.table.reload();
        this.props.searchMessageCount(0);
    }
    finishReadStatus = () => {
        this.table.reload();
        this.props.searchMessageCount(0);
    }

    readMessage = (e, record) => {
        e.stopPropagation();
        this.props.readMessageById([record.id]);
    }
    expandMessage = (expanded, record) => {
        if (expanded && record.status === 0) {
            this.props.readMessageById([record.id]);
        }
    }
    readMessageAll = () => {
        const list = this.props.messageCenter.list;
        const ids = list.map((item) => item.id);
        this.props.readMessageById(ids);
    }
    deleteMessageAll = () => {
        Modal.confirm({
            title: `确认要删除全部消息？`,
            onOk: () => {
                const list = this.props.messageCenter.list;
                const ids = list.map((item) => item.id);
                this.props.deleteMessageById(ids);
            },
            onCancel() { }
        });
    }

    deleteMessage = (e, record) => {
        e.stopPropagation();
        Modal.confirm({
            title: `确认要删除该消息？`,
            onOk: () => {
                this.props.deleteMessageById([record.id]);
            },
            onCancel() { }
        });
    }
    formatMoney(num, digits) {
        num = Number(num);
        if (isValidMoneyCent(num)) {
            return `¥${centToYuan(num, digits || 2)}`;
        } else {
            return '-';
        }
    }

    renderExpandedRowRender = (record) => {
        console.warn('record',record);
        let message = record.message || {};
        let messageObj;
        let payObj;
        if (record.messageType === 2 || record.messageType === 4 || record.messageType === 5) {

            if (record.messageType === 2) {
                message = message.detail;
                messageObj = (
                    <div style={{ fontWeight: 'bold' }}>
                        <Row gutter={40} >
                            <Col className="label-col" span={12}>
                                <WHLabel title="所属药房" text={message.warehouseName} />
                            </Col>
                            <Col className="label-col" span={12}>
                                <WHLabel title="审核药师" text={message.auditName} />
                            </Col>
                        </Row>
                        <Row gutter={40} >
                            <Col className="label-col" span={24}>
                                <WHLabel title="驳回理由" text={message.rejectReason} />
                            </Col>
                        </Row>
                        <Row gutter={40} >
                            <Col className="label-col" span={24}>
                                <WHLabel title="审核时间" text={message.auditDate} />
                            </Col>
                        </Row>
                    </div>
                );
            }
            if (record.messageType === 4) {
                const paymentTypes = message.paymentTypes;
                let paymentMessage = '';
                if (paymentTypes && paymentTypes.length > 0) {
                    paymentTypes.forEach(element => {
                        const p = `¥${element.amount}(${element.payType})`;
                        paymentMessage = paymentMessage ? paymentMessage + ' / ' + p : p;
                    });
                }
                let contMoney = 0;
                let refundMoney = 0;
                message.drugs.forEach((drug) => {
                    contMoney += drug.priceCert * drug.number;
                    refundMoney += drug.priceCert * drug.number * drug.whScaleCert;
                });
                payObj = (
                    <Row gutter={40}>
                        <Col className="label-col" span={40} style={{ textAlign: 'right' }}>
                            订单总额：¥{centToYuan(contMoney, 2)}    报销：¥{centToYuan(refundRountCentPercentToCent(refundMoney), 1)}
                        </Col>
                    </Row>
                );
                messageObj = (
                    <div style={{ fontWeight: 'bold' }}>
                        <Row gutter={40} >
                            <Col className="label-col" span={12}>
                                <WHLabel title="支付状态" text={message.payStatus === 1 ? '已支付' : '未支付'} />
                            </Col>
                        </Row>
                        <Row gutter={40} >
                            <Col className="label-col" span={24}>
                                <WHLabel title="支付方式" text={paymentMessage} />
                            </Col>
                        </Row>
                        <Row gutter={40} >
                            <Col className="label-col" span={24}>
                                <WHLabel title="支付时间" text={message.payDateTime} />
                            </Col>
                        </Row>
                    </div>
                );
            }
            if (record.messageType === 5) {
                messageObj = (
                    <div style={{ fontWeight: 'bold' }}>
                        <Row gutter={40} >
                            <Col className="label-col" span={12}>
                                <WHLabel title="会员姓名" text={message.patientName} />
                            </Col>
                            <Col className="label-col" span={12}>
                                <WHLabel title="联系方式" text={message.patientPhone} />
                            </Col>
                        </Row>
                        <Row gutter={40} >
                            <Col className="label-col" span={24}>
                                <WHLabel title="配送地址" text={message.address} />
                            </Col>
                        </Row>
                        <Row gutter={40} >
                            <Col className="label-col" span={24}>
                                <WHLabel title="拒收时间" text={message.messageDate} />
                            </Col>
                        </Row>
                    </div>
                );
            }
            return <div>
                <Row gutter={40} >
                    <Col className="label-col" span={12}>
                        <WHLabel title="订单编号" text={message.orderNo} />
                    </Col>
                    <Col className="label-col" span={12}>
                        <WHLabel title="订单状态" text={super.orderStatus(message.status)} />
                    </Col>
                </Row>
                {record.messageType === 5 ? null :
                    <Row gutter={40} >
                    <Col className="label-col" span={12}>
                        <WHLabel title="患者姓名" text={message.patientName} />
                    </Col>
                    <Col className="label-col" span={12}>
                        <WHLabel title="所属社区" text={message.hospitalName} />
                    </Col>
                </Row>
                }
                {messageObj}
                <Title text='药品信息' left={5} />
                <Table rowKey='id' dataSource={message.drugs} pagination={false} size="small" className="modal-table-box">
                    <Column
                        title="通用名（商品名称）"
                        dataIndex="drugName"
                        key="drugName"
                    />
                    <Column
                        title="规格"
                        dataIndex="standard"
                        key="standard"
                    />
                    <Column
                        title="单价¥"
                        dataIndex="priceCert"
                        key="priceCert"
                        render={(text, record) => this.formatMoney(text).replace('¥', '')}
                    />
                    <Column
                        title="报销比例"
                        dataIndex="whScaleCert"
                        key="whScaleCert"
                        render={(text, record) => `${text}%`}
                    />
                    <Column
                        title="购买数量"
                        dataIndex="number"
                        key="number"
                    />
                </Table>
                {(record.messageType === 2 && message.status === 97) ||
                    (record.messageType === 5 && (message.status === 45 || message.status === 50))
                    ? (
                        <div style={{ textAlign: 'center', marginTop: '10px' }}>
                            {
                                window.STORE_LOGINNAME.split(',').indexOf(this.props.auth.loginName) < 0 && record.messageType === 2
                                    ? <Button type="primary" onClick={() => this.props.openModal('createOrder', `order_${message.patientId}_${message.orderId}`)}>修改</Button>
                                    : null
                            }
                            <Button type="primary" onClick={() => this.props.openModal('orderRefundModal', message.orderId)} style={{ marginLeft: '10px' }}>撤单</Button>
                        </div>
                    ) : null
                }
                {payObj}

            </div>
        }
        return null;

    }

    render() {
        console.log('this.props.messageCenter', this.props.messageCenter);
        return (
            <div className="messageCenter">
                <Modal
                    title={'消息中心'}
                    visible={true}
                    width={900}
                    maskClosable={false}
                    onCancel={this.hideModal}
                    style={{ backgroundColor: '#f8f8f8' }}
                    footer={null}
                >
                    <div>

                        <Title left={10}>
                            <div className="nav">
                                {this.state.tabsMap.map((tab, i) => (
                                    <span style={styles.span} key={tab.key || i}>
                                        {/* eslint-disable-next-line */}
                                        <a className={this.state.tab === tab.key ? 'current' : null} onClick={() => this.openTab(tab)}>
                                            {tab.label}
                                        </a>
                                    </span>
                                ))}
                            </div>
                        </Title>

                        <TablePage
                            def={tableDef}
                            data={this.props.messageCenter}
                            expandedRowRender={record => this.renderExpandedRowRender(record)}
                            expandRowByClick
                            onExpand={(expanded, record) => this.expandMessage(expanded, record)}
                            onLoadData={this.loadData}
                            onResetData={this.resetData}
                            tableRef={table => this.table = table}
                            autoLoad={true}
                            rowKey="id"
                            renderFormFields={(values, loadData) => null}
                            renderFooter={values => (
                                <Row>
                                    <Button
                                        type="primary"
                                        onClick={() => this.readMessageAll()}
                                        disabled={!(this.props.messageCenter.list && this.props.messageCenter.list.length > 0)}
                                    >
                                        全部设为已读
                                </Button>
                                    <Button
                                        type="primary"
                                        style={{ marginLeft: 20 }}
                                        onClick={() => this.deleteMessageAll()}
                                        disabled={!(this.props.messageCenter.list && this.props.messageCenter.list.length > 0)}
                                    >
                                        全部删除
                                </Button>
                                </Row>
                            )}
                        >
                            <TableColumn title="消息内容" className="max-w-400"
                                dataIndex="subject"
                                key="subject"
                                render={(value, record) => {
                                    return record.status === 0 ?
                                        <span style={{ fontWeight: 'bold' }}>
                                            <Badge status="success" />
                                            <a>{value}</a>
                                        </span>
                                        :
                                        <span>
                                            <a>{value}</a>
                                        </span>;


                                }}
                            />
                            <TableColumn title="消息时间" className="singleline"
                                dataIndex="messageDate"
                                key="messageDate"
                            />
                            <TableColumn title="操作" className="singleline"
                                dataIndex="noApplyMoney"
                                key="id"
                                render={(value, record) => (
                                    <span>
                                        {record.status === 0 ?
                                            <a className="clickable"
                                                onClick={(e) => this.readMessage(e, record)}
                                            >
                                                设为已读
                                        </a>
                                            : null}
                                        <a className="clickable" onClick={(e) => this.deleteMessage(e, record)}>
                                            删除
                                    </a>
                                        {

                                        }
                                    </span>
                                )
                                }
                            />
                        </TablePage>
                        <AsyncEvent async={this.props.deleteStatus} onFulfill={this.finishDeleteStatus} alertError />
                        <AsyncEvent async={this.props.readStatus} onFulfill={this.finishReadStatus} />
                    </div>
                </Modal>
            </div>
        )
    }
}

export default connectModalHelper(connect(MessageCenterModal));
