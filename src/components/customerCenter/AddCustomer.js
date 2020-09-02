import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
    Button, DatePicker, Form, Input, Row, Col, Select, Modal,
} from 'antd';
import message from '@wanhu/antd-legacy/lib/message'
import store from 'store';
import moment from 'moment';
import SmartSelectSingle from '../common/SmartSelectSingle';
import { SmartSelectSingleForSource } from '../common/SmartSelectSingleForSource';
import SmartSelectMultipleAsyncForDiseases from '../common/SmartSelectMultipleAsyncForDiseases';
import SmartSelectBox from '../common/SmartSelectBox';
import SmartInput from '../common/SmartInput';
import SmartSelectBoxForInsurance from '../common/SmartSelectBoxForInsurance';
import SmartCascaderTerritory from '../common/SmartCascaderTerritory';
import AddCustomerContact from './AddCustomerContact';
import AddMedicineRequirement from './AddMedicineRequirement';
import CuttingLine from '../common/FormCuttingLine';
import { connectModalHelper } from '../../mixins/modal';
import { SelectMultipleTags } from '../common/SelectMultipleTags';
import IDValidator from '../../helpers/checkIdCard';
import {
    getHospitalAction,
    getPotentialPatientAction,
    checkContractNoAction,
    getDoctorsByHospitalIdAction,
    renewFormDataAction,
    checkPhoneNumberAction,
    checkIdCardAction,
    checkMemberCardNoAction,
    checkBusinessCodeAction,
    postCustomerInfoAction,
    getPatientCountAction,
    resetAction,
    getDrugRequirementsAction,
    getPatientContactsAction,
} from '../../states/customerCenter/addCustomer';
import { phone as phoneRegExp } from '../../helpers/common-regexp';
import PropTypes from '../../helpers/prop-types';
import api from '../../api/api';

const { Option } = Select;
const FormItem = Form.Item;

class AddCustomer extends Component {
    static propTypes = {
        currentModalParam: PropTypes.string,
        closeModal: PropTypes.func,
        getHospitalAction: PropTypes.func.isRequired,
        getPotentialPatientAction: PropTypes.func.isRequired,
        getPatientCountAction: PropTypes.func.isRequired,
        resetAction: PropTypes.func.isRequired,
        postCustomerInfoAction: PropTypes.func.isRequired,
        checkIdCardAction: PropTypes.func.isRequired,
        checkMemberCardNoAction: PropTypes.func.isRequired,
        checkBusinessCodeAction: PropTypes.func.isRequired,
        checkPhoneNumberAction: PropTypes.func.isRequired,
        checkContractNoAction: PropTypes.func.isRequired,
        getDoctorsByHospitalIdAction: PropTypes.func.isRequired,
        addCustomer: PropTypes.shape({
            checkIdCardNoResult: PropTypes.asyncResult(PropTypes.any),
            checkMemberCardNoResult: PropTypes.asyncResult(PropTypes.any),
            checkBusinessCodeResult: PropTypes.asyncResult(PropTypes.any),
            checkPhoneNoResult: PropTypes.asyncResult(PropTypes.any),
            checkContractNoResult: PropTypes.asyncResult(PropTypes.any),
            getHospitalResult: PropTypes.asyncResult(PropTypes.any),
            getPotentialPatientResult: PropTypes.asyncResult(PropTypes.any),
            postForm: PropTypes.shape().isRequired,
        }).isRequired,
        form: PropTypes.shape().isRequired,
        auth: PropTypes.shape({
            user: PropTypes.string,
        }).isRequired,
        getDrugRequirementsAction: PropTypes.func.isRequired,
        getPatientContactsAction: PropTypes.func.isRequired,
    };

    static defaultProps ={
        currentModalParam: '',
        closeModal: undefined,
    };

    constructor(props) {
        super(props);
        this.state = {
            hospitalId: '',
            showCount: false,
            hasServicePackage: '0',
            hasServicePackageData: null,
            memberType: null,
        };
        const { currentModalParam } = this.props;
        this.potentialId = currentModalParam || '';
        this.isEstimatedPickup = undefined;
        this.homeDelivery = undefined;
    }

    componentDidMount() {
        const { getHospitalAction, getPotentialPatientAction, getDrugRequirementsAction, getPatientContactsAction } = this.props;
        getHospitalAction('patient.edit,patient.admin', 'or', { status: 0, hospitalSignage: 1});
        this.setValuesByLocalStorage();
        if (this.potentialId) {
            getPotentialPatientAction(this.potentialId);
            getDrugRequirementsAction(this.potentialId, 0, 0);
            getPatientContactsAction(this.potentialId);
        }
    }

