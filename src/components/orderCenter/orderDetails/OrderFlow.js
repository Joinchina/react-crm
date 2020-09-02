import React from 'react'
import Title from '../../common/Title'
import { Timeline } from 'antd'
import { isArray, isLagel } from '../../../helpers/checkDataType'
import BaseComponent from '../../BaseComponent'
import moment from 'moment'
import { prop } from '@wanhu/react-redux-mount'

export default class OrderFlow extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            tab: 'orderFlow',
        }
    }

    openTab = (tab) => {
        this.setState({ tab });
    }

    render() {
        const data = isLagel(this.props.data)
        const orderFlow = isArray(data.orderFlow)
        const expressFlow = this.props.expressFlow || [];
        return (
            <div>
                <div>
                    {data && expressFlow && expressFlow.length > 0?
                        <Title left={10}>
                            <div className="nav">
                                <span style={{ fontWeight: 'normal', color: 'inherit', marginRight: 20, }} >
                                    <a className={this.state.tab === 'orderFlow' ? 'current' : null} onClick={() => this.openTab('orderFlow')}>
                                        订单流水
                                    </a>
                                </span>
                                <span style={{ fontWeight: 'normal', color: 'inherit', marginRight: 20, }} >
                                    <a className={this.state.tab === 'expressFlow' ? 'current' : null} onClick={() => this.openTab('expressFlow')}>
                                        配送流水
                                    </a>
                                </span>
                            </div>
                        </Title> :
                        <Title text='订单流水' left={5} />
                    }
                    {this.state.tab === 'orderFlow' ?
                        <Timeline className='timeline-box'>
                            {
                                orderFlow.map((item, index) => {
                                    let defaultText = `${item.userName}处理订单，状态${super.orderStatus(item.status)}`;
                                    return (
                                        <Timeline.Item key={index}>
                                            <span><i></i>{moment(item.createDate).format('YYYY-MM-DD HH:mm:ss')}</span>
                                            {item.status === "1"
                                                ? `${item.userName}支付订单，支付状态更新为已支付`
                                                : defaultText}
                                            {item.status == '97' ?
                                                <span style={{ backgroundColor: 'unset', fontSize: '14px', paddingLeft: '0px' }}
                                                    dangerouslySetInnerHTML={{ __html: `；${item.content}` }}>
                                                </span> : null}
                                        </Timeline.Item>
                                    )
                                })
                            }

                        </Timeline> :
                        <Timeline className='timeline-box'>
                            {
                                expressFlow.map((item, index) => {
                                    let defaultText = item.remark;
                                    return (
                                        <Timeline.Item key={index}>
                                            <span><i></i>{moment(item.acceptTime).format('YYYY-MM-DD HH:mm:ss')}</span>
                                            {item.remark}
                                        </Timeline.Item>
                                    )
                                })
                            }

                        </Timeline>
                    }
                </div>
            </div>
        )
    }
}
