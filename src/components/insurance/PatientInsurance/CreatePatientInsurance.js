import React, { Component } from 'react'
import { Input, Button, Row, Col, Modal, Form, Upload, Checkbox, InputNumber, Spin,Select } from 'antd';
import message from '@wanhu/antd-legacy/lib/message';
import AsyncEvent from '../../common/AsyncEvent';
import { connect } from '../../../states/insurance/createPatientInsurance';
import Title from '../../common/Title';
import { SmartSelectSingleAsync } from '../../common/SmartSelectSingle';
import { connectModalHelper } from '../../../mixins/modal';
import SmartSelectBox from '../../common/SmartSelectBox';
import api from '../../../api/api';
import IDValidator from '../../../helpers/checkIdCard';
import setTimeout from '../../../helpers/timeout';
import PatientcertIficationImg from '../../../images/patientcertIfication.png';
import Viewer from '../../toolcase/Viewer';
import {debounce,cloneDeep} from 'lodash';
import HasPermission, { testPermission } from '../../common/HasPermission';
const { log } = console;
const { Option } = Select;
const formItemStyle = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 }
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

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function getAgeByBirthday(dateString) {
    const today = new Date();
    const birthDate = new Date(dateString);
    const age = today.getFullYear() - birthDate.getFullYear();
    return age;
}

function IdCardCheck(UUserCard) {
    //获取年龄
    var myDate = new Date();
    var month = myDate.getMonth() + 1;
    var day = myDate.getDate();
    var age = myDate.getFullYear() - UUserCard.substring(6, 10) - 1;
    if (UUserCard.substring(10, 12) < month || UUserCard.substring(10, 12) == month && UUserCard.substring(12, 14) <= day) {
        age++;
    } else if(UUserCard.substring(10, 12) == month && UUserCard.substring(12, 14) == day+1){
        age++
    }
    return age
}

