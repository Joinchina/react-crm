import React, { Component } from 'react';
import { Button, Row, Col, Modal, Radio, DatePicker } from 'antd';
import message from '@wanhu/antd-legacy/lib/message'
import AsyncEvent from '../../../common/AsyncEvent';
import AlertError from '../../../common/AlertError';
import { connectModalHelper } from '../../../../mixins/modal';
import BasicPhysicalRecordForm from './BasicPhysicalRecordForm';
import { connect } from '../../../../states/customerCenter/newPhysicalRecordModal';
import { physicalType } from '../../../../helpers/enums';
import moment from 'moment';

function validatorRange(val, min, max) {
    return val < min || val > max || (val && !(/^(0|[1-9]\d*)(\.\d+)?$/).test(val))
}

const dateFormat = 'YYYY-MM-DD';
const Today = moment().set({ hour: 23, minute: 59, second: 59, millisecond: 999});

class NewPhysicalRecordModal extends Component {

    componentWillMount() {
        this.customerId = this.props.currentModalParam;
        this.props.updateForm({ type: 1 });
        this.props.updateForm({ dateString: moment() });
        this.props.getPatientInfoAction(this.customerId);
        this.props.getHeightRecordAction(this.customerId);
    }

    hideModal = () => {
        this.props.resetForm();
        this.props.closeModal();
    }

    fieldsChange = value => {
        this.props.updateForm(value);
    }

    physicalTypeChange = ele => {
        this.props.updateForm({ type: ele.target.value });
    }

    finishCreateRecord = () => {
        message.success('新建体检表成功', 3);
        this.hideModal();
    }

    submit = (isSave) => {
        this.form.validateFieldsAndScroll({ force: true }, (err, values) => {
            if (err) {
                return;
            }
            let arr = [];
            for (const key in values) {
                arr.push(values[key]);
            }
            const notContent = arr.every(o => typeof o === 'undefined');
            if (notContent) {
                message.error('没录入检查数据，请检查！');
                return;
            }
            this.isSave = isSave;
            const status = isSave ? 2 : 1;
            const type = this.props.formData.type;
            const dateString = this.props.formData.dateString.format(dateFormat);
            const {
                height, weight, waistline, SBP, DBP, FBG, PBG,
                HBALC, ALT, uricAcid, TG, TCHO,
                LDL, Hcy, serumKalium, fundoscopy, oralExamination,
                footExamination, PNP, influenzaVaccine, pneumovax,
                isExercise, appetite, smoking,
                Scr, ScrUnit, MAU, MAUUnit, drinkingType, dailyDrinking,
            } = values;

            if(!Scr && ScrUnit) {
                Modal.warning({
                    content: '请输入血肌酐的值'
                })
                return;
            }
            if(!ScrUnit && Scr) {
                Modal.warning({
                    content: '请选择血肌酐的单位'
                })
                return;
            }

            if(!MAU && MAUUnit) {
                Modal.warning({
                    content: '请输入尿微量白蛋白的值'
                })
                return;
            }
            if(!MAUUnit && MAU) {
                Modal.warning({
                    content: '请选择尿微量白蛋白的单位'
                })
                return;
            }

            if(!dailyDrinking && drinkingType) {
                Modal.warning({
                    content: '请输入日饮酒量的值'
                })
                return;
            }
            if(!drinkingType && dailyDrinking ) {
                Modal.warning({
                    content: '请选择日饮酒量的类型'
                })
                return;
            }

            this.props.postFormAction(this.customerId, {
                physicalExaminationDate: dateString,
                type, status,
                height: height && height*100 || undefined,
                weight, waistline, SBP, DBP, FBG, PBG,
                HBALC, ALT, uricAcid, TG, TCHO,
                LDL, Hcy, serumKalium,
                influenzaVaccine, pneumovax, smoking,
                Scr,
                ScrUnit: ScrUnit !== undefined ? Number(ScrUnit) : undefined,
                fundoscopy: fundoscopy !== undefined ? Number(fundoscopy) : undefined,
                oralExamination: oralExamination !== undefined ? Number(oralExamination) : undefined,
                footExamination: footExamination !== undefined ? Number(footExamination) : undefined,
                PNP: PNP !== undefined ? Number(PNP) : undefined,
                isExercise: isExercise !== undefined ? Number(isExercise) : undefined,
                appetite: appetite !== undefined ? Number(appetite) : undefined,
                drinkingType: drinkingType !== undefined ? Number(drinkingType) : undefined,
                dailyDrinking,
                MAU,
                MAUUnit: MAUUnit !== undefined ? Number(MAUUnit) : undefined,
            });
        });
    }

    notAllowAfterToday = (date) => {
        return date.isAfter(Today);
    }

    onChangeDate = (date) => {
        let dateString;
        if(!date) {
            dateString = moment();
        } else {
            dateString = date;
        }
        this.props.updateForm({ dateString });
    }

    render() {
        return (
            <div>
                <Modal
                    title='新建体检表'
                    visible={true}
                    width={900}
                    maskClosable={false}
                    onCancel={this.hideModal}
                    style={{backgroundColor: '#f8f8f8'}}
                    footer={
                        <Row>
                            <Button style={styles.footBtn}
                                loading={this.props.postFormResult.status === 'pending' && this.isSave}
                                disabled={this.props.postFormResult.status === 'pending' && !this.isSave}
                                onClick={() => this.submit(true)} type='primary'>提交体检表</Button>
                            <Button style={styles.footBtn}
                                loading={this.props.postFormResult.status === 'pending' && !this.isSave}
                                disabled={this.props.postFormResult.status === 'pending' && this.isSave}
                                onClick={() => this.submit(false)} type='primary'>存为草稿</Button>
                            <Button disabled={this.props.postFormResult.status === 'pending'}
                                onClick={this.hideModal} className='cancelButton'>取消</Button>
                        </Row>
                    }
                >
                    <Row gutter={10}>
                        <Col span={12}>
                            <Radio.Group value={this.props.formData.type} onChange={this.physicalTypeChange} style={{lineHeight:"36px"}}>
                                { physicalType.options.map(o =>
                                    <Radio value={o.value} key={o.value}>{o.label}</Radio>
                                )}
                            </Radio.Group>
                        </Col>
                        <Col span={12}>
                            <DatePicker allowClear={false}
                                disabledDate={this.notAllowAfterToday}
                                onChange={this.onChangeDate}
                                value={this.props.formData.dateString}
                            />
                        </Col>
                    </Row>
                    <BasicPhysicalRecordForm
                        patientInfo={this.props.patientInfo.payload}
                        heightRecord={this.props.heightRecord.payload}
                        data={this.props.formData}
                        formRef={form => this.form = form}
                        onFieldsChange={fields => this.fieldsChange(fields)}
                        editing={true}
                        isEditPage={false}
                    />
                </Modal>
                <AlertError async={this.props.patientInfo} />
                <AsyncEvent async={this.props.postFormResult} onFulfill={this.finishCreateRecord} alertError/>
            </div>
        )
    }
}

const styles = {
    footBtn: {
        marginRight: 10
    },
}

export default connectModalHelper(connect(NewPhysicalRecordModal));
