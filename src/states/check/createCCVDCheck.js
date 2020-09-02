import { combineReducers, bindActionCreators } from 'redux';
import { connect as reduxConnect } from 'react-redux';

const SET_CHECK_RESULT = 'check.createCCVDCheck.SET_CHECK_RESULT';

export default combineReducers({
    checkResult: (state = {}, action) => {
        if (action.type === SET_CHECK_RESULT) {
            state = { ...state, status: action }
        }
        return state;
    },
});

export function setCheckResult(resultData) { return { type: SET_CHECK_RESULT, resultData } }

export const connect = reduxConnect(
    state => ({
        checkResult: state.check.createCCVDCheck.checkResult,
    }),
    dispatch => bindActionCreators({
        setCheckResult,
    }, dispatch)
);
