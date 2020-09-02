import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  Row,
  Col,
  Breadcrumb,
  Table,
  Timeline,
  Spin,
  Icon,
  Modal,
  Button,
  message,
} from 'antd';
import Title from '../../common/Title';
import WHLabel from '../../common/WH-Label';
import Prompt from '../../common/Prompt';
import moment from 'moment';
import Viewer from '../../toolcase/Viewer';
import history from '../../../history';
import api from '../../../api/api';
import { connect } from '../../../states/insurance/insuranceInfo';
import { connectRouter } from '../../../mixins/router';
import {
  centToYuan,
  isValidMoneyCent,
  refundRountCentPercentToCent,
} from '../../../helpers/money';
import './index.css';
import HasPermission, { testPermission } from '../../common/HasPermission';
import { requestPost, uploadFilesId } from '../../../createRequest.js';
// 会员卡片弹窗
import CustomerCart from '../../customerCenter/CustomerCard';
const styles = {
  text: {
    wordWrap: 'break-word',
  },
  title: {
    display: 'inline-block',
    height: 22,
    lineHeight: '22px',
    backgroundColor: 'white',
    paddingRight: 10,
    marginBottom: '-1px',
  },
  box: {
    borderBottom: 'solid 1px #e0e0e2',
    minHeight: '22px',
    display: 'flex',
  },
};

const PatientOrderStatusChoices = [
  {
    value: '0',
    label: '待确认',
  },
  {
    value: '1',
    label: '已确认',
  },
  {
    value: '2',
    label: '核保中',
  },
  {
    value: '3',
    label: '已承保',
  },
  {
    value: '4',
    label: '已完成',
  },
  {
    value: '5',
    label: '已出险',
  },
  {
    value: '6',
    label: '已撤单',
  },
  {
    value: '7',
    label: '失效',
  },
];

const payStatus = [
  {
    value: '0',
    label: '待支付',
  },
  {
    value: '1',
    label: '已支付',
  },
];

const product_type = {
  1: '保险',
  2: '体检',
  3: '健康教育',
  4: '视频医生',
  5: '医药福利',
  6: '线下医生服务',
};

const releation_ship = {
  1: '本人',
  2: '配偶',
  3: '父母',
  4: '子女',
};

function getLabel(itemMap, itemValue) {
  const item = itemMap.find((i) => i.value == itemValue);
  return item ? item.label : '';
}
class InsuranceOrderDetail extends Component {
  constructor(props) {
    super(props);
    this.insuranceId = this.props.match.params.insuranceId;
    this.props.getInsuranceOrderDetail(this.insuranceId);
    this.state = {
      loading: false,
      orderList: [],
      passCardPhone: '',
      passCard: false,
      passCardPhone2: '',
      passCard2: false,
      customerCardVisible: false,
      currentCustomerId: null,
    };
  }

  async componentDidMount() {}

  componentWillReceiveProps(props) {
    if (this.insuranceId !== props.match.params.insuranceId) {
      this.insuranceId = this.props.match.params.insuranceId;
      this.props.resetPage();
    }
  }
  get backToIndex() {
    if (
      this.props.router.query.r &&
      this.props.router.query.r.indexOf('/patientInsurance') === 0
    ) {
      return this.props.router.query.r;
    } else {
      return '/patientInsurance';
    }
  }

  formatMoney(num, digits) {
    num = Number(num);
    if (isValidMoneyCent(num)) {
      return `¥${centToYuan(num, digits || 2)}`;
    } else {
      return '-';
    }
  }

  openImg(pictures) {
    const pic = pictures.map((p) => {
      return { url: p, alt: p };
    });
    Viewer(pic, {
      navbar: false,
      toolbar: true,
      title: false,
    });
  }

