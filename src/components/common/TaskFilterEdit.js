import React, { Component } from 'react';
import { Button, Form, DatePicker, Row, Col } from 'antd';
import { Select, Input } from './trackable';
import NestedFormAsItem from './form/NestedFormAsItem';
import blacklist from 'blacklist';
import { closestScrollableArea } from '../../helpers/dom';
import SelectSingleTaskType from './SelectSingleTaskType';
import SelectMultipleHospital from './SelectMultipleHospitalDropdown';

const opsOfChoice = [
    {
        id: '$eq',
        name: '等于',
    },
    {
        id: '$neq',
        name: '不等于',
    },
    {
        id: '$in',
        name: '包含',
    },
    {
        id: '$nin',
        name: '不包含',
    },
];

const opsOfDate = [
    {
        id: '$eq',
        name: '等于',
    },
    {
        id: '$neq',
        name: '不等于',
    },
    {
        id: '$gt',
        name: '大于（晚于）',
    },
    {
        id: '$lt',
        name: '小于（早于）',
    },
];

const opsOfText = [
    {
        id: '$eq',
        name: '等于',
    },
    {
        id: '$neq',
        name: '不等于',
    },
    {
        id: '$in',
        name: '包含',
    },
    {
        id: '$nin',
        name: '不包含',
    },
];


function laterThanNow(date) {
    return date && date.valueOf() > Date.now();
}

const lhsList = [
    {
        id: 'workType',
        label: '任务类型',
        ops: opsOfChoice,
        type: SelectSingleTaskType.forGroupType(1),
        props: { keyword: '任务类型' }
    },
    {
        id: 'organization',
        label: '签约机构',
        ops: opsOfChoice,
        type: SelectMultipleHospital.forDataRange('crm.task_pool.edit,crm.task_pool.admin', 'or', {status: 0}),
        props: {
            keyword: '签约机构',
            mapItemToId: hospital => hospital.ownerCompany
        }
    },
    {
        id: 'content',
        label: '主题',
        ops: opsOfText,
        type: Input,
        props: {
            placeholder: '请输入主题'
        }
    },
    {
        id: 'contactsName',
        label: '会员姓名',
        ops: opsOfText,
        type: Input,
        props: {
            placeholder: '请输入会员姓名'
        }
    },
    {
        id: 'contactsIdcard',
        label: '身份证号',
        ops: opsOfText,
        type: Input,
        props: {
            placeholder: '请输入身份证号'
        }
    },
    {
        id: 'contactsPhone',
        label: '手机',
        ops: opsOfText,
        type: Input,
        props: {
            placeholder: '请输入手机'
        }
    },
    {
        id: 'otherContactsMode',
        label: '其他联系方式',
        ops: opsOfText,
        type: Input,
        props: {
            placeholder: '请输入其他联系方式'
        }
    },
    {
        id: 'createDate',
        label: '创建时间',
        ops: opsOfDate,
        type: DatePicker,
        props: {
            placeholder: '请选择创建时间',
            style: { display: 'block' },
            getCalendarContainer: closestScrollableArea,
        }
    },
    {
        id: 'updateDate',
        label: '更新时间',
        ops: opsOfDate,
        type: DatePicker,
        props: {
            placeholder: '请选择更新时间',
            style: { display: 'block' },
            getCalendarContainer: closestScrollableArea,
        }
    },
];

const styles = {
    line: {
        height: 60,
    },
    label: {
        width: 20,
        display: 'inline-block'
    }
}

const lhsMap = {};
lhsList.forEach(t => lhsMap[t.id] = t);

class EditorProxy extends Component {

    render (){
        const Type = this.props.type;
        return <Type {...blacklist(this.props, 'type')}/>
    }
}

let uuid = 0;
class TaskFilterEdit extends NestedFormAsItem {

    constructor(props, ...args){
        super(props, ...args);

        const initialValues = this.syncValueToForm(props);
        if (!initialValues.keys) {
            initialValues.keys = [];
        }
        this.initialValues = initialValues;
    }

