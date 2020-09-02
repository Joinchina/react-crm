import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Input, Select, Button } from 'antd';
import moment from 'moment';
import PropTypes from '../../helpers/prop-types';
import { Form, RenderEditor } from '../common/form';
import { TablePage } from '../common/table-page';
import {
  SelectSingleTaskType,
  subTypesForPrimaryType,
} from '../common/SelectSingleTaskType';
import { connect } from '../../states/taskCenter/taskList';
import { DateRangePicker } from '../common/DateRangePicker';
import { connectRouter } from '../../mixins/router';
import HasPermission from '../common/HasPermission';
import Removable from '../common/Removable';
// 会员卡片弹窗
import CustomerCart from '../customerCenter/CustomerCard';

const QueryKeyChoices = [
  {
    value: 'contactsName',
    label: '会员',
  },
  {
    value: 'content',
    label: '主题',
  },
  {
    value: 'charge',
    label: '负责人',
  },
];

const StatusChoices = [
  {
    value: '0',
    label: '待处理',
  },
  {
    value: '1',
    label: '处理中',
  },
  {
    value: '2',
    label: '已完成',
  },
  {
    value: '4',
    label: '已关闭',
  },
  {
    value: '3',
    label: '系统关闭',
  },
];

const StatusMap = {};
for (const item of StatusChoices) {
  StatusMap[item.value] = item.label;
}
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
    parse: (val) => val || 'contactsName',
    stringify: (val) => (val === 'contactsName' ? undefined : val),
  },
  queryText: {},
  taskType: {
    parse: (str) => (str ? { id: str } : undefined),
    stringify: (val) => (val ? val.id : undefined),
  },
  taskReclassify: {
    parse: (str) => (str ? { id: str } : undefined),
    stringify: (val) => (val ? val.id : undefined),
  },
  taskStatus: {},
  createDate: dateRangeField,
  updateDate: dateRangeField,
  chargeId: {},
});

