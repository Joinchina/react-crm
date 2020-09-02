import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Row, Col, Table, Tag } from 'antd'
import { getTasks } from '../../states/home/myTask'
import BaseComponent from '../BaseComponent'
import { Link } from 'react-router-dom';
import connectRouter from '../../mixins/router';
import SelectSingleTaskType from '../common/SelectSingleTaskType';
import moment from 'moment';
import { DecorateTableColumn } from '../common/table-page';
//import { getTaskType } from '../../states/components/selectTaskType';
import { getTaskType } from '../../api';
import context from '../../api/contextCreator';
class MyTask extends BaseComponent {

    state = {}

    componentWillMount(){
        this.loadTask();
    }

    componentWillReceiveProps(props) {
        if (this.props.router.query.alltasks !== props.router.query.alltasks) {
            this.loadTask(props);
        }
    }

    async loadTask(props) {
        const taskTypes = await getTaskType(context());
        this.setState({ taskTypes });
        if (!props) props = this.props;
        props.getTasks(props.auth.user,
            props.router.query.alltasks ? null : 5
        );
    }

    loadUnlimitedTasks = () => {
        this.props.router.setQuery({ alltasks: 1}, { replace: true });
    }

    render() {
        const styles = this.getStyles()
        const showMore = this.props.tasks.payload && this.props.tasks.payload.count > 5
        const taskTypes = this.state.taskTypes || [];
        return (
            <div style={styles.box}>
                <div style={styles.title}>我的任务
                    {  this.props.tasks.status === 'fulfilled' ?
                        <span style={styles.titleSpan}>{this.props.tasks.payload.count}</span>
                        : null
                    }
                </div>
                <div className='table-box block'>
                    <Table
                        className="table-fixed"
                        loading={this.props.tasks.status === 'pending'}
                        dataSource={this.props.tasks.status === 'fulfilled' ? this.props.tasks.payload.list : []}
                        pagination={false}
                        rowKey="id"
                        >
                        <Table.Column title="类型" dataIndex="taskType"
                            className="singleline w-10p"
                            key="taskType"
                            render={(taskType) => {
                                if(taskTypes.some(i => i.id === taskType)) {
                                    const content = taskTypes.filter(o => o.id === taskType)[0].name;
                                    return <span title={content}>{content}</span>
                                } else {
                                    return <span title="未知状态">未知状态</span>
                                }
                            }}
                        />
                        {DecorateTableColumn(<Table.Column title="主题" dataIndex="content" className="singleline w-65p"
                            render={(content, task) => <Link to={`/taskDetail/${task.id}`} className="clickable">
                                {task.isNearRelease ? <Tag color="red">回收</Tag> : null}
                                {content}
                            </Link>}
                        />)}
                        {DecorateTableColumn(<Table.Column title="会员" dataIndex="contactsName"
                            className="singleline w-10p"/>)}
                        {DecorateTableColumn(<Table.Column title="更新时间" dataIndex="updateDate"
                            className="singleline w-15p"/>)}
                    </Table>
                </div>
                {  this.props.router.query.alltasks || !showMore ? null :
                    <Row>
                        <Col span={24} style={styles.more}>
                            <span onClick={this.loadUnlimitedTasks} style={styles.moreBox}>
                                <span style={styles.moreLine}>──────</span>
                                &nbsp;&nbsp;加载更多 &nbsp;>&nbsp;&nbsp;
                                <span style={styles.moreLine}>──────</span>
                            </span>
                        </Col>
                    </Row>
                }
            </div>
        )
    }

  getStyles (options) {
    return {
      box: {
        marginTop: 50
      },
      colType: {
        width: '10%',
        paddingLeft: 20
      },
      colContent: {
        width: '65%'
      },
      colCustom: {
        width: '10%'
      },
      colTime: {
        width: '15%'
      },
      title: {
        marginBottom: 20
      },
      titleSpan: {
        marginLeft: 10,
        fontSize: 12,
        color: '#169f85',
        backgroundColor: 'rgba(26,187,156,0.2)',
        borderRadius: 4,
        paddingRight: 8,
        paddingLeft: 8
      },
      tag: {
        backgroundColor: '#e74c3c',
        color: 'white',
        borderRadius: 4,
        fontSize: 12,
        paddingLeft: 8,
        paddingRight: 8,
        height:20,
        marginRight: 5
      },
      more: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 12,
      },
      moreBox: {
        cursor: 'pointer'
      },
      moreLine: {
        color: '#e0e0e2'
      },
      tdType: {
        width: '10%',
        paddingLeft: 20
      },
      tdContent: {
        width: '65%',
        paddingTop: '12px',
        paddingBottom: '12px'
      },
      tdCustom: {
        width: '10%'
      },
      tdTime: {
        width: '15%'
      }
    }
  }
}

function select (state) {
  return {
    tasks: state.home.myTask,
    auth: state.auth.payload,
    taskType: state.components.selectTaskType,
  }
}

function mapDispachToProps (dispatch) {
  return bindActionCreators({ getTasks, getTaskType }, dispatch)
}

export default connectRouter(connect(select, mapDispachToProps)(MyTask));
