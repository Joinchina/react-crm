import { combineReducers, bindActionCreators } from 'redux';
import { connect as reduxConnect } from 'react-redux';
import moment from 'moment';
import {
    apiActionCreator,
    getTaskById, getPatient, putPatient,
    getPotentialPatient, putPotentialPatient,
    newProcessTask as newProcessTaskApi,
    handleTaskFromPool as handleTaskFromPoolApi,
    getTaskRecords as getTaskRecordsApi,
    getTaskHistory as getTaskHistoryApi,
    getMessageTemplate,
} from '../../api';
import {
    reduceValue, resetMiddleware, chainReducers, reduceMap, reduceAsyncAction,
} from '../../helpers/reducers';
import { testPermission } from '../../helpers/permission';

const UPDATE_FORM = 'taskCenter.newTask.updateFormField';
const UPDATE_OPERATE_FORM = 'taskCenter.newTask.updateOperateFormField';
const GET_INFO = 'taskCenter.newTask.getTaskInfo';
const EDIT_FORM = 'taskCenter.newTask.editForm';
const SUBMIT_FORM = 'taskCenter.newTask.saveTaskPool';
const PROCESS_TASK = 'taskCenter.newTask.newProcessTask';
const HANDLE_NEXT_TASK = 'taskCenter.newTask.handleNextTask';
const RESET = 'taskCenter.newTask.reset';
const SAVE_POTENTIAL_PATIENT = 'taskCenter.newTask.savePotentialPatient';

const SHOW_TRANSFER_MODAL = 'taskCenter.newTask.SHOW_TRANSFER_MODAL';
const HIDE_TRANSFER_MODAL = 'taskCenter.newTask.HIDE_TRANSFER_MODAL';
const TRANSFER_MODAL_UPDATE_FORM = 'taskCenter.newTask.transferModal.TRANSFER_MODAL_UPDATE_FORM';
const SUBMIT_TRANSFER = 'taskCenter.newTask.transferModal.SUBMIT_TRANSFER';

const GET_TASK_RECORDS = 'taskCenter.newTask.GET_TASK_RECORDS';
const GET_TASK_HISTORY = 'taskCenter.newTask.GET_TASK_HISTORY';

const GET_MESSAGE_TEMPLATE = 'taskCenter.newTask.GET_MESSAGE_TEMPLATE';

function converTaskRemoteToLocal(data) {
    if (!data.isPotential) {
        const {
            name, sex, birthday,
            phone, machineNumber, diseases,
            hospital, address, tags, doctor,
            isEdit,
        } = data.patient;
        const {
            content, taskType, taskStatus,
            customerId, editable,
            delayed, delayTime,
        } = data.task;
        return {
            isPotential: false,
            name,
            sex,
            birthday,
            phone,
            machineNumber,
            diseases,
            hospital,
            address,
            tags,
            doctor,
            patientEditable: isEdit,
            content,
            taskType,
            taskStatus,
            customerId,
            editable,
            delayed,
            delayTime: delayTime && moment(delayTime),
        };
    }
    const {
        name, sex, birthday,
        phone, diseases, address,
        tags, isEdit,
    } = data.patient;
    const {
        content, taskType, taskStatus,
        customerId, editable,
        delayed, delayTime,
    } = data.task;
    return {
        isPotential: true,
        name,
        sex,
        birthday,
        phone,
        diseases,
        address,
        tags,
        patientEditable: isEdit,
        content,
        taskType,
        taskStatus,
        customerId,
        editable,
        delayed,
        delayTime: delayTime && moment(delayTime),
    };
}

export default combineReducers({
    formData(state = {}, action) {
        let newState = state;
        if (action.type === UPDATE_FORM) {
            newState = { ...newState, ...action.payload };
        } else if (action.type === EDIT_FORM && !action.payload.editing && action.payload.fields) {
            newState = { ...action.payload.fields };
        } else if (action.type === RESET) {
            newState = {};
        }
        return newState;
    },
    operateFormData(state = {}, action) {
        let newState = state;
        if (action.type === UPDATE_OPERATE_FORM) {
            newState = { ...newState, ...action.payload };
        } else if (action.type === RESET) {
            newState = {};
        }
        return newState;
    },
    task(state = {}, action) {
        let newState = state;
        if (action.type === GET_INFO) {
            newState = {
                status: action.status,
                payload: action.status === 'fulfilled'
                    ? converTaskRemoteToLocal(action.payload) : action.payload,
            };
        } else if (action.type === RESET) {
            newState = {};
        }
        return newState;
    },
    formEdit(state = {}, action) {
        let newState = state;
        if (action.type === EDIT_FORM) {
            if (action.payload.editing) {
                newState = { ...action.payload };
            } else {
                newState = { editing: false };
            }
        } else if (action.type === RESET) {
            newState = {};
        }
        return newState;
    },
    savePatientResult(state = {}, action) {
        let newState = state;
        if (action.type === SUBMIT_FORM) {
            newState = {
                status: action.status,
                payload: action.payload,
            };
        } else if (action.type === RESET) {
            newState = {};
        }
        return newState;
    },
    savePotentialPatientResult(state = {}, action) {
        let newState = state;
        if (action.type === SAVE_POTENTIAL_PATIENT) {
            newState = {
                status: action.status,
                payload: action.payload,
            };
        } else if (action.type === RESET) {
            newState = {};
        }
        return newState;
    },
    processTaskResult(state = {}, action) {
        let newState = state;
        if (action.type === PROCESS_TASK) {
            newState = {
                status: action.status,
                payload: action.payload,
                params: action.params,
            };
        } else if (action.type === RESET) {
            newState = {};
        }
        return newState;
    },
    handleTaskFromPoolResult(state = {}, action) {
        let newState = state;
        if (action.type === HANDLE_NEXT_TASK) {
            newState = {
                status: action.status,
                payload: action.payload,
                params: action.params,
            };
        } else if (action.type === RESET) {
            newState = {};
        }
        return newState;
    },
    messageTemplateData(state = [], action) {
        let newState = state;
        if (action.type === GET_MESSAGE_TEMPLATE) {
            newState = {
                status: action.status,
                payload: action.payload,
            };
        } else if (action.type === RESET) {
            newState = [];
        }
        return newState;
    },
    transferModal: resetMiddleware(RESET)(combineReducers({
        visible: chainReducers(
            false,
            reduceValue(SHOW_TRANSFER_MODAL),
            reduceValue(HIDE_TRANSFER_MODAL),
        ),
        formData: resetMiddleware(HIDE_TRANSFER_MODAL)(reduceMap(TRANSFER_MODAL_UPDATE_FORM)),
        submitResult: reduceAsyncAction(SUBMIT_TRANSFER),
    })),
    taskRecords: resetMiddleware(RESET)(reduceAsyncAction(GET_TASK_RECORDS)),
    taskHistory: resetMiddleware(RESET)(reduceAsyncAction(GET_TASK_HISTORY)),
});

