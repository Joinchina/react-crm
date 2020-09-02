import React, { Component } from 'react';
import { Table} from 'antd';
import history from '../../../history';

class InsuranceTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableData: {},
      pageSize: props.limit,
      current: 1,
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
    if(nextProps.currentPage !==this.state.current){
      this.setState({
        current:nextProps.currentPage
      })
    }
  }
  checkInsurance = (row) => () => {
    history.push(`/patientInsuranceOrderInfo/${row.orderId}`);
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
  render() {
    const columns = [
      {
        title: '服务单号',
        dataIndex: 'serviceOrderNo',
        width: 150,
        key: 'serviceOrderNo',
      },
      {
        title: '被保人',
        dataIndex: 'insuredName',
        width: 150,
        key: 'insuredName',
      },
      {
        title: '身份证号',
        dataIndex: 'insuredIdCard',
        width: 150,
        key: 'insuredIdCard',
      },
      {
        title: '保险产品名称',
        dataIndex: 'packageProductName',
        key: 'packageProductName',
      },
      {
        title: '承包公司',
        dataIndex: 'companyName',
        key: 'companyName',
      },
      {
        title: '保单状态',
        dataIndex: 'status',
        key: 'status',
        render: (text, row) => {
          let temp = '';
          switch (text) {
            case 0:
              temp = '投保中';
              break;
            case 1:
              temp = '已承保';
              break;
            case 2:
              temp = '已注销';
              break;
            case 3:
              temp = '已到期';
              break;
            case 4:
              temp = '待退保';
              break;
            case 5:
              temp = '已退保';
            case 7:
              temp = '已拒保';
              break;
            default:
              temp=''
          }
          return temp;
        },
      },
      {
        title: '保单号',
        dataIndex: 'insurId',
        key: 'insurId',
      },
      {
        title: '登记时间',
        dataIndex: 'createDate',
        key: 'createDate',
      },
      {
        title: '操作',
        key: 'operation',
        render: (text, row) => {
          if (row.status === 0) {
            // 未审核
            return (
              <span
                style={{ textDecoration: 'underline', cursor: 'pointer' }}
                onClick={this.checkInsurance(row)}
              >
                查看
              </span>
            );
          } else {
            return <span></span>;
          }
        },
      },
    ];
    let { current, pageSize, tableData } = this.state;
    let total =
      tableData.length > pageSize
        ? pageSize * current + 1
        : pageSize * (current - 1) + tableData.length;
    let diffNum = total - tableData.length;
    for (let i = 0; i < diffNum; i++) {
      tableData.unshift({});
    }
    return (
      <div className='table-box block'>
        <Table
          columns={columns}
          dataSource={this.state.tableData}
          rowKey={(record) => record.insurId}
          pagination={{
            showSizeChanger: true,
            total: total,
            current: current,
            pageSize: pageSize,
            pageSizeOptions: ['1', '2', '3', '4'],
          }}
          onChange={this.tableChange}
        />
      </div>
    );
  }
}

export default InsuranceTable;
