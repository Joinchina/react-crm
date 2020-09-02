import React, { Component } from 'react'
import { connect } from '../../states/check/newQuestionnairePreCheck';
import { Button, Row, Modal, message } from 'antd';
import { connectModalHelper } from '../../mixins/modal';
import api from '../../api/api';

class NewQuestionnairePreCheckResult extends Component {
    constructor(props) {
        super(props)
        this.state = {
            submitting: false,
        }
    }

    handleCancel = () => {
        this.props.closeModal();
    }

    openCreateModal() {
        this.props.openModal('newQuestionnairePreCheck')
    }


    handleSubmit = async () => {
        this.setState({ submitting: true })
        try {
            // const data = this.props.result.status.resultData;
            // let { formData, patientId } = data;
            // formData = {
            //     ...formData,
            //     isSave: 1,
            // }
            // await api.savePrePhysicalQuestionnaire(patientId, formData);
            // message.success('保存成功');
            this.handleCancel();
            this.setState({ submitting: false });
        } catch (e) {
            message.error(e.message);
            this.setState({ submitting: false });
        }
    }
    render() {
        const { submitting } = this.state;
        let styles = {
            label: {
                textAlign: 'right'
            },
            row: {
                minHeight: '30px'
            }
        }
        const data = this.props.result.status.resultData;
        if (!data) {
            this.handleCancel()
        }
        const { checkData } = data;

        let modalFooter = (
            <Row style={{ textAlign: "center" }}>
                <Button loading={false} onClick={this.openCreateModal.bind(this)} type='primary'>返回重填</Button>
                <Button onClick={this.handleSubmit} type='primary' loading={submitting}>关闭</Button>
            </Row>
        )

        return (
            <Modal
                title='体检匹配结果'
                width={700}
                visible={true}
                style={{ backgroundColor: '#f8f8f8' }}
                onCancel={this.handleCancel}
                maskClosable={false}
                footer={modalFooter}
            >
                <div >
                    <Row gutter={10} style={{ ...styles.row, textAlign: 'center' }}>
                        <h3>体检套餐名称</h3>
                    </Row>
                    <Row gutter={10} style={{ ...styles.row, textAlign: 'center', margin: '15px', fontSize: 20 }}>
                        <h3 style={{ color: '#f04134' }}>{checkData.title}</h3>
                    </Row>
                    <Row gutter={10} style={{ ...styles.row, textAlign: 'center' }}>
                        <h3>体检项目详情</h3>
                    </Row>
                    <Row gutter={10} style={{ ...styles.row, textAlign: 'left', margin: '10px 70px' }}>
                        <h3 style={{ color: '#666' }}>{checkData.detail}</h3>
                    </Row>

                </div>
            </Modal>
        )
    }
}

export default connectModalHelper(connect(NewQuestionnairePreCheckResult))
