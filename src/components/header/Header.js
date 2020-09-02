import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Route, Link } from 'react-router-dom'
import { Popover, Button, Row, Col, Spin, Icon, Badge  } from 'antd'
import connectModal from '../../mixins/modal';
import HasPermission, { testPermission } from '../common/HasPermission';
import IconNewClient from '../../images/hearderMenuNewClient.png'
import IconNewCustomer from '../../images/hearderMenuNewCustomer.png'
import IconNewTaskPool from '../../images/hearderMenuNewTaskPool.png'
import IconRegist from '../../images/hearderMenuRegist.png'
import IconGroupInsurance from '../../images/groupInsuranceHead.png';
import IconPatientInsurance from '../../images/patientInsurance.png';
import IconCreateCCVDCheck from '../../images/createCCVDCheck.png';
import IconNewQuestionnairePreCheck from  '../../images/newQuestionnairePreCheck.png';
import IconReserve from '../../images/yuyue.png'
import IconLogout from '../../images/tuichu.png'
import IconChangePass from '../../images/xiugaimima.png'
import IconNewChat from '../../images/newchat.png'
import Search from './Search'
import './header.scss'
import { connectRouter } from '../../mixins/router';
import logoImg from '../../images/CRM-logo.png'
import CallWorkbench from '../call/CallWorkbench';
import { searchMessageCount, resetData} from '../../states/message/messageCenter';
class Header extends Component{
  state = {
    popoverMenuStatus: false,
    menuData: [
      {
        name: '新建会员',
        modal: 'addCustomer',
        icon: IconNewClient,
        permission: 'patient.edit',
      },

      {
        name: '登记用药',
        modal: 'createOrder',
        icon: IconRegist,
        permission: 'order.edit',
      },
      {
        name: '登记会员服务',
        modal: 'newPatientInsurance',
        icon: IconPatientInsurance,
        permission: 'insurance.edit',
    },
    {
        name: '新建心脑血管评估',
        modal: 'createCCVDCheck',
        icon: IconCreateCCVDCheck,
        permission: 'patient.edit',
    },
    {
        name: '新建定制体检评估',
        modal: 'newQuestionnairePreCheck',
        icon: IconNewQuestionnairePreCheck,
        permission: 'patient.edit',
    },
    {
        name: '新建团体投保单',
        modal: 'newGroupInsurance',
        icon: IconGroupInsurance,
        permission: 'groupInsurance.edit',
    },
    {
        name: '新建话务资料',
        modal: 'addPotentialCustomer',
        icon: IconNewCustomer,
        permission: 'patient.edit',
      },
    //   {
    //     name: '新建会员预约',
    //     modal: 'addCustomerReserve',
    //     icon: IconReserve,
    //     permission: 'patient.edit',
    //   },
    //   {
    //     name: '新建任务池',
    //     modal: 'newTaskPool',
    //     icon: IconNewTaskPool,
    //     permission: 'crm.task_pool.admin',
    //   },
      {
          name: '新建沟通记录',
          modal: 'newCommunicationRecord',
          icon: IconNewChat,
          permission: 'patient.edit',
      },

    ],
    messageModal:{modal: 'MessageCenter'},
  }


  componentDidMount(){
    this.props.searchMessageCount(0);
  }

  changeModalState(row){
    this.setState({popoverMenuStatus: false})
    this.props.openModal(row.modal);
  }

  handleLogout = () => {
    location.href="/user/logout";
  }

  changePass = () => {
      const href = window.location.href;
      location.href = `/user/changePassword?username=${this.props.auth.loginName}&r=${encodeURIComponent(href)}`;
  }

