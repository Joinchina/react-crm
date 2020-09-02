import React, { Component } from 'react'
import { connect } from '../../../states/insurance/createPatientInsurance';
import { Button, Row, Col, Modal, } from 'antd';
import { connectModalHelper } from '../../../mixins/modal';

function analyzeIDCard(IDCard){
	var sexAndAge = {};
	//获取用户身份证号码
	var userCard = IDCard;
	//如果身份证号码为undefind则返回空
	if(!userCard){
		return sexAndAge;
	}
	//获取性别
	if(parseInt(userCard.substr(16,1)) % 2 == 1){
		sexAndAge.sex = '男'
	}else{
		sexAndAge.sex = '女'
	}
	//获取出生年月日
	//userCard.substring(6,10) + "-" + userCard.substring(10,12) + "-" + userCard.substring(12,14);
	var yearBirth = userCard.substring(6,10);
	var monthBirth = userCard.substring(10,12);
	var dayBirth = userCard.substring(12,14);
	//获取当前年月日并计算年龄
	var myDate = new Date();
	var monthNow = myDate.getMonth() + 1;
	var dayNow = myDate.getDay();
	var age = myDate.getFullYear() - yearBirth;
	if(monthNow < monthBirth || (monthNow == monthBirth && dayNow < dayBirth)){
		age--;
	}
	//得到年龄
	sexAndAge.age = age;
	//返回性别和年龄
	return sexAndAge;
}

const rel = {
    1: '本人',
    2: '配偶',
    3: '父母',
    4: '子女',
}

class PatientInsuranceResult extends Component {
    constructor(props) {
        super(props)
    }

    componentWillMount() {
        /* const data = this.props.createStatus.payload
        if(!data){
            this.handleCancel()
        } */
    }

    componentWillReceiveProps(nextProps) {
        /* const data = this.props.createStatus.payload
        if(!data){
            this.handleCancel()
        } */
    }

    handleCancel = () => {
        this.restForm()
        this.props.closeModal();
    }

    restForm() {
        const {setInsuraceSelected,setSelectedInsuranceId,setInsuranceSubmitData,setToNextData,saveDiseaseInfo,savePutData} = this.props;
        setInsuraceSelected(null)
        setSelectedInsuranceId(null)
        setInsuranceSubmitData(null)
        setToNextData(null)
        saveDiseaseInfo(null)
        savePutData(null)
    }

    openPatientInsuranceModal() {
        this.restForm()
        this.props.closeModal();
        this.props.openModal('newPatientInsurance')
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
        const idata = this.props.getSubResults;
        const data = idata.status && idata.status.subRes;
        if(!idata || !idata.status || !idata.status.subRes){
            this.openPatientInsuranceModal()
            return;
        }
        const diseaseInfos = this.props.getDiseaseInfo;
        const formData = this.props.patientInsuranceCreateResult && this.props.patientInsuranceCreateResult.status ? this.props.patientInsuranceCreateResult.status.insuranceResultData : {};
        let modalFooter = (
            <Row>
                <Button onClick={this.handleCancel} type='primary'>返回</Button>
                <Button loading={false} onClick={this.openPatientInsuranceModal.bind(this)} type='primary'>继续登记</Button>
            </Row>
        )
        const age = formData ? this.getAgeByBirthday(formData.birthday) : '';
        const title = '登记成功';
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
                <Row gutter={10} style={styles.row}>
                    <Col style={styles.label} span={8}>服务单编号：</Col>
                    <Col span={16}>{data.insuranceOrderNo}</Col>
                </Row>
                <Row gutter={10} style={styles.row}>
                    <Col style={styles.label} span={8}>购买人姓名：</Col>
                    <Col span={16}>{`${data.insurerName}(${analyzeIDCard(data.insurerIdCard).sex}/${analyzeIDCard(data.insurerIdCard).age})`}</Col>
                </Row>
                <Row gutter={10} style={styles.row}>
                    <Col style={styles.label} span={8}>购买人身份证号：</Col>
                    <Col span={16}>{data.insurerIdCard}</Col>
                </Row>
                {data.relationWithInsurer == 1 ? null : <Row gutter={10} style={styles.row}>
                    <Col style={styles.label} span={8}>购买关系：</Col>
                    <Col span={16}>{rel[data.relationWithInsurer]}</Col>
                </Row>}
                <Row gutter={10} style={styles.row}>
                    <Col style={styles.label} span={8}>服务对象姓名：</Col>
                    <Col span={16}>{`${data.insuredName}(${analyzeIDCard(data.insuredIdCard).sex}/${analyzeIDCard(data.insuredIdCard).age})`}</Col>
                </Row>
                <Row gutter={10} style={styles.row}>
                    <Col style={styles.label} span={8}>服务对象身份证号：</Col>
                    <Col span={16}>{data.insuredIdCard}</Col>
                </Row>
                <Row gutter={10} style={styles.row}>
                    <Col style={styles.label} span={8}><strong>服务包名称：</strong></Col>
                    <Col span={16}><strong>{data.insurancePackageName}</strong></Col>
                </Row>
                <Row gutter={10} style={styles.row}>
                    <Col style={styles.label} span={8}><strong>服务档次：</strong></Col>
                    <Col span={16}><strong>{data.insuranceGradeName}</strong></Col>
                </Row>
                <Row gutter={10} style={styles.row}>
                    <Col style={styles.label} span={8}><strong>服务费：</strong></Col>
                    <Col span={16}><strong>¥{((data.amount || 0) / 100).toFixed(2)}/年</strong></Col>
                </Row>
                <Row gutter={10} style={styles.row}>
                    <Col style={styles.label} span={8}>缴费方式：</Col>
                    <Col span={16}>{data.payWay == 1 ? '年缴' : '月缴'}</Col>
                </Row>
                <Row gutter={10} style={styles.row}>
                    <Col style={styles.label} span={8}>缴费金额：</Col>
                    <Col span={16}>¥{((data.paidAmount || 0) / 100).toFixed(2)}/{data.payWay == 1 ? '年' : '月'}</Col>
                </Row>
                {diseaseInfos && diseaseInfos.status && diseaseInfos.status.diseaseInfo && diseaseInfos.status.diseaseInfo.length ? <div style={{ backgroundColor: '#fff', padding: 10 }}>
                    <p style={{ fontSize: 16, textAlign: 'center'}}>注意事项</p>
                    {
                        diseaseInfos.status.diseaseInfo.map(i => {
                            return (
                                <div>
                                    <strong>{i.key + '、' + i.answerTitle || ''}</strong>
                                    {i.answer.map(i => {
                                        return (
                                            <p style={{ lineHeight: '30px', textAlign: 'left'}}>{i.result || i.name}</p>
                                        )
                                    })}
                                </div>
                            )
                        })
                    }
                </div> : null}
            </Modal>
        )
    }
}

export default connectModalHelper(connect(PatientInsuranceResult))
