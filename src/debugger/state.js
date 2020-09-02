let DELETE;
let reducerProxy;
let createUpdateStateAction;
if (process.env.NODE_ENV === 'development') {
    DELETE = {
        toString(){
            return '$deleted'
        },
        toJSON(){
            return '$deleted'
        }
    };
    const ACTION_TYPE='@@DEBUGGER_UPDATE_STATE';
    createUpdateStateAction = function(patch) {
        return {
            type: ACTION_TYPE,
            state: patch
        };
    };
    reducerProxy = function(reducer) {
        return function reduce(state, action) {
            let s = reducer(state, action);
            if (action.type === ACTION_TYPE) {
                s = applyPatch(s, action.state);
            }
            return s;
        }
    };
    function applyPatch(state, patch) {
        if (patch === DELETE) {
            return undefined;
        } else if (typeof patch === 'object') {
            let newState;
            if (Array.isArray(state)) {
                newState = [...state];
            } else {
                newState = {...state};
            }
            for (const name in patch) {
                newState[name] = applyPatch(state[name], patch[name]);
            }
            return newState;
        } else {
            return patch;
        }
    }
} else {
    reducerProxy = f => f;
}

export default reducerProxy;
export { createUpdateStateAction, DELETE };
