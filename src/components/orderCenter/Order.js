import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  Row,
  Col,
  Input,
  Select,
  DatePicker,
  Button,
  Avatar,
  Modal,
  Icon,
} from 'antd';
import message from '@wanhu/antd-legacy/lib/message';
import { connect as connectOrderList } from '../../states/orderCenter/order';
import AlertError from '../common/AlertError';
import moment from 'moment';
import { TablePage } from '../common/table-page';
import DateRangePicker from '../common/DateRangePicker';
import { Form } from '../common/form';
import { connectModalHelper } from '../../mixins/modal';
import { connectRouter } from '../../mixins/router';
import SelectSingleHospital from '../common/SelectSingleHospital';
import HasPermission, { testPermission } from '../common/HasPermission';
import { CreateOrderLink } from '../common/CreateOrderLink';
import Viewer from '../toolcase/Viewer';
import Removable from '../common/Removable';
const TableColumn = TablePage.Column;
import AsyncEvent from '../common/AsyncEvent';
// 会员卡片弹窗
import CustomerCart from '../customerCenter/CustomerCard';

const QueryKeyChoices = [
  {
    value: 'orderNo',
    label: '用药订单编号',
  },
  {
    value: 'patientName',
    label: '会员',
  },
  {
    value: 'idCard',
    label: '身份证号',
  },
  {
    value: 'doctorName',
    label: '医生',
  },
  {
    value: 'createBy',
    label: '创建人',
  },
];

const StatusChoices = [
  { value: '10', label: '初始订单' },
  { value: '20', label: '患者已确认' },
  { value: '30', label: '医生已确认' },
  { value: '35', label: '药师已确认' },
  { value: '40', label: '备药中' },
  { value: '45', label: '配送中' },
  { value: '50', label: '待取药' },
  { value: '60', label: '已取药' },
  { value: '70', label: '正在使用' },
  { value: '97', label: '已驳回' },
  { value: '98', label: '撤单' },
  { value: '99', label: '完成' },
];
const prescriptionStatusChoices = [
  { value: '10', label: '无处方' },
  { value: '20', label: '待接诊' },
  { value: '30', label: '开具中' },
  { value: '40', label: '申请失败' },
  { value: '50', label: '被拒开' },
  { value: '60', label: '有处方' },
];

const isPayStatusChoices = [
  { value: '1', label: '已支付' },
  { value: '0', label: '未支付' },
];

const StatusMap = {};
StatusChoices.forEach((item) => (StatusMap[item.value] = item.label));

const prescriptionStatusMap = {};
prescriptionStatusChoices.forEach(
  (item) => (prescriptionStatusMap[item.value] = item.label)
);

const isPayStatusMap = {};
isPayStatusChoices.forEach((item) => (isPayStatusMap[item.value] = item.label));

const mapChoiceToOption = (choice, i) => (
  <Select.Option key={i} value={choice.value} title={choice.label}>
    {choice.label}
  </Select.Option>
);

const dateRangeField = {
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
};

const tableDef = TablePage.def({
  queryKey: {
    parse: (val) => val || 'orderNo',
    stringify: (val) => (val === 'orderNo' ? undefined : val),
  },
  queryText: {},
  status: {},
  hospitalId: {
    parse: (val) => (val ? { id: val } : undefined),
    stringify: (val) => (val ? val.id : undefined),
  },
  createDate: dateRangeField,
  createBy: {},
  prescriptionStatus: {},
  isPay: {},
});

