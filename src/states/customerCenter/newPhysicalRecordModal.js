import { combineReducers, bindActionCreators } from 'redux';
import { connect as reduxConnect } from 'react-redux';
import { resetMiddleware } from '../../helpers/reducers';
import {
    apiActionCreator, postNewPhysicalRecord, getPatient, getHealthRecords
} from '../../api';
import moment from 'moment';

const UPDATE_FORM = 'customerCenter.customerDetails.newPhysicalRecordModal.UPDATE_FORM';
const RESET = 'customerCenter.customerDetails.newPhysicalRecordModal.RESET';
const POST_FORM_DATA = 'customerCenter.customerDetails.newPhysicalRecordModal.POST_FORM_DATA';
const GET_PATIENT = 'customerCenter.customerDetails.newPhysicalRecordModal.GET_PATIENT';
const GET_MEDICAL_RECORD = 'customerCenter.customerDetails.newPhysicalRecordModal.GET_MEDICAL_RECORD';
export default resetMiddleware(RESET)(combineReducers({
    formData: (state = {}, action) => {
        if(action.type === UPDATE_FORM) {
            state = {
                ...state,
                ...action.payload,
            }
        }
        return state
    },

    postFormResult: (state = {}, action) => {
        if(action.type === POST_FORM_DATA) {
            state = {
                status: action.status,
                payload: action.payload,
            }
        }
        return state;
    },

    patientInfo: (state = {}, action) => {
        if(action.type === GET_PATIENT) {
            state = {
                status: action.status,
                payload: action.payload,
            }
        }
        return state
    },

    heightRecord: (state = {}, action) => {
        if(action.type === GET_MEDICAL_RECORD) {
            state = {
                status: action.status,
                payload: action.payload,
            }
        }
        return state
    }
}));

export const getPatientInfoAction = apiActionCreator(GET_PATIENT, async (ctx, patientId) => {
    const r = await getPatient(ctx, patientId);
    if(r.birthday) {
        r.age = moment().format('YYYY') - moment(r.birthday).format('YYYY')
    }
    return r;
});
export const getHeightRecordAction = apiActionCreator(GET_MEDICAL_RECORD, async (ctx, patientId) => {
    const r = await getHealthRecords(ctx, patientId);
    return r.height || null;
});
export const postFormAction = apiActionCreator(POST_FORM_DATA, postNewPhysicalRecord);
export const resetForm = resetMiddleware.actionCreator(RESET);
export function updateForm(fields) {
    return {
        type: UPDATE_FORM,
        payload: fields
    }
}

export const connect = reduxConnect(
    state => ({
        ...state.newPhysicalRecordModal
    }),
    dispatch => bindActionCreators({
        postFormAction,
        resetForm,
        updateForm,
        getPatientInfoAction,
        getHeightRecordAction
    }, dispatch)
)
