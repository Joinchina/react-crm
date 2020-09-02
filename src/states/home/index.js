import { combineReducers } from 'redux'
import workloadStatistics from './workloadStatistics'
import taskPools from './taskPools'
import myTask from './myTask'

export default combineReducers({
  workloadStatistics,
  taskPools,
  myTask
})
