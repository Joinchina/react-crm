import { bindActionCreators, combineReducers } from 'redux';
import { apiActionCreator, getTask,
    exportTaskList as exportTaskListApi,
    downloadExportedTaskList as downloadExportedTaskListApi } from '../../api';
import { connect as reduxConnect } from 'react-redux';
import { createReducer, apiActionCreator as tableApiActionCreator } from '../../components/common/table-page';
import { resetMiddleware, reduceAsyncAction } from '../../helpers/reducers';

const SEARCH_TASK = 'taskCenter.taskList.searchTask';
const RESET = 'taskCenter.taskList.reset';
const EXPORT = 'taskCenter.taskList.export';
const RESET_EXPORT = 'taskCenter.taskList.resetExport';

const DefaultOrder = [{ createDate: "desc" }];

export default resetMiddleware(RESET)(combineReducers({
    tasks: createReducer(SEARCH_TASK),
    exportTaskResult: resetMiddleware(RESET_EXPORT)(reduceAsyncAction(EXPORT))
}));

export const searchTask = tableApiActionCreator(SEARCH_TASK, async (ctx, where, skip, limit) => {
    return await getTask(ctx, where, skip, limit, 0, DefaultOrder);
});

export const resetTaskList = resetMiddleware.actionCreator(RESET);

export const exportTaskList = apiActionCreator(EXPORT, async (ctx, where) => {
    return await exportTaskListApi(ctx, {
        where,
        order: DefaultOrder
    });
});

export const resetExportTaskResult = resetMiddleware.actionCreator(RESET_EXPORT);
export const downloadExportedTaskList = apiActionCreator(RESET_EXPORT, downloadExportedTaskListApi);

export const connect = reduxConnect(
    state => ({
        tasks: state.taskCenter.taskList.tasks,
        exportTaskResult: state.taskCenter.taskList.exportTaskResult,
    }),
    dispatch => bindActionCreators({
        searchTask,
        resetTaskList,
        exportTaskList,
        resetExportTaskResult,
        downloadExportedTaskList,
    }, dispatch)
);
