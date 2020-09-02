import React, { Component } from 'react'
import querystring from 'querystring';
import { connect } from 'react-redux'
import { Spin, Breadcrumb } from 'antd'
import { Link, Route } from 'react-router-dom';
import MedicationOrder from './orderDetails/MedicationOrder'
import OrderFlow from './orderDetails/OrderFlow'
import Message from './orderDetails/Message'
import AlertError from '../common/AlertError'
import api from '../../api/api';
import { connectRouter } from '../../mixins/router';
import { connect as connectOrderDetail } from '../../states/orderCenter/orderDetail'
import NavigatorBreadcrumb from '../common/NavigatorBreadcrumb';

const orderDefaultNavigateStack = [
    { label: '用药订单管理', url: '/orderCenter' },
    { label: '订单详情' }
];

const customerDefaultNavigateStack = [
    { label: '会员管理', url: '/customerCenter' },
    { label: '订单详情' }
];

const taskDefaultNavigateStack = [
    { label: '任务管理', url: '/taskList' },
    { label: '订单详情' }
];

class OrderDetails extends Component {
    constructor(props) {
        super(props)
        this.orderId = this.props.match.params.orderId || ''
        this.path = this.props.router.path
        this.props.searchOrderDetail(this.orderId);
        this.state={
            upDateRefundMoney: null,
            expressFlow: [],
        }
    }

    async componentWillReceiveProps(nextProps) {
        if (this.props.match.params.orderId !== nextProps.match.params.orderId) {
            this.props.searchOrderDetail(nextProps.match.params.orderId)
        }
        if (this.props.orderDetail.status !== nextProps.orderDetail.status &&
            nextProps.orderDetail.status === 'fulfilled' && nextProps.orderDetail.payload) {
            const data = nextProps.orderDetail.payload;
            if (data && data.pointsDeductionAmount) {
                const { drugs } = data;
                let ary = [];
                for (const v of drugs) {
                    let ast = {};
                    ast.drugId = v.id;
                    ast.amount = v.amount;
                    ary.push(ast)
                }
                try {
                    const param = {
                        pointsDeductionAmount: data.pointsDeductionAmount,
                        drugs: JSON.stringify(ary)
                    }
                    const result = await api.getRefundMoney(param, data.patient.id)
                    this.setState({
                        upDateRefundMoney: result,
                    })
                } catch (e) {
                    console.error(e.message)
                }
            }
            if(data && data.deliveryAddressType !== 2){
                const expressFlow = await api.getExpressFlow(data.id);
                this.setState({expressFlow})
            }
        }
    }

    render() {
        const data = this.props.orderDetail.status === 'fulfilled' ? this.props.orderDetail.payload : {}
        let defaultNavigateStack;
        if (this.props.router.path.indexOf('/orderDetails') === 0) {
            defaultNavigateStack = orderDefaultNavigateStack;
        } else if (this.props.router.path.indexOf('/customerOrderDetails') === 0) {
            defaultNavigateStack = customerDefaultNavigateStack;
        } else if (this.props.router.path.indexOf('/taskOrderDetails') === 0) {
            defaultNavigateStack = taskDefaultNavigateStack;
        }
        return (
            <Spin
                spinning={this.props.orderDetail.status === 'pending'}
            >
                <div>
                    <NavigatorBreadcrumb defaultNavigateStack={defaultNavigateStack} className='breadcrumb-box' />
                    <div className='block'>
                        <MedicationOrder data={data} upDateRefundMoney={this.state.upDateRefundMoney} />
                        <OrderFlow data={data} expressFlow={this.state.expressFlow}/>
                        <Message data={data} />
                    </div>
                    <AlertError status={this.props.orderDetail.status} payload={this.props.orderDetail.result} />
                </div>
            </Spin>
        )
    }
}


export default connectRouter(connectOrderDetail(OrderDetails))
