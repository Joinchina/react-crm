import React, { Component } from 'react'
import { connect } from 'react-redux'
import { connectRouter } from '../../mixins/router'
import { Icon, Select, Form, Col, Row, Tag, AutoComplete, InputNumber, Alert, Modal, Button, Spin } from 'antd'
import message from '@wanhu/antd-legacy/lib/message'
import SmartSelectForMedicineWithNumber from '../common/SmartSelectForMedicineWithNumber'
import SmartInputNumber from '../common/SmartInputNumber'
import { centToYuan, refundRountCentPercentToCent } from '../../helpers/money'
import api from '../../api/api';
import '../customerCenter/CreateOrder.scss'
import ReplaceBtn from '../../images/tihuan.png';
const Option = AutoComplete.Option
const FormItem = Form.Item
const VerifyLevelMap = {
    warning: 'warning',
    forbidden: 'error',
    further_information: 'error',
    manual_review: 'warning',

}
const FrequencyFieldOptions = {
    rules: [
        { required: true, message: '请选择' },
    ]
};
const UseAmountFieldOptions = {
    rules: [
        { required: true, message: '请输入单次用量' },
    ]
};
const AmountFieldOptions = {
    rules: [
        { required: true, message: '请输入购买数量' },
    ]
};
const FREQUENCY = {
    1: [1, 1],
    2: [2, 1],
    3: [3, 1],
    4: [4, 1],
    5: [1, 1],
    6: [1, 7],
};

