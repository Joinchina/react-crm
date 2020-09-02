import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Input, Select, Button } from 'antd';
import moment from 'moment';
import HealthySearch from './HealthySearch';
import HealthyTable from './HealthyTable';
import api from '../../api/api';
class Healthy extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableData: [],
      limit: 10,
      skip: 0,
      searchData: {},
      currentPage:1
    };
  }
  componentWillMount() {
    this.searchData({});
  }
  searchData = async (data) => {
    this.setState({
      searchData: data,
      currentPage:1,
      skip:0
    });

    // data为顶部的查询条件
    data = Object.assign({}, data, {
      limit: this.state.limit + 1, // 请求多1位，用户判断是否有下一页
      skip: this.state.skip,
    });
    let tableData = await api.getMember(data);
    // 造假数据，将图片增加多条
    // if (Array.isArray(tableData)) {
    //   tableData.forEach((item) => {
    //     if (item.pics && item.pics.length < 3) {
    //       item.pics[1] = item.pics[0];
    //       item.pics[2] = item.pics[0];
    //       item.pics[3] = item.pics[0];
    //       item.pics[4] = item.pics[0];
    //     }
    //   });
    // }
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
        <HealthySearch searchData={this.searchData}></HealthySearch>
        <HealthyTable
          tableData={this.state.tableData}
          searchData={this.searchData}
          changePage={this.changePage}
          limit={this.state.limit}
          currentPage={this.state.currentPage}
        ></HealthyTable>
      </div>
    );
  }
}

export default Healthy;
