import { combineReducers } from 'redux';

import orderList from './order'
import orderDetail from './orderDetail'
import orderRefundModal from './orderRefundModal'
import orderFillList from './orderFill';
import orderFillDetail from './orderFillDetail';

export default combineReducers({
    orderList,
    orderDetail,
    orderRefundModal,
    orderFillList,
    orderFillDetail
})
