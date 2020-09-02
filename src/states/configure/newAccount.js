import { combineReducers, bindActionCreators } from 'redux';
import { apiActionCreator,
    getAccountConfigurationById,
    createAccount as createAccountApi,
    updateAccountById,
} from '../../api';
import { connect as reduxConnect } from 'react-redux';

const UPDATE_FORM = 'configure.newAccount.UPDATE_FORM';
const CREATE_ACCOUNT = 'configure.newAccount.CREATE_ACCOUNT';
const GET_ACCOUNT = 'configure.newAccount.GET_ACCOUNT';
const UPDATE_ACCOUNT = 'configure.newAccount.UPDATE_ACCOUNT';
const RESET = 'configure.newAccount.RESET';

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
    createAccountResult: (state = {}, action) => {
        if (action.type === CREATE_ACCOUNT) {
            state = {
                status: action.status,
                payload: action.payload
            };
        } else if (action.type === RESET) {
            state = {};
        }
        return state;
    },
    updateAccountResult: (state = {}, action) => {
        if (action.type === UPDATE_ACCOUNT) {
            state = {
                status: action.status,
                payload: action.payload
            };
        } else if (action.type === RESET) {
            state = {};
        }
        return state;
    },
    getAccountResult: (state = {}, action) => {
        if (action.type === GET_ACCOUNT) {
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

export const createAccount = apiActionCreator(CREATE_ACCOUNT, async (ctx, data) => {
    await createAccountApi(ctx, data);
});

export const updateAccount = apiActionCreator(UPDATE_ACCOUNT, async (ctx, id, data) => {
    await updateAccountById(ctx, id, data);
});

export const getAccount = apiActionCreator(GET_ACCOUNT, async (ctx, id) => {
    const r = await getAccountConfigurationById(ctx, id);
    return r
}, {
    mapArgumentsToParams: id => id
});

export const connect = reduxConnect(
    state => ({
        ...state.userConfigure.newAccount,
        account: state.userConfigure.account.account,
    }),
    dispatch => bindActionCreators({
        updateFormField,
        createAccount,
        updateAccount,
        getAccount,
        resetForm,
    }, dispatch)
);
