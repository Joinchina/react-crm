import { Modal, Row, Col, Button } from 'antd';
import React, { Component } from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import './CustomerCard.less';
import api from '../../api/api';

class CustomerCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      customer: {
        address: {},
      },
      visible: false,
      patientId: null,
    };
  }
  getCustomerInfo = async (id) => {
    // console.log('getCustomerInfo id:', id);
    let customer = await api.getPatient(id);
    this.setState({
      customer: customer,
      patientId: id,
    });
  };
  async componentWillMount() {
    // 获取会员信息
    // await this.getCustomerInfo(this.props.id);
    // this.setState({
    //   visible: this.props.visible,
    // });
  }
  async componentWillReceiveProps(nextProps) {
    // console.log('nextProps:', nextProps);
    if (this.props.visible !== nextProps.visible) {
      // 获取会员信息
      await this.getCustomerInfo(nextProps.id);
      this.setState({
        visible: nextProps.visible,
      });
    }
  }
  closeModal = () => {
    this.props.hideCustomerCard();
    this.setState({
      visible: false,
    });
  };

  render() {
    let { customer, visible, patientId } = this.state;
    // ||
    // {
    // birthday: null,
    // ownerCompany: 'bac48d37c3d44577a9db456099af2945',
    // gradeName: '普通会员',
    // address: {
    //   cityName: '南京市',
    //   areaName: '市辖区',
    //   liveStreet: null,
    //   provinceName: '江苏省',
    //   liveProvinces: '320000',
    //   liveArea: '320101',
    //   liveCity: '320100',
    // },
    // idCard: null,
    // sex: null,
    // signStatus: 1,
    // hospitalName: '南京绿A机构',
    // patientType: 1,
    // tags: '',
    // phone: '15801248634',
    // hospitalId: '702cd4655ba24d1f886da24701efb8d6',
    // machineNumber: '',
    // name: '15801248634',
    // id: 'f1c9f62f1dcb4d0984d5ed39c9084b33',
    // isDisabled: 0,
    // memberType: 2,
    // createDate: '2020-08-04 18:31',
    // };
    // console.log('render customer:', customer);
    // 对customer的数据进行处理，避免null的情况

    let labelWidth = 4;
    let spaceWidth = 2;
    let contentWidth = (24 - labelWidth * 2 - spaceWidth) / 2;
    let age = moment().year() - moment(customer.birthday).year() || '';
    age = age ? age + '岁' : age;
    let address = (
      customer.address.provinceName +
      customer.address.cityName +
      customer.address.areaName +
      customer.address.liveStreet +
      ''
    ).replace(/null/g, '');
    return (
      <Modal
        title='会员名片'
        visible={visible}
        onCancel={this.closeModal}
        centered={true}
        maskClosable={false}
        width={800}
        wrapClassName='card'
        footer={[
          <Link to={`/customerDetails/${patientId}/EssentialInfor`}>
            <span className='clickable'>会员详情</span>
          </Link>,
        ]}
      >
        <Row>
          <Col span={labelWidth}>会员名称</Col>
          <Col span={contentWidth} className='cont'>
            {customer.name}
          </Col>
          <Col span={spaceWidth}></Col>
          <Col span={labelWidth}>身份证号</Col>
          <Col span={contentWidth} className='cont'>
            {customer.idCard}
          </Col>
        </Row>
        <Row>
          <Col span={labelWidth}>年龄</Col>
          <Col span={contentWidth} className='cont'>
            {age}
          </Col>
          <Col span={spaceWidth}></Col>
          <Col span={labelWidth}>性别</Col>
          <Col span={contentWidth} className='cont'>
            {customer.sex === 1 ? '男' : '女'}
          </Col>
        </Row>
        <Row>
          <Col span={labelWidth}>手机号码</Col>
          <Col span={contentWidth} className='cont'>
            {customer.phone}
          </Col>
          <Col span={spaceWidth}></Col>
          <Col span={labelWidth}>其他联系方式</Col>
          <Col span={contentWidth} className='cont'>
            {customer.machineNumber}
          </Col>
        </Row>
        <Row>
          <Col span={labelWidth}>现居地址</Col>
          <Col span={24 - labelWidth} className='cont'>
            {address}
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default CustomerCard;
