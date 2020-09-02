import React, {Component} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import { Row, Col, Input, Spin, Rate } from 'antd'
import message from '@wanhu/antd-legacy/lib/message';
import { getTaskPoolList, handleTaskFromPool, getFavorTaskPools, setFavorTaskPools} from '../../states/home/taskPools'
import Radium from 'radium'
import moment from 'moment'
import AsyncEvent from '../common/AsyncEvent';
import history from '../../history';
import connectRouter from '../../mixins/router';
import TablePlaceholder from '../common/TablePlaceholder';

class TaskPools extends Component {

    state = {
        search: this.query.search
    }

    componentWillMount() {
        this.props.getFavorTaskPools(this.props.auth.user);
    }

    componentWillReceiveProps(props) {
        if (this.props.router.query.search !== props.router.query.search) {
            this.loadTaskPools(props);
        }
        if (this.props.router.query.allpools !== props.router.query.allpools) {
            this.loadTaskPools(props);
        }
    }

    handleTaskFromPool(id) {
        this.props.handleTaskFromPool(id);
    }

    gotoTaskDetail = () => {
        message.success('任务领取成功', 3);
        history.push(`/taskPool/${this.props.handleTaskFromPoolResult.params}/task/${this.props.handleTaskFromPoolResult.payload.taskId}`);
    }

    get query() {
        return this.props.router.query;
    }

    setQuery(data) {
        this.props.router.setQuery(data, { replace: true });
    }

    onSearchChange = (e) => {
        this.setState({ search: e.target.value });
    }

    onSearchSubmit = (e) => {
        this.setQuery({ search: e.target.value || null, allpools: null });
    }

    loadTaskPools(props) {
        if (!props) props = this.props;
        props.getTaskPoolList(props.auth.user,
            props.router.query.allpools ? null : 8,
            props.router.query.search,
            props.favorTaskPools.status === 'fulfilled' ? props.favorTaskPools.payload : null
        );
    }

    loadTaskPoolsNoLimit = () => {
        this.setQuery({ allpools: 1 });
    }

    reloadTaskPools = () => {
        this.loadTaskPools(this.props);
    }

    toggleFavorTaskPool(poolId) {
        const oldIds = [...this.props.favorTaskPools.payload];
        let newIds;
        if (oldIds.indexOf(poolId) >= 0) {
            newIds = oldIds.filter(id => id !== poolId);
        } else {
            newIds = [...oldIds, poolId];
        }
        this.props.setFavorTaskPools(this.props.auth.user, newIds);
    }

    finishSetFavorTaskPools = () => {
        this.props.getFavorTaskPools(this.props.auth.user);
    }

