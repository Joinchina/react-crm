import { combineReducers, bindActionCreators } from 'redux';
import { apiActionCreator,
    getTaskPoolById as getTaskPoolByIdApi,
    updateTaskPool as updateTaskPoolApi } from '../../api';
import { connect as reduxConnect } from 'react-redux';
import moment from 'moment';

const UPDATE_FORM = 'taskCenter.taskPoolDetail.updateFormField';
const GET_INFO = 'taskCenter.taskPoolDetail.getTaskPoolInfo';
const EDIT_FORM = 'taskCenter.taskPoolDetail.editForm';
const SUBMIT_FORM = 'taskCenter.taskPoolDetail.saveTaskPool';
const RESET = 'taskCenter.taskPoolDetail.reset';

function convertTaskPoolRemoteToLocal(taskPool) {
    const { name, users, userGroup, filters, status,
        acceptRule, returnRule, effectiveRule, remarks, startDate, endDate } = taskPool;
    const r = {
        name, users, userGroup, acceptRule, returnRule, remarks,
        status: `${status}`,
        filters: filters.map(f => {
            let rhs = f.value;
            if (f.field === 'createDate' || f.field === 'updateDate'){
                rhs = moment(rhs);
                if (!rhs.isValid()){
                    rhs = null;
                }
            }else if (f.field === 'workType') {
                rhs = { id: rhs };
            } else if (f.field === 'organization') {
                rhs = Array.isArray(rhs) ? rhs : [rhs];
                rhs = rhs.map(o => ({ ownerCompany: o }));
            }
            return {
                lhs: f.field,
                op: f.type,
                rhs,
            }
        }),
        effectiveRule: {
            rule: `${effectiveRule}`,
            range: effectiveRule == 2 ? [moment(startDate), moment(endDate)] : null
        }
    };
    return r;
}

function converTaskPoolLocalToRemote(data) {
    const r = {};
    r.name = data.name;
    r.users = data.users && data.users.map(u => u.id);
    r.userGroup = data.userGroup && data.userGroup.map(g => g.id);
    r.filters = data.filters.map(f => {
        let value;
        if (f.lhs === "createDate" || f.lhs === "updateDate") {
            value = moment(f.rhs).format('YYYY-MM-DD');
        } else if (f.lhs === 'workType') {
            value = f.rhs.id;
        } else if (f.lhs === 'organization') {
            value = f.rhs.map(o => o.ownerCompany);
        } else {
            value = `${f.rhs}`;
        }
        return {
            field: f.lhs,
            type: f.op,
            value
        }
    });
    r.effectiveRule = Number(data.effectiveRule.rule);
    if (r.effectiveRule === 2) {
        r.startDate = moment(data.effectiveRule.range[0]).format('YYYY-MM-DD HH:mm');
        r.endDate = moment(data.effectiveRule.range[1]).format('YYYY-MM-DD HH:mm');
    }
    r.acceptRule = 1;
    r.returnRule = data.returnRule;
    r.remarks = data.remarks || '';
    r.status = data.status;
    return r;
}

export default combineReducers({
    formData(state = {}, action) {
        if (action.type === UPDATE_FORM) {
            state = { ...state, ...action.payload };
        } else if (action.type === EDIT_FORM && !action.payload.editing && action.payload.fields) {
            state = { ...action.payload.fields };
        } else if (action.type === RESET) {
            state = {};
        }
        return state;
    },
    taskPool(state = {}, action) {
        if (action.type === GET_INFO) {
            state = {
                status: action.status,
                payload: action.status === 'fulfilled' ?
                    convertTaskPoolRemoteToLocal(action.payload) : action.payload,
            };
        } else if (action.type === RESET) {
            state = {};
        }
        return state;
    },
    formEdit(state = {}, action) {
        if (action.type === EDIT_FORM) {
            if (action.payload.editing) {
                state = { ...action.payload };
            } else {
                state = { editing: false};
            }
        } else if (action.type === RESET) {
            state = {};
        }
        return state;
    },
    saveTaskPoolResult(state = {}, action) {
        if (action.type === SUBMIT_FORM) {
            state = {
                status: action.status,
                payload: action.payload,
            };
        } else if (action.type === RESET) {
            state = {};
        }
        return state;
    }
});

export function updateFormField(fields, force) {
    return {
        type: UPDATE_FORM,
        payload: fields,
    };
}

export function backupFormAndBeginEdit(fields) {
    return {
        type: EDIT_FORM,
        payload: {
            editing: true,
            fields: fields
        }
    }
}

export function stopFormEdit(restoreFields) {
    return {
        type: EDIT_FORM,
        payload: {
            editing: false,
            fields: restoreFields,
        }
    }
}

export function resetPage() {
    return {
        type: RESET,
    };
}

export const getTaskPoolById = apiActionCreator(GET_INFO, getTaskPoolByIdApi);

export const saveTaskPool = apiActionCreator(SUBMIT_FORM, async (ctx, id, data) => {
    return await updateTaskPoolApi(ctx, id, converTaskPoolLocalToRemote(data));
});

export const connect = reduxConnect(
    state => ({
        ...state.taskCenter.taskPoolDetail,
        auth: state.auth.payload,
    }),
    dispatch => bindActionCreators({
        updateFormField,
        getTaskPoolById,
        backupFormAndBeginEdit,
        stopFormEdit,
        saveTaskPool,
        resetPage
    }, dispatch)
);
