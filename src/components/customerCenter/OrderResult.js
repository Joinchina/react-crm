import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Input, Button, Form, Row, Col, Select, Modal, notification, Icon } from 'antd';
import { centToYuan } from '../../helpers/money';
const Option = Select.Option

import { connectModalHelper } from '../../mixins/modal';
import QrCode from '../common/QrCode';
class OrderResult extends Component {
    constructor() {
        super()
        this.orderNo = ''
    }

    handleCancel = () => {
        const asd = window.sessionStorage.getItem('patId')
        const warningText = window.sessionStorage.getItem('warningText')
        if (warningText) {
            this.props.closeModal()
            Modal.confirm({
                visible: true,
                title: (
                    <div>
                        <p style={{ textAlign: 'center' }}>
                            提示
                                </p>
                        <p style={{ marginTop: '5px', fontSize: '14px' }}>
                            <Icon
                                type="exclamation-circle"
                                size="lg"
                                style={{
                                    fontSize: '24px',
                                    color: '#ffbf00',
                                    marginRight: '16px',
                                }}
                            />
                            {warningText}
                            尚未维护，请维护规律订药信息
                                </p>
                    </div>),
                okText: '去维护',
                cancelText: '忽略',
                iconType: 'none',
                onOk: () => {
                    const { router } = this.props;
                    this.props.closeModal()
                    window.location.href = `/customerDetails/${asd}/RegularMedication`;
                    window.sessionStorage.setItem('patId', '')
                    window.sessionStorage.getItem('warningText', '')
                },
                onCancel: () => {
                    this.props.closeModal()
                    window.sessionStorage.setItem('patId', '')
                    window.sessionStorage.setItem('warningText', '')
                },
            });
        } else {
            this.props.closeModal()
            window.sessionStorage.setItem('patId', '')
            window.sessionStorage.setItem('warningText', '')
        }
    }

    componentWillMount() {
        let orderData = this.props.addMedicineRegister.orderResult
        if (!orderData) {
            this.handleCancel()
        }

    }

    componentWillReceiveProps(nextProps) {
        let orderData = nextProps.addMedicineRegister.orderResult
        if (!orderData) {
            this.handleCancel()
        }
        if (nextProps.addMedicineRegister.postFormResult && nextProps.addMedicineRegister.postFormResult.status === 'fulfilled' && nextProps.addMedicineRegister.postFormResult.payload.orderNo) {
            this.orderNo = nextProps.addMedicineRegister.postFormResult.payload.orderNo
        }
    }

    openCreateOrderModal() {
        this.props.openModal('createOrder')
    }

    getAgeByBirthday(dateString) {
        if (!dateString) return '';
        var today = new Date()
        var birthDate = new Date(dateString)
        var age = today.getFullYear() - birthDate.getFullYear()
        var m = today.getMonth() - birthDate.getMonth()
        return age
    }

