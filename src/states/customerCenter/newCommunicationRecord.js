import { combineReducers, bindActionCreators } from 'redux';
import { connect as reduxConnect } from 'react-redux';
import { apiActionCreator, getCommunicationDetail, getPatient,
    createRecord, updateRecord,
} from '../../api';
import moment from 'moment';

const GET_COMMUNICATION_DETAIL = 'customerCenter.customerDetails.GET_COMMUNICATION_DETAIL';
const GET_PATIENT_DETAIL = 'customerCenter.customerDetails.GET_PATIENT_DETAIL';
const RESET = 'customerCenter.customerDetails.RESET_detail';
const UPDATE_FORM = 'customerCenter.customerDetails.UPDATE_FORM_DETAIL';
const CREATE_COMMUNICATION_RECORD = 'customerCenter.customerDetails.CREATE_COMMUNICATION_RECORD';
const UNDATE_COMMUNICATION_RECORD = 'customerCenter.customerDetails.UNDATE_COMMUNICATION_RECORD';

export default combineReducers({
    formData: (state = {}, action) => {
        if (action.type === UPDATE_FORM) {
            state = {
                ...state,
                ...action.payload
            };
        } else if (action.type === RESET) {
            state = {};
        }
        return state;
    },

    communicationDetail: (state = {}, action) => {
        if(action.type === GET_COMMUNICATION_DETAIL) {
            state = {
                status: action.status,
                payload: action.payload,
            }
        } else if(action.type === RESET) {
            state = {}
        }
        return state;
    },

    patientDetail: (state = {}, action) => {
        if(action.type === GET_PATIENT_DETAIL) {
            state = {
                status: action.status,
                payload: action.payload,
            }
        } else if (action.type === RESET) {
            state = {}
        }
        return state;
    },

    createRecordResult: (state = {}, action) => {
        if(action.type === CREATE_COMMUNICATION_RECORD) {
            state = {
                status: action.status,
                payload: action.payload,
            }
        } else if (action.type === RESET) {
            state = {}
        }
        return state;
    },

    updateRecordResult: (state = {}, action) => {
        if(action.type === UNDATE_COMMUNICATION_RECORD) {
            state = {
                status: action.status,
                payload: action.payload,
            }
        } else if (action.type === RESET) {
            state = {}
        }
        return state;
    },


})

export function resetAction() {
    return {
        type: RESET,
    }
}

export function updateFormField(fields) {
    return {
        type: UPDATE_FORM,
        payload: fields,
    };
}

export const getCommunicationDetailAction = apiActionCreator(GET_COMMUNICATION_DETAIL, async (ctx, recordId) => {
    const r = await getCommunicationDetail(ctx, recordId);
    r.recordType = String(r.recordType);
    let patientId = r.patientId;
    if(patientId) {
        const patient = await getPatient(ctx, patientId);
        r.patientInfo = mapPatientDetail(patient);
    } 
    return r;
});

function mapPatientDetail(patient) {
    const { name, sex, birthday, phone, machineNumber, address, hospital } = patient;
    const SEX = {"0": '女', "1": '男'};
    const patientInfo = `${name?name:''} (${SEX[sex?sex:'0']}/${moment().year() - moment(birthday?birthday:'').year()}岁) ${phone?phone:''} ${machineNumber?machineNumber:''} ${address?(address.liveStreet?address.liveStreet:''):''} ${hospital?(hospital.name?hospital.name:''):''}`;
    return patientInfo;
}

export const getPatientDetailAction = apiActionCreator(GET_PATIENT_DETAIL, async (ctx, patientId) => {
    const r = await getPatient(ctx, patientId);
    const patient = {}
    patient.patientId = patientId;
    patient.patientInfo = mapPatientDetail(r);
    return patient;
});

export const createRecordAction = apiActionCreator(CREATE_COMMUNICATION_RECORD, async (ctx, data) => {
    return await createRecord(ctx, data);
})

export const updateRecordAction = apiActionCreator(UNDATE_COMMUNICATION_RECORD, async (ctx, id, data) => {
    return await updateRecord(ctx, id, data);
})


export const connect = reduxConnect(
    state => ({
        ...state.communicationDetail,
    }),
    dispatch => bindActionCreators({
        getCommunicationDetailAction,
        getPatientDetailAction,
        updateFormField,
        resetAction,
        createRecordAction,
        updateRecordAction,

    }, dispatch)
)
