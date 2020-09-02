import { combineReducers, bindActionCreators } from 'redux';
import {
    apiActionCreator,
    getGroupInsuranceList,
    cancelGroupInsurance as cancelGroupInsuranceApi,
    confirmGroupInsurance as confirmGroupInsuranceApi,
    createGroupInsurance as createGroupInsuranceApi,
    updateGroupInsurance as updateGroupInsuranceApi,
    getGroupInsuranceInfo as getGroupInsuranceInfoApi,
} from '../../api';
import { connect as reduxConnect } from 'react-redux';
import { createReducer, apiActionCreator as tablePageApiActionCreator } from '../../components/common/table-page';
import { resetMiddleware } from '../../helpers/reducers';

const SEARCH_GROUP_INSURANCE = 'insurance.groupInsurances.searchGroupInsurance';
const RESET_GROUP_INSURANCE = 'insurance.groupInsurances.resetGroupInsurance';
const CANCEL_GROUP_INSURANCE = 'insurance.groupInsurances.CANCEL_GROUP_INSURANCE';
const CONFIRM_GROUP_INSURANCE = 'insurance.groupInsurances.CONFIRM_GROUP_INSURANCE';
const CREAT_GROUP_INSURANCE = 'insurance.groupInsurances.CREAT_GROUP_INSURANCE';
const UPDATE_GROUP_INSURANCE = 'insurance.groupInsurances.UPDATE_GROUP_INSURANCE';
const SEARCH_GROUP_INSURANCE_INFO = 'insurance.groupInsurances.searchGroupInsuranceInfo';
const RESET = 'insurance.groupInsurances.reset';

export default combineReducers({
    groupInsuranceList: resetMiddleware(RESET_GROUP_INSURANCE)(createReducer(SEARCH_GROUP_INSURANCE)),
    cancelStatus(state = {}, action) {
        if (action.type === CANCEL_GROUP_INSURANCE) {
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
    confirmStatus(state = {}, action) {
        if (action.type === CONFIRM_GROUP_INSURANCE) {
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
    updateStatus: (state = {}, action) => {
        if (action.type === UPDATE_GROUP_INSURANCE ) {
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
    createStatus: (state = {}, action) => {
        if (action.type === CREAT_GROUP_INSURANCE ) {
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
    insuranceInfo(state = {}, action) {
        if (action.type === SEARCH_GROUP_INSURANCE_INFO) {
            state = {
                status: action.status,
                payload: action.payload,
                params: action.params
            };
        }
        return state;
    },
});

export const searchGroupInsurances = tablePageApiActionCreator(SEARCH_GROUP_INSURANCE, getGroupInsuranceList);

export const resetGroupInsurances = resetMiddleware.actionCreator(RESET_GROUP_INSURANCE);

export const cancelGroupInsurance = apiActionCreator(CANCEL_GROUP_INSURANCE, cancelGroupInsuranceApi);

export const confirmGroupInsurance = apiActionCreator(CONFIRM_GROUP_INSURANCE, confirmGroupInsuranceApi);

export const createGroupInsurance = apiActionCreator(CREAT_GROUP_INSURANCE, createGroupInsuranceApi);

export const updateGroupInsurance = apiActionCreator(UPDATE_GROUP_INSURANCE, updateGroupInsuranceApi);

export const getGroupInsuranceById = apiActionCreator(SEARCH_GROUP_INSURANCE_INFO, getGroupInsuranceInfoApi);

export function resetPage() {
    return {
        type: RESET,
    };
}

export const resetForm = resetMiddleware.actionCreator(RESET);

export const connect = reduxConnect(
    state => ({
        groupInsurances: state.insurance.groupInsurances.groupInsuranceList,
        cancelStatus: state.insurance.groupInsurances.cancelStatus,
        confirmStatus: state.insurance.groupInsurances.confirmStatus,
        updateStatus: state.insurance.groupInsurances.updateStatus,
        createStatus: state.insurance.groupInsurances.createStatus,
        insuranceInfo: state.insurance.groupInsurances.insuranceInfo,
    }),
    dispatch => bindActionCreators({
        searchGroupInsurances,
        resetGroupInsurances,
        cancelGroupInsurance,
        confirmGroupInsurance,
        createGroupInsurance,
        updateGroupInsurance,
        resetPage,
        resetForm,
        getGroupInsuranceById,
    }, dispatch)
);
