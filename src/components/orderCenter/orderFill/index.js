import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Input, Select, Button } from 'antd';
import { connect as connectOrderFillList } from '../../../states/orderCenter/orderFill';
import AlertError from '../../common/AlertError';
import moment from 'moment';
import { TablePage } from '../../common/table-page';
import DateRangePicker from '../../common/DateRangePicker';
import { Form } from '../../common/form';
import { connectModalHelper } from '../../../mixins/modal';
import { connectRouter } from '../../../mixins/router';
import SelectSingleHospital from '../../common/SelectSingleHospital';
// 会员卡片弹窗
import CustomerCart from '../../customerCenter/CustomerCard';

const TableColumn = TablePage.Column;

const QueryKeyChoices = [
  {
    value: 'orderfillNo',
    label: '包裹单编号',
  },
  {
    value: 'orderNo',
    label: '用药订单编号',
  },
  {
    value: 'patientName',
    label: '会员',
  },
];

const StatusChoices = [
  { value: '3', label: '待承运' },
  { value: '5', label: '待备货' },
  { value: '6', label: '备货中' },
  { value: '7', label: '待复核' },
  { value: '10', label: '待出库' },
  { value: '20', label: '已出库' },
  { value: '30', label: '已收货' },
  { value: '40', label: '已验货' },
  { value: '45', label: '待审核' },
  { value: '50', label: '待退回' },
  { value: '60', label: '退回中' },
  { value: '70', label: '已退回' },
  { value: '99', label: '已发药' },
  { value: '98', label: '包裹丢失' },
  { value: '97', label: '撤销' },
];

const StatusMap = {};
StatusChoices.forEach((item) => (StatusMap[item.value] = item.label));

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
    parse: (val) => val || 'orderfillNo',
    stringify: (val) => (val === 'orderfillNo' ? undefined : val),
  },
  queryText: {},
  status: {},
  hospitalId: {
    parse: (val) => (val ? { id: val } : undefined),
    stringify: (val) => (val ? val.id : undefined),
  },
  createDate: dateRangeField,
});

class OrderFill extends Component {
  constructor(props) {
    super(props);
    this.state = {
      customerCardVisible: false,
      currentCustomerId: null,
    };
  }

  loadData = ({ values, pageIndex, pageSize }) => {
    const where = {};
    if (values.queryKey && values.queryText) {
      if (values.queryKey === 'orderfillNo' || values.queryKey === 'orderNo') {
        where[values.queryKey] = values.queryText;
      } else {
        where[values.queryKey] = { $like: `%${values.queryText}%` };
      }
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
    this.props.searchOrder(where, pageIndex, pageSize);
  };

  resetData = () => {
    this.props.resetOrder();
  };

  componentWillUnmount() {
    this.props.resetOrder();
  }

  componentWillReceiveProps(props) {}
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
          data={this.props.orderFillList}
          onLoadData={this.loadData}
          onResetData={this.resetData}
          tableRef={(table) => (this.table = table)}
          autoLoad={false}
          rowKey='id'
          renderFormFields={(values, loadData) => {
            let searchProps;
            switch (values.queryKey) {
              case 'orderfillNo':
                searchProps = { placeholder: '请输入包裹单编号' };
                break;
              case 'orderNo':
                searchProps = { placeholder: '请输入用药订单编号' };
                break;
              case 'patientName':
                searchProps = { placeholder: '请输入会员姓名' };
                break;
              default:
                searchProps = { disabled: true };
                break;
            }
            return (
              <Row gutter={10} className='block filter-box'>
                <Col span={2} key='1'>
                  <Form.Item field='queryKey' height='auto'>
                    <Select>{QueryKeyChoices.map(mapChoiceToOption)}</Select>
                  </Form.Item>
                </Col>
                <Col span={4} key='2'>
                  <Form.Item field='queryText' height='auto'>
                    <Input {...searchProps} onPressEnter={loadData} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item field='status' height='auto'>
                    <Select placeholder='请选择包裹单状态' allowClear>
                      {StatusChoices.map(mapChoiceToOption)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item field='hospitalId' height='auto'>
                    <SelectSingleHospitalForView
                      placeholder='请选择签约机构'
                      allowClear={true}
                    />
                  </Form.Item>
                </Col>
                <Col span={5}>
                  <Form.Item field='createDate' height='auto'>
                    <DateRangePicker
                      size='default'
                      placeholder='请选择创建时间'
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
              </Row>
            );
          }}
        >
          <TableColumn
            title='包裹单编号'
            className='singleline'
            dataIndex='orderfillNo'
            render={(orderfillNo, orderfill) => (
              <Link
                to={`orderFillDetails/${orderfill.id}?r=${encodeURIComponent(
                  this.props.router.fullPath
                )}`}
              >
                <span className='clickable'>{orderfillNo}</span>
              </Link>
            )}
          />
          <TableColumn
            title='用药订单编号'
            className='singleline'
            dataIndex='orderNo'
          />
          <TableColumn
            title='会员'
            className='singleline'
            dataIndex='patientName'
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
            title='包裹单状态'
            className='singleline'
            dataIndex='status'
            render={(status) => StatusMap[status]}
          />
          <TableColumn
            title='签约机构'
            className='singleline max-w-200'
            dataIndex='hospitalName'
          />
          <TableColumn
            title='创建时间'
            className='singleline'
            dataIndex='createDate'
          />
        </TablePage>
      </div>
    );
  }
}

export default connectRouter(
  connectModalHelper(connectOrderFillList(OrderFill))
);
