import { combineReducers, bindActionCreators } from 'redux';
import { connect as reduxConnect } from 'react-redux'
import { createReducer, apiActionCreator as tablePageApiActionCreator } from '../../components/common/table-page';
import { resetMiddleware } from '../../helpers/reducers';
import {
    apiActionCreator,
    getUserGroupe as getUsersApi,
    updateGroup as updateGroupApi,
    deleteGroup as deleteGroupApi,
} from '../../api'


const SEARCH_GROUP = 'userConfigure.groupList.searchGroup';
const UPDATE_GROUP = 'userConfigure.groupList.updateGroup';
const DELETE_GROUP = 'userConfigure.groupList.deleteGroup';
const RESET = 'userConfigure.groupList.reset';

export default resetMiddleware(RESET)(combineReducers({
    groups: createReducer(SEARCH_GROUP),
    updateStatus(state = {}, action) {
        if (action.type === UPDATE_GROUP) {
            state = {
                status: action.status,
                payload: action.payload,
                op: action.params
            };
        }
        return state;
    },
    deleteStatus(state = {}, action) {
        if (action.type === DELETE_GROUP) {
            state = {
                status: action.status,
                payload: action.payload,
            };
        }
        return state;
    }
}));


export const searchGroup = tablePageApiActionCreator(
    SEARCH_GROUP, getUsersApi
);
export const updateGroup = apiActionCreator(UPDATE_GROUP, async (ctx, id, op, data) => {
    await updateGroupApi(ctx, id, data);
}, {
    mapArgumentsToParams: (id, op, data) => op
})
export const deleteGroup = apiActionCreator(DELETE_GROUP, deleteGroupApi);
export const resetGroup = resetMiddleware.actionCreator(RESET);

export const connect = reduxConnect(
    state => ({
        groups: state.userConfigure.groupList.groups,
        updateStatus: state.userConfigure.groupList.updateStatus,
        deleteStatus: state.userConfigure.groupList.deleteStatus,
    }),
    dispatch => bindActionCreators({
        searchGroup,
        updateGroup,
        deleteGroup,
        resetGroup,
    }, dispatch)
);
