import { combineReducers, bindActionCreators } from 'redux';
import { connect as reduxConnect } from 'react-redux';

const SET_RESULT = 'check.newQuestionnairePreCheck.SET_RESULT';

export default combineReducers({
    result: (state = {}, action) => {
        if (action.type === SET_RESULT) {
            state = { ...state, status: action }
        }
        return state;
    },
});

export function setResult(resultData) { return { type: SET_RESULT, resultData } }

export const connect = reduxConnect(
    state => ({
        result: state.check.newQuestionnairePreCheck.result,
    }),
    dispatch => bindActionCreators({
        setResult,
    }, dispatch)
);
