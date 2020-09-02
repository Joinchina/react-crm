import { combineReducers, bindActionCreators } from 'redux';
import {
    apiActionCreator,
    getInsuranceOrderList,
    getInsuranceRevokeOrder,
    subRevokeOrder,
} from '../../api';
import { connect as reduxConnect } from 'react-redux';
import { createReducer, apiActionCreator as tablePageApiActionCreator } from '../../components/common/table-page';
import { resetMiddleware } from '../../helpers/reducers';

const SEARCH_INSURANCE_ORDER_LIST = 'insurance.insurancesOrderList.searchInsuranceOrderList';
const RESET_INSURANCE_ORDER_LIST = 'insurance.insurancesOrderList.resetInsuranceOrderList';
const RESET = 'insurance.insurancesOrderList.reset';
const GET_INSURANCE_REVOKE_ORDER = 'insurance.insurancesOrderList.getInsuranceRevokeOrder';
const SUB_REVOKE_ORDER = 'insurance.insurancesOrderList.subRevokeOrder'

export default combineReducers({
    insuranceOrderList: resetMiddleware(RESET_INSURANCE_ORDER_LIST)(createReducer(SEARCH_INSURANCE_ORDER_LIST)),
    getInsuranceRevokeOrderInfo(state = {}, action) {
        if (action.type === GET_INSURANCE_REVOKE_ORDER) {
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
    cancelStatus(state = {}, action) {
        return state;
    },
});

export const searchInsurancesOrderList = tablePageApiActionCreator(SEARCH_INSURANCE_ORDER_LIST, getInsuranceOrderList);

export const getInsuranceRevokeOrderList = apiActionCreator(GET_INSURANCE_REVOKE_ORDER, getInsuranceRevokeOrder);

export const subRevokeOrderRes = apiActionCreator(GET_INSURANCE_REVOKE_ORDER, subRevokeOrder);

export const resetInsurancesOrderList = resetMiddleware.actionCreator(RESET_INSURANCE_ORDER_LIST);

export const resetForm = resetMiddleware.actionCreator(RESET);

export const connect = reduxConnect(
    state => ({
        insurancesOrderList: state.insurance.insuranceOrderList.insuranceOrderList,
        getInsuranceRevokeOrderInfo: state.insurance.insuranceOrderList.getInsuranceRevokeOrderInfo,
    }),
    dispatch => bindActionCreators({
        searchInsurancesOrderList,
        resetInsurancesOrderList,
        getInsuranceRevokeOrderList,
        subRevokeOrderRes,
        resetForm,
    }, dispatch)
);
