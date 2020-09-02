import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, Route } from 'react-router-dom';
import { InputNumber, Input, Button, Row, Col, Select,
    Breadcrumb, Affix, Form, Spin, Tag, Modal, Timeline } from 'antd';

import message from '@wanhu/antd-legacy/lib/message'
import Title from '../../common/Title'
import SmartSelectSingle, { SmartSelectSingleAsync } from '../../common/SmartSelectSingle'
import SelectMultipleTags from '../../common/SelectMultipleTags';
import AsyncEvent from '../../common/AsyncEvent';
import TablePlaceholder from '../../common/TablePlaceholder';
import { taskStatus } from '../../../helpers/enums';
import history from '../../../history';
import NewTaskOperateBar from './newTaskOperateBar';
import TaskTransferModal from './taskTransfer';
import PatientForm from './patientForm';
import PotentialPatientForm from './potentialPatientForm';
import { connect as connectNewTask } from '../../../states/taskCenter/newTask';
import { connectRouter } from '../../../mixins/router';
import { testPermission } from '../../common/HasPermission';
import MedicationOrder from '../../customerCenter/customerDetails/MedicationOrder';
import MedicationDemand from '../../customerCenter/customerDetails/MedicationDemand'
import HealthRecords from '../../customerCenter/customerDetails/HealthRecords'
import { getPatient, getPotentialCustome, searchPatientByContact, getTask } from '../../../api';
import context from '../../../api/contextCreator';
import moment from 'moment';
import _ from 'underscore';
import url from 'url';
import querystring from 'querystring';
const DefaultOrder = [{ createDate: "desc" }];
const FormLabel = Form.Item;
const formItemLayout = {
    labelCol: { span: 3 },
    wrapperCol: { span: 15 },
};
const colStyle = {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap'
};
const formItemStyle = {
    col1: {
        labelCol: { span:3 },
        wrapperCol: { span:21 }
    },
    col2: {
        labelCol: { span:6 },
        wrapperCol: { span:18 }
    },
    col3: {
        labelCol: { span:9 },
        wrapperCol: { span:15 }
    },
    col4: {
        labelCol: { span:12 },
        wrapperCol: { span:12 }
    },
    labelOnly: {
        labelCol: { style: { width: '100%'} },
    }
};
const styles = {
    form: {
        padding: '20px 20px 0',
        marginBottom: -20
    },
    box: {
        padding: 20
    },
    foot: {
        textAlign: 'center',
        height: 60,
        lineHeight: '60px'
    },
    footBtn: {
        marginRight: 10
    },
    footOp: {
        background: '#2B3F53',
        padding: '20px',
    },
    span:{
        fontWeight: 'normal',
        color: 'inherit',
        marginRight: 20
    },
}
const taskStatusColors = {
    0: 'green',
    1: 'green',
    2: 'blue',
    3: 'red'
};

class NewTask extends Component {

    constructor(props){
        super(props);
        this.state = {};
        this.tab = this.props.match.params.tab || 'history';
    }

    componentDidMount(){
        this.handleIncomingCalll();
        this.loadTabData();
    }

    async handleIncomingCalll() {
        const urlObj = url.parse(this.props.location.search);
        const query = querystring.parse(urlObj.query);
        if (query.phone) {
            const focusableSelect = this.refs.patientSearch.getWrappedInstance();
            focusableSelect.search(query.phone);
            this.setState({
                patientFieldValue: {
                    key: Math.random(),
                    label: query.phone
            }});
        }
        if (query.aliyunid) {
            this.aliyunid = query.aliyunid;
        }
    }

    componentWillReceiveProps(props) {
        const nextTab = props.match.params.tab || 'history';
        if (this.tab !== nextTab) {
            this.tab = nextTab;
            this.loadTabData();
        }
        const urlObj = url.parse(props.location.search);
        const query = querystring.parse(urlObj.query);
        const potentialId = query.potentialId;
        if (this.props.location.search !== props.location.search) {
            if (potentialId) {
                this.reset();
                this.init(potentialId, true);
            }
        }
    }

    componentWillUnmount(){
        this.props.resetPage();
    }

