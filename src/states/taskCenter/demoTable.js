import { createReducer, apiActionCreator } from '../../components/common/table-page';
import { combineReducers } from 'redux';

const SEARCH_TASK = 'demoTable';

export default combineReducers({
    tableData: createReducer(SEARCH_TASK),
    disabledResult: ()=>({}),
    deleteResult: ()=>({}),
});

export const searchTask = apiActionCreator(SEARCH_TASK, async (ctx, where, skip, limit) => {
    const list = [];
    for (let i = 0; i < limit; i ++) {
        list.push({
            index: skip + i,
            name: where.name
        });
    }
    return {
        list,
    }
});
