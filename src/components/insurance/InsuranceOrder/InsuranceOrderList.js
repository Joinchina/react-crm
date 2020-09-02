import React, { Component } from 'react';
import { Row, Col, Input, Select, Button, Modal, Checkbox } from 'antd';
import message from '@wanhu/antd-legacy/lib/message';
import { Form } from '../../common/form';
import { TablePage } from '../../common/table-page';
import { connect as connectState } from '../../../states/insurance/insuranceOrderList';
import AsyncEvent from '../../common/AsyncEvent';
import { connectRouter } from '../../../mixins/router';
const TableColumn = TablePage.Column;
import { DateRangePicker } from '../../common/DateRangePicker';
import history from '../../../history';
import HasPermission, { testPermission } from '../../common/HasPermission';
import moment from 'moment';
import warning from './warning-fill.png';
import reeor from './reeor.png';
import './index.css';
import api from '../../../api/api';
import { debounce, cloneDeep } from 'lodash';
// 会员卡片弹窗
import CustomerCart from '../../customerCenter/CustomerCard';
const QueryKeyChoices = [
  {
    value: '1',
    label: '服务对象',
  },
  {
    value: '5',
    label: '购买人',
  },
  {
    value: '2',
    label: '对象身份证号',
  },
  {
    value: '4',
    label: '销售渠道码',
  },
  {
    value: '3',
    label: '会员服务单',
  },
];

const isPayStatusChoices = [
  { value: '0', label: '待支付' },
  { value: '1', label: '已支付' },
  { value: '2', label: '支付失败' },
];

const payType = [
  { value: '1', label: '年缴' },
  { value: '2', label: '月缴' },
];
const orderTypes = [
  { value: '0', label: '待确认' },
  { value: '1', label: '已确认' },
  { value: '2', label: '核保中' },
  { value: '3', label: '已承保' },
  { value: '4', label: '已完成' },
  { value: '5', label: '已出险' },
  { value: '6', label: '已撤单' },
  { value: '7', label: '失效' },
];

const mapChoiceToOption = (choice, i) => (
  <Select.Option key={i} value={choice.value}>
    {choice.label}
  </Select.Option>
);

const tableDef = TablePage.def({
  type: {
    parse: (val) => val || '1',
    stringify: (val) => (val === '1' ? undefined : val),
  },
  search: {},
  packageId: {},
  payWay: {},
  startTime: {
    parse: (val) =>
      val
        ? val.split(',').map((s) => {
            if (!s) return undefined;
            const m = moment(s);
            return m.isValid() ? m : undefined;
          })
        : undefined,
    stringify: (val) =>
      val
        ? val
            .map((d) => (d && moment.isMoment(d) ? d.format('YYYY-MM-DD') : ''))
            .join(',')
        : undefined,
  },
  payStatus: {},
  status: {},
});

