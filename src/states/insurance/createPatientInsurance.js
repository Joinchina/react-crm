import { combineReducers, bindActionCreators } from 'redux';
import {
    apiActionCreator,
    createPatientInsurance as createPatientInsuranceApi,
    getPatient, getInsuracePackage
} from '../../api';
import { connect as reduxConnect } from 'react-redux';
import { resetMiddleware } from '../../helpers/reducers';

const CREAT_PATIENT_INSURANCE = 'insurance.createPatientInsurance.CREAT_PATIENT_INSURANCE';
const SET_PATIENT_INSURANCE_RESULT = 'insurance.createPatientInsurance.SET_PATIENT_INSURANCE_RESULT';
const RESET = 'insurance.createPatientInsurance.reset';
const GET_PATIENT = 'insurance.createPatientInsurance.getPatient';
const GET_REL_PATIENT = 'insurance.createPatientInsurance.getRelPatient';
const GET_INSURANCE_PACKAGE = 'insurance.createPatientInsurance.getInsuracePackage'
const GET_INSURANCE_PACKAGE_INFO = 'insurance.createPatientInsurance.GET_INSURANCE_PACKAGE_INFO';
const SET_INSURANCE_SELECTED = 'insurance.createPatientInsurance.SET_INSURANCE_SELECTED';
const SET_SELECTED_INSURANCE_ID = 'insurance.createPatientInsurance.SET_SELECTED_INSURANCE_ID';
const SET_INSURANCE_SUBMIT_DATA = 'insurance.createPatientInsurance.SET_INSURANCE_SUBMIT_DATA';
const SET_TO_NEXT_DATA = 'insurance.createPatientInsurance.SET_TO_NEXT_DATA';
const SAVE_DISEASE_INFO = 'insurance.createPatientInsurance.SAVE_DISEASE_INFO';
const SUB_RES = 'insurance.createPatientInsurance.SUB_RES'

export default combineReducers({
    createStatus: (state = {}, action) => {
        if (action.type === CREAT_PATIENT_INSURANCE) {
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
    getPatientResult: (state = {}, action) => {
        if (action.type === GET_PATIENT) {
            state = { ...state, status: action }
        }
        return state;
    },
    getRelPatient: (state = {}, action) => {
        if (action.type === GET_REL_PATIENT) {
            state = { ...state, status: action }
        }
        return state;
    },
    getInsuracePackageResult: (state = {}, action) => {
        if (action.type === GET_INSURANCE_PACKAGE) {
            state = { ...state, status: action }
        }
        return state;
    },
    patientInsuranceCreateResult: (state = {}, action) => {
        if (action.type === SET_PATIENT_INSURANCE_RESULT) {
            state = { ...state, status: action }
        }
        return state;
    },
    getSelectedInsurance: (state = {}, action) => {
        if (action.type === SET_INSURANCE_SELECTED) {
            state = { ...state, status: action }
        }
        return state;
    },
    getSelectedInsuranceId: (state = {}, action) => {
        if (action.type === SET_SELECTED_INSURANCE_ID) {
            state = { ...state, status: action }
        }
        return state;
    },
    getSelPatientResult: (state = {}, action) => {
        if (action.type === GET_PATIENT) {
            state = { ...state, status: action }
        }
        return state;
    },
    getInsuranceSubmitData: (state = {}, action) => {
        if(action.type === SET_INSURANCE_SUBMIT_DATA) {
            state = { ...state, status: action }
        }
        return state;
    },
    getPreSubData: (state = {}, action) => {
        if(action.type === SET_TO_NEXT_DATA) {
            state = { ...state, status: action }
        }
        return state;
    },
    getDiseaseInfo: (state = {}, action) => {
        if(action.type === SAVE_DISEASE_INFO){
            state = { ...state, status: action }
        }
        return state;
    },
    getSubResults: (state = {}, action) => {
        if(action.type === SUB_RES){
            state = { ...state, status: action }
        }
        return state;
    }
});

export const createPatientInsurance = apiActionCreator(CREAT_PATIENT_INSURANCE, createPatientInsuranceApi);
export const resetForm = resetMiddleware.actionCreator(RESET);

export const getPatientAction = apiActionCreator(GET_PATIENT, getPatient, { mapArgumentsToParams: (patientId) => { return { patientId } } })

export const getRelPatientAction = apiActionCreator(GET_REL_PATIENT, getPatient, { mapArgumentsToParams: (patientId) => { return { patientId } } })

export const getInsuracePackageAction = apiActionCreator(GET_INSURANCE_PACKAGE, getInsuracePackage)

export function setPatientInsuranceResult(insuranceResultData){ return { type: SET_PATIENT_INSURANCE_RESULT, insuranceResultData } }

export function setInsuraceSelected(selectedInsurance){
    return {
        type: SET_INSURANCE_SELECTED,
        selectedInsurance,
    }
}

export function setSelectedInsuranceId(insuranceSelectedId) {
    return {
        type: SET_SELECTED_INSURANCE_ID,
        insuranceSelectedId,
    }
}

export function setInsuranceSubmitData(subInsuranceData) {
    return {
        type: SET_INSURANCE_SUBMIT_DATA,
        subInsuranceData,
    }
}

export function setToNextData(subToNextData) {
    return {
        type: SET_TO_NEXT_DATA,
        subToNextData,
    }
}

export function saveDiseaseInfo(diseaseInfo) {
    return {
        type: SAVE_DISEASE_INFO,
        diseaseInfo,
    }
}

export function savePutData(subRes) {
    return {
        type: SUB_RES,
        subRes,
    }
}

export const connect = reduxConnect(
    state => ({
        createStatus: state.insurance.createPatientInsurance.createStatus,
        getPatientResult: state.insurance.createPatientInsurance.getPatientResult,
        getInsuracePackageResult: state.insurance.createPatientInsurance.getInsuracePackageResult,
        patientInsuranceCreateResult: state.insurance.createPatientInsurance.patientInsuranceCreateResult,
        getSelectedInsurance: state.insurance.createPatientInsurance.getSelectedInsurance,
        getSelectedInsuranceId: state.insurance.createPatientInsurance.getSelectedInsuranceId,
        getSelPatientResult: state.insurance.createPatientInsurance.getSelPatientResult,
        getInsuranceSubmitData: state.insurance.createPatientInsurance.getInsuranceSubmitData,
        getRelPatient: state.insurance.createPatientInsurance.getRelPatient,
        getPreSubData: state.insurance.createPatientInsurance.getPreSubData,
        getDiseaseInfo: state.insurance.createPatientInsurance.getDiseaseInfo,
        getSubResults: state.insurance.createPatientInsurance.getSubResults,
    }),
    dispatch => bindActionCreators({
        createPatientInsurance,
        resetForm,
        getPatientAction,
        getInsuracePackageAction,
        setPatientInsuranceResult,
        setInsuraceSelected,
        setSelectedInsuranceId,
        setInsuranceSubmitData,
        getRelPatientAction,
        setToNextData,
        saveDiseaseInfo,
        savePutData
    }, dispatch)
);
