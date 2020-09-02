import React, { Component } from 'react';
import { InputNumber, Input, Button, Row, Col, Select,
    Breadcrumb, Affix, Form as AntdForm, Spin, Tag, Modal, Checkbox, DatePicker } from 'antd';
import { Form, ViewOrEdit, fieldBuilder, formBuilder } from '../../../common/form';
import Title from '../../../common/Title';
import { sex, physicalType } from '../../../../helpers/enums';
import moment from 'moment';
import CuttingLine from '../../../common/FormCuttingLine';
import {
    SelectScrUnit, SelectFundoscopy, SelectFootExamination, SelectPNP,
    SelectIsExercise, SelectAppetite, SelectDrink, SelectMAU, SelectIsOral
} from './formComponentItem';


const Today = moment().set({ hour: 23, minute: 59, second: 59, millisecond: 999});
const formItemStyle = {
    col1: {
        labelCol: { span:3 },
        wrapperCol: { span:21 }
    },
    col2: {
        labelCol: { span:6 },
        wrapperCol: { span:18 }
    },
    col3: {
        labelCol: { span:9 },
        wrapperCol: { span:15 }
    },
    col4: {
        labelCol: { span:12 },
        wrapperCol: { span:12 }
    },
    col5: {
        labelCol: { span:16 },
        wrapperCol: { span:8 }
    },
    labelOnly: {
        labelCol: { style: { width: '100%'} },
    },
    wrapperCol: { style: { width: '100%' } }
};

const sty = {
    p: {
        padding: 20,
    }
}

const ScrUnitMap = {
    1: 'umol/L',
    2: 'mg/dl'
}

const fundoscopyMap = {
    1: '正常',
    2: '非增殖期糖尿病视网膜病变',
    3: '增殖期糖尿病视网膜病变',
    4: 'Ⅰ级',
    5: 'Ⅱ级',
    6: 'Ⅲ级',
    7: 'Ⅳ级',
}

const isExerciseMap = {
    0: '否',
    1: '是'
}

const footExaminationMap = {
    '-1': '正常',
    0: '0级',
    1: '1级',
    2: '2级',
    3: '3级',
    4: '4级',
    5: '5级',
}

const PNPMap = {
    0: '无',
    1: '轻度',
    2: '中度',
    3: '重度',
}

const appetiteMap = {
    1: '轻',
    2: '重',
}

const STATUS = {
    1: '未提交',
    2: '已提交',
}

const dringUnit = {
    1: ['白酒', '两'],
    2: ['啤酒', '瓶'],
    3: ['红酒', '杯'],
}

const isOralMap = {
    0: '未完成',
    1: '已完成'
}

function validatorRange(val, min, max) {
    if(!val) {
        return null;
    } else {
        if((val && !(/^(0|[1-9]\d*)(\.\d+)?$/).test(val)) || val < min || val > max) {
            return `参考范围"${min}-${max}"`
        }
    }
}

function validateValueWithUnit(val, min, max) {
    return isNaN(val) || !isFinite(val) || ((val && !(/^(0|[1-9]\d*)(\.\d+)?$/).test(val)) || val < min || val > max);
}

