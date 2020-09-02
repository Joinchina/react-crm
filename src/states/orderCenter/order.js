import { combineReducers, bindActionCreators } from 'redux';
import { connect as reduxConnect } from 'react-redux'
import { createReducer, apiActionCreator as tablePageApiActionCreator } from '../../components/common/table-page';
import { resetMiddleware } from '../../helpers/reducers';

import { apiActionCreator,
  postPostponeOrder as postPostponeOrderApi,
  getOrderCenter as getOrderApi,
  applyLianouOrderApi
} from '../../api'

const SEARCH_ORDER = 'orderCenter.order.searchOrder'
const UPDATE_ORDER = 'orderCenter.order.updateOrder'
const APPLY_ORDER = 'orderCenter.order.applyOrder'
const RESET = 'orderCenter.order.reset'

export default resetMiddleware(RESET)(combineReducers({
    orderList: createReducer(SEARCH_ORDER),
    poneOrder (state = {}, action) {
        if (action.type === UPDATE_ORDER) {
            state = {
                status: action.status,
                payload: action.payload,
            };
        }
        return state;
    },
    applyOrderStatus(state = {}, action) {
        if (action.type === APPLY_ORDER) {
            state = {
                status: action.status,
                payload: action.payload,
            };
        }
        return state;
    }
}))

export const searchOrder = tablePageApiActionCreator(
    SEARCH_ORDER, getOrderApi
);

export const applyAgainOrder = apiActionCreator(APPLY_ORDER, applyLianouOrderApi);

export const updateOrder = apiActionCreator(
    UPDATE_ORDER, postPostponeOrderApi
);
export const resetOrder = resetMiddleware.actionCreator(RESET);

export const connect = reduxConnect(
    state => ({
        auth: state.auth.payload,
        orderList: state.orderCenter.orderList.orderList,
        poneOrder: state.orderCenter.orderList.poneOrder,
        applyOrderStatus: state.orderCenter.orderList.applyOrderStatus,
    }),
    dispatch => bindActionCreators({
        searchOrder,
        updateOrder,
        resetOrder,
        applyAgainOrder,
    }, dispatch)
);