    init = async (patientId, isFromPotential) => {
        let patientType;
        this.patientId = patientId;
        let patientDetails;
        if (!isFromPotential) {
            patientType = this.patientOptionData && this.patientOptionData.list.find(p => p.id === patientId).patientType;
        }
        const isPotential = isFromPotential ? true : patientType === 2 ? true : false;
        if (isPotential) {
            patientDetails = await getPotentialCustome(context(), patientId);
        } else {
            patientDetails = await getPatient(context(), patientId);
        }
        const { birthday, sex, idCard, address, name, hospital, phone, machineNumber } = patientDetails;
        const age = birthday ? this.getAgeByBirthday(birthday) + '岁' : '';
        const hasSex = sex === 1 ? true : sex === 0 ? true : false;
        const hasInfo = sex === 1 ? true : sex === 0 ? true : birthday ? true : idCard ? true : false;
        const addressName = address ? `${(address.provinceName || '')}${(address.cityName || '')}${(address.areaName || '')}${(address.liveStreet || '')}` : '';
        const label = `${name} ${hasInfo ? '(' : ''}${sex === 1 ? '男' : sex === 0 ? '女' : ''}${age ? hasSex ? '/' + age : age : ''}${idCard ? (hasSex || age) ? '/' + idCard : idCard : ''}${hasInfo ? ')' : ''} ${phone || ''} ${machineNumber || ''} ${!isPotential ? (hospital.name || '') : addressName}`;
        const patientFieldValue = {
          key: patientId,
          label,
        };
        this.initData(patientDetails);
        this.setState({ patientDetails, patientFieldValue, isPotential }, () => this.loadTabData());
    }

    initData = fields => {
        if (!this.state.isPotential) {
            const { phone, machineNumber, diseases,
                hospital, address, tags, doctor } = fields;
            this.form && this.form.setFieldsValue({ phone, machineNumber, diseases,
                address, tags,
                hospital, doctor
             });
        } else {
            const { phone, diseases, address, tags } = fields;
            this.form && this.form.setFieldsValue({ phone, diseases, address, tags });
        }
    }

    editStatusChanged = (val) => {
        if (val) {
            this.props.backupFormAndBeginEdit(this.props.formData);
        } else {
            this.props.stopFormEdit(this.props.formEdit.fields);
        }
    }

    savePatient = () => {
        this.form.validateFieldsAndScroll({ force: true }, (err, values) => {
            if (err) {
                return;
            } else if (!this.state.isPotential){
                this.props.savePatient(this.patientId, values);
            } else {
                this.props.savePotentialPatient(this.patientId, values);
            }
        });
    }

    cancelEdit = () => {
        this.props.stopFormEdit(this.props.formEdit.fields);
    }

    successfulFinishEdit = () => {
        message.success('保存成功', 3);
        this.props.stopFormEdit();
    }

    newProcessTask = (data) => {
        let params = {
            ...data
        };
        if (this.aliyunid) {
            params.aliyunId = this.aliyunid;
        }
        this.props.newProcessTask(params);
    }

    finishProcessTask= () => {
        this.setState({ transferModal: false, patientFieldValue: undefined });
        const data = this.props.processTaskResult.params;
        if (data.taskStatus === 1 ) {
            if (!data.transfer) {
                message.success(`任务已保存，可稍后处理`, 2);
            } else {
                message.success(`任务转移成功`, 2);
            }
        } else if (data.taskStatus=== 2) {
            message.success(`任务已完成`, 2);
        }
        this.props.router.replace(this.props.router.query.r || '/tasklist');
    }

    openTransferModal = (data) => {
        this.submitData = data;
        this.setState({ transferModal: true });
    }

    hideTransferModal = () => {
        this.setState({ transferModal: false });
    }

    submitTransfer = (values) => {
        const userId = values.user.id;
        let params = {
            ...this.submitData,
            transfer: userId
        }
        if (this.aliyunid) {
            params.aliyunId = this.aliyunid;
        }
        this.props.newProcessTask(params);
    }

    get returnToTaskListUrl(){
        if (this.props.router.query.r && this.props.router.query.r.indexOf('/newtask') === 0) {
            return this.props.router.query.r;
        } else {
            return '/taskList';
        }
    }

    openNewOrderModal = () => {
        this.props.router.openModal('createOrder', this.props.task.payload.customerId);
    }

