import React, { Component } from 'react';
import { Input, Button, Row, Col, Modal, DatePicker, Table } from 'antd';
import message from '@wanhu/antd-legacy/lib/message';
import AsyncEvent from '../../common/AsyncEvent';
import { Form, fieldBuilder as field } from '../../common/form';
import { connect } from '../../../states/insurance/groupInsuranceList';
import CuttingLine from '../../common/FormCuttingLine';
import SmartSelectBox from '../../common/SmartSelectBox';
import { connectModalHelper } from '../../../mixins/modal';
import moment from 'moment';
import api from '../../../api/api';

import warning from '../InsuranceOrder/warning-fill.png';
import reeor from '../InsuranceOrder/reeor.png';
// 会员卡片弹窗
import CustomerCart from '../../customerCenter/CustomerCard';

const formDef = Form.def({
  orderNo: field().required('不能为空').maxLength(100),
  duration: field().required('不能为空').initialValue(['1']),
  insuranceType: field().required('不能为空').initialValue(['1']),
  startDate: field().required('不能为空'),
  payObj: field().required('不能为空').initialValue(['1']),
  insuranceType: field().required('不能为空').initialValue(['1']),
  payFrequency: field().required('不能为空').initialValue(['1']),
  payWay: field().required('不能为空').initialValue(['1']),
  insuranceFrequency: field().required('不能为空').initialValue(['1']),
  insurancePlanType: field().required('不能为空').initialValue(['1']),
});

const StatusChoices = [
  {
    value: '0',
    label: '资料待补充',
  },
  {
    value: '1',
    label: '已确认',
  },
  {
    value: '2',
    label: '核保中',
  },
  {
    value: '3',
    label: '已承保',
  },
  {
    value: '4',
    label: '已完成',
  },
  {
    value: '5',
    label: '已出险',
  },
  {
    value: '6',
    label: '已撤单',
  },
  {
    value: '7',
    label: '失效',
  },
];

const formItemStyle = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

class CreateGroupModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      insuranceInfo: null,
      dataSource: [],
      selectedOrderList: [],
      orderList: [],
      endDate: null,
      customerCardVisible: false,
      currentCustomerId: null,
    };
  }

  async componentDidMount() {
    this.insurId = this.props.currentModalParam;
    let orderList;
    if (this.insurId) {
      const insuranceInfo = await api.getGroupInsuranceInfo(this.insurId);
      const { setFieldsValue } = this.form;
      setFieldsValue({
        orderNo: insuranceInfo.orderNo,
      });
      if (insuranceInfo.startDate) {
        setFieldsValue({
          startDate: moment(insuranceInfo.startDate),
        });
      }
      if (insuranceInfo.endDate) {
        this.setState({ endDate: moment(insuranceInfo.endDate) });
      }
      orderList = await api.getGroupInsuranceOrderList(this.insurId);
      this.setState({ orderList, insuranceInfo });
    } else {
      const where = { status: 1, payStatus: 1, sort: 'asc' };
      orderList = await api.getInsuranceOrderList(where);
      //过滤掉-实际年龄超过所选方案年龄
      orderList = orderList.filter((item) => item.overage !== 'over');
      if (!orderList || orderList.length <= 0) {
        Modal.info({
          title: '没有符合条件的投保单。',
          onOk: () => this.onCancel(),
        });
      }
    }
    const countDataSource = this.countDataSource(orderList);
    this.setState({
      loading: false,
      dataSource: [],
      selectedOrderList: orderList,
      countDataSource,
    });
  }

  countDataSource(orderList) {
    const insurancedPatient = {
      code: '主被保险人',
      count: orderList.length,
    };
    let insuredList = [...orderList];
    let countInsuredList = '';
    while (insuredList && insuredList.length > 0) {
      if (!insuredList || insuredList.length <= 0) {
        break;
      }
      const code = insuredList[0].insuredProfessionType;
      const count = [...insuredList].filter(
        (item) => item.insuredProfessionType === code
      );
      countInsuredList +=
        (countInsuredList ? '\n  ' : '  ') +
        (code || '') +
        (count.length || '');
      insuredList = insuredList.filter(
        (item) => item.insuredProfessionType !== code
      );
    }
    const countInsured = {
      code: '被保险人职业类别',
      count: countInsuredList,
    };
    let countDataSource = [];
    while (orderList && orderList.length > 0) {
      if (!orderList || orderList.length <= 0) {
        break;
      }
      const insurancePackageName = orderList[0].insurancePackageName;
      const code = orderList[0].code;
      const count = [...orderList].filter(
        (item) =>
          item.code === code &&
          item.insurancePackageName === insurancePackageName
      );
      countDataSource.push({
        code: `${insurancePackageName || ''}-${code || ''}`,
        count: count.length,
      });
      orderList = orderList.filter(
        (item) =>
          !(
            item.code === code &&
            item.insurancePackageName == insurancePackageName
          )
      );
    }
    countDataSource.push(insurancedPatient);
    countDataSource.push(countInsured);
    return countDataSource;
  }
  hideGroupModal = () => {
    this.props.resetForm();
    this.props.closeModal();
  };

  onCancel = () => {
    this.hideGroupModal();
  };

  submit = () => {
    this.form.validateFields((err, values) => {
      if (err) return;
      const { selectedOrderList } = this.state;
      if (!selectedOrderList || selectedOrderList.length <= 0) {
        message.error('投保清单不能为空');
        return;
      }
      let endDate;
      let startDate;
      if (values.startDate) {
        startDate = values.startDate.format('YYYY-MM-DD');
        endDate = moment(startDate)
          .add(1, 'years')
          .subtract(1, 'days')
          .format('YYYY-MM-DD');
      }
      const subOrderIds = selectedOrderList
        .map((item) => item.orderId)
        .join(',');

      const formData = {
        orderNo: values.orderNo,
        insuranceFrequency: values.insuranceFrequency
          ? values.insuranceFrequency[0]
          : null,
        insurancePlanType: values.insuranceFrequency
          ? values.insurancePlanType[0]
          : null,
        insuranceType: values.insuranceFrequency
          ? values.insuranceType[0]
          : null,
        payFrequency: values.insuranceFrequency ? values.payFrequency[0] : null,
        payObj: values.insuranceFrequency ? values.payObj[0] : null,
        payWay: values.insuranceFrequency ? values.payWay[0] : null,
        startDate,
        endDate,
        subOrderIds,
      };
      if (this.insurId) {
        const delSubOrderIds = '';
        const { orderList } = this.state;
        orderList.map((item) => {
          const isSelected = selectedOrderList.find(
            (i) => i.orderId === item.orderId
          );
          if (!isSelected) {
            delSubOrderIds += delSubOrderIds
              ? `,${item.orderId}`
              : `${item.orderId}`;
          }
        });
        if (delSubOrderIds) {
          formData.delSubOrderIds = delSubOrderIds;
        }
        console.log(
          'delSubOrderIds',
          delSubOrderIds,
          orderList,
          selectedOrderList,
          formData
        );
        this.props.updateGroupInsurance(this.insurId, formData);
      } else {
        this.props.createGroupInsurance(formData);
      }
    });
  };

  finishCreateGroup = () => {
    message.success('用户组创建成功', 3);
    this.hideGroupModal();
  };

  finishGetGroup = (values) => {
    this.form.setFieldsValue(values);
  };

  finishUpdateGroup = () => {
    message.success('保存成功', 3);
    this.hideGroupModal();
  };

  onChange = (date, dateString) => {
    if (dateString) {
      const endDate = moment(dateString).add(1, 'years').subtract(1, 'days');
      this.setState({ endDate });
    } else {
      this.setState({ endDate: null });
    }
  };
  onDelete = (orderId) => {
    let { selectedOrderList } = this.state;
    if (selectedOrderList.length <= 1) {
      message.warn('至少有一个被保险人');
      return;
    }
    selectedOrderList = selectedOrderList.filter(
      (item) => item.orderId !== orderId
    );
    const countDataSource = this.countDataSource(selectedOrderList);
    this.setState({ selectedOrderList, countDataSource });
  };

  renderWithColor = (insurance, value) => {
    const color =
      insurance.overage === 'over'
        ? { color: '#C8161D' }
        : insurance.overage === 'warn'
        ? { color: '#F8BB34' }
        : {};
    return <span style={color}>{value}</span>;
  };
  // 显示会员卡片
  showCustomerCard = (id) => {
    // console.log('showCustomerCard id:', id);
    this.setState({
      customerCardVisible: true,
      currentCustomerId: id,
    });
  };
  hideCustomerCard = () => {
    this.setState({
      customerCardVisible: false,
    });
  };
  render() {
    const { loading, selectedOrderList, endDate, countDataSource } = this.state;
    const title = this.insurId ? '编辑团体投保单' : '新建团体投保单';
    const countColumns = [
      {
        title: '项目',
        dataIndex: 'code',
        key: 'code',
        width: 300,
        render: (value, insurance) => {
          return this.renderWithColor(insurance, value);
        },
      },
      {
        title: '人数（人）',
        dataIndex: 'count',
        key: 'count',
        width: 300,
        render: (value, insurance) => {
          return this.renderWithColor(insurance, value);
        },
      },
    ];
    const columns = [
      {
        title: '订单编号',
        dataIndex: 'orderNo',
        key: 'orderNo',
        render: (value, insurance) => {
          return this.renderWithColor(insurance, value);
        },
      },
      {
        title: '会员服务包',
        dataIndex: 'insurancePackageName',
        key: 'insurancePackageName',
        render: (value, insurance) => {
          return this.renderWithColor(insurance, value);
        },
      },
      {
        title: '投保方案编码',
        dataIndex: 'code',
        key: 'code',
        render: (value, insurance) => {
          return this.renderWithColor(insurance, value);
        },
      },
      {
        title: '被保险人姓名',
        dataIndex: 'insuredName',
        key: 'insuredName',
        render: (value, insurance) => {
          return (
            <span
              style={{ textDecoration: 'underline', cursor: 'pointer' }}
              onClick={() => {
                this.showCustomerCard(insurance.insuredId);
              }}
            >
              {this.renderWithColor(insurance, value)}
            </span>
          );
        },
      },
      {
        title: '被保险人身份证号',
        dataIndex: 'insuredIdCard',
        key: 'insuredIdCard',
        render: (value, insurance) => {
          return this.renderWithColor(insurance, value);
        },
      },
      {
        title: '被保险人生日',
        dataIndex: 'insuredBirthday',
        key: 'insuredBirthday',
        render: (value, insurance) => {
          return this.renderWithColor(insurance, value);
        },
      },
      {
        title: '年龄',
        dataIndex: 'age',
        key: 'age',
        render: (age, insurance) => {
          const today = moment();
          const birth = moment(insurance.insuredBirthday);
          const diff = today.diff(birth, 'years');
          return this.renderWithColor(insurance, diff);
        },
      },
      {
        title: '下单时间',
        dataIndex: 'orderDate',
        key: 'orderDate',
        render: (value, insurance) => {
          return this.renderWithColor(insurance, value);
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (status, insurance) => {
          if (status === null || status === undefined) return '';
          const found = StatusChoices.find((t) => t.value === `${status}`);
          if (found) {
            return this.renderWithColor(insurance, found.label);
          }
          return this.renderWithColor(insurance, '未知状态');
        },
      },
      {
        title: '操作',
        dataIndex: 'delete',
        key: 'delete',
        render: (value, row, index) => {
          const obj = {
            children: (
              <div>
                {this.insurId ? null : (
                  <span style={{ textDecoration: 'underline' }}>
                    <a onClick={() => this.onDelete(row.orderId)}>
                      {this.renderWithColor(row, '删除')}
                    </a>
                  </span>
                )}
              </div>
            ),
          };
          return obj;
        },
      },
    ];
    return (
      <div>
        <CustomerCart
          id={this.state.currentCustomerId}
          visible={this.state.customerCardVisible}
          hideCustomerCard={this.hideCustomerCard}
        ></CustomerCart>
        <Modal
          title={title}
          visible={true}
          width={1200}
          maskClosable={false}
          onCancel={this.hideGroupModal}
          footer={
            <Row>
              <Button onClick={this.submit} type='primary'>
                提交
              </Button>
              <Button onClick={this.hideGroupModal} className='cancelButton'>
                取消
              </Button>
            </Row>
          }
        >
          <Form
            def={formDef}
            data={this.props.formData}
            onFieldsChange={this.props.updateFormField}
            formRef={(form) => (this.form = form)}
          >
            <Row style={{ paddingBottom: 15 }}>
              <CuttingLine text='基本信息' />
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item
                  field='orderNo'
                  label='投保单流水号'
                  {...formItemStyle}
                >
                  <Input maxLength={100} />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item field='duration' label='保险期限' {...formItemStyle}>
                  <SmartSelectBox
                    editStatus
                    notEditableOnly={false}
                    onChange={(e) => this.memberTypeChange(e)}
                    buttonOptions={[{ id: '1', name: '一年' }]}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div style={{ display: '-webkit-box' }}>
                  <Form.Item
                    field='startDate'
                    label='服务期间'
                    {...formItemStyle}
                  >
                    <DatePicker
                      onChange={this.onChange}
                      placeholder='开始日期'
                    />
                  </Form.Item>
                  ～
                  <DatePicker placeholder='结束日期' disabled value={endDate} />
                </div>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item field='payObj' label='缴费主体' {...formItemStyle}>
                  <SmartSelectBox
                    editStatus
                    notEditableOnly={false}
                    onChange={(e) => this.memberTypeChange(e)}
                    buttonOptions={[{ id: '1', name: '投保人全额承担' }]}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  field='insuranceType'
                  label='投保单位医疗保障形式'
                  {...formItemStyle}
                >
                  <SmartSelectBox
                    editStatus
                    notEditableOnly={false}
                    onChange={(e) => this.memberTypeChange(e)}
                    buttonOptions={[{ id: '1', name: '城镇职工' }]}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item
                  field='payFrequency'
                  label='缴费频次'
                  {...formItemStyle}
                >
                  <SmartSelectBox
                    editStatus
                    notEditableOnly={false}
                    onChange={(e) => this.memberTypeChange(e)}
                    buttonOptions={[{ id: '1', name: '月缴' }]}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item field='payWay' label='缴费方式' {...formItemStyle}>
                  <SmartSelectBox
                    editStatus
                    notEditableOnly={false}
                    onChange={(e) => this.memberTypeChange(e)}
                    buttonOptions={[{ id: '1', name: '转账或支票' }]}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item
                  field='insuranceFrequency'
                  label='保全计算频次'
                  {...formItemStyle}
                >
                  <SmartSelectBox
                    editStatus
                    notEditableOnly={false}
                    onChange={(e) => this.memberTypeChange(e)}
                    buttonOptions={[{ id: '1', name: '即时' }]}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  field='insurancePlanType'
                  label='保障计划区分标准'
                  {...formItemStyle}
                >
                  <SmartSelectBox
                    editStatus
                    notEditableOnly={false}
                    onChange={(e) => this.memberTypeChange(e)}
                    buttonOptions={[{ id: '1', name: '其他' }]}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ paddingBottom: 15 }}>
              <CuttingLine text='服务对象信息' />
            </Row>
            <Row style={{ paddingBottom: '10px' }}>
              <Col span={24}>
                <label className='ant-form-item-required' title='投保清单'>
                  投保清单
                </label>
              </Col>
            </Row>
            <div className='table-box tableBox'>
              <Table
                loading={loading}
                dataSource={selectedOrderList}
                rowKey={(record) => record.id}
                columns={columns}
                pagination={false}
                bordered={false}
              />
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginRight: 10,
                }}
              >
                <img src={reeor} style={{ width: 28 }} />
                <span className='clickable' style={{ color: '#C8161D' }}>
                  实际年龄超出方案年龄
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src={warning} style={{ width: 28 }} />
                <span className='clickable' style={{ color: '#F8BB34' }}>
                  实际年龄将在一周内超出方案年龄
                </span>
              </div>
            </div>
            <Row style={{ paddingTop: '20px', paddingBottom: '10px' }}>
              <Col span={24}>
                <label className='ant-form-item-required' title='统计数据'>
                  统计数据
                </label>
              </Col>
            </Row>
            <div className='table-box tableBox' style={{ width: '50%' }}>
              <Table
                loading={loading}
                dataSource={countDataSource}
                rowKey={(record) => record.id}
                columns={countColumns}
                pagination={false}
                bordered={false}
              />
            </div>
          </Form>
        </Modal>
        <AsyncEvent
          async={this.props.createStatus}
          onFulfill={this.finishUpdateGroup}
          alertError
        />
        <AsyncEvent
          async={this.props.updateStatus}
          onFulfill={this.finishUpdateGroup}
          alertError
        />
      </div>
    );
  }
}

export default connectModalHelper(connect(CreateGroupModal));
