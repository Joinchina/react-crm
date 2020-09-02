import React from 'react'
import Title from '../../common/Title'
import Prompt from '../../common/Prompt'
import WHLabel from '../../common/WH-Label'
import { Row, Col, Table, Modal, Icon } from 'antd'
import BaseComponent from '../../BaseComponent'
import { isArray, isLagel } from '../../../helpers/checkDataType'
import { centToYuan, isValidMoneyCent, refundRountCentPercentToCent } from '../../../helpers/money';
import CreateOrderLink from '../../common/CreateOrderLink';
import moment from 'moment';
import Viewer from '../../toolcase/Viewer';

const { Column } = Table

export default class MedicationOrder extends BaseComponent {

    state = {
        visible: false,
    }
    replace(data, text) {
        if (data === 0 || isNaN(data)) {
            return '-'
        } else {
            if (text) return `${data}${text}`
            return `${data}`
        }
    }

    replaceZero(data, text) {
        if (data === 0 || isNaN(data)) {
            return '-'
        } else {
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

    openImg(pictures) {
        const pic = pictures.map((p) => { return { url: p, alt: p } });
        Viewer(pic, {
            navbar: false,
            toolbar: true,
            title: false,
        });
    }

    render() {
        const data = isLagel(this.props.data)
        const patient = isLagel(data.patient)
        const diseases = isArray(data.diseases)
        let tableData = isArray(data.drugs)
        let moneyCent = 0
        let whMoneyCentPercent = 0
        let realyMoneyCent = data.realAmount
        let realyWhMoneyCentPercent = 0
        tableData.forEach((item) => {
            moneyCent += item.priceCent * item.amount;
            whMoneyCentPercent += item.priceCent * item.amount * item.whScale;

            realyWhMoneyCentPercent += item.priceCent * item.realQuantity * item.realWhScale;
        });
        const realyWhMoneyCent = isValidMoneyCent(realyWhMoneyCentPercent) ? refundRountCentPercentToCent(realyWhMoneyCentPercent) : NaN;
        let whMoneyCent = isValidMoneyCent(whMoneyCentPercent) ? refundRountCentPercentToCent(whMoneyCentPercent) : NaN;
        const refundCont = data.pointsDeductionAmount && this.props.upDateRefundMoney
            ? this.props.upDateRefundMoney.amount : this.formatMoney(whMoneyCent, 1);
        console.log('whMoneyCent', whMoneyCent);
        whMoneyCent = data.pointsDeductionAmount && this.props.upDateRefundMoney
            ? this.props.upDateRefundMoney.integral : whMoneyCent;
        const tableFoot = <div>
            <div style={{ float: 'left' }}>
                {
                    data.pictures && data.pictures.length > 0 ?
                        <span>处方图片({data.pictures.length}):<a onClick={() => this.openImg(data.pictures)}><Icon type="picture" style={{ fontSize: '25px' }} /></a></span> : null
                }
            </div>
            <div className='table-footer'>
                <div>
                    <span>合计金额：{this.formatMoney(moneyCent)}</span>
                    <span>报销额：{refundCont}</span>
                    <span>报销后金额：{this.formatMoney(moneyCent - whMoneyCent)}</span>
                </div>
                <div>
                    <span>实售金额：{this.replaceZero(realyMoneyCent, this.formatMoney(realyMoneyCent))}</span>
                    <span>报销现金额：{`${data && data.refundMoney ? '￥' + data.refundMoney : '-'}`}</span>
                    <span>报销积分额：{data.refundPoints}</span>
                </div>
                <div>
                    <span>实报后金额：{this.replaceZero(realyMoneyCent - (data.refundMoney ? data.refundMoney * 100 : 0), this.formatMoney(realyMoneyCent - (data.refundMoney ? data.refundMoney * 100 : 0)))}</span>
                </div>
            </div>
        </div>
        return (
            <div>
                <div>
                    <Modal
                        visible={this.state.visible}
                        footer={null}
                        onCancel={() => { this.setState({ visible: false }); }}
                        className="imageModal"
                    >
                        <div className="picModal" style={{ width: window.innerWidth * 0.85, height: window.innerHeight * 0.85 }}>
                            <img
                                alt="example"
                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }}
                                src={this.state.imgUrl}
                            />
                        </div>

                    </Modal>
                    <Title text='用药订单' num={data.orderNo} left={5}>
                        <Prompt text={super.orderStatus(data.status)} />
                        {
                            data.prescriptionStatus
                                ? <Prompt text={super.prescriptionStatus(data.prescriptionStatus)} />
                                : null
                        }
                        {
                            data.isPay !== undefined && data.isPay !== null
                                ? (<span style={{ paddingLeft: '10px', color: data.isPay === 1 ? '#169F85' : '#FF8C00' }}><Icon type="exclamation-circle-o" /> {super.isPay(data.isPay)}</span>)
                                : null
                        }
                        {/* {data.status === 50 ? <span style={{ marginLeft: 10 }}>预计回收时间：{moment(data.estimateReclamationDate).format('YYYY-MM-DD')}</span> : null} */}
                    </Title>
                    <Row className='label-box' gutter={40}>
                        <Col className='label-col' span={6}>
                            <WHLabel title='姓名' text={<span>{patient.patientName}
                                {patient.info && patient.info.isEdit ?
                                    <CreateOrderLink patientId={patient.id} />
                                    : null}
                            </span>
                            } />
                        </Col>
                        <Col className='label-col' span={6}>
                            <WHLabel title='性别' text={super.sex(patient.patientSex)} />
                        </Col>
                        <Col className='label-col' span={6}>
                            <WHLabel title='年龄' text={patient.patientAge ? patient.patientAge + '岁' : ''} />
                        </Col>
                        <Col className='label-col' span={6}>
                            <WHLabel title='身份证号' text={patient.patientIdCard} />
                        </Col>
                        <Col className='label-col' span={6}>
                            <WHLabel title='疾病诊断' text={diseases.map((item) => `${item.name} `)} />
                        </Col>
                        <Col className='label-col' span={6}>
                            <WHLabel title='过敏史' text={patient.allergies} />
                        </Col>
                        <Col className='label-col' span={12}>
                            <WHLabel title='用药周期' text={data.cycle ? data.cycle + '天' : ''} />
                        </Col>

                    </Row>
                </div>
                <div className='table-box no-hover'>
                    <Title text='药品信息' bColor='white' left={10} />
                    <Table rowKey='id' dataSource={tableData} pagination={false} footer={() => {
                        return tableFoot
                    }
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
                            render={(text, record) => this.formatMoney(text).replace('¥', '')}
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
                                        this.replace(text, record.packageUnit)
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
