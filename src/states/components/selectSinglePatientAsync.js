import { combineReducers, bindActionCreators } from 'redux'
import { connect as reduxConnect } from 'react-redux'
import { apiActionCreator, searchPatient } from '../../api'
import moment from 'moment';

const GEARCH_PATIENT = 'SelectSinglePatientAsync.GEARCH_PATIENT';
const RESET = 'SelectSinglePatientAsync.RESET';
const CLEAR = 'SelectSinglePatientAsync.CLEAR';

export default combineReducers({
    patientList: (state = {}, action) => {
        if(action.type === GEARCH_PATIENT) {
            state = {
                status: action.status,
                payload: action.payload,
            }
        } else if (action.type === RESET || action.type === CLEAR) {
            state = {}
        }
        return state;
    },

    searchList: (state = [], action) => {
        if(action.type === GEARCH_PATIENT) {
            state = action.status === 'fulfilled' ? [...state, ...action.payload] : state
        } else if (action.type === RESET) {
            state = []
        }
        return state;
    }

})

export const searchPatientAction = apiActionCreator(GEARCH_PATIENT, async (ctx, searchKey) => {
    const r = await searchPatient(ctx, null, searchKey);
    const data = r.list.map(patient => {
        const { id, name, sex, birthday, phone, machineNumber, address, hospitalName } = patient;
        const SEX = {"0": '女', "1": '男'};
        let age = birthday ? '/' + `${moment().year() - moment(birthday).year()}` + '岁' : ''
        const patientInfo = `${name} (${SEX[sex]}${age}) ${phone || ''} ${machineNumber || ''} ${address ? (address.liveStreet || '') : ''} ${hospitalName || ''}`;
        return {
            value: id,
            label: patientInfo,
        }
    })
    return data;
}, {
    throttle: 300
});

export function resetAction() {
    return {
        type: RESET,
    }
}

export function clearOptionsAction() {
    return {
        type: CLEAR,
    }
}

export const connect = reduxConnect(
    state => ({
        ...state.components.selectSinglePatientAsync
    }),
    dispatch => bindActionCreators({
        searchPatientAction,
        resetAction,
        clearOptionsAction,
    }, dispatch)
)
