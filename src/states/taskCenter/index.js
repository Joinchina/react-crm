import { combineReducers } from 'redux';

import taskList from './taskList';
import taskDetail from './taskDetail';
import newTask from './newTask';
import taskPoolList from './taskPoolList';
import taskPoolDetail from './taskPoolDetail';
import newTaskPool from './newTaskPool';
import quickActivation from './quickActivation';
import demoTable from './demoTable';
import frozenList from './frozenList';
import newFrozen from './newFrozen';

export default combineReducers({
    taskList,
    taskDetail,
    newTask,
    taskPoolList,
    taskPoolDetail,
    newTaskPool,
    quickActivation,
    demoTable,
    frozenList,
    newFrozen,
});
