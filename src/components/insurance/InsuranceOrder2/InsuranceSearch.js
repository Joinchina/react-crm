import React, { Component } from 'react';
import { Row, Col, Input, Select, Button, Form, DatePicker } from 'antd';
import '../../customerCenter/customer.css';
import moment from 'moment';
import api from '../../../api/api';
const { RangePicker } = DatePicker;
class InsuranceSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      insuranceList: [{}],
      insuranceCompany: [{}],

      queryTextPlaceholder: '请输入姓名',
    };
  }

  componentWillMount() {
    // 获取保险产品列表
    this.getInsuranceProductList();
    // 获取保险公司
    this.getInsuranceCompany();
  }
  // 获取保险产品列表
  getInsuranceProductList = async () => {
    // /insurance/products
    /**
       [{
        "productId":123,//保险产品id
        "productName":""//保险产品名称
        }]
       */
    let insuranceList = (await api.getInsuranceProductList()) || [{}];
    insuranceList = insuranceList.map((item) => {
      return {
        value: String(item.productId),
        label: item.productName,
      };
    });
    this.setState({
      insuranceList,
    });
  };
  // 获取承包公司
  getInsuranceCompany = async () => {
    let insuranceCompany = (await api.getInsuranceCompany()) || [{}];
    insuranceCompany = insuranceCompany.map((item) => {
      return {
        value: String(item.companyCode),
        label: item.companyName,
      };
    });
    this.setState({
      insuranceCompany,
    });
  };
  // 提交数据
  submitForm = (event) => {
    event.preventDefault();
    let formValues = this.props.form.getFieldsValue();

    formValues[formValues.queryKey] = formValues.queryText;
    delete formValues.queryKey;
    delete formValues.queryText;

    if (formValues.uploadDate) {
      formValues.uploadDate = formValues.uploadDate.map((moment) => {
        return moment.format('YYYY-MM-DD');
      });
      formValues.startDate = formValues.uploadDate[0];
      formValues.endDate = formValues.uploadDate[1];
      delete formValues.uploadDate;
    }
    for (let item in formValues) {
      if (formValues[item] === '') {
        delete formValues[item];
      }
    }
    this.props.searchData(formValues);
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
    const queryKeyChoices = [
      {
        value: 'insuredName',
        label: '被保人',
        placeholder: '请输入姓名',
      },
      {
        value: 'insuredIdCard',
        label: '身份证号',
        placeholder: '请输入身份证号',
      },
      {
        value: 'insuredPhone',
        label: '手机号',
        placeholder: '请输入手机号',
      },
      {
        value: 'orderNo',
        label: '服务单号',
        placeholder: '请输入服务单号',
      },
      {
        value: 'insurOrderNo',
        label: '保单号',
        placeholder: '请输入保单号',
      },
    ];
    const insuranceStatus = [
      {
        value: '0',
        label: '投保中',
      },
      {
        value: '1',
        label: '已承包',
      },
      {
        value: '2',
        label: '已注销',
      },
      {
        value: '3',
        label: '已到期',
      },
      {
        value: '4',
        label: '待退保',
      },
      {
        value: '5',
        label: '已退保',
      },
      {
        value: '7',
        label: '拒保中',
      },
    ];

    const { getFieldDecorator } = this.props.form;
    const mapChoiceToOption = (choice, i) => (
      <Select.Option key={i} value={choice.value} title={choice.label}>
        {choice.label}
      </Select.Option>
    );
    const dateFormat = 'YYYY-MM-DD';

    let that = this;
    function changeQueryKey(value) {
      let queryTextPlaceholder = queryKeyChoices.find((item) => {
        return item.value === value;
      }).placeholder;
      that.setState({
        queryTextPlaceholder,
      });
    }
    return (
      <Form onSubmit={this.submitForm}>
        <Row gutter={10} className='block filter-box'>
          <Col span={2} key='1'>
            <Form.Item height='auto'>
              {getFieldDecorator('queryKey', {
                initialValue: queryKeyChoices[0].value,
              })(
                <Select onChange={changeQueryKey.bind(this)}>
                  {queryKeyChoices.map(mapChoiceToOption)}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col span={3} key='2'>
            <Form.Item height='auto'>
              {getFieldDecorator('queryText')(
                <Input placeholder={this.state.queryTextPlaceholder} />
              )}
            </Form.Item>
          </Col>
          <Col span={3} key='3'>
            <Form.Item height='auto'>
              {getFieldDecorator('productId', {
              })(
                <Select placeholder='请选择保险产品' allowClear>
                  {this.state.insuranceList.map(mapChoiceToOption)}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col span={3} key='4'>
            <Form.Item height='auto'>
              {getFieldDecorator('companyCode', {
              })(
                <Select placeholder='请选择承包公司' allowClear>
                  {this.state.insuranceCompany.map(mapChoiceToOption)}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col span={3} key='5'>
            <Form.Item height='auto'>
              {getFieldDecorator('status', {
              })(
                <Select placeholder='请选择保单状态' allowClear>
                  {insuranceStatus.map(mapChoiceToOption)}
                </Select>
              )}
            </Form.Item>
          </Col>

          <Col span={5} key='6'>
            <Form.Item height='auto'>
              {getFieldDecorator(
                'uploadDate',
                {}
              )(
                <RangePicker
                  format={dateFormat}
                  placeholder={['登记开始时间', '登记结束时间']}
                />
                // <DateRangePicker size='default' placeholder='请选择上传时间' value={this.state.dateArray} onChange={this.dateChange} />
              )}
            </Form.Item>
          </Col>

          <Col span={2}>
            <Form.Item>
              <Button
                style={{ width: '100%', minWidth: 0 }}
                type='primary'
                htmlType='submit'
              >
                查询
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}

export default Form.create({})(InsuranceSearch);
