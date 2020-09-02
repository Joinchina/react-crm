import React, { Component } from 'react'
import Title from '../../common/Title'
import { Row, Col } from 'antd'
import WHLabel from '../../common/WH-Label'
import { isLagel } from '../../../helpers/checkDataType'

export default class Message extends Component {

  render () {
    const data = isLagel(this.props.data)
    const receiveInfo = isLagel(data.receiveInfo)
    const deliveryInfo = isLagel(data.deliveryInfo)
    const deliveryAddressType =  deliveryInfo.deliveryAddressType ? deliveryInfo.deliveryAddressType === 1 || deliveryInfo.deliveryAddressType === 3 ? '配送' : '自提' : '-';
    const selfPickupAddress = deliveryAddressType === '自提' ? data.hospitalName : '-';
    return (
      <div>
          <Title text='收件人信息' left={5}/>
          <Row className='label-box' gutter={40}>
            <Col className='label-col' span={6}>
              <WHLabel title='收件人' text={receiveInfo.deliveryReceipientName}/>
            </Col>
            <Col className='label-col' span={6}>
              <WHLabel title='联系方式' text={receiveInfo.deliveryReceipientContact}/>
            </Col>           
          </Row>
          <Title text='配送信息' left={5}/>
          <Row className='label-box' gutter={40}>
            <Col className='label-col' span={6}>
              <WHLabel title='配送方式' text={deliveryAddressType || ''}/>
            </Col>
            <Col className='label-col' span={6}>
              <WHLabel title='收件地址' text={deliveryInfo.deliveryAddress ? deliveryInfo.deliveryAddress : deliveryInfo.address}/>
            </Col>
            <Col className='label-col' span={6}>
              <WHLabel title='自提点' text={selfPickupAddress}/>
            </Col>
          </Row>
          <Row className='label-box' gutter={40} style={{paddingTop: 0}}>
              <Col className='label-col' span={6}>
                <WHLabel title='承运商' text={deliveryInfo.deliveryAgent}/>
              </Col>
              <Col className='label-col' span={6}>
                <WHLabel title='运单编号' text={deliveryInfo.malino}/>
              </Col>
          </Row>
      </div>
    )
  }
}
