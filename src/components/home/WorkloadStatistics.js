import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Row, Col, Spin, Input, DatePicker, Dropdown, Menu  } from 'antd'
import { Link } from 'react-router-dom'
import Radium from 'radium'
import moment from 'moment'
import timeImg from '../../images/riqi.png'
import userImg from '../../images/user.png'
import { workloadStatisticsAction } from '../../states/home/workloadStatistics'
import BaseComponent from '../BaseComponent'
import SelectSingleUser from '../common/SelectSingleUser';
import AsyncEvent from '../common/AsyncEvent';
import connectRouter from '../../mixins/router';

const InputGroup = Input.Group
const dateFormat = 'YYYY-MM-DD'
const Today = moment().set({ hour: 23, minute: 59, second: 59, millisecond: 999});

class WorkloadStatistics extends BaseComponent {

  state = {};

  componentWillMount() {
    const userId = this.props.router.query.user || this.props.auth.user;
    const userName = userId === this.props.auth.user ? this.props.auth.username : null;
    this.setState({
        user: {
            id: userId,
            name: userName
        }
    });
    this.reload();
  }

  componentWillReceiveProps(props) {
      let needChange;
      if (props.router.query.user !== this.props.router.query.user) {
          needChange = true;
          this.setState(state => {
              const oldUser = state.user ? state.user.id : null;
              const newUser = props.router.query.user || props.auth.user;
              if (oldUser !== newUser) {
                  return {
                      user: {
                          id: newUser,
                          name: props.auth.user === newUser ? props.auth.username : null
                      }
                  };
              }
          });
      }
      if (props.router.query.date !== this.props.router.query.date) {
          needChange = true;
      }
      if (needChange) {
          this.reload(props);
      }
  }

  onChangeUser = (user) => {
      if (!user) {
          user = {
              id: this.props.auth.user,
              name: this.props.auth.username
          };
      }
      this.setState({
          user: user,
      }, () => {
          this.props.router.setQuery({
              user: user.id === this.props.auth.user ? null : user.id
          }, { replace: true });
      });
  }

  onChangeDate = (date) => {
      let dateString = date ? date.format(dateFormat) : null;
      if (dateString && dateString === moment().format(dateFormat)) {
          dateString = null;
      }
      this.props.router.setQuery({
          date: dateString,
      });
  }

  reload(props){
      if (!props) props = this.props;
      const date = moment(props.router.query.date || undefined).format(dateFormat);
      const user = props.router.query.user || props.auth.user;
      props.workloadStatisticsAction(user, date, date);
  }

  notAllowAfterToday = (date) => {
      return date.isAfter(Today);
  }