    openHistoryTab = () => {
        this.props.router.setPath(`/newtask/history`, { replace: true });
    }

    openOrderTab = () => {
        this.props.router.setPath(`/newtask/order`, { replace: true });
    }

    openMedicineRequirementTab = () => {
        this.props.router.setPath(`/newtask/medicineRequirement`, { replace: true });
    }

    fieldsChange(fields) {
        if(fields.hospital && this.props.formData.hospital) {
            const preHospitalId = fields.hospital.value && fields.hospital.value.id;
            const currentHospitalId = this.props.formData.hospital && this.props.formData.hospital.value && this.props.formData.hospital.value.id;
            if(preHospitalId !== currentHospitalId) {
                fields.doctor = {};
            }
        }
        this.props.updateFormField(fields)
    }

    handlePatientChange = value => {
        if (!value) {
          this.reset();
        }
    }

    reset = () => {
        this.patientId = undefined;
        this.setState({
            patientFieldValue: undefined,
            isPotential: undefined,
            patientDetails: {},
        },
            () => {
                this.props.stopFormEdit(this.props.formEdit.fields);
                this.form && this.form.resetFields();
                this.props.resetPage();
            }
        );
    }

      handlePatientSelect = value => {
        this.reset();
        const optionData = this.patientOptionData.list;
        const index = optionData.findIndex(data => data.id === value.key);
        if (index !== -1) {
          if (optionData[index].isDisabled) {
            Modal.error({
              title: '该患者已被禁用',
            })
            this.setState({
              patientFieldValue: undefined
            })
            return;
          }
          this.setState({
            patientFieldValue: value
          })
          this.init(optionData[index].id);
          this.patientId = optionData[index].id
        } else {
          Modal.error({
            title: '错误提示',
            content: '解析用户信息出错'
          })
        }
      }

      getAgeByBirthday(dateString) {
        var today = new Date()
        var birthDate = new Date(dateString)
        var age = today.getFullYear() - birthDate.getFullYear()
        var m = today.getMonth() - birthDate.getMonth()
        return age
      }

      mapDataToOption = data => {
        this.patientOptionData = data
        if(!data.list) return null
        let options = data.list.map(row => {
        const { birthday, sex, idCard, address, name, hospitalName, patientType, phone, machineNumber } = row;
        const age = birthday ? this.getAgeByBirthday(birthday) + '岁' : '';
        const hasSex = sex === 1 ? true : sex === 0 ? true : false;
        const hasInfo = sex === 1 ? true : sex === 0 ? true : birthday ? true : idCard ? true : false;
        const isPotential = patientType === 2 ? true : false;
        const info = `${hasInfo ? '(' : ''}${sex === 1 ? '男' : sex === 0 ? '女' : ''}${age ? hasSex ? '/' + age : age : ''}${idCard ? (hasSex || age) ? '/' : '' : ''}`;
        const addressName = address ? `${(address.provinceName || '')}${(address.cityName || '')}${(address.areaName || '')}${(address.liveStreet || '')}` : '';
          return (
            <Select.Option key={row.id}>
              <Row key={name} gutter={10}>
                <Col title={name} style={colStyle} span={9}>{this.colorfulStr(name)} {info}{idCard ? this.colorfulStrIfEqual(idCard) : ''}{hasInfo ? ')' : ''}</Col>
                <Col title={phone || ''} style={colStyle} span={3}>{phone ? this.colorfulStrIfEqual(phone) : ''}</Col>
                <Col title={machineNumber || ''} style={colStyle} span={3}>{machineNumber ? this.colorfulStrIfEqual(machineNumber) : ''}</Col>
                <Col title={hospitalName} style={colStyle} span={5}>{!isPotential ? hospitalName : addressName}</Col>
              </Row>
            </Select.Option>
          )
        })
        if(data.list.length == 11){
          options.pop()
          options.push(<Select.Option key='more' disabled={true} style={{textAlign: 'center'}}>搜索结果过多，请尝试输入全名或其他信息</Select.Option>)
        }
        return options
      }

      colorfulStrIfEqual = (str) => {
        let searchText = this.params && this.params.keyWord;
        return str == searchText ? <span style={{color:'red'}}>{str}</span> : str
      }

