import { apiActionCreator as originalApiActionCreator } from '../../../api';


// Need action: {
//     type: actionName,
//     status: 'fulfilled' | 'rejected' | other,
//     payload: { if status === 'fufilled'
//         count: 10,
//         list: [],
//     },
//     payload: { if status === 'rejected'
//         message: "Error message"
//     },
//     params: {
//         pageIndex: 1,
//         pageSize: 10
//     }
// }
export function createReducer(actionName) {
    return function reduce(state = {}, action) {
        if (action.type === actionName) {
            state = {
                ...state,
                ...action.params,
                status: action.status,
            };
            if (action.status === 'fulfilled') {
                state.count = action.payload.count;
                state.list = action.payload.list;
            } else if (action.status === 'rejected') {
                state.rejected = action.payload;
                state.list = [];
            }
        }
        return state;
    }
}

// apiAsyncFunction: function(ctx, values, skip, limit, ...args) => Promise({ list: [] })
// returns actionCreator(values, pageIndex, pageSize, ...args)
export function apiActionCreator(actionName, apiAsyncFunction) {
    return originalApiActionCreator(actionName, async (ctx, values, pageIndex, pageSize, ...args) => {
        const skip = pageSize * (pageIndex - 1);
        const limit = pageSize;
        const r = await apiAsyncFunction(ctx, values, skip, limit + 1, ...args);
        if (r.list) {
            if (r.list.length > limit) {
                r.count = skip + limit + 1;
                r.list = r.list.slice(0, limit);
            } else {
                r.count = skip + (r.list ? r.list.length : 0);
            }
        } else {//兼容不存在list属性的数据结构
            r.count = skip + (r.length ? r.length : 0);
            r.list = Array.isArray(r) && r.slice(0, limit);
        }
        
        return r;
    }, { mapArgumentsToParams: (values, pageIndex, pageSize) => ({ pageSize, pageIndex })});
}
