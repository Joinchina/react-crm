import { combineReducers, bindActionCreators } from 'redux'
import { connect as reduxConnect } from 'react-redux'
import { resetMiddleware } from '../../helpers/reducers';
import { apiActionCreator, getCustomerLog } from '../../api'


const GET_CUSTOMER_LOG = 'customerCenter.customerDetails.GET_CUSTOMER_LOG';
const UPDATE_FORM = 'customerCenter.customerDetails.UPDATE_FORM';
const RESET = 'customerCenter.customerDetails.RESET';


export default combineReducers({
    customerLog: (state = {}, action) => {
        if(action.type === GET_CUSTOMER_LOG) {
            state = {
                status: action.status,
                payload: action.payload,
            }
        } else if (action.type === RESET) {
            state = {}
        }
        return state
    },

    formData: (state = {}, action) => {
        if(action.type === UPDATE_FORM) {
            state = {
                ...state,
                ...action.payload,
            }
        } else if (action.type === RESET) {
            state = {}
        }
        return state;
    },
})
export const getCustomerLogAction = apiActionCreator(GET_CUSTOMER_LOG, getCustomerLog)

export function updateFormField(fields) {
    return {
        type: UPDATE_FORM,
        payload: fields,
    };
}

export function resetAction() {
    return {
        type: RESET
    }
}


export const connect = reduxConnect(
    state => ({
        ...state.customerLog,
    }),
    dispatch => bindActionCreators({
        getCustomerLogAction,
        resetAction,
        updateFormField,
    }, dispatch)
)
