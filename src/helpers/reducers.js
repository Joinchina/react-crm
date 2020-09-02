import reduceAsyncActionImpl from './reduceAsyncAction';
import { apiActionCreator } from '../api';
import { asyncActionCreator } from './asyncActionCreator';

export function actionCreator(actionName) {
    return () => ({
        type: actionName
    });
}

export function resetMiddleware(resetActionName, defaultState) {
    return reducer => (state, action) => {
        if (action.type === resetActionName) {
            return reducer(defaultState, action);
        }
        return reducer(state, action);
    }
}

resetMiddleware.actionCreator = actionCreator;

export function chainReducers(defaultState, ...reducers) {
    return (state = defaultState, action) => {
        return reducers.reduce((s, func) => func(s, action), state);
    }
}

export function reduceValue(actionName, defaultValue = null) {
    return (state = defaultValue, action) => {
        if (action.type === actionName) {
            state = action.payload === undefined ? null : action.payload;
        }
        return state;
    }
}

reduceValue.actionCreator = actionName => {
    return val => ({
        type: actionName,
        payload: val
    });
}

export function reduceObject(actionName, defaultValue = {}) {
    return (state = defaultValue, action) => {
        if (action.type === actionName) {
            return {
                ...state,
                ...action.payload,
            }
        }
        return state;
    }
}

reduceObject.actionCreator = actionName => props => ({
    type: actionName,
    payload: props,
});

export const reduceMap = reduceObject;

export const reduceAsyncAction = (...args) => reduceAsyncActionImpl(...args);
reduceAsyncAction.actionCreator = asyncActionCreator;
reduceAsyncAction.apiActionCreator = apiActionCreator;
