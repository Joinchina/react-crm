import { combineReducers, bindActionCreators } from 'redux';
import { apiActionCreator,
    getOrderCancelReasons,
    cancelOrder as cancelOrderApi,
} from '../../api';
import { connect as reduxConnect } from 'react-redux';

const UPDATE_FORM = 'orderCenter.orderRefundModal.UPDATE_FORM';
const SEARCH_CANCEL_REASON = 'orderCenter.orderRefundModal.SEARCH_CANCEL_REASON'
const CANCEL_ORDER = 'orderCenter.orderRefundModal.CANCEL_ORDER'
const RESET = 'orderCenter.orderRefundModal.RESET';

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
    cancelOrderResult: (state = {}, action) => {
        if (action.type === CANCEL_ORDER) {
            state = {
                status: action.status,
                payload: action.payload
            };
        } else if (action.type === RESET) {
            state = {};
        }
        return state;
    },
    cancelReason: (state = {}, action) => {
        if(action.type === SEARCH_CANCEL_REASON) {
            state = {
                status: action.status,
                payload: action.payload
            }
        }
        return state;
    }
});


export function updateFormField(fields) {
    return {
        type: UPDATE_FORM,
        payload: fields,
    };
}

export function resetForm() {
    return {
        type: RESET,
    };
}


export const getCancelReason = apiActionCreator(SEARCH_CANCEL_REASON, getOrderCancelReasons);
export const cancelOrder = apiActionCreator(CANCEL_ORDER, cancelOrderApi);


export const connect = reduxConnect(
    state => ({
        ...state.orderCenter.orderRefundModal,
    }),
    dispatch => bindActionCreators({
        updateFormField,
        resetForm,
        getCancelReason,
        cancelOrder,
    }, dispatch)
);