  render () {
    const styles = this.getStyles()
    const labelBefore = (style,img) => <label style={style}><img alt='' style={styles.img} src={img} /></label>
    const date = moment(this.props.router.query.date || undefined);
    const dateString = date.format(dateFormat);
    const statistics = this.props.workloadStatistics.status === 'fulfilled' ? this.props.workloadStatistics.payload : {};
    return (
      <div>
        <div style={styles.title}>工作量统计<span></span></div>
        <Spin spinning={this.props.workloadStatistics.status === 'pending'}>
            <Row gutter={40} style={styles.row}>

              <Col span={6} style={styles.col}>
                <InputGroup style={styles.colItemSpace} compact>
                  {labelBefore(styles.sLabel,userImg)}
                  <SelectSingleUser
                      allowClear={false}
                      mapItemToLabel={item => item.name}
                      value={this.state.user} style={styles.select} selectStyle={{width:'100%'}}
                      onChange={this.onChangeUser}
                      normalize={(val, set) => {
                          if (val.id === this.props.auth.user && val.name === this.props.auth.username)  {
                              return val;
                          }
                          const found = set.find(item => item.id === val.id);
                          if (found && found.id === val.id && found.name === val.name) {
                              return val;
                          }
                          return found || {
                              id: this.props.auth.user,
                              name: this.props.auth.username
                          };
                      }}
                  />
                </InputGroup>

                <InputGroup style={styles.colItem} compact>
                  {labelBefore(styles.iLabel,timeImg)}
                  <DatePicker onChange={this.onChangeDate} value={date} style={styles.input} disabledDate={this.notAllowAfterToday} allowClear={false}/>
                </InputGroup>
              </Col>
              <Col span={6} style={styles.col}>
                <div style={styles.colItemSpace}>完成任务</div>
                { statistics.taskTypeCount && statistics.taskTypeCount.length ?
                    <Dropdown overlay={<Menu selectedKeys={[]}>
                        {
                            statistics.taskTypeCount.map(item =>
                                <Menu.Item key={item.id}>
                                    <Link to={`/taskList?q=1&updateDate=${dateString}%2C${dateString}&taskStatus=2&taskType=${item.id}&chargeId=${this.state.user.id}%2C${this.state.user.name}`}>
                                        <span style={{width: 100, display:'inline-block'}}>{item.name}</span><span>{item.count}</span>
                                    </Link>
                                </Menu.Item>)
                        }
                    </Menu>}>
                        <div style={styles.colItem}>
                            <Link className='statistics-link' to={`/taskList?q=1&updateDate=${dateString}%2C${dateString}&taskStatus=2&chargeId=${this.state.user.id}%2C${this.state.user.name}`}>
                                { statistics.taskCount }
                            </Link>
                        </div>
                    </Dropdown>
                    :
                    <div style={styles.colItem}>
                        <Link className='statistics-link' to={`/taskList?q=1&updateDate=${dateString}%2C${dateString}&taskStatus=2&chargeId=${this.state.user.id}%2C${this.state.user.name}`}>
                            { statistics.taskCount }
                        </Link>
                    </div>
                }
              </Col>

              <Col span={6} style={styles.col}>
                <div style={styles.colItemSpace}>登记用药</div>
                <div style={styles.colItem}>
                    <Link className='statistics-link' to={`/orderCenter?q=1&createDate=${dateString}%2C${dateString}&createBy=${this.state.user.id}%2C${this.state.user.name}`}>
                      { statistics.orderCount }
                    </Link>
                </div>
              </Col>

              <Col span={6} style={styles.col}>
                <div style={styles.colItemSpace}>登记会员</div>
                <div style={styles.colItem}>
                    <Link className='statistics-link' to={`/customerCenter?q=1&createDate=${dateString}%2C${dateString}&createBy=${this.state.user.id}%2C${this.state.user.name}`}>
                        { statistics.patientCount }
                    </Link>
                </div>
              </Col>
            </Row>
        </Spin>
        <AsyncEvent async={this.props.workloadStatistics} alertError/>
    </div>
    )
  }

  getStyles (options) {
    return {
      row: {
        backgroundColor: 'white',
        height: '108px',
        marginRight: 0,
        marginLeft: 0,
        boxShadow: '0px 0px 10px 1px #e0e0e2'
      },
      col: {
        marginTop: 14,
        borderRight: '1px solid #e0e0e2'
      },
      colRightLine: {
        borderRight: '1px solid #e0e0e2'
      },
      colMargin: {
        marginTop: 5,
        marginBottom: 5,
      },
      label: {
        width: '20%',
        textAlign: 'center'
      },
      sLabel: {
        width: '20%',
        textAlign: 'center',
        backgroundColor: '#96ca59'
      },
      iLabel: {
        width: '20%',
        textAlign: 'center',
        backgroundColor: '#5bc0de'
      },
      colItemSpace: {
        height: 36,
        marginBottom: 8,
        lineHeight: '36px',
        fontSize: 14,
        color: '#2a3f54',
      },
      colItem: {
        height: 36,
        lineHeight: '36px',
        fontSize: 24,
        color: '#2a3f54',
      },
      line: {
        backgroundColor: 'red'
      },
      title: {
        marginBottom: 20
      },
      select:{
        width: '80%'
      },
      input:{
        width: '80%'
      },
      drug: {
        height: 36,
        lineHeight: '36px',
        fontSize: 24,
        color: '#169f85',
      },
      img: {
        verticalAlign: 'middle'
      }
    }
  }
}
WorkloadStatistics = Radium(WorkloadStatistics)

function select(state){
  return {
      workloadStatistics: state.home.workloadStatistics,
      auth: state.auth.payload,
  }
}

function mapDispachToProps(dispatch){
  return bindActionCreators({ workloadStatisticsAction }, dispatch)
}

export default connectRouter(connect(select, mapDispachToProps)(WorkloadStatistics))
