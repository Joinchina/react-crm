import { combineReducers, bindActionCreators } from 'redux';
import { apiActionCreator,
    applySpareMoney,
} from '../../api';
import { connect as reduxConnect } from 'react-redux';

const UPDATE_FORM = 'toolcase.newSpareMoney.UPDATE_FORM';
const RESET = 'toolcase.newSpareMoney.RESET';
const CREAT_SPAREMONEY = 'toolcase.newSpareMoney.CREAT_SPAREMONEY'

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
    applySpareMoneyResult: (state = {}, action) => {
        if (action.type === CREAT_SPAREMONEY) {
            state = {
                status: action.status,
                payload: action.payload
            };
        } else if (action.type === RESET) {
            state = {};
        }
        return state;
    },

});


export function resetForm() {
    return {
        type: RESET,
    };
}

export const appliSpareMoney = apiActionCreator(CREAT_SPAREMONEY, async (ctx, data) => {
    await applySpareMoney(ctx, data)
});

export const connect = reduxConnect(
    state => ({
        ...state.toolcase.newSpareMoney,
    }),
    dispatch => bindActionCreators({
        appliSpareMoney,
        resetForm,
    }, dispatch)
);
