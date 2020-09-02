import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, Route } from 'react-router-dom';
import { Button,
    Breadcrumb, Spin, Tag, Modal, Timeline } from 'antd';
    import message from '@wanhu/antd-legacy/lib/message';
import Title from '../../common/Title'
import AsyncEvent from '../../common/AsyncEvent';
import TablePlaceholder from '../../common/TablePlaceholder';
import { taskStatus } from '../../../helpers/enums';
import TaskOperateBar from './taskOperateBar';
import TaskTransferModal from './taskTransfer';
import PatientForm from './patientForm';
import PotentialPatientForm from './potentialPatientForm';
import { connect as connectTaskDetail } from '../../../states/taskCenter/taskDetail';
import { connectRouter } from '../../../mixins/router';
import { testPermission } from '../../common/HasPermission';
import MedicationOrder from '../../customerCenter/customerDetails/MedicationOrder';
import MedicationDemand from '../../customerCenter/customerDetails/MedicationDemand'
import ReserveRecord from '../../customerCenter/customerDetails/ReserveRecord';
import CommunicationRecord from '../../customerCenter/customerDetails/CommunicationRecord';
import NewTaskOperateBar from '../newTask/newTaskOperateBar';
import moment from 'moment';
import _ from 'underscore';

const styles = {
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
    }
}
const taskStatusColors = {
    0: 'green',
    1: 'green',
    2: 'blue',
    3: 'red'
};

class TaskDetail extends Component {

    constructor(props){
        super(props);
        this.taskId = this.props.match.params.taskId;
        this.tab = this.props.match.params.tab || 'records';
    }

    componentWillMount(){
        this.props.getTask(this.taskId);
        this.loadTabData();
    }

    componentWillReceiveProps(props) {
        const nextTab = props.match.params.tab || 'records';
        if (this.taskId !== props.match.params.taskId){
            this.taskId = props.match.params.taskId;
            this.tab = nextTab;
            this.props.resetPage();
            this.props.getTask(this.taskId);
            this.loadTabData();
        } else if (this.tab !== nextTab) {
            this.tab = nextTab;
            this.loadTabData();
        }
    }

    componentWillUnmount(){
        this.props.resetPage();
    }

