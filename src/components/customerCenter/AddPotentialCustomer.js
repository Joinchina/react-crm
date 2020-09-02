import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
    Button, InputNumber, Form, Input, Row, Col, Select, Modal,
} from 'antd';
import message from '@wanhu/antd-legacy/lib/message'
import store from 'store';
import PropTypes from '../../helpers/prop-types';
import SmartSelectMultipleAsyncForDiseases from '../common/SmartSelectMultipleAsyncForDiseases';
import SmartSelectBox from '../common/SmartSelectBox';
import SmartSelectBoxForInsurance from '../common/SmartSelectBoxForInsurance';
import SmartCascaderTerritory from '../common/SmartCascaderTerritory';
import AddCustomerContact from './AddCustomerContact';
import AddCustomerMedicine from './AddCustomerMedicine';
import CuttingLine from '../common/FormCuttingLine';
import { connectModalHelper } from '../../mixins/modal';
import { SelectMultipleTags } from '../common/SelectMultipleTags';
import IDValidator from '../../helpers/checkIdCard';
import { phone as phoneRegExp } from '../../helpers/common-regexp';
import {
    getHospitalAction,
    checkPotentialMatchingAction,
    renewFormDataAction,
    postPotentialCustomerInfoAction,
    checkPhoneNumberAction,
} from '../../states/customerCenter/addPotentialCustomer';

const { Option } = Select;
const FormItem = Form.Item;