      colorfulStr(str){
        let searchText = this.params && this.params.keyWord;
        let regex = new RegExp(searchText, 'g')
        let str1 = str.replace(regex, '|^^^|')
        let opt = []
        let optSplit = str1.split('|')
        optSplit.forEach((row, index) => {
          if(row === '^^^'){
            opt.push(<span key={index} style={{color:'red'}}>{searchText}</span>)
          }else if(row !== ''){
            opt.push(<span key={index}>{row}</span>)
          }
        })
        return opt
      }

    render() {
        const task = this.state.patientDetails || {};
        const allowEdit = this.state.patientFieldValue ? true : false;
        return <div>
            <Breadcrumb className='breadcrumb-box'>
                <Breadcrumb.Item>
                    <Link to={this.returnToTaskListUrl}>任务管理</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    新建任务
                </Breadcrumb.Item>
            </Breadcrumb>
            <Spin spinning={this.props.task.status === 'pending'}>
                <div className='block'>
                    <Form id="newTaskForm" style={styles.form}>
                        <Row>
                            <Col>
                                <Form.Item
                                label="选择会员"
                                required={true}
                                {...formItemLayout}
                                >
                                <SmartSelectSingleAsync
                                    ref="patientSearch"
                                    value={this.state.patientFieldValue}
                                    disabled={this.props.formEdit.editing}
                                    editStatus={true}
                                    placeholder="请输入会员姓名/身份证号/手机号/其他联系方式"
                                    allowClear={true}
                                    showSearch={true}
                                    filterOption={false}
                                    delay={true}
                                    asyncResultId='addMedicineRegister.ChoosePatient'
                                    asyncRequestFuncName='searchPatientAll'
                                    onChange={this.handlePatientChange}
                                    onSelect={this.handlePatientSelect}
                                    cleanOptionsOnBlur={true}
                                    getPopupContainer={()=> document.getElementById('newTaskForm')}
                                    asyncMapResultToState={ (data, params) => {this.params = params;return params.keyWord ? data : undefined} }
                                    mapDataToOption={this.mapDataToOption}
                                />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                    <div style={styles.box}>
                        {!this.state.isPotential ?
                            <PatientForm
                                patientFieldValue={this.state.patientFieldValue}
                                task={task}
                                data={this.props.formData}
                                onFieldsChange={(fields) => this.fieldsChange(fields)}
                                formRef={form => this.form = form}
                                hideRequiredMark={!this.props.formEdit.editing}
                                editing={this.props.formEdit.editing}
                                onChangeEditing={this.editStatusChanged}
                            /> :
                            <PotentialPatientForm
                                patientFieldValue={this.state.patientFieldValue}
                                task={task}
                                data={this.props.formData}
                                onFieldsChange={this.props.updateFormField}
                                formRef={form => this.form = form}
                                hideRequiredMark={!this.props.formEdit.editing}
                                editing={this.props.formEdit.editing}
                                onChangeEditing={this.editStatusChanged}
                            />
                        }
                    </div>
                    {
                        this.props.formEdit.editing ?
                            <div>
                                <div className='block' style={styles.foot}>
                                    <Button style={styles.footBtn} loading={this.props.savePatientResult.status === 'pending'} onClick={this.savePatient} type='primary'>保存</Button>
                                    <Button disabled={this.props.savePatientResult.status === 'pending'} onClick={this.cancelEdit} className='cancelButton'>取消</Button>
                                </div>
                            </div>
                            : null
                    }
                    <Title left={10}>
                        <div className='nav'>
                            <span style={styles.span}>
                                <a className={this.tab === 'history' ? 'current' : null} onClick={this.openHistoryTab}>历史记录</a>
                            </span>
                            <span style={styles.span}>
                                <a className={this.tab === 'order' ? 'current' : null} onClick={this.openOrderTab}>订单信息</a>
                            </span>
                            <span style={styles.span}>
                                <a className={this.tab === 'medicineRequirement' ? 'current' : null} onClick={this.openMedicineRequirementTab}>用药需求</a>
                            </span>
                        </div>
                    </Title>
                    {
                        this.renderTab()
                    }
                    <Route path={(()=>'/newtask/order')()} render={()=>{
                      if(this.patientId){
                        return <MedicationOrder orderDetailPath="/newtask" customerId={this.patientId} />
                      }else{
                        return null
                      }
                    }} />
                    <Route path={(()=>'/newtask/medicineRequirement')()} render={(params)=>{
                      if(this.patientId){
                        let source = this.state.isPotential ? '' : 'customerDetails'
                        return <MedicationDemand disableAffix {...params} customerId={this.patientId} source={source} />
                      }else{
                        return null
                      }
                    }} />
                </div>
            </Spin>
            { (this.props.formEdit.editing || this.props.editStatus) ?
                null
                :
                (allowEdit ? <div>
                    <div style={{height:100}}></div>
                    <div style={{position:'fixed', bottom:0, right: 0, left: this.props.navMenuIsExpanded ? 240 : 90, zIndex: 1}}>
                        <Spin spinning={this.props.processTaskResult.status==='pending'} wrapperClassName="spin-no-fade">
                            <div className='block' style={styles.footOp}>
                                <NewTaskOperateBar
                                    isPotential={this.state.isPotential}
                                    patientId={this.patientId}
                                    operateData={this.props.operateFormData}
                                    onOperateDataChange={this.props.updateOperateFormField}
                                    onNewProcessTask={this.newProcessTask}
                                    onTransfer={this.openTransferModal}
                                    handleGetMessageTemplate={this.props.handleGetMessageTemplate}
                                />
                            </div>
                        </Spin>
                    </div>
                </div> : null)
            }
            <TaskTransferModal
                userId={this.props.userId}
                formData={this.props.transferModal.formData}
                submitResult={this.props.processTaskResult}
                updateFormField={this.props.updateTransferModalFormFields}
                visible={this.state.transferModal}
                onHideModal={this.hideTransferModal}
                onSubmit={this.submitTransfer}/>
            <AsyncEvent async={this.props.savePatientResult} onFulfill={this.successfulFinishEdit} alertError/>
            <AsyncEvent async={this.props.savePotentialPatientResult} onFulfill={this.successfulFinishEdit} alertError/>
            <AsyncEvent async={this.props.processTaskResult} onFulfill={this.finishProcessTask} alertError/>
        </div>;
    }