    initData = fields => {
        if (!fields.isPotential) {
            const { phone, machineNumber, diseases,
                hospital, address, tags, doctor } = fields;
            this.form.setFieldsValue({ phone, machineNumber, diseases,
                address, tags,
                hospital, doctor
             });
        } else {
            const { phone, diseases, address, tags } = fields;
            this.form.setFieldsValue({ phone, diseases, address, tags });
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
                console.log('验证失败', err, values);
            } else if (!this.props.task.payload.isPotential){
                this.props.savePatient(this.props.task.payload.customerId, values);
            } else {
                this.props.savePotentialPatient(this.props.task.payload.customerId, values);
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

    processTask = (values) => {
        this.props.processTask(this.taskId, values);
    }

    finishProcessTask= () => {
        const status = this.props.processTaskResult.params;
        if (status === 1) {
            message.success(`任务已保存，可稍后处理`, 3);
        } else if (status === 2) {
            message.success(`任务已完成`, 3);
        } else if (status === 3) {
            message.success(`任务关闭成功`, 3);
        }
        this.handleNextTask();
    }

    handleNextTask() {
        if (this.props.match.params.taskPoolId) {
            Modal.confirm({
                title: '是否领取下一个任务',
                okText: '领取',
                cancelText: this.props.router.query.r ? '返回上一页' : '返回首页',
                onOk: () => {
                    this.props.handleTaskFromPool(this.props.match.params.taskPoolId);
                },
                onCancel: () => {
                    this.props.router.replace(this.props.router.query.r || '/');
                }
            });
        } else {
            this.props.router.replace(this.props.router.query.r || '/');
        }
    }

    finishHandleTaskFromPool = ({ taskId }) => {
        this.props.router.replace(`/taskPool/${this.props.handleTaskFromPoolResult.params}/task/${taskId}`);
    }

    handleTaskFromPoolError = (err) => {
        Modal.error({
            title: '领取任务失败',
            content: err.message,
            okText: this.props.router.query.r ? '返回上一页' : '返回首页',
            onOk: () => {
                this.props.router.replace(this.props.router.query.r || '/');
            },
        });
    }

    openTransferModal = () => {
        this.props.setTransferModalVisible(true);
    }

    hideTransferModal = () => {
        this.props.setTransferModalVisible(false);
    }

    submitTransfer = (values) => {
        this.props.submitTransfer(this.taskId, values.user.id);
    }

    finishTransfer = () => {
        message.success(`任务转移成功`, 3);
        this.props.setTransferModalVisible(false);
        this.handleNextTask();
    }

    get returnToTaskListUrl(){
        if (this.props.router.query.r && this.props.router.query.r.indexOf('/taskList') === 0) {
            return this.props.router.query.r;
        } else {
            return '/taskList';
        }
    }

    openNewOrderModal = () => {
        this.props.router.openModal('createOrder', this.props.task.payload.customerId);
    }

    openRecordTab = () =>{
        this.props.router.setPath(`/taskDetail/${this.taskId}`, { replace: true });
    }

    openHistoryTab = () => {
        this.props.router.setPath(`/taskDetail/${this.taskId}/history`, { replace: true });
    }

    openOrderTab = () => {
        this.props.router.setPath(`/taskDetail/${this.taskId}/order`, { replace: true });
    }

    openMedicineRequirementTab = () => {
        this.props.router.setPath(`/taskDetail/${this.taskId}/medicineRequirement`, { replace: true });
    }

    openReserveRecordTab = () => {
        this.props.router.setPath(`/taskDetail/${this.taskId}/reserveRecord`, { replace: true });
    }

    openCommunicationRecordTab = () => {
        this.props.router.setPath(`/taskDetail/${this.taskId}/communicationRecord`, { replace: true });
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

    render() {
        const task = this.props.task.status === 'fulfilled' ? this.props.task.payload : {};
        const isNewTask = task.taskReclassify ? true : false;
        const messageTemplateData = this.props.messageTemplateData.status === 'fulfilled' ? this.props.messageTemplateData.payload : [];
        const allowEdit = testPermission({ $any: ['crm.task.edit', 'crm.task.admin']}) ? task.editable && taskStatus.editable[task.taskStatus] : false;
        return <div>
            <Breadcrumb className='breadcrumb-box'>
                <Breadcrumb.Item>
                    <Link to={this.returnToTaskListUrl}>任务管理</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    任务详情
                </Breadcrumb.Item>
            </Breadcrumb>
            <Spin spinning={this.props.task.status === 'pending'}>
                <div className='block'>
                    <Title left={10}>
                        任务{this.taskId} <Tag color='#f00'>{taskStatus.map[task.taskStatus]}</Tag>
                    </Title>
                    <div style={styles.box}>
                        { !task.isPotential ?
                            <PatientForm
                                task={task}
                                isNewTask={isNewTask}
                                data={this.props.formData}
                                onFieldsChange={(fields) => this.fieldsChange(fields)}
                                formRef={form => this.form = form}
                                hideRequiredMark={!this.props.formEdit.editing}
                                editing={this.props.formEdit.editing}
                                onChangeEditing={this.editStatusChanged}
                            />:
                            <PotentialPatientForm
                                task={task}
                                isNewTask={isNewTask}
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
                                <a className={this.tab === 'records' ? 'current' : null} onClick={this.openRecordTab}>任务记录</a>
                            </span>
                            <span style={styles.span}>
                                <a className={this.tab === 'history' ? 'current' : null} onClick={this.openHistoryTab}>历史记录</a>
                            </span>
                            <span style={styles.span}>
                                <a className={this.tab === 'order' ? 'current' : null} onClick={this.openOrderTab}>订单信息</a>
                            </span>
                            <span style={styles.span}>
                                <a className={this.tab === 'medicineRequirement' ? 'current' : null} onClick={this.openMedicineRequirementTab}>用药需求</a>
                            </span>
                            <span style={styles.span}>
                                <a className={this.tab === 'reserveRecord' ? 'current' : null} onClick={this.openReserveRecordTab}>预约记录</a>
                            </span>
                            {
                                !task.isPotential
                                && <span style={styles.span}>
                                    <a className={this.tab === 'communicationRecord' ? 'current' : null} onClick={this.openCommunicationRecordTab}>沟通记录</a>
                                </span>
                            }
                        </div>
                    </Title>
                    {
                        this.renderTab()
                    }
                    <Route path={(()=>'/taskDetail/' + this.taskId + '/order')()} render={()=>{
                      if(this.props.task.payload && this.props.task.payload.customerId){
                        return <MedicationOrder orderDetailPath="/taskOrderDetails" customerId={this.props.task.payload.customerId} />
                      }else{
                        return null
                      }
                    }} />
                    <Route path={(()=>'/taskDetail/' + this.taskId + '/medicineRequirement')()} render={(params)=>{
                      if(this.props.task.payload && this.props.task.payload.customerId){
                        let source = this.props.task.payload.isPotential ? '' : 'customerDetails'
                        return <MedicationDemand disableAffix {...params} customerId={this.props.task.payload.customerId} source={source} />
                      }else{
                        return null
                      }
                    }} />
                    <Route path={(()=>'/taskDetail/' + this.taskId + '/reserveRecord')()} render={(params)=>{
                      if(this.props.task.payload && this.props.task.payload.customerId){
                        let source = this.props.task.payload.isPotential ? '' : 'customerDetails'
                        return <ReserveRecord disableAffix {...params} source={source} customerId={this.props.task.payload.customerId} />
                      }else{
                        return null
                      }
                    }} />
                    <Route path={(()=>'/taskDetail/' + this.taskId + '/communicationRecord')()} render={()=>{
                      if(this.props.task.payload && this.props.task.payload.customerId){
                        return <CommunicationRecord  customerId={this.props.task.payload.customerId} />
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
                                {isNewTask ?
                                    <NewTaskOperateBar
                                        isPotential={task.isPotential}
                                        task={task}
                                        patientId={task.customerId}
                                        delayDisabled={!task.delayed}
                                        delayTime={task.delayTime}
                                        operateData={this.props.operateFormData}
                                        messageTemplateData={messageTemplateData}
                                        onOperateDataChange={this.props.updateOperateFormField}
                                        onNewProcessTask={this.processTask}
                                        onTransfer={this.openTransferModal}
                                        onNewOrder={this.openNewOrderModal}
                                        handleGetMessageTemplate={this.props.handleGetMessageTemplate}
                                /> :
                                <TaskOperateBar
                                    taskType={task.taskType}
                                    patientId={task.customerId}
                                    delayDisabled={!task.delayed}
                                    delayTime={task.delayTime}
                                    operateData={this.props.operateFormData}
                                    messageTemplateData={messageTemplateData}
                                    onOperateDataChange={this.props.updateOperateFormField}
                                    onProcessTask={this.processTask}
                                    onTransfer={this.openTransferModal}
                                    onNewOrder={this.openNewOrderModal}
                                    handleGetMessageTemplate={this.props.handleGetMessageTemplate}
                                />
                                }
                            </div>
                        </Spin>
                    </div>
                </div> : null)
            }
            <TaskTransferModal
                userId={this.props.userId}
                formData={this.props.transferModal.formData}
                submitResult={this.props.transferModal.submitResult}
                updateFormField={this.props.updateTransferModalFormFields}
                visible={this.props.transferModal.visible}
                onHideModal={this.hideTransferModal}
                onSubmit={this.submitTransfer}/>
            <AsyncEvent async={this.props.savePatientResult} onFulfill={this.successfulFinishEdit} alertError/>
            <AsyncEvent async={this.props.savePotentialPatientResult} onFulfill={this.successfulFinishEdit} alertError/>
            <AsyncEvent async={this.props.task} onFulfill={this.initData} alertError/>
            <AsyncEvent async={this.props.processTaskResult} onFulfill={this.finishProcessTask} alertError/>
            <AsyncEvent async={this.props.handleTaskFromPoolResult} onFulfill={this.finishHandleTaskFromPool} onReject={this.handleTaskFromPoolError}/>
            <AsyncEvent async={this.props.messageTemplateData} alertError/>
            <AsyncEvent async={this.props.transferModal.submitResult} onFulfill={this.finishTransfer} alertError/>
        </div>;
    }

    renderTab(){
        switch (this.tab) {
            case 'records':
                return this.renderRecordTab();
            case 'history':
                return this.renderHistoryTab();
            default:
                return null;
        }
    }

    loadTabData() {
        switch (this.tab) {
            case 'records':
                return this.loadRecordTabData();
            case 'history':
                return this.loadHistoryTabData();
            default:
        }
    }

    renderRecordTab() {
        if (this.props.taskRecords.status === 'fulfilled' && !_.isEmpty(this.props.taskRecords.payload)) {
            return <Timeline className='timeline-box'>
                {
                    this.props.taskRecords.payload.map((item, i) =>
                        <Timeline.Item key={i}>
                            <span><i></i>{moment(item.createDate).format('YYYY-MM-DD HH:mm:ss')}</span>
                            {item.content}
                        </Timeline.Item>
                    )
                }
            </Timeline>;
        } else {
            return <TablePlaceholder
                style={{padding: '10px 0'}}
                status={this.props.taskRecords.status}
                loadingTip="正在加载任务记录"
                errorTip={this.props.taskRecords.payload && this.props.taskRecords.payload.status == '403' ? '权限不足，请联系管理员' : '加载任务记录失败'}
                onReload={this.loadRecordTabData}/>;
        }
    }

    loadRecordTabData = () => {
        this.props.getTaskRecords(this.taskId);
    }

    renderHistoryTab() {
        if (this.props.taskHistory.status === 'fulfilled' && !_.isEmpty(this.props.taskHistory.payload)) {
            return <Timeline className='timeline-box'>
                {
                    this.props.taskHistory.payload.map((item, i) =>
                        <Timeline.Item key={i}>
                            <span><i></i>{moment(item.createDate).format('YYYY-MM-DD HH:mm:ss')}</span>
                            {item.content}
                        </Timeline.Item>
                    )
                }
            </Timeline>;
        } else {
            return <TablePlaceholder
                style={{padding: '10px 0'}}
                status={this.props.taskHistory.status}
                loadingTip="正在加载历史记录"
                errorTip={this.props.taskHistory.payload && this.props.taskHistory.payload.status == '403' ? '权限不足，请联系管理员' : '加载历史记录失败'}
                onReload={this.loadHistoryTabData}/>;
        }
    }

    loadHistoryTabData = () => {
        this.props.getTaskHistory(this.taskId);
    }
}

export default connectRouter(connect(
    state => ({
        navMenuIsExpanded: state.navMenu.expanded,
        userId: state.auth.payload.user,
        editStatus: state.customerDetailsDrug.editStatus || state.customerDetailsMedicalRecord.editStatus,
    }),
)(connectTaskDetail(TaskDetail)));
