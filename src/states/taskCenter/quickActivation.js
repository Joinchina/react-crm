import { combineReducers, bindActionCreators } from 'redux';
import { apiActionCreator, taskQuickActivation } from '../../api';
import { connect as reduxConnect } from 'react-redux';
import { resetMiddleware } from '../../helpers/reducers';

const UPDATE_FORM = 'taskCenter.activation.updateFormField';
const SUBMIT = 'taskCenter.activation.submit';
const RESET = 'taskCenter.activation.reset';
const RESET_SUBMIT = 'taskCenter.activation.resetSubmit';

export default resetMiddleware(RESET)(combineReducers({
    formData(state = {}, action) {
        if (action.type === UPDATE_FORM) {
            state = { ...state, ...action.payload };
        }
        return state;
    },
    submit: resetMiddleware(RESET_SUBMIT)(function (state = {}, action) {
        if (action.type === SUBMIT) {
            state = {
                status: action.status,
                payload: action.payload,
            };
        }
        return state;
    }),
}));

export function updateFormField(fields) {
    return {
        type: UPDATE_FORM,
        payload: fields,
    };
}

export const submitQuickActivation = apiActionCreator(SUBMIT, taskQuickActivation);

export const reset = resetMiddleware.actionCreator(RESET);
export const resetSubmit = resetMiddleware.actionCreator(RESET_SUBMIT);
export const connect = reduxConnect(
    state => ({
        formData: state.taskCenter.quickActivation.formData,
        submit: state.taskCenter.quickActivation.submit,
    }),
    dispatch => bindActionCreators({
        updateFormField,
        submitQuickActivation,
        reset,
        resetSubmit
    }, dispatch)
);
