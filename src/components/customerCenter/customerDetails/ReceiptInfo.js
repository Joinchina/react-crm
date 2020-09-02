import React, { Component } from 'react';
import { Modal, Table, Button, Form, Row, Col, Input, Spin } from 'antd';
import message from '@wanhu/antd-legacy/lib/message'
import context from '../../../api/contextCreator';
import { getPatient, getRegularMedication, getReceiverAddress, postReceiverAddress, putReceiverAddress, deleteReceiverAddress } from '../../../api';
import SmartSelectSingle from '../../common/SmartSelectSingle';
import SmartCascaderTerritory from '../../common/SmartCascaderTerritory';
const FormItem = Form.Item;
const TextArea = Input.TextArea;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
}
const streetFormItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 21 },
}
const sty = {
  addBtn: {
    textAlign: 'right',
    padding: '5px 15px 5px 0'
  },
  add: {
    backgroundColor: '#1DA57A',
    color: '#fff',
    width: '74px',
    borderRadius: '10px',
    height: '32px'
  },
  clickArea: {
    display: 'inline-block',
    width: 70
  },
  click: {
    color: 'rgb(22, 159, 133)'
  },
  split: {
    margin: '0px 5px'
  },
  setDefault: {
    display: 'inline-block',
    width: 75,
    marginLeft: 129,
    textAlign: 'center',
    color: 'rgb(22, 159, 133)',
    border: '1px solid rgb(22, 159, 133)',
    borderRadius: 5,
    lineHeight: '28px'
  },
  default: {
    display: 'inline-block',
    width: 75,
    marginLeft: 129,
    textAlign: 'center',
    color: '#fff',
    backgroundColor: 'rgb(22, 159, 133)',
    borderRadius: 5,
    lineHeight: '28px'
  },
  addressType: {
    backgroundColor: '#f7f7f7'
  },
  modalFooter: {
    textAlign: 'center'
  },
  street: {
    paddingLeft: '25%'
  },
  textarea: {
    width: '100%',
  },
  cancel: {
    marginLeft: 20
  },
  hover: {
    display: 'flex',
    alignItems: 'center',
    height: 60
  },
  liveOrHos: {
    height: 60,
    marginTop: 9
  }
};
class ReceiptInfo extends Component {

  state = {
    initing: true
  }

  componentDidMount() {
    this.uuid = 1;
    this.init();
  }

  setStatePromise(data) {
    return new Promise((resolve, reject) => {
      this.setState(data, resolve);
    })
  }

  async init() {
    try {
      if (this.props.customerId) {
        const customerId = this.props.customerId;
        const regular = await getRegularMedication(context(), customerId);
        await this.setStatePromise({ initing: true });
        const list = await getReceiverAddress(context(), this.props.customerId);
        const dataSource = list.map((item, index) => {
          return {
            id: item.id || index,
            edit: item.deliveryType === 3 ? true : false,
            name: item.name,
            contact: item.machineNumber,
            deliveryType: item.deliveryType,
            addressType: item.deliveryType === 2 ? '签约机构' : item.deliveryType === 1 ? '居住地址' : null,
            default: item.state === 1 ? true : false,
            addressIds: [item.provincesId, item.cityId, item.areaId],
            address: `${item.provincesName || ''}${item.cityName || ''}${item.areaName || ''}${item.street || ''}${item.deliveryType === 2 ? '（' + item.hospitalName + '）' : ''}`,
            street: item.street || ''
          };
        });
        this.setState({ dataSource: dataSource.filter(i => i.deliveryType == 1 || i.deliveryType == 3) });
      }
    } catch (e) {
      message.error(e.message);
    } finally {
      this.setState({ initing: false });
    }
  }

  switchAddState = (id) => {
    if (id) {
      const { dataSource } = this.state;
      const row = dataSource.find(item => item.id === id);
      const formData = {};
      formData['id'] = id;
      formData['name'] = row.name;
      formData['contact'] = row.contact;
      formData['addressIds'] = row.addressIds;
      formData['street'] = row.street;
      this.setState({ formData, editModal: true });
    } else {
      this.setState({ addModal: true });
    }
    this.setState({ visible: true });
  }

  handleSubmit = async () => {
    const { getFieldValue } = this.props.form;
    const { addModal, formData } = this.state;
    this.props.form.validateFields(async (err, values) => {
      if (err) return;
      this.setState({ loading: true });
      const name = getFieldValue('name');
      const contact = getFieldValue('contact');
      const address = getFieldValue('regularArea');
      const street = getFieldValue('street');
      const dataPost = {
        name,
        machineNumber: contact,
        provincesId: address[0],
        cityId: address[1],
        areaId: address[2],
        street,
        deliveryType: 3
      };
      const patientId = this.props.customerId;
      if (addModal) {
        await postReceiverAddress(context(), patientId, dataPost);
      } else {
        const id = formData.id;
        await putReceiverAddress(context(), patientId, dataPost, id);
      }
      this.setState({
        formData: {},
        loading: false,
        addModal: false,
        visible: false
      }, () => {
        this.init();
        this.props.form.resetFields();
      }
      );
    });
  }

  handleValueChange = (provinceName, cityName, areaName) => {
    this.addressName = provinceName + cityName + areaName;
  }


  handleCancel = () => {
    this.setState({ addModal: false, visible: false, formData: {} }, () => this.props.form.resetFields());
  }

  handleDefault = async (row) => {
    const patientId = this.props.customerId;
    const id = row.deliveryType === 3 ? row.id : null;
    const dataPost = {
      name: row.name,
      machineNumber: row.contact,
      provincesId: row.addressIds[0],
      cityId: row.addressIds[1],
      areaId: row.addressIds[2],
      street: row.street,
      deliveryType: row.deliveryType,
      state: 1
    };
    await putReceiverAddress(context(), patientId, dataPost, id);
    this.init();
  }

