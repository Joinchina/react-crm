import { combineReducers } from 'redux';
import { apiActionCreator, newTaskPool } from '../../api';
import moment from 'moment';

const initialState = {
    formData: {},
    submit: {}
};

const UPDATE_FORM = 'taskCenter.newTaskPool.updateFormField';
const SUBMIT_FORM = 'taskCenter.newTaskPool.submit';
const RESET = 'taskCenter.newTaskPool.reset';
export default combineReducers({
    formData(state = {}, action) {
        if (action.type === UPDATE_FORM) {
            state = { ...state, ...action.payload };
        } else if (action.type === RESET) {
            state = {};
        }
        return state;
    },
    submit(state = {}, action) {
        if (action.type === SUBMIT_FORM) {
            state = { status: action.status, payload: action.payload };
        } else if (action.type === RESET) {
            state = {};
        }
        return state;
    }
});

export function updateFormField(fields) {
    return {
        type: UPDATE_FORM,
        payload: fields,
    };
}

export function resetForm(){
    return {
        type: RESET
    }
}

export const submitNewTaskPool = apiActionCreator(SUBMIT_FORM, async (ctx, data) => {
    const r = {};
    r.name = data.name;
    r.users = data.users && data.users.map(u => u.id);
    r.userGroup = data.userGroup && data.userGroup.map(g => g.id);
    r.filters = data.filters.map(f => {
        let value;
        if (f.lhs === "createDate" || f.lhs === "updateDate") {
            value = moment(f.rhs).format('YYYY-MM-DD');
        } else if (f.lhs === 'workType') {
            value = Number(f.rhs.id);
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
    r.remarks = data.remarks;
    return await newTaskPool(ctx, r);
});
