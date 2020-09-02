import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
    Button, Form, Row, Col, Select, Modal, Alert, DatePicker, Icon, Upload, Tag, Spin, Radio, Switch,
} from 'antd';
import message from '@wanhu/antd-legacy/lib/message'
import moment from 'moment';
import SmartSelectBox from '../common/SmartSelectBox';
import { SmartSelectSingleAsync } from '../common/SmartSelectSingle';
import AddMedicineToOrder from './AddMedicineToOrder';
import { connectRouter, routerPropType } from '../../mixins/router';
import { ViewOrEdit } from '../common/form';
import SelectMultipleDiseases from '../common/SelectMultipleDiseases';
import AllergiesField from '../common/TextAreaField';
import {
    setOrderResult, getHistoricalDrugsAction,
    renewFormDataAction, postOrderAction, getPatientAction,
    verify, getDuplicateOrders, resetVerifyResult,
    getDrugPromptAction,
    putDrugTipAction,
    resetStateAction,
    getRegularMedicationAction,
    getOrderInfoAction,
    getThirdPartyOrdersAction,
    postOrderForStoreAction,
} from '../../states/customerCenter/addMedicineRegister';
import './CreateOrder.scss';
import { centToYuan, refundRountCentPercentToCent } from '../../helpers/money';
import api from '../../api/api';
import propTypes from '../../helpers/prop-types';
import RxImg from '../../images/rx.png';
import Viewer from '../toolcase/Viewer';
import card from './iscard.png'

