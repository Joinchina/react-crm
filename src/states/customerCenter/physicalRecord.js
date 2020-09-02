import { combineReducers, bindActionCreators } from 'redux';
import { connect as reduxConnect } from 'react-redux';
import {
    apiActionCreator, getPhysicalRecord, deletePhysicalRecord
} from '../../api';
import { createReducer, apiActionCreator as tablePageApiActionCreator } from '../../components/common/table-page';

const GET_PHYSICALRECORD = 'customerCenter.customerDetails.GET_PHYSICALRECORD';
const RESET_PHYSICALRECORD = 'customerCenter.customerDetails.PhysicalRecordList.RESET_PHYSICALRECORD';
const DELETE_PHYSICALRECORD = 'customerCenter.customerDetails.DELETE_PHYSICALRECORD';

export default combineReducers({
    physicalRecordList: createReducer(GET_PHYSICALRECORD),
    deletePhysicalRecordResult: (state = {}, action) => {
        if(action.type === DELETE_PHYSICALRECORD) {
            state = {
                status: action.status,
                paload: action.payload,
            }
        } else if (action.type === RESET_PHYSICALRECORD) {
            state = {}
        }
        return state;
    }
});

export const getPhysicalRecordAction = tablePageApiActionCreator(
    GET_PHYSICALRECORD, getPhysicalRecord
);

export const deletePhysicalRecordAction = apiActionCreator(DELETE_PHYSICALRECORD,
    async (ctx, customerId, orderId) => {
        return await deletePhysicalRecord(ctx, customerId, orderId);
    }
);

export function resetPhysicalRecordAction() {
    return {
        type: RESET_PHYSICALRECORD
    }
}

export const connect = reduxConnect(
    state => ({
        ...state.physicalRecord
    }),
    dispatch => bindActionCreators({
        getPhysicalRecordAction,
        deletePhysicalRecordAction,
        resetPhysicalRecordAction,
    }, dispatch)
);