const FormLabel = AntdForm.Item;
const formDef = Form.def({
    physicalExaminationDate: fieldBuilder(),
    height: fieldBuilder()
        .validateTrigger('onBlur').maxLength(8)
        .validator(val => validatorRange(val, 0.5, 3)),
    weight: fieldBuilder()
        .validateTrigger('onBlur').maxLength(8)
        .validator(val => validatorRange(val, 3, 200)),
    waistline: fieldBuilder()
        .validateTrigger('onBlur').maxLength(8)
        .validator(val => validatorRange(val, 30, 200)),
    SBP: fieldBuilder()
        .validateTrigger('onBlur').maxLength(8)
        .validator(val => validatorRange(val, 0, 250)),
    DBP: fieldBuilder()
        .validateTrigger('onBlur').maxLength(8)
        .validator(val => validatorRange(val, 0, 200)),
    FBG: fieldBuilder()
        .validateTrigger('onBlur').maxLength(8)
        .validator(val => validatorRange(val, 0, 40)),
    PBG: fieldBuilder()
        .validateTrigger('onBlur').maxLength(8)
        .validator(val => validatorRange(val, 0, 40)),
    HBALC: fieldBuilder()
        .validateTrigger('onBlur').maxLength(8)
        .validator(val => validatorRange(val, 0, 20)),
    ALT: fieldBuilder().maxLength(8)
        .validateTrigger('onBlur')
        .validator(val => validatorRange(val, 0, 1200)),
    Scr: fieldBuilder().maxLength(8)
        .validateTrigger('onBlur')
        .validator((val, form) => {
            if(val) {
                const Scr = val, ScrUnit = form.getFieldValue('ScrUnit');
                if(ScrUnit === '1' ) {
                    return validatorRange(Scr, 5, 5000);
                } else if (ScrUnit === '2') {
                    return validatorRange(Scr, 0.06, 56);
                }
            }
        }),
    ScrUnit: fieldBuilder(),
    uricAcid: fieldBuilder()
        .validateTrigger('onBlur').maxLength(8)
        .validator(val => validatorRange(val, 0, 1500)),
    TG: fieldBuilder()
        .validateTrigger('onBlur').maxLength(8)
        .validator(val => validatorRange(val, 0, 12)),
    TCHO: fieldBuilder()
        .validateTrigger('onBlur').maxLength(8)
        .validator(val => validatorRange(val, 0, 15)),
    LDL: fieldBuilder()
        .validateTrigger('onBlur').maxLength(8)
        .validator(val => validatorRange(val, 0, 12)),
    Hcy: fieldBuilder()
        .validateTrigger('onBlur').maxLength(8)
        .validator(val => validatorRange(val, 0, 150)),
    serumKalium: fieldBuilder()
        .validateTrigger('onBlur').maxLength(8)
        .validator(val => validatorRange(val, 0, 10)),
    MAU: fieldBuilder().maxLength(8)
        .validateTrigger('onBlur')
        .validator((val, form) => {
            if(val) {
                const MAU = val, MAUUnit = form.getFieldValue('MAUUnit');
                if(MAUUnit === '1' ) {
                    return validatorRange(MAU, 0, 300);
                } else if (MAUUnit === '2') {
                    return validatorRange(MAU, 0, 450);
                }
            }
        }),
    MAUUnit: fieldBuilder(),
    fundoscopy: fieldBuilder(),
    oralExamination: fieldBuilder(),
    footExamination: fieldBuilder(),
    PNP: fieldBuilder(),
    influenzaVaccine: fieldBuilder(),
    pneumovax: fieldBuilder(),
    isExercise: fieldBuilder(),
    appetite: fieldBuilder(),
    drinkingType: fieldBuilder(),
    dailyDrinking: fieldBuilder().maxLength(8)
        .validateTrigger('onBlur')
        .validator(val => validatorRange(val, 0, 99)),
    smoking: fieldBuilder()
        .validateTrigger('onBlur').maxLength(8)
        .validator(val => validatorRange(val, 0, 80)),
});

export default class BasicPhysicalRecordForm extends Component {