class CreatPatientInsuranceOrder extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isSubmiting: false,
            diseaseList: [],
            loading: true,
            isEdit: false,
            isChecked: false,
            povertyPicList: [],
            authorizationPicList: [],
            insurancePackageProList: [],
            insurancePackagePro: null,
            insuranceAccountInfo: null,
            isProhibit: false,
            povertyValidate: null,
            payPrice: null,
            isgeting: false,
            payWay: ['1'],
            location_href: 1,
            q_list: {},
            ischange: 1,
            iscomplete: false,
            releation_ship_list: [],
            channelCode:'',//渠道码
            loading:false,
            channelCodeData:[],
            channelisCodeDis:true,
        }
    }

    async componentDidMount() {
        this.initList()
        //检查渠道修改权限是否允许
        if(testPermission('insurance.edit.channelcode')){
            this.setState({
                channelisCodeDis:false
            })
        }
    }

    async initList() {
        const selectedInsurance = this.props.getSelectedInsurance && this.props.getSelectedInsurance.status && this.props.getSelectedInsurance.status.selectedInsurance;
        const selectedInsuranceId = this.props.getSelectedInsuranceId && this.props.getSelectedInsuranceId.status && this.props.getSelectedInsuranceId.status.insuranceSelectedId;
        const { form, getInsuracePackageAction, getInsuracePackageResult } = this.props;
        getInsuracePackageAction();
        if(selectedInsuranceId){
            this.props.form.setFieldsValue({ insuranceProductId: selectedInsuranceId });
            this.setState({
                isSubmiting: false,
                selectedInsuranceId,
            })
        }
        //获取当前用户的渠道码
        let user=JSON.parse(window.localStorage.getItem('userInfo'))
        let data = await api.getChannelCode({});

        const data2 = data.map(el => ({
            text: `${el.name}(${el.channelCode})-${el.companyName}`,
            value:`${el.channelCode}`,
        }));
        //设置默认
        const moren = data.filter(item=>item.userId==user.user)
        this.setState({
            channelCode:moren[0].channelCode,
            channelCodeData:[...data2]
        })
    }

    async init(patientId) {
        const { getPatientAction,getInsuranceSubmitData } = this.props;
        try {
            getPatientAction(patientId);
        } catch (e) {
            console.error(e);
            message.error(e.message);
        }
        try {
            //查询会员账户
            const insuranceAccountInfo = await api.insuranceAccountInfo(patientId);
            this.setState({ insuranceAccountInfo });
        } catch (e) {
            console.error('catched error--查询会员账户:', e);
        }
        this.setState({healthInquiryResults: null, healthInquiryValidate: null, diseaseList: []});
    }

    async componentWillReceiveProps(nextProps) {
        const thisPatientResultStatus = this.props.getPatientResult.status;
        const nextPatientResultStatus = nextProps.getPatientResult.status;
        if (nextPatientResultStatus && thisPatientResultStatus && thisPatientResultStatus.status !== nextPatientResultStatus.status
            && nextPatientResultStatus.status === 'fulfilled') {
            const { setFieldsValue, validateFields } = nextProps.form;
            const patientDetails = nextPatientResultStatus.payload;
            let isSuc = true;
            if(!patientDetails.certification){
                isSuc = await this.checkId(patientDetails, this.patientId)
            }
            if(!isSuc){
                message.error('实名认证失败，请确认信息后重新维护该会员信息');
                this.setState({
                    patientFieldValue: undefined,
                    patientDetails: undefined,
                    selPatientRelValue: undefined,
                    selPatientRelDetails: undefined,
                    isgeting: false
                })
                return;
            }
            if(!patientDetails.phone){
                message.error('手机号不存在，请重新维护该会员信息');
                this.setState({
                    patientFieldValue: undefined,
                    patientDetails: undefined,
                    selPatientRelValue: undefined,
                    selPatientRelDetails: undefined,
                    isgeting: false
                })
                return;
            }
            const { selectedInfo } = this.state;
            let new_cityId = null;
            let new_provinceId = null;
            // if(patientDetails && patientDetails.memberType == 1){ // 保障
                new_cityId = patientDetails.hospital && patientDetails.hospital.cityId || null;
                new_provinceId = patientDetails.hospital && patientDetails.hospital.provinceId || null
            /* }else{ // 绿a
                new_cityId = patientDetails.address.liveCity;
                new_provinceId = patientDetails.address.liveProvinces
            } */
            if(selectedInfo && selectedInfo.areas && selectedInfo.areas.length && !selectedInfo.areas.find(item => item.cityId ? item.cityId == new_cityId : item.provincesId ? item.provincesId == new_provinceId : null)){
                message.error('购买人所在城市与服务包服务区域不符')
                this.setState({
                    patientFieldValue: undefined,
                    patientDetails: undefined,
                    selPatientRelValue: undefined,
                    selPatientRelDetails: undefined,
                    isgeting: false
                })
                return;
            }
            const age = patientDetails.idCard ? `/${IdCardCheck(patientDetails.idCard)}岁` : '';
            const label = `${patientDetails.name} (${patientDetails.sex ? '男' : '女'}${age}) ${patientDetails.phone || ''} ${patientDetails.machineNumber || ''} ${patientDetails.address.liveStreet || ''} ${patientDetails.hospital.name || ''}`;
            const patientFieldValue = {
                key: this.patientId,
                label,
            };
            this.setState({ patientFieldValue, patientDetails, isgeting: false });
            /* setFieldsValue({
                patientName: patientDetails.name,
                idCard: patientDetails.idCard,
            }); */
            if (patientDetails.certification) {
                this.getInsuracePackage();
            } else {
                validateFields(["patientName", "idCard"]);
            }
        }

        const nextInsurancePackageResultStatus = nextProps.getInsuracePackageResult.status;
        if (nextInsurancePackageResultStatus && nextInsurancePackageResultStatus.status === 'fulfilled') {
            const insuranceIndexPackageList = nextInsurancePackageResultStatus.payload;
            this.setState({
                insuranceIndexPackageList,
                insuranceIndexPackageList2:cloneDeep(insuranceIndexPackageList),
                loading: false
            });
        }

        const thisSelPatientResultStatus = this.props.getRelPatient.status;
        const nextSelPatientResultStatus = nextProps.getRelPatient.status;
        if (nextSelPatientResultStatus && thisSelPatientResultStatus && thisSelPatientResultStatus.status !== nextSelPatientResultStatus.status
            && nextSelPatientResultStatus.status === 'fulfilled') {
            const patientDetails = nextSelPatientResultStatus.payload;
            let isSuc = true;
            if(!patientDetails.certification){
                isSuc = await this.checkId(patientDetails, this.relPatientId)
            }
            if(!isSuc){
                message.error('服务对象实名认证失败，请确认信息后重新维护该会员信息');
                this.setState({
                    selPatientRelValue: undefined,
                    selPatientRelDetails: undefined,
                    isgeting: false
                })
                return;
            }
            if(!patientDetails.phone){
                message.error('手机号不存在，请重新维护该会员信息');
                this.setState({
                    selPatientRelValue: undefined,
                    selPatientRelDetails: undefined,
                    isgeting: false
                })
                return;
            }
            const age = patientDetails.birthday ? `/${IdCardCheck(patientDetails.idCard)}岁` : '';
            const t_age = IdCardCheck(patientDetails.idCard)
            if(t_age - this.state.insuranceSelectedOrder.ageRange[0] < 0 || t_age - this.state.insuranceSelectedOrder.ageRange[1] > 0){
                message.error('服务对象年龄与服务包限定范围不符，不可购买');
                this.setState({
                    selPatientRelValue: undefined,
                    selPatientRelDetails: undefined,
                    isgeting: false
                })
                return;
            }
            const label = `${patientDetails.name} (${patientDetails.sex ? '男' : '女'}${age}) ${patientDetails.phone || ''} ${patientDetails.machineNumber || ''} ${patientDetails.address.liveStreet || ''} ${patientDetails.hospital.name || ''}`;
            const selPatientRelValue = {
                key: nextSelPatientResultStatus.params.patientId,
                label,
            };
            this.setState({ selPatientRelValue, selPatientRelDetails: patientDetails, isgeting: false });
        }

    }

    async checkId(data, id) {
        await this.setPromise({
            isgeting: true
        })
        try{
            await api.checkPatientIdCard(id, data.name, data.idCard)
            this.setState({
                isgeting: false
            })
            return true;
        }catch (e) {
            return false
        }
    }

    setPromise(data) {
        return new Promise((resolve, reject) =>{
            this.setState(data, resolve)
        })
    }

    async initData(data) {
        const { form, getPatientAction } = this.props;
        const { setFieldsValue } = form;
        const patientList_1 = data.f_patient ? getPatientAction(data.f_patient) : null;
        this.patientId = data.f_patient ? data.f_patient : ''
        const patientList_2 = data.s_patient ? getPatientAction(data.s_patient) : null;
        let hisCusterList = [];
        if(data.f_patient){
            hisCusterList = await api.getHistoryPatientInfo(data.f_patient);
        }
        const selectedInsurance = this.props.getSelectedInsurance && this.props.getSelectedInsurance.status && this.props.getSelectedInsurance.status.selectedInsurance;
        const insurancePackagePro = selectedInsurance.insurancePackagePros.find(item => item.id == data.insurancePackageProsId)
        this.payWayOnChange(null, insurancePackagePro)
        this.setState({
            patientFieldValue: data.patientFieldValue,
            selPatientReleation: data.selPatientReleation,
            selPatientRelValue: data.selPatientRelValue,
            authorizationPicList: data.authorizationPicList,
            choseInsurancePatient: data.choseInsurancePatient,
            guarantee: data.guarantee,
            poverty: data.poverty,
            insurancePackageProsId: data.insurancePackageProsId,
            payWay: data.payWay,
            hisCusterList,
            insurancePackageProList:selectedInsurance.insurancePackagePros,
            insurancePackagePro,
            isCash: data.isCash,
            isPoint: data.isPoint,
            isInsuranceAccount: data.isInsuranceAccount,
            patientDetails: data.f_patient ? patientList_1 : '',
            selPatientRelDetails: data.s_patient ? patientList_2 : '',
            payPoint: data.payPoint,
            payInsuranceAccount: data.payInsuranceAccount,
            payCash: data.payCash,
            payPrice: data.payPrice,
            insuranceSelectedOrder: selectedInsurance,
            buyCode: data.buyCode,
            subCode: data.subCode,
        })
    }

    checkName = async (rule, value, callback) => {
        if (!value) {
            callback();
            return;
        }
        //没有选择患者
        if (!this.patientId) {
            callback();
            return;
        }
        const data = this.props.getPatientResult.status.payload;
        if (data && data.certification) {
            callback();
            return;
        }
        callback();
    }

    checkIdCard = async (rule, value, callback) => {
        if (!value) {
            callback();
            return;
        }
        //没有选择患者
        if (!this.patientId) {
            callback();
            return;
        }
        const data = this.props.getPatientResult.status.payload;
        if (data && data.certification) {
            callback();
            return;
        }
        const { getFieldValue } = this.props.form;
        const validator = IDValidator;
        const valueStr = String(value);
        if (!data) {
            if (validator.isValid(valueStr)) {

            } else {
                callback('请输入正确的身份证号');
            }
            callback();
        } else {
            if (validator.isValid(valueStr)) {

                callback();
            } else if (data.signStatus !== 0) {
                callback('请输入正确的身份证号');
            }
        }
        this.getInsuracePackage();
        callback();
    }

    checkPovertyPicList = async (rule, value, callback) => {
        const { povertyPicList } = this.state;
        if (!povertyPicList || povertyPicList.length <= 0) {
            callback('不能为空');
            return;
        }
        callback();
    }

    checkAuthorizationPicList = async (rule, value, callback) => {
        const { authorizationPicList } = this.state;
        if (!authorizationPicList || authorizationPicList.length <= 0) {
            callback('不能为空');
            return;
        }
        callback();
    }

    payWayOnChange = (v, pro) => {
        //计算会员服务费
        const { patientDetails } = this.state;
        const insurancePackagePro = pro || this.state.insurancePackagePro;
        const { form } = this.props;
        const { getFieldValue } = form;
        const payWay = v || this.state.payWay;
        let totalPrice = insurancePackagePro ? insurancePackagePro.salesPrice : 0;
        if (patientDetails && patientDetails.gradeId && insurancePackagePro && insurancePackagePro.memeberGradePrices && insurancePackagePro.memeberGradePrices[patientDetails.gradeId] !== undefined) {
            const { memeberGradePrices } = insurancePackagePro;
            totalPrice = memeberGradePrices[patientDetails.gradeId] >= 0 ? memeberGradePrices[patientDetails.gradeId] : payPrice;
        }
        this.setState({ totalPrice });
        let payPrice = totalPrice;
        if (payWay && payWay.length > 0 && payWay[0] === '2') {
            payPrice = (Math.ceil(totalPrice / 100 / 12) * 100).toFixed(0);
            this.setState({ payPrice, isPoint: [1], isInsuranceAccount: [1] }, () => {
                this.countOnchange([1], 'isPoint');
                this.countOnchange([1], 'isInsuranceAccount');
            });
        } else {
            this.setState({ payPrice: totalPrice }, () => { this.countOnchange() });
        }
    }

    countOnchange = (v, key) => {
        const { patientDetails } = this.state;
        if (!patientDetails) {
            return;
        }
        if(key === 'isPoint'){
            this.setState({
                isPoint: v
            })
        }else if(key === 'isInsuranceAccount'){
            this.setState({
                isInsuranceAccount: v
            })
        }else if(key === 'isCash'){
            this.setState({
                isCash: v
            })
        }
        const { form } = this.props;
        const { getFieldValue } = form;
        const { insuranceAccountInfo, payPrice } = this.state;
        let needPayPrice = payPrice;
        let payPoint = 0;
        let payInsuranceAccount = 0;
        let payCash = 0;
        const isPoint = key === 'isPoint' ? v : this.state.isPoint;
        if (isPoint && isPoint.length > 0 && isPoint[0] === 1) {
            payPoint = (patientDetails.points || 0) >= needPayPrice ? needPayPrice : (patientDetails.points || 0);
            needPayPrice = needPayPrice - payPoint;
        }
        const isInsuranceAccount = key === 'isInsuranceAccount' ? v : this.state.isInsuranceAccount;
        if (isInsuranceAccount && isInsuranceAccount.length > 0 && isInsuranceAccount[0] === 1) {
            const balance = insuranceAccountInfo ? insuranceAccountInfo.balance || 0 : 0;
            payInsuranceAccount = balance >= needPayPrice ? needPayPrice : balance;
            needPayPrice = needPayPrice - payInsuranceAccount;
        }
        const isCash = key === 'isCash' ? v : this.state.isCash;
        if (isCash && isCash.length > 0 && isCash[0] === 1) {
            payCash = needPayPrice;
        }
        this.setState({ payPoint, payInsuranceAccount, payCash });
    }

    hideGroupModal = () => {
        this.reset();
        this.restForm()
        this.props.closeModal();
    }

    onCancel = () => {
        this.hideGroupModal();
    }

    finishCreatePatientInsuranceOrder = () => {
        const { patientDetails } = this.state;
        const { setPatientInsuranceResult } = this.props;
        setPatientInsuranceResult(patientDetails);
        this.hideGroupModal();
        this.props.openModal('patientInsuranceResult');
    }

    restForm() {
        const {setInsuraceSelected,setSelectedInsuranceId,setInsuranceSubmitData,setToNextData,saveDiseaseInfo,savePutData} = this.props;
        setInsuraceSelected(null)
        setSelectedInsuranceId(null)
        setInsuranceSubmitData(null)
        setToNextData(null)
        saveDiseaseInfo(null)
        savePutData(null)
    }

    mapDataToOption = (data) => {
        this.patientOptionData = data;
        if (!data.list) return null;
        const options = data.list.map((row) => {
            const age = row.birthday ? `/${IdCardCheck(row.idCard)}岁` : '';
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
                            <img style={{ width: 32 }} src={row.isCertification ? PatientcertIficationImg : ''} />
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

    handlePatientChange = (value) => {
        if (!value) {
            this.reset();
        }
    }

    handlePatientRelChange = (value) => {

    }

    reset() {
        const { form } = this.props;
        form.resetFields();
        this.setState({
            povertyPicList: [],
            authorizationPicList: [],
            insurancePackagePro: null,
            patientDetails: null,
        });
    }

    handlePatientSelect = async (value) => {
        this.reset();
        const optionData = this.patientOptionData && this.patientOptionData.list;
        if (!optionData) return;
        await this.setPromise({isgeting: true,patientFieldValue: undefined,patientDetails: undefined,selPatientRelValue: undefined,selPatientRelDetails: undefined,})
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
            const hisCusterList = await api.getHistoryPatientInfo(optionData[index].id)
            this.setState({
                hisCusterList,
            })
            const selectedInsurance = this.props.getSelectedInsurance && this.props.getSelectedInsurance.status && this.props.getSelectedInsurance.status.selectedInsurance
            this.insurancePackageChanged(selectedInsurance)
        } else {
            Modal.error({
                title: '错误提示',
                content: '解析用户信息出错',
            });
        }
    }

    handlePatientRelSelect = (value) => {
        const { patientFieldValue, selPatientReleation, hisCusterList } = this.state;
        if (value.key == patientFieldValue.key) {
            message.error('服务对象与购买人的关系与已选关系标签不对应，请重新输入')
            this.setState({
                selPatientRelValue: undefined,
                selPatientRelDetails: undefined,
            })
            return;
        }
        if(hisCusterList && hisCusterList.length && selPatientReleation && value){
            const is_not_match = hisCusterList.find(i => i.relationShip != selPatientReleation[0] && i.insuredId == value.key)
            if(is_not_match){
                message.error('服务对象与购买人的关系与已选关系标签不对应，请重新输入')
                this.setState({
                    selPatientRelValue: undefined,
                    selPatientRelDetails: undefined,
                })
                return;
            }
        }
        const optionData = this.patientOptionData && this.patientOptionData.list;
        if (!optionData) return;
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
            this.setRelPatientId(optionData[index].id);
            this.relPatientId = optionData[index].id;
        } else {
            Modal.error({
                title: '错误提示',
                content: '解析用户信息出错',
            });
        }
    }

    setRelPatientId(id) {
        const { getRelPatientAction } = this.props;
        try {
            getRelPatientAction(id);
        } catch (e) {
            console.error(e);
            message.error(e.message);
        }
    }

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

    handleChange = ({ file, fileList }, fileParamName) => {
        const { form } = this.props;
        if (fileParamName === 'povertyPicList') {
            this.setState({ povertyPicList: fileList });
        }
        if (fileParamName === 'authorizationPicList') {
            this.setState({ authorizationPicList: fileList });
        }
    };

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

    customRequest = (fileData) => {
        api.uploadFile(fileData.data).then((res) => {
            fileData.onSuccess(res)
        }, (error) => {
            fileData.onError(error)
        });

    }

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

    insurancePackageChanged = async (value) => {
        this.setState({ insurancePackageProList: value.insurancePackagePros || [], insuranceSelectedOrder: value });
    }

    backToPre = () => {
        this.saveSubData();
        this.setState({
            location_href: 1,
            ischange: 1,
        })
    }

    backToSecPre = () => {
        this.setState({
            location_href: 2
        })
    }

    saveSubData() {
        const { setInsuranceSubmitData, form } = this.props;
        const { getFieldValue } = form;
        const sub_data = {
            patientFieldValue: this.state.patientFieldValue,
            selPatientReleation: this.state.selPatientReleation,
            choseInsurancePatient: this.state.choseInsurancePatient,
            selPatientRelValue: this.state.selPatientRelValue || null,
            guarantee: this.state.guarantee,
            poverty: this.state.poverty,
            insurancePackageProsId: this.state.insurancePackageProsId,
            authorizationPicList: this.state.authorizationPicList,
            payWay: this.state.payWay,
            isInsuranceAccount: this.state.isInsuranceAccount,
            f_patient: this.patientId,
            s_patient: this.state.selPatientReleation && this.state.choseInsurancePatient ? this.state.selPatientReleation[0] == '1' ? this.patientId : this.state.choseInsurancePatient[0] : null,
            isCash: this.state.isCash,
            isPoint: this.state.isPoint,
            payPoint: this.state.payPoint,
            payInsuranceAccount: this.state.payInsuranceAccount,
            payCash: this.state.payCash,
            payPrice: this.state.payPrice,
            buyCode: this.state.buyCode,
            subCode: this.state.subCode,
        }
        setInsuranceSubmitData(sub_data)
    }

    /* 选择对象关系 */
    setBuyPatient = (value) => {
        const { hisCusterList, insuranceSelectedOrder, patientFieldValue, patientDetails } = this.state;
        if(value && value[0] == 1){
            const t_age = IdCardCheck(patientDetails.idCard)
            if(t_age - insuranceSelectedOrder.ageRange[0] < 0 || t_age - insuranceSelectedOrder.ageRange[1] > 0){
                message.error('服务对象年龄与服务包限定范围不符，不可购买');
                this.setState({
                    selPatientReleation: undefined
                })
                return;
            }
        }
        let now_his_1ist = []
        if(value && value[0] != '1'){
            now_his_1ist = hisCusterList.filter(i => i.relationShip == value[0])
        }
        if (now_his_1ist.length) {
            let selre = [];
            let new_selre = [];
            const agernge = insuranceSelectedOrder && insuranceSelectedOrder.ageRange;
            if (patientFieldValue && value && value[0] != '1') {
                switch(value[0]){
                    case '2':
                        new_selre = hisCusterList && hisCusterList.filter(i => i.relationShip == 2)
                        break;
                    case '3':
                        new_selre = hisCusterList && hisCusterList.filter(i => i.relationShip == 3)
                        break;
                    case '4':
                        new_selre = hisCusterList && hisCusterList.filter(i => i.relationShip == 4)
                        break;
                }
            }
            new_selre.length && new_selre.map(i => {
                if(i.insuredIdCard){
                    const age_t = IdCardCheck(i.insuredIdCard);
                    if(age_t >= agernge[0] && age_t <= agernge[1]){
                        selre.push(i);
                    }else{
                        i.isDisabled = true
                        selre.push(i)
                    }
                }
            })
            if(selre.length){
                const selecId = selre.find(i => !i. isDisabled)
                selecId ? this.selectBuyPatient([`${selecId.insuredId}`]) : null
                this.setState({
                    selPatientReleation: value,
                })
            }else{
                this.setState({
                    selPatientRelValue: undefined,
                    selPatientRelDetails: undefined,
                    selPatientReleation: value,
                    choseInsurancePatient: undefined,
                })
            }
        } else {
            this.setState({
                selPatientRelValue: undefined,
                selPatientRelDetails: undefined,
                selPatientReleation: value,
                choseInsurancePatient: undefined,
            })
        }
    }

    /* 社保 */
    setguarantee = (value) => {
        const {insuranceSelectedOrder, insurancePackagePro} = this.state;
        if(value && insurancePackagePro && insurancePackagePro.guarantee !== null && insurancePackagePro.guarantee != value[0]) {
            const iy = insurancePackagePro.guarantee
            Modal.warning({
                title: iy == 0 ? '该服务暂不支持社保用户领用' : '该服务暂不支持无社保用户领用',
            });
            this.setState({
                guarantee: undefined,
            })
            return;
        }
        this.setState({
            guarantee: value
        })
    }

    /* 贫困 */
    getInsuracePackage = (value) => {
        const { form, getInsuracePackageAction } = this.props;
        const { insurancePackageProList, nowInsurancePovertyList, insuranceSelectedOrder, insurancePackagePro } = this.state;
        if(value && insurancePackagePro && insurancePackagePro.poverty !== null && insurancePackagePro.poverty != value[0]) {
            const iy = insurancePackagePro.poverty
            Modal.warning({
                title: iy == 0 ? '该服务暂不支持贫困用户领用' : '该服务暂不支持非贫困用户领用',
            });
            this.setState({
                poverty: undefined,
            })
            return;
        }
        const { getFieldValue } = form;
        const idCard = getFieldValue("idCard");
        const poverty = value || this.state.poverty;
        const validator = IDValidator;
        const valueStr = String(idCard);
        if (validator.isValid(valueStr) && idCard) {
            getInsuracePackageAction(idCard, null);
        }
        if (value !== undefined) {
            const insurancePackagePro = nowInsurancePovertyList && nowInsurancePovertyList.length && nowInsurancePovertyList.find(i => i.poverty === Number(value[0]))
            this.setState({
                insurancePackagePro,
                poverty: value
            }, this.payWayOnChange(null, insurancePackagePro))
        }
    }

    /* 选择档次 */
    insuranceProChanged = async (value) => {
        const { insurancePackageProList, poverty, guarantee } = this.state;
        const insurancePackagePro = insurancePackageProList.find(item => item.id == value[0]);
        if(insurancePackagePro && insurancePackagePro.poverty !== null && poverty !== undefined && poverty[0] != insurancePackagePro.poverty){
            const iy = insurancePackagePro.poverty
            Modal.warning({
                title: iy == 0 ? '该服务暂不支持贫困用户领用' : '该服务暂不支持非贫困用户领用',
            });
            this.setState({
                poverty: undefined,
            })
        }
        if(insurancePackagePro && insurancePackagePro.guarantee !== null && guarantee !== undefined && guarantee[0] != insurancePackagePro.guarantee){
            const iy = insurancePackagePro.guarantee
            Modal.warning({
                title: iy == 0 ? '该服务暂不支持社保用户领用' : '该服务暂不支持无社保用户领用',
            });
            this.setState({
                guarantee: undefined,
            })
        }
        await this.setPromise({ insurancePackagePro, insurancePackageProsId: value })
        if (insurancePackagePro  && insurancePackagePro.poverty === null) {
            this.payWayOnChange(null, insurancePackagePro);
        } else {
            const ast = insurancePackageProList.filter(i => i.gradeName === insurancePackagePro.gradeName);
            this.payWayOnChange(null, insurancePackagePro)
            this.setState({
                nowInsurancePovertyList: ast,
            })
        }
    }

    selectBuyPatient = async (value) => {
        this.setPromise({isgeting: true})
        const {choseInsurancePatient, insuranceSelectedOrder} = this.state;
        if(!choseInsurancePatient || value[0] != choseInsurancePatient[0]){
            const patientDetails = await api.getPatient(value[0])
            const i_age = IdCardCheck(patientDetails.idCard);
            if(i_age < insuranceSelectedOrder.ageRange[0] || i_age > insuranceSelectedOrder.ageRange[1]){
                message.error('服务对象年龄与服务包限定范围不符，不可购买');
                this.setState({
                    choseInsurancePatient: undefined,
                    isgeting: false
                })
                return;
            }
            const age = patientDetails.birthday ? `/${IdCardCheck(patientDetails.idCard)}岁` : '';
            const label = `${patientDetails.name} (${patientDetails.sex ? '男' : '女'}${age}) ${patientDetails.phone || ''} ${patientDetails.machineNumber || ''} ${patientDetails.address.liveStreet || ''} ${patientDetails.hospital.name || ''}`;
            const patientFieldValue = {
                key: value[0],
                label,
            };
            this.setState({
                selPatientRelValue: patientFieldValue,
                selPatientRelDetails: patientDetails,
                choseInsurancePatient: value,
                isgeting: false
            })
        } else if(value && choseInsurancePatient && choseInsurancePatient[0] == value[0]){
            this.setState({
                selPatientRelValue: undefined,
                selPatientRelDetails: undefined,
                choseInsurancePatient: undefined,
                isgeting: false
            })
        }
    }

    setBuyCode = (e) => {
        this.setState({
            buyCode: e.target.value.toUpperCase(),
            subCode: e.target.value,
        })
    }

    submit = async () => {
        await this.setPromise({ isSubmiting: true, isSub: true })
        const {selPatientReleation, poverty, guarantee, choseInsurancePatient, buyCode, insuranceSelectedOrder, selPatientRelValue, subCode, patientDetails, selectedInfo} = this.state;
        if (!this.patientId) {
            Modal.warning({
                title: '请先选择会员',
            });
            this.setState({ isSubmiting: false });
            return;
        }
        const now_patientDetail = await api.getPatient(this.patientId);
        let new_cityId = null;
        let new_provinceId = null;
        // if(now_patientDetail && now_patientDetail.memberType == 1){ // 保障
            new_cityId = now_patientDetail.hospital && now_patientDetail.hospital.cityId || null;
            new_provinceId = now_patientDetail.hospital && now_patientDetail.hospital.provinceId || null
        /* }else{ // 绿a
            new_cityId = now_patientDetail.address.liveCity;
            new_provinceId = now_patientDetail.address.liveProvinces
        } */
        if(selectedInfo && selectedInfo.areas && selectedInfo.areas.length && !selectedInfo.areas.find(item => item.cityId ? item.cityId == new_cityId : item.provincesId ? item.provincesId == new_provinceId : null)){
            message.error('购买人所在城市与服务包服务区域不符')
            this.setState({ isSubmiting: false, isSub: false });
            return;
        }
        if(subCode){
            try{
                const data = await api.checkInsuranceCode(subCode);
                if (!data) {
                    message.error('激活码有误，请重新输入')
                    this.setState({ isSubmiting: false });
                    return;
                }else if(data.status == 1 || (data.status == 0 && data.insurancePackageId != insuranceSelectedOrder.packageId)) {
                    message.error('激活码已失效或不匹配')
                    this.setState({ isSubmiting: false });
                    return;
                }
            }catch(err){
                message.error(err.message)
                this.setState({ isSubmiting: false });
                return;
            }
        }
        if(selPatientReleation && selPatientReleation[0] != '1' && !selPatientRelValue){
            message.error('请选择服务对象')
            return;
        }
        if((insuranceSelectedOrder && insuranceSelectedOrder.buyWithCode && !buyCode) || !selPatientReleation || (insuranceSelectedOrder.insurancePackagePros[0].poverty == 1 && !poverty) || (insuranceSelectedOrder && insuranceSelectedOrder.insurancePackagePros[0].guarantee == 1 && !guarantee)){
            message.error('请完善信息')
            this.setState({ isSubmiting: false });
            return;
        }
        this.props.form.validateFields(async (err, values) => {
            const { povertyPicList } = values;
            const { authorizationPicList } = this.state;
            let picCheck = true;
            if (authorizationPicList && authorizationPicList.length > 0) {
                authorizationPicList.forEach((i) => {
                    if (i.status !== 'done') {
                        picCheck = false;
                    }
                });
            }
            if (this.state.insurancePackageProList[0].poverty !== null && this.state.poverty && this.state.poverty[0] === '1' && povertyPicList && povertyPicList.length > 0) {
                povertyPicList.forEach((i) => {
                    if (i.status !== 'done') {
                        picCheck = false;
                    }
                });
            }
            if (!picCheck) {
                message.error('请等待图片上传成功后再次提交。');
                this.setState({ isSubmiting: false });
                return;
            }
            let povertyPics;
            povertyPicList ? povertyPicList.forEach((i) => {
                povertyPics = povertyPics ? povertyPics + ',' + i.response : i.response;
            }) : null;
            let authorizationPics;
            authorizationPicList ? authorizationPicList.forEach((i) => {
                authorizationPics = authorizationPics ? authorizationPics + ',' + i.response : i.response;
            }) : null;
            const payments = [];
            const { payPoint, payInsuranceAccount, payCash, payPrice } = this.state;
            if (payPrice > 0) {
                if ((!this.state.isPoint || this.state.isPoint.length <= 0) &&
                    (!this.state.isInsuranceAccount || this.state.isInsuranceAccount.length <= 0) &&
                    (!this.state.isCash || this.state.isCash.length <= 0)) {
                    message.error('请选择支付金额');
                    this.setState({ isSubmiting: false });
                    return;
                }
                if ((payPoint || 0) + (payInsuranceAccount || 0) + (payCash || 0) < payPrice) {
                    message.error('金额不足支付首月会员服务费，登记失败');
                    this.setState({ isSubmiting: false });
                    return;
                }
                if (this.state.isPoint && this.state.isPoint.length > 0 && this.state.isPoint[0] === 1) {
                    payments.push({ payWay: "self_pbm_points_deduction", amount: payPoint });
                }
                if (this.state.isInsuranceAccount && this.state.isInsuranceAccount.length > 0 && this.state.isInsuranceAccount[0] === 1) {
                    payments.push({ payWay: "self_member_account", amount: payInsuranceAccount });
                }
                if (this.state.isCash && this.state.isCash.length > 0 && this.state.isCash[0] === 1) {
                    payments.push({ payWay: "self_charge", amount: payCash });
                }
            }else{
                payments.push({ payWay: "self_charge", amount: 0 });
            }
            const inserInfo = await api.checkIsService(this.state.selPatientReleation[0] == '1' ? this.patientId : selPatientRelValue.key)
            let cansubInfo = true
            if(inserInfo && inserInfo.length){
                inserInfo.map(i => {
                    if(i.insurancePackageId == insuranceSelectedOrder.packageId){
                        cansubInfo = false;
                    }
                })
            }
            if(!cansubInfo){
                message.error('服务对象已获取过该服务，不可重复购买');
                this.setState({
                    isSubmiting: false
                })
                return;
            }
            const submitData = {
                insuredId: this.state.selPatientReleation[0] == '1' ? this.patientId : selPatientRelValue.key,
                insurerId: this.patientId,
                povertyPics,
                authorizationPics,
                insurancePackageProsId: this.state.insurancePackagePro.id,
                payWay: 1,
                code: null,
                usePoints: this.state.isPoint && this.state.isPoint.length > 0 ? this.state.isPoint[0] : 0,
                useAccount: this.state.isInsuranceAccount && this.state.isInsuranceAccount.length > 0 ? this.state.isInsuranceAccount[0] : 0,
                payments: JSON.stringify(payments),
                code: subCode,
                relationWithInsurer: Number(this.state.selPatientReleation[0]),
                cid:this.state.channelCode
            }
            if (!this.state.needHealthq) {
                try{
                    const data = await api.createPatientInsurance(submitData)
                    this.props.savePutData(data)
                    this.props.openModal('patientInsuranceResult')
                }catch(err){
                    message.error(err.message)
                    this.setState({
                        isSubmiting: false
                    })
                }
            }else{
                this.props.setToNextData(submitData);
                this.props.setPatientInsuranceResult(this.state.selPatientReleation[0] == '1' ? this.state.patientDetails : this.state.selPatientRelDetails)
                this.setState({
                    location_href: 3,
                    getPreSubmitData: submitData
                })
            }
        });
    }



    gotoNext = async () => {
        const { selectedInfo, selectedVal, selectedInsuranceId, ischange } = this.state;
        const { setInsuraceSelected, setSelectedInsuranceId, setInsuranceSubmitData } = this.props;
        if(!selectedVal){
            message.error('请选择服务包');
            return;
        }
        setInsuraceSelected(selectedInfo)
        setSelectedInsuranceId(selectedVal)
        // 根据服务包查询是否有问询
        const inquiryData = await api.getInsuranceInquiries(selectedInfo.packageId)

        // 把新接口改成老接口的样式 // 新接口，没有对应字段
        let regSplit = /[,、.]/
        // 将扶贫版转化成众惠版
        function convertEnquiryListToDiseasesList(enquiryList){
            if(Array.isArray(enquiryList)){
                return enquiryList.map((item,index)=>{
                    let id = item.question.match(/<span>([^<]+)<\/span>/)[1] || index
                    return {
                        answer : item.answer,
                        remark:'',
                        answerTitle:item.result.name.split(regSplit)[1],
                        id:id,
                        key:id.toUpperCase(),
                        type:null,
                        question:item.question.split(regSplit)[1] || item.result.result
                    }
                })
            }
            return []
        }
        // 将安心转化成众惠版
        function convertEnquiryListToDiseasesList2(enquiryList){
            if(Array.isArray(enquiryList)){
                return enquiryList.map((item,index)=>{
                    let id = index+1
                    return {
                        answer : item.answer,
                        remark:'',
                        answerTitle:item.question,
                        id:id,
                        key:'Q'+id,
                        type:null,
                        question:item.question
                    }
                })
            }
            return []
        }
        if(inquiryData && inquiryData.needInquiry){

            let inquiryId = +inquiryData.inquiryId
            let enquiryList = await api.getEnquiryList(inquiryId)
            let diseasesList = enquiryList
            if(inquiryId===3){
                diseasesList = convertEnquiryListToDiseasesList(enquiryList)
            }else if(inquiryId ===2){
                diseasesList = convertEnquiryListToDiseasesList2(enquiryList)
            }
            this.setState({
                location_href: 2,
                diseasesList: diseasesList,
                needHealthq: true
            })
        }else{
            this.setState({
                location_href: 2,
                diseasesList: [],
                needHealthq: false,
            })
        }
        if(ischange == 2){
            this.resetData()
        }

    }

    resetData() {
        this.setState({
            patientFieldValue: undefined,
            selPatientReleation: undefined,
            selPatientRelValue: undefined,
            choseInsurancePatient: undefined,
            guarantee: undefined,
            poverty: undefined,
            insurancePackageProsId: undefined,
            hisCusterList: undefined,
            isCash: undefined,
            isPoint: undefined,
            isInsuranceAccount: undefined,
            patientDetails: undefined,
            selPatientRelDetails: undefined,
            payPoint: undefined,
            payInsuranceAccount: undefined,
            payCash: undefined,
            payPrice: undefined,
            insuranceSelectedOrder: undefined,
            buyCode: undefined,
            povertyPicList: [],
            authorizationPicList: [],
            insurancePackageProList: [],
            insurancePackagePro: undefined,
            insuranceAccountInfo: undefined,
            isProhibit: false,
            povertyValidate: undefined,
            payWay: ['1'],
            q_list: {},
            isSubmiting: false,
            subCode: null,
        })
    }

    getQueInfo() {
        const { q_list, diseasesList } = this.state;
        const c = [];
        diseasesList.map((i, index) => {
            if (q_list[i.id] && q_list[i.id].length) {
                q_list[i.id].map(item => {
                    i.answer.map((j, j_index) => {
                        const iu = {}
                        const iu_list = []
                        if (item == j_index) {
                            iu_list.push(j)
                            iu.id = i.id
                            iu.question = i.question
                            iu.answerTitle = i.answerTitle
                            iu.answer = iu_list
                            iu.key = i.key
                            c.push(iu)
                        }
                    })
                })
            }
        })
        var map = {}, dest = [];
        for (var i = 0; i < c.length; i++) {
            var ai = c[i];
            if (!map[ai.id]) {
                dest.push({
                    id: ai.id,
                    answer: ai.answer,
                    question: ai.question,
                    answerTitle: ai.answerTitle,
                    key: ai.key,
                });
                map[ai.id] = ai;
            } else {
                for (var j = 0; j < dest.length; j++) {
                    var dj = dest[j];
                    if (dj.id == ai.id) {
                        dj.answer = [...dj.answer, ...ai.answer];
                        break;
                    }
                }
            }
        };
        var messageInfo = '';
        const iu = []
        dest.map(i => {
            if(i.answer && i.answer.length && i.answer[0].value !== 'NONE'){
                iu.push(i);
            }
        })
        iu.map(i => {
            messageInfo = messageInfo + i.question;
            i.answer.map((j,index) => {
                if(index != i.answer.length - 1){
                    messageInfo = messageInfo + j.name + ','
                }else{
                    messageInfo = messageInfo + j.name + ';'
                }
            })
        })
        return { messageInfo, nesData: iu};
    }

    setqa(value, index, item) {
        const { diseasesList, q_list } = this.state;
        if(value !== undefined){
            const isNo = value && value.find(items => diseasesList[index].answer[items].value === 'NONE');
            if (isNo !== undefined && value.indexOf(String(isNo)) === value.length - 1) {
                q_list[item.id] = [`${isNo}`]
                this.setState({
                    q_list,
                })
            } else if(isNo !== undefined && value.indexOf(String(isNo)) !== value.length - 1){
                const itemIndex = value.indexOf(String(isNo))
                value.splice(itemIndex, 1)
                q_list[item.id] = value
                this.setState({
                    q_list,
                })
            } else {
                q_list[item.id] = value
                this.setState({
                    q_list
                })
            }
        }else{
            q_list[item.id] = [];
            this.setState({
                q_list
            })
        }
    }

    getAnsInfo(data, item) {
        const { diseasesList } = this.state;
        if(data.length){
            const q_info = diseasesList[item];
            const i_num = + data[0];
            if(data.length === 1 && q_info && q_info.answer[i_num] && q_info.answer[i_num].value === 'NONE'){
                return ''
            } else if(data.length  && q_info && q_info.answer[i_num] && q_info.answer[i_num].value !== 'NONE'){
                const arr = [];
                let disInfo = '';
                const quesTitle = q_info.answerTitle ? q_info.answerTitle : '';
                data.map(i => q_info.answer.map((j, index) => {if(index == i){ arr.push(j)}}));
                arr.map((item, index) => {
                    const ij = item.result ? item.result : item.name+'；'
                    disInfo = disInfo + ij
                })
                return quesTitle + disInfo
            } else {
                return ''
            }
        }else{
            return ''
        }
    }

    thirdSubmit = async () => {
        const { diseasesList, getPreSubmitData, q_list, nesData, iscomplete, selectedInfo} = this.state;
        await this.setPromise({iscomplete: true})
        const afg = [];
        for(let i in q_list){
            if(q_list[i] && q_list[i].length){
                afg.push(i)
            }
        }
        if(afg.length !== diseasesList.length){
            message.error('请回答完所有问题')
            return;
        }
        const index_forbidden = diseasesList.filter(i => i.type === 'forbidden');
        let cansub = [];
        if (index_forbidden && index_forbidden.length) {
            index_forbidden.map((i) => {
                const inum = Number(q_list[i.id][0])
                if (q_list[i.id].length && i.answer[inum].value !=='NONE') {
                    cansub.push(1)
                }
            })
        }
        if(cansub.length > 0){
            message.error('有禁止的选项')
            this.setState({
                iscomplete: false
            })
            return;
        }
        const messageInfo = this.getQueInfo();
        const subdata = {
            ...getPreSubmitData,
            diseasesInfo: messageInfo.messageInfo
        }
        const diseaseInfo = {
            diseasesList,
            q_list
        }
        const now_patientDetail = await api.getPatient(this.patientId);
        let new_cityId = null;
        let new_provinceId = null;
        // if(now_patientDetail && now_patientDetail.memberType == 1){ // 保障
            new_cityId = now_patientDetail.hospital && now_patientDetail.hospital.cityId || null;
            new_provinceId = now_patientDetail.hospital && now_patientDetail.hospital.provinceId || null
        /* }else{ // 绿a
            new_cityId = now_patientDetail.address.liveCity;
            new_provinceId = now_patientDetail.address.liveProvinces
        } */
        if(selectedInfo && selectedInfo.areas && selectedInfo.areas.length && !selectedInfo.areas.find(item => item.cityId ? item.cityId == new_cityId : item.provincesId ? item.provincesId == new_provinceId : null)){
            message.error('购买人所在城市与服务包服务区域不符')
            this.setState({ iscomplete: false });
            return;
        }
        try{
            const data = await api.createPatientInsurance(subdata)
            message.success('登记成功');
            this.setState({
                iscomplete: false
            })
            this.props.saveDiseaseInfo(messageInfo.nesData);
            this.props.savePutData(data)
            this.props.openModal('patientInsuranceResult')
        }catch(err){
            message.error(err.message)
            this.setState({
                iscomplete: false
            })
        }
    }

    renderError() {
        return (
            <div style={{ color: 'red', position: 'relative', top: '-20px', left: '144px'}}>不能为空</div>
        )
    }

    renderThirdError(index) {
        const {diseasesList,q_list} = this.state;
        const index_forbidden = diseasesList.filter(i => i.type === 'forbidden');
        let cansub = true;
        if (index_forbidden && index_forbidden.length) {
            index_forbidden.map((i, item) => {
                if(q_list[i.id]){
                    const inum = Number(q_list[i.id][0])
                    if (q_list[i.id].length && i.answer[inum] && i.answer[inum].value !=='NONE') {
                        cansub = false
                    }
                }
            })
        }
        if(cansub){
            return null
        }else{
            return (
                <div style={{ color: 'red' }}>提示：不可为该服务对象选购此服务</div>
            )
        }
    }

    renderWarn(data, index) {
        const { diseasesList, q_list } = this.state;
        const index_forbidden = diseasesList.filter(i => i.type === 'warning');
        let cansub = true;
        if (index_forbidden && index_forbidden.length && q_list) {
            index_forbidden.map((i) => {
                if(q_list[i.id]){
                    const inum = Number(q_list[i.id][0])
                    if (q_list[i.id].length && i.answer[inum].value !=='NONE') {
                        cansub = false
                    }
                }
            })
        }
        const message_info = this.getAnsInfo(data, index)
        if(cansub){
            return null;
        }
        return (
            <div key={index} style={{ color: '#faad14' }}>{message_info}</div>
        )
    }

    renderFooter() {
        const { location_href, isSubmiting, needHealthq, iscomplete, q_list, diseasesList } = this.state;
        if(location_href === 1) {
            return (
                <Row>
                    <Button onClick={this.gotoNext} type="primary">下一步</Button>
                </Row>
            )
        }else if(location_href === 2) {
            if(diseasesList && diseasesList.length && q_list){
            }
            return (
                <Row>
                    <Button onClick={this.backToPre} type="primary">上一步</Button>
                    <Button onClick={this.submit} type="primary" loading={needHealthq ? false : isSubmiting} disabled={needHealthq ? false : isSubmiting}>{needHealthq ? '下一步' : '登记'}</Button>
                </Row>
            )
        }else if(location_href === 3) {
            let cansub = false;
            diseasesList && diseasesList.map(i => {
                if(!q_list[i.id] || !q_list[i.id].length){
                    cansub = true
                }
                if(q_list[i.id] && i.type === "forbidden" && (q_list[i.id].length > 1 || q_list[i.id].length == 1 && i.answer[Number(q_list[i.id][0])].value !== 'NONE')){
                    cansub = true
                }
            })
            return (
                <Row>
                    <Button onClick={this.backToSecPre} type="primary">上一步</Button>
                    <Button onClick={this.thirdSubmit} loading={iscomplete} disabled={cansub} type="primary">登记</Button>
                </Row>
            )
        }

    }
    insuranceIndexPackageChanged = async (value) => {
        const { insuranceIndexPackageList, selectedVal } = this.state;
        const ast = insuranceIndexPackageList[value[0]];
        const releation_ship = ast ? ast.relationDicts : [];
        let releation_ship_list = []
        if(releation_ship && releation_ship.length){
            releation_ship.map(i => {
                const gf = {
                    id: i.value.toString(),
                    name: i.label,
                }
                releation_ship_list.push(gf)
            })
        }
        this.setState({
            selectedInfo: insuranceIndexPackageList[value[0]],
            selectedVal: value,
            isSubmiting: false,
            ischange: selectedVal && value && selectedVal[0] == value[0] ? 1 : 2,
            releation_ship_list,
        },()=>{
            console.log(this.state.selectedVal)
            console.log(this.state.selectedInfo)
            console.log(this.state.selectedVal)
            console.log(this.state.isSubmiting)
            console.log(this.state.ischange)
            console.log(this.state.releation_ship_list)
        })
    }
    //搜索时
    handleBtnSearch = (value) => {
        //深拷贝一组数据
        let list = cloneDeep(this.state.insuranceIndexPackageList2)
        let filterArr=[]
        //判断时数组还是字符
        if(value.substring(0,2)==='IP'){
            filterArr=list.filter(item=>item.packageCode===value)
        }else{
            filterArr=list.filter(item=>(item.insurancePackageName).indexOf(value)>=0)
        }
        // if(isNaN(Number(value))){
        //     //非数字匹配名字
            // filterArr=list.filter(item=>(item.insurancePackageName).indexOf(value)>=0)
        // }else{
        //     //数字精确匹配
        //     filterArr=list.filter(item=>item.packageCode.toString()===value)
        // }
        this.setState({
            insuranceIndexPackageList:filterArr
        })
        if(!value){
            console.log("woshi ",this.state.insuranceIndexPackageList2)
            this.setState({
                insuranceIndexPackageList:this.state.insuranceIndexPackageList2
            })
        }
    }
    //改变时
    handleBtnChange = (value) => {
        value=[`${value}`]
        const { insuranceIndexPackageList, selectedVal } = this.state;
        const ast = insuranceIndexPackageList[value[0]];
        const releation_ship = ast ? ast.relationDicts : [];
        let releation_ship_list = []
        if(releation_ship && releation_ship.length){
            releation_ship.map(i => {
                const gf = {
                    id: i.value.toString(),
                    name: i.label,
                }
                releation_ship_list.push(gf)
            })
        }
        this.setState({
            selectedInfo: insuranceIndexPackageList[value[0]],
            selectedVal: value,
            isSubmiting: false,
            ischange: selectedVal && value && selectedVal[0] == value[0] ? 1 : 2,
            releation_ship_list,
            selectedVal2:insuranceIndexPackageList[value[0]].insurancePackageName
        })
    }
    renderIndexPage() {
        const {
            insuranceIndexPackageList, isSubmiting, selectedInfo, loading, selectedVal,selectedVal2
        } = this.state;
        const { form } = this.props;
        const { getFieldDecorator, getFieldValue } = form;
        const title = "登记会员服务";
        const insurances = selectedInfo ? selectedInfo.insurancePackagePros[0].products.map(item => item.productName) : [];
        const options = insuranceIndexPackageList && insuranceIndexPackageList.map((item, index) => {
        return <Option key={item.packageId} value={String(index)}>{item.insurancePackageName}({item.packageCode})</Option>
        })
        return (
            <Spin spinning={loading}>
                        <Form id="creatInsuranceOrderIndexPage">
                            <Row>
                                <Form.Item label="会员服务包" required {...formItemStyle}>
                                <Select
                                    showSearch
                                    value={selectedVal2}
                                    placeholder='请输入产品编码/服务包产品名称'
                                    defaultActiveFirstOption={false}
                                    showArrow={false}
                                    filterOption={false}
                                    onSearch={debounce(this.handleBtnSearch,500)}
                                    onChange={this.handleBtnChange}
                                    notFoundContent={null}
                                >
                                    {options}
                                </Select>
                                    {/* <SmartSelectBox
                                        editStatus
                                        notEditableOnly={false}
                                        onChange={this.insuranceIndexPackageChanged}
                                        buttonOptions={
                                            insuranceIndexPackageList && insuranceIndexPackageList.map((item, index) => {
                                                return {
                                                    id: String(index),
                                                    name: item.insurancePackageName,
                                                }
                                            })
                                        }
                                        getPopupContainer={() => document.getElementById('creatPatientInsurance')}
                                        value = {selectedVal}
                                    /> */}
                                </Form.Item>
                            </Row>
                            <Row>
                                <Form.Item label="年龄范围：" {...formItemStyle}>
                                    {getFieldDecorator('insuranceAge', {
                                        rules: [],
                                    })(
                                        <span>{selectedInfo ? `${selectedInfo.ageRange[0]}-${selectedInfo.ageRange[1]}` : null
                                        }</span>
                                    )}
                                </Form.Item>
                            </Row>
                            <Row>
                                <Form.Item label="服务期限：" {...formItemStyle}>
                                    {getFieldDecorator('insuranceAge', {
                                        rules: [],
                                    })(
                                        <span>{loading ? '' : '1年'}</span>
                                    )}
                                </Form.Item>
                            </Row>
                            <Row>
                                <Form.Item label="服务产品：" {...formItemStyle}>
                                    {getFieldDecorator('insuranceAge', {
                                        rules: [],
                                    })(
                                        <div>
                                            {insurances.map((i,index) => {
                                                return (
                                                    <p key={index}>{i}</p>
                                                )
                                            })}
                                        </div>
                                    )}
                                </Form.Item>
                            </Row>
                            <Row>
                                <Form.Item label="服务城市：" {...formItemStyle}>
                                    {getFieldDecorator('insuranceAge', {
                                        rules: [],
                                    })(
                                        <div>
                                            {selectedInfo && selectedInfo.areas && selectedInfo.areas.length ? selectedInfo.areas.map((i,index) => {
                                                return (
                                                    <span style={{ marginRight: '5px' }} key={index}>{i.cityName || i.provincesName || ''}</span>
                                                )
                                            }) : null}
                                        </div>
                                    )}
                                </Form.Item>
                            </Row>
                            <Row>
                                <Form.Item label="备注：" {...formItemStyle}>
                                    {getFieldDecorator('insuranceAge', {
                                        rules: [],
                                    })(
                                        <div>
                                            {selectedInfo && selectedInfo.remarks ? selectedInfo.remarks : ''}
                                        </div>
                                    )}
                                </Form.Item>
                            </Row>
                        </Form>
                        </Spin>
        )
    }
    //设置渠道码
    setChooseCode=value=>{
        this.setState({ channelCode:value });
    }
    handleSearch = async value => {
        console.log('fetching user', value);
        const {channelCodeData}=this.state
        if (value) {
            this.setState({
                loading:true
            })
            //过滤出符合得值
            const data2=channelCodeData.filter(item=>(item.text.indexOf(value)>=0))
            this.setState({
                channelCodeData:[...data2],
                loading:false
            })
        }else{
            //获取当前用户的渠道码
            let user=JSON.parse(window.localStorage.getItem('userInfo'))
            let data = await api.getChannelCode({});

            const data2 = data.map(el => ({
                text: `${el.name}(${el.channelCode})-${el.companyName}`,
                value:`${el.channelCode}`,
            }));
            //设置默认
            const moren = data.filter(item=>item.userId==user.user)
            this.setState({
                channelCodeData:[...data2]
            })
        }
      };
    setCodeList(){
        const { loading, channelCodeData,channelCode,channelisCodeDis } = this.state;
        const options = channelCodeData&&channelCodeData.length>0?channelCodeData.map(d =>
        <Option key={d.value} value={d.value}>{d.text}</Option>):null;
        return  <Select
                showSearch
                value={channelCode}
                placeholder={null}
                style={{ width: '100%' }}
                defaultActiveFirstOption={false}
                showArrow={false}
                filterOption={false}
                onSearch={debounce(this.handleSearch,500)}
                onChange={this.setChooseCode}
                notFoundContent={loading ? <Spin size="small" /> : null}
                disabled={channelisCodeDis}
              >
                {options}
              </Select>
    }
    renderSecondPage() {
        const {
            patientFieldValue, insurancePackageProList,
            patientDetails, insuranceAccountInfo, insurancePackagePro,
            payPoint, payInsuranceAccount, payCash, totalPrice, payPrice,
            diseaseList, isSubmiting, healthInquiryResults, isProhibit,
            healthInquiryValidate, povertyValidate, selPatientRelValue,
            selPatientRelDetails, hisCusterList, isgeting, selPatientReleation,choseInsurancePatient,
            guarantee, poverty, insurancePackageProsId, payWay, isPoint, isInsuranceAccount, isCash, isSub, insuranceSelectedOrder,
            buyCode, needHealthq, releation_ship_list,channelCode
        } = this.state;
        const { form } = this.props;
        const { getFieldDecorator, getFieldValue } = form;
        const title = "登记会员服务";
        const uploadButton = (
            <div>
                <div className="ant-upload-text">点击上传</div>
                <div className="ant-upload-text">（仅限图片）</div>
            </div>
        );
        const arr = [];
        const buyed_age = selPatientReleation ? selPatientReleation[0] == '1' ? IdCardCheck(patientDetails.idCard) : selPatientRelDetails  ? IdCardCheck(selPatientRelDetails.idCard) : null : null;
        insurancePackageProList && insurancePackageProList.length && insurancePackageProList.map((i) => {
            if(i.maxAge && i.minAge && buyed_age >= i.minAge && buyed_age <= i.maxAge){
                if (!arr.find((j) => j.gradeName == i.gradeName)) {
                    arr.push(i)
                }
            }else if(i.maxAge === null && i.minAge === null && buyed_age -insuranceSelectedOrder.ageRange[0] >=0 && buyed_age -insuranceSelectedOrder.ageRange[1] <= 0) {
                if (!arr.find((j) => j.gradeName == i.gradeName)) {
                    arr.push(i)
                }
            }
        })
        let selre = [];
        let new_selre = [];
        const agernge = insuranceSelectedOrder && insuranceSelectedOrder.ageRange;
        if (patientFieldValue && selPatientReleation && selPatientReleation[0] != '1') {
            switch(selPatientReleation[0]){
                case '2':
                    new_selre = hisCusterList && hisCusterList.filter(i => i.relationShip == 2)
                    break;
                case '3':
                    new_selre = hisCusterList && hisCusterList.filter(i => i.relationShip == 3)
                    break;
                case '4':
                    new_selre = hisCusterList && hisCusterList.filter(i => i.relationShip == 4)
                    break;
            }
        }
        new_selre.length && new_selre.map(i => {
            const age_t = IdCardCheck(i.insuredIdCard);
            if(age_t >= agernge[0] && age_t <= agernge[1]){
                selre.push(i);
            }else{
                i.isDisabled = true
                selre.push(i);
            }
        })
        return (
            <Spin spinning={isgeting}>
                <Form id="creatPatientInsurance">
                    {insuranceSelectedOrder && insuranceSelectedOrder.buyWithCode ? <Row>
                        <Form.Item label="激活码" required {...formItemStyle} {...povertyValidate}>
                            <Input onChange={this.setBuyCode} value={buyCode} />
                        </Form.Item>
                        {isSub && !buyCode ? this.renderError() : null}
                    </Row> : null}
                    <Row>
                        <Form.Item field="patientId" label="购买人" required {...formItemStyle}>
                            <div>
                                <SmartSelectSingleAsync
                                    {...mapPropsToFormItems}
                                    className="-x-id-search"
                                    placeholder="输入会员姓名/身份证号/手机号/其他联系方式"
                                    showSearch
                                    value={patientFieldValue}
                                    filterOption={false}
                                    delay
                                    asyncResultId="addMedicineRegister.ChoosePatient"
                                    asyncRequestFuncName="searchPatient"
                                    onChange={this.handlePatientChange}
                                    onSelect={this.handlePatientSelect}
                                    cleanOptionsOnBlur
                                    getPopupContainer={() => document.getElementById('creatPatientInsurance')}
                                    asyncMapResultToState={
                                        (data, params) => (params.keyWord ? data : undefined)
                                    }
                                    mapDataToOption={this.mapDataToOption}
                                />
                                <div style={{ maxHeight: '30px', paddingTop: '10px' }}>
                                    {patientDetails && patientDetails.gradeIcon ?
                                        <img src={patientDetails.gradeIcon} style={{ height: '30px' }} /> : null
                                    }
                                    {patientDetails && patientDetails.certification ?
                                        <img src={PatientcertIficationImg} style={{ height: '30px' }} /> : null
                                    }
                                </div>
                            </div>
                        </Form.Item>
                    </Row>
                    {patientFieldValue ? <Row>
                        <Form.Item label="为谁购买" required {...formItemStyle} {...povertyValidate}>
                            <SmartSelectBox
                                editStatus
                                notEditableOnly={false}
                                onChange={this.setBuyPatient}
                                buttonOptions={releation_ship_list}
                                getPopupContainer={() => document.getElementById('creatPatientInsurance')}
                                value = {selPatientReleation}
                            />
                        </Form.Item>
                        {isSub && !selPatientReleation ? this.renderError() : null}
                    </Row> : null}
                    {patientFieldValue && selPatientReleation && selPatientReleation[0] != '1' && selre && selre.length ? <Row>
                        <Form.Item label="可选对象" required {...formItemStyle}>
                            <SmartSelectBox
                                editStatus
                                notEditableOnly={false}
                                buttonOptions={
                                    selre.length && selre.map(item => {
                                        return {
                                            id: String(item.insuredId),
                                            name: item.insuredName,
                                            isDisabled: item.isDisabled,
                                        }
                                    })
                                }
                                onChange={this.selectBuyPatient}
                                getPopupContainer={() => document.getElementById('creatPatientInsurance')}
                                value={choseInsurancePatient}
                            />
                        </Form.Item>
                        {isSub && !selPatientRelValue && selre && selre.length && selPatientReleation && selPatientReleation[0] != '1' ? this.renderError() : null}
                    </Row> : null}
                    {selPatientReleation && selPatientReleation[0] != '1' ? <Row>
                        <Form.Item field="relpatientId" label="服务对象" required {...formItemStyle}>
                            <div>
                                <SmartSelectSingleAsync
                                    {...mapPropsToFormItems}
                                    className="-x-id-search"
                                    placeholder="输入会员姓名/身份证号/手机号/其他联系方式"
                                    showSearch
                                    value={selPatientRelValue}
                                    filterOption={false}
                                    delay
                                    asyncResultId="addMedicineRegister.ChoosePatientRelation"
                                    asyncRequestFuncName="searchPatient"
                                    onChange={this.handlePatientRelChange}
                                    onSelect={this.handlePatientRelSelect}
                                    cleanOptionsOnBlur
                                    getPopupContainer={() => document.getElementById('creatPatientInsurance')}
                                    asyncMapResultToState={
                                        (data, params) => (params.keyWord ? data : undefined)
                                    }
                                    mapDataToOption={this.mapDataToOption}
                                    notEditableOnly={choseInsurancePatient ? true : false}
                                />
                                <div style={{ maxHeight: '30px', paddingTop: '10px' }}>
                                    {selPatientRelDetails && selPatientRelDetails.gradeIcon ?
                                        <img src={selPatientRelDetails.gradeIcon} style={{ height: '30px' }} /> : null
                                    }
                                    {selPatientRelDetails && selPatientRelDetails.certification ?
                                        <img src={PatientcertIficationImg} style={{ height: '30px' }} /> : null
                                    }
                                </div>
                            </div>
                        </Form.Item>
                    </Row> : null}
                    {patientFieldValue && insurancePackageProList && insurancePackageProList.length && insurancePackageProList[0].guarantee !== null ? <Row>
                        <Form.Item label="有无社保" required {...formItemStyle} {...povertyValidate}>
                            <SmartSelectBox
                                editStatus
                                notEditableOnly={false}
                                onChange={this.setguarantee}
                                buttonOptions={
                                    [
                                        { id: '1', name: '有社保' },
                                        { id: '0', name: '无社保' },
                                    ]
                                }
                                getPopupContainer={() => document.getElementById('creatPatientInsurance')}
                                value={guarantee}
                            />
                        </Form.Item>
                        {isSub && !guarantee ? this.renderError() : null}
                    </Row> : null}
                    {patientFieldValue && insurancePackageProList && insurancePackageProList.length && insurancePackageProList[0].poverty !== null ? <Row>
                        <Form.Item label="是否贫困" required {...formItemStyle} {...povertyValidate}>
                            <SmartSelectBox
                                editStatus
                                notEditableOnly={false}
                                onChange={this.getInsuracePackage}
                                buttonOptions={
                                    [
                                        { id: '1', name: '贫困' },
                                        { id: '0', name: '非贫困' },
                                    ]
                                }
                                getPopupContainer={() => document.getElementById('creatPatientInsurance')}
                                value={poverty}
                            />
                        </Form.Item>
                        <p style={{ position: 'absolute', left: '300px', top: '8px', color: '#F48E18' }}>提示：贫困证明材料可于出险理赔时提供</p>
                        {isSub && !poverty ? this.renderError() : null}
                    </Row> : null}
                    {/* 新增销售渠道 */}
                    {
                        <Row>
                            <Form.Item label="销售渠道：" {...formItemStyle} >
                                {this.setCodeList()}
                            </Form.Item>
                        </Row>
                    }
                    {selPatientReleation ? <Row>
                        <Form.Item label="服务档次" required {...formItemStyle}>
                            <SmartSelectBox
                                editStatus
                                notEditableOnly={false}
                                buttonOptions={
                                    arr.map(item => {
                                        return {
                                            id: String(item.id),
                                            name: item.gradeName,
                                        }
                                    })
                                }
                                onChange={this.insuranceProChanged}
                                getPopupContainer={() => document.getElementById('creatPatientInsurance')}
                                value={insurancePackageProsId}
                            />
                        </Form.Item>
                        {isSub && !insurancePackageProsId ? this.renderError() : null}
                    </Row> : null}
                    <Row>
                        <Form.Item label="服务费" {...formItemStyle}>
                            <div>
                                <p style={{ textDecoration: 'line-through', color: 'rgba(0,0,0,0.40)' }}>
                                    {insurancePackagePro && ((insurancePackagePro.poverty === null && poverty === undefined) || (insurancePackagePro.poverty !== null && poverty !== undefined)) ? insurancePackagePro  ? `¥${(insurancePackagePro.salesPrice / 100).toFixed(2)}/年` : null : null}
                                </p>
                                <div style={{ fontWeight: '600', display: 'flex' }}>
                                    {insurancePackagePro && ((insurancePackagePro.poverty === null && poverty === undefined) || (insurancePackagePro.poverty !== null && poverty !== undefined)) ?insurancePackagePro && totalPrice >= 0 ? `¥${(totalPrice / 100).toFixed(2)}/年` : null :null}
                                    {insurancePackagePro && ((insurancePackagePro.poverty === null && poverty === undefined) || (insurancePackagePro.poverty !== null && poverty !== undefined)) ?insurancePackagePro && totalPrice >= 0 && patientDetails && patientDetails.gradeIcond ?
                                        <div style={{ paddingLeft: '10px', marginTop: '3px' }}><img src={patientDetails.gradeIcon} style={{ height: '20px' }} /></div> : null : null
                                    }
                                </div>
                            </div>
                        </Form.Item>
                    </Row>
                    <Row>
                        <Form.Item
                            label="授权确认书"
                            {...formItemStyle}
                        >
                            <div className="clearfix" style={{ display: 'flex' }} >
                                <Upload
                                    listType="picture-card"
                                    accept="image/png, image/jpeg"
                                    fileList={this.state.authorizationPicList}
                                    onPreview={this.handlePreview}
                                    onChange={(fileObj) => this.handleChange(fileObj, 'authorizationPicList')}
                                    beforeUpload={this.handleBeforeUpload}
                                    customRequest={this.customRequest}
                                    disabled={!this.patientId}
                                    action="_api/uploadImages"
                                    data={this.uploadFile}
                                >
                                    {this.state.authorizationPicList.length >= 5 ? null : uploadButton}
                                </Upload>
                                <div style={{ marginTop: '75px' }}>（上限5张）</div>
                            </div>
                        </Form.Item>
                    </Row>
                    <Row>
                        <Form.Item label="缴费方式" {...formItemStyle}>
                            <SmartSelectBox
                                editStatus
                                notEditableOnly={false}
                                onChange={(v) => this.payWayOnChange(v)}
                                buttonOptions={
                                    [
                                        { id: '1', name: '年缴' },
                                        // { id: '2', name: '月缴' },
                                    ]
                                }
                                getPopupContainer={() => document.getElementById('creatPatientInsurance')}
                                value={payWay}
                            />
                        </Form.Item>
                        {isSub && !payWay ? this.renderError() : null}
                    </Row>
                    <Row>
                        <Form.Item label="缴费金额" required {...formItemStyle}>
                            <div>
                                <div style={{ fontWeight: '600', display: 'flex', color: 'red' }}>
                                    {insurancePackagePro && payWay && payWay.length > 0 && payWay[0] === '2' ?
                                        (payPrice >= 0 ? `¥${(payPrice / 100).toFixed(2)}/月` : null)
                                        : (insurancePackagePro && payPrice >= 0 ? `¥${(payPrice / 100).toFixed(2)}/年` : null)
                                    }
                                </div>
                            </div>
                        </Form.Item>
                    </Row>
                    {payWay && payWay.length > 0 && payWay[0] === '2' ?
                        <Row>
                            <Form.Item label="缴费周期" required {...formItemStyle}>
                                <div>
                                    <div style={{ fontWeight: '600', display: 'flex', color: 'red' }}>
                                        12个月
                                </div>
                                </div>
                            </Form.Item>
                        </Row> : null
                    }
                    <Row>
                        <Col span={4} className="ant-form-item-label">
                            <label className="ant-form-item-required" title="支付金额">支付金额</label>
                        </Col>
                        <Col span={20}>
                            <Row>
                                <Col span={4}>
                                    <Form.Item label="" {...formItemStyle}>
                                        <Checkbox.Group
                                            onChange={(v) => this.countOnchange(v, 'isPoint')}
                                            style={{ width: '100%' }}
                                            value={isPoint}
                                        >
                                            <Checkbox
                                                value={1}
                                                disabled={(payWay && payWay.length > 0 && payWay[0] === '2') || ((patientDetails ? patientDetails.points : 0) <= 0) || payPrice <= 0}>
                                                积分抵扣
                                                </Checkbox>
                                        </Checkbox.Group>
                                    </Form.Item>
                                </Col>
                                <Col span={8} style={{ paddingTop: '5px' }}>
                                    {isPoint && isPoint.length > 0 && isPoint[0] === 1 ? `${payPoint || 0}分（¥${((payPoint || 0) / 100).toFixed(2)}）` : ''}
                                </Col>
                                <Col span={8} style={{ paddingTop: '5px' }}>
                                    当前可用积分值：{patientDetails && patientDetails.points ? patientDetails.points : 0}
                                    （折合¥{patientDetails && patientDetails.points ? (patientDetails.points / 100).toFixed(2) : `0.00`}）
                                </Col>
                            </Row>
                            <Row>
                                <Col span={4}>
                                    <Form.Item label="" {...formItemStyle}>
                                        <Checkbox.Group
                                            onChange={(v) => this.countOnchange(v, 'isInsuranceAccount')}
                                            style={{ width: '100%' }}
                                            value={isInsuranceAccount}
                                        >
                                            <Checkbox
                                                value={1}
                                                disabled={(payWay && payWay.length > 0 && payWay[0] === '2') || (insuranceAccountInfo ? insuranceAccountInfo.balance : 0) <= 0 || payPrice <= 0}>
                                                会员账户
                                            </Checkbox>
                                        </Checkbox.Group>
                                    </Form.Item>
                                </Col>
                                <Col span={8} style={{ paddingTop: '5px' }}>
                                    {isInsuranceAccount && isInsuranceAccount.length > 0 && isInsuranceAccount[0] === 1 ? `¥${((payInsuranceAccount || 0) / 100).toFixed(2)}` : ''}
                                </Col>
                                <Col span={8} style={{ paddingTop: '5px' }}>
                                    当前可用余额：¥{insuranceAccountInfo && insuranceAccountInfo.balance ? (insuranceAccountInfo.balance / 100).toFixed(2) : '0.00'}
                                </Col>
                            </Row>
                            {
                                payWay && payWay.length > 0 && payWay[0] === '2' ? (
                                    <Row>
                                        <Col span={24} style={{ color: 'grey', lineHeight: '55px' }}>登记成功后，自动扣除首月金额，后期将由系统自动扣费，扣费完成后会短信通知会员或在微信端查看</Col>
                                    </Row>
                                ) : null
                            }

                            {
                                payWay && payWay.length > 0 && payWay[0] === '2' ? null :
                                    <Row>
                                        <Col span={4}>
                                            <Form.Item label="" {...formItemStyle}>
                                                <Checkbox.Group
                                                    onChange={(v) => this.countOnchange(v, 'isCash')}
                                                    style={{ width: '100%' }}
                                                    value={isCash}
                                                >
                                                    <Checkbox value={1} disabled={payPrice <= 0}>W现金</Checkbox>
                                                </Checkbox.Group>
                                            </Form.Item>
                                        </Col>
                                        <Col span={8} style={{ paddingTop: '5px' }}>
                                            {isCash && isCash.length > 0 && isCash[0] === 1 ? `¥${((payCash || 0) / 100).toFixed(2)}` : ''}
                                        </Col>

                                    </Row>
                            }
                        </Col>
                    </Row>
                </Form>
            </Spin>
        )
    }

    renderThirdPage() {
        const {
            insurancePackageList, isSubmiting, diseasesList, cansub, selPatientRelDetails, patientDetails, selPatientReleation
        } = this.state;
        const sex = selPatientReleation && selPatientReleation[0] == '1' ? patientDetails && patientDetails.sex ? 1 : 0 : selPatientRelDetails && selPatientRelDetails.sex == 1 ? 1 : 0;
        return (
            <Form id="creatInsuranceDisease">
                        {
                            diseasesList && diseasesList.length ? diseasesList.map((item, index) => {
                                return (
                                    <div key={index}>
                                        <Title text={item.key + '、' + item.question + '（必填，可多选）'} left={5} />
                                        <Row>
                                            <Form.Item label="" {...formItemStyle}>
                                                <SmartSelectBox
                                                    editStatus
                                                    multiple
                                                    notEditableOnly={false}
                                                    buttonOptions={
                                                        item.answer.map((items,indexs) => {
                                                            if(items.sex_status === undefined || items.sex_status == sex){
                                                                return {
                                                                    id: String(indexs),
                                                                    name: items.name,
                                                                }
                                                            }
                                                        })
                                                    }
                                                    onChange={(val) => this.setqa(val, index, item)}
                                                    getPopupContainer={() => document.getElementById('creatPatientInsurance')}
                                                    value={this.state.q_list && this.state.q_list[item.id]}
                                                />
                                            </Form.Item>
                                        </Row>
                                        {this.state.q_list && this.state.q_list[item.id] && this.state.q_list[item.id].length ? item.type === 'forbidden' && item.answer && item.answer[Number(this.state.q_list[item.id][0])] && item.answer[Number(this.state.q_list[item.id][0])].value !== 'NONE' ? this.renderThirdError(index) : item.type === 'warning' ? this.renderWarn(this.state.q_list[item.id], index) : null : null}
                                    </div>
                                )
                            }) : null
                        }
                    </Form>
        )
    }

    render() {
        const { location_href, isSubmiting,needHealthq } = this.state;
        const title = "登记会员服务";
        return(
            <div>
                <Modal
                    title={title}
                    visible={true}
                    width={900}
                    maskClosable={false}
                    onCancel={this.hideGroupModal}
                    footer={this.renderFooter()}
                >
                    {location_href === 1 ? this.renderIndexPage() : location_href === 2 ? this.renderSecondPage() : location_href === 3 ? this.renderThirdPage() : null}
                </Modal>
            </div>
        )
    }
}

const WrappedNormalLoginForm = Form.create({ name: 'creatPatientInsurance' })(CreatPatientInsuranceOrder);

export default connectModalHelper(connect(WrappedNormalLoginForm));