  showDetail() {
    history.push(
      `/patientInsuranceOrderInfo/${this.insuranceId}?r=${encodeURIComponent(
        this.props.router.queryCache.r
      )}`
    );
  }
  haveTime(info) {
    let nowTime = new Date().getTime();
    let isPress =
      new Date(info.serviceStartDate).getTime() +
      info.hesitationDays * 24 * 60 * 60 * 1000;
    if (nowTime > isPress) {
      return true;
    } else {
      return false;
    }
  }
  //发送体检卡t
  passCard(info, phone) {
    //检查体检订单和服务订单是否已绑定体检卡
    if (info.status == 20 || info.status == 99) {
      this.setState({
        passCard: true,
        passCardPhone: phone,
        passCardInfo: info,
      });
    }
    if (info.status == 10) {
      //未绑定
      this.setState({
        passCard2: true,
        passCardPhone2: phone,
        passCardInfo2: info,
      });
    }
  }
  //上传PDF
  importPDF(id, e) {
    const files = e.target.files;
    console.log(files);
    let file = '';
    for (const key in files) {
      const ele = files[key];
      if (typeof ele == 'object') {
        file = ele;
      }
    }
    uploadFilesId(
      `_api/hd/medicalExaminationCards/uploadReport?insuranceOrderProductId=${id.productId}`,
      file,
      id.productId,
      () => {}
    )
      .then((res) => {
        console.log('上传成功', res);
        let xx = document.getElementById('file');
        xx.value = '';
        if (res.code === 0) {
          if (res.data.errorMessage) {
            message.error(res.data.errorMessage);
          } else {
            message.success('上传成功');
            this.props.getInsuranceOrderDetail(this.insuranceId);
          }
        } else {
          message.error(res.message);
        }
      })
      .catch((err) => {
        console.log('上传失败', err);
        message.error('上传失败');
      });
    console.log(id);
  }
  //查看pdf
  viewPDF(info) {
    window.open(`${info.mecResultPdf}`, '_blank');
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
    const {
      loading,
      orderList,
      passCardPhone,
      passCard,
      passCardPhone2,
      passCard2,
    } = this.state;
    const data = this.props.insuranceOrderDetail.payload || {};
    const insuranceInfo = data || {};
    const columns = [
      {
        title: '编号',
        dataIndex: 'productCode',
        key: 'productCode',
      },
      {
        title: '类别',
        dataIndex: 'productType',
        key: 'productType',
        render: (text) => <span>{product_type[text]}</span>,
      },
      {
        title: '服务产品名称',
        dataIndex: 'productName',
        key: 'productName',
      },
      {
        title: '备注信息',
        dataIndex: 'note',
        key: 'note',
      },
      {
        title: '操作',
        render: (text, record) => {
          console.log(text, record);
          if (record.productType == 1) {
            return <a onClick={() => this.showDetail()}>查看</a>;
          } else if (record.productType == 2) {
            return (
              <div>
                {insuranceInfo.orderStatus != 6 &&
                insuranceInfo.orderStatus != 7 &&
                insuranceInfo.mecCardsClose === 1 &&
                insuranceInfo.serviceStartDate &&
                this.haveTime(insuranceInfo) &&
                testPermission('hd:medicalexaminationcard:send') ? (
                  record.status != 98 && record.status != 99 ? (
                    insuranceInfo.orderStatus === 4 &&
                    record.status === 10 ? null : (
                      <a
                        onClick={() =>
                          this.passCard(record, insuranceInfo.insuredPhone)
                        }
                        style={{ marginRight: '10px' }}
                      >
                        发送体检卡
                      </a>
                    )
                  ) : null
                ) : null}
                {insuranceInfo.orderStatus != 6 &&
                insuranceInfo.orderStatus != 7 &&
                insuranceInfo.mecCardsClose === 1 &&
                testPermission('hd:medicalexaminationcard:send') ? (
                  record.status != 98 && record.status != 10 ? (
                    <a
                      style={{
                        marginRight: '10px',
                        width: '56px',
                        height: '30px',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      上传报告
                      <input
                        type='file'
                        name='file'
                        id='file'
                        style={{
                          position: 'absolute',
                          top: '0',
                          left: '0',
                          width: '56px',
                          height: '47px',
                          opacity: '0',
                        }}
                        onChange={(e) => this.importPDF(record, e)}
                      />
                    </a>
                  ) : null
                ) : null}
                {insuranceInfo.orderStatus != 6 &&
                insuranceInfo.orderStatus != 7 &&
                insuranceInfo.mecResultPdf &&
                testPermission('hd:medicalexaminationcard:report') ? (
                  <a
                    onClick={() => this.viewPDF(insuranceInfo)}
                    style={{ marginRight: '10px' }}
                  >
                    查看报告
                  </a>
                ) : null}
              </div>
            );
          } else {
            return null;
          }
        },
      },
    ];
    const tableFoot = (
      <div>
        <div style={{ float: 'left' }}>
          <div style={styles.box}>
            <span style={styles.title}>授权截图：</span>
            {insuranceInfo.pics && insuranceInfo.pics.length ? (
              <a onClick={() => this.openImg(insuranceInfo.pics)}>
                <Icon type='picture' style={{ fontSize: '25px' }} />
                <span>
                  {insuranceInfo.pics.length > 1
                    ? `×${insuranceInfo.pics.length}`
                    : ''}
                </span>
              </a>
            ) : null}
          </div>
        </div>
        <div className='table-footer'>
          <div>
            <span>市场价：¥{insuranceInfo.marketPrice || 0.0}</span>
            <span>实售价：¥{insuranceInfo.salePrice || 0.0}</span>
          </div>
        </div>
      </div>
    );
    return (
      <div>
        <CustomerCart
          id={this.state.currentCustomerId}
          visible={this.state.customerCardVisible}
          hideCustomerCard={this.hideCustomerCard}
        ></CustomerCart>
        <Spin spinning={this.props.insuranceOrderDetail.status === 'pending'}>
          <div className='insurance_order_detail'>
            <Modal
              title='发送体检卡提醒'
              visible={passCard}
              onCancel={() => this.setState({ passCard: false })}
              footer={
                <Button
                  type='primary'
                  onClick={() => {
                    this.setState({ passCard: false });
                    //发短信已绑定
                    requestPost(
                      `_api/hd/medicalExaminationCards/send?productId=${this.state.passCardInfo.productId}`,
                      { productId: this.state.passCardInfo.productId }
                    )
                      .then((res) => {
                        console.log(res);
                        if (res.code == 0) {
                          message.success('体检卡发送成功');
                        } else {
                          message.error(res.message);
                        }
                      })
                      .catch((err) => {
                        message.error('发送体检卡错误');
                      });
                  }}
                >
                  确定
                </Button>
              }
            >
              <p>
                服务对象已经绑定体检卡，点击确定将再次发送体检卡信息到客户
                {passCardPhone}手机。
              </p>
            </Modal>
            <Modal
              title='体检卡发送成功提醒'
              visible={passCard2}
              onCancel={() => this.setState({ passCard2: false })}
              footer={
                <Button
                  type='primary'
                  onClick={() => {
                    requestPost(
                      `_api/hd/medicalExaminationCards/binding?productId=${this.state.passCardInfo2.productId}`,
                      { productId: this.state.passCardInfo2.productId }
                    )
                      .then((res) => {
                        if (res.code == 0) {
                          message.success('体检卡绑定成功');
                          this.setState({ passCard2: false });
                          this.props.getInsuranceOrderDetail(this.insuranceId);
                        } else {
                          message.error(res.message);
                        }
                      })
                      .catch((err) => {
                        message.error('绑定体检卡错误');
                      });
                  }}
                >
                  确定
                </Button>
              }
            >
              <p>
                体检卡信息已经以短信的形式发送到客户{passCardPhone2}的手机。
              </p>
            </Modal>
            <Breadcrumb className='breadcrumb-box'>
              <Breadcrumb.Item>
                <Link to={this.backToIndex}>会员服务管理</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>服务单详情</Breadcrumb.Item>
            </Breadcrumb>
            <Title text='服务单号' num={insuranceInfo.orderNo} left={5}>
              <Prompt
                text={
                  getLabel(
                    PatientOrderStatusChoices,
                    insuranceInfo.orderStatus
                  ) || '未知状态'
                }
              />
              <Prompt
                text={
                  getLabel(payStatus, insuranceInfo.payStatus) || '未知状态'
                }
              />
            </Title>
            <div style={{ backgroundColor: '#fff' }}>
              <Row className='label-box' gutter={40}>
                <Col className='label-col' span={8}>
                  <WHLabel
                    title='服务包名称：'
                    text={insuranceInfo.packageName}
                  />
                </Col>
                <Col className='label-col' span={8}>
                  <WHLabel
                    title='服务档次：'
                    text={insuranceInfo.packageGradeName}
                  />
                </Col>
                <Col className='label-col' span={8}>
                  <WHLabel
                    title='服务效期：'
                    text={
                      insuranceInfo.serviceStartDate
                        ? `${insuranceInfo.serviceStartDate || '-'}至${
                            insuranceInfo.serviceEndDate || '-'
                          }`
                        : ''
                    }
                  />
                </Col>
              </Row>
              <Row className='label-box' gutter={40}>
                <Col className='label-col' span={8}>
                  <WHLabel
                    title='缴费方式：'
                    text={
                      insuranceInfo.payWay == 1
                        ? '年缴'
                        : insuranceInfo.payWay == 2
                        ? '月缴'
                        : '-'
                    }
                  />
                </Col>
                <Col className='label-col' span={8}>
                  <WHLabel
                    title='犹豫期：'
                    text={
                      insuranceInfo.hesitationDays ||
                      insuranceInfo.hesitationDays == 0
                        ? insuranceInfo.hesitationDays + '天'
                        : '-'
                    }
                  />
                </Col>
                <Col className='label-col' span={8}>
                  <div style={styles.box}>
                    <span style={styles.title}>贫困属性：</span>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'row',
                      }}
                    >
                      <span style={styles.text}>
                        {insuranceInfo.poverty === 1
                          ? '贫困'
                          : insuranceInfo.poverty === 0
                          ? '非贫困'
                          : '-'}
                      </span>
                      {/* {insuranceInfo.poverty && insuranceInfo.poorProofPic && insuranceInfo.poorProofPic.length ? <a onClick={() => this.openImg(insuranceInfo.poorProofPic)}><Icon type="picture" style={{fontSize: '25px'}}/><span>{insuranceInfo.poorProofPic && insuranceInfo.poorProofPic.length > 1 ? `×${insuranceInfo.poorProofPic.length}` : ''}</span></a> : null} */}
                    </div>
                  </div>
                </Col>
              </Row>
              <Row className='label-box' gutter={40}>
                <Col className='label-col' span={8}>
                  <WHLabel
                    title='社保属性：'
                    text={
                      insuranceInfo.guarantee === 1
                        ? '有社保'
                        : insuranceInfo.guarantee === 0
                        ? '无社保'
                        : '-'
                    }
                  />
                </Col>
              </Row>
              <Title text='服务产品' left={5} />
              <div className='table-box tableBox'>
                <Table
                  loading={loading}
                  dataSource={insuranceInfo.products}
                  rowKey={(record) => record.id}
                  columns={columns}
                  pagination={false}
                  bordered={false}
                  footer={() => {
                    return tableFoot;
                  }}
                />
              </div>
              <Title text='服务对象' left={5} />
              <Row className='label-box' gutter={40}>
                <Col className='label-col' span={8}>
                  <div
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      this.showCustomerCard(insuranceInfo.insuredId);
                    }}
                  >
                    <WHLabel title='姓名' text={insuranceInfo.insuredName} />
                  </div>
                </Col>
                <Col className='label-col' span={8}>
                  <WHLabel
                    title='身份证号'
                    text={insuranceInfo.insuredIdCard}
                  />
                </Col>
                <Col className='label-col' span={8}>
                  <WHLabel
                    title='性别/年龄'
                    text={`${insuranceInfo.sex ? '男' : '女'} / ${
                      insuranceInfo.age || '-'
                    }`}
                  />
                </Col>
              </Row>
              <Row className='label-box' gutter={40}>
                <Col className='label-col' span={8}>
                  <WHLabel title='手机号码' text={insuranceInfo.insuredPhone} />
                </Col>
                <Col className='label-col' span={8}>
                  <WHLabel
                    title='与购买者关系'
                    text={releation_ship[insuranceInfo.relationShip]}
                  />
                </Col>
              </Row>
              <Title text='购买人信息' left={5} />
              <Row className='label-box' gutter={40}>
                <Col className='label-col' span={8}>
                  <div
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      this.showCustomerCard(insuranceInfo.insurerId);
                    }}
                  >
                    <WHLabel title='姓名' text={insuranceInfo.insurerName} />
                  </div>
                </Col>
                <Col className='label-col' span={8}>
                  <WHLabel
                    title='身份证号'
                    text={insuranceInfo.insurerIdCard}
                  />
                </Col>
                <Col className='label-col' span={8}>
                  <WHLabel title='手机号码' text={insuranceInfo.insurerPhone} />
                </Col>
              </Row>
              <Title text='订单流水' left={5} />
              <Timeline className='timeline-box'>
                {insuranceInfo &&
                insuranceInfo.logs &&
                insuranceInfo.logs.length
                  ? insuranceInfo.logs.map((item, index) => {
                      return (
                        <Timeline.Item key={index}>
                          <span>
                            {moment(item.date).format('YYYY-MM-DD HH:mm:ss')}
                          </span>
                          {item.content}
                        </Timeline.Item>
                      );
                    })
                  : null}
              </Timeline>
              <Title text='付款信息' left={5} />
              <div className='label-box'>
                {insuranceInfo.payments && insuranceInfo.payments.length
                  ? insuranceInfo.payments.map((item, index) => (
                      <Row gutter={40} key={item.id || index}>
                        <Col className='label-col' span={8}>
                          <WHLabel
                            title='付款方式'
                            text={item.paymentTypeName}
                          />
                        </Col>
                        <Col className='label-col' span={8}>
                          <WHLabel title='付款金额' text={`¥${item.amount}`} />
                        </Col>
                        <Col className='label-col' span={8}>
                          <WHLabel
                            title='付款时间'
                            text={
                              item.date === '-'
                                ? '-'
                                : moment(item.date).format(
                                    'YYYY-MM-DD HH:mm:ss'
                                  )
                            }
                          />
                        </Col>
                      </Row>
                    ))
                  : null}
              </div>
              <Title text='系统信息' left={5} />
              <Row className='label-box' gutter={40}>
                <Col className='label-col' span={8}>
                  <WHLabel title='创建人' text={insuranceInfo.createBy} />
                </Col>
                <Col className='label-col' span={8}>
                  <WHLabel title='创建来源' text={insuranceInfo.channel} />
                </Col>
                <Col className='label-col' span={8}>
                  <WHLabel title='创建时间' text={insuranceInfo.createDate} />
                </Col>
                <Col className='label-col' span={8}>
                  <WHLabel title='销售渠道' text={insuranceInfo.channelCode} />
                </Col>
              </Row>
            </div>
          </div>
        </Spin>
      </div>
    );
  }
}

export default connectRouter(connect(InsuranceOrderDetail));
