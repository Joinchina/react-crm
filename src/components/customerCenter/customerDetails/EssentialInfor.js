import React from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import {
    Select, Row, Col, Form, Button, Affix, Modal,
} from 'antd';
import message from '@wanhu/antd-legacy/lib/message'
import moment from 'moment';
import SmartInput from '../../common/SmartInput';
import { renewEssentialInfoForm, clearEssentialInfoForm } from '../../../states/customerCenter/essentialInfoForm';
import SmartSelectSingle from '../../common/SmartSelectSingle';
import { SmartSelectSingleForSource } from '../../common/SmartSelectSingleForSource';
import SmartSelectBox from '../../common/SmartSelectBox';
import {
    getDoctorsByHospitalIdAction,
    patientAction,
    potentialCustomeAction,
    updatePatientAction,
    updatePotentialCustomeAction,
    checkIdCardAction,
    checkPhoneNumberAction,
    potentialCustomMatchingAction,
    resetCustomerDetails,
} from '../../../states/customerCenter/customerDetails';
import { getPatientAction } from '../../../states/customerCenter/customerTabs';
import BaseComponent from '../../BaseComponent';
import { isArray, isLagel } from '../../../helpers/checkDataType';
import SmartSelectBoxForInsurance from '../../common/SmartSelectBoxForInsurance';
import SmartSelectMultipleAsyncForDiseases from '../../common/SmartSelectMultipleAsyncForDiseases';
import SmartSelectMultipleAsyncForTaskType from '../../common/SmartSelectMultipleAsyncForTaskType';
import IDValidator from '../../../helpers/checkIdCard';
import AlertError, { alertError } from '../../common/AlertError';
import api from '../../../api/api';
import { SelectMultipleTags } from '../../common/SelectMultipleTags';
import { Address } from '../../common/Address';
import { ViewOrEdit } from '../../common/form';
import { phone as phoneRegExp } from '../../../helpers/common-regexp';
import url from 'url';
import querystring from 'querystring';
import '../customer.css';

