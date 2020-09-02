import { combineReducers, bindActionCreators } from 'redux';
import {
    apiActionCreator,
    getInsuranceOrderList as getPointOrderList,
} from '../../api';
import { connect as reduxConnect } from 'react-redux';
import { createReducer, apiActionCreator as tablePageApiActionCreator } from '../../components/common/table-page';
import { resetMiddleware } from '../../helpers/reducers';

const SEARCH_POINT_ORDER_LIST = 'pointOrder.pointOrderList.searchPointOrderList';
const RESET_POINT_ORDER_LIST = 'pointOrder.pointOrderList.resetPointOrderList';
const RESET = 'pointOrder.pointOrderList.reset';

export default combineReducers({
    pointOrderList: resetMiddleware(RESET_POINT_ORDER_LIST)(createReducer(SEARCH_POINT_ORDER_LIST)),
    cancelStatus(state = {}, action) {
        return state;
    },
});

export const searchPointOrderList = tablePageApiActionCreator(SEARCH_POINT_ORDER_LIST, getPointOrderList);

export const resetPointOrderList = resetMiddleware.actionCreator(RESET_POINT_ORDER_LIST);

export const resetForm = resetMiddleware.actionCreator(RESET);

export const connect = reduxConnect(
    state => ({
        pointOrderListStatus: state.pointOrder.pointOrderList.pointOrderList,
    }),
    dispatch => bindActionCreators({
        searchPointOrderList,
        resetPointOrderList,
        resetForm,
    }, dispatch)
);
