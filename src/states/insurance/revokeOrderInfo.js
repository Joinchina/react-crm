import { combineReducers, bindActionCreators } from 'redux';
import {
    getRevokeOrderDetails,
} from '../../api';
import { connect as reduxConnect } from 'react-redux';
import { createReducer, apiActionCreator } from '../../components/common/table-page';
import { resetMiddleware } from '../../helpers/reducers';

const GET_REVOKE_ORDER_DETAILS = 'insurance.revokeOrderInfo.getRevokeOrderDetails';
const RESET = 'insurance.revokeOrderInfo.reset';

export default combineReducers({
    revokeOrderDetail(state = {}, action) {
        if (action.type === GET_REVOKE_ORDER_DETAILS) {
            state = {
                status: action.status,
                payload: action.payload,
                params: action.params
            };
        } else if (action.type === RESET) {
            state = {};
        }
        return state;
    },
});

export const getRevokeOrderDetail = apiActionCreator(GET_REVOKE_ORDER_DETAILS, getRevokeOrderDetails)

export function resetPage() {
    return {
        type: RESET,
    };
}

export const connect = reduxConnect(
    state => ({
        revokeOrderDetail: state.insurance.revokeOrderInfo.revokeOrderDetail,
    }),
    dispatch => bindActionCreators({
        getRevokeOrderDetail,
        resetPage,
    }, dispatch)
);
