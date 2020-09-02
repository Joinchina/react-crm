import React, { Component } from 'react'
import WorkloadStatistics from './WorkloadStatistics'
import TaskPools from './TaskPools'
import MyTask from './MyTask'
import HasPermission from '../common/HasPermission';
import './home.scss'

const TaskPoolsPermission = { $all: ['crm.task_pool.view', 'crm.task.edit'] };

export default class Home extends Component {
  render () {

    return (
      <div>
        <WorkloadStatistics />
        <HasPermission match='crm.task_pool.view'>
            <TaskPools />
        </HasPermission>
        <HasPermission match="crm.task.view">
            <MyTask />
        </HasPermission>
    </div>
    )
  }
}