    componentWillReceiveProps(nextProps) {
        const {
            addCustomer,
            form,
            auth,
            closeModal,
            getDoctorsByHospitalIdAction,
        } = this.props;
        const thisDrugListNoResult = addCustomer.getDrugRequirements.status;
        const nextDrugListNoResult = nextProps.addCustomer.getDrugRequirements.status;
        if (thisDrugListNoResult !== nextDrugListNoResult) {
            if (nextDrugListNoResult === 'fulfilled') {
                const druglist = nextProps.addCustomer.getDrugRequirements.payload
                const { setFieldsValue, getFieldDecorator, getFieldValue } = form;
                let medicineKeys = getFieldValue('medicineKeys')
                const drugRequirementList = druglist.list;
                if (drugRequirementList && drugRequirementList.length > 0) {
                    drugRequirementList.forEach((i) => {
                        let uuid = i.baseDrugId;
                        setFieldsValue({medicineKeys: [...medicineKeys, uuid]})
                        getFieldDecorator(`medicine_${uuid}_data`, {initialValue: i})
                    })
                }
            }
        }

        const thisPatientContacts = addCustomer.getPatientContact.status;
        const nextPatientContacts = nextProps.addCustomer.getPatientContact.status;
        if (thisPatientContacts !== nextPatientContacts) {
            if (nextPatientContacts === 'fulfilled') {
                const contactList = nextProps.addCustomer.getPatientContact.payload;
                const { setFieldsValue, getFieldDecorator, getFieldValue } = form;
                let contactKeys = getFieldValue('contactKeys');
                const contacts = contactList.list;
                if (contacts && contacts.length > 0) {
                    contacts.forEach((row, index) => {
                        setFieldsValue({contactKeys: [...contactKeys, index, '']})
                        getFieldDecorator(`contact_${index}_name`, { initialValue: row.name })
                        getFieldDecorator(`contact_${index}_relation`, { initialValue: String(row.relation) })
                        getFieldDecorator(`contact_${index}_phone`, { initialValue: row.machineNumber })
                        let isDefault = row.isDefault != '0' ? ['1'] : undefined
                        getFieldDecorator(`contact_${index}_isGuardian`, { initialValue: isDefault})
                        getFieldDecorator(`contact_${index}_id`, { initialValue: row.id })
                    })
                }
            }
        }

        const thisCheckIdCardNoResult = addCustomer.checkIdCardNoResult.status;
        const nextCheckIdCardNoResult = nextProps.addCustomer.checkIdCardNoResult.status;
        if (thisCheckIdCardNoResult !== nextCheckIdCardNoResult) {
            const idCard = form.getFieldValue('idCard');
            const { status } = nextProps.addCustomer.checkIdCardNoResult;
            if (status === 'rejected') {
                const { message } = nextProps.addCustomer.checkIdCardNoResult.payload;
                form.setFields({ idCard: { value: idCard, errors: [message] } });
            }
        }

        const thisCheckMemberCardNoResult = addCustomer.checkMemberCardNoResult.status;
        const nextCheckMemberCardNoResult = nextProps.addCustomer.checkMemberCardNoResult.status;
        if (thisCheckMemberCardNoResult !== nextCheckMemberCardNoResult) {
            const accountNo = form.getFieldValue('accountNo');
            const { status } = nextProps.addCustomer.checkMemberCardNoResult;
            if (status === 'rejected') {
                const { message } = nextProps.addCustomer.checkMemberCardNoResult.payload;
                form.setFields({ accountNo: { value: accountNo, errors: [message] } });
            }
        }

        const thisCheckBusinessCodeResult = addCustomer.checkBusinessCodeResult.status;
        const nextCheckBusinessCodeResult = nextProps.addCustomer.checkBusinessCodeResult.status;
        if (thisCheckBusinessCodeResult !== nextCheckBusinessCodeResult) {
            const recommendBusinessCode = form.getFieldValue('recommendBusinessCode');
            const { status } = nextProps.addCustomer.checkBusinessCodeResult;
            if (status === 'rejected') {
                form.setFields({ recommendBusinessCode: { value: recommendBusinessCode, errors: ['推广码有误，请重新输入'] } });
            }
        }

        const thisCheckPhoneNoResult = addCustomer.checkPhoneNoResult.status;
        const nextCheckPhoneNoResult = nextProps.addCustomer.checkPhoneNoResult.status;
        if (thisCheckPhoneNoResult !== nextCheckPhoneNoResult) {
            const phoneNo = form.getFieldValue('phone');
            const { status } = nextProps.addCustomer.checkPhoneNoResult;
            if (status === 'rejected') {
                const { message } = nextProps.addCustomer.checkPhoneNoResult.payload;
                form.setFields({ phone: { value: phoneNo, errors: [message] } });
            }
        }

        const thisHospitalResultStatus = addCustomer.getHospitalResult.status;
        const nextHospitalResultStatus = nextProps.addCustomer.getHospitalResult.status;
        if (thisHospitalResultStatus !== nextHospitalResultStatus) {
            if (nextHospitalResultStatus === 'fulfilled') {
                const hospitalIdField = store.get(`${auth.user}_addCustomer_hospitalId`);
                if (hospitalIdField) {
                    const hospitalData = nextProps.addCustomer.getHospitalResult.payload;
                    hospitalData.forEach((row) => {
                        if (row.id === hospitalIdField) {
                            if (row.hasServicePackage !== 2) {
                                this.setState({ hasServicePackageData: false });
                            } else {
                                this.setState({ hasServicePackageData: true });
                            }
                        }
                    });
                    const isExist = hospitalData.find(item => item.id === hospitalIdField);
                    if (isExist) {
                        if (!this.potentialId) {
                            form.setFieldsValue({ hospitalId: hospitalIdField });
                            this.setState({
                                hospitalId: hospitalIdField,
                            });
                            getDoctorsByHospitalIdAction(hospitalIdField);
                        }
                    }
                }
            }
        }

        const thisPostFormResultStatus = addCustomer.postForm.status;
        const nextPostFormResultStatus = nextProps.addCustomer.postForm.status;
        if (thisPostFormResultStatus !== nextPostFormResultStatus) {
            if (nextPostFormResultStatus === 'fulfilled') {
                store.set(`${auth.user}_addCustomer_area`, form.getFieldValue('area'));
                if (!this.potentialId) {
                    store.set(`${auth.user}_addCustomer_hospitalId`, form.getFieldValue('hospitalId'));
                }
                const ms = nextProps.addCustomer.postForm.payload.potentialCustomersId ? '转化签约成功' : '新建会员成功';
                message.success(ms, 2);
                form.resetFields();
                form.setFieldsValue({
                    medicineKeys: [],
                    contactKeys: [0],
                });
                this.setValuesByLocalStorage();
                if (nextProps.addCustomer.postForm.params.actionType !== 'postThenAdd') {
                    closeModal();
                }
            } else if (nextPostFormResultStatus === 'rejected') {
                Modal.error({
                    title: '错误提示',
                    content: nextProps.addCustomer.postForm.payload.message,
                });
            }
        }

        const thisPotentialPatientResultStatus = addCustomer.getPotentialPatientResult.status;
        /* eslint-disable-next-line max-len */
        const nextPotentialPatientResultStatus = nextProps.addCustomer.getPotentialPatientResult.status;
        if (thisPotentialPatientResultStatus !== nextPotentialPatientResultStatus) {
            if (nextPotentialPatientResultStatus === 'fulfilled') {
                const patientInfo = nextProps.addCustomer.getPotentialPatientResult.payload;
                //获取医生列表
                getDoctorsByHospitalIdAction(patientInfo.hospital.id);
                const { setFieldsValue } = form;
                const liveArea = [];
                if (patientInfo.address.liveProvinces) {
                    liveArea[0] = patientInfo.address.liveProvinces;
                    if (patientInfo.address.liveCity) {
                        liveArea[1] = patientInfo.address.liveCity;
                        if (patientInfo.address.liveArea) {
                            liveArea[2] = patientInfo.address.liveArea;
                        }
                    }
                }
                let info = {};
                let sexStr = '';

                setFieldsValue({
                    idCard: patientInfo.idCard ? patientInfo.idCard : '',
                    name: patientInfo.name ? patientInfo.name : '',
                    phone: patientInfo.phone ? patientInfo.phone : '',
                    machineNumber: patientInfo.machineNumber ? patientInfo.machineNumber : '',
                    address: patientInfo.address.liveStreet ? patientInfo.address.liveStreet : '',
                    area: liveArea,
                    diseases: patientInfo.diseases ? patientInfo.diseases : '',
                    chronicDiseases: patientInfo.chronicDiseases ? patientInfo.chronicDiseases : '',
                    insurance: patientInfo.insurance.id ? [patientInfo.insurance.id] : [],
                    tags: patientInfo.tags,
                    hospitalId: patientInfo.hospital.id,
                    testBlood: patientInfo.testBlood ? [`${patientInfo.testBlood}`] : undefined,
                });
            } else if (nextPotentialPatientResultStatus === 'rejected') {
                message.error('获取话务资料详情失败', 3);
            }
        }
    }