class InsuranceOrder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      insurId: null,
      confirmDate: null,
      confirmDateExplain: null,
      canshow: false,
      packageId: undefined,
      customerCardVisible: false,
      currentCustomerId: null,
    };
  }
  componentWillReceiveProps(props) {
    if (this.props.router.modal === 'insuranceOrder' && !props.router.modal) {
      this.table.reload();
    }
  }
  async componentDidMount() {
    const list = await api.getInsuracePackage();
    this.setState({
      insurancePackage: [...list],
      insurancePackage2: cloneDeep(list),
    });
  }
  componentWillUnmount() {
    this.props.resetInsurancesOrderList();
  }

  loadData = ({ values, pageIndex, pageSize }) => {
    const where = {};
    if (values.startTime && values.startTime.length > 0) {
      if (values.startTime[0]) {
        where.startDate = values.startTime[0].format('YYYY-MM-DD');
      }
      if (values.startTime[1]) {
        where.endDate = values.startTime[1].format('YYYY-MM-DD');
      }
    }
    where.type = values.type;
    let search = values.search;
    console.log( typeof search)
    where.search = search?search.replace(/\s*/g,""):null
    where.packageId = values.packageId;
    where.status = values.status;
    where.payWay = values.payWay;
    where.payStatus = values.payStatus;
    this.props.searchInsurancesOrderList(where, pageIndex, pageSize);
  };

  resetData = () => {
    this.props.resetInsurancesOrderList();
  };

  openNewOrderInsuranceModal = () => {
    this.props.router.openModal('newPatientInsurance');
  };

  showDetail = (insurance) => {
    history.push(
      `/patientInsuranceDetail/${insurance.orderId}?r=${encodeURIComponent(
        this.props.router.fullPath
      )}`
    );
  };

  updateInsurance = (insurance) => {
    this.props.router.openModal('newPatientInsurance', insurance.insurId);
  };

  openConfirmModal = (insurance) => {
    this.setState({ visible: true, insurId: insurance.insurId });
  };

  cancelInsurance = (insurance) => {
    Modal.confirm({
      title: `该操作不可撤销，且被作废的投保单号不可再用。确认作废吗？`,
      onOk: () => {
        this.props.cancelGroupInsurance(insurance.insurId);
      },
      onCancel() {},
    });
  };

  insuranceConfirmation = () => {
    const { insurId, confirmDate } = this.state;
    if (!confirmDate) {
      this.setState({ confirmDateExplain: '不能为空' });
    } else {
      this.props.confirmGroupInsurance(insurId, confirmDate);
      this.setState({
        visible: false,
        confirmDate: null,
        insurId: null,
        confirmDateExplain: '',
      });
    }
  };

  finishConfirmStatus = () => {
    message.success('承保确认成功', 3);
    this.table.reload({ scrollToTop: false });
  };
  finishCancelStatus = () => {
    message.success('投保单已作废', 3);
    this.table.reload({ scrollToTop: false });
  };

  onCheckChange(e) {
    this.setState({
      ischeck: e.target.checked,
    });
  }

  judgeTime(time) {
    var strtime = time.replace('/-/g', '/'); //时间转换
    //时间
    var date1 = new Date(strtime);
    //现在时间
    var date2 = new Date();
    //判断时间是否过期
    return date1 < date2 ? true : false;
  }

  renderModal() {
    const { canshow, selectOrder, ischeck } = this.state;
    const nowdata = this.props.getInsuranceRevokeOrderInfo;
    let ast = null;
    if (nowdata.status == 'fulfilled') {
      ast = nowdata.payload;
    }
    const isover = ast && ast.deadline ? this.judgeTime(ast.deadline) : false;
    const renderText = () => {
      if (ast) {
        if (!ast.payStatus) {
          return <Col>该订单尚未支付，确认撤单？</Col>;
        }
        if (ast.orderStatus == 0 || ischeck) {
          // 待确认
          return (
            <Col>
              该订单可<span style={{ color: '#1da57a' }}>全额退款</span>
              ，具体退款明细如下：
            </Col>
          );
        } else if (ast.orderStatus != 0 && ast.isUse) {
          // 其他状态 判断是否在使用 - 在使用
          return (
            <Col>
              该订单已使用以下服务，正常情况
              <span style={{ color: 'red' }}>不可退款</span>
            </Col>
          );
        } else if (ast.orderStatus != 0 && !ast.isUse) {
          // 不在使用中
          if (isover) {
            return (
              <Col>
                该订单已过犹豫期（{ast.deadline}），正常情况
                <span style={{ color: 'red' }}>不可退款</span>
              </Col>
            );
          } else {
            return (
              <Col>
                该订单可<span style={{ color: '#1da57a' }}>全额退款</span>
                ，具体退款明细如下：
              </Col>
            );
          }
        }
      }
    };
    return (
      <Modal
        title='撤单确认'
        visible={canshow}
        width={500}
        maskClosable={false}
        onCancel={this.hideModal.bind(this)}
        style={{ backgroundColor: '#f8f8f8' }}
        footer={
          <Row>
            <Button
              onClick={this.submit.bind(this)}
              type='primary'
              disabled={
                (ast && ast.isUse && !this.state.ischeck && ast.payStatus) ||
                (ast &&
                  !ast.isUse &&
                  isover &&
                  !this.state.ischeck &&
                  ast.payStatus)
                  ? true
                  : false
              }
              loading={false}
            >
              确认撤单
            </Button>
            <Button
              onClick={this.hideModal.bind(this)}
              className='cancelButton'
            >
              取消
            </Button>
          </Row>
        }
      >
        <Row style={{ marginBottom: 15 }}>{renderText()}</Row>
        {ast && ast.payStatus
          ? ast.orderStatus == 0 &&
            ast.payments &&
            ast.payments.length &&
            ast.payments.map((i, index) => {
              return (
                <Row key={index}>
                  <Col span={10}>{`${i.paymentTypeName}`}</Col>
                  <Col span={6}>
                    {`${i.amount}`}
                    {i.paymentName == 'self_pbm_points_deduction'
                      ? '积分'
                      : '元'}
                    {ast.orderStatus != 0 && !ast.isUse && isover
                      ? `(扣${i.deductAmount}${
                          i.paymentName == 'self_pbm_points_deduction'
                            ? '分'
                            : '元'
                        })`
                      : ''}
                  </Col>
                </Row>
              );
            })
          : null}
        {ast && ast.payStatus
          ? ast.orderStatus != 0 &&
            ast.isUse &&
            !ischeck &&
            ast.products &&
            ast.products.length &&
            ast.products.map((i, index) => {
              return (
                <Row key={index}>
                  <Col span={8}>{`${i.productName}`}</Col>
                  {i.usageCounter === null ? null : (
                    <Col span={6}>{`${i.usageCounter}次`}</Col>
                  )}
                </Row>
              );
            })
          : null}
        {ast && ast.payStatus
          ? ast.orderStatus != 0 &&
            ast.isUse &&
            ischeck &&
            ast.payments &&
            ast.payments.length &&
            ast.payments.map((i, index) => {
              return (
                <Row key={index}>
                  <Col span={10}>{`${i.paymentTypeName}`}</Col>
                  <Col span={6}>
                    {`${i.amount}`}
                    {i.paymentName == 'self_pbm_points_deduction'
                      ? '积分'
                      : '元'}
                    {ast.orderStatus != 0 && !ast.isUse && isover
                      ? `(扣${i.deductAmount}${
                          i.paymentName == 'self_pbm_points_deduction'
                            ? '分'
                            : '元'
                        })`
                      : ''}
                  </Col>
                </Row>
              );
            })
          : null}
        {ast && ast.payStatus
          ? ast.orderStatus !== 0 &&
            isover &&
            !ast.isUse &&
            ischeck &&
            ast.payments &&
            ast.payments.length &&
            ast.payments.map((i, index) => {
              return (
                <Row key={index}>
                  <Col span={10}>{`${i.paymentTypeName}`}</Col>
                  <Col span={6}>
                    {`${i.amount}`}
                    {i.paymentName == 'self_pbm_points_deduction'
                      ? '积分'
                      : '元'}
                    {ast.orderStatus != 0 && !ast.isUse && isover
                      ? `(扣${i.deductAmount}${
                          i.paymentName == 'self_pbm_points_deduction'
                            ? '分'
                            : '元'
                        })`
                      : ''}
                  </Col>
                </Row>
              );
            })
          : null}
        {ast && ast.payStatus
          ? ast.orderStatus !== 0 &&
            !isover &&
            !ast.isUse &&
            ast.payments &&
            ast.payments.length &&
            ast.payments.map((i, index) => {
              return (
                <Row key={index}>
                  <Col span={10}>{`${i.paymentTypeName}`}</Col>
                  <Col span={6}>
                    {`${i.amount}`}
                    {i.paymentName == 'self_pbm_points_deduction'
                      ? '积分'
                      : '元'}
                    {ast.orderStatus != 0 && !ast.isUse && isover
                      ? `(扣${i.deductAmount}${
                          i.paymentName == 'self_pbm_points_deduction'
                            ? '分'
                            : '元'
                        })`
                      : ''}
                  </Col>
                </Row>
              );
            })
          : null}
        {ast && ast.payStatus ? (
          ast.orderStatus != 0 && ast.isUse ? (
            <Checkbox
              style={{ display: 'flex', alignItems: 'center', marginTop: 15 }}
              onChange={(e) => this.onCheckChange(e)}
            >
              会员出现重大疾病症状，申请全额退款
            </Checkbox>
          ) : null
        ) : null}
        {ast && ast.payStatus ? (
          ast.orderStatus != 0 && !ast.isUse && isover ? (
            <Checkbox
              style={{ display: 'flex', alignItems: 'center', marginTop: 15 }}
              onChange={(e) => this.onCheckChange(e)}
            >
              会员出现重大疾病症状，申请全额退款
            </Checkbox>
          ) : null
        ) : null}
      </Modal>
    );
  }

  revocationOrder(data) {
    this.props.getInsuranceRevokeOrderList(data.orderId);
    this.setState({
      canshow: true,
      selectOrder: data,
    });
  }

  submit() {
    this.props.subRevokeOrderRes({
      orderId: this.state.selectOrder.orderId,
      ischeck: this.state.ischeck,
    });
    this.setState({
      canshow: false,
      ischeck: false,
    });
    setTimeout(() => {
      this.table.reload();
    }, 300);
  }

  checkOrder(item) {
    history.push(
      `/patientRevokeOrderDetail/${item.orderId}?r=${encodeURIComponent(
        this.props.router.fullPath
      )}`
    );
    this.setState({
      canshow: false,
    });
  }

  hideModal() {
    this.setState({
      canshow: false,
      ischeck: false,
    });
  }

  checkPayOrder(data) {
    Modal.confirm({
      title: `请确认该订单已有线下现金支付完成，现金支付金额：${data.amount}元？`,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        this.props.cancelGroupInsurance(data.insurId);
      },
      onCancel() {},
    });
  }
  //搜索时
  handleBtnSearch = (value) => {
    //深拷贝一组数据
    let list = cloneDeep(this.state.insurancePackage2);
    let filterArr = [];
    //判断时数组还是字符
    if (value.substring(0, 2) === 'IP') {
      filterArr = list.filter((item) => item.packageCode === value);
    } else {
      filterArr = list.filter(
        (item) => item.insurancePackageName.indexOf(value) >= 0
      );
    }
    // if(isNaN(Number(value))){
    //     //非数字匹配名字
    //     filterArr=list.filter(item=>(item.insurancePackageName).indexOf(value)>=0)
    // }else{
    //     //数字精确匹配
    //     filterArr=list.filter(item=>item.packageCode.toString()===value)
    // }
    this.setState({
      insurancePackage: filterArr,
    });
    if (!value) {
      console.log('woshi ', this.state.insurancePackage);
      this.setState({
        insurancePackage: this.state.insurancePackage2,
      });
    }
  };
  //改变时
  handleBtnChange = (value) => {
    console.log(value);
    // const name=this.state.insurancePackage2.filter(item=>item.packageId===value)
    // this.setState({
    //     packageId:name.insurancePackageName
    // })
    // const { setFieldsValue } = this.props.form
    // setFieldsValue({'packageId':value})
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
    const {
      visible,
      confirmDateExplain,
      confirmDate,
      packageId,
      insurancePackage,
    } = this.state;
    const options =
      insurancePackage &&
      insurancePackage.map((item, index) => {
        return (
          <Option key={item.packageId}>
            {item.insurancePackageName}({item.packageCode})
          </Option>
        );
      });
    return (
      <div className='insurance_orderList'>
        <CustomerCart
          id={this.state.currentCustomerId}
          visible={this.state.customerCardVisible}
          hideCustomerCard={this.hideCustomerCard}
        ></CustomerCart>
        <TablePage
          def={tableDef}
          data={this.props.insurancesOrderList}
          autoLoad={false}
          onLoadData={this.loadData}
          onResetData={this.resetData}
          tableRef={(table) => (this.table = table)}
          rowKey='insurId'
          renderFormFields={(values, loadData) => {
            let searchProps;
            switch (values.type) {
              case '1':
                searchProps = { placeholder: '请输入服务对象' };
                break;
              case '3':
                searchProps = { placeholder: '请输入会员服务单' };
                break;
              case '2':
                searchProps = { placeholder: '请输入对象身份证号' };
                break;
              case '4':
                searchProps = { placeholder: '请输入销售渠道码' };
                break;
              case '5':
                searchProps = { placeholder: '请输入购买人' };
                break;
              default:
                searchProps = { disabled: true };
                break;
            }
            return (
              <Row gutter={10} className='block filter-box'>
                <Col span={3} key='1'>
                  <Form.Item field='type' height='auto'>
                    <Select>{QueryKeyChoices.map(mapChoiceToOption)}</Select>
                  </Form.Item>
                </Col>
                <Col span={3} key='2'>
                  <Form.Item field='search' height='auto'>
                    <Input {...searchProps} onPressEnter={loadData} />
                  </Form.Item>
                </Col>
                <Col span={3}>
                  <Form.Item field='packageId' height='auto'>
                    <Select
                      showSearch
                      placeholder='请输入服务包名称'
                      defaultActiveFirstOption={false}
                      showArrow={false}
                      filterOption={false}
                      onSearch={debounce(this.handleBtnSearch, 500)}
                      onChange={this.handleBtnChange}
                      notFoundContent={null}
                      allowClear
                    >
                      {options}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={3}>
                  <Form.Item field='status' height='auto'>
                    <Select placeholder='请选择订单状态' allowClear>
                      {orderTypes.map(mapChoiceToOption)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={3}>
                  <Form.Item field='payStatus' height='auto'>
                    <Select placeholder='请选择支付状态' allowClear>
                      {isPayStatusChoices.map(mapChoiceToOption)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item field='startTime' height='auto'>
                    <DateRangePicker
                      size='default'
                      placeholder='请选择登记时间'
                    />
                  </Form.Item>
                </Col>
                <Col span={2}>
                  <Button
                    onClick={loadData}
                    style={{ width: '100%', minWidth: 0 }}
                    type='primary'
                  >
                    查询
                  </Button>
                </Col>
                <Col span={2}>
                  <HasPermission match='insurance.edit'>
                    <Button
                      onClick={this.openNewOrderInsuranceModal}
                      style={{ width: '100%', minWidth: 0 }}
                      type='primary'
                    >
                      新建
                    </Button>
                  </HasPermission>
                </Col>
              </Row>
            );
          }}
          renderFooter={(values) => {
            return this.props.insurancesOrderList &&
              this.props.insurancesOrderList.list &&
              this.props.insurancesOrderList.list.length ? (
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
            ) : null;
          }}
        >
          <TableColumn
            title='会员服务单号'
            className='singleline max-w-200'
            dataIndex='orderNo'
            key='orderNo'
            onCellClick={this.showDetail}
            render={(text, insurance) =>
              insurance.overage === 'warn' ? (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img src={warning} style={{ width: 28 }} />
                  <span className='clickable' style={{ color: '#F8BB34' }}>
                    {text}
                  </span>
                </div>
              ) : insurance.overage === 'over' ? (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img src={reeor} style={{ width: 28 }} />
                  <span className='clickable' style={{ color: '#C8161D' }}>
                    {text}
                  </span>
                </div>
              ) : (
                <span className='clickable'>{text}</span>
              )
            }
          />
          <TableColumn
            title='服务对象'
            className='singleline'
            dataIndex='insuredName'
            key='insuredName'
            render={(text, insurance) => (
              <span
                style={{ textDecoration: 'underline', cursor: 'pointer' }}
                onClick={() => {
                  this.showCustomerCard(insurance.insuredId);
                }}
              >
                {insurance.overage === 'warn' ? (
                  <span style={{ color: '#F8BB34' }}>{text}</span>
                ) : insurance.overage === 'over' ? (
                  <span style={{ color: '#C8161D' }}>{text}</span>
                ) : (
                  text
                )}
              </span>
            )}
          />
          <TableColumn
            title='对象身份证号'
            dataIndex='insuredIdCard'
            key='insuredIdCard'
            render={(text, insurance) =>
              insurance.overage === 'warn' ? (
                <span style={{ color: '#F8BB34' }}>{text}</span>
              ) : insurance.overage === 'over' ? (
                <span style={{ color: '#C8161D' }}>{text}</span>
              ) : (
                text
              )
            }
          />
          <TableColumn
            title='手机号'
            className='singleline'
            dataIndex='insuredPhone'
            key='insuredPhone'
            render={(text, insurance) =>
              insurance.overage === 'warn' ? (
                <span style={{ color: '#F8BB34' }}>{text}</span>
              ) : insurance.overage === 'over' ? (
                <span style={{ color: '#C8161D' }}>{text}</span>
              ) : (
                text
              )
            }
          />
          <TableColumn
            title='会员服务包'
            className='singleline'
            dataIndex='insurancePackageName'
            key='insurancePackageName'
            render={(text, insurance) =>
              insurance.overage === 'warn' ? (
                <span style={{ color: '#F8BB34' }}>{text}</span>
              ) : insurance.overage === 'over' ? (
                <span style={{ color: '#C8161D' }}>{text}</span>
              ) : (
                text
              )
            }
          />
          <TableColumn
            title='服务档次'
            className='singleline'
            dataIndex='insurancePackageGradeName'
            key='insurancePackageGradeName'
            render={(text, insurance) =>
              insurance.overage === 'warn' ? (
                <span style={{ color: '#F8BB34' }}>{text}</span>
              ) : insurance.overage === 'over' ? (
                <span style={{ color: '#C8161D' }}>{text}</span>
              ) : (
                text
              )
            }
          />
          <TableColumn
            title='订单状态'
            className='singleline'
            dataIndex='status'
            key='status'
            render={(status, insurance) => {
              if (status === null || status === undefined) return '';
              const found = orderTypes.find((t) => t.value == `${status}`);
              if (found) {
                return (
                  <span
                    style={{
                      color:
                        insurance.overage === 'warn'
                          ? '#F8BB34'
                          : insurance.overage === 'over'
                          ? '#C8161D'
                          : '',
                    }}
                  >
                    {found.label}
                  </span>
                );
              }
              return (
                <span
                  style={{
                    color:
                      insurance.overage === 'warn'
                        ? '#F8BB34'
                        : insurance.overage === 'over'
                        ? '#C8161D'
                        : '',
                  }}
                >
                  未知状态
                </span>
              );
            }}
          />
          <TableColumn
            title='缴费方式'
            className='singleline'
            dataIndex='payWay'
            key='payWay'
            render={(status, insurance) => {
              if (status === null || status === undefined) return '';
              const found = payType.find((t) => t.value == `${status}`);
              if (found) {
                return (
                  <span
                    style={{
                      color:
                        insurance.overage === 'warn'
                          ? '#F8BB34'
                          : insurance.overage === 'over'
                          ? '#C8161D'
                          : '',
                    }}
                  >
                    {found.label}
                  </span>
                );
              }
              return (
                <span
                  style={{
                    color:
                      insurance.overage === 'warn'
                        ? '#F8BB34'
                        : insurance.overage === 'over'
                        ? '#C8161D'
                        : '',
                  }}
                >
                  未知方式
                </span>
              );
            }}
          />
          <TableColumn
            title='支付状态'
            className='singleline'
            dataIndex='payStatus'
            key='payStatus'
            render={(payStatus, insurance) => {
              if (payStatus === null || payStatus === undefined) return '';
              const found = isPayStatusChoices.find(
                (t) => t.value == `${payStatus}`
              );
              if (found) {
                return (
                  <span
                    style={{
                      color:
                        insurance.overage === 'warn'
                          ? '#F8BB34'
                          : insurance.overage === 'over'
                          ? '#C8161D'
                          : '',
                    }}
                  >
                    {found.label}
                    {insurance.payWay == 2 ? insurance.period : ''}
                  </span>
                );
              }
              return (
                <span
                  style={{
                    color:
                      insurance.overage === 'warn'
                        ? '#F8BB34'
                        : insurance.overage === 'over'
                        ? '#C8161D'
                        : '',
                  }}
                >
                  未知状态
                </span>
              );
            }}
          />
          <TableColumn
            title='购买人'
            className='singleline'
            dataIndex='insurerName'
          />
          <TableColumn
            title='销售渠道'
            className='singleline'
            dataIndex='channelCode'
          />
          <TableColumn
            title='登记时间'
            className='singleline'
            dataIndex='orderDate'
            key='orderDate'
            render={(text, insurance) =>
              insurance.overage === 'warn' ? (
                <span style={{ color: '#F8BB34' }}>{text}</span>
              ) : insurance.overage === 'over' ? (
                <span style={{ color: '#C8161D' }}>{text}</span>
              ) : (
                text
              )
            }
          />
          {testPermission('crm.task_pool.admin') ? (
            <TableColumn
              title='操作'
              className='singleline'
              dataIndex='status'
              key='op'
              renderTip={() => null}
              render={(status, pool) => {
                let toggleBtn;
                {
                  /* if(pool && pool.payStatus == 0){
                                        toggleBtn = <span>
                                            <span className="clickable" onClick={() => this.checkPayOrder(pool)}>确认支付</span>
                                        </span>
                                    }else */
                }
                if (
                  testPermission('insurance.revoke') &&
                  (status == 1 || status == 2 || status == 0 || status == 3)
                ) {
                  toggleBtn = (
                    <span>
                      <span
                        className='clickable'
                        onClick={() => this.revocationOrder(pool)}
                      >
                        撤单
                      </span>
                    </span>
                  );
                } else if (status == 6) {
                  toggleBtn = (
                    <span>
                      <span
                        className='clickable'
                        onClick={() => this.checkOrder(pool)}
                      >
                        查看退款单
                      </span>
                    </span>
                  );
                }
                return toggleBtn;
              }}
            />
          ) : null}
        </TablePage>
        {this.renderModal()}
      </div>
    );
  }
}

export default connectRouter(connectState(InsuranceOrder));