class AddPotentialCustomer extends Component {
    static propTypes = {
        addPotentialCustomer: PropTypes.shape({
            checkPotentialMatchingResult: PropTypes.asyncResult(PropTypes.object),
            postForm: PropTypes.asyncResult(PropTypes.object),
        }).isRequired,
        auth: PropTypes.shape({
            user: PropTypes.string,
        }).isRequired,
        form: PropTypes.shape().isRequired,
        getHospitalAction: PropTypes.func.isRequired,
        postPotentialCustomerInfoAction: PropTypes.func.isRequired,
        checkPotentialMatchingAction: PropTypes.func.isRequired,
        checkPhoneNumberAction: PropTypes.func.isRequired,
        closeModal: PropTypes.func.isRequired,
        location: PropTypes.shape({
            pathname: PropTypes.string,
        }).isRequired,
        history: PropTypes.shape({
            replace: PropTypes.func,
        }).isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            hospitalId: '',
        };
    }

    componentDidMount() {
        const { getHospitalAction } = this.props;
        getHospitalAction('patient.edit,patient.admin', 'or', { status: 0 });
    }

    componentWillReceiveProps(nextProps) {
        const { addPotentialCustomer } = this.props;
        const thisCheckPotentialStatus = addPotentialCustomer.checkPotentialMatchingResult
            && addPotentialCustomer.checkPotentialMatchingResult.status;
        const nextPotentialStatus = nextProps.addPotentialCustomer.checkPotentialMatchingResult
            && nextProps.addPotentialCustomer.checkPotentialMatchingResult.status;
        if (thisCheckPotentialStatus !== nextPotentialStatus) {
            const { actionType } = this.state;
            if (nextPotentialStatus === 'fulfilled') {
                this.handleSubmit(actionType, false);
            } else if (nextPotentialStatus === 'rejected') {
                const { checkPotentialMatchingResult } = nextProps.addPotentialCustomer;
                const { payload } = checkPotentialMatchingResult;
                let ms = payload.message;
                ms = ms || '核对会员信息出错';
                if (payload.code === 305) {
                    this.exitPotentialId = payload.data.potentialId;
                    Modal.confirm({
                        title: '提示',
                        content: ms,
                        onOk: () => {
                            this.handleSubmit(actionType, true);
                        },
                    });
                } else {
                    message.error(ms, 5);
                }
            }
        }
        const thisPostFormResultStatus = addPotentialCustomer.postForm.status;
        const nextPostFormResultStatus = nextProps.addPotentialCustomer.postForm.status;
        if (thisPostFormResultStatus !== nextPostFormResultStatus) {
            const {
                closeModal,
                location,
                history,
                form,
            } = this.props;
            if (nextPostFormResultStatus === 'fulfilled') {
                this.exitPotentialId = null;
                let ms = nextProps.addPotentialCustomer.postForm.payload.message;
                ms = ms || (nextProps.addPotentialCustomer.postForm.params.isRenew ? '更新话务资料成功' : '新建话务资料成功');
                message.success(ms, 2, () => {
                    const { potentialId } = nextProps.addPotentialCustomer.postForm.payload;
                    if (location.pathname.includes('/newtask')) {
                        history.replace(`/newtask?potentialId=${potentialId}`);
                    }
                });
                form.resetFields();
                form.setFieldsValue({ medicineKeys: [], contactKeys: [0] });
                if (nextProps.addPotentialCustomer.postForm.params.actionType !== 'postThenAdd') {
                    closeModal();
                }
            } else if (nextPostFormResultStatus === 'rejected') {
                Modal.error({
                    title: '错误',
                    content: nextProps.addPotentialCustomer.postForm.payload.message,
                });
            }
        }
    }

    /* eslint-disable class-methods-use-this */
    getAgeByBirthday(dateString) {
        const today = new Date();
        const birthDate = new Date(dateString);
        const age = today.getFullYear() - birthDate.getFullYear();
        return age;
    }

    checkIdCard = (rule, value, callback) => {
        if (!value) {
            callback();
            return;
        }
        const { form } = this.props;
        const validator = IDValidator;
        const valueStr = String(value);
        if (validator.isValid(valueStr)) {
            const info = validator.getInfo(value);
            form.setFields({
                sex: { value: [String(info.sex)] },
                age: { value: this.getAgeByBirthday(info.birth) },
            });
            callback();
        } else {
            callback('请输入正确的身份证号');
        }
    }

    checkPhoneNumber = (rule, value, callback) => {
        const { checkPhoneNumberAction, form } = this.props;
        const machineNumber = form.getFieldValue('machineNumber');
        if (!value && !machineNumber) {
            const error = '手机号和其他联系方式不能全为空，至少填写一项';
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
            form.setFields({ machineNumber: { value: machineNumber } });
        }
    }

    checkContact = (rule, value, callback) => {
        const { checkPhoneNumberAction, form } = this.props;
        const phone = form.getFieldValue('phone');
        if (!phone && !value) {
            const error = '手机号和其他联系方式不能全为空，至少填写一项';
            callback(error);
            form.setFields({ phone: { value: phone, errors: [error] } });
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

    handleCancel = () => {
        const { closeModal, form } = this.props;
        form.resetFields();
        closeModal();
    }

    handleHospitalSelect = (value) => {
        const { form } = this.props;
        this.setState({ hospitalId: value });
        form.resetFields(['medicineKeys']);
    }

    handleSubmit(actionType, isRenew) {
        const { auth, form, postPotentialCustomerInfoAction } = this.props;
        form.validateFieldsAndScroll((err, values) => {
            if (err) {
                return;
            }
            store.set(`${auth.user}_addPotentialCustomer_area`, values.area);
            const dataForPost = {};
            if (this.exitPotentialId) {
                dataForPost.exitPotentialId = this.exitPotentialId;
            }
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
            dataForPost.diseases = values.diseases ? values.diseases.map(row => row.id) : undefined;
            dataForPost.hospitalId = values.hospitalId;
            dataForPost.insurance = values.insurance
                && values.insurance.length ? values.insurance[0] : undefined;
            dataForPost.sex = values.sex ? String(values.sex[0]) : undefined;
            dataForPost.drugPurchase = values.drugPurchase && values.drugPurchase.length > 0 ? values.drugPurchase[0] : undefined;
            dataForPost.testBlood = values.testBlood && values.testBlood.length > 0 ? values.testBlood[0] : undefined;
            dataForPost.tags = values.tags ? values.tags.map(row => row.id) : undefined;
            dataForPost.chronicDiseases = values.chronicDiseases
                ? values.chronicDiseases.map(row => row.id) : undefined;
            dataForPost.idCard = values.idCard;
            dataForPost.name = values.name.trim();
            const age = Number.isNaN(values.age) ? '' : values.age;
            dataForPost.age = age;
            if (values.phone) {
                dataForPost.phone = values.phone;
            }
            if (values.machineNumber) {
                dataForPost.machineNumber = values.machineNumber;
            }
            const { getFieldValue } = form;
            const medicineKeys = [...getFieldValue('medicineKeys')];
            // medicineKeys.pop();
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
                    } else {
                        data.baseDrugId = '';
                        data.monthlyUsage = getFieldValue(`medicine_${v}_dosage`);
                        data.drugName = getFieldValue(`medicine_${v}_name`);
                        data.standard = getFieldValue(`medicine_${v}_standard`);
                        data.producerName = getFieldValue(`medicine_${v}_company`);
                        data.monthlyUsage = getFieldValue(`medicine_${v}_dosage`);
                    }
                    return data;
                });
                dataForPost.drugRequirements = JSON.stringify(drugRequirements);
            }
            const contactKeys = [...getFieldValue('contactKeys')];
            contactKeys.pop();
            let contacts = [];
            if (contactKeys.length) {
                contacts = contactKeys.map((v) => {
                    const data = {};
                    data.name = getFieldValue(`contact_${v}_name`);
                    data.sex = getFieldValue(`contact_${v}_gender`);
                    data.relation = getFieldValue(`contact_${v}_relation`);
                    data.machineNumber = getFieldValue(`contact_${v}_phone`);
                    data.isDefault = getFieldValue(`contact_${v}_isGuardian`) ? '1' : '0';
                    return data;
                });
                dataForPost.contacts = JSON.stringify(contacts);
            }
            postPotentialCustomerInfoAction(dataForPost, actionType, isRenew);
        });
    }

    checkMatching(actionType) {
        const { auth, checkPotentialMatchingAction, form } = this.props;
        this.setState({ actionType });
        form.validateFieldsAndScroll((err, values) => {
            if (err) {
                return;
            }
            store.set(`${auth.user}_addPotentialCustomer_area`, values.area);
            const params = {
                idCard: values.idCard || '',
                name: values.name || '',
                phone: values.phone || '',
            };
            checkPotentialMatchingAction(params);
        });
    }

    dataSource() {
        const { addPotentialCustomer } = this.props;
        const hospitalResult = addPotentialCustomer.getHospitalResult;
        if (hospitalResult.payload && Array.isArray(hospitalResult.payload)) {
            this.hospitalOptions = hospitalResult.payload.map(row => (
                <Option key={row.id}>
                    {row.name}
                </Option>
            ));
        }
    }

    render() {
        this.dataSource();
        const SelectMultipleTagsForEdit = SelectMultipleTags.forDataRange(2);
        const formItemLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 16 },
        };
        const { hospitalId } = this.state;
        const { addPotentialCustomer, form } = this.props;
        const { getFieldDecorator } = form;
        const mapPropsToFormItems = {
            editStatus: true,
            notEditableOnly: false,
        };
        const modalFooter = (
            <Row>
                <Button loading={addPotentialCustomer.postForm.status === 'pending' && addPotentialCustomer.postForm.params.actionType === 'postThenClose'} onClick={() => this.checkMatching('postThenClose')} type="primary">
                    保存
                </Button>
                <Button loading={addPotentialCustomer.postForm.status === 'pending' && addPotentialCustomer.postForm.params.actionType === 'postThenAdd'} onClick={() => this.checkMatching('postThenAdd')} type="primary">
                    保存并新建
                </Button>
                <Button onClick={this.handleCancel} className="cancelButton">
                    取消
                </Button>
            </Row>
        );
        const formElementId = 'addPotentialCustomerForm';
        return (
            <Modal
                title="新建话务资料"
                width={900}
                visible
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
                        <Col span={12}>
                            <FormItem
                                label="邀约机构"
                                {...formItemLayout}
                            >
                                {
                                    getFieldDecorator(
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
                                            getPopupContainer={() => document.getElementById('addPotentialCustomerForm')}
                                            showSearch
                                            defaultActiveFirstOption={false}
                                            optionFilterProp="children"
                                        >
                                            {this.hospitalOptions}
                                        </Select>,
                                    )
                                }
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
                                {getFieldDecorator(
                                    'machineNumber',
                                    {
                                        validateTrigger: 'onBlur',
                                        rules: [
                                            { validator: this.checkContact },
                                        ],
                                    },
                                )(<Input maxLength="50" />)}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                    <Col span={12}>
                            <FormItem
                                label="身份证号"
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
                    </Row>
                    <Row>
                        <Col span={12}>
                            <FormItem
                                label="性别"
                                {...formItemLayout}
                            >
                                {getFieldDecorator('sex')(
                                    <SmartSelectBox
                                        {...mapPropsToFormItems}
                                        buttonOptions={
                                            [
                                                { id: '0', name: '女' },
                                                { id: '1', name: '男' },
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
                                {getFieldDecorator('age',
                                    {
                                        rules: [
                                            { pattern: /^\d{1,3}$/, message: '请输入正确的年龄' },
                                        ],
                                    })(<InputNumber style={{ width: '100%' }} maxLength="3" />)}
                            </FormItem>
                        </Col>

                    </Row>
                    <Row>
                        <Col span={12}>
                            <FormItem
                                label="居住地址"
                                {...formItemLayout}
                            >
                                {getFieldDecorator(
                                    'area',
                                    {
                                        rules: [ ],
                                    },
                                )(
                                    <SmartCascaderTerritory
                                        getPopupContainer={() => document.getElementById('addPotentialCustomerForm')}
                                        placeholder="请选择省/市/区"
                                        {...mapPropsToFormItems}
                                    />,
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                labelCol={{ span: 0 }}
                            >
                                {getFieldDecorator(
                                    'address',
                                    {
                                        validateTrigger: 'onBlur',
                                        rules: [
                                            { max: 50, message: '不能超过50个字符' },
                                        ],
                                    },
                                )(
                                    <Input
                                        style={{ marginLeft: 5 }}
                                        placeholder="请输入详细地址"
                                        maxLength="50"
                                    />,
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <FormItem
                            label="现有疾病"
                            labelCol={{ span: 4 }}
                            wrapperCol={{ span: 20 }}
                        >
                            {getFieldDecorator('diseases')(
                                <SmartSelectMultipleAsyncForDiseases
                                    {...mapPropsToFormItems}
                                    selectStyle={{ width: '50%' }}
                                    getPopupContainer={() => document.getElementById('addPotentialCustomerForm')}
                                    placeholder="选择其他疾病"
                                    defaultButtonCount={6}
                                />,
                            )}
                        </FormItem>
                    </Row>
                    <Row>
                        <FormItem
                            label="加入PBM前购药渠道"
                            labelCol={{ span: 5 }}
                            wrapperCol={{ span: 19 }}
                        >
                            {getFieldDecorator(
                                'drugPurchase',
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
                    <Row style={{ paddingBottom: 15 }}>
                        <CuttingLine text="医保信息" />
                    </Row>
                    <Row>
                        <Col>
                            <FormItem
                                label="保险类型"
                                labelCol={{ span: 4 }}
                                wrapperCol={{ span: 20 }}
                            >
                                {getFieldDecorator('insurance')(
                                    <SmartSelectBoxForInsurance
                                        {...mapPropsToFormItems}
                                    />,
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <FormItem
                                label="门慢疾病"
                                labelCol={{ span: 4 }}
                                wrapperCol={{ span: 20 }}
                            >
                                {getFieldDecorator('chronicDiseases')(
                                    <SmartSelectMultipleAsyncForDiseases
                                        {...mapPropsToFormItems}
                                        selectStyle={{ width: '50%' }}
                                        getPopupContainer={() => document.getElementById('addPotentialCustomerForm')}
                                        placeholder="选择其他疾病"
                                        defaultButtonCount={6}
                                    />,
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <CuttingLine text="用药需求" />
                    </Row>
                    <Row>
                        <AddCustomerMedicine
                            form={form}
                            hospitalId={hospitalId}
                        />
                    </Row>
                    <Row style={{ marginTop: 15 }}>
                        <CuttingLine text="联系人" noteText="（建议添加，方便随时与患者家属取得联系）" />
                    </Row>
                    <Row>
                        <AddCustomerContact
                            uuid={formElementId}
                            form={form}
                        />
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
                </Form>
            </Modal>
        );
    }
}

const WrapAddPotentialCustomer = Form.create({
    mapPropsToFields(props) {
        const { addPotentialCustomer } = props;
        return { ...addPotentialCustomer.formData };
    },
    onFieldsChange(props, fields) {
        const { renewFormDataAction } = props;
        renewFormDataAction(fields);
    },
})(AddPotentialCustomer);

function select(state) {
    return {
        auth: state.auth.payload,
        addPotentialCustomer: state.addPotentialCustomer,
    };
}

function mapDispachToProps(dispatch) {
    return bindActionCreators({
        getHospitalAction,
        checkPotentialMatchingAction,
        renewFormDataAction,
        postPotentialCustomerInfoAction,
        checkPhoneNumberAction,
    }, dispatch);
}

export default connectModalHelper(connect(select, mapDispachToProps)(WrapAddPotentialCustomer));