    onTakeTimeChange = (e) => {
        const { form } = this.props;
        this.period = form.getFieldValue('period');
        if (this.period && this.period.label && e.label) {
            this.setState({ showCount: true });
            this.getPatientCount();
        }
    }

    onPeriodChange = (e) => {
        const { form } = this.props;
        this.taketime = form.getFieldValue('taketime');
        if (e.label && this.taketime && this.taketime.label) {
            this.setState({ showCount: true });
            this.getPatientCount();
        }
    }

    onChangeDate = (date, dateString) => {
        this.setState({ bookOrderDate: dateString });
    }

    setValuesByLocalStorage() {
        const { auth, form } = this.props;
        const area = store.get(`${auth.user}_addCustomer_area`);
        form.setFieldsValue({
            area: area || undefined,
        });
    }


    getPatientCount() {
        const { form, getPatientCountAction } = this.props;
        const params = {
            where: {
                warehouseId: this.warehouseId,
                estimatedPickupDay: form.getFieldValue('taketime').key,
                estimatedPickupPeriod: form.getFieldValue('period').key,
            },
            skip: 0,
            limit: 1,
            count: 1,
        };
        getPatientCountAction(params);
    }

    handleCancel = () => {
        const { closeModal, resetAction, form } = this.props;
        resetAction();
        form.resetFields();
        form.setFieldsValue({ medicineKeys: [], contactKeys: [0] });
        closeModal();
    }

