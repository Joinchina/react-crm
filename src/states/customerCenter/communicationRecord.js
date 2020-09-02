import { combineReducers, bindActionCreators } from 'redux'
import { connect as reduxConnect } from 'react-redux'
import { apiActionCreator, getCommunicationRecored, deleteRecord } from '../../api'

const RESET = 'customerCenter.customerDetails.RESET';
const GET_COMMUNICATION = 'customerCenter.customerDetails.GET_COMMUNICATION';
const UPDATE_FORM = 'customerCenter.customerDetails.UPDATE_FORM';
const DELETE_RECORD = 'customerCenter.customerDetails.DELETE_RECORD';


export default combineReducers({
    communicationList: (state = {}, action) => {
        if(action.type === GET_COMMUNICATION) {
            state = {
                ...state,
                ...action.params,
                status: action.status,
            }
            if (action.status === 'fulfilled') {
                state.count = action.payload.count;
                state.list = action.payload.list;
            } else if (action.status === 'rejected') {
                state.rejected = action.payload;
                state.list = [];
            }
        } else if (action.type === RESET) {
            state = {}
        }
        return state;
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

    deleteRecordResult: (state = {}, action) => {
        if(action.type === DELETE_RECORD) {
            state = {
                status: action.status,
                payload: action.payload,
            }
        } else if (action.type === RESET) {
            state = {}
        }
        return state;
    }
});

export const getCommunicationAction = apiActionCreator(GET_COMMUNICATION, async (ctx, where, pageIndex, pageSize) => {
    const skip = pageSize * (pageIndex - 1);
    const limit = pageSize;
    const r = await getCommunicationRecored(ctx, { where, skip, limit: limit + 1 });
    if (r.list && r.list.length > limit) {
        r.count = skip + limit + 1;
        r.list = r.list.slice(0, limit);
    } else {
        r.count = skip + (r.list ? r.list.length : 0);
    }
    return r;
}, {mapArgumentsToParams: (where, pageIndex, pageSize) => ({ pageSize, pageIndex })})

export const deleteRecordAction = apiActionCreator(DELETE_RECORD, async (ctx, id) => {
    return await deleteRecord(ctx, id);
})

export function updateFormField(fields) {
    return {
        type: UPDATE_FORM,
        payload: fields,
    };
}

export function resetAction() {
    return {
        type: RESET,
    }
}

export const connect = reduxConnect(
    state => ({
        ...state.communicationRecord,

    }),
    dispatch => bindActionCreators({
        updateFormField,
        getCommunicationAction,
        resetAction,
        deleteRecordAction,

    }, dispatch)
)