    render() {
        let styles = {
            label: {
                textAlign: 'right'
            },
            row: {
                minHeight: '30px'
            }
        }
        let modalFooter = (
            <Row>
                <Button onClick={this.handleCancel} type='primary'>确认</Button>
                <Button loading={this.props.addMedicineRegister.postFormResult.status === 'pending' && this.props.addMedicineRegister.postFormResult.params.actionType === 'postThenClose'} onClick={this.openCreateOrderModal.bind(this)} type='primary'>继续登记</Button>
            </Row>
        )
        let orderData = this.props.addMedicineRegister.orderResult
        if (!orderData) {
            return null
        }
        const age = this.getAgeByBirthday(orderData.patientInfo.birthday);
        let medicines = orderData.medicineKeys.map(k => {
            let medicine = orderData[`medicine_${k}_data`]
            let amount = orderData[`medicine_${k}_amount`]
            let productName = medicine.productName ? `（${medicine.productName}）` : ''
            return (
                <Row style={styles.row} key={k}>{`${medicine.commonName + productName} *${amount}${medicine.packageUnit}`}</Row>
            )
        })
        const title = orderData.orderId ? '修改成功' : '登记成功';
        let inter = Number((orderData.totalFee * 100 || 0).toFixed()) + Number((orderData.freight * 100 || 0).toFixed()) - (orderData.points || 0)
        return (
            <Modal
                title={title}
                width={600}
                visible={true}
                style={{ backgroundColor: '#f8f8f8' }}
                onCancel={this.handleCancel}
                maskClosable={false}
                footer={modalFooter}
            >
                <QrCode value={orderData.orderNo} />
                <Row gutter={10} style={styles.row}>
                    <Col style={styles.label} span={8}>订单信息：</Col>
                    <Col span={16}>{orderData.orderNo}</Col>
                </Row>
                <Row gutter={10} style={styles.row}>
                    <Col style={styles.label} span={8}>会员信息：</Col>
                    <Col span={16}>{orderData.patientInfo.name}&nbsp;&nbsp;&nbsp;&nbsp;{orderData.patientInfo.sex ? '男' : '女'}&nbsp;&nbsp;&nbsp;&nbsp;{age ? age + '岁' : ''}</Col>
                </Row>
                <Row gutter={10} style={styles.row}>
                    <Col style={styles.label} span={8}>药品信息：</Col>
                    <Col span={16}>
                        {medicines}
                    </Col>
                </Row>
                <Row gutter={10} style={styles.row}>
                    <Col style={styles.label} span={8}><strong>预计服用时长：</strong></Col>
                    <Col span={16}><strong>{orderData.maxTakeTime}天</strong></Col>
                </Row>
                {orderData.isUpdate ? '' : (
                    <div>
                        <Row gutter={10} style={styles.row}>
                            <Col style={styles.label} span={8}><strong>药费合计：</strong></Col>
                            <Col span={16}><strong>¥{orderData.totalFee.toFixed(2)}</strong></Col>
                        </Row>
                        <Row gutter={10} style={styles.row}>
                            <Col style={styles.label} span={8}><strong>配送费：</strong></Col>
                            <Col span={16}><strong>¥{orderData.freight ? `${centToYuan(orderData.freight * 100 || 0, 2)}` : '0.00'}</strong></Col>
                        </Row>
                        {orderData.interval ? <Row gutter={10} style={styles.row}>
                            <Col style={styles.label} span={8}><strong>积分抵扣：</strong></Col>
                            <Col span={16}><strong>-¥{centToYuan(orderData.points, 2)}</strong></Col>
                        </Row> : null}
                        <Row gutter={10} style={styles.row}>
                            <Col style={styles.label} span={8}><strong>待付金额：</strong></Col>
                            <Col span={16}><strong>¥{centToYuan(inter, 2)}</strong></Col>
                        </Row>
                        <Row gutter={10} style={styles.row}>
                            <Col style={styles.label} span={8}><strong>最高报销：</strong></Col>
                            <Col span={16}>
                            <strong>¥{orderData.totalScale || 0}(或积分{orderData. totalScalePrice|| 0}分)</strong>
                            </Col>
                        </Row>
                        <Row gutter={10} style={styles.row}>
                            <Col span={8}/>
                            <Col span={16} style={{color: 'rgba(0, 0, 0, 0.65)'}}>(实际报销额度以最终结果为准)</Col>
                        </Row>
                        <div>
                            <Row gutter={10} style={styles.row}>
                                <Col style={styles.label} span={8}>收件时间：</Col>
                                <Col span={16}>{orderData.deliveryTime}</Col>
                            </Row>
                            <Row gutter={10} style={styles.row}>
                                <Col style={styles.label} span={8}>收件信息：</Col>
                                <Col span={16} style={{ wordBreak: 'break-all' }}>{orderData.deliveryAddress}</Col>
                            </Row>
                        </div>
                    </div>
                )}


            </Modal>
        )
    }
}

function select(state) {
    return {
        addMedicineRegister: state.addMedicineRegister,
    }
}

export default connectModalHelper(connect(select)(OrderResult))