    handleSubmit = (actionType) => {
        const { form, postCustomerInfoAction } = this.props;
        form.validateFieldsAndScroll((err, values) => {
            if (err) {
                return;
            }
            const { getFieldValue } = form;
            let dataForPost = {};
            let address = {};
            if(values.area && values.area.length>0){
                address.provinceId  = values.area[0] ? values.area[0] : '';
            }
            if(values.area && values.area.length>1){
                address.cityId  = values.area[1] ? values.area[1] : '';
            }
            if(values.area && values.area.length>2){
                address.areaId  = values.area[2] ? values.area[2] : '';
            }
            if(values.address){
                address.street  = values.address;
            }
            if(address){
                dataForPost.address = JSON.stringify(address);
            }
            if (values.accountNo) {
                dataForPost.accountNo = values.accountNo;
            }
            let hasServicePackage = null;
            if (values.hasServicePackage) {
                hasServicePackage = values.hasServicePackage[0] === '1' ? '2' : '1';
            }

            const { bookOrderDate } = this.state;
            const diseases = values.diseases && values.diseases.length > 0
                ? JSON.stringify(values.diseases.map(row => row.id))
                : undefined;
            let tags = '';
            if (values.tags) {
                for(let tag of values.tags){
                    tags += tag.id + ',';
                }
            }
            dataForPost = {
                ...dataForPost,
                contractNo: values.contractNo,
                diseases ,
                doctorId: values.doctorId,
                hospitalId: values.hospitalId,
                insurance: values.insurance && values.insurance.length > 0 ? values.insurance[0] : undefined,
                machineNumber: values.machineNumber ? values.machineNumber : '',
                drugPurchase: values.drugPurchase && values.drugPurchase.length >0 ? values.drugPurchase[0] : undefined,
                testBlood: values.testBlood && values.testBlood.length >0 ? values.testBlood[0] : undefined,
                tags: tags,
                chronicDiseases: values.chronicDiseases
                    ? values.chronicDiseases.map(row => row.id) : undefined,
                bookOrderDate: bookOrderDate || undefined,
                registerSource: values.registerSource ? values.registerSource.key : '',
                idCard: values.idCard,
                name: values.name,
                phone: values.phone,
                hasServicePackage,
                servicePackageDeadline: (values.servicePackageDeadline && values.servicePackageDeadline.format('YYYY-MM-DD')) || undefined,
                potentialCustomersId: this.potentialId || undefined,
                memberType: this.memberType,
            };
            const medicineKeys = form.getFieldValue('medicineKeys');
            let drugRequirements = [];
            if (medicineKeys.length) {
                drugRequirements = medicineKeys.map((v) => {
                    const sourceData = getFieldValue(`medicine_${v}_data`);
                    const data = {};
                    if (sourceData) {
                        data.baseDrugId = sourceData.baseDrugId;
                        data.drugName = sourceData.commonName;
                        data.standard = sourceData.packageSize;
                        data.producerName = sourceData.producerName;
                        data.monthlyUsage = getFieldValue(`medicine_${v}_dosage`);
                    }
                    return data;
                });
                dataForPost.drugRequirements = JSON.stringify(drugRequirements);
            }
            if (this.isEstimatedPickup) {
                const regularMedication = {};
                if (getFieldValue('taketime') && getFieldValue('period') && getFieldValue('taketime').key && getFieldValue('period').key) {
                    regularMedication.timing = {};
                    regularMedication.timing.estimatedPickupDay = Number(getFieldValue('taketime').key);
                    regularMedication.timing.estimatedPickupPeriod = Number(getFieldValue('period').key);
                }
                if (medicineKeys.length) {
                    const drugs = [];
                    medicineKeys.forEach((v) => {
                        const sourceData = getFieldValue(`medicine_${v}_data`);
                        const data = {};
                        const isRegularMedication = getFieldValue(`medicine_${v}_isRegularMedication`) && getFieldValue(`medicine_${v}_isRegularMedication`)[0] === '1';
                        if (sourceData && isRegularMedication) {
                            data.baseDrugId = sourceData.baseDrugId;
                            data.amount = getFieldValue(`medicine_${v}_dosage`);
                            drugs.push(data);
                        }
                    });
                    // regularMedication.drugs = drugs;
                }
                dataForPost.regularMedication = regularMedication;
            }
            const contactKeys = [...getFieldValue('contactKeys')];
            contactKeys.pop();
            let contacts = [];
            if (contactKeys.length) {
                contacts = contactKeys.map((v) => {
                    const data = {};
                    data.name = getFieldValue(`contact_${v}_name`);
                    data.relation = getFieldValue(`contact_${v}_relation`);
                    data.machineNumber = getFieldValue(`contact_${v}_phone`);
                    data.isDefault = getFieldValue(`contact_${v}_isGuardian`) ? '1' : '0';
                    return data;
                });
                dataForPost.contacts = JSON.stringify(contacts);
            }
            postCustomerInfoAction(dataForPost, actionType);
        });
    }

    checkTakeTime = (rule, value, callback) => {
        const { form } = this.props;
        this.period = form.getFieldValue('period');
        if (this.period && this.period.label) {
            if (value && value.label) {
                callback();
            } else {
                callback('不能为空');
            }
        } else {
            callback();
        }
    }

    checkPeriod = (rule, value, callback) => {
        const { form } = this.props;
        this.taketime = form.getFieldValue('taketime');
        if (this.taketime && this.taketime.label) {
            if (value && value.label) {
                callback();
            } else {
                callback('不能为空');
            }
        } else {
            callback();
        }
    }

    checkIdCard = (rule, value, callback) => {
        if (!value) {
            callback('请输入正确的身份证号');
            return;
        }
        const { form, checkIdCardAction } = this.props;
        const validator = IDValidator;
        const valueStr = String(value);
        if (validator.isValid(valueStr)) {
            checkIdCardAction(valueStr);
            callback();
        } else {
            callback('请输入正确的身份证号');
        }
    }

    checkAccountNo = (rule, value, callback) => {
        const { checkMemberCardNoAction } = this.props;
        if (value) {
            checkMemberCardNoAction(value);
        }
        callback();
    }

    checkRecommendBusinessCode = (rule, value, callback) => {
        const { checkBusinessCodeAction } = this.props;
        if (value) {
            checkBusinessCodeAction(value);
        }
        callback();
    }

    checkContractNo = async (rule, value, callback) => {
        if (value) {
            try {
                await api.checkContractNo(value);
                callback();
            } catch (e) {
                callback(e.message);
            }
        }
    }

