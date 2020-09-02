import React from 'react';
import { Row, Col } from 'antd';
import moment from 'moment';
import Title from '../../common/Title';
import WHLabel from '../../common/WH-Label';
import { isArray, isLagel } from '../../../helpers/checkDataType';
import { centToYuan, isValidMoneyCent } from '../../../helpers/money';
import PropTypes from '../../../helpers/prop-types';

const paymentClassMap = {
    1: '药品费用',
    2: '运费',
    default: '-',
};
const formatMoney = (num, digits) => {
    const nums = Number(num);
    if (isValidMoneyCent(nums)) {
        return `¥${centToYuan(nums, digits || 2)}`;
    }
    return '-';
};
const channel = (channel) => {
    switch (channel) {
    case 1: return '医生端';
    case 2: return '指挥中心';
    case 3: return '呼叫中心';
    case 4: return '药店端预定';
    case 5: return '药店端现场购药';
    case 6: return '万户健康微信号';
    case 7: return '第三方';
    case 8: return '万户微孝';
    case 9: return '主动配送';
    case 10: return '健康卡服务';
    case 11: return '平安慢病卡';
    case 12: return '七鱼客服';
    case 13: return 'PBM APP';
    default: return channel;
    }
};

export default function Message(props) {
    let { data } = props;
    data = isLagel(data);
    const paymentInfo = isArray(data.paymentInfo);
    const shippingAddress = isLagel(data.shippingAddress);
    const createBy = isLagel(data.createBy);
    const orderHospital = isLagel(data.orderHospital);
    const pharmacistAudited = isLagel(data.pharmacistAudited);
    let deliveryAddressType;
    if (data.deliveryAddressType) {
        if (data.deliveryAddressType === 1 || data.deliveryAddressType === 3) {
            deliveryAddressType = '配送';
        } else {
            deliveryAddressType = '自提';
        }
    } else {
        deliveryAddressType = '-';
    }
    const selfPickupAddress = deliveryAddressType == '自提' ? data && data.shippingAddress && data.shippingAddress.shippingAddressName || '-' : '-';
    return (
        <div>
            <div>
                <Title text="应付信息" left={5} />
                <Row gutter={40} className="label-box">
                    <Col className="label-col" span={6}>
                        <WHLabel title="应付金额" text={formatMoney(data.advancePayment && data.advancePayment.patientPaymentAmount)} />
                    </Col>
                    <Col className="label-col" span={6}>
                        <WHLabel title="药品费用" text={formatMoney(data.advancePayment && data.advancePayment.drugAmount)} />
                    </Col>
                    <Col className="label-col" span={6}>
                        <WHLabel title="运费" text={formatMoney(data.advancePayment && data.advancePayment.freightAmount)} />
                    </Col>
                </Row>
                <Title text="付款信息" left={5} />
                <div className="label-box">
                    {paymentInfo.map((item, index) => (
                        <Row gutter={40} key={item.id || index}>
                            <Col className="label-col" span={6}>
                                <WHLabel title="付款项目" text={paymentClassMap[item.paymentClass]} />
                            </Col>
                            <Col className="label-col" span={6}>
                                <WHLabel title="付款方式" text={item.isDiseaseCard === 0 ? `${item.paymentType}（门慢）` : item.paymentType} />
                            </Col>
                            <Col className="label-col" span={6}>
                                <WHLabel
                                    title="付款金额"
                                    text={(() => formatMoney(item.amount))()}
                                />
                            </Col>
                            <Col className="label-col" span={6}>
                                <WHLabel title="付款时间" text={item.createDate === '-' ? '-' : moment(item.createDate).format('YYYY-MM-DD HH:mm:ss')} />
                            </Col>
                        </Row>
                    ))
                    }
                </div>
                <Title text="收件人信息" left={5} />
                <Row className="label-box" gutter={40}>
                    <Col className="label-col" span={6}>
                        <WHLabel title="收件人" text={data.deliveryRecipientName} />
                    </Col>
                    <Col className="label-col" span={6}>
                        <WHLabel title="联系方式" text={data.deliveryRecipientContact} />
                    </Col>

                </Row>
                <Title text="配送信息" left={5} />
                <Row className="label-box" gutter={40}>
                    <Col className="label-col" span={6}>
                        <WHLabel title="配送方式" text={deliveryAddressType || ''} />
                    </Col>
                    <Col className="label-col" span={8}>
                        <WHLabel title="收件地址" text={data.deliveryAddress ? data.deliveryAddress : shippingAddress.address} />
                    </Col>
                    <Col className="label-col" span={6}>
                        <WHLabel title="自提点" text={selfPickupAddress} />
                    </Col>
                    <Col className="label-col" span={6}>
                        <WHLabel title="承运商" text={(data.logisticsInformation && data.logisticsInformation.expressCompany) || '-'} />
                    </Col>
                    <Col className="label-col" span={6}>
                        <WHLabel title="运单编号" text={(data.logisticsInformation && data.logisticsInformation.expressNumber) || '-'} />
                    </Col>
                </Row>
                <Title text="系统信息" left={5} />
                <Row className="label-box" gutter={40}>
                    <Col className="label-col" span={6}>
                        <WHLabel title="创建人" text={createBy.createByName} />
                    </Col>
                    <Col className="label-col" span={6}>
                        <WHLabel title="创建机构" text={createBy.createCompany} />
                    </Col>
                    <Col className="label-col" span={6}>
                        <WHLabel title="创建时间" text={moment(createBy.createDate).format('YYYY-MM-DD HH:mm:ss')} />
                    </Col>
                    <Col className="label-col" span={6}>
                        <WHLabel
                            title="创建系统"
                            text={
                                channel(createBy.channel)
                            }
                        />
                    </Col>
                    <Col className="label-col" span={6}>
                        <WHLabel title="开具医生" text={orderHospital.orderDoctorName} />
                    </Col>
                    <Col className="label-col" span={6}>
                        <WHLabel title="开具医院" text={orderHospital.orderHospitalName} />
                    </Col>
                    <Col className="label-col" span={6}>
                        <WHLabel title="开具时间" text={orderHospital.orderDate && moment(orderHospital.orderDate).format('YYYY-MM-DD HH:mm:ss')} />
                    </Col>
                    <Col className="label-col" span={6}>
                        <WHLabel title="开具系统" text={channel(orderHospital.channel)} />
                    </Col>
                    <Col className="label-col" span={6}>
                        <WHLabel title="审核药师" text={pharmacistAudited.pharmacistAuditedName} />
                    </Col>
                    <Col className="label-col" span={6}>
                        <WHLabel title="审核机构" text={pharmacistAudited.pharmacistAuditedCompany} />
                    </Col>
                    <Col className="label-col" span={6}>
                        <WHLabel title="审核日期" text={pharmacistAudited.pharmacistAuditedDate && moment(pharmacistAudited.pharmacistAuditedDate).format('YYYY-MM-DD HH:mm:ss')} />
                    </Col>
                    <Col className="label-col" span={6}>
                        <WHLabel title="审核系统" text={pharmacistAudited.pharmacistSystem} />
                    </Col>
                </Row>
            </div>
        </div>
    );
}

Message.propTypes = {
    data: PropTypes.shape({}).isRequired,
};