  render(){
    const messageCount = this.props.message.messageCenter.messageCount
    && this.props.message.messageCenter.messageCount.status === 'fulfilled'?
    this.props.message.messageCenter.messageCount.payload : 0
    let stylesOptions = {
      lineHeight: this.props.height
    }
    let styles = this.getStyles(stylesOptions)
    let menuItems = this.state.menuData.map((row, index)=>{
      return (
          <HasPermission match={row.permission} key={index}><Row

            style={styles.menuItem}
            className='menuLink'
            onClick={this.changeModalState.bind(this, row)}
          >
            <Col span={6}>
              <img style={styles.menuItemImg} alt='' src={row.icon}/>
            </Col>
            <Col span={18}>
              {row.name}
            </Col>
        </Row></HasPermission>
      )
    })
    let popoverMenu = (
      <div
        onMouseEnter={ ()=> {
          if(this.menuTimerId) clearTimeout(this.menuTimerId)
        }}
        onMouseLeave={ ()=>this.setState({popoverMenuStatus: false})}
        style={styles.menuWrapper}
      >
        {menuItems}
      </div>
    )
    let accountMenu = (
      <div style={styles.menuWrapper}>
        <Row style={styles.menuItem} className='menuLink' onClick={this.handleLogout}>
          <Col span={6}>
            <img style={styles.menuItemImg} src={IconLogout} alt=''/>
          </Col>
          <Col span={18}>退出</Col>
        </Row>
        <Row style={styles.menuItem} className='menuLink' onClick={this.changePass}>
          <Col span={6}>
            <img style={styles.menuItemImg} src={IconChangePass} alt=''/>
          </Col>
          <Col span={18 }>修改密码</Col>
        </Row>
      </div>
    )
    return (
      <div id='header'>
        <Row gutter={20} style={styles.row}>
        <Col span={2} style={styles.logoCol}>
            <div style={{position:'relative'}}>
                <img src={logoImg} style={styles.logo} />
            </div>
        </Col>
        <Col span={8}></Col>
        <Col span={9}>
          <Route children={({ history }) => <Search history={history} />} />
        </Col>
        {testPermission({$any: ['patient.edit', 'order.edit', 'crm.task_pool.admin']}) ?
            <Col span={1} id='menuWrapper'>
              <Popover
                visible={this.state.popoverMenuStatus}
                content={popoverMenu}
                placement='bottomRight'
                style={styles.popover}
                getPopupContainer={()=>document.getElementById('header')}
              >
                <Button
                  onMouseLeave={ () => this.menuTimerId = setTimeout(() => this.setState({popoverMenuStatus: false}), 200)}
                  onMouseEnter={ () => this.setState({popoverMenuStatus: true}) }
                  type='primary'
                  style={{backgroundColor: '#377bb5', borderColor: '#377bb5', width: 32, height: 32}} icon='plus'
                />
              </Popover>
            </Col>
            : null
        }
        <Col span={1}>
            <Badge count={messageCount}>
              <Button
                type='primary'
                style={{backgroundColor: '#377bb5', borderColor: '#377bb5', width: 32, height: 32}}
                icon="mail"
                onClick={this.changeModalState.bind(this, this.state.messageModal)}
              />
            </Badge>
        </Col>
        <Col span={1}>
            <CallWorkbench>
                <Button type='primary' style={{backgroundColor: '#377bb5', borderColor: '#377bb5', width: 32, height: 32}} icon="customer-service"/>
            </CallWorkbench>
        </Col>
        <Col span={2}>
          <Popover
            content={accountMenu}
            placement='bottomRight'
            style={styles.popover}
            getPopupContainer={()=>document.getElementById('header')}
          >
            <span style={{
                cursor:'pointer',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            }}> { this.props.auth.username }</span>
          </Popover>
        </Col>
        </Row>
      </div>
    )
  }

  getStyles(options){
    return {
      row:{
        lineHeight: options.lineHeight + 'px',
      },
      logoCol:{

      },
      logo: {
            verticalAlign: 'middle',
            marginLeft: 25
      },
      link: {
        display: 'block',
        height: 20,
        lineHeight: '20px',
        position: 'absolute',
        bottom: 0,
        left: 25,
        fontSize: 12,
      },
      search:{
        display: 'block-inline',

      },
      popover:{
        padding:0,
      },
      moreMenu:{
        backgroundColor: '#a2b2c5',
        width: 30,
        height: 30
      },
      menuWrapper:{
        width: 190,
        cursor:'pointer'
      },
      menuItem:{
        height: 36,
        lineHeight: '36px',
        paddingLeft: 10,
        paddingRight: 10,
      },
      menuItemImg:{
        width: 15,
        height:15,
        'verticalAlign': 'middle'
      }
    }
  }
}

function select(state){
  return {
    auth: state.auth.payload,
    header: state.header,
    message: state.message,
  }
}
function mapDispachToProps(dispatch) {
  return bindActionCreators({
    searchMessageCount, resetData
  }, dispatch)
}
export default connectRouter(connectModal(connect(select,mapDispachToProps)(Header)));
