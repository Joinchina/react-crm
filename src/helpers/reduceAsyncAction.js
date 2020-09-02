export function reduceAsyncAction(actionName, { keepPreviousPayloadWhilePending, verifyAsyncId = true } = {}) {
    if (!verifyAsyncId) {
        return function(state = {}, action) {
            if (action.type === actionName) {
                state = {
                    ...state,
                    status: action.status,
                    payload: keepPreviousPayloadWhilePending ?
                        (action.status === 'pending' ? state.payload : action.payload)
                        :
                        action.payload,
                    params: action.params,
                };
            }
            return state;
        }
    } else {
        return function(state = {}, action) {
            if (action.type === actionName) {
                if (action.status === 'pending') {
                    state = {
                        ...state,
                        async: action.async,
                        status: action.status,
                        payload: keepPreviousPayloadWhilePending ? state.payload : action.payload,
                        params: action.params,
                    };
                } else if (state.async === action.async) {
                    //only accept resolve or reject if async id matches pending async id
                    state = {
                        ...state,
                        status: action.status,
                        payload: action.payload,
                        params: action.params,
                    };
                }
            }
            return state;
        }
    }
    
}

export function reduceAsyncActionKeepPayload(actionName) {
    return function(state = {}, action) {
        if (action.type === actionName) {
            state = {
                ...state,
                status: action.status,
                fulfilled: action.status === 'fulfilled' ? action.payload : state.fulfilled,
                rejected: action.status === 'rejected' ? action.payload : state.rejected
            };
        }
        return state;
    }
}

export default reduceAsyncAction;