    componentWillReceiveProps(props) {
        super.componentWillReceiveProps(props);
        if (props.value === this.props.value) {
            return;
        }
        const nv = this.syncValueToForm(props);
        const form = this.props.form;
        form.setFieldsValue(nv);
        form.validateFields(Object.getOwnPropertyNames(nv));
    }

    componentDidMount(){
        this.props.form.setFieldsValue(this.initialValues);
    }

    syncValueToForm(props) {
        const form = props.form;
        const value = props.value || [];
        if (!Array.isArray(value)) {
            throw new Error('TaskFilterEdit only accept arrays as value');
        }
        const fv = form.getFieldsValue();
        const keys = fv.keys || [];
        const nv = {};
        const newKeys = [];
        for (let i = 0; i < keys.length && i < value.length; i ++) {
            newKeys.push(keys[i]);
        }
        for (let i = keys.length; i < value.length; i ++) {
            uuid++;
            newKeys.push(uuid);
        }
        newKeys.forEach((key, i) => {
            const filter = value[i];
            if (fv[`lhs-${key}`] !== filter.lhs) {
                nv[`lhs-${key}`] = filter.lhs;
            }
            if (fv[`op-${key}`] !== filter.op) {
                nv[`op-${key}`] = filter.op;
            }
            if (nv[`rhs-${key}`] !== filter.rhs) {
                nv[`rhs-${key}`] = filter.rhs;
            }
        });
        if (keys.length !== newKeys.length || keys.some((v, i) => newKeys[i] !== v)) {
            nv.keys = newKeys;
        }
        return nv;
    }

    remove = (k) => {
        const {form} = this.props;
        const keys = form.getFieldValue('keys');
        form.setFieldsValue({
            keys: keys.filter(key => key !== k)
        });
        this.changeValue();
    }

    add = () => {
        uuid++;
        const { form } = this.props;
        const keys = form.getFieldValue('keys');
        const nextKeys = keys.concat(uuid);
        form.setFieldsValue({
            keys: nextKeys,
        });
        this.changeValue();
    }

    changeValue(key, value) {
        if (key && key.startsWith('lhs')) {
            const id = key.substr(4);
            this.props.form.resetFields([`rhs-${id}`, `op-${id}`]);
        }
        if (!this.props.onChange) {
            return;
        }
        const vals = this.props.form.getFieldsValue();
        if (key) {
            vals[key] = value;
        }
        const filters = [];
        for (const k of vals.keys) {
            filters.push({
                lhs: vals[`lhs-${k}`],
                op: vals[`op-${k}`],
                rhs: vals[`rhs-${k}`],
            });
        }
        this.props.onChange(filters);
    }