class TaskList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      customerCardVisible: false,
      currentCustomerId: null,
    };
  }
  static propTypes = {
    router: PropTypes.shape({
      openModal: PropTypes.func,
      modal: PropTypes.string,
    }),
    resetTaskList: PropTypes.func,
    searchTask: PropTypes.func,
    downloadExportedTaskList: PropTypes.func,
    tasks: PropTypes.asyncResult(
      PropTypes.shape({
        list: PropTypes.array,
      })
    ).isRequired,
    exportTaskResult: PropTypes.shape({
      status: PropTypes.oneOf(['pending', 'fullfilled', 'rejected']),
    }).isRequired,
  };

  static defaultProps = {
    router: undefined,
    resetTaskList: undefined,
    searchTask: undefined,
    downloadExportedTaskList: undefined,
  };

  componentWillReceiveProps(nextProps) {
    const { router } = this.props;
    const { modal } = router;
    if (modal === 'quickActivation' && !nextProps.router.modal) {
      this.table.reload();
    }
  }

  componentWillUnmount() {
    const { resetTaskList } = this.props;
    resetTaskList();
  }

  loadData = ({ values, pageIndex, pageSize }) => {
    const { searchTask } = this.props;
    searchTask(this.mapFormValuesToQuery(values), pageIndex, pageSize);
  };

  resetData = () => {
    const { resetTaskList } = this.props;
    resetTaskList();
  };

  shortcutActivation = () => {
    const { router } = this.props;
    router.openModal('quickActivation');
  };

  exportTaskList(values) {
    const { downloadExportedTaskList } = this.props;
    downloadExportedTaskList({
      where: this.mapFormValuesToQuery(values),
      order: [{ createDate: 'desc' }],
    });
  }

  /* eslint-disable class-methods-use-this */
  mapFormValuesToQuery(values) {
    const where = {};
    if (values.chargeId) {
      const id = values.chargeId.substr(0, values.chargeId.indexOf(','));
      where.chargeId = id;
    }
    if (values.queryKey && values.queryText) {
      where[values.queryKey] = { $like: `%${values.queryText}%` };
    }
    where.taskType = values.taskType && values.taskType.id;
    where.taskReclassify = values.taskReclassify && values.taskReclassify.id;
    where.taskStatus = values.taskStatus;
    if (values.createDate && values.createDate.length > 0) {
      where.createDate = {};
      if (values.createDate[0]) {
        where.createDate.$gte = values.createDate[0].format('YYYY-MM-DD');
      }
      if (values.createDate[1]) {
        where.createDate.$lte = values.createDate[1].format('YYYY-MM-DD');
      }
    }
    if (values.updateDate && values.updateDate.length > 0) {
      where.updateDate = {};
      if (values.updateDate[0]) {
        where.updateDate.$gte = values.updateDate[0].format('YYYY-MM-DD');
      }
      if (values.updateDate[1]) {
        where.updateDate.$lte = values.updateDate[1].format('YYYY-MM-DD');
      }
    }
    return where;
  }
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
    const { Column } = TablePage;
    const { tasks, router, exportTaskResult } = this.props;
    return (
      <div>
        <CustomerCart
          id={this.state.currentCustomerId}
          visible={this.state.customerCardVisible}
          hideCustomerCard={this.hideCustomerCard}
        ></CustomerCart>
        <TablePage
          tableRef={(table) => {
            this.table = table;
          }}
          def={tableDef}
          data={tasks}
          onLoadData={this.loadData}
          onResetData={this.resetData}
          autoLoad={false}
          rowKey='id'
          renderFormFields={(values, loadData) => {
            let searchProps;
            switch (values.queryKey) {
              case 'contactsName':
                searchProps = { placeholder: '请输入会员名称' };
                break;
              case 'content':
                searchProps = { placeholder: '请输入主题' };
                break;
              case 'charge':
                searchProps = { placeholder: '请输入负责人' };
                break;
              default:
                searchProps = { disabled: true };
                break;
            }
            return (
              <Row gutter={10} className='block filter-box'>
                {values.chargeId ? (
                  <Col span={4}>
                    <Form.Item field='chargeId' height='auto'>
                      <Removable
                        renderer={(val) =>
                          `负责人：${val.substr(1 + val.indexOf(','))}`
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
                    <Col span={4} key='2'>
                      <Form.Item field='queryText' height='auto'>
                        <Input {...searchProps} onPressEnter={loadData} />
                      </Form.Item>
                    </Col>,
                  ]
                )}
                <Col span={3}>
                  <Form.Item field='taskType' height='auto'>
                    <SelectSingleTaskType
                      keyword='类型（一级）'
                      placeholder='类型（一级）'
                      allowClear
                    />
                  </Form.Item>
                </Col>
                <Col span={3}>
                  <Form.Item field='taskReclassify' height='auto'>
                    <RenderEditor
                      type={subTypesForPrimaryType(
                        values.taskType && values.taskType.id
                      )}
                      placeholder='类型（二级）'
                      allowClear
                      normalize='unselectNonMatched'
                    />
                  </Form.Item>
                </Col>
                <Col span={2}>
                  <Form.Item field='taskStatus' height='auto'>
                    <Select placeholder='状态' allowClear>
                      {StatusChoices.map(mapChoiceToOption)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={3}>
                  <Form.Item field='createDate' height='auto'>
                    <DateRangePicker
                      size='default'
                      placeholder='请选择创建时间'
                    />
                  </Form.Item>
                </Col>
                <Col span={3}>
                  <Form.Item field='updateDate' height='auto'>
                    <DateRangePicker
                      size='default'
                      placeholder='请选择更新时间'
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
                  <HasPermission match='crm.task.edit'>
                    <Link
                      to={`/newtask?r=${encodeURIComponent(router.fullPath)}`}
                    >
                      <Button
                        type='primary'
                        style={{ width: '100%', minWidth: 0 }}
                      >
                        新建
                      </Button>
                    </Link>
                  </HasPermission>
                </Col>
              </Row>
            );
          }}
          renderFooter={(values) => (
            <Row>
              <HasPermission match='crm.task.admin'>
                <Button type='primary' onClick={this.shortcutActivation}>
                  快捷激活
                </Button>
              </HasPermission>
              <HasPermission match='crm.task.admin'>
                <Button
                  type='primary'
                  style={{ marginLeft: 20 }}
                  loading={exportTaskResult.status === 'pending'}
                  onClick={() => this.exportTaskList(values)}
                >
                  导出
                </Button>
              </HasPermission>
            </Row>
          )}
          footerHeight={36}
        >
          <Column
            title='主题'
            dataIndex='content'
            key='content'
            className='singleline max-w-300'
            render={(text, task) => (
              <Link
                className='clickable'
                to={`/taskDetail/${task.id}?r=${encodeURIComponent(
                  router.fullPath
                )}`}
              >
                {text}
              </Link>
            )}
          />
          <Column
            title='类型（一级）'
            className='singleline'
            dataIndex='taskType'
            key='taskType'
            render={(taskType) => (
              <SelectSingleTaskType.Viewer
                hideAsyncPlaceholder
                renderNotFoundItem={() => <span>未知类型</span>}
                value={{ id: taskType }}
              />
            )}
          />
          <Column
            title='类型（二级）'
            className='singleline'
            dataIndex='secondaryType'
            key='secondaryType'
            render={(taskType, task) => <span>{task.taskReclassifyName}</span>}
          />
          <Column
            title='状态'
            className='singleline'
            dataIndex='taskStatus'
            key='taskStatus'
            render={(status) => StatusMap[status] || '未知状态'}
          />
          <Column
            title='会员'
            className='nowrap max-w-150'
            dataIndex='contactsName'
            key='contactsName'
            render={(patientName, customer) => (
              <span
                className='ellipsis'
                style={{ textDecoration: 'underline', cursor: 'pointer' }}
                onClick={() => {
                  this.showCustomerCard(customer.patientId);
                }}
              >
                {patientName}
              </span>
            )}
          />
          <Column
            title='负责人'
            className='singleline'
            dataIndex='chargeName'
            key='chargeName'
            render={(chargeName, task) => {
              if (!chargeName) return '';
              if (task.company) {
                if (task.office) {
                  return `${chargeName}（${task.company}，${task.office}）`;
                }
                return `${chargeName}（${task.company}）`;
              }
              if (task.office) {
                return `${chargeName}（${task.office}）`;
              }
              return chargeName;
            }}
          />
          <Column
            title='创建时间'
            className='singleline'
            dataIndex='createDate'
            key='createDate'
          />
          <Column
            title='更新时间'
            className='singleline'
            dataIndex='updateDate'
            key='updateDate'
          />
        </TablePage>
      </div>
    );
  }
}

export default connectRouter(connect(TaskList));
