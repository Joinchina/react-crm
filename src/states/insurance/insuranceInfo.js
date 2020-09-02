import { combineReducers, bindActionCreators } from 'redux';
import {
    getInsuranceOrderDetails,
} from '../../api';
import { connect as reduxConnect } from 'react-redux';
import { createReducer, apiActionCreator } from '../../components/common/table-page';
import { resetMiddleware } from '../../helpers/reducers';

const GET_INSURANCE_ORDER_DETAILS = 'insurance.insurancesInfo.getInsuranceOrderDetails';
const RESET = 'insurance.insurancesInfo.reset';

export default combineReducers({
    insuranceOrderDetail(state = {}, action) {
        if (action.type === GET_INSURANCE_ORDER_DETAILS) {
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

export const getInsuranceOrderDetail = apiActionCreator(GET_INSURANCE_ORDER_DETAILS, getInsuranceOrderDetails)

export function resetPage() {
    return {
        type: RESET,
    };
}

export const connect = reduxConnect(
    state => ({
        insuranceOrderDetail: state.insurance.insuranceInfo.insuranceOrderDetail,
    }),
    dispatch => bindActionCreators({
        getInsuranceOrderDetail,
        resetPage,
    }, dispatch)
);
