import React, { Component } from 'react';
import { Table } from 'antd';
import CustomerCart from '../../customerCenter/CustomerCard';
class HisOrderTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableData: {},
      pageSize: props.limit,
      current: 1,
      customerCardVisible: false,
      currentCustomerId: null,
    };
  }
  componentWillMount() {
    this.setState({
      tableData: this.props.tableData,
    });
  }

  componentWillReceiveProps(nextProps) {
    if (
      JSON.stringify(this.props.tableData) !==
      JSON.stringify(nextProps.tableData)
    ) {
      this.setState({
        tableData: nextProps.tableData,
      });
    }
  }
  checkInsurance = (row) => {
    this.props.router.push('');
  };
  tableChange = (pagination) => {
    // this.props.changePageIndex(pagination.current)
    // this.props.changPageSize(pagination.pageSize)
    // 如果改变的是每页显示的条数
    if (pagination.pageSize !== this.state.pageSize) {
      this.setState({
        pageSize: pagination.pageSize,
        current: 1,
      });
    } else {
      this.setState({
        pageSize: pagination.pageSize,
        current: pagination.current,
      });
    }
    this.props.changePage(pagination.current, pagination.pageSize);
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
    const columns = [
      {
        title: '会员',
        dataIndex: 'patientName',
        width: 150,
        key: 'patientName',
        render: (text, row) => {
          return (
            <span
              style={{ textDecoration: 'underline', cursor: 'pointer' }}
              onClick={() => {
                this.showCustomerCard(row.patientId);
              }}
            >
              {text}
            </span>
          );
        },
      },
      {
        title: '医生',
        dataIndex: 'doctorName',
        width: 150,
        key: 'doctorName',
      },
      {
        title: '处方号',
        dataIndex: 'orderNo',
        width: 150,
        key: 'orderNo',
      },
      {
        title: '开具时间',
        dataIndex: 'orderDate',
        key: 'orderDate',
      },
      {
        title: '开具医院',
        dataIndex: 'hospitalName',
        key: 'hospitalName',
      },
      {
        title: '处方匹配状态',
        dataIndex: 'status',
        key: 'status',
        render: (text, row) => {
          if (text === 1) {
            return '正常';
          } else {
            return '异常';
          }
        },
      },
      {
        title: '异常原因',
        dataIndex: 'specialCause',
        key: 'specialCause',
      },
      {
        title: '是否有效',
        dataIndex: 'isEnabled',
        key: 'isEnabled',
        render: (text, row) => {
          if (text === 1) {
            return '是';
          } else {
            return '否';
          }
        },
      },
      {
        title: '用药订单号',
        dataIndex: 'whOrderNo',
        key: 'whOrderNo',
      },
      {
        title: '订单状态',
        dataIndex: 'orderStatusTitle',
        key: 'orderStatusTitle',
      },
      {
        title: '创建人',
        dataIndex: 'createByName',
        key: 'createByName',
      },
      {
        title: '创建时间',
        dataIndex: 'createDate',
        key: 'createDate',
      },
    ];
    // 分页
    let { current, pageSize, tableData } = this.state;
    // 如果返回的tableData比pageSize 大。说明还有下一页，此时total值为，前面条数总和加当前条数
    let total =
      tableData.length > pageSize
        ? pageSize * current + 1
        : pageSize * (current - 1) + tableData.length;

    let diffNum = total - tableData.length;
    for (let i = 0; i < diffNum; i++) {
      tableData.unshift({});
    }
    return (
      <div>
        <CustomerCart
          id={this.state.currentCustomerId}
          visible={this.state.customerCardVisible}
          hideCustomerCard={this.hideCustomerCard}
        ></CustomerCart>

        <div className='table-box block table-search'>
          <Table
            columns={columns}
            dataSource={tableData}
            rowKey={(record) => record.orderNo}
            pagination={{
              showSizeChanger: true,
              total: total,
              current: current,
              pageSize: pageSize,
              pageSizeOptions: ['10', '20', '30', '40'],
            }}
            onChange={this.tableChange}
          />
        </div>
      </div>
    );
  }
}

export default HisOrderTable;