class OrderCenter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      customerCardVisible: false,
      currentCustomerId: null,
    };
  }

  loadData = ({ values, pageIndex, pageSize }) => {
    const where = {};
    if (values.createBy) {
      const id = values.createBy.substr(0, values.createBy.indexOf(','));
      where.createById = id;
    }
    if (values.queryKey && values.queryText) {
      if (values.queryKey === 'orderNo' || values.queryKey === 'idCard') {
        where[values.queryKey] = values.queryText;
      } else {
        where[values.queryKey] = { $like: `%${values.queryText}%` };
      }
    }
    if (values.prescriptionStatus) {
      where.prescriptionStatus = values.prescriptionStatus;
    }
    where.status = values.status;
    where.hospitalId = values.hospitalId && values.hospitalId.id;
    if (values.createDate && values.createDate.length > 0) {
      where.createDate = {};
      if (values.createDate[0]) {
        where.createDate.$gte = values.createDate[0].format('YYYY-MM-DD');
      }
      if (values.createDate[1]) {
        where.createDate.$lte = values.createDate[1].format('YYYY-MM-DD');
      }
    }
    if (values.isPay === '1' || values.isPay === '0') {
      where.isPay = values.isPay === '1' ? 1 : 0;
    }
    this.props.searchOrder(where, pageIndex, pageSize);
  };

  resetData = () => {
    this.props.resetOrder();
  };

  componentWillUnmount() {
    this.props.resetOrder();
  }
  finishApplyStatus = () => {
    message.success('重新申请成功', 3);
    this.table.reload({ scrollToTop: false });
  };

  componentWillReceiveProps(props) {
    if (
      props.poneOrder.status === 'fulfilled' &&
      this.props.poneOrder.status !== 'fulfilled'
    ) {
      const delayTime = props.poneOrder.payload.delayTime;
      message.success(`延期回收成功,回收时间：${delayTime}`, 3);
      this.table.reload();
    }

    if (this.props.currentModal === 'orderRefundModal' && !props.currentModal) {
      this.table.reload();
    }
    if (this.props.currentModal === 'createOrder' && !props.currentModal) {
      this.table.reload();
    }
    if (this.props.currentModal === 'orderResult' && !props.currentModal) {
      this.table.reload();
    }
  }

  openImg(pictures) {
    const pic = pictures.map((p) => {
      return { url: p, alt: p };
    });
    Viewer(pic, {
      navbar: false,
      toolbar: true,
      title: false,
    });
  }

  refundOrder = (id, status, deliveryAddressType, expressStatus) => {
    if (
      (deliveryAddressType === 3 || deliveryAddressType === 1) &&
      status >= 45 &&
      status <= 50 &&
      expressStatus !== 98 &&
      expressStatus !== 97
    ) {
      Modal.info({
        title: '配送方式为快递的订单，仅可在配送拒收后进行撤单',
        okText: '知道了',
      });
    } else {
      this.props.openModal('orderRefundModal', id);
    }
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

  applyOrder(orderId) {
    this.props.applyAgainOrder(orderId);
  }

  render() {
    const permission = 'crm.task.view,crm.task.edit,crm.task.admin';
    const logical = 'or';
    const SelectSingleHospitalForView = SelectSingleHospital.forDataRange(
      permission,
      logical
    );
    return (
      <div>
        <CustomerCart
          id={this.state.currentCustomerId}
          visible={this.state.customerCardVisible}
          hideCustomerCard={this.hideCustomerCard}
        ></CustomerCart>
        <AlertError async={this.props.poneOrder} />
        <TablePage
          def={tableDef}
          data={this.props.orderList}
          onLoadData={this.loadData}
          onResetData={this.resetData}
          tableRef={(table) => (this.table = table)}
          autoLoad={false}
          tip='提醒：订单状态处于待取药时，仅可在PBMapp端进行撤单。'
          rowKey='id'
          renderFormFields={(values, loadData) => {
            let searchProps;
            switch (values.queryKey) {
              case 'orderNo':
                searchProps = { placeholder: '请输入用药订单编号' };
                break;
              case 'patientName':
                searchProps = { placeholder: '请输入会员姓名' };
                break;
              case 'idCard':
                searchProps = { placeholder: '请输入身份证号' };
                break;
              case 'doctorName':
                searchProps = { placeholder: '请输入医生姓名' };
                break;
              case 'createBy':
                searchProps = { placeholder: '请输入创建人姓名' };
                break;
              default:
                searchProps = { disabled: true };
                break;
            }
            return (
              <Row gutter={10} className='block filter-box'>
                {values.createBy ? (
                  <Col span={6}>
                    <Form.Item field='createBy' height='auto'>
                      <Removable
                        renderer={(val) =>
                          `创建人：${val.substr(1 + val.indexOf(','))}`
                        }
                      />
                    </Form.Item>
                  </Col>
                ) : (
                  [
                    <Col span={2} key='1'>
                      <Form.Item field='queryKey' height='auto'>
                        <Select>
                          {QueryKeyChoices.map(mapChoiceToOption)}
                        </Select>
                      </Form.Item>
                    </Col>,
                    <Col span={3} key='2'>
                      <Form.Item field='queryText' height='auto'>
                        <Input {...searchProps} onPressEnter={loadData} />
                      </Form.Item>
                    </Col>,
                  ]
                )}
                <Col span={3}>
                  <Form.Item field='status' height='auto'>
                    <Select placeholder='请选择订单状态' allowClear>
                      {StatusChoices.map(mapChoiceToOption)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item field='hospitalId' height='auto'>
                    <SelectSingleHospitalForView
                      placeholder='请选择开具医院'
                      allowClear={true}
                    />
                  </Form.Item>
                </Col>
                <Col span={3}>
                  <Form.Item field='createDate' height='auto'>
                    <DateRangePicker
                      size='default'
                      placeholder='请选择开具时间'
                    />
                  </Form.Item>
                </Col>
                <Col span={3}>
                  <Form.Item field='prescriptionStatus' height='auto'>
                    <Select placeholder='请选择处方状态' allowClear>
                      {prescriptionStatusChoices.map(mapChoiceToOption)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={2}>
                  <Form.Item field='isPay' height='auto'>
                    <Select placeholder='请选择支付状态' allowClear>
                      {isPayStatusChoices.map(mapChoiceToOption)}
                    </Select>
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
                  <HasPermission match='order.edit'>
                    <Button
                      onClick={() => this.props.openModal('createOrder')}
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
        >
          <TableColumn
            title='用药订单编号'
            className='singleline'
            dataIndex='orderNo'
            key='orderNo'
            render={(orderNo, order) => (
              <span style={{ display: 'flex' }}>
                <Link
                  to={`orderDetails/${order.id}?r=${encodeURIComponent(
                    this.props.router.fullPath
                  )}`}
                >
                  <span className='clickable'>{orderNo}</span>
                </Link>
              </span>
            )}
          />
          <TableColumn
            title='会员'
            className='singleline'
            dataIndex='patientName'
            key='patientName'
            render={(name, customer) => (
              <span
                style={{ textDecoration: 'underline', cursor: 'pointer' }}
                onClick={() => {
                  this.showCustomerCard(customer.patientId);
                }}
              >
                {name}
              </span>
            )}
          />
          <TableColumn
            title='医生'
            className='singleline'
            dataIndex='doctorName'
            key='doctorName'
          />
          <TableColumn
            title='开具时间'
            className='singleline'
            dataIndex='orderDate'
            key='orderDate'
          />
          <TableColumn
            title='开具医院'
            className='singleline max-w-200'
            dataIndex='hospitalName'
            key='hospitalName'
          />
          <TableColumn
            title='订单状态'
            className='singleline'
            dataIndex='status'
            key='status'
            render={(status) => StatusMap[status]}
          />
          <TableColumn
            title='支付状态'
            className='singleline'
            dataIndex='isPay'
            key='isPay'
            render={(isPay) => isPayStatusMap[isPay]}
          />
          <TableColumn
            title='处方状态'
            className='singleline'
            dataIndex='prescriptionStatus'
            key='prescriptionStatus'
            render={(prescriptionStatus, order) => {
              if (
                prescriptionStatus === 60 &&
                order.pictures &&
                order.pictures.length > 0
              ) {
                return (
                  <a onClick={() => this.openImg(order.pictures)}>
                    <Icon type='picture' style={{ fontSize: '25px' }} />(
                    {order.pictures.length})
                  </a>
                );
              }
              return <span>{prescriptionStatusMap[prescriptionStatus]}</span>;
            }}
          />
          <TableColumn
            title='创建人'
            className='singleline max-w-200'
            dataIndex='createBy'
            key='createBy'
          />
          {testPermission('order.admin') ? (
            <TableColumn
              title='操作'
              className='singleline'
              dataIndex='id'
              key='id'
              renderTip={() => null}
              render={(id, order) => {
                return (
                  <span>
                    {order.status === 20 &&
                    order.pictures &&
                    order.pictures.length > 0 &&
                    window.STORE_LOGINNAME.split(',').indexOf(
                      this.props.auth.loginName
                    ) < 0 ? (
                      <span
                        className='clickable'
                        onClick={() =>
                          this.props.openModal(
                            'createOrder',
                            `order_${order.patientId}_${id}_audit`
                          )
                        }
                      >
                        审核
                      </span>
                    ) : null}
                    {order.status === 20 &&
                    !order.pictures &&
                    window.STORE_LOGINNAME.split(',').indexOf(
                      this.props.auth.loginName
                    ) < 0 &&
                    [10].indexOf(order.prescriptionStatus) >= 0 ? (
                      <span
                        className='clickable'
                        onClick={() =>
                          this.props.openModal(
                            'createOrder',
                            `order_${order.patientId}_${id}_update`
                          )
                        }
                      >
                        修改
                      </span>
                    ) : null}
                    {order.status === 97 &&
                    window.STORE_LOGINNAME.split(',').indexOf(
                      this.props.auth.loginName
                    ) < 0 &&
                    [10, 60].indexOf(order.prescriptionStatus) >= 0 ? (
                      <span
                        className='clickable'
                        onClick={() =>
                          this.props.openModal(
                            'createOrder',
                            `order_${order.patientId}_${id}`
                          )
                        }
                      >
                        修改
                      </span>
                    ) : null}
                    {order.status === 20 &&
                    [40].indexOf(order.prescriptionStatus) >= 0 ? (
                      <span
                        className='clickable'
                        onClick={() => this.applyOrder(order.id)}
                      >
                        重新申请处方
                      </span>
                    ) : null}
                    {[50, 60, 70, 98, 99].indexOf(order.status) >= 0 ? null : (
                      <span
                        className='clickable'
                        onClick={() =>
                          this.refundOrder(
                            id,
                            order.status,
                            order.deliveryAddressType,
                            order.expressStatus
                          )
                        }
                      >
                        撤单
                      </span>
                    )}
                  </span>
                );
              }}
            />
          ) : null}
        </TablePage>
        <AsyncEvent
          async={this.props.applyOrderStatus}
          onFulfill={this.finishApplyStatus}
          alertError
        />
      </div>
    );
  }
}

export default connectRouter(connectModalHelper(connectOrderList(OrderCenter)));
