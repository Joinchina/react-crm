import React, { Component } from 'react';
import {
    Button, Form, Row, Col, Select, Modal, DatePicker,
} from 'antd';
import message from '@wanhu/antd-legacy/lib/message'
import moment from 'moment';
import { connectRouter } from '../../../mixins/router';
import { SmartSelectSingleAsync } from '../../common/SmartSelectSingle';
import ReserveRemarkField from '../../common/TextAreaField';
import api from '../../../api/api';
import PropeTypes from '../../../helpers/prop-types';

const { Option } = Select;
const FormItem = Form.Item;
const formItemLayout = {
    labelCol: { span: 3 },
    wrapperCol: { span: 21 },
};
const formItemLayoutTime = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
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
const worktimeMap = [
    {
        id: '1',
        label: '上午8：00~12：00',
    },
    {
        id: '2',
        label: '下午14：00~17：00',
    },
    {
        id: '3',
        label: '全天8：00~17：00',
    },
];
class AddCustomerReserve extends Component {
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

    onChangeDoctor = async (value) => {
        const { form } = this.props;
        form.setFieldsValue({ day: undefined, time: undefined });
        const params = {
            where: {
                doctorId: value.key,
                workDay: { $gte: moment().format('YYYY-MM-DD') },
            },
        };
        const res = await api.getDoctorSchedules(params);
        this.doctorSchedules = res.datas && res.datas.map(item => ({
            workday: item.workday,
            worktime: item.worktime,
        }));
    }

    onChangeDate = (date, dateString) => {
        const { form } = this.props;
        form.resetFields(['time']);
        const { worktime } = this.doctorSchedules.find(item => item.workday === dateString);
        this.setState({ worktime });
    }

    onOpenChange = (open) => {
        if (open) {
            const { patientDetails } = this.state;
            const regularTiming = patientDetails
                && patientDetails.isEstimatedPickup && patientDetails.estimatedPickupDate;
            if (regularTiming) {
                this.setState({ isShowRegularTime: true });
            }
        }
    }