const SelectMultipleTagsForEdit = SelectMultipleTags.forDataRange(2);
const { Option } = Select;
const FormItem = Form.Item;
const { confirm, error } = Modal;
class EssentialInfor extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            editStatus: false,
            visible: true,
            memberType: null,
        };
        const { customerId, source } = this.props;
        this.update = this.update.bind(this);
        this.customerId = customerId;
        this.isShow = source === 'customerDetails';
        this.resetFields = false;
        this.editFields = false;
        this.isSignStatus;
    }

    componentDidMount() {
        if (this.isShow) {
            this.props.patientAction(this.customerId);
        } else {
            this.props.potentialCustomeAction(this.customerId);
        }
        const urlObj = url.parse(this.props.location.search);
        const query = querystring.parse(urlObj.query);
        if (query.editStatus) {
            this.setState({
                editStatus: true,
            });
        }
    }

    componentWillReceiveProps(nextProps) {
        const { form } = this.props;
        if (this.props.customerId !== nextProps.customerId) {
            this.props.form.resetFields();
            this.customerId = nextProps.customerId;
            nextProps.clearEssentialInfoForm();
            if (this.isShow) {
                this.props.patientAction(nextProps.customerId);
            } else {
                this.props.potentialCustomeAction(nextProps.customerId);
            }
            this.setState({
                editStatus: false,
            });
            this.editFields = false;
        }
        if (this.props.customerDetails.postResult && nextProps.customerDetails.postResult && this.props.customerDetails.postResult !== nextProps.customerDetails.postResult && nextProps.customerDetails.postResult.status === 'fulfilled') {
            if (this.isShow) {
                this.props.patientAction(this.customerId);
                this.props.getPatientAction(this.customerId);
            } else {
                this.props.potentialCustomeAction(this.customerId);
            }
            this.setState({
                editStatus: false,
            });
        }

        if (this.props.customerDetails.postResult && nextProps.customerDetails.postResult && this.props.customerDetails.postResult !== nextProps.customerDetails.postResult && nextProps.customerDetails.postResult.status === 'rejected') {
            if (nextProps.customerDetails.postResult.payload
                && nextProps.customerDetails.postResult.payload.code === 134) { // 有未取药的订单
                this.setState({
                    visible: true,
                });
            }
        }
        if (this.props.customerDetails.result && this.props.customerDetails.result.signStatus === 0) {
            this.isSignStatus = this.customerId;
        }
        if (this.isSignStatus && this.props.customerDetails.postResult && this.props.customerDetails.result && this.props.customerDetails.result.signStatus !== 0) {
            this.isSignStatus = undefined;
            message.success("该见习会员已成为正式会员。");

        }
        if (this.props.customerDetails.matchingStatus !== 'fulfilled' && nextProps.customerDetails.matchingStatus === 'fulfilled') {
            this.props.form.validateFields((err, values) => {
                if (err) {
                    return;
                }
                this.update(values);
            });
        } else if (this.props.customerDetails.matchingStatus !== 'rejected' && nextProps.customerDetails.matchingStatus === 'rejected') {
            const result = nextProps.customerDetails.matchingResult;
            if (result.code === 305) { //存在确定按钮的提示框
                confirm({
                    content: result.message,
                    onOk: () => {
                        form.validateFields((err, values) => {
                            if (err) {
                                return;
                            }
                            this.update(values);
                        });
                    },
                    onCancel: () => {
                        this.handleCancel();
                    },
                });
            } else if (result.code === 301) { //警告提示框
                error({
                    content: result.message,
                    onOk: () => {
                        this.handleCancel();
                    },
                });
            } else {
                alertError(nextProps.customerDetails.matchingStatus);
            }
        }
        if (this.props.customerDetails.status !== 'fulfilled' && nextProps.customerDetails.status === 'fulfilled') {
            const data = isLagel(nextProps.customerDetails.result);
            this.setState({ memberType: data.memberType });
            const hospital = isLagel(data.hospital);
            this.props.getDoctorsByHospitalIdAction(hospital.id);
        }
        const urlObj = url.parse(this.props.location.search);
        const query = querystring.parse(urlObj.query);
        if (query.editStatus && this.props.customerId !== nextProps.customerId) {
            this.editFields = true;
            this.setState({
                editStatus: true,
            });
        }
        if (this.props.customerId == nextProps.customerId && !query.editStatus && !this.state.editStatus && !this.editFields && !query.editStatus &&
            nextProps.customerDetails.result && nextProps.customerDetails.result.signStatus === 0 &&
            !(this.props.customerDetails.postResult && this.props.customerDetails.postResult !== nextProps.customerDetails.postResult && nextProps.customerDetails.postResult.status === 'fulfilled')) {
            this.editFields = true;
            Modal.warning({
                content: '该会员信息缺失，不可进行订药、预约、领取红包等业务。请先完善信息，再进行其他操作。',
                onOk: () => this.setState({
                    editStatus: true,
                }),
                okText: '确定'
            });
        }
    }

    componentWillUnmount() {
        this.props.resetCustomerDetails();
        this.props.clearEssentialInfoForm();
    }

    handleModalCancel = () => {
        this.setState({
            visible: false,
        });
    }

    switchState = () => {
        this.setState(prevState => ({ editStatus: !prevState.editStatus }));
    }

    checkAddress = (rule, value, callback) => {
        const address = value;
        if (!address.liveProvinces) {
            const error = '不能为空';
            callback(error);
        } else if (this.isShow && !address.liveStreet) {
            callback('请输入详细地址');
        } else {
            callback();
        }
    }

    validateFields = (func, id) => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err) {
                return;
            }
            if (this.isShow) {
                const { form } = this.props;
                const { getFieldValue } = form;
                const age = getFieldValue('age');
                if (age && (age < 18 || age > 120)) {
                    form.setFields({ age: { value: age, errors: ['年龄不能超过18~120的范围'] } });
                    return;
                }
                func(values);
            } else {
                let params = { potentialId: this.customerId };
                const result = isLagel(values);
                if (result.idCard) {
                    params = isLagel(params);
                    params.idCard = result.idCard;
                }
                if (result.name) {
                    params = isLagel(params);
                    params.name = result.name.trim();
                }
                if (result.phone) {
                    params = isLagel(params);
                    params.phone = result.phone;
                }
                func(id, params);
            }
        });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        if (this.isShow) {
            this.validateFields(this.update);
        } else {
            this.validateFields(
                this.props.potentialCustomMatchingAction,
                this.customerId,
            );
        }
        this.editFields = true;
    }

    handleCancel = () => {
        const { data } = this.result('customerDetails');
        const doctor = isLagel(data.doctor);
        const hospital = isLagel(data.hospital);
        let doctorItem;
        if (doctor.id && doctor.name) {
            doctorItem = { key: doctor.id, label: doctor.name };
        }
        this.editFields = true;
        this.setState({
            editStatus: false,
        },
            () => {
                this.props.form.resetFields();
                if (this.isShow) {
                    this.props.form.setFieldsValue({ doctor: doctorItem });
                    this.props.getDoctorsByHospitalIdAction(hospital.id);
                }
            });
    }

    handleHospitalSelect = (value) => {
        this.props.form.resetFields(['doctor']);
        this.resetFields = true;
        this.props.getDoctorsByHospitalIdAction(value.key);
    }

    update(params) {
        const { customerDetails } = this.props;
        let nowdetail = super.result('customerDetails').data;
        const nowphone = this.props.form.getFieldValue('phone');
        const nowmachineNumber = this.props.form.getFieldValue('machineNumber');
        if (!nowphone && nowdetail.phone && nowmachineNumber && nowmachineNumber == nowdetail.phone) {
            const error = new Error('未被占用的手机号请填写至手机号信息中');
            this.props.form.setFields({ machineNumber: { value: nowmachineNumber, errors: [error] } });
            return;
        }
        const checkUndefined = (data) => {
            if (data === undefined || data === null) {
                return undefined;
            }
            return data;
        };
        const getId = (data, type) => {
            if (Array.isArray(data)) {
                return data.map((item) => {
                    if (type === 'number') {
                        return parseInt(item.id, 10);
                    }
                    return item.id;
                });
            }
            return undefined;
        };
        const checkArray = (data, index = 0) => {
            if (Array.isArray(data)) {
                return checkUndefined(data[index]);
            }
            return undefined;
        };
        const checkObj = (data, key) => {
            if (data) {
                return checkUndefined(data[key]);
            }
            return '';
        };
        const validator = IDValidator;
        const idCard = String(params.idCard);
        const birthday = validator.getInfo(idCard).birth;
        let tags = '';
        if (params.tags) {
            for (let tag of params.tags) {
                tags += tag.id + ',';
            }
        }
        const data = {
            idCard: checkUndefined(params.idCard) || undefined,
            birthday,
            name: checkUndefined(params.name).trim(),
            phone: checkUndefined(params.phone) || undefined,
            machineNumber: checkUndefined(params.machineNumber) || undefined,
            address: JSON.stringify({
                provinceId: checkObj(params.address, 'liveProvinces'),
                cityId: checkObj(params.address, 'liveCity'),
                areaId: checkObj(params.address, 'liveArea'),
                street: checkObj(params.address, 'liveStreet'),
            }),
            diseases: JSON.stringify(getId(params.diseases)),
            insurance: checkArray(params.insurance),
            chronicDiseases: getId(params.chronicDiseases),
            drugPurchase: params.drugPurchase && params.drugPurchase.length > 0 ? params.drugPurchase[0] : undefined,
            testBlood: params.testBlood && params.testBlood.length > 0 ? params.testBlood[0] : undefined,
            tags,
        };
        if (this.isShow) {
            data.hospitalId = checkObj(params.hospital, 'key');
            data.doctorId = checkObj(params.doctor, 'key');
            data.taskFreeze = JSON.stringify(getId(params.taskFreeze, 'number'));
            this.props.updatePatientAction(this.customerId, data);
        } else {
            const sex = checkArray(params.sex);
            const age = checkUndefined(params.age);
            data.age = age || undefined;
            data.sex = sex || undefined;
            data.flags = checkArray(params.taskFreeze) || '0';
            this.props.updatePotentialCustomeAction(this.customerId, data);
        }
    }

    checkIdCard = async (rule, value, callback) => {
        let { data } = this.result('customerDetails');
        data = isLagel(data);
        const beforeIdCard = data.idCard || '';
        if (!this.isShow && !value) {
            callback();
            return;
        }
        const validator = IDValidator;
        const valueStr = String(value);
        if (validator.isValid(valueStr)) {
            if (this.isShow && beforeIdCard.toUpperCase() !== value.toUpperCase()) {
                try {
                    await api.checkIdCardNo(value);
                } catch (e) {
                    if (e) {
                        callback(e.message);
                    }
                }
            } else {
                callback();
                return;
            }
            const info = validator.getInfo(value);
            const sex = info.sex ? '1' : '0';
            const age = moment().year() - moment(info.birth).year();
            this.props.form.setFields({ sex: { value: [sex] }, age: { value: age } });
            callback();
        } else if (data.signStatus !== 0) {
            this.props.form.resetFields(['sex', 'age']);
            callback('请输入正确的身份证号');
        }
    }

    /* eslint-disable class-methods-use-this */
    getAgeByBirthday(dateString) {
        if (!dateString) return '';
        const today = new Date();
        const birthDate = new Date(dateString);
        const age = today.getFullYear() - birthDate.getFullYear();
        return age;
    }

    checkPhoneNumber = async (rule, value, callback) => {
        const machineNumber = this.props.form.getFieldValue('machineNumber');
        let { data } = this.result('customerDetails');
        if (data && data.signStatus === 0 && !value) {
            const error = new Error('不能为空');
            callback(error);
        } else {
            data = isLagel(data);
            if (!value && data.signStatus !== 0) {
                const error = new Error('手机号不能为空');
                callback(error);
                this.props.form.setFields({ machineNumber: { value: machineNumber } });
            } else {
                /* this.props.form.setFields({ machineNumber: { value: machineNumber } }); */
                if (value && !phoneRegExp.test(value)) {
                    callback('请输入正确的手机号码');
                } else {
                    if (this.isShow && value && data.phone !== value) {
                        try {
                            const result = await api.checkPhoneNumber(value);
                            if (result.list.length) {
                                callback('手机号码已存在');
                            }
                        } catch (e) {
                            message.error(e.message);
                        }
                    }
                    callback();
                }
            }
        }

    }

    checkContact = async (rule, value, callback) => {
        const phone = this.props.form.getFieldValue('phone');
        let { data } = this.result('customerDetails');
        if (value && phoneRegExp.test(value)) {
            const result = await api.checkPhoneNumber(value);
            if (!result.list.length) {
                const error = new Error('未被占用的手机号请填写至手机号信息中');
                callback(error);
            }
        }
        if (data && data.signStatus === 0) {
            callback();
        } else {
            if (!phone) {
                const error = new Error('手机号不能为空');
                this.props.form.setFields({ phone: { value: phone, errors: [error] } });
            } else {
                callback();
                if (phone && !phoneRegExp.test(phone)) {
                    this.props.form.setFields({ phone: { value: phone, errors: [new Error('请输入正确的手机号码')] } });
                } else {
                    this.props.form.setFields({ phone: { value: phone } });
                }
            }
        }

    }

    checkAge = (rule, value, callback) => {
        if (!this.isShow && value && !/^\+?[1-9][0-9]*$/.test(value)) {
            callback('请输入正确的年龄');
        } else {
            callback();
        }
    }

    ageEdit = (idCard) => {
        if (this.isShow) {
            return true;
        }
        if (idCard) {
            return true;
        }
        return false;
    }

    get permission() {
        let { data } = super.result('customerDetails');
        data = isLagel(data);
        return !data.isEdit;
    }

    memberTypeChange(value) {
        const memberType = value[0];
        this.setState({ memberType });
        this.props.form.resetFields(['doctor', 'hospital', 'insurance']);
        // this.props.form.setFieldsValue({ doctor: null, hospital: undefined});
    }

    render() {
        const styles = this.styles();
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
        };
        const { editStatus, visible } = this.state;
        const { customerDetails, form } = this.props;
        const { getFieldDecorator } = form;
        let { data } = super.result('customerDetails');
        data = isLagel(data);
        let nameString = ''
        if(data.insuranceMemberType && data.insuranceMemberType.length>0){
            let number=data.insuranceMemberType
            if(number.indexOf(1)!=-1){
                nameString += '【万户健康会员】'
            }
            if(number.indexOf(2)!=-1){
                nameString += '【移山会员】'
            }
            if(number.indexOf(3)!=-1 ){
                nameString += '【南药会员】'
            }
        }else{
            nameString= ''
        }
        const mapPropsToFormItems = {
            switchState: this.switchState,
            editStatus,
            notEditableOnly: this.permission,
        };
        let diseases = isArray(data.diseases);
        diseases = diseases.map(item => ({ id: item.id, name: item.name, selected: true }));
        let chronicDiseases = isArray(data.chronicDiseases);
        chronicDiseases = chronicDiseases.map(item => ({
            id: item.id, name: item.name, selected: true,
        }));
        const address = isLagel(data.address);
        const addressItem = [];
        if (address.liveProvinces) addressItem.push(address.liveProvinces);
        if (address.liveCity) addressItem.push(address.liveCity);
        if (address.liveArea) addressItem.push(address.liveArea);
        let memberType = data.memberType ? [`${data.memberType}`] : null;
        const hospital = isLagel(data.hospital);
        let hospitalItem;
        if (hospital.id && hospital.name && this.state.memberType === data.memberType) {
            hospitalItem = { key: hospital.id, label: hospital.name };
        }
        const doctor = isLagel(data.doctor);
        let doctorItem;
        if (doctor.id && doctor.name && !this.resetFields && this.state.memberType === data.memberType) {
            doctorItem = { key: doctor.id, label: doctor.name };
        }
        const insurance = isLagel(data.insurance);
        let insuranceItem;
        if (insurance.id && insurance.name) {
            insuranceItem = [insurance.id];
        }
        if (this.state.memberType == 2) {
            insuranceItem = ['cc4f67f79047414c80127bfd1413bcce'];
        }
        const tags = isArray(data.tags);
        let taskFreeze = isArray(data.taskFreeze);
        taskFreeze = taskFreeze.map(item => ({ id: item }));
        let sex;
        if (data.sex === 1) {
            sex = ['1'];
        }
        if (data.sex === 0) {
            sex = ['0'];
        }
        let testBlood;
        if (data.testBlood === 1) {
            testBlood = ['1'];
        } else if (data.testBlood === 0) {
            testBlood = ['0'];
        }
        const doctorsResult = isLagel(this.props.customerDetails.doctors);
        let doctorOptions;
        if (doctorsResult.payload && Array.isArray(doctorsResult.payload.list)) {
            doctorOptions = doctorsResult.payload.list.map(row => (
                <Option key={row.id}>
                    {row.name}
                </Option>
            ));
        }
        return (
            <div>
                <div className="block">
                    <div style={styles.box}>
                        <Form id="essentialInfoForm">
                            <Row gutter={20}>
                                <Col span={12}>
                                    <FormItem
                                        label="姓名"
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator(
                                            'name',
                                            {
                                                initialValue: data.name,
                                                rules: [
                                                    { required: true, message: '不能为空' },
                                                ],
                                            },
                                        )(
                                            <SmartInput
                                                {...mapPropsToFormItems}
                                                notEditableOnly={data.certification}
                                                placeholder=""
                                                maxLength="20"
                                            />,
                                        )}
                                    </FormItem>
                                </Col>

                                <Col span={12}>
                                    <FormItem
                                        label="身份证号"
                                        required={this.isShow && data && data.signStatus !== 0}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator(
                                            'idCard',
                                            {
                                                validateTrigger: 'onBlur',
                                                initialValue: data.idCard,
                                                rules: [
                                                    { validator: this.checkIdCard },
                                                ],
                                            },
                                        )(
                                            <SmartInput
                                                {...mapPropsToFormItems}
                                                notEditableOnly={data.certification}
                                                placeholder=""
                                                maxLength="18"
                                            />,
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                            {
                                this.isShow ? (
                                    <Row gutter={20}>

                                        <Col span={12}>
                                            <FormItem
                                                label="会员类型"
                                                labelCol={{ span: 5 }}
                                                wrapperCol={{ span: 19 }}
                                            >
                                                {getFieldDecorator(
                                                    'memberType',
                                                    {
                                                        rules: [
                                                            { required: this.isShow, message: '不能为空' },
                                                        ],
                                                        initialValue: memberType,
                                                    },
                                                )(
                                                    <SmartSelectBox
                                                        {...mapPropsToFormItems}
                                                        // cancelledable
                                                        onChange={(e) => this.memberTypeChange(e)}
                                                        buttonOptions={
                                                            [
                                                                { id: '1', name: '保障会员' },
                                                                { id: '2', name: '绿A会员' },
                                                            ]
                                                        }
                                                    />,
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem
                                                label="会员级别"
                                                {...formItemLayout}
                                            >
                                                {getFieldDecorator('signLevel', {
                                                    initialValue: data.gradeName,
                                                })(
                                                    <SmartInput
                                                        {...mapPropsToFormItems}
                                                        notEditableOnly={this.isShow || this.permission}
                                                        placeholder=""
                                                        maxLength="3"
                                                    />,
                                                )}
                                            </FormItem>
                                        </Col>

                                    </Row>
                                ) : null
                            }

                            <Row gutter={20}>
                                <Col span={12}>
                                    <FormItem
                                        label="性别"
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator(
                                            'sex',
                                            {
                                                initialValue: sex,
                                            },
                                        )(
                                            <SmartSelectBox
                                                {...mapPropsToFormItems}
                                                notEditableOnly={this.isShow || this.permission}
                                                buttonOptions={
                                                    [
                                                        { id: '1', name: '男' },
                                                        { id: '0', name: '女' },
                                                    ]
                                                }
                                            />,
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem
                                        label="年龄"
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator(
                                            'age',
                                            {
                                                initialValue: (
                                                    () => this.getAgeByBirthday(data.birthday)
                                                )(),
                                                rules: [
                                                    { validator: this.checkAge },
                                                ],
                                            },
                                        )(
                                            <SmartInput
                                                {...mapPropsToFormItems}
                                                notEditableOnly={this.isShow || this.permission}
                                                placeholder=""
                                                maxLength="3"
                                            />,
                                        )}
                                    </FormItem>
                                </Col>

                            </Row>

                            <Row gutter={20}>
                                <Col span={12}>
                                    <FormItem
                                        label="手机号码"
                                        {...formItemLayout}
                                        required
                                    >
                                        {getFieldDecorator(
                                            'phone',
                                            {
                                                initialValue: data.phone,
                                                validateTrigger: 'onBlur',
                                                rules: [
                                                    {
                                                        validator: this.checkPhoneNumber,
                                                        required: this.isShow && data && data.signStatus === 0
                                                    },
                                                ],
                                            },
                                        )(
                                            <SmartInput
                                                {...mapPropsToFormItems}
                                                placeholder=""
                                                maxLength="11"
                                            />,
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem
                                        label="其他联系方式"
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator(
                                            'machineNumber',
                                            {
                                                initialValue: data.machineNumber,
                                                validateTrigger: 'onBlur',
                                                rules: [
                                                    { validator: this.checkContact },
                                                ],
                                            },
                                        )(
                                            <SmartInput
                                                {...mapPropsToFormItems}
                                                placeholder=""
                                                maxLength="50"
                                            />,
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                            {
                                this.isShow
                                    ? (
                                        <Row gutter={20}>
                                            <Col span={12}>
                                                <FormItem
                                                    label="签约机构"
                                                    {...formItemLayout}
                                                >
                                                    {getFieldDecorator(
                                                        'hospital',
                                                        {
                                                            initialValue: hospitalItem,
                                                            rules: [
                                                                { required: true, message: '不能为空' },
                                                            ],
                                                        },
                                                    )(

                                                        <SmartSelectSingleForSource
                                                            {...mapPropsToFormItems}
                                                            placeholder="请选择"
                                                            asyncResultId="editEssentialInfor"
                                                            showSearch
                                                            asyncRequestFuncName={this.state.memberType == 1 ? 'get1Hospital' : 'get3Hospital'}
                                                            // asyncRequestFuncName="get1Hospital"
                                                            asyncRequestTrigger="componentDidMount"
                                                            onSelect={this.handleHospitalSelect}
                                                            asyncMapResultToState={data => (
                                                                Array.isArray(data)
                                                                    ? data.map(row => (
                                                                        {
                                                                            value: row.id,
                                                                            text: row.name,
                                                                        }
                                                                    ))
                                                                    : []
                                                            )}
                                                        />)}
                                                </FormItem>
                                            </Col>
                                            <Col span={12}>
                                                <FormItem
                                                    label="签约医生"
                                                    {...formItemLayout}
                                                >
                                                    {getFieldDecorator(
                                                        'doctor',
                                                        {
                                                            initialValue: doctorItem,
                                                            rules: [
                                                                { required: this.isShow && data && data.signStatus !== 0, message: '不能为空' },
                                                            ],
                                                        },
                                                    )(
                                                        <SmartSelectSingle
                                                            {...mapPropsToFormItems}
                                                            placeholder="请选择"
                                                        >
                                                            {doctorOptions}
                                                        </SmartSelectSingle>,
                                                    )}
                                                </FormItem>
                                            </Col>
                                        </Row>
                                    )
                                    : null
                            }
                            <Row gutter={20}>
                                <Col span={12}>
                                    <FormItem
                                        label="保险类型"
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator(
                                            'insurance',
                                            {
                                                initialValue: insuranceItem,
                                                rules: [
                                                    { required: this.isShow, message: '不能为空' },
                                                ],
                                            },
                                        )(
                                            <SmartSelectBoxForInsurance
                                                {...mapPropsToFormItems}
                                                editStatus={this.state.editStatus && this.state.memberType != 2}
                                            />,
                                        )}
                                    </FormItem>
                                </Col>

                                <Col span={12}>
                                    <FormItem
                                        label="居住地址"
                                        labelCol={{ span: 4 }}
                                        wrapperCol={{ span: 20 }}
                                    >
                                        {getFieldDecorator(
                                            'address',
                                            {
                                                initialValue: address,
                                                rules: [
                                                    { required: this.isShow, message: '不能为空' },
                                                    { validator: this.checkAddress, }
                                                ],
                                            },
                                        )(
                                            <ViewOrEdit
                                                changeEditingDisabled={this.permission}
                                                editing={editStatus}
                                                onChangeEditing={this.switchState}
                                                viewComponent={Address.Viewer}
                                                editRenderer={props => <Address {...props} maxLength="50" addressCol={12} detailCol={12} detailPlaceholder="请输入详细地址" addressPlaceholder="请选择省/市/区" />}
                                            />,
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>


                            <Row gutter={20}>
                                <Col span={12}>
                                    <FormItem
                                        label="现有疾病"
                                        labelCol={{ span: 4 }}
                                        wrapperCol={{ span: 20 }}
                                    >
                                        {getFieldDecorator(
                                            'diseases',
                                            {
                                                initialValue: diseases,
                                                rules: [],
                                            },
                                        )(
                                            <SmartSelectMultipleAsyncForDiseases
                                                {...mapPropsToFormItems}
                                                placeholder="请选择其他疾病"
                                                defaultButtonCount={0}
                                            />,
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem
                                        label="门慢疾病"
                                        labelCol={{ span: 4 }}
                                        wrapperCol={{ span: 20 }}
                                    >
                                        {getFieldDecorator(
                                            'chronicDiseases',
                                            {
                                                initialValue: chronicDiseases,
                                            },
                                        )(
                                            <SmartSelectMultipleAsyncForDiseases
                                                {...mapPropsToFormItems}
                                                selectStyle={{ width: '50%' }}
                                                getPopupContainer={() => document.getElementById('essentialInfoForm')}
                                                placeholder="选择其他疾病"
                                                defaultButtonCount={0}
                                            />,
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row gutter={20}>
                                <Col span={12}>
                                    <FormItem
                                        label="加入PBM前购药渠道"
                                        labelCol={{ span: 5 }}
                                        wrapperCol={{ span: 19 }}
                                    >
                                        {getFieldDecorator(
                                            'drugPurchase',
                                            {
                                                rules: [],
                                                initialValue: data.drugPurchase ? [`${data.drugPurchase}`] : undefined,
                                            },
                                        )(
                                            <SmartSelectBox
                                                {...mapPropsToFormItems}
                                                cancelledable
                                                buttonOptions={
                                                    [
                                                        { id: '3', name: '药店' },
                                                        { id: '1', name: '三甲医院' },
                                                        { id: '2', name: '社区医院' },
                                                    ]
                                                }
                                            />,
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem
                                        label="日常检测血糖血压"
                                        labelCol={{ span: 5 }}
                                        wrapperCol={{ span: 19 }}
                                    >
                                        {getFieldDecorator(
                                            'testBlood',
                                            {
                                                rules: [],
                                                initialValue: testBlood,
                                            },
                                        )(
                                            <SmartSelectBox
                                                {...mapPropsToFormItems}
                                                cancelledable
                                                buttonOptions={
                                                    [
                                                        { id: '1', name: '有' },
                                                        { id: '0', name: '无' },
                                                    ]
                                                }
                                            />,
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row gutter={20}>
                                <Col span={12}>
                                    <FormItem
                                        label="标签"
                                        labelCol={{ span: 4 }}
                                        wrapperCol={{ span: 20 }}
                                    >
                                        {getFieldDecorator(
                                            'tags',
                                            {
                                                initialValue: tags,
                                            },
                                        )(
                                            <ViewOrEdit
                                                changeEditingDisabled={this.permission}
                                                editing={editStatus}
                                                onChangeEditing={this.switchState}
                                                viewComponent={
                                                    SelectMultipleTagsForEdit.Viewer
                                                }
                                                editComponent={
                                                    SelectMultipleTagsForEdit
                                                }
                                            />,
                                        )}
                                    </FormItem>
                                </Col>
                                {
                                    this.isShow
                                        ? (
                                            <Col span={12}>
                                                <FormItem
                                                    label="任务状态"
                                                    labelCol={{ span: 4 }}
                                                    wrapperCol={{ span: 20 }}
                                                >
                                                    {getFieldDecorator(
                                                        'taskFreeze',
                                                        {
                                                            initialValue: taskFreeze,
                                                        },
                                                    )(
                                                        <SmartSelectMultipleAsyncForTaskType
                                                            {...mapPropsToFormItems}
                                                            placeholder="请选择其他状态"
                                                            defaultButtonCount={0}
                                                            asyncMapResultToState={data => (
                                                                Array.isArray(data.list)
                                                                    ? data.list.map(row => ({ value: row.id, text: `${row.name}冻结` }))
                                                                    : []
                                                            )}
                                                        />,
                                                    )}
                                                </FormItem>
                                            </Col>
                                        )
                                        : (
                                            <Col span={12}>
                                                <FormItem
                                                    label="任务状态"
                                                    labelCol={{ span: 4 }}
                                                    wrapperCol={{ span: 20 }}
                                                >
                                                    {getFieldDecorator(
                                                        'taskFreeze',
                                                        {
                                                            multiple: true,
                                                            initialValue: data.flags ? ['1'] : [],
                                                        },
                                                    )(
                                                        <SmartSelectBox
                                                            {...mapPropsToFormItems}
                                                            multiple
                                                            buttonOptions={
                                                                [
                                                                    { id: '1', name: '签约邀请冻结' },
                                                                ]
                                                            }
                                                        />,
                                                    )}
                                                </FormItem>
                                            </Col>
                                        )
                                }
                            </Row>
                            <Row gutter={20}>
                                {
                                    this.isShow ? (
                                        <Col span={12}>
                                            <FormItem
                                                label="推荐人"
                                                {...formItemLayout}
                                            >
                                                {getFieldDecorator('recommender', { initialValue: data.recommender || '' })(
                                                    <SmartInput
                                                        {...mapPropsToFormItems}
                                                        notEditableOnly={this.isShow || this.permission}
                                                        placeholder=""
                                                        maxLength="3"
                                                    />,
                                                )}
                                            </FormItem>
                                        </Col>
                                    ) : null}
                                    {
                                    this.isShow ? (
                                        <Col span={12}>
                                            <FormItem
                                                label="会员标识"
                                                {...formItemLayout}
                                            >
                                                {getFieldDecorator('insuranceMemberType',
                                                { initialValue: nameString || '' })(
                                                    <SmartInput
                                                        {...mapPropsToFormItems}
                                                        notEditableOnly={this.isShow || this.permission}
                                                        placeholder=""
                                                        maxLength="3"
                                                    />,
                                                )}
                                            </FormItem>
                                        </Col>
                                    ) : null}
                            </Row>



                            {
                                !this.isShow
                                && (
                                    <Row gutter={20}>
                                        <Col span={12}>
                                            <FormItem
                                                label="邀约机构"
                                                {...formItemLayout}
                                            >
                                                {getFieldDecorator(
                                                    'createDate',
                                                    {
                                                        initialValue: data.hospital
                                                            && data.hospital.name,
                                                    },
                                                )(
                                                    <SmartInput
                                                        {...mapPropsToFormItems}
                                                        notEditableOnly
                                                        placeholder=""
                                                    />,
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem
                                                label="创建时间"
                                                {...formItemLayout}
                                            >
                                                {getFieldDecorator(
                                                    'createDate',
                                                    {
                                                        initialValue: moment(data.createDate).format('YYYY-MM-DD HH:mm:ss'),
                                                    },
                                                )(
                                                    <SmartInput
                                                        {...mapPropsToFormItems}
                                                        notEditableOnly
                                                        placeholder=""
                                                    />,
                                                )}
                                            </FormItem>
                                        </Col>
                                    </Row>
                                )
                            }
                            {
                                !this.isShow
                                && (
                                    <Row gutter={20}>
                                        <Col span={12}>
                                            <FormItem
                                                label="营销活动"
                                                {...formItemLayout}
                                            >
                                                {getFieldDecorator(
                                                    'active',
                                                    {
                                                        initialValue: data.active,
                                                    },
                                                )(
                                                    <SmartInput
                                                        {...mapPropsToFormItems}
                                                        notEditableOnly
                                                        placeholder=""
                                                    />,
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem
                                                label="销售渠道"
                                                {...formItemLayout}
                                            >
                                                {getFieldDecorator(
                                                    'channelName',
                                                    {
                                                        initialValue: data.channelName,
                                                    },
                                                )(
                                                    <SmartInput
                                                        {...mapPropsToFormItems}
                                                        notEditableOnly
                                                        placeholder=""
                                                    />,
                                                )}
                                            </FormItem>
                                        </Col>
                                    </Row>
                                )
                            }
                        </Form>
                    </div>
                </div>
                {
                    editStatus
                        ? (
                            <Row>
                                <Col>
                                    <Affix
                                        offsetBottom={0}
                                        ref={affix => affix && affix.updatePosition({})}
                                    >
                                        <div className="block" style={styles.foot}>
                                            <Button
                                                style={styles.footBtn}
                                                loading={this.props.customerDetails.updateState === 'pending'}
                                                type="primary"
                                                onClick={this.handleSubmit}
                                            >
                                                保存
                                            </Button>
                                            <Button
                                                disabled={this.props.customerDetails.updateState === 'pending'}
                                                onClick={this.handleCancel}
                                                className="cancelButton"
                                            >
                                                取消
                                            </Button>
                                            {
                                                (customerDetails.updateResult
                                                    && customerDetails.updateResult.code === 134)
                                                    ? (
                                                        <Modal
                                                            visible={visible}
                                                            footer={false}
                                                            onCancel={this.handleModalCancel}
                                                        >
                                                            <p>
                                                                {
                                                                    customerDetails.updateResult.message.split(',').map((item, index) => (
                                                                        <div key={item.id || index}>
                                                                            {item}
                                                                        </div>
                                                                    ))
                                                                }
                                                            </p>
                                                        </Modal>
                                                    )
                                                    : (
                                                        <AlertError
                                                            status={customerDetails.updateState}
                                                            payload={customerDetails.updateResult}
                                                        />
                                                    )
                                            }
                                        </div>
                                    </Affix>
                                </Col>
                            </Row>
                        )
                        : null
                }
                <AlertError
                    status={this.props.customerDetails.status}
                    payload={this.props.customerDetails.result}
                />
            </div>
        );
    }

    styles() {
        return {
            box: {
                padding: 20,
            },
            foot: {
                textAlign: 'center',
                height: 60,
                lineHeight: '60px',
            },
            footBtn: {
                marginRight: 10,
            },
        };
    }
}

const Wrapper = Form.create({
    mapPropsToFields(props) {
        const { essentialInfoForm } = props;
        return { ...essentialInfoForm };
    },
    onFieldsChange(props, fields) {
        const { renewEssentialInfoForm } = props;
        renewEssentialInfoForm(fields);
    },
})(EssentialInfor);

function select(state) {
    return {
        params: state.routerReducer.location.state,
        essentialInfoForm: state.essentialInfoForm,
        customerDetails: state.customerDetails,
    };
}

function mapDispachToProps(dispatch) {
    return bindActionCreators({
        renewEssentialInfoForm,
        patientAction,
        potentialCustomeAction,
        updatePatientAction,
        updatePotentialCustomeAction,
        checkIdCardAction,
        potentialCustomMatchingAction,
        checkPhoneNumberAction,
        getDoctorsByHospitalIdAction,
        clearEssentialInfoForm,
        resetCustomerDetails,
        getPatientAction,
    }, dispatch);
}

export default connect(select, mapDispachToProps)(Wrapper);