    SelectMAUChange = (val) => {
        const newMAUUnit = val;
        const oldMAUUnit = this.props.data.MAUUnit && this.props.data.MAUUnit.value || undefined;
        const oldMAU = this.props.data.MAU && this.props.data.MAU.value || undefined;
        let newMAU;
        if(oldMAU) {
            if(oldMAUUnit) {
                if(newMAUUnit === '1') {
                    newMAU = !isNaN(oldMAU/1.5) && isFinite(oldMAU/1.5) && (oldMAU/1.5).toFixed(1) || undefined;
                    if(newMAU) {
                        if(validateValueWithUnit(newMAU, 0, 300)) {
                            this.setFieldsValueWithError('MAU', newMAU, 0, 300);
                        } else {
                            this.setFieldsValueWithOutError('MAU', newMAU);
                        }
                    } else {
                        this.setFieldsValueWithOutError('MAU', undefined);
                    }
                } else if (newMAUUnit === '2') {
                    newMAU = !isNaN(oldMAU*1.5) && isFinite(oldMAU*1.5) && (oldMAU*1.5).toFixed(1) || undefined;
                    if(newMAU) {
                        if(validateValueWithUnit(newMAU, 0, 450)) {
                            this.setFieldsValueWithError('MAU', newMAU, 0, 450);
                        } else {
                            this.setFieldsValueWithOutError('MAU', newMAU);
                        }
                    } else {
                        this.setFieldsValueWithOutError('MAU', undefined);
                    }
                } else {
                    this.setFieldsValueWithOutError('MAU', undefined);
                }
            } else {
                if(newMAUUnit === '1' && validateValueWithUnit(oldMAU, 0, 300)) {
                    this.setFieldsValueWithError('MAU', oldMAU, 0, 300);
                } else if (newMAUUnit === '2' && validateValueWithUnit(oldMAU, 0, 450)) {
                    this.setFieldsValueWithError('MAU', oldMAU, 0, 450);
                }
            }
        }
    }

    ScrChange = (val) => {
        const newScrUnit = val;
        const oldScrUnit = this.props.data.ScrUnit && this.props.data.ScrUnit.value || undefined;
        const oldScr = this.props.data.Scr && this.props.data.Scr.value || undefined;
        let newScr;
        if(oldScr) {
            if(oldScrUnit) {
                if(newScrUnit === '1') {
                    newScr = !isNaN(oldScr*88.41) && isFinite(oldScr*88.41) && (oldScr*88.41).toFixed(1) || undefined;
                    if(newScr) {
                        if(validateValueWithUnit(newScr, 5, 5000)) {
                            this.setFieldsValueWithError('Scr', newScr, 5, 5000);
                        } else {
                            this.setFieldsValueWithOutError('Scr', newScr);
                        }
                    } else {
                        this.setFieldsValueWithOutError('Scr', undefined);
                    }
                } else if (newScrUnit === '2') {
                    newScr = !isNaN(oldScr/88.41) && isFinite(oldScr/88.41) && (oldScr/88.41).toFixed(1) || undefined;
                    if(newScr) {
                        if(validateValueWithUnit(newScr, 0.06, 56)) {
                            this.setFieldsValueWithError('Scr', newScr, 0.06, 56);
                        } else {
                            this.setFieldsValueWithOutError('Scr', newScr);
                        }
                    } else {
                        this.setFieldsValueWithOutError('Scr', undefined);
                    }
                } else {
                    this.setFieldsValueWithOutError('Scr', undefined);
                }
            } else {
                if(newScrUnit === '1' && validateValueWithUnit(oldScr, 5, 5000)) {
                    this.setFieldsValueWithError('Scr', oldScr, 5, 5000);
                } else if (newScrUnit === '2' && validateValueWithUnit(oldScr, 0.06, 56)) {
                    this.setFieldsValueWithError('Scr', oldScr, 0.06, 56);
                }
            }
        }
    }

    setFieldsValueWithError = (name, val, min, max) => {
        this.form.setFields({
            [name]: {
                value: val,
                errors: [`参考范围"${min}-${max}"`]
            }
        })
    }

    setFieldsValueWithOutError = (name, val) => {
        this.form.setFields({
            [name]: {
                value: val
            }
        })
    }


    formRef = ref => {
        this.form = ref;
        if (this.props.formRef){
            this.props.formRef(ref)
        }
    }