class AddMedicineToOrder extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: true,
            hospitalForStore: null,
            refundType: null,
        };
        this.form = props.form;
        this.defaultPurchaseQuantity = 1;
        this.nameArr = [];
    }
    async componentWillMount() {
        const { getFieldDecorator } = this.props.form;
        getFieldDecorator('medicineKeys', { initialValue: [] });
        if (this.props.orderId) {
            this.orderId = this.props.orderId;
        }
        if (window.STORE_LOGINNAME.split(',').indexOf(this.props.auth.loginName) >= 0) {
            const hospitalForStore = await api.getHospitalById(window.STORE_HOSPITALID);
            this.setState({ hospitalForStore })
        }

    }

    handleOnClick = () => {
        if (!this.props.hospitalId) {
            message.warning('请先选择用户');
        }
    }

    async getRecommandDrugs(drugIds, hospitalId) {
        if (!drugIds || drugIds.length <= 0) {
            return [];
        }
        const recommandDrugList = await api.getRecommandDrugs(drugIds, hospitalId);
        return recommandDrugList;
    }

    async componentWillReceiveProps(nextProps) {
        this.nameArr = [];//清除会员再选择该会员，数组值重复
        if (nextProps.orderId) {
            this.orderId = nextProps.orderId;
            const thisOrderInfoResultStatus = this.props.addMedicineRegister.getOrderInfoResult.status;
            const nextOrderInfoResultStatus = nextProps.addMedicineRegister.getOrderInfoResult.status;
            //初始化订单
            if (thisOrderInfoResultStatus !== nextOrderInfoResultStatus) {
                if (nextOrderInfoResultStatus === 'fulfilled') {
                    const orderDetails = nextProps.addMedicineRegister.getOrderInfoResult.payload;
                    const { drugs } = orderDetails;
                    drugs.forEach(row => {
                        this.addHistoryDrugsToForm({ ...row, drugId: row.id });
                    })
                }
            }
            return;
        }
        if (!nextProps.thirdOrderId) {
            this.thirdOrderId = undefined;
        }
        if (nextProps.thirdOrderId !== this.props.thirdOrderId && nextProps.thirdOrderList && nextProps.thirdOrderList.length > 0) {
            if (nextProps.thirdOrderId) {
                const medicineKeys = this.props.form.getFieldValue('medicineKeys');
                medicineKeys.forEach((item) => { this.removeRow(item) });
                this.thirdOrderId = nextProps.thirdOrderId;
                const { thirdOrderList } = nextProps;
                const order = thirdOrderList.find((item) => item.orderId === this.thirdOrderId);
                const { drugs } = order;
                drugs.forEach(row => {
                    this.addHistoryDrugsToForm({ ...row, drugId: row.id });
                })
                return;
            }
        }
        if (window.STORE_LOGINNAME.split(',').indexOf(this.props.auth.loginName) >= 0 ) {
            if( nextProps.refundType && this.props.refundType !== nextProps.refundType){
                this.setState({ refundType: nextProps.refundType });
            }
            return;
        }


        // nextProps.isEstimatedPickup初始值为undefined,此时不满足true，但不能加载默认药品，为false时严格加载默认药品
        if (nextProps.isEstimatedPickup && nextProps.hospitalId && window.STORE_LOGINNAME.split(',').indexOf(this.props.auth.loginName) < 0) {
            const thisHistoricalStatus = this.props.addMedicineRegister.getHistoricalDrugsResult.status;
            const nextHistoricalStatus = nextProps.addMedicineRegister.getHistoricalDrugsResult.status;
            const thisRegularStatus = this.props.addMedicineRegister.getRegularMedicationResult.status;
            const nextRegularStatus = nextProps.addMedicineRegister.getRegularMedicationResult.status;
            if (thisRegularStatus != nextRegularStatus || thisHistoricalStatus !== nextHistoricalStatus || this.props.hospitalId != nextProps.hospitalId) {
                if (nextProps.addMedicineRegister.getRegularMedicationResult && nextProps.addMedicineRegister.getRegularMedicationResult.status === 'fulfilled') {
                    if (nextProps.addMedicineRegister.getHistoricalDrugsResult && nextProps.addMedicineRegister.getHistoricalDrugsResult.status === 'fulfilled') {
                        if (nextProps.addMedicineRegister.getRegularMedicationResult.payload) {
                            const drugs = nextProps.addMedicineRegister.getRegularMedicationResult.payload.drugs;
                            if (drugs && drugs.length > 0) {
                                let drugIds = [];
                                drugs.forEach(row => {
                                    drugIds.push(row.drugId.toString());
                                });
                                const recommandDrugs = await this.getRecommandDrugs(drugIds, nextProps.hospitalId);
                                drugs.forEach(row => {
                                    const recommandDrug = recommandDrugs.find(e => e.drugId === row.drugId.toString());
                                    row = {
                                        ...row,
                                        recommendDrugs: recommandDrug,
                                    }
                                    this.addHistoryDrugsToForm(row);
                                })
                            } else {
                                const HistoricalPayload = nextProps.addMedicineRegister.getHistoricalDrugsResult.payload;
                                if (HistoricalPayload) {
                                    let drugIds = [];
                                    HistoricalPayload.forEach(row => {
                                        drugIds.push(row.drugId.toString());
                                    });
                                    const recommandDrugs = await this.getRecommandDrugs(drugIds, nextProps.hospitalId);
                                    nextProps.addMedicineRegister.getHistoricalDrugsResult.payload.forEach(row => {
                                        const recommandDrug = recommandDrugs.find(e => e.drugId === row.drugId.toString());
                                        row = {
                                            ...row,
                                            recommendDrugs: recommandDrug,
                                        }
                                        this.addHistoryDrugsToForm(row);
                                    })
                                }
                            }
                        }
                    }
                    if (this.nameArr.length !== 0) {
                        let drugNames = this.nameArr.join();
                        Modal.confirm({
                            visible: this.state.visible,
                            title: <span style={{ fontSize: '14px' }}>规律取药药品中，{drugNames}已变为目录外/停售药品，无法登记用药，请维护规律订药信息</span>,
                            okText: '去维护',
                            cancelText: '忽略',
                            iconType: 'exclamation-circle',
                            onOk: () => {
                                this.setState({ visible: false });
                                this.props.router.set(
                                    {
                                        query: { r: this.props.router.query.r },
                                        path: `/customerDetails/${this.props.patientId}/RegularMedication`
                                    }, {
                                    reset: true, replace: true
                                }
                                );
                            },
                            onCancel: () => {
                                this.setState({ visible: false })
                            }
                        })
                    }
                }
            }
        } else if (nextProps.isEstimatedPickup === false && nextProps.hospitalId) {
            if (this.props.addMedicineRegister.getHistoricalDrugsResult != nextProps.addMedicineRegister.getHistoricalDrugsResult || this.props.hospitalId != nextProps.hospitalId) {
                if (nextProps.addMedicineRegister.getHistoricalDrugsResult && nextProps.addMedicineRegister.getHistoricalDrugsResult.status && nextProps.addMedicineRegister.getHistoricalDrugsResult.status === 'fulfilled') {
                    const medicineRegister = nextProps.addMedicineRegister.getHistoricalDrugsResult.payload;
                    let drugIds = [];
                    medicineRegister.forEach(row => {
                        drugIds.push(row.drugId.toString());
                    });
                    const recommandDrugs = await this.getRecommandDrugs(drugIds, nextProps.hospitalId);
                    nextProps.addMedicineRegister.getHistoricalDrugsResult.payload.forEach(row => {
                        const recommandDrug = recommandDrugs.find(e => e.drugId === row.drugId.toString());
                        row = {
                            ...row,
                            recommendDrugs: recommandDrug,
                        }
                        this.addHistoryDrugsToForm(row);
                    })
                }
            }
        }

    }

    addHistoryDrugsToForm = value => {
        if (value.status > 1) {
            let productName = value.productName ? `(${value.productName})` : ''
            const name = value.commonName + productName
            this.nameArr.push(name)
        } else {
            this.setFields(value);
        }
    }

    setFields(value) {
        let uuid = value.drugId
        const { getFieldDecorator, getFieldValue, setFieldsValue, resetFields } = this.form
        let medicineKeys = getFieldValue('medicineKeys')
        getFieldDecorator(`medicine_${uuid}_data`, { initialValue: value })
        if (medicineKeys.indexOf(uuid) === -1) {
            setFieldsValue({ medicineKeys: [...medicineKeys, uuid] })
        }
        let useAmount = parseInt(value.useAmount, 10) || 0
        if (isNaN(useAmount) || useAmount == 0) useAmount = 1
        getFieldDecorator(`medicine_${uuid}_useAmount`, {
            ...UseAmountFieldOptions,
            initialValue: useAmount
        })
        let frequency = value.frequency ? value.frequency : undefined
        getFieldDecorator(`medicine_${uuid}_frequency`, {
            ...FrequencyFieldOptions,
            initialValue: frequency
        })
        let amount = parseInt(value.amount, 10)
        if (isNaN(amount) || amount == 0) amount = this.defaultPurchaseQuantity
        getFieldDecorator(`medicine_${uuid}_amount`, {
            ...AmountFieldOptions,
            initialValue: amount
        })
        // 解决删除后重新添加同一药品表单值不正常问题
        resetFields([`medicine_${uuid}_amount`, `medicine_${uuid}_frequency`, `medicine_${uuid}_useAmount`])
    }

    addDrugToForm = (value, number) => {
        let uuid = value.drugId
        const { getFieldDecorator, getFieldValue, setFieldsValue, resetFields } = this.form
        let medicineKeys = getFieldValue('medicineKeys');
        getFieldDecorator(`medicine_${uuid}_data`, { initialValue: value })
        if (medicineKeys.indexOf(uuid) === -1) {
            setFieldsValue({ medicineKeys: [...medicineKeys, uuid] })
        }
        let useAmount = parseInt(value.useAmount, 10)
        getFieldDecorator(`medicine_${uuid}_useAmount`, {
            ...UseAmountFieldOptions,
            initialValue: useAmount < 999 ? useAmount : 999
        })
        let frequency = value.frequency ? value.frequency : undefined
        getFieldDecorator(`medicine_${uuid}_frequency`, {
            ...FrequencyFieldOptions,
            initialValue: frequency
        })
        getFieldDecorator(`medicine_${uuid}_amount`, {
            ...AmountFieldOptions,
            initialValue: number < 999 ? number : 999
        })
        // 解决删除后重新添加同一药品表单值不正常问题
        resetFields([`medicine_${uuid}_amount`, `medicine_${uuid}_frequency`, `medicine_${uuid}_useAmount`])
    }

    handleMedicineSelect = async (value, number) => {
        const { getFieldDecorator, getFieldValue, setFieldsValue } = this.form
        value = typeof value == 'object' ? value : JSON.parse(value)
        let uuid = value.drugId
        let medicineKeys = getFieldValue('medicineKeys')
        if (medicineKeys.indexOf(uuid) !== -1) {
            let productName = value.productName ? `(${value.productName})` : ''
            message.warning(`${value.commonName}${productName} 已存在`)
            return
        }
        const recommendDrugs = await this.getRecommandDrugs([value.drugId.toString()], this.props.hospitalId);
        value = {
            ...value,
            recommendDrugs: recommendDrugs.find(e => e.drugId === value.drugId.toString()),
        }
        this.addDrugToForm(value, number)
    }

    removeRow = k => {
        const medicineKeys = this.form.getFieldValue('medicineKeys');
        this.form.setFieldsValue({
            medicineKeys: medicineKeys.filter(key => key !== k)
        });
        const { resetVerifyResult } = this.props;
        resetVerifyResult();
    }

    mapAsyncDataToOption = data => {
        return data.map((row, index) => {
            let productName = row.productName ? `(${row.productName})` : ''
            let statusMap = { 0: '正常', 2: '目录外', 3: '停售' }
            let status
            let priceCent = row.priceCent
            if (!priceCent) {
                priceCent = 0
            }
            let price = row.priceCent ? `零售价：¥${centToYuan(priceCent, 2)}` : ''
            let whScale = priceCent ? `报销比例：${row.whScale}%` : ''
            let reimbursement
            if (row.priceCent) {
                const actualPriceCent = priceCent - (priceCent * (row.whScale / 100.00));
                reimbursement = `报销价：¥${Math.round(actualPriceCent * 100) / 10000}`
            }
            status = row.status > 1 && <Tag style={{ marginLeft: 5 }} color='#e44d42'>{statusMap[row.status]}</Tag>
            return (
                <Option key={index} disabled={row.status > 1} value={JSON.stringify(row)}>
                    <Row gutter={5}>
                        <Col span={6} style={{ whiteSpace: 'normal' }}>
                            <span>{row.commonName}{productName}{status}</span>
                        </Col>
                        <Col span={6} style={{ whiteSpace: 'normal' }}>
                            <p>{row.preparationUnit + '*' + row.packageSize + row.minimumUnit + '/' + row.packageUnit}</p>
                            <p>{row.producerName}</p>
                        </Col>
                        {row.status < 1 && <Col span={4}>{price}</Col>}
                        {row.status < 1 && <Col span={4}>{whScale}</Col>}
                        {row.status < 1 && <Col span={4}>{reimbursement}</Col>}
                    </Row>
                </Option>
            )
        })
    }

    getDrugPrompt = () => {
        const drugPrompt = this.props.drugPrompt
        const historyDrugs = this.props.addMedicineRegister.getHistoricalDrugsResult.payload
        if (drugPrompt && Array.isArray(drugPrompt.payload) && historyDrugs && Array.isArray(historyDrugs)) {
            return drugPrompt.payload.map((row, index) => {
                for (let i = 0; i < historyDrugs.length; i++) {
                    if (historyDrugs[i].drugId == row.drugId) return null
                }
                let ms = <div className='drugPrompt'>该患者所需 【<a onClick={() => this.handleMedicineSelect(row)} style={{ textDecoration: 'underline' }}> <strong>{row.commonName}</strong> {row.productName} {row.preparationUnit + '*' + row.packageSize + row.minimumUnit + '/' + row.packageUnit + ' ' + row.producerName}</a>】 已经开始供药</div>
                let close = <span className="drugPrompt">不再提示 <Icon type='close' /></span>
                return <Alert onClose={() => this.props.putDrugTip(row.id)} style={{ margin: 5 }} key={index} type='warning' message={ms} showIcon={true} closeText={close} />
            })
        }
    }

    handleMaxTakeTime = () => {
        const getFieldValue = this.props.form.getFieldValue;
        let medicineKeys = getFieldValue('medicineKeys')
        if (medicineKeys.length !== 0) {
            this.taketimeArr = medicineKeys.map(v => {
                let packageSize = getFieldValue(`medicine_${v}_data`).packageSize;
                let amount = getFieldValue(`medicine_${v}_amount`) ? Number(getFieldValue(`medicine_${v}_amount`)) : undefined;
                let useAmount = getFieldValue(`medicine_${v}_useAmount`) ? getFieldValue(`medicine_${v}_useAmount`) : undefined;
                let frequency = getFieldValue(`medicine_${v}_frequency`)
                let taketime = isNaN(packageSize / (useAmount * frequency) * amount) ? '' : Math.ceil(packageSize * amount / (useAmount * FREQUENCY[frequency][0])) * FREQUENCY[frequency][1];
                return taketime
            })
            this.maxTakeTime = Math.max(...this.taketimeArr);
        } else {
            this.maxTakeTime = 0;
        }
        return this.maxTakeTime;
    }

    validateUseAmount = (rule, value, callback) => {
        const val = String(value);
        const point = val.indexOf('.');
        const num = val.substring(point + 1);
        if (point !== -1 && num && num !== "5") {
            callback('请输入合法的单次用量');
        } else {
            callback();
        }
    }

    async replaceDrug(oldDrugId, newDrug) {
        const {
            getFieldValue,
        } = this.form;
        let medicineKeys = getFieldValue('medicineKeys');
        const index = medicineKeys.findIndex(d => d === oldDrugId);
        const newDrugIndex = medicineKeys.findIndex(d => d === newDrug.drugId);
        if (newDrugIndex >= 0) {
            this.form.setFieldsValue({
                medicineKeys: medicineKeys.filter(key => key !== oldDrugId)
            })
            return;
        }
        const recommendDrugs = await this.getRecommandDrugs([newDrug.drugId.toString()], this.props.hospitalId);
        newDrug = {
            ...newDrug,
            recommendDrugs: recommendDrugs.find(e => e.drugId === newDrug.drugId.toString()),
        }
        const newKeys = [];
        medicineKeys.forEach(e => {
            newKeys.push(e);
        });
        newKeys[index] = newDrug.drugId;
        this.form.getFieldDecorator(`medicine_${newDrug.drugId}_data`, { initialValue: newDrug })
        this.form.setFieldsValue({ medicineKeys: newKeys })
        await this.addDrugToForm(newDrug, null);
    }

    render() {
        let totalPriceCent = 0;
        let totalRefundCentPercent = 0;
        const {
            getFieldValue,
            getFieldDecorator
        } = this.form
        const medicineKeys = getFieldValue('medicineKeys');
        const formItems = medicineKeys.map((v, index) => {
            const medicineRowData = getFieldValue(`medicine_${v}_data`);
            let priceCent = medicineRowData.priceCent ? medicineRowData.priceCent : 0;
            let price = centToYuan(priceCent, 2)
            let productName = medicineRowData.productName ? `(${medicineRowData.productName})` : ''
            const drugId = medicineRowData.drugId ? medicineRowData.drugId : '';
            const amount = getFieldValue(`medicine_${v}_amount`) ? Number(getFieldValue(`medicine_${v}_amount`)) : undefined;
            const useAmount = getFieldValue(`medicine_${v}_useAmount`) ? Number(getFieldValue(`medicine_${v}_useAmount`)) : undefined;
            let frequency = getFieldValue(`medicine_${v}_frequency`) || undefined;
            let rowPriceCent = 0;
            if (amount) {
                rowPriceCent = priceCent * amount
                totalPriceCent += rowPriceCent
                totalRefundCentPercent += priceCent * amount * (medicineRowData.whScale || 0);
            }
            let maxAmountAlert;
            if (this.props.warnings && this.props.warnings.verifyDrugMaxAmount) {
                const dict = this.props.warnings.verifyDrugMaxAmount;
                if (dict.forbidden[drugId]) {
                    maxAmountAlert = 'error';
                } else if (dict.warning[drugId]) {
                    maxAmountAlert = 'warning';
                }
            }
            let maxUseAmountAlert;
            if (this.props.warnings && this.props.warnings.verifyDrugMaxUseAmount) {
                const dict = this.props.warnings.verifyDrugMaxUseAmount;
                if (dict.forbidden[drugId]) {
                    maxUseAmountAlert = 'error';
                } else if (dict.warning[drugId]) {
                    maxUseAmountAlert = 'warning';
                }
            }

            let standard = medicineRowData.standard ? medicineRowData.standard : medicineRowData.preparationUnit + '*' + medicineRowData.packageSize + medicineRowData.minimumUnit + '/' + medicineRowData.packageUnit
            let everyamout = medicineRowData ? medicineRowData.packageSize ? medicineRowData.packageSize : 0 : 0;
            let taketime = isNaN(everyamout / (useAmount * frequency) * amount) ? '' : Math.ceil(amount * everyamout / (useAmount * FREQUENCY[frequency][0])) * FREQUENCY[frequency][1];

            const recommendDrugs = medicineRowData.recommendDrugs
                ? medicineRowData.recommendDrugs : [];
            let recommendDrugList;
            if (recommendDrugs && recommendDrugs.replaceDrugs) {
                recommendDrugList = recommendDrugs.replaceDrugs.map((item) => {
                    const rProductName = item.productName ? `${item.commonName}(${item.productName})` : item.commonName;
                    const rStandard = item.standard ? item.standard : `${item.preparationUnit}*${item.packageSize}${item.minimumUnit}/${item.packageUnit}`;
                    const rProducerName = item.producerName;
                    const rPriceCent = item.priceCent ? item.priceCent : 0;
                    const rWhScale = Math.floor(rPriceCent * item.whScale) / 10000;
                    const rPrice = centToYuan(rPriceCent, 2);
                    const rRecommendedLevel = item.recommendedLevel;
                    return (
                        <tr key={item.drugId} className="drug-alert">
                            <td colSpan="9" style={{ color: '#1DA57A' }}>
                                <Row className="validate_info_span" key={item.drugId} >
                                    <Col span={5}>
                                        推荐用药：
										{rProductName}
                                    </Col>
                                    <Col span={3}>
                                        {rStandard}
                                    </Col>
                                    <Col span={5}>
                                        {rProducerName}
                                    </Col>
                                    <Col span={2}>
                                        ¥
										{rPrice}
                                    </Col>
                                    <Col span={3}>
                                        报销额￥{rWhScale}
                                    </Col>
                                    <Col span={2} style={{ fontWeight: 'bold' }}>
                                        推荐级{rRecommendedLevel}
                                    </Col>
                                    <Col span={1}>
                                        <Button onClick={() => this.replaceDrug(v, item)} title="替换" ghost style={{ border: '0px', height: '20px' }}>
                                            <img src={ReplaceBtn} alt="" />
                                        </Button>
                                    </Col>
                                </Row>
                            </td>
                        </tr>
                    );
                });
            }
            return <tbody className={`drug-item -x-repeat-drugs -x-index-${index} -x-key-${v}`} key={v}>
                <tr>
                    <td>{medicineRowData.commonName}{productName}</td>
                    <td>{standard}</td>
                    <td>
                        <FormItem
                            label=''
                            validateStatus={maxUseAmountAlert}
                        >
                            {getFieldDecorator(`medicine_${v}_useAmount`, {
                                ...UseAmountFieldOptions,
                                initialValue: (medicineRowData.useAmount || 1) * 1,
                                rules: [
                                    { required: true, message: '请输入单次用量' },
                                    { validator: this.validateUseAmount }
                                ],
                            })(
                                <SmartInputNumber
                                    className="-x-id-use_amount"
                                    id={'medicine_' + v + '_useAmount'}
                                    editStatus={true}
                                    placeholder=""
                                    min={0.5}
                                    max={999}
                                    maxLength='5'
                                    parser={(value) => {
                                        const val = String(value);
                                        const point = val.indexOf('.');
                                        const num = val.substring(point + 1);
                                        if (point && num) {
                                            value = parseFloat(value);
                                        }
                                        return isNaN(value) ? '' : value
                                    }}
                                    text={medicineRowData.minimumUnit}
                                />
                            )}
                        </FormItem>
                    </td>

                    <td>
                        <FormItem
                            label=''
                        >
                            {getFieldDecorator(`medicine_${v}_frequency`, {
                                ...FrequencyFieldOptions,
                            })(
                                <Select
                                    className="-x-id-frequency"
                                    placeholder='请选择'
                                    getPopupContainer={() => document.getElementById('addMedicineRegisterForm')}
                                >
                                    <Select.Option key='1' >qd 每日一次</Select.Option>
                                    <Select.Option key='2' >bid 每日两次</Select.Option>
                                    <Select.Option key='3' >tid 每日三次</Select.Option>
                                    <Select.Option key='4' >qid 每日四次</Select.Option>
                                    <Select.Option key='5' >qn 每夜一次</Select.Option>
                                    <Select.Option key='6' >qw 每周一次</Select.Option>
                                </Select>
                            )}
                        </FormItem>
                    </td>

                    <td>
                        <FormItem
                            label=''
                        >
                            {price}
                        </FormItem>
                    </td>

                    <td>
                        <FormItem
                            label=''
                            validateStatus={maxAmountAlert}
                        >
                            {getFieldDecorator(`medicine_${v}_amount`, {
                                ...AmountFieldOptions
                            })(
                                <InputNumber
                                    min={1}
                                    max={999}
                                    maxLength='3'
                                    placeholder=""
                                    className="-x-id-amount"
                                    parser={(value) => {
                                        value = parseInt(value, 10)
                                        return isNaN(value) ? '' : value
                                    }}
                                />
                            )}
                        </FormItem>
                    </td>

                    <td>
                        <FormItem
                            label=''
                        >
                            ¥{centToYuan(rowPriceCent, 2)}
                        </FormItem>
                    </td>

                    <td>
                        <FormItem
                            label=''
                        >
                            {taketime}天
						</FormItem>
                    </td>

                    <td>
                        <a className="-x-id-remove" onClick={() => this.removeRow(v)}>删除</a>
                    </td>
                </tr>
                {this.renderDrugWarnings(medicineRowData.drugId)}
                {recommendDrugList}
            </tbody>
        })
        const totalRefundCent = refundRountCentPercentToCent(totalRefundCentPercent);
        const actualPriceCent = totalPriceCent - totalRefundCent;
        const interval = this.props.interval;
        const selfware = this.props.selfware;
        const nowRefundMoney = this.props.refundMoney || 0;
        return (
            <Spin spinning={this.orderId !== undefined || this.thirdOrderId !== undefined} wrapperClassName="spin-create-order" >
                <div className='form-table-box block' id='addCustomerMedicine'>
                    <table>
                        <thead>
                            <tr>
                                <th width='20%'> 通用名（商品名）</th>
                                <th width='10%'>规格</th>
                                <th width='13.5%'>单次用量</th>
                                <th width='15%'>频次</th>
                                <th width='7.5%'>单价¥</th>
                                <th width='7.5%'>购买数量</th>
                                <th width='7.5%'>总价¥</th>
                                <th width='8.5%'>预计服用时长</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        {formItems}
                        <tbody>
                            <tr>
                                <td colSpan="50">
                                    <Col span={12}>
                                        <SmartSelectForMedicineWithNumber
                                            {...this.props}
                                            inputClassName="-x-id-add_medicine"
                                            rowIndexClassNamePrefix="-x-repeat-add_medicine -x-index-"
                                            numberClassName="-x-id-add_medicine-amount"
                                            editStatus={true}
                                            uuid='AddMedicineToOrder'
                                            placeholder='阿司匹林/ASPL'
                                            disabled={this.props.hospitalId ? false : true}
                                            onSelect={this.handleMedicineSelect}
                                            mapAsyncDataToOption={this.mapAsyncDataToOption}
                                            mapValueToAutoComplete={value => {
                                                try {
                                                    value = value ? JSON.parse(value) : null
                                                    return typeof value == 'object' ? '' : String(value)
                                                } catch (e) {
                                                    console.warn(e)
                                                    return value
                                                }
                                            }}
                                        />
                                    </Col>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div>
                        {this.getDrugPrompt()}
                    </div>
                    <Row>
                        <Col span={24}>
                            <Row>
                            {this.orderId ? <Col span={8}/> :
                                null
                            }
                                <Col span={8}>
                                    <div style={{ lineHeight: '31.9999px', color: 'rgba(0, 0, 0, 0.65)', textAlign: 'right', height: 56 }}><span style={{ color: 'rgba(0, 0, 0, 0.85)' }}>预计服用时长：</span>{this.handleMaxTakeTime()}天</div>
                                </Col>

                                <Col span={8}>
                                    <div style={{ lineHeight: '31.9999px', color: 'rgba(0, 0, 0, 0.65)', textAlign: 'center', height: 56 }}><span style={{ color: 'rgba(0, 0, 0, 0.85)' }}>药费合计：</span>¥{centToYuan(totalPriceCent, 2)}</div>
                                </Col>
                                {this.orderId ? null :
                                <Col span={8}>
                                    {window.STORE_LOGINNAME.split(',').indexOf(this.props.auth.loginName) < 0 ?
                                        <div style={{ lineHeight: '31.9999px', color: 'rgba(0, 0, 0, 0.65)', textAlign: 'left' }}>
                                        <span style={{ color: 'rgba(0, 0, 0, 0.85)' }}>最高报销</span>：
                                        ¥{nowRefundMoney.amount || 0}（或积分{nowRefundMoney.integral || 0}分）
                                    </div> : <div style={{ lineHeight: '31.9999px', color: 'rgba(0, 0, 0, 0.65)', textAlign: 'left' }}>
                                        <span style={{ color: 'rgba(0, 0, 0, 0.85)' }}>最高报销</span>：
                                        ¥{centToYuan(totalRefundCent, 1)}（或积分{Math.ceil(totalRefundCentPercent / 100)}分）
                                    </div>
                                    }
                                    <div style={{height: 56,  color: 'rgba(0, 0, 0, 0.65)'}}>(实际报销额度以最终结果为准)</div>
                                </Col>}
                            </Row>
                        </Col>
                    </Row>
                </div>
            </Spin>
        )
    }

    renderDrugWarnings(drugId) {
        if (!drugId) return null;
        if (!this.props.warnings || !this.props.warnings.verifyDrugWarnings || !this.props.warnings.verifyDrugWarnings[drugId]) {
            return null;
        }
        return this.props.warnings.verifyDrugWarnings[drugId].map((w, i) => {
            return <tr key={i} className="drug-alert"><td colSpan="8">
                <Form.Item validateStatus={VerifyLevelMap[w.level]}>
                    <div className="ant-form-explain">{w.message}</div>
                </Form.Item>
            </td></tr>
        })
    }

}

function select(state) {
    return {
        auth: state.auth.payload,
        addMedicineRegister: state.addMedicineRegister,
    }
}

export default connectRouter(connect(select)(AddMedicineToOrder))