    handleHospitalSelect = (value) => {
        const { form, getDoctorsByHospitalIdAction, addCustomer } = this.props;
        const hospitalResult = addCustomer.getHospitalResult;
        if (hospitalResult.payload && Array.isArray(hospitalResult.payload.list)) {
            hospitalResult.payload.list.forEach((row) => {
                if (row.id === value) {
                    if (row.hasServicePackage !== 2) {
                        this.setState({ hasServicePackageData: false });
                        form.setFieldsValue({
                            servicePackageDeadline: undefined,
                        });
                    } else {
                        this.setState({ hasServicePackageData: true });
                        form.setFieldsValue({
                            servicePackageDeadline: moment(Date.now()),
                        });
                    }
                }
            });
        }
        form.resetFields(['doctorId', 'medicineKeys']);
        this.setState({ hospitalId: value });
        getDoctorsByHospitalIdAction(value);
    }

    checkPhoneNumber = (rule, value, callback) => {
        const { form, checkPhoneNumberAction } = this.props;
        const machineNumber = form.getFieldValue('machineNumber');
        if (!value) {
            const error = '手机号不能为空';
            callback(error);
            form.setFields({ machineNumber: { value: machineNumber, errors: [error] } });
        } else {
            if (value && !phoneRegExp.test(value)) {
                callback('请输入正确的手机号码');
            } else {
                callback();
                if (value) {
                    checkPhoneNumberAction(value);
                }
            }
        }
    }

    checkContact = async (rule, value, callback) => {
        const { form, checkPhoneNumberAction } = this.props;
        const phone = form.getFieldValue('phone');
        if(value && phoneRegExp.test(value)){
            const result = await api.checkPhoneNumber(value);
            if (!result.list.length) {
                const error = new Error('未被占用的手机号请填写至手机号信息中');
                callback(error);
            }
        }
        if (!phone) {
            /* const error = '手机号不能为空';
            callback(error);
            form.setFields({ phone: { value: phone, errors: [error] } }); */
        } else {
            if (phone && !phoneRegExp.test(phone)) {
                form.setFields({ phone: { value: phone, errors: ['手机号格式错误'] } });
            } else if (phone) {
                checkPhoneNumberAction(phone);
                form.setFields({ phone: { value: phone } });
            } else {
                form.setFields({ phone: { value: phone } });
            }
            callback();
        }
    }

    dataSource() {
        const { addCustomer } = this.props;
        const { hospitalId } = this.state;
        const hospitalResult = addCustomer.getHospitalResult;
        if (hospitalResult.payload && Array.isArray(hospitalResult.payload)) {
            this.hospitalOptions = hospitalResult.payload.map((row) => {
                if (hospitalId === row.id) {
                    this.warehouseId = row.warehouseId;
                    this.isEstimatedPickup = row.isEstimatedPickup !== 0;
                    this.homeDelivery = row.homeDelivery !== 0;
                    this.shippingAddressHospital = {
                        provincesId: row.provincesId,
                        cityId: row.cityId,
                        areaId: row.areaId,
                        street: row.street,
                    };
                }
                return (
                    <Option key={row.id}>
                        {row.name}
                    </Option>
                );
            });
        }
    }

    OnServicePack(target) {
        const { form } = this.props;
        if (target && target[0] === '1') {
            this.setState({
                hasServicePackage: '1',
            });
            form.setFieldsValue({
                servicePackageDeadline: moment(Date.now()),
            });
        } else {
            this.setState({
                hasServicePackage: '0',
            });
            form.setFieldsValue({
                servicePackageDeadline: undefined,
            });
        }
    }

    memberTypeChange(value){
        const memberType = value[0];
        this.setState({memberType});
        this.props.form.resetFields(['doctorId', 'hospitalId', 'medicineKeys', 'insurance']);
        this.props.getHospitalAction('patient.edit,patient.admin', 'or', { status: 0 , hospitalSignage: memberType == 1 ? 1: 3});
    }