    renderTab(){
        switch (this.tab) {
            case 'history':
                return this.renderHistoryTab();
            default:
                return null;
        }
    }

    loadTabData() {
        switch (this.tab) {
            case 'history':
                return this.loadHistoryTabData();
            default:
                return null;
        }
    }

    renderHistoryTab() {
        const { patientFieldValue } = this.state;
        if (this.props.taskRecords.status === 'fulfilled' && !_.isEmpty(this.props.taskRecords.payload)) {
            return  <Timeline className='timeline-box'>
                {
                    this.props.taskRecords.payload.map((item, i) =>
                        <Timeline.Item key={i}>
                            <span><i></i>{moment(item.createDate).format('YYYY-MM-DD HH:mm:ss')}</span>
                            {item.content}
                        </Timeline.Item>
                    )
                }
            </Timeline>
        } else {
            return <TablePlaceholder
                style={{padding: '10px 0'}}
                status={this.props.taskRecords.status}
                loadingTip="正在加载任务记录"
                errorTip={this.props.taskRecords.payload && this.props.taskRecords.payload.status == '403' ? '权限不足，请联系管理员' : '加载任务记录失败'}
                onReload={this.loadHistoryTabData}/>;
        }
    }

    loadHistoryTabData = async () => {
        if (!this.state.patientFieldValue) {
            return;
        }
        let where  = {
            objectId: this.patientId,
            taskStatus: 2
        }
        if (!this.state.isPotential) {
            where.objectType = 0;
        } else {
            where.objectType = 4;
        }
        const latestTaskRecord = await getTask(context(), where, 0, 1, 0, DefaultOrder);
        const taskId = latestTaskRecord.list[0] && latestTaskRecord.list[0].id;
        if (taskId) {
            this.props.getTaskRecords(taskId);
        }
    }
}

export default connectRouter(connect(
    state => ({
        navMenuIsExpanded: state.navMenu.expanded,
        userId: state.auth.payload.user,
        editStatus: state.customerDetailsDrug.editStatus || state.customerDetailsMedicalRecord.editStatus,
    }),
)(connectNewTask(NewTask)));
