import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import {Modal} from 'antd'
import message from '@wanhu/antd-legacy/lib/message'
import { connect as connectOrderList } from '../../../states/orderCenter/order'
import AlertError from '../../common/AlertError';
import moment from 'moment'
import { TablePage } from '../../common/table-page';
import { Form } from '../../common/form';
import { connectModalHelper } from '../../../mixins/modal';
import { connectRouter } from '../../../mixins/router';
import HasPermission, { testPermission } from '../../common/HasPermission';

import Title from '../../common/Title'


const TableColumn = TablePage.Column;


const tableDef = TablePage.def({
    queryText: {},
});

const StatusChoices = [
    { value: '10', label: '初始订单' },
    { value: '20', label: '患者已确认' },
    { value: '30', label: '医生已确认' },
    { value: '35', label: '药师已确认' },
    { value: '40', label: '备药中' },
    { value: '45', label: '配送中' },
    { value: '50', label: '待取药' },
    { value: '60', label: '完成' },
    { value: '70', label: '完成'},
    { value: '97', label: '已驳回'},
    { value: '98', label: '撤单' },
    { value: '99', label: '完成' },
];

const StatusMap = {};
StatusChoices.forEach(item => StatusMap[item.value] = item.label);

class MedicationOrder extends Component {

    constructor (props) {
        super(props)
        this.customerId = props.customerId
        this.isShow = props.source === 'customerDetails'
    }

    loadData = ({values, pageIndex, pageSize}) => {
        const where = {};
        where.patientId = this.customerId
        where.createDate = {
            $lte: moment().format('YYYY-MM-DD'),
        }

        this.props.searchOrder(where, pageIndex, pageSize);
    }

    resetData = () => {
        this.props.resetOrder();
    }

    componentWillUnmount() {
        this.props.resetOrder();
    }

    componentWillReceiveProps(props) {
        if (props.poneOrder.status === 'fulfilled' && this.props.poneOrder.status !== 'fulfilled') {
            const delayTime = props.poneOrder.payload.delayTime
            message.success(`延期回收成功,回收时间：${delayTime}`, 3)
            this.table.reload();
        }
        if (this.props.currentModal === 'orderRefundModal' && !props.currentModal) {
            this.table.reload();
        }

        if (this.props.currentModal === 'createOrder' && !props.currentModal) {
            this.table.reload();
        }
        if (this.props.currentModal === 'orderResult' && !props.currentModal) {
            this.table.reload();
        }
    }

    refundOrder = (id, status, deliveryAddressType, expressStatus) => {
        if((deliveryAddressType === 3 || deliveryAddressType === 1) && status >= 45 && status <= 50 && (expressStatus!== 98 && expressStatus!== 97) ){
            Modal.info({
                title: '配送方式为快递的订单，仅可在配送拒收后进行撤单',
                okText: '知道了'
              });
        }else{
            this.props.openModal('orderRefundModal', id)
        }
    }

    render () {
        return (
            <div>
                <div className='table-box block medication-order'>
                    <AlertError async={this.props.poneOrder}/>
                    <TablePage
                        def={tableDef}
                        data={this.props.orderList}
                        onLoadData={this.loadData}
                        onResetData={this.resetData}
                        tableRef={table => this.table = table}
                        autoLoad={true}
                        disableAutoScroll
                        rowKey="id"
                        tip="提醒：订单状态处于待取药时，仅可在PBMapp端进行撤单。"
                        renderFormFields={(values, loadData) => null }>
                        <TableColumn title="用药订单编号" className="singleline"
                            dataIndex="orderNo"
                            key="orderNo"
                            render={(orderNo, order) =>
                                <Link to={`${this.props.orderDetailPath || '/customerOrderDetails'}/${order.id}?r=${encodeURIComponent(this.props.router.fullPath)}`}>
                                    <span className="clickable">{orderNo}</span>
                                </Link>
                            }/>
                        <TableColumn title="开具时间" className="singleline"
                            dataIndex="orderDate"
                            key="orderDate"
                            />
                        <TableColumn title="取药点" className="singleline"
                            dataIndex="hospitalName"
                            key="hospitalName"
                            />
                        <TableColumn title="订单状态" className="singleline"
                            dataIndex="status"
                            key="status"
                            render={status => StatusMap[status]}
                            />
                        <TableColumn title="开具人" className="singleline"
                            dataIndex="createBy"
                            key="createBy"
                            />
                        { testPermission('order.admin') ?
                        <TableColumn title="操作" className="singleline"
                            dataIndex="id"
                            key="id"
                            renderTip={() => null}
                            render={(id, order) =>{
                                return <span>
                                    {
                                        order.status === 20 && order.pictures && order.pictures.length > 0 && window.STORE_LOGINNAME.split(',').indexOf(this.props.auth.loginName) < 0 ?
                                            <span className="clickable" onClick={() => this.props.openModal('createOrder', `order_${order.patientId}_${id}_audit`)}>审核</span> : null
                                    }
                                    {
                                        order.status === 20 && !order.pictures && window.STORE_LOGINNAME.split(',').indexOf(this.props.auth.loginName) < 0 && [10].indexOf(order.prescriptionStatus) >= 0 ?
                                            <span className="clickable" onClick={() => this.props.openModal('createOrder', `order_${order.patientId}_${id}_update`)}>修改</span> : null
                                    }
                                    {
                                        order.status === 97 && window.STORE_LOGINNAME.split(',').indexOf(this.props.auth.loginName) < 0 && [10, 60].indexOf(order.prescriptionStatus) >= 0 ?
                                            <span className="clickable" onClick={() => this.props.openModal('createOrder', `order_${order.patientId}_${id}`)}>修改</span> : null
                                    }
                                    {
                                        order.status === 20 && [40].indexOf(order.prescriptionStatus) >= 0 ?
                                            <span className="clickable" onClick={() => this.applyOrder(order.id)}>重新申请处方</span> : null
                                    }
                                    {
                                        [50, 60, 70, 98, 99].indexOf(order.status) >= 0 ? null :
                                            <span className="clickable" onClick={() => this.refundOrder(id, order.status, order.deliveryAddressType, order.expressStatus)}>撤单</span>
                                    }

                                </span>
                            }}/> : null
                        }
                    </TablePage>

                </div>
            </div>
        )
    }
}


export default connectRouter(connectModalHelper(connectOrderList(MedicationOrder)));