    onSubmit = () => {
        const { form, router } = this.props;
        form.validateFields(async (err) => {
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
            const { getFieldValue } = form;
            const { patientDetails } = this.state;
            const { hospital } = patientDetails;
            try {
                this.setState({ submitting: true });
                const params = {
                    patientId: this.patientId,
                    doctorId: getFieldValue('doctor').key,
                    hospitalId: hospital.id,
                    appointmentTimeStr: moment(getFieldValue('day')).format('YYYY-MM-DD'),
                    appointmentFlag: getFieldValue('time'),
                    reservationSource: getFieldValue('source'),
                    remarks: getFieldValue('remarks'),
                };
                const match = router.match('/taskDetail/:taskId') || router.match('/taskPool/:taskPoolId/task/:taskId');
                if (match) {
                    params.channelId = match.taskId;
                }
                await api.postReservationRecord(params);
                message.success('保存成功', 2,
                    () => {
                        this.setState({ submitting: false });
                        router.closeModal();
                    });
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
        this.doctorSchedules = undefined;
        this.setState({
            patientDetails: undefined,
            patientFieldValue: undefined,
            doctors: undefined,
            isShowRegularTime: undefined,
            worktime: undefined,
        });
    }

    handlePatientSelect = (value) => {
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
            if(optionData[index].signStatus===0) {
                Modal.warning({
                    content: '该会员信息缺失，不可进行订药、预约、领取红包等业务。请先完善信息，再进行其他操作。',
                    onOk: ()=>{this.props.router.push(`/customerDetails/${optionData[index].id}?editStatus=true`)},
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

    handleDisabledDate = (current) => {
        if (!this.patientId) {
            return true;
        }
        if (!current) return null;
        const allowDate = this.doctorSchedules;
        if (allowDate && allowDate.some(item => item.workday === current.format('YYYY-MM-DD').valueOf())) {
            return current && current.valueOf() < Date.now();
        }
        return current && current.valueOf();
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
            const patientDetails = await api.getPatient(id);
            const doctors = await api.getDoctorsByHospitalId(patientDetails.hospital.id);
            const age = patientDetails.birthday ? `/${this.getAgeByBirthday(patientDetails.birthday)}岁` : '';
            const label = `${patientDetails.name} (${patientDetails.sex ? '男' : '女'}${age}) ${patientDetails.phone || ''} ${patientDetails.machineNumber || ''} ${patientDetails.address.liveStreet || ''} ${patientDetails.hospital.name || ''}`;
            const patientFieldValue = {
                key: id,
                label,
            };
            const params = {
                where: {
                    doctorId: patientDetails.doctor.id,
                    workDay: { $gte: moment().format('YYYY-MM-DD') },
                },
            };
            const res = await api.getDoctorSchedules(params);
            this.doctorSchedules = res.datas && res.datas.map(item => ({
                workday: item.workday,
                worktime: item.worktime || '3',
            }));
            this.setState({ patientFieldValue, patientDetails, doctors });
        } catch (e) {
            message.error(e.message);
        }
    }

    render() {
        const { form } = this.props;
        const { getFieldDecorator } = form;
        const {
            patientDetails,
            patientFieldValue,
            doctors,
            submitting,
            isShowRegularTime,
            worktime,
        } = this.state;
        let doctorOptions = [];
        let doctorItem;
        if (doctors && patientDetails) {
            const doctorsList = [...doctors.list];
            const signDoctorId = patientDetails.doctor.id;
            const signDoctor = doctorsList.find(item => item.id === signDoctorId);
            if (signDoctor) {
                doctorsList.splice(doctorsList.indexOf(signDoctor), 1);
                doctorsList.unshift(signDoctor);
                doctorItem = patientDetails && patientDetails.doctor && { key: patientDetails.doctor.id, label: `${patientDetails.doctor.name}（签约医生）` };
            }
            doctorOptions = doctorsList && doctorsList.map(row => (
                <Option key={row.id}>
                    {row.id === signDoctorId ? `${row.name}（签约医生）` : row.name}
                </Option>
            ));
        }
        const timeOptions = worktimeMap.map(time => (
            <Option key={time.id} title={time.label} disabled={worktime !== time.id}>
                {time.label}
            </Option>
        ));
        const modalFooter = (
            <Row>
                <Button type="primary" loading={submitting} onClick={this.onSubmit}>
                    保存
                </Button>
                <Button type="primary" className="cancelButton" disabled={submitting} onClick={this.onCancel}>
                    取消
                </Button>
            </Row>
        );
        return (
            <div>
                <Modal
                    title="新建会员预约"
                    width={900}
                    visible
                    style={{ backgroundColor: '#f8f8f8' }}
                    onCancel={this.onCancel}
                    maskClosable={false}
                    footer={modalFooter}
                >
                    <Form
                        id="addCustomerReserveForm"
                        style={{ position: 'relative' }}
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
                                    getPopupContainer={() => document.getElementById('addCustomerReserveForm')}
                                    asyncMapResultToState={
                                        (data, params) => (params.keyWord ? data : undefined)
                                    }
                                    mapDataToOption={this.mapDataToOption}
                                />
                            </FormItem>
                        </Row>
                        <Row>
                            <FormItem
                                label="预约医生"
                                {...formItemLayout}
                            >
                                {getFieldDecorator(
                                    'doctor',
                                    {
                                        initialValue: doctorItem,
                                        rules: [
                                            { required: true, message: '不能为空' },
                                        ],
                                    },
                                )(
                                    <Select
                                        {...mapPropsToFormItems}
                                        labelInValue
                                        placeholder="请选择预约医生"
                                        onChange={this.onChangeDoctor}
                                    >
                                        {doctorOptions}
                                    </Select>,
                                )}
                            </FormItem>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <FormItem
                                    label="预约时间"
                                    {...formItemLayoutTime}
                                >
                                    {getFieldDecorator(
                                        'day',
                                        {
                                            validateTrigger: ['onChange'],
                                            rules: [
                                                { required: true, message: '不能为空' },
                                            ],
                                        },
                                    )(
                                        <DatePicker
                                            placeholder="请选择预约时间"
                                            getCalendarContainer={() => document.getElementById('addCustomerReserveForm')}
                                            showToday={false}
                                            disabledDate={this.handleDisabledDate}
                                            allowClear={false}
                                            style={{ color: '#2a3f54' }}
                                            onChange={this.onChangeDate}
                                            onOpenChange={this.onOpenChange}
                                        />,
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={4} style={{ marginLeft: '-15%' }}>
                                <FormItem
                                    label=""
                                >
                                    {getFieldDecorator(
                                        'time',
                                        {
                                            rules: [
                                                { required: true, message: '不能为空' },
                                            ],
                                        },
                                    )(
                                        <Select
                                            allowClear
                                            style={{ width: 169 }}
                                            placeholder="请选择预约时间"
                                        >
                                            {timeOptions}
                                        </Select>,
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={10}>
                                {isShowRegularTime
                                    && (
                                        <span style={{ lineHeight: '36px', margin: '0 0 0 46px' }}>
                                            下次规律取药时间：
                                            {
                                                patientDetails
                                                    && patientDetails.estimatedPickupDate
                                            }
                                        </span>
                                    )}
                            </Col>
                        </Row>
                        <Row>
                            <FormItem
                                label="预约来源"
                                {...formItemLayout}
                            >
                                {getFieldDecorator(
                                    'source',
                                    {
                                        rules: [
                                            { required: true, message: '不能为空' },
                                        ],
                                    },
                                )(
                                    <Select
                                        placeholder="请选择预约来源"
                                        style={{ width: 169 }}
                                    >
                                        <Option key="1">
                                            社区预约
                                        </Option>
                                        <Option key="2">
                                            电话预约
                                        </Option>
                                        <Option key="3">
                                            微信预约
                                        </Option>
                                    </Select>,
                                )}
                            </FormItem>
                        </Row>
                        <Row>
                            <FormItem
                                label="预约备注"
                                {...formItemLayout}
                            >
                                {getFieldDecorator('remarks',
                                    {
                                        rules: [
                                            { max: 500, message: '不能多于500个字符' },
                                        ],
                                    })(<ReserveRemarkField maxLength="200" minRows="10" />)}
                            </FormItem>
                        </Row>
                    </Form>
                </Modal>
            </div>
        );
    }
}

const AddCustomerReserveWrap = Form.create()(AddCustomerReserve);
export default connectRouter(AddCustomerReserveWrap);
