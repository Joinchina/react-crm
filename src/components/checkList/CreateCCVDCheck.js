import React, { Component } from 'react';
import {
    Button, Form, Row, Col, Select, Modal, InputNumber, Icon
} from 'antd';

import { connectRouter } from '../../mixins/router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import { setCheckResult } from '../../states/check/createCCVDCheck';
import message from '@wanhu/antd-legacy/lib/message'
import { SmartSelectSingleAsync } from '../common/SmartSelectSingle';
import api from '../../api/api';
import PropeTypes from '../../helpers/prop-types';
import SmartSelectBox from '../common/SmartSelectBox';

import './index.less';
const { Option } = Select;
const FormItem = Form.Item;
const formItemLayout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 19 },
};
const mapPropsToFormItems = {
    editStatus: true,
    notEditableOnly: false,
};
const colStyle = {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
};
class CreateCCVDCheck extends Component {
    static propTypes = {
        openModal: PropeTypes.func,
        form: PropeTypes.shape().isRequired,
        router: PropeTypes.shape().isRequired,
    };

    static defaultProps = {
        openModal: undefined,
    };

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        const { router } = this.props;
        const patientId = router.modalParam;
        this.patientId = patientId;
        if (patientId) {
            this.init(patientId);
        }
    }


    onSubmit = () => {
        const { form, router } = this.props;
        form.validateFields(async (err, values) => {
            if (!this.patientId) {
                Modal.warning({
                    title: '请选择会员',
                    okText: '确定',
                });
                return;
            }
            if (err) {
                return;
            }
            this.setState({ submitting: true });
            const { patientDetails } = this.state;
            const formData = {
                ...values,
                gender: patientDetails.sex ? '男' : '女',
                sex: values.sex ? values.sex[0] : undefined,
                isHypotensor: values.isHypotensor ? values.isHypotensor[0] : undefined,
                smoke: values.smoke ? values.smoke[0] : undefined,
                diabetes: values.diabetes ? values.diabetes[0] : undefined,
                region: values.region ? values.region[0] : undefined,
                urbanRural: values.urbanRural ? values.urbanRural[0] : undefined,
                ASCVDFamilyHistory: values.ASCVDFamilyHistory ? values.ASCVDFamilyHistory[0] : undefined,
                insuranceOrderProductId: values.insuranceOrderProductId ? values.insuranceOrderProductId[0] : undefined,
            }
            try {
                const checkData = await api.saveCcvdAssessment(this.patientId, formData);
                const resultData = {
                    formData,
                    checkData,
                    patientDetails
                }
                const { setCheckResult } = this.props;
                setCheckResult(resultData);
                this.onCancel();
                this.props.router.openModal('createCCVDCheckResult');
            } catch (e) {
                message.error(e.message);
                this.setState({ submitting: false });
            }
        });
    }

    onCancel = () => {
        const { router } = this.props;
        router.closeModal();
        this.reset();
    }

    /* eslint-disable class-methods-use-this */
    getAgeByBirthday(dateString) {
        const today = new Date();
        const birthDate = new Date(dateString);
        const age = today.getFullYear() - birthDate.getFullYear();
        return age;
    }

    handlePatientChange = (value) => {
        if (!value) {
            this.reset();
        }
    }

    reset = () => {
        const { form } = this.props;
        form.resetFields();
        this.patientId = undefined;
        this.setState({
            patientDetails: undefined,
            patientFieldValue: undefined,
        });
    }

    handlePatientSelect = async (value) => {
        this.reset();
        const optionData = this.patientOptionData.list;
        const index = optionData.findIndex(data => data && data.id === value.key);
        if (index !== -1) {
            if (optionData[index].isDisabled) {
                Modal.error({
                    title: '该患者已被禁用',
                });
                return;
            }
            if (optionData[index].signStatus === 0) {
                Modal.warning({
                    content: '该会员信息缺失，不可进行订药、预约、领取红包等业务。请先完善信息，再进行其他操作。',
                    onOk: () => { this.props.router.push(`/customerDetails/${optionData[index].id}?editStatus=true`) },
                    okText: '确定'
                });
                return;
            }
            this.patientId = optionData[index] ? optionData[index].id : '';
            this.init(this.patientId);
        } else {
            Modal.error({
                title: '错误提示',
                content: '解析用户信息出错',
            });
        }
    }


    mapDataToOption = (data) => {
        this.patientOptionData = data;
        if (!data.list) return null;
        const options = data.list.map((row) => {
            const age = row.birthday ? `/${this.getAgeByBirthday(row.birthday)}岁` : '';
            const name = `${row.name} (${row.sex ? '男' : '女'}${age})`;
            return (
                <Option key={row.id}>
                    <Row key={name} gutter={10}>
                        <Col title={name} style={colStyle} span={5}>
                            {name}
                        </Col>
                        <Col title={row.phone || ''} style={colStyle} span={4}>
                            {row.phone || ''}
                        </Col>
                        <Col title={row.machineNumber || ''} style={colStyle} span={4}>
                            {row.machineNumber || ''}
                        </Col>
                        <Col title={row.address.liveStreet} style={colStyle} span={4}>
                            {row.address.liveStreet}
                        </Col>
                        <Col title={row.hospitalName} style={colStyle} span={7}>
                            {row.hospitalName}
                        </Col>
                    </Row>
                </Option>
            );
        });
        if (data.list.length === 11) {
            options.pop();
            options.push(
                <Option key="more" disabled style={{ textAlign: 'center' }}>
                    搜索结果过多，请尝试输入全名或其他信息
                </Option>,
            );
        }
        return options;
    }


    checkAge = async (rule, value, callback) => {
        if (!value) {
            callback();
            return;
        }
        //没有选择患者
        if (!this.patientId) {
            callback();
            return;
        }
        if (value < 20) {
            callback('年龄不符合评估范围');
        }
        callback();
    }

    async init(id) {
        try {
            //查询服务包先
            let serviceList = await api.checkIsService(id);
            serviceList = serviceList.filter(item => {
                const pro = item.products.filter(pro => pro.insuranceProductType === 3);
                return pro && pro.length > 0;
            });
            if (!serviceList || serviceList.length <= 0) {
                Modal.warning({
                    content: '该会员暂未开通此服务',
                    onOk: () => { return },
                    okText: '确定'
                });
                return;
            }
            this.setState({ serviceList });
            const patientDetails = await api.getPatient(id);
            const age = patientDetails.birthday ? `/${this.getAgeByBirthday(patientDetails.birthday)}岁` : '';
            const label = `${patientDetails.name} (${patientDetails.sex ? '男' : '女'}${age}) ${patientDetails.phone || ''} ${patientDetails.machineNumber || ''} ${patientDetails.address.liveStreet || ''} ${patientDetails.hospital.name || ''}`;
            const patientFieldValue = {
                key: id,
                label,
            };
            this.setState({ patientFieldValue, patientDetails });
            const { setFieldsValue, validateFields } = this.props.form;
            setFieldsValue({
                age: patientDetails.birthday ? this.getAgeByBirthday(patientDetails.birthday) : null,
                sex: [`${patientDetails.sex}`],
                gender: patientDetails.sex ? '男' : '女'
            })
            validateFields(["sex", "age"]);
        } catch (e) {
            message.error(e.message);
        }
    }

    checkNum = async (rule, value, callback) => {
        const pat = /^\d+\.?\d{0,2}$/;
        if (value && !pat.test(value)) {
            callback('请输入正确的数字');
        }
        callback();

    }

    render() {
        const { form } = this.props;
        const { getFieldDecorator } = form;
        const {
            patientFieldValue,
            submitting,
            serviceList,
        } = this.state;

        const modalFooter = (
            <div>
                <Row style={{ textAlign: 'center' }}>
                    <Button type="primary" loading={submitting} onClick={this.onSubmit}>
                        开始评估
                    </Button>
                </Row>

                <Row style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    当前所用评估模型基于国家心血管病中心的China-PAR模型研发，专门评估中国人心脑血管病（包括急性心肌梗死、冠心病和脑卒中）发病风险，本工具适用于20岁及以上、无心脑血管病史的人群。
                </Row>
            </div>
        );
        let serviceOption = serviceList ? serviceList.map(item => {
            const service = item.products.find(pro => pro.insuranceProductType === 3);
            const startDate = item.serviceStartDate ? moment(item.serviceStartDate).format('YYYY-MM-DD') : '--';
            const endDate = item.serviceEndDate ? moment(item.serviceEndDate).format('YYYY-MM-DD') : '--';
            return {
                id: `${service.id}`,
                name: <span>
                    {item.orderNo}<br />
                    {item.packageName}<br />
                    {item.gradeName}<br />
                    {startDate}至{endDate}<br />
                </span>
            }
        }) : null;
        return (
            <div>
                <Modal
                    title="心脑血管病风险评估"
                    width={1000}
                    visible
                    style={{ backgroundColor: '#f8f8f8' }}
                    onCancel={this.onCancel}
                    maskClosable={false}
                    footer={modalFooter}
                >
                    <Form
                        id="createCCVDCheck"
                        style={{ position: 'relative' }}
                        className="check"
                    >
                        <Row>
                            <FormItem
                                label="选择会员"
                                required
                                {...formItemLayout}
                            >
                                <SmartSelectSingleAsync
                                    {...mapPropsToFormItems}
                                    value={patientFieldValue}
                                    placeholder="输入会员姓名/身份证号/手机号/其他联系方式"
                                    allowClear
                                    showSearch
                                    filterOption={false}
                                    delay
                                    asyncResultId="addMedicineRegister.ChoosePatient"
                                    asyncRequestFuncName="searchPatient"
                                    onChange={this.handlePatientChange}
                                    onSelect={this.handlePatientSelect}
                                    cleanOptionsOnBlur
                                    getPopupContainer={() => document.getElementById('createCCVDCheck')}
                                    asyncMapResultToState={
                                        (data, params) => (params.keyWord ? data : undefined)
                                    }
                                    mapDataToOption={this.mapDataToOption}
                                />
                            </FormItem>
                        </Row>
                        <Row>
                            <Form.Item label="选择服务订单" {...formItemLayout} >
                                {getFieldDecorator('insuranceOrderProductId', {
                                    rules: [{ required: true, message: '不能为空' }],
                                })(
                                    <SmartSelectBox
                                        editStatus
                                        notEditableOnly={false}
                                        buttonOptions={serviceOption}
                                        getPopupContainer={() => document.getElementById('createCCVDCheck')}
                                    />
                                )}
                            </Form.Item>
                        </Row>

                        <Row>
                            <Form.Item label="性别" {...formItemLayout} className='sex_sty'>
                                {getFieldDecorator('sex', {
                                    rules: [{ required: true, message: '不能为空' }],
                                })(
                                    <SmartSelectBox
                                        notEditableOnly
                                        buttonOptions={
                                            [
                                                { id: '1', name: '男' },
                                                { id: '0', name: '女' },
                                            ]
                                        }
                                        getPopupContainer={() => document.getElementById('createCCVDCheck')}
                                    />
                                )}
                            </Form.Item>
                        </Row>
                        <Row>
                            <Form.Item label="年龄" {...formItemLayout}>
                                {getFieldDecorator('age', {
                                    rules: [
                                        { required: true, message: '不能为空' },
                                        { validator: this.checkAge },
                                    ],
                                })(
                                    <InputNumber readOnly disabled />,
                                )}岁
                            </Form.Item>
                        </Row>
                        <Row>
                            <Form.Item label="是否在用降压药" {...formItemLayout} >
                                {getFieldDecorator('isHypotensor', {
                                    rules: [{ required: true, message: '不能为空' }],
                                })(
                                    <SmartSelectBox
                                        editStatus
                                        notEditableOnly={false}
                                        buttonOptions={
                                            [
                                                { id: '0', name: '否' },
                                                { id: '1', name: '是' },
                                            ]
                                        }
                                        getPopupContainer={() => document.getElementById('createCCVDCheck')}
                                    />
                                )}
                            </Form.Item>
                        </Row>
                        <Row>
                            <Form.Item label="当前收缩压" {...formItemLayout}>
                                {getFieldDecorator('currentSBP', {
                                    validateTrigger: 'onBlur',
                                    rules: [
                                        { required: true, message: '不能为空' },
                                        { validator: this.checkNum }
                                    ],
                                })(
                                    <InputNumber min={70} max={200} />,
                                )}mmHg
                            </Form.Item>
                        </Row>
                        <Row>
                            <Form.Item label="总胆固醇" {...formItemLayout}>
                                {getFieldDecorator('tc', {
                                    validateTrigger: 'onBlur',
                                    rules: [
                                        { validator: this.checkNum }
                                    ],
                                })(
                                    <InputNumber min={80} max={400} />,
                                )}mg/dl
                                <span className="warningTip">
                                    <Icon type="question-circle" />
                                    需确认血压值与是否服用降压药的关系
                                </span>
                            </Form.Item>
                        </Row>
                        <Row>
                            <Form.Item label="高密度脂蛋白胆固醇" {...formItemLayout}>
                                {getFieldDecorator('hdlc', {
                                    validateTrigger: 'onBlur',
                                    rules: [
                                        { validator: this.checkNum }
                                    ],
                                })(
                                    <InputNumber min={20} max={130} />,
                                )}mg/dl
                            </Form.Item>
                        </Row>
                        <Row>
                            <Form.Item label="腰围" {...formItemLayout}>
                                {getFieldDecorator('waistline', {
                                    validateTrigger: 'onBlur',
                                    rules: [
                                        { validator: this.checkNum }
                                    ],
                                })(
                                    <InputNumber min={50} max={130} />,
                                )}cm
                            </Form.Item>
                        </Row>
                        <Row>
                            <Form.Item label="当前吸烟情况" {...formItemLayout} >
                                {getFieldDecorator('smoke', {
                                    rules: [{ required: true, message: '不能为空' }],
                                })(
                                    <SmartSelectBox
                                        editStatus
                                        notEditableOnly={false}
                                        buttonOptions={
                                            [
                                                { id: '0', name: '从未' },
                                                { id: '0.5', name: '已戒烟' },
                                                { id: '1', name: '吸烟（含二手烟）' },
                                            ]
                                        }
                                        getPopupContainer={() => document.getElementById('createCCVDCheck')}
                                    />
                                )}
                            </Form.Item>
                        </Row>
                        <Row>
                            <Form.Item label="当前是否患有糖尿病" {...formItemLayout} >
                                {getFieldDecorator('diabetes', {
                                    rules: [{ required: true, message: '不能为空' }],
                                })(
                                    <SmartSelectBox
                                        editStatus
                                        notEditableOnly={false}
                                        buttonOptions={
                                            [
                                                { id: '0', name: '否' },
                                                { id: '1', name: '是' },
                                            ]
                                        }
                                        getPopupContainer={() => document.getElementById('createCCVDCheck')}
                                    />
                                )}
                            </Form.Item>
                        </Row>
                        <Row>
                            <Form.Item label="居住地所处地域" {...formItemLayout} >
                                {getFieldDecorator('region', {
                                    rules: [],
                                })(
                                    <SmartSelectBox
                                        editStatus
                                        cancelledable
                                        notEditableOnly={false}
                                        buttonOptions={
                                            [
                                                { id: '2', name: '南方' },
                                                { id: '1', name: '北方' },
                                            ]
                                        }
                                        getPopupContainer={() => document.getElementById('createCCVDCheck')}
                                    />
                                )} <span className="warningTip">
                                    <Icon type="question-circle" />
                                    建议以长江为界，长江以南为南方、长江以北为北方
                            </span>
                            </Form.Item>
                        </Row>
                        <Row>
                            <Form.Item label="居住地属于城乡或农村" {...formItemLayout} >
                                {getFieldDecorator('urbanRural', {
                                    rules: [],
                                })(
                                    <SmartSelectBox
                                        editStatus
                                        cancelledable
                                        notEditableOnly={false}
                                        buttonOptions={
                                            [
                                                { id: '1', name: '城市' },
                                                { id: '0', name: '农村' },
                                            ]
                                        }
                                        getPopupContainer={() => document.getElementById('createCCVDCheck')}
                                    />
                                )}
                            </Form.Item>
                        </Row>
                        <Row>
                            <Form.Item label="有无心血管家族史" {...formItemLayout} >
                                {getFieldDecorator('ASCVDFamilyHistory', {
                                    rules: [{ required: true, message: '不能为空' }],
                                })(
                                    <SmartSelectBox
                                        editStatus
                                        notEditableOnly={false}
                                        buttonOptions={
                                            [
                                                { id: '0', name: '无' },
                                                { id: '1', name: '有' },
                                            ]
                                        }
                                        getPopupContainer={() => document.getElementById('createCCVDCheck')}
                                    />
                                )}<span className="warningTip">
                                    <Icon type="question-circle" />
                                    指会员的父母、兄弟姐妹中是否有人患有急性心肌梗死、冠心病、脑卒中等病症
                            </span>
                            </Form.Item>
                        </Row>

                    </Form>
                </Modal>
            </div>
        );
    }
}



const CreateCCVDCheckWrap = Form.create()(CreateCCVDCheck);

function select(state) {
    return {
        check: state.check,
    };
}

function mapDispachToProps(dispatch) {
    return bindActionCreators({
        setCheckResult
    }, dispatch);
}

export default connectRouter(connect(select, mapDispachToProps)(CreateCCVDCheckWrap));

// const CreateCCVDCheckWrap = Form.create()(CreateCCVDCheck);
// export default connectModal(connect(
//     state => ({
//         checkResult: state.check.CCVDCheck.checkResult,
//     }),
//     dispatch => bindActionCreators({
//         setCheckResult
//     }, dispatch)
// )(CreateCCVDCheckWrap));
