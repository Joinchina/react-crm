import { combineReducers, bindActionCreators } from 'redux';
import { connect as reduxConnect } from 'react-redux';
import {
    apiActionCreator, getPatient, getRegularMedication
} from '../../api';


const GET_PATIENT = "custormer.tabs.GET_PATIENT";
const GET_REGULAR = "custormer.tabs.GET_REGULAR";
const RESET = 'custormer.tabs.RESET';

export default combineReducers({
    patientDetail: (state = {}, action) => {
        if(action.type === GET_PATIENT) {
            state = {
                status: action.status,
                payload: action.payload,
            }
        } else if (action.type === RESET) {
            state = {}
        }
        return state
    },
    regularMedication: (state = {}, action) => {
        if(action.type === GET_REGULAR) {
            state = {
                status: action.status,
                payload: action.payload,
            }
        } else if (action.type === RESET) {
            state = {}
        }
        return state
    },
})

export const getPatientAction = apiActionCreator(GET_PATIENT, getPatient);
export const getRegularAction = apiActionCreator(GET_REGULAR, getRegularMedication);
export function resetTabsAction() {
    return {
        type: RESET
    }
}

export const connect = reduxConnect(
    state => ({
        ...state.customerTabs
    }),
    dispatch => bindActionCreators({
        getPatientAction,
        getRegularAction,
        resetTabsAction,

    }, dispatch)
);
