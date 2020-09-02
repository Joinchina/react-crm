import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Route, Link } from 'react-router-dom'
import { Popover, Button, Row, Col, Spin, Icon, Badge  } from 'antd'
import connectModal from '../../mixins/modal';
import IconLogout from '../../images/tuichu.png'
import IconChangePass from '../../images/xiugaimima.png'
import './header.scss'
import { connectRouter } from '../../mixins/router';
import logoImg from '../../images/CRM-logo.png'
import { searchMessageCount, resetData} from '../../states/message/messageCenter';
class NewHeader extends Component{
  state = {
  }


  componentDidMount(){
    this.props.searchMessageCount(0);
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
        <Col span={16}></Col>
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
export default connectRouter(connectModal(connect(select,mapDispachToProps)(NewHeader)));
