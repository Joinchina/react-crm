import React, { Component } from 'react';
import { Spin, Breadcrumb, Button, Modal, DatePicker } from 'antd';
import message from '@wanhu/antd-legacy/lib/message'
import { Link, Route } from 'react-router-dom';
import NavigatorBreadcrumb from '../../../common/NavigatorBreadcrumb';
import { connectRouter } from '../../../../mixins/router';
import { connect as connectRedux } from '../../../../states/customerCenter/physicalRecordDetail';
import AlertError from '../../../common/AlertError';
import AsyncEvent from '../../../common/AsyncEvent';
import BasicPhysicalRecordForm from './BasicPhysicalRecordForm';
import moment from 'moment';

function validatorRange(val, min, max) {
    return val < min || val > max || (val && !(/^(0|[1-9]\d*)(\.\d+)?$/).test(val))
}

class PhysicalRecordDetail extends Component {

    componentWillMount() {
        const { customerId, orderId } = this.props.match.params;
        this.customerId = customerId;
        this.orderId = orderId;
        this.editing = this.props.router.query.edit;
    }

    componentDidMount() {
        this.props.getPhysicalRecordDetailAction(this.customerId, this.orderId);
        this.props.getHeightRecordAction(this.customerId);
    }

    componentWillUnmount() {
        this.props.resetPhysicalRecordDetailAction();
    }

    initData = fields => {
        const {
            physicalExaminationDate,
            height, weight, waistline, SBP, DBP, FBG, PBG,
            HBALC, ALT, Scr, ScrUnit, uricAcid, TG, TCHO,
            LDL, Hcy, serumKalium, MAU, MAUUnit, fundoscopy, oralExamination,
            footExamination, PNP, influenzaVaccine, pneumovax,
            isExercise, appetite, drinkingType, dailyDrinking, smoking
        } = fields;
        const type = this.props.physicalRecordDetail.payload.type;
        let formData;
        if(type === 1) {
            formData = {
                physicalExaminationDate,
                height: height && height/100,
                Scr, ScrUnit,
                weight, waistline, SBP, DBP, FBG, PBG,
                HBALC, ALT, TG, TCHO, uricAcid,
                LDL, Hcy, serumKalium,
                influenzaVaccine, pneumovax,
                smoking, oralExamination, fundoscopy,
                footExamination, PNP, isExercise, appetite,
                dailyDrinking, drinkingType,
                MAU, MAUUnit,
            }
        } else if(type === 2) {
            formData = {
                physicalExaminationDate,
                height: height && height/100,
                Scr, ScrUnit,
                weight, waistline, SBP, DBP, FBG, PBG,
                HBALC, ALT, TG, TCHO, uricAcid,
                LDL, influenzaVaccine, pneumovax,
                smoking, oralExamination, fundoscopy,
                footExamination, isExercise, appetite,
                dailyDrinking, drinkingType,
                MAU, MAUUnit,
            }
        } else if(type === 3) {
            formData = {
                physicalExaminationDate,
                height: height && height/100,
                Scr, ScrUnit,
                weight, waistline, SBP, DBP, FBG, PBG,
                ALT, TG, TCHO, uricAcid,
                LDL, Hcy, serumKalium,
                smoking, oralExamination, fundoscopy,
                isExercise, appetite,
                dailyDrinking, drinkingType
            }
        }

        this.form.setFieldsValue(formData);
    }

    componentWillReceiveProps(props) {
        if(JSON.stringify(this.props.formData) === '{}' && JSON.stringify(props.formData) !== '{}' && this.editing) {
            this.props.backupFormAndBeginEdit(props.formData);
        }
    }

     fieldsChange = value => {
        this.props.updateForm(value);
    }

    editStatusChanged = (val) => {
        if (val) {
            this.props.backupFormAndBeginEdit(this.props.formData);
        } else {
            this.props.stopFormEdit(this.props.formEdit.fields);
        }
    }

    cancelEdit = () => {
        this.props.stopFormEdit(this.props.formEdit.fields);
    }

