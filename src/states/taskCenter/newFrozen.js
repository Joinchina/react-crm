import { combineReducers, bindActionCreators } from 'redux';
import { apiActionCreator,
    getFrozenById,
    createFrozen as createFrozenApi,
    updateFrozenById as updateFrozenByIdApi
} from '../../api';
import { connect as reduxConnect } from 'react-redux';

const UPDATE_FORM = 'taskCenter.newFrozen.UPDATE_FORM';
const CREATE_FROZEN = 'taskCenter.newFrozen.CREATE_FROZEN';
const GET_FROZEN = 'taskCenter.newFrozen.GET_FROZEN';
const UPDATE_FROZEN = 'taskCenter.newFrozen.UPDATE_FROZEN';
const RESET = 'taskCenter.newFrozen.RESET';

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
    createFrozenResult: (state = {}, action) => {
        if (action.type === CREATE_FROZEN) {
            state = {
                status: action.status,
                payload: action.payload
            };
        } else if (action.type === RESET) {
            state = {};
        }
        return state;
    },
    updateFrozenResult: (state = {}, action) => {
        if (action.type === UPDATE_FROZEN) {
            state = {
                status: action.status,
                payload: action.payload
            };
        } else if (action.type === RESET) {
            state = {};
        }
        return state;
    },
    getFrozenResult: (state = {}, action) => {
        if (action.type === GET_FROZEN) {
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

export const createFrozen = apiActionCreator(CREATE_FROZEN, async (ctx, data) => {
    await createFrozenApi(ctx, {
        id: data.frozenHospital && data.frozenHospital.id,
        freeze: data.freeze.map(o => o.hospitalFreezeFlag),
    });
});

export const updateFrozen = apiActionCreator(UPDATE_FROZEN, async (ctx, id, data) => {
    await updateFrozenByIdApi(ctx, id, {
        freeze: data.freeze.map(o => o.hospitalFreezeFlag)
    });
});

export const getFrozen = apiActionCreator(GET_FROZEN, async (ctx, id) => {
    const r = await getFrozenById(ctx, id);
    return {
        frozenHospital: {
            name: r.name,
            id: r.id
        },
        freeze: r.freeze && r.freeze.map(o => ({ hospitalFreezeFlag: o }))
    }
}, {
    mapArgumentsToParams: id => id
});

export const connect = reduxConnect(
    state => ({
        ...state.taskCenter.newFrozen,
        frozenList: state.taskCenter.frozenList.frozenList,
    }),
    dispatch => bindActionCreators({
        updateFormField,
        createFrozen,
        updateFrozen,
        getFrozen,
        resetForm,
    }, dispatch)
);
