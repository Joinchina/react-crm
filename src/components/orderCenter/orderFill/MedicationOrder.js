import React from 'react'
import Title from '../../common/Title'
import Prompt from '../../common/Prompt'
import WHLabel from '../../common/WH-Label'
import { Row, Col, Table } from 'antd'
import BaseComponent from '../../BaseComponent'
import { isArray, isLagel } from '../../../helpers/checkDataType'
import { centToYuan, isValidMoneyCent, refundRountCentPercentToCent } from '../../../helpers/money';

const { Column } = Table
const StatusChoices = [
  { value: '3', label: '待承运' },
  { value: '5', label: '待备货' },
  { value: '6', label: '备货中' },
  { value: '7', label: '待审核' },
  { value: '10', label: '待出库' },
  { value: '20', label: '已出库' },
  { value: '30', label: '已收货' },
  { value: '40', label: '已验货' },
  { value: '45', label: '待审核' },
  { value: '50', label: '待退回' },
  { value: '60', label: '退回中' },
  { value: '70', label: '已退回'},
  { value: '99', label: '已发药'},
  { value: '98', label: '包裹丢失' },
  { value: '97', label: '撤销' },
];

const StatusMap = {};
StatusChoices.forEach(item => StatusMap[item.value] = item.label);
export default class MedicationOrder extends BaseComponent {

  replace (data, text) {
    if(data === 0 || isNaN(data)){
      return '-'
    }else{
      if(text) return `${data}${text}`
      return `${data}`
    }
  }

  replaceZero (data, text) {
    if(data === 0 || isNaN(data)){
      return '-'
    }else{
      return text
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

  render () {
    const data = isLagel(this.props.data)
    let tableData = isArray(data.drugs)
    let moneyCent = 0
    let whMoneyCentPercent = 0
    let realyMoneyCent = 0
    let realyWhMoneyCentPercent = 0
    tableData.forEach((item) =>{
      moneyCent += item.priceCent * item.amount;
      whMoneyCentPercent += item.priceCent * item.amount * item.whScale;
      realyMoneyCent += item.priceCent * item.realQuantity;
      realyWhMoneyCentPercent += item.priceCent * item.realQuantity * item.whScale;
    });
    const realyWhMoneyCent = isValidMoneyCent(realyWhMoneyCentPercent) ? refundRountCentPercentToCent(realyWhMoneyCentPercent) : NaN;
    const whMoneyCent = isValidMoneyCent(whMoneyCentPercent) ? refundRountCentPercentToCent(whMoneyCentPercent) : NaN;
    const tableFoot = <div className='table-footer'>
      <div>
        <span>合计金额：{this.formatMoney(moneyCent)}</span>
        <span>报销额：{this.formatMoney(whMoneyCent, 1)}</span>
        <span>报销后金额：{this.formatMoney(moneyCent-whMoneyCent)}</span>
      </div>
      <div>
        <span>实售金额：{this.replaceZero(realyMoneyCent, this.formatMoney(realyMoneyCent))}</span>
        <span>实报销额：{this.replaceZero(realyWhMoneyCent, this.formatMoney(realyWhMoneyCent, 1))}</span>
        <span>实报后金额：{this.replaceZero(realyMoneyCent - realyWhMoneyCent, this.formatMoney(realyMoneyCent - realyWhMoneyCent))}</span>
      </div>
    </div>
    return (
      <div>
      <div>
        <Title text='包裹单' num={data.orderfillNo} left={5}>
          <Prompt text={StatusMap[data.status]}/>
        </Title>
        <Row className='label-box' gutter={40}>
          <Col className='label-col' span={6}>
            <WHLabel title='姓名' text={<span>{data.patientName}</span>
            }/>
          </Col>
          <Col className='label-col' span={6}>
            <WHLabel title='用药订单编号' text={data.orderNo}/>
          </Col>
          <Col className='label-col' span={6}>
            <WHLabel title='签约机构' text={data.hospitalName}/>
          </Col>
          <Col className='label-col' span={6}>
            <WHLabel title='创建时间' text={data.createDate}/>
          </Col>
        </Row>
      </div>
      <div className='table-box no-hover'>
        <Title text='药品信息' bColor='white' left={10}/>
        <Table rowKey='id' dataSource={tableData} pagination={false} footer={()=>{
          return tableFoot}
        }>
          <Column
            title="产品编码"
            dataIndex="productCode"
            key="productCode"
          />
          <Column
            title="通用名（商品名称）"
            dataIndex="commonName"
            key="commonName"
            render={
              (text, record) => (
                record.productName ? `${text}(${record.productName})` : `${text}`
              )
            }
          />
          <Column
            title="规格"
            dataIndex="packageSize"
            key="packageSize"
            render={(text, record) => (
              <span>
                {
                  `${record.preparationUnit}*${text}${record.minimumUnit}/${record.packageUnit}`
                }
              </span>
            )}
          />
          <Column
            title="单次用量"
            dataIndex="useAmount"
            key="useAmount"
            render={(text, record) => (
              <span>
                {
                  `${text}${record.minimumUnit}`
                }
              </span>
            )}
          />
          <Column
            title="频次"
            dataIndex="frequency"
            key="frequency"
            render={(text, record) => {
              text = isNaN(parseInt(text, 10)) ? text : parseInt(text, 10)
              switch (text) {
                case 1: return 'qd 每日一次'
                case 2: return 'bid 每日两次'
                case 3: return 'tid 每日三次'
                case 4: return 'qid 每日四次'
                case 5: return 'qn 每夜一次'
                case 6: return 'qw 每周一次'
                default: return text
              }
            }}
          />
          <Column
            title="单价¥"
            dataIndex="priceCent"
            key="priceCent"
            render={(text, record) => this.formatMoney(text).replace('¥','')}
          />
          <Column
            title="购买数量"
            dataIndex="amount"
            key="amount"
            render={(text, record) => (
              <span>
                {
                  `${text}${record.packageUnit}`
                }
              </span>
            )}
          />
          <Column
            title="实售数量"
            dataIndex="realQuantity"
            key="realQuantity"
            render={(text, record) => (
              <span>
                {
                  this.replace(text,record.packageUnit)
                }
              </span>
            )}
          />
        </Table>
      </div>
      </div>
    )
  }
}
