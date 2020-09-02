import { combineReducers, bindActionCreators } from 'redux';
import {
    getInsuranceOrderInfo,
} from '../../api';
import { connect as reduxConnect } from 'react-redux';
import { createReducer, apiActionCreator } from '../../components/common/table-page';
import { resetMiddleware } from '../../helpers/reducers';

const GET_INSURANCE_ORDER_INFO = 'insurance.insuranceOrderInfo.getInsuranceOrderInfo';
const RESET = 'insurance.insuranceOrderInfo.reset';

export default combineReducers({
    insuranceOrderInfo(state = {}, action) {
        if (action.type === GET_INSURANCE_ORDER_INFO) {
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

export const getInsuranceOrderInfos = apiActionCreator(GET_INSURANCE_ORDER_INFO, getInsuranceOrderInfo)

export function resetPage() {
    return {
        type: RESET,
    };
}

export const connect = reduxConnect(
    state => ({
        insuranceOrderInfo: state.insurance.insuranceOrderInfo.insuranceOrderInfo,
    }),
    dispatch => bindActionCreators({
        getInsuranceOrderInfos,
        resetPage,
    }, dispatch)
);
