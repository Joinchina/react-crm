import React, { Component } from 'react';
import { Row, Col, Input, Select, Button, Form, DatePicker } from 'antd';
import '../customerCenter/customer.css';
import './search.scss';
const { RangePicker } = DatePicker;
class HealthySearch extends Component {
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
    //
    if (formValues.queryKey === 'name') {
      formValues.name = formValues.queryText;
    } else {
      formValues.idCard = formValues.queryText;
    }
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
    // 如果查询的是全部，则删除该字段
    for (let key in formValues) {
      if (formValues[key] === '') {
        delete formValues[key];
      }
    }
    this.props.searchData(formValues);
  };

  render() {
    const queryKeyChoices = [
      {
        value: 'name',
        label: '姓名',
        placeholder: '请输入姓名',
      },
      {
        value: 'idCard',
        label: '身份证号',
        placeholder: '请输入身份证号',
      },
    ];
    const statusKeyChoices = [
      {
        value: '0',
        label: '待审核',
      },
      {
        value: '10',
        label: '通过',
      },
      {
        value: '20',
        label: '不通过',
      },
    ];

    const { getFieldDecorator } = this.props.form;
    const mapChoiceToOption = (choice, i) => (
      <Select.Option key={i} value={choice.value} title={choice.label}>
        {choice.label}
      </Select.Option>
    );
    const dateFormat = 'YYYY-MM-DD';
    let that = this
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
              {getFieldDecorator('status', {
              })(
                <Select placeholder='请选择审核状态' allowClear>
                  {statusKeyChoices.map(mapChoiceToOption)}
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
                  placeholder={['上传开始时间', '上传结束时间']}
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

export default Form.create({})(HealthySearch);