    saveForm = (isSave) => {
        this.form.validateFieldsAndScroll({ force: true }, (err, values) => {
            if (err) {
                console.log('验证失败', err, values);
                return;
            }
            let arr = [];
            for (const key in values) {
                if (key !== 'physicalExaminationDate') {
                    arr.push(values[key]);
                }
            }
            const notContent = arr.every(o => typeof o === 'undefined');
            if (notContent) {
                message.error('没录入检查数据，请检查！');
                return;
            }
            this.isSave = isSave;
            const status = isSave ? 2 : 1;
            const {
                physicalExaminationDate,
                height, weight, waistline, SBP, DBP, FBG, PBG,
                HBALC, ALT, uricAcid, TG, TCHO, LDL, Hcy, serumKalium,
                fundoscopy, oralExamination, footExamination, PNP,
                influenzaVaccine, pneumovax,
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

            this.props.saveFormAction(this.customerId, this.orderId, {
                physicalExaminationDate: physicalExaminationDate,
                status,
                type: this.props.physicalRecordDetail.payload.type,
                height: height && height*100 || undefined,
                weight, waistline, SBP, DBP, FBG, PBG,
                HBALC, ALT, uricAcid, TG, TCHO,
                LDL, Hcy, serumKalium, smoking,
                influenzaVaccine: influenzaVaccine || undefined,
                pneumovax: pneumovax || undefined,
                fundoscopy: fundoscopy !== undefined ? Number(fundoscopy) : undefined,
                oralExamination: oralExamination !== undefined ? Number(oralExamination) : undefined,
                footExamination: footExamination !== undefined ? Number(footExamination) : undefined,
                PNP: PNP !== undefined ? Number(PNP) : undefined,
                isExercise: isExercise !== undefined ? Number(isExercise) : undefined,
                appetite: appetite !== undefined ? Number(appetite) : undefined,
                Scr,
                ScrUnit: ScrUnit !== undefined ? Number(ScrUnit) : undefined,
                drinkingType: drinkingType !== undefined ? Number(drinkingType) : undefined,
                dailyDrinking,
                MAU,
                MAUUnit: MAUUnit !== undefined ? Number(MAUUnit) : undefined,
            });
        });
    }

    successfulFinishEdit = () => {
        message.success('保存成功', 3);
        this.props.stopFormEdit();
        if(this.editing) {
            this.editing = false;
            this.props.router.set({
                query: { r: this.props.router.query.r },
                path: `/physicalRecordDetail/${this.customerId}/${this.orderId}`
            }, { reset: true, replace: true })
        }
        this.props.getPhysicalRecordDetailAction(this.customerId, this.orderId);
    }

    render() {
        const patientInfo = this.props.physicalRecordDetail.payload || {};
        const heightRecord = this.props.heightRecord.payload || '';
        return (
            <Spin
              spinning={this.props.physicalRecordDetail.status === 'pending'}
            >
                <div>
                    <NavigatorBreadcrumb className='breadcrumb-box'/>
                    <div className='block'>
                        <BasicPhysicalRecordForm
                            patientInfo={patientInfo}
                            heightRecord={heightRecord}
                            data={this.props.formData}
                            formRef={form => this.form = form}
                            onFieldsChange={fields => this.fieldsChange(fields)}
                            onChangeEditing={this.editStatusChanged}
                            editing={this.props.formEdit.editing}
                            isEditPage={true}
                            allowEdit={patientInfo.status === 1}
                        />
                    </div>
                </div>
                {
                    this.props.formEdit.editing ?
                        <div>
                            <div className='block' style={styles.foot}>
                                <Button style={styles.footBtn}
                                    loading={this.props.saveFormResult.status === 'pending' && this.isSave}
                                    disabled={this.props.saveFormResult.status === 'pending' && !this.isSave}
                                    onClick={() => this.saveForm(true)} type='primary'>提交体检表</Button>
                                <Button style={styles.footBtn}
                                    loading={this.props.saveFormResult.status === 'pending' && !this.isSave}
                                    disabled={this.props.saveFormResult.status === 'pending' && this.isSave}
                                    onClick={() => this.saveForm(false)} type='primary'>存为草稿</Button>
                                <Button disabled={this.props.saveFormResult.status === 'pending'}
                                    onClick={this.cancelEdit} className='cancelButton'>取消</Button>
                            </div>
                        </div>
                        : null
                }
                <AsyncEvent async={this.props.physicalRecordDetail} onFulfill={this.initData} alertError/>
                <AsyncEvent async={this.props.saveFormResult} onFulfill={this.successfulFinishEdit} alertError/>
            </Spin>
        )
    }
}

const styles = {
    foot: {
        textAlign: 'center',
        height: 60,
        lineHeight: '60px'
    },
    footBtn: {
        marginRight: 10
    },
}

export default connectRouter(connectRedux(PhysicalRecordDetail));
