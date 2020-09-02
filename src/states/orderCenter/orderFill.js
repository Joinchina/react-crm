import { combineReducers, bindActionCreators } from 'redux';
import { connect as reduxConnect } from 'react-redux'
import { createReducer, apiActionCreator as tablePageApiActionCreator } from '../../components/common/table-page';
import { resetMiddleware } from '../../helpers/reducers';

import { getOrderFills as getOrderFillsApi } from '../../api'

const SEARCH_ORDER = 'orderCenter.orderfill.searchOrder'
const RESET = 'orderCenter.orderfill.reset'

export default resetMiddleware(RESET)(combineReducers({
    orderFillList: createReducer(SEARCH_ORDER),
}))

export const searchOrder = tablePageApiActionCreator(
    SEARCH_ORDER, getOrderFillsApi
);

export const resetOrder = resetMiddleware.actionCreator(RESET);

export const connect = reduxConnect(
    state => ({
        orderFillList: state.orderCenter.orderFillList.orderFillList,
    }),
    dispatch => bindActionCreators({
        searchOrder,
        resetOrder,
    }, dispatch)
);
