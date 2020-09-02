import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { InputNumber, Input, Button, Row, Col, Select,
    Breadcrumb, Affix, Form as AntdForm, Spin, Tag, Modal } from 'antd';

import { Form, ViewOrEdit, fieldBuilder } from '../../common/form';
import SelectMultipleDiseases from '../../common/SelectMultipleDiseases';
import SelectSingleTaskType from '../../common/SelectSingleTaskType';
import SelectMultipleTags from '../../common/SelectMultipleTags';
import Address from '../../common/Address';
import moment from 'moment';
import { sex } from '../../../helpers/enums';
import { testPermission } from '../../common/HasPermission';
import DialButton from '../../call/DialButton';

const FormLabel = AntdForm.Item;
const SelectMultipleTagsForEdit = SelectMultipleTags.forDataRange(2);

const formDef = Form.def({
    phone: fieldBuilder()
            .required('请输入手机号码')
            .maxLength(11)
            .pattern(/^(|(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|17[0-9]{1}|(18[0-9]{1}))+\d{8}))$/, '请输入正确的手机号码')
            ,
    diseases: fieldBuilder(),
    address: fieldBuilder()
        .validator(val => {
            if (!val || !val.liveProvinces || !val.liveCity || !val.liveArea) {
                return '请选择省/市/区';
            }
            if (val && `${val.liveStreet}`.length > 50) {
                return '详细地址最多输入50个字符'
            }
        }),
    tags: fieldBuilder()
});

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

export default function PotentialPatientForm(props) {
    const task = props.task;
    const allowEdit = testPermission('patient.edit') && (task.taskStatus === 0 || task.taskStatus === 1) && task.patientEditable
    return <Form def={formDef}
        data={props.data}
        onFieldsChange={props.onFieldsChange}
        formRef={props.formRef}
        hideRequiredMark={props.hideRequiredMark}
        >
        <ViewOrEdit.Group value={props.editing} onChange={props.onChangeEditing} disabled={!allowEdit}>
            <Row>
                <Col span={3}>
                    <FormLabel label="姓名" {...formItemStyle.labelOnly}/>
                </Col>
                <Col span={5}>
                    <ViewOrEdit editing={false} changeEditingDisabled value={task.name}/>
                </Col>
                <Col span={3}>
                    <FormLabel label="性别" {...formItemStyle.labelOnly}/>
                </Col>
                <Col span={5}>
                    <ViewOrEdit editing={false} changeEditingDisabled value={task.sex}
                        viewRenderer={props => sex.map[props.value]}
                    />
                </Col>
                <Col span={3}>
                    <FormLabel label="年龄" {...formItemStyle.labelOnly}/>
                </Col>
                <Col span={5}>
                    <ViewOrEdit editing={false} changeEditingDisabled value={task.birthday}
                        viewRenderer={props => props.value && `${moment().year() - moment(props.value).year()} 岁`}
                    />
                </Col>
            </Row>
            <Row>
                <Col span={8}>
                    <Form.Item field="phone" label="手机号码" {...formItemStyle.col3}>
                        <ViewOrEdit placeholder="-" editComponent={Input} viewRenderer={props => props.value ? <span>{props.value} <DialButton phone={props.value}/></span> : <span/>}/>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item field="diseases" label="现有疾病" {...formItemStyle.col3}>
                        <ViewOrEdit
                            viewComponent={SelectMultipleDiseases.Viewer}
                            editComponent={SelectMultipleDiseases}/>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item field="address" label="居住地址" {...formItemStyle.col3}>
                        <ViewOrEdit
                            viewComponent={Address.Viewer}
                            editRenderer={props => <Address {...props} maxLength={50} addressCol={12} detailCol={12} addressPlaceholder="请选择省/市/区"/>} />
                    </Form.Item>
                </Col>
            </Row>
            {/* <Row>
                <Col span={12}>
                    <Form.Item field="hospital" label="签约机构" {...formItemStyle.col2}>
                        <ViewOrEdit
                            viewComponent={SelectSingleHospital.Viewer}
                            editComponent={SelectSingleHospital}/>
                    </Form.Item>
                </Col>

            </Row> */}
            <Form.Item field="tags" label="标签" {...formItemStyle.col1}>
                <ViewOrEdit
                    viewComponent={SelectMultipleTagsForEdit.Viewer}
                    editComponent={SelectMultipleTagsForEdit}/>
            </Form.Item>
            <Row>
                <Col span={3}>
                    <FormLabel label="主题" {...formItemStyle.labelOnly}/>
                </Col>
                <Col span={21}>

                    {/* <ViewOrEdit editing={false} changeEditingDisabled
                        value={task.content}
                        viewRenderer={props =>
                            <div style={{whiteSpace:'pre-line'}}>
                                <SelectSingleTaskType.Viewer value={{ id: task.taskType }} renderItem={item => <Tag color="#f00">{item.name}</Tag>}/>
                                {props.value}
                            </div>}
                    /> */}
                    <div style={{minHeight: 36, lineHeight: '36px', borderBottom: '1px solid rgb(217, 217, 217)'}}><Tag color="#f00">{task.taskTypeName}</Tag>{props.isNewTask ? <span>/<Tag color="#f00" style={{marginLeft: 8}}>{task.taskReclassifyName}</Tag></span> : ''}{task.content}</div>
                </Col>
            </Row>
        </ViewOrEdit.Group>
    </Form>
}