    render(){
        const { getFieldDecorator, getFieldValue } = this.props.form;
        getFieldDecorator('keys', {
            initialValue: this.initialValues.keys,
            onChange: val => this.changeValue('keys', val)
        });
        const keys = getFieldValue('keys');
        return <div>
            {
                keys.map((k, i) => {
                    const lhsKey = getFieldValue(`lhs-${k}`);
                    const lhs = lhsMap[lhsKey];
                    const ops = lhs && lhs.ops;
                    const type = lhs && lhs.type || Input;
                    const props = lhs && lhs.props || { disabled: true };
                    return <Row key={k} gutter={5} className={`-x-repeat-conditions -x-index-${i}`}>
                        <Col span={1} style={{textAlign:'right'}}>{i+1} .</Col>
                        <Col span={5} className="ant-form">
                            <Form.Item className="ant-form-item-dyn-height">{
                                getFieldDecorator(`lhs-${k}`, {
                                    rules: [{ required: true, message: '不能为空' }],
                                    // initialValue: this.initialValues[`lhs-${k}`],
                                    onChange: val => this.changeValue(`lhs-${k}`, val)
                                })(
                                    <Select trackerId="-x-id-conditions-field" placeholder="请选择筛选字段" getPopupContainer={closestScrollableArea}>
                                        {
                                            lhsList.map(p => <Select.Option key={p.id} value={p.id}>{p.label}</Select.Option>)
                                        }
                                    </Select>
                                )
                            }
                            </Form.Item>
                        </Col>
                        <Col span={4} className="ant-form">
                            <Form.Item className="ant-form-item-dyn-height">{
                                getFieldDecorator(`op-${k}`, {
                                    rules: [{ required: true, message: '不能为空' }],
                                    // initialValue: this.initialValues[`op-${k}`],
                                    onChange: val => this.changeValue(`op-${k}`, val)
                                })(
                                    <Select trackerId="-x-id-conditions-op" placeholder="请选择条件" disabled={!ops} getPopupContainer={closestScrollableArea}>
                                        {
                                            ops ?
                                                ops.map(op => <Select.Option key={op.id} value={op.id}>{op.name}</Select.Option>)
                                                : null
                                        }
                                    </Select>
                                )
                            }
                            </Form.Item>
                        </Col>
                        <Col span={13} className="ant-form">
                            <Form.Item className="ant-form-item-dyn-height">{
                                getFieldDecorator(`rhs-${k}`, {
                                    rules: [{ required: true, message: '不能为空' }],
                                    // initialValue: this.initialValues[`rhs-${k}`],
                                    onChange: e => {
                                        if (e.target) {
                                            this.changeValue(`rhs-${k}`, e.target.value);
                                        } else {
                                            this.changeValue(`rhs-${k}`, e);
                                        }
                                    }
                                })(<EditorProxy type={type} trackerId="-x-id-conditions-value" {...props}/>)
                            }</Form.Item>
                        </Col>
                        <Col span={1}>
                            <Button className="-x-id-conditions-remove" shape="circle" icon="close" onClick={()=>this.remove(k)}></Button>
                        </Col>
                    </Row>;
                })
            }
            <Row gutter={5}>
                { keys.length > 0 ?
                    <Col span={1}></Col>
                    : null
                }
                <Col span={23}>
                    <Button className="-x-id-add_condition" onClick={this.add}>添加条件</Button>
                </Col>
            </Row>
        </div>;
    }
}

const colStyle = {
    style: {
        marginBottom: 6
    }
}

const viewerLhsMap = {
    organization: {
        id: 'organization',
        label: '机构',
        ops: opsOfChoice,
        type: SelectMultipleHospital.forDataRange('crm.task_pool.edit,crm.task_pool.admin', 'or', {status: 0}).Viewer,
        props: {
            style: {
                borderRadius: 2,
                border: '1px solid #d9d9d9',
                height: 36,
                padding: '0 10px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: 'rgba(0, 0, 0, 0.25)',
            },
            mapItemToId: hospital => hospital.ownerCompany,
            renderItem: (item, index) => index === 0 ? item.name : `，${item.name}`,
            renderNotFoundItem: (item, index) => index === 0 ? item.name : `，${item.name}`,
            keyword: '机构'
        }
    }
};

class TaskFilterViewer extends Component {

    render(){
        return <div className={this.props.className} style={this.props.style}>{
        (this.props.value || []).map((item, i) =>{
            const lhsKey = item.lhs;
            const lhs = viewerLhsMap[lhsKey] || lhsMap[lhsKey];
            const ops = lhs && lhs.ops;
            const type = lhs && lhs.type || Input;
            const props = lhs && lhs.props || { disabled: true };
            return <Row key={i} gutter={5}>
                <Col span={1} style={{textAlign:'right'}}>{i+1} .</Col>
                <Col span={5} {...colStyle}>
                    <Select disabled placeholder="请选择筛选字段" value={item.lhs}>
                        {
                            lhsList.map(p => <Select.Option key={p.id} value={p.id}>{p.label}</Select.Option>)
                        }
                    </Select>
                </Col>
                <Col span={4} {...colStyle}>
                    <Select disabled placeholder="请选择条件" value={item.op}>
                        {
                            ops ?
                                ops.map(op => <Select.Option key={op.id} value={op.id}>{op.name}</Select.Option>)
                                : null
                        }
                    </Select>
                </Col>
                <Col span={13} {...colStyle}>
                    <EditorProxy type={type} {...props} value={item.rhs} disabled/>
                </Col>
            </Row>;
        })
        }</div>
    }
}

const TaskFilterEditWithForm = Form.create()(TaskFilterEdit);
TaskFilterEditWithForm.Viewer = TaskFilterViewer;

export default TaskFilterEditWithForm;
export { TaskFilterEditWithForm };