  onCancel = async (id) => {
    const patientId = this.props.customerId;
    await deleteReceiverAddress(context(), patientId, id);
    this.init();
  }

  onOver = (id) => {
    let setDefault = this.state.setDefault || {};
    setDefault[id] = true;
    this.setState({ setDefault });
  }

  onLeave = (id) => {
    let { setDefault } = this.state;
    setDefault[id] = false;
    this.setState({ setDefault });
  }

  render() {
    const { dataSource, visible, loading, formData, initing, addModal, setDefault } = this.state;
    const columns = [{
      title: '收件人',
      dataIndex: 'name',
      key: 'name',
      width: '15%',
      render: (value, row, index) => {
        return (<div style={sty.hover} onMouseOver={() => this.onOver(row.id)} onMouseLeave={() => this.onLeave(row.id)}>{value}</div>)
      }
    }, {
      title: '联系方式',
      dataIndex: 'contact',
      key: 'contact',
      width: '15%',
      render: (value, row, index) => {
        return (<div style={sty.hover} onMouseOver={() => this.onOver(row.id)} onMouseLeave={() => this.onLeave(row.id)}>{value}</div>)
      }
    }, {
      title: '收件地址',
      dataIndex: 'address',
      key: 'address',
      width: '35%',
      render: (value, row, index) => {
        return (<div style={row.deliveryType === 3 ? sty.hover : sty.liveOrHos} onMouseOver={() => this.onOver(row.id)} onMouseLeave={() => this.onLeave(row.id)}>{value}{row.addressType && <span style={sty.addressType}><br />{row.addressType}</span>}</div>);
      }
    }, {
      title: '操作',
      dataIndex: 'whScale',
      key: 'whScale',
      width: '35%',
      render: (value, row, index) => {
        const obj = {
          children: <div style={sty.hover} onMouseOver={() => this.onOver(row.id)} onMouseLeave={() => this.onLeave(row.id)}><span style={sty.clickArea}>{row.edit ? <span><a style={sty.click} onClick={() => this.switchAddState(row.id)}>编辑</a><span style={sty.split}>|</span><a style={sty.click} onClick={() => this.onCancel(row.id)}>删除</a></span> : null}</span>{row.default ? <a style={sty.default}>默认地址</a> : setDefault && setDefault[row.id] && <a style={sty.setDefault} onClick={() => this.handleDefault(row)}>设为默认</a>}</div>,
        };
        return obj;
      }
    }
    ];
    const { getFieldDecorator } = this.props.form;
    const modalFooter = (
      <Row style={sty.modalFooter}>
        <Button loading={loading} onClick={this.handleSubmit} type='primary'>保存</Button>
        <Button disabled={loading} onClick={this.handleCancel} className='cancelButton' style={sty.cancel}>取消</Button>
      </Row>
    );
    return (
      <div className="block">
        <div style={sty.addBtn}>
          <Button onClick={() => { this.switchAddState() }} style={sty.add}>新建</Button>
        </div>
        <div className="table-box tableBox" >
          {dataSource &&
            <Table loading={initing} dataSource={dataSource} rowKey={record => record.id} columns={columns} pagination={false} bordered={false} />}
        </div>
        <Modal
          title={addModal ? '新建收件信息' : '编辑收件信息'}
          visible={visible}
          style={{ backgroundColor: '#f8f8f8' }}
          onCancel={this.handleCancel}
          maskClosable={false}
          destroyOnClose={true}
          footer={modalFooter}
        >
          <Form style={sty.form}>
            <Row>
              <Col>
                <FormItem
                  label="收件人"
                  {...formItemLayout}
                >
                  {getFieldDecorator('name',
                    {
                      initialValue: (formData && formData.name) || '',
                      rules: [
                        { required: true, message: '不能为空' },
                      ]
                    })(
                      <Input
                        placeholder="请输入收件人姓名"
                        maxLength="20"
                      />
                    )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col>
                <FormItem
                  label="联系方式"
                  {...formItemLayout}
                >
                  {getFieldDecorator('contact',
                    {
                      initialValue: (formData && formData.contact) || '',
                      rules: [
                        { required: true, message: '不能为空' },
                      ]
                    })(
                      <Input
                        placeholder="请输入手机号或区位号+座机号"
                        maxLength="20"
                      />
                    )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col>
                <FormItem
                  label='收件地址'
                  {...formItemLayout}
                  required={true}
                >
                  {getFieldDecorator('regularArea',
                    {
                      initialValue: (formData && formData.addressIds) || [],
                      rules: [
                        {
                          validator: (rules, value, callback) => {
                            if (!value || !Array.isArray(value)) {
                              callback('不能为空')
                              return
                            }
                            if (value.length != 3) {
                              callback('不能为空')
                            } else {
                              callback()
                            }
                          }
                        }
                      ],
                    })(
                      <SmartCascaderTerritory
                        placeholder="请选择省/市/区"
                        onBlur={this.handleValueChange}
                        editStatus={true}
                      />
                    )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col>
                <FormItem
                  style={sty.street}
                  {...streetFormItemLayout}
                >
                  {getFieldDecorator('street',
                    {
                      initialValue: (formData && formData.street) || '',
                      rules: [
                        { required: true, message: '不能为空' },
                        { max: 50, message: '不能超过50个字符' }
                      ],
                    })(
                      <textarea
                        style={sty.textarea}
                        maxLength='50'
                        placeholder="请输入详细地址"
                      />
                    )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    )
  }
}
ReceiptInfo = Form.create({})(ReceiptInfo);
export default ReceiptInfo
