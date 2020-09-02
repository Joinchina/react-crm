import React, { Component } from 'react';
import InsuranceSearch from './InsuranceSearch';
import InsuranceTable from './InsuranceTable';
import './index.scss';
import api from '../../../api/api';
class InsuranceOrder2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableData: [],
      limit: 10,
      skip: 0,
      currentPage:1,
      searchData: {},
    };
  }
  componentWillMount() {
    this.searchData({});
  }
  searchData = async (data) => {
    this.setState({
      searchData: data,
      skip:0,
      currentPage:1
    });
    // data为顶部的查询条件
    // data = Object.assign({}, data, {
    //   limit: this.state.limit + 1, // 请求多1位，用户判断是否有下一页
    //   skip: this.state.skip,
    // });
    let tableData = await api.getGroupInsuranceList(
      data,
      this.state.skip,
      this.state.limit + 1
    );
    this.setState({
      tableData,
    });
    // console.log('result:', result);
  };
  changePage = (current, pageSize) => {
    current = current === 0 ? 0 : current - 1;
    if (pageSize !== this.state.limit) {
      this.setState({
        skip: 0,
        limit: pageSize,
      });
    } else {
      this.setState({
        skip: current * pageSize,
        limit: pageSize,
      });
    }

    setTimeout(() => {
      let data = this.state.searchData;
      this.searchData(data);
    }, 0);
  };

  render() {
    return (
      <div>
        <InsuranceSearch searchData={this.searchData}></InsuranceSearch>
        <InsuranceTable
          tableData={this.state.tableData}
          changePage={this.changePage}
          limit={this.state.limit}
          currentPage={this.state.currentPage}
        ></InsuranceTable>
      </div>
    );
  }
}

export default InsuranceOrder2;