    render() {
    const patientInfo = this.props.patientInfo || {};
    const heightRecord = this.props.heightRecord ? (this.props.heightRecord/100).toFixed(2) : '';
    const TYPE = this.props.isEditPage ? patientInfo.type : this.props.data.type;

    const weight = this.props.data.weight || {};
    const height = this.props.data.height && this.props.data.height.value ? this.props.data.height : heightRecord ? { value: heightRecord } : {};
    const BMIText = weight.value && height.value && weight.value/((height.value)*(height.value));
    const BMI = BMIText && !isNaN(BMIText) && isFinite(BMIText) ? BMIText.toFixed(1) : '';

    const Scr = this.props.data.Scr || {};
    const ScrUnit = this.props.data.ScrUnit || {};
    const ScrText = ScrUnit.value ? ScrUnit.value === '1' ? (Scr.value/88.41).toFixed(1) : Scr.value : '';

    const enmu = 175*Math.pow(ScrText, -1.234)*Math.pow(patientInfo.age, -0.179)*{1: 1, 0: 0.79}[patientInfo.sex];
    const eGFR = !isNaN(enmu) && isFinite(enmu) ? enmu.toFixed(1) : '';

    const drinkingType = this.props.data.drinkingType || {};
    const dailyDrinking = this.props.data.dailyDrinking || {};
    const drinkText = dringUnit[drinkingType.value] && dailyDrinking.value && `${dringUnit[drinkingType.value][0]}${dailyDrinking.value}${dringUnit[drinkingType.value][1]}` || '';

    const MAU = this.props.data.MAU || {};
    const MAUUnit = this.props.data.MAUUnit || {};
    const MAUText = MAUUnit.value ? MAUUnit.value === '2' ? (MAU.value/1.5).toFixed(1) : MAU.value : '';
    return <Form def={formDef}
            data={this.props.data}
            onFieldsChange={this.props.onFieldsChange}
            formRef={this.formRef}
        >
        <ViewOrEdit.Group value={this.props.editing} onChange={this.props.onChangeEditing} disabled={!this.props.allowEdit}>
            { this.props.isEditPage ?
                <div>
                    <Title text='基础信息' left={20}/>
                    <div style={sty.p}>
                        <Row gutter={10}>
                            <Col span={3}>
                                <FormLabel label="姓名" {...formItemStyle.labelOnly}/>
                            </Col>
                            <Col span={9}>
                                <ViewOrEdit editing={false} changeEditingDisabled value={patientInfo.name}/>
                            </Col>
                            <Col span={3}>
                                <FormLabel label="性别" {...formItemStyle.labelOnly}/>
                            </Col>
                            <Col span={9}>
                                <ViewOrEdit editing={false} changeEditingDisabled value={sex.map[patientInfo.sex]}/>
                            </Col>
                        </Row>
                        <Row gutter={10}>
                            <Col span={3}>
                                <FormLabel label="年龄" {...formItemStyle.labelOnly}/>
                            </Col>
                            <Col span={9}>
                                <ViewOrEdit editing={false} changeEditingDisabled value={patientInfo.age}/>
                            </Col>
                            <Col span={12}>
                                <Form.Item field="physicalExaminationDate" label="体检日期" {...formItemStyle.col2}>
                                    <ViewOrEdit viewRenderer={props => props.value && moment(props.value).format('YYYY-MM-DD')}
                                        editRenderer={props => (<DatePicker
                                                value={props.value && moment(props.value)}
                                                onChange={props.onChange}
                                                disabledDate={date => date && date.isAfter(Today)}
                                                allowClear={false}
                                                placeholder="请选择体检日期"
                                                />)
                                        }
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={10}>
                            <Col span={3}>
                                <FormLabel label="体检表类型" {...formItemStyle.labelOnly}/>
                            </Col>
                            <Col span={9}>
                                <ViewOrEdit editing={false} changeEditingDisabled value={physicalType.map[patientInfo.type]}/>
                            </Col>
                            <Col span={3}>
                                <FormLabel label="签约医生" {...formItemStyle.labelOnly}/>
                            </Col>
                            <Col span={9}>
                                <ViewOrEdit editing={false} changeEditingDisabled value={patientInfo.doctorName}/>
                            </Col>
                        </Row>
                        <Row gutter={10}>
                            <Col span={3}>
                                <FormLabel label="体检表状态" {...formItemStyle.labelOnly}/>
                            </Col>
                            <Col span={9}>
                                <ViewOrEdit editing={false} changeEditingDisabled value={STATUS[patientInfo.status]}/>
                            </Col>
                        </Row>
                    </div>
                </div> : null
            }
            { this.props.isEditPage ? <Title text='基础体检' left={20}/> :
                <CuttingLine text='基础体检' />
            }
            <div style={sty.p}>
                <Row gutter={10}>
                    <Col span={12}>
                        <Form.Item field="height" label="身高（m）" {...formItemStyle.col4}>
                            <ViewOrEdit editComponent={Input} placeholder={heightRecord}/>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item field="weight" label="体重（kg）" {...formItemStyle.col4}>
                            <ViewOrEdit editComponent={Input}/>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={10}>
                    <Col span={6}>
                        <FormLabel label="BMI" {...formItemStyle.labelOnly}/>
                    </Col>
                    <Col span={6}>
                        <ViewOrEdit editing={false} changeEditingDisabled value={BMI}/>
                    </Col>
                    <Col span={12}>
                        <Form.Item field="waistline" label="腰围（cm）" {...formItemStyle.col4}>
                            <ViewOrEdit editComponent={Input}/>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={10}>
                    <Col span={12}>
                        <Form.Item field="SBP" label="高压（mmHg）" {...formItemStyle.col4}>
                            <ViewOrEdit editComponent={Input}/>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item field="DBP" label="低压（mmHg）" {...formItemStyle.col4}>
                            <ViewOrEdit editComponent={Input}/>
                        </Form.Item>
                    </Col>
                </Row>
            </div>
            { this.props.isEditPage ? <Title text='血糖' left={20}/> :
                <CuttingLine text='血糖' />
            }
            <div style={sty.p}>
                <Row gutter={10}>
                    <Col span={12}>
                        <Form.Item field="FBG" label="空腹血糖（mmol/L）" {...formItemStyle.col4}>
                            <ViewOrEdit editComponent={Input}/>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item field="PBG" label="餐后血糖（mmol/L）" {...formItemStyle.col4}>
                            <ViewOrEdit editComponent={Input}/>
                        </Form.Item>
                    </Col>
                </Row>
                { TYPE !== 3 ?
                    <Row gutter={10}>
                        <Col span={12}>
                            <Form.Item field="HBALC" label="糖化血红蛋白（%）" {...formItemStyle.col4}>
                                <ViewOrEdit editComponent={Input}/>
                            </Form.Item>
                        </Col>
                    </Row> : null
                }
            </div>
            { this.props.isEditPage ? <Title text='肝功能' left={20}/> :
                <CuttingLine text='肝功能' />
            }
            <div style={sty.p}>
                <Row gutter={10}>
                    <Col span={12}>
                        <Form.Item field="ALT" label="ALT（U/L）" {...formItemStyle.col4}>
                            <ViewOrEdit editComponent={Input}/>
                        </Form.Item>
                    </Col>
                </Row>
            </div>
            { this.props.isEditPage ? <Title text='肾功能' left={20}/> :
                <CuttingLine text='肾功能' />
            }
            <div style={sty.p}>
                <Row gutter={10}>
                    <Col span={6}>
                        <FormLabel label="血肌酐(mg／dL)" {...formItemStyle.labelOnly}/>
                    </Col>
                    <Col span={6}>
                        <ViewOrEdit
                            viewRenderer={() =>
                                    <div>
                                        <span>{ScrText}</span>
                                        <Form.Item style={{display:'none'}} field="ScrUnit" />
                                        <Form.Item style={{display:'none'}} field="Scr" />
                                    </div>
                            }
                            editRenderer={props =>
                                <Row gutter={10}>
                                    <Col span={12}>
                                        <Form.Item field="ScrUnit">
                                            <SelectScrUnit {...props} onChange={this.ScrChange}/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item field="Scr">
                                            <Input {...props}/>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            }
                        />
                    </Col>
                    <Col span={12}>
                        <Form.Item field="uricAcid" label="尿酸（umol/L）" {...formItemStyle.col4}>
                            <ViewOrEdit editComponent={Input}/>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={10}>
                    <Col span={6}>
                        <FormLabel label="eGFR（ml/min/1.73m²）" {...formItemStyle.labelOnly}/>
                    </Col>
                    <Col span={6}>
                        <ViewOrEdit editing={false} changeEditingDisabled value={eGFR}/>
                    </Col>
                </Row>
            </div>
            { this.props.isEditPage ? <Title text='血脂' left={20}/> :
                <CuttingLine text='血脂' />
            }
            <div style={sty.p}>
                <Row gutter={10}>
                    <Col span={12}>
                        <Form.Item field="TG" label="甘油三酯（mmol/L）" {...formItemStyle.col4}>
                            <ViewOrEdit editComponent={Input}/>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item field="TCHO" label="总胆固醇（mmol/L）" {...formItemStyle.col4}>
                            <ViewOrEdit editComponent={Input}/>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={10}>
                    <Col span={12}>
                        <Form.Item field="LDL" label="LDL（mmol/L）" {...formItemStyle.col4}>
                            <ViewOrEdit editComponent={Input}/>
                        </Form.Item>
                    </Col>
                </Row>
            </div>
            { TYPE !== 2 ?
                <div>
                    { this.props.isEditPage ? <Title text='其他' left={20}/> :
                        <CuttingLine text='其他' />
                    }
                    <div style={sty.p}>
                        <Row gutter={10}>
                            <Col span={12}>
                                <Form.Item field="Hcy" label="血浆同型半胱氨酸（μmol/L）" {...formItemStyle.col4}>
                                    <ViewOrEdit editComponent={Input}/>
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                    { this.props.isEditPage ? <Title text='血电解质' left={20}/> :
                        <CuttingLine text='血电解质' />
                    }
                    <div style={sty.p}>
                        <Row gutter={10}>
                            <Col span={12}>
                                <Form.Item field="serumKalium" label="血钾（mmol/L）" {...formItemStyle.col4}>
                                    <ViewOrEdit editComponent={Input}/>
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                </div> : null
            }
            { TYPE !== 3 ?
                <div>
                    { this.props.isEditPage ? <Title text='尿检' left={20}/> :
                        <CuttingLine text='尿检' />
                    }
                    <div style={sty.p}>
                        <Row gutter={10}>
                            <Col span={6}>
                                <FormLabel label="尿微量白蛋白（ug/min）" {...formItemStyle.labelOnly}/>
                            </Col>
                            <Col span={6}>
                                <ViewOrEdit
                                    viewRenderer={() =>
                                            <div>
                                                <span>{MAUText}</span>
                                                <Form.Item style={{display:'none'}} field="MAUUnit" />
                                                <Form.Item style={{display:'none'}} field="MAU" />
                                            </div>
                                    }
                                    editRenderer={props =>
                                        <Row gutter={10}>
                                            <Col span={12}>
                                                <Form.Item field="MAUUnit">
                                                    <SelectMAU {...props} onChange={this.SelectMAUChange}/>
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item field="MAU">
                                                    <Input {...props}/>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    }
                                />
                            </Col>
                        </Row>
                    </div>
                </div> : null
            }
            { this.props.isEditPage ? <Title text='体格检查' left={20}/> :
                <CuttingLine text='体格检查' />
            }
            <div style={sty.p}>
                <Row gutter={10}>
                    <Col span={12}>
                        <Form.Item field="fundoscopy" label="眼底检查" {...formItemStyle.col4}>
                            <ViewOrEdit viewRenderer={props => props.value && fundoscopyMap[props.value]}
                                editRenderer={props => <SelectFundoscopy {...props} type={TYPE} />}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item field="oralExamination" label="口腔检查" {...formItemStyle.col4}>
                            <ViewOrEdit viewRenderer={props => isOralMap[props.value]}
                                editRenderer={props => <SelectIsOral {...props} value={props.value ? String(props.value) : undefined}/>}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                { TYPE !== 3 ?
                    <Row gutter={10}>
                        <Col span={12}>
                            <Form.Item field="footExamination" label="足部检查" {...formItemStyle.col4}>
                                <ViewOrEdit viewRenderer={props => footExaminationMap[props.value]}
                                    editRenderer={props => <SelectFootExamination {...props} />}
                                />
                            </Form.Item>
                        </Col>
                        { TYPE !== 2 ?
                            <Col span={12}>
                                <Form.Item field="PNP" label="周围神经病变的相关检查" {...formItemStyle.col4}>
                                    <ViewOrEdit viewRenderer={props => PNPMap[props.value]}
                                        editRenderer={props => <SelectPNP {...props} />}
                                    />
                                </Form.Item>
                            </Col> : null
                        }
                    </Row> : null
                }
            </div>
            { TYPE !== 3 ?
                <div>
                    { this.props.isEditPage ? <Title text='临床疫苗' left={20}/> :
                        <CuttingLine text='临床疫苗' />
                    }
                    <div style={sty.p}>
                        <Row gutter={10}>
                            <Col span={12}>
                                <Form.Item field="influenzaVaccine" label="流感疫苗" {...formItemStyle.col4}>
                                    <ViewOrEdit viewRenderer={props => props.value && moment(props.value).format('YYYY-MM-DD')}
                                        editRenderer={props => (<DatePicker
                                                value={props.value && moment(props.value)}
                                                onChange={props.onChange}
                                                disabledDate={date => date && date.isAfter(Today)}
                                                allowClear
                                                placeholder="请选择接种日期"
                                                />)
                                        }
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item field="pneumovax" label="肺炎疫苗" {...formItemStyle.col4}>
                                    <ViewOrEdit viewRenderer={props => props.value && moment(props.value).format('YYYY-MM-DD')}
                                        editRenderer={props => (<DatePicker
                                                value={props.value && moment(props.value)}
                                                onChange={props.onChange}
                                                disabledDate={date => date && date.isAfter(Today)}
                                                allowClear
                                                placeholder="请选择接种日期"
                                                />)
                                        }
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                </div> : null
            }
            { this.props.isEditPage ? <Title text='生活习惯' left={20}/> :
                <CuttingLine text='生活习惯' />
            }
            <div style={sty.p}>
                <Row gutter={10}>
                    <Col span={12}>
                        <Form.Item field="isExercise" label="运动" {...formItemStyle.col4}>
                            <ViewOrEdit viewRenderer={props => isExerciseMap[props.value]}
                                editRenderer={props => <SelectIsExercise {...props} />}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item field="appetite" label="口味轻重" {...formItemStyle.col4}>
                            <ViewOrEdit viewRenderer={props => appetiteMap[props.value]}
                                editRenderer={props => <SelectAppetite {...props} />}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={10}>
                    <Col span={6}>
                        <FormLabel label="日饮酒量" {...formItemStyle.labelOnly}/>
                    </Col>
                    <Col span={6}>
                        <ViewOrEdit
                            viewRenderer={() =>
                                    <div>
                                        <span>{drinkText}</span>
                                        <Form.Item style={{display:'none'}} field="dailyDrinking" />
                                        <Form.Item style={{display:'none'}} field="drinkingType" />
                                    </div>
                            }
                            editRenderer={props =>
                                <Row gutter={10}>
                                    <Col span={12}>
                                        <Form.Item field="drinkingType">
                                            <SelectDrink {...props}/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item field="dailyDrinking">
                                            <Input {...props} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            }
                        />
                    </Col>
                    <Col span={12}>
                        <Form.Item field="smoking" label="日吸烟量（支／天）" {...formItemStyle.col4}>
                            <ViewOrEdit editComponent={Input}/>
                        </Form.Item>
                    </Col>
                </Row>
            </div>
        </ViewOrEdit.Group>
    </Form>
    }
}