const { Option } = Select;
const FormItem = Form.Item;
const VerifyLevelMap = {
    warning: 'warning',
    forbidden: 'error',
    further_information: 'error',
    manual_review: 'warning',
};
const formItemLayout = {
    labelCol: { span: 3 },
    wrapperCol: { span: 21 },
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
const FREQUENCY = {
    1: [1, 1],
    2: [2, 1],
    3: [3, 1],
    4: [4, 1],
    5: [1, 1],
    6: [1, 7],
};
const sources = [
    { key: 1, label: '临时来院' },
    { key: 2, label: '电话预定（呼出）' },
    { key: 3, label: '微信转入' },
    { key: 4, label: '电话预定（呼入）' },
    { key: 5, label: '处方变更' },
];

const OrderStatusLabel = {
    40: '已验货',
    50: '待退回',
};

function getAgeByBirthday(dateString) {
    const today = new Date();
    const birthDate = new Date(dateString);
    const age = today.getFullYear() - birthDate.getFullYear();
    return age;
}

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

class CreateOrder extends Component {
    static propTypes = {
        router: routerPropType().isRequired,
        form: propTypes.form().isRequired,
        getPatientAction: propTypes.func.isRequired,
        getHistoricalDrugsAction: propTypes.func.isRequired,
        getDrugPromptAction: propTypes.func.isRequired,
        getRegularMedicationAction: propTypes.func.isRequired,
        resetStateAction: propTypes.func.isRequired,
        addMedicineRegister: propTypes.shape({
            getPatientResult: propTypes.asyncResult(
                propTypes.shape({}),
                propTypes.shape({
                    patientId: propTypes.string,
                }),
            ),
            getOrderInfoResult: propTypes.asyncResult(
                propTypes.shape({}),
            ),
            getRegularMedicationResult: propTypes.asyncResult(
                propTypes.shape({}),
            ),
            postFormResult: propTypes.asyncResult(
                propTypes.shape({}),
            ),
            verifyResult: propTypes.asyncResult(
                propTypes.shape({}),
            ),
            duplicateOrders: propTypes.asyncResult(
                propTypes.shape({}),
            ),
        }).isRequired,
        setOrderResult: propTypes.func.isRequired,
        postOrderAction: propTypes.func.isRequired,
        putDrugTipAction: propTypes.func.isRequired,
        resetVerifyResult: propTypes.func.isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {
            oldFormData: null,
            visible: true,
            fileList: [],
            previewVisible: false,
            previewImage: '',
            preview: undefined,
            isThirdOrder: undefined,//是否选择第三方处方
            loading: false,//第三方处方加载中
            thirdOrderList: [],// 第三方处方列表
            thirdOrderId: undefined,
            value: null,
            paymentType: [],
            auditLoading: false,
            refundType: null,
        };
        this.isEstimatedPickup = undefined;
    }
    /** 2019-09-26 这里逻辑太多了，说一下它能干啥
    *   1、创建订单
    *   2、门店销售创建订单【loginName === window.STORE_LOGINNAME】
    *   3、修改订单（药师已驳回、患者已确认【无图】）【orderId && param[2] === 'update'】
    *   4、审核订单【orderId && param[2] === 'audit'】
    *   5、引用第三方处方并创建订单
    *   2020-02-10 修改： 添加【处方信息】选项
    *       详见任务：3263、 3262、 3261、 3260
    *
    *
    *
    */
    componentDidMount() {
        const { router } = this.props;
        const modalParam = router.modalParam;
        if (modalParam && modalParam.startsWith('order_')) {
            const param = router.modalParam.replace('order_', '').split('_');
            this.patientId = param[0];
            this.init(this.patientId);
            this.orderId = param[1];
            this.initOrder(this.orderId);
            if (param.length === 3 && param[2] === 'audit') {
                this.audit = true;
            }
            if (param.length === 3 && param[2] === 'update') {
                this.update = true;
            }
        } else {
            const patientId = router.modalParam;
            this.patientId = patientId;
            if (patientId) {
                this.init(patientId);
            }
        }

    }

    async componentWillReceiveProps(nextProps) {
        const {
            form,
            addMedicineRegister,
            router,
            setOrderResult,
        } = this.props;
        const {
            oldFormData,
            deliveryTime,
            defaultReceiverOption,
            patientDetails
        } = this.state;
        const values = nextProps.form.getFieldsValue();
        const newFormData = JSON.stringify(values);
        if (oldFormData !== newFormData) {
            this.setState({ oldFormData: newFormData });
            this.onValuesChange(values);
        }
        const thisPatientResultStatus = addMedicineRegister.getPatientResult.status;
        const nextPatientResultStatus = nextProps.addMedicineRegister.getPatientResult.status;
        //初始化患者详情
        if (thisPatientResultStatus !== nextPatientResultStatus) {
            if (nextPatientResultStatus === 'fulfilled') {
                const patientDetails = nextProps.addMedicineRegister.getPatientResult.payload;
                this.setState({ isThirdOrder: patientDetails.hospital.warehouse.isThirdOrder });//是否获取第三方处方(0:否；1:是)
                const { patientId } = nextProps.addMedicineRegister.getPatientResult.params;
                const age = patientDetails.birthday ? `/${getAgeByBirthday(patientDetails.birthday)}岁` : '';
                const label = `${patientDetails.name} (${patientDetails.sex ? '男' : '女'}${age}) ${patientDetails.phone || ''} ${patientDetails.machineNumber || ''} ${patientDetails.address.liveStreet || ''} ${patientDetails.hospital.name || ''}`;
                const patientFieldValue = {
                    key: patientId,
                    label,
                };
                this.setState({ patientFieldValue, patientDetails });
                const patientInfo = {
                    id: patientId,
                    hospitalId: patientDetails.hospital.id,
                    hospitalName: patientDetails.hospital.name,
                };
                this.patientInfo = patientInfo;
                form.setFieldsValue({
                    allergies: patientDetails.allergy,
                });
                window.sessionStorage.setItem('patId', patientId)
                if (!this.orderId) {
                    form.setFieldsValue({
                        diseases: patientDetails.diseases,
                    });
                    this.setState({ deliveryTime: moment(patientDetails.deliveryTime).format('YYYY-MM-DD'), addressValue: patientDetails.memberType == 1 && patientDetails && patientDetails.hospital && patientDetails.hospital.warehouse.selfPickUp == 1 ? 2 : patientDetails.memberType == 2 && patientDetails.hospital && patientDetails.hospital.warehouse.homeDelivery == 1 && patientDetails.hospital.warehouse.selfPickUp != 1 ? 3 : patientDetails.memberType == 2 && patientDetails.hospital && patientDetails.hospital.warehouse.homeDelivery != 1 && patientDetails.hospital.warehouse.selfPickUp == 1 ? 2 : undefined });
                    form.setFieldsValue({ time: moment(patientDetails.deliveryTime) });
                }
                if (patientDetails.memberType == 2 && patientDetails.hospital && patientDetails.hospital.warehouse.homeDelivery != 1 && patientDetails.hospital.warehouse.selfPickUp == 1) {
                    try {
                        const data1 = {
                            where: JSON.stringify({
                                status: 0,
                                provincesId: patientDetails.address.liveProvinces || '',
                                cityId: patientDetails.address.liveCity || '',
                                // areaId: '',
                                fatchFlag: 1, //是否为取药点 0=否 1=是
                                hospitalSignage: 4, //医院标识 1=常用 2=健康卡虚拟医院 3=绿A虚拟医院 4=绿A自提机构
                            }),
                            // skip:null,
                            // limit: null,
                        }
                        const memAddress = await api.getAselfAddress(data1)
                        this.setState({
                            nowAddress: memAddress,
                        })
                    } catch (e) {
                        console.error(e.message)
                    }
                }
                if (window.STORE_LOGINNAME.split(',').indexOf(this.props.auth.loginName) >= 0) {
                    this.setState({ deliveryTime: moment().format('YYYY-MM-DD') });
                    form.setFieldsValue({ time: moment() });
                    let hospitalForStore = await api.getHospitalById(window.STORE_HOSPITALID);
                    hospitalForStore = {
                        ...hospitalForStore,
                        deliveryType: 2,
                        last: true,
                        hospitalName: hospitalForStore.name,
                        name: patientDetails.name,
                        machineNumber: patientDetails.phone || patientDetails.machineNumber
                    }
                    const label = `${`${hospitalForStore.name} / `}${`${hospitalForStore.machineNumber} / `}${hospitalForStore.provincesName || ''}${hospitalForStore.cityName || ''}${hospitalForStore.areaName || ''}${hospitalForStore.street || ''}${hospitalForStore.deliveryType === 2 ? `(${hospitalForStore.hospitalName})` : ''}`;
                    hospitalForStore = {
                        key: hospitalForStore.id,
                        label,
                        ...hospitalForStore,
                    };
                    const addresses = [hospitalForStore]
                    this.setState({ addresses, defaultReceiverOption: addresses[0] });
                } else {
                    // if (patientDetails.memberType == 1) {
                    //     this.onValueChange(2, patientDetails);
                    // }
                    if (patientDetails.hospital
                        && patientDetails.hospital.warehouse
                        && patientDetails.hospital.warehouse.selfPickUp == 0
                        && patientDetails.hospital.warehouse.homeDelivery == 1) {
                        this.onValueChange(3, patientDetails);
                    }
                    if (patientDetails.hospital
                        && patientDetails.hospital.warehouse
                        && patientDetails.hospital.warehouse.selfPickUp == 1
                        && patientDetails.hospital.warehouse.homeDelivery == 0) {
                        this.onValueChange(2, patientDetails);
                    }
                    if (patientDetails.hospital
                        && patientDetails.hospital.warehouse
                        && patientDetails.hospital.warehouse.selfPickUp == 1
                        && patientDetails.hospital.warehouse.homeDelivery == 1) {
                        /* if (patientDetails.memberType === 1) {
                            this.onValueChange(2, patientDetails);
                        } else { */
                            this.setState({
                                defaultReceiverOption: {},
                            })
                        /* } */

                    }
                }
            }
        }
        //规律订药/配货地址
        if (!this.orderId && addMedicineRegister.getRegularMedicationResult.status
            !== nextProps.addMedicineRegister.getRegularMedicationResult.status) {
            if (nextProps.addMedicineRegister.getRegularMedicationResult.status === 'fulfilled') {
                const result = nextProps.addMedicineRegister.getRegularMedicationResult.payload;
                this.result = result;
                this.isEstimatedPickup = result.isRegularMedication;
                this.homeDelivery = result.isCustomDelivery;
            }
        }

        //初始化第三方订单getThirdPartyOrdersAction
        const thisThirdOrderResultStatus = addMedicineRegister.getThirdPartyOrdersResult.status;
        const nextThirdOrderResultStatus = nextProps.addMedicineRegister.getThirdPartyOrdersResult.status;
        if (thisThirdOrderResultStatus !== nextThirdOrderResultStatus) {
            if (nextThirdOrderResultStatus === 'rejected') {
                this.setState({ loading: false });
                message.error('获取信息失败。');
            }
            if (nextThirdOrderResultStatus === 'fulfilled') {
                this.setState({ loading: false });
                const thirdOrderList = nextProps.addMedicineRegister.getThirdPartyOrdersResult.payload;
                this.setState({ thirdOrderList });
                if (!thirdOrderList || thirdOrderList.length <= 0) {
                    message.error('暂无处方信息。');
                }
                if (thirdOrderList.length === 1) {
                    const order = thirdOrderList[0];
                    this.setState({ thirdOrderId: order.orderId });
                    //疾病
                    form.setFieldsValue({
                        diseases: order.diseases,
                    });
                    form.setFieldsValue({
                        allergies: order.allergies,
                    });
                }
            }
        }

        const thisOrderInfoResultStatus = addMedicineRegister.getOrderInfoResult.status;
        const nextOrderInfoResultStatus = nextProps.addMedicineRegister.getOrderInfoResult.status;
        //初始化订单
        if (this.orderId && thisOrderInfoResultStatus !== nextOrderInfoResultStatus) {
            if (nextOrderInfoResultStatus === 'fulfilled') {
                const orderDetails = nextProps.addMedicineRegister.getOrderInfoResult.payload;
                if (orderDetails.status !== 97 && orderDetails.status !== 20 && !this.audit) {
                    Modal.error({
                        title: '错误提示',
                        content: "订单不可修改。",
                        onOk: () => { this.handleCancel() },
                        okText: '确定',
                    });
                }
                //疾病
                form.setFieldsValue({
                    diseases: orderDetails.diseases,
                });
                //配送地址
                const { addresses } = this.state;
                let selectEdAddress;
                let index
                if (addresses && addresses.length > 0) {
                    selectEdAddress = addresses.find(
                        (item) => item.deliveryType === orderDetails.deliveryAddressType
                            && `${item.provincesName || item.provinceName}${item.cityName}${item.areaName}${item.street}` === orderDetails.deliveryAddress
                            && `${item.name}` === orderDetails.deliveryRecipientName
                            && `${item.machineNumber}` === orderDetails.deliveryRecipientContact
                    );
                    index = addresses.findIndex(
                        (item) => item.deliveryType === orderDetails.deliveryAddressType
                            && `${item.provincesName || item.provinceName}${item.cityName}${item.areaName}${item.street}` === orderDetails.deliveryAddress
                            && `${item.name}` === orderDetails.deliveryRecipientName
                            && `${item.machineNumber}` === orderDetails.deliveryRecipientContact
                    );
                }

                if (!selectEdAddress && addresses) {
                    selectEdAddress = addresses.find(item => item.state === 1);
                    index = addresses.findIndex(item => item.state === 1);
                }
                if (selectEdAddress) {
                    this.selectedReceiver = selectEdAddress;
                    const label = `${`${selectEdAddress.name} / `}${`${selectEdAddress.machineNumber} / `}${selectEdAddress.provincesName || selectEdAddress.provinceName || ''}${selectEdAddress.cityName || ''}${selectEdAddress.areaName || ''}${selectEdAddress.street || ''}${selectEdAddress.deliveryType === 2 ? `(${selectEdAddress.hospitalName})` : ''}`;
                    const defaultReceiverOption = {
                        key: selectEdAddress.id || String(index),
                        label,
                    };
                    this.setState({
                        defaultReceiverOption,
                    });
                }
                //收件时间
                this.setState({ deliveryTime: moment(orderDetails.deliveryTime).format('YYYY-MM-DD') });
                form.setFieldsValue({ time: moment(orderDetails.deliveryTime) });
                //图片
                const { pictures } = orderDetails;
                if (pictures && pictures.length > 0) {
                    let fileList = [];
                    pictures.forEach((item, index) => {
                        const file = {
                            uid: `-${index + 1}`,
                            name: `${index}.png`,
                            status: 'done',
                            url: item,
                            response: item,
                        }
                        fileList.push(file);
                    });
                    this.setState({ fileList });
                }
                //来源渠道
                form.setFieldsValue({
                    sources: orderDetails.sources,
                });
            }
        }

        //提交
        const thisPostFormResultStatus = addMedicineRegister.postFormResult.status;
        const nextPostFormResultStatus = nextProps.addMedicineRegister.postFormResult.status;
        if (thisPostFormResultStatus !== nextPostFormResultStatus) {
            if (nextPostFormResultStatus === 'fulfilled') {
                let totalPriceCent = 0;
                let totalRefundCentPercent = 0;
                for (const v of this.orderData.medicineKeys) {
                    const drug = this.orderData[`medicine_${v}_data`];
                    const amount = Number(this.orderData[`medicine_${v}_amount`]) || 0;
                    totalPriceCent += drug.priceCent * amount;
                    totalRefundCentPercent += drug.priceCent * amount * (drug.whScale || 0);
                }
                const totalRefundCent = refundRountCentPercentToCent(totalRefundCentPercent);
                const actualPriceCent = totalPriceCent - totalRefundCent;
                let orderNo;
                if (this.orderId) {
                    orderNo = addMedicineRegister.getOrderInfoResult.payload.orderNo;
                } else {
                    orderNo = nextProps.addMedicineRegister.postFormResult.payload.orderNo;
                }
                this.orderData = {
                    ...this.orderData,
                    orderId: this.orderId,
                    patientInfo: addMedicineRegister.getPatientResult.payload,
                    orderNo,
                    deliveryTime,
                    maxTakeTime: this.maxTakeTime,
                    totalFee: nextProps.addMedicineRegister.postFormResult.payload ? nextProps.addMedicineRegister.postFormResult.payload.amount || 0 : 0,
                    totalScale: this.state.upDateRefundMoney ? (this.state.upDateRefundMoney.amount || 0) : 0,
                    totalScalePrice: this.state.upDateRefundMoney ? (this.state.upDateRefundMoney.integral || 0) : 0,
                    feeAfterScale: centToYuan(actualPriceCent, 2),
                    deliveryAddress: defaultReceiverOption ? defaultReceiverOption.label : null,
                    freight: nextProps.addMedicineRegister.postFormResult.payload ? nextProps.addMedicineRegister.postFormResult.payload.freight || 0 : 0,
                    interval: this.state.interval,
                    points: nextProps.addMedicineRegister.postFormResult.payload ? nextProps.addMedicineRegister.postFormResult.payload.pointsDeductionAmount || 0 : 0,
                    selfWelfare: this.state.patientDetails.hospital.warehouse.selfWelfare,
                    totalRefundCentPercent,
                    totalRefundCent,
                    isUpdate: this.orderId,
                };
                if (this.orderId) {
                    this.orderData.deliveryAddress = nextProps.addMedicineRegister.postFormResult.payload.deliveryAddress;
                }
                if (window.STORE_LOGINNAME.split(',').indexOf(this.props.auth.loginName) >= 0) {
                    const { refundType } = this.state;
                    this.orderData.refundType = refundType;
                    this.orderData.deliveryAddress = this.state.defaultReceiverOption.label;
                    this.orderData.totalScalePrice = Math.ceil(totalRefundCentPercent / 100);
                    this.orderData.totalScale = centToYuan(totalRefundCent || 0, 1);
                }
                setOrderResult(this.orderData);
                if (this.openOrderResult) {
                    this.reset();
                    router.openModal('orderResult');
                }
            } else if (nextPostFormResultStatus === 'rejected') {
                Modal.error({
                    title: '错误提示',
                    content: nextProps.addMedicineRegister.postFormResult.payload.message,
                });
            }
        }

        //规则校验
        if (addMedicineRegister.verifyResult.status
            !== nextProps.addMedicineRegister.verifyResult.status) {
            if (this.patientInfo) {
                this.loadDuplicateOrdersIfNeeded(nextProps);
                if (!this.orderId) {
                    this.validatePrescribingSource();
                }
            }
        }
    }

    componentWillUnmount() {
        const { resetStateAction } = this.props;
        this.reset();
        resetStateAction();
    }

    onChangeDate = (date, dateString) => {
        this.setState({ deliveryTime: dateString }, () => {
            const { form } = this.props;
            form.validateFields(['time'], { force: true });
        });
    }

    onChangeFile = (info) => {
        let fileList = [...info.fileList];
        fileList = fileList.slice(-2);
        this.setState({ fileList });
    }

    onFileRemove = (file) => {
        this.setState(state => {
            const index = state.fileList.indexOf(file);
            const newFileList = state.fileList.slice();
            newFileList.splice(index, 1);
            return {
                fileList: newFileList,
            };
        });
    }

    async onValuesChange(values) {
        if (!this.patientInfo || !this.patientInfo.id) {
            return;
        }
        const data = {
            patientId: this.patientInfo.id,
            diseaseIds: values.diseases && values.diseases.map(row => row.id),
        };
        const { medicineKeys } = values;
        const { verify, form } = this.props;
        this.orderData = form.getFieldsValue();
        if (window.STORE_LOGINNAME.split(',').indexOf(this.props.auth.loginName) >= 0) {
            return;
        }
        if (medicineKeys && medicineKeys.length && this.orderData.medicineKeys.length) {
            let totalPriceCent = 0;
            for (const v of this.orderData.medicineKeys) {
                const drug = this.orderData[`medicine_${v}_data`];
                const amount = Number(this.orderData[`medicine_${v}_amount`]) || 0;
                totalPriceCent += drug.priceCent * amount;
            }
            try {
                const addresses = await api.getFreight(this.patientId, { amount: totalPriceCent, deliveryAddressType: 3 });
                this.setState({
                    nowfreight: addresses.freight
                })
            } catch (e) {
                console.error(e.message)
            }
        }
        if (medicineKeys.length) {
            let ary = [];
            let totalPriceCent = 0;
            for (const v of this.orderData.medicineKeys) {
                let ast = {};
                const drug = this.orderData[`medicine_${v}_data`];
                const amount = Number(this.orderData[`medicine_${v}_amount`]) || 0;
                totalPriceCent += drug.priceCent * amount;
                ast.drugId = drug.drugId;
                ast.amount = amount;
                ary.push(ast)
            }
            let interval = this.state.interval ? Math.min(this.state.patientDetails.points, totalPriceCent) : 0;
            try {
                const data = {
                    pointsDeductionAmount: interval,
                    drugs: JSON.stringify(ary)
                }
                const result = await api.getRefundMoney(data, this.patientInfo.id)
                this.setState({
                    upDateRefundMoney: result,
                })
            } catch (e) {
                console.error(e.message)
            }
        } else {
            this.setState({
                upDateRefundMoney: {
                    welfareType: 1,
                    amount: 0,
                    integral: 0,
                },
            })
        }
        if (medicineKeys.length) {
            const drugs = medicineKeys.map(v => ({
                drugId: v,
                amount: values[`medicine_${v}_amount`] || undefined,
                useAmount: values[`medicine_${v}_useAmount`] || undefined,
                frequency: Number(values[`medicine_${v}_frequency`]) || undefined,
            }));
            data.drugs = drugs;
            verify(data);
        }
    }

    handleSendTakeTime = () => {
        const { form } = this.props;
        this.orderData = form.getFieldsValue();
        const medicineKeys = form.getFieldValue('medicineKeys');
        if (medicineKeys.length !== 0) {
            const taketimeArr = medicineKeys.map((v) => {
                const amount = Number(this.orderData[`medicine_${v}_amount`]) || 0;
                const { packageSize } = this.orderData[`medicine_${v}_data`];
                const useAmount = this.orderData[`medicine_${v}_useAmount`];
                const frequency = this.orderData[`medicine_${v}_frequency`];
                const taketime = Number.isNaN(packageSize / (useAmount * frequency) * amount) ? '' : Math.ceil(packageSize * amount / (useAmount * FREQUENCY[frequency][0])) * FREQUENCY[frequency][1];
                return taketime;
            });
            this.maxTakeTime = Math.max(...taketimeArr);
        } else {
            this.maxTakeTime = 0;
        }
        return this.maxTakeTime;
    }

    handlePostOrder = (actionType) => {
        const {
            form,
            router,
            postOrderAction,
            postOrderForStoreAction,
        } = this.props;
        const { deliveryTime, fileList, thirdOrderId, patientDetails, paymentType } = this.state;
        const { getFieldValue } = form;
        const allergies = getFieldValue('allergies');
        const diseases = getFieldValue('diseases');
        let medicineDrugs = getFieldValue('medicineKeys');
        let prescribingSource = getFieldValue('prescribingSource');
        prescribingSource = prescribingSource && prescribingSource.length > 0 ? prescribingSource[0] : undefined;
        let electronicPrescription;
        if (prescribingSource === '2') {
            let PMH = getFieldValue('PMH');
            PMH = PMH && PMH.length > 0 ? PMH[0] : undefined;
            let AMH = getFieldValue('AMH');
            AMH = AMH && AMH.length > 0 ? AMH[0] : undefined;
            let FMH = getFieldValue('FMH');
            FMH = FMH && FMH.length > 0 ? FMH[0] : undefined;
            let liverDesc = getFieldValue('liverDesc');
            liverDesc = liverDesc && liverDesc.length > 0 ? liverDesc[0] : undefined;
            let renalDesc = getFieldValue('renalDesc');
            renalDesc = renalDesc && renalDesc.length > 0 ? renalDesc[0] : undefined;
            let PMHText = getFieldValue('PMHText');
            let AMHText = getFieldValue('AMHText');
            let FMHText = getFieldValue('FMHText');
            let liverDescText = getFieldValue('liverDescText');
            let renalDescText = getFieldValue('renalDescText');
            electronicPrescription = {
                PMH: PMH === '1' ? PMHText : null,
                AMH: AMH === '1' ? AMHText : null,
                FMH: FMH === '1' ? FMHText : null,
                liverDesc: liverDesc === '1' ? liverDescText : null,
                renalDesc: renalDesc === '1' ? renalDescText : null,
            }
        }

        let totalPriceCent = 0;
        medicineDrugs && medicineDrugs.map(v => {
            const medicineRowData = getFieldValue(`medicine_${v}_data`);
            let priceCent = medicineRowData.priceCent ? medicineRowData.priceCent : 0;
            let amount = getFieldValue(`medicine_${v}_amount`) ? Number(getFieldValue(`medicine_${v}_amount`)) : undefined;
            let rowPriceCent = 0;
            if (amount) {
                rowPriceCent = priceCent * amount
                totalPriceCent += rowPriceCent
            }
        })
        let receiver = this.selectedReceiver;

        const orderDetails = this.props.addMedicineRegister.getOrderInfoResult.payload;
        if (this.orderId) {
            receiver = {
                deliveryType: orderDetails.deliveryAddressType || 2,
                provincesId: orderDetails.deliveryProvinceId,
                cityId: orderDetails.deliveryCityId,
                areaId: orderDetails.deliveryAreaId,
                name: orderDetails.deliveryRecipientName,
                machineNumber: orderDetails.deliveryRecipientContact,
            }
        }
        this.deliveryAddress = `${receiver.provincesName || receiver.provinceName || ''}${receiver.cityName || ''}${receiver.areaName || ''}${receiver.street || ''}`;

        let pictures;
        fileList.forEach((i) => {
            pictures = pictures ? pictures + ',' + i.response : i.response;
        })

        const dataForPost = {
            patientId: this.patientInfo.id,
            allergies: allergies || '',
            diseaseIds: JSON.stringify(diseases.map(row => row.id)),
            subCategory: 2,
            cycle: this.handleSendTakeTime(),
            deliveryRecipientName: patientDetails.memberType == 2 && this.state.addressValue == 2 ? patientDetails.name : receiver.name,
            deliveryRecipientContact: receiver.machineNumber,
            deliveryAddress: this.orderId ? orderDetails.deliveryAddress : this.deliveryAddress,
            deliveryAddressType: receiver.deliveryType || 2,
            deliveryProvince: receiver.provincesId || receiver.provinceId,
            deliveryCity: receiver.cityId,
            deliveryArea: receiver.areaId,
            pictures,
            points: this.state.interval ? Math.min(patientDetails.points, totalPriceCent + (this.state.addressValue == 3 ? this.state.nowfreight || 0 : 0)) : 0,
            shippingAddress: this.state.addressValue == 2 ? receiver.hospitalId || receiver.id : '',
            prescribingSource,
            electronicPrescription
        };
        if (!this.orderId) {
            dataForPost.deliveryTime = deliveryTime;
        }
        const medicineKeys = getFieldValue('medicineKeys');
        if (medicineKeys.length > 0) {
            const drugs = medicineKeys.map(v => ({
                drugId: v,
                amount: getFieldValue(`medicine_${v}_amount`),
                useAmount: getFieldValue(`medicine_${v}_useAmount`),
                frequency: getFieldValue(`medicine_${v}_frequency`),
            }));
            dataForPost.drugs = JSON.stringify(drugs);
        }
        const match = router.match('/taskDetail/:taskId') || router.match('/taskPool/:taskPoolId/task/:taskId');
        if (match) {
            dataForPost.channelId = match.taskId;
        }
        const { channel } = router.query;
        if (channel) {
            dataForPost.channel = channel;
        }
        if (getFieldValue('sources')) {
            dataForPost.sources = Number(getFieldValue('sources'));
        }
        if (this.orderId) {
            dataForPost.orderId = this.orderId;
            const orderDetails = this.props.addMedicineRegister.getOrderInfoResult.payload;
            dataForPost.pharmacistUpdate = orderDetails.pharmacistAudited.pharmacistUpdate;
        }
        if (thirdOrderId) {
            dataForPost.thirdOrderId = thirdOrderId;
        }
        if (window.STORE_LOGINNAME.split(',').indexOf(this.props.auth.loginName) >= 0) {
            const payType = getFieldValue('payType');
            let paymentTypes = paymentType.find(item => `${item.largeClass}${item.groupId}${item.id}` === payType);
            paymentTypes = {
                paymentTypeId: paymentTypes.id, //支付id
                groupId: paymentTypes.groupId, //类型组
                amount: totalPriceCent / 100, //数值
                largeClass: paymentTypes.largeClass//支付大类
            }
            dataForPost.paymentTypes = [paymentTypes];
            dataForPost.hospitalId = window.STORE_HOSPITALID;
            postOrderForStoreAction(dataForPost, actionType)
        } else {
            postOrderAction(dataForPost, actionType);
        }


    }

    handleReceiver = (value) => {
        const { nowAddress, patientDetails, addressValue } = this.state;
        this.selectedReceiver = nowAddress.find(
            (item, index) => (item.id === value.key)
                || (String(index) === value.key),
        );
        if (patientDetails.memberType == 2 && addressValue == 2) {
            const address = `${this.selectedReceiver.provincesName || this.selectedReceiver.provinceName || ''}${this.selectedReceiver.cityName || ''}${this.selectedReceiver.areaName || ''}${this.selectedReceiver.street || ''}(${this.selectedReceiver.name})`;
            this.setState({
                defaultReceiverOption: {
                    key: value.key,
                    label: `${patientDetails.name ? patientDetails.name + ' / ' : ''}${patientDetails.phone || patientDetails.machineNumber || ''} / ${address}`,
                },
            });
        } else {
            const address = `${this.selectedReceiver.provincesName || this.selectedReceiver.provinceName || ''}${this.selectedReceiver.cityName || ''}${this.selectedReceiver.areaName || ''}${this.selectedReceiver.street || ''}${this.selectedReceiver.deliveryType === 2 ? `(${this.selectedReceiver.hospitalName})` : ''}`;
            this.setState({
                defaultReceiverOption: {
                    key: value.key,
                    label: `${this.selectedReceiver.name ? this.selectedReceiver.name + ' / ' : ''}${this.selectedReceiver.machineNumber ? this.selectedReceiver.machineNumber + ' / ' : ''}${address}`,
                },
            });
        }
    }

    choseCoupon = (value) => {
        this.selectedCoupon = { id: 1, name: '第一' }
    }

    notAllowBeforeToday = current => current && current.valueOf() < Date.now()

    handleSubmitAndClose = () => this.handleSubmit('postThenClose');

    mapDataToOption = (data) => {
        this.patientOptionData = data;
        if (!data.list) return null;
        const options = data.list.map((row) => {
            const age = row.birthday ? `/${getAgeByBirthday(row.birthday)}岁` : '';
            const name = `${row.name} (${row.sex ? '男' : '女'}${age})`;
            return (
                <Option key={row.id}>
                    <Row key={row.id} gutter={10}>
                        <Col title={name} style={colStyle} span={3}>
                            {name}
                        </Col>
                        <Col title={name} style={colStyle} span={3}>
                            <img style={{ maxHeight: 30 }} src={row.levelIcon} />
                        </Col>
                        <Col title={name} style={colStyle} span={2}>
                            <img style={{ width: 32 }} src={row.isCertification ? card : ''} />
                        </Col>
                        <Col title={row.phone || ''} style={colStyle} span={4}>
                            {row.phone || ''}
                        </Col>
                        <Col title={row.machineNumber || ''} style={colStyle} span={3}>
                            {row.machineNumber || ''}
                        </Col>
                        <Col title={row.address.liveStreet} style={colStyle} span={4}>
                            {row.address.liveStreet}
                        </Col>
                        <Col title={row.hospitalName} style={colStyle} span={5}>
                            {row.hospitalName}
                        </Col>
                    </Row>
                </Option>
            );
        });
        if (data.list.length === 11) {
            options.pop();
            options.push((
                <Option key="more" disabled style={{ textAlign: 'center' }}>
                    搜索结果过多，请尝试输入全名或其他信息
                </Option>
            ));
        }
        return options;
    }

    putDrugTip = (requirementId) => {
        const { putDrugTipAction } = this.props;
        if (this.patientInfo && this.patientInfo.id) {
            putDrugTipAction(this.patientInfo.id, requirementId);
        }
    }

    handleCancel = () => {
        const { router } = this.props;
        router.closeModal();
        this.reset();
    }

    handlePatientSelect = (value) => {
        this.reset(true);
        const optionData = this.patientOptionData.list;
        const index = optionData.findIndex(data => data.id === value.key);
        if (index !== -1) {
            if (optionData[index].isDisabled) {
                Modal.error({
                    title: '该患者已被禁用',
                });
                this.setState({
                    patientFieldValue: undefined,
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
            this.init(optionData[index].id);
            this.patientId = optionData[index].id;
        } else {
            Modal.error({
                title: '错误提示',
                content: '解析用户信息出错',
            });
        }
    }

    reset = () => {
        const { resetVerifyResult, form } = this.props;
        resetVerifyResult();
        form.resetFields();
        this.isEstimatedPickup = undefined;
        this.patientInfo = undefined;
        this.patientId = undefined;
        this.orderId = undefined;
        this.setState({
            patientDetails: undefined,
            patientFieldValue: undefined,
            defaultReceiverOption: undefined,
            fileList: [],
            isThirdOrder: undefined,
            thirdOrderList: [],
            hospitalForStore: null
        });
    }

    handlePatientChange = (value) => {
        if (!value) {
            this.reset();
        }
    }

    handleSubmit(actionType) {
        const { form } = this.props;
        form.validateFieldsAndScroll((err, values) => {
            if (err) {
                return;
            }
            const {
                defaultReceiverOption,
                visible,
                fileList,
                addressValue
            } = this.state;
            if (!this.patientInfo || !this.patientInfo.id) {
                Modal.warning({
                    title: '请选择会员',
                    okText: '确定',
                });
                return;
            }
            if (!this.orderId && (!addressValue || !defaultReceiverOption)) {
                Modal.warning({
                    title: '请选择收件信息',
                    okText: '确定',
                });
                return;
            }
            const medicineKeys = form.getFieldValue('medicineKeys');
            if (medicineKeys.length === 0) {
                Modal.warning({
                    title: '请添加药品',
                    okText: '确定',
                });
                return;
            }
            if (window.STORE_LOGINNAME.split(',').indexOf(this.props.auth.loginName) >= 0 && fileList.length <= 0) {
                Modal.warning({
                    title: '需补充或重新上传处方信息',
                    okText: '确定',
                });
                return;
            }
            if (this.update && fileList.length <= 0) {
                Modal.warning({
                    title: '需补充或重新上传处方信息',
                    okText: '确定',
                });
                return;
            }
            if(values.prescribingSource && values.prescribingSource[0] === '3' && fileList.length <= 0) {
                Modal.warning({
                    title: '需补充或重新上传处方信息',
                    okText: '确定',
                });
                return;
            }
            let picCheck = true;
            fileList.forEach((i) => {
                if (i.status !== 'done') {
                    picCheck = false;
                }
            });
            if (!picCheck) {
                message.error('请等待图片上传成功后再次提交。');
                return;
            }
            if (this.isEstimatedPickup) {
                let warningText = '';
                const warningArr = [];
                const regularMedication = this.result;
                if (regularMedication.timing && !regularMedication.timing.estimatedPickupDay) {
                    warningArr.push('规律取药时间');
                }
                if (this.homeDelivery) {
                    if (regularMedication.shippingAddress && !this.defaultType) {
                        warningArr.push('规律配送地址');
                    }
                }
                if (!regularMedication.drugs || regularMedication.drugs.length === 0) {
                    warningArr.push('规律取药药品');
                }
                warningArr.forEach((i, index) => {
                    let item = i;
                    if (index !== warningArr.length - 1) {
                        item += '/';
                    }
                    warningText += item;
                });
                this.openOrderResult = true;
                this.setState({ visible: false });
                this.handlePostOrder(actionType);
                window.sessionStorage.setItem('warningText', warningText)
            } else {
                this.openOrderResult = true;
                this.handlePostOrder(actionType);
            }
        });
    }

    async initOrder(orderId) {
        const {
            getOrderInfoAction,
        } = this.props;
        try {
            getOrderInfoAction(orderId);
        } catch (e) {
            message.error(e.message);
        }
    }

    async init(patientId) {
        const {
            getPatientAction,
            getHistoricalDrugsAction,
            getDrugPromptAction,
            getRegularMedicationAction,
        } = this.props;
        try {
            getPatientAction(patientId);
            getHistoricalDrugsAction(patientId);
            getDrugPromptAction(patientId);
            getRegularMedicationAction(patientId);
            const addresses = await api.getReceiverAddress(patientId);
            if (window.STORE_LOGINNAME.split(',').indexOf(this.props.auth.loginName) >= 0) {
                const hospitalForStore = await api.getHospitalById(window.STORE_HOSPITALID);
                this.setState({ hospitalForStore });
                addresses = [{ ...hospitalForStore, deliveryType: 2, last: true, hospitalName: hospitalForStore.name }]
            }
            const defaultReceiver = addresses.find(item => item.last == true);
            const index = addresses.findIndex(item => item.last == true);
            const zitiList = addresses.filter(item => item.deliveryType == 2);
            const kuaidiList = addresses.filter(item => item.deliveryType == 3 || item.deliveryType == 1);
            let defaultReceiverOption;
            if (defaultReceiver) {
                this.selectedReceiver = defaultReceiver;
                const label = `${`${defaultReceiver.name} / `}${`${defaultReceiver.machineNumber} / `}${defaultReceiver.provincesName || ''}${defaultReceiver.cityName || ''}${defaultReceiver.areaName || ''}${defaultReceiver.street || ''}${defaultReceiver.deliveryType === 2 ? `(${defaultReceiver.hospitalName})` : ''}`;
                defaultReceiverOption = {
                    key: defaultReceiver.id || String(index),
                    label,
                };
            } else if (zitiList.length && !kuaidiList.length) { // 只存在自提点
                const isdefault = zitiList.find(item => item.state == 1);
                const isdefaultIndex = zitiList.findIndex(item => item.state == 1);
                if (isdefault) {
                    this.selectedReceiver = isdefault;
                    const label = `${`${isdefault.name} / `}${`${isdefault.machineNumber} / `}${isdefault.provincesName || ''}${isdefault.cityName || ''}${isdefault.areaName || ''}${isdefault.street || ''}${isdefault.deliveryType === 2 ? `(${isdefault.hospitalName})` : ''}`;
                    defaultReceiverOption = {
                        key: isdefault.id || String(isdefaultIndex),
                        label,
                    };
                }
            } else if (!zitiList.length && kuaidiList.length) { // 只存在快递点
                const isdefault = kuaidiList.find(item => item.state == 1);
                const isdefaultIndex = kuaidiList.findIndex(item => item.state == 1);
                if (isdefault) {
                    this.selectedReceiver = isdefault;
                    const label = `${`${isdefault.name} / `}${`${isdefault.machineNumber} / `}${isdefault.provincesName || ''}${isdefault.cityName || ''}${isdefault.areaName || ''}${isdefault.street || ''}${isdefault.deliveryType === 2 ? `(${isdefault.hospitalName})` : ''}`;
                    defaultReceiverOption = {
                        key: isdefault.id || String(isdefaultIndex),
                        label,
                    };
                }
            } else if (zitiList && kuaidiList) {
            }
            if (window.STORE_LOGINNAME.split(',').indexOf(this.props.auth.loginName) >= 0) {
                const paymentType = await api.getHospitalPaymentType(window.STORE_HOSPITALID);
                this.setState({ paymentType });
            }
            let nowAddress;
            if (defaultReceiver) {
                nowAddress = addresses.filter(i => i.deliveryType == defaultReceiver.deliveryType);
            } else if (zitiList.length && !kuaidiList.length) {
                nowAddress = addresses.filter(i => i.deliveryType == 2);
            } else if (!zitiList.length && kuaidiList.length) {
                nowAddress = addresses.filter(i => i.deliveryType == 3);
            } else {
                nowAddress = []
            }
            this.setState({
                defaultReceiverOption,
                addresses,
                fileList: [],
                addressValue: defaultReceiver ? defaultReceiver.deliveryType : (zitiList && !kuaidiList) ? 2 : (!zitiList && kuaidiList) ? 3 : undefined,
                nowAddress,
            });
        } catch (e) {
            console.error(e);
            message.error(e.message);
        }
    }

    async loadDuplicateOrdersIfNeeded(nextProps) {
        const v = nextProps.addMedicineRegister.verifyResult.payload;
        const needLoadIds = [];
        if (v && v.verifyWarnings) {
            for (const w of v.verifyWarnings) {
                if (w.objectMap.hisOrderInfoRuleModels) {
                    const ids = w.objectMap.hisOrderInfoRuleModels.map(o => o.id);
                    for (const id of ids) {
                        needLoadIds.push(id);
                    }
                }
                if (w.objectMap.hisOrderfillInfoRuleModels) {
                    const where = {
                        patientId: this.patientId,
                        statusArray: { $in: [40, 50] },
                    };
                    /* 此处数组中只有一项满足此条件，不会出现多次请求 */
                    /* eslint-disable-next-line no-await-in-loop */
                    const untakeOrderFills = await api.getOrderFills(where);
                    this.setState({ untakeOrderFills });
                }
            }
        }
        if (needLoadIds.length) {
            const patientId = nextProps.addMedicineRegister.getPatientResult.status === 'fulfilled' && nextProps.addMedicineRegister.getPatientResult.params.patientId;
            nextProps.getDuplicateOrders(patientId, needLoadIds);
        }
    }

    renderPharmacistAudited() {
        const { addMedicineRegister } = this.props;
        const orderDetails = addMedicineRegister.getOrderInfoResult.payload;
        if (orderDetails && !this.audit && !this.update) {
            const { pharmacistAudited, isPay } = orderDetails;
            const { pharmacistUpdate } = pharmacistAudited;
            const label = pharmacistUpdate ? (
                <div>
                    <div className="audit-orders">
                        <span className="title">
                            <span style={{ paddingLeft: '70px' }}>
                                <Tag color="#E74C3C">需补充或重新上传处方信息</Tag>
                            </span>
                        </span>
                    </div>

                </div>
            ) : null;
            const message = (
                <div>
                    <div className="audit-orders">
                        <div className="title">
                            <div className="titleName">
                                订单状态
                            </div>
                            ：
                            <span>
                                已驳回
                            </span>
                        </div>
                        <div className="title" style={{ paddingLeft: '40px' }}>
                            <div className="titleName">
                                审核时间
                            </div>
                            ：
                            <span>
                                {pharmacistAudited.pharmacistAuditedDate}
                            </span>
                        </div>
                        <div className="title" style={{ paddingLeft: '40px' }}>
                            <div className="titleName">
                                审核人
                            </div>
                            ：
                            <span>
                                {pharmacistAudited.pharmacistAuditedName}({pharmacistAudited.pharmacistAuditedCompany})
                            </span>
                        </div>
                    </div>
                    <div className="audit-orders">
                        <div className="title">
                            <div className="titleName" >
                                驳回原因
                            </div>
                            ：
                           {<span style={{ maxWidth: '730px' }} dangerouslySetInnerHTML={{ __html: pharmacistAudited.pharmacistRejected }} ></span>}
                        </div>
                    </div>
                    {label}
                    <div className="audit-orders">
                        <div className="title">
                            <div className="titleName">
                                支付状态
                            </div>
                            ：
                            <span style={{ color: '#1ABB9C' }}>
                                {isPay === 1 ? '已支付' : '未支付'}
                            </span>
                        </div>
                    </div>
                </div>
            );
            return <Alert
                message={message}
                type="error"
            />;
        }
        return null;

    }

    renderGlobalAlerts() {
        const { addMedicineRegister } = this.props;
        const v = addMedicineRegister.verifyResult.payload;
        const { untakeOrderFills, patientFieldValue } = this.state;
        if (v && v.verifyWarnings) {
            const verifyWarnings = [...v.verifyWarnings];
            const sort = {
                unFetching: 1,
                dupOrder: 2,
                default: 3,
            };
            verifyWarnings.sort(
                (a, b) => (sort[a.ruleMark] || sort.default) - (sort[b.ruleMark] || sort.default),
            );
            const dupOrders = addMedicineRegister.duplicateOrders.payload
                && addMedicineRegister.duplicateOrders.payload.list;
            return verifyWarnings.map((w, i) => {
                let { message } = w;
                if (w.objectMap.hisOrderfillInfoRuleModels) {
                    message = (
                        <div>
                            <span
                                style={{
                                    color: 'red',
                                    fontSize: 15,
                                    fontWeight: 'bold',
                                }}
                            >
                                {w.message}
                            </span>
                            {
                                untakeOrderFills && untakeOrderFills.map(order => (
                                    <div key={order.id} className="alert-orders">
                                        <div className="drugRegistrationOrders">
                                            <span className="title">
                                                <span className="titleName">
                                                    包裹编号
                                                </span>
                                                ：
                                                <span>
                                                    {order.orderfillNo}
                                                </span>
                                            </span>
                                            <span className="title">
                                                <span>
                                                    登记日期：
                                                </span>
                                                {moment(order.createDate).format('YYYY-MM-DD HH:mm:ss')}
                                            </span>
                                            <span className="title">
                                                包裹状态：
                                                {OrderStatusLabel[order.status] || null}
                                            </span>
                                            <br />
                                            <span className="titleName">
                                                <span>
                                                    登记人：
                                                </span>
                                                <span>
                                                    {`${order.createByName}（${order.companyName}）`}
                                                </span>
                                            </span>
                                        </div>
                                        <div className="drugRegistrationDrugs">
                                            <span className="titleName">
                                                药品信息：
                                            </span>
                                            {
                                                order.drugs.map(drug => (
                                                    <div key={drug.drugId} className="drugs">
                                                        <span className="drugName">
                                                            {drug.productName
                                                                ? `${drug.commonName}（${drug.productName}）`
                                                                : drug.commonName}
                                                        </span>
                                                        <span>
                                                            {` * ${drug.amount}${drug.packageUnit}`}
                                                        </span>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    );
                }
                if (w.objectMap.hisOrderInfoRuleModels) {
                    message = (
                        <div>
                            <span style={{ color: 'red', fontSize: 15, fontWeight: 'bold' }}>
                                {w.message}
                            </span>
                            {
                                dupOrders && dupOrders.map(order => (
                                    <div key={order.id} className="alert-orders">
                                        <div className="drugRegistrationOrders">
                                            <span className="title">
                                                <span className="titleName">
                                                    <span className="dis">
                                                        编
                                                    </span>
                                                    号
                                                </span>
                                                ：
                                                <span>
                                                    {order.orderNo}
                                                </span>
                                            </span>
                                            <span className="title">
                                                <span>
                                                    登记日期：
                                                </span>
                                                <span>
                                                    {order.orderDate}
                                                </span>
                                            </span>
                                            <span className="title">
                                                <span>
                                                    登记人：
                                                </span>
                                                <span>
                                                    {`${order.createByName}（${order.createCompany}）`}
                                                </span>
                                            </span>
                                        </div>
                                        <div className="drugRegistrationDrugs">
                                            <span className="titleName">
                                                药品信息：
                                            </span>
                                            {
                                                order.drugListMap.map(drug => (
                                                    <div key={drug.id} className="drugs">
                                                        <span className="drugName">
                                                            {drug.productName ? `${drug.commonName}（${drug.productName}）` : drug.commonName}
                                                        </span>
                                                        <span>
                                                            {` * ${drug.amount}${drug.packageUnit}`}
                                                        </span>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>))
                            }
                        </div>
                    );
                }
                return patientFieldValue
                    /* 此数据没有主键 */
                    /* eslint-disable-next-line react/no-array-index-key */
                    ? <Alert key={i} type={VerifyLevelMap[w.level]} message={message} />
                    : null;
            });
        }
        return null;
    }

    handleBeforeUpload = async file => {
        this.setState({ preview: undefined });
        //限制图片 格式、size、分辨率
        const isJPG = file.type === 'image/jpeg';
        const isJPEG = file.type === 'image/jpeg';
        const isGIF = file.type === 'image/gif';
        const isPNG = file.type === 'image/png';
        if (!(isJPG || isJPEG || isGIF || isPNG)) {
            Modal.error({
                title: '只能上传JPG 、JPEG 、GIF、 PNG格式的图片~',
            });
            return false;
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            Modal.error({
                title: '超过2M限制，不允许上传~',
            });
            return false;
        }
        const preview = await getBase64(file);
        this.setState({ preview });
        return true;
    };

    uploadFile = file => {
        const { preview } = this.state;
        const name = file.name;
        const param = {
            data: preview.substr(preview.indexOf(';base64,') + ';base64,'.length),
            suffix: name.substring(name.lastIndexOf('.') + 1, name.length),
            prefixPath: 'orderinfo',
        }
        return param;
    }

    handleChange = ({ file, fileList }) => {
        this.setState({ fileList })
    };

    fileHandleCancel = () => this.setState({ previewVisible: false });

    handlePreview = async file => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        const pic = [{ url: file.url || file.preview, alt: file.url || file.preview }];
        Viewer(pic, {
            navbar: false,
            toolbar: false,
            title: false,
        });
    };


    getMedicationList() {
        const { getThirdPartyOrdersAction, addMedicineRegister } = this.props;
        const patientDetails = addMedicineRegister.getPatientResult.payload;
        getThirdPartyOrdersAction(patientDetails.idCard);
        this.setState({ loading: true });
    }

    selectThiredOrder(thirdOrderId) {
        this.setState({ thirdOrderId });
    }
    renderMedicationList() {
        const { thirdOrderList, thirdOrderId } = this.state;
        const message = thirdOrderList ? thirdOrderList.map((order) => {
            const { drugs } = order;
            return (
                <div className="medication" key={order.orderId}>
                    <div style={{ display: 'flex' }}>
                        <div className="titleName">
                            {order.orderDate}
                        </div>
                        <div style={{ width: '100%' }}>
                            <div className="title">
                                <span>{order.hospitalName}</span>
                                <span style={{ paddingLeft: '30px' }}>{order.doctorName}</span>
                                {
                                    order.orderId === thirdOrderId ?
                                        <span>
                                            <Icon type="check-circle"
                                                size="lg"
                                                theme="filled"
                                                style={{
                                                    fontSize: '21px',
                                                    color: '#169F85',
                                                    marginRight: '16px',
                                                    display: 'unset',
                                                }}
                                            />
                                        </span> :
                                        <span className="useMedication">
                                            <a onClick={() => this.selectThiredOrder(order.orderId)}>
                                                引用
                                        </a>
                                        </span>
                                }
                            </div>
                            <div>
                                <table>
                                    <tbody>
                                        {
                                            drugs.map((drug) => {
                                                return (
                                                    <tr key={drug.id}>
                                                        <td>{drug.productName ? `${drug.commonName}(${drug.productName})` : drug.commonName}</td>
                                                        <td>{drug.preparationUnit}*{drug.packageSize}{drug.minimumUnit}/{drug.packageUnit}</td>
                                                        <td style={{ minWidth: '55px' }}>X {drug.amount}{drug.packageUnit}</td>
                                                    </tr>
                                                );

                                            })
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }) : "";
        return (
            <div style={{ paddingLeft: '107px' }} className="renderMedicationList">
                <div style={{ display: 'flex', marginBottom: '8px' }}>
                    <img style={{ width: '24px' }} src={RxImg} />
                    <a onClick={() => this.getMedicationList()}>
                        <span>引用处方信息</span>
                    </a>
                </div>
                {thirdOrderList && thirdOrderList.length > 0 ?
                    <div>
                        <Alert message={message} type="info" />
                        {thirdOrderId ? <div className="tip">提示：当前已引用处方信息，诊断结果、过敏史、药品信息不可编辑。</div> : null}
                    </div>
                    : null}
            </div>
        )
    }

    customRequest = (fileData) => {
        api.uploadFile(fileData.data).then((res) => {
            fileData.onSuccess(res)
        }, (error) => {
            fileData.onError(error)
        });

    }

    async onValueChange(value, patientInfo) {
        this.setState({
            addressValue: value,
        });
        let { addresses, patientDetails } = this.state;
        if (!patientDetails) {
            patientDetails = patientInfo;
        }
        let defaultReceiver = addresses.find(item => item.state == 1 && item.deliveryType == value);
        const index = addresses.findIndex(item => item.state == 1 && item.deliveryType == value);
        this.selectedReceiver = defaultReceiver;
        let label = defaultReceiver ? `${`${defaultReceiver.name} / `}${`${defaultReceiver.machineNumber} / `}${defaultReceiver.provincesName || defaultReceiver.provinceName || ''}${defaultReceiver.cityName || ''}${defaultReceiver.areaName || ''}${defaultReceiver.street || ''}${defaultReceiver.deliveryType === 2 ? `${defaultReceiver.hospitalName ? `(${defaultReceiver.hospitalName})` : ''}` : ''}` : undefined;
        let memAddress = []
        if (value == 3) { // 绿A会员快递
            memAddress = addresses.filter((item) => item.deliveryType == 3 || item.deliveryType == 1)
        } else if (value == 2) { // 绿A会员自提
            try {
                if (patientDetails.memberType == 2) {
                    const data = {
                        where: JSON.stringify({
                            status: 0,
                            provincesId: patientDetails.address.liveProvinces || '',
                            cityId: patientDetails.address.liveCity || '',
                            // areaId: '',
                            fatchFlag: 1, //是否为取药点 0=否 1=是
                            hospitalSignage: 4, //医院标识 1=常用 2=健康卡虚拟医院 3=绿A虚拟医院 4=绿A自提机构
                        }),
                        // skip:null,
                        // limit: null,
                    }
                    memAddress = await api.getAselfAddress(data)
                } else {
                    memAddress = addresses.filter((item) => item.deliveryType == 2)
                }
            } catch (e) {
                console.error(e.message)
            }
        }
        this.setState({
            addressValue: value,
            nowAddress: memAddress,
            defaultReceiverOption: defaultReceiver ? {
                key: defaultReceiver.id || String(index),
                label,
            } : undefined,
        }, () => { this.validatePrescribingSource() });

    };

    async validatePrescribingSource() {
        const prescribingSource = this.props.form.getFieldValue("prescribingSource");
        this.props.form.setFieldsValue({ prescribingSource: null });
        this.props.form.setFieldsValue({ prescribingSource });
        setTimeout(() => { this.props.form.validateFields(['prescribingSource']) }, 1000);

    }

    async changeInterval(i) {
        const { form } = this.props;
        const { patientDetails } = this.state;
        if (!patientDetails.points) return;
        const medicineKeys = form.getFieldValue('medicineKeys');
        this.orderData = form.getFieldsValue();
        if (medicineKeys && medicineKeys.length) {
            let ary = [];
            let totalPriceCent = 0;
            for (const v of medicineKeys) {
                let ast = {};
                const drug = this.orderData[`medicine_${v}_data`];
                const amount = Number(this.orderData[`medicine_${v}_amount`]) || 0;
                totalPriceCent += drug.priceCent * amount;
                ast.drugId = drug.drugId;
                ast.amount = amount;
                ary.push(ast)
            }
            let interval = i ? Math.min(this.state.patientDetails.points, totalPriceCent) : 0;
            try {
                const data = {
                    pointsDeductionAmount: interval,
                    drugs: JSON.stringify(ary)
                }
                const result = await api.getRefundMoney(data, this.patientInfo.id)
                this.setState({
                    upDateRefundMoney: result,
                })
            } catch (e) {
                console.error(e.message)
            }
            this.setState({ interval: i });
        }
    }


    cancelOrderForAudit = async () => {
        this.setState({ auditLoading: true });
        Modal.confirm({
            title: '确定您已于会员沟通确认并继续撤单？',
            onOk: async () => {
                try {
                    await api.cancelOrder(this.orderId, 'f3457f2ede6411e9aa787cd30ae46efc');
                    message.success('撤单成功');
                    this.setState({ auditLoading: false });
                    this.handleCancel();
                } catch (e) {
                    console.error(e)
                    message.success('撤单失败');
                    this.setState({ auditLoading: false });
                }
            },
            onCancel: () => {
                this.setState({ auditLoading: false });
            },
        });
    }

    handAuditConfirmation = async () => {
        this.setState({ auditLoading: true });
        try {
            await api.handAuditConfirmation(this.orderId);
            message.success('审核成功');
            this.setState({ auditLoading: false });
            this.handleCancel();
        } catch (e) {
            console.error(e)
            message.success('审核失败');
            this.setState({ auditLoading: false });
        }

    }

    payTypeChange = (value) => {
        const { paymentType, hospitalForStore } = this.state;
        let selectedPaymentType = paymentType.find(item => `${item.largeClass}${item.groupId}${item.id}` === value);
        const { agentWelfare, selfWelfare, storeWelfare } = hospitalForStore;
        const { largeClass } = selectedPaymentType;
        let refundType;
        if (largeClass === 1) {
            refundType = agentWelfare;
        }
        if (largeClass === 2) {
            refundType = selfWelfare;
        }
        if (largeClass === 3) {
            refundType = storeWelfare;
        }
        this.setState({ refundType });
    }

    checkPrescribingSource = async (rule, value, callback) => {
        try {
            if (this.orderId) {
                callback();
            }
            const { form, addMedicineRegister } = this.props;
            const { addressValue } = this.state;
            let requiredFile = false;
            if (this.orderId) {
                const orderDetails = addMedicineRegister.getOrderInfoResult.payload;
                if (orderDetails && orderDetails.pharmacistAudited && orderDetails.pharmacistAudited.pharmacistUpdate === 1) {
                    requiredFile = true;
                }
            }
            if (window.STORE_LOGINNAME.split(',').indexOf(this.props.auth.loginName) >= 0) {
                requiredFile = true;
            }
            const warnings = addMedicineRegister.verifyResult.payload;
            if (warnings && warnings.isRequiredFile) {
                requiredFile = true;
            }
            if (this.audit) {
                requiredFile = false;
            }
            if (this.update) {
                requiredFile = true;
            }
            let prescribingSourceRequired = requiredFile || addressValue === 3;
            if (prescribingSourceRequired && !value) {
                callback('不能为空');
            }
            callback();
        } catch (e) {
            console.error('checkPrescribingSource error', e);
            callback();
        }

    }
    render() {
        const { form, addMedicineRegister } = this.props;
        const { getFieldDecorator, getFieldValue } = form;
        let medicineKeys = getFieldValue('medicineKeys');
        let totalPriceCent = 0;
        medicineKeys && medicineKeys.map(v => {
            const medicineRowData = getFieldValue(`medicine_${v}_data`);
            let priceCent = medicineRowData.priceCent ? medicineRowData.priceCent : 0;
            let amount = getFieldValue(`medicine_${v}_amount`) ? Number(getFieldValue(`medicine_${v}_amount`)) : undefined;
            let rowPriceCent = 0;
            if (amount) {
                rowPriceCent = priceCent * amount
                totalPriceCent += rowPriceCent
            }
        })
        const {
            addresses,
            patientDetails,
            patientFieldValue,
            isThirdOrder,
            loading,
            thirdOrderList,
            thirdOrderId,
            addressValue,
            nowAddress,
            paymentType
        } = this.state;
        let { defaultReceiverOption } = this.state;
        if (defaultReceiverOption && addresses && patientDetails && window.STORE_LOGINNAME.split(',').indexOf(this.props.auth.loginName) >= 0) {
            const item = addresses[0];
            const address = `${item.provincesName || item.provinceName || ''}${item.cityName || ''}${item.areaName || ''}${item.street || ''}${item.deliveryType === 2 ? `(${item.hospitalName || ''})` : ''}`;
            defaultReceiverOption =
            {
                key: 0,
                label: `${patientDetails.name} / ${patientDetails.phone || patientDetails.machineNumber} / ${address}`,
            };
        }
        const modalFooter = (
            <Row>
                {
                    this.audit ? (
                        <div>
                            <Button
                                loading={this.state.auditLoading}
                                onClick={this.handAuditConfirmation}
                                type="primary"
                                className="-x-id-submit"
                            >
                                审核通过
                        </Button>
                            <Button
                                className="cancelButton -x-id-cancel"
                                loading={this.state.auditLoading}
                                onClick={this.cancelOrderForAudit}
                            >
                                撤单
                        </Button>
                        </div>
                    ) : (
                            <div>
                                <Button
                                    loading={addMedicineRegister.postFormResult.status === 'pending'
                                        && addMedicineRegister.postFormResult.params.actionType === 'postThenClose'}
                                    onClick={this.handleSubmitAndClose}
                                    type="primary"
                                    className="-x-id-submit"
                                >
                                    保存
                                </Button>
                                <Button onClick={this.handleCancel} className="cancelButton -x-id-cancel">
                                    取消
                                </Button>
                            </div>
                        )
                }

            </Row>
        );
        const options = addressValue && nowAddress && nowAddress.map((item, index) => {
            if (patientDetails && patientDetails.memberType == 2 && this.state.addressValue == 2) {
                const address = `${item.provincesName || item.provinceName || ''}${item.cityName || ''}${item.areaName || ''}${item.street || ''}(${item.name})`;
                return (
                    <Option key={index} className={item.state === 1 || (this.selectedReceiver && this.selectedReceiver.id == item.id) ? 'selected' : ''}>
                        <Row>
                            <Col style={colStyle} span={3}>
                                {patientDetails.name}
                            </Col>
                            <Col style={colStyle} span={4}>
                                {patientDetails.phone || patientDetails.machineNumber || ''}
                            </Col>
                            <Col style={colStyle} span={item.state === 1 || (this.selectedReceiver && this.selectedReceiver.id == item.id) ? 10 : 14}>
                                {address}
                            </Col>
                            <Col span={3}>
                                {item.state === 1 ? (
                                    <span className="default">
                                        默认地址
                                    </span>) : null}
                            </Col>
                        </Row>
                    </Option>
                );
            } else {
                const address = `${item.provincesName || item.provinceName || ''}${item.cityName || ''}${item.areaName || ''}${item.street || ''}${item.deliveryType === 2 ? `${item.hospitalName ? (item.hospitalName) : ''}` : ''}`;
                return (
                    <Option key={index} className={item.state === 1 || (this.selectedReceiver && this.selectedReceiver.id == item.id) ? 'selected' : ''}>
                        <Row>
                            <Col style={colStyle} span={3}>
                                {item.name}
                            </Col>
                            <Col style={colStyle} span={4}>
                                {item.machineNumber}
                            </Col>
                            <Col style={colStyle} span={item.state === 1 || (this.selectedReceiver && this.selectedReceiver.id == item.id) ? 10 : 14}>
                                {address}
                            </Col>
                            <Col span={3}>
                                {item.state === 1 ? (
                                    <span className="default">
                                        默认地址
                                    </span>) : null}
                            </Col>
                        </Row>
                    </Option>
                );
            }
        });
        const paymentTypeOptions = paymentType.map(item => (
            <Option key={`${item.largeClass}${item.groupId}${item.id}`} title={`${item.largeClass}${item.groupId}${item.id}`} value={`${item.largeClass}${item.groupId}${item.id}`}>
                {`${item.largeClassName}-${item.groupName}-${item.name}`}
            </Option>
        ));
        const sourcesOptions = sources.map(ele => (
            <Option key={ele.key} title={ele.label} value={ele.key}>
                {ele.label}
            </Option>
        ));

        const uploadButton = (
            <div>
                <div className="ant-upload-text">点击上传</div>
                <div className="ant-upload-text">（仅限图片）</div>
            </div>
        );
        const warnings = addMedicineRegister.verifyResult.payload;
        let requiredFile = false;
        if (this.orderId) {
            const orderDetails = addMedicineRegister.getOrderInfoResult.payload;
            if (orderDetails && orderDetails.pharmacistAudited && orderDetails.pharmacistAudited.pharmacistUpdate === 1) {
                requiredFile = true;
            }
        }
        if (window.STORE_LOGINNAME.split(',').indexOf(this.props.auth.loginName) >= 0) {
            requiredFile = true;
        }
        if (warnings && warnings.isRequiredFile) {
            requiredFile = true;
        }
        if (this.audit) {
            requiredFile = false;
        }
        if (this.update) {
            requiredFile = true;
        }
        let prescribingSourceRequired = requiredFile || addressValue === 3;
        let prescribingSource = getFieldValue('prescribingSource');
        prescribingSource = prescribingSource ? prescribingSource[0] : undefined;
        let PMH = getFieldValue('PMH');
        PMH = PMH ? PMH[0] : undefined;
        let AMH = getFieldValue('AMH');
        AMH = AMH ? AMH[0] : undefined;
        let FMH = getFieldValue('FMH');
        FMH = FMH ? FMH[0] : undefined;
        let liverDesc = getFieldValue('liverDesc');
        liverDesc = liverDesc ? liverDesc[0] : undefined;
        let renalDesc = getFieldValue('renalDesc');
        renalDesc = renalDesc ? renalDesc[0] : undefined;

        let prescribingSourceList = [
            { id: '3', name: '上传自有处方' },
            { id: '2', name: '申请电子处方' },
        ];
        if (window.STORE_LOGINNAME.split(',').indexOf(this.props.auth.loginName) >= 0) {
            prescribingSourceList = [
                { id: '3', name: '上传自有处方' },
            ];
        }
        return (
            <div>
                <Modal
                    title="登记用药"
                    width={900}
                    visible
                    style={{ backgroundColor: '#f8f8f8' }}
                    onCancel={this.handleCancel}
                    maskClosable={false}
                    footer={modalFooter}
                    className="-x-region-create-order"
                >
                    {this.renderPharmacistAudited()}
                    {this.renderGlobalAlerts()}
                    <Spin spinning={loading} tip="处方信息加载中，请稍后……" >
                        <Form
                            id="addMedicineRegisterForm"
                            style={{ position: 'relative' }}
                        >
                            <Row>
                                <FormItem
                                    label="选择会员"
                                    required
                                    {...formItemLayout}
                                    style={{ marginBottom: patientDetails && (patientDetails.gradeIcon || patientDetails.certification) ? 0 : 24 }}
                                >
                                    <SmartSelectSingleAsync
                                        {...mapPropsToFormItems}
                                        className="-x-id-search"
                                        value={patientFieldValue}
                                        placeholder="输入会员姓名/身份证号/手机号/其他联系方式"
                                        allowClear={this.orderId === undefined}
                                        disabled={this.orderId !== undefined}
                                        showSearch
                                        filterOption={false}
                                        delay
                                        asyncResultId="addMedicineRegister.ChoosePatient"
                                        asyncRequestFuncName="searchPatient"
                                        onChange={this.handlePatientChange}
                                        onSelect={this.handlePatientSelect}
                                        cleanOptionsOnBlur
                                        getPopupContainer={() => document.getElementById('addMedicineRegisterForm')}
                                        asyncMapResultToState={
                                            (data, params) => (params.keyWord ? data : undefined)
                                        }
                                        mapDataToOption={this.mapDataToOption}
                                    />
                                </FormItem>
                            </Row>
                            <div style={{ marginLeft: '12.5%', display: 'flex', flexDirection: 'row', alignItems: 'center', height: patientDetails && (patientDetails.gradeIcon || patientDetails.certification) ? 40 : 0 }}>
                                {!patientDetails ? null : patientDetails.gradeIcon ? <img style={{ width: 32, marginRight: 10 }} src={patientDetails.gradeIcon} /> : null}
                                {!patientDetails ? null : <img style={{ width: 32 }} src={patientDetails && patientDetails.certification ? card : ''} />}
                            </div>
                            <Row>
                                {this.patientId && isThirdOrder && !this.orderId ? this.renderMedicationList() : null}
                            </Row>
                            <Spin spinning={thirdOrderId !== undefined || this.audit === true} wrapperClassName="spin-create-order" >
                                <Row>
                                    <FormItem
                                        label="诊断结果"
                                        labelCol={{ span: 3 }}
                                        wrapperCol={{ span: 21 }}
                                    >
                                        {
                                            getFieldDecorator(
                                                'diseases',
                                                {
                                                    rules: [
                                                        { required: true, message: '不能为空' },
                                                    ],
                                                },
                                            )((
                                                <ViewOrEdit
                                                    editing
                                                    viewComponent={SelectMultipleDiseases.Viewer}
                                                    editRenderer={props => <SelectMultipleDiseases getPopupContainer={() => document.getElementById('addMedicineRegisterForm')} className="-x-id-diseases" {...props} emptyTip="选择其他疾病" />}
                                                />
                                            ))
                                        }
                                    </FormItem>
                                </Row>
                                <Row>
                                    <FormItem
                                        label="过敏史"
                                        labelCol={{ span: 3 }}
                                        wrapperCol={{ span: 21 }}
                                    >
                                        {
                                            getFieldDecorator(
                                                'allergies',
                                                {
                                                    rules: [
                                                        { max: 500, message: '不能多于500个字符' },
                                                    ],
                                                },
                                            )((
                                                <AllergiesField className="-x-id-allergies" />
                                            ))
                                        }
                                    </FormItem>
                                </Row>
                            </Spin>
                            <Row>
                                <AddMedicineToOrder
                                    form={form}
                                    hospitalId={window.STORE_LOGINNAME.split(',').indexOf(this.props.auth.loginName) >= 0 ? window.STORE_HOSPITALID : (this.patientInfo && this.patientInfo.hospitalId ? this.patientInfo.hospitalId : '')}
                                    patientId={this.patientId ? this.patientId : ''}
                                    warnings={addMedicineRegister.verifyResult.payload}
                                    drugPrompt={addMedicineRegister.drugPromptReslut}
                                    putDrugTip={this.putDrugTip}
                                    isEstimatedPickup={this.isEstimatedPickup}
                                    resetVerifyResult={this.props.resetVerifyResult}
                                    orderId={this.orderId}
                                    thirdOrderId={thirdOrderId}
                                    thirdOrderList={thirdOrderList}
                                    interval={this.state.interval}
                                    selfware={patientDetails ? patientDetails.hospital.warehouse.selfWelfare : null}
                                    refundMoney={this.state.upDateRefundMoney}
                                    refundType={this.state.refundType}
                                />
                            </Row>
                            <Row style={{ marginTop: 24 }}>
                                <FormItem
                                    label="处方信息"
                                    required={this.orderId ? requiredFile : prescribingSourceRequired}
                                    {...formItemLayout}
                                >
                                    <div>
                                        {this.orderId ? null :
                                            <Row>
                                                <Col span={8}>
                                                {
                                                getFieldDecorator(
                                                    'prescribingSource',
                                                    {
                                                        rules: [
                                                            // { required: prescribingSourceRequired, message: '不能为空' },
                                                            { validator: this.checkPrescribingSource }
                                                        ],
                                                    },
                                                )((

                                                    <SmartSelectBox
                                                        {...mapPropsToFormItems}
                                                        className="-x-id-sources"
                                                        getPopupContainer={() => document.getElementById('addMedicineRegisterForm')}
                                                        style={{ width: 200 }}
                                                        cancelledable
                                                        buttonOptions={prescribingSourceList}
                                                    />

                                                ))
                                                }
                                                </Col>
                                                <Col span={16} style={{color: '#888'}}>
                                                    {window.STORE_LOGINNAME.split(',').indexOf(this.props.auth.loginName) >= 0 ?
                                                    '' : '若会员无法提供自有处方，请按问题询问，以申请开具电子处方'
                                                    }</Col>
                                            </Row>
                                        }
                                        {
                                            this.orderId || prescribingSource === '3' ? <Row >
                                                <FormItem
                                                    {...formItemLayout}
                                                    required={this.orderId ? requiredFile : true}
                                                    extra={(this.orderId ? requiredFile : true) && !(this.state.fileList && this.state.fileList.length > 0) ? '不能为空' : undefined}
                                                >
                                                    <div className="clearfix" style={{ display: 'flex' }} >
                                                        <Upload
                                                            listType="picture-card"
                                                            accept="image/png, image/jpeg"
                                                            fileList={this.state.fileList}
                                                            onPreview={this.handlePreview}
                                                            onChange={this.handleChange}
                                                            beforeUpload={this.handleBeforeUpload}
                                                            customRequest={this.customRequest}
                                                            disabled={!this.patientId}
                                                            onRemove={this.audit ? false : this.handleRemove}
                                                            data={this.uploadFile}
                                                            disabled={this.audit}
                                                        >
                                                            {(this.audit ? true : this.state.fileList.length >= 5) ? null : uploadButton}
                                                        </Upload>
                                                        {this.audit ? null : <div style={{ marginTop: '75px' }}>（上限5张）</div>}
                                                    </div>
                                                </FormItem>
                                            </Row> : null
                                        }
                                        {
                                            prescribingSource === '2' ? <Row style={{ marginTop: 24 }}>
                                                <div>
                                                    <Form.Item label="过往病史" required {...formItemLayout}>
                                                        <div>
                                                            {getFieldDecorator(
                                                                'PMH',
                                                                { rules: [{ required: true, message: '不能为空' },], },
                                                            )((
                                                                <SmartSelectBox
                                                                    {...mapPropsToFormItems}
                                                                    className="-x-id-sources"
                                                                    getPopupContainer={() => document.getElementById('addMedicineRegisterForm')}
                                                                    style={{ width: 200 }}
                                                                    buttonOptions={
                                                                        [
                                                                            { id: '0', name: '否' },
                                                                            { id: '1', name: '是' },
                                                                        ]
                                                                    }
                                                                />
                                                            ))}
                                                            {PMH !== '1' ? null :
                                                                <Form.Item label="" required {...formItemLayout}>
                                                                    {getFieldDecorator(
                                                                        'PMHText',
                                                                        {
                                                                            rules: [
                                                                                { required: true, message: '不能为空' },
                                                                                { max: 200, message: '不能多于200个字符' },
                                                                            ],
                                                                        },
                                                                    )((
                                                                        <AllergiesField className="-x-id-allergies" maxLength={200} />
                                                                    ))}
                                                                </Form.Item>
                                                            }
                                                        </div>
                                                    </Form.Item>
                                                    <Form.Item label="过敏史" required {...formItemLayout}>
                                                        <div>
                                                            {getFieldDecorator(
                                                                'AMH',
                                                                { rules: [{ required: true, message: '不能为空' },], },
                                                            )((
                                                                <SmartSelectBox
                                                                    {...mapPropsToFormItems}
                                                                    className="-x-id-sources"
                                                                    getPopupContainer={() => document.getElementById('addMedicineRegisterForm')}
                                                                    style={{ width: 200 }}
                                                                    buttonOptions={
                                                                        [
                                                                            { id: '0', name: '否' },
                                                                            { id: '1', name: '是' },
                                                                        ]
                                                                    }
                                                                />
                                                            ))}
                                                            {AMH !== '1' ? null :
                                                                <Form.Item label="" required {...formItemLayout}>
                                                                    {getFieldDecorator(
                                                                        'AMHText',
                                                                        {
                                                                            rules: [
                                                                                { required: true, message: '不能为空' },
                                                                                { max: 200, message: '不能多于200个字符' },
                                                                            ],
                                                                        },
                                                                    )((
                                                                        <AllergiesField className="-x-id-allergies" maxLength={200} />
                                                                    ))}
                                                                </Form.Item>
                                                            }
                                                        </div>
                                                    </Form.Item>
                                                    <Form.Item label="家族病史" required {...formItemLayout}>
                                                        <div>
                                                            {getFieldDecorator(
                                                                'FMH',
                                                                { rules: [{ required: true, message: '不能为空' },], },
                                                            )((
                                                                <SmartSelectBox
                                                                    {...mapPropsToFormItems}
                                                                    className="-x-id-sources"
                                                                    getPopupContainer={() => document.getElementById('addMedicineRegisterForm')}
                                                                    style={{ width: 200 }}
                                                                    buttonOptions={
                                                                        [
                                                                            { id: '0', name: '否' },
                                                                            { id: '1', name: '是' },
                                                                        ]
                                                                    }
                                                                />
                                                            ))}

                                                            {FMH !== '1' ? null :
                                                                <Form.Item label="" required {...formItemLayout}>
                                                                    {getFieldDecorator(
                                                                        'FMHText',
                                                                        {
                                                                            rules: [
                                                                                { required: true, message: '不能为空' },
                                                                                { max: 200, message: '不能多于200个字符' },
                                                                            ],
                                                                        },
                                                                    )((
                                                                        <AllergiesField className="-x-id-allergies" maxLength={200} />
                                                                    ))}
                                                                </Form.Item>}
                                                        </div>
                                                    </Form.Item>
                                                    <Form.Item label="肝功能异常" required {...formItemLayout}>
                                                        <div>
                                                            {getFieldDecorator(
                                                                'liverDesc',
                                                                { rules: [{ required: true, message: '不能为空' },], },
                                                            )((
                                                                <SmartSelectBox
                                                                    {...mapPropsToFormItems}
                                                                    className="-x-id-sources"
                                                                    getPopupContainer={() => document.getElementById('addMedicineRegisterForm')}
                                                                    style={{ width: 200 }}
                                                                    buttonOptions={
                                                                        [
                                                                            { id: '0', name: '否' },
                                                                            { id: '1', name: '是' },
                                                                        ]
                                                                    }
                                                                />
                                                            ))}
                                                            {liverDesc !== '1' ? null :
                                                                <Form.Item label="" required {...formItemLayout}>
                                                                    {getFieldDecorator(
                                                                        'liverDescText',
                                                                        {
                                                                            rules: [
                                                                                { required: true, message: '不能为空' },
                                                                                { max: 200, message: '不能多于200个字符' },
                                                                            ],
                                                                        },
                                                                    )((
                                                                        <AllergiesField className="-x-id-allergies" maxLength={200} />
                                                                    ))}
                                                                </Form.Item>
                                                            }
                                                        </div>
                                                    </Form.Item>
                                                    <Form.Item label="肾功能异常" required {...formItemLayout}>
                                                        <div>
                                                            {getFieldDecorator(
                                                                'renalDesc',
                                                                { rules: [{ required: true, message: '不能为空' },], },
                                                            )((
                                                                <SmartSelectBox
                                                                    {...mapPropsToFormItems}
                                                                    className="-x-id-sources"
                                                                    getPopupContainer={() => document.getElementById('addMedicineRegisterForm')}
                                                                    style={{ width: 200 }}
                                                                    buttonOptions={
                                                                        [
                                                                            { id: '0', name: '否' },
                                                                            { id: '1', name: '是' },
                                                                        ]
                                                                    }
                                                                />
                                                            ))}
                                                            {renalDesc !== '1' ? null :
                                                                <Form.Item label="" required {...formItemLayout}>
                                                                    {getFieldDecorator(
                                                                        'renalDescText',
                                                                        {
                                                                            rules: [
                                                                                { required: true, message: '不能为空' },
                                                                                { max: 200, message: '不能多于200个字符' },
                                                                            ],
                                                                        },
                                                                    )((
                                                                        <AllergiesField className="-x-id-allergies" maxLength={200} />
                                                                    ))}
                                                                </Form.Item>
                                                            }
                                                        </div>
                                                    </Form.Item>
                                                </div>
                                            </Row> : null
                                        }
                                    </div>
                                </FormItem>
                            </Row>

                            {
                                this.orderId ? null : (
                                    <div>
                                        <Row>
                                            <FormItem
                                                label="收件信息"
                                                labelCol={{ span: 3 }}
                                                wrapperCol={{ span: 21 }}
                                                required
                                            >
                                                {patientDetails && window.STORE_LOGINNAME.split(',').indexOf(this.props.auth.loginName) < 0
                                                    ?  getFieldDecorator(
                                                        'sourceType',
                                                        {
                                                            rules: [
                                                                // { required: true, message: '不能为空' },
                                                            ],
                                                        },
                                                    )(<Radio.Group onChange={(e) => this.onValueChange(e.target.value)} value={this.state.addressValue} style={{ marginBottom: 10 }}>
                                                        {patientDetails && patientDetails.hospital && patientDetails.hospital.warehouse.selfPickUp == 1 ? <Radio value={2}>自提</Radio> : null}
                                                        {(patientDetails && patientDetails.hospital && patientDetails.hospital.warehouse.homeDelivery != 1) || (window.STORE_LOGINNAME.split(',').indexOf(this.props.auth.loginName) >= 0) ? null : <Radio value={3}>快递</Radio>}
                                                        {this.state.addressValue == 3 ? <span>配送费￥{this.state.nowfreight ? centToYuan(this.state.nowfreight, 2) : 0.00}</span> : null}
                                                    </Radio.Group> ): null}
                                                <Select
                                                    {...mapPropsToFormItems}
                                                    className="-x-id-receiver"
                                                    value={defaultReceiverOption}
                                                    placeholder="请选择收件信息"
                                                    labelInValue
                                                    defaultActiveFirstOption={false}
                                                    onSelect={this.handleReceiver}
                                                    getPopupContainer={() => document.getElementById('addMedicineRegisterForm')}
                                                    disabled={window.STORE_LOGINNAME.split(',').indexOf(this.props.auth.loginName) >= 0}
                                                >
                                                    {options}
                                                </Select>
                                            </FormItem>
                                        </Row>
                                        <Row>
                                            <FormItem
                                                label="收件时间"
                                                {...formItemLayout}
                                            >
                                                {
                                                    getFieldDecorator(
                                                        'time',
                                                        {
                                                            validateTrigger: ['onChange'],
                                                            rules: [
                                                                { required: true, message: '不能为空' },
                                                            ],
                                                        },
                                                    )(<DatePicker
                                                        className="-x-id-receive_time"
                                                        placeholder="请选择收件时间"
                                                        getCalendarContainer={() => document.getElementById('addMedicineRegisterForm')}
                                                        showToday={false}
                                                        disabledDate={this.notAllowBeforeToday}
                                                        allowClear={false}
                                                        style={{ color: '#2a3f54' }}
                                                        onChange={this.onChangeDate}
                                                        disabled={window.STORE_LOGINNAME.split(',').indexOf(this.props.auth.loginName) >= 0}
                                                    />)
                                                }
                                            </FormItem>
                                        </Row>
                                        {(patientDetails && patientDetails.usePoints) && (<Row>
                                            <FormItem
                                                label="积分抵扣"
                                                {...formItemLayout}
                                            >
                                                {
                                                    getFieldDecorator(
                                                        'intergral',
                                                    )(
                                                        <div style={{ display: 'flex' }}>
                                                            <Switch onClick={(i) => this.changeInterval(i)} disabled={window.STORE_LOGINNAME.split(',').indexOf(this.props.auth.loginName) >= 0 || patientDetails.points == 0} checked={this.state.interval} />
                                                            {this.state.interval ? <div style={{ marginLeft: 10 }}>
                                                                <p>本次抵扣：<span style={{ color: '#C8161D', marginRight: 5 }}>{Math.min(patientDetails.points, totalPriceCent + (this.state.addressValue == 3 ? this.state.nowfreight || 0 : 0))}</span>(折合金额：<span style={{ color: '#C8161D' }}>¥{centToYuan(Math.min(patientDetails.points, totalPriceCent + (this.state.addressValue == 3 ? this.state.nowfreight || 0 : 0)) || 0, 2)}</span>)</p>
                                                                <p style={{ color: '#B2B2B2' }}>抵扣前可用：{patientDetails.points}，抵扣后预计剩余：{patientDetails.points <= totalPriceCent + (this.state.addressValue == 3 ? this.state.nowfreight || 0 : 0) ? 0 : patientDetails.points - totalPriceCent - (this.state.addressValue == 3 ? this.state.nowfreight || 0 : 0)}</p>
                                                                <p style={{ color: '#B2B2B2' }}>使用积分抵扣后，该订单仅可万户自收。</p>
                                                            </div> : null}
                                                        </div>)
                                                }
                                            </FormItem>
                                        </Row>)
                                        }
                                        {(patientDetails
                                            && patientDetails.isEditSources
                                            && patientDetails.isEditSources === 1) && (
                                                <Row>
                                                    <FormItem
                                                        label="来源渠道"
                                                        {...formItemLayout}
                                                    >
                                                        {
                                                            getFieldDecorator(
                                                                'sources',
                                                                {
                                                                    rules: [
                                                                        { required: true, message: '不能为空' },
                                                                    ],
                                                                },
                                                            )((
                                                                <Select
                                                                    {...mapPropsToFormItems}
                                                                    className="-x-id-sources"
                                                                    placeholder="请选择来源渠道"
                                                                    defaultActiveFirstOption={false}
                                                                    getPopupContainer={() => document.getElementById('addMedicineRegisterForm')}
                                                                    style={{ width: 200 }}
                                                                >
                                                                    {sourcesOptions}
                                                                </Select>
                                                            ))
                                                        }
                                                    </FormItem>
                                                </Row>
                                            )
                                        }
                                        {
                                            window.STORE_LOGINNAME.split(',').indexOf(this.props.auth.loginName) >= 0 ? (
                                                <Row style={{ marginTop: 24 }}>
                                                    <FormItem
                                                        label="支付方式"
                                                        {...formItemLayout}
                                                    >
                                                        {
                                                            getFieldDecorator(
                                                                'payType',
                                                                {
                                                                    rules: [
                                                                        { required: true, message: '不能为空' },
                                                                    ],
                                                                },
                                                            )((
                                                                <Select
                                                                    {...mapPropsToFormItems}
                                                                    className="-x-id-sources"
                                                                    placeholder="请选择支付方式"
                                                                    defaultActiveFirstOption={false}
                                                                    getPopupContainer={() => document.getElementById('addMedicineRegisterForm')}
                                                                    style={{ width: 200 }}
                                                                    onChange={this.payTypeChange}
                                                                >
                                                                    {paymentTypeOptions}
                                                                </Select>
                                                            ))
                                                        }
                                                    </FormItem>
                                                </Row>
                                            ) : null
                                        }
                                    </div>
                                )
                            }

                        </Form>
                    </Spin>
                </Modal>
            </div>
        );
    }
}

const WrapperOfCreateOrder = Form.create({
    mapPropsToFields(props) {
        const { addMedicineRegister } = props;
        return { ...addMedicineRegister.formData };
    },
    onFieldsChange(props, fields) {
        const { renewFormDataAction } = props;
        renewFormDataAction(fields);
    },
})(CreateOrder);

function select(state) {
    return {
        auth: state.auth.payload,
        addMedicineRegister: state.addMedicineRegister,
    };
}

function mapDispachToProps(dispatch) {
    return bindActionCreators({
        putDrugTipAction,
        getDrugPromptAction,
        setOrderResult,
        getHistoricalDrugsAction,
        renewFormDataAction,
        postOrderAction,
        postOrderForStoreAction,
        getPatientAction,
        getOrderInfoAction,
        verify,
        getDuplicateOrders,
        resetVerifyResult,
        resetStateAction,
        getRegularMedicationAction,
        getThirdPartyOrdersAction,
    }, dispatch);
}

export default connectRouter(connect(select, mapDispachToProps)(WrapperOfCreateOrder));