export function updateFormField(fields) {
    return {
        type: UPDATE_FORM,
        payload: fields,
    };
}

export function updateOperateFormField(fields) {
    return {
        type: UPDATE_OPERATE_FORM,
        payload: fields,
    };
}

export function backupFormAndBeginEdit(fields) {
    return {
        type: EDIT_FORM,
        payload: {
            editing: true,
            fields,
        },
    };
}

export function stopFormEdit(restoreFields) {
    return {
        type: EDIT_FORM,
        payload: {
            editing: false,
            fields: restoreFields,
        },
    };
}

export function resetPage() {
    return {
        type: RESET,
    };
}

export function setTransferModalVisible(visible) {
    return reduceValue.actionCreator(visible ? SHOW_TRANSFER_MODAL : HIDE_TRANSFER_MODAL)(visible);
}

export const updateTransferModalFormFields = reduceMap.actionCreator(TRANSFER_MODAL_UPDATE_FORM);

export const getTask = apiActionCreator(GET_INFO, async (ctx, id) => {
    const task = await getTaskById(ctx, id);
    const isPotential = task.contactsType === 2;
    if (!isPotential) {
        const patient = testPermission({ $any: ['patient.view', 'patient.edit'] }) ? await getPatient(ctx, task.customerId) : [];
        return {
            isPotential: false,
            task,
            patient,
        };
    }
    const potentialPatient = testPermission({ $any: ['patient.view', 'patient.edit'] }) ? await getPotentialPatient(ctx, task.customerId) : [];
    return {
        isPotential: true,
        task,
        patient: potentialPatient,
    };
});

export const savePatient = apiActionCreator(
    SUBMIT_FORM,
    async (ctx, id, data) => putPatient(ctx, id, {
        phone: data.phone,
        machineNumber: data.machineNumber,
        diseases: data.diseases.map(d => d.id),
        hospitalId: data.hospital.id,
        doctorId: data.doctor.id,
        address: {
            provinceId: data.address.liveProvinces,
            cityId: data.address.liveCity,
            areaId: data.address.liveArea,
            street: data.address.liveStreet,
        },
        tags: data.tags.filter(tag => tag.editable).map(t => t.id),
    }),
);

export const savePotentialPatient = apiActionCreator(
    SAVE_POTENTIAL_PATIENT,
    async (ctx, id, data) => putPotentialPatient(ctx, id, {
        phone: data.phone,
        diseases: data.diseases.map(d => d.id),
        address: {
            provinceId: data.address.liveProvinces,
            cityId: data.address.liveCity,
            areaId: data.address.liveArea,
            street: data.address.liveStreet,
        },
        tags: data.tags.filter(tag => tag.editable).map(t => t.id),
    }),
);

export const newProcessTask = apiActionCreator(
    PROCESS_TASK,
    async (ctx, data) => newProcessTaskApi(ctx, data), {
        mapArgumentsToParams: data => data,
    },
);

export const handleTaskFromPool = apiActionCreator(
    HANDLE_NEXT_TASK,
    async (ctx, id) => handleTaskFromPoolApi(ctx, id), {
        mapArgumentsToParams: id => id,
    },
);

export const handleGetMessageTemplate = apiActionCreator(
    GET_MESSAGE_TEMPLATE,
    async (ctx, patientId, params) => getMessageTemplate(ctx, patientId, params),
);

export const submitTransfer = apiActionCreator(
    SUBMIT_TRANSFER,
    async (ctx, data) => newProcessTaskApi(ctx, data), {
        mapArgumentsToParams: data => data,
    },
);

export const getTaskRecords = apiActionCreator(GET_TASK_RECORDS, getTaskRecordsApi);
export const getTaskHistory = apiActionCreator(GET_TASK_HISTORY, getTaskHistoryApi);

export const connect = reduxConnect(
    state => state.taskCenter.newTask,
    dispatch => bindActionCreators({
        updateFormField,
        updateOperateFormField,
        getTask,
        backupFormAndBeginEdit,
        stopFormEdit,
        savePatient,
        savePotentialPatient,
        resetPage,
        newProcessTask,
        handleTaskFromPool,
        handleGetMessageTemplate,
        setTransferModalVisible,
        updateTransferModalFormFields,
        submitTransfer,
        getTaskRecords,
        getTaskHistory,
    }, dispatch),
);
