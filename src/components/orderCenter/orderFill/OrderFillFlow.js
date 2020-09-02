import React from 'react'
import Title from '../../common/Title'
import { Timeline  } from 'antd'
import { isArray, isLagel } from '../../../helpers/checkDataType'
import BaseComponent from '../../BaseComponent'
import moment from 'moment'

export default class OrderFillFlow extends BaseComponent {

  render () {
    const data = isLagel(this.props.data)
    const orderFlow = isArray(data.orderFlow)
    return (
      <div>
        <div>
        <Title text='包裹流水' left={5}/>
        <Timeline className='timeline-box'>
          {
            orderFlow.map((item, index) =>
            <Timeline.Item key={index}>
                <span><i></i>{moment(item.createDate).format('YYYY-MM-DD HH:mm:ss')}</span>
                {item.content} 处理人：{item.userName}
            </Timeline.Item>)
          }
        </Timeline>
        </div>
      </div>
    )
  }
}
