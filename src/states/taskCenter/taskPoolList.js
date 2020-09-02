import { combineReducers, bindActionCreators } from 'redux';
import { apiActionCreator, getTaskPool,
    updateTaskPool as updateTaskPoolApi,
    deleteTaskPool as deleteTaskPoolApi
} from '../../api';
import { connect as reduxConnect } from 'react-redux';
import { createReducer, apiActionCreator as tablePageApiActionCreator } from '../../components/common/table-page';
import { resetMiddleware } from '../../helpers/reducers';

const SEARCH_TASK_POOL = 'taskCenter.taskPoolList.searchTaskPool';
const UPDATE_TASK_POOL = 'taskCenter.taskPoolList.updateTaskPool';
const DELETE_TASK_POOL = 'taskCenter.taskPoolList.deleteTaskPool';
const RESET_TASK_POOLS = 'taskCenter.taskPoolList.resetTaskPools';

export default combineReducers({
    taskPools: resetMiddleware(RESET_TASK_POOLS)(createReducer(SEARCH_TASK_POOL)),
    updateStatus(state = {}, action) {
        if (action.type === UPDATE_TASK_POOL) {
            state = {
                status: action.status,
                payload: action.payload,
                params: action.params
            };
        }
        return state;
    },
    deleteStatus(state = {}, action) {
        if (action.type === DELETE_TASK_POOL) {
            state = {
                status: action.status,
                payload: action.payload,
            };
        }
        return state;
    }
});

export const searchTaskPool = tablePageApiActionCreator(SEARCH_TASK_POOL, getTaskPool);

export const updateTaskPool = apiActionCreator(UPDATE_TASK_POOL, async (ctx, id, op, data) => {
    console.log("UPDATE_TASK_POOL", id, op, data);
    await updateTaskPoolApi(ctx, id, data);
}, {
    mapArgumentsToParams: (id, op, data) => op
})

export const deleteTaskPool = apiActionCreator(DELETE_TASK_POOL, deleteTaskPoolApi);

export const resetTaskPools = resetMiddleware.actionCreator(RESET_TASK_POOLS);

export const connect = reduxConnect(
    state => ({
        taskPools: state.taskCenter.taskPoolList.taskPools,
        updateStatus: state.taskCenter.taskPoolList.updateStatus,
        deleteStatus: state.taskCenter.taskPoolList.deleteStatus,
    }),
    dispatch => bindActionCreators({
        searchTaskPool,
        updateTaskPool,
        deleteTaskPool,
        resetTaskPools
    }, dispatch)
);
