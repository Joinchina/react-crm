import { combineReducers, bindActionCreators } from 'redux'
import { connect as reduxConnect } from 'react-redux'
import { apiActionCreator, getCommunicationRecored, deleteRecord, getIntegal } from '../../api'

const RESET = 'customerCenter.customerDetails.RESET';
const GET_INTEGAL = 'customerCenter.customerDetails.GET_INTEGAL';
const UPDATE_FORM = 'customerCenter.customerDetails.UPDATE_FORM';
const DELETE_RECORD = 'customerCenter.customerDetails.DELETE_RECORD';


export default combineReducers({
    integalList: (state = [], action) => {
        if(action.type === GET_INTEGAL) {
            state = {
                ...state,
                ...action.params,
                status: action.status,
            }
            if (action.status === 'fulfilled') {
                state.count = action.payload.count;
                state.data = action.payload.data;
            } else if (action.status === 'rejected') {
                state.rejected = action.payload;
                state.data = [];
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

export const getIntegalAction = apiActionCreator(GET_INTEGAL, async (ctx, where, pageIndex, pageSize) => {
    const skip = pageSize * (pageIndex - 1);
    const limit = pageSize;
    const r = await getIntegal(ctx, { where, skip, limit: limit + 1 });
    let at = {}
    if (r && r.length > limit) {
        at.count = skip + limit + 1;
        at.data = r.slice(0, limit);
    } else {
        at.count = skip + (r ? r.length : 0);
        at.data = r
    }
    return at;
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
        ...state.integralRecord,

    }),
    dispatch => bindActionCreators({
        updateFormField,
        resetAction,
        deleteRecordAction,
        getIntegalAction,
    }, dispatch)
)
