import { combineReducers, bindActionCreators } from 'redux';
import { apiActionCreator, createUserGroup, getUserGroupById, updateUserGroupById } from '../../api';
import { connect as reduxConnect } from 'react-redux';

const UPDATE_FORM = 'userConfigure.createGroup.updateFormField';
const CREATE_GROUP = 'userConfigure.createGroup.createGroup';
const GET_GROUP = 'userConfigure.createGroup.getGroup';
const UPDATE_GROUP = 'userConfigure.createGroup.updateGroup'
const RESET = 'userConfigure.createGroup.reset';

export default combineReducers({
    formData: (state = {}, action) => {
        if (action.type === UPDATE_FORM) {
            state = {
                ...state,
                ...action.payload
            };
        } else if (action.type === RESET) {
            state = {};
        }
        return state;
    },
    createGroupResult: (state = {}, action) => {
        if (action.type === CREATE_GROUP) {
            state = {
                status: action.status,
                payload: action.payload
            };
        } else if (action.type === RESET) {
            state = {};
        }
        return state;
    },
    updateGroupResult: (state = {}, action) => {
        if (action.type === UPDATE_GROUP) {
            state = {
                status: action.status,
                payload: action.payload
            };
        } else if (action.type === RESET) {
            state = {};
        }
        return state;
    },
    getGroupResult: (state = {}, action) => {
        if (action.type === GET_GROUP) {
            state = {
                status: action.status,
                payload: action.payload,
                params: action.params,
            };
        } else if (action.type === RESET) {
            state = {};
        }
        return state;
    },
});


export function updateFormField(fields) {
    return {
        type: UPDATE_FORM,
        payload: fields,
    };
}

export function resetForm() {
    return {
        type: RESET,
    };
}

export const createGroup = apiActionCreator(CREATE_GROUP, async (ctx, data) => {
    await createUserGroup(ctx, {
        name: data.name,
        remarks: data.remarks,
        users: data.users.map(u => u.id),
        ownerCompany: data.ownerCompany && data.ownerCompany.id,
        ownerCompanyName: data.ownerCompany && data.ownerCompany.name,
    });
});

export const updateGroup = apiActionCreator(UPDATE_GROUP, async (ctx, id, data) => {
    await updateUserGroupById(ctx, id, {
        name: data.name,
        remarks: data.remarks,
        users: data.users.map(u => u.id),
        ownerCompany: data.ownerCompany && data.ownerCompany.id,
        ownerCompanyName: data.ownerCompany && data.ownerCompany.name,
    });
});

export const getGroup = apiActionCreator(GET_GROUP, async (ctx, id) => {
    const r = await getUserGroupById(ctx, id);
    return {
        name: r.name,
        remarks: r.remarks,
        users: r.users,
        ownerCompany: r.ownerCompany && {
            id: r.ownerCompany,
            name: r.ownerCompanyName,
        }
    }
}, {
    mapArgumentsToParams: id => id
});

export const connect = reduxConnect(
    state => state.userConfigure.createGroup,
    dispatch => bindActionCreators({
        updateFormField,
        createGroup,
        updateGroup,
        getGroup,
        resetForm,
    }, dispatch)
);