    render() {
        const styles = this.getStyles();
        const taskPools = this.props.taskPools;
        const errorTip = taskPools.payload && taskPools.payload.status == '403' ? '权限不足，请联系管理员' : null
        return (
            <div style={styles.box}>
                <div style={styles.title}>
                    <div style={{display: 'inline', marginRight: 20}}>待领取任务
                        {
                            taskPools.payload && taskPools.payload.sum ?
                            <span style={styles.titleSpan}>{taskPools.payload.sum.count}</span>
                            : null
                        }
                    </div>
                    <Input value={this.state.search}
                        onChange={this.onSearchChange}
                        onBlur={this.onSearchSubmit}
                        onPressEnter={this.onSearchSubmit}
                        style={styles.input}
                        placeholder="输入任务池名称" />
                </div>
                <Spin spinning={taskPools.status === 'pending'}>
                    {
                        (taskPools.payload && taskPools.payload.list && taskPools.payload.list.length > 0) ?
                        <div>
                            {
                                <Row style={styles.row}>{
                                    taskPools.payload.list.map((item, index) => <Col key={index} span={6} style={styles.col}>
                                        <div className='tasksColBox' style={styles.colBox} onClick={() => this.handleTaskFromPool(item.id)}>
                                            <div style={styles.colTitle}>
                                                {item.name}
                                            </div>
                                            <div style={styles.colContent}>
                                                <span style={styles.colContentNum}>{item.count}</span>待领取
                                            </div>
                                            <div style={styles.colFoot}>
                                                {item.effectiveRule === 1
                                                    ? '长期有效'
                                                    : `${moment(item.endDate).format('ll')}截止（剩${moment(item.endDate).diff(moment().format('YYYY-MM-DD'), 'days')}天）`}
                                            </div>
                                            <div onClick={cancelEvent}>
                                                { this.props.favorTaskPools.status === 'fulfilled' ?
                                                    <Rate count={1} value={this.props.favorTaskPools.payload.indexOf(item.id) >= 0 ? 1 : 0} onChange={val=>this.toggleFavorTaskPool(item.id, val)} />
                                                    : null
                                                }
                                            </div>
                                        </div>
                                        {/* </Link> */}
                                    </Col>)
                                }</Row>
                            }
                            { taskPools.payload.list.length < taskPools.payload.count ?
                                <Row>
                                    <Col span={24} style={styles.more}>
                                        <span onClick={this.loadTaskPoolsNoLimit} style={styles.moreBox}>
                                            <span style={styles.line}>──────</span>
                                            &nbsp;&nbsp;加载更多 &nbsp;>&nbsp;&nbsp;
                                            <span style={styles.line}>──────</span>
                                        </span>
                                    </Col>
                                </Row>
                                :
                                null
                            }
                        </div>
                        :
                        <TablePlaceholder keyword="任务池" status={taskPools.status} errorTip={errorTip} onReload={this.reloadTaskPools}/>
                    }
                </Spin>
                <AsyncEvent async={this.props.handleTaskFromPoolResult} onFulfill={this.gotoTaskDetail} alertError/>
                <AsyncEvent async={this.props.setFavorTaskPoolsResult} onFulfill={this.finishSetFavorTaskPools} alertError/>
                <AsyncEvent async={this.props.favorTaskPools} onFulfill={this.reloadTaskPools} onReject={this.reloadTaskPools}/>
            </div>
        )
    }

    getStyles(options) {
        return {
            box: {
                marginTop: 50,
                position: 'relative'
            },
            row: {
                marginRight: -20,
                marginLeft: 0,
                minHeight: 150
            },
            col: {
                height: 130,
                marginBottom: 20
            },
            colBox: {
                backgroundColor: 'white',
                height: 130,
                marginRight: 20,
                paddingRight: 20,
                paddingLeft: 20,
                paddingTop: 18,
                position: 'relative'
            },
            colTitle: {
                color: '#169f85'
            },
            colContent: {
                lineHeight: '91px',
                height: 91,
                fontSize: 18
            },
            colContentNum: {
                fontSize: 36
            },
            colFoot: {
                position: 'absolute',
                right: '20px',
                bottom: '12px',
                fontSize: 12,
                color: '#9f9f9f'
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
            more: {
                textAlign: 'center',
                fontSize: 12
            },
            moreBox: {
                cursor: 'pointer'
            },
            line: {
                color: '#e0e0e2'
            },
            input: {
                height: 36,
                width: '22%',
            }
        }
    }
}

function cancelEvent(e) {
    e.stopPropagation();
    e.preventDefault();
}

function select(state) {
    return {
        auth: state.auth.payload,
        taskPools: state.home.taskPools.taskPools,
        favorTaskPools: state.home.taskPools.favorTaskPools,
        setFavorTaskPoolsResult: state.home.taskPools.setFavorTaskPoolsResult,
        handleTaskFromPoolResult: state.home.taskPools.handleTaskFromPoolResult,
    }
}

function mapDispachToProps(dispatch) {
    return bindActionCreators({
        getTaskPoolList,
        handleTaskFromPool,
        getFavorTaskPools,
        setFavorTaskPools
    }, dispatch)
}

export default connectRouter(connect(select, mapDispachToProps)(Radium(TaskPools)));
