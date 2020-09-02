import React, { Component } from 'react';
import {
    Button, Form, Row, Col, Select, Modal, InputNumber, Icon
} from 'antd';

import { connectRouter } from '../../mixins/router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import moment from 'moment'
import { setResult } from '../../states/check/newQuestionnairePreCheck';
import message from '@wanhu/antd-legacy/lib/message'
import { SmartSelectSingleAsync } from '../common/SmartSelectSingle';
import api from '../../api/api';
import PropeTypes from '../../helpers/prop-types';
import SmartSelectBox from '../common/SmartSelectBox';
import SmartSelectMultiple from '../common/SmartSelectMultiple';

import './index.less';
const { Option } = Select;
const FormItem = Form.Item;
const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
};
const miniformItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 16 },
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
class NewQuestionnairePreCheck extends Component {
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
        this.state = {
            anamnesis: [],
            showLength: 0,
            cancer: [],
            serviceList: [],
        };
    }

    async componentDidMount() {
        const { router } = this.props;
        const patientId = router.modalParam;
        this.patientId = patientId;
        if (patientId) {
            this.init(patientId);
        }
        const hdDisease = await api.getHdDiseases();
        if (hdDisease && hdDisease.anamnesis) {
            const anamnesis = hdDisease.anamnesis.map(item => ({
                ...item,
                id: item.icd10,
                name: item.title
            }));
            const isShow = [...hdDisease.anamnesis].filter(item => item.isShow === 1);

            this.setState({ anamnesis, showLength: isShow ? isShow.length : 0 })
        }
        if (hdDisease && hdDisease.cancer) {
            const cancer = hdDisease.cancer.map((item, index) => ({
                ...item,
                id: `${index}`,
                name: item.title
            }));
            this.setState({ cancer })
        }
    }


    onSubmit = () => {
        const { form } = this.props;
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
            const getValue = (key) => {
                return values[key] && values[key].length > 0 ? values[key][0] : null;
            }
            let { anamnesisList, cancer } = this.state;
            anamnesisList = anamnesisList.map(item => ({
                icd10: item.icd10,
                title: item.title,
                isShow: item.isShow,
            }));
            let { fdrsCancerList, secondDegreeRelativeCancerList } = values;
            fdrsCancerList = fdrsCancerList && fdrsCancerList.length > 0 ? fdrsCancerList.map(fItem => {
                const item = cancer.find(cItem => cItem.id === fItem)
                return {
                    icd10: item.icd10,
                    title: item.title,
                }
            }) : [];
            secondDegreeRelativeCancerList = secondDegreeRelativeCancerList && secondDegreeRelativeCancerList.length > 0 ? secondDegreeRelativeCancerList.map(fItem => {
                const item = cancer.find(cItem => cItem.id === fItem)
                return {
                    icd10: item.icd10,
                    title: item.title,
                }
            }) : [];
            const formData = {
                isSave: 1,
                ...values,
                sex: undefined,
                patientName: patientDetails.name,
                anamnesisList,
                anamnesisListNONE: undefined,
                fdrsCancerList,
                secondDegreeRelativeCancerList,
                gender: patientDetails.sex ? '男' : '女',
                immediateFamilyCcvd: getValue('immediateFamilyCcvd'),
                fdrsCancer: getValue('fdrsCancer'),
                secondDegreeRelativeCancer: getValue('secondDegreeRelativeCancer'),
                drinking: getValue('drinking'),
                smoking: getValue('smoking'),
                vegetablesFruits: getValue('vegetablesFruits'),
                hotFoodTea: getValue('hotFoodTea'),
                physicalExercise: getValue('physicalExercise'),
                insuranceOrderProductId: getValue('insuranceOrderProductId'),
            }
            console.log('physicalExercise', formData);
            try {
                const checkData = await api.savePrePhysicalQuestionnaire(this.patientId, formData);
                const resultData = {
                    formData,
                    checkData,
                    patientDetails,
                    patientId: this.patientId
                }
                const { setResult } = this.props;
                setResult(resultData);
                this.onCancel();
                this.props.router.openModal('newQuestionnairePreCheckResult');
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
            anamnesisList: [],
            fdrsCancerList: [],
            secondDegreeRelativeCancerList: [],
            serviceList: [],
        });
    }

    handlePatientSelect = async (value) => {
        this.reset();
        const optionData = this.patientOptionData.list;
        const index = optionData.findIndex(data => data.id === value.key);
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
            this.patientId = optionData[index].id;
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


    async init(id) {
        try {
            //查询服务包先
            let serviceList = await api.checkIsService(id);
            serviceList = serviceList.filter(item => {
                const pro = item.products.filter(pro => pro.insuranceProductType === 2 && pro.needEvaluate == 1);
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
                gender: patientDetails.sex ? '男' : '女',
            })
            validateFields(["sex", "age"]);
        } catch (e) {
            message.error(e.message);
        }
    }

    onAnamnesisListNONEChange = (data) => {
        if (data && data.length > 0) {
            const { form } = this.props;
            form.setFieldsValue({ anamnesisList: [] })
            this.setState({ anamnesisList: [] });
        }
    }
    onAnamnesisListChange = (data) => {
        this.setState({ anamnesisList: data });
        if (data && data.length > 0) {
            const { form } = this.props;
            form.setFieldsValue({ anamnesisListNONE: [] })
        }
    }

    checkAnamnesisList = async (rule, value, callback) => {
        const { form } = this.props;
        const anamnesisList = form.getFieldValue('anamnesisList');
        const anamnesisListNONE = form.getFieldValue('anamnesisListNONE');
        if ((!anamnesisList && !anamnesisListNONE) || [...anamnesisList, ...anamnesisListNONE].length <= 0) {
            callback('不能为空');
            return;
        }
        callback();
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
        const { getFieldDecorator, getFieldValue } = form;
        const {
            patientFieldValue,
            submitting,
            anamnesis,
            showLength,
            cancer,
            serviceList,
        } = this.state;

        const fdrsCancer = getFieldValue('fdrsCancer');
        const currentFdrsCancer = fdrsCancer && fdrsCancer.length > 0 ? fdrsCancer[0] : null;
        const secondDegreeRelativeCancer = getFieldValue('secondDegreeRelativeCancer');
        const currentSecondDegreeRelativeCancer = secondDegreeRelativeCancer && secondDegreeRelativeCancer.length > 0 ? secondDegreeRelativeCancer[0] : null;
        const smoking = getFieldValue('smoking');
        const currentSmoking = smoking && smoking.length > 0 ? smoking[0] : null;
        const modalFooter = (
            <div>
                <Row style={{ textAlign: 'center' }}>
                    <Button type="primary" loading={submitting} onClick={this.onSubmit}>
                        开始匹配体检套餐
                    </Button>
                </Row>
            </div>
        );
        let serviceOption = serviceList ? serviceList.map(item => {
            const service = item.products.find(pro => pro.insuranceProductType === 2 && pro.needEvaluate == 1);
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
                    title="定制体检评估"
                    width={1000}
                    visible
                    style={{ backgroundColor: '#f8f8f8' }}
                    onCancel={this.onCancel}
                    maskClosable={false}
                    footer={modalFooter}
                    className="newQuestionnairePreCheck"
                >
                    <Form
                        id="newQuestionnairePreCheck"
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
                                    getPopupContainer={() => document.getElementById('newQuestionnairePreCheck')}
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
                                        getPopupContainer={() => document.getElementById('newQuestionnairePreCheck')}
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
                                        getPopupContainer={() => document.getElementById('newQuestionnairePreCheck')}
                                    />
                                )}
                            </Form.Item>
                        </Row>
                        <Row>
                            <Form.Item label="年龄" {...formItemLayout}>
                                {getFieldDecorator('age', {
                                    rules: [
                                        { required: true, message: '不能为空' },
                                    ],
                                })(
                                    <InputNumber readOnly disabled />,
                                )}岁
                            </Form.Item>
                        </Row>
                        <Row>
                            <Form.Item label="身高" {...formItemLayout}>
                                {getFieldDecorator('height', {
                                    validateTrigger: 'onBlur',
                                    rules: [
                                        { required: true, message: '不能为空' },
                                        { validator: this.checkNum }
                                    ],
                                })(
                                    <InputNumber min={1} max={400} />,
                                )}cm
                            </Form.Item>
                        </Row>
                        <Row>
                            <Form.Item label="体重" {...formItemLayout}>
                                {getFieldDecorator('weight', {
                                    validateTrigger: 'onBlur',
                                    rules: [{ required: true, message: '不能为空' },
                                    { validator: this.checkNum }],
                                })(
                                    <InputNumber min={1} max={400} />,
                                )}kg
                            </Form.Item>
                        </Row>
                        <Row>
                            <Form.Item label="腰围" {...formItemLayout}>
                                {getFieldDecorator('waistline', {
                                    validateTrigger: 'onBlur',
                                    rules: [{ validator: this.checkNum }],
                                })(
                                    <InputNumber min={1} max={400} />,
                                )}cm
                            </Form.Item>
                        </Row>
                        <Row>
                            <FormItem
                                label="既往病史（可多选）"
                                required
                                {...formItemLayout}
                            >
                                {getFieldDecorator(
                                    'anamnesisList',
                                    {
                                        rules: [{ validator: this.checkAnamnesisList },],
                                    },
                                )(
                                    <SmartSelectMultiple
                                        editStatus
                                        onChange={this.onAnamnesisListChange}
                                        notEditableOnly={false}
                                        defaultButtonCount={showLength}
                                        selectOptions={anamnesis}
                                        getPopupContainer={() => document.getElementById('newQuestionnairePreCheck')}
                                    />
                                )}
                                <div style={{ paddingTop: 15 }}>
                                    {getFieldDecorator(
                                        'anamnesisListNONE',
                                        {
                                            rules: [{ validator: this.checkAnamnesisList },],
                                        },
                                    )(
                                        <SmartSelectBox
                                            editStatus
                                            notEditableOnly={false}
                                            buttonOptions={
                                                [
                                                    { id: 'NONE', name: '以上皆无' },
                                                ]
                                            }
                                            getPopupContainer={() => document.getElementById('newQuestionnairePreCheck')}
                                            onChange={this.onAnamnesisListNONEChange}

                                        />
                                    )}
                                </div>
                            </FormItem>
                        </Row>
                        <Row>
                            <Form.Item label="您的父母、子女是否患过心脑血管病" {...formItemLayout} >
                                {getFieldDecorator('immediateFamilyCcvd', {
                                    rules: [{ required: true, message: '不能为空' },],
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
                                        getPopupContainer={() => document.getElementById('newQuestionnairePreCheck')}
                                    />
                                )}
                                <span className="warningTip">
                                    <Icon type="question-circle" />
                                    此处指男55岁前、女65岁前患病史
                                </span>
                            </Form.Item>
                        </Row>
                        <Row>
                            <Form.Item label="您的父母、子女、兄弟姐妹是否患过癌症" {...formItemLayout} >
                                {getFieldDecorator('fdrsCancer', {
                                    rules: [{ required: true, message: '不能为空'}],
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
                                        getPopupContainer={() => document.getElementById('newQuestionnairePreCheck')}
                                    />
                                )}
                            </Form.Item>
                            <Form.Item label="" {...formItemLayout} style={{ marginTop: -40, marginLeft: 240 }}>
                                {
                                    currentFdrsCancer === '1'
                                        ? <div>
                                            <span>选择“是”，请确认是否为以下癌症（可多选，选填）：</span>
                                            {getFieldDecorator('fdrsCancerList', {
                                                rules: [],
                                            })(
                                                <SmartSelectBox
                                                    editStatus
                                                    multiple
                                                    notEditableOnly={false}
                                                    buttonOptions={cancer}
                                                    getPopupContainer={() => document.getElementById('newQuestionnairePreCheck')}
                                                />)}
                                        </div> : null}
                            </Form.Item>
                        </Row>
                        <Row>
                            <Form.Item label="您的爷爷奶奶、外公外婆、叔叔姑姑、舅舅姨妈是否患过癌症" {...formItemLayout} >
                                {getFieldDecorator('secondDegreeRelativeCancer', {
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
                                        getPopupContainer={() => document.getElementById('newQuestionnairePreCheck')}
                                    />
                                )}
                            </Form.Item>
                            <Form.Item label="" {...formItemLayout} style={{ marginTop: -40, marginLeft: 240 }}>
                                {
                                    currentSecondDegreeRelativeCancer === '1'
                                        ? <div>
                                            <span>选择“是”，请确认是否为以下癌症（可多选，选填）：</span>
                                            {getFieldDecorator('secondDegreeRelativeCancerList', {
                                                rules: [],
                                            })(
                                                <SmartSelectBox
                                                    editStatus
                                                    multiple
                                                    notEditableOnly={false}
                                                    buttonOptions={cancer}
                                                    getPopupContainer={() => document.getElementById('newQuestionnairePreCheck')}
                                                />)}
                                        </div> : null}
                            </Form.Item>
                        </Row>
                        <Row>
                            <Form.Item label="您的饮酒情况" {...formItemLayout}  >
                                {getFieldDecorator('drinking', {
                                    rules: [{ required: true, message: '不能为空' }],
                                })(
                                    <SmartSelectBox
                                        editStatus
                                        notEditableOnly={false}
                                        buttonOptions={
                                            [
                                                { id: '1', name: '几乎从不' },
                                                { id: '2', name: '偶尔' },
                                                { id: '3', name: '经常' },
                                            ]
                                        }
                                        getPopupContainer={() => document.getElementById('newQuestionnairePreCheck')}
                                    />
                                )}
                            </Form.Item>
                        </Row>
                        <Row>
                            <Form.Item label="您的吸烟情况" {...formItemLayout} >
                                {getFieldDecorator('smoking', {
                                    rules: [{ required: true, message: '不能为空' }],
                                })(
                                    <SmartSelectBox
                                        editStatus
                                        notEditableOnly={false}
                                        buttonOptions={
                                            [
                                                { id: '1', name: '从未' },
                                                { id: '2', name: '已戒烟' },
                                                { id: '3', name: '吸烟（含二手烟）' },
                                            ]
                                        }
                                        getPopupContainer={() => document.getElementById('newQuestionnairePreCheck')}
                                    />
                                )}
                                {currentSmoking === '2' || currentSmoking === '3' ?
                                    <div>
                                        <Form.Item label="每日吸烟量" {...miniformItemLayout}>
                                            {getFieldDecorator('dailySmoking', {
                                                rules: [
                                                    { required: true, message: '不能为空' },
                                                    { validator: this.checkNum }
                                                ],
                                            })(
                                                <InputNumber min={1} max={100} />,
                                            )}支
                                </Form.Item>
                                        <Form.Item label="吸烟年数" {...miniformItemLayout}>
                                            {getFieldDecorator('yearsSmoking', {
                                                rules: [
                                                    { required: true, message: '不能为空' },
                                                    { validator: this.checkNum }
                                                ],
                                            })(
                                                <InputNumber min={1} max={100} />,
                                            )}年
                                </Form.Item>
                                        {currentSmoking === '2' ?
                                            <div>
                                                <Form.Item label="戒烟年数" {...miniformItemLayout}>
                                                    {getFieldDecorator('quitSmokingYears', {
                                                        rules: [
                                                            { required: true, message: '不能为空' },
                                                            { validator: this.checkNum }
                                                        ],
                                                    })(
                                                        <InputNumber min={1} max={100} />,
                                                    )}年
                                                    </Form.Item >

                                            </div> : null
                                        }

                                    </div> : null
                                }
                            </Form.Item>
                        </Row>
                        <Row>
                            <Form.Item label="您是否经常食用新鲜蔬菜/水果" {...formItemLayout} >
                                {getFieldDecorator('vegetablesFruits', {
                                    rules: [{ required: true, message: '不能为空' }],
                                })(
                                    <SmartSelectBox
                                        editStatus
                                        notEditableOnly={false}
                                        buttonOptions={
                                            [
                                                { id: '1', name: '几乎从不' },
                                                { id: '2', name: '偶尔' },
                                                { id: '3', name: '经常' },
                                            ]
                                        }
                                        getPopupContainer={() => document.getElementById('newQuestionnairePreCheck')}
                                    />
                                )}
                            </Form.Item>
                        </Row>
                        <Row>
                            <Form.Item label="您是否喜欢食用烫食/烫茶" {...formItemLayout} >
                                {getFieldDecorator('hotFoodTea', {
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
                                        getPopupContainer={() => document.getElementById('newQuestionnairePreCheck')}
                                    />
                                )}
                            </Form.Item>
                        </Row>
                        <Row>
                            <Form.Item label="您是否经常参加中等强度以上的运动" {...formItemLayout} >
                                {getFieldDecorator('physicalExercise', {
                                    rules: [{ required: true, message: '不能为空' }],
                                })(
                                    <SmartSelectBox
                                        editStatus
                                        notEditableOnly={false}
                                        buttonOptions={
                                            [
                                                { id: '1', name: '几乎从不' },
                                                { id: '2', name: '偶尔' },
                                                { id: '3', name: '经常' },
                                            ]
                                        }
                                        getPopupContainer={() => document.getElementById('newQuestionnairePreCheck')}
                                    />
                                )} <span className="warningTip">
                                    <Icon type="question-circle" />
                                中等强度以上运动：持续20分钟以上的慢跑、快走、骑车、游泳、跳舞等
                        </span>
                            </Form.Item>
                        </Row>



                    </Form>
                </Modal>
            </div>
        );
    }
}



const NewQuestionnairePreCheckWrap = Form.create()(NewQuestionnairePreCheck);

function select(state) {
    return {
        check: state.check,
    };
}

function mapDispachToProps(dispatch) {
    return bindActionCreators({
        setResult
    }, dispatch);
}

export default connectRouter(connect(select, mapDispachToProps)(NewQuestionnairePreCheckWrap));
