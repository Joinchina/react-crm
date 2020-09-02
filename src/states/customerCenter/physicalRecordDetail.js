import { combineReducers, bindActionCreators } from 'redux';
import { connect as reduxConnect } from 'react-redux';
import {
    apiActionCreator, getPhysicalRecordDetail, editPhysicalExamination, getHealthRecords
} from '../../api';
import { resetMiddleware } from '../../helpers/reducers';

const GET_PHYSICALRECORD_DETAIL = 'customerCenter.customerDetails.GET_PHYSICALRECORD_DETAIL';
const RESET_PHYSICALRECORD_DETAIL = 'customerCenter.customerDetails.RESET_PHYSICALRECORD_DETAIL';
const UPDATA_FORM = 'customerCenter.customerDetails.physicalRecordDetail.UPDATA_FORM';
const EDIT_FORM = 'customerCenter.customerDetails.physicalRecordDetail.EDIT_FORM';
const SUBMIT_FORM = 'customerCenter.customerDetails.physicalRecordDetail.SUBMIT_FORM';
const GET_MEDICAL_RECORD = 'customerCenter.customerDetails.physicalRecordDetail.GET_MEDICAL_RECORD';


export default resetMiddleware(RESET_PHYSICALRECORD_DETAIL)(combineReducers({
    physicalRecordDetail: (state = {}, action) => {
        if(action.type === GET_PHYSICALRECORD_DETAIL) {
            state = {
                status: action.status,
                payload: action.payload,
            }
        }
        return state;
    },

    formData: (state = {}, action) => {
        if(action.type === UPDATA_FORM) {
            state = {
                ...state,
                ...action.payload,
            }
        } else if (action.type === EDIT_FORM && !action.payload.editing && action.payload.fields) {
            state = { ...action.payload.fields };
        }
        return state;
    },

    formEdit: (state = {}, action) => {
        if (action.type === EDIT_FORM) {
            if (action.payload.editing) {
                state = { ...action.payload };
            } else {
                state = { editing: false};
            }
        }
        return state;
    },

    saveFormResult: (state = {}, action) => {
        if (action.type === SUBMIT_FORM) {
            state = {
                status: action.status,
                payload: action.payload,
            };
        }
        return state;
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

export const getPhysicalRecordDetailAction = apiActionCreator(
    GET_PHYSICALRECORD_DETAIL, async (ctx, patientId, orderId) => {
        const r = await getPhysicalRecordDetail(ctx, patientId, orderId);
        let Obj = {};
        for(let key in r) {
            if(r[key] !== undefined && r[key] !== null && r[key] !== '') {
                if(typeof r[key] === 'number' && key !== 'status' && key !== 'type' && key !== 'oralExamination') {
                    Obj[key] = String(r[key]);
                } else {
                    Obj[key] = r[key]
                }
            }
        }
        return Obj;
});
export const getHeightRecordAction = apiActionCreator(GET_MEDICAL_RECORD, async (ctx, patientId) => {
    const r = await getHealthRecords(ctx, patientId);
    return r.height || null;
});
export const resetPhysicalRecordDetailAction = resetMiddleware.actionCreator(RESET_PHYSICALRECORD_DETAIL);
export const saveFormAction = apiActionCreator(SUBMIT_FORM, editPhysicalExamination);
export function updateForm(fields, force) {
    return {
        type: UPDATA_FORM,
        payload: fields,
    };
}

export function backupFormAndBeginEdit(fields) {
    return {
        type: EDIT_FORM,
        payload: {
            editing: true,
            fields: fields
        }
    }
}

export function stopFormEdit(restoreFields) {
    return {
        type: EDIT_FORM,
        payload: {
            editing: false,
            fields: restoreFields,
        }
    }
}

export const connect = reduxConnect(
    state => ({
        ...state.physicalRecordDetail
    }),
    dispatch => bindActionCreators({
        getPhysicalRecordDetailAction,
        resetPhysicalRecordDetailAction,
        updateForm,
        backupFormAndBeginEdit,
        stopFormEdit,
        saveFormAction,
        getHeightRecordAction
    }, dispatch)
);
