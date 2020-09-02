import React, { Component } from 'react';
import { Row, Col, Input, Select, Button, Form, DatePicker } from 'antd';
import '../../customerCenter/customer.css';
import moment from 'moment';
const { RangePicker } = DatePicker;
class HisOrderSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      queryTextPlaceholder: '请输入姓名',
    };
  }

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
    this.props.searchData(formValues);
  };

  render() {
    const queryKeyChoices = [
      {
        value: 'patientName',
        label: '会员姓名',
        placeholder: '请输入姓名',
      },
      {
        value: 'orderNo',
        label: '处方号',
        placeholder: '请输入处方号',
      },
    ];
    const orderStatus = [
      {
        value: '1',
        label: '正常',
      },
      {
        value: '2',
        label: '异常',
      },
    ];

    const { getFieldDecorator, getFieldValue } = this.props.form;
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
                <Select placeholder='请选择处方匹配状态'>
                  {orderStatus.map(mapChoiceToOption)}
                </Select>
              )}
            </Form.Item>
          </Col>

          <Col span={5} key='4'>
            <Form.Item height='auto'>
              {getFieldDecorator(
                'uploadDate',
                {}
              )(
                <RangePicker
                  format={dateFormat}
                  placeholder={['请选择开具开始时间', '请选择开具结束时间']}
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

export default Form.create({})(HisOrderSearch);