    render() {
        const { hasServicePackage, hasServicePackageData } = this.state;
        this.dataSource();
        const SelectMultipleTagsForEdit = SelectMultipleTags.forDataRange(2);
        const formItemLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 16 },
        };
        const { form, addCustomer } = this.props;
        const { getFieldDecorator } = form;
        const { hospitalId, showCount } = this.state;
        const mapPropsToFormItems = {
            editStatus: true,
            notEditableOnly: false,
        };
        const modalFooter = (
            <Row>
                <Button loading={addCustomer.postForm.status === 'pending' && addCustomer.postForm.params.actionType === 'postThenClose'} onClick={() => this.handleSubmit('postThenClose')} type="primary">
                    保存
                </Button>
                <Button loading={addCustomer.postForm.status === 'pending' && addCustomer.postForm.params.actionType === 'postThenAdd'} onClick={() => this.handleSubmit('postThenAdd')} type="primary">
                    保存并新建
                </Button>
                <Button onClick={this.handleCancel} className="cancelButton">
                    取消
                </Button>
            </Row>
        );
        const doctorsResult = addCustomer.doctors;
        let doctorOptions;
        if (doctorsResult.payload && Array.isArray(doctorsResult.payload.list)) {
            doctorOptions = doctorsResult.payload.list.map(row => (
                <Option key={row.id}>
                    {row.name}
                </Option>
            ));
        }
        const formElementId = 'addCustomerForm';
        const period = [
            { label: '每一月周期', key: '1' },
            { label: '每两月周期', key: '2' },
            { label: '每三月周期', key: '3' },
        ];
        const dateRange = [];
        for (let i = 1; i < 29; i += 1) {
            dateRange.push(i);
        }
        const periodOptions = period.map(row => (
            <Option key={row.key}>
                {row.label}
            </Option>
        ));
        const dateOptions = dateRange.map((row, index) => (
            <Option key={row.id || index + 1}>
                {`${index + 1}号`}
            </Option>
        ));
        let counts;
        const patientCount = addCustomer.getPatientCount;
        if (patientCount && patientCount.status === 'fulfilled' && patientCount.payload) {
            counts = patientCount.payload.count;
        }
        let insuranceItem;
        if (this.state.memberType === '2') {
            insuranceItem = ['cc4f67f79047414c80127bfd1413bcce'];
        }
        return (
            <div>
                <Modal
                    title={this.potentialId ? '转化签约' : '新建会员'}
                    visible
                    width={900}
                    style={{ backgroundColor: '#f8f8f8' }}
                    onCancel={this.handleCancel}
                    maskClosable={false}
                    footer={modalFooter}
                >
                    <Form
                        id={formElementId}
                    >

                        <Row style={{ paddingBottom: 15 }}>
                            <CuttingLine text="基本信息" />
                        </Row>

                        <Row>
                            <Col span={12}>
                                <FormItem
                                    label="身份证号"
                                    required
                                    {...formItemLayout}
                                >
                                    {getFieldDecorator('idCard',
                                        {
                                            validateTrigger: 'onBlur',
                                            rules: [
                                                { validator: this.checkIdCard },
                                            ],
                                        })(<Input placeholder="" maxLength="18" />)}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    label="姓名"
                                    {...formItemLayout}
                                >
                                    {getFieldDecorator('name',
                                        {
                                            validateTrigger: 'onBlur',
                                            rules: [
                                                { required: true, message: '不能为空' },
                                                { max: 20, message: '最多20个字符' },
                                            ],
                                        })(<Input maxLength="20" />)}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <FormItem
                                    label="会员类型"
                                    {...formItemLayout}
                                >
                                    {getFieldDecorator(
                                        'memberType',
                                        {
                                            rules: [
                                                { required: true, message: '不能为空' },
                                            ],
                                        },
                                    )(
                                        <SmartSelectBox
                                            editStatus
                                            notEditableOnly={false}
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
                        </Row>

                        <Row>
                            <Col span={12}>
                                <FormItem
                                    label="手机号"
                                    {...formItemLayout}
                                    required
                                >
                                    {getFieldDecorator('phone',
                                        {
                                            validateTrigger: 'onBlur',
                                            rules: [
                                                { validator: this.checkPhoneNumber },
                                            ],
                                        })(<Input placeholder="" maxLength="11" />)}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    label="其他联系方式"
                                    {...formItemLayout}
                                >
                                    {getFieldDecorator('machineNumber',
                                        {
                                            validateTrigger: 'onBlur',
                                            rules: [
                                                { validator: this.checkContact },
                                            ],
                                        })(<Input placeholder="" maxLength="50" />)}
                                </FormItem>
                            </Col>
                        </Row>

                        <Row>
                            <Col span={12}>
                                <FormItem
                                    label="签约机构"
                                    {...formItemLayout}
                                >
                                    {getFieldDecorator(
                                        'hospitalId',
                                        {
                                            rules: [
                                                { required: true, message: '不能为空' },
                                            ],
                                        },
                                    )(
                                        <Select
                                            placeholder="请选择"
                                            onSelect={this.handleHospitalSelect}
                                            getPopupContainer={() => document.getElementById('addCustomerForm')}
                                            showSearch
                                            defaultActiveFirstOption={false}
                                            optionFilterProp="children"
                                        >
                                            {this.hospitalOptions}
                                        </Select>,
                                    )}
                                </FormItem>
                            </Col>

                            <Col span={12}>
                                <FormItem
                                    label="签约医生"
                                    {...formItemLayout}
                                >
                                    {getFieldDecorator(
                                        'doctorId',
                                        {
                                            rules: [
                                                { required: true, message: '不能为空' },
                                            ],
                                        },
                                    )(
                                        <Select
                                            placeholder="请选择"
                                            showSearch
                                            defaultActiveFirstOption={false}
                                            optionFilterProp="children"
                                            getPopupContainer={() => document.getElementById('addCustomerForm')}
                                        >
                                            {doctorOptions}
                                        </Select>,
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <FormItem
                                    label="保险类型"
                                    required
                                    labelCol={{ span: 4 }}
                                    wrapperCol={{ span: 20 }}
                                >
                                    {getFieldDecorator(
                                        'insurance',
                                        {
                                            initialValue: insuranceItem,
                                            rules: [{ required: true, message: '不能为空' }],
                                        },
                                    )(
                                        <SmartSelectBoxForInsurance
                                            {...mapPropsToFormItems}
                                            editStatus={!this.state.memberType || this.state.memberType !== '2'}
                                        />,
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <FormItem
                                    label="居住地址"
                                    {...formItemLayout}
                                    required
                                >
                                    {getFieldDecorator(
                                        'area',
                                        {
                                            rules: [
                                                {
                                                    validator: (rules, value, callback) => {
                                                        console.log('rules', value);
                                                        if (!value || !Array.isArray(value)) {
                                                            callback('不能为空');
                                                            return;
                                                        }
                                                        if (value.length !== 3) {
                                                            callback('不能为空');
                                                        } else {
                                                            callback();
                                                        }
                                                    },
                                                },
                                            ],
                                        },
                                    )(
                                        <SmartCascaderTerritory
                                            getPopupContainer={() => document.getElementById('addCustomerForm')}
                                            placeholder="请选择省/市/区"
                                            {...mapPropsToFormItems}
                                            allowClear
                                        />,
                                    )}
                                </FormItem>
                            </Col>

                            <Col span={12}>
                                <FormItem
                                    labelCol={{ span: 0 }}
                                >
                                    {getFieldDecorator('address',
                                        {
                                            rules: [
                                                { max: 50, message: '不能超过50个字符' },
                                                { required: true, message: '不能为空' }
                                            ],
                                        })(<Input style={{ marginLeft: 5 }} placeholder="请输入详细地址" />)}
                                </FormItem>
                            </Col>
                        </Row>



                        <Row>
                            <FormItem
                                label="现有疾病"
                                labelCol={{ span: 4 }}
                                wrapperCol={{ span: 20 }}
                            >
                                {getFieldDecorator(
                                    'diseases',
                                    {
                                        rules: [],
                                    },
                                )(
                                    <SmartSelectMultipleAsyncForDiseases
                                        {...mapPropsToFormItems}
                                        selectStyle={{ width: '50%' }}
                                        getPopupContainer={() => document.getElementById('addCustomerForm')}
                                        placeholder="选择其他疾病"
                                        defaultButtonCount={6}
                                    />,
                                )}
                            </FormItem>
                        </Row>
                        <Row>
                            <Col>
                                <FormItem
                                    label="门慢疾病"
                                    labelCol={{ span: 4 }}
                                    wrapperCol={{ span: 20 }}
                                >
                                    {getFieldDecorator(
                                        'chronicDiseases',
                                    )(
                                        <SmartSelectMultipleAsyncForDiseases
                                            {...mapPropsToFormItems}
                                            selectStyle={{ width: '50%' }}
                                            getPopupContainer={() => document.getElementById('addCustomerForm')}
                                            placeholder="选择其他疾病"
                                            defaultButtonCount={6}
                                        />,
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <FormItem
                                    label="合同编号"
                                    {...formItemLayout}
                                >
                                    {getFieldDecorator('contractNo',
                                        {
                                            rules: [
                                                {
                                                    validator: this.checkContractNo,
                                                },
                                            ],
                                            validateTrigger: 'onBlur',
                                        })(<Input placeholder="请输入合同编号" maxLength="20" />)}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    label="绑定会员卡号"
                                    {...formItemLayout}
                                >
                                    {getFieldDecorator('accountNo',
                                        {
                                            validateTrigger: 'onBlur',
                                            rules: [
                                                { max: 13, message: '请输入正确的会员卡号' },
                                                { pattern: /^\d*$/, message: '只能输入数字' },
                                                { validator: this.checkAccountNo },
                                            ],

                                        })(<Input placeholder="请输入会员卡号" maxLength="13" />)}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <FormItem
                                    label="推荐人"
                                    {...formItemLayout}
                                >
                                    {getFieldDecorator('recommendBusinessCode',
                                        {
                                            rules: [{validator: this.checkRecommendBusinessCode}],
                                            validateTrigger: 'onBlur',
                                        })(<Input placeholder="请输入数字推广码" maxLength="20" />)}
                                </FormItem>
                            </Col>
                        </Row>

                        <Row style={{ marginTop: 15 }}>
                            <Row>
                                <CuttingLine text="用药需求" />
                            </Row>
                            <Row>
                                <AddMedicineRequirement
                                    isEstimatedPickup={this.isEstimatedPickup}
                                    form={form}
                                    hospitalId={hospitalId}
                                />
                            </Row>
                            {
                                this.isEstimatedPickup === true
                    && (
                        <Row>
                            <CuttingLine text="规律取药时间" />
                            <Row gutter={20} style={{ padding: '12px 0 0 10px' }}>
                                <Col span={6}>
                                    <FormItem
                                        className="taketime"
                                        wrapperCol={{ span: 24 }}
                                        style={{ marginBottom: '12px' }}
                                    >
                                        {getFieldDecorator(
                                            'taketime',
                                            {
                                                rules: [{ validator: this.checkTakeTime }],
                                            },
                                        )(
                                            <SmartSelectSingle
                                                {...mapPropsToFormItems}
                                                placeholder="请选择规律时间"
                                                showSearch
                                                onSelect={this.onTakeTimeChange}
                                                getPopupContainer={() => document.getElementById('addCustomerForm')}
                                            >
                                                {dateOptions}
                                            </SmartSelectSingle>,
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={6} style={{ marginLeft: '-1.2%' }}>
                                    <FormItem
                                        label=""
                                        wrapperCol={{ span: 24 }}
                                        style={{ marginBottom: '12px' }}
                                    >
                                        {getFieldDecorator(
                                            'period',
                                            {
                                                rules: [{ validator: this.checkPeriod }],
                                            },
                                        )(
                                            <SmartSelectSingle
                                                {...mapPropsToFormItems}
                                                placeholder="请选择规律周期"
                                                showSearch
                                                onSelect={this.onPeriodChange}
                                                getPopupContainer={() => document.getElementById('addCustomerForm')}
                                            >
                                                {periodOptions}
                                            </SmartSelectSingle>,
                                        )}
                                    </FormItem>
                                </Col>
                                {showCount && hospitalId ? (
                                    <span className="show-count">
                                        已预约客户数量：
                                        {counts}
                                    </span>
                                ) : null}
                            </Row>
                        </Row>
                    )
                            }
                            <CuttingLine text="" />
                        <Row style={{paddingTop: '10px'}}>
                            <FormItem
                                label="加入PBM前购药渠道"
                                labelCol={{ span: 5 }}
                                wrapperCol={{ span: 19 }}
                            >
                                {getFieldDecorator(
                                    'drugPurchase',
                                    {
                                        rules: [],
                                    },
                                )(
                                    <SmartSelectBox
                                        editStatus
                                        notEditableOnly={false}
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
                        </Row>
                        <Row>
                            <FormItem
                                label="日常检测血糖血压"
                                labelCol={{ span: 5 }}
                                wrapperCol={{ span: 19 }}
                            >
                                {getFieldDecorator(
                                    'testBlood',
                                    {
                                        rules: [],
                                    },
                                )(
                                    <SmartSelectBox
                                        editStatus
                                        notEditableOnly={false}
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
                        </Row>
                        <Row>
                            <Col span={12}>
                                <FormItem
                                    label="来源渠道"
                                    {...formItemLayout}
                                >
                                    {getFieldDecorator(
                                        'registerSource',
                                        {
                                            rules: [],
                                        },
                                    )(
                                        <SmartSelectSingleForSource
                                            {...mapPropsToFormItems}
                                            placeholder="请选择来源渠道"
                                            allowClear
                                            asyncResultId="addCustomer.registerSource"
                                            asyncRequestFuncName="getRegisterSource"
                                            asyncRequestTrigger="componentDidMount"
                                            getPopupContainer={() => document.getElementById('addCustomerForm')}
                                            asyncMapResultToState={
                                                data => data.map(row => ({
                                                    value: row.id, text: row.name,
                                                }))
                                            }
                                        />,
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        {hasServicePackageData
                            ? (
                                <Row>
                                    <FormItem
                                        label="有偿服务包"
                                        labelCol={{ span: 4 }}
                                        wrapperCol={{ span: 13 }}
                                    >
                                        {getFieldDecorator(
                                            'hasServicePackage',
                                            {
                                                rules: [],
                                            },
                                        )(
                                            <SmartSelectBox
                                                editStatus
                                                onChange={e => this.OnServicePack(e)}
                                                notEditableOnly={false}
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
                                </Row>

                            )
                            : null}

                        <Row>
                            <Col span={12} style={{ display: hasServicePackage === '1' && hasServicePackageData ? 'block' : 'none' }}>
                                <FormItem
                                    label="服务包签订日期"
                                    {...formItemLayout}
                                    required
                                >
                                    {getFieldDecorator('servicePackageDeadline', {
                                        rules: hasServicePackage === '1' && hasServicePackageData ? [{ required: true, message: '不能为空' }] : null,
                                    })(
                                        <DatePicker style={{ width: '100%' }} />,
                                    )}

                                </FormItem>

                            </Col>
                            {hasServicePackage === '1' && hasServicePackageData
                                ? (
                                    <div
                                        style={{ lineHeight: '35px', textIndent: '9px' }}
                                    >
                                    有效期一年
                                    </div>
                                )
                                : null}
                        </Row>
                        <Row>
                            <Col span={12}>
                                <FormItem
                                    label="预约首次用药登记"
                                    {...formItemLayout}
                                >
                                    {getFieldDecorator('bookOrderDate')(
                                        <DatePicker
                                            placeholder="请选择"
                                            getCalendarContainer={() => document.getElementById('addCustomerForm')}
                                            disabledDate={
                                                current => current
                                                    && current.valueOf() < Date.now() - 3600000 * 24
                                            }
                                            style={{ width: '100%' }}
                                            onChange={this.onChangeDate}
                                        />,
                                    )}
                                </FormItem>
                            </Col>
                        </Row>

                        <Row>
                            <FormItem
                                label="标记"
                                labelCol={{ span: 4 }}
                                wrapperCol={{ span: 20 }}
                            >
                                {getFieldDecorator('tags')(
                                    <SelectMultipleTagsForEdit placeholder="请选择标记" />,
                                )}
                            </FormItem>
                        </Row>


                            <CuttingLine text="联系人" noteText="（建议添加，方便随时与患者家属取得联系）" />
                            <Row>
                                <AddCustomerContact
                                    uuid={formElementId}
                                    form={form}
                                />
                            </Row>
                        </Row>


                    </Form>
                </Modal>
            </div>
        );
    }
}

const WrapperOfAddCustomer = Form.create({
    mapPropsToFields(props) {
        const { addCustomer } = props;
        return { ...addCustomer.formData };
    },
    onFieldsChange(props, fields) {
        const { renewFormDataAction } = props;
        renewFormDataAction(fields);
    },
})(AddCustomer);

function select(state) {
    return {
        auth: state.auth.payload,
        addCustomer: state.addCustomer,
    };
}

function mapDispachToProps(dispatch) {
    return bindActionCreators({
        resetAction,
        getHospitalAction,
        getPotentialPatientAction,
        checkContractNoAction,
        getDoctorsByHospitalIdAction,
        renewFormDataAction,
        checkPhoneNumberAction,
        checkIdCardAction,
        checkMemberCardNoAction,
        checkBusinessCodeAction,
        postCustomerInfoAction,
        getPatientCountAction,
        getDrugRequirementsAction,
        getPatientContactsAction,
    }, dispatch);
}

export default connectModalHelper(connect(select, mapDispachToProps)(WrapperOfAddCustomer));
