import React, { Component } from 'react'
import { connect } from '../../states/check/createCCVDCheck';
import { Button, Row, Col, Modal } from 'antd';
import { connectModalHelper } from '../../mixins/modal';

class PatientInsuranceResult extends Component {
    constructor(props) {
        super(props)
    }

    handleCancel = () => {
        this.props.closeModal();
    }

    componentWillMount() {
        console.log('ddd', this.props);
        // const data = this.props.checkResult.status.resultData
        // if (!data) {
        //     this.handleCancel()
        // }
    }

    componentWillReceiveProps(nextProps) {
        // const data = this.props.checkResult.status.resultData
        // if (!data) {
        //     this.handleCancel()
        // }
    }

    openCreateModal() {
        this.props.openModal('createCCVDCheck')
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
        console.log('check.CCVDCheck,', this.props.check);
        const data = this.props.checkResult.status.resultData
        if (!data) {
            this.handleCancel()
        }
        const { patientDetails, checkData, formData } = data;

        let modalFooter = (
            <Row style={{ textAlign: "center" }}>
                <Button loading={false} onClick={this.openCreateModal.bind(this)} type='primary'>重新评估</Button>
                <Button onClick={this.handleCancel} type='primary'>关闭</Button>
            </Row>
        )
        const title = '心脑血管病风险评估';
        let { assessmentResult } = checkData;
        let resultStr = '';
        let resultColor = '';
        let remark = '';
        if (assessmentResult * 100 >= 10.0) {
            resultStr = '高危';
            resultColor = '#f04134';
            remark = '应积极改变不良生活方式，如戒烟、控制体重、增加体力活动等，同时应该针对自身危险因素，在临床医生指导下进行降压、调脂、降糖等药物治疗。至少每年进行一次体检，必要时可以进行心脏超声、颈动脉超声等详细的影像学检查，以进一步评估心脑血管病风险。';
        } else if (assessmentResult * 100 >= 5.0 && assessmentResult * 100 < 10.0) {
            resultStr = '中危';
            resultColor = '#FF8C00';
            remark = '应积极改变不良生活方式，如戒烟、控制体重、增加体力活动等，如有必要可以在临床医生指导下进行相关治疗。';
        } else {
            resultStr = '低危';
            resultColor = '#1DA57A';
            remark = '应该接受生活方式指导，以保持自身的低风险状况，加强自我监测。';
        }

        return (
            <Modal
                title={title}
                width={700}
                visible={true}
                style={{ backgroundColor: '#f8f8f8' }}
                onCancel={this.handleCancel}
                maskClosable={false}
                footer={modalFooter}
            >
                <div >
                    <Row gutter={10} style={{ ...styles.row, textAlign: 'center' }}>
                        <h3>会员指标</h3>
                    </Row>
                    <Row gutter={10} style={styles.row}>
                        <Col style={styles.label} span={8}><strong>会员信息：</strong></Col>
                        <Col span={16}>
                            <span>
                                {patientDetails.name} {formData.gender} {formData.age}岁
                            </span>
                        </Col>
                    </Row>
                    <Row gutter={10} style={styles.row}>
                        <Col style={styles.label} span={8}><strong>是否在用降压药：</strong></Col>
                        <Col span={16}><span>{formData.isHypotensor == '1' ? '是' : '否'}</span></Col>
                    </Row>
                    <Row gutter={10} style={styles.row}>
                        <Col style={styles.label} span={8}><strong>当前收缩压</strong></Col>
                        <Col span={16}><span>{formData.currentSBP}&nbsp;mmHg</span></Col>
                    </Row>
                    <Row gutter={10} style={styles.row}>
                        <Col style={styles.label} span={8}><strong>总胆固醇：</strong></Col>
                        <Col span={16}><span>{formData.tc}&nbsp;mg/dl</span></Col>
                    </Row>
                    <Row gutter={10} style={styles.row}>
                        <Col style={styles.label} span={8}><strong>高密度脂蛋白胆固醇：</strong></Col>
                        <Col span={16}><span>{formData.hdlc}&nbsp;mg/dl</span></Col>
                    </Row>
                    <Row gutter={10} style={styles.row}>
                        <Col style={styles.label} span={8}><strong>腰围：</strong></Col>
                        <Col span={16}><span>{formData.waistline}&nbsp;cm</span></Col>
                    </Row>
                    <Row gutter={10} style={styles.row}>
                        <Col style={styles.label} span={8}><strong>当前吸烟情况：</strong></Col>
                        <Col span={16}><span>{formData.smoke == 0 ? '从未' : (formData.smoke == 0.5 ? '已戒烟' : '吸烟（含二手烟）')}</span></Col>
                    </Row>
                    <Row gutter={10} style={styles.row}>
                        <Col style={styles.label} span={8}><strong>当前是否患有糖尿病：</strong></Col>
                        <Col span={16}><span>{formData.diabetes == '1' ? '是' : '否'}</span></Col>
                    </Row>
                    <Row gutter={10} style={styles.row}>
                        <Col style={styles.label} span={8}><strong>居住地所处地域：</strong></Col>
                        <Col span={16}><span>{formData.region == 1 ? '北方' : (formData.region == 2 ? '南方' : '')}</span></Col>
                    </Row>
                    <Row gutter={10} style={styles.row}>
                        <Col style={styles.label} span={8}><strong>居住地属于城市或农村：</strong></Col>
                        <Col span={16}><span>{formData.urbanRural == 1 ? '城市' : (formData.urbanRural == 0 ? '农村' : '')}</span></Col>
                    </Row>
                    <Row gutter={10} style={styles.row}>
                        <Col style={styles.label} span={8}><strong>有无心血管病家族史：</strong></Col>
                        <Col span={16}><span>{formData.ASCVDFamilyHistory == '1' ? '有' : '无'}</span></Col>
                    </Row>
                    <Row gutter={10} style={{ ...styles.row, textAlign: 'center', borderTop: '1px solid #ddd', paddingTop: '20px', }}>
                        <h3 style={{ fontWeight: 'bold'}}>评估结果</h3>
                    </Row>
                    <Row gutter={10} style={{
                        ...styles.row,
                        textAlign: 'center', fontSize: '18px',
                        marginBottom: '20px',
                        marginTop: '20px',
                    }}
                    >
                        <h3 style={{ color: resultColor }}>心脑血管病{resultStr}风险</h3>
                    </Row>
                    <Row gutter={10} style={{ ...styles.row, textAlign: 'center', paddingTop: 5 }}>
                        <h3 style={{ fontWeight: 'bold'}}>健康干预建议</h3>
                    </Row>
                    <Row gutter={10} style={{ ...styles.row, textAlign: 'left', padding: '5px 80px' }}>
                <h3>{remark}</h3>
                    </Row>
                    <Row className="check" style={{ marginTop: 15 }}>
                        <span className="warningTip">
                            温馨提示：本工具仅用于心脑血管病风险的初步评估，不能代替临床诊断，具体治疗措施需咨询专业医师。
                    </span>
                    </Row>
                </div>
            </Modal>
        )
    }
}

export default connectModalHelper(connect(PatientInsuranceResult))
