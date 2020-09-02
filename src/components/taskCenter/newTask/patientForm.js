import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { InputNumber, Input, Button, Row, Col, Select,
    Breadcrumb, Affix, Form as AntdForm, Spin, Tag, Modal } from 'antd';
import { Form, ViewOrEdit, fieldBuilder, formBuilder } from '../../common/form';
import SelectMultipleDiseases from '../../common/SelectMultipleDiseases';
import SelectSingleHospital from '../../common/SelectSingleHospital';
import SelectSingleTaskType from '../../common/SelectSingleTaskType';
import SelectMultipleTags from '../../common/SelectMultipleTags';
import Address from '../../common/Address';
import moment from 'moment';
import { sex } from '../../../helpers/enums';
import { testPermission } from '../../common/HasPermission';
import SelectDoctor from '../../common/selectDoctorByHospitalId'
import CreateOrderLink from '../../common/CreateOrderLink';
import DialButton from '../../call/DialButton';
const FormLabel = AntdForm.Item;
const SelectMultipleTagsForEdit = SelectMultipleTags.forDataRange(2);

const formDef = Form.def({
    phone: fieldBuilder()
            .maxLength('11')
            .pattern(/^(|(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|17[0-9]{1}|(18[0-9]{1}))+\d{8}))$/, '请输入正确的手机号码')
            ,
    machineNumber: fieldBuilder().maxLength('50'),
    diseases: fieldBuilder().required('不能为空'),
    hospital: fieldBuilder().required('不能为空'),
    doctor: fieldBuilder().required('不能为空'),
    address: fieldBuilder()
        .required('请输入详细地址')
        .validator(val => {
            if (!val.liveProvinces || !val.liveCity || !val.liveArea) {
                return '不能为空';
            }
            if (val && `${val.liveStreet}`.length > 50) {
                return '详细地址最多输入50个字符'
            }
        }),
    tags: fieldBuilder()
}, formBuilder()
    .requiredAny(['phone', 'machineNumber'], '手机号码与其他联系方式请至少填写一项')
);

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
    labelOnly: {
        labelCol: { style: { width: '100%'} },
    }
};

export default function PatientForm(props) {
    const task = props.task;
    const allowEdit = testPermission('patient.edit') && (task.taskStatus === 0 || task.taskStatus === 1) && task.patientEditable;
    const hospitalId = props.data.hospital && props.data.hospital.value && props.data.hospital.value.id;
    const SelectDoctorFromHospital = SelectDoctor.forHospitalId(hospitalId);
    const SelectSingleHospitalPermisson = SelectSingleHospital.forDataRange('patient.edit,patient.admin', 'or', {status: 0});
    return <Form def={formDef}
        data={props.data}
        onFieldsChange={props.onFieldsChange}
        formRef={props.formRef}
        hideRequiredMark={props.hideRequiredMark}
        >
        <ViewOrEdit.Group value={props.editing} onChange={props.onChangeEditing} disabled={props.patientFieldValue ? false : true}>
            <Row>
                <Col span={3}>
                    <FormLabel label="姓名" {...formItemStyle.labelOnly}/>
                </Col>
                <Col span={3}>
                    <ViewOrEdit editing={false} changeEditingDisabled value={task.name}
                        viewRenderer={props => <span>{props.value}{
                            task.patientEditable ?
                            <CreateOrderLink patientId={task.customerId}/>
                            : null
                        }</span>}
                    />
                </Col>
                <Col span={3}>
                    <FormLabel label="性别" {...formItemStyle.labelOnly}/>
                </Col>
                <Col span={3}>
                    <ViewOrEdit editing={false} changeEditingDisabled value={task.sex}
                        viewRenderer={props => sex.map[props.value]}
                    />
                </Col>
                <Col span={3}>
                    <FormLabel label="年龄" {...formItemStyle.labelOnly}/>
                </Col>
                <Col span={3}>
                    <ViewOrEdit editing={false} changeEditingDisabled value={task.birthday}
                        viewRenderer={props => props.value && `${moment().year() - moment(props.value).year()} 岁`}
                    />
                </Col>
            </Row>
            <Row>
                <Col span={6}>
                    <Form.Item field="phone" label="手机号码" {...formItemStyle.col4}>
                        <ViewOrEdit editComponent={Input} viewRenderer={props => props.value ? <span>{props.value} <DialButton phone={props.value}/></span> : <span/>}/>
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item field="machineNumber" label="其他联系方式" {...formItemStyle.col4}>
                        <ViewOrEdit editComponent={Input} viewRenderer={props => props.value ? <span>{props.value} <DialButton phone={props.value}/></span> : <span/>}/>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item field="diseases" label="现有疾病" {...formItemStyle.col2}>
                        <ViewOrEdit
                            viewComponent={SelectMultipleDiseases.Viewer}
                            editRenderer={props => <SelectMultipleDiseases {...props} emptyTip="未搜索到匹配项"/>}/>
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={12}>
                    <Form.Item field="hospital" label="签约机构" {...formItemStyle.col2}>
                        <ViewOrEdit
                            viewRenderer={props => <SelectSingleHospitalPermisson.Viewer {...props} renderItem={item =>
                                <span>
                                    {item.name}（{item.eligibleChronicDiseaseCard ? '门慢不可用' : '门慢可用'}）
                                </span>
                            }/>}
                            editComponent={SelectSingleHospitalPermisson}/>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item field="doctor" label="签约医生" {...formItemStyle.col2}>
                        <ViewOrEdit
                            viewRenderer={props => props.value && props.value.name}
                            editRenderer={props => <SelectDoctorFromHospital {...props} />}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item field="address" label="居住地址" {...formItemStyle.col2}>
                        <ViewOrEdit
                            viewComponent={Address.Viewer}
                            editRenderer={props => <Address {...props} maxLength='50' addressCol={12} detailCol={12} addressPlaceholder="请选择省/市/区"/>} />
                        </Form.Item>
                </Col>
            </Row>
            <Form.Item field="tags" label="标签" {...formItemStyle.col1}>
                <ViewOrEdit
                    viewComponent={SelectMultipleTagsForEdit.Viewer}
                    editComponent={SelectMultipleTagsForEdit}/>
            </Form.Item>
        </ViewOrEdit.Group>
    </Form>
}
