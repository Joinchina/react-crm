import React, { Component } from 'react'
import { Spin } from 'antd'
import MedicationOrder from './MedicationOrder'
import OrderFlow from './OrderFillFlow'
import Message from './Message'
import AlertError from '../../common/AlertError'
import { connectRouter } from '../../../mixins/router';
import { connect as connectOrderFillDetail } from '../../../states/orderCenter/orderFillDetail'
import NavigatorBreadcrumb from '../../common/NavigatorBreadcrumb';

const orderDefaultNavigateStack = [
    { label: '包裹单管理', url: '/orderfills' },
    { label: '包裹单详情' }
];

class OrderFillDetails extends Component {
    constructor(props) {
        super(props)
        this.orderfillId = this.props.match.params.orderfillId || ''
        this.path = this.props.router.path
        this.props.searchOrderDetail(this.orderfillId)
    }

    componentWillReceiveProps(nextProps) {
      if(this.props.match.params.orderfillId !== nextProps.match.params.orderfillId){
        this.props.searchOrderDetail(nextProps.match.params.orderfillId)
      }
    }

    render () {
        const data = this.props.orderFillDetail.status === 'fulfilled' ? this.props.orderFillDetail.payload : {}
        let defaultNavigateStack;
        if (this.props.router.path.indexOf('/orderFillDetails') === 0) {
            defaultNavigateStack = orderDefaultNavigateStack;
        }
        return (
          <Spin
            spinning={this.props.orderFillDetail.status === 'pending'}
          >
            <div>
                <NavigatorBreadcrumb defaultNavigateStack={defaultNavigateStack} className='breadcrumb-box'/>
                <div className='block'>
                    <MedicationOrder data={data}/>
                    <OrderFlow data={data}/>
                    <Message data={data}/>
                </div>
                <AlertError status={this.props.orderFillDetail.status} payload={this.props.orderFillDetail.result}/>
            </div>
          </Spin>
        )
    }
}


export default connectRouter(connectOrderFillDetail(OrderFillDetails))
